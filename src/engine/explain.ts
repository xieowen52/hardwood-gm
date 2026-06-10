/**
 * Generated explanations: turn team profiles + sim outputs into short,
 * concrete "why" sentences. Pure string-building — no randomness.
 */
import { leagueAverageTeam } from './leagueAverage';
import type { SeasonResult } from './season';
import type { MatchupStats, SeriesResult } from './series';
import type { TeamProfile } from './team';

function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

/** Expected points per game from a profile's shooting (rough offense rating). */
function offenseScore(team: TeamProfile): number {
  return team.players.reduce((s, p) => {
    const perShot = (1 - p.norm.tpaShare) * p.p2 * 2 + p.norm.tpaShare * p.p3 * 3;
    return s + perShot * p.shotWeight;
  }, 0) / team.players.reduce((s, p) => s + p.shotWeight, 0);
}

/** Strengths/weaknesses of a solo team vs the league-average opponent. */
export function explainSeason(team: TeamProfile, result: SeasonResult): string[] {
  const avg = leagueAverageTeam();
  const lines: string[] = [];

  const off = offenseScore(team);
  const offAvg = offenseScore(avg);
  if (off > offAvg * 1.04) {
    lines.push(`Elite shot-making: ${pct(off / offAvg - 1)} more points per attempt than an average attack.`);
  } else if (off < offAvg * 0.97) {
    lines.push(`Scoring efficiency lags an average attack by ${pct(1 - off / offAvg)}.`);
  }

  const reb = team.orbStrength + team.drbStrength;
  const rebAvg = avg.orbStrength + avg.drbStrength;
  if (reb > rebAvg * 1.08) {
    lines.push(`Dominant glass work (+${pct(reb / rebAvg - 1)} rebounding strength) added ~${result.secondChancePerGame} second-chance points a game.`);
  } else if (reb < rebAvg * 0.92) {
    lines.push(`Thin rebounding (${pct(1 - reb / rebAvg)} below average) gave opponents extra possessions.`);
  }

  if (team.teamDefScore > avg.teamDefScore * 1.15) {
    lines.push('Ball pressure and rim protection well above league average.');
  } else if (team.teamDefScore < avg.teamDefScore * 0.85) {
    lines.push('Below-average defensive playmaking let opponents shoot comfortably.');
  }

  const ast = team.players.reduce((s, p) => s + p.norm.ast, 0);
  if (ast > 22) lines.push('Unselfish: multiple high-level creators kept the offense moving.');

  for (const f of team.factors) lines.push(f.detail);

  if (lines.length === 0) {
    lines.push('A balanced roster with no glaring strengths or weaknesses — the record reflects steady, average play.');
  }
  return lines;
}

/** Head-to-head: why the winner won, with concrete numbers from the MC runs. */
export function explainSeries(
  a: TeamProfile,
  b: TeamProfile,
  result: SeriesResult,
): string[] {
  const mc: MatchupStats = result.monteCarlo;
  const lines: string[] = [];
  const winner = result.winner === 0 ? a : b;
  const loser = result.winner === 0 ? b : a;
  const wPct = result.winner === 0 ? mc.aWinPct : 1 - mc.aWinPct;

  lines.push(
    `${winner.name} wins a single game ${pct(wPct)} of the time over ${mc.runs.toLocaleString()} simulations (avg score ${mc.avgPtsA}–${mc.avgPtsB}).`,
  );

  const scDiff = mc.avgSecondChanceA - mc.avgSecondChanceB;
  if (Math.abs(scDiff) >= 1.5) {
    const ahead = scDiff > 0 ? a : b;
    lines.push(
      `${ahead.name}'s rebounding edge generated +${Math.abs(scDiff).toFixed(1)} second-chance points per game.`,
    );
  }

  const offA = offenseScore(a);
  const offB = offenseScore(b);
  if (Math.abs(offA - offB) > 0.025) {
    const ahead = offA > offB ? a : b;
    lines.push(`${ahead.name} got more points per shot attempt (${(Math.max(offA, offB)).toFixed(2)} vs ${(Math.min(offA, offB)).toFixed(2)} expected).`);
  }

  const defDiff = a.teamDefScore - b.teamDefScore;
  if (Math.abs(defDiff) > 0.25) {
    const ahead = defDiff > 0 ? a : b;
    lines.push(`${ahead.name} brought clearly better defensive playmaking (steals + rim protection).`);
  }

  for (const team of [winner, loser]) {
    for (const f of team.factors) {
      if (f.impact < -0.5) lines.push(`${team.name}: ${f.detail}`);
    }
  }

  return lines;
}
