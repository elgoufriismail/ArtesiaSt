import { test } from 'node:test';
import assert from 'node:assert/strict';
import { springEase, springToCssLinear } from '../../src/animations/core/spring.ts';

test('critically damped spring: monotonic, 0→1, no overshoot', () => {
  const e = springEase(0, 0.8);
  assert.equal(e(0), 0);
  assert.equal(e(1), 1);
  let prev = 0;
  for (let i = 1; i <= 100; i++) {
    const v = e(i / 100);
    assert.ok(v >= prev - 1e-9 && v <= 1 + 1e-9, `p=${i / 100}`);
    prev = v;
  }
});

test('bouncy spring overshoots', () => {
  const e = springEase(0.4, 1);
  assert.ok(Math.max(...Array.from({ length: 100 }, (_, i) => e(i / 100))) > 1);
});

test('css linear() string', () => {
  const s = springToCssLinear(0, 0.6, 10);
  assert.match(s, /^linear\(0, .*, 1\)$/);
});
