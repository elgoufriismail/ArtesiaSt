// Per-frame visual sampling of the Booking submit button (label left, Circle A/B rect) for hover in/out and submit.
// All non-GET requests are answered locally (never sent). Usage: <o|c> <hover|submit> [vp] [latencyMs]
import fs from 'node:fs';
import { launch, ORIGINAL_URL, CLONE_URL, parseVp, RUNS_DIR } from '../recon/lib.mjs';
const [site, mode, vp = '1440x900', lat = '1200'] = process.argv.slice(2); const [W, H] = parseVp(vp);
const b = await launch(); const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
await p.route('**/*', async (route) => { const r = route.request(); if (r.method() === 'GET') return route.continue(); await new Promise((q) => setTimeout(q, +lat)); return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
await p.goto(site === 'o' ? ORIGINAL_URL : CLONE_URL, { waitUntil: 'networkidle' });
await p.evaluate((o) => { const S = o ? [...document.querySelectorAll('[data-framer-name="Book A Session"]')].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector('[data-ref="Book A Session"]'); window.__f = S.querySelector('form'); window.__btn = window.__f.querySelector('button'); window.__btn.scrollIntoView({ block: 'center' }); }, site === 'o');
await p.waitForTimeout(2500);
if (mode === 'submit') await p.evaluate(() => { const f = window.__f; const set = (el, v) => { const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
  for (const e of [...f.elements].filter((e) => e.getBoundingClientRect().width > 0 && e.name)) { if (e.type === 'email') set(e, 'probe@example.com'); else if (e.tagName === 'SELECT') set(e, [...e.options].find((o) => !o.disabled && o.value)?.value ?? ''); else if (e.type === 'text' || e.type === 'tel') set(e, 'Probe'); } });
await p.evaluate(() => { const bt = window.__btn; const B = () => bt.getBoundingClientRect(); const lab = bt.querySelector('p, span'); const cA = bt.querySelector('[data-framer-name="Circle A"], [data-ref$="/Circle A"]'); const cB = bt.querySelector('[data-framer-name="Circle B"], [data-ref$="/Circle B"]');
  window.__rows = []; window.__t0 = null; const f = (now) => { const b0 = B(); const a = cA.getBoundingClientRect(), c = cB.getBoundingClientRect(), l = lab.getBoundingClientRect(); window.__rows.push([now, +(l.left - b0.left).toFixed(2), +(a.left - b0.left).toFixed(2), +a.width.toFixed(2), +(c.left - b0.left).toFixed(2), bt.dataset.framerName ?? bt.dataset.variant, bt.innerText.trim()]); requestAnimationFrame(f); }; requestAnimationFrame(f); });
const r = await p.evaluate(() => { const x = window.__btn.getBoundingClientRect(); return [x.left + x.width / 2, x.top + x.height / 2]; });
await p.mouse.move(r[0], r[1] - 200);
const ev = [];
const stamp = async (k) => ev.push([k, await p.evaluate(() => performance.now())]);
if (mode === 'hover') { await stamp('in'); await p.mouse.move(r[0], r[1]); await p.waitForTimeout(1200); await stamp('out'); await p.mouse.move(r[0], r[1] - 200); await p.waitForTimeout(1200); }
else { await p.mouse.move(r[0], r[1]); await p.waitForTimeout(1200); await stamp('click'); await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(+lat + 2000); }
const rows = await p.evaluate(() => window.__rows);
fs.mkdirSync(RUNS_DIR, { recursive: true }); fs.writeFileSync(`${RUNS_DIR}booking-button-${site}-${mode}-${vp}.json`, JSON.stringify({ ev, rows }));
for (const [k, t] of ev) { console.log(`== ${site} ${mode} ${k}`); let last = ''; for (const row of rows.filter((x) => x[0] >= t - 20 && x[0] < t + (mode === 'submit' ? +lat + 1200 : 900))) { const key = row.slice(1).join(' '); if (key !== last) { console.log(`  ${(row[0] - t).toFixed(0).padStart(5)} label ${row[1]} A ${row[2]}/${row[3]} B ${row[4]} ${row[5]} ${row[6]}`); last = key; } } }
await b.close();
