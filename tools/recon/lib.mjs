// Shared Playwright helpers for recon + comparison runs (original and clone).
import { chromium } from '@playwright/test';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

export const ORIGINAL_URL = 'https://clearpath-template.framer.website/';
export const CLONE_URL = process.env.CLONE_URL || 'http://localhost:4173/';
export const VIEWPORTS = ['1920x1080', '1440x900', '1280x800', '1024x768', '768x1024', '430x932', '390x844', '375x812'];
export const REF_DIR = new URL('../../docs/reconnaissance/reference/', import.meta.url).pathname;
export const RUNS_DIR = new URL('../.runs/', import.meta.url).pathname;

export const parseVp = (vp) => vp.split('x').map(Number);

/** In the cloud sandbox HTTPS is re-signed by a proxy CA; trust exactly that key (TLS stays verified). */
function proxyArgs() {
  const ca = '/root/.ccr/agent-proxy-ca.crt';
  if (!fs.existsSync(ca)) return [];
  const spki = execSync(`openssl x509 -in ${ca} -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64`).toString().trim();
  return [`--ignore-certificate-errors-spki-list=${spki}`];
}

export async function launch() {
  return chromium.launch({ args: proxyArgs() });
}

/** Load a page, wait for intro animations, walk the page once so lazy/in-view content initialises. */
export async function openSettled(browser, url, vp, { intro = 4000 } = {}) {
  const [W, H] = parseVp(vp);
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(intro);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += H / 2) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  return { ctx, page, W, H };
}

/**
 * Dump visible elements that carry `attr` (data-framer-name on the original, data-ref on the clone)
 * as { path, tag, rect:[x,docY,w,h], style } where path = chain of named ancestors joined by "/",
 * de-duplicated with "#n" suffixes in document order. Text is never stored (only char counts).
 */
export async function dumpNamed(page, attr) {
  return page.evaluate((attr) => {
    const P = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'color', 'backgroundColor', 'borderRadius', 'opacity', 'transform', 'position', 'display', 'flexDirection', 'gap', 'padding'];
    const out = [];
    const seen = new Map();
    const isOriginal = attr === 'data-framer-name';
    const walk = (el, prefix) => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none') return;
      const name = el.getAttribute(attr)?.replace(/\s+/g, ' ') || null; // Framer names may contain NBSP
      let next = prefix;
      // Original: path is built from named ancestors; roots are re-based so paths match the clone's data-ref values.
      // Clone: data-ref already holds the full path.
      if (isOriginal && name === 'Main Container') next = '';
      else if (isOriginal && el.tagName === 'NAV') next = 'Nav';
      else if (isOriginal && name === 'Footer Container') next = 'Footer Container';
      else if (name) {
        let path = isOriginal && prefix ? prefix + '/' + name : name;
        const n = (seen.get(path) || 0) + 1;
        seen.set(path, n);
        if (n > 1) path += '#' + n;
        next = path;
        const r = el.getBoundingClientRect();
        if (r.width > 0 || r.height > 0) {
          out.push({
            path,
            tag: el.tagName.toLowerCase(),
            rect: [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)],
            chars: el.children.length === 0 ? (el.textContent || '').trim().length : undefined,
            style: Object.fromEntries(P.map((k) => [k, cs[k]])),
          });
        }
      }
      for (const c of el.children) walk(c, next);
    };
    walk(document.body, '');
    return out;
  }, attr);
}

export function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
  return d;
}
