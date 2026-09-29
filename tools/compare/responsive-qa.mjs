// Responsive QA, original and/or clone: horizontal overflow, elements escaping the viewport without a clipping ancestor,
// interactive elements whose centre hit-test lands elsewhere, cumulative layout shift. Usage: [SITES=c,o] [VPS=…] node tools/compare/responsive-qa.mjs
import { launch, ORIGINAL_URL, CLONE_URL, VIEWPORTS, parseVp } from '../recon/lib.mjs';
const sites = (process.env.SITES || 'c,o').split(',');
const b = await launch();
for (const vp of (process.env.VPS ? process.env.VPS.split(',') : VIEWPORTS)) { const [W, H] = parseVp(vp);
  for (const site of sites) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: W < 810, isMobile: W < 810 });
    const p = await ctx.newPage();
    await p.addInitScript(() => { window.__cls = 0; window.__shifts = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (!e.hadRecentInput) { window.__cls += e.value; if (e.value > 0.001) window.__shifts.push([Math.round(performance.now()), +e.value.toFixed(4), (e.sources || []).map((s) => s.node ? (s.node.dataset?.ref || s.node.dataset?.framerName || s.node.tagName) : '?').slice(0, 3).join(',')]); } } }).observe({ type: 'layout-shift', buffered: true }); } catch {} });
    await p.goto(site === 'o' ? ORIGINAL_URL : CLONE_URL, { waitUntil: 'networkidle', timeout: 90000 });
    await p.waitForTimeout(2000);
    const r = await p.evaluate(async (o) => {
      const res = { scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, innerW: innerWidth, vScroll: document.documentElement.scrollHeight > innerHeight };
      // scroll the whole page (instant steps) to trigger everything
      for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise((q) => setTimeout(q, 60)); }
      scrollTo(0, 0); await new Promise((q) => setTimeout(q, 300));
      res.scrollW2 = document.documentElement.scrollWidth;
      // visible elements escaping the viewport horizontally without a clipping ancestor
      const clipped = (e) => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) { const cs = getComputedStyle(a); if (/(hidden|clip)/.test(cs.overflowX) || /(hidden|clip)/.test(cs.overflow)) { const r = a.getBoundingClientRect(); if (r.left >= -1 && r.right <= innerWidth + 1) return true; } } return false; };
      const esc = []; for (const e of document.body.querySelectorAll('*')) { const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0 || cs.position === 'fixed') continue; if ((r.right > innerWidth + 1 || r.left < -1) && !clipped(e)) esc.push(`${e.tagName}${e.dataset.ref ? '[' + e.dataset.ref.slice(0, 60) + ']' : e.dataset.framerName ? '"' + e.dataset.framerName + '"' : ''} ${r.left.toFixed(0)}..${r.right.toFixed(0)}`); }
      res.escapes = esc;
      // interactive elements: hit test at centre (scrolled to the viewport centre)
      const inter = [...document.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea')].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && !e.closest('[aria-hidden="true"]') && !e.closest('#__framer-badge-container'); });
      const bad = [];
      for (const e of inter) { e.scrollIntoView({ block: 'center', behavior: 'instant' }); await new Promise((q) => requestAnimationFrame(() => requestAnimationFrame(q))); const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) continue; let op = 1; for (let a = e; a; a = a.parentElement) op *= +getComputedStyle(a).opacity; if (op < 0.05) continue; const hit = document.elementFromPoint(r.left + r.width / 2, Math.min(Math.max(r.top + r.height / 2, 1), innerHeight - 1)); const ok = hit && (e === hit || e.contains(hit) || (hit.tagName === 'LABEL' && hit.control === e) || hit.closest('label')?.control === e); if (!ok) bad.push(`${e.tagName}${e.getAttribute('href') ? '(' + e.getAttribute('href').slice(0, 30) + ')' : ''}${e.name ? '[' + e.name + ']' : ''} ← ${hit ? hit.tagName + (hit.dataset.ref ? '[' + hit.dataset.ref.slice(0, 50) + ']' : hit.dataset.framerName ? '"' + hit.dataset.framerName + '"' : hit.id ? '#' + hit.id : '') : 'null'}`); }
      res.interactive = inter.length; res.intercepted = bad;
      res.cls = +window.__cls.toFixed(4); res.shifts = window.__shifts.slice(0, 6);
      return res; }, site === 'o');
    console.log(`${vp.padEnd(9)} ${site}: scrollW ${r.scrollW}/${r.scrollW2} vs ${r.clientW} (inner ${r.innerW}) · escapes ${r.escapes.length} · interactive ${r.interactive} · intercepted ${r.intercepted.length} · CLS ${r.cls}`);
    if (r.escapes.length) console.log('   escapes:', r.escapes.slice(0, 6).join(' | '));
    if (r.intercepted.length) console.log('   intercepted:', r.intercepted.slice(0, 8).join(' | '));
    if (r.shifts.length) console.log('   shifts:', JSON.stringify(r.shifts));
    await ctx.close();
  } }
await b.close();
