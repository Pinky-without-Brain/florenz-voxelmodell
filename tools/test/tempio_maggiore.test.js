'use strict';
// W8b: Tempio Maggiore Israelitico (projects/tempio_maggiore): Maske, Portale, Kuppelhöhen, Begehbarkeit, Dichtheit, Licht, Ausstattung.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const TM = require('../../projects/tempio_maggiore/model/_tm.js');

const project = getProject('tempio_maggiore', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = TM.Y;
const D = TM.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
const r13 = laufe(ctx, 'r13').einheiten[0];
const zellen = (fn) => { const out = []; grid.forEach((x, y, z, e) => { if (fn(x, y, z, e)) out.push([x, y, z]); }); return out; };

test('Tempio Maggiore: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.bodenY, 66);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.ok(D.cells.length > 6150 && D.cells.length < 6300, String(D.cells.length));
});

test('Tempio Maggiore: Bauteile, drei Hufeisenportale bis zum Boden offen und als Tor deklariert', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of ['boden', 'aussenwaende', 'fassade', 'wandmalerei', 'empore', 'gewoelbe', 'pendentifs', 'tambour', 'tambour_fenster',
    'kuppelschale', 'kuppel_fresko', 'kuppel_aussen', 'laterne', 'campanile_schaft', 'turm_empore', 'licht', 'aron', 'bima', 'baenke', 'oratorium']) assert.ok(n[p] > 0, p);
  const tore = world.oeffnungen.filter((o) => o.art === 'tor').flatMap((o) => o.keys);
  assert.ok(tore.length >= 3 * 3 * 4, `Tor-Zellen ${tore.length}`);
  for (const wc of TM.PORTALE) {
    const c = D.cells.filter((q) => TM.istFassade(q) && q.u < 3 && Math.abs(q.w - wc) < 0.6);
    assert.ok(c.length > 0);
    for (const q of c) for (let yr = 1; yr <= 7; yr++) assert.ok(!grid.has(q.x, Y(yr), q.z), `Portal ${wc} Lage ${yr}`);
  }
});

test('Tempio Maggiore: Kuppel: innen 34 m (Lage 68), außen 47 m (Lage 94), grünes Kupfer, 16 Tambourfenster', () => {
  const c0 = D.cells.reduce((b, c) => (!b || c.rho < b.rho ? c : b), null);
  let hoechst = 0, innenOben = 0;
  for (let yr = 1; yr <= 120; yr++) { if (grid.has(c0.x, Y(yr), c0.z)) hoechst = yr; else if (yr === innenOben + 1) innenOben = yr; }
  // Luft von Lage 1 an bis zur Innenkuppel
  let a = 0; while (!grid.has(c0.x, Y(a + 1), c0.z)) a++;
  assert.ok(a >= 66 && a <= 70, `Innenkuppel Luft bis Lage ${a}`);
  assert.ok(hoechst >= 93 && hoechst <= 95, `höchster Punkt Lage ${hoechst}`);
  const kupfer = zellen((x, y, z, e) => e.part === 'kuppel_aussen' && e.type === TM.T.kupfer).length;
  assert.ok(kupfer > 2000, `Kupferzellen ${kupfer}`);
  const glas = zellen((x, y, z, e) => e.part === 'tambour_fenster').length;
  assert.ok(glas >= 16 * 2 * 4, `Tambourfenster ${glas}`);
  assert.ok(D.RP > 20);
});

test('Tempio Maggiore: begehbar (Empore, Türme, Bima, Oratorium), 0 nicht erreichbare Komponenten, dicht', () => {
  assert.equal(r13.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.ok(r13.anteil > 75, String(r13.anteil));
  const steh = (pred) => zellen((x, y, z, e) => pred(x, y, z, e) && !grid.has(x, y + 1, z) && !grid.has(x, y + 2, z) && !grid.has(x, y + 3, z));
  const chk = (liste, was, min) => {
    assert.ok(liste.length >= min, `${was}: ${liste.length}`);
    const erreicht = liste.filter(([x, y, z]) => r13.erreicht(x, y + 1, z)).length;
    assert.ok(erreicht >= liste.length * 0.9, `${was}: ${erreicht}/${liste.length} erreichbar`);
  };
  chk(steh((x, y, z, e) => e.part === 'empore' && y === Y(12)), 'Empore', 200);
  chk(steh((x, y, z, e) => e.part === 'turm_empore'), 'Turmboden', 50);
  chk(steh((x, y, z, e) => e.part === 'bima' && y === Y(1) && e.type === TM.T.holz), 'Bima', 10);
  chk(steh((x, y, z, e) => e.part === 'oratorium'), 'Oratorium', 20);
  chk(steh((x, y, z, e) => e.part === 'glockenstube' && y === Y(45) && e.type === TM.T.holz), 'Turmlaterne', 20);
  chk(steh((x, y, z, e) => e.part === 'boden' && y === Y(0)).filter(([x, y, z]) => { const c = D.byKey.get(require('../city/poly.js').ck(x, z)); return c && (c.raum === 'chor' || c.raum === 'halle_c' || c.raum === 'nord'); }), 'Hauptraum, Chor, Nordarm', 500);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Tempio Maggiore: Licht höchstens 12 Blöcke von einer Seelaterne (Boden und Empore)', () => {
  const lichter = zellen((x, y, z, e) => e.type === 'sea_lantern');
  assert.ok(lichter.length >= 20);
  const ebene = (y) => lichter.filter((l) => l[1] === y - 1 || l[1] === y);
  for (const yb of [0, 12]) {
    const y = Y(yb);
    const li = ebene(y + 1).concat(ebene(y));
    const ohne = zellen((x, yy, z, e) => yy === y && (e.part === 'boden' || e.part === 'empore') && !grid.has(x, y + 1, z) && !grid.has(x, y + 2, z) && !grid.has(x, y + 3, z)
      && !(e.part === 'boden' && D.byKey.get(require('../city/poly.js').ck(x, z)).tower))
      .filter(([x, , z]) => !li.some(([lx, , lz]) => Math.hypot(lx - x, lz - z) <= 12));
    assert.deepEqual(ohne.slice(0, 5), [], `Ebene ${yb}: ${ohne.length} Zellen ohne Licht`);
  }
});

test('Tempio Maggiore: Content für alle Bauteile', () => {
  const dir = path.join(ROOT, 'projects', 'tempio_maggiore', 'content');
  const teile = new Set();
  grid.forEach((x, y, z, e) => teile.add(e.module + '/' + e.part));
  for (const t of teile) {
    const [m, p] = t.split('/');
    const j = JSON.parse(fs.readFileSync(path.join(dir, `modul_${m}.json`), 'utf8'));
    assert.ok(j.parts[p] && j.parts[p].description, `Content ${t}`);
  }
});
