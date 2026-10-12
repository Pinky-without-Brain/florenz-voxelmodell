'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const V = require('../geom/vaults');

const k3 = (c) => `${c.x},${c.y},${c.z}`;

// 6er-Flutfüllung; solid = Menge der Schalen-Schlüssel, inside(x,z) begrenzt die Säulen.
// Rückgabe: erreichte Zellen.
function flood(start, solid, box, inside) {
  const seen = new Set([k3(start)]);
  const stack = [start];
  const D = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  while (stack.length) {
    const c = stack.pop();
    for (const [dx, dy, dz] of D) {
      const n = { x: c.x + dx, y: c.y + dy, z: c.z + dz };
      if (n.x < box.x0 || n.x > box.x1 || n.z < box.z0 || n.z > box.z1) continue;
      if (n.y < box.y0 || n.y > box.y1 || !inside(n.x, n.z)) continue;
      const k = k3(n);
      if (seen.has(k) || solid.has(k)) continue;
      seen.add(k);
      stack.push(n);
    }
  }
  return seen;
}

// Keine erreichte Zelle darf auf oder über der Schale ihrer Säule liegen.
function assertTight(cells, reached) {
  const lowest = new Map();
  for (const c of cells) {
    const kk = `${c.x},${c.z}`;
    if (!lowest.has(kk) || c.y < lowest.get(kk)) lowest.set(kk, c.y);
  }
  for (const r of reached) {
    const [x, y, z] = r.split(',').map(Number);
    const lo = lowest.get(`${x},${z}`);
    assert.ok(lo !== undefined && y < lo, `Leck bei ${r}`);
  }
}

test('Kreuzgewölbe: Symmetrie und Belegung', () => {
  const p = { x0: 0, x1: 20, z0: 0, z1: 20, springY: 70, fx: 0.5, fz: 0.5 };
  const cells = [...V.groinVault(p)];
  const set = new Set(cells.map(k3));
  for (const c of cells) {
    assert.ok(set.has(k3({ x: 20 - c.x, y: c.y, z: c.z })));
    assert.ok(set.has(k3({ x: c.x, y: c.y, z: 20 - c.z })));
    assert.ok(set.has(k3({ x: 20 - c.x, y: c.y, z: 20 - c.z })));
  }
  const cols = new Set(cells.map((c) => `${c.x},${c.z}`));
  assert.equal(cols.size, 21 * 21);
  assert.ok(Math.abs(V.groinVaultHeight(p, 10, 10) - 10.5) < 1e-9);
});

test('Kreuzgewölbe: dicht (Flutfüllung)', () => {
  const p = { x0: 0, x1: 20, z0: 0, z1: 20, springY: 70, fx: 0.5, fz: 0.5 };
  const cells = [...V.groinVault(p)];
  const box = { x0: 0, x1: 20, z0: 0, z1: 20, y0: 70, y1: 85 };
  const reached = flood({ x: 10, y: 70, z: 10 }, new Set(cells.map(k3)), box, () => true);
  assert.ok(reached.size > 1000);
  assertTight(cells, reached);
  for (const r of reached) assert.ok(Number(r.split(',')[1]) < 85);
});

test('Kreuzgewölbe: spitze Faktoren und Dicke', () => {
  const p = { x0: 0, x1: 12, z0: 0, z1: 20, springY: 10, fx: 0.8, fz: 1, thickness: 2 };
  const cells = [...V.groinVault(p)];
  const box = { x0: 0, x1: 12, z0: 0, z1: 20, y0: 10, y1: 60 };
  assertTight(cells, flood({ x: 6, y: 10, z: 10 }, new Set(cells.map(k3)), box, () => true));
});

test('Klostergewölbe: D4-Symmetrie und Dichtheit', () => {
  const p = { cx: 0, cz: 0, a: 20, springY: 70, f: 0.8 };
  const cells = [...V.cloisterVault(p)];
  const set = new Set(cells.map(k3));
  for (const c of cells) {
    assert.ok(set.has(k3({ x: -c.x, y: c.y, z: c.z })));
    assert.ok(set.has(k3({ x: c.x, y: c.y, z: -c.z })));
    assert.ok(set.has(k3({ x: c.z, y: c.y, z: c.x })));
  }
  // Säulen außerhalb des Achtecks (rho > a) gelten als Wand/Außenraum.
  const box = { x0: -20, x1: 20, z0: -20, z1: 20, y0: 70, y1: 110 };
  const reached = flood({ x: 0, y: 70, z: 0 }, set, box, (x, z) => V.rho(x, z) <= 20);
  assert.ok(reached.size > 1000);
  assertTight(cells, reached);
});

test('Klostergewölbe: Auge bleibt frei', () => {
  const cells = [...V.cloisterVault({ cx: 0, cz: 0, a: 20, springY: 70, f: 0.8, rhoMin: 4 })];
  assert.ok(cells.length > 0);
  for (const c of cells) assert.ok(V.rho(c.x, c.z) >= 4);
  assert.ok(!cells.some((c) => c.x === 0 && c.z === 0));
});

test('Klostergewölbe: Halbebene', () => {
  const cells = [...V.cloisterVault({ cx: 5, cz: 5, a: 10, springY: 70, f: 0.5, sides: { axis: 'x', sign: -1 } })];
  assert.ok(cells.length > 0);
  for (const c of cells) assert.ok(c.x <= 5);
  assert.ok(cells.some((c) => c.x === 5));
});

test('halfDome r = 6', () => {
  for (const [axis, sign] of [['x', 1], ['z', -1]]) {
    const cx = 3, cz = -4, springY = 80;
    const cells = [...V.halfDome({ cx, cz, r: 6, springY, axis, sign })];
    assert.ok(cells.length > 50);
    for (const c of cells) {
      const d = axis === 'x' ? c.x - cx : c.z - cz;
      assert.ok(sign * d >= 0);
      assert.ok(c.y >= springY);
      const d2 = (c.x - cx) ** 2 + (c.y - springY) ** 2 + (c.z - cz) ** 2;
      // Grundschale 30 < d2 <= 42; ergänzte Verbindungszellen liegen höchstens eine Zelle daneben
      assert.ok(d2 <= 49 && d2 > 16);
    }
    // Scheitel und Rand der Schale vorhanden
    const set = new Set(cells.map(k3));
    assert.ok(set.has(k3({ x: cx, y: springY + 6, z: cz })));
    // Jede Säule mit ausreichendem Radius trägt mindestens eine Schalenzelle
    const cols = new Set(cells.map((c) => `${c.x},${c.z}`));
    for (let x = cx - 6; x <= cx + 6; x++) {
      for (let z = cz - 6; z <= cz + 6; z++) {
        const d = axis === 'x' ? x - cx : z - cz;
        if (sign * d >= 0 && (x - cx) ** 2 + (z - cz) ** 2 <= 42) assert.ok(cols.has(`${x},${z}`));
      }
    }
  }
});

// Flächenzusammenhang (6er): Anzahl der Komponenten und Zahl der von der untersten Lage erreichten Zellen
function connectivity(cells) {
  const set = new Set(cells.map(k3));
  const minY = Math.min(...cells.map((c) => c.y));
  const seen = new Set();
  let count = 0, fromLowest = 0;
  const order = cells.filter((c) => c.y === minY).concat(cells);
  for (const c of order) {
    if (seen.has(k3(c))) continue;
    const first = count === 0;
    count++;
    seen.add(k3(c));
    const stack = [c];
    let n = 1;
    while (stack.length) {
      const p = stack.pop();
      for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
        const q = { x: p.x + dx, y: p.y + dy, z: p.z + dz };
        const k = k3(q);
        if (set.has(k) && !seen.has(k)) { seen.add(k); stack.push(q); n++; }
      }
    }
    if (first) fromLowest = n;
  }
  return { count, fromLowest };
}

test('Gewölbe: genau eine Flächenkomponente, mit der untersten Lage verbunden', () => {
  const sets = [
    [...V.groinVault({ x0: 0, x1: 37, z0: 0, z1: 30, springY: 70 })],
    [...V.groinVault({ x0: 0, x1: 12, z0: 0, z1: 20, springY: 10, fx: 0.8, fz: 1, thickness: 2 })],
    [...V.cloisterVault({ cx: 0, cz: 0, a: 20, springY: 70, f: 0.8 })],
    [...V.cloisterVault({ cx: 0, cz: 0, a: 20, springY: 70, f: 0.8, rhoMin: 4 })],
    [...V.cloisterVault({ cx: 5, cz: 5, a: 10, springY: 70, f: 0.5, sides: { axis: 'x', sign: -1 } })],
    [...V.halfDome({ cx: 0, cz: 0, r: 6, springY: 70, axis: 'x', sign: 1 })],
    [...V.halfDome({ cx: 0, cz: 0, r: 12, springY: 70, axis: 'z', sign: -1, thickness: 2 })],
  ];
  for (const cells of sets) {
    const r = connectivity(cells);
    assert.equal(r.count, 1);
    assert.equal(r.fromLowest, cells.length);
  }
});
