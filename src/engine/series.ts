/**
 * Head-to-head best-of-7 series, plus a Monte Carlo estimate of the matchup
 * (win probability, average margin, second-chance points) used by the
 * explanation generator. Seeded and reproducible.
 */
import { MONTE_CARLO_RUNS, SERIES_WINS_NEEDED } from './config';
import { type GameResult, simulateGame } from './game';
import { mulberry32 } from './rng';
import type { TeamProfile } from './team';

export interface SeriesGameSummary {
  aPts: number;
  bPts: number;
  winner: 0 | 1;
  overtimes: number;
}

export interface MatchupStats {
  runs: number;
  /** Probability team A wins a single game. */
  aWinPct: number;
  avgPtsA: number;
  avgPtsB: number;
  avgSecondChanceA: number;
  avgSecondChanceB: number;
}

export interface SeriesResult {
  seed: number;
  games: SeriesGameSummary[];
  wins: [number, number];
  /** 0 = team A took the series. */
  winner: 0 | 1;
  /** Full box score of the deciding game. */
  decidingGame: GameResult;
  monteCarlo: MatchupStats;
}

/** Estimate single-game matchup probabilities over many independent games. */
export function monteCarloMatchup(
  a: TeamProfile,
  b: TeamProfile,
  seed: number,
  runs: number = MONTE_CARLO_RUNS,
): MatchupStats {
  const rng = mulberry32(seed);
  let aWins = 0;
  let ptsA = 0;
  let ptsB = 0;
  let scA = 0;
  let scB = 0;
  for (let i = 0; i < runs; i++) {
    const g = simulateGame(a, b, rng, { formNoise: true });
    if (g.winner === 0) aWins++;
    ptsA += g.a.pts;
    ptsB += g.b.pts;
    scA += g.a.secondChancePts;
    scB += g.b.secondChancePts;
  }
  return {
    runs,
    aWinPct: aWins / runs,
    avgPtsA: Math.round((ptsA / runs) * 10) / 10,
    avgPtsB: Math.round((ptsB / runs) * 10) / 10,
    avgSecondChanceA: Math.round((scA / runs) * 10) / 10,
    avgSecondChanceB: Math.round((scB / runs) * 10) / 10,
  };
}

export function simulateSeries(a: TeamProfile, b: TeamProfile, seed: number): SeriesResult {
  const rng = mulberry32(seed);
  const games: SeriesGameSummary[] = [];
  const wins: [number, number] = [0, 0];
  let decidingGame: GameResult | null = null;

  while (wins[0] < SERIES_WINS_NEEDED && wins[1] < SERIES_WINS_NEEDED) {
    const g = simulateGame(a, b, rng, { formNoise: true });
    games.push({ aPts: g.a.pts, bPts: g.b.pts, winner: g.winner, overtimes: g.overtimes });
    wins[g.winner]++;
    decidingGame = g;
  }
  if (!decidingGame) throw new Error('series produced no games'); // unreachable

  // Separate seed stream so the MC estimate doesn't perturb series results.
  const monteCarlo = monteCarloMatchup(a, b, seed ^ 0x9e3779b9);

  return {
    seed,
    games,
    wins,
    winner: wins[0] === SERIES_WINS_NEEDED ? 0 : 1,
    decidingGame,
    monteCarlo,
  };
}
