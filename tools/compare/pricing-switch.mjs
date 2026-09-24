// Pricing Monthly/Yearly switch: rAF-sampled transition after a real tap (o = original, c = clone), forward then back.
// Columns: t, knob x, track colour, Monthly label colour, Yearly label colour, 3 NumberFlow host widths, 3 suffix x.
// Usage: node tools/compare/pricing-switch.mjs <o|c> <WxH> <out.json>   (compare two recordings with pricing-switch-cmp.mjs)
import fs from 'node:fs';
import { launch, ORIGINAL_URL, CLONE_URL, parseVp } from '../recon/lib.mjs';
const [site, vp, out] = process.argv.slice(2);
const [W, H] = parseVp(vp);
const b = await launch(); const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
await p.goto(site === 'o' ? ORIGINAL_URL : CLONE_URL, { waitUntil: 'networkidle', timeout: 60000 });
await p.addStyleTag({ content: '*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}' });
const attr = site === 'o' ? 'data-framer-name' : 'data-ref';
await p.evaluate((attr) => { const s = [...document.querySelectorAll(`[${attr}]`)].filter((e) => e.getAttribute(attr) === 'Pricing').sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0]; window.__sec = s; window.scrollTo(0, s.getBoundingClientRect().top + scrollY + 300); }, attr);
await p.waitForTimeout(2000);
const arm = () => p.evaluate((site) => {
  const s = window.__sec;
  const q = (sel) => [...s.querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0);
  const base = site === 'o' ? q('[data-framer-name="Base"]') : q('[data-ref$="/Base"]');
  const knob = base.firstElementChild;
  const tog = site === 'o' ? q('[data-framer-name^="Toggle "]') : q('[data-ref*="/Toggle O"]');
  const labels = [tog.querySelector('p'), [...tog.querySelectorAll('p')].at(-1)];
  const nfs = [...s.querySelectorAll('number-flow-react')].filter((e) => e.getBoundingClientRect().width > 0);
  const suffix = nfs.map((n) => n.parentElement.parentElement.nextElementSibling);
  const sample = (t) => [+t.toFixed(1), +(knob.getBoundingClientRect().left - base.getBoundingClientRect().left).toFixed(2), getComputedStyle(base).backgroundColor, getComputedStyle(labels[0]).color, getComputedStyle(labels[1]).color, ...nfs.map((n) => +n.getBoundingClientRect().width.toFixed(2)), ...suffix.map((x) => +x.getBoundingClientRect().left.toFixed(2))];
  window.__rows = [];
  const r = base.getBoundingClientRect(); window.__pt = [r.left + r.width / 2, r.top + r.height / 2];
  window.__done = new Promise((resolve) => {
    let t0 = null; window.__rows.push(sample(0));
    addEventListener('pointerdown', () => { t0 = performance.now(); }, { once: true, capture: true });
    const f = (t) => { if (t0 !== null) window.__rows.push(sample(t - t0)); if (t0 === null || t - t0 < 1400) requestAnimationFrame(f); else resolve(); };
    requestAnimationFrame(f);
  });
  return window.__pt;
}, site);
const rec = async () => { const pt = await arm(); await p.mouse.click(pt[0], pt[1]); await p.mouse.move(5, 5); await p.evaluate(() => window.__done); return p.evaluate(() => window.__rows); };
const fwd = await rec(); await p.waitForTimeout(600); const back = await rec();
fs.writeFileSync(out, JSON.stringify({ fwd, back }));
for (const [n, rows] of [['fwd', fwd], ['back', back]]) { console.log(`== ${n}`); rows.filter((r, i) => i < 5 || i % 5 === 0 || i === rows.length - 1).forEach((r) => console.log(r.join(' | '))); }
await b.close();
