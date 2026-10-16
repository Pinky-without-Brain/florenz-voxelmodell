'use strict';
// W7c: Santa Margherita de' Cerchi (projects/santa_margherita_cerchi): Maske, Portal, Altäre, Begehbarkeit, Licht.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const SM = require('../../projects/santa_margherita_cerchi/model/_sm.js');

const project = getProject('santa_margherita_cerchi', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = SM.Y;
const D = SM.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
const zelle = (iu, iw) => ({ x: SM.X0 + iu, z: SM.Z0 + iw });

test('Santa Margherita: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.bodenY, 66);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.alle.length, 451);
});

test('Santa Margherita: Bauteile, Portal 4 breit und bis zum Boden offen, Okuli verglast', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of ['fundament', 'boden', 'fassade', 'aussenwaende', 'decke', 'gewoelbe_apsis', 'dach', 'licht', 'hochaltar', 'seitenaltaere',
    'wandbilder', 'gedenktafeln', 'wappen']) assert.ok(n[p] > 0 || p === 'fundament', p);
  const tuer = world.oeffnungen.filter((o) => o.art === 'tuer');
  assert.ok(tuer.length >= 1);
  for (let iw = 7; iw <= 10; iw++) for (let yr = 1; yr <= 6; yr++) { const c = zelle(0, iw); assert.ok(!grid.has(c.x, Y(yr), c.z), `Portal iw ${iw} Lage ${yr}`); }
  let glas = 0;
  grid.forEach((x, y, z, e) => { if (e.part === 'fassade' && e.type.includes('glass')) glas++; });
  assert.ok(glas >= 12, `Okuli ${glas}`);
});

test('Santa Margherita: begehbar bis zum Hochaltar und zu beiden Seitenaltären, dicht', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.ok(r.anteil > 90, String(r.anteil));
  for (const [iu, iw, yr] of [[20, 8, 1], [11, 8, 1], [11, 14, 1], [11, 3, 1], [21, 9, 1]]) {
    const c = zelle(iu, iw);
    assert.ok(!grid.has(c.x, Y(yr), c.z) && grid.has(c.x, Y(yr - 1), c.z), `Stehzelle ${iu},${iw}`);
    assert.ok(r.erreicht(c.x, Y(yr), c.z), `nicht erreichbar: ${iu},${iw}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Santa Margherita: Licht höchstens 12 Blöcke von einer Seelaterne', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 3);
  const y = Y(0);
  for (const c of D.alle) {
    if (!grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
    assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12), `Zelle ${c.x},${c.z} ohne Licht`);
  }
});
