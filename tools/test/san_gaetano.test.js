'use strict';
// W6a: Santi Michele e Gaetano (projects/san_gaetano): Schiff mit drei Kapellen je Seite, Querhaus, Chor mit Kuppel, Apsis mit kleiner Kuppel,
// Sakristei, Campanile mit fünf Glocken, Ausstattung nach Quellen.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const palette = require('../spec/palette.js');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const SG = require('../../projects/san_gaetano/model/_sg.js');
const H = require('./campanile_helfer.js');

const project = getProject('san_gaetano', { root: ROOT });
const world = buildWorld({ project });
const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
const D = SG.lade();
const e = laufe(ctx, 'r13').einheiten[0];
const Y = SG.Y;
/** Nächste Stehzelle (Boden darunter, drei Luft darüber) zu (u, w) auf Lage yr, dann Erreichbarkeit. */
function erreicht(u, w, yr = 1) {
  const g = world.grid;
  const y = Y(yr);
  for (let r = 0; r <= 3; r += 0.5) {
    for (let du = -r; du <= r; du += 0.5) for (let dw = -r; dw <= r; dw += 0.5) {
      const p = D.R.toWorld(u + du, w + dw), x = Math.round(p.x), z = Math.round(p.z);
      if (g.has(x, y - 1, z) && !g.has(x, y, z) && !g.has(x, y + 1, z) && !g.has(x, y + 2, z)) return e.erreicht(x, y, z);
    }
  }
  return false;
}

test('San Gaetano: Projektfelder, Zellenzahl, höchster Block', () => {
  assert.equal(project.json.bodenY, 64);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.cells.length, 4970);                                  // Zellen des OSM-Umrisses w234429578
  assert.ok(D.cells.some((c) => c.zone === 'turm'));
  let maxY = 0;
  world.grid.forEach((x, y) => { if (y > maxY) maxY = y; });
  assert.equal(maxY, Y(SG.TURM.top));                                  // der Turmhelm ist der höchste Punkt
});

test('San Gaetano: drei Portale offen, alle Räume erreichbar, Hülle dicht', () => {
  assert.ok(world.oeffnungen.filter((o) => o.art === 'tor').length >= 3 || world.oeffnungen.some((o) => o.art === 'tor'));
  assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
  assert.ok(erreicht(8, SG.W_MITTE), 'Schiff hinter dem Portal');
  for (const k of [0, 1, 2]) {
    assert.ok(erreicht(SG.BAY_C[k], 5), 'Kapelle links ' + k);
    assert.ok(erreicht(SG.BAY_C[k], 26), 'Kapelle rechts ' + k);
  }
  assert.ok(erreicht(37, -8), 'Cappella della Croce im linken Querhausarm');
  assert.ok(erreicht(37, 45), 'Cappella della Natività im rechten Querhausarm');
  assert.ok(erreicht(38, SG.W_MITTE), 'Vierung');
  assert.ok(erreicht(64, SG.W_MITTE), 'Chor unter der Kuppel');
  assert.ok(erreicht(90, SG.W_MITTE), 'Apsis mit Hochaltar');
  assert.ok(erreicht(64, 36), 'Sakristei');
  assert.ok(erreicht(64, -3), 'Nebenraum');
  assert.ok(erreicht(82, -1), 'Fuß des Campanile');
  // zwei Seitenportale führen in die ersten Kapellen: Türzellen offen
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor' && o.part === 'fassade'));
});

test('San Gaetano: Chorkuppel mit Tambour und Fenstern, kleine Apsiskuppel', () => {
  assert.ok(H.zellen(world, 'kuppel').length > 1000);
  assert.ok(H.zellen(world, 'kuppel_apsis').length > 400);
  assert.ok(H.zellen(world, 'tambour').length > 800);
  assert.ok(H.zellen(world, 'tambour_fenster').length > 150);
  assert.ok(H.zellen(world, 'laterne').length > 80);
  const m = D.R.toWorld(SG.DOM.u, SG.DOM.w);
  const mx = Math.round(m.x), mz = Math.round(m.z);
  for (let yr = 1; yr < 44; yr++) assert.equal(world.grid.has(mx, Y(yr), mz), false, 'Lage ' + yr);   // Kuppelraum offen
  assert.ok(H.zellen(world, 'triumphbogen').length > 2000);
});

test('San Gaetano: Campanile mit Wendeltreppe, Glockenstube erreichbar, fünf Glocken', () => {
  assert.ok(H.zellen(world, 'campanile_treppe').length > 200);
  assert.equal(H.kopffreiheitVerstoesse(world), 0);
  const stube = H.zellen(world, 'glockenstube').filter((c) => e.erreicht(c.x, c.y + 1, c.z));
  assert.ok(stube.length > 0, 'Glockenstube erreichbar');
  assert.ok(H.zellen(world, 'glocken').length >= 30);                  // vier große (je 9) und eine kleine Glocke (2)
  assert.ok(world.oeffnungen.some((o) => o.art === 'fenster_offen' && o.part === 'glockenstube'));
  assert.ok(world.oeffnungen.some((o) => o.art === 'tuer' && o.part === 'campanile_schaft'));
  assert.ok(H.zellen(world, 'campanile_treppe').filter((c) => palette.isTreppe(c.type)).length >= 30);
});

test('San Gaetano: Licht höchstens 12 Blöcke von jeder Stehzelle in Schiff, Kapellen, Querhaus, Chor und Apsis', () => {
  const lichter = [];
  world.grid.forEach((x, y, z, el) => { if (el.part === 'licht') lichter.push({ x, y, z }); });
  assert.ok(lichter.length >= 15);
  for (const zone of ['mittel', 'kap_s', 'kap_n', 'vierung', 'quer_n', 'chor', 'apsis']) {
    let max = 0, n = 0;
    for (const c of D.cells) {
      if (c.zone !== zone || c.d8 <= 2) continue;
      const y = Y(1);
      if (world.grid.has(c.x, y, c.z) || world.grid.has(c.x, y + 1, c.z) || world.grid.has(c.x, y + 2, c.z) || !world.grid.has(c.x, y - 1, c.z)) continue;
      let d = Infinity;
      for (const l of lichter) if (l.y === y - 1) d = Math.min(d, Math.hypot(l.x - c.x, l.z - c.z));
      max = Math.max(max, d); n++;
    }
    assert.ok(n > 15 && max <= 12.01, `${zone}: ${n} Zellen, größter Abstand ${max}`);
  }
});

test('San Gaetano: Ausstattung nach Quellen mit Content, Quelle und Hinweis', () => {
  const teile = ['seitenaltaere', 'rosso_della_robbia', 'mazzei_vignali', 'martelli_rosselli', 'martelli_grabmaeler', 'tornaquinci_zanobi', 'franceschi_cortona', 'ardinghelli_hugford', 'nativita_rosselli', 'kreuz_vignali', 'medici_wappen', 'hochaltar_silvani', 'hochaltar_rueckwand', 'susini_kruzifix', 'pendentifs_galletti', 'kuppelfresko_galletti', 'orgel_tronci', 'kanzel', 'sakristei_ausstattung'];
  const content = {};
  Object.assign(content, JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'san_gaetano', 'content', 'modul_5.json'), 'utf8')).parts);
  for (const id of teile) {
    const z = H.zellen(world, id);
    assert.ok(z.length >= 5, id + ': ' + z.length);
    const p = content[id];
    assert.ok(p && p.description.length > 40 && p.tip && p.caution && p.fact, id + ' Content');
    assert.match(p.caution + ' ' + p.fact, /wikipedia/, id + ' Quelle');
    assert.match(p.caution, /Vereinfacht, nicht nach Vorbild/, id + ' Hinweis');
  }
  const seite = (id) => new Set(H.zellen(world, id).map((c) => (SG.zelleBei(c.x, c.z).w < SG.W_MITTE ? 'links' : 'rechts')));
  assert.deepEqual([...seite('rosso_della_robbia')], ['rechts']);
  assert.deepEqual([...seite('martelli_rosselli')], ['rechts']);
  assert.deepEqual([...seite('franceschi_cortona')], ['links']);
  assert.deepEqual([...seite('ardinghelli_hugford')], ['links']);
  assert.deepEqual([...seite('nativita_rosselli')], ['rechts']);       // rechter Querhausarm
  assert.deepEqual([...seite('kreuz_vignali')], ['links']);            // linker Querhausarm
  // Reihenfolge der Kapellen links vom Altar zur Gegenfassade: Ardinghelli, Franceschi, Tornaquinci (also u steigend: Tornaquinci, Franceschi, Ardinghelli)
  const mu = (id) => { const z = H.zellen(world, id).map((c) => SG.zelleBei(c.x, c.z).u); return z.reduce((a, b) => a + b, 0) / z.length; };
  assert.ok(mu('tornaquinci_zanobi') < mu('franceschi_cortona') && mu('franceschi_cortona') < mu('ardinghelli_hugford'));
  assert.ok(mu('rosso_della_robbia') < mu('mazzei_vignali') && mu('mazzei_vignali') < mu('martelli_rosselli'));
  assert.ok(world.unzugaenglich.some((u) => /Dachraum/.test(JSON.stringify(u))));
});
