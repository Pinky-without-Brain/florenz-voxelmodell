'use strict';
// W6c: Palazzo Arcivescovile (projects/palazzo_arcivescovile): Maske, Portale, Räume, Kirche San Salvatore, Begehbarkeit, Licht.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const PAL = require('../spec/palette.js');
const AA = require('../../projects/palazzo_arcivescovile/model/_aa.js');
const RA = require('../../projects/palazzo_arcivescovile/model/_raeume.js');

const project = getProject('palazzo_arcivescovile', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = AA.Y;
const D = AA.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

test('Arcivescovile: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.bodenY, 64);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 7432);
  assert.equal(D.H.loecher().length, 1);
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(AA.TRAUFE + 1 + 4), 'höchster Block: Firstlage des Walmdachs');
  assert.equal(AA.TRAUFE, 37, 'Traufe 37 Blöcke wie OSM (building:levels=5, Höhe 37)');
});

test('Arcivescovile: zwei Portale zur Piazza San Giovanni, Kutschentor und Kirchenportal offen, 2 breit und 3 hoch', () => {
  const tore = world.oeffnungen.filter((o) => o.art === 'tor');
  assert.ok(tore.length >= 1);
  const offen = new Set();
  for (const o of tore) for (const k of o.keys) offen.add(k);
  // Mitten in jedem Portal sind die Lagen 1..6 Luft (Weltzelle zu lokalen Koordinaten)
  const luft = (u, w) => {
    const c = D.haupt.filter((q) => q.d8 <= 2 && Math.abs(q.u - u) < 0.8 && Math.abs(q.w - w) < 3.5);
    assert.ok(c.length >= 2, `Portalzellen bei u ${u}`);
    for (const q of c) for (let yr = 1; yr <= 6; yr++) assert.ok(!grid.has(q.x, Y(yr), q.z), `Portal u ${u} Lage ${yr}`);
  };
  luft(49.1, 0);
  luft(75.8, 0);
  luft(63, 66);
  luft(100, 64);
});

test('Arcivescovile: begehbar bis in Salone, Sala dell\'Udienza, Treppenhaus, Kirche, dicht', () => {
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
  for (const [teil, s] of [['salone', 1], ['sala_udienza', 1], ['treppenhaus', 0], ['treppenhaus', 1], ['chiesa_san_salvatore', 0]]) {
    const c = steh(teil, Y(AA.BASIS[s]));
    assert.ok(c, `keine Stehzelle in ${teil}`);
    assert.ok(r.erreicht(...c), `nicht erreichbar: ${teil} Geschoss ${s}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Arcivescovile: Kirche San Salvatore mit Tonnengewölbe, Altar, Bänken und Blendarkaden, Luftraum über zwei Geschosse', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RA.TEILE) assert.ok(n[p] > 0, p);
  assert.ok(n.chiesa_gewoelbe > 400, `Gewölbe ${n.chiesa_gewoelbe}`);
  // Schiffmitte: Luft von Lage 1 bis 12, Gewölbe erst darüber, kein Geschossboden des Piano nobile
  const mitte = D.haupt.find((c) => Math.abs(c.u - RA.KIRCHE.uMitte) < 0.6 && Math.abs(c.w - 50) < 0.6);
  assert.ok(mitte);
  for (let yr = 1; yr <= 12; yr++) assert.ok(!grid.has(mitte.x, Y(yr), mitte.z) || yr === 0, `Schiff Lage ${yr}`);
  assert.ok(!grid.has(mitte.x, Y(AA.BASIS[1]), mitte.z), 'Schiff ohne Zwischenboden');
  assert.ok(grid.has(mitte.x, Y(AA.BASIS[2]), mitte.z), 'Boden des 2. Mezzanin-Geschosses über dem Gewölbe');
  // Bänke aus Holz höchstens 1 hoch
  let holz = 0;
  grid.forEach((x, y, z, e) => { if (e.part === 'chiesa_san_salvatore' && e.type === PAL.typesForRole('holz')[0] && y === Y(1)) holz++; });
  assert.ok(holz > 40, `Bänke ${holz}`);
});

test('Arcivescovile: Licht höchstens 12 Blöcke von einer Seelaterne in allen Räumen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 20);
  const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
  for (const s of [0, 1, 2, 3]) {
    const y = Y(AA.BASIS[s]);
    for (const c of D.haupt) {
      if (hof.has(c.x + ',' + c.z) || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;

      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Arcivescovile: Content aller Module, Ausstattung mit Quelle und Hinweis vereinfacht', () => {
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'palazzo_arcivescovile', 'content', 'modul_6.json'), 'utf8'));
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
