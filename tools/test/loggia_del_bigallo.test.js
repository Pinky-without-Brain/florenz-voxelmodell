'use strict';
// W5c: Loggia del Bigallo (projects/loggia_del_bigallo): Rundbögen, Marmorfassade, Museum im Obergeschoss, Treppe, Begehbarkeit.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const PAL = require('../spec/palette.js');
const BG = require('../../projects/loggia_del_bigallo/model/_bg.js');

const project = getProject('loggia_del_bigallo', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = BG.Y;

test('Bigallo: Projektfelder, Maske, keine Baufehler', () => {
  assert.equal(project.json.bodenY, 64);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(BG.lade().alle.length, 429);
});

test('Bigallo: Bauteile, Marmor, Treppenblöcke, Bögen und Tür deklariert', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of ['fassade_eg', 'fassade_og', 'aussenwaende', 'trennwaende', 'geschossboden', 'obere_decke', 'treppe', 'dach', 'rippengewoelbe',
    'tabernakel_statuen', 'wappen_misericordia', 'licht', 'saal_1', 'saal_2', 'saal_3', 'eingangshalle']) assert.ok(n[p] > 0, p);
  let treppen = 0, marmor = 0, glas = 0;
  grid.forEach((x, y, z, e) => {
    if (PAL.isTreppe(e.type) && e.part === 'treppe') treppen++;
    if (e.part === 'fassade_eg' && ['smooth_quartz', 'dark_prismarine', 'polished_granite'].includes(e.type)) marmor++;
    if (e.part === 'fassade_og' && e.type.includes('glass')) glas++;
  });
  assert.equal(treppen, 18);
  assert.ok(marmor > 300, `Marmor ${marmor}`);
  assert.ok(glas >= 4 * 5 * 3, `Fensterglas ${glas}`);
  const arkaden = world.oeffnungen.filter((o) => o.art === 'arkade');
  assert.ok(arkaden.length >= 1 && arkaden.reduce((s, o) => s + o.keys.length, 0) >= 4 * 5 * 3);
  assert.ok(world.oeffnungen.some((o) => o.art === 'tuer' && o.keys.length >= 3 * 3));
});

test('Bigallo: begehbar bis in alle drei Säle, dicht', () => {
  const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.ok(r.anteil > 90, String(r.anteil));
  const frei = (zone, f, nahe) => BG.lade().alle.filter((c) => c.zone === zone && c.d8 >= 4 && !grid.has(c.x, Y(f + 1), c.z) && grid.has(c.x, Y(f), c.z))
    .sort((a, b) => Math.hypot(a.u - nahe.u, a.w - nahe.w) - Math.hypot(b.u - nahe.u, b.w - nahe.w))[0];
  for (const [zone, f] of [['hall', 0], ['sal2', 0], ['hall', 9], ['sal2', 9], ['sal3', 9]]) {
    const c = frei(zone, f, { u: zone === 'sal3' ? 28 : zone === 'sal2' ? 17 : 7, w: 9 });
    assert.ok(c, `keine freie Zelle ${zone} ${f}`);
    assert.ok(r.erreicht(c.x, Y(f + 1), c.z), `nicht erreichbar: ${zone} Boden ${f}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Bigallo: Licht höchstens 12 Blöcke von einer Seelaterne', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 8);
  for (const f of [0, 9]) {
    const y = Y(f);
    for (const c of BG.lade().alle) {
      if (!grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12), `Ebene ${f}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});
