import { useSyncExternalStore } from 'react';

/** Layout breakpoints of the original (Framer). 768px is a PHONE layout. */
export const MQ = {
  desktop: '(min-width: 1200px)',
  tablet: '(min-width: 810px) and (max-width: 1199.98px)',
  phone: '(max-width: 809.98px)',
} as const;

export type Breakpoint = keyof typeof MQ;

function current(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';
  if (window.matchMedia(MQ.desktop).matches) return 'desktop';
  if (window.matchMedia(MQ.tablet).matches) return 'tablet';
  return 'phone';
}

function subscribe(cb: () => void) {
  const lists = Object.values(MQ).map((q) => window.matchMedia(q));
  lists.forEach((l) => l.addEventListener('change', cb));
  return () => lists.forEach((l) => l.removeEventListener('change', cb));
}

/** Active layout breakpoint; used to enable/disable behaviours that differ per breakpoint
 *  (see docs/reconnaissance/RESPONSIVE.md §4). Layout itself is pure CSS. */
export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, current, () => 'desktop');
}

/** Per-breakpoint value helper: pick({ desktop: 500, tablet: 300, phone: 0 }, bp) */
export function pick<T>(values: Record<Breakpoint, T>, bp: Breakpoint): T {
  return values[bp];
}
