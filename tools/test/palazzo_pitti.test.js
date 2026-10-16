'use strict';
// V3 W7: Palazzo Pitti (projects/palazzo_pitti). Der Test baut das Projekt einmal im Speicher und prüft Katalogmaße,
// Raumplan und Begehbarkeit.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const G = require('../../projects/palazzo_pitti/model/_pi.js');
const RA = require('../../projects/palazzo_pitti/model/_raum.js');

const project = getProject('palazzo_pitti', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;

test('Palazzo Pitti: Projektfelder, Masken und Zonen nach Katalog', () => {
  assert.equal(project.json.bodenY, 83);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(G.MH.size, 43957);
  assert.equal(G.M.masken.korridor.size, 8742);
  assert.equal(G.HOEFE.map((h) => h.size).join(','), '430,573,7021');
  const zonen = {};
  for (const c of G.MATERIAL) zonen[c.zone] = (zonen[c.zone] || 0) + 1;
  assert.equal(zonen.W, 2291);
  // Fassadenstreifen: Wandband der Hauptfassade (Katalog 1.559 Zellen bei w < 5; hier über den Kantenabstand d8 ≤ 5)
  const fa = G.MATERIAL.filter((c) => G.istFA(c, 10));
  assert.ok(fa.length >= 1559 && fa.length < 2600, String(fa.length));
  for (const c of fa) assert.ok(c.d8 <= 5 && c.u >= 0 && c.u < 345.5);
});

test('Palazzo Pitti: Hauptportal offen, Kranzgesims auf Lage 76 (Y 159), kein Block über Y 166', () => {
  const portal = world.oeffnungen.filter((o) => o.module === 1 && o.art === 'tor');
  assert.ok(portal.length && portal[0].keys.length > 100);
  let ge = 0, maxY = 0;
  grid.forEach((x, y, z, e) => { if (e.part === 'fassade_gesims' && y === 159) ge++; if (y > maxY) maxY = y; });
  assert.ok(ge > 1000, String(ge));
  assert.ok(maxY <= 166, String(maxY));
});

test('Palazzo Pitti: jedes Geschoss bildet eine Raumgruppe, alle Treppen gefunden', () => {
  for (const g of ['eg', 'pn', 'og']) {
    const gs = RA.gruppen(g).filter((c) => c.some((q) => q.hof < 0) && c.length >= 20);
    assert.equal(gs.length, 1, g);
  }
  for (const [name, t] of Object.entries(RA.TREPPEN)) assert.ok(t, `Treppe ${name} fehlt`);
  assert.ok(RA.LICHT_LISTE.length > 300);
});

test('Palazzo Pitti: R13 ohne unerreichbare Komponenten, R14 dicht', () => {
  const specs = loadSpecs(project);
  const ctx = { world, grid, project, ground: specs.ground, interfaces: specs.interfaces, root: ROOT };
  for (const e of laufe(ctx, 'r13').einheiten) assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  for (const e of laufe(ctx, 'r14').einheiten) assert.equal(e.cluster.length, 0);
});

// W5b: Portikus von Santa Felicita unter dem Gang (gemeinsame Geometrie projects/santa_felicita/model/_portikus.js)
test('Palazzo Pitti: Portikus unter dem Gang offen (arkade), Balkonfenster verglast', () => {
  const PO = require('../../projects/santa_felicita/model/_portikus.js');
  let offen = 0, pfeiler = 0, pflaster = 0, fenster = 0;
  const arkade = new Set();
  for (const o of world.oeffnungen) if (o.art === 'arkade') for (const k of o.keys) arkade.add(k);
  const { packKey } = require('../geom/grid.js');
  for (const c of require('../../projects/palazzo_pitti/model/m9_korridor.js').ZK) {
    const l = PO.lokal(c.x, c.z);
    if (!l) continue;
    for (let y = c.gt + 1; y <= c.yf - 2; y++) {
      if (PO.offen(c.x, y, c.z)) { assert.ok(!grid.has(c.x, y, c.z), 'Joch offen'); assert.ok(arkade.has(packKey(c.x, y, c.z)), 'als arkade deklariert'); offen++; }
      else if (y > PO.Y(0)) { assert.ok(grid.has(c.x, y, c.z) || arkade.has(packKey(c.x, y, c.z)), 'Pfeiler und Bogenzwickel massiv (oder Luft über der Straße)'); if (grid.has(c.x, y, c.z)) pfeiler++; }
    }
    if (PO.pflaster(c.x, c.z) && grid.has(c.x, PO.Y(0), c.z)) pflaster++;   // Straßenzellen der Piazza bekommen kein Pflaster (Stadtgrund)
    for (let y = PO.FENSTER.y0; y <= PO.FENSTER.y1; y++) if (PO.balkonFenster(c.x, y, c.z) && grid.has(c.x, y, c.z)) fenster++;
  }
  assert.ok(offen > 500 && pfeiler > 300 && pflaster > 100 && fenster > 50, [offen, pfeiler, pflaster, fenster].join(','));
});
