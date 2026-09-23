import { ANIM } from '../config';
import { pending } from '../core/todo';

export type NavTheme = 'light' | 'dark';

/**
 * FIRST-CLASS #10 — nav colour transitions (B10, desktop).
 * Sections declare data-nav-theme; the theme under the nav bar (boundaries calibrated to the
 * recon ranges: white 0→1400, dark →9400, white →10500, dark →16050, white) cross-fades the two
 * stacked menu rows (opacity) and tweens the logo dot colour (0.3 s).
 */
export function navTheme(nav: HTMLElement, rows: { light: HTMLElement; dark: HTMLElement }, cfg = ANIM.B10) {
  void nav; void rows; void cfg;
  pending('B10', 'nav theme');
}
