// Frame-accurate timing comparison (original vs clone) of time-based animations.
//
//   1. Load start times: nav logo entrance start → first hero word start, per load.
//      original: WAAPI startTime + delay (document.getAnimations); clone: performance marks
//      'anim:nav-logo' / 'anim:hero-word-0' (animations/core/loadClock.ts). N loads each.
//   2. Load curves: 10/50/90 % opacity crossings of words + nav (secondary; frame-quantised).
//   3. Marker fades: after an instant jump past a marker (and back), opacity sampled at every rAF with
//      its frame timestamp, keeping only fresh values. Each side is fitted with the same model family
//      (free parameters), and the clone samples are scored against the ORIGINAL's fitted curve. The
//      original's own residual is the noise floor. backdrop-filter is disabled on both sides during
//      fade sampling so frames run at ~16 ms (see fadeRun).
//
// Usage: node tools/compare/timing.mjs [WxH] [loads=5]  → tools/.runs/report-timing-<vp>.md
// Exit code 1 when a check is outside tolerance.
import fs from 'node:fs';
import { CLONE_URL, ORIGINAL_URL, RUNS_DIR, ensureDir, launch, parseVp } from '../recon/lib.mjs';

const vp = process.argv[2] || '1440x900';
const LOADS = Number(process.argv[3] || 5);
const [W, H] = parseVp(vp);
const TOL = {
  startGapMs: 100,     // IMPLEMENTATION_PLAN §10: load timing within ±100 ms
  staggerMs: 100,
  fadeMaxErr: 0.15,    // motion-map tolerance for the Page Intro fade (opacity)
  fadeRmse: 0.02,      // stricter mid-transition check: clone vs original curve (or the original's own run-to-run rmse if larger)
};
const SEL = {
  original: { words: 'h1 span', nav: ['[data-framer-appear-id="g52bo5"]', '[data-framer-appear-id="161i3vw"]', '[data-framer-appear-id="1jf682h"]', '[data-framer-appear-id="1r49n52"]', '[data-framer-appear-id="e78t0w"]', '[data-framer-appear-id="1emsuyt"]'], intro: '[data-framer-name="Page Intro"]', lines: '[data-framer-name="Animated Lines"]' },
  clone: { words: 'h1 [data-word]', nav: ['[data-entrance="logo"]', '[data-entrance="0"]', '[data-entrance="1"]', '[data-entrance="2"]', '[data-entrance="3"]', '[data-entrance="cta"]'], intro: '[data-ref="Page Intro"]', lines: '[data-ref="Page Intro/Hero/Animated Lines"]' },
};
const url = (t) => (t === 'original' ? ORIGINAL_URL : CLONE_URL);
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };

/* ── 1+2. load ────────────────────────────────────────────────────── */
async function loadRun(b, target) {
  const s = SEL[target];
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.addInitScript(([s, target]) => {
    window.__T = []; window.__S = { logo: null, w: [] }; const t0 = performance.now();
    const tick = () => {
      const t = performance.now() - t0;
      if (target === 'original') for (const a of document.getAnimations()) {
        const tg = a.effect?.target; if (!tg || a.startTime == null) continue;
        const st = a.startTime + a.effect.getComputedTiming().delay;
        if (window.__S.logo === null && tg.getAttribute?.('data-framer-appear-id') === 'g52bo5') window.__S.logo = st;
        if (tg.tagName === 'SPAN' && tg.closest('h1') && !window.__S.w.some((x) => x[0] === tg)) window.__S.w.push([tg, st]);
      }
      const words = [...document.querySelectorAll(s.words)].filter((e) => e.children.length === 0 && e.textContent.trim());
      window.__T.push([t, words.map((e) => +getComputedStyle(e).opacity), s.nav.map((q) => { const e = document.querySelector(q); return e ? +getComputedStyle(e).opacity : null; })]);
      if (t < 6000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [s, target]);
  await p.goto(url(target), { waitUntil: 'load' });
  await p.waitForTimeout(6200);
  const r = await p.evaluate((target) => {
    let logo, words;
    if (target === 'original') { logo = window.__S.logo; words = window.__S.w.map((x) => x[1]).sort((a, b) => a - b); }
    else { const m = (n) => performance.getEntriesByName(n, 'mark')[0]?.startTime ?? null; logo = m('anim:nav-logo'); words = []; for (let i = 0; m(`anim:hero-word-${i}`) !== null; i++) words.push(m(`anim:hero-word-${i}`)); }
    return { logo, words, T: window.__T };
  }, target);
  await p.context().close();
  const T = r.T;
  // crossing time with linear interpolation between frames
  const cross = (ser, lvl) => { for (let i = 1; i < T.length; i++) if (ser[i] !== null && ser[i] >= lvl && ser[i - 1] !== null) { const a = ser[i - 1], b2 = ser[i]; const f = b2 === a ? 1 : (lvl - a) / (b2 - a); return Math.round(T[i - 1][0] + f * (T[i][0] - T[i - 1][0])); } return null; };
  const nW = T.at(-1)[1].length, nN = T.at(-1)[2].length;
  const words = Array.from({ length: nW }, (_, i) => { const ser = T.map((x) => x[1][i] ?? null); return [cross(ser, 0.1), cross(ser, 0.5), cross(ser, 0.9)]; });
  const nav = Array.from({ length: nN }, (_, i) => { const ser = T.map((x) => x[2][i]); return [cross(ser, 0.1), cross(ser, 0.5), cross(ser, 0.9)]; });
  return { logo: r.logo, wordStarts: r.words, gap: r.logo !== null && r.words[0] != null ? r.words[0] - r.logo : null, words, nav };
}

/* ── 3. marker fades ──────────────────────────────────────────────── */
async function fadeRun(b, target, key, y, dir) {
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto(url(target), { waitUntil: 'networkidle' });
  await p.waitForTimeout(5000);
  // Rendering-cost normalisation (both targets): backdrop-filter layers (progressive blur) make
  // software-rendered frames 130-170 ms long, which quantises the "next frame" start differently on
  // each site. Disabling them gives ~16 ms frames. Animation logic is untouched.
  await p.evaluate(() => { for (const el of document.querySelectorAll('*')) { const cs = getComputedStyle(el); if ((cs.backdropFilter && cs.backdropFilter !== 'none') || (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none')) { el.style.setProperty('backdrop-filter', 'none', 'important'); el.style.setProperty('-webkit-backdrop-filter', 'none', 'important'); } } });
  await p.waitForTimeout(300);
  if (dir === 'up') { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(2500); }
  const s = await p.evaluate(async ([sel, y, dir]) => {
    const el = document.querySelector(sel); const out = [];
    let t0; await new Promise((r) => requestAnimationFrame((ts) => { t0 = ts; r(); }));
    window.scrollTo(0, dir === 'up' ? 0 : y);
    await new Promise((res) => { const f = (ts) => { out.push([ts - t0, +getComputedStyle(el).opacity]); if (ts - t0 < 2200) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    return out;
  }, [SEL[target][key], y, dir]);
  await p.context().close();
  // fresh, in-transition samples only (a repeated value is a stale frame)
  return s.filter((x, i) => i && x[1] !== s[i - 1][1] && x[1] > 0.002 && x[1] < 0.998).map(([t, v]) => [t / 1000, v]);
}

// model families (return "remaining" 1 → 0 fraction of the transition at time t since start)
const bez = (x1, y1, x2, y2) => (x) => { let lo = 0, hi = 1; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; const bx = 3 * (1 - m) ** 2 * m * x1 + 3 * (1 - m) * m * m * x2 + m ** 3; if (bx < x) lo = m; else hi = m; } const m = (lo + hi) / 2; return 3 * (1 - m) ** 2 * m * y1 + 3 * (1 - m) * m * m * y2 + m ** 3; };
const strong = bez(0.6, 0, 0.4, 1);
const MODELS = {
  spring: { label: 'critically damped spring ω', grid: Array.from({ length: 140 }, (_, i) => 4 + i * 0.05), rem: (w, t) => Math.exp(-w * t) * (1 + w * t), fmt: (w) => `ω=${w.toFixed(2)} (Framer duration ${(9.2334 / w).toFixed(3)} s)` },
  strong: { label: "tween 'strong' duration", grid: Array.from({ length: 121 }, (_, i) => 0.4 + i * 0.01), rem: (d, t) => (t >= d ? 0 : 1 - strong(t / d)), fmt: (d) => `duration ${d.toFixed(2)} s` },
};
function fit(P, model, from, to) {
  const M = MODELS[model]; let best = null;
  const val = (k, t0, t) => { const tt = t - t0; const r = tt <= 0 ? 1 : M.rem(k, tt); return to + (from - to) * r; };
  for (const k of M.grid) for (let t0 = -0.06; t0 <= 0.2; t0 += 0.002) {
    let e = 0; for (const [t, v] of P) e += (val(k, t0, t) - v) ** 2;
    if (!best || e < best.e) best = { e, k, t0 };
  }
  const f = (t) => val(best.k, best.t0, t);
  return { ...best, f, rmse: Math.sqrt(best.e / P.length), desc: `${M.fmt(best.k)}, t0 ${(best.t0 * 1000).toFixed(0)} ms` };
}

/* ── run ──────────────────────────────────────────────────────────── */
const b = await launch();
const out = [`# Timing report ${vp}`, ''];
let failures = 0;
const verdict = (ok) => { if (!ok) failures++; return ok ? 'pass' : 'FAIL'; };

const L = { original: [], clone: [] };
for (let i = 0; i < LOADS; i++) for (const t of ['original', 'clone']) L[t].push(await loadRun(b, t));
const gaps = { original: L.original.map((r) => r.gap).filter((x) => x !== null), clone: L.clone.map((r) => r.gap).filter((x) => x !== null) };
const dGap = median(gaps.clone) - median(gaps.original);
out.push('## 1. Load start times (nav logo entrance start → first hero word start)', '',
  `Scheduled start times: original from WAAPI startTime + delay, clone from performance marks. ${LOADS} loads each.`, '',
  '| | per load (ms) | median |', '|---|---|---|',
  `| original | ${gaps.original.map((g) => g.toFixed(0)).join(', ')} | **${median(gaps.original).toFixed(0)}** |`,
  `| clone | ${gaps.clone.map((g) => g.toFixed(0)).join(', ')} | **${median(gaps.clone).toFixed(0)}** |`, '',
  `Δ median ${dGap.toFixed(0)} ms (tol ±${TOL.startGapMs}): **${verdict(Math.abs(dGap) <= TOL.startGapMs)}**`);
const relStarts = (t) => { const runs = L[t].filter((r) => r.wordStarts.length > 1).map((r) => r.wordStarts.map((w) => w - r.wordStarts[0])); return runs.length ? runs[0].map((_, i) => median(runs.map((r) => r[i]))) : []; };
const sO = relStarts('original'), sC = relStarts('clone');
const sErr = sO.length && sC.length === sO.length ? Math.max(...sO.map((v, i) => Math.abs(v - sC[i]))) : Infinity;
out.push('', `Word starts relative to word 0 (scheduled, median): original ${sO.map((x) => x.toFixed(0)).join(', ')} · clone ${sC.map((x) => x.toFixed(0)).join(', ')} ms. Max |Δ| ${sErr.toFixed(0)} ms (tol ±${TOL.staggerMs}): **${verdict(sErr <= TOL.staggerMs)}**`);
const L0 = { original: L.original[0], clone: L.clone[0] };
const fmt = (a) => a.map((x) => (x ? `${x[0]}/${x[1]}/${x[2]}` : '—')).join(' · ');
const rel = (a) => a.map((x) => (x && x[1] !== null ? x[1] - a[0][1] : null));
const relMed = (t) => rel(L[t][0].words).map((_, i) => median(L[t].map((r) => rel(r.words)[i]).filter((x) => x !== null)));
const stO = relMed('original'), stC = relMed('clone');
out.push('', '## 2. Load curves (ms since navigation: 10 % / 50 % / 90 % opacity, interpolated; load 1)', '', '| | original | clone |', '|---|---|---|',
  `| hero words | ${fmt(L0.original.words)} | ${fmt(L0.clone.words)} |`,
  `| word duration 10→90 % | ${L0.original.words.map((x) => x && x[2] - x[0]).join(', ')} | ${L0.clone.words.map((x) => x && x[2] - x[0]).join(', ')} |`,
  `| nav logo, 4 links, cta | ${fmt(L0.original.nav)} | ${fmt(L0.clone.nav)} |`,
  `| nav 50 % relative to logo | ${rel(L0.original.nav).join(', ')} | ${rel(L0.clone.nav).join(', ')} |`,
  `| words 50 % relative to word 0 (median of ${LOADS}; informative, frame-quantised) | ${stO.map((x) => x.toFixed(0)).join(', ')} | ${stC.map((x) => x.toFixed(0)).join(', ')} |`);

const FADES = [
  ['Page Intro fade-out (jump to toggle-on)', 'intro', Math.round(1500 * H / 900), 'down', 'spring', 1, 0],
  ['Page Intro fade-in (jump back to top)', 'intro', Math.round(1500 * H / 900), 'up', 'spring', 0, 1],
  ['hero lines fade-out (jump to toggle-start)', 'lines', 800, 'down', 'strong', 1, 0],
  ['hero lines fade-in (jump back to top)', 'lines', 800, 'up', 'strong', 0, 1],
];
for (const [name, key, y, dir, model, from, to] of FADES) {
  const R = { original: [], clone: [] };
  for (let i = 0; i < 3; i++) for (const t of ['original', 'clone']) R[t].push(await fadeRun(b, t, key, y, dir));
  const P = { original: R.original.flat(), clone: R.clone.flat() };
  // model-free reference: each original run interpolated where its frames are <= 50 ms apart
  const interp = (run, t) => { for (let i = 1; i < run.length; i++) if (run[i][0] >= t) { const [t1, v1] = run[i - 1], [t2, v2] = run[i]; if (t < t1 || t2 - t1 > 0.05) return null; return v1 + (v2 - v1) * (t - t1) / (t2 - t1); } return null; };
  const ref = (t, runs) => { const v = runs.map((r) => interp(r, t)).filter((x) => x !== null); return v.length ? v.reduce((a, x) => a + x, 0) / v.length : null; };
  const score = (samples, runs) => { const e = samples.map(([t, v]) => { const r = ref(t, runs); return r === null ? null : Math.abs(r - v); }).filter((x) => x !== null); return { n: e.length, rmse: Math.sqrt(e.reduce((a, x) => a + x * x, 0) / Math.max(1, e.length)), max: e.length ? Math.max(...e) : NaN }; };
  const sc = score(P.clone, R.original);
  // noise floor: each original run against the other two
  const nf = R.original.map((run, i) => score(run, R.original.filter((_, j) => j !== i)));
  const nfRmse = Math.max(...nf.map((x) => x.rmse)), nfMax = Math.max(...nf.map((x) => x.max));
  const fo = fit(P.original, model, from, to), fc = fit(P.clone, model, from, to);
  const grid = [50, 100, 150, 200, 300, 450, 600, 800, 1000].map((ms) => [ms, fo.f(ms / 1000), fc.f(ms / 1000)]);
  out.push('', `## 3. ${name}: scrollY ${dir === 'up' ? `${y} → 0` : `0 → ${y}`}`, '',
    `| | fresh samples | fitted (${MODELS[model].label}) | rmse vs own fit |`, '|---|---|---|---|',
    `| original | ${P.original.length} | ${fo.desc} | ${fo.rmse.toFixed(4)} (noise floor) |`,
    `| clone | ${P.clone.length} | ${fc.desc} | ${fc.rmse.toFixed(4)} |`, '',
    '| ms after jump | ' + grid.map((g) => g[0]).join(' | ') + ' |', '|---|' + grid.map(() => '---').join('|') + '|',
    '| original (fit) | ' + grid.map((g) => g[1].toFixed(3)).join(' | ') + ' |',
    '| clone (fit) | ' + grid.map((g) => g[2].toFixed(3)).join(' | ') + ' |', '',
    `Model-free: clone samples vs original runs (interpolated where original frames <= 50 ms apart; ${sc.n}/${P.clone.length} samples covered): rmse ${sc.rmse.toFixed(4)} (tol ${TOL.fadeRmse}), max ${sc.max.toFixed(3)} (tol ${TOL.fadeMaxErr}). Original run-to-run noise floor: rmse ${nfRmse.toFixed(4)}, max ${nfMax.toFixed(3)}. Gate (noise-aware): rmse <= max(${TOL.fadeRmse}, noise floor) = ${Math.max(TOL.fadeRmse, nfRmse).toFixed(4)} and max <= ${TOL.fadeMaxErr}: **${verdict(sc.rmse <= Math.max(TOL.fadeRmse, nfRmse) && sc.max <= TOL.fadeMaxErr)}**`);
}
await b.close();
ensureDir(RUNS_DIR);
fs.writeFileSync(`${RUNS_DIR}report-timing-${vp}.md`, out.join('\n') + '\n');
console.log(out.join('\n'));
console.log(failures ? `\n${failures} check(s) outside tolerance` : '\nall timing checks within tolerance');
process.exitCode = failures ? 1 : 0;
