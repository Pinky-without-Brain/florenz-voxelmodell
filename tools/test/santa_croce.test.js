'use strict';
// V3 D3: Basilica di Santa Croce (projects/santa_croce). Der Test baut das Projekt einmal im Speicher und prüft
// Katalogmaße (Referenzmaße §2), Öffnungen und Begehbarkeit.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const S = require('../../projects/santa_croce/model/_sc.js');

const project = getProject('santa_croce', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;

test('Santa Croce: Projektfelder, Masken und Zonen', () => {
  assert.equal(project.json.bodenY, 64);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  const L = S.lade();
  assert.equal(L.H.size, 20762);
  assert.ok(L.C.size >= 130 && L.C.size <= 141, String(L.C.size));
  const z = {};
  for (const c of L.haupt) z[c.zone] = (z[c.zone] || 0) + 1;
  for (const k of ['fassade', 'mittel', 'seite', 'vierung', 'quer', 'ostwand', 'kapelle', 'chor']) assert.ok(z[k] > 0, k);
  // sieben Joche zu je ≈ 25,7 Blöcken
  assert.equal(S.JOCHE.length, 8);
  for (let b = 0; b < 7; b++) { const l = S.JOCHE[b + 1] - S.JOCHE[b]; assert.ok(l > 24.5 && l < 27, String(l)); }
});

test('Santa Croce: Mittelschiff 34 m hoch (Dachhaut First Lage 70), Campanile bis Lage 156, Fassade bis Lage 85', () => {
  let maxY = 0, firstM = 0;
  grid.forEach((x, y, z, e) => {
    if (y > maxY) maxY = y;
    if (e.part === 'dach_mittelschiff' && y > firstM) firstM = y;
  });
  assert.equal(firstM, S.Y(70));
  assert.equal(maxY, S.Y(156));
  let stern = 0;
  grid.forEach((x, y, z, e) => { if (e.part === 'fialen' && y === S.Y(85)) stern++; });
  assert.ok(stern > 0);
});

test('Santa Croce: drei Fassadenportale, Nordportal, Turmtür und offene Glockenstube', () => {
  const arten = {};
  for (const o of world.oeffnungen) arten[o.art + '|' + o.part] = (arten[o.art + '|' + o.part] || 0) + o.keys.length;
  assert.ok(arten['tor|fassade_kern'] > 300);
  assert.ok(arten['tuer|fassade_kern'] > 200);
  assert.ok(arten['tuer|seitenwand_nord'] > 50);
  assert.ok(arten['tuer|campanile_schaft'] > 20);
  assert.ok(arten['fenster_offen|glockenstube'] > 100);
});

test('Santa Croce: Begehbarkeit – keine nicht erreichbare Komponente, Glockenstube über die Wendeltreppe erreichbar', () => {
  const r = laufe({ project, world, grid, ground: require('../projects.js').loadSpecs(project).ground, root: ROOT }, 'r13');
  const e = r.einheiten[0];
  assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.ok(e.anteil > 85, String(e.anteil));
  assert.ok(S.plan().camp.treppe.lauf.laeufe.length > 100);
});
