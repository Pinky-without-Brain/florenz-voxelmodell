'use strict';
// W6c: Loggia del Pesce (projects/loggia_del_pesce): neun Rundbögen je Langseite, ein Bogen je Schmalseite, Tondi, Kuppelgewölbe,
// Walmdach mit Überstand, offene Halle, Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const LP = require('../../projects/loggia_del_pesce/model/_lp.js');
const AU = require('../../projects/loggia_del_pesce/model/_lp_ausstattung.js');

const project = getProject('loggia_del_pesce', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = LP.Y;
const D = LP.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Pesce: Projektfelder, Maske, keine Baufehler, höchster Block', () => {
  assert.equal(project.json.bodenY, 64);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.equal(project.json.luftraum, 2);
  assert.deepEqual(world.errors, []);
  assert.equal(D.alle.length, 769, 'Zellen von w204145494 (OSM-Fläche 772 Blöcke²)');
  assert.equal(D.H.loecher().length, 0);
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(LP.DACH + 2), 'höchster Block: Dachfläche über der Mitte (Lage 14)');
});

test('Pesce: neun Rundbögen je Langseite und ein Bogen je Schmalseite, offen (arkade), mindestens 2 breit und 3 hoch', () => {
  const arkaden = world.oeffnungen.filter((o) => o.art === 'arkade');
  assert.ok(arkaden.length >= 1);
  const n = arkaden.reduce((s, o) => s + o.keys.length, 0);
  assert.ok(n > 1000, `Bogenzellen ${n}`);
  // Je Langseite: Bogenmitten bei (k + 0,5) · B in der äußeren Wandlage sind Luft von Lage 1 bis 7
  for (const seite of ['nord', 'sued']) {
    let offen = 0;
    for (let k = 0; k < LP.N_BOEGEN; k++) {
      const u = (k + 0.5) * LP.B;
      const cs = D.alle.filter((c) => c.zone === 'lang' && c.d8 === 1 && Math.abs(c.u - u) < 0.6 && (seite === 'nord' ? c.w < 6 : c.w >= 6));
      assert.ok(cs.length >= 1, `Bogen ${k} ${seite}`);
      if (cs.every((c) => { for (let yr = 1; yr <= 7; yr++) if (grid.has(c.x, Y(yr), c.z)) return false; return true; })) offen++;
    }
    assert.equal(offen, LP.N_BOEGEN, `${seite}: Bögen offen`);
  }
  for (const west of [true, false]) {
    const cs = D.alle.filter((c) => c.zone === 'kurz' && c.d8 === 1 && Math.abs(c.w - LP.KURZ.w) < 0.6 && (west ? c.u < 6 : c.u > 58));
    assert.ok(cs.length >= 1);
    for (const c of cs) for (let yr = 1; yr <= 7; yr++) assert.ok(!grid.has(c.x, Y(yr), c.z), `Schmalseitenbogen Lage ${yr}`);
  }
});

test('Pesce: Bauteile, 16 Tondi, Gewölbe, Dach mit Überstand außerhalb des Umrisses (Luftraum 2)', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of ['boden', 'pfeiler', 'arkadenwand', 'gebaelk', 'tondi', 'gewoelbe', 'dach', 'licht', ...AU.TEILE]) assert.ok(n[p] > 0, p);
  // Tondi: 16 Felder von je 3 × 3 Zellen (im gedrehten Raster 8 bis 10)
  const tondi = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'tondi') tondi.push([x, y, z]); });
  const lagen = new Set(tondi.map(([x, y]) => y));
  assert.ok(tondi.length >= 16 * 8 && tondi.length <= 16 * 10, `Tondizellen ${tondi.length}`);
  assert.equal(lagen.size, 3, 'drei Lagen (7..9)');
  // Überstand: Dachzellen außerhalb der Maske auf Lage 11
  let ueber = 0;
  grid.forEach((x, y, z, e) => { if (e.part === 'dach' && y === Y(LP.KRANZ[1]) && !D.H.has(x, z)) ueber++; });
  assert.ok(ueber > 150, `Dachüberstand ${ueber}`);
});

test('Pesce: begehbar durch alle Bögen bis in die Mitte der Halle, dicht', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.ok(r.anteil > 95, String(r.anteil));
  const R = D.R;
  for (const u of [4, 20, 32, 44, 60]) {
    const p = R.toWorld(u, 6);
    const c = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dz]) => [Math.round(p.x) + dx, Y(1), Math.round(p.z) + dz]).find(([x, y, z]) => grid.has(x, y - 1, z) && !grid.has(x, y, z) && !grid.has(x, y + 1, z) && !grid.has(x, y + 2, z));
    assert.ok(c, `keine Stehzelle bei u ${u}`);
    assert.ok(r.erreicht(...c), `nicht erreichbar bei u ${u}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Pesce: Licht höchstens 12 Blöcke von einer Seelaterne', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 3);
  const y = Y(0);
  let gepr = 0;
  for (const c of D.alle) {
    if (c.zone !== 'halle' || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
    gepr++;
    assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Zelle ${c.x},${c.z} ohne Licht`);
  }
  assert.ok(gepr > 300);
});

test('Pesce: Ausstattung mit Content, Quelle und Hinweis vereinfacht', () => {
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'loggia_del_pesce', 'content', 'modul_5.json'), 'utf8'));
  assert.deepEqual(Object.keys(content.parts).sort(), AU.TEILE.slice().sort());
  const zwickel = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'loggia_del_pesce', 'content', 'modul_2.json'), 'utf8'));
  for (const p of [...AU.TEILE.map((t) => content.parts[t]), zwickel.parts.tondi]) {
    for (const f of ['title', 'description', 'tip', 'caution', 'fact']) assert.ok(typeof p[f] === 'string' && p[f].length >= 3, f);
    assert.match(p.caution, /[Vv]ereinfacht/);
    assert.match(p.fact, /Quelle/);
  }
});
