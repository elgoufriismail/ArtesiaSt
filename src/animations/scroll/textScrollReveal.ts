import { ANIM } from '../config';
import { pending } from '../core/todo';

/**
 * B15 Philosophy statement word-by-word opacity reveal (scroll-linked, reversible).
 * Progress = revealProgress(el top, start 1 → end 0.25); word i fades min→max over [i/n,(i+1)/n];
 * smoothed like a stiff spring (500/60/1) — implemented with gsap.quickTo on a progress proxy.
 */
export function textScrollReveal(container: HTMLElement, words: HTMLElement[], cfg = ANIM.B15) {
  void container; void words; void cfg;
  pending('B15', 'text scroll reveal');
}
