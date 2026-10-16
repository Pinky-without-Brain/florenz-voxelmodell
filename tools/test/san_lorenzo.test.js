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

// ------------------------------------------------------------------ V5b: Campanile (Ruggieri 1740–41, 54 m)
const fs = require('node:fs');
const palette = require('../spec/palette.js');
const H = require('./campanile_helfer.js');

test('San Lorenzo V5b: Campanile 54 m (±5 %), Maske neben der Neuen Sakristei, Content vollständig', () => {
  const L = S.lade();
  assert.ok(L.camp.length > 180 && L.camp.length < 230, String(L.camp.length));
  let maxY = 0;
  for (const p of ['campanile_schaft', 'glockenstube', 'campanile_spitze']) for (const c of H.zellen(world, p)) maxY = Math.max(maxY, c.y);
  const gelaende = Math.min(...L.camp.map((c) => c.gt));
  const meter = (maxY - gelaende) / 2;
  assert.ok(Math.abs(meter - 54) <= 54 * 0.05, 'Höhe ' + meter);
  assert.equal(maxY, S.Y(S.CAMP.top));
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'san_lorenzo', 'content', 'modul_9.json'), 'utf8'));
  for (const id of ['campanile_schaft', 'campanile_treppe', 'glockenstube', 'glockenjoch', 'glocken', 'campanile_spitze', 'campanile_licht']) {
    const p = content.parts[id];
    assert.ok(p && p.description.length > 40 && p.fact.length > 10 && p.caution.length > 10, id);
  }
});

test('San Lorenzo V5b: Tür ≥ 2 × 3, Glockenstube über Treppenblöcke erreichbar, Kopffreiheit 3, Licht, fünf Glocken am Joch', () => {
  const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
  const e = laufe(ctx, 'r13').einheiten[0];
  assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const tuer = world.oeffnungen.filter((o) => o.art === 'tuer' && o.part === 'campanile_schaft').reduce((n, o) => n + o.keys.length, 0);
  assert.ok(tuer >= 2 * 3 * 2, 'Türzellen ' + tuer);
  const stufen = H.zellen(world, 'campanile_treppe').filter((c) => palette.isTreppe(c.type));
  assert.ok(stufen.length > 100);
  assert.ok(stufen.filter((c) => e.erreicht(c.x, c.y + 1, c.z)).length >= stufen.length * 0.9, 'Stufen erreichbar');
  const boden = H.zellen(world, 'glockenstube').filter((c) => c.y === S.Y(S.CAMP.glocke0) && e.erreicht(c.x, c.y + 1, c.z));
  assert.ok(boden.length >= 20, 'Stubenboden erreichbar: ' + boden.length);
  assert.equal(H.kopffreiheitVerstoesse(world), 0);
  const licht = H.zellen(world, 'campanile_licht');
  assert.ok(licht.length >= 16 && licht.every((c) => c.type === 'sea_lantern'));
  assert.ok(H.lichtMaxLuecke(licht, S.Y(0), S.Y(S.CAMP.glocke1)) <= 12);
  const glocken = H.zellen(world, 'glocken');
  assert.equal(H.gruppen(glocken), 5);
  assert.ok(glocken.every((c) => c.type === 'cut_copper'));
  assert.ok(H.zellen(world, 'glockenjoch').every((c) => c.type === 'dark_oak_planks'));
});
