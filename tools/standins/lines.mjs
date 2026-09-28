// Generates ORIGINAL decorative line art (stand-ins) inside the original viewBoxes so scroll-driven
// drawing (which depends on the path's bounding box) behaves identically.
// Output: src/components/decor/paths.ts        Usage: node tools/standins/lines.mjs
import fs from 'node:fs';

/** Catmull-Rom spline through points → cubic Bézier path data. */
function spline(pts, tension = 1) {
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + ((p2[0] - p0[0]) / 6) * tension, p1[1] + ((p2[1] - p0[1]) / 6) * tension];
    const c2 = [p2[0] - ((p3[0] - p1[0]) / 6) * tension, p2[1] - ((p3[1] - p1[1]) / 6) * tension];
    d += ` C ${c1.map((v) => v.toFixed(1)).join(' ')} ${c2.map((v) => v.toFixed(1)).join(' ')} ${p2.map((v) => v.toFixed(1)).join(' ')}`;
  }
  return d;
}
function polyLength(pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; }

// Hero: two long sweeping loops, 780×1140 viewBox, bbox ≈ x 88–743, y 0–1140 (original bboxes)
// Loop is drawn in the first ~40 % of the length (visible at load, like the original's weight), then
// the line trails down-left and exits at the bottom. bbox ≈ x 88–743, y 0–1140.
const heroA = [[520, 700], [390, 590], [300, 440], [320, 270], [450, 120], [620, 30], [743, 0], [700, 70], [570, 210], [400, 390], [240, 570], [120, 740], [88, 880], [150, 1000], [310, 1070], [470, 1140]];
const heroB = [[545, 690], [410, 580], [318, 430], [338, 262], [466, 116], [630, 32], [730, 8], [684, 80], [552, 222], [384, 404], [226, 586], [110, 756], [96, 890], [168, 1006], [330, 1074], [490, 1140]];

// Waves: gentle meander across 6000×680 (horizontal), bbox spans full width, height ≈ 40–640
function meander(seed, amp, turns) {
  let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts = [];
  for (let i = 0; i <= turns; i++) { const x = (6000 * i) / turns; const y = 340 + Math.sin(i * 1.3 + seed) * amp * (0.6 + 0.4 * rnd()); pts.push([x, y]); }
  return pts;
}
const waveA = meander(7, 280, 26), waveB = meander(11, 250, 24);

// Big Quote long lines: own vertical meanders with loops. Only coarse layout/motion figures are taken from the original
// (measured, not traced): bbox (x 30 / 31.5, w 619.4 / 608, y −4000 … 2000 in a 680×2000 viewBox, since the scroll
// draw is triggered by the path box), per-band x extent, start/end points and the arclength at which the path first
// crosses each 400-unit y level (so the drawn head reaches the same height at the same scroll progress). Swing
// positions, amplitudes and loop shapes are generated here, each 400-unit segment tuned to the measured length.
const envA = [[-4000, -3000, 184, 622], [-3000, -2000, 30, 553], [-2000, -1000, 185, 578], [-1000, 0, 187, 627], [0, 500, 184, 628], [500, 1000, 311, 426], [1000, 1500, 60, 649], [1500, 2001, 56, 446]];
const envB = [[-4000, -3000, 199, 572], [-3000, -2000, 32, 606], [-2000, -1000, 194, 580], [-1000, 0, 167, 630], [0, 500, 167, 639], [500, 1000, 317, 458], [1000, 1500, 77, 636], [1500, 2001, 78, 622]];
const cumA = [410, 1610, 2396, 3692, 4230, 5338, 5798, 6544, 7038, 8126, 9356, 9772, 10662, 12100, 12728];
const cumB = [418, 1552, 2214, 3580, 4128, 5290, 5734, 6462, 6962, 8106, 9312, 9740, 10758, 12210, 12843];
/** Point list for per-segment parameters q[k] (segment k runs from y −4000+400k to −4000+400(k+1)): swing points
 *  alternate sides of the band; a long segment gets a rounded loop (height q[k], width capped by the room to the
 *  band edge) beside its first point, a short one uses q[k] as its swing width. */
function meanderPts(seed, env, start, end, loops, q) {
  let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const bandOf = (y) => env.find((e) => y >= e[0] && y < e[1]) || env.at(-1);
  const pts = [start]; let side = 1;
  for (let k = 0; k < 15; k++) {
    const y = -4000 + 400 * (k + 1); const prev = pts.at(-1);
    if (loops[k] && k > 0) {
      const [, , lo, hi] = bandOf(prev[1]); const mid = (lo + hi) / 2; const dir = prev[0] > mid ? -1 : 1;
      const ry = q[k] / 2, rx = Math.min(ry, Math.abs((dir > 0 ? hi : lo) - prev[0]) * 0.4);
      for (const deg of [115, 30, -60, -150]) { const f = (deg * Math.PI) / 180; pts.push([prev[0] + dir * rx * (1 + Math.cos(f)), Math.max(-3990, prev[1] + ry * Math.sin(f))]); }
    }
    if (k === 14) {   // last segment: one mid point (y 1800) gives it its own length control
      const [, , lo, hi] = bandOf(1800); const mid = (lo + hi) / 2, half = (hi - lo) / 2;
      pts.push([mid + side * half * q[k], 1800]); break;
    }
    const [, , lo, hi] = bandOf(y); const mid = (lo + hi) / 2, half = (hi - lo) / 2;
    const w = loops[k] ? 0.8 + 0.2 * rnd() : q[k];
    pts.push([mid + side * half * w, y]); side = -side;
  }
  pts.push(end);
  return pts;
}
/** Bezier path data → the same path affinely mapped so its (sampled) bbox equals [x0, y0, w, h]. */
function fitBox(d, [x0, y0, w, h]) {
  const nums = d.match(/-?[\d.]+/g).map(Number);
  const P = []; for (let i = 0; i < nums.length; i += 2) P.push([nums[i], nums[i + 1]]);
  // sample the cubic segments for the true bbox
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i + 3 < P.length; i += 3) for (let k = 0; k <= 64; k++) { const t = k / 64, u = 1 - t;
    const x = u * u * u * P[i][0] + 3 * u * u * t * P[i + 1][0] + 3 * u * t * t * P[i + 2][0] + t * t * t * P[i + 3][0];
    const y = u * u * u * P[i][1] + 3 * u * u * t * P[i + 1][1] + 3 * u * t * t * P[i + 2][1] + t * t * t * P[i + 3][1];
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  const ax = w / (maxX - minX), ay = h / (maxY - minY);
  let j = 0;
  return d.replace(/-?[\d.]+/g, (v) => { const n = Number(v); const out = j % 2 === 0 ? x0 + (n - minX) * ax : y0 + (n - minY) * ay; j++; return out.toFixed(1); });
}
/** Arclength (sampled) at which cubic path data first reaches each y level. */
function crossings(d, levels) {
  const n = d.match(/-?[\d.]+/g).map(Number); const P = []; for (let i = 0; i < n.length; i += 2) P.push([n[i], n[i + 1]]);
  const out = []; let L = 0, prev = P[0], k = 0;
  for (let i = 0; i + 3 < P.length; i += 3) for (let j = 1; j <= 60; j++) { const t = j / 60, u = 1 - t;
    const c = [0, 1].map((m) => u * u * u * P[i][m] + 3 * u * u * t * P[i + 1][m] + 3 * u * t * t * P[i + 2][m] + t * t * t * P[i + 3][m]);
    L += Math.hypot(c[0] - prev[0], c[1] - prev[1]); prev = c;
    while (k < levels.length && c[1] >= levels[k]) { out.push(L); k++; } }
  while (out.length < levels.length) out.push(L);
  out[out.length - 1] = L;   // last level = path end: total length
  return out;
}
function quoteLine(seed, env, start, end, box, cum) {
  const seg = cum.map((c, i) => c - (cum[i - 1] || 0));
  const loops = seg.map((l, i) => i > 0 && l > 650);   // loops where the original's 400-unit segments are long
  const q = seg.map((_, i) => (loops[i] ? 240 : 0.7));
  const levels = cum.map((_, i) => -4000 + 400 * (i + 1));
  const build = () => fitBox(spline(meanderPts(seed, env, start, end, loops, q)), box);
  for (let pass = 0; pass < 4; pass++)
    for (let k = 0; k < 15; k++) {   // each segment tuned so the arclength at its end level matches the measured one
      let lo = loops[k] ? 10 : 0, hi = loops[k] ? 1400 : 1;
      for (let it = 0; it < 24; it++) { q[k] = (lo + hi) / 2; if (crossings(build(), levels)[k] > cum[k]) hi = q[k]; else lo = q[k]; }
    }
  return build();
}
const quoteA = quoteLine(3, envA, [289, -4000], [369, 2000], [30, -4000, 619.4, 6000], cumA);
const quoteB = quoteLine(5, envB, [298, -4000], [360, 2000], [31.5, -4000, 608, 6000], cumB);

// Journal outline strokes (drawn behind the blob-masked photos): own closed organic outlines. Only the measured path
// boxes are matched (A 0.37,0.37 292.27×253.27 in 0 0 293 254 · B 0.5,0.5 263.12×257.08 in 0 0 265 259 ·
// C 0,0 299.7×262.88 in −1 −1 302 265); the shapes are generated here.
function closedSpline(pts) {
  const n = pts.length; const at = (i) => pts[(i + n) % n];
  let d = `M ${at(0)[0].toFixed(1)} ${at(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1.map((v) => v.toFixed(1)).join(' ')} ${c2.map((v) => v.toFixed(1)).join(' ')} ${p2.map((v) => v.toFixed(1)).join(' ')}`;
  }
  return `${d} Z`;
}
function blobOutline(seed, n, wobble, tilt) {
  let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI + tilt; const r = 1 + wobble * (rnd() - 0.5); return [Math.cos(a) * r, Math.sin(a) * r * 0.9]; });
}
const journalStrokeA = fitBox(closedSpline(blobOutline(11, 7, 0.36, 0.3)), [0.37, 0.37, 292.27, 253.27]);
const journalStrokeB = fitBox(closedSpline(blobOutline(23, 6, 0.4, 1.1)), [0.5, 0.5, 263.12, 257.08]);
const journalStrokeC = fitBox(closedSpline(blobOutline(37, 5, 0.46, 2.0)), [0, 0, 299.7, 262.88]);

const out = `// GENERATED by tools/standins/lines.mjs — original stand-in line art (not derived from the template).
export const PATHS = {
  heroA: { viewBox: '0 0 780 1140', d: ${JSON.stringify(spline(heroA))} },
  heroB: { viewBox: '0 0 780 1140', d: ${JSON.stringify(spline(heroB))} },
  waveA: { viewBox: '0 0 6000 680', d: ${JSON.stringify(spline(waveA))} },
  waveB: { viewBox: '0 0 6000 680', d: ${JSON.stringify(spline(waveB))} },
  /** Pricing scribble: own loop fitted to the original path's bbox (x 26–291, y 3–71 in 310×80) so the
   *  path-triggered draw window matches (B14); length 735 (original 622; the draw is progress-based). */
  scribble: { viewBox: '0 0 310 80', d: 'M26 55.96 C75.67 73.34 175.01 77.68 254.49 58.13 C304.16 46.18 302.17 16.86 254.49 8.17 C200.84 -1.61 123.36 2.74 81.63 19.03 C49.84 32.06 65.74 51.61 109.45 54.87 C155.15 58.13 218.72 49.44 266.41 36.41' },
  /** Big Quote long lines (B6): own meanders on the original paths' boxes (x 30 / 31.5, w 619.4 / 608, y −4000…2000). */
  quoteA: { viewBox: '0 0 680 2000', d: ${JSON.stringify(quoteA)} },
  quoteB: { viewBox: '0 0 680 2000', d: ${JSON.stringify(quoteB)} },
  /** Journal outline strokes (behind the blob photos): own closed outlines on the original path boxes. */
  journalStrokeA: { viewBox: '0 0 293 254', d: ${JSON.stringify(journalStrokeA)} },
  journalStrokeB: { viewBox: '0 0 265 259', d: ${JSON.stringify(journalStrokeB)} },
  journalStrokeC: { viewBox: '-1 -1 302 265', d: ${JSON.stringify(journalStrokeC)} },
} as const;
export type PathName = keyof typeof PATHS;
`;
fs.writeFileSync(new URL('../../src/components/decor/paths.ts', import.meta.url), out);
console.log('approx lengths', Math.round(polyLength(heroA)), Math.round(polyLength(heroB)));
