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

// ------------------------------------------------------------------ V5b: Campanile im Kreuzgangshof (Stufe C, 36 m angenommen)
const fs = require('node:fs');
const palette = require('../spec/palette.js');
const H = require('./campanile_helfer.js');

test('Carmine V5b: Campanile 36 m (±5 % der Annahme), im Hof westlich des Langhauses, Content vollständig', () => {
  const L = S.lade();
  assert.ok(L.camp.length > 170 && L.camp.length < 230, String(L.camp.length));
  assert.ok(L.camp.every((c) => c.u >= 76 && c.u < 90 && c.w >= 31 && c.w < 45));
  let maxY = 0;
  for (const p of ['campanile_schaft', 'glockenstube', 'campanile_spitze']) for (const c of H.zellen(world, p)) maxY = Math.max(maxY, c.y);
  const meter = (maxY - Math.min(...L.camp.map((c) => c.gt))) / 2;
  assert.ok(Math.abs(meter - 36) <= 36 * 0.05, 'Höhe ' + meter);
  assert.equal(maxY, S.YT(S.CAMP.top));
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'santa_maria_del_carmine', 'content', 'modul_7.json'), 'utf8'));
  for (const id of ['campanile_schaft', 'campanile_treppe', 'glockenstube', 'glockenjoch', 'glocken', 'campanile_spitze', 'campanile_licht']) {
    const p = content.parts[id];
    assert.ok(p && p.description.length > 40 && p.fact.length > 10 && p.caution.length > 10, id);
  }
  assert.match(content.parts.campanile_schaft.caution, /Stufe C/);
});

test('Carmine V5b: Tür vom Hof ≥ 2 × 3, Glockenstube über Treppenblöcke erreichbar, Kopffreiheit 3, Licht, Glocken am Joch', () => {
  const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
  const e = laufe(ctx, 'r13').einheiten[0];
  assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const tuer = world.oeffnungen.filter((o) => o.art === 'tuer' && o.part === 'campanile_schaft').reduce((n, o) => n + o.keys.length, 0);
  assert.ok(tuer >= 2 * 3 * 2, 'Türzellen ' + tuer);
  const stufen = H.zellen(world, 'campanile_treppe').filter((c) => palette.isTreppe(c.type));
  assert.ok(stufen.length > 80);
  assert.ok(stufen.filter((c) => e.erreicht(c.x, c.y + 1, c.z)).length >= stufen.length * 0.9, 'Stufen erreichbar');
  const boden = H.zellen(world, 'glockenstube').filter((c) => c.y === S.YT(S.CAMP.glocke0) && e.erreicht(c.x, c.y + 1, c.z));
  assert.ok(boden.length >= 20, 'Stubenboden erreichbar: ' + boden.length);
  assert.equal(H.kopffreiheitVerstoesse(world), 0);
  const licht = H.zellen(world, 'campanile_licht');
  assert.ok(licht.length >= 12 && licht.every((c) => c.type === 'sea_lantern'));
  assert.ok(H.lichtMaxLuecke(licht, S.YT(0), S.YT(S.CAMP.glocke1)) <= 12);
  const glocken = H.zellen(world, 'glocken');
  assert.equal(H.gruppen(glocken), 4);
  assert.ok(glocken.every((c) => c.type === 'cut_copper'));
});
