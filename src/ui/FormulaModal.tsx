/**
 * "The formula" — player-facing explanation of exactly what the engine
 * rewards and punishes, so drafting well is a skill, not a guess.
 */
import { useEscape } from './useEscape';

interface FormulaModalProps {
  onClose: () => void;
}

export function FormulaModal({ onClose }: FormulaModalProps) {
  useEscape(onClose);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-ball">🧮</span>
          <h2>The formula</h2>
          <p className="muted">What the engine actually rewards — no hidden dice.</p>
        </div>

        <div className="tips-grid">
          <div className="tip-card">
            <h4>⏳ Every era plays fair</h4>
            <p>
              Stats are converted to a common era before anything else: per-36
              minutes, pace-adjusted (a 1962 stat line loses its 125-possession
              inflation), and shooting is measured <em>against the league of its
              time</em>. Shooting 49% in a league that shot 42% counts like ~54%
              today.
            </p>
          </div>
          <div className="tip-card">
            <h4>⭐ Stars create shots</h4>
            <p>
              High scoring volume raises shot quality (up to ±13.5%) — a 30 ppg
              scorer doesn't just hit shots, he generates good ones. Role players
              forced into a bigger shot share than their usual usage lose efficiency
              fast.
            </p>
          </div>
          <div className="tip-card">
            <h4>🏀 Usage has a ceiling</h4>
            <p>
              Combined usage over 125% costs efficiency (capped −5%): five
              ball-dominant alphas can't all eat. It's friction, not a wall — stars
              still beat role players. Below ~88% nobody creates, which also hurts.
            </p>
          </div>
          <div className="tip-card">
            <h4>🎯 Spacing matters</h4>
            <p>
              Expected made threes above ~9 a game opens the floor (up to +2.2%
              inside scoring); an all-pre-1980 lineup plays cramped and eats the
              penalty.
            </p>
          </div>
          <div className="tip-card">
            <h4>⚠️ Position fit</h4>
            <p>
              Out-of-position costs −5% shooting, rebounding and defense per step
              along PG–SG–SF–PF–C. A center at shooting guard (3 steps) gives up
              −15%. Rearranging your slots mid-draft is free.
            </p>
          </div>
          <div className="tip-card">
            <h4>🛡️ Defense & glass win games</h4>
            <p>
              Steals and blocks rate each player's defense; your PG guards their PG,
              and elite rim protection suppresses make rates (up to −15%). Rebounding
              strength converts misses into second-chance points.
            </p>
          </div>
          <div className="tip-card">
            <h4>🤝 Playmaking lifts everyone</h4>
            <p>
              Team assists above ~18 per-36-five buy up to +2% shot quality —
              a true point guard makes the other four better.
            </p>
          </div>
          <div className="tip-card">
            <h4>🏠 Home court & luck</h4>
            <p>
              Home teams get ~1.2% on make probabilities (41/41 in a season,
              2-2-1-1-1 in a series), and every game carries small form noise — a
              perfect draft still has to survive 82 coin-edges to go 82-0.
            </p>
          </div>
        </div>

        <button className="btn btn-primary modal-cta" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
