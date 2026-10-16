'use strict';
// W7a: Palazzo Spini Feroni (projects/palazzo_spini_feroni): Maske, Portale, Zinnen, Räume, Museum, Hof, Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const SF = require('../../projects/palazzo_spini_feroni/model/_sf.js');
const RA = require('../../projects/palazzo_spini_feroni/model/_raeume.js');

const project = getProject('palazzo_spini_feroni', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = SF.Y;
const D = SF.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Spini Feroni: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.type, 'wahrzeichen');
  assert.equal(project.json.bodenY, 61);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 4390);
  assert.equal(D.H.loecher().length, 1);
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(SF.TRAUFE + 1 + 4), 'höchster Block: Firstlage des Walmdachs und Oberkante der Zinnen');
  assert.equal(SF.TRAUFE, 30);
});

test('Spini Feroni: drei Portale offen, mindestens 2 breit und 3 hoch', () => {
  for (const p of RA.PORTALE) {
    const c = D.haupt.filter((q) => q.d8 <= 2 && Math.hypot(q.u - p.u, q.w - p.w) < 1.2);
    assert.ok(c.length >= 2, `Portalzellen bei u ${p.u}, w ${p.w}`);
    for (const q of c) for (let yr = 1; yr <= 6; yr++) assert.ok(!grid.has(q.x, Y(yr), q.z), `Portal u ${p.u} Lage ${yr}`);
  }
});

test('Spini Feroni: begehbar bis in alle Räume und alle Geschosse, Hof erreichbar, dicht', () => {
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
  for (const [teil, yr] of [['androne', 0], ['museo_ferragamo', 0], ['cappella_poccetti', SF.BASIS[1]], ['sala_del_pace', SF.BASIS[1]], ['geschossboeden', SF.BASIS[2]], ['hof_spini', 0]]) {
    const c = steh(teil, Y(yr));
    assert.ok(c, `keine Stehzelle in ${teil}`);
    assert.ok(r.erreicht(...c), `nicht erreichbar: ${teil}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Spini Feroni: Zinnenkranz, Museum mit Vitrinen, Räume und Ausstattung vorhanden', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RA.TEILE.concat(['zinnen', 'dach', 'trennwaende', 'trennwaende_og'])) assert.ok(n[p] > 0, p);
  assert.ok(n.zinnen > 300, `Zinnen ${n.zinnen}`);
  assert.ok(n.museo_ferragamo > 500, `Museum ${n.museo_ferragamo}`);
});

test('Spini Feroni: Licht höchstens 12 Blöcke von einer Seelaterne in allen Räumen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 10);
  const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
  for (const s of [0, 1, 2]) {
    const y = Y(SF.BASIS[s]);
    for (const c of D.haupt) {
      if (hof.has(c.x + ',' + c.z) || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Spini Feroni: Content aller Module, Ausstattung mit Quelle und Hinweis vereinfacht', () => {
  for (let m = 0; m <= 6; m++) assert.ok(fs.existsSync(path.join(ROOT, 'projects', 'palazzo_spini_feroni', 'content', `modul_${m}.json`)), `modul_${m}.json`);
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'palazzo_spini_feroni', 'content', 'modul_6.json'), 'utf8'));
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
