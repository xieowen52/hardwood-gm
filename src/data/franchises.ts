/**
 * The 30 modern NBA franchises, identified by their common stat-site codes.
 *
 * Deliberately NO team nicknames, logos, or wordmarks anywhere — teams are
 * referred to by decade + city ("1990s Chicago") with a generic color swatch.
 * `nameByDecade` handles relocations so e.g. OKC reads "Seattle" in the 1990s.
 * When two franchises resolve to the same city name (the Los Angeles pair),
 * the display label appends the franchise code to disambiguate.
 */
import type { Decade } from './types';

export interface Franchise {
  /** Modern franchise code (Basketball-Reference style), e.g. "LAL". */
  id: string;
  /** Current city name. */
  name: string;
  /** City overrides for decades before a relocation. */
  nameByDecade?: Partial<Record<Decade, string>>;
  /** [primary, secondary] hex colors for the generic swatch. */
  colors: [string, string];
}

export const FRANCHISES: readonly Franchise[] = [
  { id: 'ATL', name: 'Atlanta', nameByDecade: { 1950: 'St. Louis', 1960: 'St. Louis' }, colors: ['#C8102E', '#FDB927'] },
  { id: 'BOS', name: 'Boston', colors: ['#007A33', '#FFFFFF'] },
  { id: 'BRK', name: 'Brooklyn', nameByDecade: { 1970: 'New York', 1980: 'New Jersey', 1990: 'New Jersey', 2000: 'New Jersey' }, colors: ['#1A1A1A', '#FFFFFF'] },
  { id: 'CHA', name: 'Charlotte', colors: ['#00788C', '#1D1160'] },
  { id: 'CHI', name: 'Chicago', colors: ['#CE1141', '#1A1A1A'] },
  { id: 'CLE', name: 'Cleveland', colors: ['#860038', '#FDBB30'] },
  { id: 'DAL', name: 'Dallas', colors: ['#00538C', '#B8C4CA'] },
  { id: 'DEN', name: 'Denver', colors: ['#0E2240', '#FEC524'] },
  { id: 'DET', name: 'Detroit', nameByDecade: { 1950: 'Fort Wayne' }, colors: ['#C8102E', '#1D42BA'] },
  { id: 'GSW', name: 'Golden State', nameByDecade: { 1950: 'Philadelphia', 1960: 'San Francisco', 1970: 'Golden State' }, colors: ['#1D428A', '#FFC72C'] },
  { id: 'HOU', name: 'Houston', nameByDecade: { 1960: 'San Diego', 1970: 'Houston' }, colors: ['#CE1141', '#C4CED4'] },
  { id: 'IND', name: 'Indiana', colors: ['#002D62', '#FDBB30'] },
  { id: 'LAC', name: 'Los Angeles', nameByDecade: { 1970: 'Buffalo', 1980: 'San Diego' }, colors: ['#C8102E', '#1D428A'] },
  { id: 'LAL', name: 'Los Angeles', nameByDecade: { 1950: 'Minneapolis' }, colors: ['#552583', '#FDB927'] },
  { id: 'MEM', name: 'Memphis', nameByDecade: { 1990: 'Vancouver', 2000: 'Memphis' }, colors: ['#5D76A9', '#12173F'] },
  { id: 'MIA', name: 'Miami', colors: ['#98002E', '#F9A01B'] },
  { id: 'MIL', name: 'Milwaukee', colors: ['#00471B', '#EEE1C6'] },
  { id: 'MIN', name: 'Minnesota', colors: ['#0C2340', '#236192'] },
  { id: 'NOP', name: 'New Orleans', nameByDecade: { 2000: 'New Orleans' }, colors: ['#0C2340', '#C8102E'] },
  { id: 'NYK', name: 'New York', colors: ['#006BB6', '#F58426'] },
  { id: 'OKC', name: 'Oklahoma City', nameByDecade: { 1960: 'Seattle', 1970: 'Seattle', 1980: 'Seattle', 1990: 'Seattle', 2000: 'Seattle' }, colors: ['#007AC1', '#EF3B24'] },
  { id: 'ORL', name: 'Orlando', colors: ['#0077C0', '#C4CED4'] },
  { id: 'PHI', name: 'Philadelphia', nameByDecade: { 1950: 'Syracuse', 1960: 'Philadelphia' }, colors: ['#006BB6', '#ED174C'] },
  { id: 'PHO', name: 'Phoenix', colors: ['#1D1160', '#E56020'] },
  { id: 'POR', name: 'Portland', colors: ['#E03A3E', '#1A1A1A'] },
  { id: 'SAC', name: 'Sacramento', nameByDecade: { 1950: 'Rochester', 1960: 'Cincinnati', 1970: 'Kansas City', 1980: 'Kansas City' }, colors: ['#5A2D81', '#63727A'] },
  { id: 'SAS', name: 'San Antonio', colors: ['#1A1A1A', '#C4CED4'] },
  { id: 'TOR', name: 'Toronto', colors: ['#CE1141', '#1A1A1A'] },
  { id: 'UTA', name: 'Utah', nameByDecade: { 1970: 'New Orleans' }, colors: ['#002B5C', '#F9A01B'] },
  { id: 'WAS', name: 'Washington', nameByDecade: { 1960: 'Baltimore', 1970: 'Washington' }, colors: ['#002B5C', '#E31837'] },
];

const byId = new Map(FRANCHISES.map((f) => [f.id, f]));

export function getFranchise(id: string): Franchise | undefined {
  return byId.get(id);
}

/** City name for a franchise in a given decade, e.g. ("OKC", 1990) → "Seattle". */
export function franchiseCity(id: string, decade: Decade): string {
  const f = byId.get(id);
  if (!f) return id;
  return f.nameByDecade?.[decade] ?? f.name;
}

/**
 * Display label for a franchise-decade, e.g. "1990s Chicago".
 * Appends the franchise code when two franchises share the resolved city
 * name in that decade (e.g. "2010s Los Angeles (LAL)").
 */
export function comboDisplayName(franchiseId: string, decade: Decade): string {
  const city = franchiseCity(franchiseId, decade);
  const ambiguous = FRANCHISES.some(
    (f) => f.id !== franchiseId && franchiseCity(f.id, decade) === city,
  );
  return `${decade}s ${city}${ambiguous ? ` (${franchiseId})` : ''}`;
}
