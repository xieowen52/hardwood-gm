/**
 * Runtime dataset validation. Used two ways:
 * - unit tests assert the built-in sample dataset has zero issues;
 * - the app validates an ingested players.json at startup and falls back to
 *   the sample dataset (with a console warning) if it's unusable, so a bad
 *   ingest can never produce a broken UI.
 */
import { buildCombos } from './combos';
import { getFranchise } from './franchises';
import { DECADES, POSITIONS, type Dataset, type StatLine } from './types';

const STAT_KEYS: (keyof StatLine)[] = [
  'mp', 'pts', 'trb', 'ast', 'stl', 'blk', 'tov',
  'fga', 'fgPct', 'tpa', 'tpPct', 'fta', 'ftPct',
];

const PCT_KEYS: (keyof StatLine)[] = ['fgPct', 'tpPct', 'ftPct'];

/** Returns a list of human-readable problems; empty means the dataset is usable. */
export function validateDataset(dataset: Dataset): string[] {
  const issues: string[] = [];
  const seenIds = new Set<string>();

  if (dataset.players.length === 0) issues.push('dataset has no players');
  if (dataset.leagueContext.length === 0) issues.push('dataset has no league context');

  const contextSeasons = new Set(dataset.leagueContext.map((c) => c.season));

  for (const p of dataset.players) {
    const where = `player "${p.id}"`;
    if (seenIds.has(p.id)) issues.push(`duplicate id: ${p.id}`);
    seenIds.add(p.id);

    if (!p.name) issues.push(`${where}: empty name`);
    if (!getFranchise(p.franchiseId)) issues.push(`${where}: unknown franchise "${p.franchiseId}"`);
    if (!DECADES.includes(p.decade)) issues.push(`${where}: invalid decade ${p.decade}`);

    if (p.positions.length < 1 || p.positions.length > 3) {
      issues.push(`${where}: must have 1-3 positions, has ${p.positions.length}`);
    }
    for (const pos of p.positions) {
      if (!POSITIONS.includes(pos)) issues.push(`${where}: invalid position "${pos}"`);
    }

    if (p.to < p.from) issues.push(`${where}: span ends (${p.to}) before it starts (${p.from})`);
    if (!(p.games > 0)) issues.push(`${where}: games must be > 0`);

    for (let season = p.from; season <= p.to; season++) {
      if (!contextSeasons.has(season)) {
        issues.push(`${where}: no league context for season ${season}`);
        break;
      }
    }

    for (const key of STAT_KEYS) {
      const v = p.stats[key];
      if (!Number.isFinite(v) || v < 0) issues.push(`${where}: stat ${key} is ${v}`);
    }
    for (const key of PCT_KEYS) {
      const v = p.stats[key];
      if (v > 1) issues.push(`${where}: ${key} must be a fraction in [0,1], got ${v}`);
    }
    if (!Number.isFinite(p.usagePct) || p.usagePct < 1 || p.usagePct > 50) {
      issues.push(`${where}: usagePct ${p.usagePct} outside sane range [1,50]`);
    }
  }

  if (buildCombos(dataset).length === 0) {
    issues.push('no franchise-decade combo has enough players for the wheel');
  }

  return issues;
}
