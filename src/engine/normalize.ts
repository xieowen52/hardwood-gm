/**
 * Era normalization: convert a PlayerEntry's raw per-game stats into
 * era-adjusted per-36-minute rates in a common baseline era (see BASELINE).
 *
 * THE FORMULA, step by step, for each counting stat X (pts, trb, ast, ...):
 *
 *   1. Per-minute basis:        X36   = X_perGame * 36 / minutesPerGame
 *      (drafted players play starter minutes on your team, so a 20-minute
 *      bench role in the source data shouldn't halve their contribution)
 *
 *   2. Pace adjustment:         Xnorm = X36 * (BASELINE.pace / eraPace)
 *      where eraPace is the mean league pace over the entry's seasons.
 *      A 1962 player's raw numbers are inflated by ~125 possessions/game;
 *      this rescales everyone to the same number of opportunities.
 *
 * Shooting efficiency is adjusted RELATIVE to the league of the player's era:
 *
 *   3. p2norm = rawP2 * (BASELINE.fgPct / eraFgPct)     (clamped to sane range)
 *      p3norm = rawP3 * (BASELINE.tpPct / eraTpPct)     (only when the era had
 *                                                        a 3-point line)
 *      ftnorm = rawFt * (BASELINE.ftPct / eraFtPct)
 *      Shooting 49% in a league that shot 42.6% is treated like shooting
 *      ~53.6% in a league that shoots 46.6%.
 *
 * Scoring volume is NOT separately rescaled by era PPG — pace adjustment
 * (volume) plus relative efficiency (quality) already capture the era diff;
 * scaling by PPG too would double-count it.
 *
 * Pre-1980 players take zero threes (there was no line). That is kept as-is:
 * their teams suffer the spacing penalty, which is the honest trade-off of
 * drafting from those decades.
 */
import type { LeagueSeasonContext, PlayerEntry } from '../data/types';
import { BASELINE, NORM_CLAMPS, PER_MINUTES } from './config';

/** A player's era-adjusted, per-36 profile — everything the sim needs. */
export interface NormalizedPlayer {
  entry: PlayerEntry;
  /** Era-adjusted per-36 counting stats. */
  pts: number;
  trb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fga: number;
  tpa: number;
  fta: number;
  /** Era-adjusted 2-point make probability. */
  p2: number;
  /** Era-adjusted 3-point make probability (0 if the player took no threes). */
  p3: number;
  /** Era-adjusted FT make probability. */
  ft: number;
  /** Share of field goal attempts that are threes, in [0,1]. */
  tpaShare: number;
  /** FTA per FGA — drives shooting-foul frequency. */
  ftRate: number;
  /** Usage rate, 0-100 (unchanged by normalization). */
  usage: number;
  /**
   * Individual defense score; league average ~1.0.
   * 0.6*steals + 0.7*blocks per-36 era-adjusted, so rim protectors and
   * ball hawks both rate above average.
   */
  defScore: number;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Mean league context over a span of seasons (inclusive). */
export function eraContext(
  leagueContext: readonly LeagueSeasonContext[],
  from: number,
  to: number,
): LeagueSeasonContext {
  const rows = leagueContext.filter((c) => c.season >= from && c.season <= to);
  // Fall back to the nearest season if the span is entirely uncovered —
  // validation normally prevents this, but the engine must never divide by 0.
  const source =
    rows.length > 0
      ? rows
      : [...leagueContext].sort(
          (a, b) => Math.abs(a.season - from) - Math.abs(b.season - from),
        ).slice(0, 1);
  const n = Math.max(source.length, 1);
  const mean = (f: (c: LeagueSeasonContext) => number) =>
    source.reduce((s, c) => s + f(c), 0) / n;
  return {
    season: Math.round(mean((c) => c.season)),
    pace: mean((c) => c.pace),
    ppg: mean((c) => c.ppg),
    fgPct: mean((c) => c.fgPct),
    tpPct: mean((c) => c.tpPct),
    ftPct: mean((c) => c.ftPct),
    tpaPerGame: mean((c) => c.tpaPerGame),
    ftaPerGame: mean((c) => c.ftaPerGame),
  };
}

export function normalizePlayer(
  entry: PlayerEntry,
  leagueContext: readonly LeagueSeasonContext[],
): NormalizedPlayer {
  const era = eraContext(leagueContext, entry.from, entry.to);
  const s = entry.stats;

  const mp = Math.max(s.mp, 8); // guard absurd inputs
  const perMin = PER_MINUTES / mp;
  const paceF = era.pace > 0 ? BASELINE.pace / era.pace : 1;
  const adj = (perGame: number) => perGame * perMin * paceF;

  // Raw 2P% from the overall FG line: (FGM - 3PM) / (FGA - 3PA).
  const fgm = s.fga * s.fgPct;
  const tpm = s.tpa * s.tpPct;
  const twoA = s.fga - s.tpa;
  const rawP2 = twoA > 0.1 ? (fgm - tpm) / twoA : s.fgPct;

  const p2 = clamp(
    rawP2 * (era.fgPct > 0 ? BASELINE.fgPct / era.fgPct : 1),
    NORM_CLAMPS.p2.min,
    NORM_CLAMPS.p2.max,
  );
  const p3 =
    s.tpa > 0 && era.tpPct > 0.05
      ? clamp(s.tpPct * (BASELINE.tpPct / era.tpPct), NORM_CLAMPS.p3.min, NORM_CLAMPS.p3.max)
      : s.tpa > 0
        ? clamp(s.tpPct, NORM_CLAMPS.p3.min, NORM_CLAMPS.p3.max)
        : 0;
  const ft = clamp(
    s.ftPct * (era.ftPct > 0 ? BASELINE.ftPct / era.ftPct : 1),
    NORM_CLAMPS.ft.min,
    NORM_CLAMPS.ft.max,
  );

  const fga = adj(s.fga);
  const tpa = adj(s.tpa);
  const fta = adj(s.fta);
  const stl = adj(s.stl);
  const blk = adj(s.blk);

  // Recompute points from normalized components so volume and efficiency stay
  // consistent (raw pts would disagree with normalized shooting).
  const pts = (fga - tpa) * p2 * 2 + tpa * p3 * 3 + fta * ft;

  return {
    entry,
    pts,
    trb: adj(s.trb),
    ast: adj(s.ast),
    stl,
    blk,
    tov: adj(Math.max(s.tov, 0.5)), // pre-1978 entries may carry 0; nobody is turnover-free
    fga,
    tpa,
    fta,
    p2,
    p3,
    ft,
    tpaShare: fga > 0 ? tpa / fga : 0,
    ftRate: fga > 0 ? fta / fga : 0.25,
    usage: entry.usagePct,
    defScore: stl * 0.6 + blk * 0.7,
  };
}
