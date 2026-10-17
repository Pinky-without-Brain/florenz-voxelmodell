'use strict';
// W8b: Palazzo della Crocetta (projects/palazzo_della_crocetta): Maske, drei Geschosse, Portale, Treppe, Museumssäle, Begehbarkeit, Licht.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const PAL = require('../spec/palette.js');
const CR = require('../../projects/palazzo_della_crocetta/model/_cr.js');
const RA = require('../../projects/palazzo_della_crocetta/model/_raeume.js');

const project = getProject('palazzo_della_crocetta', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = CR.Y;
const D = CR.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Crocetta: Projektfelder, Maske mit einem Hof, drei Geschosse, keine Baufehler', () => {
  assert.equal(project.json.bodenY, 68);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.ok(D.haupt.length > 18100 && D.haupt.length < 18250, String(D.haupt.length));
  assert.equal(D.hofZellen.length > 1000, true);
  assert.deepEqual(CR.BASIS, [0, 12, 24, 33]);
});

test('Crocetta: Portale (Via della Colonna, Via Gino Capponi) und Hoftüren offen, Treppe aus Treppenblöcken, verglaste Fenster', () => {
  const tore = world.oeffnungen.filter((o) => o.art === 'tor').reduce((s, o) => s + o.keys.length, 0);
  assert.ok(tore >= 2 * 4 * 6, `Portalzellen ${tore}`);
  const hoftueren = world.oeffnungen.filter((o) => o.art === 'tuer' && o.part === 'hofwaende').reduce((s, o) => s + o.keys.length, 0);
  assert.ok(hoftueren >= 3 * 3 * 5, `Hoftüren ${hoftueren}`);
  let treppen = 0, glas = 0;
  grid.forEach((x, y, z, e) => {
    if (PAL.isTreppe(e.type) && e.part === 'treppe') treppen++;
    if (e.part === 'fenster' && e.type.includes('glass')) glas++;
  });
  assert.ok(treppen >= 3 * 8, `Treppenblöcke ${treppen}`);
  assert.ok(glas > 1500, `Fensterglas ${glas}`);
});

test('Crocetta: 24 Fensterachsen auf den beiden Fronten zur Via der Colonna (Raster 8,6)', () => {
  // Fensterspalten im Rahmen CR an der Außenkante w > 78 im Piano 1 (Lage 16): getrennte Gruppen entlang u
  const us = [];
  grid.forEach((x, y, z, e) => {
    if (e.part !== 'fenster' || y !== Y(16)) return;
    const c = CR.zelleBei(x, z);
    if (c && c.w > 78) us.push(Math.round(c.u));
  });
  us.sort((a, b) => a - b);
  let gruppen = 0;
  for (let i = 0; i < us.length; i++) if (i === 0 || us[i] - us[i - 1] > 3) gruppen++;
  assert.ok(gruppen >= 20 && gruppen <= 26, `Fensterachsen ${gruppen}`);
});

test('Crocetta: begehbar bis in alle ausgestalteten Räume, Cortile, drei Geschosse, dicht', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.ok(r.anteil > 80, String(r.anteil));
  const steh = (teil, yBoden) => {
    let best = null;
    grid.forEach((x, y, z, e) => {
      if (e.part !== teil || y !== yBoden || best) return;
      if (!grid.has(x, y + 1, z) && !grid.has(x, y + 2, z) && !grid.has(x, y + 3, z)) best = [x, y + 1, z];
    });
    return best;
  };
  const raeume = [['androne', 0], ['salone_nicchio', 0], ['cortile', 0], ['museo_egizio', 1], ['sala_chimera', 1], ['corridoio_maddalena', 1], ['museo_etrusco', 2], ['galleria_idolino', 2]];
  for (const [teil, s] of raeume) {
    const c = steh(teil, Y(CR.BASIS[s]));
    assert.ok(c, `keine Stehzelle in ${teil}`);
    assert.ok(r.erreicht(...c), `nicht erreichbar: ${teil}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Crocetta: Licht höchstens 12 Blöcke von einer Seelaterne in allen drei Geschossen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 200, String(lichter.length));
  for (let s = 0; s < 3; s++) {
    const y = Y(CR.BASIS[s]);
    for (const c of D.haupt) {
      if (!grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.5), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Crocetta: Content mit Quelle und Vereinfachung', () => {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'palazzo_della_crocetta', 'content', 'modul_6.json'), 'utf8'));
  for (const id of RA.TEILE) {
    assert.ok(j.parts[id], id);
    assert.ok(/ereinfacht/.test(j.parts[id].caution + j.parts[id].description) || id === 'licht_ausstattung', `${id}: Hinweis „vereinfacht“`);
    assert.ok(j.parts[id].fact.length > 20, id);
  }
});
