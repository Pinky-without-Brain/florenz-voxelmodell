'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../geom/shapes');

const count = (it) => { let n = 0; for (const _ of it) n++; return n; };
const keyOf = (c) => `${c.x},${c.y},${c.z}`;
const toSet = (it) => new Set([...it].map(keyOf));

test('box und hollowBox', () => {
  assert.equal(count(S.box(0, 0, 0, 2, 2, 2)), 27);
  assert.equal(count(S.box(2, 2, 2, 0, 0, 0)), 27);
  assert.equal(count(S.hollowBox(0, 0, 0, 4, 4, 4)), 98);
  assert.equal(count(S.hollowBox(0, 0, 0, 4, 4, 4, 1, { top: false, bottom: false })), 80);
});

test('disk', () => {
  assert.equal(count(S.disk(0, 0, 0, 64)), 1);
  assert.equal(count(S.disk(0, 0, 1, 64)), 9);
  assert.equal(count(S.disk(0, 0, 2, 64)), 21);
  assert.equal(count(S.cylinderShell(0, 0, 3, -1, 0, 0)), count(S.cylinder(0, 0, 3, 0, 0)));
});

test('octagonPrism und Symmetrie', () => {
  assert.equal(count(S.octagonPrism(0, 0, 0, 64, 64)), 1);
  assert.equal(count(S.octagonPrism(0, 0, 2, 64, 64)), 21);
  const set = toSet(S.octagonPrism(0, 0, 45, 64, 64));
  for (const c of S.octagonPrism(0, 0, 45, 64, 64)) {
    for (const [x, z] of [[c.x, c.z], [-c.x, c.z], [c.x, -c.z], [-c.x, -c.z],
      [c.z, c.x], [-c.z, c.x], [c.z, -c.x], [-c.z, -c.x]]) {
      assert.ok(set.has(`${x},64,${z}`));
    }
  }
});

test('octagonRing = Differenz der Prismen', () => {
  const ring = count(S.octagonRing(0, 0, 54, 45, 0, 0));
  assert.equal(ring, count(S.octagonPrism(0, 0, 54, 0, 0)) - count(S.octagonPrism(0, 0, 45, 0, 0)));
  assert.ok(ring > 0);
});

test('sphere', () => {
  assert.equal(count(S.sphere(0, 0, 0, 1)), 19);
});

test('polygonPrism', () => {
  assert.equal(count(S.polygonPrism([[0, 0], [4, 0], [4, 4], [0, 4]], 0, 0)), 25);
  assert.equal(count(S.polygonPrism([[0, 0], [4, 0], [0, 4]], 0, 0)), 15);
});

test('line3d faceConnected', () => {
  const cells = [...S.line3d([0, 0, 0], [5, 3, 2], { faceConnected: true })];
  assert.equal(cells.length, 11);
  assert.deepEqual(cells[0], { x: 0, y: 0, z: 0 });
  assert.deepEqual(cells[cells.length - 1], { x: 5, y: 3, z: 2 });
  for (let i = 1; i < cells.length; i++) {
    const a = cells[i - 1], b = cells[i];
    assert.equal(Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z), 1);
  }
});

test('line3d Bresenham Endpunkte und 26er-Nachbarschaft', () => {
  const cells = [...S.line3d([0, 0, 0], [5, 3, 2])];
  assert.equal(cells.length, 6);
  assert.deepEqual(cells[5], { x: 5, y: 3, z: 2 });
  for (let i = 1; i < cells.length; i++) {
    assert.ok(Math.max(Math.abs(cells[i].x - cells[i - 1].x), Math.abs(cells[i].y - cells[i - 1].y),
      Math.abs(cells[i].z - cells[i - 1].z)) === 1);
  }
});

test('dihedral8 und mirror4', () => {
  assert.equal(count(S.dihedral8([{ x: 1, y: 0, z: 2 }])), 8);
  assert.equal(count(S.dihedral8([{ x: 1, y: 0, z: 1 }])), 4);
  assert.equal(count(S.mirror4([{ x: 0, y: 0, z: 3 }])), 2);
  assert.equal(count(S.mirror4([{ x: 1, y: 0, z: 2 }])), 4);
});
