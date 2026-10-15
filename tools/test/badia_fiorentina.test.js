'use strict';
// V3 D3: Badia Fiorentina (projects/badia_fiorentina): Saal, Presbyterium im Süden, sechseckiger Campanile 70 m.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const { yOfKey } = require('../geom/grid.js');
const S = require('../../projects/badia_fiorentina/model/_bf.js');

const project = getProject('badia_fiorentina', { root: ROOT });
const world = buildWorld({ project });

test('Badia: fehlerfrei, Campanile bis Lage 140 (70 m)', () => {
  assert.deepEqual(world.errors, []);
  let maxY = 0;
  world.grid.forEach((x, y) => { if (y > maxY) maxY = y; });
  assert.equal(maxY - S.Y(0), S.TURM.top);
});

test('Badia: Hochaltar im Süden, Glockenöffnungen in drei Geschossen', () => {
  const alt = [];
  world.grid.forEach((x, y, z, e) => { if (e.part === 'hochaltar') alt.push(S.zelleBei(x, z)); });
  assert.ok(alt.length > 0 && alt.every((c) => c.zone === 'sued'));
  const ys = new Set();
  for (const o of world.oeffnungen) if (o.art === 'fenster_offen') for (const k of o.keys) ys.add(yOfKey(k));
  for (const [y0] of S.TURM.orden) assert.ok([...ys].some((y) => y >= S.Y(y0) && y < S.Y(y0) + 4), 'Geschoss ' + y0);
});

test('Badia: Portal offen, alles erreichbar, dicht', () => {
  const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor'));
  assert.equal(laufe(ctx, 'r13').einheiten[0].komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});
