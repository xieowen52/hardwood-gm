/**
 * The built-in SAMPLE dataset: ~165 hand-written player entries across 20
 * franchise-decade combos (1960s through 2020s), so the whole app works
 * before any real data is ingested. Replace it by running scripts/ingest.ts
 * on a real CSV (see README) — the app picks up the generated file
 * automatically.
 */
import type { Dataset } from '../types';
import { SAMPLE_LEAGUE_CONTEXT } from './leagueContext';
import { PLAYERS_1960S_70S } from './players1960s70s';
import { PLAYERS_1980S } from './players1980s';
import { PLAYERS_1990S } from './players1990s';
import { PLAYERS_2000S } from './players2000s';
import { PLAYERS_2010S } from './players2010s';
import { PLAYERS_2020S } from './players2020s';

export const SAMPLE_DATASET: Dataset = {
  source: 'sample',
  label: 'Built-in sample data (approximate stats)',
  players: [
    ...PLAYERS_1960S_70S,
    ...PLAYERS_1980S,
    ...PLAYERS_1990S,
    ...PLAYERS_2000S,
    ...PLAYERS_2010S,
    ...PLAYERS_2020S,
  ],
  leagueContext: SAMPLE_LEAGUE_CONTEXT,
};
