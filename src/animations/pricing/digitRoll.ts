import { ANIM } from '../config';
import { pending } from '../core/todo';

/**
 * FIRST-CLASS #8 — NumberFlow-style digit transition (no NumberFlow dependency).
 * Markup contract: <DigitRoll> renders each digit position as a vertical 0–9 strip in an
 * overflow-hidden slot; changing value tweens each strip's yPercent to the new digit (spring),
 * width changes animate for added/removed digits.
 */
export function rollDigits(slots: HTMLElement[], from: string, to: string, cfg = ANIM.pricing) {
  void slots; void from; void to; void cfg;
  pending('pricing', 'digit roll');
}
