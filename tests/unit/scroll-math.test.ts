// Validates lib/scroll-math against the ORIGINAL's recorded scroll tracks (1440×900).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { targetProgress, sequenceValue, parallaxOffset, wordOpacity, markerPassed } from '../../src/lib/scroll-math.ts';

const rec = JSON.parse(fs.readFileSync(new URL('../../docs/reconnaissance/reference/animations/scroll-1440x900.json', import.meta.url), 'utf8'));
const track = (name: string) => rec.elements.filter((e: { name: string }) => e.name === name)[0].track as [number, string][];
const num = (s: string, re: RegExp) => { const m = s.match(re); return m ? Number(m[1]) : NaN; };
const down = (t: [number, string][]) => { const out: [number, string][] = []; for (const r of t) { if (out.length && r[0] < out.at(-1)![0]) break; out.push(r); } return out; };

test('B11 fold: rotateX = -90·targetProgress(big-quote, 1) within 0.2°', () => {
  for (const [y, v] of down(track('Shape Container'))) {
    const meas = /rotateX/.test(v) ? num(v, /rotateX\((-?[\d.]+)deg/) : 0;
    assert.ok(Math.abs(meas - -90 * targetProgress(9336, 900, y, 900, 1)) < 0.2, `y=${y}`);
  }
});

test('B2 portrait fade: opacity = 1 - targetProgress(Hero, 0) within 0.005', () => {
  for (const [y, v] of down(track('Hero Image'))) {
    assert.ok(Math.abs(num(v, /opacity:([\d.e-]+)/) - (1 - targetProgress(0, 900, y, 900, 0))) < 0.005, `y=${y}`);
  }
});

test('B5 waves: sequenceValue([0,1,0]) within 0.005', () => {
  for (const [y, v] of down(track('Waves Container'))) {
    const pred = sequenceValue([0, 1, 0], [{ docTop: 4592, height: 900, threshold: 1 }, { docTop: 9336, height: 900, threshold: 1 }], y, 900);
    assert.ok(Math.abs(num(v, /opacity:([\d.e-]+)/) - pred) < 0.005, `y=${y}`);
  }
});

test('B4 parallax: service image translateY within 0.01px', () => {
  for (const [y, v] of down(track('Desktop>img'))) {
    assert.ok(Math.abs(num(v, /translateY\((-?[\d.]+)px/) - parallaxOffset(2380 - y, 560, 900, 200)) < 0.01, `y=${y}`);
  }
});

test('B2 portrait fade at 390×844 uses the Hero height (596), not the viewport', () => {
  const rec390 = JSON.parse(fs.readFileSync(new URL('../../docs/reconnaissance/reference/animations/scroll-390x844.json', import.meta.url), 'utf8'));
  const t = rec390.elements.find((e: { name: string }) => e.name === 'Hero Image').track as [number, string][];
  for (const [y, v] of down(t)) {
    assert.ok(Math.abs(num(v, /opacity:([\d.e-]+)/) - (1 - targetProgress(0, 596, y, 844, 0))) < 0.005, `y=${y}`);
  }
});

test('B15 word opacity slices', () => {
  assert.equal(wordOpacity(0, 0, 4), 0.2);
  assert.equal(wordOpacity(0.25, 0, 4), 1);
  assert.equal(wordOpacity(0.25, 1, 4), 0.2);
  assert.equal(wordOpacity(1, 3, 4), 1);
});

test('markerPassed reproduces the original trigger positions binary-searched at 1440×900', () => {
  // toggle-start marker: layout top 1144 (no transform); toggle-on marker: layout top 1850 (visual 1846, translateY −4)
  const cases: [string, number, number, number][] = [
    ['switch → Off (top edge)', 1144, 0, 693],
    ['hero lines fade (bottom edge)', 1144, 8, 701],
    ['switch → On (top edge)', 1850, 0, 1399],
    ['Page Intro fade (bottom edge)', 1850, 8, 1407],
  ];
  for (const [name, top, h, y] of cases) {
    assert.equal(markerPassed(top, y - 1, 900, 0.5, h), false, `${name} not before ${y}`);
    assert.equal(markerPassed(top, y, 900, 0.5, h), true, `${name} at ${y}`);
  }
});
