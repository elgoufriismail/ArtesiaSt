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
    const y = parallaxOffset(r.top, r.height, window.innerHeight, P);
    setY.forEach((s) => s(y));
  };
  update();
  return ScrollTrigger.create({ trigger: frame, start: 'top bottom', end: 'bottom top', onUpdate: update, onRefresh: update });
}
