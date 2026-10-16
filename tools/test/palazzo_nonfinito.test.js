'use strict';
// W7b: Palazzo Nonfinito (projects/palazzo_nonfinito): Maske, zwei Portale, Kniefenster, Räume, Hof, Begehbarkeit, Licht.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const NF = require('../../projects/palazzo_nonfinito/model/_nf.js');
const RA = require('../../projects/palazzo_nonfinito/model/_raeume.js');

const project = getProject('palazzo_nonfinito', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = NF.Y;
const D = NF.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

// freie Stehzelle (Boden, 3 Luft darüber) nahe der lokalen Lage (u, w) im Geschoss s
const stehBei = (u, w, s) => D.haupt.filter((q) => q.d8 > 2 && Math.hypot(q.u - u, q.w - w) < 2.5)
  .find((q) => grid.has(q.x, Y(NF.BASIS[s]), q.z) && !grid.has(q.x, Y(NF.BASIS[s] + 1), q.z) && !grid.has(q.x, Y(NF.BASIS[s] + 2), q.z) && !grid.has(q.x, Y(NF.BASIS[s] + 3), q.z));

test('Nonfinito: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.bodenY, 66);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 9249);
  assert.equal(D.H.loecher().length, 2);
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(NF.TRAUFE + 1 + 3), 'höchster Block: Firstlage des Walmdachs');
  assert.equal(NF.TRAUFE, 23, 'Traufe 23 Blöcke wie OSM (building:levels=3, Höhe 23)');
});

test('Nonfinito: Portale an der Via del Proconsolo und am Borgo degli Albizi offen, 2 breit und 3 hoch', () => {
  const luft = (u, w, nahU, nahW) => {
    const c = D.haupt.filter((q) => q.d8 <= 2 && Math.abs(q.u - u) < nahU && Math.abs(q.w - w) < nahW);
    assert.ok(c.length >= 2, `Portalzellen bei u ${u}, w ${w}`);
    for (const q of c) for (let yr = 1; yr <= 6; yr++) assert.ok(!grid.has(q.x, Y(yr), q.z), `Portal u ${u}, w ${w} Lage ${yr}`);
  };
  luft(49, 0, 1.2, 3);
  luft(0, 49, 3, 1.2);
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor'));
});

test('Nonfinito: Kniefenster im Erdgeschoss, sechs an der Via del Proconsolo, vier am Borgo degli Albizi, verglast', () => {
  const sohle = Y(2);
  const glasAn = (c) => grid.has(c.x, sohle + 2, c.z) && /glass/.test(grid.get(c.x, sohle + 2, c.z).type);
  const proc = D.haupt.filter((c) => c.d8 === 1 && c.w < 1.6 && glasAn(c));
  const alb = D.haupt.filter((c) => c.d8 === 1 && c.u < 1.6 && glasAn(c));
  const achsen = (zellen, f) => new Set(zellen.map((c) => Math.round((f(c) - NF.VERSATZ) / NF.ABST - 0.5))).size;
  assert.equal(achsen(proc, (c) => c.u), 6, 'Achsen Proconsolo');
  assert.equal(achsen(alb, (c) => c.w), 4, 'Achsen Albizi');
});

test('Nonfinito: begehbar bis ins Atrium, Treppenhaus, Hof, alle Museumssäle und beide Geschosse, dicht', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const orte = [[49, 20, 0], [49, 6, 0], [20, 10, 0], [70, 12, 0], [88, 32, 0], [88, 32, 1], [10, 50, 0], [10, 65, 0], [14, 50, 1], [14, 65, 1],
    [14, 20, 1], [35, 20, 1], [49, 20, 1], [63, 20, 1], [88, 20, 1], [88, 56, 1], [20, 100, 0]];
  for (const [u, w, s] of orte) {
    const c = stehBei(u, w, s);
    assert.ok(c, `keine Stehzelle bei u ${u}, w ${w}, Geschoss ${s}`);
    assert.ok(r.erreicht(c.x, Y(NF.BASIS[s] + 1), c.z), `u ${u}, w ${w}, Geschoss ${s} nicht erreichbar`);
  }
  // Hof: Stehzelle auf dem Hofpflaster
  const h = D.hofZellen.find((c) => Math.abs(c.u - 40) < 1 && Math.abs(c.w - 56) < 1);
  assert.ok(h && r.erreicht(h.x, Y(1), h.z), 'Hof erreichbar');
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Nonfinito: Ausstattung vollständig, Perseus-Figur auf Sockel, Vitrinen eine Lage hoch', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RA.TEILE) assert.ok(n[p] > 0, p);
  assert.ok(n.perseus > 20, `Perseus ${n.perseus}`);
  assert.ok(n.museum_nord > 500, `Museum Nord ${n.museum_nord}`);
  // Vitrinen: Glas auf der ersten Lage über dem Piano-nobile-Boden, nichts darüber
  let vit = 0, hoch = 0;
  grid.forEach((x, y, z, e) => {
    if (e.part !== 'museum_nord' || y !== Y(NF.BASIS[1] + 1) || !/glass/.test(e.type)) return;
    vit++;
    if (grid.has(x, y + 1, z)) hoch++;
  });
  assert.ok(vit >= 30, `Vitrinenblöcke ${vit}`);
  assert.equal(hoch, 0);
});

test('Nonfinito: Licht höchstens 12 Blöcke von einer Seelaterne in allen Räumen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 20);
  const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
  for (const s of [0, 1]) {
    const y = Y(NF.BASIS[s]);
    for (const c of D.haupt) {
      if (hof.has(c.x + ',' + c.z) || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Nonfinito: Content aller Module, Ausstattung mit Quelle und Hinweis vereinfacht', () => {
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'palazzo_nonfinito', 'content', 'modul_6.json'), 'utf8'));
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
