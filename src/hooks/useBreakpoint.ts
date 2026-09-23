'use client';

import { useSyncExternalStore } from 'react';
import { MQ, currentBreakpoint, type Breakpoint } from '@/lib/breakpoints';

function subscribe(cb: () => void) {
  const lists = Object.values(MQ).map((q) => window.matchMedia(q));
  lists.forEach((l) => l.addEventListener('change', cb));
  return () => lists.forEach((l) => l.removeEventListener('change', cb));
}

/** Active breakpoint for React-rendered differences (animations use gsap.matchMedia instead). */
export function useBreakpoint(): Breakpoint {
  return useSyncExternalStore(subscribe, currentBreakpoint, () => 'desktop');
}
