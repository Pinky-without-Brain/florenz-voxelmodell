'use strict';
// W7c: Museo dell'Opera del Duomo (projects/museo_opera_duomo): Maske, drei Ebenen, Sala del Paradiso über zwei Geschosse, Portale, Säle, Begehbarkeit, Licht.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const PAL = require('../spec/palette.js');
const MO = require('../../projects/museo_opera_duomo/model/_mo.js');
const RA = require('../../projects/museo_opera_duomo/model/_raeume.js');

const project = getProject('museo_opera_duomo', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = MO.Y;
const D = MO.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Museo: Projektfelder, Maske, drei Ebenen wie OSM (23 Blöcke), keine Baufehler', () => {
  assert.equal(project.json.bodenY, 65);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 14051);
  assert.deepEqual(MO.BASIS, [0, 9, 17, 23]);
  assert.equal(MO.TRAUFE, 23);
});

test('Museo: zwei Portale zur Piazza offen, Wendeltreppe aus Treppenblöcken, verglaste Fenster nur zur Piazza', () => {
  const tore = world.oeffnungen.filter((o) => o.art === 'tor').reduce((s, o) => s + o.keys.length, 0);
  assert.ok(tore >= 2 * 5 * 6, `Portalzellen ${tore}`);
  let treppen = 0, glas = 0;
  grid.forEach((x, y, z, e) => {
    if (PAL.isTreppe(e.type) && e.part === 'treppe') treppen++;
    if (e.part === 'fenster' && e.type.includes('glass')) glas++;
  });
  assert.ok(treppen >= 2 * 8, `Treppenblöcke ${treppen}`);
  assert.ok(glas > 100, `Fensterglas ${glas}`);
  grid.forEach((x, y, z, e) => { if (e.part === 'fenster') assert.ok(RA.fensterOrt(MO.zelleBei(x, z) || { x, z }), `Fenster ohne Piazza bei ${x},${z}`); });
});

test('Museo: Sala del Paradiso ist zwei Geschosse hoch (kein Boden des 1. OG über der Halle), Replik der Arnolfo-Fassade vorhanden', () => {
  const h = D.haupt.filter((c) => c.d8 > 6 && c.u > 60 && c.u < 85 && c.w > 120 && c.w < 135).sort((a, b) => a.d8 - b.d8)[0] || D.haupt.find((c) => c.d8 > 4 && c.u > 60 && c.u < 80 && c.w > 112 && c.w < 125);
  assert.ok(h);
  for (let yr = 8; yr <= 15; yr++) assert.ok(!grid.has(h.x, Y(yr), h.z), `Halle Lage ${yr}`);   // Lage 16 trägt die Kassettendecke
  assert.ok(grid.has(h.x, Y(17), h.z), 'Decke der Halle = Boden des 2. OG');
  assert.ok(grid.has(h.x, Y(0), h.z));
  // Fassadenfeld (Gold, Spitzbogenportal dunkel) in der Nordwand der Halle
  let gold = 0, dunkel = 0;
  grid.forEach((x, y, z, e) => {
    if (!e.part.startsWith('trennwaende')) return;
    const c = MO.zelleBei(x, z);
    if (!c || c.w < 105 || c.w > 106.5 || c.u < 51 || c.u > 99 || y < Y(2) || y > Y(15)) return;
    if (e.type === 'gold_block') gold++;
    if (e.type === 'polished_deepslate') dunkel++;
  });
  assert.ok(gold > 20, `Gold ${gold}`);
  assert.ok(dunkel > 40, `Portalöffnungen ${dunkel}`);
});

test('Museo: begehbar bis in alle ausgestalteten Säle (drei Ebenen), dicht', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const steh = (teil, yBoden) => {
    let best = null;
    grid.forEach((x, y, z, e) => {
      if (e.part !== teil || y !== yBoden || best) return;
      if (!grid.has(x, y + 1, z) && !grid.has(x, y + 2, z) && !grid.has(x, y + 3, z)) best = [x, y + 1, z];
    });
    return best;
  };
  const raeume = [['eingangshalle', 0], ['galleria_sculture', 0], ['tribuna_pieta', 0], ['sala_maddalena', 0], ['korridor_marmor', 0], ['sala_paradiso', 0],
    ['sala_navate', 1], ['galleria_campanile', 1], ['galleria_cupola', 1], ['sala_cantorie', 1], ['sala_silberaltar', 1], ['fassadenentwuerfe', 1],
    ['galerie_modelle', 2], ['aussichtsraum', 2], ['saal_giotto', 2], ['saal_paramente', 2]];
  for (const [teil, s] of raeume) {
    const c = steh(teil, Y(MO.BASIS[s]));
    assert.ok(c, `keine Stehzelle in ${teil}`);
    assert.ok(r.erreicht(...c), `nicht erreichbar: ${teil}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Museo: Licht höchstens 12 Blöcke von einer Seelaterne, Content mit Quelle und Vereinfachung', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 60, String(lichter.length));
  for (let s = 0; s < 3; s++) {
    const y = Y(MO.BASIS[s]);
    for (const c of D.haupt) {
      if (!grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.5), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
  const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'museo_opera_duomo', 'content', 'modul_6.json'), 'utf8'));
  for (const id of RA.TEILE) {
    assert.ok(j.parts[id], id);
    assert.ok(/ereinfacht/.test(j.parts[id].caution + j.parts[id].description), `${id}: Hinweis „vereinfacht“`);
    assert.ok(j.parts[id].fact.length > 20, id);
  }
});
