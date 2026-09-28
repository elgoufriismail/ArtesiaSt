import { gsap } from '../core/gsap';
import { toVars } from '../core/transition';
import { afterTicks } from '../core/ticks';
import { ANIM } from '../config';

// per item: running tweens + pending frame-delayed starts, all cancelled outright on the next toggle (a props-filtered
// killTweensOf does not remove a fromTo that has not rendered its first frame yet — a toggle inside one long frame —
// which then re-applies its start height)
const running = new WeakMap<HTMLElement, { tweens: gsap.core.Tween[]; pending: (() => void)[] }>();

/**
 * FIRST-CLASS #12 — FAQ item open/close (live original, measured 2026-09-28; bundle: variant transition spring 0.8 s,
 * bounce 0). The card height is layout-driven (an invisible placeholder holds the question, plus the answer when
 * open); this animates from the height the card had when clicked (`from`, possibly mid-flight) to its new natural
 * height, then hands back to `auto`. Frame phase as measured on the original: the height starts `heightLagFrames` ticker
 * frames after the click (Framer re-renders, then starts its layout animation on the next frame); answer opacity
 * 0 ↔ 1 and icon rotation 0 ↔ −135° use the same spring, `valueLagFrames` later. Items are independent.
 */
export function accordionAnimate(card: HTMLElement, answer: HTMLElement, icon: HTMLElement, from: number, open: boolean, cfg = ANIM.faq) {
  const vars = toVars(cfg.t);
  const prev = running.get(card);
  prev?.tweens.forEach((t) => t.kill());
  prev?.pending.forEach((c) => c());
  card.style.height = 'auto';
  const to = card.getBoundingClientRect().height;
  card.style.height = `${from}px`;   // hold the clicked height until the layout animation starts
  const st = { tweens: [] as gsap.core.Tween[], pending: [] as (() => void)[] };
  running.set(card, st);
  st.pending.push(
    afterTicks(cfg.heightLagFrames, () => {
      st.tweens.push(gsap.to(card, { ...vars, height: to, autoRound: false, onComplete: () => { card.style.height = ''; running.delete(card); } }));
    }),
    afterTicks(cfg.heightLagFrames + cfg.valueLagFrames, () => {
      st.tweens.push(gsap.to(answer, { ...vars, opacity: open ? 1 : 0 }), gsap.to(icon, { ...vars, rotation: open ? cfg.iconRotate : 0 }));
    }),
  );
}

/** Initial (non-animated) state for an item. */
export function accordionSet(answer: HTMLElement, icon: HTMLElement, open: boolean, cfg = ANIM.faq) {
  gsap.set(answer, { opacity: open ? 1 : 0 });
  gsap.set(icon, { rotation: open ? cfg.iconRotate : 0 });
}
