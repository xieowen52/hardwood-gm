/** Rebuilding past runs from history entries (ids → live Roster objects). */
import { getPlayer } from '../data/dataset';
import { POSITIONS } from '../data/types';
import { emptyRoster, isComplete, type Roster } from '../engine';
import type { HistoryEntry } from './history';

/** Rebuild a Roster from stored entry ids; null if the dataset changed. */
export function rosterFromIds(ids: readonly string[] | undefined): Roster | null {
  if (!ids || ids.length !== POSITIONS.length) return null;
  const roster = emptyRoster();
  POSITIONS.forEach((pos, i) => {
    const p = getPlayer(ids[i] ?? '');
    if (p) roster[pos] = p;
  });
  return isComplete(roster) ? roster : null;
}

/** Can a history entry be reopened against the current dataset? */
export function entryReopenable(entry: HistoryEntry): boolean {
  if (entry.mode === 'h2h') {
    return (
      rosterFromIds(entry.h2h?.rosterIds[0]) !== null &&
      rosterFromIds(entry.h2h?.rosterIds[1]) !== null
    );
  }
  return rosterFromIds(entry.soloRosterIds) !== null;
}
