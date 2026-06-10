/**
 * Wheel pool derivation: which franchise-decade combos are spinnable.
 *
 * A combo enters the wheel only when it has at least
 * WHEEL_CONFIG.minPlayersPerCombo player entries, so a draw can never leave
 * the drafter without a real choice (5 roster slots + slack for already-taken
 * picks in head-to-head mode).
 */
import { getFranchise } from './franchises';
import type { Dataset, Decade, FranchiseDecadeCombo, PlayerEntry } from './types';

export const WHEEL_CONFIG = {
  /** Minimum player entries for a franchise-decade to appear on the wheel. */
  minPlayersPerCombo: 8,
} as const;

export function comboKey(decade: Decade, franchiseId: string): string {
  return `${decade}-${franchiseId}`;
}

/** Group every player entry by franchise-decade (no minimum applied). */
export function groupByCombo(players: readonly PlayerEntry[]): Map<string, PlayerEntry[]> {
  const groups = new Map<string, PlayerEntry[]>();
  for (const p of players) {
    const key = comboKey(p.decade, p.franchiseId);
    const group = groups.get(key);
    if (group) group.push(p);
    else groups.set(key, [p]);
  }
  return groups;
}

/**
 * Build the wheel pool: combos with enough players, sorted by decade then
 * franchise for stable ordering.
 */
export function buildCombos(
  dataset: Dataset,
  minPlayers: number = WHEEL_CONFIG.minPlayersPerCombo,
): FranchiseDecadeCombo[] {
  const combos: FranchiseDecadeCombo[] = [];
  for (const [key, group] of groupByCombo(dataset.players)) {
    const first = group[0];
    if (!first) continue;
    if (group.length < minPlayers) continue;
    if (!getFranchise(first.franchiseId)) continue;
    combos.push({
      key,
      franchiseId: first.franchiseId,
      decade: first.decade,
      playerIds: group.map((p) => p.id),
    });
  }
  combos.sort((a, b) => a.decade - b.decade || a.franchiseId.localeCompare(b.franchiseId));
  return combos;
}
