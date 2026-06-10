/**
 * Tiny WebAudio effects — no audio assets, everything synthesized.
 * Fails silently when audio is unavailable (autoplay policy, no context).
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function blip(freq: number, start: number, duration: number, gainPeak: number, type: OscillatorType): void {
  const ac = audio();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ac.currentTime + start;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(gainPeak, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  } catch {
    /* ignore */
  }
}

/** Soft tick while the wheel cycles. */
export function wheelTick(): void {
  blip(2200, 0, 0.03, 0.02, 'square');
}

/** Little rising fanfare when the wheel settles. */
export function wheelSettle(): void {
  blip(523, 0, 0.18, 0.06, 'triangle'); // C5
  blip(659, 0.09, 0.18, 0.06, 'triangle'); // E5
  blip(784, 0.18, 0.28, 0.07, 'triangle'); // G5
}
