// Section-aligned side-by-side screenshots (original | clone): each side scrolled to <section top + offset>,
// waits for time-based transitions to settle, then pastes both viewports next to each other.
// Usage: node tools/compare/section-sbs.mjs "<section name>" <offset[,offset…]> [vp …] → tools/.runs/sbs/
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { launch, CLONE_URL, ORIGINAL_URL, parseVp, ensureDir } from '../recon/lib.mjs';

const [sec, offs, ...vps] = process.argv.slice(2);
const dir = 'tools/.runs/sbs'; ensureDir(dir);
const b = await launch();
for (const vp of vps) {
  const [W, H] = parseVp(vp);
  for (const off of offs.split(',').map(Number)) {
    const shots = [];
    for (const [url, attr] of [[ORIGINAL_URL, 'data-framer-name'], [CLONE_URL, 'data-ref']]) {
      const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
      await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(1500);
      const top = await p.evaluate(([sec, attr]) => { const r = [...document.querySelectorAll(`[${attr}="${sec}"]`)].sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0]; return r.getBoundingClientRect().top + scrollY; }, [sec, attr]);
      await p.evaluate((y) => window.scrollTo(0, y), Math.round(top + off)); await p.waitForTimeout(1800);
      shots.push(PNG.sync.read(await p.screenshot()));
      await p.context().close();
    }
    const out = new PNG({ width: W * 2 + 8, height: H }); out.data.fill(255);
    shots.forEach((s, k) => PNG.bitblt(s, out, 0, 0, W, H, k * (W + 8), 0));
    const f = `${dir}/${sec.replace(/\s+/g, '-')}-${vp}-${off}.png`;
    fs.writeFileSync(f, PNG.sync.write(out)); console.log(f);
  }
}
await b.close();
