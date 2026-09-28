// B13 footer background, section-relative (independent of the sections above the footer): bg top − footer top vs rel = scrollY − (footer top − vh), down then up.
// Usage: node tools/compare/footer-parallax-rel.mjs <WxH …>
import { launch, ORIGINAL_URL, CLONE_URL, parseVp } from '../recon/lib.mjs';
const b = await launch();
for (const vp of process.argv.slice(2)) { const [W, H] = parseVp(vp); const res = {};
  for (const [t, url] of [['o', ORIGINAL_URL], ['c', CLONE_URL]]) {
    const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(1500);
    const info = await p.evaluate((o) => { const F = o ? [...document.querySelectorAll('[data-framer-name="Footer Container"]')].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector('[data-ref="Footer Container"]');
      const bg = o ? F.querySelector('[data-framer-name="Footer Background Image"]') : F.querySelector('[data-ref$="Footer Background Image"]'); window.__F = F; window.__bg = bg;
      return { top: F.getBoundingClientRect().top + scrollY, max: document.documentElement.scrollHeight - innerHeight, hasBg: !!bg && bg.getBoundingClientRect().height > 0 }; }, t === 'o');
    const rows = [];
    if (info.hasBg) { const ys = []; for (let r = -200; info.top - H + r <= info.max; r += 50) ys.push(r); ys.push(Math.round(info.max - info.top + H));
      for (const dir of ['down', 'up']) for (const r of (dir === 'down' ? ys : [...ys].reverse())) { await p.evaluate((y) => scrollTo(0, y), Math.round(info.top - H + r)); await p.waitForTimeout(250);
        rows.push([dir, r, await p.evaluate(() => +(window.__bg.getBoundingClientRect().top - window.__F.getBoundingClientRect().top).toFixed(2))]); } }
    res[t] = { info, rows }; await p.context().close();
  }
  if (!res.o.info.hasBg || !res.c.info.hasBg) { console.log(`${vp}: background layer shown — o ${res.o.info.hasBg} · c ${res.c.info.hasBg}`); continue; }
  let mx = 0, at = null; const byKey = (rows) => new Map(rows.map(([d, r, v]) => [`${d}${r}`, v]));
  const mo = byKey(res.o.rows), mc = byKey(res.c.rows);
  for (const [k, v] of mo) if (mc.has(k)) { const d = Math.abs(v - mc.get(k)); if (d > mx) { mx = d; at = k; } }
  const span = (rows) => `${Math.min(...rows.map((r) => r[2]))} … ${Math.max(...rows.map((r) => r[2]))}`;
  console.log(`${vp}: bg offset range o ${span(res.o.rows)} · c ${span(res.c.rows)} · max|Δ| at identical relative scroll ${mx.toFixed(2)} px (@${at}) over ${mo.size} samples`);
}
await b.close();
