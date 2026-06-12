/**
 * The draw display: two SEPARATE boxes — an Era box (the decade) and a Team
 * box (the franchise) — each with its own re-roll token button. Re-rolling
 * the team spins only the team box; re-rolling the era spins only the era box.
 * Replaces the old full-screen wheel: a box briefly shuffles through a few
 * candidates, then locks onto its value with a tick + chime.
 */
import { useEffect, useRef, useState } from 'react';
import { COMBOS } from '../data/dataset';
import { franchiseCity, getFranchise } from '../data/franchises';
import type { Decade, FranchiseDecadeCombo } from '../data/types';
import { eraLabel, teamLabel } from './format';
import { wheelSettle, wheelTick } from './sound';

interface ComboRevealProps {
  combo: FranchiseDecadeCombo;
  /** Which box just changed (drives the shuffle), or 'both' on a new round. */
  spin: 'team' | 'era' | 'both' | null;
  onSettled: () => void;
  /** Re-roll controls. */
  canTeam: boolean;
  canEra: boolean;
  teamTokens: number;
  eraTokens: number;
  onReroll: (kind: 'team' | 'era') => void;
}

const DECADES = [...new Set(COMBOS.map((c) => c.decade))].sort((a, b) => a - b);
const FRANCHISES = [...new Set(COMBOS.map((c) => c.franchiseId))];
const SHUFFLE_TICKS = 9;

function colorsFor(franchiseId: string): [string, string] {
  return getFranchise(franchiseId)?.colors ?? ['#444', '#888'];
}

/** A single shuffling box. Cycles random candidates, then lands on `value`. */
function SpinBox({
  kind,
  decade,
  franchiseId,
  spinning,
  onLand,
}: {
  kind: 'era' | 'team';
  decade: Decade;
  franchiseId: string;
  spinning: boolean;
  onLand: () => void;
}) {
  // What the box currently shows mid-shuffle.
  const [shownDecade, setShownDecade] = useState(decade);
  const [shownFranchise, setShownFranchise] = useState(franchiseId);
  const landRef = useRef(onLand);
  landRef.current = onLand;

  useEffect(() => {
    if (!spinning) {
      setShownDecade(decade);
      setShownFranchise(franchiseId);
      return;
    }
    let tick = 0;
    let timer = 0;
    const step = () => {
      tick++;
      if (tick >= SHUFFLE_TICKS) {
        setShownDecade(decade);
        setShownFranchise(franchiseId);
        wheelSettle();
        timer = window.setTimeout(() => landRef.current(), 420);
        return;
      }
      if (kind === 'era') {
        setShownDecade(DECADES[Math.floor(Math.random() * DECADES.length)] ?? decade);
      } else {
        setShownFranchise(FRANCHISES[Math.floor(Math.random() * FRANCHISES.length)] ?? franchiseId);
      }
      wheelTick();
      timer = window.setTimeout(step, 55 + tick * tick * 4);
    };
    step();
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, decade, franchiseId, kind]);

  const label =
    kind === 'era' ? eraLabel(shownDecade) : franchiseCity(shownFranchise, shownDecade);
  const [primary, secondary] = colorsFor(shownFranchise);

  return (
    <div
      className={`spin-box spin-box-${kind} ${spinning ? 'spin-box-spinning' : 'spin-box-settled'}`}
    >
      <span className="spin-box-kind">{kind === 'era' ? 'ERA' : 'TEAM'}</span>
      <span className="spin-box-value">
        {kind === 'team' && (
          <span
            className="swatch"
            style={{ background: `linear-gradient(135deg, ${primary} 50%, ${secondary} 50%)` }}
          />
        )}
        {label}
      </span>
    </div>
  );
}

export function ComboReveal({
  combo,
  spin,
  onSettled,
  canTeam,
  canEra,
  teamTokens,
  eraTokens,
  onReroll,
}: ComboRevealProps) {
  // Each box settles independently; we only call onSettled once nothing is
  // spinning. For 'both' (new round) we wait for the team box (the slower one).
  const settledRef = useRef(onSettled);
  settledRef.current = onSettled;
  const spinTeam = spin === 'team' || spin === 'both';
  const spinEra = spin === 'era' || spin === 'both';

  // Track which boxes have landed this spin.
  const pendingRef = useRef(0);
  useEffect(() => {
    pendingRef.current = (spinTeam ? 1 : 0) + (spinEra ? 1 : 0);
    if (pendingRef.current === 0) settledRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spin, combo.key]);

  const land = () => {
    pendingRef.current -= 1;
    if (pendingRef.current <= 0) settledRef.current();
  };

  return (
    <div className="combo-reveal">
      <div className="combo-boxes">
        <div className="combo-slot combo-slot-team">
          <SpinBox
            kind="team"
            decade={combo.decade}
            franchiseId={combo.franchiseId}
            spinning={spinTeam}
            onLand={land}
          />
          <button
            className="btn reroll-mini reroll-team"
            disabled={!canTeam}
            onClick={() => onReroll('team')}
            title={canTeam ? 'Spin a new franchise (keeps the era)' : 'No team token / no alternative franchise'}
          >
            🔁 Re-roll team · {teamTokens}
          </button>
        </div>

        <span className="combo-x">×</span>

        <div className="combo-slot combo-slot-era">
          <SpinBox
            kind="era"
            decade={combo.decade}
            franchiseId={combo.franchiseId}
            spinning={spinEra}
            onLand={land}
          />
          <button
            className="btn reroll-mini reroll-era"
            disabled={!canEra}
            onClick={() => onReroll('era')}
            title={canEra ? 'Spin a new decade (keeps the team)' : 'No era token / no alternative decade'}
          >
            📅 Re-roll era · {eraTokens}
          </button>
        </div>
      </div>
      {spin === null && (
        <p className="combo-hint muted">
          {teamLabel(combo.franchiseId, combo.decade)} in the {eraLabel(combo.decade)} —
          pick one player and assign a slot.
        </p>
      )}
    </div>
  );
}
