'use strict';
// W8c: Loggia del Grano (projects/loggia_del_grano): offene Arkadenhalle (3 Bögen Stirnseite, 2 je Seite), geschlossene Rückwand,
// Mezzanin, Obergeschoss, Satteldach, Treppen, Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const LG = require('../../projects/loggia_del_grano/model/_lg.js');
const AU = require('../../projects/loggia_del_grano/model/_lg_ausstattung.js');

const project = getProject('loggia_del_grano', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = LG.Y;
const D = LG.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
const stehbar = (x, y, z) => grid.has(x, y - 1, z) && !grid.has(x, y, z) && !grid.has(x, y + 1, z) && !grid.has(x, y + 2, z);

test('Grano: Projektfelder, Maske, keine Baufehler, Höhe 30', () => {
  assert.equal(project.json.bodenY, 61);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.alle.length, 1046, 'Zellen von w307129126');
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(LG.ROOF_MAX), 'höchster Block: Dachfirst Lage 30');
});

test('Grano: drei Bögen an der Stirnseite, zwei je Seite, bis zum Boden offen; Rückwand geschlossen', () => {
  const offen = (c) => { for (let yr = 1; yr <= 5; yr++) if (grid.has(c.x, Y(yr), c.z)) return false; return true; };
  for (const [e, n] of [[1, 3], [0, 2], [2, 2]]) {
    const b = D.K[e].L / n;
    for (let k = 0; k < n; k++) {
      const cs = D.alle.filter((c) => c.e === e && c.d8 === 1 && Math.abs(c.ue - (k + 0.5) * b) < 0.6);
      assert.ok(cs.length >= 1, `Bogen ${k} Kante ${e}`);
      assert.ok(cs.every(offen), `Bogen ${k} Kante ${e} offen`);
    }
  }
  const rueck = D.alle.filter((c) => c.e === 3 && c.d8 <= LG.WAND && c.ue > 6 && c.ue < 30);
  for (const c of rueck) for (let yr = 1; yr <= LG.HALLE_OBEN; yr++) assert.ok(grid.has(c.x, Y(yr), c.z), 'Rückwand Lage ' + yr);
  const arkaden = world.oeffnungen.filter((o) => o.art === 'arkade');
  assert.ok(arkaden.reduce((s, o) => s + o.keys.length, 0) > 500);
});

test('Grano: Bauteile, zwei Treppen mit Kopffreiheit 3, Satteldach massiv', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of ['boden', 'pfeiler', 'arkadenwand', 'obergeschosse', 'fenster', 'gesims', 'geschossboeden', 'treppe', 'dach', 'dachfenster', 'licht', ...AU.TEILE]) assert.ok(n[p] > 0, p);
  const stufen = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'treppe' && /stairs/.test(e.type)) stufen.push([x, y, z]); });
  assert.equal(stufen.length, 3 * (11 + 4));
  for (const [x, y, z] of stufen) for (let h = 1; h <= 3; h++) assert.ok(!grid.has(x, y + h, z), `Kopffreiheit über ${x},${y},${z}`);
  // Satteldach: Traufe Lage 27, First Lage 30
  const mitte = D.alle.find((c) => c.d8 > LG.WAND && Math.abs(c.w - 13.85) < 0.5);
  assert.ok(grid.has(mitte.x, Y(30), mitte.z));
  assert.ok(!grid.has(mitte.x, Y(31), mitte.z));
});

test('Grano: begehbar auf allen drei Ebenen, dicht', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.ok(r.anteil > 95, String(r.anteil));
  for (const f of [0, LG.F_MEZZ, LG.F_OG]) {
    const y = Y(f + 1);
    const cs = D.alle.filter((q) => q.d8 > LG.WAND + 1 && stehbar(q.x, y, q.z));
    assert.ok(cs.length > 80, `Ebene ${f}: Stehzellen ${cs.length}`);
    assert.ok(cs.some((q) => r.erreicht(q.x, y, q.z)), `Ebene ${f} nicht erreichbar`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Grano: Licht höchstens 12 Blöcke von einer Seelaterne', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  for (const f of [0, LG.F_MEZZ, LG.F_OG]) {
    const y = Y(f);
    for (const c of D.alle) {
      if (c.d8 <= LG.WAND || !grid.has(c.x, y, c.z) || !stehbar(c.x, y + 1, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Zelle ${c.x},${c.z} Ebene ${f} ohne Licht`);
    }
  }
});

test('Grano: Ausstattung mit Content, Quelle und Hinweis vereinfacht', () => {
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'loggia_del_grano', 'content', 'modul_6.json'), 'utf8'));
  assert.deepEqual(Object.keys(content.parts).sort(), AU.TEILE.slice().sort());
  for (const p of Object.values(content.parts)) {
    for (const f of ['title', 'description', 'tip', 'caution', 'fact']) assert.ok(typeof p[f] === 'string' && p[f].length >= 3, f);
    assert.match(p.caution, /[Vv]ereinfacht/);
    assert.match(p.fact, /Quelle/);
  }
});
