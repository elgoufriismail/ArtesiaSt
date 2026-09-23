'use client';

import { useLayoutEffect, useEffect, type DependencyList, type RefObject } from 'react';
import { withBreakpoints, type MediaSetup } from '@/animations/core/media';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * The only bridge between sections and animation modules.
 * Runs `setup(bp)` inside a gsap.matchMedia context scoped to `scope` for the active breakpoint; everything it
 * creates (tweens, timelines, ScrollTriggers, inline styles) is reverted on unmount, on dependency
 * change and on breakpoint change. Sections call animation factories inside `setup` — no raw GSAP
 * in section components.
 */
export function useGsap(scope: RefObject<HTMLElement | null>, setup: MediaSetup, deps: DependencyList = []) {
  useIsoLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    // gsap.matchMedia creates a scoped context per breakpoint and reverts it on change/unmount.
    return withBreakpoints(el, setup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
