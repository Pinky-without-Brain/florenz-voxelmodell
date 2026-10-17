'use strict';
// W8b: Biblioteca Nazionale Centrale (projects/biblioteca_nazionale): Maske, drei Geschosse, Portikus, Türme mit Statuen, Säle, Magazine, Begehbarkeit, Licht.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const PAL = require('../spec/palette.js');
const BN = require('../../projects/biblioteca_nazionale/model/_bn.js');
const RA = require('../../projects/biblioteca_nazionale/model/_raeume.js');

const project = getProject('biblioteca_nazionale', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = BN.Y;
const D = BN.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Biblioteca: Projektfelder, Maske ohne Hof, drei Geschosse, keine Baufehler', () => {
  assert.equal(project.json.bodenY, 61);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.ok(D.haupt.length > 20900 && D.haupt.length < 21100, String(D.haupt.length));
  assert.equal(D.hofZellen.length, 0);
  assert.deepEqual(BN.BASIS, [0, 13, 25, 35]);
});

test('Biblioteca: Portikus mit Bögen bis zum Boden, Portal der Tribuna, Wendeltreppe, verglaste Fenster', () => {
  const arkaden = world.oeffnungen.filter((o) => o.art === 'arkade' && o.part === 'portikus').reduce((s, o) => s + o.keys.length, 0);
  assert.ok(arkaden >= 5 * 4 * 6, `Arkadenzellen ${arkaden}`);
  const tore = world.oeffnungen.filter((o) => o.art === 'tor').reduce((s, o) => s + o.keys.length, 0);
  assert.ok(tore >= 4 * 6, `Portalzellen ${tore}`);
  let treppen = 0, glas = 0;
  grid.forEach((x, y, z, e) => {
    if (PAL.isTreppe(e.type) && e.part === 'treppe') treppen++;
    if (e.part === 'fenster' && e.type.includes('glass')) glas++;
  });
  assert.ok(treppen >= 3 * 8, `Treppenblöcke ${treppen}`);
  assert.ok(glas > 1500, `Fensterglas ${glas}`);
});

test('Biblioteca: zwei Türme über der Traufe mit den Statuen von Dante und Galileo', () => {
  const hoch = { W: 0, O: 0 };
  grid.forEach((x, y, z, e) => {
    if (e.part !== 'turm_statuen' && e.part !== 'turm') return;
    const c = BN.zelleBei(x, z);
    if (!c) return;
    const id = c.u < 170 ? 'W' : 'O';
    hoch[id] = Math.max(hoch[id], y - Y(0));
  });
  assert.ok(hoch.W >= BN.TURM_TOP + 6 && hoch.O >= BN.TURM_TOP + 6, JSON.stringify(hoch));
  let statuen = 0, hohl = 0;
  grid.forEach((x, y, z, e) => { if (e.part === 'turm_statuen') statuen++; });
  for (const u of world.unzugaenglich) if (u.part === 'turm') hohl += u.keys.length;
  assert.ok(statuen >= 20, `Statuenzellen ${statuen}`);
  assert.ok(hohl > 300, `Turmhohlraum ${hohl}`);
});

test('Biblioteca: begehbar bis in alle ausgestalteten Säle und Magazine, dicht', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.ok(r.anteil > 70, String(r.anteil));
  const steh = (teil, yBoden) => {
    let best = null;
    grid.forEach((x, y, z, e) => {
      if (e.part !== teil || y !== yBoden || best) return;
      if (!grid.has(x, y + 1, z) && !grid.has(x, y + 2, z) && !grid.has(x, y + 3, z)) best = [x, y + 1, z];
    });
    return best;
  };
  const raeume = [['tribuna', 0], ['verteilerhalle', 0], ['katalogsaal', 0], ['zeitschriftensaal', 0], ['verwaltung', 0], ['sala_lettura', 1], ['sala_consultazione', 1],
    ['lesesaal_oben', 2], ['magazin_nord', 0], ['magazin_nord', 1], ['magazin_nord', 2], ['magazin_ost', 0], ['magazin_ost', 1], ['magazin_ost', 2]];
  for (const [teil, s] of raeume) {
    const c = steh(teil, Y(BN.BASIS[s]));
    assert.ok(c, `keine Stehzelle in ${teil} (Geschoss ${s})`);
    assert.ok(r.erreicht(...c), `nicht erreichbar: ${teil} (Geschoss ${s})`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Biblioteca: Lesesaal mit zwei Säulenreihen, Magazine mit Regalen bis zur Decke', () => {
  let saeulen = 0, regale = 0;
  grid.forEach((x, y, z, e) => {
    if (e.part === 'sala_lettura' && e.type === 'quartz_pillar') saeulen++;
    if ((e.part === 'magazin_nord' || e.part === 'magazin_ost') && e.type === 'dark_oak_planks') regale++;
  });
  assert.ok(saeulen >= 2 * 6 * 3, `Säulenzellen ${saeulen}`);
  assert.ok(regale > 5000, `Regalblöcke ${regale}`);
});

test('Biblioteca: Licht höchstens 12 Blöcke von einer Seelaterne in allen drei Geschossen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 50, String(lichter.length));
  for (let s = 0; s < 3; s++) {
    const y = Y(BN.BASIS[s]);
    for (const c of D.haupt) {
      if (!grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.5), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Biblioteca: Content mit Quelle und Vereinfachung', () => {
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'biblioteca_nazionale', 'content', 'modul_7.json'), 'utf8'));
  for (const id of RA.TEILE) {
    assert.ok(j.parts[id], id);
    assert.ok(/ereinfacht/.test(j.parts[id].caution + j.parts[id].description) || id === 'licht_ausstattung', `${id}: Hinweis „vereinfacht“`);
    assert.ok(j.parts[id].fact.length > 20, id);
  }
});
