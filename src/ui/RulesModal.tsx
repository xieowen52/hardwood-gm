/** How-to-play modal; auto-shown on first visit, reopenable from Home. */
import { useEscape } from './useEscape';

interface RulesModalProps {
  onClose: () => void;
}

export function RulesModal({ onClose }: RulesModalProps) {
  useEscape(onClose);
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
        <div className="tips-grid">
          <div className="tip-card">
            <h4>🔁 Two re-roll tokens</h4>
            <p>One re-spins the team (same era), one re-spins the era (same team). Burn both in one turn for a fresh start.</p>
          </div>
          <div className="tip-card">
            <h4>⏳ Eras compete fairly</h4>
            <p>Every stat line is converted to a common era — pace and league efficiency — before the sim.</p>
          </div>
          <div className="tip-card">
            <h4>🔀 Rearrange anytime</h4>
            <p>Tap two roster slots to swap players mid-draft. Fit penalties update live.</p>
          </div>
          <div className="tip-card">
            <h4>⚠️ Position fit costs</h4>
            <p>Anyone can fill any open slot, but the penalty grows with distance — a center at shooting guard hurts.</p>
          </div>
          <div className="tip-card">
            <h4>🧪 Chemistry is real</h4>
            <p>Five ball-dominant stars or zero shooters drain efficiency. The results screen itemizes every factor.</p>
          </div>
          <div className="tip-card">
            <h4>🧮 No hidden dice</h4>
            <p>Check <strong>The formula</strong> on the home screen for exactly what the engine rewards.</p>
          </div>
        </div>

        <button className="btn btn-primary modal-cta" onClick={onClose}>
          Let's hoop
        </button>
      </div>
    </div>
  );
}
