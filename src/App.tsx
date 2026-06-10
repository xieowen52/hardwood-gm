/**
 * Top-level screen router. All game state lives in the draft reducer and the
 * engine; this component only decides which screen is visible.
 */
import { useCallback, useState } from 'react';
import {
  initialH2H,
  initialSolo,
  type DraftState,
  type H2HDraftState,
  type SoloDraftState,
} from './state/draftFlow';
import { loadHistory, markRulesSeen, rulesSeen } from './state/history';
import { DraftScreen } from './ui/DraftScreen';
import { H2HResults } from './ui/H2HResults';
import { HomeScreen } from './ui/HomeScreen';
import { RulesModal } from './ui/RulesModal';
import { SoloResults } from './ui/SoloResults';

type Screen =
  | { id: 'home' }
  | { id: 'draft'; initial: DraftState; nonce: number }
  | { id: 'solo-results'; final: SoloDraftState }
  | { id: 'h2h-results'; final: H2HDraftState };

export default function App() {
  const [screen, setScreen] = useState<Screen>({ id: 'home' });
  const [rulesOpen, setRulesOpen] = useState(() => !rulesSeen());
  const [history, setHistory] = useState(loadHistory);

  const goHome = useCallback(() => {
    setHistory(loadHistory());
    setScreen({ id: 'home' });
  }, []);

  const startDraft = useCallback((initial: DraftState) => {
    setScreen({ id: 'draft', initial, nonce: Date.now() });
  }, []);

  const onDraftDone = useCallback((final: DraftState) => {
    if (final.mode === 'h2h') setScreen({ id: 'h2h-results', final });
    else setScreen({ id: 'solo-results', final });
  }, []);

  const closeRules = useCallback(() => {
    markRulesSeen();
    setRulesOpen(false);
  }, []);

  return (
    <>
      {screen.id === 'home' && (
        <HomeScreen
          history={history}
          onHistoryCleared={() => setHistory([])}
          onStartSolo={(mode) => startDraft(initialSolo(mode))}
          onStartH2H={(names, statsVisible) => startDraft(initialH2H(names, statsVisible))}
          onShowRules={() => setRulesOpen(true)}
        />
      )}

      {screen.id === 'draft' && (
        <DraftScreen
          key={screen.nonce}
          initial={screen.initial}
          onDone={onDraftDone}
          onQuit={goHome}
        />
      )}

      {screen.id === 'solo-results' && (
        <SoloResults
          mode={screen.final.mode}
          roster={screen.final.roster}
          onPlayAgain={() => startDraft(initialSolo(screen.final.mode))}
          onHome={goHome}
        />
      )}

      {screen.id === 'h2h-results' && (
        <H2HResults
          names={screen.final.names}
          rosters={screen.final.rosters}
          onPlayAgain={() =>
            startDraft(initialH2H(screen.final.names, screen.final.statsVisible))
          }
          onHome={goHome}
        />
      )}

      {rulesOpen && <RulesModal onClose={closeRules} />}
    </>
  );
}
