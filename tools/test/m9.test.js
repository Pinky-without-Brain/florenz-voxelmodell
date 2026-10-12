'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildWorld } = require('../model/world.js');
const { planModule } = require('../steps/planner.js');
const { validate } = require('../validate/index.js');
const { unpackKey } = require('../geom/grid.js');
const D = require('../spec/dimensions.js');
const { CRYPT } = require('../spec/interfaces.js');

const world = buildWorld({ modules: [0, 9] });
const mod9 = world.modules.find((m) => m.module === 9);
const grid = world.grid;
const cellsOf = (id) => mod9.parts.find((p) => p.id === id).keys.map((k) => unpackKey(k));
const inCrypt = (c) => c.x >= CRYPT.x[0] && c.x <= CRYPT.x[1] && c.z >= CRYPT.z[0] && c.z <= CRYPT.z[1] &&
  c.y >= CRYPT.y[0] && c.y <= CRYPT.y[1];

test('Modul 9 baut ohne Fehler, Reihenfolge: Boden vor Mauern', () => {
  assert.deepEqual(world.errors, []);
  assert.deepEqual(mod9.parts.map((p) => p.id), [
    'krypta_boden', 'krypta_mauern', 'krypta_stuetzen', 'brunelleschi_grab', 'chorschranke', 'hochaltar']);
});

test('Alle krypta_*-Blöcke und das Grab liegen im RESERVED-Volumen, Rest auf dem Boden', () => {
  for (const id of ['krypta_boden', 'krypta_mauern', 'krypta_stuetzen', 'brunelleschi_grab']) {
    for (const c of cellsOf(id)) assert.ok(inCrypt(c), `${id} außerhalb: ${c.x},${c.y},${c.z}`);
  }
  for (const id of ['chorschranke', 'hochaltar']) {
    for (const c of cellsOf(id)) assert.ok(c.y >= D.LEVELS.walkY, id);
  }
});

test('Stützen reichen von Y 57 bis 63, Grabplatte 3 x 5 bei Y 57', () => {
  const st = cellsOf('krypta_stuetzen');
  assert.equal(Math.min(...st.map((c) => c.y)), 57);
  assert.equal(Math.max(...st.map((c) => c.y)), 63);
  assert.equal(st.length, 6 * 4 * 7);
  const g = cellsOf('brunelleschi_grab');
  assert.equal(g.length, 15);
  assert.ok(g.every((c) => c.y === 57));
});

test('Ganze Pipeline: Planer und alle Regeln ohne Fehler, R3 ohne Verletzung', () => {
  const stepsByModule = {};
  for (const m of world.modules) stepsByModule[m.module] = planModule(m, m.content, grid);
  assert.deepEqual([...stepsByModule[9].warnings], []);
  const res = validate({ grid, world, stepsByModule });
  for (const r of res) assert.deepEqual(r.errors, [], r.rule);
  assert.equal(res.find((r) => r.rule === 'R3').total, 0);
  for (const s of stepsByModule[9]) assert.ok(s.count <= 2500);
});
