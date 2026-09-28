// Book A Session form submit probe (o = live original, c = clone): empty submit (native validation), then fill the visible
// required fields and submit, logging the button variant/label/circles and field state over time. EVERY non-GET request is intercepted and answered locally (never sent), so no submission reaches
// any backend. Usage: node booking-submit.mjs <o|c> <status 200|500|none> [delayMs=1500] [vp=1440x900]
import { launch, ORIGINAL_URL, CLONE_URL, parseVp } from '../recon/lib.mjs';
const [site, status, delay = '1500', vp = '1440x900'] = process.argv.slice(2); const [W, H] = parseVp(vp);
const b = await launch(); const p = await (await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 810, isMobile: W < 810 })).newPage();
const reqs = [];
await p.route('**/*', async (route) => { const r = route.request(); if (r.method() === 'GET') return route.continue(); reqs.push({ t: Date.now(), m: r.method(), u: r.url().replace(/[?#].*/, ''), body: (r.postData() || '').slice(0, 300) }); if (status === 'none') return route.abort(); await new Promise((q) => setTimeout(q, +delay)); return route.fulfill({ status: +status, contentType: 'application/json', body: status === '200' ? '{}' : '{"error":"x"}' }); });
p.on('console', (m) => console.log('CONSOLE', m.type(), m.text().slice(0, 300))); p.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 300)));
await p.goto(site === 'o' ? ORIGINAL_URL : CLONE_URL, { waitUntil: 'networkidle' });
await p.evaluate((o) => { const S = o ? [...document.querySelectorAll('[data-framer-name="Book A Session"]')].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector('[data-ref="Book A Session"]'); window.__S = S; window.__f = S.querySelector('form'); window.__btn = window.__f.querySelector('button'); window.__btn.scrollIntoView({ block: 'center' }); window.__ev = []; window.__f.addEventListener('submit', (e) => { window.__ev.push('submit capture dp=' + e.defaultPrevented); setTimeout(() => window.__ev.push('submit after dp=' + e.defaultPrevented), 0); }, true); window.__f.addEventListener('invalid', (e) => window.__ev.push('invalid ' + e.target.name), true); }, site === 'o');
await p.waitForTimeout(2500);
const state = () => p.evaluate(() => { const bt = window.__btn; const f = window.__f; const cs = getComputedStyle(bt); const circles = [...bt.querySelectorAll('[data-framer-name^="Circle"], [data-ref$="/Circle A"], [data-ref$="/Circle B"]')].map((c) => { const r = c.getBoundingClientRect(); return `${c.dataset.framerName ?? c.dataset.ref.split('/').pop()}:${Math.round(r.width / 3) * 3}@${Math.round((r.left - bt.getBoundingClientRect().left) / 4) * 4}`; }); return { name: bt.dataset.framerName ?? (bt.matches(':hover') && bt.dataset.variant === 'Desktop' ? undefined : bt.dataset.variant), label: bt.innerText.trim(), op: +cs.opacity, pad: cs.padding, w: bt.getBoundingClientRect().width.toFixed(1), circles: circles.join(' '), disabled: bt.disabled, vals: [...f.elements].filter((e) => e.name && e.getBoundingClientRect().width > 0).map((e) => e.type === 'checkbox' ? (e.checked ? 1 : 0) : (e.value || '_')).join(','), invalid: [...f.elements].filter((e) => e.offsetWidth && e.willValidate && !e.validity.valid).map((e) => e.name).join('|'), formVisible: getComputedStyle(f).opacity + '/' + f.getBoundingClientRect().height.toFixed(0) }; });
const t0 = Date.now(); const log = (tag, s) => console.log(`${String(Date.now() - t0).padStart(5)} ${tag.padEnd(8)} ${JSON.stringify(s)}`);
log('init', { ...(await state()), novalidate: await p.evaluate(() => window.__f.noValidate), action: await p.evaluate(() => window.__f.getAttribute('action')) });
// empty submit
await p.evaluate(() => window.__btn.scrollIntoView({ block: 'center' })); await p.waitForTimeout(500);
const bb = await p.evaluate(() => { const r = window.__btn.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
if (W < 810) await p.touchscreen.tap(...bb); else await p.mouse.click(...bb);
await p.waitForTimeout(600); log('empty', { ...(await state()), reqs: reqs.length, focused: await p.evaluate(() => document.activeElement?.name || document.activeElement?.tagName), msg: await p.evaluate(() => [...window.__f.elements].find((e) => e.willValidate && !e.validity.valid)?.validationMessage) });
// fill required
await p.evaluate(() => { const f = window.__f; const set = (el, v) => { const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
  for (const e of [...f.elements].filter((e) => e.getBoundingClientRect().width > 0 && e.name)) { if (e.type === 'email') set(e, 'probe@example.com'); else if (e.tagName === 'SELECT') set(e, [...e.options].find((o) => !o.disabled && o.value)?.value ?? ''); else if (e.type === 'text' || e.type === 'tel') set(e, 'Probe'); else if (e.tagName === 'TEXTAREA') set(e, 'probe'); } });
log('filled', await state());
await p.evaluate(() => window.__btn.scrollIntoView({ block: 'center' })); await p.waitForTimeout(1200);
const bb2 = await p.evaluate(() => { const r = window.__btn.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
if (W < 810) await p.touchscreen.tap(...bb2); else await p.mouse.click(...bb2);
const tc = Date.now(); let last = '';
while (Date.now() - tc < +delay + (+process.env.TAIL || 6000)) { const s = await state(); const k = JSON.stringify(s); if (k !== last) { log(`+${Date.now() - tc}`, s); last = k; } await p.waitForTimeout(40); }
log('events', await p.evaluate(() => window.__ev));
log('reqs', reqs.map((r) => `${r.m} ${r.u} +${r.t - tc} ${r.body.slice(0, 160)}`));
await b.close();
