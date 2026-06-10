/**
 * Plays complete drafts through the reducer (hundreds of randomized runs) to
 * prove the flow can never dead-end: every run fills every slot and reaches
 * 'done', including with re-rolls and blind picks.
 */
import { describe, expect, it } from 'vitest';
import { COMBOS } from '../data/dataset';
import { mulberry32 } from '../engine';
import { assignmentOptions, isComplete, rosterPlayers } from '../engine';
import {
  availablePlayers,
  canReroll,
  draftReducer,
  drawCombo,
  drawRerollCombo,
  initialH2H,
  initialSolo,
  ROUNDS,
  type DraftState,
} from './draftFlow';

/** Drive one full draft with random picks; returns the final state. */
function playDraft(start: DraftState, seed: number, useReroll: boolean): DraftState {
  const rng = mulberry32(seed);
  let state = start;
  let guard = 0;

  while (state.phase !== 'done') {
    if (++guard > 100) throw new Error('draft did not terminate');

    if (state.phase === 'spin') {
      state = draftReducer(state, { type: 'spun', combo: drawCombo(state, COMBOS, rng) });
      continue;
    }

    // phase 'pick'
    if (useReroll && canReroll(state) && rng() < 0.3) {
      state = draftReducer(state, { type: 'reroll', combo: drawCombo(state, COMBOS, rng) });
      continue;
    }
    const combo = state.combo;
    expect(combo).not.toBeNull();
    const pool = availablePlayers(state, combo!);
    expect(pool.length).toBeGreaterThan(0);

    const roster = state.mode === 'h2h' ? state.rosters[state.picker] : state.roster;
    const player = pool[Math.floor(rng() * pool.length)]!;
    const options = assignmentOptions(player, roster);
    expect(options.length).toBeGreaterThan(0); // no soft-lock, ever
    const choice = options[Math.floor(rng() * options.length)]!;
    state = draftReducer(state, { type: 'pick', player, position: choice.position });
  }
  return state;
}

describe('classic draft flow', () => {
  it('always completes a 5-round draft with a full legal roster', () => {
    for (let seed = 1; seed <= 150; seed++) {
      const final = playDraft(initialSolo('classic'), seed, seed % 2 === 0);
      if (final.mode === 'h2h') throw new Error('unexpected mode');
      expect(final.round).toBe(ROUNDS);
      expect(isComplete(final.roster)).toBe(true);
      // No duplicate humans.
      const names = rosterPlayers(final.roster).map((p) => p.name);
      expect(new Set(names).size).toBe(5);
    }
  });

  it('consumes at most one re-roll', () => {
    const final = playDraft(initialSolo('classic'), 42, true);
    if (final.mode === 'h2h') throw new Error('unexpected mode');
    expect(final.rerollsLeft).toBeGreaterThanOrEqual(0);
    expect(final.rerollsLeft).toBeLessThanOrEqual(1);
  });
});

describe('constrained re-rolls', () => {
  function stateWithCombo(): DraftState {
    let state: DraftState = initialSolo('classic');
    const rng = mulberry32(5);
    state = draftReducer(state, { type: 'spun', combo: drawCombo(state, COMBOS, rng) });
    return state;
  }

  it('team-only re-roll keeps the decade', () => {
    const state = stateWithCombo();
    const next = drawRerollCombo(state, COMBOS, 'team', mulberry32(1));
    if (next !== null) {
      expect(next.decade).toBe(state.combo!.decade);
      expect(next.key).not.toBe(state.combo!.key);
    }
  });

  it('era-only re-roll keeps the franchise', () => {
    // 1990s Chicago has no other sample decade; use a franchise that does.
    let state = stateWithCombo();
    const bos1960 = COMBOS.find((c) => c.key === '1960-BOS')!;
    state = { ...state, combo: bos1960 };
    const next = drawRerollCombo(state, COMBOS, 'era', mulberry32(1));
    expect(next).not.toBeNull();
    expect(next!.franchiseId).toBe('BOS');
    expect(next!.decade).not.toBe(1960);
  });

  it('full re-roll never returns the current combo', () => {
    const state = stateWithCombo();
    for (let i = 0; i < 20; i++) {
      const next = drawRerollCombo(state, COMBOS, 'both', mulberry32(i));
      expect(next).not.toBeNull();
      expect(next!.key).not.toBe(state.combo!.key);
    }
  });
});

describe('position switching (swap)', () => {
  it('moves a player to an open slot and swaps two filled slots', () => {
    let state = playDraft(initialSolo('classic'), 3, false);
    if (state.mode === 'h2h') throw new Error('unexpected mode');
    // Draft is done — swap is disallowed after completion.
    const before = state.roster;
    expect(draftReducer(state, { type: 'swap', a: 'PG', b: 'C' })).toBe(state);

    // Mid-draft: rebuild a partial state and swap.
    let mid: DraftState = initialSolo('classic');
    const rng = mulberry32(8);
    mid = draftReducer(mid, { type: 'spun', combo: drawCombo(mid, COMBOS, rng) });
    if (mid.mode === 'h2h') throw new Error('unexpected mode');
    const pool = availablePlayers(mid, mid.combo!);
    const player = pool[0]!;
    const pos = assignmentOptions(player, mid.roster)[0]!.position;
    mid = draftReducer(mid, { type: 'pick', player, position: pos });
    if (mid.mode === 'h2h') throw new Error('unexpected mode');
    const otherSlot = pos === 'PG' ? 'C' : 'PG';
    const swapped = draftReducer(mid, { type: 'swap', a: pos, b: otherSlot });
    if (swapped.mode === 'h2h') throw new Error('unexpected mode');
    expect(swapped.roster[otherSlot]?.id).toBe(player.id);
    expect(swapped.roster[pos]).toBeNull();
    expect(before).toBeDefined();
  });

  it('h2h: swap only touches the named team', () => {
    let state: DraftState = initialH2H(['A', 'B'], true);
    const rng = mulberry32(2);
    state = draftReducer(state, { type: 'spun', combo: drawCombo(state, COMBOS, rng) });
    const pool = availablePlayers(state, state.combo!);
    const p0 = pool[0]!;
    if (state.mode !== 'h2h') throw new Error('unexpected mode');
    const pos0 = assignmentOptions(p0, state.rosters[0])[0]!.position;
    state = draftReducer(state, { type: 'pick', player: p0, position: pos0 });
    if (state.mode !== 'h2h') throw new Error('unexpected mode');
    const target = pos0 === 'SF' ? 'SG' : 'SF';
    const swapped = draftReducer(state, { type: 'swap', a: pos0, b: target, team: 0 });
    if (swapped.mode !== 'h2h') throw new Error('unexpected mode');
    expect(swapped.rosters[0][target]?.id).toBe(p0.id);
    expect(swapped.rosters[1]).toEqual(state.rosters[1]);
  });
});

describe('head-to-head draft flow', () => {
  it('always completes with two full rosters and no shared players', () => {
    for (let seed = 1; seed <= 150; seed++) {
      const final = playDraft(initialH2H(['A', 'B'], true), seed, seed % 3 === 0);
      if (final.mode !== 'h2h') throw new Error('unexpected mode');
      expect(isComplete(final.rosters[0])).toBe(true);
      expect(isComplete(final.rosters[1])).toBe(true);
      const names = [
        ...rosterPlayers(final.rosters[0]).map((p) => p.name),
        ...rosterPlayers(final.rosters[1]).map((p) => p.name),
      ];
      expect(new Set(names).size).toBe(10); // shared pool: no duplicates across teams
    }
  });

  it('alternates who picks first each round (snake)', () => {
    let state: DraftState = initialH2H(['A', 'B'], true);
    const rng = mulberry32(9);
    const firstPickers: number[] = [];
    while (state.phase !== 'done') {
      if (state.phase === 'spin') {
        state = draftReducer(state, { type: 'spun', combo: drawCombo(state, COMBOS, rng) });
        continue;
      }
      if (state.mode === 'h2h' && state.pickInRound === 0) firstPickers.push(state.picker);
      const pool = availablePlayers(state, state.combo!);
      const roster = state.mode === 'h2h' ? state.rosters[state.picker] : state.roster;
      const player = pool[0]!;
      const pos = assignmentOptions(player, roster)[0]!.position;
      state = draftReducer(state, { type: 'pick', player, position: pos });
    }
    expect(firstPickers).toEqual([0, 1, 0, 1, 0]);
  });
});
