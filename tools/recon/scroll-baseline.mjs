// Scroll-track baseline of the LIVE original (consumed by tools/compare/motion.mjs and tests/unit/scroll-math.test.ts).
// Protocol (same as the first recon): load, settle, then instant scrollTo in `step` px increments down to the bottom
// with `wait` ms after each, then back up in 4·step increments. Every element whose inline style (or, for SVG paths
// with a dash array, its computed stroke-dashoffset) changes is recorded as [scrollY, value] at each change.
// Names: the element's data-framer-name, else "<nearest named ancestor>><tag>" (+ ":<first 14 chars>" for text).
// Usage: node tools/recon/scroll-baseline.mjs <WxH> [--step=50] [--wait=300] [--out=<file>]
import fs from 'node:fs';
import { launch, ORIGINAL_URL, REF_DIR, parseVp } from './lib.mjs';

const args = process.argv.slice(2);
const vp = args.find((a) => !a.startsWith('--'));
const opt = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) || `--${k}=${d}`).split('=').slice(1).join('=');
const step = Number(opt('step', 50)), wait = Number(opt('wait', 300));
const out = opt('out', `${REF_DIR}animations/scroll-${vp}.json`);
const [W, H] = parseVp(vp);
const b = await launch();
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
await p.goto(ORIGINAL_URL, { waitUntil: 'networkidle', timeout: 60000 });
await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(4000);   // load-time entrances settle
await p.evaluate(() => {
  const all = [...document.body.querySelectorAll('*')].filter((e) => !['SCRIPT', 'STYLE', 'LINK', 'META'].includes(e.tagName));
  const name = (e) => { const n = e.getAttribute('data-framer-name'); if (n) return n.replace(/\s+/g, ' ');
    const a = e.parentElement?.closest('[data-framer-name]'); const tag = e.tagName.toLowerCase();
    const txt = tag === 'img' || tag === 'path' || tag === 'svg' ? '' : (e.textContent || '').trim().slice(0, 14);
    return `${a ? a.getAttribute('data-framer-name').replace(/\s+/g, ' ') : 'body'}>${tag}${txt ? `:${txt}` : ''}`; };
  const value = (e) => {
    if (e.tagName.toLowerCase() === 'path') { const cs = getComputedStyle(e); if (cs.strokeDasharray && cs.strokeDasharray !== 'none') return `strokeDashoffset:${parseFloat(cs.strokeDashoffset)} ; dash:${parseFloat(cs.strokeDasharray)}`; }
    const s = e.getAttribute('style'); if (!s) return '';
    return s.split(';').map((d) => d.trim()).filter(Boolean).map((d) => { const i = d.indexOf(':'); return `${d.slice(0, i).trim()}:${d.slice(i + 1).trim()}`; }).join(' ; ');
  };
  window.__rec = { all, name, value, last: all.map(value), tracks: all.map((e, i) => [[0, value(e)]]), changes: all.map(() => 0),
    docTop: all.map((e) => Math.round(e.getBoundingClientRect().top + scrollY)) };
});
const sample = () => p.evaluate(() => { const R = window.__rec; const y = Math.round(scrollY);
  R.all.forEach((e, i) => { const v = R.value(e); if (v !== R.last[i]) { R.tracks[i].push([y, v]); R.last[i] = v; R.changes[i]++; } }); });
const total = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
for (let y = 0; y <= total; y += step) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(wait); await sample(); }
for (let y = total; y >= 0; y -= 4 * step) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(wait); await sample(); }
const elements = await p.evaluate(() => { const R = window.__rec;
  return R.all.map((e, i) => ({ pid: i, name: R.name(e), docTop: R.docTop[i], changes: R.changes[i], track: R.tracks[i] })).filter((x) => x.changes > 0).sort((a, b) => a.docTop - b.docTop); });
fs.writeFileSync(out, JSON.stringify({ viewport: [W, H], step, wait, recorded: new Date().toISOString().slice(0, 10), source: ORIGINAL_URL,
  note: 'track entries: [scrollY, inline style]; second half is the reverse pass (scrolling up) in steps of 4*step', elements }));
console.log(`${vp}: ${elements.length} changing elements, scroll height ${total + H} → ${out}`);
await b.close();
