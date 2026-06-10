/**
 * SAMPLE DATA (1960s-1970s) — hand-written, approximate per-game averages.
 * Steals/blocks/turnovers in this era are estimates (not officially recorded).
 * Combos: 1960s Boston, 1960s Philadelphia, 1970s New York.
 */
import { entry } from './helpers';
import type { PlayerEntry } from '../types';

export const PLAYERS_1960S_70S: PlayerEntry[] = [
  // ── 1960s Boston ──────────────────────────────────────────────────────────
  entry('Bill Russell', 'BOS', 1960, ['C'], 1960, 1969, 719, 18, {
    mp: 43.5, pts: 14.9, trb: 23.4, ast: 4.6, stl: 1.0, blk: 3.5, tov: 2.2,
    fga: 12.4, fgp: 0.443, tpa: 0, tpp: 0, fta: 5.2, ftp: 0.560,
  }),
  entry('Bob Cousy', 'BOS', 1960, ['PG'], 1960, 1963, 291, 24, {
    mp: 32.5, pts: 17.6, trb: 4.6, ast: 8.4, stl: 1.2, blk: 0.1, tov: 3.0,
    fga: 16.8, fgp: 0.378, tpa: 0, tpp: 0, fta: 4.6, ftp: 0.798,
  }),
  entry('Sam Jones', 'BOS', 1960, ['SG'], 1960, 1969, 745, 23, {
    mp: 28.5, pts: 18.4, trb: 4.8, ast: 2.7, stl: 1.0, blk: 0.2, tov: 2.0,
    fga: 15.9, fgp: 0.457, tpa: 0, tpp: 0, fta: 3.7, ftp: 0.806,
  }),
  entry('John Havlicek', 'BOS', 1960, ['SF', 'SG'], 1963, 1969, 561, 24, {
    mp: 31.0, pts: 19.2, trb: 5.9, ast: 4.1, stl: 1.4, blk: 0.3, tov: 2.4,
    fga: 17.4, fgp: 0.425, tpa: 0, tpp: 0, fta: 4.7, ftp: 0.805,
  }),
  entry('Tom Heinsohn', 'BOS', 1960, ['PF', 'SF'], 1960, 1965, 432, 26, {
    mp: 30.0, pts: 19.8, trb: 8.7, ast: 2.1, stl: 0.8, blk: 0.3, tov: 2.3,
    fga: 19.0, fgp: 0.407, tpa: 0, tpp: 0, fta: 4.4, ftp: 0.790,
  }),
  entry('K.C. Jones', 'BOS', 1960, ['PG'], 1960, 1967, 624, 13, {
    mp: 26.5, pts: 7.6, trb: 3.6, ast: 4.5, stl: 1.3, blk: 0.1, tov: 1.8,
    fga: 7.4, fgp: 0.387, tpa: 0, tpp: 0, fta: 2.3, ftp: 0.632,
  }),
  entry('Satch Sanders', 'BOS', 1960, ['PF'], 1961, 1969, 685, 15, {
    mp: 27.0, pts: 10.8, trb: 7.2, ast: 1.2, stl: 0.7, blk: 0.7, tov: 1.6,
    fga: 9.6, fgp: 0.432, tpa: 0, tpp: 0, fta: 2.6, ftp: 0.767,
  }),
  entry('Bailey Howell', 'BOS', 1960, ['PF', 'SF'], 1967, 1969, 242, 23, {
    mp: 31.0, pts: 19.3, trb: 8.6, ast: 1.7, stl: 0.8, blk: 0.3, tov: 2.2,
    fga: 15.5, fgp: 0.489, tpa: 0, tpp: 0, fta: 5.7, ftp: 0.711,
  }),

  // ── 1960s Philadelphia (Syracuse through 1963; Philadelphia from 1964) ───
  entry('Wilt Chamberlain', 'PHI', 1960, ['C'], 1965, 1968, 277, 28, {
    mp: 46.8, pts: 27.6, trb: 23.9, ast: 6.8, stl: 1.0, blk: 3.8, tov: 3.5,
    fga: 18.3, fgp: 0.566, tpa: 0, tpp: 0, fta: 10.4, ftp: 0.503,
  }),
  entry('Hal Greer', 'PHI', 1960, ['SG', 'PG'], 1960, 1969, 752, 25, {
    mp: 36.0, pts: 20.4, trb: 5.0, ast: 4.2, stl: 1.0, blk: 0.2, tov: 2.7,
    fga: 17.6, fgp: 0.452, tpa: 0, tpp: 0, fta: 5.4, ftp: 0.800,
  }),
  entry('Billy Cunningham', 'PHI', 1960, ['SF', 'PF'], 1966, 1969, 320, 26, {
    mp: 33.0, pts: 20.0, trb: 10.9, ast: 3.0, stl: 1.0, blk: 0.5, tov: 2.9,
    fga: 16.7, fgp: 0.446, tpa: 0, tpp: 0, fta: 7.4, ftp: 0.703,
  }),
  entry('Chet Walker', 'PHI', 1960, ['SF'], 1963, 1969, 538, 21, {
    mp: 33.0, pts: 16.8, trb: 8.0, ast: 2.5, stl: 0.9, blk: 0.2, tov: 2.1,
    fga: 12.7, fgp: 0.470, tpa: 0, tpp: 0, fta: 6.0, ftp: 0.771,
  }),
  entry('Luke Jackson', 'PHI', 1960, ['PF', 'C'], 1965, 1969, 366, 16, {
    mp: 30.0, pts: 11.4, trb: 10.4, ast: 1.8, stl: 0.6, blk: 0.9, tov: 1.8,
    fga: 9.6, fgp: 0.438, tpa: 0, tpp: 0, fta: 4.0, ftp: 0.722,
  }),
  entry('Wali Jones', 'PHI', 1960, ['PG'], 1966, 1969, 305, 18, {
    mp: 27.0, pts: 11.9, trb: 2.8, ast: 4.0, stl: 0.9, blk: 0.1, tov: 1.9,
    fga: 10.9, fgp: 0.432, tpa: 0, tpp: 0, fta: 2.8, ftp: 0.804,
  }),
  entry('Larry Costello', 'PHI', 1960, ['PG'], 1960, 1965, 384, 18, {
    mp: 29.0, pts: 12.6, trb: 3.3, ast: 4.5, stl: 1.0, blk: 0.1, tov: 1.9,
    fga: 9.6, fgp: 0.446, tpa: 0, tpp: 0, fta: 4.1, ftp: 0.861,
  }),
  entry('Dave Gambee', 'PHI', 1960, ['PF'], 1961, 1968, 540, 18, {
    mp: 20.0, pts: 10.6, trb: 5.6, ast: 1.1, stl: 0.5, blk: 0.2, tov: 1.4,
    fga: 8.6, fgp: 0.431, tpa: 0, tpp: 0, fta: 3.6, ftp: 0.805,
  }),

  // ── 1970s New York ────────────────────────────────────────────────────────
  entry('Walt Frazier', 'NYK', 1970, ['PG', 'SG'], 1970, 1977, 614, 23, {
    mp: 38.5, pts: 19.8, trb: 6.1, ast: 6.3, stl: 2.0, blk: 0.2, tov: 2.5,
    fga: 16.2, fgp: 0.495, tpa: 0, tpp: 0, fta: 4.7, ftp: 0.778,
  }),
  entry('Willis Reed', 'NYK', 1970, ['C', 'PF'], 1970, 1974, 308, 22, {
    mp: 34.0, pts: 17.3, trb: 11.4, ast: 1.9, stl: 0.6, blk: 1.1, tov: 2.3,
    fga: 15.0, fgp: 0.488, tpa: 0, tpp: 0, fta: 3.5, ftp: 0.742,
  }),
  entry('Earl Monroe', 'NYK', 1970, ['SG', 'PG'], 1972, 1979, 521, 23, {
    mp: 31.0, pts: 16.7, trb: 3.0, ast: 3.8, stl: 1.0, blk: 0.2, tov: 2.2,
    fga: 14.2, fgp: 0.472, tpa: 0, tpp: 0, fta: 4.0, ftp: 0.803,
  }),
  entry('Dave DeBusschere', 'NYK', 1970, ['PF', 'SF'], 1970, 1974, 376, 20, {
    mp: 36.0, pts: 15.6, trb: 10.7, ast: 3.0, stl: 0.9, blk: 0.5, tov: 2.1,
    fga: 14.6, fgp: 0.435, tpa: 0, tpp: 0, fta: 3.0, ftp: 0.728,
  }),
  entry('Bill Bradley', 'NYK', 1970, ['SF', 'SG'], 1970, 1977, 618, 18, {
    mp: 32.0, pts: 13.4, trb: 3.5, ast: 3.6, stl: 0.8, blk: 0.1, tov: 1.8,
    fga: 12.1, fgp: 0.458, tpa: 0, tpp: 0, fta: 1.8, ftp: 0.834,
  }),
  entry('Jerry Lucas', 'NYK', 1970, ['C', 'PF'], 1972, 1974, 219, 16, {
    mp: 30.0, pts: 12.0, trb: 9.6, ast: 4.0, stl: 0.7, blk: 0.4, tov: 1.6,
    fga: 10.2, fgp: 0.501, tpa: 0, tpp: 0, fta: 1.8, ftp: 0.795,
  }),
  entry('Dick Barnett', 'NYK', 1970, ['SG'], 1970, 1973, 297, 19, {
    mp: 30.0, pts: 13.7, trb: 2.6, ast: 2.9, stl: 0.8, blk: 0.2, tov: 1.9,
    fga: 11.7, fgp: 0.459, tpa: 0, tpp: 0, fta: 3.0, ftp: 0.742,
  }),
  entry('Phil Jackson', 'NYK', 1970, ['PF', 'C'], 1970, 1978, 556, 15, {
    mp: 19.0, pts: 7.5, trb: 5.0, ast: 1.5, stl: 0.6, blk: 0.8, tov: 1.4,
    fga: 6.6, fgp: 0.449, tpa: 0, tpp: 0, fta: 2.5, ftp: 0.742,
  }),
];
