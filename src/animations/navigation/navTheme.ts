import { ScrollTrigger } from '../core/gsap';
import { ANIM } from '../config';

export type NavTheme = 'light' | 'dark';

/**
 * FIRST-CLASS #10 — desktop nav colour transitions (ANIMATIONS.md B10).
 * Every element with [data-nav-theme] (section roots, plus boundary markers such as `dark-nav-1`)
 * declares the theme from its top edge downwards; a boundary takes over once its top reaches viewport y =
 * cfg.sectionLine (section roots) or cfg.markerLine (scroll markers). The last boundary passed decides the nav mode; the nav gets data-theme="light|dark" and CSS cross-fades the two stacked menu rows
 * (opacity) and the logo/dot colours over cfg.t (0.3 s 'framer' — measured intermediate colours).
 * Light = white text over photos (hero/toggle, big quote, footer); dark = ink/green on light sections.
 * Scroll markers listed in cfg.markers are extra boundaries (the footer switches at `footer-menu`).
 */
export function navTheme(nav: HTMLElement, cfg = ANIM.B10) {
  // `at`: the scrollY from which a boundary applies (its document top minus its line)
  const lineOf = (el: Element) => (el.hasAttribute('data-marker') ? cfg.markerLine : cfg.sectionLine);
  let bounds: { at: number; theme: NavTheme }[] = [];
  const measure = () => {
    const docTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
    bounds = [
      ...[...document.querySelectorAll<HTMLElement>('[data-nav-theme]')].map((el) => ({ at: docTop(el) - lineOf(el), theme: el.dataset.navTheme as NavTheme })),
      ...cfg.markers.flatMap((m) => [...document.querySelectorAll(`[data-marker="${m.marker}"]`)].map((el) => ({ at: docTop(el) - cfg.markerLine, theme: m.theme }))),
    ].sort((a, b) => a.at - b.at);
  };
  const update = () => {
    const y = window.scrollY;
    let theme: NavTheme = 'light';
    for (const b of bounds) { if (b.at <= y) theme = b.theme; else break; }
    if (nav.dataset.theme !== theme) nav.dataset.theme = theme;
  };
  measure();
  update();
  return ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: () => { measure(); update(); } });
}
