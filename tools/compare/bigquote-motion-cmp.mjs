// Diff two bigquote-motion.mjs recordings row by row (same relative positions): max |Δ| per quantity.
// Usage: node tools/compare/bigquote-motion-cmp.mjs <original.json> <clone.json>
import fs from 'node:fs';
const [of, cf] = process.argv.slice(2);
const o = JSON.parse(fs.readFileSync(of, 'utf8')).rows, c = JSON.parse(fs.readFileSync(cf, 'utf8')).rows;
const names = ['angle°', 'cos', 'line1', 'line2', 'photoY', 'waves'];
const mx = names.map(() => null), at = names.map(() => null);
o.forEach((r, i) => r.slice(1).forEach((v, j) => { const w = c[i]?.[j + 1]; if (v === null || v === undefined || w === null || w === undefined) return; const d = Math.abs(v - w); if (mx[j] === null || d > mx[j]) { mx[j] = d; at[j] = r[0]; } }));
console.log(names.map((k, j) => `${k} ${mx[j] === null ? 'n/a' : `${mx[j].toFixed(4)} (@${at[j]})`}`).join(' · '));
