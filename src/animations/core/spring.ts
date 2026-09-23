/**
 * Framer Motion-style springs ({ type:'spring', duration, bounce }) expressed as GSAP eases, so the
 * original's spring transitions can run as ordinary GSAP tweens of the same duration.
 *
 * Model: damped harmonic oscillator, damping ratio ζ = 1 − bounce, natural frequency chosen so the
 * motion settles (|1 − x| < 0.001) at t = duration, then normalised to end exactly at 1.
 * bounce 0 (critically damped) is what the original uses everywhere; bounce > 0 is supported for tuning.
 *
 * Pure & framework-free (unit-tested in tests/unit/spring.test.ts).
 */
export type EaseFn = (p: number) => number;

function springX(t: number, omega: number, zeta: number): number {
  if (zeta >= 1) return 1 - (1 + omega * t) * Math.exp(-omega * t);
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
}

/** ω·duration such that the envelope has decayed to 0.1 % at the end. */
function omegaFor(duration: number, zeta: number): number {
  let lo = 0.1, hi = 200;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const env = zeta >= 1 ? (1 + mid) * Math.exp(-mid) : Math.exp(-zeta * mid);
    if (env > 0.001) lo = mid; else hi = mid;
  }
  return hi / duration;
}

export function springEase(bounce = 0, duration = 1): EaseFn {
  const zeta = Math.max(0.05, 1 - bounce);
  const omega = omegaFor(duration, zeta);
  const end = springX(duration, omega, zeta);
  return (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : springX(p * duration, omega, zeta) / end);
}

/** CSS `linear()` easing string approximating a spring — for hover transitions implemented in CSS. */
export function springToCssLinear(bounce = 0, duration = 1, steps = 24): string {
  const e = springEase(bounce, duration);
  const pts = Array.from({ length: steps + 1 }, (_, i) => +e(i / steps).toFixed(4));
  return `linear(${pts.join(', ')})`;
}
