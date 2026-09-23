import { gsap } from '../core/gsap';
import { onMarker } from '../core/scroll';

/** Run `fn` after `frames` ticker ticks. */
function afterTicks(frames: number, fn: () => void) {
  if (frames <= 0) { fn(); return; }
  gsap.ticker.add(() => afterTicks(frames - 1, fn), true);
}

/**
 * Framer scroll-target variants: calls onChange(true/false) when marker `id` crosses `line`×vh.
 * Used by B2 (lines/intro fade), B3 (balance states), B7 (steps), B10 (nav theme boundaries).
 *
 * Start phase: Framer applies a variant change as a new animation that starts on a LATER frame at
 * elapsed 0. A GSAP tween created on this tick would already be one frame in when it first renders.
 * The change is therefore delivered `frames` ticks later. Fitted t0 at 60 fps (tools/compare/timing.mjs):
 * Page Intro ≈ +1 frame. The Animated Lines code component ≈ +2 frames (the variant reaches it one
 * render later): t0 18–48 ms out, 28–34 ms back.
 */
export function markerState(id: string, line: number, onChange: (passed: boolean) => void, frames = 1) {
  return onMarker(id, line, (passed) => afterTicks(frames, () => onChange(passed)));
}
