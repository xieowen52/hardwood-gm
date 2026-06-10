/**
 * The synthetic league-average opponent used by the solo season sim.
 * Five identical players with baseline-era rates, so the drafted team's
 * projected record measures it against "an average modern NBA team".
 */
import { POSITIONS, type PlayerEntry } from '../data/types';
import { BASELINE, FIT, POSSESSION } from './config';
import type { NormalizedPlayer } from './normalize';
import type { SimPlayer, TeamProfile } from './team';

/** Per-36 baseline rates for one average player (team totals / 5 * 36/48). */
const AVG = {
  pts: 16.5, trb: 6.6, ast: 3.6, stl: 1.1, blk: 0.7, tov: 2.0,
  fga: 12.8, tpa: 4.5, fta: 3.3,
  p2: 0.505, p3: BASELINE.tpPct, ft: BASELINE.ftPct,
  usage: 20,
} as const;

function avgEntry(slot: string): PlayerEntry {
  return {
    id: `league-average-${slot.toLowerCase()}`,
    name: `Average ${slot}`,
    franchiseId: 'NYK', // never displayed; required by the type
    decade: 2020,
    positions: [slot as PlayerEntry['positions'][number]],
    from: 2024,
    to: 2024,
    games: 82,
    stats: {
      mp: 36, pts: AVG.pts, trb: AVG.trb, ast: AVG.ast, stl: AVG.stl,
      blk: AVG.blk, tov: AVG.tov, fga: AVG.fga, fgPct: BASELINE.fgPct,
      tpa: AVG.tpa, tpPct: AVG.p3, fta: AVG.fta, ftPct: AVG.ft,
    },
    usagePct: AVG.usage,
  };
}

export function leagueAverageTeam(name = 'League Average'): TeamProfile {
  const players: SimPlayer[] = POSITIONS.map((slot) => {
    const norm: NormalizedPlayer = {
      entry: avgEntry(slot),
      pts: AVG.pts, trb: AVG.trb, ast: AVG.ast, stl: AVG.stl, blk: AVG.blk,
      tov: AVG.tov, fga: AVG.fga, tpa: AVG.tpa, fta: AVG.fta,
      p2: AVG.p2, p3: AVG.p3, ft: AVG.ft,
      tpaShare: AVG.tpa / AVG.fga,
      ftRate: AVG.fta / AVG.fga,
      usage: AVG.usage,
      defScore: AVG.stl * 0.6 + AVG.blk * 0.7,
    };
    return {
      norm,
      slot,
      oopDistance: 0,
      p2: norm.p2,
      p3: norm.p3,
      ft: norm.ft,
      shotWeight: norm.usage,
      reb: norm.trb,
      def: norm.defScore,
    };
  });

  const minutesScale = 48 / 36;
  const totalReb = players.reduce((s, p) => s + p.reb, 0) * minutesScale;
  const rawTov = (AVG.tov * 5 * minutesScale) / POSSESSION.basePossessions;
  return {
    name,
    players,
    tovPerPoss: FIT.tovCenter + (rawTov - FIT.tovCenter) * FIT.tovSpreadKept,
    orbStrength: totalReb * POSSESSION.orbShare,
    drbStrength: totalReb * (1 - POSSESSION.orbShare),
    stealPressure: (AVG.stl * 5 * minutesScale) / POSSESSION.basePossessions,
    teamDefScore: AVG.stl * 0.6 + AVG.blk * 0.7,
    expectedThrees: AVG.tpa * AVG.p3 * 5 * minutesScale,
    factors: [],
  };
}
