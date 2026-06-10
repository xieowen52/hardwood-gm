/**
 * Engine sanity report: prints matchup tables and season projections for
 * reference lineups so calibration changes are visible at a glance.
 *
 *   npx tsx scripts/sanity.ts
 */
import { SAMPLE_DATASET } from '../src/data/sample';
import type { Position } from '../src/data/types';
import { emptyRoster, type Roster } from '../src/engine/draft';
import { leagueAverageTeam } from '../src/engine/leagueAverage';
import { simulateSeason } from '../src/engine/season';
import { monteCarloMatchup } from '../src/engine/series';
import { buildTeam, type TeamProfile } from '../src/engine/team';

const byId = new Map(SAMPLE_DATASET.players.map((p) => [p.id, p]));

function roster(ids: Record<Position, string>): Roster {
  const r = emptyRoster();
  for (const [pos, id] of Object.entries(ids)) {
    const p = byId.get(id);
    if (!p) throw new Error(`missing sample player ${id}`);
    r[pos as Position] = p;
  }
  return r;
}

const team = (name: string, ids: Record<Position, string>): TeamProfile =>
  buildTeam(name, roster(ids), SAMPLE_DATASET.leagueContext);

const GOATS = team('All-Time Greats', {
  PG: 'magic-johnson-1980s-lal',
  SG: 'michael-jordan-1990s-chi',
  SF: 'lebron-james-2010s-cle',
  PF: 'tim-duncan-2000s-sas',
  C: 'hakeem-olajuwon-1990s-hou',
});

const SCRUBS = team('End of Bench', {
  PG: 'matthew-dellavedova-2010s-cle',
  SG: 'andre-roberson-2010s-okc',
  SF: 'iman-shumpert-2010s-cle',
  PF: 'kurt-rambis-1980s-lal',
  C: 'greg-ostertag-1990s-uta',
});

const SPLASH = team('2010s Shooters', {
  PG: 'stephen-curry-2010s-gsw',
  SG: 'klay-thompson-2010s-gsw',
  SF: 'kevin-durant-2010s-gsw',
  PF: 'draymond-green-2010s-gsw',
  C: 'brook-lopez-2020s-mil',
});

const SIXTIES = team('1960s Boston', {
  PG: 'bob-cousy-1960s-bos',
  SG: 'sam-jones-1960s-bos',
  SF: 'john-havlicek-1960s-bos',
  PF: 'tom-heinsohn-1960s-bos',
  C: 'bill-russell-1960s-bos',
});

const AVG = leagueAverageTeam();

function profile(t: TeamProfile): void {
  console.log(`\n— ${t.name} —`);
  for (const p of t.players) {
    console.log(
      `  ${p.slot}: ${p.norm.entry.name.padEnd(24)} p2=${p.p2.toFixed(3)} p3=${p.p3.toFixed(3)} 3share=${p.norm.tpaShare.toFixed(2)} usage=${p.norm.usage} reb36=${p.reb.toFixed(1)} def=${p.def.toFixed(2)}`,
    );
  }
  console.log(`  tov/poss=${t.tovPerPoss.toFixed(3)} stealPress=${t.stealPressure.toFixed(3)} teamDef=${t.teamDefScore.toFixed(2)} exp3s=${t.expectedThrees.toFixed(1)}`);
  for (const f of t.factors) console.log(`  fit: ${f.detail} (impact ${f.impact.toFixed(1)})`);
}

function matchup(a: TeamProfile, b: TeamProfile): void {
  const mc = monteCarloMatchup(a, b, 12345, 1000);
  console.log(
    `${a.name.padEnd(18)} vs ${b.name.padEnd(18)} → ${(mc.aWinPct * 100).toFixed(1)}% | avg ${mc.avgPtsA}-${mc.avgPtsB} (margin ${(mc.avgPtsA - mc.avgPtsB).toFixed(1)})`,
  );
}

function season(t: TeamProfile): void {
  const s = simulateSeason(t, 2024);
  console.log(`${t.name.padEnd(18)} season: ${s.wins}-${s.losses} | ${s.pointsFor} for, ${s.pointsAgainst} against`);
}

for (const t of [GOATS, SCRUBS, SPLASH, SIXTIES]) profile(t);

console.log('\n=== Matchups (1000 runs) ===');
matchup(GOATS, SCRUBS);
matchup(GOATS, AVG);
matchup(SCRUBS, AVG);
matchup(SPLASH, AVG);
matchup(SIXTIES, AVG);
matchup(GOATS, SPLASH);
matchup(AVG, leagueAverageTeam('Mirror'));

console.log('\n=== Seasons (seed 2024) ===');
for (const t of [GOATS, SCRUBS, SPLASH, SIXTIES]) season(t);
