// Interaction smoke test, original vs clone (nav links, tablet/phone menu + scroll lock, Balance switch click, footer
// newsletter form). Every non-GET request is answered locally, nothing is sent. Usage: node tools/compare/interaction-smoke.mjs [vp]
import { launch, ORIGINAL_URL, CLONE_URL, parseVp } from '../recon/lib.mjs';
const [vp = '1440x900'] = process.argv.slice(2); const [W, H] = parseVp(vp); const touch = W < 810;
const b = await launch(); const R = {};
for (const [site, url] of [['o', ORIGINAL_URL], ['c', CLONE_URL]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch }); const p = await ctx.newPage();
  await p.route('**/*', async (r) => { if (r.request().method() === 'GET') return r.continue(); await new Promise((q) => setTimeout(q, 800)); return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
  await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(3000);
  const tap = async (xy) => (touch ? p.touchscreen.tap(...xy) : p.mouse.click(...xy));
  const out = {};
  // 1 nav: visible top links + hrefs
  out.nav = await p.evaluate(() => [...document.querySelectorAll('a')].filter((a) => { const r = a.getBoundingClientRect(); const cs = getComputedStyle(a); return r.top < 70 && r.width > 0 && cs.visibility !== 'hidden'; }).map((a) => a.getAttribute('href')).filter((v, i, s) => s.indexOf(v) === i).sort().join(' '));
  // 2 menu (tablet/phone): open → state, close → state
  if (W < 1200) {
    const btn = await p.evaluate(() => { const c = [...document.querySelectorAll('a, button, [role=button], div')].filter((e) => /^\s*menu\s*$/i.test(e.innerText || '') && e.getBoundingClientRect().top < 80 && e.getBoundingClientRect().width > 40 && e.getBoundingClientRect().width < 200); c.sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height); const r = c[c.length - 1].getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    const st = () => p.evaluate(() => ({ lock: getComputedStyle(document.documentElement).overflow + '/' + getComputedStyle(document.body).overflow, label: [...document.querySelectorAll('*')].filter((e) => /^\s*(menu|close)\s*$/i.test(e.innerText || '') && e.children.length === 0 && e.getBoundingClientRect().top < 80 && +getComputedStyle(e).opacity > 0.5).map((e) => e.innerText.trim().toLowerCase())[0], links: [...document.querySelectorAll('a')].filter((a) => { const r = a.getBoundingClientRect(); let op = 1; for (let x = a; x; x = x.parentElement) op *= +getComputedStyle(x).opacity; return r.top > 80 && r.bottom < innerHeight && r.width > 0 && op > 0.5; }).length, sy: Math.round(scrollY) }));
    await tap(btn); await p.waitForTimeout(1200); const o1 = await st();
    const wheel = await p.evaluate(() => scrollY); await p.mouse.wheel(0, 400).catch(() => {}); await p.waitForTimeout(500); const scrolledWhileOpen = (await p.evaluate(() => scrollY)) !== wheel;
    await tap(btn); await p.waitForTimeout(1200); const o2 = await st();
    out.menu = `open: lock ${o1.lock} label ${o1.label} links ${o1.links} scrolledWhileOpen ${scrolledWhileOpen} · closed: lock ${o2.lock} label ${o2.label}`;
  }
  // 3 balance switch click (desktop/tablet/phone): click the switch link while in the Off state
  const tog = await p.evaluate((o) => { const T = o ? [...document.querySelectorAll('[data-framer-name="Toggle"]')].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector('[data-ref="Toggle"]'); scrollTo(0, T.getBoundingClientRect().top + scrollY + 300); return true; }, site === 'o');
  await p.waitForTimeout(1500);
  const sw = await p.evaluate((o) => { const T = o ? [...document.querySelectorAll('[data-framer-name="Toggle"]')].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector('[data-ref="Toggle"]'); const a = T.querySelector('a'); const r = a.getBoundingClientRect(); return { xy: [r.left + r.width - 12, r.top + r.height / 2], href: a.getAttribute('href') }; }, site === 'o');
  const y0 = await p.evaluate(() => scrollY); await tap(sw.xy); await p.waitForTimeout(2500);
  out.balance = await p.evaluate(([o, y0, href]) => { const T = o ? [...document.querySelectorAll('[data-framer-name="Toggle"]')].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector('[data-ref="Toggle"]'); const vis = [...T.querySelectorAll('h2')].map((h) => { let op = 1; for (let x = h; x && x !== T; x = x.parentElement) op *= +getComputedStyle(x).opacity; return op > 0.5 ? 'V' : '-'; }).join(''); return `href ${href} → scrolled ${Math.round(scrollY - y0)} px (rel. toggle top ${Math.round(scrollY - (T.getBoundingClientRect().top + scrollY))}) · h2 visibility ${vis} · link now ${T.querySelector('a').getAttribute('href')}`; }, [site === 'o', y0, sw.href]);
  // 4 service card hover (desktop only)
  if (!touch && W >= 1200) {
    const card = await p.evaluate((o) => { const S = o ? [...document.querySelectorAll('[data-framer-name="Our Services"]')].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector('[data-ref="Our Services"]'); S.scrollIntoView({ block: 'start' }); scrollBy(0, 250); return true; }, site === 'o'); await p.waitForTimeout(1500);
    const c0 = await p.evaluate((o) => { const S = o ? [...document.querySelectorAll('[data-framer-name="Our Services"]')].sort((a, b) => b.offsetHeight - a.offsetHeight)[0] : document.querySelector('[data-ref="Our Services"]'); const cards = [...S.querySelectorAll(o ? '[data-framer-name="Card A Container"]' : '[data-ref$="Card A Container"]')]; const r = cards[0].getBoundingClientRect(); window.__card = cards[0]; const txt = [...cards[0].querySelectorAll('p')].map((q) => { const b = q.getBoundingClientRect(); return Math.round(b.top - r.top); }).join(','); return { xy: [r.left + r.width / 2, r.top + r.height / 2], txt }; }, site === 'o');
    await p.mouse.move(...c0.xy); await p.waitForTimeout(1200);
    const c1 = await p.evaluate(() => { const r = window.__card.getBoundingClientRect(); return [...window.__card.querySelectorAll('p')].map((q) => Math.round(q.getBoundingClientRect().top - r.top)).join(','); });
    await p.mouse.move(5, 5); await p.waitForTimeout(1200);
    const c2 = await p.evaluate(() => { const r = window.__card.getBoundingClientRect(); return [...window.__card.querySelectorAll('p')].map((q) => Math.round(q.getBoundingClientRect().top - r.top)).join(','); });
    out.serviceHover = `text tops idle ${c0.txt} → hover ${c1} → out ${c2}`;
  }
  // 5 footer newsletter: empty submit, then valid submit
  const f = await p.evaluate(() => { const forms = [...document.querySelectorAll('form')]; const fo = forms[forms.length - 1]; fo.scrollIntoView({ block: 'center' }); window.__ff = fo; return true; }); await p.waitForTimeout(1500);
  const fbtn = async () => p.evaluate(() => { const bt = window.__ff.querySelector('button, [type=submit]'); const r = bt.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  const fst = () => p.evaluate(() => { const bt = window.__ff.querySelector('button'); const inp = window.__ff.querySelector('input:not([type=hidden])'); return `input ${inp.type} req=${inp.required} val="${inp.value}" focus=${document.activeElement === inp} · button "${bt.innerText.trim()}" ${bt.dataset.framerName ?? bt.dataset.variant ?? ''}`; });
  await tap(await fbtn()); await p.waitForTimeout(600); const e1 = await fst();
  await p.evaluate(() => { const inp = window.__ff.querySelector('input:not([type=hidden])'); inp.focus(); });
  await p.keyboard.type('probe@example.com'); await tap(await fbtn());
  const seq = []; for (let i = 0; i < 14; i++) { await p.waitForTimeout(200); const s = await fst(); if (seq[seq.length - 1] !== s) seq.push(s); }
  out.footerForm = `empty: ${e1}\n      valid: ${seq.join('\n          → ')}`;
  R[site] = out; await ctx.close();
}
for (const k of Object.keys(R.o)) console.log(`${vp} ${k}\n   o ${R.o[k]}\n   c ${R.c[k]}`);
await b.close();
