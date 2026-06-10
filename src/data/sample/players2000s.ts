/**
 * SAMPLE DATA (2000s) — hand-written, approximate per-game averages.
 * Combos: 2000s Los Angeles (LAL), 2000s San Antonio, 2000s Detroit,
 * 2000s Phoenix.
 */
import { entry } from './helpers';
import type { PlayerEntry } from '../types';

export const PLAYERS_2000S: PlayerEntry[] = [
  // ── 2000s Los Angeles (LAL) ───────────────────────────────────────────────
  entry('Kobe Bryant', 'LAL', 2000, ['SG', 'SF'], 2000, 2009, 747, 31, {
    mp: 38.5, pts: 27.9, trb: 5.8, ast: 5.0, stl: 1.6, blk: 0.6, tov: 3.0,
    fga: 21.4, fgp: 0.456, tpa: 4.5, tpp: 0.339, fta: 8.6, ftp: 0.840,
  }),
  entry("Shaquille O'Neal", 'LAL', 2000, ['C'], 2000, 2004, 327, 31, {
    mp: 38.0, pts: 27.2, trb: 12.0, ast: 3.3, stl: 0.6, blk: 2.6, tov: 2.9,
    fga: 18.6, fgp: 0.572, tpa: 0, tpp: 0, fta: 10.7, ftp: 0.527,
  }),
  entry('Pau Gasol', 'LAL', 2000, ['PF', 'C'], 2008, 2009, 108, 22, {
    mp: 36.0, pts: 18.6, trb: 9.4, ast: 3.4, stl: 0.5, blk: 1.4, tov: 1.9,
    fga: 13.0, fgp: 0.563, tpa: 0, tpp: 0, fta: 5.6, ftp: 0.779,
  }),
  entry('Lamar Odom', 'LAL', 2000, ['PF', 'SF'], 2005, 2009, 384, 18, {
    mp: 35.0, pts: 13.6, trb: 9.1, ast: 3.8, stl: 0.9, blk: 0.9, tov: 2.4,
    fga: 10.1, fgp: 0.487, tpa: 1.7, tpp: 0.321, fta: 4.0, ftp: 0.690,
  }),
  entry('Derek Fisher', 'LAL', 2000, ['PG'], 2000, 2004, 384, 15, {
    mp: 26.0, pts: 8.6, trb: 2.2, ast: 2.8, stl: 1.1, blk: 0.1, tov: 1.3,
    fga: 7.0, fgp: 0.411, tpa: 2.9, tpp: 0.379, fta: 1.5, ftp: 0.811,
  }),
  entry('Robert Horry', 'LAL', 2000, ['PF'], 2000, 2003, 295, 12, {
    mp: 25.5, pts: 6.1, trb: 5.6, ast: 2.2, stl: 0.9, blk: 0.9, tov: 1.2,
    fga: 5.0, fgp: 0.421, tpa: 2.3, tpp: 0.339, fta: 1.5, ftp: 0.779,
  }),
  entry('Rick Fox', 'LAL', 2000, ['SF'], 2000, 2004, 363, 15, {
    mp: 26.5, pts: 8.4, trb: 4.0, ast: 2.8, stl: 1.0, blk: 0.4, tov: 1.6,
    fga: 7.2, fgp: 0.431, tpa: 2.2, tpp: 0.348, fta: 1.8, ftp: 0.789,
  }),
  entry('Andrew Bynum', 'LAL', 2000, ['C'], 2006, 2009, 245, 18, {
    mp: 25.0, pts: 9.6, trb: 6.7, ast: 1.2, stl: 0.3, blk: 1.6, tov: 1.5,
    fga: 7.0, fgp: 0.564, tpa: 0, tpp: 0, fta: 3.0, ftp: 0.687,
  }),

  // ── 2000s San Antonio ─────────────────────────────────────────────────────
  entry('Tim Duncan', 'SAS', 2000, ['PF', 'C'], 2000, 2009, 754, 27, {
    mp: 36.5, pts: 21.4, trb: 11.6, ast: 3.2, stl: 0.8, blk: 2.3, tov: 2.9,
    fga: 16.1, fgp: 0.507, tpa: 0.1, tpp: 0.180, fta: 7.0, ftp: 0.687,
  }),
  entry('Tony Parker', 'SAS', 2000, ['PG'], 2002, 2009, 605, 23, {
    mp: 33.0, pts: 16.4, trb: 3.2, ast: 5.8, stl: 1.0, blk: 0.1, tov: 2.5,
    fga: 13.4, fgp: 0.491, tpa: 1.2, tpp: 0.312, fta: 4.4, ftp: 0.721,
  }),
  entry('Manu Ginobili', 'SAS', 2000, ['SG'], 2003, 2009, 487, 23, {
    mp: 28.5, pts: 14.6, trb: 3.9, ast: 3.8, stl: 1.5, blk: 0.3, tov: 2.1,
    fga: 10.4, fgp: 0.448, tpa: 4.0, tpp: 0.371, fta: 4.3, ftp: 0.839,
  }),
  entry('David Robinson', 'SAS', 2000, ['C', 'PF'], 2000, 2003, 309, 20, {
    mp: 29.5, pts: 13.6, trb: 8.8, ast: 1.7, stl: 1.0, blk: 2.1, tov: 1.8,
    fga: 9.8, fgp: 0.496, tpa: 0, tpp: 0, fta: 4.6, ftp: 0.701,
  }),
  entry('Bruce Bowen', 'SAS', 2000, ['SF', 'SG'], 2002, 2009, 632, 10, {
    mp: 30.0, pts: 6.5, trb: 2.9, ast: 1.3, stl: 0.9, blk: 0.4, tov: 0.8,
    fga: 5.2, fgp: 0.428, tpa: 2.9, tpp: 0.399, fta: 0.9, ftp: 0.581,
  }),
  entry('Michael Finley', 'SAS', 2000, ['SG', 'SF'], 2006, 2009, 305, 15, {
    mp: 25.0, pts: 9.5, trb: 3.1, ast: 1.7, stl: 0.7, blk: 0.2, tov: 0.9,
    fga: 8.2, fgp: 0.432, tpa: 3.8, tpp: 0.389, fta: 0.9, ftp: 0.789,
  }),
  entry('Brent Barry', 'SAS', 2000, ['SG'], 2005, 2008, 269, 13, {
    mp: 21.5, pts: 7.6, trb: 2.6, ast: 2.2, stl: 0.7, blk: 0.2, tov: 1.0,
    fga: 5.4, fgp: 0.451, tpa: 3.2, tpp: 0.411, fta: 1.2, ftp: 0.852,
  }),
  entry('Malik Rose', 'SAS', 2000, ['PF'], 2000, 2005, 414, 17, {
    mp: 19.5, pts: 7.8, trb: 4.8, ast: 1.0, stl: 0.7, blk: 0.4, tov: 1.3,
    fga: 6.0, fgp: 0.459, tpa: 0.1, tpp: 0.200, fta: 3.0, ftp: 0.772,
  }),

  // ── 2000s Detroit ─────────────────────────────────────────────────────────
  entry('Chauncey Billups', 'DET', 2000, ['PG'], 2003, 2008, 459, 22, {
    mp: 35.5, pts: 17.0, trb: 3.3, ast: 6.4, stl: 1.0, blk: 0.1, tov: 2.1,
    fga: 11.7, fgp: 0.424, tpa: 4.9, tpp: 0.389, fta: 5.4, ftp: 0.898,
  }),
  entry('Richard Hamilton', 'DET', 2000, ['SG'], 2003, 2009, 537, 24, {
    mp: 35.5, pts: 18.6, trb: 3.4, ast: 4.0, stl: 0.8, blk: 0.2, tov: 2.2,
    fga: 15.0, fgp: 0.454, tpa: 2.2, tpp: 0.351, fta: 4.3, ftp: 0.851,
  }),
  entry('Tayshaun Prince', 'DET', 2000, ['SF'], 2003, 2009, 561, 17, {
    mp: 33.5, pts: 12.4, trb: 4.9, ast: 2.7, stl: 0.7, blk: 0.7, tov: 1.3,
    fga: 10.5, fgp: 0.461, tpa: 1.9, tpp: 0.361, fta: 2.2, ftp: 0.761,
  }),
  entry('Ben Wallace', 'DET', 2000, ['C', 'PF'], 2001, 2006, 466, 11, {
    mp: 35.5, pts: 7.0, trb: 12.5, ast: 1.6, stl: 1.5, blk: 2.7, tov: 1.2,
    fga: 5.8, fgp: 0.481, tpa: 0.1, tpp: 0.150, fta: 3.2, ftp: 0.441,
  }),
  entry('Rasheed Wallace', 'DET', 2000, ['PF', 'C'], 2004, 2009, 422, 20, {
    mp: 32.5, pts: 13.5, trb: 7.0, ast: 1.7, stl: 1.0, blk: 1.7, tov: 1.5,
    fga: 11.5, fgp: 0.448, tpa: 3.9, tpp: 0.349, fta: 2.5, ftp: 0.739,
  }),
  entry('Antonio McDyess', 'DET', 2000, ['PF', 'C'], 2005, 2009, 364, 15, {
    mp: 24.0, pts: 8.4, trb: 7.0, ast: 1.0, stl: 0.6, blk: 0.8, tov: 1.0,
    fga: 7.0, fgp: 0.501, tpa: 0, tpp: 0, fta: 1.8, ftp: 0.738,
  }),
  entry('Lindsey Hunter', 'DET', 2000, ['PG'], 2004, 2008, 282, 14, {
    mp: 17.5, pts: 6.3, trb: 1.9, ast: 2.4, stl: 1.3, blk: 0.1, tov: 1.0,
    fga: 6.2, fgp: 0.381, tpa: 2.6, tpp: 0.331, fta: 0.8, ftp: 0.742,
  }),
  entry('Corliss Williamson', 'DET', 2000, ['SF', 'PF'], 2001, 2004, 309, 22, {
    mp: 22.5, pts: 12.1, trb: 4.0, ast: 1.3, stl: 0.6, blk: 0.4, tov: 1.6,
    fga: 9.0, fgp: 0.512, tpa: 0, tpp: 0, fta: 3.5, ftp: 0.762,
  }),

  // ── 2000s Phoenix ─────────────────────────────────────────────────────────
  entry('Steve Nash', 'PHO', 2000, ['PG'], 2005, 2009, 384, 22, {
    mp: 34.5, pts: 17.0, trb: 3.5, ast: 11.0, stl: 0.8, blk: 0.1, tov: 3.6,
    fga: 12.0, fgp: 0.508, tpa: 4.3, tpp: 0.439, fta: 3.2, ftp: 0.908,
  }),
  entry("Amar'e Stoudemire", 'PHO', 2000, ['PF', 'C'], 2003, 2009, 481, 26, {
    mp: 33.5, pts: 21.4, trb: 8.9, ast: 1.4, stl: 0.9, blk: 1.4, tov: 2.7,
    fga: 14.4, fgp: 0.544, tpa: 0.2, tpp: 0.200, fta: 7.8, ftp: 0.768,
  }),
  entry('Shawn Marion', 'PHO', 2000, ['SF', 'PF'], 2000, 2008, 660, 21, {
    mp: 38.0, pts: 18.4, trb: 10.0, ast: 2.0, stl: 1.9, blk: 1.4, tov: 1.5,
    fga: 14.8, fgp: 0.481, tpa: 2.9, tpp: 0.339, fta: 3.5, ftp: 0.810,
  }),
  entry('Leandro Barbosa', 'PHO', 2000, ['PG', 'SG'], 2004, 2009, 442, 21, {
    mp: 24.5, pts: 12.5, trb: 2.6, ast: 2.6, stl: 1.0, blk: 0.1, tov: 1.5,
    fga: 10.0, fgp: 0.469, tpa: 3.7, tpp: 0.398, fta: 2.2, ftp: 0.831,
  }),
  entry('Boris Diaw', 'PHO', 2000, ['PF', 'C'], 2006, 2008, 229, 17, {
    mp: 31.0, pts: 10.6, trb: 5.4, ast: 4.6, stl: 0.7, blk: 0.7, tov: 1.9,
    fga: 8.0, fgp: 0.512, tpa: 0.8, tpp: 0.321, fta: 2.7, ftp: 0.738,
  }),
  entry('Raja Bell', 'PHO', 2000, ['SG'], 2006, 2009, 270, 15, {
    mp: 35.0, pts: 12.6, trb: 2.9, ast: 2.2, stl: 0.9, blk: 0.2, tov: 1.1,
    fga: 10.0, fgp: 0.448, tpa: 5.3, tpp: 0.411, fta: 1.2, ftp: 0.829,
  }),
  entry('Joe Johnson', 'PHO', 2000, ['SG', 'SF'], 2003, 2005, 215, 19, {
    mp: 38.5, pts: 14.4, trb: 4.6, ast: 4.3, stl: 0.9, blk: 0.2, tov: 1.9,
    fga: 12.0, fgp: 0.448, tpa: 4.0, tpp: 0.391, fta: 2.2, ftp: 0.771,
  }),
  entry('Grant Hill', 'PHO', 2000, ['SF'], 2008, 2009, 152, 17, {
    mp: 30.5, pts: 12.6, trb: 5.4, ast: 2.6, stl: 0.9, blk: 0.6, tov: 1.6,
    fga: 10.0, fgp: 0.501, tpa: 1.0, tpp: 0.329, fta: 2.6, ftp: 0.801,
  }),
];
