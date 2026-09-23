import { gsap } from '../core/gsap';
import { ANIM } from '../config';

/**
 * B9 generic in-view appear: opacity 0 → 1 (0.8 s 'framer') when any part of the element enters the
 * viewport; instant reset to 0 once it is fully out, so it replays on every re-entry (both directions).
 * Uses an IntersectionObserver like the original (Framer in-view, amount 0). Edge contact counts as
 * intersecting, which ScrollTrigger's 'top bottom' does not (verified at the Philosophy icon, whose top
 * lands exactly on the viewport edge at the original's trigger step). It is also correct for sticky elements.
 */
export function reveal(targets: Element[], cfg = ANIM.B9) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) gsap.to(e.target, { opacity: 1, duration: cfg.t.duration, ease: cfg.t.ease, overwrite: true });
      else if (cfg.resetOnExit) gsap.set(e.target, { opacity: 0, overwrite: true });
    }
  }, { threshold: cfg.threshold });
  targets.forEach((el) => { gsap.set(el, { opacity: 0 }); io.observe(el); });
  return () => io.disconnect();
}
