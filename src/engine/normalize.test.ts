import { describe, expect, it } from 'vitest';
import { SAMPLE_DATASET } from '../data/sample';
import type { LeagueSeasonContext, PlayerEntry } from '../data/types';
import { BASELINE } from './config';
import { eraContext, normalizePlayer } from './normalize';

function ctx(season: number, pace: number, fgPct = 0.466, tpPct = 0.355, ftPct = 0.775): LeagueSeasonContext {
  return { season, pace, ppg: 110, fgPct, tpPct, ftPct, tpaPerGame: 30, ftaPerGame: 22 };
}

function makeEntry(overrides: Partial<PlayerEntry['stats']> = {}, span: [number, number] = [2020, 2020]): PlayerEntry {
  return {
    id: 'test-player',
    name: 'Test Player',
    franchiseId: 'BOS',
    decade: 2020,
    positions: ['SF'],
    from: span[0],
    to: span[1],
    games: 200,
    stats: {
      mp: 36, pts: 20, trb: 8, ast: 4, stl: 1.2, blk: 0.8, tov: 2.5,
      fga: 16, fgPct: 0.48, tpa: 4, tpPct: 0.36, fta: 5, ftPct: 0.8,
      ...overrides,
    },
    usagePct: 25,
  };
}

describe('eraContext', () => {
  it('averages league context over the span', () => {
    const lc = [ctx(2019, 100), ctx(2020, 96), ctx(2021, 92)];
    const era = eraContext(lc, 2019, 2021);
    expect(era.pace).toBeCloseTo(96, 5);
  });

  it('falls back to nearest season when span is uncovered', () => {
    const lc = [ctx(2019, 100), ctx(2020, 96)];
    const era = eraContext(lc, 1960, 1965);
    expect(era.pace).toBe(100); // nearest = 2019
  });
});

describe('normalizePlayer', () => {
  it('pace-adjusts counting stats down for fast eras', () => {
    // Identical raw stat lines, one in a 120-pace era, one at the 96 baseline.
    const fastEra = normalizePlayer(makeEntry(), [ctx(2020, 120)]);
    const baseEra = normalizePlayer(makeEntry(), [ctx(2020, BASELINE.pace)]);
    expect(fastEra.fga).toBeCloseTo(baseEra.fga * (96 / 120), 5);
    expect(fastEra.trb).toBeCloseTo(baseEra.trb * (96 / 120), 5);
    expect(baseEra.fga).toBeCloseTo(16, 5); // 36 mp, baseline pace → unchanged
  });

  it('converts to per-36 so bench minutes do not halve a player', () => {
    const fullTime = normalizePlayer(makeEntry({ mp: 36 }), [ctx(2020, 96)]);
    const halfTime = normalizePlayer(
      makeEntry({ mp: 18, pts: 10, fga: 8, tpa: 2, fta: 2.5, trb: 4, ast: 2 }),
      [ctx(2020, 96)],
    );
    expect(halfTime.fga).toBeCloseTo(fullTime.fga, 5);
    expect(halfTime.trb).toBeCloseTo(fullTime.trb, 5);
  });

  it('scales shooting efficiency relative to the era league average', () => {
    // 48% shooter in a league that shot 0.426 is better than 48% at 0.466.
    const weakLeague = normalizePlayer(makeEntry(), [ctx(2020, 96, 0.426)]);
    const baseLeague = normalizePlayer(makeEntry(), [ctx(2020, 96, 0.466)]);
    expect(weakLeague.p2).toBeGreaterThan(baseLeague.p2);
    expect(weakLeague.p2 / baseLeague.p2).toBeCloseTo(0.466 / 0.426, 2);
  });

  it('keeps zero threes for pre-3-point-line players', () => {
    const entry = makeEntry({ tpa: 0, tpPct: 0 }, [1965, 1969]);
    const norm = normalizePlayer(entry, [ctx(1967, 118, 0.44, 0, 0.72)]);
    expect(norm.tpa).toBe(0);
    expect(norm.p3).toBe(0);
    expect(norm.tpaShare).toBe(0);
  });

  it('derives 2P% from the overall FG line', () => {
    // fga 16, fg% .48 → 7.68 makes; tpa 4 @ .36 → 1.44; 2P% = 6.24/12 = .52
    const norm = normalizePlayer(makeEntry(), [ctx(2020, 96)]);
    expect(norm.p2).toBeCloseTo(0.52, 3);
  });

  it('clamps efficiency scaling to sane bounds', () => {
    const entry = makeEntry({ fgPct: 0.65, tpa: 0 });
    const norm = normalizePlayer(entry, [ctx(2020, 96, 0.3)]); // absurd era
    expect(norm.p2).toBeLessThanOrEqual(0.72);
  });

  it('recomputed points stay close to raw points for a baseline-era player', () => {
    const norm = normalizePlayer(makeEntry(), [ctx(2020, 96)]);
    // pts = 12*0.52*2 + 4*0.36*3 + 5*0.8 = 12.48 + 4.32 + 4 = 20.8 ≈ raw 20
    expect(norm.pts).toBeGreaterThan(17);
    expect(norm.pts).toBeLessThan(24);
  });

  it('normalizes every sample player without producing nonsense', () => {
    for (const p of SAMPLE_DATASET.players) {
      const n = normalizePlayer(p, SAMPLE_DATASET.leagueContext);
      expect(n.pts, p.id).toBeGreaterThan(0);
      expect(n.pts, p.id).toBeLessThan(45);
      expect(n.p2, p.id).toBeGreaterThanOrEqual(0.3);
      expect(n.p2, p.id).toBeLessThanOrEqual(0.72);
      expect(n.tpaShare, p.id).toBeGreaterThanOrEqual(0);
      expect(n.tpaShare, p.id).toBeLessThanOrEqual(0.8);
      expect(n.trb, p.id).toBeGreaterThan(0);
      expect(n.trb, p.id).toBeLessThan(25);
    }
  });
});
