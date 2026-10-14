'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { buildWorld } = require('../model/world');
const { planModule } = require('../steps/planner');
const { unpackKey } = require('../geom/grid');

const fx = (name) => path.join(__dirname, 'fixtures', name);
const noContent = path.join(__dirname, 'fixtures', '_kein_content');

function plan(name, content) {
  const w = buildWorld({ modules: [1], modelDir: fx(name), contentDir: content || noContent });
  assert.deepEqual(w.errors, []);
  const m = w.modules[0];
  return planModule(m, m.content, w.grid);
}

test('5.000 Blöcke in Lagen à 400 -> 3 Schritte ≤ 2.100, Schnitte an Lagengrenzen', () => {
  const steps = plan('plan_layers');
  assert.equal(steps.length, 3);
  for (const s of steps) assert.ok(s.count <= 2100, `Schritt mit ${s.count}`);
  assert.equal(steps.reduce((a, s) => a + s.count, 0), 5000);
  // jede Lage liegt vollständig in genau einem Schritt: Y-Bereiche überlappen nicht
  for (let i = 1; i < steps.length; i++) assert.ok(steps[i].yRange[0] > steps[i - 1].yRange[1]);
  assert.match(steps[0].title, /Teil 1\/3 \(Y 64–67\)/);
  assert.equal(steps[0].partCount, 3);
  assert.equal(steps[2].partIndex, 3);
});

test('einzelne Lage mit 3.000 Blöcken wird nach X geteilt', () => {
  const steps = plan('plan_single');
  assert.ok(steps.length >= 2);
  for (const s of steps) assert.ok(s.count <= 2100);
  assert.equal(steps.reduce((a, s) => a + s.count, 0), 3000);
  // zusammenhängend aufsteigend in X
  let lastMaxX = -Infinity;
  for (const s of steps) {
    const xs = s.cells.map((k) => unpackKey(k).x);
    assert.ok(Math.min(...xs) > lastMaxX);
    lastMaxX = Math.max(...xs);
  }
});

test('Bauteile mit 100, 150 und 1.500 werden zu einem Schritt „A & B & C“', () => {
  const steps = plan('plan_merge', path.join(fx('plan_merge'), 'content'));
  assert.equal(steps.length, 1);
  const s = steps[0];
  assert.equal(s.title, 'A & B & C');
  assert.deepEqual(s.parts, ['a', 'b', 'c']);
  assert.equal(s.count, 100 + 150 + 1500);
  assert.equal(s.stepNumber, 1);
  assert.ok(s.description.includes('da') && s.description.includes('dc'));
  assert.equal(steps.warnings.some((w) => /Content fehlt/.test(w)), false);
});

test('Kamera, Sortierung (y, x, z); fehlender Content ergibt Warnung', () => {
  const steps = plan('plan_merge');
  assert.equal(steps[0].title, 'a & b & c');
  assert.ok(steps.warnings.length > 0);
  const s = steps[0];
  const cs = s.cells.map(unpackKey);
  for (let i = 1; i < cs.length; i++) {
    const a = cs[i - 1], b = cs[i];
    assert.ok(a.y < b.y || (a.y === b.y && (a.x < b.x || (a.x === b.x && a.z < b.z))));
  }
  // Bounding Box x 0..89, y 64, z 0..29
  assert.deepEqual(s.cameraHint.target, [44.5, 64, 14.5]);
  const d = 90 * 1.2 + 30;
  assert.equal(s.cameraHint.eye[0], Math.round((44.5 + 0.8 * d) * 10) / 10);
});

test('einlagiges Bauteil aus 162 Spalten à 89 (14.418) wird ausgewogen in 7 Schritte geteilt', () => {
  const steps = plan('plan_columns');
  assert.equal(steps.length, 7);
  assert.equal(steps.reduce((a, s) => a + s.count, 0), 14418);
  for (const s of steps) assert.ok(s.count >= 1900 && s.count <= 2100, `Schritt mit ${s.count}`);
});

test('Zellen ohne Halt im eigenen Schritt rücken in den ersten Schritt mit Halt (schritteMitHalt)', () => {
  const k = (x, y, z) => ((x + 4096) * 8192 + (z + 4096)) * 512 + y;
  // Bauteil A: Wand x 0..29, y 0..49 bei z 0 (1.500 Zellen, am Boden) + Splitter (40, 10, 0) / (40, 11, 0),
  // der nur an Bauteil B grenzt; Bauteil B: Wand x 41..70 bei z 0, später gebaut.
  const a = [], b = [];
  for (let x = 0; x < 30; x++) for (let y = 0; y < 50; y++) { a.push(k(x, y, 0)); b.push(k(x + 41, y, 0)); }
  a.push(k(40, 10, 0), k(40, 11, 0));
  const m = { module: 1, parts: [{ id: 'a', keys: a }, { id: 'b', keys: b }] };
  const ground = { hasGroundContact: (x, y) => y === 0 };
  const steps = planModule(m, null, null, { ground });
  const wo = (key) => steps.findIndex((s) => s.cells.includes(key));
  assert.ok(wo(k(40, 10, 0)) > wo(k(0, 10, 0)), 'Splitter liegt nach seinem Bauteil');
  assert.ok(wo(k(40, 10, 0)) >= wo(k(41, 10, 0)), 'Splitter liegt nicht vor seiner Stütze');
  assert.equal(steps.reduce((s, st) => s + st.count, 0), 3002);
  steps.forEach((s, i) => assert.equal(s.stepNumber, i + 1));
});
