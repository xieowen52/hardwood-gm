import { describe, expect, it } from 'vitest';
import { buildCombos, WHEEL_CONFIG } from './combos';
import { comboDisplayName } from './franchises';
import { SAMPLE_DATASET } from './sample';
import { POSITIONS, type Position } from './types';
import { validateDataset } from './validate';

describe('sample dataset', () => {
  it('passes validation with zero issues', () => {
    expect(validateDataset(SAMPLE_DATASET)).toEqual([]);
  });

  it('every wheel combo has at least the configured minimum of players', () => {
    const combos = buildCombos(SAMPLE_DATASET);
    expect(combos.length).toBeGreaterThanOrEqual(15);
    for (const combo of combos) {
      expect(combo.playerIds.length).toBeGreaterThanOrEqual(WHEEL_CONFIG.minPlayersPerCombo);
    }
  });

  it('no player entry is stranded outside a wheel combo', () => {
    // Every sample entry should belong to a spinnable combo — otherwise it
    // was hand-written but can never appear in the game.
    const combos = buildCombos(SAMPLE_DATASET);
    const reachable = new Set(combos.flatMap((c) => c.playerIds));
    for (const p of SAMPLE_DATASET.players) {
      expect(reachable.has(p.id), `${p.id} unreachable`).toBe(true);
    }
  });

  it('every combo can field all five positions from primary+secondary eligibility', () => {
    const combos = buildCombos(SAMPLE_DATASET);
    for (const combo of combos) {
      const players = SAMPLE_DATASET.players.filter((p) => combo.playerIds.includes(p.id));
      const covered = new Set<Position>(players.flatMap((p) => p.positions));
      for (const pos of POSITIONS) {
        expect(covered.has(pos), `${combo.key} cannot field a ${pos}`).toBe(true);
      }
    }
  });

  it('league context covers every season any sample player spans', () => {
    const seasons = new Set(SAMPLE_DATASET.leagueContext.map((c) => c.season));
    for (const p of SAMPLE_DATASET.players) {
      for (let s = p.from; s <= p.to; s++) {
        expect(seasons.has(s), `missing context for ${s} (${p.id})`).toBe(true);
      }
    }
  });

  it('player spans stay inside their decade', () => {
    for (const p of SAMPLE_DATASET.players) {
      expect(p.from, p.id).toBeGreaterThanOrEqual(p.decade);
      expect(p.to, p.id).toBeLessThanOrEqual(p.decade + 9);
    }
  });

  it('pre-1980 entries take no three-pointers', () => {
    for (const p of SAMPLE_DATASET.players) {
      if (p.to < 1980) {
        expect(p.stats.tpa, p.id).toBe(0);
        expect(p.stats.tpPct, p.id).toBe(0);
      }
    }
  });
});

describe('combo display names', () => {
  it('uses decade-appropriate city names', () => {
    expect(comboDisplayName('CHI', 1990)).toBe('1990s Chicago');
    expect(comboDisplayName('OKC', 1990)).toBe('1990s Seattle');
    expect(comboDisplayName('MEM', 1990)).toBe('1990s Vancouver');
  });

  it('disambiguates franchises sharing a city with the franchise code', () => {
    expect(comboDisplayName('LAL', 2010)).toBe('2010s Los Angeles (LAL)');
    expect(comboDisplayName('LAC', 2010)).toBe('2010s Los Angeles (LAC)');
    // No clash in the 1970s: the other LA franchise was in Buffalo.
    expect(comboDisplayName('LAL', 1970)).toBe('1970s Los Angeles');
  });
});
