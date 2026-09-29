// Nav theme (B10) switch points, original vs clone: for each boundary (dark-nav-1, Big Quote top/bottom, footer-menu),
// scroll so the boundary sits at viewport y = d (4 px steps, both directions) and sample the nav pill colour.
// Usage: node tools/compare/nav-theme.mjs [vp]
import { launch, ORIGINAL_URL, CLONE_URL, parseVp } from '../recon/lib.mjs';
import { PNG } from 'pngjs';
const [vp = '1440x900'] = process.argv.slice(2); const [W, H] = parseVp(vp);
const b = await launch();
for (const [site, url] of [['o', ORIGINAL_URL], ['c', CLONE_URL]]) {
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(3000);
  const box = await p.evaluate(() => { const c = [...document.querySelectorAll('a')].filter((a) => /book a session/i.test(a.innerText) && a.getBoundingClientRect().top < 60 && a.getBoundingClientRect().width > 100); const r = c[0].getBoundingClientRect(); return { x: Math.round(r.left + 8), y: Math.round(r.top + r.height / 2 - 1), width: 6, height: 2 }; });
  const B = await p.evaluate((o) => { const big = (n) => o ? [...document.querySelectorAll(`[data-framer-name="${n}"]`)].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector(`[data-ref="${n}"]`); const mk = (n) => o ? document.querySelector(`[data-framer-name="${n}"]`) : document.querySelector(`[data-marker="${n}"]`); const t = (e) => e.getBoundingClientRect().top + scrollY;
    const q = big('Big Quote'); return { 'dark-nav-1': t(mk('dark-nav-1')), 'BigQuote top': t(q), 'BigQuote bottom': t(q) + q.getBoundingClientRect().height, 'footer-menu': t(mk('footer-menu')) }; }, site === 'o');
  const res = [];
  for (const [name, P] of Object.entries(B)) {
    const sw = [];
    for (const dir of ['down', 'up']) { const ds = []; for (let d = 100; d >= -140; d -= 4) ds.push(d); if (dir === 'up') ds.reverse(); let last = null;
      for (const d of ds) { await p.evaluate((y) => scrollTo(0, y), P - d); await p.waitForTimeout(420); const png = PNG.sync.read(await p.screenshot({ clip: box })); const t = png.data[0] > 220 && png.data[1] > 220 ? 'L' : 'D'; if (last !== null && t !== last) sw.push(`${dir}: ${last}→${t} at boundary viewport-y ${d}`); last = t; } }
    res.push(`${name} (doc ${P.toFixed(1)}): ${sw.join(' ; ')}`);
  }
  console.log(site, '\n  ' + res.join('\n  '));
  await p.context().close(); }
await b.close();
