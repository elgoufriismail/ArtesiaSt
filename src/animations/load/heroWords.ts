import { ANIM } from '../config';
import { pending } from '../core/todo';

/**
 * FIRST-CLASS #1 — Hero word-by-word blur reveal (ANIMATIONS.md B1).
 * Each word: opacity 0.001, y +10px, blur(10px) → rest; 1.6 s 'framer', delay 0.1 + 0.2·i.
 * Starts after document.fonts.ready (the original starts ≈2.2 s after navigation, post-hydration).
 * Markup contract: <SplitWords> renders each word as <span data-word> (inline-block).
 */
export function heroWordReveal(words: HTMLElement[], cfg = ANIM.B1.heroWords) {
  void words; void cfg;
  pending('B1', 'hero word reveal');
}
