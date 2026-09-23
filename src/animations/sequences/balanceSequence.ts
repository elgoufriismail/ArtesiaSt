import { ANIM } from '../config';
import { pending } from '../core/todo';

/**
 * FIRST-CLASS #3 — Balance scroll-driven switch (B3):
 * state Start (dot) → Off (full switch, Flip grow) at toggle-start marker; Off → On (knob right,
 * track green, headline pair cross-fade) at toggle-on marker; both reverse on scroll-up.
 */
export interface BalanceParts { switchRoot: HTMLElement; track: HTMLElement; knob: HTMLElement; label: HTMLElement; before: HTMLElement; after: HTMLElement }
export function balanceSequence(parts: BalanceParts, cfg = ANIM.B3) {
  void parts; void cfg;
  pending('B3', 'balance sequence');
}
