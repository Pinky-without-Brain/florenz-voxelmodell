'use strict';
// V3 D3: Santissima Annunziata (projects/santissima_annunziata): Portikus, Chiostrino, Tempietto, Tribuna, Begehbarkeit.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const S = require('../../projects/santissima_annunziata/model/_sa.js');

const project = getProject('santissima_annunziata', { root: ROOT });
const world = buildWorld({ project });

test('Annunziata: fehlerfrei, 8 + 9 Kapellen, Tempietto-Säulen 5,25 m', () => {
  assert.deepEqual(world.errors, []);
  assert.equal(S.KAP.links + S.KAP.rechts, 17);
  let saeule = 0;
  world.grid.forEach((x, y, z, e) => { if (e.part === 'tempietto' && e.type === 'quartz_pillar') saeule = Math.max(saeule, y - S.Y(0)); });
  assert.equal(saeule, S.TEMPIETTO.saeule - 1);
});

test('Annunziata: Kuppel der Tribuna über dem Tambour, Hof ohne Dach', () => {
  let kuppelTop = 0, hofDach = 0;
  world.grid.forEach((x, y, z, e) => {
    if (e.part === 'kuppel' && y > kuppelTop) kuppelTop = y;
    if (y > S.Y(0)) { const c = S.zelleBei(x, z); if (c && c.zone === 'chiostrino' && c.u > 20 && c.u < 34 && c.w > 2 && c.w < 24) hofDach++; }
  });
  assert.equal(kuppelTop, S.Y(S.TRIB.tambour + Math.floor(S.TRIB.rKa)));
  assert.equal(hofDach, 0);
});

test('Annunziata: Portikus, Arkaden und Portale offen, alles erreichbar, dicht', () => {
  const arten = {};
  for (const o of world.oeffnungen) arten[o.art + '|' + o.part] = (arten[o.art + '|' + o.part] || 0) + o.keys.length;
  assert.ok(arten['tor|portikus'] > 100);
  assert.ok(arten['arkade|chiostrino'] > 100);
  const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
  assert.equal(laufe(ctx, 'r13').einheiten[0].komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

// ------------------------------------------------------------------ V5b: Glockengiebel (campanile a vela) auf dem hinteren Tambour
const fs = require('node:fs');
const palette = require('../spec/palette.js');
const H = require('./campanile_helfer.js');
const { xOfKey, zOfKey } = require('../geom/grid.js');

test('Annunziata V5b: Glockengiebel mit fünf Öffnungen auf Höhe des Tambours, Content vollständig', () => {
  const offen = new Set();
  for (const o of world.oeffnungen) if (o.art === 'fenster_offen' && o.part === 'glockengiebel') {
    for (const k of o.keys) { const c = S.zelleBei(xOfKey(k), zOfKey(k)); offen.add(Math.round((c.w - S.TRIB.w) / S.GIEBEL.abstand)); }
  }
  assert.deepEqual([...offen].sort((a, b) => a - b), [-2, -1, 0, 1, 2]);
  const giebel = H.zellen(world, 'glockengiebel');
  const top = Math.max(...giebel.map((c) => c.y));
  assert.ok(top >= S.Y(S.GIEBEL.fuss + S.GIEBEL.hoehe - 1) && top <= S.Y(S.GIEBEL.fuss + S.GIEBEL.hoehe), String(top - S.Y(0)));
  // Plattform auf Höhe der Tambouroberkante (Lage 42)
  assert.equal(S.GIEBEL.plattform, S.TRIB.tambour);
  assert.ok(H.zellen(world, 'campanile_plattform').every((c) => c.y === S.Y(S.TRIB.tambour)));
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'santissima_annunziata', 'content', 'modul_7.json'), 'utf8'));
  for (const id of ['campanile_schaft', 'campanile_treppe', 'campanile_sockel', 'campanile_plattform', 'glockengiebel', 'glockenjoch', 'glocken', 'campanile_licht']) {
    const p = content.parts[id];
    assert.ok(p && p.description.length > 40 && p.fact.length > 10 && p.caution.length > 10, id);
  }
  assert.match(content.parts.glockengiebel.fact, /fünf Öffnungen/);
});

test('Annunziata V5b: Zugang durch die Rückkapelle, Plattform über Treppenblöcke erreichbar, Kopffreiheit 3, Licht, fünf Glocken am Balken', () => {
  const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
  const e = laufe(ctx, 'r13').einheiten[0];
  assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const tuer = world.oeffnungen.filter((o) => o.art === 'tuer' && o.part === 'campanile_schaft').reduce((n, o) => n + o.keys.length, 0);
  assert.ok(tuer >= 2 * 3 * 2, 'Türzellen ' + tuer);
  const stufen = H.zellen(world, 'campanile_treppe').filter((c) => palette.isTreppe(c.type));
  assert.ok(stufen.length > 60);
  assert.ok(stufen.filter((c) => e.erreicht(c.x, c.y + 1, c.z)).length >= stufen.length * 0.9, 'Stufen erreichbar');
  const platt = H.zellen(world, 'campanile_plattform').filter((c) => e.erreicht(c.x, c.y + 1, c.z));
  assert.ok(platt.length >= 40, 'Plattform erreichbar: ' + platt.length);
  assert.equal(H.kopffreiheitVerstoesse(world), 0);
  const licht = H.zellen(world, 'campanile_licht');
  assert.ok(licht.length >= 12 && licht.every((c) => c.type === 'sea_lantern'));
  assert.ok(H.lichtMaxLuecke(licht, S.Y(0), S.Y(S.GIEBEL.plattform)) <= 12);
  const glocken = H.zellen(world, 'glocken');
  assert.equal(H.gruppen(glocken), 5);
  assert.ok(glocken.every((c) => c.type === 'cut_copper'));
  assert.ok(H.zellen(world, 'glockenjoch').every((c) => c.type === 'dark_oak_planks'));
});
