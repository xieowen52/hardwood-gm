/**
 * The draft screen, shared by all three modes: era × team reveal → player
 * list → pick → assign slot, with roster sidebar(s), position rearranging,
 * and two independent re-roll tokens (era / team), each spinning only its own
 * box. All rules live in src/state/draftFlow.ts and src/engine/draft.ts.
 */
import { useEffect, useReducer, useRef, useState } from 'react';
import { COMBOS } from '../data/dataset';
import {
  availablePlayers,
  canReroll,
  draftReducer,
  drawCombo,
  drawRerollCombo,
  rerollTokens,
  ROUNDS,
  type DraftState,
  type RerollKind,
} from '../state/draftFlow';
import { ComboReveal } from './ComboReveal';
import { PlayerTable } from './PlayerTable';
import { RosterSidebar } from './RosterSidebar';

interface DraftScreenProps {
  initial: DraftState;
  onDone: (final: DraftState) => void;
  onQuit: () => void;
}

type Spin = 'team' | 'era' | 'both' | null;

export function DraftScreen({ initial, onDone, onQuit }: DraftScreenProps) {
  const [state, dispatch] = useReducer(draftReducer, initial);
  // Which box(es) are mid-shuffle. While non-null the player list is hidden.
  const [spin, setSpin] = useState<Spin>(null);
  const doneRef = useRef(false);

  // Auto-draw whenever a round enters its spin phase: pick a combo, commit it,
  // and shuffle both boxes.
  useEffect(() => {
    if (state.phase === 'spin') {
      dispatch({ type: 'spun', combo: drawCombo(state, COMBOS) });
      setSpin('both');
    }
  }, [state]);

  // Hand the finished draft to the parent exactly once.
  useEffect(() => {
    if (state.phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      onDone(state);
    }
  }, [state, onDone]);

  const reroll = (kind: RerollKind) => {
    if (!canReroll(state, kind) || spin !== null) return;
    const combo = drawRerollCombo(state, COMBOS, kind);
    if (!combo) return;
    dispatch({ type: 'reroll', combo, kind });
    setSpin(kind);
  };

  const showStats = state.mode === 'classic' || (state.mode === 'h2h' && state.statsVisible);
  const activeRoster = state.mode === 'h2h' ? state.rosters[state.picker] : state.roster;
  const pickerName = state.mode === 'h2h' ? state.names[state.picker] : null;
  const tokens = rerollTokens(state);
  const canRoll = (kind: RerollKind) =>
    canReroll(state, kind) &&
    spin === null &&
    drawRerollCombo(state, COMBOS, kind, () => 0) !== null;

  const quit = () => {
    const picksMade =
      state.mode === 'h2h'
        ? state.rosters.some((r) => Object.values(r).some((p) => p !== null))
        : Object.values(state.roster).some((p) => p !== null);
    if (state.phase !== 'done' && picksMade) {
      if (!window.confirm('Abandon this draft? The run will not be saved.')) return;
    }
    onQuit();
  };

  return (
    <div className="screen draft-screen">
      <header className="draft-header">
        <button className="btn btn-ghost" onClick={quit}>← Quit</button>
        <h2>
          Round {Math.min(state.round + 1, ROUNDS)} <span className="muted">/ {ROUNDS}</span>
          {pickerName && <span className="picker-name"> — {pickerName} on the clock</span>}
        </h2>
        <span className="header-spacer" />
      </header>

      <div className="draft-body">
        <main className="draft-main">
          {state.combo && state.phase === 'pick' && (
            <>
              <ComboReveal
                combo={state.combo}
                spin={spin}
                onSettled={() => setSpin(null)}
                canEra={canRoll('era')}
                canTeam={canRoll('team')}
                eraTokens={tokens.era}
                teamTokens={tokens.team}
                onReroll={reroll}
              />
              {spin === null && (
                <PlayerTable
                  pool={availablePlayers(state, state.combo)}
                  roster={activeRoster}
                  showStats={showStats}
                  onPick={(player, position) => dispatch({ type: 'pick', player, position })}
                />
              )}
            </>
          )}
        </main>

        <aside className="draft-aside">
          {state.mode === 'h2h' ? (
            <>
              <RosterSidebar
                title={state.names[0]}
                roster={state.rosters[0]}
                active={state.picker === 0 && spin === null}
                onSwap={(a, b) => dispatch({ type: 'swap', a, b, team: 0 })}
              />
              <RosterSidebar
                title={state.names[1]}
                roster={state.rosters[1]}
                active={state.picker === 1 && spin === null}
                onSwap={(a, b) => dispatch({ type: 'swap', a, b, team: 1 })}
              />
            </>
          ) : (
            <RosterSidebar
              title="Your team"
              roster={state.roster}
              active
              onSwap={(a, b) => dispatch({ type: 'swap', a, b })}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
