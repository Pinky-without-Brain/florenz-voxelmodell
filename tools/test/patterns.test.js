'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../geom/patterns');
const { TYPES } = require('../spec/palette');

function sample(fn) {
  const out = [];
  for (let x = -25; x < 25; x++) {
    for (let y = 60; y < 110; y += 3) {
      for (let z = -25; z < 25; z += 2) out.push(fn(x, y, z));
    }
  }
  return out;
}

function checkPalette(fn) {
  const a = sample(fn), b = sample(fn);
  assert.deepEqual(a, b);
  for (const t of a) assert.ok(TYPES.includes(t), `Typ nicht in Palette: ${t}`);
  return new Set(a);
}

test('incrustation', () => {
  for (const axis of ['x', 'z']) {
    const used = checkPalette(P.incrustation({ panelW: 8, panelH: 6, axis, u0: 3, v0: 64 }));
    assert.deepEqual([...used].sort(), ['dark_prismarine', 'polished_granite', 'smooth_quartz']);
  }
  const f = P.incrustation({ panelW: 8, panelH: 8, axis: 'x' });
  assert.equal(f(0, 0, 0), 'dark_prismarine');
  // Feld (0,0): Mitte hat die Raute, Feld (1,0) nicht (Schachbrett)
  assert.equal(f(4, 4, 0), 'polished_granite');
  assert.equal(f(4 + 9, 4, 0), 'smooth_quartz');
});

test('cosmati', () => {
  const used = checkPalette(P.cosmati({ cell: 8 }));
  assert.deepEqual([...used].sort(), ['calcite', 'dark_prismarine', 'polished_granite', 'smooth_quartz']);
  const f = P.cosmati({ center: [0, 0], cell: 8 });
  assert.equal(f(0, 64, 5), 'calcite');
  assert.equal(f(4, 64, 4), 'polished_granite');
  assert.equal(f(1, 64, 1), 'smooth_quartz');
  assert.equal(f(-4, 64, -4), 'polished_granite');
});

test('herringbone', () => {
  const used = checkPalette(P.herringbone({}));
  assert.deepEqual([...used].sort(), ['bricks', 'terracotta']);
  const f = P.herringbone({ period: 4 });
  // 8 Segmente: Drehung um 90 Grad (zwei Segmente) ergibt dieselbe Zuordnung
  for (let y = 66; y < 70; y++) {
    assert.equal(f(10, y, 3), f(-3, y, 10));
    assert.equal(f(10, y, 3), f(-10, y, -3));
  }
  assert.equal(f(10, 66, 1), f(10, 70, 1));
});

test('bands', () => {
  const f = P.bands({ types: ['calcite', 'smooth_quartz', 'bricks'], period: 2, offset: 1 });
  assert.equal(f(0, 1, 0), 'calcite');
  assert.equal(f(0, 2, 0), 'calcite');
  assert.equal(f(0, 3, 0), 'smooth_quartz');
  assert.equal(f(0, 7, 0), 'calcite');
  assert.equal(f(0, 0, 0), 'bricks');
  checkPalette(f);
});
