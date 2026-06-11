/**
 * Results for Classic / Hoop IQ: projected 82-game record vs a league-average
 * opponent, category breakdown, the "why" explanation, era toggle, copy and
 * share-image. With a `fixedSeed` (reopened history) the exact run is
 * reproduced and not re-saved.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { DATASET } from '../data/dataset';
import { POSITIONS } from '../data/types';
import {
  buildTeam,
  explainSeason,
  randomSeed,
  rosterPlayers,
  simulateSeason,
  type Roster,
} from '../engine';
import { addHistory } from '../state/history';
import { copyText } from './copy';
import { fmt1 } from './format';
import { RosterStatsTable } from './RosterStatsTable';
import { downloadShareImage } from './shareImage';

interface SoloResultsProps {
  mode: 'classic' | 'hoopiq';
  roster: Roster;
  /** Reopened run: reuse this seed and skip saving to history. */
  fixedSeed?: number;
  onPlayAgain: () => void;
  onHome: () => void;
}

export function SoloResults({ mode, roster, fixedSeed, onPlayAgain, onHome }: SoloResultsProps) {
  const seed = useMemo(() => fixedSeed ?? randomSeed(), [fixedSeed]);
  const team = useMemo(
    () => buildTeam('Your team', roster, DATASET.leagueContext),
    [roster],
  );
  const season = useMemo(() => simulateSeason(team, seed), [team, seed]);
  const explanation = useMemo(() => explainSeason(team, season), [team, season]);
  const [copied, setCopied] = useState(false);
  const perfect = season.losses === 0;

  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current || fixedSeed !== undefined) return;
    savedRef.current = true;
    addHistory({
      mode,
      summary: `${season.wins}–${season.losses}`,
      rosterNames: rosterPlayers(roster).map((p) => p.name),
      seed,
      soloRosterIds: POSITIONS.map((pos) => roster[pos]?.id ?? ''),
    });
  }, [mode, roster, season, seed, fixedSeed]);

  // Yardstick: what the league-average opponent actually produced in the
  // same simulated games — apples-to-apples with the team's numbers.
  const avg = season.opponentTotals;

  const rosterLines = POSITIONS.map((pos) => {
    const p = roster[pos];
    return { label: pos, value: p ? `${p.name} (${p.decade}s, ${p.from}–${p.to})` : '—' };
  });

  const copy = async () => {
    const lines = [
      `Hardwood GM — ${mode === 'classic' ? 'Classic' : 'Hoop IQ'}`,
      `Projected record: ${season.wins}–${season.losses} (${fmt1(season.pointsFor)} for, ${fmt1(season.pointsAgainst)} against)`,
      ...rosterLines.map((l) => `${l.label}: ${l.value}`),
      `Why: ${explanation.slice(0, 2).join(' ')}`,
      `Seed ${seed}`,
    ];
    setCopied(await copyText(lines.join('\n')));
    window.setTimeout(() => setCopied(false), 2000);
  };

  const shareImage = () => {
    downloadShareImage(
      {
        title: `HARDWOOD GM · ${mode === 'classic' ? 'CLASSIC' : 'HOOP IQ'}`,
        headline: `${season.wins}–${season.losses}`,
        subtitle: `82 games vs a league-average team · ${fmt1(season.pointsFor)} ppg for, ${fmt1(season.pointsAgainst)} against`,
        lines: rosterLines,
        extra: explanation.slice(0, 2),
        footer: perfect ? 'PERFECT SEASON. 82–0. Hang the banner.' : `Seed ${seed} · hardwood-gm`,
      },
      `hardwood-gm-${season.wins}-${season.losses}-${seed}.png`,
    );
  };

  const categories = [
    ['Points', season.teamTotals.pts, avg.pts],
    ['Rebounds', season.teamTotals.reb, avg.reb],
    ['Assists', season.teamTotals.ast, avg.ast],
    ['Steals', season.teamTotals.stl, avg.stl],
    ['Blocks', season.teamTotals.blk, avg.blk],
    ['3PM', season.teamTotals.tpm, avg.tpm],
    ['Turnovers', season.teamTotals.tov, avg.tov],
  ] as const;

  return (
    <div className="screen results-screen">
      <header className="results-header">
        <h2>{mode === 'hoopiq' ? 'Hoop IQ — the reveal' : 'Season simulated'}</h2>
        <div className={`record ${perfect ? 'record-perfect' : ''}`}>
          {season.wins}–{season.losses}
        </div>
        {perfect && <div className="perfect-banner">🏆 PERFECT SEASON</div>}
        <p className="muted">
          82 games vs a league-average team · {fmt1(season.pointsFor)} ppg for,{' '}
          {fmt1(season.pointsAgainst)} against · seed {seed}
        </p>
      </header>

      {mode === 'hoopiq' && (
        <p className="notice">What you actually drafted, stats and all:</p>
      )}
      <RosterStatsTable roster={roster} />

      <section className="results-grid">
        <div className="panel">
          <h3>Team per game (vs league average)</h3>
          <div className="player-table-wrap">
      <table className="player-table">
            <thead>
              <tr>
                <th className="left">Category</th>
                <th>Your team</th>
                <th>League avg</th>
                <th>Edge</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(([label, ours, theirs]) => {
                const diff = ours - theirs;
                const inverted = label === 'Turnovers';
                const good = inverted ? diff < 0 : diff > 0;
                return (
                  <tr key={label}>
                    <td className="left">{label}</td>
                    <td>{fmt1(ours)}</td>
                    <td>{fmt1(theirs)}</td>
                    <td className={good ? 'pos' : 'neg'}>
                      {diff >= 0 ? '+' : ''}
                      {fmt1(diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </div>
        </div>

        <div className="panel">
          <h3>Why</h3>
          <ul className="why-list">
            {explanation.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <h3>Simulated per-game averages</h3>
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
          {season.playerAverages.map((l) => (
            <tr key={l.name}>
              <td className="left strong">{l.slot} {l.name}</td>
              <td>{fmt1(l.pts)}</td><td>{fmt1(l.reb)}</td><td>{fmt1(l.ast)}</td>
              <td>{fmt1(l.stl)}</td><td>{fmt1(l.blk)}</td><td>{fmt1(l.tov)}</td>
              <td>{fmt1(l.fgm)}/{fmt1(l.fga)}</td>
              <td>{fmt1(l.tpm)}/{fmt1(l.tpa)}</td>
              <td>{fmt1(l.ftm)}/{fmt1(l.fta)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <footer className="results-actions">
        <button className="btn btn-primary" onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy result'}
        </button>
        <button className="btn" onClick={shareImage}>Save image</button>
        <button className="btn" onClick={onPlayAgain}>Play again</button>
        <button className="btn btn-ghost" onClick={onHome}>Home</button>
      </footer>
    </div>
  );
}
