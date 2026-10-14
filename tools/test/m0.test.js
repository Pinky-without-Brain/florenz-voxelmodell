'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildWorld } = require('../model/world.js');
const m0 = require('../model/m0_fundament.js');

const world = buildWorld({ modules: [0] });

test('Modul 0 baut ohne Fehler, Bauteile in Katalogreihenfolge', () => {
  assert.deepEqual(world.errors, []);
  assert.deepEqual(world.modules[0].parts.map((p) => p.id), [
    'krypta_grube', 'boden_langhaus', 'krypta_abgang', 'boden_vierung', 'boden_tribune_nord', 'boden_tribune_ost',
    'boden_tribune_sued', 'boden_campanile', 'boden_baptisterium', 'aussenstufen']);
});

test('Y-64-Lage entspricht footprint(), außer Außenstufen und Kryptaloch (B5)', () => {
  const stufen = new Set(world.modules[0].parts.find((p) => p.id === 'aussenstufen').keys);
  let n = 0, aussen = 0;
  const { packKey } = require('../geom/grid.js');
  world.grid.forEach((x, y, z) => {
    if (y !== 64) return;
    if (stufen.has(packKey(x, y, z))) { aussen++; assert.ok(!m0.footprint(x, z)); return; }
    n++; assert.ok(m0.footprint(x, z), `Zelle ${x},${z} außerhalb des Footprints`);
  });
  let fp = 0;
  for (let x = -360; x <= 120; x++) for (let z = -110; z <= 110; z++) if (m0.footprint(x, z)) fp++;
  assert.equal(n, fp - 8, 'Treppenloch zur Krypta: 4 x 2 Zellen offen (oberste Stufe zählt als Zelle)');
  assert.ok(aussen > 100);
});

test('Vierung ist D4-symmetrisch (inkl. Typ)', () => {
  const g = world.grid;
  for (let x = 0; x <= 54; x++) for (let z = 0; z <= 54; z++) {
    const c = g.get(x, 64, z);
    if (!c) continue;
    for (const [a, b] of [[-x, z], [x, -z], [z, x]]) assert.equal(g.get(a, 64, b).type, c.type);
  }
});
