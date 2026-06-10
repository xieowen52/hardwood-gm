/**
 * Filled/open roster slots for one team during the draft. When `onSwap` is
 * provided, players can be rearranged after placement: tap a filled slot,
 * then tap any other slot to move or swap (penalties update live).
 */
import { useState } from 'react';
import { POSITIONS, type Position } from '../data/types';
import { positionDistance, type Roster } from '../engine';
import { playerComboLabel } from './format';

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
                </span>
              ) : (
                <span className="muted">{isTarget ? 'move here' : 'open'}</span>
              )}
            </li>
          );
        })}
      </ul>
      {swappable && (
        <p className="swap-hint muted">
          {grabbed ? 'Now tap a destination slot (or the same slot to cancel).' : 'Tap a filled slot to rearrange positions.'}
        </p>
      )}
    </div>
  );
}
