# Hardwood GM

A local-first, browser-based NBA draft-and-simulate game inspired by 82-0.com — but with a real possession-based simulation engine instead of a flat strength rating, built for diehard NBA fans who care about fit, eras, and the why behind the results. Spin a wheel for a decade + franchise ("1990s Chicago"), draft an all-time starting five, and watch the engine project your 82-game record or settle a head-to-head series possession by possession.

> 🖼️ *Screenshots / GIF placeholder — drop captures of the wheel, draft board and
> results screen here.*

Everything runs client-side. No backend, no accounts, no network calls — run
history lives in `localStorage`.

## Game modes

- **Classic** — five rounds; each round you're dealt a franchise-decade as two
  separate boxes (an **era** and a **team**) and draft one player (sortable, full
  stat lines, raw or era-adjusted) into an open slot (PG/SG/SF/PF/C). Two
  independent re-roll tokens per game — one re-spins the era box, one re-spins the
  team box, usable in the same turn. Then the engine simulates an 82-game season
  against a league-average opponent and explains your record.
- **Hoop IQ** — the same draft, blind: names, positions and seasons only. The
  results screen reveals what you actually took.
- **Head-to-Head** — local pass-and-play. Both drafters pick from the *same* wheel
  draw each round (shared pool, snake order), with stats visible or hidden. Teams
  then play a best-of-7 with 2-2-1-1-1 home court, simulated possession by
  possession, with a deciding-game box score and a "why you won/lost" breakdown.

Quality-of-life: rearrange your roster mid-draft (tap two slots to swap, penalties
update live), reopen any past run from history (seeded, bit-identical), copy a text
summary or download a share image of any result.

The game cannot soft-lock: any player can be assigned to any open slot, with a
clearly displayed out-of-position penalty, and the wheel only offers pools with
enough draftable players.

## Run it

```bash
npm install
npm run dev    # → http://localhost:5173
```

```bash
npm test       # engine + data + draft-flow unit tests (Vitest)
npm run build  # type-check (strict) + production bundle
npx tsx scripts/sanity.ts   # engine calibration report (matchups + seasons)
```

Requires Node 20+.

## Plugging in a real dataset

The app ships with a clearly-marked **sample dataset** (~165 hand-written,
approximate player entries across 20 franchise-decade pools) so it works out of
the box. To use real data:

1. Export a Basketball-Reference-style per-season per-player CSV with columns like
   `player, season, team, pos, g, mp, pts, trb, ast, stl, blk, fga, fg, 3pa, 3p,
   fta, ft, tov, usg_pct`. Totals or per-game values both work (auto-detected);
   missing advanced columns are estimated or defaulted. The full column contract is
   documented at the top of [`scripts/ingest.ts`](scripts/ingest.ts).
2. Run the ingest script:

   ```bash
   npm run ingest -- path/to/stats.csv            # default: ≥100 games per franchise-decade
   npm run ingest -- stats.csv --min-games 80     # loosen the cut
   ```

   It writes `src/data/generated/players.json`: player entries grouped by
   franchise + decade (per-game averages over those seasons only) plus per-season
   league context aggregated from the same rows. Data-quality guardrails are
   built in: spans ending before 1971 are dropped (game logs are incomplete),
   implausible league context falls back to published averages, and recorded
   steals/blocks/turnovers are trusted per season only when they reach 85% of
   the published league rate — earlier seasons get position/volume estimates
   instead of literal zeros. The curated 1960s pools are blended back in so the
   classic eras stay playable. (A Kaggle game-log pipeline,
   `scripts/aggregate-kaggle.ts`, streams per-game box scores into this format.)
3. Restart the dev server. The app validates the generated file at startup and
   falls back to sample data (with a console warning) if it's unusable.

## Engine design notes

The engine is a pure TypeScript module (`src/engine/`, no React imports), fully
unit-tested and seeded — every result stores its RNG seed and is exactly
reproducible. All tunables live in [`src/engine/config.ts`](src/engine/config.ts).

### Era normalization (`normalize.ts`)

Raw per-game stats are converted to **per-36-minute rates in a common baseline
era** (pace 96, league FG% .466, 3P% .355, FT% .775):

1. *Per-minute basis* — `X36 = X_perGame × 36 / mp`. Your drafted players play
   starter minutes, so a bench role in the source data doesn't halve a player.
2. *Pace adjustment* — `Xnorm = X36 × (96 / eraPace)`, where `eraPace` is the mean
   league pace over the entry's seasons. A 1962 stat line loses its ~125-possession
   inflation.
3. *Relative efficiency* — shooting percentages are scaled by the ratio of baseline
   to era league averages, e.g. `p2norm = rawP2 × (0.466 / eraFG%)`, clamped to
   sane bounds. Shooting 49% in a league that shot 42.6% is treated like ~53.6%
   today. Scoring volume is *not* additionally rescaled by era PPG — pace (volume)
   plus relative efficiency (quality) already capture it.

Pre-1980 players keep zero three-point attempts; their teams honestly eat the
spacing penalty.

### Possession engine (`game.ts`)

Teams alternate equal possessions (96 ± 4 per game, +9 per overtime). Each
possession: turnover check (team rate + opponent steal pressure) → shooter chosen
by usage weight → shooting-foul check (from FTA/FGA) → 2 or 3 attempt (3 with
probability = shooter's 3PA share) → make probability = era-adjusted percentage,
reduced by the matchup defender and team defense → on a miss, an offensive-rebound
battle and one putback attempt. Assists, steals, blocks and rebounds are credited
probabilistically to produce sane box scores. A full 82-game season simulates in
well under 250 ms; a best-of-7 plus a 1,000-game Monte Carlo estimate feels
instant.

### Fit & synergy (`team.ts`) — every factor surfaced in the results "Why"

- **Out of position**: −5% shooting/rebounding/defense per step of distance along
  PG–SG–SF–PF–C (a C at SG is 3 steps = −15%).
- **Usage overlap**: combined usage above 125% costs team-wide efficiency
  (−0.2%/point, capped −6%) — five alphas can't all have the ball. Below 88%
  there's a smaller "nobody creates" penalty.
- **Spacing**: expected made threes above/below 9 per game shifts everyone's 2P% by
  up to ±2.2%.
- **Skill curve**: a player forced to take a larger share of shots than their
  natural usage loses efficiency on the extra load (role players are efficient
  *because* they take few, easy shots); stars taking a lighter load gain a little.
- **Shot quality**: era-adjusted scoring volume above an average starter's ~16.5
  pts/36 raises make probability (capped ±13.5%) — volume scorers create good looks,
  which a naive per-possession model would throw away.
- **Playmaking**: team assist totals above/below 18 per-36-five shift shot quality
  up to ±2%.

### Calibration (`scripts/sanity.ts`, `scripts/tune-820.ts`)

With the sample dataset: an all-time-great five projects to ~78 wins, an
end-of-bench five to ~15, the league-average mirror is a coin flip at ~101 points a
game, and the greats beat the scrubs in >97% of single games. A perfectly built
superteam goes **82-0 in roughly 3% of seasons** — possible, never cheap. Home
court is worth ~1.2% on make probabilities (41/41 in season, 2-2-1-1-1 in series).

## Project layout

```
scripts/ingest.ts        CSV → players.json converter (documented contract)
scripts/sanity.ts        engine calibration report
src/data/                types, franchises, sample dataset, loader + validation
src/engine/              pure simulation engine (no React) + tests
src/state/               draft-flow reducer (solo + snake h2h), localStorage history
src/ui/                  screens and components (no game logic in components)
```

## Disclaimer

A fan-made statistics game. Not affiliated with, sponsored or endorsed by the NBA
or NBPA. Player names and statistics are factual, historical references; no team
logos, nicknames or trademarks are used — teams appear as decade + city with a
generic color swatch. The built-in sample stats are approximations for
demonstration.
