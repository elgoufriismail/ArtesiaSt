import { gsap } from '../core/gsap';
import { ANIM } from '../config';

/**
 * B1 entrance — opacity 0.001 → 1 and y (±20) → 0, 1 s 'entrance', per-element delay
 * (nav, hero text, booking block). Explicit from→to so a CSS-provided initial state (first paint,
 * like Framer's SSR'd initial styles) never becomes the end state.
 */
export function entrance(el: Element, delay: number, direction: 1 | -1 = 1, cfg = ANIM.B1.entrance) {
  return gsap.fromTo(el, { opacity: 0.001, y: direction * cfg.distance }, { opacity: 1, y: 0, duration: cfg.duration, ease: cfg.ease, delay });
}
