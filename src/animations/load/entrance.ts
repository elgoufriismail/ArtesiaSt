import { gsap } from '../core/gsap';
import { ANIM } from '../config';

/** B1 entrance — opacity 0 → 1 and y ±20 → 0, 1 s 'entrance', per-element delay (nav, hero text, book block). */
export function entrance(el: Element, delay: number, direction: 1 | -1 = 1, cfg = ANIM.B1.entrance) {
  return gsap.from(el, { opacity: 0.001, y: direction * cfg.distance, duration: cfg.duration, ease: cfg.ease, delay });
}
