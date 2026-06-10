/** Quick experiment: can a god-tier draft go 82-0? (npx tsx scripts/tune-820.ts) */
import { SAMPLE_DATASET } from '../src/data/sample';
import type { Position } from '../src/data/types';
import { emptyRoster } from '../src/engine/draft';
import { simulateSeason } from '../src/engine/season';
import { monteCarloMatchup } from '../src/engine/series';
import { leagueAverageTeam } from '../src/engine/leagueAverage';
import { buildTeam } from '../src/engine/team';

const byId = new Map(SAMPLE_DATASET.players.map((p) => [p.id, p]));
function team(name: string, ids: Record<Position, string>) {
  const r = emptyRoster();
  for (const [pos, id] of Object.entries(ids)) {
    const p = byId.get(id);
    if (!p) throw new Error(`missing ${id}`);
    r[pos as Position] = p;
  }
  return buildTeam(name, r, SAMPLE_DATASET.leagueContext);
}

// The user's 77-5 draft.
const USER = team('77-5 team', {
  PG: 'stephen-curry-2010s-gsw',
  SG: 'michael-jordan-1990s-chi',
  SF: 'kevin-durant-2010s-okc',
  PF: 'tim-duncan-2000s-sas',
  C: 'nikola-jokic-2020s-den',
});

// A fit-optimized superteam (no usage overload, max spacing).
const OPTIMAL = team('fit-optimized', {
  PG: 'stephen-curry-2010s-gsw',
  SG: 'klay-thompson-2010s-gsw',
  SF: 'kevin-durant-2010s-gsw',
  PF: 'giannis-antetokounmpo-2020s-mil',
  C: 'nikola-jokic-2020s-den',
});

for (const t of [USER, OPTIMAL]) {
  const mc = monteCarloMatchup(t, leagueAverageTeam(), 777, 3000);
  let perfect = 0;
  let best = 0;
  let totalWins = 0;
  const seasons = 1500;
  for (let s = 0; s < seasons; s++) {
    const r = simulateSeason(t, s + 1);
    totalWins += r.wins;
    if (r.wins === 82) perfect++;
    if (r.wins > best) best = r.wins;
  }
  console.log(
    `${t.name.padEnd(15)} game win%=${(mc.aWinPct * 100).toFixed(1)} avg margin=${(mc.avgPtsA - mc.avgPtsB).toFixed(1)} | avg wins=${(totalWins / seasons).toFixed(1)} best=${best} 82-0 rate=${((perfect / seasons) * 100).toFixed(2)}%`,
  );
}
