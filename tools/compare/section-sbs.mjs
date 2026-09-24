// Section-aligned side-by-side screenshots (original | clone): each side scrolled to <section top + offset>,
// waits for time-based transitions to settle, then pastes both viewports next to each other.
// Usage: [IDX=N] node tools/compare/section-sbs.mjs "<section name>" <offset[,offset…]> [vp …] → tools/.runs/sbs/
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
      const idx = Number(process.env.IDX || 0);   // Nth same-named section (original by document order, clone "<name>#N")
      const top = await p.evaluate(([sec, attr, idx]) => {
        const want = attr === 'data-ref' && idx > 1 ? `${sec}#${idx}` : sec;
        const all = [...document.querySelectorAll(`[${attr}]`)].filter((e) => e.getAttribute(attr).replace(/\s+/g, ' ') === want && e.getBoundingClientRect().height > 0);
        const r = !idx ? all.sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0] : attr === 'data-ref' ? all[0] : all.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[idx - 1];
        return r.getBoundingClientRect().top + scrollY; }, [sec, attr, idx]);
      await p.evaluate((y) => window.scrollTo(0, y), Math.round(top + off)); await p.waitForTimeout(1800);
      shots.push(PNG.sync.read(await p.screenshot()));
      await p.context().close();
    }
    const out = new PNG({ width: W * 2 + 8, height: H }); out.data.fill(255);
    shots.forEach((s, k) => PNG.bitblt(s, out, 0, 0, W, H, k * (W + 8), 0));
    const f = `${dir}/${sec.replace(/\s+/g, '-')}${process.env.IDX ? `-${process.env.IDX}` : ''}-${vp}-${off}.png`;
    fs.writeFileSync(f, PNG.sync.write(out)); console.log(f);
  }
}
await b.close();
