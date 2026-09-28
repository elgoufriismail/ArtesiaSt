// Pricing price swap (live original since 2026-09-28: plain text, no NumberFlow): per real tap on the switch, the
// time from pointerdown to the frame in which the three prices change, and whether anything inside the price rows
// animates (running Web Animations / CSS transitions, or opacity / transform / filter changes) — o vs c.
// Taps alternate Monthly→Yearly / Yearly→Monthly; the first tap on a fresh page is reported separately
// (the original pays a one-off warm-up of ~250–330 ms on its first tap).
// Usage: node tools/compare/pricing-swap.mjs [vp …] [--taps=8]     (default 1440x900 1024x768 390x844)
import { launch, ORIGINAL_URL, CLONE_URL, parseVp } from '../recon/lib.mjs';

const args = process.argv.slice(2);
const vps = args.filter((a) => !a.startsWith('--'));
const taps = Number((args.find((a) => a.startsWith('--taps=')) || '--taps=8').slice(7));
const b = await launch();
let fail = 0;
for (const vp of vps.length ? vps : ['1440x900', '1024x768', '390x844']) {
  const [W, H] = parseVp(vp);
  const res = {};
  for (const [t, url] of [['o', ORIGINAL_URL], ['c', CLONE_URL]]) {
    const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(2500);
    await p.evaluate((o) => {
      const attr = o ? 'data-framer-name' : 'data-ref';
      window.__sec = [...document.querySelectorAll(`[${attr}]`)].filter((e) => e.getAttribute(attr) === 'Pricing').sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
    }, t === 'o');
    const rows = [];
    for (let k = 0; k < taps; k++) {
      const pt = await p.evaluate((o) => {
        const S = window.__sec; const vis = (e) => e.getBoundingClientRect().width > 0;
        const base = [...S.querySelectorAll(o ? '[data-framer-name="Base"]' : '[data-ref$="/Base"]')].find(vis);
        base.scrollIntoView({ block: 'center' });
        const priceRows = [...S.querySelectorAll(o ? '[data-framer-name="Price"]' : '[data-ref$="/Price"]')].filter(vis);
        const els = priceRows.flatMap((r) => [r, ...r.querySelectorAll('*')]);
        const text = () => priceRows.map((r) => r.textContent.replace(/\s+/g, '')).join(' ');
        const look = () => els.map((e) => { const cs = getComputedStyle(e); return `${cs.opacity}|${cs.transform}|${cs.filter}`; }).join();
        const start = text(), look0 = look();
        window.__r = { ms: null, from: start, to: null, animated: false };
        addEventListener('pointerdown', () => {
          const t0 = performance.now();
          const f = () => {
            const dt = performance.now() - t0;
            if (look() !== look0 || document.getAnimations().some((a) => els.includes(a.effect?.target))) window.__r.animated = true;
            if (window.__r.ms === null && text() !== start) { window.__r.ms = dt; window.__r.to = text(); }
            if (dt < 1500) requestAnimationFrame(f);
          };
          requestAnimationFrame(f);
        }, { once: true, capture: true });
        const r = base.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];
      }, t === 'o');
      await p.waitForTimeout(500);
      await p.mouse.click(pt[0], pt[1]); await p.mouse.move(2, 2); await p.waitForTimeout(1700);
      rows.push(await p.evaluate(() => window.__r));
    }
    res[t] = rows;
    await p.context().close();
  }
  const fmt = (rows) => rows.map((r) => (r.ms === null ? '—' : r.ms.toFixed(0))).join(' ');
  const warm = (rows) => rows.slice(1).map((r) => r.ms).filter((x) => x !== null);
  const [ow, cw] = [warm(res.o), warm(res.c)];
  const anim = (rows) => rows.some((r) => r.animated);
  const same = res.o.every((r, i) => r.from === res.c[i].from && r.to === res.c[i].to);
  console.log(`${vp.padEnd(9)} o ms ${fmt(res.o)} · c ms ${fmt(res.c)}`);
  console.log(`          warm taps: o ${Math.min(...ow).toFixed(0)}–${Math.max(...ow).toFixed(0)} ms · c ${Math.min(...cw).toFixed(0)}–${Math.max(...cw).toFixed(0)} ms · animated inside price rows: o ${anim(res.o)} c ${anim(res.c)} · same values both ways: ${same}`);
  console.log(`          ${res.o[0].from} → ${res.o[0].to}`);
  if (anim(res.c) !== anim(res.o) || !same || res.c.some((r) => r.ms === null)) fail++;
}
await b.close();
process.exitCode = fail ? 1 : 0;
