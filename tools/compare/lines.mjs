// Rendered line-count comparison for one section, original vs clone, at every viewport.
// Text elements (h1–h5, p; the original's nowrap/pre labels skipped) are paired by document order.
// Usage: [IDX=N] node tools/compare/lines.mjs "<original layer name>" "<clone data-ref>" [vp …]   (IDX: Nth same-named original section)
import { CLONE_URL, ORIGINAL_URL, VIEWPORTS, launch, parseVp } from '../recon/lib.mjs';

const [origName, cloneRef, ...vpArg] = process.argv.slice(2);
const vps = vpArg.length ? vpArg : VIEWPORTS;
const collect = ([attr, name, idx]) => {
  // names are compared whitespace-normalised (Framer layer names may contain NBSP); idx > 0 = Nth by document order
  const all = [...document.querySelectorAll(`[${attr}]`)].filter((e) => e.getAttribute(attr).replace(/\s+/g, ' ') === name && e.getBoundingClientRect().height > 0);
  const root = idx ? all.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[idx - 1] : all.sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
  if (!root) return [];
  return [...root.querySelectorAll('h1,h2,h3,h4,h5,p')].filter((e) => {
    const cs = getComputedStyle(e);
    return e.getBoundingClientRect().width > 0 && e.textContent.trim() && !/^(pre|nowrap)$/.test(cs.whiteSpace);
  }).map((e) => {
    // line-height may live on descendant spans (e.g. word-split statements with h4 line-height: normal)
    let lh = parseFloat(getComputedStyle(e).lineHeight);
    if (!Number.isFinite(lh)) { const d = [...e.querySelectorAll('*')].find((x) => Number.isFinite(parseFloat(getComputedStyle(x).lineHeight))); lh = d ? parseFloat(getComputedStyle(d).lineHeight) : NaN; }
    return [e.tagName, Math.round(e.getBoundingClientRect().height / lh), e.textContent.trim().slice(0, 24)];
  });
};
const b = await launch();
let bad = 0;
for (const vp of vps) {
  const [W, H] = parseVp(vp);
  const got = {};
  for (const [t, url, sel] of [['o', ORIGINAL_URL, ['data-framer-name', origName, Number(process.env.IDX || 0)]], ['c', CLONE_URL, ['data-ref', cloneRef, 0]]]) {
    const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await p.evaluate(() => document.fonts.ready);
    got[t] = await p.evaluate(collect, sel);
    await p.context().close();
  }
  const n = Math.max(got.o.length, got.c.length);
  const cells = [];
  for (let i = 0; i < n; i++) {
    const o = got.o[i], c = got.c[i];
    const ok = o && c && o[0] === c[0] && o[1] === c[1];
    if (!ok) bad++;
    cells.push(ok ? `✓${o[1]}` : `✗${o ? `${o[0]}${o[1]}` : '—'}/${c ? `${c[0]}${c[1]}` : '—'}${c ? ` «${c[2]}»` : ''}`);
  }
  console.log(`${vp.padEnd(9)} ${cells.join(' ')}`);
}
await b.close();
console.log(bad ? `${bad} mismatch(es)` : 'all line counts match');
process.exitCode = bad ? 1 : 0;
