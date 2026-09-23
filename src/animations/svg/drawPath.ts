import { gsap } from '../core/gsap';
import { ANIM } from '../config';

/**
 * FIRST-CLASS #13 — decorative SVG line drawing (hero lines, How It Works line, quote lines,
 * pricing scribble): stroke-dashoffset L → 0, scrubbed by GSAP ScrollTrigger exactly like the
 * original's code component (start 'top 50%', end 'bottom 50%', scrub 0.5, ease none).
 */
export function drawPath(path: SVGPathElement, cfg = ANIM.draw, trigger: Element = path) {
  const len = path.getTotalLength();
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  return gsap.to(path, {
    strokeDashoffset: 0,
    ease: cfg.ease,
    scrollTrigger: { trigger, start: cfg.start, end: cfg.end, scrub: cfg.scrub },
  });
}
