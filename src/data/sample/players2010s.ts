/**
 * SAMPLE DATA (2010s) — hand-written, approximate per-game averages.
 * Combos: 2010s Golden State, 2010s San Antonio, 2010s Cleveland,
 * 2010s Oklahoma City, 2010s Houston.
 */
import { entry } from './helpers';
import type { PlayerEntry } from '../types';

export const PLAYERS_2010S: PlayerEntry[] = [
  // ── 2010s Golden State ────────────────────────────────────────────────────
  entry('Stephen Curry', 'GSW', 2010, ['PG'], 2010, 2019, 694, 28, {
    mp: 34.5, pts: 23.5, trb: 4.4, ast: 6.6, stl: 1.7, blk: 0.2, tov: 3.1,
    fga: 17.0, fgp: 0.477, tpa: 8.5, tpp: 0.436, fta: 4.3, ftp: 0.905,
  }),
  entry('Klay Thompson', 'GSW', 2010, ['SG', 'SF'], 2012, 2019, 615, 25, {
    mp: 33.5, pts: 19.5, trb: 3.5, ast: 2.3, stl: 1.0, blk: 0.5, tov: 1.6,
    fga: 15.5, fgp: 0.459, tpa: 7.1, tpp: 0.419, fta: 2.3, ftp: 0.846,
  }),
  entry('Kevin Durant', 'GSW', 2010, ['SF', 'PF'], 2017, 2019, 208, 30, {
    mp: 34.5, pts: 25.8, trb: 6.8, ast: 5.4, stl: 0.8, blk: 1.4, tov: 3.0,
    fga: 17.7, fgp: 0.524, tpa: 5.0, tpp: 0.394, fta: 6.3, ftp: 0.884,
  }),
  entry('Draymond Green', 'GSW', 2010, ['PF', 'C'], 2013, 2019, 545, 14, {
    mp: 30.0, pts: 9.4, trb: 7.4, ast: 6.0, stl: 1.4, blk: 1.1, tov: 2.5,
    fga: 7.5, fgp: 0.449, tpa: 2.7, tpp: 0.321, fta: 2.0, ftp: 0.701,
  }),
  entry('Andre Iguodala', 'GSW', 2010, ['SF', 'SG'], 2014, 2019, 433, 11, {
    mp: 26.0, pts: 6.5, trb: 3.8, ast: 3.3, stl: 1.0, blk: 0.4, tov: 1.0,
    fga: 5.2, fgp: 0.479, tpa: 2.0, tpp: 0.339, fta: 1.2, ftp: 0.631,
  }),
  entry('Harrison Barnes', 'GSW', 2010, ['SF', 'PF'], 2013, 2016, 306, 16, {
    mp: 28.5, pts: 10.4, trb: 4.8, ast: 1.5, stl: 0.7, blk: 0.3, tov: 1.0,
    fga: 8.7, fgp: 0.461, tpa: 2.6, tpp: 0.379, fta: 2.0, ftp: 0.741,
  }),
  entry('Shaun Livingston', 'GSW', 2010, ['PG', 'SG'], 2015, 2019, 374, 14, {
    mp: 18.0, pts: 5.4, trb: 2.0, ast: 2.7, stl: 0.5, blk: 0.3, tov: 1.0,
    fga: 4.5, fgp: 0.521, tpa: 0.0, tpp: 0, fta: 1.2, ftp: 0.829,
  }),
  entry('Andrew Bogut', 'GSW', 2010, ['C'], 2013, 2016, 252, 11, {
    mp: 24.0, pts: 5.8, trb: 8.1, ast: 2.2, stl: 0.6, blk: 1.7, tov: 1.4,
    fga: 4.5, fgp: 0.591, tpa: 0, tpp: 0, fta: 0.9, ftp: 0.481,
  }),

  // ── 2010s San Antonio ─────────────────────────────────────────────────────
  entry('Kawhi Leonard', 'SAS', 2010, ['SF', 'SG'], 2012, 2018, 416, 23, {
    mp: 30.5, pts: 16.3, trb: 6.2, ast: 2.3, stl: 1.8, blk: 0.7, tov: 1.5,
    fga: 12.0, fgp: 0.495, tpa: 3.1, tpp: 0.384, fta: 3.8, ftp: 0.851,
  }),
  entry('Tim Duncan', 'SAS', 2010, ['PF', 'C'], 2010, 2016, 502, 23, {
    mp: 30.0, pts: 14.4, trb: 9.8, ast: 2.9, stl: 0.7, blk: 1.9, tov: 1.9,
    fga: 11.5, fgp: 0.494, tpa: 0.1, tpp: 0.150, fta: 3.8, ftp: 0.731,
  }),
  entry('Tony Parker', 'SAS', 2010, ['PG'], 2010, 2018, 615, 23, {
    mp: 30.5, pts: 14.6, trb: 2.5, ast: 5.9, stl: 0.7, blk: 0.1, tov: 2.2,
    fga: 12.0, fgp: 0.489, tpa: 0.8, tpp: 0.321, fta: 3.2, ftp: 0.768,
  }),
  entry('Manu Ginobili', 'SAS', 2010, ['SG'], 2010, 2018, 543, 21, {
    mp: 22.5, pts: 11.0, trb: 2.9, ast: 3.8, stl: 1.1, blk: 0.3, tov: 1.8,
    fga: 8.2, fgp: 0.442, tpa: 3.7, tpp: 0.361, fta: 2.6, ftp: 0.851,
  }),
  entry('LaMarcus Aldridge', 'SAS', 2010, ['PF', 'C'], 2016, 2019, 290, 25, {
    mp: 32.5, pts: 19.4, trb: 8.4, ast: 2.1, stl: 0.6, blk: 1.2, tov: 1.5,
    fga: 15.5, fgp: 0.504, tpa: 0.5, tpp: 0.289, fta: 4.5, ftp: 0.832,
  }),
  entry('Danny Green', 'SAS', 2010, ['SG', 'SF'], 2011, 2018, 520, 14, {
    mp: 25.0, pts: 9.1, trb: 3.5, ast: 1.7, stl: 1.0, blk: 0.8, tov: 1.1,
    fga: 7.4, fgp: 0.431, tpa: 4.6, tpp: 0.399, fta: 1.0, ftp: 0.801,
  }),
  entry('Patty Mills', 'SAS', 2010, ['PG'], 2012, 2019, 533, 17, {
    mp: 18.5, pts: 8.6, trb: 1.8, ast: 2.4, stl: 0.8, blk: 0.1, tov: 1.0,
    fga: 7.2, fgp: 0.432, tpa: 4.0, tpp: 0.391, fta: 0.8, ftp: 0.872,
  }),
  entry('Tiago Splitter', 'SAS', 2010, ['C'], 2011, 2015, 309, 16, {
    mp: 20.5, pts: 8.4, trb: 5.7, ast: 1.5, stl: 0.7, blk: 0.9, tov: 1.3,
    fga: 5.8, fgp: 0.561, tpa: 0, tpp: 0, fta: 2.8, ftp: 0.661,
  }),

  // ── 2010s Cleveland ───────────────────────────────────────────────────────
  entry('LeBron James', 'CLE', 2010, ['SF', 'PG'], 2015, 2018, 301, 32, {
    mp: 37.0, pts: 26.1, trb: 7.7, ast: 8.0, stl: 1.4, blk: 0.7, tov: 3.7,
    fga: 18.8, fgp: 0.527, tpa: 4.7, tpp: 0.351, fta: 7.2, ftp: 0.711,
  }),
  entry('Kyrie Irving', 'CLE', 2010, ['PG'], 2012, 2017, 381, 29, {
    mp: 34.5, pts: 21.6, trb: 3.4, ast: 5.3, stl: 1.3, blk: 0.3, tov: 2.5,
    fga: 17.1, fgp: 0.460, tpa: 4.9, tpp: 0.381, fta: 4.4, ftp: 0.872,
  }),
  entry('Kevin Love', 'CLE', 2010, ['PF', 'C'], 2015, 2019, 332, 24, {
    mp: 31.5, pts: 17.1, trb: 10.0, ast: 2.0, stl: 0.7, blk: 0.4, tov: 1.9,
    fga: 12.8, fgp: 0.436, tpa: 6.0, tpp: 0.373, fta: 4.5, ftp: 0.832,
  }),
  entry('Tristan Thompson', 'CLE', 2010, ['C', 'PF'], 2012, 2019, 584, 14, {
    mp: 27.5, pts: 9.1, trb: 8.5, ast: 0.9, stl: 0.5, blk: 0.8, tov: 1.0,
    fga: 6.8, fgp: 0.519, tpa: 0, tpp: 0, fta: 3.0, ftp: 0.601,
  }),
  entry('J.R. Smith', 'CLE', 2010, ['SG'], 2015, 2018, 263, 16, {
    mp: 30.0, pts: 10.6, trb: 3.0, ast: 1.7, stl: 1.0, blk: 0.3, tov: 1.0,
    fga: 9.0, fgp: 0.424, tpa: 5.8, tpp: 0.374, fta: 1.0, ftp: 0.721,
  }),
  entry('Iman Shumpert', 'CLE', 2010, ['SG', 'SF'], 2015, 2018, 217, 13, {
    mp: 24.5, pts: 6.6, trb: 3.3, ast: 1.6, stl: 1.1, blk: 0.3, tov: 1.0,
    fga: 6.0, fgp: 0.389, tpa: 3.4, tpp: 0.349, fta: 0.9, ftp: 0.781,
  }),
  entry('Anderson Varejao', 'CLE', 2010, ['C', 'PF'], 2010, 2016, 348, 15, {
    mp: 26.5, pts: 8.1, trb: 7.9, ast: 1.4, stl: 1.0, blk: 0.6, tov: 1.4,
    fga: 6.4, fgp: 0.511, tpa: 0, tpp: 0, fta: 2.2, ftp: 0.661,
  }),
  entry('Matthew Dellavedova', 'CLE', 2010, ['PG'], 2014, 2016, 213, 13, {
    mp: 21.5, pts: 6.4, trb: 1.9, ast: 3.9, stl: 0.5, blk: 0.1, tov: 1.3,
    fga: 5.4, fgp: 0.404, tpa: 2.7, tpp: 0.399, fta: 1.0, ftp: 0.831,
  }),

  // ── 2010s Oklahoma City ───────────────────────────────────────────────────
  entry('Russell Westbrook', 'OKC', 2010, ['PG'], 2010, 2019, 734, 32, {
    mp: 35.0, pts: 23.4, trb: 7.0, ast: 8.4, stl: 1.8, blk: 0.3, tov: 4.0,
    fga: 18.6, fgp: 0.434, tpa: 4.0, tpp: 0.305, fta: 7.1, ftp: 0.799,
  }),
  entry('Kevin Durant', 'OKC', 2010, ['SF', 'PF'], 2010, 2016, 511, 31, {
    mp: 38.0, pts: 28.2, trb: 7.5, ast: 4.0, stl: 1.2, blk: 1.1, tov: 3.3,
    fga: 19.2, fgp: 0.496, tpa: 5.4, tpp: 0.384, fta: 8.5, ftp: 0.881,
  }),
  entry('James Harden', 'OKC', 2010, ['SG'], 2010, 2012, 220, 21, {
    mp: 27.0, pts: 14.0, trb: 3.9, ast: 2.9, stl: 1.1, blk: 0.3, tov: 1.8,
    fga: 9.0, fgp: 0.456, tpa: 3.9, tpp: 0.374, fta: 4.6, ftp: 0.832,
  }),
  entry('Serge Ibaka', 'OKC', 2010, ['PF', 'C'], 2010, 2016, 542, 16, {
    mp: 28.5, pts: 10.6, trb: 7.3, ast: 0.8, stl: 0.5, blk: 2.6, tov: 1.3,
    fga: 8.0, fgp: 0.519, tpa: 0.7, tpp: 0.361, fta: 2.0, ftp: 0.771,
  }),
  entry('Steven Adams', 'OKC', 2010, ['C'], 2014, 2019, 462, 15, {
    mp: 27.5, pts: 10.1, trb: 7.8, ast: 1.1, stl: 1.0, blk: 1.0, tov: 1.5,
    fga: 7.0, fgp: 0.581, tpa: 0, tpp: 0, fta: 3.1, ftp: 0.561,
  }),
  entry('Thabo Sefolosha', 'OKC', 2010, ['SG', 'SF'], 2010, 2014, 339, 9, {
    mp: 25.0, pts: 5.6, trb: 3.8, ast: 1.5, stl: 1.2, blk: 0.4, tov: 0.8,
    fga: 4.5, fgp: 0.451, tpa: 1.8, tpp: 0.371, fta: 0.8, ftp: 0.741,
  }),
  entry('Enes Kanter', 'OKC', 2010, ['C'], 2015, 2017, 184, 24, {
    mp: 22.0, pts: 13.6, trb: 7.5, ast: 0.7, stl: 0.4, blk: 0.5, tov: 1.6,
    fga: 9.5, fgp: 0.561, tpa: 0.2, tpp: 0.250, fta: 3.2, ftp: 0.789,
  }),
  entry('Andre Roberson', 'OKC', 2010, ['SG', 'SF'], 2014, 2018, 313, 9, {
    mp: 24.0, pts: 4.6, trb: 4.3, ast: 1.0, stl: 1.1, blk: 0.9, tov: 0.7,
    fga: 3.8, fgp: 0.469, tpa: 1.2, tpp: 0.259, fta: 1.0, ftp: 0.481,
  }),

  // ── 2010s Houston ─────────────────────────────────────────────────────────
  entry('James Harden', 'HOU', 2010, ['SG', 'PG'], 2013, 2019, 555, 33, {
    mp: 36.5, pts: 29.0, trb: 5.9, ast: 7.5, stl: 1.7, blk: 0.6, tov: 4.2,
    fga: 19.4, fgp: 0.443, tpa: 9.3, tpp: 0.364, fta: 9.7, ftp: 0.861,
  }),
  entry('Chris Paul', 'HOU', 2010, ['PG'], 2018, 2019, 116, 23, {
    mp: 32.5, pts: 17.0, trb: 5.0, ast: 8.1, stl: 1.9, blk: 0.2, tov: 2.4,
    fga: 13.5, fgp: 0.444, tpa: 5.6, tpp: 0.369, fta: 3.4, ftp: 0.881,
  }),
  entry('Dwight Howard', 'HOU', 2010, ['C'], 2014, 2016, 183, 21, {
    mp: 32.5, pts: 15.0, trb: 11.5, ast: 1.3, stl: 0.9, blk: 1.5, tov: 2.8,
    fga: 9.5, fgp: 0.594, tpa: 0, tpp: 0, fta: 7.5, ftp: 0.541,
  }),
  entry('Clint Capela', 'HOU', 2010, ['C'], 2015, 2019, 320, 17, {
    mp: 25.5, pts: 11.4, trb: 9.4, ast: 1.1, stl: 0.7, blk: 1.5, tov: 1.3,
    fga: 7.5, fgp: 0.639, tpa: 0, tpp: 0, fta: 3.3, ftp: 0.501,
  }),
  entry('Trevor Ariza', 'HOU', 2010, ['SF', 'PF'], 2015, 2018, 311, 14, {
    mp: 34.5, pts: 12.0, trb: 4.9, ast: 2.1, stl: 1.8, blk: 0.3, tov: 1.3,
    fga: 9.8, fgp: 0.411, tpa: 6.3, tpp: 0.354, fta: 1.7, ftp: 0.771,
  }),
  entry('Eric Gordon', 'HOU', 2010, ['SG'], 2017, 2019, 212, 22, {
    mp: 31.5, pts: 17.0, trb: 2.4, ast: 2.2, stl: 0.7, blk: 0.4, tov: 1.8,
    fga: 13.5, fgp: 0.421, tpa: 8.4, tpp: 0.351, fta: 2.7, ftp: 0.801,
  }),
  entry('Patrick Beverley', 'HOU', 2010, ['PG'], 2013, 2017, 282, 14, {
    mp: 28.5, pts: 9.6, trb: 4.5, ast: 3.2, stl: 1.4, blk: 0.4, tov: 1.3,
    fga: 7.8, fgp: 0.421, tpa: 4.3, tpp: 0.379, fta: 1.2, ftp: 0.761,
  }),
  entry('Chandler Parsons', 'HOU', 2010, ['SF', 'PF'], 2012, 2014, 213, 19, {
    mp: 36.5, pts: 14.6, trb: 5.2, ast: 3.4, stl: 1.1, blk: 0.4, tov: 1.7,
    fga: 11.5, fgp: 0.479, tpa: 4.6, tpp: 0.369, fta: 2.4, ftp: 0.731,
  }),
];
