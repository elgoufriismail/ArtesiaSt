import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { markerPassed, targetProgress } from '../lib/scroll-math';

/** Document-space top/height of an element, re-measured on resize and layout changes. */
export function useDocRect(ref: RefObject<HTMLElement | null>) {
  const rect = useRef({ top: 0, height: 0 });
  const [, bump] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      rect.current = { top: r.top + window.scrollY, height: r.height };
      bump((n) => n + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ref]);
  return rect;
}

/** Framer onScrollTarget progress (0…1) of `target` as a MotionValue — see scroll-math.targetProgress. */
export function useTargetProgress(target: RefObject<HTMLElement | null>, threshold: number): MotionValue<number> {
  const { scrollY } = useScroll();
  const rect = useDocRect(target);
  return useTransform(scrollY, (y) => targetProgress(rect.current.top, y, window.innerHeight, threshold));
}

/**
 * Boolean state flipped when a marker crosses `line` × viewport height (scroll-target variants,
 * e.g. toggle-start / toggle-on / step-2 / step-3). Flips back when scrolling up.
 */
export function useMarker(marker: RefObject<HTMLElement | null>, line = 0.5): boolean {
  const { scrollY } = useScroll();
  const rect = useDocRect(marker);
  const [passed, setPassed] = useState(false);
  const update = (y: number) => setPassed(markerPassed(rect.current.top, y, window.innerHeight, line));
  useMotionValueEvent(scrollY, 'change', update);
  useEffect(() => update(window.scrollY)); // sync after layout changes
  return passed;
}
