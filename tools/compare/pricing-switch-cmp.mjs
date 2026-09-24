// Compare two pricing-switch.mjs recordings: per column/channel max |Δ|, relative rmse and best time shift (phase).
// Usage: node tools/compare/pricing-switch-cmp.mjs <original.json> <clone.json>
import fs from 'node:fs';
const [of, cf] = process.argv.slice(2);
const O = JSON.parse(fs.readFileSync(of, 'utf8')), C = JSON.parse(fs.readFileSync(cf, 'utf8'));
const num = (v) => (typeof v === 'number' ? [v] : v.match(/[\d.]+/g).map(Number).concat(v.startsWith('rgb(') ? [1] : []));
const names = ['knob x', 'track', 'monthly label', 'yearly label', 'price 1 w', 'price 2 w', 'price 3 w', 'suffix 1 x', 'suffix 2 x', 'suffix 3 x'];
for (const dir of ['fwd', 'back']) {
  const o = O[dir].map((r) => [r[0], ...r.slice(1).map(num)]), c = C[dir].map((r) => [r[0], ...r.slice(1).map(num)]);
  const at = (rows, col, ch, t) => { let i = rows.findIndex((r) => r[0] >= t); if (i === -1) return rows.at(-1)[col][ch]; if (i === 0) return rows[0][col][ch]; const [a, b] = [rows[i - 1], rows[i]]; return a[col][ch] + (b[col][ch] - a[col][ch]) * (t - a[0]) / (b[0] - a[0]); };
  console.log(`== ${dir}`);
  for (let col = 1; col <= 10; col++) {
    for (let ch = 0; ch < o[0][col].length; ch++) {
      const span = Math.abs(o.at(-1)[col][ch] - o[0][col][ch]); if (span < 1e-6) continue;
      let mx = 0, se = 0; for (const r of o) { const d = at(c, col, ch, r[0]) - r[col][ch]; mx = Math.max(mx, Math.abs(d)); se += d * d; }
      let best = { s: 0, r: Infinity }; for (let s = -60; s <= 60; s++) { let e = 0; for (const r of o) { const d = at(c, col, ch, r[0] + s) - r[col][ch]; e += d * d; } const rr = Math.sqrt(e / o.length); if (rr < best.r) best = { s, r: rr }; }
      console.log(`  ${(names[col - 1] + (o[0][col].length > 1 ? `[${'rgba'[ch]}]` : '')).padEnd(18)} span ${span.toFixed(2).padStart(7)}  max|Δ| ${mx.toFixed(3).padStart(7)}  rel rmse ${(Math.sqrt(se / o.length) / span).toFixed(4)}  best shift ${String(best.s).padStart(3)} ms → ${(best.r / span).toFixed(4)}`);
    }
  }
}
