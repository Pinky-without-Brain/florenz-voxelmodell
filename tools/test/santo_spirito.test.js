'use strict';
// V3 D3: Santo Spirito (projects/santo_spirito): Modulraster, Campanile 70 m, Sakristei, Begehbarkeit.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const S = require('../../projects/santo_spirito/model/_ss.js');

const project = getProject('santo_spirito', { root: ROOT });
const world = buildWorld({ project });

test('Santo Spirito: fehlerfrei, Modul 11 Braccia', () => {
  assert.deepEqual(world.errors, []);
  assert.ok(Math.abs(S.M / 2 - 11 * 0.5836) < 0.01);
});

test('Santo Spirito: Campanile bis Lage 138 (69 m), Sakristei ohne Loch', () => {
  let maxY = 0;
  world.grid.forEach((x, y) => { if (y > maxY) maxY = y; });
  assert.equal(maxY - S.Y(0), S.TURM.top - 2);
  const D = S.lade();
  assert.ok(D.SA.has(-1398, 1285));     // Lichtschacht im OSM-Umriss r7101376, im Modell Innenraum
  assert.ok(D.sak.every((c) => !D.CA.has(c.x, c.z)));
});

test('Santo Spirito: Portale und Türen offen, alles erreichbar', () => {
  const arten = {};
  for (const o of world.oeffnungen) arten[o.art + '|' + o.part] = (arten[o.art + '|' + o.part] || 0) + o.keys.length;
  assert.ok(arten['tor|fassade'] > 50);
  assert.ok(arten['tuer|sakristei'] > 30);
  assert.ok(arten['tuer|campanile_schaft'] > 10);
  const r = laufe({ project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT }, 'r13');
  assert.equal(r.einheiten[0].komponenten.filter((k) => !k.unzugaenglich).length, 0);
});
