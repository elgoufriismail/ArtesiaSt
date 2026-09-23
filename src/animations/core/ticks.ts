import { gsap } from './gsap';

/**
 * Run `fn` after `frames` real GSAP ticker frames (0 = now). Used to reproduce Framer's frame-phase
 * start lags. GSAP runs listeners added during a tick in that same tick, because its loop re-reads the
 * listener count. So nested one-shot listeners would collapse into a single frame. This counts
 * gsap.ticker.frame instead.
 */
export function afterTicks(frames: number, fn: () => void) {
  if (frames <= 0) { fn(); return; }
  const target = gsap.ticker.frame + frames;
  const check = () => {
    if (gsap.ticker.frame < target) return;
    gsap.ticker.remove(check);
    fn();
  };
  gsap.ticker.add(check);
}
