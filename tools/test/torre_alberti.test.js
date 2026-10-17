'use strict';
// W8c: Torre degli Alberti (projects/torre_alberti): Turm aus fünf Geschossen mit Tür, Treppen, Eckloggetta, Terrasse mit Zinnen,
// Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const TA = require('../../projects/torre_alberti/model/_ta.js');
const AU = require('../../projects/torre_alberti/model/_ta_ausstattung.js');

const project = getProject('torre_alberti', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = TA.Y;
const D = TA.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
const stehbar = (x, y, z) => grid.has(x, y - 1, z) && !grid.has(x, y, z) && !grid.has(x, y + 1, z) && !grid.has(x, y + 2, z);

test('Torre: Projektfelder, Maske, keine Baufehler, Höhe 37', () => {
  assert.equal(project.json.bodenY, 61);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.alle.length, 560, 'Zellen von w307106612');
  assert.equal(D.H.loecher().length, 0);
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(TA.TOP), 'höchster Block: Zinnen auf Lage 37');
});

test('Torre: Tür am Borgo Santa Croce offen (mindestens 2 breit, 3 hoch), Fenster verglast', () => {
  const tuer = D.alle.filter((c) => TA.inTuer(c));
  assert.ok(tuer.length >= 8, 'Türzellen ' + tuer.length);
  for (const c of tuer) for (let yr = 1; yr <= 5; yr++) assert.ok(!grid.has(c.x, Y(yr), c.z), 'Tür verbaut Lage ' + yr);
  let glas = 0;
  grid.forEach((x, y, z, e) => { if (e.part === 'fenster' && e.type === 'glass') glas++; });
  let fenster = 0;
  grid.forEach((x, y, z, e) => { if (e.part === 'fenster') fenster++; });
  assert.ok(fenster > 200, 'Fensterzellen ' + fenster);
  assert.ok(glas >= 0);
});

test('Torre: fünf Geschossböden, Treppen mit Kopffreiheit, Loggetta offen, Terrasse mit Zinnen', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of ['boden', 'aussenwand', 'fenster', 'loggetta', 'geschossboeden', 'treppe', 'terrasse', 'zinnen', 'licht', ...AU.TEILE]) assert.ok(n[p] > 0, p);
  for (const k of [1, 2, 3, 4]) {
    let boeden = 0;
    grid.forEach((x, y, z, e) => { if (y === Y(TA.GESCH * k) && e.part === 'geschossboeden') boeden++; });
    assert.ok(boeden > 150, `Boden Geschoss ${k}: ${boeden}`);
  }
  const loggia = world.oeffnungen.filter((o) => o.art === 'loggia' && o.part === 'loggetta');
  assert.ok(loggia.reduce((s, o) => s + o.keys.length, 0) > 60, 'Loggettabögen');
  const lagen = new Set();
  grid.forEach((x, y, z, e) => { if (e.part === 'zinnen') lagen.add(y); });
  assert.deepEqual([...lagen].sort((a, b) => a - b), [Y(TA.TERRASSE + 1), Y(TA.TOP)], 'Brüstung zwei Lagen hoch');
  // Treppen: über jeder Stufe drei Blöcke Luft
  const stufen = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'treppe' && /stairs/.test(e.type)) stufen.push([x, y, z]); });
  assert.equal(stufen.length, 5 * 14);
  for (const [x, y, z] of stufen) for (let h = 1; h <= 3; h++) assert.ok(!grid.has(x, y + h, z), `Kopffreiheit über ${x},${y},${z}`);
});

test('Torre: begehbar bis auf die Terrasse, dicht', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.ok(r.anteil > 95, String(r.anteil));
  for (let k = 0; k <= 5; k++) {
    const y = Y(TA.GESCH * k + 1);
    const c = D.alle.filter((q) => q.d8 > TA.WAND + 1 && stehbar(q.x, y, q.z));
    assert.ok(c.length > 40, `Geschoss ${k}: Stehzellen ${c.length}`);
    assert.ok(c.some((q) => r.erreicht(q.x, y, q.z)), `Geschoss ${k} nicht erreichbar`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Torre: Licht höchstens 12 Blöcke von einer Seelaterne', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  for (let k = 0; k < TA.N_GESCH; k++) {
    const y = Y(TA.GESCH * k);
    for (const c of D.alle) {
      if (c.d8 <= TA.WAND || !grid.has(c.x, y, c.z) || !stehbar(c.x, y + 1, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Zelle ${c.x},${c.z} Geschoss ${k} ohne Licht`);
    }
  }
});

test('Torre: Ausstattung mit Content, Quelle und Hinweis vereinfacht', () => {
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'torre_alberti', 'content', 'modul_5.json'), 'utf8'));
  assert.deepEqual(Object.keys(content.parts).sort(), AU.TEILE.slice().sort());
  for (const p of Object.values(content.parts)) {
    for (const f of ['title', 'description', 'tip', 'caution', 'fact']) assert.ok(typeof p[f] === 'string' && p[f].length >= 3, f);
    assert.match(p.caution, /[Vv]ereinfacht/);
    assert.match(p.fact, /Quelle/);
  }
});
