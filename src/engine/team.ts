/**
 * Team building: turn five (position → PlayerEntry) assignments into a
 * TeamProfile the possession engine can run, applying the three fit/synergy
 * adjustments. Every adjustment is recorded as a FitFactor so the UI can
 * surface exactly why a team is better or worse than the sum of its parts.
 *
 * Fit adjustments (all constants in config.FIT):
 * 1. OUT OF POSITION — each step of distance from a natural position costs
 *    outOfPositionPerStep (5%) of shooting efficiency, rebounding and defense.
 * 2. USAGE OVERLAP — five 30%-usage stars can't all have their usual ball
 *    dominance. Total usage above usageOverlapThreshold costs team-wide
 *    efficiency per point (capped); far-below-threshold usage ("nobody wants
 *    the ball") costs a smaller amount.
 * 3. SPACING — expected made threes per game above/below spacingNeutralThrees
 *    shifts everyone's 2P% by up to ±spacingMaxEffect.
 */
import type { LeagueSeasonContext, Position } from '../data/types';
import { POSITIONS } from '../data/types';
import { FIT, POSSESSION } from './config';
import { positionDistance, type Roster, rosterPlayers } from './draft';
import { normalizePlayer, type NormalizedPlayer } from './normalize';

export interface FitFactor {
  kind: 'out-of-position' | 'usage-overlap' | 'usage-starved' | 'spacing' | 'playmaking';
  label: string;
  detail: string;
  /** Negative = hurts the team. Rough points-per-100-possessions scale. */
  impact: number;
}

/** One of the five slots in a runnable team. */
export interface SimPlayer {
  norm: NormalizedPlayer;
  slot: Position;
  /** Out-of-position steps (0 = natural). */
  oopDistance: number;
  /** Effective shooting after fit adjustments. */
  p2: number;
  p3: number;
  ft: number;
  /** Shot-selection weight (usage-driven). */
  shotWeight: number;
  /** Rebound strength after fit adjustments (per-36 boards). */
  reb: number;
  /** Defense score after fit adjustments. */
  def: number;
}

export interface TeamProfile {
  name: string;
  players: SimPlayer[]; // index-aligned with POSITIONS
  /** Per-possession turnover probability before opponent pressure. */
  tovPerPoss: number;
  /** Team offensive / defensive rebound strengths (arbitrary units). */
  orbStrength: number;
  drbStrength: number;
  /** Steals per possession the defense generates (pressure). */
  stealPressure: number;
  /** Mean of player def scores — overall team defense. */
  teamDefScore: number;
  /** Expected made threes per game (drives spacing). */
  expectedThrees: number;
  factors: FitFactor[];
}

function playerAt(team: TeamProfile, slot: Position): SimPlayer {
  const idx = POSITIONS.indexOf(slot);
  const p = team.players[idx];
  if (!p) throw new Error(`team "${team.name}" missing player at ${slot}`);
  return p;
}
export { playerAt };

export function buildTeam(
  name: string,
  roster: Roster,
  leagueContext: readonly LeagueSeasonContext[],
): TeamProfile {
  if (rosterPlayers(roster).length !== POSITIONS.length) {
    throw new Error(`buildTeam("${name}"): roster has open slots`);
  }
  const factors: FitFactor[] = [];

  // Normalize + out-of-position penalties.
  const slots: { slot: Position; norm: NormalizedPlayer; oop: number }[] = [];
  for (const slot of POSITIONS) {
    const entry = roster[slot];
    if (!entry) throw new Error(`buildTeam("${name}"): no player at ${slot}`);
    const norm = normalizePlayer(entry, leagueContext);
    const oop = positionDistance(entry, slot);
    if (oop > 0) {
      const pct = Math.round(FIT.outOfPositionPerStep * oop * 100);
      factors.push({
        kind: 'out-of-position',
        label: `${entry.name} at ${slot}`,
        detail: `${entry.name} (${entry.positions.join('/')}) plays ${slot}: -${pct}% shooting, rebounding and defense`,
        impact: -(FIT.outOfPositionPerStep * oop) * 25,
      });
    }
    slots.push({ slot, norm, oop });
  }

  // Usage overlap / starvation.
  const totalUsage = slots.reduce((s, x) => s + x.norm.usage, 0);
  let usagePenalty = 0;
  if (totalUsage > FIT.usageOverlapThreshold) {
    usagePenalty = Math.min(
      FIT.usageOverlapMax,
      (totalUsage - FIT.usageOverlapThreshold) * FIT.usageOverlapPerPoint,
    );
    factors.push({
      kind: 'usage-overlap',
      label: 'Ball-dominance crowding',
      detail: `Combined usage ${totalUsage.toFixed(0)}% (comfortable is ≤${FIT.usageOverlapThreshold}%): too many mouths to feed, -${(usagePenalty * 100).toFixed(1)}% scoring efficiency`,
      impact: -usagePenalty * 100,
    });
  } else if (totalUsage < FIT.usageStarvedThreshold) {
    usagePenalty = Math.min(
      FIT.usageStarvedMax,
      (FIT.usageStarvedThreshold - totalUsage) * FIT.usageStarvedPerPoint,
    );
    factors.push({
      kind: 'usage-starved',
      label: 'No go-to shot creator',
      detail: `Combined usage only ${totalUsage.toFixed(0)}% (healthy is ≥${FIT.usageStarvedThreshold}%): someone has to force shots, -${(usagePenalty * 100).toFixed(1)}% scoring efficiency`,
      impact: -usagePenalty * 100,
    });
  }

  // Spacing: expected made threes per game if shots split by usage.
  // Each player's per-36 3PM scaled to a 48-minute share (240/5 minutes each).
  const minutesScale = 48 / 36;
  const expectedThrees = slots.reduce((s, x) => s + x.norm.tpa * x.norm.p3 * minutesScale, 0);
  const spacingDelta = Math.max(
    -FIT.spacingMaxEffect,
    Math.min(
      FIT.spacingMaxEffect,
      ((expectedThrees - FIT.spacingNeutralThrees) / FIT.spacingNeutralThrees) *
        FIT.spacingMaxEffect,
    ),
  );
  if (Math.abs(spacingDelta) > 0.004) {
    const good = spacingDelta > 0;
    factors.push({
      kind: 'spacing',
      label: good ? 'Floor spacing' : 'Cramped spacing',
      detail: `~${expectedThrees.toFixed(1)} made threes/game (neutral is ${FIT.spacingNeutralThrees}): ${good ? '+' : ''}${(spacingDelta * 100).toFixed(1)}% inside scoring`,
      impact: spacingDelta * 220,
    });
  }

  // Playmaking: teams with elite creators get slightly easier shots.
  const teamAst = slots.reduce((s, x) => s + x.norm.ast, 0);
  const playmakingDelta = Math.max(
    -FIT.playmakingMaxEffect,
    Math.min(
      FIT.playmakingMaxEffect,
      ((teamAst - FIT.playmakingNeutralAst) / FIT.playmakingNeutralAst) * FIT.playmakingMaxEffect,
    ),
  );
  if (Math.abs(playmakingDelta) > 0.008) {
    const good = playmakingDelta > 0;
    factors.push({
      kind: 'playmaking',
      label: good ? 'Elite shot creation' : 'Stagnant creation',
      detail: `${teamAst.toFixed(0)} assists per 36-minute five (neutral ${FIT.playmakingNeutralAst}): ${good ? '+' : ''}${(playmakingDelta * 100).toFixed(1)}% shot quality`,
      impact: playmakingDelta * 220,
    });
  }

  // Assemble sim players. The SKILL CURVE compares each player's share of
  // team shots (usage weights) to the share their usage says they normally
  // carry — extra load costs efficiency, a lighter load buys a little.
  const effMult = (1 - usagePenalty) * (1 + playmakingDelta);
  const shotWeights = slots.map((x) => Math.max(x.norm.usage, 6));
  const totalWeight = shotWeights.reduce((s, w) => s + w, 0);
  const players: SimPlayer[] = slots.map(({ slot, norm, oop }, i) => {
    const oopMult = 1 - FIT.outOfPositionPerStep * oop;
    const share = (shotWeights[i] ?? norm.usage) / totalWeight;
    const excess = share - norm.usage / 100;
    let skillMult =
      excess > 0
        ? 1 - Math.min(FIT.shotSharePenaltyMax, excess * FIT.shotSharePenaltySlope)
        : 1 + Math.min(FIT.shotShareBonusMax, -excess * FIT.shotShareBonusSlope);
    // Shot quality: volume scorers create better looks (see config).
    const quality =
      ((norm.pts - FIT.shotQualityBaselinePts) / FIT.shotQualityBaselinePts) *
      FIT.shotQualitySlope;
    skillMult *= 1 + Math.max(-FIT.shotQualityMax, Math.min(FIT.shotQualityMax, quality));
    return {
      norm,
      slot,
      oopDistance: oop,
      p2: Math.max(0.2, (norm.p2 + spacingDelta) * effMult * oopMult * skillMult),
      p3: Math.max(0, norm.p3 * effMult * oopMult * skillMult),
      ft: norm.ft,
      shotWeight: shotWeights[i] ?? norm.usage,
      reb: norm.trb * oopMult,
      def: norm.defScore * oopMult,
    };
  });

  const teamTovPer36 = slots.reduce((s, x) => s + x.norm.tov, 0);
  // Per-36 turnover rates assume each player's usual ball-handling load; on
  // a five-starter team the load is shared, so the raw team rate is pulled
  // toward the league-typical center, keeping only part of the spread.
  const rawTovPerPoss = (teamTovPer36 * minutesScale) / POSSESSION.basePossessions;
  const tovPerPoss = FIT.tovCenter + (rawTovPerPoss - FIT.tovCenter) * FIT.tovSpreadKept;
  const totalReb = players.reduce((s, p) => s + p.reb, 0) * minutesScale;
  const stealsPerGame = slots.reduce((s, x) => s + x.norm.stl, 0) * minutesScale;

  return {
    name,
    players,
    tovPerPoss,
    orbStrength: totalReb * POSSESSION.orbShare,
    drbStrength: totalReb * (1 - POSSESSION.orbShare),
    stealPressure: stealsPerGame / POSSESSION.basePossessions,
    teamDefScore: players.reduce((s, p) => s + p.def, 0) / players.length,
    expectedThrees,
    factors,
  };
}
