/**
 * Colour interpolation the way Framer Motion does it (mixColor → mixLinearColor): RGB channels are
 * mixed in squared space, sqrt(a²·(1−p) + b²·p), and alpha is mixed linearly. Verified on the Balance
 * switch (track, label): per-channel progress fits the same spring as the knob only under this mix.
 * A plain sRGB lerp (GSAP's default) is visibly darker mid-transition.
 *
 * Pure & framework-free (unit-tested in tests/unit/color.test.ts).
 */
export type Rgba = [number, number, number, number];

export function parseColor(c: string): Rgba {
  const s = c.trim();
  if (s.startsWith('#')) {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((x) => x + x).join('');
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) throw new Error(`unsupported colour: ${c}`);
  const v = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
}

const mixChannel = (a: number, b: number, p: number) => Math.sqrt(Math.max(0, a * a + p * (b * b - a * a)));

export function mixColor(from: Rgba, to: Rgba, p: number): Rgba {
  return [mixChannel(from[0], to[0], p), mixChannel(from[1], to[1], p), mixChannel(from[2], to[2], p), from[3] + (to[3] - from[3]) * p];
}

export const toCss = ([r, g, b, a]: Rgba) => `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${+a.toFixed(3)})`;
