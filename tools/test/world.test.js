'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { VoxelGrid, VoxelConflictError } = require('../geom/grid');
const { box } = require('../geom/shapes');
const { buildWorld } = require('../model/world');

const fx = (name) => path.join(__dirname, 'fixtures', name);
const noContent = path.join(__dirname, 'fixtures', '_kein_content');

test('R1: zwei Module belegen dieselbe Zelle -> Fehler mit beiden Modulnummern, Build läuft weiter', () => {
  const w = buildWorld({ modules: [1, 2, 3], modelDir: fx('r1_conflict'), contentDir: noContent });
  assert.equal(w.errors.length, 1);
  const e = w.errors[0];
  assert.equal(e.rule, 'R1');
  assert.equal(e.module, 2);
  assert.equal(e.part, 'clash');
  assert.match(e.message, /Modul 1\/base/);
  assert.match(e.message, /Modul 2\/clash/);
  assert.match(e.message, /\(2,56,2\)/);
  assert.deepEqual(w.modules.map((m) => m.module), [1, 2, 3]);
  assert.equal(w.grid.has(10, 56, 10), true); // Modul 3 wurde trotzdem gebaut
});

test('fillUnion: gleiches Modul überspringt, fremdes Modul wirft', () => {
  const w = buildWorld({ modules: [1], modelDir: fx('r1_union'), contentDir: noContent });
  assert.equal(w.errors.length, 0);
  assert.equal(w.grid.size, 16 + 12);
  const [a, b] = w.modules[0].parts;
  assert.equal(a.keys.length, 16);
  assert.equal(b.keys.length, 12);

  const g = new VoxelGrid();
  const m1 = g.writer({ module: 1, part: 'p' });
  const m2 = g.writer({ module: 2, part: 'q' });
  m1.fill(box(0, 0, 0, 2, 0, 2), 'stone');
  assert.equal(m1.fillUnion(box(1, 0, 1, 4, 0, 1), 'stone'), 2);
  assert.throws(() => m2.fillUnion(box(0, 0, 0, 0, 0, 0), 'stone'), VoxelConflictError);
  assert.equal(g.ownerModule(1, 0, 1), 1);
  assert.equal(g.ownerModule(9, 0, 9), undefined);
  assert.equal(g.keysOf().length, g.size);
});

test('ctx.part: zweite Registrierung derselben ID wirft', () => {
  const w = buildWorld({ modules: [1], modelDir: fx('dup_part'), contentDir: noContent });
  assert.equal(w.errors.length, 1);
  assert.match(w.errors[0].message, /doppelt registriert/);
});

test('Bauteil-Keys in Einfügereihenfolge; Metadaten aus Content bzw. Platzhalter', () => {
  const w = buildWorld({ modules: [1], modelDir: fx('plan_merge'), contentDir: path.join(fx('plan_merge'), 'content') });
  assert.equal(w.modules[0].meta.title, 'Testmodul');
  assert.deepEqual(w.modules[0].parts.map((p) => p.id), ['a', 'b', 'c', 'd_pad']);
  assert.equal(w.modules[0].parts[0].keys.length, 100);
  const w2 = buildWorld({ modules: [1], modelDir: fx('plan_merge'), contentDir: noContent });
  assert.equal(w2.modules[0].meta.title, 'Modul 1');
  assert.ok(w2.warnings.some((x) => /kein Content/.test(x)));
});

test('leerer/fehlender Modellordner ergibt 0 Module', () => {
  const w = buildWorld({ modelDir: fx('_gibt_es_nicht'), contentDir: noContent });
  assert.equal(w.modules.length, 0);
  assert.equal(w.errors.length, 0);
});
