import { gsap } from '../core/gsap';
import { ANIM } from '../config';
import { toVars } from '../core/transition';
import { mixColor, parseColor, toCss, type Rgba } from '../core/color';
import { afterTicks } from '../core/ticks';

export type PricingSwitchParts = { knob: HTMLElement; track: HTMLElement; monthlyLabel: HTMLElement };

/**
 * Pricing Monthly/Yearly switch (Framer toggle variants "Toggle Off" / "Toggle On", measured Step 9):
 * knob `left` 4 → 28 px (layout FLIP = linear box interpolation), track rgba(0,0,0,.2) → green and the
 * "Monthly" label ink → body grey, all on one Framer time spring: entering Yearly 0.8 s, entering Monthly
 * 1.2 s, bounce 0 (the transition of the state being entered applies). Colours mix like Framer (RGB in
 * squared space, alpha linear). The knob starts `lagFrames.knob` and the colours `lagFrames.colors` ticks after
 * the tap (measured phases).
 * Returns `set(on, animate)`.
 */
export function pricingSwitch(parts: PricingSwitchParts, cfg = ANIM.pricing) {
  const read = (el: HTMLElement, prop: 'backgroundColor' | 'color') => parseColor(getComputedStyle(el)[prop]);
  const styles = getComputedStyle(parts.track);
  const trackOff = parseColor(styles.getPropertyValue('--track-off').trim() || 'rgba(0,0,0,0.2)');
  const trackOn = parseColor(styles.getPropertyValue('--track-on').trim() || 'rgb(127,166,155)');
  const labelOn = parseColor(styles.getPropertyValue('--label-active').trim() || 'rgb(46,50,49)');
  const labelOff = parseColor(styles.getPropertyValue('--label-idle').trim() || 'rgb(83,89,86)');
  const state = { p: 0 };                                   // 0 = Monthly, 1 = Yearly
  let tween: gsap.core.Tween | null = null;
  let knobT: gsap.core.Tween | null = null;
  const paint = (left: number, track: Rgba, label: Rgba) => {
    parts.knob.style.left = `${left}px`;
    parts.track.style.backgroundColor = toCss(track);
    parts.monthlyLabel.style.color = toCss(label);
  };
  const set = (on: boolean, animate: boolean) => {
    const to = { left: on ? cfg.knob.on : cfg.knob.off, track: on ? trackOn : trackOff, label: on ? labelOff : labelOn };
    if (!animate) { tween?.kill(); knobT?.kill(); paint(to.left, to.track, to.label); state.p = on ? 1 : 0; return; }
    // the knob moves by a layout animation and the colours by the variant tween; they start on different
    // frames after the tap (measured: knob ≈ 25 ms before the colours)
    let knobTween: gsap.core.Tween | null = null;
    afterTicks(cfg.lagFrames.knob, () => {
      knobT?.kill();
      const f = parseFloat(parts.knob.style.left) || parseFloat(getComputedStyle(parts.knob).left);
      const prog = { p: 0 };
      knobTween = gsap.to(prog, { p: 1, ...toVars(on ? cfg.toYearly : cfg.toMonthly), onUpdate: () => { parts.knob.style.left = `${f + (to.left - f) * prog.p}px`; } });
      knobT = knobTween;
    });
    afterTicks(cfg.lagFrames.colors, () => {
      tween?.kill();
      const f = { track: read(parts.track, 'backgroundColor'), label: read(parts.monthlyLabel, 'color') };
      const prog = { p: 0 };
      tween = gsap.to(prog, {
        p: 1, ...toVars(on ? cfg.toYearly : cfg.toMonthly),
        onUpdate: () => { parts.track.style.backgroundColor = toCss(mixColor(f.track, to.track, prog.p)); parts.monthlyLabel.style.color = toCss(mixColor(f.label, to.label, prog.p)); },
      });
    });
  };
  return { set, kill: () => { tween?.kill(); knobT?.kill(); } };
}
