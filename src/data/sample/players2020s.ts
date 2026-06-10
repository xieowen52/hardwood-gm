/**
 * SAMPLE DATA (2020s) — hand-written, approximate per-game averages.
 * Combos: 2020s Denver, 2020s Boston, 2020s Milwaukee.
 */
import { entry } from './helpers';
import type { PlayerEntry } from '../types';

export const PLAYERS_2020S: PlayerEntry[] = [
  // ── 2020s Denver ──────────────────────────────────────────────────────────
  entry('Nikola Jokic', 'DEN', 2020, ['C'], 2020, 2025, 446, 30, {
    mp: 34.0, pts: 26.4, trb: 12.0, ast: 8.6, stl: 1.4, blk: 0.8, tov: 3.3,
    fga: 17.4, fgp: 0.579, tpa: 3.3, tpp: 0.369, fta: 6.4, ftp: 0.821,
  }),
  entry('Jamal Murray', 'DEN', 2020, ['PG', 'SG'], 2020, 2025, 363, 26, {
    mp: 33.5, pts: 20.1, trb: 4.1, ast: 5.5, stl: 1.0, blk: 0.3, tov: 2.2,
    fga: 15.8, fgp: 0.464, tpa: 5.9, tpp: 0.394, fta: 3.3, ftp: 0.881,
  }),
  entry('Michael Porter Jr.', 'DEN', 2020, ['SF', 'PF'], 2020, 2025, 366, 20, {
    mp: 30.0, pts: 16.1, trb: 6.6, ast: 1.3, stl: 0.7, blk: 0.5, tov: 1.2,
    fga: 11.8, fgp: 0.489, tpa: 5.9, tpp: 0.409, fta: 1.9, ftp: 0.789,
  }),
  entry('Aaron Gordon', 'DEN', 2020, ['PF'], 2021, 2025, 320, 19, {
    mp: 31.0, pts: 14.6, trb: 6.2, ast: 3.2, stl: 0.7, blk: 0.7, tov: 1.6,
    fga: 10.4, fgp: 0.539, tpa: 2.4, tpp: 0.349, fta: 3.6, ftp: 0.681,
  }),
  entry('Kentavious Caldwell-Pope', 'DEN', 2020, ['SG'], 2023, 2024, 152, 13, {
    mp: 31.5, pts: 10.2, trb: 2.6, ast: 2.4, stl: 1.4, blk: 0.5, tov: 1.0,
    fga: 7.6, fgp: 0.469, tpa: 4.4, tpp: 0.421, fta: 1.4, ftp: 0.861,
  }),
  entry('Will Barton', 'DEN', 2020, ['SG', 'SF'], 2020, 2022, 187, 20, {
    mp: 32.0, pts: 14.6, trb: 4.8, ast: 4.0, stl: 1.0, blk: 0.4, tov: 1.6,
    fga: 12.0, fgp: 0.439, tpa: 5.4, tpp: 0.361, fta: 2.2, ftp: 0.799,
  }),
  entry('Monte Morris', 'DEN', 2020, ['PG'], 2020, 2022, 218, 17, {
    mp: 26.0, pts: 10.6, trb: 2.4, ast: 4.0, stl: 0.8, blk: 0.2, tov: 0.8,
    fga: 8.8, fgp: 0.481, tpa: 3.0, tpp: 0.391, fta: 1.0, ftp: 0.829,
  }),
  entry('Bruce Brown', 'DEN', 2020, ['SG', 'PF'], 2023, 2023, 80, 17, {
    mp: 28.5, pts: 11.5, trb: 4.1, ast: 3.4, stl: 1.1, blk: 0.6, tov: 1.3,
    fga: 8.8, fgp: 0.483, tpa: 2.7, tpp: 0.358, fta: 2.0, ftp: 0.758,
  }),

  // ── 2020s Boston ──────────────────────────────────────────────────────────
  entry('Jayson Tatum', 'BOS', 2020, ['SF', 'PF'], 2020, 2025, 432, 31, {
    mp: 36.0, pts: 27.3, trb: 8.4, ast: 4.8, stl: 1.1, blk: 0.6, tov: 2.8,
    fga: 20.4, fgp: 0.459, tpa: 9.0, tpp: 0.369, fta: 6.4, ftp: 0.831,
  }),
  entry('Jaylen Brown', 'BOS', 2020, ['SG', 'SF'], 2020, 2025, 410, 29, {
    mp: 34.5, pts: 24.4, trb: 6.0, ast: 3.5, stl: 1.1, blk: 0.4, tov: 2.7,
    fga: 18.8, fgp: 0.481, tpa: 6.5, tpp: 0.354, fta: 4.7, ftp: 0.739,
  }),
  entry('Marcus Smart', 'BOS', 2020, ['PG', 'SG'], 2020, 2023, 273, 17, {
    mp: 32.0, pts: 11.6, trb: 3.5, ast: 5.7, stl: 1.6, blk: 0.4, tov: 2.1,
    fga: 9.7, fgp: 0.414, tpa: 5.4, tpp: 0.334, fta: 1.9, ftp: 0.799,
  }),
  entry('Derrick White', 'BOS', 2020, ['PG', 'SG'], 2022, 2025, 280, 18, {
    mp: 31.0, pts: 14.4, trb: 3.8, ast: 4.5, stl: 0.9, blk: 1.0, tov: 1.5,
    fga: 10.8, fgp: 0.449, tpa: 6.2, tpp: 0.384, fta: 2.4, ftp: 0.879,
  }),
  entry('Al Horford', 'BOS', 2020, ['C', 'PF'], 2022, 2025, 255, 13, {
    mp: 29.0, pts: 9.1, trb: 6.3, ast: 2.8, stl: 0.7, blk: 1.0, tov: 0.9,
    fga: 7.0, fgp: 0.469, tpa: 4.3, tpp: 0.399, fta: 0.7, ftp: 0.831,
  }),
  entry('Jrue Holiday', 'BOS', 2020, ['PG', 'SG'], 2024, 2025, 131, 16, {
    mp: 31.5, pts: 11.7, trb: 4.7, ast: 4.3, stl: 1.0, blk: 0.7, tov: 1.7,
    fga: 9.0, fgp: 0.471, tpa: 4.4, tpp: 0.414, fta: 1.5, ftp: 0.799,
  }),
  entry('Kristaps Porzingis', 'BOS', 2020, ['C', 'PF'], 2024, 2025, 99, 27, {
    mp: 29.0, pts: 19.7, trb: 6.9, ast: 1.9, stl: 0.7, blk: 1.7, tov: 1.6,
    fga: 13.4, fgp: 0.511, tpa: 5.1, tpp: 0.374, fta: 4.7, ftp: 0.841,
  }),
  entry('Robert Williams', 'BOS', 2020, ['C'], 2020, 2023, 168, 12, {
    mp: 23.5, pts: 8.0, trb: 8.3, ast: 1.6, stl: 0.9, blk: 1.8, tov: 1.0,
    fga: 5.4, fgp: 0.721, tpa: 0, tpp: 0, fta: 1.8, ftp: 0.631,
  }),

  // ── 2020s Milwaukee ───────────────────────────────────────────────────────
  entry('Giannis Antetokounmpo', 'MIL', 2020, ['PF', 'C'], 2020, 2025, 396, 33, {
    mp: 33.5, pts: 29.6, trb: 11.7, ast: 5.9, stl: 1.0, blk: 1.2, tov: 3.4,
    fga: 19.4, fgp: 0.571, tpa: 2.5, tpp: 0.281, fta: 10.5, ftp: 0.661,
  }),
  entry('Damian Lillard', 'MIL', 2020, ['PG'], 2024, 2025, 131, 29, {
    mp: 35.5, pts: 24.6, trb: 4.5, ast: 7.0, stl: 1.0, blk: 0.3, tov: 2.8,
    fga: 17.6, fgp: 0.429, tpa: 9.6, tpp: 0.361, fta: 6.5, ftp: 0.921,
  }),
  entry('Khris Middleton', 'MIL', 2020, ['SF', 'SG'], 2020, 2024, 263, 24, {
    mp: 31.5, pts: 18.1, trb: 5.2, ast: 4.8, stl: 1.0, blk: 0.2, tov: 2.4,
    fga: 14.0, fgp: 0.469, tpa: 5.5, tpp: 0.389, fta: 3.4, ftp: 0.881,
  }),
  entry('Jrue Holiday', 'MIL', 2020, ['PG', 'SG'], 2021, 2023, 203, 24, {
    mp: 33.0, pts: 18.6, trb: 4.8, ast: 6.9, stl: 1.6, blk: 0.5, tov: 2.7,
    fga: 14.7, fgp: 0.481, tpa: 5.4, tpp: 0.389, fta: 2.7, ftp: 0.799,
  }),
  entry('Brook Lopez', 'MIL', 2020, ['C'], 2020, 2025, 360, 18, {
    mp: 28.5, pts: 12.6, trb: 5.0, ast: 1.3, stl: 0.6, blk: 2.2, tov: 1.1,
    fga: 9.3, fgp: 0.479, tpa: 4.5, tpp: 0.354, fta: 1.7, ftp: 0.801,
  }),
  entry('Bobby Portis', 'MIL', 2020, ['PF', 'C'], 2021, 2025, 340, 20, {
    mp: 25.0, pts: 12.4, trb: 8.0, ast: 1.6, stl: 0.7, blk: 0.3, tov: 1.1,
    fga: 9.9, fgp: 0.489, tpa: 3.4, tpp: 0.389, fta: 1.4, ftp: 0.791,
  }),
  entry('Pat Connaughton', 'MIL', 2020, ['SG', 'SF'], 2020, 2024, 320, 12, {
    mp: 23.5, pts: 7.6, trb: 4.2, ast: 1.5, stl: 0.6, blk: 0.3, tov: 0.6,
    fga: 6.2, fgp: 0.434, tpa: 4.0, tpp: 0.374, fta: 0.7, ftp: 0.781,
  }),
  entry('Grayson Allen', 'MIL', 2020, ['SG'], 2022, 2023, 138, 14, {
    mp: 27.0, pts: 10.6, trb: 3.3, ast: 2.0, stl: 0.8, blk: 0.2, tov: 0.8,
    fga: 7.6, fgp: 0.456, tpa: 4.9, tpp: 0.404, fta: 1.3, ftp: 0.879,
  }),
];
