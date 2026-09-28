// Numbers count-up, o vs c: start values, first change, time each counter reaches its end value, value at 600 ms.
// Usage: node tools/compare/numbers-count.mjs <WxH …>
import { launch, ORIGINAL_URL, CLONE_URL, parseVp } from '../recon/lib.mjs';
const b = await launch();
for (const vp of process.argv.slice(2)) { const [W, H] = parseVp(vp); const res = {};
  for (const [t, url] of [['o', ORIGINAL_URL], ['c', CLONE_URL]]) {
    const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(2000);
    res[t] = await p.evaluate(async ([o, H]) => { const S = o ? [...document.querySelectorAll('[data-framer-name="Numbers"]')].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector('[data-ref="Numbers"]');
      const cs = [...S.querySelectorAll(o ? '[data-framer-name="Counter Container"]' : '[data-counter]')].filter((e) => e.getBoundingClientRect().width > 0);
      const shown = cs.map((c) => c.children[0].querySelectorAll('p')[1]);
      const val = () => shown.map((e) => parseInt(e.textContent.replace(/,/g, ''), 10));
      // put the whole section in view in one jump from just below the fold
      const top = S.getBoundingClientRect().top + scrollY; scrollTo(0, top - H - 60); await new Promise((q) => setTimeout(q, 1500));
      const start = val(); const firstChange = shown.map(() => null), done = shown.map(() => null); const mid = [];
      const t0 = performance.now(); scrollTo(0, top - H + Math.min(S.offsetHeight, H) - 20);
      await new Promise((res) => { const f = (t) => { const v = val(), dt = t - t0; v.forEach((x, i) => { if (firstChange[i] === null && x !== start[i]) firstChange[i] = Math.round(dt); if (done[i] === null && x === [450, 80, 9, 25][i]) done[i] = Math.round(dt); }); if (dt >= 600 && !mid.length) mid.push(...v); if (dt < 2200) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
      return { start, firstChange, done, mid, end: val() }; }, [t === 'o', H]);
    await p.context().close();
  }
  const f = (r) => `start ${r.start.join('/')} · first change ${r.firstChange.join('/')} ms · final reached ${r.done.join('/')} ms · value at 600 ms ${r.mid.join('/')} · end ${r.end.join('/')}`;
  console.log(`== ${vp}\n  o ${f(res.o)}\n  c ${f(res.c)}`);
}
await b.close();
