/**
 * Deterministic seeded RNG (mulberry32). Every simulation takes an explicit
 * seed and stores it with the result, so any run can be reproduced exactly.
 */

export type Rng = () => number;

/** Returns a function producing uniform floats in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fresh non-deterministic 32-bit seed (for "new run" defaults). */
export function randomSeed(): number {
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}

/** Weighted index pick; weights must be non-negative and not all zero. */
export function pickWeighted(rng: Rng, weights: readonly number[]): number {
  let total = 0;
  for (const w of weights) total += w;
  if (total <= 0) return 0;
  let roll = rng() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i] ?? 0;
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}
