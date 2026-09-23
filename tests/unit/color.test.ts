import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mixColor, parseColor, toCss } from '../../src/animations/core/color.ts';

test('parseColor: hex, short hex, rgb, rgba', () => {
  assert.deepEqual(parseColor('#7fa69b'), [127, 166, 155, 1]);
  assert.deepEqual(parseColor('#fff'), [255, 255, 255, 1]);
  assert.deepEqual(parseColor('rgb(83, 89, 86)'), [83, 89, 86, 1]);
  assert.deepEqual(parseColor('rgba(0, 0, 0, 0.2)'), [0, 0, 0, 0.2]);
});

test('mixColor: endpoints exact, alpha linear', () => {
  const a = parseColor('rgba(0, 0, 0, 0.2)'), b = parseColor('#7fa69b');
  assert.deepEqual(mixColor(a, b, 0), a);
  assert.deepEqual(mixColor(a, b, 1).map(Math.round), [127, 166, 155, 1]);
  assert.ok(Math.abs(mixColor(a, b, 0.5)[3] - 0.6) < 1e-12);
});

test('mixColor: squared-space channels (matches the original mid-transition samples)', () => {
  // original Balance label, white → #535956: R 183 was sampled when the spring progress was ≈ 0.54
  const w = parseColor('#ffffff'), ink = parseColor('rgb(83, 89, 86)');
  const r = mixColor(w, ink, 0.54)[0];
  assert.ok(Math.abs(r - Math.sqrt(255 * 255 + 0.54 * (83 * 83 - 255 * 255))) < 1e-9);
  // squared mix is lighter than a plain lerp mid-way
  assert.ok(r > 255 + 0.54 * (83 - 255));
  assert.equal(toCss([127.4, 166, 155, 1]), 'rgba(127, 166, 155, 1)');
});
