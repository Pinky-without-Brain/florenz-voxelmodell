'use strict';
// W5b: Ognissanti (projects/ognissanti): Schiff mit Seitenaltären, Querhaus, Sakristei, Kapelle, Chor, Konvent mit Cenacolo,
// Campanile (building:part w478272187, hier um einen Block je Seite aufgeweitet), Ausstattung nach Quellen.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const palette = require('../spec/palette.js');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const O = require('../../projects/ognissanti/model/_og.js');
const H = require('./campanile_helfer.js');

const project = getProject('ognissanti', { root: ROOT });
const world = buildWorld({ project });
const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
const D = O.lade();
const e = laufe(ctx, 'r13').einheiten[0];
const Y = O.Y;
const stehZelle = (u, w, yr) => { const p = D.R.toWorld(u, w); return [Math.floor(p.x), Y(yr), Math.floor(p.z)]; };
const erreicht = (u, w, yr = 1) => e.erreicht(...stehZelle(u, w, yr));

test('Ognissanti: Projektfelder, Umriss in 14 Teilen, Campanile-Maske', () => {
  assert.equal(project.json.bodenY, 56);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.cells.length + D.camp.length, 7287);                // Zellen des OSM-Umrisses w167273908 (Fläche 7.280 Blöcke)
  assert.ok(D.camp.length >= 190 && D.camp.length <= 215, String(D.camp.length));
  const teile = new Set(D.cells.map((c) => c.teil));
  for (const t of O.TEILE) assert.ok(teile.has(t.id), 'Teil ' + t.id);
  let maxY = 0;
  world.grid.forEach((x, y) => { if (y > maxY) maxY = y; });
  assert.equal(maxY - Y(0), O.TURM.top);
});

test('Ognissanti: Portal offen, alle Räume erreichbar, dicht', () => {
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor'));
  assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
  assert.ok(erreicht(8, 16), 'Schiff hinter dem Portal');
  assert.ok(erreicht(58, 14), 'Vierung');
  assert.ok(erreicht(58, -12), 'linkes Querhaus');
  assert.ok(erreicht(78, -12), 'Sakristei');
  assert.ok(erreicht(85, 37), 'rechte Kapelle');
  assert.ok(erreicht(92, 14), 'Chor hinter dem Hochaltar');
  assert.ok(erreicht(20, 38), 'Cenacolo-Saal');
  assert.ok(erreicht(53, 38), 'Treppenraum des Cenacolo-Trakts');
  for (const st of O.plan().infos.stiegen) {
    const c = D.byKey.get(require('../city/poly.js').ck(st.x + 3, st.z + 3)) || D.byKey.get(require('../city/poly.js').ck(st.x - 3, st.z - 3));
    assert.ok(c, 'Zelle neben der Treppe ' + st.teil);
  }
  assert.ok(D.cells.filter((c) => O.OG_TEILE.includes(c.teil) && !c.wand).some((c) => e.erreicht(c.x, Y(14), c.z)), 'Obergeschosse erreichbar');
  for (const teil of ['d', 'l', 'f', 'c', 'm', 'e', 'h', 'n', 'j', 'i']) {
    const eg = D.cells.filter((c) => c.teil === teil && !c.wand).filter((c) => !world.grid.has(c.x, Y(1), c.z) && !world.grid.has(c.x, Y(2), c.z) && !world.grid.has(c.x, Y(3), c.z) && world.grid.has(c.x, Y(0), c.z));
    assert.ok(eg.length > 20 && eg.filter((c) => e.erreicht(c.x, Y(1), c.z)).length >= 0.95 * eg.length, 'Erdgeschoss ' + teil);
  }
});

test('Ognissanti: Konvent-Wendeltreppen aus Treppenblöcken mit Kopffreiheit, jeder Trakt mit Obergeschoss erreichbar', () => {
  const tr = H.zellen(world, 'konvent_treppen');
  assert.ok(tr.length > 200);
  assert.ok(tr.filter((c) => palette.isTreppe(c.type)).length >= 4 * 12);
  assert.equal(H.kopffreiheitVerstoesse(world, 'konvent_treppen'), 0);
  const st = O.plan().infos.stiegen;
  assert.equal(st.length, 4);
  for (const teil of O.OG_TEILE) {
    const og = D.cells.filter((c) => c.teil === teil && !c.wand).filter((c) => world.grid.has(c.x, Y(13), c.z) && !world.grid.has(c.x, Y(14), c.z) && !world.grid.has(c.x, Y(15), c.z) && !world.grid.has(c.x, Y(16), c.z));
    assert.ok(og.length > 50 && og.every((c) => e.erreicht(c.x, Y(14), c.z)), 'Obergeschoss ' + teil + ' (' + og.length + ')');
  }
});

test('Ognissanti: Campanile mit Wendeltreppe, Glockenstube erreichbar, drei große und eine kleine Glocke', () => {
  assert.ok(H.zellen(world, 'campanile_treppe').length > 200);
  assert.equal(H.kopffreiheitVerstoesse(world), 0);
  const stube = H.zellen(world, 'glockenstube').filter((c) => e.erreicht(c.x, c.y + 1, c.z));
  assert.ok(stube.length > 0, 'Glockenstube erreichbar');
  assert.ok(H.zellen(world, 'glocken').length >= 30);
  assert.ok(world.oeffnungen.some((o) => o.art === 'fenster_offen' && o.part === 'glockenstube'));
  assert.ok(world.oeffnungen.some((o) => o.art === 'tuer' && o.part === 'campanile_schaft'));   // Tür aus dem Schiff
});

test('Ognissanti: Licht höchstens 12 Blöcke von jeder Stehzelle (Schiff und Cenacolo-Trakt, beide Geschosse)', () => {
  const lichter = [];
  world.grid.forEach((x, y, z, el) => { if (el.part === 'licht') lichter.push({ x, y, z }); });
  assert.ok(lichter.length >= 30);
  for (const [teil, yr] of [['k', 1], ['m', 1], ['m', 14], ['c', 14]]) {
    let max = 0, n = 0;
    for (const c of D.cells) {
      if (c.raum !== teil || c.wand) continue;
      const y = Y(yr);
      if (world.grid.has(c.x, y, c.z) || world.grid.has(c.x, y + 1, c.z) || world.grid.has(c.x, y + 2, c.z) || !world.grid.has(c.x, y - 1, c.z)) continue;
      let d = Infinity;
      for (const l of lichter) if (l.y === y - 1) d = Math.min(d, Math.hypot(l.x - c.x, l.z - c.z));
      max = Math.max(max, d); n++;
    }
    assert.ok(n > 50 && max <= 12.01, `${teil} Lage ${yr}: ${n} Zellen, größter Abstand ${max}`);
  }
});

test('Ognissanti: Ausstattung nach Quellen mit Content, Quelle, Ort und Hinweis', () => {
  const teile = ['lunette_buglioni', 'seitenaltaere', 'beichtstuhl', 'vespucci_misericordia', 'botticelli_augustinus', 'ghirlandaio_hieronymus', 'giotto_kruzifix', 'saio_reliquiar', 'botticelli_grabplatte', 'hochaltar_ligorio', 'apsis_fresko', 'veit_stoss_kruzifix', 'cenacolo_fresko', 'cenacolo_sinopia', 'romei_fresken'];
  const content = {};
  for (const n of [6, 7]) Object.assign(content, JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'ognissanti', 'content', `modul_${n}.json`), 'utf8')).parts);
  for (const id of teile) {
    const z = H.zellen(world, id);
    assert.ok(z.length >= 5, id + ': ' + z.length);
    const p = content[id];
    assert.ok(p && p.description.length > 40 && p.tip && p.caution && p.fact, id + ' Content');
    assert.match(p.caution + ' ' + p.fact, /wikipedia/, id + ' Quelle');
    assert.match(p.caution, /Vereinfacht, nicht nach Vorbild/, id + ' Hinweis');
  }
  const raum = (id) => new Set(H.zellen(world, id).map((c) => O.zelleBei(c.x, c.z).raum));
  assert.deepEqual([...raum('giotto_kruzifix')], ['j']);                 // linkes Querhaus
  assert.deepEqual([...raum('saio_reliquiar')], ['j']);
  assert.deepEqual([...raum('botticelli_grabplatte')], ['n']);           // Kapelle im rechten Querhaus
  assert.deepEqual([...raum('cenacolo_fresko')], ['m']);                 // Refektorium im Konvent
  assert.deepEqual([...raum('veit_stoss_kruzifix')], ['k']);
  // Augustinus rechts, Hieronymus gegenüber auf gleicher Höhe im Schiff
  const mitte = (id) => { const z = H.zellen(world, id).map((c) => O.zelleBei(c.x, c.z)); return { u: z.reduce((a, c) => a + c.u, 0) / z.length, w: z.reduce((a, c) => a + c.w, 0) / z.length }; };
  const au = mitte('botticelli_augustinus'), hi = mitte('ghirlandaio_hieronymus');
  assert.ok(au.w > 15.5 && hi.w < 15.5 && Math.abs(au.u - hi.u) < 2, 'gegenüber');
  assert.ok(mitte('vespucci_misericordia').w > 15.5, 'Vespucci-Kapelle rechts');
  // Cenacolo: 16 Blöcke breit (810 cm), mehrere Farben, Goldrahmen
  const cz = H.zellen(world, 'cenacolo_fresko');
  const us = cz.map((c) => O.zelleBei(c.x, c.z).u);
  assert.ok(Math.max(...us) - Math.min(...us) >= 14.5, 'Breite');
  assert.ok(new Set(cz.map((c) => c.type)).size >= 6 && cz.some((c) => c.type === 'gold_block'));
  assert.ok(Math.max(...cz.map((c) => c.y)) - Math.min(...cz.map((c) => c.y)) >= 8, 'Höhe');
  // Seitenaltäre: sechs Gruppen je Seite
  const alt = H.zellen(world, 'seitenaltaere').map((c) => O.zelleBei(c.x, c.z));
  for (const seite of [(c) => c.w < 15.5, (c) => c.w > 15.5]) {
    const us = [...new Set(alt.filter(seite).map((c) => Math.round(c.u)))].sort((a, b) => a - b);
    assert.equal(us.filter((u, i) => i === 0 || u - us[i - 1] > 2).length, 6);
  }
  assert.ok(world.unzugaenglich.some((u) => /Dachraum/.test(JSON.stringify(u))));
});
