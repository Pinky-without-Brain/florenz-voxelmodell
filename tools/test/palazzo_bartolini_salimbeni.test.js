'use strict';
// W7a: Palazzo Bartolini Salimbeni (projects/palazzo_bartolini_salimbeni): Maske, Portale, Kreuzfenster, Räume, Hof, Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const BS = require('../../projects/palazzo_bartolini_salimbeni/model/_bs.js');
const RA = require('../../projects/palazzo_bartolini_salimbeni/model/_raeume.js');

const project = getProject('palazzo_bartolini_salimbeni', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = BS.Y;
const D = BS.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Bartolini Salimbeni: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.type, 'wahrzeichen');
  assert.equal(project.json.bodenY, 62);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 2673);
  assert.equal(D.H.loecher().length, 1);
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(BS.TRAUFE + 1 + 3), 'höchster Block: Firstlage des Walmdachs');
  assert.equal(BS.TRAUFE, 30);
});

test('Bartolini Salimbeni: zwei Portale offen, mindestens 2 breit und 3 hoch', () => {
  for (const p of RA.PORTALE) {
    const c = D.haupt.filter((q) => q.d8 <= 2 && Math.hypot(q.u - p.u, q.w - p.w) < 3);
    assert.ok(c.length >= 2, `Portalzellen bei u ${p.u}, w ${p.w}`);
    for (const q of c) for (let yr = 1; yr <= 6; yr++) assert.ok(!grid.has(q.x, Y(yr), q.z), `Portal u ${p.u} Lage ${yr}`);
  }
});

test('Bartolini Salimbeni: begehbar bis in alle Räume und alle Geschosse, Hof erreichbar, dicht', () => {
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
  for (const [teil, yr] of [['passaggio', 0], ['collezione_casamonti', BS.BASIS[1]], ['sala_cassettoni', BS.BASIS[1]], ['geschossboeden', BS.BASIS[2]], ['hof_bartolini', 0]]) {
    const a = anteil(teil, Y(yr));
    assert.ok(a.n > 0, `keine Stehzelle in ${teil}`);
    assert.ok(a.m >= 0.9 * a.n, `nicht erreichbar: ${teil} (${a.m} von ${a.n})`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Bartolini Salimbeni: Kreuzfenster, Sgraffito, Inschriften, Mohnfries und Räume vorhanden', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RA.TEILE.concat(['dach', 'trennwaende', 'trennwaende_og'])) assert.ok(n[p] > 0, p);
  assert.ok(n.fenster_kreuz > 40, `Querriegel ${n.fenster_kreuz}`);
  assert.ok(n.sgraffito > 30, `Sgraffito ${n.sgraffito}`);
  assert.ok(n.fries_mohn > 30, `Mohnfries ${n.fries_mohn}`);
  assert.ok(n.sala_cassettoni > 300, `Kassettensaal ${n.sala_cassettoni}`);
});

test('Bartolini Salimbeni: Licht höchstens 12 Blöcke von einer Seelaterne in allen Räumen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 10);
  const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
  for (const s of [0, 1, 2]) {
    const y = Y(BS.BASIS[s]);
    for (const c of D.haupt) {
      if (hof.has(c.x + ',' + c.z) || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Bartolini Salimbeni: Content aller Module, Ausstattung mit Quelle und Hinweis vereinfacht', () => {
  for (let m = 0; m <= 6; m++) assert.ok(fs.existsSync(path.join(ROOT, 'projects', 'palazzo_bartolini_salimbeni', 'content', `modul_${m}.json`)), `modul_${m}.json`);
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'palazzo_bartolini_salimbeni', 'content', 'modul_6.json'), 'utf8'));
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
