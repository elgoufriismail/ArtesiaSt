import { gsap } from '../core/gsap';
import { ANIM } from '../config';

/**
 * FIRST-CLASS #1 — Hero word-by-word blur reveal (ANIMATIONS.md B1; Framer text effect "appear",
 * tokenization word, trigger on mount). Each word: opacity 0.001, y +10 px, blur(10 px) → rest;
 * 1.6 s 'framer' (.44,0,.56,1), words ≈0.1 s apart, first word ≈1.6 s after the nav entrance starts
 * (measured; see ANIM.B1.heroWords). Timeline is started when fonts are ready; words are hidden from
 * first paint (CSS initial state) so there is no flash.
 * Markup contract: words are inline-block spans with [data-word] (components/ui/SplitWords).
 */
export function heroWordReveal(words: HTMLElement[], cfg = ANIM.B1.heroWords) {
  if (!words.length) return null;
  gsap.set(words, { ...cfg.from, willChange: 'transform, opacity, filter' });
  const tl = gsap.timeline({ paused: true });
  tl.to(words, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: cfg.duration,
    ease: cfg.ease,
    stagger: cfg.stagger,
    clearProps: 'willChange',
  }, cfg.delay);
  const start = () => tl.play();
  if (cfg.waitForFonts && typeof document !== 'undefined' && document.fonts?.ready) document.fonts.ready.then(start);
  else start();
  return tl;
}
