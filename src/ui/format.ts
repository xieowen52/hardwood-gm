/** Small display formatting helpers (no game logic here). */
import { comboDisplayName, getFranchise } from '../data/franchises';
import type { FranchiseDecadeCombo, PlayerEntry } from '../data/types';

export function fmt1(v: number): string {
  return (Math.round(v * 10) / 10).toFixed(1);
}

/** 0.505 → "50.5%" */
export function fmtPct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

export function comboLabel(combo: FranchiseDecadeCombo): string {
  return comboDisplayName(combo.franchiseId, combo.decade);
}

export function comboColors(combo: FranchiseDecadeCombo): [string, string] {
  return getFranchise(combo.franchiseId)?.colors ?? ['#444444', '#888888'];
}

/** "1991–1998 · 552 gp" */
export function spanLabel(p: PlayerEntry): string {
  const span = p.from === p.to ? `${p.from}` : `${p.from}–${p.to}`;
  return `${span} · ${p.games} gp`;
}

export function playerComboLabel(p: PlayerEntry): string {
  return comboDisplayName(p.franchiseId, p.decade);
}
