import { gsap } from './gsap';
import { MQ, type Breakpoint } from '@/lib/breakpoints';

/**
 * Breakpoint-aware setup. Wraps gsap.matchMedia so every animation is created for the active
 * breakpoint only and fully reverted (ScrollTriggers killed, inline styles removed) when the
 * breakpoint changes — mirroring how Framer swaps per-breakpoint variants/effects.
 */
export type MediaSetup = (bp: Breakpoint) => void | (() => void);

export function withBreakpoints(scope: Element, setup: MediaSetup) {
  const mm = gsap.matchMedia(scope);
  mm.add({ desktop: MQ.desktop, tablet: MQ.tablet, phone: MQ.phone }, (ctx) => {
    const c = ctx.conditions as Record<Breakpoint, boolean>;
    const bp: Breakpoint = c.desktop ? 'desktop' : c.tablet ? 'tablet' : 'phone';
    return setup(bp);
  });
  return () => mm.revert();
}
