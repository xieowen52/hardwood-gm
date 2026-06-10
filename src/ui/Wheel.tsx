/**
 * The randomizer "wheel": cycles through combo labels with decelerating
 * ticks, settles on the predrawn target, then notifies the parent.
 */
import { useEffect, useRef, useState } from 'react';
import { COMBOS } from '../data/dataset';
import type { FranchiseDecadeCombo } from '../data/types';
import { comboColors, comboLabel } from './format';

interface WheelProps {
  target: FranchiseDecadeCombo;
  onSettled: () => void;
}

const TICKS = 14;

export function Wheel({ target, onSettled }: WheelProps) {
  const [shown, setShown] = useState<FranchiseDecadeCombo>(target);
  const [settled, setSettled] = useState(false);
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;

  useEffect(() => {
    setSettled(false);
    let tick = 0;
    let timer = 0;
    const pool = COMBOS.length > 1 ? COMBOS.filter((c) => c.key !== target.key) : COMBOS;

    const step = () => {
      tick++;
      if (tick >= TICKS) {
        setShown(target);
        setSettled(true);
        timer = window.setTimeout(() => onSettledRef.current(), 650);
        return;
      }
      const next = pool[Math.floor(Math.random() * pool.length)];
      if (next) setShown(next);
      timer = window.setTimeout(step, 45 + tick * tick * 2.2);
    };
    step();
    return () => window.clearTimeout(timer);
  }, [target]);

  const [primary, secondary] = comboColors(shown);
  return (
    <div className={`wheel ${settled ? 'wheel-settled' : 'wheel-spinning'}`} aria-live="polite">
      <span
        className="swatch swatch-lg"
        style={{ background: `linear-gradient(135deg, ${primary} 50%, ${secondary} 50%)` }}
      />
      <span className="wheel-label">{comboLabel(shown)}</span>
    </div>
  );
}
