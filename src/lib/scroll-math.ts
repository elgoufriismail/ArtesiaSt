/**
 * Pure scroll math reproducing the original's measured behaviour.
 * Every function is deterministic in (docTop, scrollY, viewport) so it can be unit-checked
 * against docs/reconnaissance/reference/animations/scroll-*.json.
 */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Framer "onScrollTarget" transform progress for one target element.
 *   threshold 1 → 0 when the target's top enters at the viewport bottom, 1 when it reaches the top
 *   threshold 0 → 0 when the target's top is at the viewport top, 1 one viewport-height later
 * Verified: Waves (how-it-works top 4592 @1440×900 → 3700…4600), Big-Quote fold (9336 → 8436…9336),
 * Hero image fade (Hero top 0, threshold 0 → 0…900).
 */
export function targetProgress(docTop: number, scrollY: number, vh: number, threshold: number): number {
  const top = docTop - scrollY;
  return clamp01((threshold * vh - top) / vh);
}

/**
 * Multi-target sequence (e.g. Waves: base → how-it-works → big-quote). Returns the interpolated
 * value: segment i blends values[i] → values[i+1] by the progress of targets[i].
 */
export function sequenceValue(
  values: number[],
  targets: { docTop: number; threshold: number }[],
  scrollY: number,
  vh: number,
): number {
  let v = values[0];
  targets.forEach((t, i) => {
    const p = targetProgress(t.docTop, scrollY, vh, t.threshold);
    if (p > 0) v = lerp(values[i], values[i + 1], p);
  });
  return v;
}

/**
 * Marker crossing used by Framer scroll-target variants / appear targets (threshold .5):
 * true once the marker's top has passed `line` × viewport height from the top.
 * Calibrated: toggle-start (doc 1144) flips at scroll≈700–750, toggle-on (1846) at ≈1400–1450 @900vh.
 */
export function markerPassed(docTop: number, scrollY: number, vh: number, line = 0.5): boolean {
  return docTop - scrollY <= line * vh;
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
