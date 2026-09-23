import { ScrollTrigger } from './gsap';
import { markerPassed, targetProgress } from '@/lib/scroll-math';

/**
 * Scroll primitives shared by scroll/parallax/pinned/navigation modules.
 * All positions are measured live by ScrollTrigger (refreshed on resize/layout), and all value
 * mappings go through the validated pure functions in lib/scroll-math.ts.
 */

/** Find a scroll marker (<Marker id="…"/>) by id inside the document. */
export const marker = (id: string) => document.querySelector<HTMLElement>(`[data-marker="${id}"]`);

/**
 * Framer onScrollTarget progress for `target` (threshold 1: enters at bottom → reaches top;
 * threshold 0: at top → one viewport later). Calls `onProgress(0…1)` on every scroll update.
 */
export function onTargetProgress(target: Element, threshold: number, onProgress: (p: number) => void) {
  let docTop = 0;
  const measure = () => { docTop = target.getBoundingClientRect().top + window.scrollY; };
  const update = () => onProgress(targetProgress(docTop, window.scrollY, window.innerHeight, threshold));
  measure();
  update();
  return ScrollTrigger.create({
    trigger: document.documentElement,
    start: 0,
    end: 'max',
    onRefresh: () => { measure(); update(); },
    onUpdate: update,
  });
}

/**
 * Marker crossing (Framer scroll-target variants): fires onChange(true) when the marker's top
 * passes `line`×viewport from the top, onChange(false) when scrolling back above it.
 */
export function onMarker(id: string, line: number, onChange: (passed: boolean) => void) {
  const el = marker(id);
  if (!el) return null;
  let state: boolean | null = null;
  const check = () => {
    const top = el.getBoundingClientRect().top + window.scrollY;
    const next = markerPassed(top, window.scrollY, window.innerHeight, line);
    if (next !== state) { state = next; onChange(next); }
  };
  return ScrollTrigger.create({ trigger: document.documentElement, start: 0, end: 'max', onUpdate: check, onRefresh: check });
}
