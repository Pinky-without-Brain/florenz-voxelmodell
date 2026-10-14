'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildWorld } = require('../model/world.js');
const { planModule } = require('../steps/planner.js');
const { validate } = require('../validate/index.js');
const { unpackKey } = require('../geom/grid.js');
const D = require('../spec/dimensions.js');
const m7 = require('../model/m7_campanile.js');

const CX = D.CAMPANILE.centerX, CZ = D.CAMPANILE.centerZ;
const world = buildWorld({ modules: [0, 7] });
const mod7 = world.modules.find((m) => m.module === 7);
const grid = world.grid;

// Zellen eines Bauteils als Liste {u, w, y, type}
function cellsOf(id) {
  const part = mod7.parts.find((p) => p.id === id);
  assert.ok(part, `Bauteil ${id} fehlt`);
  return part.keys.map((k) => {
    const c = unpackKey(k);
    return { u: c.x - CX, w: c.z - CZ, y: c.y, type: grid.typeOfKey(k) };
  });
}
const keyed = (cells) => new Map(cells.map((c) => [c.u + ',' + c.w + ',' + c.y, c.type]));

test('Modul 7 baut ohne Fehler, Bauteile in der geplanten Reihenfolge', () => {
  assert.deepEqual(world.errors, []);
  assert.deepEqual(mod7.parts.map((p) => p.id), [
    'sockel_reliefs', 'eingangstuer', 'treppe_1', 'zwischendecke_1', 'nischengeschoss', 'treppe_2',
    'zwischendecke_2', 'biforien_1', 'treppe_3', 'zwischendecke_3', 'biforien_2', 'treppe_4',
    'zwischendecke_4', 'triforien', 'treppe_5', 'glockenstuhl', 'kranz_konsolenfries', 'treppe_6',
    'terrassenboden', 'bruestung_und_fialen']);
});

test('Ausdehnung: Y 65..topY, Maß ±15 um die Turmmitte, Blockzahl im Richtwert', () => {
  let minY = 1e9, maxY = -1, maxM = 0, n = 0;
  for (const p of mod7.parts) {
    for (const k of p.keys) {
      const c = unpackKey(k);
      n++;
      minY = Math.min(minY, c.y); maxY = Math.max(maxY, c.y);
      maxM = Math.max(maxM, Math.abs(c.x - CX), Math.abs(c.z - CZ));
    }
  }
  assert.equal(minY, D.LEVELS.walkY);
  assert.equal(maxY, D.CAMPANILE.topY);
  assert.equal(maxM, D.CAMPANILE.half + 1);
  assert.ok(n >= 55000 && n <= 70000, `Blockzahl ${n} außerhalb 55–70 k`);
});

test('Ganze Pipeline: Planer und alle Prüfregeln ohne Fehler (R3 ohne verletzende Blöcke)', () => {
  const stepsByModule = {};
  for (const m of world.modules) stepsByModule[m.module] = planModule(m, m.content, grid);
  assert.deepEqual([...stepsByModule[7].warnings], []);
  const res = validate({ grid, world, stepsByModule });
  for (const r of res) assert.deepEqual(r.errors, [], r.rule);
  assert.equal(res.find((r) => r.rule === 'R3').total, 0);
  for (const s of stepsByModule[7]) assert.ok(s.count <= 2500);
});

test('Symmetrie-Flags: order 4 um die Turmmitte genau auf den Bauteilen ohne Tür, Treppe, Glocken, Decken', () => {
  const flagged = mod7.parts.filter((p) => p.opts.symmetry).map((p) => p.id);
  assert.deepEqual(flagged, ['nischengeschoss', 'biforien_1', 'biforien_2', 'triforien',
    'kranz_konsolenfries', 'bruestung_und_fialen']);
  for (const p of mod7.parts) {
    if (p.opts.symmetry) assert.deepEqual(p.opts.symmetry, { order: 4, cx: CX, cz: CZ });
  }
});

test('Vier gleiche Fassaden: Wände sind unter Drehung um 90° invariant (Sockel außer der Türzone)', () => {
  const inDoorBox = (c) => c.u >= 10 && Math.abs(c.w) <= 3 && c.y <= 76;
  const rot = (u, w) => [-w, u];
  for (const id of ['sockel_reliefs', 'nischengeschoss', 'biforien_1', 'biforien_2', 'triforien',
    'kranz_konsolenfries', 'bruestung_und_fialen']) {
    const cells = cellsOf(id);
    const map = keyed(cells);
    let bad = 0;
    for (const c of cells) {
      let u = c.u, w = c.w;
      for (let r = 1; r < 4; r++) {
        [u, w] = rot(u, w);
        if (id === 'sockel_reliefs' && inDoorBox({ u, w, y: c.y })) continue;
        if (map.get(u + ',' + w + ',' + c.y) !== c.type) bad++;
      }
    }
    assert.equal(bad, 0, `${id}: ${bad} Zellen nicht drehinvariant`);
  }
});

test('Tür nur im Osten: Rahmen und Flügel liegen in X +10..+14, |Z| ≤ 3', () => {
  const cells = cellsOf('eingangstuer');
  assert.ok(cells.length > 0);
  for (const c of cells) {
    assert.ok(c.u >= 10 && c.u <= 14 && Math.abs(c.w) <= 3, `Zelle ${c.u},${c.w} außerhalb der Ostwand`);
  }
  assert.ok(cells.some((c) => c.type === 'cut_copper')); // Bogenfeld; die Flügel stehen offen (B5)
});

test('Zwischendecken: 19 × 19 minus Treppenloch (NW-Ecke und Kopffreiheit der Treppe), genau auf Deckenhöhe', () => {
  m7.DECKS.slice(0, 4).forEach((y, i) => {
    const cells = cellsOf(`zwischendecke_${i + 1}`);
    assert.ok(cells.length <= 19 * 19 - 9 && cells.length > 19 * 19 - 40, String(cells.length));
    for (const c of cells) {
      assert.equal(c.y, y);
      assert.ok(Math.abs(c.u) <= 9 && Math.abs(c.w) <= 9);
      assert.ok(!m7.inHole(c.u, c.w));
    }
  });
  const terr = cellsOf('terrassenboden');
  assert.ok(terr.length <= 31 * 31 - 9 && terr.length > 31 * 31 - 40);
  assert.ok(terr.every((c) => c.y === 225 && !m7.inHole(c.u, c.w)));
});

test('Treppe: Beginn auf dem Boden, nie fallend, Anstieg höchstens 1, durch das Treppenloch an jeder Decke', () => {
  const path = m7.stairPath();
  assert.equal(path[0].t, D.LEVELS.walkY);
  for (let i = 1; i < path.length; i++) {
    const dt = path[i].t - path[i - 1].t;
    assert.ok(dt === 0 || dt === 1, `Sprung ${dt} bei Position ${i}`);
  }
  assert.equal(path[path.length - 1].t, 225);
  const cells = m7.stairCells();
  for (const k of cells.keys()) {
    const [u, w] = k.split(',').map(Number);
    const m = Math.max(Math.abs(u), Math.abs(w));
    assert.ok(m === 8 || m === 9, `Stufe ${k} nicht im Ring an der Wand`);
  }
  // Kopffreiheit: auf Deckenhöhe und zwei Lagen darunter liegen Stufen nur im Treppenloch
  for (const deck of m7.DECKS) {
    for (const k of cells.keys()) {
      const [u, w, y] = k.split(',').map(Number);
      if (y >= deck - 2 && y <= deck) assert.ok(m7.inHole(u, w), `Stufe ${k} neben dem Loch bei Decke ${deck}`);
    }
  }
});

test('Glockenstuhl: sieben Glocken, der Campanone ist die größte, jede hängt über Holz am Balken', () => {
  const cells = cellsOf('glockenstuhl');
  const map = keyed(cells);
  const copper = new Set(cells.filter((c) => c.type === 'cut_copper').map((c) => c.u + ',' + c.w + ',' + c.y));
  const seen = new Set();
  const bells = [];
  for (const start of copper) {
    if (seen.has(start)) continue;
    const comp = [];
    const stack = [start];
    seen.add(start);
    while (stack.length) {
      const k = stack.pop();
      comp.push(k);
      const [u, w, y] = k.split(',').map(Number);
      for (const [du, dw, dy] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
        const n = `${u + du},${w + dw},${y + dy}`;
        if (copper.has(n) && !seen.has(n)) { seen.add(n); stack.push(n); }
      }
    }
    bells.push(comp);
  }
  assert.equal(bells.length, 7);
  const sizes = bells.map((b) => b.length).sort((a, b) => b - a);
  assert.ok(sizes[0] > sizes[1], 'der Campanone muss die größte Glocke sein');
  for (const b of bells) {
    const pts = b.map((k) => k.split(',').map(Number));
    const top = Math.max(...pts.map((p) => p[2]));
    const mu = Math.round(pts.reduce((s, p) => s + p[0], 0) / pts.length);
    const mw = Math.round(pts.reduce((s, p) => s + p[1], 0) / pts.length);
    const apex = pts.find((p) => p[2] === top && p[0] === mu && p[1] === mw);
    assert.ok(apex, 'Glockenspitze in der Mitte fehlt');
    assert.equal(map.get(`${apex[0]},${apex[1]},${top + 1}`), 'dark_oak_planks', 'Hänger fehlt über der Glocke');
    // Hänger läuft ohne Lücke bis zum Balken auf Y 214
    let y = top + 1;
    while (map.get(`${apex[0]},${apex[1]},${y}`) === 'dark_oak_planks') y++;
    assert.equal(y, 215, 'Hänger erreicht den Balken nicht');
  }
  const camp = bells.find((b) => b.includes('0,0,210'));
  assert.ok(camp, 'Campanone fehlt in der Mitte');
  assert.equal(camp.length, sizes[0]);
});
