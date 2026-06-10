/**
 * ingest.ts — convert a Basketball-Reference-style per-season per-player CSV
 * into the app's dataset format (src/data/generated/players.json).
 *
 * Usage:
 *   npm run ingest -- path/to/stats.csv [--out src/data/generated/players.json]
 *                                       [--min-games 100]
 *                                       [--format auto|totals|per-game]
 *
 * EXPECTED CSV COLUMNS (header names are case-insensitive; common aliases in
 * parentheses; column order doesn't matter; extra columns are ignored):
 *
 *   player                — player name                                [required]
 *   season (year)         — "1996-97", "1996-1997", or end year "1997" [required]
 *   team (tm, team_id)    — franchise code, e.g. CHI, LAL; historical
 *                           codes (e.g. SEA, NJN, VAN) are mapped to
 *                           modern franchises; "TOT" rows are skipped   [required]
 *   pos                   — position(s), e.g. "SG" or "SG-SF"          [required]
 *   g (gp)                — games played                               [required]
 *   mp                    — minutes (totals or per-game, see --format)
 *   pts, trb (reb), ast   — points / rebounds / assists
 *   stl, blk, tov         — optional; default 0 (not recorded pre-1974/1978)
 *   fga, fg               — field goal attempts / makes
 *   3pa, 3p (fg3a, fg3)   — optional; default 0 (no 3-point line pre-1980)
 *   fta, ft               — free throw attempts / makes
 *   usg_pct (usg%)        — optional; estimated from box stats if missing
 *
 * VALUES: totals or per-game both work. --format auto (default) inspects the
 * data: if the average of pts/g exceeds 65 the file is treated as totals.
 *
 * WHAT IT PRODUCES
 * - Player entries grouped by franchise + decade. A season belongs to the
 *   decade of its END year (1989-90 → the 1990s). A player gets an entry for
 *   every franchise-decade where they played >= --min-games games (default
 *   100); their stat line is per-game averages over those seasons only
 *   (weighted by games).
 * - Per-season league context (pace, ppg, shooting averages), aggregated from
 *   the same rows. With player rows only, team-level rates are estimated from
 *   per-minute aggregates: a team plays 240 player-minutes per game, so
 *   e.g. league PPG = total points / total minutes * 240. Pace is estimated
 *   as possessions = FGA + 0.44*FTA + TOV (no offensive-rebound term — ORB
 *   isn't a required column — so it runs slightly hot, consistently across
 *   eras, which is what era normalization needs).
 * - Usage, when usg_pct is missing, is estimated the standard way:
 *   USG% = 100 * (FGA + 0.44*FTA + TOV) * (240/5) / (MP * teamPossPerGame).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

// ---------------------------------------------------------------------------
// Types duplicated from src/data/types.ts (kept dependency-free so the script
// runs with plain tsx and never drags app code into Node).
// ---------------------------------------------------------------------------

type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

interface StatLine {
  mp: number; pts: number; trb: number; ast: number; stl: number; blk: number;
  tov: number; fga: number; fgPct: number; tpa: number; tpPct: number;
  fta: number; ftPct: number;
}

interface PlayerEntry {
  id: string; name: string; franchiseId: string; decade: number;
  positions: Position[]; from: number; to: number; games: number;
  stats: StatLine; usagePct: number; usageEstimated?: boolean;
}

interface LeagueSeasonContext {
  season: number; pace: number; ppg: number; fgPct: number; tpPct: number;
  ftPct: number; tpaPerGame: number; ftaPerGame: number;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface Options {
  input: string;
  out: string;
  minGames: number;
  format: 'auto' | 'totals' | 'per-game';
}

function parseArgs(argv: string[]): Options {
  const opts: Options = {
    input: '',
    out: 'src/data/generated/players.json',
    minGames: 100,
    format: 'auto',
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--out') opts.out = argv[++i] ?? opts.out;
    else if (arg === '--min-games') opts.minGames = Number(argv[++i] ?? opts.minGames);
    else if (arg === '--format') {
      const v = argv[++i];
      if (v === 'totals' || v === 'per-game' || v === 'auto') opts.format = v;
      else fail(`--format must be auto|totals|per-game, got "${v}"`);
    } else if (arg && !arg.startsWith('--')) {
      if (opts.input) fail(`unexpected extra argument "${arg}"`);
      opts.input = arg;
    } else {
      fail(`unknown flag "${arg}"`);
    }
  }
  if (!opts.input) fail('usage: npm run ingest -- <stats.csv> [--out file] [--min-games N] [--format auto|totals|per-game]');
  if (!Number.isFinite(opts.minGames) || opts.minGames < 1) fail('--min-games must be a positive number');
  return opts;
}

function fail(message: string): never {
  console.error(`ingest: ${message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// CSV parsing (handles quoted fields with commas and escaped quotes)
// ---------------------------------------------------------------------------

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1 || (row[0] ?? '').trim() !== '') rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.length > 1 || (row[0] ?? '').trim() !== '') rows.push(row);
  return rows;
}

// ---------------------------------------------------------------------------
// Column resolution
// ---------------------------------------------------------------------------

const COLUMN_ALIASES: Record<string, string[]> = {
  player: ['player', 'name', 'player_name'],
  season: ['season', 'year', 'season_end', 'yr'],
  team: ['team', 'tm', 'team_id', 'team_abbreviation'],
  pos: ['pos', 'position'],
  g: ['g', 'gp', 'games'],
  mp: ['mp', 'min', 'minutes', 'mpg'],
  pts: ['pts', 'points'],
  trb: ['trb', 'reb', 'rebounds', 'tot_reb'],
  ast: ['ast', 'assists'],
  stl: ['stl', 'steals'],
  blk: ['blk', 'blocks'],
  tov: ['tov', 'to', 'turnovers'],
  fga: ['fga'],
  fg: ['fg', 'fgm'],
  tpa: ['3pa', 'fg3a', 'x3pa', 'tpa', '3p_att'],
  tp: ['3p', 'fg3', 'x3p', 'tpm', '3pm'],
  fta: ['fta'],
  ft: ['ft', 'ftm'],
  usg: ['usg_pct', 'usg%', 'usg', 'usage'],
};

/** Columns the script refuses to run without. Everything else is optional. */
const REQUIRED = ['player', 'season', 'team', 'pos', 'g', 'pts', 'trb', 'ast', 'fga', 'fg', 'fta', 'ft'];

function resolveColumns(header: string[]): Map<string, number> {
  const normalized = header.map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  const map = new Map<string, number>();
  for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      const idx = normalized.indexOf(alias);
      if (idx !== -1) { map.set(canonical, idx); break; }
    }
  }
  const missing = REQUIRED.filter((c) => !map.has(c));
  if (missing.length > 0) {
    fail(`missing required column(s): ${missing.join(', ')}\n  found header: ${normalized.join(', ')}`);
  }
  for (const optional of ['mp', 'stl', 'blk', 'tov', 'tpa', 'tp', 'usg'] as const) {
    if (!map.has(optional)) {
      console.warn(`ingest: column "${optional}" not found — values will be defaulted/estimated`);
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Franchise code mapping (historical → modern)
// ---------------------------------------------------------------------------

const MODERN_CODES = new Set([
  'ATL', 'BOS', 'BRK', 'CHA', 'CHI', 'CLE', 'DAL', 'DEN', 'DET', 'GSW',
  'HOU', 'IND', 'LAC', 'LAL', 'MEM', 'MIA', 'MIL', 'MIN', 'NOP', 'NYK',
  'OKC', 'ORL', 'PHI', 'PHO', 'POR', 'SAC', 'SAS', 'TOR', 'UTA', 'WAS',
]);

const HISTORICAL_CODES: Record<string, string> = {
  // Hawks: Tri-Cities/Milwaukee/St. Louis
  TRI: 'ATL', MLH: 'ATL', STL: 'ATL',
  // Nets: New York/New Jersey/Brooklyn
  NYN: 'BRK', NJN: 'BRK', BKN: 'BRK',
  // Hornets naming shuffle
  CHH: 'CHA', CHO: 'CHA',
  // Warriors: Philadelphia/San Francisco
  PHW: 'GSW', SFW: 'GSW',
  // Rockets: San Diego
  SDR: 'HOU',
  // Clippers: Buffalo/San Diego
  BUF: 'LAC', SDC: 'LAC',
  // Grizzlies: Vancouver
  VAN: 'MEM',
  // Pelicans: New Orleans/Oklahoma City interlude
  NOH: 'NOP', NOK: 'NOP',
  // Thunder: Seattle
  SEA: 'OKC',
  // 76ers: Syracuse
  SYR: 'PHI',
  // Suns alternate code
  PHX: 'PHO',
  // Kings: Rochester/Cincinnati/Kansas City
  ROC: 'SAC', CIN: 'SAC', KCO: 'SAC', KCK: 'SAC',
  // Jazz: New Orleans
  NOJ: 'UTA',
  // Wizards: Chicago/Baltimore/Capital/Washington Bullets
  CHP: 'WAS', CHZ: 'WAS', BAL: 'WAS', CAP: 'WAS', WSB: 'WAS',
  // Pistons: Fort Wayne
  FTW: 'DET',
  // Lakers: Minneapolis
  MNL: 'LAL',
};

function resolveFranchise(code: string): string | undefined {
  const c = code.trim().toUpperCase();
  if (MODERN_CODES.has(c)) return c;
  return HISTORICAL_CODES[c];
}

// ---------------------------------------------------------------------------
// Row model
// ---------------------------------------------------------------------------

/** One CSV row converted to season TOTALS (per-game inputs are multiplied by g). */
interface SeasonRow {
  player: string;
  season: number; // end year
  franchiseId: string;
  positions: Position[];
  g: number;
  mp: number; pts: number; trb: number; ast: number; stl: number; blk: number;
  tov: number; fga: number; fg: number; tpa: number; tp: number; fta: number; ft: number;
  usg: number | null;
  hasMp: boolean;
  hasTov: boolean;
}

function parseSeason(raw: string): number | null {
  const s = raw.trim();
  // "1996-97" / "1996-1997" → 1997
  const range = /^(\d{4})\s*[-–/]\s*(\d{2,4})$/.exec(s);
  if (range && range[1]) {
    const start = Number(range[1]);
    const tail = range[2] ?? '';
    const end = tail.length === 4 ? Number(tail) : Math.floor(start / 100) * 100 + Number(tail);
    return end >= start ? end : end + 100; // handles 1999-00 → 2000
  }
  const year = Number(s);
  if (Number.isInteger(year) && year >= 1947 && year <= 2100) return year;
  return null;
}

const VALID_POSITIONS = new Set<Position>(['PG', 'SG', 'SF', 'PF', 'C']);

function parsePositions(raw: string): Position[] {
  const out: Position[] = [];
  for (const part of raw.trim().toUpperCase().split(/[-/,\s]+/)) {
    // Tolerate old-style codes: G → SG, F → SF, G-F etc.
    const mapped = part === 'G' ? 'SG' : part === 'F' ? 'SF' : part;
    if (VALID_POSITIONS.has(mapped as Position) && !out.includes(mapped as Position)) {
      out.push(mapped as Position);
    }
  }
  return out;
}

function num(fields: string[], idx: number | undefined): number | null {
  if (idx === undefined) return null;
  const raw = (fields[idx] ?? '').trim();
  if (raw === '') return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const opts = parseArgs(process.argv.slice(2));
  const text = fs.readFileSync(opts.input, 'utf8');
  const rows = parseCsv(text);
  const header = rows[0];
  if (!header || rows.length < 2) fail('CSV has no data rows');
  const cols = resolveColumns(header);

  // First pass: raw parse, keeping per-game vs totals undecided.
  interface RawRow { fields: string[]; g: number; pts: number }
  const rawRows: RawRow[] = [];
  let skipped = 0;
  for (let r = 1; r < rows.length; r++) {
    const fields = rows[r];
    if (!fields) continue;
    const g = num(fields, cols.get('g'));
    const pts = num(fields, cols.get('pts'));
    if (g === null || g <= 0 || pts === null) { skipped++; continue; }
    rawRows.push({ fields, g, pts });
  }

  // Decide totals vs per-game.
  let totals: boolean;
  if (opts.format === 'auto') {
    const avgPts = rawRows.reduce((s, r) => s + r.pts / r.g, 0) / Math.max(rawRows.length, 1);
    // If values were per-game already, pts/g would be a tiny number (avg PPG
    // divided by games again). Totals files yield pts/g ≈ real PPG (5-40);
    // per-game files yield pts/g ≈ 0.1-0.5. Split at 2.
    totals = avgPts > 2;
    console.log(`ingest: --format auto detected ${totals ? 'season totals' : 'per-game values'}`);
  } else {
    totals = opts.format === 'totals';
  }

  // Second pass: build season rows (as totals).
  const seasonRows: SeasonRow[] = [];
  for (const { fields, g } of rawRows) {
    const player = (fields[cols.get('player') ?? -1] ?? '').trim();
    const season = parseSeason(fields[cols.get('season') ?? -1] ?? '');
    const teamRaw = (fields[cols.get('team') ?? -1] ?? '').trim().toUpperCase();
    if (!player || season === null) { skipped++; continue; }
    if (teamRaw === 'TOT' || teamRaw === '2TM' || teamRaw === '3TM') continue; // combined rows for traded players; per-team rows carry the data
    const franchiseId = resolveFranchise(teamRaw);
    if (!franchiseId) {
      console.warn(`ingest: unknown team code "${teamRaw}" (${player}, ${season}) — row skipped`);
      skipped++;
      continue;
    }
    const positions = parsePositions(fields[cols.get('pos') ?? -1] ?? '');
    if (positions.length === 0) { skipped++; continue; }

    const scale = totals ? 1 : g;
    const get = (key: string): number | null => num(fields, cols.get(key));
    const mp = get('mp');
    const tov = get('tov');
    seasonRows.push({
      player, season, franchiseId, positions, g,
      mp: (mp ?? 0) * scale,
      hasMp: mp !== null,
      pts: (get('pts') ?? 0) * scale,
      trb: (get('trb') ?? 0) * scale,
      ast: (get('ast') ?? 0) * scale,
      stl: (get('stl') ?? 0) * scale,
      blk: (get('blk') ?? 0) * scale,
      tov: (tov ?? 0) * scale,
      hasTov: tov !== null,
      fga: (get('fga') ?? 0) * scale,
      fg: (get('fg') ?? 0) * scale,
      tpa: (get('tpa') ?? 0) * scale,
      tp: (get('tp') ?? 0) * scale,
      fta: (get('fta') ?? 0) * scale,
      ft: (get('ft') ?? 0) * scale,
      usg: get('usg'),
    });
  }
  if (seasonRows.length === 0) fail('no usable rows after parsing');

  // ── League context per season ────────────────────────────────────────────
  // Team-level rates estimated from player aggregates: 240 player-minutes per
  // team-game. When MP is missing entirely, fall back to 5*48 minutes per
  // player-game (overstates bench minutes but keeps ratios usable).
  const bySeason = new Map<number, SeasonRow[]>();
  for (const row of seasonRows) {
    const list = bySeason.get(row.season);
    if (list) list.push(row);
    else bySeason.set(row.season, [row]);
  }
  const leagueContext: LeagueSeasonContext[] = [];
  for (const [season, list] of [...bySeason.entries()].sort((a, b) => a[0] - b[0])) {
    const sum = (f: (r: SeasonRow) => number) => list.reduce((s, r) => s + f(r), 0);
    const mp = sum((r) => (r.hasMp ? r.mp : r.g * 24)); // 24 = 240 team-minutes / ~10 rotation players
    const minutes = mp > 0 ? mp : sum((r) => r.g) * 24;
    const perTeamGame = (total: number) => (total / minutes) * 240;
    const fga = sum((r) => r.fga);
    const fta = sum((r) => r.fta);
    const tpa = sum((r) => r.tpa);
    const tov = sum((r) => r.tov);
    // Pre-1978 files have no turnovers; estimate possessions without them and
    // add a flat 16% — roughly the league turnover rate of that era.
    const anyTov = list.some((r) => r.hasTov);
    const possRaw = fga + 0.44 * fta + (anyTov ? tov : (fga + 0.44 * fta) * 0.16);
    leagueContext.push({
      season,
      pace: round(perTeamGame(possRaw), 1),
      ppg: round(perTeamGame(sum((r) => r.pts)), 1),
      fgPct: ratio(sum((r) => r.fg), fga),
      tpPct: ratio(sum((r) => r.tp), tpa),
      ftPct: ratio(sum((r) => r.ft), fta),
      tpaPerGame: round(perTeamGame(tpa), 1),
      ftaPerGame: round(perTeamGame(fta), 1),
    });
  }
  const paceBySeason = new Map(leagueContext.map((c) => [c.season, c.pace]));

  // ── Player entries per franchise + decade ────────────────────────────────
  const groups = new Map<string, SeasonRow[]>();
  for (const row of seasonRows) {
    const decade = Math.floor(row.season / 10) * 10;
    const key = `${row.player}|${row.franchiseId}|${decade}`;
    const list = groups.get(key);
    if (list) list.push(row);
    else groups.set(key, [row]);
  }

  const players: PlayerEntry[] = [];
  const usedIds = new Set<string>();
  for (const [key, list] of groups) {
    const games = list.reduce((s, r) => s + r.g, 0);
    if (games < opts.minGames) continue;
    const first = list[0];
    if (!first) continue;
    const [name, franchiseId] = key.split('|') as [string, string, string];
    const decade = Math.floor(first.season / 10) * 10;

    const sum = (f: (r: SeasonRow) => number) => list.reduce((s, r) => s + f(r), 0);
    const per = (total: number) => round(total / games, 1);
    const fga = sum((r) => r.fga);
    const tpa = sum((r) => r.tpa);
    const fta = sum((r) => r.fta);
    const mp = sum((r) => (r.hasMp ? r.mp : r.g * 30));
    const tov = sum((r) => r.tov);

    // Positions: rank by games played at each listed position.
    const posGames = new Map<Position, number>();
    for (const r of list) {
      for (let i = 0; i < r.positions.length; i++) {
        const pos = r.positions[i];
        if (!pos) continue;
        // Primary listing counts full games, secondary half.
        posGames.set(pos, (posGames.get(pos) ?? 0) + r.g * (i === 0 ? 1 : 0.5));
      }
    }
    const positions = [...posGames.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([pos]) => pos);

    // Usage: games-weighted source value when present, else the standard
    // estimate vs. that era's pace (see file header).
    const usgRows = list.filter((r) => r.usg !== null);
    let usagePct: number;
    let usageEstimated = false;
    if (usgRows.length > 0) {
      usagePct = round(
        usgRows.reduce((s, r) => s + (r.usg ?? 0) * r.g, 0) / usgRows.reduce((s, r) => s + r.g, 0),
        1,
      );
    } else {
      usageEstimated = true;
      const seasonsPace =
        list.reduce((s, r) => s + (paceBySeason.get(r.season) ?? 95) * r.g, 0) / games;
      const possUsed = fga + 0.44 * fta + tov;
      const mpg = mp / games;
      usagePct = round(Math.min(50, Math.max(5, (100 * (possUsed / games) * 48) / (mpg * seasonsPace))), 1);
    }

    const seasons = list.map((r) => r.season);
    const baseId = `${slugify(name)}-${decade}s-${franchiseId.toLowerCase()}`;
    let id = baseId;
    for (let n = 2; usedIds.has(id); n++) id = `${baseId}-${n}`; // distinct same-named players
    usedIds.add(id);

    players.push({
      id,
      name,
      franchiseId,
      decade,
      positions: positions.length > 0 ? positions : ['SF'],
      from: Math.min(...seasons),
      to: Math.max(...seasons),
      games,
      stats: {
        mp: per(mp), pts: per(sum((r) => r.pts)), trb: per(sum((r) => r.trb)),
        ast: per(sum((r) => r.ast)), stl: per(sum((r) => r.stl)),
        blk: per(sum((r) => r.blk)), tov: per(tov),
        fga: per(fga), fgPct: ratio(sum((r) => r.fg), fga),
        tpa: per(tpa), tpPct: ratio(sum((r) => r.tp), tpa),
        fta: per(fta), ftPct: ratio(sum((r) => r.ft), fta),
      },
      usagePct,
      ...(usageEstimated ? { usageEstimated: true } : {}),
    });
  }

  players.sort((a, b) => a.id.localeCompare(b.id));

  const dataset = {
    source: 'ingested' as const,
    label: `Ingested from ${path.basename(opts.input)} (min ${opts.minGames} games per franchise-decade)`,
    generatedAt: new Date().toISOString(),
    players,
    leagueContext,
  };

  // Summary: combos with at least 8 players are wheel-eligible (see
  // src/data/combos.ts WHEEL_CONFIG — keep these numbers in sync).
  const comboCounts = new Map<string, number>();
  for (const p of players) {
    const k = `${p.decade}s ${p.franchiseId}`;
    comboCounts.set(k, (comboCounts.get(k) ?? 0) + 1);
  }
  const eligible = [...comboCounts.entries()].filter(([, n]) => n >= 8);

  fs.mkdirSync(path.dirname(opts.out), { recursive: true });
  fs.writeFileSync(opts.out, JSON.stringify(dataset, null, 2));

  console.log(`ingest: ${seasonRows.length} season rows parsed (${skipped} skipped)`);
  console.log(`ingest: ${players.length} player entries across ${comboCounts.size} franchise-decade combos`);
  console.log(`ingest: ${eligible.length} combos have >= 8 players and will appear on the wheel`);
  if (eligible.length === 0) {
    console.warn('ingest: WARNING — no combo reaches 8 players; the app will fall back to sample data. Lower --min-games or supply more seasons.');
  }
  console.log(`ingest: wrote ${opts.out}`);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function round(v: number, places: number): number {
  const f = 10 ** places;
  return Math.round(v * f) / f;
}

function ratio(makes: number, attempts: number): number {
  return attempts > 0 ? round(makes / attempts, 3) : 0;
}

main();
