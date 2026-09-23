import { gsap, ScrollTrigger } from '../core/gsap';

/**
 * B13 footer background parallax: the background layer starts `offset` px above the footer (CSS
 * top:-offset) and translates y 0 → offset linearly while its top travels from the viewport bottom to
 * the end of the page — so it finishes aligned with the footer top. Recon: 0→320 @1440, 0→160 @1024.
 */
export function footerParallax(layer: HTMLElement, offset: number) {
  if (!offset) return null;
  const setY = gsap.quickSetter(layer, 'y', 'px');
  let start = 0, end = 1;
  const measure = () => {
    const top = layer.getBoundingClientRect().top + window.scrollY - (Number(gsap.getProperty(layer, 'y')) || 0);
    start = top - window.innerHeight;
    end = ScrollTrigger.maxScroll(window);
  };
  const update = () => {
    const p = Math.min(1, Math.max(0, (window.scrollY - start) / Math.max(1, end - start)));
    setY(offset * p);
  };
  measure(); update();
  return ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: () => { measure(); update(); } });
}
