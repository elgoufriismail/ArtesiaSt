// Focused recon of the LIVE original Pricing section (source-drift check, 2026-09-28).
// Per viewport: named-layer geometry (section-relative), price-row DOM + type metrics, any svg/path in the
// Text/Headline block (scribble), reference screenshots of both switch states, and a rAF recording of both
// switch directions logging every change inside the price rows (text, opacity, transform, filter, rect) plus any
// running Web Animations / CSS transitions there.
// Usage: node tools/recon/pricing-live.mjs [vp …] [--out=<dir>]   (default 1920x1080 1440x900 1280x800 1024x768 390x844)
import fs from 'node:fs';
import { launch, ORIGINAL_URL, parseVp, ensureDir } from './lib.mjs';

const args = process.argv.slice(2);
const vps = args.filter((a) => !a.startsWith('--'));
const out = ensureDir((args.find((a) => a.startsWith('--out=')) || '--out=docs/reconnaissance/reference/drift-2026-09-28/pricing').slice(6));
const b = await launch();
const report = {};
for (const vp of vps.length ? vps : ['1920x1080', '1440x900', '1280x800', '1024x768', '390x844']) {
  const [W, H] = parseVp(vp);
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  await p.goto(ORIGINAL_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2500);
  await p.addStyleTag({ content: '#__framer-badge-container{display:none!important}' });
  await p.evaluate(() => {
    window.__sec = [...document.querySelectorAll('[data-framer-name="Pricing"]')].sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
    window.scrollTo(0, window.__sec.getBoundingClientRect().top + scrollY - 40);
  });
  await p.waitForTimeout(2500);   // appears settle

  const snap = () => p.evaluate(() => {
    const S = window.__sec; const R = S.getBoundingClientRect();
    const rel = (e) => { const r = e.getBoundingClientRect(); return [r.left - R.left, r.top - R.top, r.width, r.height].map((v) => +v.toFixed(2)); };
    const vis = (e) => e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none';
    // named layers (section-relative), same path convention as section-geometry.mjs
    const layers = {}; const seen = new Map();
    const walk = (el, prefix) => { if (getComputedStyle(el).display === 'none') return; let name = el.getAttribute('data-framer-name')?.replace(/\s+/g, ' ') || null; let next = prefix;
      if (name) { let path = prefix ? `${prefix}/${name}` : name; const n = (seen.get(path) || 0) + 1; seen.set(path, n); if (n > 1) path += `#${n}`; next = path; const r = el.getBoundingClientRect(); if (r.width || r.height) layers[path] = rel(el); }
      [...el.children].forEach((c) => walk(c, next)); };
    walk(S, '');
    const type = (e) => { const cs = getComputedStyle(e); return { tag: e.tagName.toLowerCase(), cls: e.className?.toString().slice(0, 60), rect: rel(e), text: e.children.length ? undefined : e.textContent, font: `${cs.fontWeight} ${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily.split(',')[0]}`, ls: cs.letterSpacing, color: cs.color, ws: cs.whiteSpace, fv: cs.fontVariantNumeric, ff: cs.fontFeatureSettings }; };
    const prices = [...S.querySelectorAll('[data-framer-name="Price"]')].filter(vis);
    const row = prices[0];
    const rowTree = []; const t = (e, d) => { if (!vis(e)) return; rowTree.push({ d, name: e.getAttribute('data-framer-name'), ...type(e), style: e.getAttribute('style')?.slice(0, 160) }); [...e.children].forEach((c) => t(c, d + 1)); };
    t(row, 0);
    // the element after Price (Framer puts the suffix inside or beside?) — record the row's parent chain + siblings
    const rowCss = (() => { const cs = getComputedStyle(row); return { display: cs.display, gap: cs.gap, align: cs.alignItems, justify: cs.justifyContent, height: cs.height, padding: cs.padding }; })();
    const headline = [...S.querySelectorAll('[data-framer-name="Headline"]')].find(vis);
    const svgs = [...S.querySelectorAll('svg')].filter((s) => !s.closest('[data-framer-name="Price"]')).map((s) => ({ inHeadline: headline?.contains(s) ?? false, parent: s.parentElement?.getAttribute('data-framer-name') || s.closest('[data-framer-name]')?.getAttribute('data-framer-name'), rect: rel(s), paths: s.querySelectorAll('path').length, visible: vis(s), strokes: [...s.querySelectorAll('path')].map((x) => x.getAttribute('stroke-width')).filter(Boolean) }));
    const headlineKids = headline ? [...headline.children].map((c) => ({ name: c.getAttribute('data-framer-name'), tag: c.tagName.toLowerCase(), rect: rel(c), display: getComputedStyle(c).display })) : null;
    return { section: [R.width, R.height].map((v) => +v.toFixed(2)), layers, prices: prices.map((e) => e.textContent.replace(/\s+/g, '')), rowCss, rowTree, headlineKids, svgs, nf: S.querySelectorAll('number-flow-react, number-flow').length };
  });

  const monthly = await snap();
  await p.evaluate(() => window.scrollTo(0, window.__sec.getBoundingClientRect().top + scrollY - 40)); await p.waitForTimeout(600);
  const shot = async (name) => { const r = await p.evaluate(() => { const q = window.__sec.getBoundingClientRect(); return { x: 0, y: Math.max(0, q.top), width: innerWidth, height: Math.min(innerHeight, q.bottom) - Math.max(0, q.top) }; }); await p.screenshot({ path: `${out}/${vp}-${name}.png`, clip: r }); };
  // full-section capture: temporarily a tall viewport so the whole section fits
  const fullShot = async (name) => { const hh = await p.evaluate(() => Math.ceil(window.__sec.getBoundingClientRect().height)); await p.setViewportSize({ width: W, height: Math.max(H, hh) }); await p.evaluate(() => window.scrollTo(0, window.__sec.getBoundingClientRect().top + scrollY)); await p.waitForTimeout(900); const r = await p.evaluate(() => { const q = window.__sec.getBoundingClientRect(); return { x: 0, y: q.top, width: innerWidth, height: q.height }; }); await p.screenshot({ path: `${out}/${vp}-${name}.png`, clip: r }); await p.setViewportSize({ width: W, height: H }); await p.waitForTimeout(600); };
  await fullShot('monthly');

  // rAF recording of one switch direction
  const record = async () => {
    await p.evaluate(() => { const b = [...window.__sec.querySelectorAll('[data-framer-name="Base"]')].find((x) => x.getBoundingClientRect().width > 0); b.scrollIntoView({ block: 'center' }); });
    await p.waitForTimeout(700);
    const pt = await p.evaluate(() => {
      const S = window.__sec; const vis = (e) => e.getBoundingClientRect().width > 0;
      const rows = [...S.querySelectorAll('[data-framer-name="Price"]')].filter(vis);
      const els = rows.flatMap((r) => [r, ...r.querySelectorAll('*')]).concat(rows.map((r) => r.parentElement));
      const key = (e) => { const cs = getComputedStyle(e); const q = e.getBoundingClientRect(); return [e.children.length ? '' : e.textContent, cs.opacity, cs.transform, cs.filter, q.left.toFixed(1), q.width.toFixed(1), q.top.toFixed(1), q.height.toFixed(1)].join('|'); };
      const ids = new Map(els.map((e, i) => [e, i]));
      let prev = els.map(key); window.__log = []; window.__anims = [];
      const base = [...S.querySelectorAll('[data-framer-name="Base"]')].find(vis); const r = base.getBoundingClientRect();
      window.__done = new Promise((resolve) => { let t0 = null;
        addEventListener('pointerdown', () => { t0 = performance.now(); }, { once: true, capture: true });
        const f = (t) => { if (t0 !== null) { const now = els.map(key); now.forEach((k, i) => { if (k !== prev[i]) window.__log.push([+(t - t0).toFixed(1), i, els[i].getAttribute('data-framer-name') || els[i].tagName.toLowerCase(), prev[i], k]); }); prev = now;
            const a = document.getAnimations().filter((x) => x.effect?.target && rows.some((rw) => rw.contains(x.effect.target) || rw.parentElement === x.effect.target)); if (a.length) window.__anims.push([+(t - t0).toFixed(1), a.map((x) => `${x.constructor.name}:${x.effect.target.tagName}:${JSON.stringify(x.effect.getKeyframes()).slice(0, 120)}`)]); }
          if (t0 === null || t - t0 < 1600) requestAnimationFrame(f); else resolve(); };
        requestAnimationFrame(f); });
      return [r.left + r.width / 2, r.top + r.height / 2];
    });
    await p.mouse.click(pt[0], pt[1]); await p.mouse.move(2, 2);
    await p.evaluate(() => window.__done);
    return p.evaluate(() => ({ log: window.__log, anims: window.__anims.slice(0, 5), animFrames: window.__anims.length }));
  };
  const fwd = await record();
  await p.waitForTimeout(800);
  const yearly = await snap();
  await fullShot('yearly');
  const back = await record();
  await p.waitForTimeout(800);
  const monthly2 = await snap();
  report[vp] = { monthly, yearly, monthlyAgain: { prices: monthly2.prices }, fwd, back };
  await p.context().close();

  const sum = (rec) => { const texts = rec.log.filter((l) => l[3].split('|')[0] !== l[4].split('|')[0]); const other = rec.log.filter((l) => l[3].split('|').slice(1, 4).join() !== l[4].split('|').slice(1, 4).join());
    const geo = rec.log.filter((l) => l[3].split('|').slice(4).join() !== l[4].split('|').slice(4).join());
    return `text changes ${texts.length} (first at ${texts[0]?.[0] ?? '-'} ms, last at ${texts.at(-1)?.[0] ?? '-'} ms) · opacity/transform/filter changes ${other.length} · geometry changes ${geo.length} (frames ${[...new Set(geo.map((g) => g[0]))].length}, ${geo[0]?.[0] ?? '-'}–${geo.at(-1)?.[0] ?? '-'} ms) · animation frames ${rec.animFrames}`; };
  console.log(`\n== ${vp}  section ${monthly.section.join('×')} (yearly ${yearly.section.join('×')})  NumberFlow elements ${monthly.nf}`);
  console.log(`  prices monthly ${monthly.prices.join(' ')} → yearly ${yearly.prices.join(' ')} → back ${monthly2.prices.join(' ')}`);
  console.log(`  Monthly→Yearly: ${sum(fwd)}`);
  console.log(`  Yearly→Monthly: ${sum(back)}`);
  console.log(`  price row: ${JSON.stringify(monthly.rowCss)}  rect ${JSON.stringify(monthly.layers[Object.keys(monthly.layers).find((k) => k.endsWith('/Price'))])}`);
  monthly.rowTree.forEach((n) => console.log(`   ${'  '.repeat(n.d)}${n.tag}${n.name ? ` [${n.name}]` : ''} ${JSON.stringify(n.rect)} ${n.text !== undefined ? JSON.stringify(n.text) + ' ' + n.font + ' ls ' + n.ls + ' ' + n.color : ''}`));
  console.log(`  headline children: ${JSON.stringify(monthly.headlineKids)}`);
  console.log(`  svgs outside price rows: ${JSON.stringify(monthly.svgs)}`);
}
fs.writeFileSync(`${out}/pricing-live.json`, JSON.stringify(report, null, 1));
console.log(`\nwritten ${out}/pricing-live.json + screenshots`);
await b.close();
