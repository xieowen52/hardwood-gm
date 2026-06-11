/**
 * The randomizer "wheel": cycles through combo labels with decelerating
 * ticks (with sound), settles on the predrawn target, fires a confetti
 * burst, then notifies the parent.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { COMBOS } from '../data/dataset';
import type { FranchiseDecadeCombo } from '../data/types';
import { comboColors, comboLabel } from './format';
import { wheelSettle, wheelTick } from './sound';

interface WheelProps {
  target: FranchiseDecadeCombo;
  onSettled: () => void;
}

const TICKS = 14;
const CONFETTI_COLORS = ['#f5a623', '#4cc38a', '#e5534b', '#6cb6ff', '#d2a8ff', '#ffffff'];

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
        wheelSettle();
        timer = window.setTimeout(() => onSettledRef.current(), 950);
        return;
      }
      const next = pool[Math.floor(Math.random() * pool.length)];
      if (next) setShown(next);
      wheelTick();
      timer = window.setTimeout(step, 45 + tick * tick * 2.2);
    };
    step();
    return () => window.clearTimeout(timer);
  }, [target]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: `${4 + Math.random() * 92}%`,
        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: `${Math.random() * 0.25}s`,
        duration: `${0.8 + Math.random() * 0.7}s`,
        drift: `${(Math.random() * 2 - 1) * 80}px`,
        spin: `${360 + Math.random() * 540}deg`,
      })),
    [target],
  );

  const [primary, secondary] = comboColors(shown);
  return (
    <div className={`wheel ${settled ? 'wheel-settled' : 'wheel-spinning'}`} aria-live="polite">
      <span className="wheel-ring" aria-hidden />
      {settled &&
        confetti.map((p, i) => (
          <span
            key={i}
            className="confetti"
            style={{
              left: p.left,
              background: p.background,
              animationDelay: p.delay,
              animationDuration: p.duration,
              ['--drift' as string]: p.drift,
              ['--spin' as string]: p.spin,
            }}
          />
        ))}
      <span
        className="swatch swatch-lg"
        style={{ background: `linear-gradient(135deg, ${primary} 50%, ${secondary} 50%)` }}
      />
      <span className="wheel-label">{comboLabel(shown)}</span>
    </div>
  );
}
