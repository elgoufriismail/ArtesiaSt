import { ANIM } from '../config';
import { pending } from '../core/todo';

/**
 * FIRST-CLASS #11 — tablet/phone menu (B17): white panel reveals top→down (0.3 s), items mount
 * 20px low and fade in together (0.3 → 0.8 s); close reverses (0.4 s). Returns open/close timelines.
 * Scroll lock is React-side (useScrollLock).
 */
export function mobileMenuTimeline(panel: HTMLElement, items: HTMLElement[], cfg = ANIM.B17) {
  void panel; void items; void cfg;
  pending('B17', 'mobile menu');
  return null;
}
