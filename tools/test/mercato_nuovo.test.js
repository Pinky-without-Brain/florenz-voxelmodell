'use strict';
// V3 D4: Loggia del Mercato Nuovo (projects/mercato_nuovo): offene Halle, 12 Gewölbe, Porcellino, Begehbarkeit.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');

const project = getProject('mercato_nuovo', { root: ROOT });
const world = buildWorld({ project });

test('Mercato Nuovo: fehlerfrei, Bögen offen, Porcellino aus Bronze', () => {
  assert.deepEqual(world.errors, []);
  assert.ok(world.oeffnungen.some((o) => o.art === 'arkade' && o.keys.length > 200));
  let bronze = 0;
  world.grid.forEach((x, y, z, e) => { if (e.part === 'porcellino' && e.type.includes('copper')) bronze++; });
  assert.ok(bronze > 0);
});

test('Mercato Nuovo: alles erreichbar, dicht', () => {
  const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
  assert.equal(laufe(ctx, 'r13').einheiten[0].komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});
