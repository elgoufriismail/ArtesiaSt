// Numbers B8 slide (desktop): rAF recording of the 4 number + 4 label wrappers after the row enters (pre-scrolled just
// below the fold), then leave and re-enter to show it plays once. Usage: node tools/compare/numbers-slide.mjs <o|c> <WxH> [sectionTopAt=850] [out.json]
import fs from 'node:fs';
import { launch, ORIGINAL_URL, CLONE_URL, parseVp } from '../recon/lib.mjs';
const [site, vp, relTop = '850', out] = process.argv.slice(2); const [W, H] = parseVp(vp);
const b = await launch(); const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
await p.goto(site === 'o' ? ORIGINAL_URL : CLONE_URL, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(2500);
await p.evaluate((o) => { const S = o ? [...document.querySelectorAll('[data-framer-name="Numbers"]')].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector('[data-ref="Numbers"]');
  const cs = [...S.querySelectorAll(o ? '[data-framer-name="Counter Container"]' : '[data-ref$="Counter Container"], [data-ref*="Counter Container#"]')].filter((e) => e.getBoundingClientRect().width > 0);
  window.__els = cs.flatMap((c) => [c.children[0], c.children[1]]); window.__S = S; }, site === 'o');
const rec = async (y) => p.evaluate(async (y) => { const els = window.__els; const rows = []; const t0 = performance.now(); scrollTo(0, y);
  await new Promise((res) => { const f = (t) => { rows.push([+(t - t0).toFixed(1), ...els.map((e) => { const cs = getComputedStyle(e); return [+(+cs.opacity).toFixed(4), +new DOMMatrixReadOnly(cs.transform === 'none' ? undefined : cs.transform).m42.toFixed(3)]; })]); if (t - t0 < 1600) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); }); return rows; }, y);
const top = await p.evaluate(() => window.__S.getBoundingClientRect().top + scrollY);
await p.evaluate((y) => scrollTo(0, y), Math.round(top - H - 60)); await p.waitForTimeout(2000);   // just below the fold: not triggered yet
const first = await rec(Math.round(top - +relTop));
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1500);
const atTop = await p.evaluate(() => window.__els.map((e) => +getComputedStyle(e).opacity));
const again = await rec(Math.round(top - +relTop));
if (out) fs.writeFileSync(out, JSON.stringify({ first, again, atTop }));
const show = (rows) => rows.filter((r, i) => i % 3 === 0).slice(0, 30).map((r) => `${r[0]}ms ${r.slice(1).map(([o, y]) => `${o.toFixed(2)}/${y.toFixed(1)}`).join(' ')}`).join('\n');
console.log(`${site} ${vp}: ${await p.evaluate(() => window.__els.length)} elements (number, label per counter)\nFIRST ENTRY\n${show(first)}\nopacity after scrolling away: ${atTop.join(' ')}\nRE-ENTRY first frames:\n${show(again.slice(0, 12))}`);
await b.close();
