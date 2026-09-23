import { ANIM } from '../config';
import { pending } from '../core/todo';

/**
 * FIRST-CLASS #12 — FAQ expansion: height auto-animate (Flip/height tween, spring ≈0.55 s),
 * answer fade-in, plus-icon rotate 0 → 135°. Items are independent (not exclusive).
 */
export function accordionToggle(item: HTMLElement, open: boolean, cfg = ANIM.faq) {
  void item; void open; void cfg;
  pending('faq', 'accordion');
}
