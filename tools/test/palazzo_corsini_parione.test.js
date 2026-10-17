'use strict';
// W8a: Palazzo Corsini al Parione (projects/palazzo_corsini_parione): Maske mit vier Höfen, Portal, Treppen mit Kragsteinen, Galleria, Salone, Terrasse, Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const CP = require('../../projects/palazzo_corsini_parione/model/_cp.js');
const RA = require('../../projects/palazzo_corsini_parione/model/_raeume.js');

const project = getProject('palazzo_corsini_parione', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = CP.Y;
const D = CP.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Corsini: Projektfelder, Maske mit vier Höfen, keine Baufehler, Terrasse als Flachdach', () => {
  assert.equal(project.json.type, 'wahrzeichen');
  assert.equal(project.json.bodenY, 59);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 17425);
  assert.deepEqual(D.H.loecher().map((l) => l.size), [2450, 401, 123, 200]);
  assert.equal(CP.TRAUFE, 30, 'Traufe 30 Blöcke (OSM-Schätzung)');
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(CP.TRAUFE + 2 + 1 + 4), 'höchster Block: Kopf der Statuen auf der Balustrade');
});

test('Corsini: Portal am Lungarno offen, mindestens 2 breit und 3 hoch', () => {
  const p = RA.PORTALE[0];
  const c = D.haupt.filter((q) => q.d8 <= 2 && Math.abs(q.u - p.u) < 1 && q.w < 3);
  assert.ok(c.length >= 2, 'Portalzellen');
  for (const q of c) for (let yr = 1; yr <= 6; yr++) assert.ok(!grid.has(q.x, Y(yr), q.z), `Portal Lage ${yr}`);
});

test('Corsini: begehbar bis auf die Terrasse, benannte Räume, Hof und Lichthöfe, dicht', () => {
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
  for (const [teil, y] of [['vestibolo', Y(0)], ['cortile', Y(0)], ['treppenhaus', Y(0)], ['treppenhaus', Y(CP.BASIS[1])], ['galleria', Y(CP.BASIS[1])], ['salone_del_trono', Y(CP.BASIS[1])],
    ['sala_da_ballo', Y(CP.BASIS[1])], ['grotta', Y(0)], ['geschossboeden', Y(CP.BASIS[2])], ['dach', Y(CP.TRAUFE + 1)]]) {
    const c = steh(teil, y);
    assert.ok(c, `keine Stehzelle in ${teil} (Y ${y})`);
    assert.ok(r.erreicht(...c), `nicht erreichbar: ${teil} Y ${y}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Corsini: Haupthof mit Arkaden, drei Lichthöfe mit Türen', () => {
  const arkaden = D.haupt.filter((c) => c.grossHof && c.dHof <= 2 && c.d8 > 2 && !grid.has(c.x, Y(3), c.z) && grid.has(c.x, Y(12), c.z));
  assert.ok(arkaden.length >= 30, `offene Arkadenzellen: ${arkaden.length}`);
  const gross = D.hofZellen.filter((c) => !c.garten);
  assert.equal(gross.length, 2450 + 401 + 123 + 200);
});

test('Corsini: beide Treppen mit Kragsteinen, Kopffreiheit 3, Terrassenluke offen', () => {
  for (const [teil, stufen, ymin] of [['scalone', RA.SCALONE.stufen, Y(1)], ['terrasse', RA.TERRASSE.stufen, Y(CP.BASIS[2] + 1)]]) {
    const st = [], krag = [];
    grid.forEach((x, y, z, e) => {
      if (e.part !== teil) return;
      if (/stairs/.test(e.type)) st.push({ x, y, z });
      else if (/smooth_stone/.test(e.type) && grid.has(x, y + 1, z) && /stairs/.test(grid.get(x, y + 1, z).type)) krag.push({ x, y, z });
    });
    assert.equal(st.length, stufen * 2, `${teil}: ${stufen} Stufen, zwei Blöcke breit`);
    assert.ok(krag.length >= stufen, `${teil}: Kragsteine`);
    assert.equal(Math.min(...st.map((s) => s.y)), ymin);
    assert.equal(Math.max(...st.map((s) => s.y)), ymin + stufen - 1);
    const r = laufe(ctx, 'r13').einheiten[0];
    for (const s of st) assert.ok(r.erreicht(s.x, s.y + 1, s.z), `${teil}: Stufe ${s.x},${s.y},${s.z} erreichbar`);
    for (const s of st) for (let h = 1; h <= 3; h++) assert.ok(!grid.has(s.x, s.y + h, s.z), `${teil}: Kopffreiheit über Stufe ${s.x},${s.y},${s.z}`);
  }
});

test('Corsini: Terrasse mit Balustrade, Statuen und Vasen am Lungarno, Räume und Ausstattung vorhanden', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RA.TEILE) assert.ok(n[p] > 0, p);
  assert.ok(n.terrasse > 1000, `Terrasse ${n.terrasse}`);
  const statuen = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'terrasse' && y === Y(CP.TRAUFE + 2 + 1 + 4) && e.type === 'gold_block') statuen.push([x, z]); });
  assert.ok(statuen.length >= 10, `Statuen am Lungarno: ${statuen.length}`);
  for (const [x, z] of statuen) for (let h = 0; h <= 5; h++) assert.ok(grid.has(x, Y(CP.TRAUFE + 2 + h), z), `Statue ${x},${z}: Säule auf der Balustrade (Lage ${CP.TRAUFE + 2 + h})`);
  assert.ok(n.salone_del_trono > 400, `Salone ${n.salone_del_trono}`);
  assert.ok(n.galleria > 600, `Galleria ${n.galleria}`);
});

test('Corsini: Licht höchstens 12 Blöcke von einer Seelaterne in allen Räumen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 50);
  const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
  for (const s of [0, 1, 2]) {
    const y = Y(CP.BASIS[s]);
    const lv = lichter.filter((l) => l[1] === y);
    for (const c of D.haupt) {
      if (hof.has(c.x + ',' + c.z) || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lv.some(([lx, , lz]) => Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Corsini: Content aller Module, Ausstattung mit Quelle und Hinweis vereinfacht', () => {
  for (let m = 0; m <= 6; m++) assert.ok(fs.existsSync(path.join(ROOT, 'projects', 'palazzo_corsini_parione', 'content', `modul_${m}.json`)), `modul_${m}.json`);
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'palazzo_corsini_parione', 'content', 'modul_6.json'), 'utf8'));
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
