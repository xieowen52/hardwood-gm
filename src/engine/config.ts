/**
 * Every tunable constant in the simulation engine, in one place.
 * Values are calibrated so a league-average team vs itself splits ~50/50 at
 * ~110 points per game, an all-time-great lineup wins 65-78 games, and a
 * lineup of end-of-bench players wins 5-20.
 */

/**
 * The common era every player is normalized INTO. Roughly a modern league
 * average; the specific values matter less than every player sharing them.
 */
export const BASELINE = {
  /** Possessions per team per 48 minutes. */
  pace: 96,
  /** Points per team per game. */
  ppg: 110,
  /** League FG% (all field goals). */
  fgPct: 0.466,
  /** League 3P%. */
  tpPct: 0.355,
  /** League FT%. */
  ftPct: 0.775,
} as const;

/** Normalization bounds — era scaling can never push a rate outside these. */
export const NORM_CLAMPS = {
  p2: { min: 0.3, max: 0.72 },
  p3: { min: 0.0, max: 0.48 },
  ft: { min: 0.3, max: 0.95 },
} as const;

/** Minutes basis for rate stats: everyone is compared per 36 minutes. */
export const PER_MINUTES = 36;

export const FIT = {
  /**
   * Out-of-position penalty per step of distance along PG-SG-SF-PF-C
   * (a C at PF is 1 step, a C at SG is 3). Applied multiplicatively to
   * shooting efficiency, rebounding and defense.
   */
  outOfPositionPerStep: 0.05,
  /** Total team usage above this (in %) starts crowding the offense. */
  usageOverlapThreshold: 125,
  /** Efficiency lost per usage point above the threshold. */
  usageOverlapPerPoint: 0.002,
  /** Cap on the usage-overlap efficiency penalty. */
  usageOverlapMax: 0.06,
  /**
   * SKILL CURVE: a player forced to take a larger share of team shots than
   * their natural usage (usage/100) loses efficiency on the extra load —
   * role players are efficient because they only take easy shots. Slope is
   * the efficiency lost per point of excess share; stars taking a SMALLER
   * share than usual get a small bonus (easier shots), capped low.
   */
  shotSharePenaltySlope: 1.45,
  shotSharePenaltyMax: 0.25,
  shotShareBonusSlope: 0.35,
  shotShareBonusMax: 0.04,
  /** Team assists per 36-min-five above/below this shift efficiency (creation quality). */
  playmakingNeutralAst: 18,
  playmakingMaxEffect: 0.02,
  /**
   * SHOT QUALITY: era-adjusted scoring volume above/below an average
   * starter's ~16.5 pts/36 scales make probability — high-volume scorers
   * don't just convert shots, they CREATE good ones, which a pure
   * per-possession model would otherwise throw away.
   */
  shotQualityBaselinePts: 16.5,
  shotQualitySlope: 0.5,
  shotQualityMax: 0.075,
  /** Team turnover rate is pulled toward this league-typical center... */
  tovCenter: 0.13,
  /** ...keeping this fraction of the raw spread (stars handle more, but load is shared). */
  tovSpreadKept: 0.4,
  /** Total team usage below this means someone must force shots they don't take. */
  usageStarvedThreshold: 88,
  usageStarvedPerPoint: 0.0015,
  usageStarvedMax: 0.04,
  /** Expected made threes per game for a neutral spacing rating. */
  spacingNeutralThrees: 9,
  /** 2P% bonus/penalty at the spacing extremes (+/-). */
  spacingMaxEffect: 0.022,
} as const;

export const POSSESSION = {
  /** Mean possessions per team; each game draws uniformly +/- spread. */
  basePossessions: 96,
  possessionSpread: 4,
  /** Overtime adds this many possessions per team until the tie breaks. */
  overtimePossessions: 9,
  /** Bounds on per-possession turnover probability. */
  tovMin: 0.08,
  tovMax: 0.2,
  /** How strongly the defense's steal pressure adds to opponent turnovers. */
  stealPressureWeight: 0.35,
  /** P(shooting-foul trip) = shooter ftRate (FTA/FGA) times this. */
  foulTripFactor: 0.3,
  /** Matchup defender effect: make% multiplier scales with def score above/below average. */
  defenderImpact: 0.07,
  /** League-average individual defensive score (see normalize.defScore): 0.6*1.1 stl + 0.7*0.7 blk. */
  defScoreBaseline: 1.15,
  /** Cap on the total defensive make% adjustment (fraction of make prob). */
  defenderImpactMax: 0.12,
  /** Chance a missed shot near a strong shot blocker is credited as a block. */
  blockCreditFactor: 0.045,
  /** Chance a turnover is credited as a defender's steal. */
  stealCreditShare: 0.55,
  /** Chance a made basket gets an assist credited. */
  assistShare: 0.62,
  /** Offensive rebound strength fraction of total rebounding (rest is defensive). */
  orbShare: 0.29,
  /** Putback attempt after an offensive rebound gets this make% bonus (2pt). */
  putbackBonus: 0.05,
  /** Per-game team form noise (uniform +/- this, applied to make probabilities). */
  gameFormNoise: 0.02,
} as const;

export const SEASON_GAMES = 82;
export const SERIES_WINS_NEEDED = 4;
/** Monte Carlo runs used to estimate matchup probabilities for explanations. */
export const MONTE_CARLO_RUNS = 1000;
