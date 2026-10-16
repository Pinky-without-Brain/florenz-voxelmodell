'use strict';
// W7b: Ex monastero di Sant'Apollonia (projects/sant_apollonia): Maske, Portale, Cenacolo mit Abendmahl, Kreuzgänge, Kirche, Mensa,
// Begehbarkeit, Licht.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const WZ = require('../wahrzeichen');
const SA = require('../../projects/sant_apollonia/model/_sa.js');
const RA = require('../../projects/sant_apollonia/model/_raeume.js');

const project = getProject('sant_apollonia', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = SA.Y;
const D = SA.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

const stehBei = (u, w, s) => D.haupt.filter((q) => q.d8 > 2 && Math.hypot(q.u - u, q.w - w) < 2.5)
  .find((q) => grid.has(q.x, Y(SA.BASIS[s]), q.z) && !grid.has(q.x, Y(SA.BASIS[s] + 1), q.z) && !grid.has(q.x, Y(SA.BASIS[s] + 2), q.z) && !grid.has(q.x, Y(SA.BASIS[s] + 3), q.z));

test('Sant\'Apollonia: Projektfelder, Maske, Mensa liegt vollständig im Konvent, keine Baufehler', () => {
  assert.equal(project.json.bodenY, 66);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(project.json.gebaeude, ['r6818342', 'w1239428647']);
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 17126);
  assert.equal(D.H.loecher().length, 4);
  const konvent = WZ.Maske.ausGebaeude(['r6818342']), mensa = WZ.Maske.ausGebaeude(['w1239428647']);
  let ausserhalb = 0;
  for (const [x, z] of mensa.cells) if (!konvent.has(x, z)) ausserhalb++;
  assert.equal(ausserhalb, 0, 'Mensa ist Teil der Konventfläche');
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(SA.TRAUFE + 1 + 4), 'höchster Block: Firstlage des Walmdachs');
  assert.equal(SA.TRAUFE, 30, 'Traufe 30 Blöcke wie OSM-Schätzung');
});

test('Sant\'Apollonia: Portale Museum, Kirche und Mensa offen, 2 breit und 3 hoch', () => {
  const luft = (test, u, w) => {
    const c = D.haupt.filter((q) => q.d8 <= 2 && test(q));
    assert.ok(c.length >= 2, `Portalzellen bei u ${u}, w ${w}`);
    for (const q of c) for (let yr = 1; yr <= 6; yr++) assert.ok(!grid.has(q.x, Y(yr), q.z), `Portal u ${u}, w ${w} Lage ${yr}`);
  };
  luft((q) => q.w < 6 && Math.abs(q.u - 106) < 1.2, 106, 0);
  luft((q) => q.u > 110 && q.w > 60 && q.w < 110 && Math.abs(q.w - 86) < 1.2, 118, 86);
  luft((q) => q.u < 6 && q.w > 110 && q.w < 160 && Math.abs(q.w - 133) < 1.2, 0, 133);
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor'));
});

test('Sant\'Apollonia: Abendmahl auf der Westwand des Cenacolo, 19 × 9 Blöcke, mit den drei Szenen darüber', () => {
  const abend = [], oben = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'abendmahl') abend.push({ x, y, z, t: e.type }); if (e.part === 'cenacolo_oben') oben.push({ x, y, z, t: e.type }); });
  assert.equal(abend.length, 171, 'Abendmahl 19 × 9');
  assert.ok(new Set(abend.map((q) => q.t)).size >= 6, 'mindestens sechs Farben');
  assert.ok(abend.every((q) => q.y >= Y(3) && q.y <= Y(11)), 'Höhe: Lage 3..11');
  assert.ok(oben.length >= 90 && oben.every((q) => q.y >= Y(13) && q.y <= Y(17)), 'oberes Register über dem Abendmahl');
  assert.ok(Math.min(...oben.map((q) => q.y)) > Math.max(...abend.map((q) => q.y)), 'oben über unten');
  // das Bild steht an der Westwand: alle Zellen in einem Streifen von höchstens 2 Blöcken entlang u
  const us = abend.map((q) => D.R.toLocal(q.x, q.z).u);
  assert.ok(Math.max(...us) - Math.min(...us) < 2.6);
});

test('Sant\'Apollonia: begehbar bis ins Cenacolo, in alle Kreuzgänge, Kirche, Sakristei, Mensa und beide Geschosse, dicht', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const orte = [[100, 15, 0], [100, 15, 1], [105, 86, 0], [105, 86, 1], [80, 86, 0], [15, 133, 0], [15, 133, 1], [45, 38, 0], [45, 38, 1],
    [20, 40, 0], [60, 40, 0], [105, 60, 0], [105, 110, 0], [105, 110, 1], [75, 140, 0], [100, 150, 0], [100, 150, 1], [5, 170, 0], [60, 40, 1], [20, 40, 1]];
  for (const [u, w, s] of orte) {
    const c = stehBei(u, w, s);
    assert.ok(c, `keine Stehzelle bei u ${u}, w ${w}, Geschoss ${s}`);
    assert.ok(r.erreicht(c.x, Y(SA.BASIS[s] + 1), c.z), `u ${u}, w ${w}, Geschoss ${s} nicht erreichbar`);
  }
  // alle vier Kreuzgänge: Hofzelle in der Mitte
  D.H.loecher().forEach((lo, i) => {
    let su = 0, sw = 0;
    for (const [x, z] of lo.cells) { const l = D.R.toLocal(x, z); su += l.u; sw += l.w; }
    const mu = su / lo.size, mw = sw / lo.size;
    const h = D.hofZellen.filter((c) => Math.hypot(c.u - mu, c.w - mw) < 3).sort((a, b) => Math.hypot(a.u - mu, a.w - mw) - Math.hypot(b.u - mu, b.w - mw))[0];
    assert.ok(h, `Hof ${i}`);
    assert.ok(r.erreicht(h.x, Y(1), h.z), `Kreuzgang ${i} nicht erreichbar`);
  });
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Sant\'Apollonia: Ausstattung vollständig, Tische und Bänke höchstens eine Lage hoch', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RA.TEILE) assert.ok(n[p] > 0, p);
  assert.ok(n.kirche > 800, `Kirche ${n.kirche}`);
  assert.ok(n.cenacolo > 1500, `Cenacolo ${n.cenacolo}`);
  // Möbel-Oberseiten: auf den Tischen, Bänken und dem Altar steht nichts (eine Lage hoch)
  const moebel = [[96, 114, 8, 9.5], [96, 114, 22, 23.5], [100, 101.5, 79, 84], [92, 95, 83, 89], [8, 26, 124, 125.5], [8, 26, 136, 137.5]];
  let gezaehlt = 0;
  for (const [u0, u1, w0, w1] of moebel) {
    for (const c of D.haupt) {
      if (c.u < u0 || c.u >= u1 || c.w < w0 || c.w >= w1 || !grid.has(c.x, Y(1), c.z)) continue;
      gezaehlt++;
      assert.ok(!grid.has(c.x, Y(2), c.z), 'Möbel zwei Lagen hoch bei ' + c.x + ',' + c.z);
    }
  }
  assert.ok(gezaehlt > 80, 'Möbelzellen ' + gezaehlt);
});



test('Sant\'Apollonia: Licht höchstens 12 Blöcke von einer Seelaterne in allen Räumen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 40);
  const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
  for (const s of [0, 1]) {
    const y = Y(SA.BASIS[s]);
    for (const c of D.haupt) {
      if (hof.has(c.x + ',' + c.z) || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Sant\'Apollonia: Content aller Module, Ausstattung mit Quelle und Hinweis vereinfacht', () => {
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'sant_apollonia', 'content', 'modul_6.json'), 'utf8'));
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
