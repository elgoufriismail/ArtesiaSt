import { ScrollTrigger } from '../core/gsap';
import { ANIM } from '../config';

export type NavTheme = 'light' | 'dark';

/**
 * FIRST-CLASS #10 — desktop nav colour transitions (ANIMATIONS.md B10).
 * Every element with [data-nav-theme] (section roots, plus boundary markers such as `dark-nav-1`)
 * declares the theme from its top edge downwards. The theme under viewport y = cfg.line decides the
 * nav mode; the nav gets data-theme="light|dark" and CSS cross-fades the two stacked menu rows
 * (opacity) and the logo/dot colours over cfg.t (0.3 s 'framer' — measured intermediate colours).
 * Light = white text over photos (hero/toggle, big quote, footer); dark = ink/green on light sections.
 */
export function navTheme(nav: HTMLElement, cfg = ANIM.B10) {
  let bounds: { top: number; theme: NavTheme }[] = [];
  const measure = () => {
    bounds = [...document.querySelectorAll<HTMLElement>('[data-nav-theme]')]
      .map((el) => ({ top: el.getBoundingClientRect().top + window.scrollY, theme: el.dataset.navTheme as NavTheme }))
      .sort((a, b) => a.top - b.top);
  };
  const update = () => {
    const y = window.scrollY + cfg.line;
    let theme: NavTheme = 'light';
    for (const b of bounds) { if (b.top <= y) theme = b.theme; else break; }
    if (nav.dataset.theme !== theme) nav.dataset.theme = theme;
  };
  measure();
  update();
  return ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: () => { measure(); update(); } });
}
