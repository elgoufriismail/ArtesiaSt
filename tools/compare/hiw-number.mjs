// How It Works odometer: pixel diff of the number box (original vs clone) in each settled state 01/02/03.
// Scrolls to the middle of each step range, waits for the transition, crops the number box on both sides.
// Usage: node tools/compare/hiw-number.mjs [vp …] → tools/.runs/hiw/<vp>-<state>-{o,c,diff}.png
import fs from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { launch, CLONE_URL, ORIGINAL_URL, parseVp, ensureDir } from '../recon/lib.mjs';

const vps = process.argv.slice(2).length ? process.argv.slice(2) : ['1440x900', '1024x768'];
const dir = 'tools/.runs/hiw'; ensureDir(dir);
const b = await launch();
for (const vp of vps) {
  const [W, H] = parseVp(vp);
  const shots = { o: [], c: [] };
  for (const [t, url] of [['o', ORIGINAL_URL], ['c', CLONE_URL]]) {
    const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
    await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1200);
    await p.addStyleTag({ content: '#__framer-badge-container{display:none!important}' });
    const marks = await p.evaluate((t) => ['step-2-trigger', 'step-3-trigger'].map((n) => { const e = t === 'o' ? [...document.querySelectorAll(`[data-framer-name="${n}"]`)].find((x) => x.getBoundingClientRect().width > 0) : document.querySelector(`[data-marker="${n}"]`); return e.getBoundingClientRect().top + scrollY; }), t);
    const ys = [marks[0] - H / 2 - 200, (marks[0] + marks[1]) / 2 - H / 2, marks[1] - H / 2 + 200].map(Math.round);
    for (const y of ys) {
      await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(1500);
      const r = await p.evaluate((t) => { const e = t === 'o' ? [...document.querySelectorAll('[data-framer-name="Big Number Container"] .framer-1iff3ar')].find((x) => x.getBoundingClientRect().width > 0) : document.querySelector('[data-ref$="Big Number Container/01"]'); const q = e.getBoundingClientRect(); return { x: Math.round(q.left), y: Math.round(q.top), width: Math.round(q.width), height: Math.round(q.height) }; }, t);
      shots[t].push({ png: PNG.sync.read(await p.screenshot({ clip: r })), r });
    }
    await p.context().close();
  }
  ['01', '02', '03'].forEach((s, i) => {
    const o = shots.o[i].png, c = shots.c[i].png;
    const w = Math.min(o.width, c.width), h = Math.min(o.height, c.height);
    const crop = (img) => { const out = new PNG({ width: w, height: h }); PNG.bitblt(img, out, 0, 0, w, h, 0, 0); return out; };
    const diff = new PNG({ width: w, height: h });
    const n = pixelmatch(crop(o).data, crop(c).data, diff.data, w, h, { threshold: 0.1 });
    fs.writeFileSync(`${dir}/${vp}-${s}-o.png`, PNG.sync.write(o)); fs.writeFileSync(`${dir}/${vp}-${s}-c.png`, PNG.sync.write(c)); fs.writeFileSync(`${dir}/${vp}-${s}-diff.png`, PNG.sync.write(diff));
    console.log(`${vp} ${s}: box o ${JSON.stringify(shots.o[i].r)} c ${JSON.stringify(shots.c[i].r)} · ${n} px differ (${(100 * n / (w * h)).toFixed(3)} %)`);
  });
}
await b.close();
