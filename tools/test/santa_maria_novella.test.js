'use strict';
// V3 D3: Santa Maria Novella (projects/santa_maria_novella): Maße, Campanile 68 m, Fassade quadratisch, Begehbarkeit.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const S = require('../../projects/santa_maria_novella/model/_smn.js');

const project = getProject('santa_maria_novella', { root: ROOT });
const world = buildWorld({ project });

test('Santa Maria Novella: fehlerfrei, sechs Joche nach Norden kürzer', () => {
  assert.deepEqual(world.errors, []);
  assert.equal(S.JOCHE.length, 7);
  const l = S.JOCHE.slice(1).map((u, k) => u - S.JOCHE[k]);
  for (let k = 1; k < 6; k++) assert.ok(l[k] < l[k - 1]);
  assert.ok(Math.abs(l[0] / l[5] - 15 / 11.5) < 0.01);
});

test('Santa Maria Novella: Campanile bis Lage 136 (68 m), Fassade so hoch wie breit', () => {
  let maxY = 0, fassTop = 0;
  world.grid.forEach((x, y, z, e) => { if (y > maxY) maxY = y; if ((e.part === 'fassade_oben' || e.part === 'fassade_unten') && y > fassTop) fassTop = y; });
  assert.equal(maxY, S.Y(S.TURM.top));
  assert.equal(fassTop - S.Y(0), S.FASS.hoehe);
});

test('Santa Maria Novella: Portale und Turmtür offen, alles erreichbar', () => {
  const arten = {};
  for (const o of world.oeffnungen) arten[o.art + '|' + o.part] = (arten[o.art + '|' + o.part] || 0) + o.keys.length;
  assert.ok(arten['tor|fassade_kern'] > 50);
  assert.ok(arten['tuer|campanile_schaft'] > 10);
  const r = laufe({ project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT }, 'r13');
  assert.equal(r.einheiten[0].komponenten.filter((k) => !k.unzugaenglich).length, 0);
});
