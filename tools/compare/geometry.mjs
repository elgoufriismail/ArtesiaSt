// Geometry diff: clone [data-ref] boxes vs original named Framer layers.
// Primary, content-independent accuracy check (works with stand-in text/images).
//
// Usage: node tools/compare/geometry.mjs [vp ...] [--tol=2]
// Needs:  tools/.runs/clone/<vp>/named.json            (node tools/recon/capture.mjs clone <vp>)
// Original: tools/.runs/original/<vp>/named.json, else derived offline from
//           docs/reconnaissance/reference/dom/nodes-<vp>.json
// Output: tools/.runs/report-geometry-<vp>.md + console summary
import fs from 'node:fs';
import { REF_DIR, RUNS_DIR, VIEWPORTS } from '../recon/lib.mjs';

const args = process.argv.slice(2);
const tol = Number((args.find((a) => a.startsWith('--tol=')) || '--tol=2').split('=')[1]);
const vps = args.filter((a) => !a.startsWith('--'));

/** Rebuild name paths from the recon depth-first node dump (same rules as lib.dumpNamed). */
function originalFromRecon(vp) {
  const nodes = JSON.parse(fs.readFileSync(`${REF_DIR}dom/nodes-${vp}.json`, 'utf8'));
  const stack = []; // [depth, prefix]
  const seen = new Map();
  const out = [];
  for (const n of nodes) {
    if (n.name) n.name = n.name.replace(/\s+/g, ' '); // Framer names may contain NBSP
    while (stack.length && stack.at(-1)[0] >= n.d) stack.pop();
    const prefix = stack.length ? stack.at(-1)[1] : '';
    let next = prefix;
    if (n.name === 'Main Container') next = '';
    else if (n.tag === 'nav') next = 'Nav';
    else if (n.name === 'Footer Container') next = 'Footer Container';
    else if (n.name) {
      let path = prefix ? `${prefix}/${n.name}` : n.name;
      const k = (seen.get(path) || 0) + 1;
      seen.set(path, k);
      if (k > 1) path += `#${k}`;
      next = path;
      if (n.rect[2] > 0 || n.rect[3] > 0) out.push({ path, tag: n.tag, rect: n.rect });
    }
    stack.push([n.d, next]);
  }
  return out;
}

function loadOriginal(vp) {
  const live = `${RUNS_DIR}original/${vp}/named.json`;
  return fs.existsSync(live) ? JSON.parse(fs.readFileSync(live, 'utf8')) : originalFromRecon(vp);
}

const topOf = (path, byPath) => byPath.get(path.split('/')[0])?.rect[1] ?? 0;

let failed = false;
for (const vp of vps.length ? vps : VIEWPORTS) {
  const clonePath = `${RUNS_DIR}clone/${vp}/named.json`;
  if (!fs.existsSync(clonePath)) {
    console.log(`${vp}: no clone capture (run: node tools/recon/capture.mjs clone ${vp})`);
    continue;
  }
  const orig = loadOriginal(vp);
  const clone = JSON.parse(fs.readFileSync(clonePath, 'utf8'));
  const O = new Map(orig.map((e) => [e.path, e]));
  const C = new Map(clone.map((e) => [e.path, e]));
  const rows = [];
  const unknown = [];
  for (const c of clone) {
    const o = O.get(c.path);
    if (!o) { unknown.push(c.path); continue; }
    const [ox, oy, ow, oh] = o.rect, [cx, cy, cw, ch] = c.rect;
    const relO = oy - topOf(o.path, O), relC = cy - topOf(c.path, C);
    const d = { dx: cx - ox, dy: cy - oy, dRel: relC - relO, dw: cw - ow, dh: ch - oh };
    const worst = Math.max(Math.abs(d.dx), Math.abs(d.dRel), Math.abs(d.dw), Math.abs(d.dh));
    rows.push({ path: c.path, o: o.rect, c: c.rect, ...d, worst, ok: worst <= tol });
  }
  rows.sort((a, b) => b.worst - a.worst);
  const ok = rows.filter((r) => r.ok).length;
  const topLevel = orig.filter((e) => !e.path.includes('/'));
  const coverage = topLevel.filter((e) => C.has(e.path)).length;
  const md = [
    `# Geometry report ${vp} (tolerance ${tol}px; dy is section-relative)`,
    '',
    `matched ${rows.length} · within tolerance ${ok} · unknown clone refs ${unknown.length} · top-level coverage ${coverage}/${topLevel.length}`,
    '',
    '| ok | path | original x,y,w,h | clone x,y,w,h | dx | dy(rel) | dw | dh |',
    '|---|---|---|---|---|---|---|---|',
    ...rows.map((r) => `| ${r.ok ? '✓' : '✗'} | ${r.path} | ${r.o.join(',')} | ${r.c.join(',')} | ${r.dx} | ${r.dRel} | ${r.dw} | ${r.dh} |`),
    '',
    unknown.length ? `Unknown clone refs (not found in original):\n${unknown.map((u) => `- ${u}`).join('\n')}` : '',
  ].join('\n');
  fs.writeFileSync(`${RUNS_DIR}report-geometry-${vp}.md`, md);
  console.log(`${vp}: matched ${rows.length}, ok ${ok}, off ${rows.length - ok}, unknown ${unknown.length}, top-level ${coverage}/${topLevel.length}`);
  if (ok < rows.length) failed = true;
}
process.exitCode = failed ? 1 : 0;
