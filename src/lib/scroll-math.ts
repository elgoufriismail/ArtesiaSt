/**
 * Pure scroll math reproducing the original's measured behaviour.
 * Every function is deterministic in (docTop, scrollY, viewport) so it can be unit-checked
 * against docs/reconnaissance/reference/animations/scroll-*.json.
 */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Framer "onScrollTarget" transform progress for one target element of height `height`:
 *   threshold 1 → 0 when the target's top enters at the viewport bottom, 1 after it has moved `height`
 *   threshold 0 → 0 when the target's top is at the viewport top, 1 after it has moved `height`
 * Verified against recon tracks: Waves & Big-Quote fold (marker sections are 100vh tall), Hero image
 * fade at 1440 (height 900 = vh) AND at 390 (Hero height 596 ≠ vh 844: opacity 0.916 after 50px =
 * 1 − 50/596) — the divisor is the target's height, not the viewport.
 */
export function targetProgress(docTop: number, height: number, scrollY: number, vh: number, threshold: number): number {
  const top = docTop - scrollY;
  return clamp01((threshold * vh - top) / Math.max(1, height));
}

/**
 * Multi-target sequence (e.g. Waves: base → how-it-works → big-quote). Returns the interpolated
 * value: segment i blends values[i] → values[i+1] by the progress of targets[i].
 */
export function sequenceValue(
  values: number[],
  targets: { docTop: number; height: number; threshold: number }[],
  scrollY: number,
  vh: number,
): number {
  let v = values[0];
  targets.forEach((t, i) => {
    const p = targetProgress(t.docTop, t.height, scrollY, vh, t.threshold);
    if (p > 0) v = lerp(values[i], values[i + 1], p);
  });
  return v;
}

/**
 * Framer scroll-target variant trigger. Binary-searched on the original at 1440, 1024 and 390, with the
 * same px offsets at every viewport. A variant fires when an edge of the marker's UNTRANSFORMED layout
 * box reaches `line`·vh + 1 px:
 *   edge 'top'    → pass height 0: Framer in-view amount "some" (Balance switch states)
 *   edge 'bottom' → pass the marker height (8): amount "all", the whole marker has passed
 *                   (Page Intro fade, hero lines fade)
 * `layoutTop` is the doc position without the marker's own transform (toggle-on markers carry
 * translateY(−4 px); Framer ignores it).
 */
export const MARKER_TOLERANCE_PX = 1;
export function markerPassed(layoutTop: number, scrollY: number, vh: number, line = 0.5, height = 0, tolerance = MARKER_TOLERANCE_PX): boolean {
  return layoutTop + height - scrollY <= line * vh + tolerance;
}

/**
 * ImageParallaxVerticalNoize (behavioural re-implementation, not the original code):
 * returns translateY in px for an image whose frame has viewport rect (top, height).
 * Image is `height: calc(100% + P)`, starts shifted −P and settles at 0 as the frame
 * travels from viewport bottom to viewport top.
 */
export function parallaxOffset(rectTop: number, rectHeight: number, vh: number, P: number): number {
  const progress = clamp01((vh - rectTop) / (vh + rectHeight));
  return -(P - progress * P);
}

/**
 * TextScrollReveal word opacity: word i of n maps its slice [i/n, (i+1)/n] of progress → [min, max].
 * Progress: element top from viewport bottom (start 1) to 25% from the top (end 0.25).
 */
export function wordOpacity(progress: number, i: number, n: number, min = 0.2, max = 1): number {
  const t = clamp01((progress - i / n) * n);
  return lerp(min, max, t);
}

export function revealProgress(rectTop: number, vh: number, start = 1, end = 0.25): number {
  return clamp01((start * vh - rectTop) / ((start - end) * vh));
}
