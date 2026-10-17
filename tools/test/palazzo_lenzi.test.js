'use strict';
// W8a: Palazzo Lenzi (projects/palazzo_lenzi): Maske, sechs Portale, Loggetta, Graffito, Räume, Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const LN = require('../../projects/palazzo_lenzi/model/_ln.js');
const RA = require('../../projects/palazzo_lenzi/model/_raeume.js');

const project = getProject('palazzo_lenzi', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = LN.Y;
const D = LN.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Lenzi: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.type, 'wahrzeichen');
  assert.equal(project.json.bodenY, 55);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 3390);
  assert.equal(D.H.loecher().length, 0);
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(LN.TRAUFE + 1 + 3), 'höchster Block: Firstlage des Walmdachs');
  assert.equal(LN.TRAUFE, 30, 'Traufe 30 Blöcke (OSM-Schätzung, drei Geschosse)');
});

test('Lenzi: fünf Portale zur Piazza und ein Seitenportal offen, mindestens 2 breit und 3 hoch', () => {
  for (const p of RA.PORTALE) {
    const c = D.haupt.filter((q) => q.d8 <= 2 && (p.w === 0 ? Math.abs(q.u - p.u) < 1 && q.w < 3 : Math.abs(q.w - p.w) < 1 && q.u < 3));
    assert.ok(c.length >= 2, `Portalzellen bei u ${p.u} w ${p.w}`);
    for (const q of c) for (let yr = 1; yr <= 6; yr++) assert.ok(!grid.has(q.x, Y(yr), q.z), `Portal u ${p.u} w ${p.w} Lage ${yr}`);
  }
});

test('Lenzi: begehbar bis ins oberste Geschoss, benannte Räume, dicht', () => {
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
  for (const [teil, s] of [['vestibolo', 0], ['ausstellungssaal', 0], ['bibliothek', 1], ['stanza_alcova', 1], ['teatro', 1], ['dachloggetta', 2], ['geschossboeden', 2]]) {
    const c = steh(teil, teil === 'geschossboeden' ? Y(LN.BASIS[2]) : Y(LN.BASIS[s]));
    assert.ok(c, `keine Stehzelle in ${teil}`);
    assert.ok(r.erreicht(...c), `nicht erreichbar: ${teil} Geschoss ${s}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Lenzi: Loggetta offen (drei Joche mit Brüstung), Graffito an der Piazza-Fassade', () => {
  const b = LN.BASIS[2];
  const vorn = D.haupt.filter((c) => c.d8 <= 2 && c.w <= 2.5 && c.u >= 26 && c.u <= 43);
  const offen = vorn.filter((c) => !grid.has(c.x, Y(b + 5), c.z));
  assert.ok(offen.length >= 12, `offene Loggiazellen: ${offen.length}`);
  for (const c of offen) assert.ok(grid.has(c.x, Y(b + 1), c.z) && grid.has(c.x, Y(b + 2), c.z), 'Brüstung zwei Blöcke hoch');
  assert.ok(vorn.some((c) => grid.has(c.x, Y(b + 5), c.z)), 'Pfeiler zwischen den Jochen');
  const typen = new Set();
  grid.forEach((x, y, z, e) => { if (e.part === 'aussenwand' && y > Y(LN.BASIS[1]) && y < Y(LN.BASIS[2])) typen.add(e.type); });
  assert.ok(typen.size >= 3, `Graffito: mehrere Putzfarben im 1. OG (${[...typen].join(', ')})`);
});

test('Lenzi: Theater mit Bühne und Sitzreihen (höchstens ein Block hoch), Wappen und Räume vorhanden', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RA.TEILE) assert.ok(n[p] > 0, p);
  assert.ok(n.teatro > 300, `Theater ${n.teatro}`);
  assert.ok(n.wappen > 20, `Wappen ${n.wappen}`);
  let hoch = 0;
  grid.forEach((x, y, z, e) => { if (e.part === 'teatro' && y === Y(LN.BASIS[1]) + 2 && !grid.has(x, y - 1, z)) hoch++; });
  assert.equal(hoch, 0, 'Möbel des Theaters nicht höher als ein Block');
});

test('Lenzi: Licht höchstens 12 Blöcke von einer Seelaterne in allen Räumen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 10);
  for (const s of [0, 1, 2]) {
    const y = Y(LN.BASIS[s]);
    for (const c of D.haupt) {
      if (!grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Lenzi: Content aller Module, Ausstattung mit Quelle und Hinweis vereinfacht', () => {
  for (let m = 0; m <= 6; m++) assert.ok(fs.existsSync(path.join(ROOT, 'projects', 'palazzo_lenzi', 'content', `modul_${m}.json`)), `modul_${m}.json`);
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'palazzo_lenzi', 'content', 'modul_6.json'), 'utf8'));
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
