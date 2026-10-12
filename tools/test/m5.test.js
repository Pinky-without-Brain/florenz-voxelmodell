'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildWorld } = require('../model/world.js');
const m5 = require('../model/m5_kuppel.js');
const D = require('../spec/dimensions.js');
const dome = require('../geom/dome.js');
const { validate } = require('../validate/index.js');
const { planModule } = require('../steps/planner.js');

const world = buildWorld({ modules: [0, 1, 3, 4, 5] });
const grid = world.grid;
const mod5 = world.modules.find((m) => m.module === 5);
const LAY = dome.doubleDomeLayout(D);
const SPRING = LAY.springY, Y_TOP = LAY.inner.yTop, RING0 = LAY.eye.ringTopY - 5, RING1 = LAY.eye.ringTopY;
const RHO_MIN = LAY.eye.rhoMin;
const { FRESCO, BAND_H, BAND_COUNT, CHAIN_EVERY } = m5._internal;
const FRESCO_TYPES = new Set(FRESCO.flatMap((z) => [z.a, z.b]));

const cells = [];
const byPart = new Map();
grid.forEach((x, y, z, e) => {
  if (e.module !== 5) return;
  cells.push({ x, y, z, type: e.type, part: e.part });
  if (!byPart.has(e.part)) byPart.set(e.part, new Map());
  byPart.get(e.part).set(x + ',' + y + ',' + z, e.type);
});
const at = new Map(cells.map((c) => [c.x + ',' + c.y + ',' + c.z, c]));
const has = (x, y, z) => at.has(x + ',' + y + ',' + z);

test('Modul 5 baut ohne Fehler: acht Höhenbänder, dann der Schlussring', () => {
  assert.deepEqual(world.errors, []);
  const ids = mod5.parts.map((p) => p.id);
  assert.deepEqual(ids, [...Array.from({ length: BAND_COUNT }, (_, i) => 'kuppel_ring_0' + (i + 1)), 'schlussring']);
  for (const p of mod5.parts) assert.ok(p.keys.length > 0, p.id);
});

test('Symmetrie-Flags: nur der Schlussring (order 8), Bänder ohne Flag', () => {
  for (const p of mod5.parts) {
    if (p.id === 'schlussring') assert.equal(p.opts.symmetry.order, 8);
    else assert.equal(p.opts.symmetry, undefined, p.id);
  }
});

test('Bänder: 9 Lagen ab Y 173, das letzte bis yTop; Schlussring Y 241..246', () => {
  for (let i = 0; i < BAND_COUNT; i++) {
    const lo = SPRING + 1 + i * BAND_H;
    const hi = i === BAND_COUNT - 1 ? Y_TOP : lo + BAND_H - 1;
    const ys = [...byPart.get('kuppel_ring_0' + (i + 1)).keys()].map((k) => Number(k.split(',')[1]));
    assert.equal(Math.min(...ys), lo, 'Band ' + (i + 1));
    assert.equal(Math.max(...ys), hi, 'Band ' + (i + 1));
  }
  const ys = [...byPart.get('schlussring').keys()].map((k) => Number(k.split(',')[1]));
  assert.equal(Math.min(...ys), RING0);
  assert.equal(Math.max(...ys), RING1);
});

test('Geometrie (ohne Material) ist D4-symmetrisch auf allen Zellen', () => {
  let bad = 0;
  for (const c of cells) {
    if (!has(-c.x, c.y, c.z) || !has(c.x, c.y, -c.z) || !has(c.z, c.y, c.x)) bad++;
  }
  assert.equal(bad, 0);
});

test('Schalen stammen aus dome.shell: jede Schalenzelle ist belegt, keine Zelle im Auge', () => {
  for (const name of ['inner', 'outer']) {
    for (const c of dome.shell({ springY: SPRING, ...LAY[name], rhoMin: RHO_MIN })) assert.ok(has(c.x, c.y, c.z), `${name} ${c.x},${c.y},${c.z}`);
  }
  for (const c of cells) assert.ok(dome.rho(c.x, c.z) >= RHO_MIN);
});

test('Auflager: Y 173 liegt vollständig auf dem Tambour (Modul 4), nichts außerhalb rho 54', () => {
  let n = 0;
  for (const c of cells) {
    if (c.y !== SPRING + 1) continue;
    n++;
    assert.ok(dome.rho(c.x, c.z) <= D.CATHEDRAL.crossing.outerHalfFlat, `außerhalb: ${c.x},${c.z}`);
    assert.equal(grid.ownerModule(c.x, SPRING, c.z), 4, `kein Tambour unter ${c.x},${c.z}`);
  }
  assert.ok(n > 1000, String(n));
});

test('Schlussring: Y 246 voll auf rho 6..14, Lagen 242..246 genau rho 6..14, Oberkanten lückenlos', () => {
  const ring = byPart.get('schlussring');
  for (let x = -20; x <= 20; x++) {
    for (let z = -20; z <= 20; z++) {
      const q = dome.rho(x, z);
      const inside = q >= RHO_MIN && q <= 14;
      for (let y = RING0 + 1; y <= RING1; y++) assert.equal(ring.has(x + ',' + y + ',' + z), inside, `${x},${y},${z}`);
      if (inside) assert.ok(ring.has(x + ',' + RING0 + ',' + z));
    }
  }
  // Jede Zelle bei yTop (Schalen, Zwischenraum-Rippen) wird in Y 241 überdeckt.
  let top = 0;
  for (const c of cells) {
    if (c.y !== Y_TOP) continue;
    top++;
    assert.ok(ring.has(c.x + ',' + RING0 + ',' + c.z), `offen über ${c.x},${c.z}`);
  }
  assert.ok(top > 500);
});

test('Fresko: Zonen von unten nach oben mit je zwei Farben, Christus-Thron (Gold) im Ostsegment', () => {
  const fres = cells.filter((c) => FRESCO_TYPES.has(c.type) && c.part !== 'schlussring' && c.type !== 'terracotta');
  assert.ok(fres.length > 8000, String(fres.length));
  const zoneTypes = FRESCO.map(() => new Set());
  for (const c of fres) {
    if (c.type === 'white_terracotta' || c.type === 'yellow_terracotta' || c.type === 'blue_terracotta' ||
        c.type === 'gold_block' || c.type === 'black_concrete' || c.type === 'red_terracotta' ||
        c.type === 'brown_terracotta' || c.type === 'orange_terracotta' || c.type === 'light_blue_terracotta') {
      zoneTypes[Math.min(4, Math.floor(((c.y - SPRING - 1) * 5) / (Y_TOP - SPRING)))].add(c.type);
    }
  }
  FRESCO.forEach((z, i) => {
    for (const t of zoneTypes[i]) assert.ok(t === z.a || t === z.b, `Zone ${i}: ${t}`);
    assert.ok(zoneTypes[i].has(z.a) && zoneTypes[i].has(z.b), `Zone ${i} unvollständig`);
  });
  const gold = new Array(8).fill(0);
  for (const c of cells) if (c.type === 'gold_block') gold[dome.segmentIndex(c.x, c.z)]++;
  assert.ok(gold[0] > 0);
  for (let k = 1; k < 8; k++) assert.ok(gold[0] > gold[k] * 2, `Segment ${k}: ${gold[k]} vs Ost ${gold[0]}`);
  assert.ok(cells.some((c) => c.type === 'bricks') && cells.some((c) => c.type === 'terracotta'));
});

test('Ringketten: alle 12 Lagen eine volle stone_bricks-Lage im Zwischenraum', () => {
  for (let y = SPRING + CHAIN_EVERY; y <= Y_TOP; y += CHAIN_EVERY) {
    let n = 0;
    for (const c of cells) if (c.y === y && c.type === 'stone_bricks') n++;
    assert.ok(n > 200, `Kette Y ${y}: ${n}`);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { // Ring ist rundum geschlossen
      assert.ok(cells.some((c) => c.y === y && c.type === 'stone_bricks' && Math.sign(c.x) === dx && Math.sign(c.z) === dz && (dx === 0 ? c.x === 0 : c.z === 0)), `Kette Y ${y} fehlt Richtung ${dx},${dz}`);
    }
  }
  for (const c of cells) if (c.type === 'stone_bricks') assert.equal((c.y - SPRING) % CHAIN_EVERY, 0);
});

test('Hauptrippen: smooth_quartz nur nahe den Ecken, acht getrennte Rippen auf Y 200', () => {
  const q = cells.filter((c) => c.type === 'smooth_quartz' && c.part !== 'schlussring');
  assert.ok(q.length > 8000);
  const dirs = new Set();
  for (const c of q) {
    assert.ok(dome.cornerAngleDelta(c.x, c.z) <= 8, `Rippe fern der Ecke: ${c.x},${c.y},${c.z}`);
    if (c.y === 200) {
      let a = Math.atan2(-c.z, c.x) * 180 / Math.PI;
      if (a < 0) a += 360;
      dirs.add(Math.floor(a / 45));
    }
  }
  assert.equal(dirs.size, 8);
});

test('Gesamtbau M0-M5: R3, R5 und R8 ohne Fehler', () => {
  const stepsByModule = {};
  for (const m of world.modules) stepsByModule[m.module] = planModule(m, m.content, grid);
  const res = validate({ grid, world, stepsByModule, only: ['R3', 'R5', 'R8'] });
  for (const r of res) assert.deepEqual(r.errors, [], r.rule);
});
