'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../geom/roofs');
const { rho } = require('../geom/vaults');

const k3 = (c) => `${c.x},${c.y},${c.z}`;

// Je Säule (min y, max y)
function columnsOf(cells) {
  const m = new Map();
  for (const c of cells) {
    const k = `${c.x},${c.z}`;
    const e = m.get(k);
    if (!e) m.set(k, { x: c.x, z: c.z, lo: c.y, hi: c.y });
    else { e.lo = Math.min(e.lo, c.y); e.hi = Math.max(e.hi, c.y); }
  }
  return m;
}

// Dichtheit: benachbarte Säulen haben überlappende oder angrenzende y-Bereiche,
// und die Zellmenge ist über Flächenkontakte zusammenhängend.
function assertTight(cells) {
  assert.ok(cells.length > 0);
  const cols = columnsOf(cells);
  for (const c of cols.values()) {
    for (const [dx, dz] of [[1, 0], [0, 1]]) {
      const n = cols.get(`${c.x + dx},${c.z + dz}`);
      if (!n) continue;
      assert.ok(n.lo <= c.hi + 1 && c.lo <= n.hi + 1, `Lücke bei ${c.x},${c.z}`);
    }
  }
  const set = new Set(cells.map(k3));
  const seen = new Set([k3(cells[0])]);
  const stack = [cells[0]];
  while (stack.length) {
    const c = stack.pop();
    for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
      const n = { x: c.x + dx, y: c.y + dy, z: c.z + dz };
      const k = k3(n);
      if (set.has(k) && !seen.has(k)) { seen.add(k); stack.push(n); }
    }
  }
  assert.equal(seen.size, set.size);
}

test('surface: Dichtung zu niedrigeren Nachbarn', () => {
  const h = { '0,0': 10, '1,0': 5, '2,0': 5 };
  const cells = [...R.surface({ columns: [[0, 0], [1, 0], [2, 0]], height: (x, z) => h[`${x},${z}`] })];
  const cols = columnsOf(cells);
  assert.equal(cols.get('0,0').lo, 6); // bis eins über dem niedrigeren Nachbarn
  assert.equal(cols.get('0,0').hi, 10);
  assert.equal(cols.get('1,0').lo, 5);
  assert.equal(cells.length, 5 + 1 + 1);
  // Reihenfolge x, z, y aufsteigend
  assert.deepEqual(cells.slice(0, 2).map(k3), ['0,6,0', '0,7,0']);
});

test('Satteldach 0..20 x 0..10, First entlang x', () => {
  const p = { x0: 0, x1: 20, z0: 0, z1: 10, ridgeAxis: 'x', eaveY: 70, ridgeY: 80 };
  const cells = [...R.gableRoof(p)];
  const cols = columnsOf(cells);
  assert.equal(cols.get('3,5').hi, 80);
  assert.equal(cols.get('3,0').hi, 70);
  assert.equal(cols.get('3,10').hi, 70);
  for (let x = 0; x <= 20; x++) {
    for (let z = 0; z <= 10; z++) {
      assert.equal(cols.get(`${x},${z}`).hi, cols.get(`${x},${10 - z}`).hi);
      assert.equal(cols.get(`${x},${z}`).lo, cols.get(`${x},${10 - z}`).lo);
    }
  }
  assertTight(cells);
});

test('Satteldach entlang z und Dicke', () => {
  const cells = [...R.gableRoof({ x0: 0, x1: 12, z0: 0, z1: 20, ridgeAxis: 'z', eaveY: 70, ridgeY: 76, thickness: 2 })];
  assert.equal(columnsOf(cells).get('6,4').hi, 76 - 0 > 0 ? Math.floor(76 - 6 * 4 / 6) : 0);
  assertTight(cells);
});

test('Pultdach', () => {
  for (const axis of ['x', 'z']) {
    for (const highAt of ['min', 'max']) {
      const cells = [...R.shedRoof({ x0: 0, x1: 15, z0: 0, z1: 9, axis, highAt, highY: 90, lowY: 80 })];
      const cols = columnsOf(cells);
      const ends = axis === 'x' ? ['0,4', '15,4'] : ['4,0', '4,9'];
      const [lo, hi] = highAt === 'min' ? [ends[1], ends[0]] : [ends[0], ends[1]];
      assert.equal(cols.get(hi).hi, 90);
      assert.equal(cols.get(lo).hi, 80);
      assertTight(cells);
    }
  }
});

test('octPyramid: D4-Symmetrie und Dichtheit', () => {
  for (const solid of [false, true]) {
    const cells = [...R.octPyramid({ cx: 0, cz: 0, a0: 20, y0: 70, a1: 0, y1: 90, solid })];
    const set = new Set(cells.map(k3));
    for (const c of cells) {
      assert.ok(set.has(k3({ x: -c.x, y: c.y, z: c.z })));
      assert.ok(set.has(k3({ x: c.x, y: c.y, z: -c.z })));
      assert.ok(set.has(k3({ x: c.z, y: c.y, z: c.x })));
    }
    assertTight(cells);
    assert.equal(columnsOf(cells).get('0,0').hi, 90);
  }
});

test('octPyramid: Stumpf mit Plateau', () => {
  const cells = [...R.octPyramid({ cx: 0, cz: 0, a0: 12, y0: 70, a1: 4, y1: 78 })];
  const cols = columnsOf(cells);
  assert.equal(cols.get('0,0').hi, 78);
  assert.equal(cols.get('3,0').hi, 78);
  assertTight(cells);
});

test('octPyramid: Halbebene', () => {
  for (const [axis, sign] of [['x', 1], ['z', -1]]) {
    const cx = 4, cz = -3;
    const cells = [...R.octPyramid({ cx, cz, a0: 10, y0: 70, a1: 2, y1: 80, half: { axis, sign } })];
    assert.ok(cells.length > 0);
    for (const c of cells) {
      const d = axis === 'x' ? c.x - cx : c.z - cz;
      assert.ok(sign * d >= 0);
      assert.ok(rho(c.x - cx, c.z - cz) <= 10);
    }
    assertTight(cells);
  }
});

test('squarePyramid', () => {
  for (const solid of [false, true]) {
    const cells = [...R.squarePyramid({ cx: 0, cz: 0, h0: 10, y0: 70, h1: 0, y1: 80, solid })];
    const set = new Set(cells.map(k3));
    for (const c of cells) assert.ok(set.has(k3({ x: c.z, y: c.y, z: c.x })));
    assert.equal(columnsOf(cells).size, 21 * 21);
    assertTight(cells);
  }
});
