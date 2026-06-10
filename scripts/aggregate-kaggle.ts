/**
 * aggregate-kaggle.ts — roll the Kaggle NBA game-level box scores
 * (box-score-stats/PlayerStatistics.csv, ~1.7M rows, 1946→today) up to
 * per-season per-player-per-team rows in the CSV format scripts/ingest.ts
 * accepts. Run the two-step pipeline:
 *
 *   npx tsx scripts/aggregate-kaggle.ts             # → box-score-stats/seasons.csv
 *   npm run ingest -- box-score-stats/seasons.csv   # → src/data/generated/players.json
 *
 * Inputs (Kaggle "NBA Database" layout):
 *   PlayerStatistics.csv — one row per player per game (streamed)
 *   Players.csv          — personId → guard/forward/center flags
 *   TeamHistories.csv    — teamId → franchise abbrev history
 *
 * Decisions:
 *   - Regular-season games only (no playoffs/preseason/cup knockouts/all-star).
 *   - A game belongs to the season of its END year: months Oct-Dec → year+1,
 *     except Jul-Oct 2020 (the bubble restart) → 2020.
 *   - Teams are keyed by stable Kaggle teamId; only the 30 active franchises
 *     are kept (defunct 1940s-50s clubs are counted and dropped).
 *   - Positions come from the Players.csv flags, refined by per-season
 *     assist/rebound rates (a 5-apg guard lists PG first), falling back to
 *     the startingPosition column (G/F/C), then to box-profile heuristics.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline';

const DIR = path.join(process.cwd(), 'box-score-stats');
const INPUT = path.join(DIR, 'PlayerStatistics.csv');
const OUT = path.join(DIR, 'seasons.csv');

// ── tiny CSV line parser (handles quoted fields) ──────────────────────────
function parseLine(line: string): string[] {
  const out: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { out.push(field); field = ''; }
    else field += ch;
  }
  out.push(field);
  return out;
}

function readCsv(file: string): { header: string[]; rows: string[][] } {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  const header = parseLine(lines[0] ?? '');
  return { header, rows: lines.slice(1).map(parseLine) };
}

// ── team mapping: keep only the 30 active franchises ──────────────────────
function loadTeams(): Map<string, string> {
  const { header, rows } = readCsv(path.join(DIR, 'TeamHistories.csv'));
  const col = (name: string) => header.indexOf(name);
  const id = col('teamId');
  const abbrev = col('teamAbbrev');
  const till = col('seasonActiveTill');
  const latest = new Map<string, { abbrev: string; till: number }>();
  for (const row of rows) {
    const teamId = row[id] ?? '';
    const t = Number(row[till] ?? 0);
    const prev = latest.get(teamId);
    if (!prev || t > prev.till) {
      latest.set(teamId, { abbrev: (row[abbrev] ?? '').trim(), till: t });
    }
  }
  const map = new Map<string, string>();
  for (const [teamId, { abbrev: code, till: t }] of latest) {
    if (t >= 2024) map.set(teamId, code); // active franchises only
  }
  return map;
}

// ── player position flags ──────────────────────────────────────────────────
interface Flags { g: boolean; f: boolean; c: boolean }

function loadFlags(): Map<string, Flags> {
  const { header, rows } = readCsv(path.join(DIR, 'Players.csv'));
  const col = (name: string) => header.indexOf(name);
  const id = col('personId');
  const g = col('guard');
  const f = col('forward');
  const c = col('center');
  const map = new Map<string, Flags>();
  for (const row of rows) {
    map.set(row[id] ?? '', {
      g: row[g] === '1',
      f: row[f] === '1',
      c: row[c] === '1',
    });
  }
  return map;
}

// ── season bucketing ───────────────────────────────────────────────────────
function seasonOf(date: string): number | null {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(5, 7));
  if (!Number.isInteger(year) || year < 1946) return null;
  // 2019-20 bubble restart: Jul-Oct 2020 still belongs to the 2020 season.
  if (year === 2020 && month >= 7 && month <= 10) return 2020;
  return month >= 10 ? year + 1 : year;
}

// ── aggregation ────────────────────────────────────────────────────────────
interface Acc {
  name: string;
  personId: string;
  season: number;
  team: string;
  g: number;
  mp: number; hasMp: boolean;
  pts: number; trb: number; ast: number;
  stl: number; blk: number; tov: number; hasDef: boolean; hasTov: boolean;
  fga: number; fgm: number; tpa: number; tpm: number; fta: number; ftm: number;
  startPos: Record<'G' | 'F' | 'C', number>;
}

function positionsFor(acc: Acc, flags: Flags | undefined): string {
  const apg = acc.ast / acc.g;
  const rpg = acc.trb / acc.g;
  let g = flags?.g ?? false;
  let f = flags?.f ?? false;
  let c = flags?.c ?? false;
  if (!g && !f && !c) {
    // Fall back to startingPosition counts, then box profile.
    const top = (Object.entries(acc.startPos) as ['G' | 'F' | 'C', number][])
      .sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] > 0) {
      g = top[0] === 'G';
      f = top[0] === 'F';
      c = top[0] === 'C';
    } else if (rpg >= 9) c = true;
    else if (apg >= 4) g = true;
    else f = true;
  }
  if (g && f) return 'SG-SF';
  if (f && c) return 'PF-C';
  if (g && c) return 'SG';
  if (g) return apg >= 5 ? 'PG-SG' : apg >= 2.5 ? 'SG-PG' : 'SG';
  if (c) return rpg >= 9 ? 'C' : 'C-PF';
  return rpg >= 8 ? 'PF-SF' : 'SF-PF';
}

async function main(): Promise<void> {
  if (!fs.existsSync(INPUT)) {
    console.error(`aggregate-kaggle: ${INPUT} not found`);
    process.exit(1);
  }
  const teams = loadTeams();
  const flags = loadFlags();
  console.log(`aggregate-kaggle: ${teams.size} active franchises, ${flags.size} players known`);

  const rl = readline.createInterface({
    input: fs.createReadStream(INPUT),
    crlfDelay: Infinity,
  });

  let header: string[] | null = null;
  let col: Record<string, number> = {};
  const acc = new Map<string, Acc>();
  let rows = 0;
  let kept = 0;
  let defunct = 0;
  let nonRegular = 0;
  let dnp = 0;

  for await (const line of rl) {
    if (header === null) {
      header = parseLine(line);
      header.forEach((h, i) => (col[h] = i));
      continue;
    }
    rows++;
    const f = parseLine(line);
    const get = (name: string) => f[col[name] ?? -1] ?? '';

    if (get('gameType') !== 'Regular Season') { nonRegular++; continue; }
    const season = seasonOf(get('gameDate') || get('gameDateTimeEst'));
    if (season === null) continue;
    const team = teams.get(get('playerteamId'));
    if (!team) { defunct++; continue; }

    const num = (name: string): number => {
      const v = get(name);
      return v === '' ? 0 : Number(v) || 0;
    };
    const minutes = num('numMinutes');
    const pts = num('points');
    const fga = num('fieldGoalsAttempted');
    const trb = num('reboundsTotal');
    const ast = num('assists');
    const fta = num('freeThrowsAttempted');
    if (minutes <= 0 && pts === 0 && fga === 0 && trb === 0 && ast === 0 && fta === 0) {
      dnp++; // did not play
      continue;
    }

    const personId = get('personId');
    const key = `${personId}|${team}|${season}`;
    let a = acc.get(key);
    if (!a) {
      a = {
        name: `${get('firstName')} ${get('lastName')}`.trim(),
        personId, season, team,
        g: 0, mp: 0, hasMp: false,
        pts: 0, trb: 0, ast: 0, stl: 0, blk: 0, tov: 0, hasDef: false, hasTov: false,
        fga: 0, fgm: 0, tpa: 0, tpm: 0, fta: 0, ftm: 0,
        startPos: { G: 0, F: 0, C: 0 },
      };
      acc.set(key, a);
    }
    a.g++;
    a.mp += minutes;
    if (minutes > 0) a.hasMp = true;
    a.pts += pts;
    a.trb += trb;
    a.ast += ast;
    if (get('steals') !== '' || get('blocks') !== '') {
      a.hasDef = true;
      a.stl += num('steals');
      a.blk += num('blocks');
    }
    if (get('turnovers') !== '') {
      a.hasTov = true;
      a.tov += num('turnovers');
    }
    a.fga += fga;
    a.fgm += num('fieldGoalsMade');
    a.tpa += num('threePointersAttempted');
    a.tpm += num('threePointersMade');
    a.fta += fta;
    a.ftm += num('freeThrowsMade');
    const sp = get('startingPosition').trim().toUpperCase();
    if (sp === 'G' || sp === 'F' || sp === 'C') a.startPos[sp]++;
    kept++;

    if (rows % 250000 === 0) console.log(`  …${rows.toLocaleString()} rows`);
  }

  // Emit season rows.
  const lines = ['player,season,team,pos,g,mp,pts,trb,ast,stl,blk,fga,fg,3pa,3p,fta,ft,tov'];
  const fmt = (v: number) => (Math.round(v * 10) / 10).toString();
  for (const a of acc.values()) {
    const pos = positionsFor(a, flags.get(a.personId));
    const name = a.name.includes(',') ? `"${a.name}"` : a.name;
    lines.push(
      [
        name, a.season, a.team, pos, a.g,
        a.hasMp ? fmt(a.mp) : '',
        a.pts, a.trb, a.ast,
        a.hasDef ? a.stl : '', a.hasDef ? a.blk : '',
        a.fga, a.fgm, a.tpa, a.tpm, a.fta, a.ftm,
        a.hasTov ? a.tov : '',
      ].join(','),
    );
  }
  fs.writeFileSync(OUT, lines.join('\n'));

  console.log(`aggregate-kaggle: ${rows.toLocaleString()} game rows read`);
  console.log(`  kept ${kept.toLocaleString()} | non-regular-season ${nonRegular.toLocaleString()} | DNP ${dnp.toLocaleString()} | defunct-franchise ${defunct.toLocaleString()}`);
  console.log(`  ${acc.size.toLocaleString()} player-team-season rows → ${OUT}`);
  console.log('next: npm run ingest -- box-score-stats/seasons.csv');
}

void main();
