// Capture a target with the SAME protocol as the reconnaissance screenshots:
//   load → 4s intro → for each n: scrollTo(n·H) instant → 1.8s settle → viewport PNG
// plus a named-element geometry dump and, per frame, the rects that must be masked when diffing:
//   clone:    elements marked [data-standin] (stand-in photos/text — content differs by design)
//   original: the Framer marketplace promo badge (not part of the design)
//
// Usage: node tools/recon/capture.mjs <original|clone> [vp ...]      (default: all 8 viewports)
// Output: tools/.runs/<target>/<vp>/{index.json, named.json, NNNNN.png}
import fs from 'node:fs';
import { CLONE_URL, ORIGINAL_URL, RUNS_DIR, VIEWPORTS, dumpNamed, ensureDir, launch, openSettled } from './lib.mjs';

const target = process.argv[2];
if (!['original', 'clone'].includes(target)) {
  console.error('usage: capture.mjs <original|clone> [WxH ...]');
  process.exit(1);
}
const vps = process.argv.slice(3).length ? process.argv.slice(3) : VIEWPORTS;
const url = target === 'original' ? ORIGINAL_URL : CLONE_URL;
const attr = target === 'original' ? 'data-framer-name' : 'data-ref';

const MASK_SELECTOR = target === 'original'
  ? '#__framer-badge-container, [class*="framer-1pj0vat"], [class*="framer-1vs2lkl"], [class*="framer-4qhw1f"]'
  : '[data-standin]';

const browser = await launch();
for (const vp of vps) {
  const dir = ensureDir(`${RUNS_DIR}${target}/${vp}`);
  const { ctx, page, W, H } = await openSettled(browser, url, vp);
  fs.writeFileSync(`${dir}/named.json`, JSON.stringify(await dumpNamed(page, attr)));
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const shots = [];
  for (let y = 0; ; y += H) {
    const yy = Math.max(0, Math.min(y, total - H));
    await page.evaluate((y) => window.scrollTo(0, y), yy);
    await page.waitForTimeout(1800);
    const actual = await page.evaluate(() => Math.round(scrollY));
    const file = `${String(actual).padStart(5, '0')}.png`;
    await page.screenshot({ path: `${dir}/${file}` });
    const masks = await page.evaluate((sel) => [...document.querySelectorAll(sel)]
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight)
      .map((r) => [Math.floor(r.x), Math.floor(r.y), Math.ceil(r.width), Math.ceil(r.height)]), MASK_SELECTOR);
    shots.push({ requested: yy, actual, file, masks });
    if (yy >= total - H) break;
  }
  fs.writeFileSync(`${dir}/index.json`, JSON.stringify({ target, url, viewport: [W, H], scrollHeight: total, shots }, null, 1));
  console.log(`${target} ${vp}: height ${total}, ${shots.length} frames`);
  await ctx.close();
}
await browser.close();
