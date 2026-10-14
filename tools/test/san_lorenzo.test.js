'use strict';
// V3 D3: San Lorenzo mit Cappelle Medicee (projects/san_lorenzo): Masken, Höhen (Principi 59 m), Öffnungen,
// Begehbarkeit (Krypta-Eingang, Treppe, Sakristeien).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const S = require('../../projects/san_lorenzo/model/_sl.js');

const project = getProject('san_lorenzo', { root: ROOT });
const world = buildWorld({ project });

test('San Lorenzo: Masken, Zonen und Fehlerfreiheit', () => {
  assert.deepEqual(world.errors, []);
  const L = S.lade();
  assert.ok(L.H.size > 14000 && L.H.size < 14500, String(L.H.size));
  assert.ok(L.PR.size > 5400 && L.PR.size < 5800, String(L.PR.size));
  const z = {};
  for (const c of L.alle) z[c.zone] = (z[c.zone] || 0) + 1;
  for (const k of ['fassade', 'mittel', 'seite', 'kapelle', 'vierung', 'quer', 'chor', 'sak_alt', 'sak_neu', 'oktogon', 'oktwand', 'nebenraum']) assert.ok(z[k] > 0, k);
});

test('San Lorenzo: Cappella dei Principi 59 m über dem Gelände (Laterne Lage 112 = Y 179)', () => {
  let maxY = 0;
  world.grid.forEach((x, y) => { if (y > maxY) maxY = y; });
  assert.equal(maxY, S.Y(S.OKT.laterne));
  assert.equal(S.Y(S.OKT.laterne) - 120, 59); // Gelände Y 61 + 118 Blöcke
});

test('San Lorenzo: Portale, Krypta-Eingang, Sakristeitüren; alles erreichbar', () => {
  const arten = {};
  for (const o of world.oeffnungen) arten[o.art + '|' + o.part] = (arten[o.art + '|' + o.part] || 0) + o.keys.length;
  assert.ok(arten['tor|fassade'] > 50);
  assert.ok(arten['tuer|krypta'] > 10);
  assert.ok(arten['tuer|sakristei_alt'] > 10 && arten['tuer|sakristei_neu'] > 10);
  const r = laufe({ project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT }, 'r13');
  assert.equal(r.einheiten[0].komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(S.plan().treppe.lauf.laeufe[0].stufen, 6);
});
