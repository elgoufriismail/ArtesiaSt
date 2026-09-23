import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepSpring } from '../../src/animations/core/spring.ts';

const P = { stiffness: 150, damping: 25 }; // Services card proximity (fitted on the original, ζ ≈ 1.021)

test('stepSpring: frame-rate independent (1 step == 60 steps)', () => {
  const one = stepSpring({ x: 440, v: 0 }, 560, 0.5, P);
  let s = { x: 440, v: 0 };
  for (let i = 0; i < 60; i++) s = stepSpring(s, 560, 0.5 / 60, P);
  assert.ok(Math.abs(one.x - s.x) < 1e-9 && Math.abs(one.v - s.v) < 1e-9);
});

test('stepSpring: matches the original card-height samples (440 → 560 from rest)', () => {
  // recorded on the original (Card A, cursor far → centre, 1440×900), time since the spring started
  const prog = (t: number) => stepSpring({ x: 0, v: 0 }, 1, t, P).x;
  for (const [t, measured] of [[0.114, 0.4022], [0.214, 0.7277], [0.314, 0.8881], [0.414, 0.9563], [0.614, 0.9936]]) {
    assert.ok(Math.abs(prog(t) - measured) < 0.002, `${t} s → ${prog(t)} vs ${measured}`);
  }
});

test('stepSpring: under-, critically and over-damped all settle without NaN', () => {
  for (const damping of [5, 2 * Math.sqrt(150), 40]) {
    let s = { x: 0, v: 3 };
    for (let i = 0; i < 600; i++) s = stepSpring(s, 1, 1 / 60, { stiffness: 150, damping });
    assert.ok(Number.isFinite(s.x) && Math.abs(s.x - 1) < 1e-3, `damping ${damping} → ${s.x}`);
  }
});
