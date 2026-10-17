'use strict';
// W7c: Palazzo dell'Arte della Lana (projects/palazzo_arte_della_lana): Maske, fünf Geschosse, Portale, Brückentür, Säle, Begehbarkeit, Licht.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const PAL = require('../spec/palette.js');
const AL = require('../../projects/palazzo_arte_della_lana/model/_al.js');
const RA = require('../../projects/palazzo_arte_della_lana/model/_raeume.js');

const project = getProject('palazzo_arte_della_lana', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = AL.Y;
const D = AL.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Arte della Lana: Projektfelder, Maske, fünf Geschosse, Höhe wie OSM', () => {
  assert.equal(project.json.bodenY, 66);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 2000);
  assert.deepEqual(AL.BASIS, [0, 7, 14, 21, 28, 34]);
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(37), 'höchster Block: Zinnen auf Lage 37 (OSM-Höhe 37)');
});

test('Arte della Lana: zwei Portale offen, Brückentür blind, Treppenblöcke, Fensterglas', () => {
  const tore = world.oeffnungen.filter((o) => o.art === 'tor');
  assert.ok(tore.length >= 1);
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of ['aussenwand', 'fenster', 'kranzgesims', 'bruecke_tuer', 'trennwaende', 'trennwaende_og', 'geschossboeden', 'decke', 'dach', 'zinnen',
    'treppe', 'licht', ...RA.TEILE.filter((t) => t !== 'licht_ausstattung')]) assert.ok(n[p] > 0, p);
  let treppen = 0, glas = 0;
  grid.forEach((x, y, z, e) => {
    if (PAL.isTreppe(e.type) && e.part === 'treppe') treppen++;
    if (e.part === 'fenster' && e.type.includes('glass')) glas++;
  });
  assert.ok(treppen >= 4 * 7, `Treppenblöcke ${treppen}`);
  assert.ok(glas > 300, `Fensterglas ${glas}`);
  // Brückentür: Lage 29..32 in der Ostwand, Türblatt außen, Nische davor, Boden der Ebene auf Höhe der Brücke (Y 94)
  const b = RA.BRUECKE;
  for (let z = b.z0; z <= b.z1; z++) for (let yr = b.y0; yr <= b.y1; yr++) {
    assert.ok(grid.has(b.x[1], Y(yr), z), `Türblatt ${z} ${yr}`);
    assert.ok(!grid.has(b.x[0], Y(yr), z), `Nische ${z} ${yr}`);
  }
  assert.equal(Y(b.y0 - 1), 94, 'Boden der 5. Ebene = Boden der Brücke von Orsanmichele (Y 94)');
});

test('Arte della Lana: begehbar bis in alle Säle (fünf Geschosse), dicht', () => {
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
  for (const [teil, s] of [['sala_udienze', 0], ['bibliothek', 1], ['lesesaal', 2], ['sala_dantesca', 3], ['brueckensaal', 4]]) {
    const c = steh(teil, Y(AL.BASIS[s]));
    assert.ok(c, `keine Stehzelle in ${teil}`);
    assert.ok(r.erreicht(...c), `nicht erreichbar: ${teil}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Arte della Lana: Licht höchstens 12 Blöcke von einer Seelaterne', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 20);
  for (let s = 0; s < 5; s++) {
    const y = Y(AL.BASIS[s]);
    for (const c of D.haupt) {
      if (!grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});
