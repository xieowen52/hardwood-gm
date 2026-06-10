/**
 * Helpers for the hand-written sample dataset.
 *
 * Sample stat lines are realistic approximations of each player's per-game
 * averages over the given span — good enough to make the game feel right,
 * NOT a substitute for real data (plug that in via scripts/ingest.ts).
 * Steals/blocks/turnovers before they were officially tracked (1974/1978)
 * are estimates.
 */
import type { Decade, PlayerEntry, Position, StatLine } from '../types';

export interface SampleStats {
  mp: number;
  pts: number;
  trb: number;
  ast: number;
  stl: number;
  blk: number;
  tov: number;
  fga: number;
  /** FG% as a fraction. */
  fgp: number;
  tpa: number;
  /** 3P% as a fraction. */
  tpp: number;
  fta: number;
  /** FT% as a fraction. */
  ftp: number;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Compact constructor for one sample PlayerEntry. */
export function entry(
  name: string,
  franchiseId: string,
  decade: Decade,
  positions: Position[],
  from: number,
  to: number,
  games: number,
  usagePct: number,
  s: SampleStats,
): PlayerEntry {
  const stats: StatLine = {
    mp: s.mp,
    pts: s.pts,
    trb: s.trb,
    ast: s.ast,
    stl: s.stl,
    blk: s.blk,
    tov: s.tov,
    fga: s.fga,
    fgPct: s.fgp,
    tpa: s.tpa,
    tpPct: s.tpp,
    fta: s.fta,
    ftPct: s.ftp,
  };
  return {
    id: `${slugify(name)}-${decade}s-${franchiseId.toLowerCase()}`,
    name,
    franchiseId,
    decade,
    positions,
    from,
    to,
    games,
    stats,
    usagePct,
    usageEstimated: true,
  };
}
