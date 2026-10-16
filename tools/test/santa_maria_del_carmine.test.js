'use strict';
// V3 D3: Santa Maria del Carmine (projects/santa_maria_del_carmine): Schiff 15 m, Kuppel 35 m, Kapellen, Begehbarkeit.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const S = require('../../projects/santa_maria_del_carmine/model/_cm.js');

const project = getProject('santa_maria_del_carmine', { root: ROOT });
const world = buildWorld({ project });

test('Carmine: fehlerfrei, Schiff 30 Blöcke breit, fünf Kapellen je Seite', () => {
  assert.deepEqual(world.errors, []);
  assert.equal(S.W_SCHIFF * 2, 30);
  assert.equal(S.KAPELLEN, 5);
  const altaere = new Set();
  world.grid.forEach((x, y, z, e) => { if (e.part === 'altaere' && y === S.Y(3)) { const c = S.zelleBei(x, z); altaere.add(Math.sign(c.w) + ':' + Math.floor((c.u - 3) / ((97.3 - 3) / 5))); } });
  assert.equal(altaere.size, 10);
});

test('Carmine: Kuppel außen bis Lage 70 (35 m), Brancacci mit Fresken', () => {
  let kuppelTop = 0, fresken = 0;
  world.grid.forEach((x, y, z, e) => { if (e.part === 'kuppel' && y > kuppelTop) kuppelTop = y; if (e.part === 'brancacci' && /terracotta/.test(e.type)) fresken++; });
  assert.equal(kuppelTop - S.Y(0), 70);
  assert.ok(fresken > 100);
});

test('Carmine: Portale offen, alles erreichbar', () => {
  const arten = {};
  for (const o of world.oeffnungen) arten[o.art + '|' + o.part] = (arten[o.art + '|' + o.part] || 0) + o.keys.length;
  assert.ok(arten['tor|fassade'] > 30);
  const r = laufe({ project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT }, 'r13');
  assert.equal(r.einheiten[0].komponenten.filter((k) => !k.unzugaenglich).length, 0);
});
