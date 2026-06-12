/** Small display formatting helpers (no game logic here). */
import { franchiseCity } from '../data/franchises';
import type { Decade, PlayerEntry } from '../data/types';

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

/** Season span, e.g. "1991–1998" (games played intentionally omitted). */
export function spanLabel(p: PlayerEntry): string {
  return p.from === p.to ? `${p.from}` : `${p.from}–${p.to}`;
}

/** Team-first combo label, e.g. "Chicago · 1990s" (reads better than "1990s Chicago"). */
export function playerComboLabel(p: PlayerEntry): string {
  return `${teamLabel(p.franchiseId, p.decade)} · ${eraLabel(p.decade)}`;
}
