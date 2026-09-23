// Fit stand-in copy to the ORIGINAL's rendered line counts at every viewport.
// Usage: node tools/recon/text-fit.mjs <clone css selector> <original layer path prefix> <tag> "<candidate 1>" "<candidate 2>" …
// Original line counts come from docs/reconnaissance/reference/dom/nodes-<vp>.json (height / line-height).
import fs from 'node:fs';
import { CLONE_URL, REF_DIR, VIEWPORTS, launch, parseVp } from './lib.mjs';

const [sel, origName, tag, ...cands] = process.argv.slice(2);
const want = {};
for (const vp of VIEWPORTS) {
  const n = JSON.parse(fs.readFileSync(`${REF_DIR}dom/nodes-${vp}.json`, 'utf8'));
  const i = n.findIndex((x) => (x.name || '').replace(/\s+/g, ' ') === origName);
  const el = n.slice(i).find((x) => x.tag === tag && x.rect[3] > 0);
  const lh = parseFloat(el.st.lineHeight);
  want[vp] = Math.round(el.rect[3] / lh);
}
const b = await launch();
const res = Object.fromEntries(cands.map((c) => [c, []]));
for (const vp of VIEWPORTS) {
  const [W, H] = parseVp(vp);
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto(CLONE_URL, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  for (const c of cands) {
    const n = await p.evaluate(([sel, c]) => { const e = document.querySelector(sel); e.textContent = c; return Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)); }, [sel, c]);
    res[c].push(n === want[vp] ? '✓' : `✗${n}/${want[vp]}`);
  }
  await p.context().close();
}
await b.close();
console.log('target lines', JSON.stringify(want));
for (const [c, r] of Object.entries(res)) console.log(r.join(' '), `(${c.length})`, c.slice(0, 60) + '…');
