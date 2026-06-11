/** Small display formatting helpers (no game logic here). */
import { comboDisplayName, franchiseCity, getFranchise } from '../data/franchises';
import type { Decade, FranchiseDecadeCombo, PlayerEntry } from '../data/types';

export function fmt1(v: number): string {
  return (Math.round(v * 10) / 10).toFixed(1);
}

/** 0.505 → "50.5%" */
export function fmtPct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

/** 0.505 → "51%" — whole-number percent for dense stat tables. */
export function fmtPct0(v: number): string {
  return `${Math.round(v * 100)}%`;
}

export function comboLabel(combo: FranchiseDecadeCombo): string {
  return comboDisplayName(combo.franchiseId, combo.decade);
}

/** Just the decade, e.g. "1990s". */
export function eraLabel(decade: Decade): string {
  return `${decade}s`;
}

/** Just the city for a franchise-decade, e.g. "Seattle" for OKC in the 1990s. */
export function teamLabel(franchiseId: string, decade: Decade): string {
  const city = franchiseCity(franchiseId, decade);
  const ambiguous = ['LAL', 'LAC'].includes(franchiseId);
  return ambiguous ? `${city} (${franchiseId})` : city;
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
