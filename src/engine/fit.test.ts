import { describe, expect, it } from 'vitest';
import { SAMPLE_DATASET } from '../data/sample';
import type { PlayerEntry, Position } from '../data/types';
import { emptyRoster, positionDistance, type Roster } from './draft';
import { buildTeam } from './team';

const byId = new Map(SAMPLE_DATASET.players.map((p) => [p.id, p]));

function player(id: string): PlayerEntry {
  const p = byId.get(id);
  if (!p) throw new Error(`sample player ${id} missing`);
  return p;
}

function roster(assignments: Partial<Record<Position, string>>): Roster {
  const r = emptyRoster();
  for (const [pos, id] of Object.entries(assignments)) {
    r[pos as Position] = player(id);
  }
  return r;
}

/** A sane, in-position 90s reference team. */
const BALANCED = {
  PG: 'john-stockton-1990s-uta',
  SG: 'michael-jordan-1990s-chi',
  SF: 'scottie-pippen-1990s-chi',
  PF: 'karl-malone-1990s-uta',
  C: 'hakeem-olajuwon-1990s-hou',
};

describe('positionDistance', () => {
  it('is 0 for any listed position', () => {
    const jordan = player('michael-jordan-1990s-chi'); // SG/SF
    expect(positionDistance(jordan, 'SG')).toBe(0);
    expect(positionDistance(jordan, 'SF')).toBe(0);
  });

  it('grows with distance along the position spectrum', () => {
    const hakeem = player('hakeem-olajuwon-1990s-hou'); // C only
    expect(positionDistance(hakeem, 'PF')).toBe(1);
    expect(positionDistance(hakeem, 'SF')).toBe(2);
    expect(positionDistance(hakeem, 'SG')).toBe(3);
    expect(positionDistance(hakeem, 'PG')).toBe(4);
  });
});

describe('fit adjustments', () => {
  it('a clean lineup has no out-of-position factors', () => {
    const team = buildTeam('ref', roster(BALANCED), SAMPLE_DATASET.leagueContext);
    expect(team.factors.filter((f) => f.kind === 'out-of-position')).toEqual([]);
  });

  it('out-of-position assignment produces a factor and reduces efficiency', () => {
    const inPos = buildTeam('a', roster(BALANCED), SAMPLE_DATASET.leagueContext);
    const swapped = buildTeam(
      'b',
      // Hakeem at SG (3 steps), Jordan at C (3 steps).
      roster({ ...BALANCED, SG: 'hakeem-olajuwon-1990s-hou', C: 'michael-jordan-1990s-chi' }),
      SAMPLE_DATASET.leagueContext,
    );
    const oop = swapped.factors.filter((f) => f.kind === 'out-of-position');
    expect(oop).toHaveLength(2);

    const hakeemIn = inPos.players.find((p) => p.norm.entry.name === 'Hakeem Olajuwon');
    const hakeemOut = swapped.players.find((p) => p.norm.entry.name === 'Hakeem Olajuwon');
    expect(hakeemOut!.p2).toBeLessThan(hakeemIn!.p2 * 0.9); // 3 steps ≈ -15%
    expect(hakeemOut!.def).toBeLessThan(hakeemIn!.def);
  });

  it('worse the farther out of position (C at SG worse than PF at C)', () => {
    const farTeam = buildTeam(
      'far',
      roster({ ...BALANCED, SG: 'hakeem-olajuwon-1990s-hou', C: 'michael-jordan-1990s-chi' }),
      SAMPLE_DATASET.leagueContext,
    );
    const nearTeam = buildTeam(
      'near',
      roster({ ...BALANCED, PF: 'hakeem-olajuwon-1990s-hou', C: 'karl-malone-1990s-uta' }),
      SAMPLE_DATASET.leagueContext,
    );
    const far = farTeam.factors.find((f) => f.kind === 'out-of-position' && f.label.includes('Hakeem'));
    const near = nearTeam.factors.find((f) => f.kind === 'out-of-position' && f.label.includes('Hakeem'));
    expect(far).toBeDefined();
    expect(near).toBeDefined();
    expect(Math.abs(far!.impact)).toBeGreaterThan(Math.abs(near!.impact));
  });

  it('usage overlap triggers for a team of five alphas', () => {
    const alphas = buildTeam(
      'alphas',
      roster({
        PG: 'russell-westbrook-2010s-okc', // 32
        SG: 'michael-jordan-1990s-chi', // 33
        SF: 'kevin-durant-2010s-okc', // 31
        PF: 'giannis-antetokounmpo-2020s-mil', // 33
        C: 'shaquille-o-neal-2000s-lal', // 31
      }),
      SAMPLE_DATASET.leagueContext,
    );
    const overlap = alphas.factors.find((f) => f.kind === 'usage-overlap');
    expect(overlap).toBeDefined();
    expect(overlap!.impact).toBeLessThan(0);
  });

  it('no usage overlap for a lineup with one star and role players', () => {
    const team = buildTeam(
      'ref',
      roster({
        PG: 'john-stockton-1990s-uta', // 19
        SG: 'jeff-hornacek-1990s-uta', // 19
        SF: 'scottie-pippen-1990s-chi', // 24
        PF: 'horace-grant-1990s-chi', // 16
        C: 'hakeem-olajuwon-1990s-hou', // 28 → total 106
      }),
      SAMPLE_DATASET.leagueContext,
    );
    expect(team.factors.find((f) => f.kind === 'usage-overlap')).toBeUndefined();
    expect(team.factors.find((f) => f.kind === 'usage-starved')).toBeUndefined();
  });

  it('usage starvation triggers for a team of role players', () => {
    const team = buildTeam(
      'role-players',
      roster({
        PG: 'k-c-jones-1960s-bos', // 13
        SG: 'andre-roberson-2010s-okc', // 9
        SF: 'bruce-bowen-2000s-sas', // 10
        PF: 'kurt-rambis-1980s-lal', // 11
        C: 'dennis-rodman-1990s-chi', // 10
      }),
      SAMPLE_DATASET.leagueContext,
    );
    expect(team.factors.find((f) => f.kind === 'usage-starved')).toBeDefined();
  });

  it('spacing: a 2010s shooting lineup rates above a 1960s lineup', () => {
    const splash = buildTeam(
      'splash',
      roster({
        PG: 'stephen-curry-2010s-gsw',
        SG: 'klay-thompson-2010s-gsw',
        SF: 'kevin-durant-2010s-gsw',
        PF: 'draymond-green-2010s-gsw',
        C: 'brook-lopez-2020s-mil',
      }),
      SAMPLE_DATASET.leagueContext,
    );
    const sixties = buildTeam(
      'sixties',
      roster({
        PG: 'bob-cousy-1960s-bos',
        SG: 'sam-jones-1960s-bos',
        SF: 'john-havlicek-1960s-bos',
        PF: 'tom-heinsohn-1960s-bos',
        C: 'bill-russell-1960s-bos',
      }),
      SAMPLE_DATASET.leagueContext,
    );
    expect(splash.expectedThrees).toBeGreaterThan(sixties.expectedThrees + 8);
    const splashSpacing = splash.factors.find((f) => f.kind === 'spacing');
    const sixtiesSpacing = sixties.factors.find((f) => f.kind === 'spacing');
    expect(splashSpacing?.impact ?? 0).toBeGreaterThan(0);
    expect(sixtiesSpacing?.impact ?? 0).toBeLessThan(0);
  });
});
