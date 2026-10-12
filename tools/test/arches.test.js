'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const A = require('../geom/arches');

const key2 = (c) => `${c.u},${c.v}`;

test('archHeight: Eckwerte', () => {
  assert.equal(A.archHeight(0, 5, 0.5), 5);
  assert.equal(A.archHeight(5, 5, 0.5), 0);
  assert.ok(Math.abs(A.archHeight(0, 5, 1) - 5 * Math.sqrt(3)) < 1e-9);
  assert.ok(Number.isNaN(A.archHeight(6, 5, 1)));
});

test('archOpening(2, 0.5): symmetrisch, monoton, genaue Zahl', () => {
  const cells = [...A.archOpening(2, 0.5)];
  const set = new Set(cells.map(key2));
  for (const c of cells) assert.ok(set.has(`${-c.u},${c.v}`));
  const perU = new Map();
  for (const c of cells) perU.set(c.u, (perU.get(c.u) || 0) + 1);
  assert.ok(perU.get(0) >= perU.get(1) && perU.get(1) >= perU.get(2));
  // Halbweite 2,5, R = 2,5: h(0)=2,5 -> v 0..2 (3); h(±1)=√5,25≈2,29 -> v 0..1 (2);
  // h(±2)=√2,25=1,5 -> v+0,5<=1,5 -> v 0..1 (2). Summe 3 + 2·2 + 2·2 = 11.
  assert.equal(perU.get(0), 3);
  assert.equal(perU.get(1), 2);
  assert.equal(perU.get(2), 2);
  assert.equal(cells.length, 11);
});

test('archOpening: Kämpferspalte unterhalb springV offen', () => {
  const set = new Set([...A.archOpening(2, 0.5, { springV: 3 })].map(key2));
  for (let u = -2; u <= 2; u++) for (let v = 0; v < 3; v++) assert.ok(set.has(`${u},${v}`));
});

test('archRing und archOpening sind disjunkt, Vereinigung = Öffnung w+t', () => {
  const ring = new Set([...A.archRing(3, 1, 2)].map(key2));
  const open = new Set([...A.archOpening(3, 1)].map(key2));
  const big = new Set([...A.archOpening(5, 1)].map(key2));
  for (const k of ring) assert.ok(!open.has(k));
  const union = new Set([...ring, ...open]);
  assert.deepEqual([...union].sort(), [...big].sort());
});

test('archRing: Pfosten nur mit jambs', () => {
  const o = { springV: 2 };
  const without = [...A.archRing(2, 0.5, 1, o)];
  const withJ = [...A.archRing(2, 0.5, 1, { ...o, jambs: true })];
  assert.ok(without.every((c) => c.v >= 2));
  assert.ok(withJ.some((c) => c.v < 2 && Math.abs(c.u) === 3));
});

test('elevation mit Rechtecköffnung', () => {
  const cells = [...A.elevation({
    u0: 0, u1: 10, v0: 0, v1: 10,
    openings: [{ type: 'rect', u0: 2, u1: 4, v0: 2, v1: 4 }],
  })];
  assert.equal(cells.length, 112);
});

test('elevation mit Bogen- und Kreisöffnung', () => {
  const full = [...A.elevation({ u0: -5, u1: 5, v0: 0, v1: 12 })].length;
  const arch = [...A.elevation({
    u0: -5, u1: 5, v0: 0, v1: 12,
    openings: [{ type: 'arch', cu: 0, v0: 0, w: 2, f: 0.5, springV: 0 }],
  })].length;
  assert.equal(full - arch, 11);
  const circ = [...A.elevation({
    u0: 0, u1: 10, v0: 0, v1: 10,
    openings: [{ type: 'circle', cu: 5, cv: 5, r: 2 }],
  })].length;
  assert.equal(121 - circ, 21);
});

test('placeElevation: axis z, depth [0,2]', () => {
  const cells = [...A.elevation({ u0: 0, u1: 3, v0: 0, v1: 3 })];
  const origin = { x: 7, y: 65, z: -2 };
  const placed = [...A.placeElevation(cells, { axis: 'z', origin, depth: [0, 2] })];
  assert.equal(placed.length, cells.length * 3);
  for (const p of placed) assert.ok(p.x >= 7 && p.x <= 9);
  assert.ok(placed.every((p) => p.z >= -2 && p.z <= 1 && p.y >= 65 && p.y <= 68));
});

test('placeElevation: axis x', () => {
  const placed = [...A.placeElevation([{ u: 2, v: 1 }], { axis: 'x', origin: { x: 10, y: 5, z: 3 }, depth: [-1, 0] })];
  assert.deepEqual(placed, [{ x: 12, y: 6, z: 2 }, { x: 12, y: 6, z: 3 }]);
});

test('profileForRise: Spitzbogen und Ellipse', () => {
  const sharp = A.profileForRise(5, 8);
  const f = ((8 / 5) ** 2 + 1) / 4;
  assert.ok(Math.abs(sharp(0) - 8) < 1e-9);
  assert.ok(Math.abs(sharp(3) - A.archHeight(3, 5, f)) < 1e-12);
  assert.ok(Math.abs(sharp(5)) < 1e-9);
  assert.ok(Number.isNaN(sharp(5.1)));
  const ell = A.profileForRise(5, 3);
  assert.ok(Math.abs(ell(0) - 3) < 1e-9);
  assert.ok(Math.abs(ell(3) - 3 * Math.sqrt(1 - 0.36)) < 1e-12);
  assert.equal(ell(5), 0);
  assert.ok(Number.isNaN(ell(-5.1)));
  assert.equal(ell(2), ell(-2));
});

test('profileForRise: stetig bei rise = w (Rundbogen)', () => {
  const w = 6;
  const below = A.profileForRise(w, w - 1e-9), at = A.profileForRise(w, w), above = A.profileForRise(w, w + 1e-9);
  for (const u of [0, 1, 3, 5.5]) {
    assert.ok(Math.abs(below(u) - at(u)) < 1e-6);
    assert.ok(Math.abs(above(u) - at(u)) < 1e-6);
    assert.ok(Math.abs(at(u) - Math.sqrt(w * w - u * u)) < 1e-9);
  }
});

test('archOpeningRise und archRingRise', () => {
  // rise = w + 0,5 (Halbweite 2,5): identisch mit archOpening(2, 0.5)
  const a = [...A.archOpeningRise(2, 2.5)].map(key2).sort();
  const b = [...A.archOpening(2, 0.5)].map(key2).sort();
  assert.deepEqual(a, b);
  const ring = new Set([...A.archRingRise(3, 4, 2)].map(key2));
  const open = new Set([...A.archOpeningRise(3, 4)].map(key2));
  const big = new Set([...A.archOpeningRise(5, 4)].map(key2));
  for (const k of ring) assert.ok(!open.has(k));
  assert.deepEqual([...new Set([...ring, ...open])].sort(), [...big].sort());
  // Korbbogen: symmetrisch
  const ell = new Set([...A.archOpeningRise(4, 3)].map(key2));
  for (const k of ell) { const [u, v] = k.split(',').map(Number); assert.ok(ell.has(`${-u},${v}`)); }
});
