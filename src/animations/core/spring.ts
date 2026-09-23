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

/* ── physical spring follower (motion `useSpring` semantics) ───────────────────────────────────── */

export interface SpringParams { stiffness: number; damping: number; mass?: number }
export interface SpringState { x: number; v: number }

/**
 * Advance a damped spring (m·x'' = −k·(x − target) − c·x') by `dt` seconds with the target held
 * constant. Exact analytic solution (under-, critically and over-damped), so the result does not
 * depend on the frame rate. Retargeting keeps position and velocity, like motion's `useSpring`.
 */
export function stepSpring(s: SpringState, target: number, dt: number, p: SpringParams): SpringState {
  const m = p.mass ?? 1;
  const w = Math.sqrt(p.stiffness / m);
  const z = p.damping / (2 * Math.sqrt(p.stiffness * m));
  const e0 = s.x - target, v0 = s.v;
  let e: number, v: number;
  if (Math.abs(z - 1) < 1e-6) {
    const ex = Math.exp(-w * dt), b = v0 + w * e0;
    e = (e0 + b * dt) * ex;
    v = (v0 - w * b * dt) * ex;
  } else if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z), ex = Math.exp(-z * w * dt), B = (v0 + z * w * e0) / wd;
    const c = Math.cos(wd * dt), sn = Math.sin(wd * dt);
    e = ex * (e0 * c + B * sn);
    v = ex * ((B * wd - z * w * e0) * c - (e0 * wd + z * w * B) * sn);
  } else {
    const r = Math.sqrt(z * z - 1), r1 = -w * (z - r), r2 = -w * (z + r);
    const C2 = (v0 - r1 * e0) / (r2 - r1), C1 = e0 - C2;
    const x1 = Math.exp(r1 * dt), x2 = Math.exp(r2 * dt);
    e = C1 * x1 + C2 * x2;
    v = r1 * C1 * x1 + r2 * C2 * x2;
  }
  return { x: target + e, v };
}
