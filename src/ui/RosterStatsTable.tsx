/**
 * Drafted roster with full stat lines and a raw ⇄ era-adjusted toggle.
 * Raw = per-game averages from the source span; era-adjusted = the per-36
 * baseline-era rates the engine actually simulates with.
 */
import { useState } from 'react';
import { DATASET } from '../data/dataset';
import { POSITIONS } from '../data/types';
import { normalizePlayer, type Roster } from '../engine';
import { fmt1, fmtPct, playerComboLabel, spanLabel } from './format';

export function RosterStatsTable({ roster }: { roster: Roster }) {
  const [adjusted, setAdjusted] = useState(false);

  return (
    <div>
      <div className="row-between">
        <h3>Your five</h3>
        <label className="toggle">
          <input
            type="checkbox"
            checked={adjusted}
            onChange={(e) => setAdjusted(e.target.checked)}
          />
          Era-adjusted (per 36, common era)
        </label>
      </div>
      <table className="player-table">
        <thead>
          <tr>
            <th className="left">Slot</th>
            <th className="left">Player</th>
            <th className="left">From</th>
            <th>PPG</th>
            <th>RPG</th>
            <th>APG</th>
            <th>SPG</th>
            <th>BPG</th>
            <th>{adjusted ? '2P%' : 'FG%'}</th>
            <th>3P%</th>
            <th>FT%</th>
          </tr>
        </thead>
        <tbody>
          {POSITIONS.map((pos) => {
            const p = roster[pos];
            if (!p) return null;
            if (adjusted) {
              const n = normalizePlayer(p, DATASET.leagueContext);
              return (
                <tr key={pos}>
                  <td className="left">{pos}</td>
                  <td className="left strong">{p.name}</td>
                  <td className="left muted">{playerComboLabel(p)}</td>
                  <td>{fmt1(n.pts)}</td>
                  <td>{fmt1(n.trb)}</td>
                  <td>{fmt1(n.ast)}</td>
                  <td>{fmt1(n.stl)}</td>
                  <td>{fmt1(n.blk)}</td>
                  <td>{fmtPct(n.p2)}</td>
                  <td>{n.tpa > 0.05 ? fmtPct(n.p3) : '—'}</td>
                  <td>{fmtPct(n.ft)}</td>
                </tr>
              );
            }
            const s = p.stats;
            return (
              <tr key={pos}>
                <td className="left">{pos}</td>
                <td className="left strong">{p.name}</td>
                <td className="left muted">
                  {playerComboLabel(p)} · {spanLabel(p)}
                </td>
                <td>{fmt1(s.pts)}</td>
                <td>{fmt1(s.trb)}</td>
                <td>{fmt1(s.ast)}</td>
                <td>{fmt1(s.stl)}</td>
                <td>{fmt1(s.blk)}</td>
                <td>{fmtPct(s.fgPct)}</td>
                <td>{s.tpa > 0 ? fmtPct(s.tpPct) : '—'}</td>
                <td>{fmtPct(s.ftPct)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
