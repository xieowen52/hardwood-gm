/**
 * Pure draft-flow state machine shared by all three modes (Classic, Hoop IQ,
 * Head-to-Head). No React — drive it with useReducer. Randomness (the wheel
 * draw) happens in drawCombo, called by the dispatcher, so the reducer
 * itself stays deterministic.
 *
 * Soft-lock safety:
 * - the wheel only contains combos with ≥8 players (data layer guarantee);
 * - a draw excludes players whose NAME is already on a roster (no duplicate
 *   humans) and redraws if fewer than the round's required picks remain;
 * - any player can be assigned to any open slot (out-of-position penalty),
 *   so a pick can always be completed.
 */
import { playersInCombo } from '../data/dataset';
import type { FranchiseDecadeCombo, PlayerEntry, Position } from '../data/types';
import { emptyRoster, type Roster } from '../engine';

export type GameMode = 'classic' | 'hoopiq' | 'h2h';

export const ROUNDS = 5;

export interface DraftStateBase {
  mode: GameMode;
  /** 0-based round index. */
  round: number;
  phase: 'spin' | 'pick' | 'done';
  combo: FranchiseDecadeCombo | null;
  usedComboKeys: string[];
}

export interface SoloDraftState extends DraftStateBase {
  mode: 'classic' | 'hoopiq';
  roster: Roster;
  rerollsLeft: number;
}

export interface H2HDraftState extends DraftStateBase {
  mode: 'h2h';
  statsVisible: boolean;
  names: [string, string];
  rosters: [Roster, Roster];
  /** Whose pick it is right now (0/1). */
  picker: 0 | 1;
  /** 0 = first pick of the round, 1 = second. */
  pickInRound: 0 | 1;
  rerollsLeft: [number, number];
}

export type DraftState = SoloDraftState | H2HDraftState;

export function initialSolo(mode: 'classic' | 'hoopiq'): SoloDraftState {
  return {
    mode,
    round: 0,
    phase: 'spin',
    combo: null,
    usedComboKeys: [],
    roster: emptyRoster(),
    rerollsLeft: 1,
  };
}

export function initialH2H(names: [string, string], statsVisible: boolean): H2HDraftState {
  return {
    mode: 'h2h',
    statsVisible,
    names,
    round: 0,
    phase: 'spin',
    combo: null,
    usedComboKeys: [],
    rosters: [emptyRoster(), emptyRoster()],
    picker: 0,
    pickInRound: 0,
    rerollsLeft: [1, 1],
  };
}

/** Snake order: round 0 → P1 first, round 1 → P2 first, alternating. */
export function firstPicker(round: number): 0 | 1 {
  return (round % 2) as 0 | 1;
}

function takenNames(state: DraftState): Set<string> {
  const names = new Set<string>();
  const rosters = state.mode === 'h2h' ? state.rosters : [state.roster];
  for (const roster of rosters) {
    for (const p of Object.values(roster)) {
      if (p) names.add(p.name);
    }
  }
  return names;
}

/** Players in a combo still draftable in the current state. */
export function availablePlayers(state: DraftState, combo: FranchiseDecadeCombo): PlayerEntry[] {
  const names = takenNames(state);
  return playersInCombo(combo).filter((p) => !names.has(p.name));
}

/**
 * Draw a random combo for the current round: unused this game, with enough
 * draftable players left for the round (2 in head-to-head, 1 solo).
 * Falls back to allowing repeats if every combo has been used (only possible
 * with very small datasets) — the game must never dead-end.
 */
export function drawCombo(
  state: DraftState,
  combos: readonly FranchiseDecadeCombo[],
  random: () => number = Math.random,
): FranchiseDecadeCombo {
  const need = state.mode === 'h2h' ? 2 : 1;
  const usable = (pool: readonly FranchiseDecadeCombo[]) =>
    pool.filter((c) => availablePlayers(state, c).length >= need);

  let candidates = usable(combos.filter((c) => !state.usedComboKeys.includes(c.key)));
  if (candidates.length === 0) candidates = usable(combos);
  if (candidates.length === 0) {
    throw new Error('No drawable franchise-decade combo — dataset too small for the wheel.');
  }
  const idx = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
  const drawn = candidates[idx];
  if (!drawn) throw new Error('unreachable: empty candidates');
  return drawn;
}

/** Re-roll flavors: full spin, same era different team, same team different era. */
export type RerollKind = 'both' | 'team' | 'era';

/**
 * Draw a combo for a constrained re-roll, or null when the dataset has no
 * alternative satisfying the constraint (UI disables that option).
 */
export function drawRerollCombo(
  state: DraftState,
  combos: readonly FranchiseDecadeCombo[],
  kind: RerollKind,
  random: () => number = Math.random,
): FranchiseDecadeCombo | null {
  const current = state.combo;
  if (!current) return null;
  const need = state.mode === 'h2h' ? 2 : 1;

  const matches = (c: FranchiseDecadeCombo): boolean => {
    if (c.key === current.key) return false;
    if (kind === 'team' && c.decade !== current.decade) return false;
    if (kind === 'era' && c.franchiseId !== current.franchiseId) return false;
    return availablePlayers(state, c).length >= need;
  };

  // Prefer combos unused this game; fall back to repeats rather than dead-end.
  let candidates = combos.filter((c) => !state.usedComboKeys.includes(c.key) && matches(c));
  if (candidates.length === 0) candidates = combos.filter(matches);
  if (candidates.length === 0) return null;
  return candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))] ?? null;
}

export type DraftAction =
  | { type: 'spun'; combo: FranchiseDecadeCombo }
  | { type: 'reroll'; combo: FranchiseDecadeCombo }
  | { type: 'pick'; player: PlayerEntry; position: Position }
  | { type: 'swap'; a: Position; b: Position; team?: 0 | 1 };

function assign(roster: Roster, player: PlayerEntry, position: Position): Roster {
  if (roster[position] !== null) {
    throw new Error(`slot ${position} already filled`);
  }
  return { ...roster, [position]: player };
}

export function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'spun': {
      if (state.phase !== 'spin') return state;
      return {
        ...state,
        phase: 'pick',
        combo: action.combo,
        usedComboKeys: [...state.usedComboKeys, action.combo.key],
      };
    }

    case 'reroll': {
      // Allowed during the pick phase, before any pick this round.
      if (state.phase !== 'pick' || state.combo === null) return state;
      if (state.mode === 'h2h') {
        if (state.pickInRound !== 0) return state;
        const picker = state.picker;
        if (state.rerollsLeft[picker] < 1) return state;
        const rerolls: [number, number] = [...state.rerollsLeft];
        rerolls[picker] -= 1;
        return {
          ...state,
          rerollsLeft: rerolls,
          combo: action.combo,
          usedComboKeys: [...state.usedComboKeys, action.combo.key],
        };
      }
      if (state.rerollsLeft < 1) return state;
      return {
        ...state,
        rerollsLeft: state.rerollsLeft - 1,
        combo: action.combo,
        usedComboKeys: [...state.usedComboKeys, action.combo.key],
      };
    }

    case 'pick': {
      if (state.phase !== 'pick' || state.combo === null) return state;

      if (state.mode !== 'h2h') {
        const roster = assign(state.roster, action.player, action.position);
        const lastRound = state.round + 1 >= ROUNDS;
        return {
          ...state,
          roster,
          round: state.round + 1,
          phase: lastRound ? 'done' : 'spin',
          combo: lastRound ? state.combo : null,
        };
      }

      const rosters: [Roster, Roster] = [...state.rosters];
      rosters[state.picker] = assign(rosters[state.picker], action.player, action.position);

      if (state.pickInRound === 0) {
        return {
          ...state,
          rosters,
          picker: (1 - state.picker) as 0 | 1,
          pickInRound: 1,
        };
      }
      const lastRound = state.round + 1 >= ROUNDS;
      return {
        ...state,
        rosters,
        round: state.round + 1,
        phase: lastRound ? 'done' : 'spin',
        combo: lastRound ? state.combo : null,
        picker: firstPicker(state.round + 1),
        pickInRound: 0,
      };
    }

    case 'swap': {
      // Rearrange already-drafted players between slots (move to an open slot
      // or swap two filled ones). Allowed any time before the draft is done.
      if (state.phase === 'done' || action.a === action.b) return state;
      const doSwap = (roster: Roster): Roster => {
        const va = roster[action.a];
        const vb = roster[action.b];
        if (va === null && vb === null) return roster;
        return { ...roster, [action.a]: vb, [action.b]: va };
      };
      if (state.mode === 'h2h') {
        const team = action.team ?? state.picker;
        const rosters: [Roster, Roster] = [...state.rosters];
        rosters[team] = doSwap(rosters[team]);
        return { ...state, rosters };
      }
      return { ...state, roster: doSwap(state.roster) };
    }

    default:
      return state;
  }
}

/** Can the current picker use a re-roll right now? */
export function canReroll(state: DraftState): boolean {
  if (state.phase !== 'pick') return false;
  if (state.mode === 'h2h') {
    return state.pickInRound === 0 && state.rerollsLeft[state.picker] > 0;
  }
  return state.rerollsLeft > 0;
}
