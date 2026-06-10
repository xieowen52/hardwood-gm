import { describe, expect, it } from 'vitest';
import { SAMPLE_DATASET } from '../data/sample';
import type { PlayerEntry, Position } from '../data/types';
import { emptyRoster, type Roster } from './draft';
import { simulateGame } from './game';
import { leagueAverageTeam } from './leagueAverage';
import { mulberry32 } from './rng';
import { simulateSeason } from './season';
import { monteCarloMatchup, simulateSeries } from './series';
import { buildTeam } from './team';

const byId = new Map(SAMPLE_DATASET.players.map((p) => [p.id, p]));

function roster(assignments: Record<Position, string>): Roster {
  const r = emptyRoster();
  for (const [pos, id] of Object.entries(assignments)) {
    const p = byId.get(id);
    if (!p) throw new Error(`sample player ${id} missing`);
    r[pos as Position] = p as PlayerEntry;
  }
  return r;
}

const GOATS = buildTeam(
  'All-Time Greats',
  roster({
    PG: 'magic-johnson-1980s-lal',
    SG: 'michael-jordan-1990s-chi',
    SF: 'lebron-james-2010s-cle',
    PF: 'tim-duncan-2000s-sas',
    C: 'hakeem-olajuwon-1990s-hou',
  }),
  SAMPLE_DATASET.leagueContext,
);

const SCRUBS = buildTeam(
  'End of Bench',
  roster({
    PG: 'matthew-dellavedova-2010s-cle',
    SG: 'andre-roberson-2010s-okc',
    SF: 'iman-shumpert-2010s-cle',
    PF: 'kurt-rambis-1980s-lal',
    C: 'greg-ostertag-1990s-uta',
  }),
  SAMPLE_DATASET.leagueContext,
);

describe('possession engine', () => {
  it('box score is internally consistent', () => {
    const g = simulateGame(GOATS, SCRUBS, mulberry32(42));
    for (const box of [g.a, g.b]) {
      const sumPts = box.players.reduce((s, l) => s + l.pts, 0);
      expect(sumPts).toBe(box.pts);
      for (const l of box.players) {
        expect(l.fgm).toBeLessThanOrEqual(l.fga);
        expect(l.tpm).toBeLessThanOrEqual(l.tpa);
        expect(l.tpa).toBeLessThanOrEqual(l.fga);
        expect(l.ftm).toBeLessThanOrEqual(l.fta);
        expect(l.pts).toBe(2 * (l.fgm - l.tpm) + 3 * l.tpm + l.ftm);
      }
    }
    expect(g.a.pts).not.toBe(g.b.pts); // ties resolved by overtime
  });

  it('scores land in a plausible basketball range on average', () => {
    const avg = leagueAverageTeam();
    const mc = monteCarloMatchup(avg, leagueAverageTeam('Mirror'), 7, 300);
    expect(mc.avgPtsA).toBeGreaterThan(90);
    expect(mc.avgPtsA).toBeLessThan(130);
    // A mirror matchup must be a coin flip.
    expect(mc.aWinPct).toBeGreaterThan(0.4);
    expect(mc.aWinPct).toBeLessThan(0.6);
  });

  it('higher-usage players take more shots', () => {
    const rng = mulberry32(7);
    let jordanShots = 0;
    let rodmanShots = 0;
    const team = buildTeam(
      'usage-check',
      roster({
        PG: 'steve-kerr-1990s-chi', // usage 13
        SG: 'michael-jordan-1990s-chi', // usage 33
        SF: 'scottie-pippen-1990s-chi',
        PF: 'dennis-rodman-1990s-chi', // usage 10
        C: 'luc-longley-1990s-chi',
      }),
      SAMPLE_DATASET.leagueContext,
    );
    for (let i = 0; i < 30; i++) {
      const g = simulateGame(team, leagueAverageTeam(), rng);
      jordanShots += g.a.players.find((l) => l.name === 'Michael Jordan')!.fga;
      rodmanShots += g.a.players.find((l) => l.name === 'Dennis Rodman')!.fga;
    }
    expect(jordanShots).toBeGreaterThan(rodmanShots * 1.8);
  });

  it('is deterministic for a given seed', () => {
    const g1 = simulateGame(GOATS, SCRUBS, mulberry32(123));
    const g2 = simulateGame(GOATS, SCRUBS, mulberry32(123));
    expect(g1).toEqual(g2);
  });
});

describe('matchup sanity', () => {
  it('a wildly superior team wins more than 95% of single games', () => {
    const mc = monteCarloMatchup(GOATS, SCRUBS, 99, 400);
    expect(mc.aWinPct).toBeGreaterThan(0.95);
  });

  it('the all-time greats clearly beat the league-average team', () => {
    const mc = monteCarloMatchup(GOATS, leagueAverageTeam(), 5, 400);
    expect(mc.aWinPct).toBeGreaterThan(0.75);
  });

  it('the scrubs lose to the league-average team', () => {
    const mc = monteCarloMatchup(SCRUBS, leagueAverageTeam(), 5, 400);
    expect(mc.aWinPct).toBeLessThan(0.35);
  });
});

describe('season simulation', () => {
  it('the greats project to a historically great record', () => {
    const season = simulateSeason(GOATS, 2024);
    expect(season.wins).toBeGreaterThanOrEqual(60);
    expect(season.wins + season.losses).toBe(82);
  });

  it('the scrubs project to a bad record', () => {
    const season = simulateSeason(SCRUBS, 2024);
    expect(season.wins).toBeLessThanOrEqual(30);
  });

  it('is reproducible from its seed and varies across seeds', () => {
    const s1 = simulateSeason(GOATS, 7);
    const s2 = simulateSeason(GOATS, 7);
    expect(s1.wins).toBe(s2.wins);
    expect(s1.playerAverages).toEqual(s2.playerAverages);
    const others = [1, 2, 3, 4, 5].map((seed) => simulateSeason(GOATS, seed).wins);
    expect(new Set([s1.wins, ...others]).size).toBeGreaterThan(1);
  });

  it('an 82-game season completes within the time budget', () => {
    const start = performance.now();
    simulateSeason(GOATS, 1);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(250);
  });
});

describe('series simulation', () => {
  it('produces a valid best-of-7 with a deciding-game box score', () => {
    const series = simulateSeries(GOATS, SCRUBS, 11);
    expect(series.games.length).toBeGreaterThanOrEqual(4);
    expect(series.games.length).toBeLessThanOrEqual(7);
    expect(Math.max(...series.wins)).toBe(4);
    const last = series.games[series.games.length - 1]!;
    expect(last.winner).toBe(series.winner);
    expect(series.decidingGame.a.pts).toBe(last.aPts);
    expect(series.decidingGame.b.pts).toBe(last.bPts);
  });

  it('a best-of-7 plus 1000-run Monte Carlo feels instant', () => {
    const start = performance.now();
    simulateSeries(GOATS, leagueAverageTeam(), 3);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(1500);
  });
});
