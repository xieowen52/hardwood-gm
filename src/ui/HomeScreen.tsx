/** Home: mode select, head-to-head setup, run history (reopenable), how-to-play. */
import { useState } from 'react';
import { COMBOS, DATASET } from '../data/dataset';
import { clearHistory, type HistoryEntry } from '../state/history';
import { entryReopenable } from '../state/reopen';

interface HomeScreenProps {
  history: HistoryEntry[];
  onHistoryCleared: () => void;
  onStartSolo: (mode: 'classic' | 'hoopiq') => void;
  onStartH2H: (names: [string, string], statsVisible: boolean) => void;
  onShowRules: () => void;
  onShowFormula: () => void;
  onOpenEntry: (entry: HistoryEntry) => void;
}

const MODE_LABELS: Record<string, string> = {
  classic: 'Classic',
  hoopiq: 'Hoop IQ',
  h2h: 'Head-to-Head',
};

export function HomeScreen({
  history,
  onHistoryCleared,
  onStartSolo,
  onStartH2H,
  onShowRules,
  onShowFormula,
  onOpenEntry,
}: HomeScreenProps) {
  const [h2hOpen, setH2hOpen] = useState(false);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [statsVisible, setStatsVisible] = useState(true);

  return (
    <div className="screen home-screen">
      <header className="home-header">
        <div className="home-kicker">🏀 spin · draft · simulate</div>
        <h1 className="home-title">Hardwood GM</h1>
        <p className="home-sub">
          Each round deals you a decade and a franchise. You build the all-time five.
          The engine plays the games — possession by possession.
        </p>
        <div className="row-gap home-actions">
          <button className="btn btn-ghost" onClick={onShowRules}>
            ❓ How to play
          </button>
          <button className="btn btn-ghost" onClick={onShowFormula}>
            🧮 The formula
          </button>
        </div>
      </header>

      <section className="mode-grid">
        <button className="mode-card" onClick={() => onStartSolo('classic')}>
          <div className="mode-emoji">📊</div>
          <h2>Classic</h2>
          <p>Draft with full stat lines. Chase the perfect 82-0.</p>
          <span className="mode-cta">Play →</span>
        </button>
        <button className="mode-card" onClick={() => onStartSolo('hoopiq')}>
          <div className="mode-emoji">🧠</div>
          <h2>Hoop IQ</h2>
          <p>Blind draft — names only. How well do you really know ball?</p>
          <span className="mode-cta">Play →</span>
        </button>
        <div
          className={`mode-card ${h2hOpen ? 'mode-card-open' : ''}`}
          role="button"
          tabIndex={0}
          onClick={() => setH2hOpen(true)}
          onKeyDown={(e) => {
            if (!h2hOpen && (e.key === 'Enter' || e.key === ' ')) setH2hOpen(true);
          }}
        >
          <div className="mode-emoji">⚔️</div>
          <h2>Head-to-Head</h2>
          <p>Pass-and-play snake draft, then a best-of-7 sim.</p>
          {!h2hOpen && <span className="mode-cta">Set up →</span>}
          {h2hOpen && (
            <div className="h2h-setup" onClick={(e) => e.stopPropagation()}>
              <input
                placeholder="Player 1 name"
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                maxLength={18}
              />
              <input
                placeholder="Player 2 name"
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                maxLength={18}
              />
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={statsVisible}
                  onChange={(e) => setStatsVisible(e.target.checked)}
                />
                Show stats while drafting
              </label>
              <div className="row-gap">
                <button
                  className="btn btn-primary"
                  onClick={() => onStartH2H([p1.trim() || 'Player 1', p2.trim() || 'Player 2'], statsVisible)}
                >
                  Start
                </button>
                <button className="btn btn-ghost" onClick={() => setH2hOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="history-section">
        <div className="row-between">
          <h3>Past runs</h3>
          {history.length > 0 && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                clearHistory();
                onHistoryCleared();
              }}
            >
              Clear
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="muted">No runs yet — your results will show up here.</p>
        ) : (
          <ul className="history-list">
            {history.slice(0, 12).map((h) => (
              <li key={h.id} title={h.rosterNames.join(', ')}>
                <span className="history-mode">{MODE_LABELS[h.mode] ?? h.mode}</span>
                <strong className="history-summary">{h.summary}</strong>
                <span className="muted history-detail">
                  {new Date(h.date).toLocaleDateString()} · {h.rosterNames.slice(0, 5).join(', ')}
                  {h.rosterNames.length > 5 ? '…' : ''}
                </span>
                {entryReopenable(h) && (
                  <button className="btn btn-ghost history-open" onClick={() => onOpenEntry(h)}>
                    Open ↗
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="app-footer muted">
        <p>
          Dataset: {DATASET.label} · {DATASET.players.length} player entries ·{' '}
          {COMBOS.length} franchise-decade pools on the wheel.
        </p>
        <p>
          A fan-made statistics game. Not affiliated with, sponsored or endorsed by the
          NBA or NBPA. Player names and statistics are factual, historical references;
          no team logos or trademarks are used.
        </p>
      </footer>
    </div>
  );
}
