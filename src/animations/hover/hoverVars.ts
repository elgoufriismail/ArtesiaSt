import { ANIM } from '../config';
import { springToCssLinear } from '../core/spring';

/**
 * Hover animations are CSS transitions (INTERACTIONS.md §1): pill dot slide, nav underline, social
 * opacity, pricing-card border, link underline and — FIRST-CLASS #9 — the service-card expansion.
 * Their Framer springs are exported as CSS custom properties (linear() easings) injected on <html>,
 * so hover timing is tuned from ANIM like every other animation.
 */
export function hoverCssVars(): Record<string, string> {
  return {
    '--hover-pill-ease': springToCssLinear(ANIM.pill.t.bounce, ANIM.pill.t.duration),
    '--hover-pill-dur': `${ANIM.pill.t.duration}s`,
    '--hover-pill-slide': `${ANIM.pill.slide}px`,
    '--hover-card-ease': springToCssLinear(ANIM.serviceCard.t.bounce, ANIM.serviceCard.t.duration),
    '--hover-card-dur': `${ANIM.serviceCard.t.duration}s`,
    '--hover-card-lift': `${ANIM.serviceCard.lift}px`,
  };
}
