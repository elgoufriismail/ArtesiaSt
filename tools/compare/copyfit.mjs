// Brute-force stand-in copy fitting: every combination of phrase alternatives is measured in-page on the clone
// at all 8 viewports; prints the combinations whose rendered line counts match the original's.
// Usage: node tools/compare/copyfit.mjs '<clone selector>' '<8 target line counts csv>' '<JSON [[alt, …], …]>' [nbspLastPair=1]
// Candidates containing '<' are set as innerHTML (e.g. paragraphs with an inline link).
import { launch, CLONE_URL, VIEWPORTS, parseVp } from '../recon/lib.mjs';
const [sel, wantS, partsJ, nb = '1'] = process.argv.slice(2); const want = wantS.split(',').map(Number); const parts = JSON.parse(partsJ);
let combos = [''];
for (const alts of parts) combos = combos.flatMap((c) => alts.map((a) => (c ? `${c} ${a}` : a)));
if (nb === '1') combos = combos.map((c) => c.replace(/ (\S+)$/, ' $1'));
const b = await launch(); const ok = combos.map(() => true); const got = combos.map(() => []);
for (const [j, vp] of VIEWPORTS.entries()) {
  const [W, H] = parseVp(vp);
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto(CLONE_URL, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(([sel, combos]) => { const h = document.querySelector(sel); const lh = parseFloat(getComputedStyle(h).lineHeight); return combos.map((c) => { if (c.includes("<")) h.innerHTML = c; else h.textContent = c; return Math.round(h.getBoundingClientRect().height / lh); }); }, [sel, combos]);
  r.forEach((n, i) => { got[i].push(n); if (n !== want[j]) ok[i] = false; });
  await p.context().close();
}
await b.close();
const hits = combos.filter((_, i) => ok[i]);
console.log(`${hits.length}/${combos.length} combinations match all 8 viewports`);
hits.slice(0, 8).forEach((h) => console.log(`(${h.length} ch) ${h}`));
if (!hits.length) {
  const score = got.map((g) => g.filter((n, j) => n === want[j]).length);
  const order = combos.map((_, i) => i).sort((a, b) => score[b] - score[a]).slice(0, 6);
  for (const i of order) console.log(`${score[i]}/8 got ${got[i].join(',')} want ${want.join(',')} (${combos[i].length} ch) ${combos[i].slice(0, 90)}`);
}
