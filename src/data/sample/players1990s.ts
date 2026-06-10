/**
 * SAMPLE DATA (1990s) — hand-written, approximate per-game averages.
 * Combos: 1990s Chicago, 1990s Houston, 1990s Utah.
 */
import { entry } from './helpers';
import type { PlayerEntry } from '../types';

export const PLAYERS_1990S: PlayerEntry[] = [
  // ── 1990s Chicago ─────────────────────────────────────────────────────────
  entry('Michael Jordan', 'CHI', 1990, ['SG', 'SF'], 1990, 1998, 552, 33, {
    mp: 38.5, pts: 31.0, trb: 6.2, ast: 5.4, stl: 2.5, blk: 0.9, tov: 2.7,
    fga: 23.5, fgp: 0.505, tpa: 2.8, tpp: 0.340, fta: 8.0, ftp: 0.838,
  }),
  entry('Scottie Pippen', 'CHI', 1990, ['SF', 'PG'], 1990, 1998, 668, 24, {
    mp: 37.5, pts: 19.4, trb: 7.0, ast: 5.9, stl: 2.2, blk: 0.9, tov: 2.9,
    fga: 16.0, fgp: 0.481, tpa: 2.8, tpp: 0.311, fta: 4.5, ftp: 0.702,
  }),
  entry('Horace Grant', 'CHI', 1990, ['PF', 'C'], 1990, 1994, 405, 16, {
    mp: 34.5, pts: 13.4, trb: 9.0, ast: 2.6, stl: 1.2, blk: 1.2, tov: 1.5,
    fga: 10.6, fgp: 0.524, tpa: 0.1, tpp: 0.250, fta: 3.5, ftp: 0.701,
  }),
  entry('Dennis Rodman', 'CHI', 1990, ['PF', 'C'], 1996, 1998, 199, 10, {
    mp: 32.0, pts: 5.2, trb: 15.3, ast: 2.9, stl: 0.6, blk: 0.3, tov: 1.9,
    fga: 4.7, fgp: 0.448, tpa: 0.3, tpp: 0.200, fta: 2.3, ftp: 0.562,
  }),
  entry('Toni Kukoc', 'CHI', 1990, ['SF', 'PF'], 1994, 1998, 364, 21, {
    mp: 28.0, pts: 13.4, trb: 4.6, ast: 4.3, stl: 1.1, blk: 0.4, tov: 2.1,
    fga: 10.6, fgp: 0.470, tpa: 2.9, tpp: 0.328, fta: 3.2, ftp: 0.778,
  }),
  entry('B.J. Armstrong', 'CHI', 1990, ['PG'], 1990, 1995, 442, 17, {
    mp: 27.0, pts: 11.0, trb: 1.9, ast: 3.6, stl: 0.9, blk: 0.1, tov: 1.5,
    fga: 8.8, fgp: 0.479, tpa: 1.4, tpp: 0.428, fta: 1.8, ftp: 0.849,
  }),
  entry('Ron Harper', 'CHI', 1990, ['PG', 'SG'], 1995, 1998, 280, 14, {
    mp: 23.5, pts: 7.8, trb: 2.9, ast: 2.8, stl: 1.4, blk: 0.4, tov: 1.1,
    fga: 7.0, fgp: 0.452, tpa: 1.5, tpp: 0.296, fta: 1.5, ftp: 0.701,
  }),
  entry('Steve Kerr', 'CHI', 1990, ['PG', 'SG'], 1994, 1998, 367, 13, {
    mp: 21.5, pts: 7.6, trb: 1.3, ast: 1.6, stl: 0.7, blk: 0.0, tov: 0.7,
    fga: 5.6, fgp: 0.501, tpa: 2.7, tpp: 0.473, fta: 0.7, ftp: 0.851,
  }),
  entry('Luc Longley', 'CHI', 1990, ['C'], 1994, 1998, 314, 16, {
    mp: 23.5, pts: 8.8, trb: 5.4, ast: 1.9, stl: 0.5, blk: 1.2, tov: 1.8,
    fga: 7.5, fgp: 0.471, tpa: 0, tpp: 0, fta: 2.4, ftp: 0.781,
  }),

  // ── 1990s Houston ─────────────────────────────────────────────────────────
  entry('Hakeem Olajuwon', 'HOU', 1990, ['C'], 1990, 1999, 689, 28, {
    mp: 38.0, pts: 25.1, trb: 11.4, ast: 3.0, stl: 1.8, blk: 3.4, tov: 3.0,
    fga: 19.4, fgp: 0.512, tpa: 0.2, tpp: 0.200, fta: 6.6, ftp: 0.741,
  }),
  entry('Clyde Drexler', 'HOU', 1990, ['SG', 'SF'], 1995, 1998, 243, 25, {
    mp: 36.5, pts: 19.2, trb: 5.9, ast: 5.5, stl: 1.9, blk: 0.6, tov: 2.8,
    fga: 15.6, fgp: 0.443, tpa: 4.0, tpp: 0.330, fta: 5.5, ftp: 0.789,
  }),
  entry('Charles Barkley', 'HOU', 1990, ['PF'], 1997, 1999, 151, 22, {
    mp: 35.5, pts: 16.1, trb: 12.6, ast: 4.1, stl: 1.2, blk: 0.6, tov: 2.6,
    fga: 11.4, fgp: 0.480, tpa: 1.2, tpp: 0.283, fta: 5.4, ftp: 0.720,
  }),
  entry('Kenny Smith', 'HOU', 1990, ['PG'], 1991, 1996, 437, 18, {
    mp: 29.0, pts: 12.6, trb: 1.9, ast: 5.0, stl: 0.9, blk: 0.1, tov: 1.9,
    fga: 10.0, fgp: 0.481, tpa: 2.8, tpp: 0.399, fta: 2.2, ftp: 0.851,
  }),
  entry('Sam Cassell', 'HOU', 1990, ['PG'], 1994, 1996, 217, 21, {
    mp: 23.5, pts: 9.7, trb: 2.6, ast: 4.0, stl: 0.9, blk: 0.1, tov: 1.9,
    fga: 8.0, fgp: 0.439, tpa: 1.8, tpp: 0.328, fta: 3.0, ftp: 0.843,
  }),
  entry('Robert Horry', 'HOU', 1990, ['PF', 'SF'], 1993, 1996, 311, 15, {
    mp: 31.0, pts: 10.0, trb: 5.2, ast: 3.0, stl: 1.4, blk: 1.0, tov: 1.8,
    fga: 8.5, fgp: 0.459, tpa: 2.6, tpp: 0.341, fta: 2.2, ftp: 0.755,
  }),
  entry('Otis Thorpe', 'HOU', 1990, ['PF', 'C'], 1990, 1995, 432, 18, {
    mp: 33.5, pts: 14.6, trb: 9.0, ast: 2.4, stl: 0.9, blk: 0.4, tov: 2.3,
    fga: 10.1, fgp: 0.559, tpa: 0, tpp: 0, fta: 4.8, ftp: 0.629,
  }),
  entry('Mario Elie', 'HOU', 1990, ['SG', 'SF'], 1994, 1998, 374, 15, {
    mp: 26.0, pts: 9.6, trb: 2.8, ast: 2.9, stl: 0.9, blk: 0.1, tov: 1.4,
    fga: 7.0, fgp: 0.472, tpa: 2.1, tpp: 0.378, fta: 2.4, ftp: 0.839,
  }),
  entry('Vernon Maxwell', 'HOU', 1990, ['SG'], 1991, 1995, 400, 20, {
    mp: 33.0, pts: 13.7, trb: 3.0, ast: 4.0, stl: 1.3, blk: 0.3, tov: 2.2,
    fga: 12.2, fgp: 0.410, tpa: 4.8, tpp: 0.328, fta: 2.5, ftp: 0.781,
  }),

  // ── 1990s Utah ────────────────────────────────────────────────────────────
  entry('Karl Malone', 'UTA', 1990, ['PF'], 1990, 1999, 793, 31, {
    mp: 38.0, pts: 27.0, trb: 10.5, ast: 3.7, stl: 1.3, blk: 0.8, tov: 3.0,
    fga: 19.0, fgp: 0.532, tpa: 0.2, tpp: 0.250, fta: 9.0, ftp: 0.742,
  }),
  entry('John Stockton', 'UTA', 1990, ['PG'], 1990, 1999, 802, 19, {
    mp: 34.5, pts: 14.1, trb: 2.8, ast: 12.0, stl: 2.4, blk: 0.2, tov: 3.2,
    fga: 9.5, fgp: 0.519, tpa: 1.4, tpp: 0.382, fta: 3.5, ftp: 0.828,
  }),
  entry('Jeff Hornacek', 'UTA', 1990, ['SG'], 1994, 1999, 442, 19, {
    mp: 31.5, pts: 14.6, trb: 3.2, ast: 4.0, stl: 1.3, blk: 0.2, tov: 1.8,
    fga: 10.4, fgp: 0.501, tpa: 2.5, tpp: 0.424, fta: 3.0, ftp: 0.891,
  }),
  entry('Bryon Russell', 'UTA', 1990, ['SF'], 1994, 1999, 386, 14, {
    mp: 25.5, pts: 8.6, trb: 4.0, ast: 1.5, stl: 1.1, blk: 0.3, tov: 1.2,
    fga: 6.8, fgp: 0.451, tpa: 2.4, tpp: 0.371, fta: 2.0, ftp: 0.739,
  }),
  entry('Greg Ostertag', 'UTA', 1990, ['C'], 1996, 1999, 311, 12, {
    mp: 22.0, pts: 6.4, trb: 6.8, ast: 0.7, stl: 0.4, blk: 2.0, tov: 1.1,
    fga: 5.0, fgp: 0.512, tpa: 0, tpp: 0, fta: 2.4, ftp: 0.558,
  }),
  entry('Thurl Bailey', 'UTA', 1990, ['PF', 'SF'], 1990, 1991, 164, 20, {
    mp: 30.5, pts: 13.6, trb: 5.4, ast: 1.4, stl: 0.6, blk: 1.4, tov: 1.7,
    fga: 11.0, fgp: 0.481, tpa: 0, tpp: 0, fta: 3.8, ftp: 0.801,
  }),
  entry('Mark Eaton', 'UTA', 1990, ['C'], 1990, 1992, 233, 9, {
    mp: 29.0, pts: 5.4, trb: 8.4, ast: 0.8, stl: 0.4, blk: 3.2, tov: 1.0,
    fga: 4.0, fgp: 0.557, tpa: 0, tpp: 0, fta: 1.8, ftp: 0.678,
  }),
  entry('Antoine Carr', 'UTA', 1990, ['PF', 'C'], 1995, 1998, 305, 16, {
    mp: 19.0, pts: 8.0, trb: 3.5, ast: 0.9, stl: 0.4, blk: 0.9, tov: 1.1,
    fga: 6.2, fgp: 0.503, tpa: 0, tpp: 0, fta: 2.2, ftp: 0.790,
  }),
];
