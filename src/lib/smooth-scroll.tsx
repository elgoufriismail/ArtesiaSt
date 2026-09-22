import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/**
 * Global smooth scroll — mirrors the original's Framer "Smooth Scroll" component:
 * Lenis, smoothWheel, duration = intensity(20)/10 = 2, anchors, native touch (syncTouch false).
 * GSAP ScrollTrigger is driven from Lenis' scroll event so scrubbed path draws stay in sync.
 * Motion's useScroll reads window scroll directly and needs no bridge.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      smoothWheel: true,
      duration: 2,
      anchors: true,
      autoRaf: true,
      syncTouch: false,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    instance.on('scroll', ScrollTrigger.update);
    setLenis(instance);
    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
