/**
 * Core data model for Hardwood GM.
 *
 * The unit of draftable content is a PlayerEntry: one player's per-game
 * averages over the seasons they played for one franchise within one decade
 * (e.g. "Michael Jordan, 1990s Chicago"). The same human player can appear as
 * several entries (different franchises and/or decades).
 *
 * Conventions:
 * - Seasons are identified by their END year: the 1995-96 season is `1996`.
 * - A season belongs to the decade of its end year: 1989-90 (= 1990) is a
 *   "1990s" season, 1999-00 (= 2000) is a "2000s" season.
 * - All stats are per-game averages over the entry's span, NOT career stats.
 * - Percentages are stored as fractions in [0, 1] (0.505 = 50.5 FG%), except
 *   usagePct which is a conventional 0-100 number (e.g. 31.5).
 */

/** The five roster slots. Order matters for display (point guard → center). */
export const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C'] as const;
export type Position = (typeof POSITIONS)[number];

export const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020] as const;
export type Decade = (typeof DECADES)[number];

/** Per-game averages over a player entry's span. */
export interface StatLine {
  /** Minutes per game. */
  mp: number;
  pts: number;
  /** Total rebounds per game. */
  trb: number;
  ast: number;
  /** Steals per game (estimated for pre-1974 seasons; not officially recorded). */
  stl: number;
  /** Blocks per game (estimated for pre-1974 seasons). */
  blk: number;
  /** Turnovers per game (estimated for pre-1978 seasons). */
  tov: number;
  /** Field goal attempts per game. */
  fga: number;
  /** Field goal % as a fraction, e.g. 0.505. */
  fgPct: number;
  /** Three-point attempts per game (0 for pre-1980 seasons; no 3-point line). */
  tpa: number;
  /** Three-point % as a fraction (0 when tpa is 0). */
  tpPct: number;
  /** Free throw attempts per game. */
  fta: number;
  /** Free throw % as a fraction. */
  ftPct: number;
}

/** One player's stint with one franchise within one decade. */
export interface PlayerEntry {
  /** Stable unique id, e.g. "michael-jordan-1990s-chi". */
  id: string;
  name: string;
  /** Modern franchise code (see franchises.ts), e.g. "CHI", "LAL". */
  franchiseId: string;
  /** Decade start year: 1990 means "the 1990s". */
  decade: Decade;
  /**
   * Eligible roster positions, primary first (1-3 entries). Assigning the
   * player to a listed position carries no penalty; anything else is
   * "out of position" and penalized by the engine.
   */
  positions: Position[];
  /** First season (end year) of the span, e.g. 1991 for 1990-91. */
  from: number;
  /** Last season (end year) of the span. */
  to: number;
  /** Games played for this franchise in this decade (drives eligibility). */
  games: number;
  /** Per-game averages over the span. */
  stats: StatLine;
  /** Usage rate, 0-100 scale (e.g. 31.5). Estimated when absent from source. */
  usagePct: number;
  /** True when usagePct was estimated from box-score stats rather than taken from the source data. */
  usageEstimated?: boolean;
}

/** League-wide averages for one season; drives era normalization in the engine. */
export interface LeagueSeasonContext {
  /** Season end year: 1996 = the 1995-96 season. */
  season: number;
  /** Possessions per team per 48 minutes. */
  pace: number;
  /** Points per team per game. */
  ppg: number;
  /** League FG% as a fraction. */
  fgPct: number;
  /** League 3P% as a fraction (0 before 1980). */
  tpPct: number;
  /** League FT% as a fraction. */
  ftPct: number;
  /** Three-point attempts per team per game (0 before 1980). */
  tpaPerGame: number;
  /** Free throw attempts per team per game. */
  ftaPerGame: number;
}

/** Everything the app needs to run: players plus league context. */
export interface Dataset {
  /** "sample" = built-in hand-written data; "ingested" = produced by scripts/ingest.ts. */
  source: 'sample' | 'ingested';
  /** Short human-readable description shown in the UI footer. */
  label: string;
  /** ISO timestamp for ingested datasets. */
  generatedAt?: string;
  players: PlayerEntry[];
  leagueContext: LeagueSeasonContext[];
}

/** A wheel outcome: one franchise-decade pool of draftable players. */
export interface FranchiseDecadeCombo {
  /** `${decade}-${franchiseId}`, e.g. "1990-CHI". */
  key: string;
  franchiseId: string;
  decade: Decade;
  /** Ids of every PlayerEntry in this pool. */
  playerIds: string[];
}
