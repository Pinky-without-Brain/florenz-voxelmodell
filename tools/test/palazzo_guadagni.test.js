'use strict';
// W8a: Palazzo Guadagni (projects/palazzo_guadagni): Maske, Portal, Dachloggia, Treppe mit Kragsteinen, Räume, Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const GD = require('../../projects/palazzo_guadagni/model/_gd.js');
const RA = require('../../projects/palazzo_guadagni/model/_raeume.js');

const project = getProject('palazzo_guadagni', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = GD.Y;
const D = GD.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Guadagni: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.type, 'wahrzeichen');
  assert.equal(project.json.bodenY, 61);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 2372);
  assert.equal(D.H.loecher().length, 0);
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(GD.TRAUFE + 1 + 3), 'höchster Block: Firstlage des Walmdachs');
  assert.equal(GD.TRAUFE, 30, 'Traufe 30 Blöcke (OSM-Schätzung)');
});

test('Guadagni: Portal zur Piazza offen, mindestens 2 breit und 3 hoch', () => {
  const p = RA.PORTALE[0];
  const c = D.haupt.filter((q) => q.d8 <= 2 && Math.abs(q.u - p.u) < 1 && q.w < 3);
  assert.ok(c.length >= 2, 'Portalzellen');
  for (const q of c) for (let yr = 1; yr <= 6; yr++) assert.ok(!grid.has(q.x, Y(yr), q.z), `Portal Lage ${yr}`);
});

test('Guadagni: begehbar bis in die Loggia, benannte Räume, dicht', () => {
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
  for (const [teil, s] of [['androne', 0], ['treppenhaus', 0], ['treppenhaus', 1], ['hofhalle', 0], ['sala_piano_nobile', 1], ['dachloggia', 3], ['geschossboeden', 2]]) {
    const c = steh(teil, teil === 'geschossboeden' ? Y(GD.BASIS[2]) : Y(GD.BASIS[s]));
    assert.ok(c, `keine Stehzelle in ${teil}`);
    assert.ok(r.erreicht(...c), `nicht erreichbar: ${teil} Geschoss ${s}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Guadagni: Dachloggia offen (Joche mit Brüstung), Architrav darüber', () => {
  const b = GD.BASIS[3];
  const vorn = D.haupt.filter((c) => c.d8 <= 2 && c.w <= 2.5 && c.u >= 3.5 && c.u <= 47.5);
  const offen = vorn.filter((c) => !grid.has(c.x, Y(b + 4), c.z));
  assert.ok(offen.length >= 20, `offene Loggiazellen vorn: ${offen.length}`);
  for (const c of offen) {
    assert.ok(grid.has(c.x, Y(b + 1), c.z) && grid.has(c.x, Y(b + 2), c.z), 'Brüstung zwei Blöcke hoch');
    assert.ok(grid.has(c.x, Y(b + 7), c.z), 'Architrav über der Öffnung');
  }
  assert.ok(vorn.some((c) => grid.has(c.x, Y(b + 4), c.z)), 'Pfeiler zwischen den Jochen');
});

test('Guadagni: Treppe aus acht Treppenblöcken mit Kragsteinen, Kopffreiheit 3', () => {
  const stufen = [], kragsteine = [];
  grid.forEach((x, y, z, e) => {
    if (e.part !== 'scalone') return;
    if (/stairs/.test(e.type)) stufen.push({ x, y, z });
    else kragsteine.push({ x, y, z });
  });
  assert.equal(stufen.length, RA.SCALONE.stufen * 2, 'acht Stufen, zwei Blöcke breit');
  assert.ok(kragsteine.length >= RA.SCALONE.stufen, 'Kragsteine unter den Stufen');
  assert.equal(Math.min(...stufen.map((s) => s.y)), Y(1));
  assert.equal(Math.max(...stufen.map((s) => s.y)), Y(RA.SCALONE.stufen));
  const r = laufe(ctx, 'r13').einheiten[0];
  for (const s of stufen) assert.ok(r.erreicht(s.x, s.y + 1, s.z), `Stufe ${s.x},${s.y},${s.z} erreichbar`);
  for (const s of stufen) for (let h = 1; h <= 3; h++) assert.ok(!grid.has(s.x, s.y + h, s.z), `Kopffreiheit über Stufe ${s.x},${s.y},${s.z}`);
});

test('Guadagni: Wandbrunnen, Räume und Ausstattung vorhanden', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RA.TEILE) assert.ok(n[p] > 0, p);
  assert.ok(n.wandbrunnen > 15, `Wandbrunnen ${n.wandbrunnen}`);
  assert.ok(n.sala_piano_nobile > 150, `Saal ${n.sala_piano_nobile}`);
});

test('Guadagni: Licht höchstens 12 Blöcke von einer Seelaterne in allen Räumen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 10);
  for (const s of [0, 1, 2, 3]) {
    const y = Y(GD.BASIS[s]);
    for (const c of D.haupt) {
      if (!grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Guadagni: Content aller Module, Ausstattung mit Quelle und Hinweis vereinfacht', () => {
  for (let m = 0; m <= 6; m++) assert.ok(fs.existsSync(path.join(ROOT, 'projects', 'palazzo_guadagni', 'content', `modul_${m}.json`)), `modul_${m}.json`);
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'palazzo_guadagni', 'content', 'modul_6.json'), 'utf8'));
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
