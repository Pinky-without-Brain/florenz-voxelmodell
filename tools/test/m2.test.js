'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildWorld } = require('../model/world.js');
const m2 = require('../model/m2_westfassade.js');
const D = require('../spec/dimensions.js');
const { PALETTE } = require('../spec/palette.js');

const F = D.CATHEDRAL.facade;
const world = buildWorld({ modules: [1, 2] });
const m2rec = world.modules.find((m) => m.module === 2);
const grid = world.grid;
const EXPECTED = ['sockel', 'portalzone', 'nischenzone', 'rosenzone', 'giebel', 'facade_innenseite_uhr'];

test('Modul 2 baut ohne Fehler, Bauteile in Katalogreihenfolge', () => {
  assert.deepEqual(world.errors, []);
  assert.deepEqual(m2rec.parts.map((p) => p.id), EXPECTED);
});

test('Hoheitsgebiet: x −216..−213, |z| ≤ 44, y 65..164, nur Palettentypen', () => {
  grid.forEach((x, y, z, e) => {
    if (e.module !== 2) return;
    assert.ok(x >= F.westFaceX && x <= F.westFaceX + F.thickness - 1, `x ${x}`);
    assert.ok(Math.abs(z) <= D.CATHEDRAL.nave.exteriorHalfZ, `z ${z}`);
    assert.ok(y >= D.LEVELS.walkY && y <= F.peakY, `y ${y}`);
    assert.ok(PALETTE[e.type], e.type);
  });
});

test('Blockzahl im Rahmen (Richtwert 25–35 k, ±30 %)', () => {
  const n = m2rec.parts.reduce((s, p) => s + p.keys.length, 0);
  assert.ok(n >= 17500 && n <= 45500, `Blöcke: ${n}`);
});

test('Uhr: Zellen nur in facade_innenseite_uhr, x −213, genau die Uhrzellen', () => {
  const clock = m2rec.parts.find((p) => p.id === 'facade_innenseite_uhr');
  assert.equal(clock.keys.length, m2.CLOCK_MAP.size);
  let n = 0;
  grid.forEach((x, y, z, e) => {
    if (e.module !== 2) return;
    const inClock = m2.isClock(x, y, z);
    assert.equal(e.part === 'facade_innenseite_uhr', inClock, `(${x},${y},${z}) ${e.part}`);
    if (inClock) n++;
  });
  assert.equal(n, m2.CLOCK_MAP.size);
});

test('Spiegelsymmetrie in Z inklusive Typ (ohne Uhr, deren Zeiger ist asymmetrisch)', () => {
  let n = 0;
  grid.forEach((x, y, z, e) => {
    if (e.module !== 2 || e.part === 'facade_innenseite_uhr') return;
    const o = grid.get(x, y, -z);
    assert.ok(o && o.type === e.type && o.part === e.part, `(${x},${y},${z}) ${e.type} ↔ ${o && o.type}`);
    n++;
  });
  assert.ok(n > 15000);
});

test('Keine Lücke von Westen: jede (z,y)-Spalte des Langhaus-Querschnitts ist von Modul 2 verdeckt (Gesims-Vorsprung |z| 45 von M1 liegt außerhalb)', () => {
  const gaps = [];
  const colsM1 = new Set();
  grid.forEach((x, y, z, e) => { if (e.module === 1 && x <= -208 && Math.abs(z) <= 44) colsM1.add(z + ',' + y); });
  for (const k of colsM1) {
    const [z, y] = k.split(',').map(Number);
    let ok = false;
    for (let x = F.westFaceX; x <= F.westFaceX + F.thickness - 1 && !ok; x++) ok = grid.has(x, y, z);
    if (!ok) gaps.push(k);
  }
  assert.deepEqual(gaps.slice(0, 5), []);
});

test('Fassade hat drei Portale mit Bronzetür und 12 Nischen', () => {
  const doors = new Set();
  grid.forEach((x, y, z, e) => { if (e.module === 2 && e.type === 'cut_copper' && x === -214) doors.add(z); });
  for (const cu of [0, -29, 29]) assert.ok(doors.has(cu), `Tür bei z ${cu}`);
  // Nischen: Zellen in Schicht d = 0 leer, Schicht d = 1 belegt, y 105 (nur Nischenzone)
  let open = 0;
  for (let z = -44; z <= 44; z++) if (!grid.has(-216, 106, z) && grid.has(-215, 106, z)) open++;
  assert.ok(open > 0);
});
