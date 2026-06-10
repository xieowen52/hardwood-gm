/**
 * SAMPLE DATA (1980s) — hand-written, approximate per-game averages.
 * Combos: 1980s Boston, 1980s Los Angeles (LAL).
 */
import { entry } from './helpers';
import type { PlayerEntry } from '../types';

export const PLAYERS_1980S: PlayerEntry[] = [
  // ── 1980s Boston ──────────────────────────────────────────────────────────
  entry('Larry Bird', 'BOS', 1980, ['SF', 'PF'], 1980, 1989, 717, 27, {
    mp: 38.5, pts: 24.8, trb: 10.0, ast: 6.2, stl: 1.8, blk: 0.9, tov: 3.1,
    fga: 19.5, fgp: 0.503, tpa: 2.1, tpp: 0.379, fta: 4.9, ftp: 0.880,
  }),
  entry('Kevin McHale', 'BOS', 1980, ['PF', 'C'], 1981, 1989, 711, 23, {
    mp: 31.5, pts: 18.3, trb: 7.5, ast: 1.6, stl: 0.4, blk: 1.8, tov: 1.9,
    fga: 12.9, fgp: 0.564, tpa: 0.1, tpp: 0.200, fta: 5.4, ftp: 0.791,
  }),
  entry('Robert Parish', 'BOS', 1980, ['C'], 1981, 1989, 708, 20, {
    mp: 30.5, pts: 16.8, trb: 10.0, ast: 1.6, stl: 0.8, blk: 1.7, tov: 2.1,
    fga: 12.4, fgp: 0.559, tpa: 0, tpp: 0, fta: 4.2, ftp: 0.740,
  }),
  entry('Dennis Johnson', 'BOS', 1980, ['PG', 'SG'], 1984, 1989, 480, 18, {
    mp: 34.0, pts: 12.8, trb: 3.2, ast: 6.7, stl: 1.2, blk: 0.4, tov: 2.2,
    fga: 11.0, fgp: 0.446, tpa: 0.5, tpp: 0.252, fta: 3.5, ftp: 0.852,
  }),
  entry('Danny Ainge', 'BOS', 1980, ['SG', 'PG'], 1982, 1989, 556, 16, {
    mp: 28.0, pts: 11.3, trb: 2.8, ast: 4.7, stl: 1.2, blk: 0.1, tov: 1.8,
    fga: 9.5, fgp: 0.496, tpa: 1.7, tpp: 0.378, fta: 1.6, ftp: 0.861,
  }),
  entry('Cedric Maxwell', 'BOS', 1980, ['SF', 'PF'], 1980, 1985, 455, 18, {
    mp: 31.0, pts: 14.3, trb: 6.5, ast: 2.5, stl: 0.9, blk: 0.6, tov: 2.3,
    fga: 8.8, fgp: 0.571, tpa: 0, tpp: 0, fta: 6.4, ftp: 0.793,
  }),
  entry('Bill Walton', 'BOS', 1980, ['C'], 1986, 1987, 90, 15, {
    mp: 19.0, pts: 7.4, trb: 6.7, ast: 2.1, stl: 0.5, blk: 1.3, tov: 1.5,
    fga: 6.0, fgp: 0.556, tpa: 0, tpp: 0, fta: 1.5, ftp: 0.701,
  }),
  entry('Gerald Henderson', 'BOS', 1980, ['PG', 'SG'], 1980, 1984, 387, 17, {
    mp: 22.0, pts: 9.4, trb: 1.8, ast: 3.8, stl: 1.2, blk: 0.1, tov: 1.7,
    fga: 8.0, fgp: 0.501, tpa: 0.2, tpp: 0.250, fta: 2.0, ftp: 0.770,
  }),

  // ── 1980s Los Angeles (LAL) ───────────────────────────────────────────────
  entry('Magic Johnson', 'LAL', 1980, ['PG'], 1980, 1989, 723, 22, {
    mp: 36.5, pts: 19.6, trb: 7.3, ast: 11.4, stl: 1.9, blk: 0.4, tov: 3.9,
    fga: 13.0, fgp: 0.526, tpa: 0.6, tpp: 0.284, fta: 6.5, ftp: 0.852,
  }),
  entry('Kareem Abdul-Jabbar', 'LAL', 1980, ['C'], 1980, 1989, 768, 25, {
    mp: 32.5, pts: 21.5, trb: 7.8, ast: 3.2, stl: 0.8, blk: 2.4, tov: 2.7,
    fga: 15.4, fgp: 0.567, tpa: 0, tpp: 0, fta: 5.5, ftp: 0.749,
  }),
  entry('James Worthy', 'LAL', 1980, ['SF', 'PF'], 1983, 1989, 549, 22, {
    mp: 32.5, pts: 17.7, trb: 5.3, ast: 2.8, stl: 1.1, blk: 0.8, tov: 2.1,
    fga: 13.6, fgp: 0.553, tpa: 0.1, tpp: 0.250, fta: 4.0, ftp: 0.775,
  }),
  entry('Byron Scott', 'LAL', 1980, ['SG'], 1984, 1989, 470, 20, {
    mp: 30.5, pts: 16.0, trb: 3.5, ast: 3.0, stl: 1.3, blk: 0.2, tov: 1.8,
    fga: 13.0, fgp: 0.498, tpa: 1.6, tpp: 0.370, fta: 2.8, ftp: 0.833,
  }),
  entry('Michael Cooper', 'LAL', 1980, ['SG', 'SF'], 1980, 1989, 770, 14, {
    mp: 26.5, pts: 9.0, trb: 3.2, ast: 4.2, stl: 1.2, blk: 0.6, tov: 1.6,
    fga: 7.0, fgp: 0.469, tpa: 1.6, tpp: 0.342, fta: 1.8, ftp: 0.833,
  }),
  entry('Jamaal Wilkes', 'LAL', 1980, ['SF'], 1980, 1985, 442, 22, {
    mp: 33.5, pts: 18.4, trb: 5.0, ast: 2.5, stl: 1.3, blk: 0.3, tov: 2.1,
    fga: 15.1, fgp: 0.521, tpa: 0.1, tpp: 0.100, fta: 4.0, ftp: 0.758,
  }),
  entry('Norm Nixon', 'LAL', 1980, ['PG'], 1980, 1983, 312, 21, {
    mp: 36.5, pts: 17.0, trb: 2.8, ast: 8.0, stl: 1.5, blk: 0.1, tov: 3.1,
    fga: 15.1, fgp: 0.501, tpa: 0.2, tpp: 0.200, fta: 3.0, ftp: 0.778,
  }),
  entry('Kurt Rambis', 'LAL', 1980, ['PF'], 1982, 1988, 521, 11, {
    mp: 21.0, pts: 6.4, trb: 6.6, ast: 1.0, stl: 0.9, blk: 0.5, tov: 1.0,
    fga: 4.4, fgp: 0.561, tpa: 0, tpp: 0, fta: 2.4, ftp: 0.738,
  }),
  entry('A.C. Green', 'LAL', 1980, ['PF'], 1986, 1989, 320, 15, {
    mp: 26.5, pts: 10.4, trb: 7.9, ast: 1.2, stl: 0.9, blk: 0.6, tov: 1.4,
    fga: 7.4, fgp: 0.521, tpa: 0.2, tpp: 0.250, fta: 3.8, ftp: 0.761,
  }),
];
