'use strict';
// W5c: Palazzo Davanzati (projects/palazzo_davanzati): Fassade, Hof mit Treppe, Altana, Räume, Begehbarkeit, Dichtheit.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const PAL = require('../spec/palette.js');
const PD = require('../../projects/palazzo_davanzati/model/_pd.js');

const project = getProject('palazzo_davanzati', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = PD.Y;
const X = (iu) => iu + PD.OX, Z = (iw) => iw + PD.OZ;

test('Davanzati: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.bodenY, 63);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(PD.lade().alle.length, 2056);
});

test('Davanzati: Bauteile, Wappen, Brunnen, Hoftreppe', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of ['fassade_eg', 'fassade_og', 'wappen', 'ferri', 'aussenwaende', 'hofwaende', 'innenwaende', 'boden_1', 'boden_2', 'boden_3',
    'boden_4', 'brunnen', 'hoftreppe', 'altana', 'dach', 'licht', 'sala_madornale', 'sala_pappagalli', 'studiolo', 'sala_pavoni',
    'camera_castellana', 'camera_impannate', 'kueche', 'altana_ausstattung', 'androne']) assert.ok(n[p] > 0, p);
  let wasser = 0, treppen = 0, glas = 0;
  grid.forEach((x, y, z, e) => {
    if (e.type === 'water') wasser++;
    if (PAL.isTreppe(e.type) && e.part === 'hoftreppe') treppen++;
    if (e.part === 'fassade_og' && e.type.includes('glass')) glas++;
  });
  assert.ok(wasser >= 1);
  assert.equal(treppen, 11 * 2 + 10 * 2 * 3, 'vier Läufe der Breite 2');
  assert.ok(glas >= 3 * 5 * 3 * 13, `Fassadenglas ${glas}`);
});

test('Davanzati: drei Torbögen 7 breit, Altana-Loggia deklariert', () => {
  const tore = world.oeffnungen.filter((o) => o.art === 'tor');
  assert.ok(tore.length >= 1);
  const keys = new Set(tore.flatMap((o) => o.keys));
  for (const iu of [8, 18, 28]) for (let d = -3; d <= 3; d++) assert.ok(keys.size > 0 && !grid.has(X(iu + d), Y(2), Z(0)), 'Bogen ' + iu);
  assert.ok(world.oeffnungen.some((o) => o.art === 'loggia' && o.part === 'altana'));
});

test('Davanzati: begehbar bis in die Altana, alle Räume erreichbar, dicht', () => {
  const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.ok(r.anteil > 90, String(r.anteil));
  for (const [iu, iw, yr] of [[18, 10, 12], [11, 21, 12], [20, 36, 12], [18, 8, 22], [18, 8, 32], [20, 36, 32], [18, 8, 42], [19, 20, 1], [18, 50, 1]]) {
    assert.ok(r.erreicht(X(iu), Y(yr), Z(iw)), `nicht erreichbar: iu ${iu} iw ${iw} yr ${yr}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Davanzati: Licht in jedem Raum höchstens 12 Blöcke von einer Seelaterne', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 40);
  for (const f of PD.F) {
    const y = Y(f);
    let schlecht = 0, gesamt = 0;
    for (const c of PD.lade().alle) {
      if (!grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      if (c.zone === 'hof' || (f === 41 && c.zone !== 'N') || c.zone === 'anbau' && f > 0) continue;
      gesamt++;
      if (!lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12)) schlecht++;
    }
    assert.equal(schlecht, 0, `Ebene ${f}: ${schlecht} von ${gesamt} Stehzellen ohne Licht`);
  }
});
