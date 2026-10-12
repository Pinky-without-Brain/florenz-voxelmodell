'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { VoxelGrid, VoxelConflictError, packKey, unpackKey } = require('../geom/grid');
const { box } = require('../geom/shapes');

test('packKey/unpackKey Round-Trip', () => {
  for (const [x, y, z] of [[-4096, 0, -4096], [4095, 511, 4095], [-4096, 511, 4095], [4095, 0, -4096], [-512, 0, -512], [511, 511, 511], [0, 64, 0], [3000, 70, -3500]]) {
    assert.deepEqual(unpackKey(packKey(x, y, z)), { x, y, z });
  }
});

test('doppeltes set wirft VoxelConflictError (auch über Writer)', () => {
  const g = new VoxelGrid();
  const a = g.writer({ module: 1, part: 'wandA' });
  const b = g.writer({ module: 2, part: 'wandB' });
  a.set(1, 2, 3, 'stone');
  assert.throws(() => a.set(1, 2, 3, 'stone'), VoxelConflictError);
  assert.throws(() => b.set(1, 2, 3, 'brick'), (e) => {
    assert.ok(e instanceof VoxelConflictError);
    assert.ok(e.message.includes('wandA') && e.message.includes('wandB'));
    assert.ok(e.message.includes('(1,2,3)'));
    assert.equal(e.existing.part, 'wandA');
    assert.equal(e.incoming.part, 'wandB');
    assert.equal(e.x, 1);
    return true;
  });
  assert.equal(g.size, 1);
});

test('Validierung von Koordinaten, Typ und Tag', () => {
  const g = new VoxelGrid();
  const w = g.writer({ module: 0, part: 'p' });
  assert.throws(() => w.set(0.5, 0, 0, 's'), TypeError);
  assert.throws(() => w.set(4096, 0, 0, 's'), RangeError);
  assert.throws(() => w.set(-4097, 0, 0, 's'), RangeError);
  assert.throws(() => w.set(0, 0, 4096, 's'), RangeError);
  assert.throws(() => w.set(0, 0, -4097, 's'), RangeError);
  assert.throws(() => w.set(0, 512, 0, 's'), RangeError);
  assert.throws(() => w.set(0, -1, 0, 's'), RangeError);
  assert.throws(() => w.set(0, 0, 0, ''), TypeError);
  assert.throws(() => g.writer({ module: 10, part: 'p' }), RangeError);
  assert.throws(() => g.writer({ module: 0, part: '' }), TypeError);
});

test('seq, forEach-Reihenfolge, bounds, countsBy', () => {
  const g = new VoxelGrid();
  const a = g.writer({ module: 1, part: 'a' });
  const b = g.writer({ module: 2, part: 'b' });
  a.set(5, 1, 5, 'x');
  b.set(-3, 9, 2, 'y');
  a.set(0, 0, -7, 'x');
  assert.deepEqual(g.get(5, 1, 5), { type: 'x', module: 1, part: 'a', seq: 0 });
  assert.equal(g.get(-3, 9, 2).seq, 1);
  assert.equal(g.get(0, 0, -7).seq, 2);
  assert.equal(g.get(1, 1, 1), undefined);
  assert.ok(g.has(5, 1, 5));
  const seen = [];
  g.forEach((x, y, z, e) => seen.push([x, y, z, e.seq]));
  assert.deepEqual(seen, [[5, 1, 5, 0], [-3, 9, 2, 1], [0, 0, -7, 2]]);
  assert.deepEqual(g.bounds(), { minX: -3, maxX: 5, minY: 0, maxY: 9, minZ: -7, maxZ: 5 });
  assert.deepEqual([...g.countsBy('part')], [['a', 2], ['b', 1]]);
  assert.deepEqual([...g.countsBy('module')], [[1, 2], [2, 1]]);
  assert.deepEqual([...g.countsBy('type')], [['x', 2], ['y', 1]]);
  assert.equal(a.count, 2);
  assert.equal(b.count, 1);
  assert.equal(new VoxelGrid().bounds(), null);
});

test('fill mit String und Funktion (null überspringt)', () => {
  const g = new VoxelGrid();
  const w = g.writer({ module: 3, part: 'f' });
  assert.equal(w.fill(box(0, 0, 0, 1, 1, 1), 'stone'), 8);
  const w2 = g.writer({ module: 3, part: 'g' });
  const n = w2.fill(box(0, 5, 0, 3, 5, 0), (x) => (x % 2 === 0 ? 'a' : null));
  assert.equal(n, 2);
  assert.equal(w2.count, 2);
  assert.equal(g.size, 10);
});

test('Schlüssel liegen unter 2^35 und sind eindeutig an den Ecken', () => {
  const corners = [];
  for (const x of [-4096, 4095]) for (const z of [-4096, 4095]) for (const y of [0, 511]) corners.push(packKey(x, y, z));
  assert.equal(new Set(corners).size, 8);
  assert.equal(packKey(-4096, 0, -4096), 0);
  assert.equal(packKey(4095, 511, 4095), 8192 * 8192 * 512 - 1);
  assert.ok(Math.max(...corners) < 2 ** 35);
  // Nachbarschritte: ±1 in y, ±512 in z, ±4194304 in x
  const k = packKey(10, 20, 30);
  assert.equal(packKey(10, 21, 30) - k, 1);
  assert.equal(packKey(10, 20, 31) - k, 512);
  assert.equal(packKey(11, 20, 30) - k, 4194304);
});

test('Zellen an den neuen Bereichsgrenzen lassen sich setzen und lesen', () => {
  const g = new VoxelGrid();
  const w = g.writer({ module: 1, part: 'rand' });
  const cells = [[-4096, 0, -4096], [4095, 511, 4095], [-4096, 511, 4095], [3000, 64, -3500]];
  cells.forEach(([x, y, z], i) => w.set(x, y, z, 't' + i));
  cells.forEach(([x, y, z], i) => assert.equal(g.get(x, y, z).type, 't' + i));
  assert.deepEqual(g.bounds(), { minX: -4096, maxX: 4095, minY: 0, maxY: 511, minZ: -4096, maxZ: 4095 });
  assert.equal(g.has(4096, 0, 0), false);
  const seen = [];
  g.forEachKey((k, m) => seen.push([unpackKey(k), m]));
  assert.equal(seen.length, 4);
  assert.deepEqual(seen[3][0], { x: 3000, y: 64, z: -3500 });
});
