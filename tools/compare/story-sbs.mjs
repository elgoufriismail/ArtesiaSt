// Section-aligned side-by-side (original | clone) of Story A and Story B, scrolled to section top + 100 px
// after the in-view fades settle. Usage: node tools/compare/story-sbs.mjs [vp …] → tools/.runs/story/
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { launch, CLONE_URL, ORIGINAL_URL, parseVp } from '../recon/lib.mjs';
const b = await launch();
for (const vp of process.argv.slice(2)) {
  const [W, H] = parseVp(vp);
  for (const story of ['Story A', 'Story B']) {
    const shots = [];
    for (const [url, sel] of [[ORIGINAL_URL, `[data-framer-name="${story}"]`], [CLONE_URL, `[data-ref="${story}"]`]]) {
      const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
      await p.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); await p.waitForTimeout(1500);
      const top = await p.evaluate((sel) => { const r = [...document.querySelectorAll(sel)].sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0]; return r.getBoundingClientRect().top + scrollY; }, sel);
      // hide the original's promo badge and let the in-view fades finish
      await p.addStyleTag({ content: '#__framer-badge-container{display:none!important}' });
      await p.evaluate((y) => window.scrollTo(0, y), Math.round(top + 100)); await p.waitForTimeout(1600);
      shots.push(PNG.sync.read(await p.screenshot()));
      await p.context().close();
    }
    const out = new PNG({ width: W * 2 + 8, height: H });
    out.data.fill(255);
    shots.forEach((s, k) => PNG.bitblt(s, out, 0, 0, W, H, k * (W + 8), 0));
    const f = `tools/.runs/story/${story.replace(' ', '-')}-${vp}.png`;
    fs.writeFileSync(f, PNG.sync.write(out)); console.log(f);
  }
}
await b.close();
