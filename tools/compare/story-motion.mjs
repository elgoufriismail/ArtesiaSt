// Story A/B (B12 drift + B4 parallax): settled transforms of each story's image links and imgs, sampled
// from −1.5 vh to +2.6 vh around that story's first image, original vs clone.
// Usage: node tools/compare/story-motion.mjs [vp …]
import { launch, CLONE_URL, ORIGINAL_URL, VIEWPORTS, parseVp } from '../recon/lib.mjs';
const vps = process.argv.slice(2).length ? process.argv.slice(2) : VIEWPORTS;
const b = await launch();
const layoutTop = (a) => { const s = getComputedStyle(a).transform; return a.getBoundingClientRect().top + scrollY - (s === 'none' ? 0 : new DOMMatrix(s).m42); };
for (const vp of vps) {
  const [W, H] = parseVp(vp);
  const res = {};
  for (const [t, url] of [['o', ORIGINAL_URL], ['c', CLONE_URL]]) {
    const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(2000);
    const sel = t === 'o' ? 'a[data-framer-name="Image 1"], a[data-framer-name="Image 2"]' : 'a[data-ref$="/Images/Image 1"], a[data-ref$="/Images/Image 2"]';
    // stories = links grouped by gap (> 1.5 vh apart ⇒ new story)
    const tops = await p.evaluate(({ sel, lt }) => { const f = eval(lt); return [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().width > 0).map(f).sort((a, b) => a - b); }, { sel, lt: layoutTop.toString() });
    let stories = []; for (const tp of tops) { const g = stories.at(-1); if (g && tp - g.at(-1) < 1.5 * H) g.push(tp); else stories.push([tp]); }
    if (t === 'c') stories = await p.evaluate(({ sel, lt }) => { const f = eval(lt); const m = {}; [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().width > 0).forEach((e) => { const k = e.dataset.ref.split('/')[0]; (m[k] ||= []).push(f(e)); }); return Object.keys(m).sort().map((k) => m[k].sort((a, b) => a - b)); }, { sel, lt: layoutTop.toString() });
    res[t] = [];
    for (const g of stories) {
      const rows = [];
      for (let k = -1.5; k <= 2.6; k += 0.25) {
        const y = Math.max(0, Math.round(g[0] + k * H));
        await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(400);
        rows.push(await p.evaluate(({ sel, lt, lo, hi }) => { const f = eval(lt); return [...document.querySelectorAll(sel)].filter((e) => e.getBoundingClientRect().width > 0 && f(e) >= lo && f(e) <= hi).sort((a, b) => f(a) - f(b))
          .map((a) => { const m = (e) => { const s = getComputedStyle(e).transform; return s === 'none' ? 0 : new DOMMatrix(s).m42; }; return [m(a), m(a.querySelector('img'))]; }); }, { sel, lt: layoutTop.toString(), lo: g[0] - 2, hi: g.at(-1) + 2 }));
      }
      res[t].push(rows);
    }
    await p.context().close();
  }
  const msg = res.o.map((rows, s) => { let mx = 0, clamp = 0; rows.forEach((row, i) => row.forEach((v, j) => { const c = res.c[s]?.[i]?.[j]; if (!c) { mx = Infinity; return; } mx = Math.max(mx, Math.abs(v[0] - c[0]), Math.abs(v[1] - c[1])); })); return `story ${'AB'[s]} (${rows[0].length} img) max |Δ| ${mx.toFixed(3)}px`; });
  console.log(`${vp.padEnd(9)} stories o${res.o.length}/c${res.c.length} · ${msg.join(' · ')}`);
}
await b.close();
