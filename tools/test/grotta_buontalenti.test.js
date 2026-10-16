'use strict';
// V5c: Grotta del Buontalenti (projects/grotta_buontalenti): drei Kammern, Figuren, Oculus, Begehbarkeit.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const G = require('../../projects/grotta_buontalenti/model/_gb.js');

const project = getProject('grotta_buontalenti', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;

test('Grotta: Projektfelder und Zonen', () => {
  assert.equal(project.json.bodenY, 76);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  const L = G.lade();
  assert.equal(L.alle.length, 442);
  const z = {};
  for (const c of L.alle) z[c.zone] = (z[c.zone] || 0) + 1;
  for (const k of ['front', 'wand', 'p1', 'p2', 'k1', 'k2', 'k3']) assert.ok(z[k] > 0, k);
});

test('Grotta: Bauteile, Figuren, Wasser, Glas-Oculus, Eingang als tor', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of ['fassade', 'wappen', 'gefangene', 'paris_helena', 'venus_brunnen', 'oculus', 'licht', 'kammer_1_gewoelbe', 'kammer_2_gewoelbe', 'kammer_3_gewoelbe']) assert.ok(n[p] > 0, p);
  let wasser = 0, glas = 0;
  grid.forEach((x, y, z, e) => { if (e.type === 'water') wasser++; if (e.part === 'oculus' && e.type.includes('glass')) glas++; });
  assert.ok(wasser >= 4 && glas >= 6, `Wasser ${wasser}, Glas ${glas}`);
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor' && o.keys.length >= 5 * 7));
  assert.ok(world.oeffnungen.some((o) => o.art === 'relief'));
});

test('Grotta: begehbar (alle drei Kammern erreichbar) und dicht', () => {
  const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.ok(r.anteil > 70, String(r.anteil));
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});
