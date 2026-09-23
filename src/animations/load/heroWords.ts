import { gsap } from '../core/gsap';
import { ANIM } from '../config';
import { loadStart, mark, sinceLoad } from '../core/loadClock';

/**
 * FIRST-CLASS #1: hero word-by-word blur reveal (ANIMATIONS.md B1; Framer text effect "appear",
 * tokenization word, trigger on mount). Values read from the original's WAAPI animations
 * (document.getAnimations): per word, filter blur(10px) → blur(0px) and opacity 0.001 → 1, 1.6 s
 * cubic-bezier(.44,0,.56,1), delay 0.2 s + 0.1 s × index. The JS-driven y is 10 → 0 on the same timing.
 * The effect mounts at hydration, `mountLag` after the page-level appear start (see core/loadClock).
 * Scheduled from the shared load clock. If fonts are not ready by then, it starts when they are,
 * which is equivalent to a late hydration.
 * Words are hidden from first paint (CSS initial state), so they never flash.
 * Markup contract: words are inline-block spans with [data-word] (components/ui/SplitWords).
 */
export function heroWordReveal(words: HTMLElement[], cfg = ANIM.B1.heroWords) {
  if (!words.length) return null;
  loadStart();
  gsap.set(words, { ...cfg.from, willChange: 'transform, opacity, filter' });
  const tl = gsap.timeline({ paused: true });
  const schedule = () => {
    const at = Math.max(0, cfg.mountLag - sinceLoad()) + cfg.delay;
    tl.to(words, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: cfg.duration,
      ease: cfg.ease,
      stagger: cfg.stagger,
      clearProps: 'willChange',
    }, at);
    words.forEach((_, i) => { const t = at + i * cfg.stagger; tl.add(() => mark(`anim:hero-word-${i}`, performance.now(), tl.time() - t), t); });
    tl.play();
  };
  if (cfg.waitForFonts && typeof document !== 'undefined' && document.fonts?.ready) document.fonts.ready.then(schedule);
  else schedule();
  return tl;
}
