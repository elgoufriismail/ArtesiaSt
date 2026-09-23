import { gsap } from '../core/gsap';
import { ANIM } from '../config';
import { toVars } from '../core/transition';
import { loadFade } from '../load/loadFade';
import { entrance } from '../load/entrance';
import { scrollTargetTransform } from '../scroll/scrollTarget';
import { markerState } from '../scroll/markerState';
import { speedParallax } from '../parallax/speedParallax';
import { drawPath } from '../svg/drawPath';
import type { Breakpoint } from '@/lib/breakpoints';

/**
 * FIRST-CLASS #2 (+ #13 hero lines, B1 hero parts) — hero load + exit sequence (ANIMATIONS.md B1/B2):
 *  load:   backdrop 0.001 → 1 (2 s 'hero'); lines 0.001 → 0.5 / 1 (2 s 'hero', +0.4 s, desktop);
 *          paragraph y −20 → 0 and CTA y +20 → 0 with opacity (1 s 'entrance', +0.4 s, desktop).
 *  scroll: portrait opacity = 1 − targetProgress(Hero, threshold 0) — reveals the green backdrop;
 *          intro text container y = 0.3 × scrollY (desktop, Framer speed 70);
 *          lines drawn by GSAP ScrollTrigger scrub (top 50% → bottom 50%, scrub 0.5);
 *          lines fade out (1.2 s 'strong', back 0.8 s) when `toggle-start-animation` crosses 50 % vh;
 *          whole Page Intro fades out (spring 1.2 s, back 0.8 s) when `toggle-on-animation` crosses 50 % vh.
 */
export interface HeroParts {
  root: HTMLElement;          // Page Intro
  hero: HTMLElement;          // Hero (scroll target for the portrait fade)
  backdrop: HTMLElement;      // sticky "Image" layer
  portrait: HTMLElement;      // "Hero Image" layer
  lines: HTMLElement | null;  // "Animated Lines" container
  lineWraps: HTMLElement[];   // [0] → opacity 0.5, [1] → opacity 1
  paths: SVGPathElement[];
  introContainer: HTMLElement | null;
  paragraph: HTMLElement | null;
  cta: HTMLElement | null;
}

export function heroSequence(p: HeroParts, bp: Breakpoint, cfg = ANIM) {
  const desktop = bp === 'desktop';

  // ── load ──
  loadFade(p.backdrop, 1, cfg.B1.backdrop.t);
  if (desktop && p.lines) {
    p.lineWraps.forEach((w, i) => { const l = cfg.B1.heroLines[i]; if (l) loadFade(w, l.to.opacity, l.t); });
    p.paths.forEach((path) => drawPath(path, cfg.draw));
  }
  if (cfg.B1.heroTextEntranceEnabled[bp]) {
    if (p.paragraph) entrance(p.paragraph, cfg.B1.entranceDelays.heroParagraph, -1, { fromLoad: true });
    if (p.cta) entrance(p.cta, cfg.B1.entranceDelays.heroCta, 1, { fromLoad: true });
  }

  // ── scroll ──
  scrollTargetTransform(p.portrait, p.hero, cfg.B2.portraitFade.threshold, { opacity: cfg.B2.portraitFade.from }, { opacity: cfg.B2.portraitFade.to });
  if (p.introContainer) speedParallax(p.introContainer, cfg.B2.textParallaxFactor[bp]);

  if (desktop && p.lines) {
    const lines = p.lines;
    markerState(cfg.B2.linesFadeOut.marker, cfg.B2.linesFadeOut.line, (passed) => {
      gsap.to(lines, { opacity: passed ? 0 : 1, ...toVars(passed ? cfg.B2.linesFadeOut.t : cfg.B2.linesFadeOut.back), overwrite: true });
    }, cfg.B2.linesFadeOut.startFrames, cfg.B2.linesFadeOut.edge);
  }
  const root = p.root;
  markerState(cfg.B2.introFadeOut.marker, cfg.B2.introFadeOut.line, (passed) => {
    gsap.to(root, { opacity: passed ? 0 : 1, ...toVars(passed ? cfg.B2.introFadeOut.t : cfg.B2.introFadeOut.back), overwrite: true });
  }, cfg.B2.introFadeOut.startFrames, cfg.B2.introFadeOut.edge);
}
