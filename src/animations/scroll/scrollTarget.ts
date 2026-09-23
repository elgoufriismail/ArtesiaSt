import { gsap } from '../core/gsap';
import { onTargetProgress } from '../core/scroll';

/**
 * Generic Framer onScrollTarget transform (used by B2 portrait fade, B11 fold, B12 drift, B13 footer):
 * interpolates numeric CSS/GSAP props from `from` to `to` by targetProgress(target, threshold).
 * Validated mapping: see tests/unit/scroll-math.test.ts.
 */
export function scrollTargetTransform(
  el: Element,
  target: Element,
  threshold: number,
  from: Record<string, number>,
  to: Record<string, number>,
) {
  const keys = Object.keys(to);
  const setters = keys.map((k) => gsap.quickSetter(el, k));
  return onTargetProgress(target, threshold, (p) => {
    keys.forEach((k, i) => setters[i](from[k] + (to[k] - from[k]) * p));
  });
}
