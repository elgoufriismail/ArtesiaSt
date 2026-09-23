import { ANIM } from '../config';
import { pending } from '../core/todo';

/** B8 counters (desktop): number y −40 → 0 and label y +40 → 0 with opacity, replay on re-entry. */
export function counters(items: { number: HTMLElement; label: HTMLElement }[], cfg = ANIM.B8) {
  void items; void cfg;
  pending('B8', 'counters');
}
