/**
 * The draftable player list for the current combo. With stats (Classic) or
 * blind (Hoop IQ / hidden head-to-head). Selecting a player reveals the slot
 * buttons; out-of-position slots are offered with their penalty labeled, so
 * the draft can never dead-end.
 */
import { useState } from 'react';
import type { PlayerEntry, Position } from '../data/types';
import { assignmentOptions, poolHasNaturalFit, type Roster } from '../engine';
import { fmt1, fmtPct, spanLabel } from './format';

interface PlayerTableProps {
  pool: PlayerEntry[];
  roster: Roster;
  showStats: boolean;
  onPick: (player: PlayerEntry, position: Position) => void;
}

export function PlayerTable({ pool, roster, showStats, onPick }: PlayerTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = [...pool].sort((a, b) =>
    showStats ? b.stats.pts - a.stats.pts : a.name.localeCompare(b.name),
  );
  const anyNaturalFit = poolHasNaturalFit(pool, roster);

  return (
    <div className="player-table-wrap">
      {!anyNaturalFit && (
        <p className="notice">
          No player here fits your remaining slots naturally — assign someone out of
          position (penalty shown) to keep going.
        </p>
      )}
      <table className="player-table">
        <thead>
          <tr>
            <th className="left">Player</th>
            <th className="left">Pos</th>
            <th className="left">Seasons</th>
            {showStats && (
              <>
                <th>PPG</th>
                <th>RPG</th>
                <th>APG</th>
                <th>SPG</th>
                <th>BPG</th>
                <th>FG%</th>
                <th>3P%</th>
                <th>FT%</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => {
            const selected = p.id === selectedId;
            const options = assignmentOptions(p, roster);
            return (
              <PlayerRow
                key={p.id}
                player={p}
                showStats={showStats}
                selected={selected}
                options={options}
                onSelect={() => setSelectedId(selected ? null : p.id)}
                onPick={(pos) => onPick(p, pos)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface PlayerRowProps {
  player: PlayerEntry;
  showStats: boolean;
  selected: boolean;
  options: ReturnType<typeof assignmentOptions>;
  onSelect: () => void;
  onPick: (position: Position) => void;
}

function PlayerRow({ player, showStats, selected, options, onSelect, onPick }: PlayerRowProps) {
  const s = player.stats;
  const cols = showStats ? 11 : 3;
  return (
    <>
      <tr
        className={`player-row ${selected ? 'player-row-selected' : ''}`}
        onClick={onSelect}
      >
        <td className="left strong">{player.name}</td>
        <td className="left">{player.positions.join('/')}</td>
        <td className="left muted">{spanLabel(player)}</td>
        {showStats && (
          <>
            <td>{fmt1(s.pts)}</td>
            <td>{fmt1(s.trb)}</td>
            <td>{fmt1(s.ast)}</td>
            <td>{fmt1(s.stl)}</td>
            <td>{fmt1(s.blk)}</td>
            <td>{fmtPct(s.fgPct)}</td>
            <td>{s.tpa > 0 ? fmtPct(s.tpPct) : '—'}</td>
            <td>{fmtPct(s.ftPct)}</td>
          </>
        )}
      </tr>
      {selected && (
        <tr className="assign-row">
          <td colSpan={cols}>
            <div className="assign-bar">
              <span className="muted">Assign to:</span>
              {options.map((o) => (
                <button
                  key={o.position}
                  className={o.distance === 0 ? 'btn btn-primary' : 'btn btn-warning'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPick(o.position);
                  }}
                >
                  {o.position}
                  {o.distance > 0 && (
                    <span className="penalty"> −{o.distance * 5}% fit</span>
                  )}
                </button>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
