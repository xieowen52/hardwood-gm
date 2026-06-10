/**
 * Top-level screen router. All game state lives in the draft reducer and the
 * engine; this component only decides which screen is visible.
 */
import { useCallback, useState } from 'react';
import type { Roster } from './engine';
import { initialH2H, initialSolo, type DraftState } from './state/draftFlow';
import { loadHistory, markRulesSeen, rulesSeen, type HistoryEntry } from './state/history';
import { rosterFromIds } from './state/reopen';
import { DraftScreen } from './ui/DraftScreen';
import { H2HResults } from './ui/H2HResults';
import { HomeScreen } from './ui/HomeScreen';
import { RulesModal } from './ui/RulesModal';
import { SoloResults } from './ui/SoloResults';

type Screen =
  | { id: 'home' }
  | { id: 'draft'; initial: DraftState; nonce: number }
  | { id: 'solo-results'; mode: 'classic' | 'hoopiq'; roster: Roster; fixedSeed?: number }
  | {
      id: 'h2h-results';
      names: [string, string];
      rosters: [Roster, Roster];
      statsVisible: boolean;
      fixedSeed?: number;
    };

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
    if (final.mode === 'h2h') {
      setScreen({
        id: 'h2h-results',
        names: final.names,
        rosters: final.rosters,
        statsVisible: final.statsVisible,
      });
    } else {
      setScreen({ id: 'solo-results', mode: final.mode, roster: final.roster });
    }
  }, []);

  const openEntry = useCallback((entry: HistoryEntry) => {
    if (entry.mode === 'h2h') {
      const a = rosterFromIds(entry.h2h?.rosterIds[0]);
      const b = rosterFromIds(entry.h2h?.rosterIds[1]);
      if (!a || !b || !entry.h2h) return;
      setScreen({
        id: 'h2h-results',
        names: entry.h2h.names,
        rosters: [a, b],
        statsVisible: true,
        fixedSeed: entry.seed,
      });
    } else {
      const roster = rosterFromIds(entry.soloRosterIds);
      if (!roster) return;
      setScreen({ id: 'solo-results', mode: entry.mode, roster, fixedSeed: entry.seed });
    }
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
          onOpenEntry={openEntry}
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
          mode={screen.mode}
          roster={screen.roster}
          fixedSeed={screen.fixedSeed}
          onPlayAgain={() => startDraft(initialSolo(screen.mode))}
          onHome={goHome}
        />
      )}

      {screen.id === 'h2h-results' && (
        <H2HResults
          names={screen.names}
          rosters={screen.rosters}
          fixedSeed={screen.fixedSeed}
          onPlayAgain={() => startDraft(initialH2H(screen.names, screen.statsVisible))}
          onHome={goHome}
        />
      )}

      {rulesOpen && <RulesModal onClose={closeRules} />}
    </>
  );
}
