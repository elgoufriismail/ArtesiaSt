// FAQ accordion interaction recorder (o = live original, c = clone): performs a click script on the item headers and
// records every animation frame: per item [card height, card transform scaleY, answer opacity, icon rotation°,
// card top relative to the list], plus the section height and the helper-text top (left column, space-between).
// Script: comma list of <item index>[@<delay ms after previous click>], e.g. "1,1@1500,0@1500" or rapid "1,1@80,1@80".
// Usage: node tools/compare/faq-accordion.mjs <o|c> <WxH> <script> <out.json> [recordMsAfterLast=1400]
import fs from 'node:fs';
import { launch, ORIGINAL_URL, CLONE_URL, parseVp } from '../recon/lib.mjs';

const [site, vp, script, out, tail = '1400'] = process.argv.slice(2);
const [W, H] = parseVp(vp);
const steps = script.split(',').map((s) => { const [i, d] = s.split('@'); return { i: +i, d: d ? +d : 0 }; });
const b = await launch();
const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 810, isMobile: W < 810 });
const p = await ctx.newPage();
await p.goto(site === 'o' ? ORIGINAL_URL : CLONE_URL, { waitUntil: 'networkidle', timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.addStyleTag({ content: '#__framer-badge-container{display:none!important}' });
await p.evaluate((o) => {
  const S = o ? [...document.querySelectorAll('[data-framer-name="FAQ"]')].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector('[data-ref="FAQ"]');
  window.__S = S;
  S.scrollIntoView({ block: 'start' });
}, site === 'o');
await p.waitForTimeout(2500);   // appears settle
const sample = () => p.evaluate((o) => {
  const S = window.__S; const R = S.getBoundingClientRect();
  const cards = o ? [...S.querySelectorAll('[data-framer-name="Open"], [data-framer-name="Closed"]')].filter((e) => e.getBoundingClientRect().width > 0) : [...S.querySelectorAll('[data-faq-card]')].filter((e) => e.getBoundingClientRect().width > 0);
  const listTop = cards[0].getBoundingClientRect().top;
  const rot = (e) => { const m = new DOMMatrixReadOnly(getComputedStyle(e).transform === 'none' ? undefined : getComputedStyle(e).transform); return +(Math.atan2(m.b, m.a) * 180 / Math.PI).toFixed(1); };
  const items = cards.map((c) => {
    const vis = o ? c.querySelector('[data-framer-name="Visible Text"]') : c.querySelector('[data-faq-visible]');
    const ans = vis.querySelectorAll('p')[1].parentElement;
    const icon = o ? vis.children[1] : c.querySelector('[data-faq-icon]');   // original: the icon wrapper carries the rotation
    const r = c.getBoundingClientRect(); const m = new DOMMatrixReadOnly(getComputedStyle(c).transform === 'none' ? undefined : getComputedStyle(c).transform);
    return [+r.height.toFixed(1), +m.d.toFixed(3), +(+getComputedStyle(ans).opacity).toFixed(3), rot(icon), +(r.top - listTop).toFixed(1)];
  });
  const helper = o ? [...S.querySelectorAll('p')].filter((e) => e.getBoundingClientRect().width > 0 && !e.closest('[data-framer-name="Open"],[data-framer-name="Closed"]') && !e.closest('a')).at(-1) : S.querySelector('[data-faq-helper]');
  return { sec: +R.height.toFixed(1), helper: +(helper.getBoundingClientRect().top - R.top).toFixed(1), items };
}, site === 'o');
const header = (i) => p.evaluate(([o, i]) => {
  const S = window.__S;
  const cards = o ? [...S.querySelectorAll('[data-framer-name="Open"], [data-framer-name="Closed"]')].filter((e) => e.getBoundingClientRect().width > 0) : [...S.querySelectorAll('[data-faq-card]')].filter((e) => e.getBoundingClientRect().width > 0);
  const c = cards[i]; if (c.getBoundingClientRect().bottom > innerHeight - 10 || c.getBoundingClientRect().top < 80) c.scrollIntoView({ block: 'center' });
  const r = c.getBoundingClientRect(); return [r.left + 40, r.top + 30];
}, [site === 'o', i]);
const rec = { initial: await sample(), clicks: [] };
// record frames in-page for the whole script duration
await p.evaluate(() => { window.__frames = []; window.__t0 = performance.now(); });
const pageSample = async () => ({ t: +(await p.evaluate(() => performance.now() - window.__t0)).toFixed(1), ...(await sample()) });
const frames = [];
let stop = false;
const loop = (async () => { while (!stop) { frames.push(await pageSample()); } })();
for (const s of steps) {
  if (s.d) await p.waitForTimeout(s.d);
  const [x, y] = await header(s.i);
  const t = await p.evaluate(() => performance.now() - window.__t0);
  if (W < 810) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y);
  rec.clicks.push({ item: s.i, t: +t.toFixed(1) });
}
await p.waitForTimeout(+tail);
stop = true; await loop;
rec.frames = frames;
rec.final = await sample();
fs.writeFileSync(out, JSON.stringify(rec));
console.log(`${site} ${vp} script ${script}: ${frames.length} frames · clicks at ${rec.clicks.map((c) => `${c.item}@${c.t.toFixed(0)}`).join(' ')}`);
console.log(`  initial: sec ${rec.initial.sec} helper ${rec.initial.helper} items ${rec.initial.items.map((i) => `${i[0]}/${i[2]}/${i[3]}°`).join(' ')}`);
console.log(`  final:   sec ${rec.final.sec} helper ${rec.final.helper} items ${rec.final.items.map((i) => `${i[0]}/${i[2]}/${i[3]}°`).join(' ')}`);
await b.close();
