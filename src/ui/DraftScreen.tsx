/**
 * The draft screen, shared by all three modes: wheel spin → combo reveal →
 * player list → pick → assign slot, with roster sidebar(s) and the re-roll
 * button. All rules live in src/state/draftFlow.ts and src/engine/draft.ts.
 */
import { useEffect, useReducer, useRef, useState } from 'react';
import { COMBOS } from '../data/dataset';
import type { FranchiseDecadeCombo } from '../data/types';
import {
  availablePlayers,
  canReroll,
  draftReducer,
  drawCombo,
  ROUNDS,
  type DraftState,
} from '../state/draftFlow';
import { comboColors, comboLabel } from './format';
import { PlayerTable } from './PlayerTable';
import { RosterSidebar } from './RosterSidebar';
import { Wheel } from './Wheel';

interface DraftScreenProps {
  initial: DraftState;
  onDone: (final: DraftState) => void;
  onQuit: () => void;
}

interface PendingSpin {
  combo: FranchiseDecadeCombo;
  action: 'spun' | 'reroll';
}

export function DraftScreen({ initial, onDone, onQuit }: DraftScreenProps) {
  const [state, dispatch] = useReducer(draftReducer, initial);
  const [pending, setPending] = useState<PendingSpin | null>(null);
  const doneRef = useRef(false);

  // Auto-draw whenever a round enters its spin phase.
  useEffect(() => {
    if (state.phase === 'spin' && pending === null) {
      setPending({ combo: drawCombo(state, COMBOS), action: 'spun' });
    }
  }, [state, pending]);

  // Hand the finished draft to the parent exactly once.
  useEffect(() => {
    if (state.phase === 'done' && !doneRef.current) {
      doneRef.current = true;
      onDone(state);
    }
  }, [state, onDone]);

  const reroll = () => {
    if (!canReroll(state) || pending !== null) return;
    setPending({ combo: drawCombo(state, COMBOS), action: 'reroll' });
  };

  const showStats = state.mode === 'classic' || (state.mode === 'h2h' && state.statsVisible);
  const activeRoster = state.mode === 'h2h' ? state.rosters[state.picker] : state.roster;
  const pickerName = state.mode === 'h2h' ? state.names[state.picker] : null;
  const rerollsLeft =
    state.mode === 'h2h' ? state.rerollsLeft[state.picker] : state.rerollsLeft;

  return (
    <div className="screen draft-screen">
      <header className="draft-header">
        <button className="btn btn-ghost" onClick={onQuit}>← Quit</button>
        <h2>
          Round {Math.min(state.round + 1, ROUNDS)} / {ROUNDS}
          {pickerName && <span className="picker-name"> — {pickerName} on the clock</span>}
        </h2>
        <button
          className="btn"
          disabled={!canReroll(state) || pending !== null}
          onClick={reroll}
          title="Spin the wheel again for a different franchise-decade"
        >
          Re-roll ({rerollsLeft} left)
        </button>
      </header>

      <div className="draft-body">
        <main className="draft-main">
          {pending !== null ? (
            <Wheel
              target={pending.combo}
              onSettled={() => {
                dispatch({ type: pending.action, combo: pending.combo });
                setPending(null);
              }}
            />
          ) : state.combo && state.phase === 'pick' ? (
            <>
              <ComboBanner combo={state.combo} />
              <PlayerTable
                pool={availablePlayers(state, state.combo)}
                roster={activeRoster}
                showStats={showStats}
                onPick={(player, position) => dispatch({ type: 'pick', player, position })}
              />
            </>
          ) : null}
        </main>

        <aside className="draft-aside">
          {state.mode === 'h2h' ? (
            <>
              <RosterSidebar title={state.names[0]} roster={state.rosters[0]} active={state.picker === 0 && pending === null} />
              <RosterSidebar title={state.names[1]} roster={state.rosters[1]} active={state.picker === 1 && pending === null} />
            </>
          ) : (
            <RosterSidebar title="Your team" roster={state.roster} active />
          )}
        </aside>
      </div>
    </div>
  );
}

function ComboBanner({ combo }: { combo: FranchiseDecadeCombo }) {
  const [primary, secondary] = comboColors(combo);
  return (
    <div className="combo-banner">
      <span
        className="swatch"
        style={{ background: `linear-gradient(135deg, ${primary} 50%, ${secondary} 50%)` }}
      />
      <strong>{comboLabel(combo)}</strong>
      <span className="muted">pick one player, assign a slot</span>
    </div>
  );
}
