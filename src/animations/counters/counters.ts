import { gsap } from '../core/gsap';
import { ANIM } from '../config';

/**
 * B8 counters slide (desktop): each counter's number wrapper comes from y −40 and its label wrapper from y +40, both
 * with opacity 0 → 1 (tween 1 s 'entrance' = cubic-bezier(.2,0,.2,1), delay = index · 0.2 s). Plays once. Trigger
 * (measured on the live original): the untransformed counter row's top within 2 px below the fold (rootMargin
 * bottom 2 px), or the row already scrolled past (above the viewport) — a jump past the section still plays it.
 * Once played, a re-init (breakpoint change) leaves the final state.
 */
const played = new WeakSet<Element>();
export function counters(row: HTMLElement, items: { number: HTMLElement; label: HTMLElement }[], cfg = ANIM.B8) {
  const targets = items.flatMap((i) => [i.number, i.label]);
  if (played.has(row)) { gsap.set(targets, { clearProps: 'opacity,transform' }); return () => {}; }
  items.forEach(({ number, label }) => {
    gsap.set(number, { opacity: 0, y: cfg.numberFromY });
    gsap.set(label, { opacity: 0, y: cfg.labelFromY });
  });
  const tweens: gsap.core.Tween[] = [];
  const start = () => items.forEach(({ number, label }, i) => {
    for (const el of [number, label]) tweens.push(gsap.to(el, { opacity: 1, y: 0, duration: cfg.t.duration, ease: cfg.t.ease, delay: i * cfg.stagger, onComplete: () => { gsap.set(el, { clearProps: 'transform' }); } }));
  });
  /** `nextFrame`: after a jump past the section the heavy layout frame must not count as elapsed tween time (the
   *  original starts that case at ≈ 0.01 on its first frame); the in-view path starts at once. */
  const play = (nextFrame: boolean) => {
    if (played.has(row)) return;
    io.disconnect();
    removeEventListener('scroll', onScroll);
    played.add(row);
    if (nextFrame) raf = requestAnimationFrame(start); else start();
  };
  let raf = 0;
  // an IntersectionObserver reports nothing for a jump from below the viewport straight to above it, so a scroll
  // check covers the "already scrolled past" case
  const onScroll = () => { if (row.getBoundingClientRect().bottom < 0) play(true); };
  const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) play(false); else if (entries.some((e) => e.boundingClientRect.bottom < 0)) play(true); }, { threshold: 0, rootMargin: `0px 0px ${cfg.edge}px 0px` });
  io.observe(row);
  addEventListener('scroll', onScroll, { passive: true });
  return () => {
    cancelAnimationFrame(raf);
    removeEventListener('scroll', onScroll);
    io.disconnect();
    tweens.forEach((t) => t.kill());
    gsap.set(targets, { clearProps: 'opacity,transform' });
  };
}

/**
 * Count-up (Framer "Counter" code component, every breakpoint): the value tweens start → end (1.2 s, linear) once its
 * own visible text first intersects the viewport; `onValue` receives the raw value (display = toFixed(0)).
 */
export function countUp(el: HTMLElement, start: number, end: number, onValue: (v: number) => void, onStart: () => void, cfg = ANIM.B8.count) {
  let tween: gsap.core.Tween | null = null;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    io.disconnect();
    onStart();
    const o = { v: start };
    tween = gsap.to(o, { v: end, duration: cfg.duration, ease: cfg.ease, delay: cfg.delay ?? 0, onUpdate: () => onValue(o.v) });
  }, { threshold: 0 });
  io.observe(el);
  return () => { io.disconnect(); tween?.kill(); };
}
