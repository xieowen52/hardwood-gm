/**
 * Solo-mode season simulation: the drafted team plays the league-average
 * opponent 82 times with per-game form noise. Seeded — the same seed always
 * reproduces the same record.
 */
import { SEASON_GAMES } from './config';
import { averageBox, simulateGame, type BoxLine, type TeamBox } from './game';
import { leagueAverageTeam } from './leagueAverage';
import { mulberry32 } from './rng';
import type { FitFactor, TeamProfile } from './team';

export interface SeasonResult {
  wins: number;
  losses: number;
  seed: number;
  /** Per-game scoring averages. */
  pointsFor: number;
  pointsAgainst: number;
  /** Average per-game lines for the drafted five across the season. */
  playerAverages: BoxLine[];
  /** Team per-game category totals (derived from playerAverages). */
  teamTotals: Pick<BoxLine, 'pts' | 'reb' | 'ast' | 'stl' | 'blk' | 'tov' | 'tpm'>;
  secondChancePerGame: number;
  /** Fit/synergy factors that shaped the result. */
  factors: FitFactor[];
}

export function simulateSeason(
  team: TeamProfile,
  seed: number,
  games: number = SEASON_GAMES,
): SeasonResult {
  const rng = mulberry32(seed);
  const opponent = leagueAverageTeam();

  let wins = 0;
  let pointsFor = 0;
  let pointsAgainst = 0;
  let secondChance = 0;
  const boxes: TeamBox[] = [];

  for (let g = 0; g < games; g++) {
    const result = simulateGame(team, opponent, rng, { formNoise: true });
    if (result.winner === 0) wins++;
    pointsFor += result.a.pts;
    pointsAgainst += result.b.pts;
    secondChance += result.a.secondChancePts;
    boxes.push(result.a);
  }

  const playerAverages = averageBox(boxes);
  const sum = (f: (l: BoxLine) => number) => {
    const v = playerAverages.reduce((s, l) => s + f(l), 0);
    return Math.round(v * 10) / 10;
  };

  return {
    wins,
    losses: games - wins,
    seed,
    pointsFor: Math.round((pointsFor / games) * 10) / 10,
    pointsAgainst: Math.round((pointsAgainst / games) * 10) / 10,
    playerAverages,
    teamTotals: {
      pts: sum((l) => l.pts),
      reb: sum((l) => l.reb),
      ast: sum((l) => l.ast),
      stl: sum((l) => l.stl),
      blk: sum((l) => l.blk),
      tov: sum((l) => l.tov),
      tpm: sum((l) => l.tpm),
    },
    secondChancePerGame: Math.round((secondChance / games) * 10) / 10,
    factors: team.factors,
  };
}
