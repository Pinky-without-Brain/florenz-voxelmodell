'use strict';
// W7b: Loggia dei Servi di Maria (projects/loggia_dei_servi): Maske, Portikus mit neun Bögen, Räume, Begehbarkeit, Licht.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const WZ = require('../wahrzeichen');
const LS = require('../../projects/loggia_dei_servi/model/_ls.js');
const RA = require('../../projects/loggia_dei_servi/model/_raeume.js');

const project = getProject('loggia_dei_servi', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = LS.Y;
const D = LS.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Loggia dei Servi: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.bodenY, 69);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 6438);
  assert.equal(D.H.loecher().length, 6);
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(LS.TRAUFE + 1 + 4), 'höchster Block: Firstlage des Walmdachs');
  assert.equal(LS.TRAUFE, 23, 'Traufe 23 Blöcke wie OSM (building:levels=3, Höhe 23)');
});

test('Loggia dei Servi: keine Zelle gemeinsam mit Innocenti und Santissima Annunziata', () => {
  const eigene = WZ.Maske.ausGebaeude(['r7021619']);
  for (const id of ['ospedale_degli_innocenti', 'santissima_annunziata']) {
    const pj = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', id, 'project.json'), 'utf8'));
    const fremd = WZ.Maske.ausGebaeude(pj.gebaeude);
    let n = 0;
    for (const [x, z] of eigene.cells) if (fremd.has(x, z)) n++;
    assert.equal(n, 0, id);
  }
});

test('Loggia dei Servi: neun offene Bögen zur Piazza, jeder bis zum Boden offen, mindestens 2 breit und 3 hoch', () => {
  const tore = world.oeffnungen.filter((o) => o.art === 'arkade');
  assert.ok(tore.length >= 1);
  for (let k = 0; k < LS.BOEGEN; k++) {
    const u = LS.U0 + k * LS.JOCH;
    const zellen = D.haupt.filter((c) => c.d8 === 1 && Math.abs(c.u - u) < 0.6 && c.w < 3);
    assert.ok(zellen.length >= 1, `Bogen ${k}`);
    for (const c of zellen) for (let yr = 1; yr <= 6; yr++) assert.ok(!grid.has(c.x, Y(yr), c.z), `Bogen ${k} Lage ${yr}`);
    // Breite: mindestens 2 benachbarte Spalten offen
    const offen = D.haupt.filter((c) => c.d8 === 1 && Math.abs(c.u - u) < 3 && c.w < 3 && !grid.has(c.x, Y(3), c.z));
    assert.ok(offen.length >= 2, `Bogen ${k} Breite`);
  }
  // Säulen zwischen den Bögen
  const saeule = D.haupt.find((c) => c.d8 === 1 && Math.abs(c.u - (LS.U0 + LS.JOCH / 2)) < 0.4 && c.w < 3);
  assert.ok(saeule && grid.has(saeule.x, Y(3), saeule.z), 'Säule zwischen zwei Bögen');
});

test('Loggia dei Servi: begehbar bis in alle benannten Räume und beide Geschosse, dicht', () => {
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
  for (const [teil, s] of [['hotel_empfang', 0], ['oratorium', 0]]) {
    const c = steh(teil, Y(LS.BASIS[s]));
    assert.ok(c, `keine Stehzelle in ${teil} Geschoss ${s}`);
    assert.ok(r.erreicht(...c), `nicht erreichbar: ${teil} Geschoss ${s}`);
  }
  // Hotelzimmer (Vorder- und Hinterhaus, beide Geschosse) nach Lage
  for (const [u, w, s] of [[33, 15, 0], [33, 10, 1], [60, 15, 1], [10, 46, 0], [27, 50, 1], [100, 46, 1], [115, 6, 0]]) {
    const c = D.haupt.filter((q) => q.d8 > 2 && Math.hypot(q.u - u, q.w - w) < 2.5).find((q) => grid.has(q.x, Y(LS.BASIS[s]), q.z) && !grid.has(q.x, Y(LS.BASIS[s] + 1), q.z) && !grid.has(q.x, Y(LS.BASIS[s] + 2), q.z) && !grid.has(q.x, Y(LS.BASIS[s] + 3), q.z));
    assert.ok(c, `keine Stehzelle bei u ${u}, w ${w}, Geschoss ${s}`);
    assert.ok(r.erreicht(c.x, Y(LS.BASIS[s] + 1), c.z), `Zimmer u ${u}, w ${w}, Geschoss ${s} nicht erreichbar`);
  }
  // Obergeschoss ist über die Treppe erreichbar: Stehzelle im Obergeschoss nahe der Treppe
  const og = D.haupt.find((c) => c.d8 > 3 && c.dHof > 4 && Math.abs(c.u - 60) < 4 && Math.abs(c.w - 44) < 4 && grid.has(c.x, Y(LS.BASIS[1]), c.z) && !grid.has(c.x, Y(LS.BASIS[1] + 1), c.z));
  assert.ok(og && r.erreicht(og.x, Y(LS.BASIS[1] + 1), og.z), 'Obergeschoss erreichbar');
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Loggia dei Servi: Ausstattung vorhanden, Betten und Bänke höchstens eine Lage hoch', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RA.TEILE) assert.ok(n[p] > 0, p);
  assert.ok(n.hotelzimmer > 100, `Hotelzimmer ${n.hotelzimmer}`);
  let hoch = 0;
  grid.forEach((x, y, z, e) => { if ((e.part === 'hotelzimmer' || e.part === 'oratorium') && e.type === WZ.typ('holz') && y === Y(LS.BASIS[0] + 2) && !grid.has(x, y - 1, z)) hoch++; });
  assert.equal(hoch, 0);
});

test('Loggia dei Servi: Licht höchstens 12 Blöcke von einer Seelaterne in allen Räumen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 20);
  const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
  for (const s of [0, 1]) {
    const y = Y(LS.BASIS[s]);
    for (const c of D.haupt) {
      if (hof.has(c.x + ',' + c.z) || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      if (c.w < LS.TIEFE && s === 0) continue;                       // Loggia: Pflaster-Portikus, Licht durch den offenen Platz
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Loggia dei Servi: Content aller Module, Ausstattung mit Quelle und Hinweis vereinfacht', () => {
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'loggia_dei_servi', 'content', 'modul_6.json'), 'utf8'));
  assert.deepEqual(Object.keys(content.parts).sort(), RA.TEILE.slice().sort());
  for (const t of RA.TEILE) {
    const p = content.parts[t];
    for (const f of ['title', 'description', 'tip', 'caution', 'fact']) assert.ok(typeof p[f] === 'string' && p[f].length >= 10 || f === 'title', `${t}.${f}`);
    if (t !== 'licht_ausstattung') {
      assert.match(p.caution, /[Vv]ereinfacht/);
      assert.match(p.fact, /Quelle/);
    }
  }
});
