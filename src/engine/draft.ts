/**
 * Pure draft logic: roster slots, assignment legality, out-of-position
 * distance, and snake-draft ordering. No React, no randomness.
 *
 * Soft-lock impossibility: ANY player may be assigned to ANY open slot — an
 * assignment outside the player's listed positions just carries a fit
 * penalty (see fit.ts). The UI prefers in-position options but the game can
 * always continue.
 */
import { POSITIONS, type PlayerEntry, type Position } from '../data/types';

/** Position → drafted player (null = open slot). */
export type Roster = Record<Position, PlayerEntry | null>;

export function emptyRoster(): Roster {
  return { PG: null, SG: null, SF: null, PF: null, C: null };
}

export function openPositions(roster: Roster): Position[] {
  return POSITIONS.filter((p) => roster[p] === null);
}

export function rosterPlayers(roster: Roster): PlayerEntry[] {
  return POSITIONS.map((p) => roster[p]).filter((p): p is PlayerEntry => p !== null);
}

export function isComplete(roster: Roster): boolean {
  return openPositions(roster).length === 0;
}

/**
 * Steps between a player's best eligible position and an assigned slot,
 * along PG-SG-SF-PF-C (a C at PF = 1, a C at SG = 3). 0 = in position.
 */
export function positionDistance(player: PlayerEntry, slot: Position): number {
  if (player.positions.includes(slot)) return 0;
  const slotIdx = POSITIONS.indexOf(slot);
  let best: number = POSITIONS.length;
  for (const pos of player.positions) {
    best = Math.min(best, Math.abs(POSITIONS.indexOf(pos) - slotIdx));
  }
  return best;
}

export interface AssignmentOption {
  position: Position;
  /** 0 = natural position; >0 = out-of-position by this many steps. */
  distance: number;
}

/**
 * All open slots a player could take, in-position first then by distance.
 * Never empty while the roster has an open slot — that's the no-soft-lock rule.
 */
export function assignmentOptions(player: PlayerEntry, roster: Roster): AssignmentOption[] {
  return openPositions(roster)
    .map((position) => ({ position, distance: positionDistance(player, position) }))
    .sort((a, b) => a.distance - b.distance);
}

/** True if the player fits some open slot without a penalty. */
export function hasNaturalSlot(player: PlayerEntry, roster: Roster): boolean {
  return assignmentOptions(player, roster).some((o) => o.distance === 0);
}

/** True if ANY player in the pool has a natural open slot. */
export function poolHasNaturalFit(pool: readonly PlayerEntry[], roster: Roster): boolean {
  return pool.some((p) => hasNaturalSlot(p, roster));
}

/**
 * Snake-draft pick order for one round of a 2-player head-to-head draft.
 * Round 1: [0, 1]; round 2: [1, 0]; alternating each round.
 */
export function snakeOrder(roundIndex: number): [number, number] {
  return roundIndex % 2 === 0 ? [0, 1] : [1, 0];
}
