/**
 * Active dataset selection.
 *
 * If scripts/ingest.ts has produced src/data/generated/players.json, that
 * dataset is used; otherwise the built-in sample dataset is. An ingested
 * dataset that fails validation is rejected (console warning) and the app
 * falls back to the sample, so a bad ingest can never break the UI.
 */
import { buildCombos } from './combos';
import { SAMPLE_DATASET } from './sample';
import type { Dataset, FranchiseDecadeCombo, PlayerEntry } from './types';
import { validateDataset } from './validate';

// Matches at most one file; eager so it's bundled at build time. The glob
// tolerates the file not existing (unlike a static import).
const generatedModules = import.meta.glob<{ default: Dataset }>('./generated/players.json', {
  eager: true,
});

function pickDataset(): Dataset {
  for (const path in generatedModules) {
    const mod = generatedModules[path];
    const candidate = mod?.default;
    if (!candidate) continue;
    const issues = validateDataset(candidate);
    if (issues.length === 0) return candidate;
    console.warn(
      `Ignoring ingested dataset at ${path} (${issues.length} issue(s)); using sample data instead.`,
      issues.slice(0, 10),
    );
  }
  return SAMPLE_DATASET;
}

export const DATASET: Dataset = pickDataset();

/** All wheel-eligible franchise-decade combos for the active dataset. */
export const COMBOS: FranchiseDecadeCombo[] = buildCombos(DATASET);

const playerIndex = new Map(DATASET.players.map((p) => [p.id, p]));

export function getPlayer(id: string): PlayerEntry | undefined {
  return playerIndex.get(id);
}

/** Players in a combo, in stable id order (UI sorts for display). */
export function playersInCombo(combo: FranchiseDecadeCombo): PlayerEntry[] {
  const players: PlayerEntry[] = [];
  for (const id of combo.playerIds) {
    const p = playerIndex.get(id);
    if (p) players.push(p);
  }
  return players;
}
