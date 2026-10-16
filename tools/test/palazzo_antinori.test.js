'use strict';
// W7a: Palazzo Antinori (projects/palazzo_antinori): Maske, Portale, Stalltor mit Stufen, Räume, Hof, Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const AN = require('../../projects/palazzo_antinori/model/_an.js');
const RA = require('../../projects/palazzo_antinori/model/_raeume.js');

const project = getProject('palazzo_antinori', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = AN.Y;
const D = AN.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Antinori: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.type, 'wahrzeichen');
  assert.equal(project.json.bodenY, 63);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 6489);
  assert.equal(D.H.loecher().length, 1);
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(AN.TRAUFE + 1 + 4), 'höchster Block: Firstlage des Walmdachs');
  assert.equal(AN.TRAUFE, 23, 'Traufe 23 Blöcke wie OSM (building:levels=3)');
});

test('Antinori: Portal und Stalltor offen, mindestens 2 breit und 3 hoch', () => {
  for (const p of RA.PORTALE) {
    const c = D.haupt.filter((q) => q.d8 <= 2 && Math.hypot(q.u - p.u, q.w - p.w) < 2);
    assert.ok(c.length >= 2, `Portalzellen bei u ${p.u}, w ${p.w}`);
    for (const q of c) for (let yr = 1; yr <= 6; yr++) assert.ok(!grid.has(q.x, Y(yr), q.z), `Portal u ${p.u} Lage ${yr}`);
  }
});

test('Antinori: begehbar bis in alle Räume und alle Geschosse, Hof erreichbar, dicht', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  // Anteil der erreichbaren Stehzellen eines Bauteils auf einer Bodenhöhe (einzelne Taschen an der schrägen Außenwand zählen nicht)
  const anteil = (teil, yBoden) => {
    let n = 0, m = 0;
    grid.forEach((x, y, z, e) => {
      if (e.part !== teil || y !== yBoden || grid.has(x, y + 1, z) || grid.has(x, y + 2, z) || grid.has(x, y + 3, z)) return;
      n++;
      if (r.erreicht(x, y + 1, z)) m++;
    });
    return { n, m };
  };
  for (const [teil, yr] of [['androne', 0], ['cantinetta', 0], ['scuderie', 0], ['sala_cassettoni_ovest', AN.BASIS[1]], ['sala_cassettoni_est', AN.BASIS[1]], ['geschossboeden', AN.BASIS[2]], ['hof_antinori', 0]]) {
    const a = anteil(teil, Y(yr));
    assert.ok(a.n > 0, `keine Stehzelle in ${teil}`);
    assert.ok(a.m >= 0.9 * a.n, `nicht erreichbar: ${teil} (${a.m} von ${a.n})`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Antinori: Stufen vor dem Stalltor (zwei Treppenblöcke, Kragstein) sind erreichbar, Wappen und Säle vorhanden', () => {
  const stufen = [];
  const n = {};
  grid.forEach((x, y, z, e) => {
    n[e.part] = (n[e.part] || 0) + 1;
    if (e.part === 'treppe_stalltor' && /stairs/.test(e.type)) stufen.push({ x, y, z });
  });
  for (const p of RA.TEILE) assert.ok(n[p] > 0, p);
  assert.equal(stufen.length, 14, 'zwei Stufen, sieben Blöcke breit');
  assert.equal(Math.min(...stufen.map((s) => s.y)), Y(-1));
  assert.equal(Math.max(...stufen.map((s) => s.y)), Y(0));
  const r = laufe(ctx, 'r13').einheiten[0];
  for (const s of stufen) assert.ok(r.erreicht(s.x, s.y + 1, s.z), `Stufe ${s.x},${s.y},${s.z} erreichbar`);
  assert.ok(n.sala_cassettoni_ovest > 300 && n.sala_cassettoni_est > 200, 'Kassettensäle');
  assert.ok(n.scuderie > 150, `Stallungen ${n.scuderie}`);
});

test('Antinori: Licht höchstens 12 Blöcke von einer Seelaterne in allen Räumen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 10);
  const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
  for (const s of [0, 1, 2]) {
    const y = Y(AN.BASIS[s]);
    for (const c of D.haupt) {
      if (hof.has(c.x + ',' + c.z) || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Antinori: Content aller Module, Ausstattung mit Quelle und Hinweis vereinfacht', () => {
  for (let m = 0; m <= 6; m++) assert.ok(fs.existsSync(path.join(ROOT, 'projects', 'palazzo_antinori', 'content', `modul_${m}.json`)), `modul_${m}.json`);
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'palazzo_antinori', 'content', 'modul_6.json'), 'utf8'));
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
