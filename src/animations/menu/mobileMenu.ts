import { gsap } from '../core/gsap';
import { toVars } from '../core/transition';
import { ANIM } from '../config';

/**
 * FIRST-CLASS #11 — tablet/phone menu (ANIMATIONS.md B17, measured frame-by-frame on the original):
 * Open: the full-screen white panel slides down from y −150 % to 0 (critically damped spring ≈0.6 s);
 * the links stay in place and fade 0 → 1 starting ≈0.25 s (spring-like ease-out). No stagger.
 * Close: links fade out (≈0.25 s), then the panel slides back up to −150 % (S-curve ≈0.6 s).
 */
export function animateMenu(panel: HTMLElement, list: HTMLElement, open: boolean, cfg = ANIM.B17) {
  gsap.killTweensOf([panel, list]);
  if (open) {
    gsap.set([panel, list], { visibility: 'visible' });
    const tl = gsap.timeline();
    tl.fromTo(panel, { y: 0, yPercent: parseFloat(cfg.panelFrom) }, { y: 0, yPercent: 0, ...toVars(cfg.panel) }, 0);
    tl.fromTo(list, { opacity: 0 }, { opacity: 1, ...toVars(cfg.items) }, 0);
    return tl;
  }
  const tl = gsap.timeline({ onComplete: () => { gsap.set([panel, list], { visibility: 'hidden' }); } });
  tl.to(list, { opacity: 0, ...toVars(cfg.closeItems) }, 0);
  tl.to(panel, { yPercent: parseFloat(cfg.panelFrom), ...toVars(cfg.close) }, 0);
  return tl;
}

/** @deprecated contract name kept for the plan's module map */
export const mobileMenuTimeline = animateMenu;
