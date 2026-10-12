'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { buildWorld } = require('../model/world');
const { planModule } = require('../steps/planner');
const { validate } = require('../validate');
const { hasGroundContact } = require('../validate/ground');
const D = require('../spec/dimensions');

const fx = (name) => path.join(__dirname, 'fixtures', name);
const noContent = path.join(__dirname, 'fixtures', '_kein_content');

function run(name, modules, only, extra) {
  const world = buildWorld({ modules, modelDir: fx(name), contentDir: noContent });
  assert.deepEqual(world.errors, []);
  const stepsByModule = {};
  for (const m of world.modules) stepsByModule[m.module] = planModule(m, m.content, world.grid);
  const res = validate({ grid: world.grid, world, stepsByModule, only, ...extra });
  return { world, stepsByModule, res: Object.fromEntries(res.map((r) => [r.rule, r])) };
}

test('R3 erkennt genau den schwebenden Block', () => {
  const { res } = run('r3_float', [1], ['R3']);
  assert.equal(res.R3.total, 1);
  assert.equal(res.R3.errors.length, 1);
  assert.deepEqual(res.R3.violations[0].examples, [{ x: 10, y: 59, z: 10 }]);
  assert.match(res.R3.errors[0], /\(10,59,10\)/);
});

test('R3 akzeptiert einen Bogen, der von beiden Pfeilern aus erreichbar ist', () => {
  const { res, stepsByModule } = run('r3_arch', [1], ['R3', 'R4']);
  assert.equal(stepsByModule[1].length, 2);
  assert.deepEqual(res.R3.errors, []);
  assert.deepEqual(res.R4.errors, []);
});

test('R4 meldet eine getrennte Insel', () => {
  const { res } = run('r3_float', [1], ['R4']);
  assert.equal(res.R4.islands, 1);
  assert.equal(res.R4.total, 1);
});

test('Geländekontakt: Block über dem Krypta-Volumen hat keinen, außerhalb schon', () => {
  assert.equal(hasGroundContact(0, D.LEVELS.floorY, 0), true);
  assert.equal(hasGroundContact(-170, D.LEVELS.floorY, 0), false);
  assert.equal(hasGroundContact(0, D.LEVELS.floorY + 1, 0), false);
  assert.equal(hasGroundContact(500, D.LEVELS.foundationBottomY, 500), true);
  const { res } = run('r3_ground', [1], ['R3']);
  assert.equal(res.R3.total, 1);
  assert.deepEqual(res.R3.violations[0].examples, [{ x: -170, y: 64, z: 0 }]);
});

test('R8 erkennt Asymmetrie bei order 4 und akzeptiert einen symmetrischen Ring', () => {
  assert.deepEqual(run('r8_ok', [1], ['R8']).res.R8.errors, []);
  const bad = run('r8_bad', [1], ['R8']).res.R8;
  assert.equal(bad.total, 1);
  assert.match(bad.errors[0], /\(5,58,0\)/);
});

test('R5 SUPPORTS erkennt einen überhängenden Block', () => {
  const interfaces = {
    SUPPORTS: [{ name: 'Test-Auflager', lower: 1, upper: 2, y: 61, region: () => true, coverage: 0 }],
    OWNERSHIP: [], RESERVED: []
  };
  const { res } = run('r5_overhang', [1, 2], ['R5'], { interfaces });
  assert.equal(res.R5.errors.length, 1);
  assert.match(res.R5.errors[0], /1 Blöcke/);
  assert.match(res.R5.errors[0], /\(6,61,0\)/);

  // coverage: Oberseite von Modul 1 (25 Zellen) ist vollständig bedeckt, nur der Überhang bleibt
  const cov = { ...interfaces, SUPPORTS: [{ ...interfaces.SUPPORTS[0], coverage: 1.0 }] };
  const r2 = run('r5_overhang', [1, 2], ['R5'], { interfaces: cov }).res.R5;
  assert.equal(r2.errors.length, 1);
});

test('R5 OWNERSHIP und RESERVED greifen', () => {
  const interfaces = {
    SUPPORTS: [],
    OWNERSHIP: [{ name: 'Basis gehört 2', module: 2, test: (x, y, z) => y === 56 && x === 0 && z === 0 }],
    RESERVED: [{ name: 'Sperrzone', forModule: 9, test: (x, y, z) => y === 56 && x === 1 && z === 0 }]
  };
  const { res } = run('r5_overhang', [1, 2], ['R5'], { interfaces });
  assert.equal(res.R5.errors.length, 2);
});

test('R2, R6, R7 auf gültigen Daten; R10 findet nichts im Projekt', () => {
  const { res } = run('r3_arch', [1], ['R2', 'R6', 'R7', 'R10']);
  assert.deepEqual(res.R2.errors, []);
  assert.deepEqual(res.R6.errors, []);
  assert.deepEqual(res.R7.errors, []);
  assert.deepEqual(res.R10.errors, []);
});
