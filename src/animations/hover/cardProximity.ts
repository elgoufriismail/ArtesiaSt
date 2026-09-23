import { gsap } from '../core/gsap';
import { ANIM } from '../config';
import { stepSpring, type SpringState } from '../core/spring';
import { toVars } from '../core/transition';
import { afterTicks } from '../core/ticks';

/**
 * B18: service card cursor proximity plus hover label (measured on the original; see ANIM.B18).
 *
 * card.box:  the card link. Its height and top are driven here and it stays centred in `slot`
 *            (the fixed-height card container), so it shrinks symmetrically about its centre.
 * card.slot: the card container; its horizontal centre is the proximity reference.
 * card.label: the "read more" label (hover: opacity 0 ↔ 1, spring 0.6 s).
 * One ticker loop integrates every card's spring exactly (core/spring stepSpring) and sleeps when
 * all cards are at rest. Like motion, a new target starts moving on the frame after it arrives, and the
 * hover label animation starts `startFrames` later (measured: without this the clone led the original by
 * one frame in all 8 recorded moves).
 */
export interface ProximityCard { box: HTMLElement; slot: HTMLElement; label: HTMLElement }

export function cardProximity(cards: ProximityCard[], cfg = ANIM.B18) {
  const state = cards.map((): SpringState & { target: number } => ({ x: cfg.max, v: 0, target: cfg.max }));
  const apply = (i: number) => {
    const h = state[i].x;
    cards[i].box.style.height = `${h}px`;
    cards[i].box.style.top = `${(cfg.max - h) / 2}px`;
  };
  let running = false;
  let pending: number[] | null = null;
  const tick = (_time: number, deltaMs: number) => {
    const dt = deltaMs / 1000;
    let busy = false;
    // motion semantics: on the frame a new target arrives, the value still follows the old trajectory;
    // the new spring starts from there at elapsed 0 and first moves on the following frame
    const next = pending;
    pending = null;
    state.forEach((s, i) => {
      const n = stepSpring(s, s.target, dt, cfg.spring);
      s.x = n.x; s.v = n.v;
      if (Math.abs(s.x - s.target) < 0.01 && Math.abs(s.v) < 0.01) { s.x = s.target; s.v = 0; } else busy = true;
      apply(i);
      if (next && next[i] !== s.target) { s.target = next[i]; busy = true; }
    });
    if (!busy) { gsap.ticker.remove(tick); running = false; }
  };
  let alive = true;
  const onMove = (e: MouseEvent) => {
    const targets = cards.map((c) => {
      const r = c.slot.getBoundingClientRect();
      return Math.max(cfg.min, cfg.max - cfg.k * Math.abs(e.clientX - (r.left + r.width / 2)));
    });
    pending = targets;
    if (!running) { running = true; gsap.ticker.add(tick); }
  };
  window.addEventListener('mousemove', onMove, { passive: true });

  // hover label
  const off = cards.map(({ box, label }) => {
    gsap.set(label, { opacity: 0 });
    const to = (opacity: number) => () => afterTicks(cfg.startFrames, () => { if (alive) gsap.to(label, { opacity, ...toVars(cfg.label), overwrite: true }); });
    const enter = to(1), leave = to(0);
    box.addEventListener('pointerenter', enter);
    box.addEventListener('pointerleave', leave);
    return () => { box.removeEventListener('pointerenter', enter); box.removeEventListener('pointerleave', leave); };
  });

  return () => {
    alive = false;
    window.removeEventListener('mousemove', onMove);
    if (running) gsap.ticker.remove(tick);
    off.forEach((f) => f());
    cards.forEach((c) => { c.box.style.height = ''; c.box.style.top = ''; });
  };
}
