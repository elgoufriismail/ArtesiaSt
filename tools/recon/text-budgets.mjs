// Text budgets: for every text block of the ORIGINAL, record only metrics (never the text):
// nearest named-layer path, tag, text preset, character count, word count, rendered line count,
// per breakpoint. Stand-in copy is written fresh to fit these budgets so wrapping, block heights
// and hierarchy match the original.
//
// Usage: node tools/recon/text-budgets.mjs     → docs/architecture/text-budgets.json
import fs from 'node:fs';
import { ORIGINAL_URL, dumpNamed, launch, openSettled } from './lib.mjs';

const VPS = ['1440x900', '1024x768', '390x844'];
const browser = await launch();
const result = {};
for (const vp of VPS) {
  const { ctx, page } = await openSettled(browser, ORIGINAL_URL, vp);
  await dumpNamed(page, 'data-framer-name'); // warms layout; paths recomputed below
  result[vp] = await page.evaluate(() => {
    const pathOf = (el) => {
      const names = [];
      for (let a = el; a && a !== document.body; a = a.parentElement) {
        const n = a.getAttribute('data-framer-name')?.replace(/\s+/g, ' ');
        if (n === 'Main Container') break;
        if (a.tagName === 'NAV') { names.push('Nav'); break; }
        if (n === 'Footer Container') { names.push('Footer Container'); break; }
        if (n) names.push(n);
      }
      return names.reverse().join('/');
    };
    const out = [];
    for (const el of document.querySelectorAll('h1,h2,h3,h4,h5,h6,p')) {
      if (el.closest('#__framer-badge-container') || el.closest('[class*="framer-1pj0vat"],[class*="framer-1vs2lkl"],[class*="framer-4qhw1f"]')) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) continue;
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      out.push({
        path: pathOf(el),
        tag: el.tagName.toLowerCase(),
        preset: (el.className.match(/framer-styles-preset-[a-z0-9]+/) || [''])[0].replace('framer-styles-preset-', ''),
        fontSize: cs.fontSize,
        width: Math.round(r.width),
        chars: text.length,
        words: text.split(' ').length,
        lines: Math.round(r.height / lh),
        explicitBreaks: el.querySelectorAll('br').length,
      });
    }
    return out;
  });
  console.log(vp, result[vp].length, 'text blocks');
  await ctx.close();
}
await browser.close();
const outFile = new URL('../../docs/architecture/text-budgets.json', import.meta.url).pathname;
fs.writeFileSync(outFile, JSON.stringify({ note: 'Metrics only — no original text. Stand-in copy must match chars (±10%), words, and lines per breakpoint.', ...result }, null, 1));
