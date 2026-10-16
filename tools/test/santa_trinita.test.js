'use strict';
// V3 D3: Santa Trinita (projects/santa_trinita): T-Form, fünf Joche, Kapellen am Querhaus, Begehbarkeit.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const S = require('../../projects/santa_trinita/model/_st.js');

const project = getProject('santa_trinita', { root: ROOT });
const world = buildWorld({ project });

test('Santa Trinita: fehlerfrei, fünf Joche, alle Kopfzonen vorhanden', () => {
  assert.deepEqual(world.errors, []);
  assert.equal(S.JOCHE, 5);
  const zonen = new Set(S.lade().haupt.map((c) => c.zone));
  for (const z of ['fassade', 'schiff', 'seite', 'kapelle', 'quer', 'chor', 'kopfkapelle', 'sassetti', 'gualberto', 'sakristei']) assert.ok(zonen.has(z), z);
});

test('Santa Trinita: Gewölbe des Mittelschiffs bis Lage 43–44, Dach bis 56', () => {
  let gw = 0, dach = 0;
  world.grid.forEach((x, y, z, e) => { if (e.part === 'gewoelbe' && y > gw) gw = y; if (e.part === 'daecher' && y > dach) dach = y; });
  assert.ok(gw - S.Y(0) >= S.M.s - 1 && gw - S.Y(0) <= S.M.s);
  assert.equal(dach - S.Y(0), S.M.first);
});

test('Santa Trinita: Portale offen, alles erreichbar, dicht', () => {
  const arten = {};
  for (const o of world.oeffnungen) arten[o.art + '|' + o.part] = (arten[o.art + '|' + o.part] || 0) + o.keys.length;
  assert.ok(arten['tor|fassade'] > 30);
  assert.ok(arten['tuer|sakristei'] > 5);
  const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
  assert.equal(laufe(ctx, 'r13').einheiten[0].komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});
