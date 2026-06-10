/**
 * Public engine API. Pure TypeScript — no React imports anywhere in
 * src/engine/, and every simulation is seeded and reproducible.
 */
export { BASELINE, MONTE_CARLO_RUNS, SEASON_GAMES, SERIES_WINS_NEEDED } from './config';
export {
  assignmentOptions,
  emptyRoster,
  hasNaturalSlot,
  isComplete,
  openPositions,
  poolHasNaturalFit,
  positionDistance,
  rosterPlayers,
  snakeOrder,
  type AssignmentOption,
  type Roster,
} from './draft';
export { explainSeason, explainSeries } from './explain';
export {
  averageBox,
  simulateGame,
  type BoxLine,
  type GameResult,
  type TeamBox,
} from './game';
export { leagueAverageTeam } from './leagueAverage';
export { eraContext, normalizePlayer, type NormalizedPlayer } from './normalize';
export { mulberry32, randomSeed, type Rng } from './rng';
export { simulateSeason, type SeasonResult } from './season';
export {
  monteCarloMatchup,
  simulateSeries,
  type MatchupStats,
  type SeriesGameSummary,
  type SeriesResult,
} from './series';
export { buildTeam, type FitFactor, type SimPlayer, type TeamProfile } from './team';
