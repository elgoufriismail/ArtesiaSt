import { ANIM } from '../config';
import { pending } from '../core/todo';

/**
 * FIRST-CLASS #5/#6 — How It Works pinned column + odometer step number (B7).
 * Pinning is CSS `position: sticky` (as in the original). This module drives the digit column:
 * on step markers (step-2/3 @ 0.5 vh) the active digit strip slides from ±rollDistance → 0 while
 * outgoing/incoming layers cross-fade (spring 0.5 s, bounce 0). Reverses when scrolling up.
 */
export function rollingNumber(digitColumn: HTMLElement, layers: HTMLElement[], cfg = ANIM.B7) {
  void digitColumn; void layers; void cfg;
  pending('B7', 'rolling step number');
}
