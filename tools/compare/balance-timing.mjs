// Balance ("Toggle") animation comparison, original vs clone, frame-accurate.
//
// For each transition (appear, Start→Off, Off→On, On→Off, Off→Start), both sites are loaded, the
// page jumps between scroll positions derived from each page's OWN markers, and every rAF records the
// switch/text channels with the frame timestamp. Only fresh (changed) samples are kept.
// backdrop-filter is disabled on both sides so frames are ~16 ms (see timing.mjs).
// Scoring is model-free: clone samples are compared with the original runs, interpolated where the
// original frames are <= 50 ms apart. Errors are normalised by the channel's range.
// Gate, per channel (shape and start phase are judged separately):
//   shape  — at the best time shift δ: rmse <= max(0.02, original run-to-run noise floor), max <= 0.15
//   phase  — |δ| <= 2 frames (33 ms): across repeated batches the original's own start phase moves by
//            ±1–2 frames (Framer render scheduling), so a tighter phase gate would measure the original's jitter
//   ends   — start/end values equal (±2 % of range, ±0.5 px)
// The unshifted rmse / max are reported for information.
//
// Usage: node tools/compare/balance-timing.mjs [WxH] [runs=3] [transition indices, e.g. 1,2]
//        → tools/.runs/report-balance-<vp>.md (+ balance-raw-<vp>.json)
import fs from 'node:fs';
import { CLONE_URL, ORIGINAL_URL, RUNS_DIR, ensureDir, launch, parseVp } from '../recon/lib.mjs';

const vp = process.argv[2] || '1440x900';
const RUNS = Number(process.argv[3] || 3);
const [W, H] = parseVp(vp);
const TOL = { rmse: 0.02, max: 0.15, phase: 0.034 };

// channel extractors run in the page: return raw numbers
const PROBE = {
  original: {
    wrap: 'a[data-framer-name="Toggle Container"] > div',
    label: 'a[data-framer-name="Toggle Container"] p',
    labelBox: 'a[data-framer-name="Toggle Container"] p',
    base: 'a[data-framer-name="Toggle Container"] [data-framer-name="Base"]',
    knob: 'a[data-framer-name="Toggle Container"] [data-framer-name="Base"] > *',
    bH2: '[data-framer-name="Text Before"] > div:nth-child(1)',
    bP: '[data-framer-name="Text Before"] > div:nth-child(2)',
    aH2: '[data-framer-name="Text After"] > div:nth-child(1)',
    aP: '[data-framer-name="Text After"] > div:nth-child(2)',
    marker: (id) => `[data-framer-name="${id}"]`,
  },
  clone: {
    wrap: '[data-ref="Toggle/Toggle Off/Toggle Container/Start"]',
    label: '[data-ref="Toggle/Toggle Off/Toggle Container/Start/Label"]',
    labelBox: '[data-ref="Toggle/Toggle Off/Toggle Container/Start/Label"]',
    base: '[data-ref="Toggle/Toggle Off/Toggle Container/Start/Base"]',
    knob: '[data-ref="Toggle/Toggle Off/Toggle Container/Start/Base/Toggle"]',
    bH2: '[data-ref="Toggle/Toggle Off/Text After/Text Before/H2"]',
    bP: '[data-ref="Toggle/Toggle Off/Text After/Text Before/P"]',
    aH2: '[data-ref="Toggle/Toggle Off/Text After/H2"]',
    aP: '[data-ref="Toggle/Toggle Off/Text After/P"]',
    marker: (id) => `[data-marker="${id}"]`,
  },
};
const CHANNELS = ['wrap op', 'label x', 'label op', 'label R', 'track w', 'track x', 'track A', 'track G', 'knob x', 'before H2 op', 'before P op', 'after H2 op', 'after P op'];

async function run(b, target, fromKey, toKey) {
  const S = PROBE[target];
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  for (let attempt = 1; ; attempt++) {
    try { await p.goto(target === 'original' ? ORIGINAL_URL : CLONE_URL, { waitUntil: 'networkidle', timeout: 60000 }); break; }
    catch (e) { if (attempt >= 3) throw e; }
  }
  await p.waitForTimeout(4500);
  await p.evaluate(() => { for (const el of document.querySelectorAll('*')) { const cs = getComputedStyle(el); if (cs.backdropFilter && cs.backdropFilter !== 'none') el.style.setProperty('backdrop-filter', 'none', 'important'); } });
  // scroll positions from this page's own geometry
  const pos = await p.evaluate(([mStart, mOn, wrapSel]) => {
    const top = (sel) => document.querySelector(sel).getBoundingClientRect().top + scrollY;
    const cross = (sel) => top(sel) - innerHeight / 2;
    const swTop = top(wrapSel); // measured at scrollY 0, before the sticky block engages
    const c1 = cross(mStart), c2 = cross(mOn);
    // switch transitions jump ±60 px around each crossing (a real scroll crosses a threshold in small
    // steps; large jumps provoke 100–150 ms React stalls in the original that are not part of the design)
    return { out: 0, appearIn: Math.min(c1 - 150, Math.max(0, swTop - innerHeight + 150)), startA: Math.round(c1 - 60), offA: Math.round(c1 + 60), offB: Math.round(c2 - 60), onB: Math.round(c2 + 60) };
  }, [S.marker('toggle-start-animation'), S.marker('toggle-on-animation'), S.wrap]);
  if (pos[fromKey]) { await p.evaluate((y) => window.scrollTo(0, y), pos[fromKey]); await p.waitForTimeout(2500); }
  const series = await p.evaluate(async ([S, y]) => {
    const q = (s) => document.querySelector(s);
    const rgba = (c) => { const v = (c.match(/[\d.]+/g) || []).map(Number); return v.length === 3 ? [...v, 1] : v; };
    const snap = () => {
      const w = q(S.wrap).getBoundingClientRect();
      const lab = q(S.labelBox).getBoundingClientRect(), base = q(S.base), knob = q(S.knob).getBoundingClientRect();
      const br = base.getBoundingClientRect(), bc = rgba(getComputedStyle(base).backgroundColor), lc = rgba(getComputedStyle(q(S.label)).color);
      const op = (s) => +getComputedStyle(q(s)).opacity;
      // label opacity = product from the label up to the switch box (the original fades the label's
      // wrapper, the clone the label itself)
      let labOp = 1; for (let e = q(S.label); e && e !== q(S.wrap); e = e.parentElement) labOp *= +getComputedStyle(e).opacity;
      return [op(S.wrap), lab.left - w.left, labOp, lc[0], br.width, br.left - w.left, bc[3], bc[1], knob.left - w.left, op(S.bH2), op(S.bP), op(S.aH2), op(S.aP)];
    };
    const out = []; let t0; await new Promise((r) => requestAnimationFrame((ts) => { t0 = ts; r(); }));
    out.push([0, snap()]); window.scrollTo(0, y);
    await new Promise((res) => { const f = (ts) => { out.push([(ts - t0) / 1000, snap()]); if (ts - t0 < 2000) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    return out;
  }, [{ ...S, marker: undefined }, pos[toKey]]);
  await p.context().close();
  return series;
}

const TRANSITIONS = [
  ['appear (switch enters view)', 'out', 'appearIn', ['wrap op']],
  ['Start → Off', 'startA', 'offA', ['track w', 'track x', 'label x', 'label op', 'knob x']],
  ['Off → On', 'offB', 'onB', ['knob x', 'track A', 'track G', 'label R', 'before H2 op', 'before P op', 'after H2 op', 'after P op']],
  ['On → Off', 'onB', 'offB', ['knob x', 'track A', 'track G', 'label R', 'before H2 op', 'before P op', 'after H2 op', 'after P op']],
  ['Off → Start', 'offA', 'startA', ['track w', 'track x', 'label x', 'label op', 'knob x']],
];

const interp = (run, t) => { for (let i = 1; i < run.length; i++) if (run[i][0] >= t) { const [t1, v1] = run[i - 1], [t2, v2] = run[i]; if (t < t1 || t2 - t1 > 0.05) return null; return v1 + (v2 - v1) * (t - t1) / (t2 - t1); } return null; };
const ref = (t, runs) => { const v = runs.map((r) => interp(r, t)).filter((x) => x !== null); return v.length ? v.reduce((a, x) => a + x, 0) / v.length : null; };
const score = (samples, runs, range) => { const e = samples.map(([t, v]) => { const r = ref(t, runs); return r === null ? null : Math.abs(r - v) / range; }).filter((x) => x !== null); return { n: e.length, rmse: Math.sqrt(e.reduce((a, x) => a + x * x, 0) / Math.max(1, e.length)), max: e.length ? Math.max(...e) : NaN }; };
// a channel's samples: the full series (first/last value kept so the curve's flat ends are covered)
const channel = (series, ci) => series.map(([t, v]) => [t, v[ci]]);
// best time shift δ (clone(t) vs original(t + δ)): separates start phase from curve shape
const bestShift = (C, O, range) => { let best = null; for (let d = -0.1; d <= 0.3; d += 0.004) { const sc = score(C.map(([t, v]) => [t + d, v]), O, range); if (sc.n > 5 && (!best || sc.rmse < best.rmse)) best = { d: Math.round(d * 1000) / 1000, ...sc }; } return best; };
const firstChange = (runs) => { const t = runs.map((r) => r.find(([, v], i) => i > 0 && Math.abs(v - r[0][1]) > 1e-3)?.[0]).filter((x) => x !== undefined); return t.length ? Math.min(...t) : null; };

const b = await launch();
const out = [`# Balance timing report ${vp}`, '', `${RUNS} runs per side per transition; errors normalised by channel range.`, ''];
let failures = 0;
const raw = {};
const only = process.argv[4] ? process.argv[4].split(',') : null; // optional subset: transition indices
for (const [idx, [name, from, to, chans]] of TRANSITIONS.entries()) {
  if (only && !only.includes(String(idx))) continue;
  const R = { original: [], clone: [] };
  for (let i = 0; i < RUNS; i++) for (const t of ['original', 'clone']) R[t].push(await run(b, t, from, to));
  raw[name] = R;
  out.push(`## ${name}`, '', '| channel | original start → end | clone start → end | first change orig / clone (ms) | unshifted rmse / max | best shift δ (ms) | shape rmse / max at δ | noise floor | ends · shape · phase | gate |', '|---|---|---|---|---|---|---|---|---|---|');
  for (const ch of chans) {
    const ci = CHANNELS.indexOf(ch);
    const O = R.original.map((s) => channel(s, ci)), C = R.clone.map((s) => channel(s, ci));
    const o0 = O[0][0][1], o1 = O[0].at(-1)[1], c0 = C[0][0][1], c1 = C[0].at(-1)[1];
    const range = Math.max(Math.abs(o1 - o0), 1e-6);
    if (Math.abs(o1 - o0) < 1e-3 && Math.abs(c1 - c0) < 1e-3) { out.push(`| ${ch} | ${o0.toFixed(2)} (static) | ${c0.toFixed(2)} (static) | — | — | — | — | — | — | ${Math.abs(o0 - c0) < 0.02 * Math.max(1, Math.abs(o0)) ? 'pass' : '**FAIL**'} |`); if (!(Math.abs(o0 - c0) < 0.02 * Math.max(1, Math.abs(o0)))) failures++; continue; }
    const sc = score(C.flat(), O, range);
    const nf = O.map((r, i) => score(r, O.filter((_, j) => j !== i), range));
    const nfR = Math.max(...nf.map((x) => x.rmse));
    const fo = firstChange(O), fc = firstChange(C);
    const bs = bestShift(C.flat(), O, range);
    const ends = Math.abs(o1 - c1) <= 0.02 * range + 0.5 && Math.abs(o0 - c0) <= 0.02 * range + 0.5;
    const shape = !!bs && bs.rmse <= Math.max(TOL.rmse, nfR) && bs.max <= TOL.max;
    const phase = !!bs && Math.abs(bs.d) <= TOL.phase;
    const ok = ends && shape && phase;
    if (!ok) failures++;
    out.push(`| ${ch} | ${o0.toFixed(2)} → ${o1.toFixed(2)} | ${c0.toFixed(2)} → ${c1.toFixed(2)} | ${fo === null ? '—' : (fo * 1000).toFixed(0)} / ${fc === null ? '—' : (fc * 1000).toFixed(0)} | ${sc.rmse.toFixed(4)} / ${sc.max.toFixed(3)} | ${bs ? (bs.d * 1000).toFixed(0) : '—'} | ${bs ? `${bs.rmse.toFixed(4)} / ${bs.max.toFixed(3)}` : '—'} | ${nfR.toFixed(4)} | ${ends ? '✓' : '✗'} ${shape ? '✓' : '✗'} ${phase ? '✓' : '✗'} | ${ok ? 'pass' : '**FAIL**'} |`);
  }
  out.push('');
}
await b.close();
ensureDir(RUNS_DIR);
fs.writeFileSync(`${RUNS_DIR}report-balance-${vp}.md`, out.join('\n') + '\n');
fs.writeFileSync(`${RUNS_DIR}balance-raw-${vp}.json`, JSON.stringify({ channels: CHANNELS, raw }));
console.log(out.join('\n'));
console.log(failures ? `${failures} channel(s) outside tolerance` : 'all balance channels within tolerance');
process.exitCode = failures ? 1 : 0;
