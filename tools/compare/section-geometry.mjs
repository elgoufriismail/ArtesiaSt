// Section-relative geometry: original named Framer layers vs clone [data-ref] paths inside one section,
// both measured relative to the section's own box (so page-order/stub differences don't matter).
// Paths follow tools/recon/lib.mjs dumpNamed (named ancestors joined by "/", repeated siblings "#n").
// Usage: node tools/compare/section-geometry.mjs "<section name>" [vp …] [--tol=1] [--scroll=<px from section top>]
import { launch, CLONE_URL, ORIGINAL_URL, VIEWPORTS, parseVp } from '../recon/lib.mjs';

const args = process.argv.slice(2);
const sec = args[0];
const tol = Number((args.find((a) => a.startsWith('--tol=')) || '--tol=1').split('=')[1]);
const scroll = Number((args.find((a) => a.startsWith('--scroll=')) || '--scroll=0').split('=')[1]);
const vps = args.slice(1).filter((a) => !a.startsWith('--'));

const collect = ({ sec, isOriginal, scroll }) => {
  const attr = isOriginal ? 'data-framer-name' : 'data-ref';
  const root = [...document.querySelectorAll(`[${attr}="${sec}"]`)].sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
  if (!root) return null;
  window.scrollTo(0, root.getBoundingClientRect().top + scrollY + scroll);
  const R = root.getBoundingClientRect();
  const out = {};
  const seen = new Map();
  const walk = (el, prefix) => {
    if (getComputedStyle(el).display === 'none') return;
    const name = el.getAttribute(attr)?.replace(/\s+/g, ' ') || null;
    let next = prefix;
    if (name) {
      let path = isOriginal ? (prefix ? `${prefix}/${name}` : name) : name;
      const n = (seen.get(path) || 0) + 1; seen.set(path, n);
      if (n > 1) path += `#${n}`;
      next = path;
      const r = el.getBoundingClientRect();
      if (r.width > 0 || r.height > 0) out[path] = [r.left - R.left, r.top - R.top, r.width, r.height].map((v) => +v.toFixed(2));
    }
    [...el.children].forEach((c) => walk(c, next));
  };
  walk(root, '');
  return out;
};

const b = await launch();
let worst = 0;
for (const vp of vps.length ? vps : VIEWPORTS) {
  const [W, H] = parseVp(vp);
  const got = {};
  for (const [t, url] of [['o', ORIGINAL_URL], ['c', CLONE_URL]]) {
    const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500); // on-load entrances settle
    got[t] = await p.evaluate(collect, { sec, isOriginal: t === 'o', scroll });
    await p.context().close();
  }
  const rows = []; let mx = 0; const missing = [];
  for (const [path, o] of Object.entries(got.o || {})) {
    const c = got.c?.[path];
    if (!c) { missing.push(path); continue; }
    const d = Math.max(...o.map((v, i) => Math.abs(v - c[i])));
    mx = Math.max(mx, d);
    if (d > tol) rows.push(`   ${d.toFixed(1).padStart(6)}  ${path}  o[${o.join(', ')}] c[${c.join(', ')}]`);
  }
  const extra = Object.keys(got.c || {}).filter((p) => !(p in (got.o || {})));
  worst = Math.max(worst, mx);
  console.log(`${vp.padEnd(9)} ${Object.keys(got.o || {}).length} layers · max |Δ| ${mx.toFixed(2)} px · ${rows.length} over ${tol} px · missing in clone ${missing.length} · clone-only ${extra.length}`);
  rows.forEach((r) => console.log(r));
  if (missing.length) console.log(`   missing: ${missing.join(' | ')}`);
  if (extra.length) console.log(`   clone-only: ${extra.join(' | ')}`);
}
await b.close();
process.exitCode = worst > tol ? 1 : 0;
