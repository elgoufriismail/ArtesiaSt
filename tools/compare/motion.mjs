// Motion diff: sample the clone with the recon scroll protocol (instant scrollTo, 50px steps,
// 300ms settle) for every mapped effect and compare value curves with the original tracks.
//
// Usage: node tools/compare/motion.mjs [vp ...]      (default: 1440x900 1024x768 390x844)
// Needs a running clone (npm run build && npm run preview, or CLONE_URL=...).
// Output: tools/.runs/report-motion-<vp>.md + console summary
import fs from 'node:fs';
import { CLONE_URL, REF_DIR, RUNS_DIR, ensureDir, launch, openSettled } from '../recon/lib.mjs';

const vps = process.argv.slice(2).length ? process.argv.slice(2) : ['1440x900', '1024x768', '390x844'];
const MAP = JSON.parse(fs.readFileSync(new URL('./motion-map.json', import.meta.url), 'utf8')).effects;

// Extract a numeric property from an inline-style string (recon track format or clone inline style).
const EXTRACT = {
  opacity: (s) => num(s, /opacity:\s*([-\d.e]+)/) ?? 1,
  translateY: (s) => num(s, /translateY\((-?[\d.]+)px\)/) ?? num(s, /translate3d\([^,]+,\s*(-?[\d.]+)px/) ?? 0,
  rotateX: (s) => num(s, /rotateX\((-?[\d.]+)deg\)/) ?? 0,
  dashoffset: (s) => num(s, /(?:strokeDashoffset|stroke-dashoffset):\s*(-?[\d.]+)/),
};
function num(s, re) { const m = s && s.match(re); return m ? Number(m[1]) : undefined; }

/** Original value at scrollY: last recorded change at or before y in the downward pass. */
function originalCurve(track) {
  const down = [];
  for (const [y, v] of track) { if (down.length && y < down.at(-1)[0]) break; down.push([y, v]); }
  return (y, prop) => { let v = null; for (const [ty, tv] of down) { if (ty <= y) v = tv; else break; } return v === null ? undefined : EXTRACT[prop](v); };
}

const browser = await launch();
for (const vp of vps) {
  const rec = JSON.parse(fs.readFileSync(`${REF_DIR}animations/scroll-${vp}.json`, 'utf8'));
  const effects = MAP.filter((e) => !e.viewports || e.viewports.includes(vp)).map((e) => {
    const cands = rec.elements.filter((x) => x.name === e.orig.name).sort((a, b) => a.docTop - b.docTop);
    return { ...e, track: cands[e.orig.nth]?.track };
  }).filter((e) => e.track);
  const { ctx, page, H } = await openSettled(browser, CLONE_URL, vp);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const samples = Object.fromEntries(effects.map((e) => [e.id, []]));
  for (let y = 0; y <= total - H; y += rec.step) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(rec.wait);
    const vals = await page.evaluate((refs) => refs.map((r) => {
      const el = document.querySelector(`[data-ref="${CSS.escape(r)}"]`);
      if (!el) return null;
      const s = el.getAttribute('style') || '';
      const op = getComputedStyle(el).opacity;
      const dash = el.getAttribute('stroke-dashoffset');
      return `${s}; opacity: ${op}${dash ? `; stroke-dashoffset: ${dash}` : ''}`;
    }), effects.map((e) => e.clone));
    effects.forEach((e, i) => samples[e.id].push([y, vals[i]]));
  }
  await ctx.close();

  const lines = [`# Motion report ${vp}`, '', '| effect | samples | max abs err | mean abs err | tol | status |', '|---|---|---|---|---|---|'];
  let pass = 0;
  for (const e of effects) {
    const orig = originalCurve(e.track);
    const errs = [];
    let missing = false;
    for (const [y, s] of samples[e.id]) {
      if (s === null) { missing = true; break; }
      const o = orig(y, e.prop), c = EXTRACT[e.prop](s);
      if (o !== undefined && c !== undefined) errs.push(Math.abs(o - c));
    }
    const max = errs.length ? Math.max(...errs) : NaN, mean = errs.length ? errs.reduce((a, b) => a + b, 0) / errs.length : NaN;
    const status = missing ? 'MISSING in clone' : max <= e.tol ? 'pass' : 'FAIL';
    if (status === 'pass') pass++;
    lines.push(`| ${e.id} | ${errs.length} | ${max.toFixed(3)} | ${mean.toFixed(3)} | ${e.tol} | ${status} |`);
  }
  ensureDir(RUNS_DIR);
  fs.writeFileSync(`${RUNS_DIR}report-motion-${vp}.md`, lines.join('\n') + '\n');
  console.log(`${vp}: ${pass}/${effects.length} effects within tolerance`);
}
await browser.close();
