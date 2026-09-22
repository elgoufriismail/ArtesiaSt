// Pixel diff of viewport frames (same capture protocol on both sides).
// Masked before diffing (filled with magenta in BOTH images):
//   - clone [data-standin] rects (photo/text stand-ins differ by design)
//   - original promo-badge rects (not part of the design)
// Original frames: tools/.runs/original/<vp>/ if present, else docs/reconnaissance/reference/screenshots/<vp>/
//   (recon frames have no badge masks → a fixed per-viewport badge box is used).
//
// Usage: node tools/compare/pixels.mjs [vp ...] [--threshold=0.1]
// Output: tools/.runs/pixels/<vp>/<frame>-diff.png + tools/.runs/report-pixels.md
import fs from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { REF_DIR, RUNS_DIR, VIEWPORTS, ensureDir, parseVp } from '../recon/lib.mjs';

const args = process.argv.slice(2);
const threshold = Number((args.find((a) => a.startsWith('--threshold=')) || '--threshold=0.1').split('=')[1]);
const vps = args.filter((a) => !a.startsWith('--'));

// Promo badge boxes measured in recon (x, y, w, h in viewport px), padded by 4px.
const BADGE = (W, H) => (W >= 1200
  ? [[W - 164, H - 167, 144, 147]]
  : W >= 810 ? [[W - 164, H - 62, 144, 46]] : [[W - 164, H - 62, 144, 46]]);

const read = (f) => PNG.sync.read(fs.readFileSync(f));
function fillRects(png, rects) {
  for (const [x, y, w, h] of rects) {
    for (let yy = Math.max(0, y); yy < Math.min(png.height, y + h); yy++) {
      for (let xx = Math.max(0, x); xx < Math.min(png.width, x + w); xx++) {
        const i = (yy * png.width + xx) * 4;
        png.data[i] = 255; png.data[i + 1] = 0; png.data[i + 2] = 255; png.data[i + 3] = 255;
      }
    }
  }
}

const lines = ['# Pixel report', '', `threshold ${threshold}; masked: clone stand-ins + original promo badge`, '', '| viewport | frame (scrollY) | diff % |', '|---|---|---|'];
for (const vp of vps.length ? vps : VIEWPORTS) {
  const [W, H] = parseVp(vp);
  const cloneDir = `${RUNS_DIR}clone/${vp}`;
  if (!fs.existsSync(`${cloneDir}/index.json`)) { console.log(`${vp}: no clone capture`); continue; }
  const liveOrig = `${RUNS_DIR}original/${vp}`;
  const origDir = fs.existsSync(`${liveOrig}/index.json`) ? liveOrig : `${REF_DIR}screenshots/${vp}`;
  const oIdx = JSON.parse(fs.readFileSync(`${origDir}/index.json`, 'utf8'));
  const cIdx = JSON.parse(fs.readFileSync(`${cloneDir}/index.json`, 'utf8'));
  const out = ensureDir(`${RUNS_DIR}pixels/${vp}`);
  for (const cs of cIdx.shots) {
    const os = oIdx.shots.find((s) => s.actual === cs.actual);
    if (!os) { lines.push(`| ${vp} | ${cs.actual} | no original frame at this scrollY |`); continue; }
    const a = read(`${origDir}/${os.file}`), b = read(`${cloneDir}/${cs.file}`);
    const masks = [...(os.masks || BADGE(W, H)), ...cs.masks];
    fillRects(a, masks); fillRects(b, masks);
    const diff = new PNG({ width: W, height: H });
    const n = pixelmatch(a.data, b.data, diff.data, W, H, { threshold });
    fs.writeFileSync(`${out}/${cs.file.replace('.png', '')}-diff.png`, PNG.sync.write(diff));
    const pct = ((100 * n) / (W * H)).toFixed(2);
    lines.push(`| ${vp} | ${cs.actual} | ${pct} |`);
  }
  console.log(`${vp}: ${cIdx.shots.length} frames compared`);
}
fs.writeFileSync(`${RUNS_DIR}report-pixels.md`, lines.join('\n') + '\n');
