import { gsap } from '../core/gsap';
import type { Tween } from '../config';

/** B1 load fades (hero backdrop, waves, hero lines) — opacity from ~0 to target on mount. */
export function loadFade(el: Element, to: number, t: Tween) {
  return gsap.fromTo(el, { opacity: 0.001 }, { opacity: to, duration: t.duration, ease: t.ease, delay: t.delay ?? 0 });
}
