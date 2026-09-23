import { gsap, ScrollTrigger } from '../core/gsap';

/** B2 hero text parallax: translateY = factor × scrollY (Framer speed 70 ⇒ factor 0.3). Desktop only. */
export function speedParallax(el: Element, factor: number) {
  if (!factor) return null;
  const setY = gsap.quickSetter(el, 'y', 'px');
  return ScrollTrigger.create({ start: 0, end: 'max', onUpdate: () => setY(window.scrollY * factor), onRefresh: () => setY(window.scrollY * factor) });
}
