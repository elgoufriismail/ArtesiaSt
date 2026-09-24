import { gsap } from '../core/gsap';
import { toVars } from '../core/transition';
import type { Transition } from '../config';

export type FlipSnap = { el: HTMLElement; left: number; width: number; scale: boolean };

/** Visual (transformed) horizontal box of each element — the FLIP "first" state. */
export function flipSnapshot(items: { el: HTMLElement; scale: boolean }[]): FlipSnap[] {
  return items.map(({ el, scale }) => { const r = el.getBoundingClientRect(); return { el, left: r.left, width: r.width, scale }; });
}

const running = new WeakMap<HTMLElement, gsap.core.Tween>();

/**
 * Framer layout animation (FLIP), horizontal: after the layout change, each element's visual box is interpolated
 * linearly from its snapshot to its new layout box. `scale` elements get translateX + scaleX (origin 50% 50%, as
 * Framer does; their content is stretched during the transition like the original's NumberFlow price), the others
 * translateX only. Measured on Pricing (Step 9): spring 0.6 s, bounce 0, both directions.
 */
export function flipPlay(snaps: FlipSnap[], t: Transition) {
  for (const s of snaps) {
    running.get(s.el)?.kill();
    s.el.style.transform = 'none';
    s.el.style.transformOrigin = '50% 50%';
    const r = s.el.getBoundingClientRect();
    const to = { left: r.left, width: r.width };
    if (Math.abs(to.left - s.left) < 0.01 && Math.abs(to.width - s.width) < 0.01) continue;
    const prog = { p: 0 };
    const paint = () => {
      const W = s.width + (to.width - s.width) * prog.p;
      const L = s.left + (to.left - s.left) * prog.p;
      if (s.scale && to.width > 0) {
        const sx = W / to.width;
        const dx = L - to.left - (to.width / 2) * (1 - sx);
        s.el.style.transform = `translate3d(${dx}px, 0px, 0px) scale(${sx}, 1)`;
      } else {
        s.el.style.transform = `translate3d(${L - to.left}px, 0px, 0px)`;
      }
    };
    paint();
    running.set(s.el, gsap.to(prog, { p: 1, ...toVars(t), onUpdate: paint, onComplete: () => { s.el.style.transform = 'none'; running.delete(s.el); } }));
  }
}
