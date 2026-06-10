/** How-to-play modal; auto-shown on first visit, reopenable from Home. */

interface RulesModalProps {
  onClose: () => void;
}

export function RulesModal({ onClose }: RulesModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-ball">🏀</span>
          <h2>How to play</h2>
          <p className="muted">Five spins. Five picks. One season.</p>
        </div>

        <div className="rules-grid">
          <div className="rules-card">
            <div className="rules-emoji">📊</div>
            <h3>Classic</h3>
            <p>
              Each round the wheel draws a <strong>decade + franchise</strong> and you
              draft one player from that pool, full stat lines on the table. Fill
              PG/SG/SF/PF/C, then the engine simulates an 82-game season and projects
              your record.
            </p>
          </div>
          <div className="rules-card">
            <div className="rules-emoji">🧠</div>
            <h3>Hoop IQ</h3>
            <p>
              Same draft, <strong>no stats</strong> — names, positions and seasons
              only. You draft from memory; the results screen reveals what you
              actually took.
            </p>
          </div>
          <div className="rules-card">
            <div className="rules-emoji">⚔️</div>
            <h3>Head-to-Head</h3>
            <p>
              Two drafters, one machine. Both pick from the <strong>same</strong>{' '}
              wheel draw each round (shared pool, snake order), then your teams play a
              possession-by-possession best-of-7 with home court 2-2-1-1-1.
            </p>
          </div>
        </div>

        <h3 className="rules-subhead">The fine print that wins games</h3>
        <ul className="rules-tips">
          <li>
            🎲 <strong>One re-roll token</strong> per game — re-spin everything, keep
            the era, or keep the franchise.
          </li>
          <li>
            ⏳ <strong>Era-adjusted:</strong> a 1965 stat line is converted to a common
            era (pace + league efficiency) before the sim, so decades compete fairly.
          </li>
          <li>
            🔁 <strong>Rearrange anytime:</strong> tap two roster slots to swap players
            during the draft.
          </li>
          <li>
            ⚠️ <strong>Out of position costs you:</strong> any player can fill any open
            slot, but the fit penalty grows with distance (a center at shooting guard
            hurts).
          </li>
          <li>
            🧪 <strong>Chemistry is real:</strong> five ball-dominant stars (usage
            overlap) or zero shooters (spacing) drain efficiency — the results screen
            itemizes every factor.
          </li>
        </ul>

        <button className="btn btn-primary modal-cta" onClick={onClose}>
          Let's hoop
        </button>
      </div>
    </div>
  );
}
