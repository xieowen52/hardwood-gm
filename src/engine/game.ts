/**
 * Possession-based single-game simulation.
 *
 * Teams alternate possessions (same count each). One possession:
 *   1. turnover check  — team turnover rate + opponent steal pressure
 *   2. pick a shooter  — weighted by usage
 *   3. foul check      — FT trip frequency from the shooter's FTA/FGA rate
 *   4. shot            — 3PT with prob = shooter's 3PA share, else 2PT;
 *                        make prob = era-adjusted % minus matchup defense
 *   5. miss            — offensive rebound chance, one putback attempt
 *
 * Assists/steals/blocks/rebounds are credited probabilistically so box
 * scores look sane, without simulating actual ball movement.
 */
import { POSITIONS } from '../data/types';
import { POSSESSION } from './config';
import { pickWeighted, type Rng } from './rng';
import type { SimPlayer, TeamProfile } from './team';

export interface BoxLine {
  name: string;
  slot: string;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fgm: number;
  fga: number;
  tpm: number;
  tpa: number;
  ftm: number;
  fta: number;
}

export interface TeamBox {
  team: string;
  players: BoxLine[];
  pts: number;
  /** Points scored after offensive rebounds. */
  secondChancePts: number;
}

export interface GameResult {
  a: TeamBox;
  b: TeamBox;
  /** 0 = team a won, 1 = team b won. */
  winner: 0 | 1;
  possessionsPerTeam: number;
  overtimes: number;
}

function emptyBox(team: TeamProfile): TeamBox {
  return {
    team: team.name,
    pts: 0,
    secondChancePts: 0,
    players: team.players.map((p) => ({
      name: p.norm.entry.name,
      slot: p.slot,
      pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0,
      fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0,
    })),
  };
}

interface SideState {
  team: TeamProfile;
  box: TeamBox;
  /** Per-game form multiplier on make probabilities. */
  form: number;
}

function line(side: SideState, idx: number): BoxLine {
  const l = side.box.players[idx];
  if (!l) throw new Error('box line index out of range');
  return l;
}

function defenderFor(def: SideState, shooterIdx: number): SimPlayer {
  const p = def.team.players[shooterIdx];
  if (!p) throw new Error('defender index out of range');
  return p;
}

function defenseAdjustment(def: SideState, shooterIdx: number): number {
  const matchup = defenderFor(def, shooterIdx);
  const raw =
    (matchup.def - POSSESSION.defScoreBaseline) * POSSESSION.defenderImpact +
    (def.team.teamDefScore - POSSESSION.defScoreBaseline) * POSSESSION.defenderImpact * 0.5;
  return Math.max(-POSSESSION.defenderImpactMax, Math.min(POSSESSION.defenderImpactMax, raw));
}

function creditAssist(off: SideState, shooterIdx: number, rng: Rng): void {
  if (rng() >= POSSESSION.assistShare) return;
  const weights = off.team.players.map((p, i) => (i === shooterIdx ? 0 : p.norm.ast));
  line(off, pickWeighted(rng, weights)).ast++;
}

function creditRebound(side: SideState, rng: Rng): void {
  const weights = side.team.players.map((p) => p.reb);
  line(side, pickWeighted(rng, weights)).reb++;
}

/** Returns true if the offense keeps the ball (offensive rebound). */
function reboundBattle(off: SideState, def: SideState, rng: Rng, ftMiss: boolean): boolean {
  let orbP = off.team.orbStrength / (off.team.orbStrength + def.team.drbStrength);
  if (ftMiss) orbP *= 0.55; // FT misses are harder to tip out
  if (rng() < orbP) {
    creditRebound(off, rng);
    return true;
  }
  creditRebound(def, rng);
  return false;
}

function freeThrows(off: SideState, shooterIdx: number, shots: number, rng: Rng): number {
  const shooter = defenderFor(off, shooterIdx); // same accessor, own team
  const bl = line(off, shooterIdx);
  let made = 0;
  for (let i = 0; i < shots; i++) {
    bl.fta++;
    if (rng() < shooter.ft) {
      bl.ftm++;
      made++;
    }
  }
  bl.pts += made;
  off.box.pts += made;
  return made;
}

/**
 * One field goal attempt (possibly a putback). Returns 'score' | 'dead' |
 * 'live-miss' — live misses go to the rebound battle.
 */
function attemptShot(
  off: SideState,
  def: SideState,
  shooterIdx: number,
  rng: Rng,
  opts: { putback: boolean; secondChance: boolean },
): 'score' | 'live-miss' {
  const shooter = defenderFor(off, shooterIdx);
  const bl = line(off, shooterIdx);
  const isThree = !opts.putback && rng() < shooter.norm.tpaShare;
  const defAdj = defenseAdjustment(def, shooterIdx);
  let makeP = isThree ? shooter.p3 : shooter.p2 + (opts.putback ? POSSESSION.putbackBonus : 0);
  makeP = makeP * (1 - defAdj) * off.form;

  bl.fga++;
  if (isThree) bl.tpa++;
  if (rng() < makeP) {
    const pts = isThree ? 3 : 2;
    bl.fgm++;
    if (isThree) bl.tpm++;
    bl.pts += pts;
    off.box.pts += pts;
    if (opts.secondChance) off.box.secondChancePts += pts;
    creditAssist(off, shooterIdx, rng);
    return 'score';
  }
  // Block credit: scaled by the rim protection of the defense.
  const blockP = POSSESSION.blockCreditFactor * (def.team.teamDefScore / POSSESSION.defScoreBaseline);
  if (!isThree && rng() < blockP) {
    const weights = def.team.players.map((p) => p.norm.blk + 0.05);
    line(def, pickWeighted(rng, weights)).blk++;
  }
  return 'live-miss';
}

function simulatePossession(off: SideState, def: SideState, rng: Rng): void {
  // 1. Turnover.
  const tovP = Math.max(
    POSSESSION.tovMin,
    Math.min(
      POSSESSION.tovMax,
      off.team.tovPerPoss + def.team.stealPressure * POSSESSION.stealPressureWeight,
    ),
  );
  if (rng() < tovP) {
    const offWeights = off.team.players.map((p) => p.norm.tov);
    line(off, pickWeighted(rng, offWeights)).tov++;
    if (rng() < POSSESSION.stealCreditShare) {
      const defWeights = def.team.players.map((p) => p.norm.stl + 0.05);
      line(def, pickWeighted(rng, defWeights)).stl++;
    }
    return;
  }

  // 2. Shooter.
  let shooterIdx = pickWeighted(rng, off.team.players.map((p) => p.shotWeight));
  const shooter = defenderFor(off, shooterIdx);

  // 3. Shooting foul → free throw trip.
  if (rng() < shooter.norm.ftRate * POSSESSION.foulTripFactor) {
    freeThrows(off, shooterIdx, 2, rng);
    return; // simplification: missed final FTs are treated as dead balls
  }

  // 4. The shot, with up to one offensive-rebound putback sequence.
  let secondChance = false;
  for (let chance = 0; chance < 3; chance++) {
    const result = attemptShot(off, def, shooterIdx, rng, {
      putback: secondChance,
      secondChance,
    });
    if (result === 'score') return;
    if (!reboundBattle(off, def, rng, false)) return;
    secondChance = true;
    // The putback comes from whoever grabbed the board — re-pick the shooter
    // by rebounding strength instead of usage.
    shooterIdx = pickWeighted(rng, off.team.players.map((p) => p.reb));
  }
}

export interface GameOptions {
  /** Apply per-game form noise (used by season sims for variance). */
  formNoise?: boolean;
  /** Which side has home court (make-prob bonus), if any. */
  home?: 0 | 1 | null;
}

export function simulateGame(
  a: TeamProfile,
  b: TeamProfile,
  rng: Rng,
  options: GameOptions = {},
): GameResult {
  const noise = options.formNoise ?? true;
  const home = options.home ?? null;
  const form = () => (noise ? 1 + (rng() * 2 - 1) * POSSESSION.gameFormNoise : 1);
  const hca = (side: 0 | 1) => (home === side ? 1 + POSSESSION.homeCourtBoost : 1);
  const sideA: SideState = { team: a, box: emptyBox(a), form: form() * hca(0) };
  const sideB: SideState = { team: b, box: emptyBox(b), form: form() * hca(1) };

  const spread = POSSESSION.possessionSpread;
  let possessions = POSSESSION.basePossessions + Math.floor(rng() * (2 * spread + 1)) - spread;
  let overtimes = 0;

  let played = 0;
  while (true) {
    for (; played < possessions; played++) {
      simulatePossession(sideA, sideB, rng);
      simulatePossession(sideB, sideA, rng);
    }
    if (sideA.box.pts !== sideB.box.pts) break;
    overtimes++;
    possessions += POSSESSION.overtimePossessions;
  }

  return {
    a: sideA.box,
    b: sideB.box,
    winner: sideA.box.pts > sideB.box.pts ? 0 : 1,
    possessionsPerTeam: possessions,
    overtimes,
  };
}

/** Convenience: average per-game box lines over many sims (for projections). */
export function averageBox(boxes: TeamBox[]): BoxLine[] {
  const n = boxes.length;
  const first = boxes[0];
  if (!first || n === 0) return [];
  return first.players.map((_, idx) => {
    const acc: BoxLine = {
      name: first.players[idx]?.name ?? '',
      slot: first.players[idx]?.slot ?? POSITIONS[idx] ?? '',
      pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0,
      fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0,
    };
    for (const box of boxes) {
      const l = box.players[idx];
      if (!l) continue;
      acc.pts += l.pts; acc.reb += l.reb; acc.ast += l.ast; acc.stl += l.stl;
      acc.blk += l.blk; acc.tov += l.tov; acc.fgm += l.fgm; acc.fga += l.fga;
      acc.tpm += l.tpm; acc.tpa += l.tpa; acc.ftm += l.ftm; acc.fta += l.fta;
    }
    for (const key of ['pts', 'reb', 'ast', 'stl', 'blk', 'tov', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta'] as const) {
      acc[key] = Math.round((acc[key] / n) * 10) / 10;
    }
    return acc;
  });
}
