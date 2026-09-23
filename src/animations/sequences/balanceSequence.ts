import { gsap } from '../core/gsap';
import { ANIM } from '../config';
import { toVars } from '../core/transition';
import { mixColor, parseColor, toCss, type Rgba } from '../core/color';
import { markerState } from '../scroll/markerState';
import { afterTicks } from '../core/ticks';

/**
 * FIRST-CLASS #3: Balance scroll-driven switch (ANIMATIONS.md B3; values measured, see ANIM.B3).
 *
 *   Start (knob-only dot, label hidden) ──toggle-start crosses 50 %──▶ Off (full switch, label)
 *   Off ──toggle-on crosses 50 %──▶ On (knob right, track green, label dark, headline pair swapped)
 *   Both reverse on scroll-up. The target state's transition applies (Framer variant rule).
 *
 * Switch: Framer layout (FLIP) animations interpolate each element's visual box linearly by the
 * transition progress. The switch is a tiny absolutely positioned island, so its boxes
 * (left/top/width/height) are tweened directly with the same spring. Colours use Framer's squared-space
 * mix (core/color). Headline pairs: the outgoing pair fades out, and the incoming H2 / P fade in after a delay.
 * Appear: the switch fades in whenever it enters the viewport (IntersectionObserver, amount 0), and is
 * reset instantly when it leaves (Framer in-view appear, once: false).
 */
export type BalanceState = 'start' | 'off' | 'on';

export interface BalanceParts {
  link: HTMLAnchorElement;   // "Toggle Container" (href changes with the state)
  appear: HTMLElement;       // switch box (in-view appear target)
  label: HTMLElement;
  base: HTMLElement;         // track
  knob: HTMLElement;
  before: HTMLElement[];     // [H2 wrap, P wrap] of "Text Before"
  after: HTMLElement[];      // [H2 wrap, P wrap] of "Text After"
}

export const balanceStateFor = (startPassed: boolean, onPassed: boolean): BalanceState =>
  onPassed ? 'on' : startPassed ? 'off' : 'start';

export function balanceSequence(p: BalanceParts, cfg = ANIM.B3) {
  let alive = true;

  // ── in-view appear ──
  let appearTween: gsap.core.Tween | null = null;
  gsap.set(p.appear, { opacity: 0 });
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      appearTween?.kill();
      if (e.isIntersecting) appearTween = gsap.fromTo(p.appear, { opacity: cfg.appear.from }, { opacity: 1, ...toVars(cfg.appear.t) });
      else gsap.set(p.appear, { opacity: 0 });
    }
  }, { threshold: 0 });
  io.observe(p.appear);

  // ── switch + text state machine ──
  const colors = {
    track: { el: p.base, prop: 'backgroundColor' as const, cur: parseColor(cfg.colors.track.start), tween: null as gsap.core.Tween | null },
    label: { el: p.label, prop: 'color' as const, cur: parseColor(cfg.colors.label.start), tween: null as gsap.core.Tween | null },
  };
  const paint = (c: (typeof colors)[keyof typeof colors]) => { c.el.style[c.prop] = toCss(c.cur); };

  let state: BalanceState | null = null;
  const apply = (next: BalanceState, instant: boolean) => {
    const prev = state;
    if (next === prev) return;
    state = next;
    p.link.setAttribute('href', next === 'on' ? './#toggle-start-animation' : './#toggle-on-anchor');
    const box = cfg.boxes[next];
    const vars = instant ? { duration: 0 } : toVars(next === 'on' ? cfg.toOn : next === 'off' ? cfg.toOff : cfg.toStart);
    const { opacity: labelOpacity, ...labelBox } = box.label;

    // layout projection: switch boxes (linear box interpolation by the spring). Framer's projection is
    // sub-pixel (transforms), so GSAP's default px rounding of left/top/width/height is turned off.
    const layoutPart = () => {
      const common = { ...vars, overwrite: 'auto' as const, autoRound: false };
      gsap.to(p.label, { ...labelBox, ...common });
      gsap.to(p.base, { ...box.base, ...common });
      gsap.to(p.knob, { ...box.knob, ...common });
    };
    // variant-driven properties: label opacity, colours (Framer mix), headline pair
    const variantPart = () => {
      gsap.to(p.label, { opacity: labelOpacity, ...vars, overwrite: 'auto' });
      for (const key of ['track', 'label'] as const) {
        const c = colors[key];
        const from: Rgba = [...c.cur], to = parseColor(cfg.colors[key][next]);
        const proxy = { p: 0 };
        c.tween?.kill();
        c.tween = gsap.to(proxy, { p: 1, ...vars, onUpdate: () => { c.cur = mixColor(from, to, proxy.p); paint(c); }, onComplete: () => { c.cur = to; paint(c); } });
      }
      // Before is shown in Start/Off, After in On
      if (prev === null || (prev === 'on') !== (next === 'on')) {
        const [outgoing, incoming] = next === 'on' ? [p.before, p.after] : [p.after, p.before];
        gsap.killTweensOf([...outgoing, ...incoming]);
        if (instant) { gsap.set(outgoing, { opacity: 0 }); gsap.set(incoming, { opacity: 1 }); }
        else {
          gsap.to(outgoing, { opacity: 0, ...toVars(cfg.text.out) });
          gsap.to(incoming[0], { opacity: 1, ...toVars(cfg.text.inH2) });
          gsap.to(incoming[1], { opacity: 1, ...toVars(cfg.text.inP) });
        }
      }
    };

    if (instant) { layoutPart(); variantPart(); return; }
    // Framer frame phases (ANIM.B3.lagFrames); a part is dropped if the state moved on meanwhile
    const later = (frames: number, fn: () => void) => afterTicks(frames, () => { if (alive && state === next) fn(); });
    later(cfg.lagFrames.layout, layoutPart);
    later(cfg.lagFrames.variant, variantPart);
  };

  // the two markers resolve independently; the first resolved state is applied without animation
  let startPassed: boolean | null = null, onPassed: boolean | null = null;
  const update = () => {
    if (!alive || startPassed === null || onPassed === null) return;
    apply(balanceStateFor(startPassed, onPassed), state === null);
  };
  markerState(cfg.startMarker, cfg.line, (v) => { startPassed = v; update(); }, cfg.startFrames, cfg.edge);
  markerState(cfg.onMarker, cfg.line, (v) => { onPassed = v; update(); }, cfg.startFrames, cfg.edge);

  return () => { alive = false; io.disconnect(); };
}
