import { gsap, ScrollTrigger } from '../core/gsap';
import { parallaxOffset } from '@/lib/scroll-math';

/**
 * FIRST-CLASS #4 — image-in-frame parallax (B4, behaviour of the original's parallax component).
 * `layers` (image + noise overlay) are height: calc(100% + P px) inside `frame` (overflow hidden) and
 * slide from −P to 0 as the frame crosses the viewport. P from ANIM.B4 per breakpoint (0 = static).
 */
export function imageParallax(frame: Element, layers: Element[], P: number) {
  if (!P) return null;
  const setY = layers.map((l) => gsap.quickSetter(l, 'y', 'px'));
  const update = () => {
    const r = frame.getBoundingClientRect();
    // the rendered rect, transforms included: on Story images the progress follows the parent link's
    // drift (B12) — measured rate 0.2022 = 0.2004 × (1 + drift velocity) @1440, image 2 likewise
    const y = parallaxOffset(r.top, r.height, window.innerHeight, P);
    setY.forEach((s) => s(y));
  };
  update();
  // whole-document range: a drifting parent (Story, +120 px) moves the frame past a 'top bottom' →
  // 'bottom top' range computed from its layout box, which froze the last in-range value
  return ScrollTrigger.create({ trigger: document.documentElement, start: 0, end: 'max', onUpdate: update, onRefresh: update });
}
