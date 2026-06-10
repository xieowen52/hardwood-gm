/**
 * Run history in localStorage (this is a local-first app; that's the point).
 * Storage failures (private mode, quota) degrade silently to "no history".
 */
import type { GameMode } from './draftFlow';

export interface HistoryEntry {
  id: string;
  /** ISO date of the run. */
  date: string;
  mode: GameMode;
  /** e.g. "74-8" or "Ava 4-2 Ben". */
  summary: string;
  /** Drafted player names (solo: 5; h2h: both teams). */
  rosterNames: string[];
  /** Sim seed for reproducibility. */
  seed: number;
}

const KEY = 'hardwoodgm.history.v1';
const RULES_KEY = 'hardwoodgm.rulesSeen.v1';
const MAX_ENTRIES = 50;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is HistoryEntry =>
        typeof e === 'object' && e !== null &&
        typeof (e as HistoryEntry).id === 'string' &&
        typeof (e as HistoryEntry).summary === 'string',
    );
  } catch {
    return [];
  }
}

export function addHistory(entry: Omit<HistoryEntry, 'id' | 'date'>): HistoryEntry[] {
  const full: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    date: new Date().toISOString(),
  };
  const next = [full, ...loadHistory()].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — history just won't persist.
  }
  return next;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function rulesSeen(): boolean {
  try {
    return localStorage.getItem(RULES_KEY) === '1';
  } catch {
    return true; // don't nag if storage is unavailable
  }
}

export function markRulesSeen(): void {
  try {
    localStorage.setItem(RULES_KEY, '1');
  } catch {
    /* ignore */
  }
}
