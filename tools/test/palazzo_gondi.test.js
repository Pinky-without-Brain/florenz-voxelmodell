'use strict';
// W7a: Palazzo Gondi (projects/palazzo_gondi): Maske, Portale, Hoftreppe mit Kragsteinen, Brunnen, Räume, Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const GN = require('../../projects/palazzo_gondi/model/_gn.js');
const RA = require('../../projects/palazzo_gondi/model/_raeume.js');

const project = getProject('palazzo_gondi', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = GN.Y;
const D = GN.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Gondi: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.type, 'wahrzeichen');
  assert.equal(project.json.bodenY, 63);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 3997);
  assert.equal(D.H.loecher().length, 2);
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(GN.TRAUFE + 1 + 4), 'höchster Block: Firstlage des Walmdachs');
  assert.equal(GN.TRAUFE, 23, 'Traufe 23 Blöcke wie OSM (building:levels=3)');
});

test('Gondi: drei Portale zur Piazza San Firenze offen, mindestens 2 breit und 3 hoch', () => {
  for (const p of RA.PORTALE) {
    const c = D.haupt.filter((q) => q.d8 <= 2 && Math.abs(q.u - p.u) < 1 && q.w < 3);
    assert.ok(c.length >= 2, `Portalzellen bei u ${p.u}`);
    for (const q of c) for (let yr = 1; yr <= 6; yr++) assert.ok(!grid.has(q.x, Y(yr), q.z), `Portal u ${p.u} Lage ${yr}`);
  }
});

test('Gondi: begehbar bis in alle Geschosse, benannte Räume und Hof, dicht', () => {
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
  for (const [teil, s] of [['vestibolo', 0], ['treppenhaus', 0], ['treppenhaus', 1], ['sala_grande', 1], ['sala_paesaggi', 1], ['sala_giove_ebe', 1], ['alkoven', 1], ['geschossboeden', 2], ['cortile', 0]]) {
    const c = steh(teil, teil === 'geschossboeden' ? Y(GN.BASIS[2]) : Y(GN.BASIS[s]));
    assert.ok(c, `keine Stehzelle in ${teil}`);
    assert.ok(r.erreicht(...c), `nicht erreichbar: ${teil} Geschoss ${s}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Gondi: Hoftreppe aus neun Treppenblöcken mit Kragsteinen, Kopffreiheit 3 über dem Piano nobile', () => {
  const stufen = [];
  const kragsteine = [];
  grid.forEach((x, y, z, e) => {
    if (e.part !== 'scalone') return;
    if (/stairs/.test(e.type)) stufen.push({ x, y, z });
    else kragsteine.push({ x, y, z });
  });
  assert.equal(stufen.length, RA.SCALONE.stufen * 2, 'neun Stufen, zwei Blöcke breit');
  assert.ok(kragsteine.length >= RA.SCALONE.stufen, 'Kragsteine unter den Stufen');
  assert.equal(Math.min(...stufen.map((s) => s.y)), Y(1));
  assert.equal(Math.max(...stufen.map((s) => s.y)), Y(RA.SCALONE.stufen));
  const r = laufe(ctx, 'r13').einheiten[0];
  for (const s of stufen) assert.ok(r.erreicht(s.x, s.y + 1, s.z), `Stufe ${s.x},${s.y},${s.z} erreichbar`);
  for (const s of stufen) for (let h = 1; h <= 3; h++) assert.ok(!grid.has(s.x, s.y + h, s.z), `Kopffreiheit über Stufe ${s.x},${s.y},${s.z}`);
});

test('Gondi: Hof mit Brunnen, Kamin und Figuren, Räume und Ausstattung vorhanden', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RA.TEILE) assert.ok(n[p] > 0, p);
  assert.ok(n.hofbrunnen > 30, `Brunnen ${n.hofbrunnen}`);
  assert.ok(n.kamin_sangallo > 40, `Kamin und Figuren ${n.kamin_sangallo}`);
  assert.ok(n.sala_grande > 300, `Großer Saal ${n.sala_grande}`);
});

test('Gondi: Licht höchstens 12 Blöcke von einer Seelaterne in allen Räumen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 10);
  const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
  for (const s of [0, 1, 2]) {
    const y = Y(GN.BASIS[s]);
    for (const c of D.haupt) {
      if (hof.has(c.x + ',' + c.z) || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Gondi: Content aller Module, Ausstattung mit Quelle und Hinweis vereinfacht', () => {
  for (let m = 0; m <= 6; m++) assert.ok(fs.existsSync(path.join(ROOT, 'projects', 'palazzo_gondi', 'content', `modul_${m}.json`)), `modul_${m}.json`);
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'palazzo_gondi', 'content', 'modul_6.json'), 'utf8'));
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
