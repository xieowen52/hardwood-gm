/**
 * Filled/open roster slots for one team during the draft. When `onSwap` is
 * provided, players can be rearranged after placement: tap a filled slot,
 * then tap any other slot to move or swap (penalties update live).
 * A live build meter shows the chemistry numbers (usage / threes / boards /
 * assists) BEFORE the sim, so every results-screen penalty is foreseeable.
 */
import { useMemo, useState } from 'react';
import { DATASET } from '../data/dataset';
import { POSITIONS, type Position } from '../data/types';
import { normalizePlayer, positionDistance, rosterPlayers, type Roster } from '../engine';
import { fmt1, playerComboLabel } from './format';

/** Chemistry thresholds mirrored from engine config (display only). */
const METER = { usageMax: 125, usageMin: 88, threesNeutral: 9, rebNeutral: 44, astNeutral: 24 };

function BuildMeter({ roster }: { roster: Roster }) {
  const players = rosterPlayers(roster);
  const stats = useMemo(() => {
    const norms = players.map((p) => normalizePlayer(p, DATASET.leagueContext));
    const minutesScale = 48 / 36;
    return {
      usage: norms.reduce((s, n) => s + n.usage, 0),
      threes: norms.reduce((s, n) => s + n.tpa * n.p3, 0) * minutesScale,
      reb: norms.reduce((s, n) => s + n.trb, 0) * minutesScale,
      ast: norms.reduce((s, n) => s + n.ast, 0) * minutesScale,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players.map((p) => p.id).join('|')]);

  if (players.length === 0) return null;
  const partial = players.length < POSITIONS.length;
  const usageClass =
    stats.usage > METER.usageMax ? 'neg' : !partial && stats.usage < METER.usageMin ? 'neg' : 'pos';
  return (
    <div className="build-meter" title="Live chemistry vs the engine's neutral points — full numbers in 'The formula'">
      <span className={usageClass}>
        usage {stats.usage.toFixed(0)}%<span className="muted">/{METER.usageMax}</span>
      </span>
      <span className={stats.threes >= METER.threesNeutral ? 'pos' : partial ? '' : 'neg'}>
        3PM {fmt1(stats.threes)}<span className="muted">/{METER.threesNeutral}</span>
      </span>
      <span className={stats.reb >= METER.rebNeutral ? 'pos' : ''}>
        reb {stats.reb.toFixed(0)}<span className="muted">/{METER.rebNeutral}</span>
      </span>
      <span className={stats.ast >= METER.astNeutral ? 'pos' : ''}>
        ast {stats.ast.toFixed(0)}<span className="muted">/{METER.astNeutral}</span>
      </span>
    </div>
  );
}

interface RosterSidebarProps {
  title: string;
  roster: Roster;
  active?: boolean;
  onSwap?: (a: Position, b: Position) => void;
}

export function RosterSidebar({ title, roster, active = false, onSwap }: RosterSidebarProps) {
  const [grabbed, setGrabbed] = useState<Position | null>(null);
  const filledCount = POSITIONS.filter((p) => roster[p] !== null).length;
  const swappable = onSwap !== undefined && filledCount > 0;

  const clickSlot = (pos: Position) => {
    if (!swappable) return;
    if (grabbed === null) {
      if (roster[pos] !== null) setGrabbed(pos);
      return;
    }
    if (grabbed !== pos && onSwap) onSwap(grabbed, pos);
    setGrabbed(null);
  };

  return (
    <div className={`roster-card ${active ? 'roster-card-active' : ''}`}>
      <h3>{title}</h3>
      <ul className="roster-list">
        {POSITIONS.map((pos) => {
          const p = roster[pos];
          const oop = p ? positionDistance(p, pos) : 0;
          const isGrabbed = grabbed === pos;
          const isTarget = grabbed !== null && grabbed !== pos;
          return (
            <li
              key={pos}
              className={[
                'roster-slot',
                swappable ? 'roster-slot-swappable' : '',
                isGrabbed ? 'roster-slot-grabbed' : '',
                isTarget ? 'roster-slot-target' : '',
              ].join(' ')}
              onClick={() => clickSlot(pos)}
              title={swappable ? (grabbed ? `Move here` : p ? 'Tap to move this player' : '') : undefined}
            >
              <span className="slot-tag">{pos}</span>
              {p ? (
                <span className="slot-player">
                  <strong>{p.name}</strong>
                  <span className="muted"> {playerComboLabel(p)}</span>
                  {oop > 0 && <span className="penalty"> OOP −{oop * 5}%</span>}
                  {swappable && <span className="swap-icon" aria-hidden>⇄</span>}
                </span>
              ) : (
                <span className="muted">{isTarget ? 'move here' : 'open'}</span>
              )}
            </li>
          );
        })}
      </ul>
      <BuildMeter roster={roster} />
      {swappable && (
        <p className="swap-hint muted">
          {grabbed
            ? 'Now tap a destination slot (or the same slot to cancel).'
            : '⇄ Tap a filled slot to rearrange positions.'}
        </p>
      )}
    </div>
  );
}
