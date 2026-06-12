/**
 * The draftable player list for the current combo. With sortable stat
 * columns (Classic) or blind (Hoop IQ / hidden head-to-head). Selecting a
 * player reveals the slot buttons; out-of-position slots are offered with
 * their penalty labeled, so the draft can never dead-end.
 */
import { useMemo, useState } from 'react';
import { DATASET } from '../data/dataset';
import { POSITIONS, type PlayerEntry, type Position } from '../data/types';
import {
  assignmentOptions,
  normalizePlayer,
  poolHasNaturalFit,
  type NormalizedPlayer,
  type Roster,
} from '../engine';
import { fmt1, fmtPct0, spanLabel } from './format';

const ADJUSTED_KEY = 'hardwoodgm.draftAdjusted.v1';

// Default ON: per-36 era-adjusted values are what the engine actually
// simulates with, so they're the truest read on draft value.
function loadAdjusted(): boolean {
  try {
    return localStorage.getItem(ADJUSTED_KEY) !== '0';
  } catch {
    return true;
  }
}

interface PlayerTableProps {
  pool: PlayerEntry[];
  roster: Roster;
  showStats: boolean;
  onPick: (player: PlayerEntry, position: Position) => void;
}

type SortKey = 'name' | 'pts' | 'trb' | 'ast' | 'stl' | 'blk' | 'fgPct' | 'tpPct' | 'ftPct';

const STAT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'pts', label: 'PPG' },
  { key: 'trb', label: 'RPG' },
  { key: 'ast', label: 'APG' },
  { key: 'stl', label: 'SPG' },
  { key: 'blk', label: 'BPG' },
  { key: 'fgPct', label: 'FG%' },
  { key: 'tpPct', label: '3P%' },
  { key: 'ftPct', label: 'FT%' },
];

const ADJUSTED_LABELS: Partial<Record<SortKey, string>> = {
  pts: 'P/36',
  trb: 'R/36',
  ast: 'A/36',
  stl: 'S/36',
  blk: 'B/36',
  fgPct: '2P%',
};

const SORT_LABELS: Record<SortKey, string> = {
  name: 'Name',
  pts: 'Points',
  trb: 'Rebounds',
  ast: 'Assists',
  stl: 'Steals',
  blk: 'Blocks',
  fgPct: 'FG%',
  tpPct: '3P%',
  ftPct: 'FT%',
};

export function PlayerTable({ pool, roster, showStats, onPick }: PlayerTableProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(showStats ? 'pts' : 'name');
  const [sortDesc, setSortDesc] = useState(showStats);
  const [posFilter, setPosFilter] = useState<Position | null>(null);
  const [adjusted, setAdjustedState] = useState(loadAdjusted);
  const setAdjusted = (v: boolean) => {
    setAdjustedState(v);
    try {
      localStorage.setItem(ADJUSTED_KEY, v ? '1' : '0');
    } catch {
      /* ignore */
    }
  };

  // Era-adjusted view: the per-36 common-era rates the engine actually uses.
  const normById = useMemo(() => {
    if (!showStats) return new Map<string, NormalizedPlayer>();
    return new Map(pool.map((p) => [p.id, normalizePlayer(p, DATASET.leagueContext)]));
  }, [pool, showStats]);

  const value = (p: PlayerEntry, key: SortKey): number | string => {
    if (key === 'name') return p.name;
    if (adjusted) {
      const n = normById.get(p.id);
      if (n) {
        switch (key) {
          case 'fgPct': return n.p2;
          case 'tpPct': return n.p3;
          case 'ftPct': return n.ft;
          default: return n[key];
        }
      }
    }
    return p.stats[key];
  };

  const filtered = posFilter ? pool.filter((p) => p.positions.includes(posFilter)) : pool;
  const sorted = [...filtered].sort((a, b) => {
    const va = value(a, sortKey);
    const vb = value(b, sortKey);
    const cmp =
      typeof va === 'string' || typeof vb === 'string'
        ? String(va).localeCompare(String(vb))
        : va - vb;
    return sortDesc ? -cmp : cmp;
  });

  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortDesc(!sortDesc);
    else {
      setSortKey(key);
      setSortDesc(key !== 'name');
    }
  };

  const arrow = (key: SortKey) => (sortKey === key ? (sortDesc ? ' ▾' : ' ▴') : '');
  const anyNaturalFit = poolHasNaturalFit(pool, roster);
  const sortChoices: SortKey[] = showStats
    ? ['pts', 'trb', 'ast', 'stl', 'blk', 'fgPct', 'tpPct', 'ftPct', 'name']
    : ['name'];

  return (
    <div className="player-table-wrap">
      {!anyNaturalFit && (
        <p className="notice">
          No player here fits your remaining slots naturally — assign someone out of
          position (penalty shown) to keep going.
        </p>
      )}

      <div className="table-controls">
        <div className="filter-chips" role="group" aria-label="Filter by position">
          <span className="muted">Position:</span>
          <button
            className={`chip ${posFilter === null ? 'chip-active' : ''}`}
            onClick={() => setPosFilter(null)}
          >
            All
          </button>
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              className={`chip ${posFilter === pos ? 'chip-active' : ''}`}
              onClick={() => setPosFilter(posFilter === pos ? null : pos)}
            >
              {pos}
            </button>
          ))}
        </div>
        {showStats && (
          <div className="basis-control">
            <div
              className="seg-toggle"
              role="group"
              aria-label="Stat basis"
              title="Per-36 era-adjusted values are what the engine simulates with. Raw = source per-game box score, for recognition only."
            >
              <button
                className={`seg-option ${adjusted ? 'seg-active' : ''}`}
                onClick={() => setAdjusted(true)}
              >
                Per-36 ★
              </button>
              <button
                className={`seg-option ${!adjusted ? 'seg-active' : ''}`}
                onClick={() => setAdjusted(false)}
              >
                Raw
              </button>
            </div>
            <span className="basis-hint muted">
              {adjusted ? '★ what the sim uses — judge value by these' : 'historical box score'}
            </span>
          </div>
        )}
        {showStats && (
          <label className="sort-control">
            <span className="muted">Sort by</span>
            <select
              value={sortKey}
              onChange={(e) => {
                const key = e.target.value as SortKey;
                setSortKey(key);
                setSortDesc(key !== 'name');
              }}
            >
              {sortChoices.map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
            <button
              className="btn chip"
              onClick={() => setSortDesc(!sortDesc)}
              title="Flip sort direction"
            >
              {sortDesc ? '▾ high → low' : '▴ low → high'}
            </button>
          </label>
        )}
      </div>

      {sorted.length === 0 && (
        <p className="notice">
          Nobody in this pool plays {posFilter} — clear the filter to see everyone.
        </p>
      )}
      <table className="player-table">
        <thead>
          <tr>
            <th className="left sortable" onClick={() => onSort('name')}>
              Player{arrow('name')}
            </th>
            <th className="left">Pos</th>
            <th className="left">Seasons</th>
            {showStats &&
              STAT_COLUMNS.map((col) => (
                <th key={col.key} className="sortable" onClick={() => onSort(col.key)}>
                  {adjusted ? (ADJUSTED_LABELS[col.key] ?? col.label) : col.label}
                  {arrow(col.key)}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => {
            const selected = p.id === selectedId;
            return (
              <PlayerRow
                key={p.id}
                player={p}
                norm={adjusted ? normById.get(p.id) : undefined}
                showStats={showStats}
                selected={selected}
                options={assignmentOptions(p, roster)}
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
  /** Present when the era-adjusted view is on. */
  norm?: NormalizedPlayer;
  showStats: boolean;
  selected: boolean;
  options: ReturnType<typeof assignmentOptions>;
  onSelect: () => void;
  onPick: (position: Position) => void;
}

function PlayerRow({ player, norm, showStats, selected, options, onSelect, onPick }: PlayerRowProps) {
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
        {showStats && norm && (
          <>
            <td>{fmt1(norm.pts)}</td>
            <td>{fmt1(norm.trb)}</td>
            <td>{fmt1(norm.ast)}</td>
            <td>{fmt1(norm.stl)}</td>
            <td>{fmt1(norm.blk)}</td>
            <td>{fmtPct0(norm.p2)}</td>
            <td>{norm.tpa > 0.05 ? fmtPct0(norm.p3) : '—'}</td>
            <td>{fmtPct0(norm.ft)}</td>
          </>
        )}
        {showStats && !norm && (
          <>
            <td>{fmt1(s.pts)}</td>
            <td>{fmt1(s.trb)}</td>
            <td>{fmt1(s.ast)}</td>
            <td>{fmt1(s.stl)}</td>
            <td>{fmt1(s.blk)}</td>
            <td>{fmtPct0(s.fgPct)}</td>
            <td>{s.tpa > 0 ? fmtPct0(s.tpPct) : '—'}</td>
            <td>{fmtPct0(s.ftPct)}</td>
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
