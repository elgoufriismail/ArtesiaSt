import { gsap, ScrollTrigger } from '../core/gsap';
import { ANIM } from '../config';

/**
 * B9 generic in-view fade: opacity 0 → 1 (0.8 s 'framer') when any pixel enters the viewport;
 * instant reset to 0 once fully out of view, so it replays on every re-entry (both directions).
 */
export function reveal(targets: Element[], cfg = ANIM.B9) {
  return targets.map((el) => {
    gsap.set(el, { opacity: 0 });
    return ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        if (self.isActive) gsap.to(el, { opacity: 1, duration: cfg.t.duration, ease: cfg.t.ease, overwrite: true });
        else if (cfg.resetOnExit) gsap.set(el, { opacity: 0, overwrite: true });
      },
    });
  });
}
