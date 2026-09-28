// Big Quote scroll-linked motion, original vs clone at identical section-relative scroll positions (settled):
// arc rotateX angle + cos (projected height), long-line draw progress ×2, photo translateY, waves opacity.
// Usage: node tools/compare/bigquote-motion.mjs <o|c> <WxH> <fromRel> <toRel> <step> <out.json> [settleMs] [down|up]
import fs from 'node:fs';
import { launch, ORIGINAL_URL, CLONE_URL, parseVp } from '../recon/lib.mjs';
const [site, vp, fromRel, toRel, step, out, settle = '1300', dir = 'down'] = process.argv.slice(2);
const [W, H] = parseVp(vp);
const b = await launch(); const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
await p.goto(site === 'o' ? ORIGINAL_URL : CLONE_URL, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(1500);
const q = site === 'o' ? {
  sec: `[...document.querySelectorAll('[data-framer-name="Big Quote"]')].sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0]`,
  shape: `S.querySelector('[data-framer-name="Shape Container"]')`, paths: `[...S.querySelectorAll('svg path')].filter((x) => x.getAttribute('stroke-width') === '2')`, img: `[...S.querySelectorAll('img, div[style*="opacity"]')].find((x) => x.tagName === 'IMG')`, waves: `document.querySelector('[data-framer-name="Waves Container"]')`,
} : {
  sec: `document.querySelector('[data-ref="Big Quote"]')`,
  shape: `S.querySelector('[data-ref="Big Quote/Shape Container"]')`, paths: `[...S.querySelectorAll('path[data-ref^="Big Quote/Line"]')]`, img: `S.querySelector('[data-ref$="Frame/img"]')`, waves: `document.querySelector('[data-ref="Waves Container"]')`,
};
const top = await p.evaluate((q) => { const S = eval(q.sec); return S.getBoundingClientRect().top + scrollY; }, q);
const ys = []; for (let r = +fromRel; r <= +toRel; r += +step) ys.push(Math.round(top + r));
if (dir === 'up') ys.reverse();
const rows = [];
for (const y of ys) {
  await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(+settle);
  rows.push(await p.evaluate(([q, y, top]) => {
    const S = eval(q.sec); const sh = eval(q.shape); const paths = eval(q.paths).filter((x) => x.getClientRects().length); const img = eval(q.img); const wv = eval(q.waves);
    const m = new DOMMatrixReadOnly(getComputedStyle(sh).transform === 'none' ? undefined : getComputedStyle(sh).transform);
    const angle = Math.atan2(m.m23, m.m22) * 180 / Math.PI;          // rotateX: m22 = cos, m23 = sin
    const prog = paths.map((pa) => { const L = pa.getTotalLength(); const o = parseFloat(getComputedStyle(pa).strokeDashoffset); const da = getComputedStyle(pa).strokeDasharray; return da === 'none' ? 1 : +(1 - o / L).toFixed(4); });
    const iy = img ? new DOMMatrixReadOnly(getComputedStyle(img).transform === 'none' ? undefined : getComputedStyle(img).transform).m42 : null;
    return [y - Math.round(top), +angle.toFixed(3), +m.m22.toFixed(4), prog[0] ?? null, prog[1] ?? null, iy === null ? null : +iy.toFixed(2), wv && wv.getClientRects().length ? +(+getComputedStyle(wv).opacity).toFixed(4) : null];
  }, [q, y, top]));
}
fs.writeFileSync(out, JSON.stringify({ top, rows }));
console.log(`${site} ${vp} section top ${top.toFixed(1)}  (rel, angle°, cos, line1, line2, imgY, waves)`);
rows.forEach((r) => console.log(r.join('  ')));
await b.close();
