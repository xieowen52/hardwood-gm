/** How-to-play modal; auto-shown on first visit, reopenable from Home. */

interface RulesModalProps {
  onClose: () => void;
}

export function RulesModal({ onClose }: RulesModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>How to play</h2>

        <h3>Classic</h3>
        <p>
          Five rounds. Each round the wheel draws a <strong>decade + franchise</strong>{' '}
          (say, 1990s Chicago) and you draft one player from that pool — full stat
          lines shown. Fill all five slots (PG/SG/SF/PF/C), then the engine simulates
          an 82-game season against a league-average team and projects your record.
        </p>

        <h3>Hoop IQ</h3>
        <p>
          Same draft, but <strong>no stats</strong> — names, positions and seasons only.
          You draft from memory; the results screen reveals what you actually took.
        </p>

        <h3>Head-to-Head</h3>
        <p>
          Two drafters, one machine. Each round both draft from the <strong>same</strong>{' '}
          wheel draw (picks come off the shared pool), snake order alternating who goes
          first. Then your teams play a possession-by-possession best-of-7.
        </p>

        <h3>Good to know</h3>
        <ul>
          <li>One re-roll token per game lets you re-spin the wheel once.</li>
          <li>
            Stats are era-adjusted: a 1965 stat line is converted to a common era
            (pace + league efficiency) before the sim, so decades compete fairly.
          </li>
          <li>
            Any player can fill any open slot, but out-of-position assignments carry a
            clearly-shown penalty — bigger the farther from their real spot.
          </li>
          <li>
            Watch team chemistry: five ball-dominant stars (usage overlap) or zero
            shooters (spacing) will cost you efficiency. The results screen explains every factor.
          </li>
        </ul>

        <button className="btn btn-primary" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
