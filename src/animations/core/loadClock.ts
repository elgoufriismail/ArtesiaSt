/**
 * Shared load clock for the on-load sequence (B1).
 *
 * The original starts its "appear" entrances (nav, hero text…) from one page-level start time, and
 * mounts the hero text effect later, at hydration. Measured with document.getAnimations() over 15 loads
 * @1440×900, the words' start (startTime + delay) − the logo's start (startTime + delay) was
 * 1214–1568 ms, median 1345 ms. Entrances and words are both scheduled from this clock, so the gap
 * stays fixed no matter when this bundle hydrates.
 *
 * The first caller fixes the origin, and every module reads the same value.
 */
let origin: number | null = null;

/** performance.now() at the start of the load sequence (fixed by the first call). */
export function loadStart(): number {
  if (origin === null) {
    origin = performance.now();
    mark('anim:load-start', origin);
  }
  return origin;
}

/** Seconds elapsed since the load sequence started. */
export const sinceLoad = () => (performance.now() - loadStart()) / 1000;

/**
 * Record when an animation actually started (as a performance mark), so tools/compare/timing.mjs
 * can compare start times with the original's WAAPI startTime + delay. `lateBy` (seconds) is how far
 * past its scheduled start the first render came; it is subtracted, so frame jitter is not recorded.
 */
export function mark(name: string, at = performance.now(), lateBy = 0) {
  try { performance.mark(name, { startTime: Math.max(0, at - lateBy * 1000) }); } catch { /* unsupported: diagnostics only */ }
}
