/** Filled/open roster slots for one team during the draft. */
import { POSITIONS } from '../data/types';
import { positionDistance, type Roster } from '../engine';
import { playerComboLabel } from './format';

interface RosterSidebarProps {
  title: string;
  roster: Roster;
  active?: boolean;
}

export function RosterSidebar({ title, roster, active = false }: RosterSidebarProps) {
  return (
    <div className={`roster-card ${active ? 'roster-card-active' : ''}`}>
      <h3>{title}</h3>
      <ul className="roster-list">
        {POSITIONS.map((pos) => {
          const p = roster[pos];
          const oop = p ? positionDistance(p, pos) : 0;
          return (
            <li key={pos} className="roster-slot">
              <span className="slot-tag">{pos}</span>
              {p ? (
                <span className="slot-player">
                  <strong>{p.name}</strong>
                  <span className="muted"> {playerComboLabel(p)}</span>
                  {oop > 0 && <span className="penalty"> OOP −{oop * 5}%</span>}
                </span>
              ) : (
                <span className="muted">open</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
