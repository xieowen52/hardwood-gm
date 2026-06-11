/**
 * Head-to-head results: best-of-7 outcome, per-game scores, the deciding
 * game's full box score, and the "why you won/lost" breakdown.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { DATASET } from '../data/dataset';
import { POSITIONS } from '../data/types';
import {
  buildTeam,
  explainSeries,
  randomSeed,
  rosterPlayers,
  simulateSeries,
  type Roster,
  type TeamBox,
} from '../engine';
import { addHistory } from '../state/history';
import { copyText } from './copy';
import { fmt1 } from './format';
import { RosterStatsTable } from './RosterStatsTable';
import { downloadShareImage } from './shareImage';

interface H2HResultsProps {
  names: [string, string];
  rosters: [Roster, Roster];
  /** Reopened run: reuse this seed and skip saving to history. */
  fixedSeed?: number;
  onPlayAgain: () => void;
  onHome: () => void;
}

export function H2HResults({ names, rosters, fixedSeed, onPlayAgain, onHome }: H2HResultsProps) {
  const seed = useMemo(() => fixedSeed ?? randomSeed(), [fixedSeed]);
  const teams = useMemo(
    () =>
      [
        buildTeam(names[0], rosters[0], DATASET.leagueContext),
        buildTeam(names[1], rosters[1], DATASET.leagueContext),
      ] as const,
    [names, rosters],
  );
  const series = useMemo(() => simulateSeries(teams[0], teams[1], seed), [teams, seed]);
  const explanation = useMemo(
    () => explainSeries(teams[0], teams[1], series),
    [teams, series],
  );
  const [copied, setCopied] = useState(false);

  const winnerName = names[series.winner];
  const loserName = names[series.winner === 0 ? 1 : 0];
  const summary = `${winnerName} ${Math.max(...series.wins)}–${Math.min(...series.wins)} ${loserName}`;

  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current || fixedSeed !== undefined) return;
    savedRef.current = true;
    addHistory({
      mode: 'h2h',
      summary,
      rosterNames: [
        ...rosterPlayers(rosters[0]).map((p) => `${names[0]}: ${p.name}`),
        ...rosterPlayers(rosters[1]).map((p) => `${names[1]}: ${p.name}`),
      ],
      seed,
      h2h: {
        names,
        rosterIds: [
          POSITIONS.map((pos) => rosters[0][pos]?.id ?? ''),
          POSITIONS.map((pos) => rosters[1][pos]?.id ?? ''),
        ],
      },
    });
  }, [summary, rosters, names, seed, fixedSeed]);

  const copy = async () => {
    const lines = [
      'Hardwood GM — Head-to-Head',
      `${summary} (best of 7, seed ${seed})`,
      `Games: ${series.games.map((g) => `${g.aPts}–${g.bPts}${g.overtimes > 0 ? ' OT' : ''}`).join(', ')}`,
      `Single-game odds: ${names[0]} ${(series.monteCarlo.aWinPct * 100).toFixed(0)}% over ${series.monteCarlo.runs} sims`,
      `Why: ${explanation.slice(0, 2).map((n) => n.text).join(' ')}`,
    ];
    setCopied(await copyText(lines.join('\n')));
    window.setTimeout(() => setCopied(false), 2000);
  };

  const shareImage = () => {
    downloadShareImage(
      {
        title: 'HARDWOOD GM · HEAD-TO-HEAD',
        headline: summary,
        subtitle: `Best of 7 · games: ${series.games.map((g) => `${g.aPts}–${g.bPts}`).join(', ')}`,
        lines: POSITIONS.flatMap((pos) => [
          { label: `${pos}`, value: `${rosters[0][pos]?.name ?? '—'}  vs  ${rosters[1][pos]?.name ?? '—'}` },
        ]),
        extra: explanation.slice(0, 2).map((n) => n.text),
        footer: `${names[0]} vs ${names[1]} · seed ${seed} · hardwood-gm`,
      },
      `hardwood-gm-${Math.max(...series.wins)}-${Math.min(...series.wins)}-${seed}.png`,
    );
  };

  return (
    <div className="screen results-screen">
      <header className="results-header">
        <h2>Series over</h2>
        <div className="record">{summary}</div>
        <p className="muted">
          Best of 7 · possession-by-possession · seed {seed}
        </p>
      </header>

      <section>
        <h3>Games</h3>
        <div className="game-chips">
          {series.games.map((g, i) => (
            <div key={i} className={`game-chip ${g.winner === 0 ? 'chip-a' : 'chip-b'}`}>
              <span className="muted">G{i + 1} · 🏠 {names[g.home]}</span>
              <strong>
                {g.aPts}–{g.bPts}
              </strong>
              {g.overtimes > 0 && <span className="muted">OT{g.overtimes > 1 ? `×${g.overtimes}` : ''}</span>}
              <span className="chip-winner">{names[g.winner]}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="results-grid">
        <div>
          <h3>Why</h3>
          <ul className="why-list">
            {explanation.map((n, i) => (
              <li key={i} className={`why-${n.tone}`}>
                <span className="why-dot" aria-hidden />
                {n.text}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Matchup odds</h3>
          <p>
            Over {series.monteCarlo.runs.toLocaleString()} simulated games:{' '}
            <strong>{names[0]}</strong> wins {(series.monteCarlo.aWinPct * 100).toFixed(1)}%
            (avg {fmt1(series.monteCarlo.avgPtsA)}–{fmt1(series.monteCarlo.avgPtsB)}).
          </p>
          <p className="muted">
            Second-chance points/game: {names[0]} {fmt1(series.monteCarlo.avgSecondChanceA)},{' '}
            {names[1]} {fmt1(series.monteCarlo.avgSecondChanceB)}.
          </p>
        </div>
      </section>

      <section>
        <h3>Deciding game box score ({series.decidingGame.a.pts}–{series.decidingGame.b.pts})</h3>
        <BoxTable label={names[0]} box={series.decidingGame.a} />
        <BoxTable label={names[1]} box={series.decidingGame.b} />
      </section>

      <section className="results-grid">
        <div>
          <h4>{names[0]}</h4>
          <RosterStatsTable roster={rosters[0]} />
        </div>
        <div>
          <h4>{names[1]}</h4>
          <RosterStatsTable roster={rosters[1]} />
        </div>
      </section>

      <footer className="results-actions">
        <button className="btn btn-primary" onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy result'}
        </button>
        <button className="btn" onClick={shareImage}>Save image</button>
        <button className="btn" onClick={onPlayAgain}>Run it back</button>
        <button className="btn btn-ghost" onClick={onHome}>Home</button>
      </footer>
    </div>
  );
}

function BoxTable({ label, box }: { label: string; box: TeamBox }) {
  return (
    <div className="box-table">
      <h4>
        {label} — {box.pts}
      </h4>
      <div className="player-table-wrap">
      <table className="player-table">
        <thead>
          <tr>
            <th className="left">Player</th>
            <th>PTS</th><th>REB</th><th>AST</th><th>STL</th><th>BLK</th><th>TOV</th>
            <th>FG</th><th>3P</th><th>FT</th>
          </tr>
        </thead>
        <tbody>
          {box.players.map((l) => (
            <tr key={l.name}>
              <td className="left strong">{l.slot} {l.name}</td>
              <td>{l.pts}</td><td>{l.reb}</td><td>{l.ast}</td>
              <td>{l.stl}</td><td>{l.blk}</td><td>{l.tov}</td>
              <td>{l.fgm}/{l.fga}</td>
              <td>{l.tpm}/{l.tpa}</td>
              <td>{l.ftm}/{l.fta}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
