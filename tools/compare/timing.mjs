// Frame-accurate timing comparison (original vs clone) of time-based animations:
//   load: hero words + nav entrance (10/50/90 % opacity crossing times → stagger & duration)
//   marker fades: after an instant jump past a marker, Page Intro / hero lines opacity over time.
// Usage: node tools/compare/timing.mjs [WxH]   → tools/.runs/report-timing-<vp>.md
import fs from 'node:fs';
import { CLONE_URL, ORIGINAL_URL, RUNS_DIR, ensureDir, launch, parseVp } from '../recon/lib.mjs';

const vp = process.argv[2] || '1440x900';
const [W, H] = parseVp(vp);
const SEL = {
  original: { words: 'h1 span', nav: ['[data-framer-appear-id="g52bo5"]', '[data-framer-appear-id="161i3vw"]', '[data-framer-appear-id="1jf682h"]', '[data-framer-appear-id="1r49n52"]', '[data-framer-appear-id="e78t0w"]', '[data-framer-appear-id="1emsuyt"]'], intro: '[data-framer-name="Page Intro"]', lines: '[data-framer-name="Animated Lines"]' },
  clone: { words: 'h1 [data-word]', nav: ['[data-entrance="logo"]', '[data-entrance="0"]', '[data-entrance="1"]', '[data-entrance="2"]', '[data-entrance="3"]', '[data-entrance="cta"]'], intro: '[data-ref="Page Intro"]', lines: '[data-ref="Page Intro/Hero/Animated Lines"]' },
};

async function loadTimeline(b, target) {
  const s = SEL[target];
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.addInitScript((s) => {
    window.__T = []; const t0 = performance.now();
    const tick = () => {
      const t = performance.now() - t0;
      const words = [...document.querySelectorAll(s.words)].filter((e) => e.children.length === 0 && e.textContent.trim());
      const nav = s.nav.map((q) => document.querySelector(q));
      window.__T.push([t, words.map((e) => +getComputedStyle(e).opacity), nav.map((e) => (e ? +getComputedStyle(e).opacity : null))]);
      if (t < 7000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, s);
  await p.goto(target === 'original' ? ORIGINAL_URL : CLONE_URL, { waitUntil: 'load' });
  await p.waitForTimeout(7200);
  const T = await p.evaluate(() => window.__T);
  await p.context().close();
  const cross = (series, lvl) => { const i = series.findIndex((v) => v !== null && v >= lvl); return i < 0 ? null : Math.round(T[i][0]); };
  const nW = T.at(-1)[1].length, nN = T.at(-1)[2].length;
  const words = Array.from({ length: nW }, (_, i) => { const ser = T.map((r) => r[1][i] ?? null); return [cross(ser, 0.1), cross(ser, 0.5), cross(ser, 0.9)]; });
  const nav = Array.from({ length: nN }, (_, i) => { const ser = T.map((r) => r[2][i]); return [cross(ser, 0.1), cross(ser, 0.5), cross(ser, 0.9)]; });
  return { words, nav };
}

async function markerFade(b, target, jumpTo, key) {
  const s = SEL[target];
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto(target === 'original' ? ORIGINAL_URL : CLONE_URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(5000);
  const series = await p.evaluate(async ([sel, y]) => {
    const el = document.querySelector(sel); window.scrollTo(0, y); const out = []; const t0 = performance.now();
    await new Promise((res) => { const f = () => { const t = performance.now() - t0; out.push([Math.round(t), +getComputedStyle(el).opacity]); if (t < 2000) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    return out;
  }, [s[key], jumpTo]);
  await p.context().close();
  const at = (ms) => series.find((r) => r[0] >= ms)?.[1];
  return [100, 200, 300, 450, 600, 800, 1000, 1200, 1500].map((ms) => [ms, at(ms)]);
}

const b = await launch();
const out = [`# Timing report ${vp}`, ''];
const L = { original: await loadTimeline(b, 'original'), clone: await loadTimeline(b, 'clone') };
const fmt = (a) => a.map((x) => (x ? `${x[0]}/${x[1]}/${x[2]}` : '—')).join(' · ');
const rel = (a) => a.map((x) => (x && x[1] !== null ? x[1] - a[0][1] : null));
out.push('## Load (ms since navigation: 10 % / 50 % / 90 % opacity)', '', '| | original | clone |', '|---|---|---|');
out.push(`| hero words | ${fmt(L.original.words)} | ${fmt(L.clone.words)} |`);
out.push(`| words 50 % relative to first word | ${rel(L.original.words).join(', ')} | ${rel(L.clone.words).join(', ')} |`);
out.push(`| word duration (10→90 %) | ${L.original.words.map((x) => x && x[2] - x[0]).join(', ')} | ${L.clone.words.map((x) => x && x[2] - x[0]).join(', ')} |`);
out.push(`| nav logo, 4 links, cta | ${fmt(L.original.nav)} | ${fmt(L.clone.nav)} |`);
out.push(`| nav 50 % relative to logo | ${rel(L.original.nav).join(', ')} | ${rel(L.clone.nav).join(', ')} |`);
for (const [name, key, y] of [['Page Intro fade (jump to toggle-on)', 'intro', Math.round(1500 * H / 900)], ['hero lines fade (jump to toggle-start)', 'lines', 800]]) {
  const o = await markerFade(b, 'original', y, key), c = await markerFade(b, 'clone', y, key);
  out.push('', `## ${name} — opacity after jump to scrollY ${y}`, '', '| ms | ' + o.map((r) => r[0]).join(' | ') + ' |', '|---|' + o.map(() => '---').join('|') + '|',
    '| original | ' + o.map((r) => r[1]?.toFixed(3)).join(' | ') + ' |', '| clone | ' + c.map((r) => r[1]?.toFixed(3)).join(' | ') + ' |');
}
await b.close();
ensureDir(RUNS_DIR);
fs.writeFileSync(`${RUNS_DIR}report-timing-${vp}.md`, out.join('\n') + '\n');
console.log(out.join('\n'));
