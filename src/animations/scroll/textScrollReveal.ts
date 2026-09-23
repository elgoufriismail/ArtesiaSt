import { gsap, ScrollTrigger } from '../core/gsap';
import { ANIM } from '../config';
import { stepSpring } from '../core/spring';
import { revealProgress, wordOpacity } from '@/lib/scroll-math';

/**
 * B15: Philosophy statement word-by-word opacity reveal (scroll-linked, reversible, all breakpoints).
 * Verified on the original (Step 5):
 *   progress = clamp((vh − top) / ((1 − 0.25)·vh)), where top = the statement's viewport top;
 *   word i of n: opacity 0.2 → 1 over progress [i/n, (i+1)/n] (every word within 0.006 @1440);
 *   progress is smoothed by motion useSpring(stiffness 500, damping 60) (fit rmse 0.0052).
 * As with motion, a new scroll target starts moving the frame after it arrives (see cardProximity).
 */
export function textScrollReveal(target: HTMLElement, words: HTMLElement[], cfg = ANIM.B15) {
  const n = words.length;
  if (!n) return () => {};
  const goal = () => revealProgress(target.getBoundingClientRect().top, window.innerHeight, cfg.start, cfg.end);
  const s = { x: goal(), v: 0 };
  let current = -1, pending: number | null = null, running = false;
  const paint = () => {
    if (Math.abs(s.x - current) < 1e-5) return;
    current = s.x;
    words.forEach((w, i) => { w.style.opacity = String(wordOpacity(s.x, i, n, cfg.min, cfg.max)); });
  };
  let targetP = s.x;
  const tick = (_t: number, deltaMs: number) => {
    const next = stepSpring(s, targetP, deltaMs / 1000, cfg.smoothing);
    s.x = next.x; s.v = next.v;
    const idle = Math.abs(s.x - targetP) < 1e-4 && Math.abs(s.v) < 1e-4;
    if (idle) { s.x = targetP; s.v = 0; }
    paint();
    if (pending !== null) { targetP = pending; pending = null; return; }
    if (idle) { gsap.ticker.remove(tick); running = false; }
  };
  const onScroll = () => {
    pending = goal();
    if (!running) { running = true; gsap.ticker.add(tick); }
  };
  paint();
  const st = ScrollTrigger.create({ trigger: document.documentElement, start: 0, end: 'max', onUpdate: onScroll, onRefresh: onScroll });
  return () => { st.kill(); if (running) gsap.ticker.remove(tick); words.forEach((w) => { w.style.opacity = ''; }); };
}
