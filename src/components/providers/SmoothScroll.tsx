'use client';

import { createContext, useEffect, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/animations/core/gsap';

export const LenisContext = createContext<Lenis | null>(null);

/**
 * Global smooth scroll — mirrors the original's Framer "Smooth Scroll" component
 * (docs/reconnaissance/ANIMATIONS.md §A): Lenis, smoothWheel, duration 2 (intensity 20 / 10),
 * anchors, and NATIVE touch scrolling (syncTouch:false) on phones/tablets.
 * Lenis is driven by the GSAP ticker so ScrollTrigger-based animations and Lenis share one frame loop.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 2,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
      autoRaf: false,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    instance.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
