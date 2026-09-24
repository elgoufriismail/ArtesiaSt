import { gsap } from '../core/gsap';
import { ANIM } from '../config';
import { onMarker } from '../core/scroll';
import { afterTicks } from '../core/ticks';

/**
 * FIRST-CLASS #5/#6 — How It Works pinned column + odometer step number (B7).
 * Pinning is CSS `position: sticky` (as in the original). Measured on the original (Step 7):
 *   variant = number of step markers passed (step-2/3-trigger, line 0.5 vh, +2 px);
 *   all five digit layers (each a "1…9" strip showing only its own digit) move together: their `top`
 *   (% of the digit box) goes 623 → 481 → 337 %, a Framer layout FLIP = linear visual-box interpolation;
 *   the outgoing layer fades 1 → 0 while the incoming one fades 0 → 1;
 *   both 0.8 s cubic-bezier(.6,0,.4,1), both directions; the fade starts one frame after the slide.
 * The first state (page loaded mid-section) is applied without animation.
 */
export function rollingNumber(layers: HTMLElement[], cfg = ANIM.B7) {
  const passed = cfg.markers.map(() => null as boolean | null);
  const pos = { top: cfg.tops[0] as number };
  let state = -1;
  const paint = () => layers.forEach((l) => { l.style.top = `${pos.top}%`; });
  const go = (k: number, animate: boolean) => {
    if (k === state) return;
    state = k;
    if (!animate) {
      gsap.killTweensOf(pos); gsap.killTweensOf(layers);
      pos.top = cfg.tops[k]; paint();
      layers.forEach((l, i) => gsap.set(l, { opacity: i === k ? 1 : 0 }));
      return;
    }
    const { duration, ease } = cfg.t;
    afterTicks(cfg.lagFrames.layout, () => gsap.to(pos, { top: cfg.tops[k], duration, ease, overwrite: true, onUpdate: paint }));
    afterTicks(cfg.lagFrames.opacity, () => layers.forEach((l, i) => gsap.to(l, { opacity: i === k ? 1 : 0, duration, ease, overwrite: true })));
  };
  const triggers = cfg.markers.map((id, m) => onMarker(id, cfg.line, (p) => {
    const first = passed[m] === null;
    passed[m] = p;
    if (passed.some((x) => x === null)) return;          // wait until every marker reported once
    const k = passed.filter(Boolean).length;
    go(k, state >= 0 && !first);
  }, 'top', cfg.tolerance));
  return () => {
    triggers.forEach((t) => t?.kill());
    gsap.killTweensOf(pos); gsap.killTweensOf(layers);
  };
}
