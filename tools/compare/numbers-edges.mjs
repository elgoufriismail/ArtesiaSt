// Numbers slide trigger edge (section top 4…0 px below the fold) and the jump-past case, o vs c.
// Usage: node tools/compare/numbers-edges.mjs <WxH>
import { launch, ORIGINAL_URL, CLONE_URL, parseVp } from '../recon/lib.mjs';
const [vp] = process.argv.slice(2); const [W, H] = parseVp(vp);
const b = await launch();
const sec = (o) => (o ? [...document.querySelectorAll('[data-framer-name="Numbers"]')].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector('[data-ref="Numbers"]'));
for (const [t, url] of [['o', ORIGINAL_URL], ['c', CLONE_URL]]) {
  const out = [];
  for (const below of [4, 3, 2, 1, 0]) {   // section top this many px below the fold (fractional part kept)
    const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(1800);
    out.push(await p.evaluate(async ([o, below, H, secSrc]) => { const S = eval(`(${secSrc})`)(o); const c0 = S.querySelector(o ? '[data-framer-name="Counter Container"]' : '[data-counter]');
      const top = S.getBoundingClientRect().top + scrollY; scrollTo(0, Math.floor(top - H - below)); await new Promise((q) => setTimeout(q, 1500));
      return `${(S.getBoundingClientRect().top).toFixed(1)}→${(+getComputedStyle(c0.children[0]).opacity).toFixed(0)}`; }, [t === 'o', below, H, sec.toString()]));
    await p.context().close();
  }
  // jump from the top straight past the section (its bottom 300 px above the viewport top), then sample
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(1800);
  const past = await p.evaluate(async ([o, secSrc]) => { const S = eval(`(${secSrc})`)(o); const c0 = S.querySelector(o ? '[data-framer-name="Counter Container"]' : '[data-counter]'); const n = c0.children[0];
    const bottom = S.getBoundingClientRect().bottom + scrollY; scrollTo(0, Math.round(bottom + 300)); const s = []; const t0 = performance.now();
    await new Promise((res) => { const f = (t) => { s.push(`${Math.round(t - t0)}:${(+getComputedStyle(n).opacity).toFixed(2)}/${new DOMMatrixReadOnly(getComputedStyle(n).transform === 'none' ? undefined : getComputedStyle(n).transform).m42.toFixed(0)}`); if (t - t0 < 1300) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
    return s.filter((_, i) => i % 6 === 0).join(' '); }, [t === 'o', sec.toString()]);
  await p.context().close();
  console.log(`${vp} ${t}: edge (section top→slide opacity) ${out.join('  ')}\n     past-jump samples (ms:opacity/y) ${past}`);
}
await b.close();
