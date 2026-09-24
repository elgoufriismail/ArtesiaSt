// Pricing NumberFlow: every shadow-root WAAPI animation started by a real tap (forward and back), original vs clone:
// keyframes (digit spin deltas, translateX, width vars), duration, delay, easing, composite, start time after the tap.
// Usage: node tools/compare/pricing-numberflow.mjs [WxH]
import { launch, ORIGINAL_URL, CLONE_URL, parseVp } from '../recon/lib.mjs';
const [W, H] = parseVp(process.argv[2] || '1440x900');
const b = await launch();
const capture = async (site) => {
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto(site === 'o' ? ORIGINAL_URL : CLONE_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await p.addStyleTag({ content: '*{backdrop-filter:none!important}' });
  const attr = site === 'o' ? 'data-framer-name' : 'data-ref';
  await p.evaluate((attr) => { const s = [...document.querySelectorAll(`[${attr}="Pricing"]`)].sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0]; window.__sec = s; window.scrollTo(0, s.getBoundingClientRect().top + scrollY + 300); }, attr);
  await p.waitForTimeout(2000);
  const out = [];
  for (const dir of ['fwd', 'back']) {
    const pt = await p.evaluate((site) => { const b = [...window.__sec.querySelectorAll(site === 'o' ? '[data-framer-name="Base"]' : '[data-ref$="/Base"]')].find((e) => e.getBoundingClientRect().width > 0); const r = b.getBoundingClientRect();
      window.__A = []; const seen = new Set(); let t0 = null; addEventListener('pointerdown', () => { t0 = performance.now(); }, { once: true, capture: true });
      window.__done = new Promise((res) => { const f = () => { const nfs = [...window.__sec.querySelectorAll('number-flow-react')].filter((e) => e.getBoundingClientRect().width > 0);
        nfs.forEach((e, i) => e.shadowRoot.getAnimations().forEach((a) => { if (seen.has(a)) return; seen.add(a); const t = a.effect.getTiming(); const tg = a.effect.target;
          window.__A.push({ nf: i, at: t0 === null ? null : +(performance.now() - t0).toFixed(0), part: tg.getAttribute('part') || tg.getAttribute('class'), style: tg.getAttribute('style'), dur: t.duration, delay: t.delay, easing: t.easing, comp: a.effect.composite, kf: JSON.stringify(a.effect.getKeyframes().map(({ computedOffset, offset, easing, composite, ...k }) => k)) }); }));
        if (t0 === null || performance.now() - t0 < 1300) requestAnimationFrame(f); else res(); }; requestAnimationFrame(f); });
      return [r.left + r.width / 2, r.top + r.height / 2]; }, site);
    await p.mouse.click(pt[0], pt[1]); await p.mouse.move(5, 5);
    await p.evaluate(() => window.__done);
    out.push(...(await p.evaluate(() => window.__A)).map((a) => ({ ...a, dir })));
    await p.waitForTimeout(600);
  }
  await p.context().close();
  return out;
};
const O = await capture('o'), C = await capture('c');
const key = (a) => `${a.dir} nf${a.nf} ${a.part} ${a.style ?? ''} ${a.kf}`;
const om = new Map(O.map((a) => [key(a), a])), cm = new Map(C.map((a) => [key(a), a]));
let same = 0; const diffs = [];
for (const [k, a] of om) { const c = cm.get(k); if (!c) { diffs.push(`only original: ${k}`); continue; } if (c.dur !== a.dur || c.delay !== a.delay || c.easing !== a.easing || c.comp !== a.comp) diffs.push(`timing differs: ${k} o ${a.dur}/${a.delay}/${a.comp}/${a.easing.slice(0, 30)} c ${c.dur}/${c.delay}/${c.comp}/${c.easing.slice(0, 30)}`); else same++; }
for (const k of cm.keys()) if (!om.has(k)) diffs.push(`only clone: ${k}`);
const st = (arr, dir) => { const t = arr.filter((a) => a.dir === dir).map((a) => a.at); return `${Math.min(...t)}–${Math.max(...t)} ms`; };
console.log(`${W}x${H}: original ${O.length} animations, clone ${C.length}; identical (keyframes, target, duration, delay, easing, composite): ${same}`);
console.log(`start after tap — fwd: o ${st(O, 'fwd')} c ${st(C, 'fwd')} · back: o ${st(O, 'back')} c ${st(C, 'back')}`);
diffs.slice(0, 20).forEach((d) => console.log('  ' + d.slice(0, 260)));
await b.close();
