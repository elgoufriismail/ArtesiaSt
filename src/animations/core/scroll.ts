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
  let docTop = 0, height = 1;
  const measure = () => { const r = target.getBoundingClientRect(); docTop = r.top + window.scrollY; height = r.height; };
  const update = () => onProgress(targetProgress(docTop, height, window.scrollY, window.innerHeight, threshold));
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

export type MarkerEdge = 'top' | 'bottom';

/**
 * Marker crossing (Framer scroll-target variants; rule and measurements in lib/scroll-math markerPassed):
 * fires onChange(true) once the marker's `edge` (untransformed layout box) reaches `line`×vh (+1 px),
 * and onChange(false) when scrolling back above it.
 */
export function onMarker(id: string, line: number, onChange: (passed: boolean) => void, edge: MarkerEdge = 'top') {
  const el = marker(id);
  if (!el) return null;
  let state: boolean | null = null;
  const check = () => {
    const r = el.getBoundingClientRect();
    const ty = new DOMMatrixReadOnly(getComputedStyle(el).transform === 'none' ? undefined : getComputedStyle(el).transform).m42;
    const layoutTop = r.top + window.scrollY - ty;
    const next = markerPassed(layoutTop, window.scrollY, window.innerHeight, line, edge === 'bottom' ? r.height : 0);
    if (next !== state) { state = next; onChange(next); }
  };
  return ScrollTrigger.create({ trigger: document.documentElement, start: 0, end: 'max', onUpdate: check, onRefresh: check });
}
