import { gsap } from '../core/gsap';
import { ANIM } from '../config';
import { loadStart, mark, sinceLoad } from '../core/loadClock';

export type EntranceOpts = {
  /** Count the delay from the shared load clock (on-load appear), not from the moment of the call. */
  fromLoad?: boolean;
  /** Record the real start as a performance mark (timing tool). */
  markAs?: string;
};

/**
 * B1 entrance: opacity 0.001 → 1 and y (±20) → 0, 1 s 'entrance' ease, with a per-element delay
 * (nav, hero text, booking block). The explicit from→to keeps a CSS-provided initial state (first
 * paint, like Framer's SSR'd initial styles) from becoming the end state. On-load entrances
 * (`fromLoad`) share one start time, like the original's appear animations.
 */
export function entrance(el: Element, delay: number, direction: 1 | -1 = 1, opts: EntranceOpts = {}, cfg = ANIM.B1.entrance) {
  if (opts.fromLoad) loadStart();
  const { markAs } = opts;
  return gsap.fromTo(el, { opacity: 0.001, y: direction * cfg.distance }, {
    opacity: 1, y: 0, duration: cfg.duration, ease: cfg.ease,
    delay: opts.fromLoad ? Math.max(0, delay - sinceLoad()) : delay,
    onStart: markAs ? function (this: gsap.core.Tween) { mark(markAs, performance.now(), this.time()); } : undefined,
  });
}
