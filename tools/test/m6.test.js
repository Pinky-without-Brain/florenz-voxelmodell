'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');
const D = require('../spec/dimensions.js');
const { rho } = require('../geom/vaults.js');
const { inSphere } = require('../geom/shapes.js');
const { validate } = require('../validate/index.js');
const { planModule } = require('../steps/planner.js');

const LN = D.CATHEDRAL.lantern;
const world = buildWorld({ modules: [0, 1, 2, 3, 4, 5, 6] });
const mod6 = world.modules.find((m) => m.module === 6);
const cells = new Map(); // key -> { x, y, z, type, part }
world.grid.forEach((x, y, z, e) => { if (e.module === 6) cells.set(x + ',' + y + ',' + z, { x, y, z, type: e.type, part: e.part }); });
const has = (x, y, z) => cells.has(x + ',' + y + ',' + z);
const owner = (x, y, z) => world.grid.ownerModule(x, y, z);

test('Modul 6: fünf Bauteile in Katalogreihenfolge, Symmetrie-Flags', () => {
  assert.deepEqual(world.errors, []);
  assert.deepEqual(mod6.parts.map((p) => p.id), ['laternen_sockel', 'voluten', 'tempel', 'kegeldach', 'kugel_und_kreuz']);
  for (const p of mod6.parts) {
    assert.equal(p.opts.symmetry.order, p.id === 'kugel_und_kreuz' ? 4 : 8, p.id);
    assert.ok(p.keys.length > 0, p.id);
  }
});

test('Auflager: Lage Y 247 liegt komplett auf dem Schlussring (rho 6..14), Auge rho < 4 bleibt frei', () => {
  const y0 = D.CATHEDRAL.dome.eyeRingTopY + 1;
  let n = 0;
  for (const c of cells.values()) {
    if (c.y === y0) {
      n++;
      assert.equal(owner(c.x, c.y - 1, c.z), 5, 'ohne Auflager ' + c.x + ',' + c.z);
      const q = rho(c.x, c.z);
      assert.ok(q >= 6 && q <= 14);
    }
    if (c.y >= y0 && c.y <= y0 + 2) assert.ok(rho(c.x, c.z) >= 4, 'Auge verstopft');
  }
  assert.ok(n > 0);
  assert.ok(has(5, y0 + 1, 0) && !has(5, y0, 0), 'ab Y 248 kragt der Sockel bis rho 4 nach innen');
});

test('Höhe: höchster Block = crossTopY, nie über maxY', () => {
  const maxY = Math.max(...[...cells.values()].map((c) => c.y));
  assert.equal(maxY, LN.crossTopY);
  assert.ok(maxY <= D.LEVELS.maxY);
});

test('Kugel: Vollkugel r 3 um (0, 287, 0), steht auf der Kegelspitze, Kreuz endet bei crossTopY', () => {
  const R = LN.sphereRadius;
  for (let y = LN.sphereCenterY - R - 1; y <= LN.sphereCenterY + R + 1; y++) {
    for (let x = -R - 1; x <= R + 1; x++) {
      for (let z = -R - 1; z <= R + 1; z++) {
        const inside = inSphere(x, y - LN.sphereCenterY, z, R);
        assert.equal(has(x, y, z) && cells.get(x + ',' + y + ',' + z).part === 'kugel_und_kreuz' && y <= LN.sphereCenterY + R, inside, `${x},${y},${z}`);
      }
    }
  }
  assert.ok(has(0, LN.coneTopY - 1, 0) && has(0, LN.coneTopY, 0), 'Kugel unten bei Y 284 auf Spitze Y 283');
  assert.equal(cells.get('0,' + LN.coneTopY + ',0').type, 'gold_block');
  assert.ok(has(0, LN.crossTopY, 0) && !has(0, LN.crossTopY + 1, 0));
  assert.ok(has(0, LN.crossTopY - 1, 1) && has(0, LN.crossTopY - 1, -1) && !has(1, LN.crossTopY - 1, 0));
});

test('Voluten lehnen am Tempel (Flächenkontakt) und Fenster sind verglast', () => {
  let touch = 0, glass = 0;
  for (const c of cells.values()) {
    if (c.part === 'tempel' && c.type === 'white_stained_glass') glass++;
    if (c.part !== 'voluten') continue;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = cells.get((c.x + dx) + ',' + c.y + ',' + (c.z + dz));
      if (n && n.part === 'tempel') touch++;
    }
  }
  assert.ok(touch > 0);
  assert.ok(glass > 0);
});

test('Gesamtbau M0-M6: R3, R4, R5, R6, R7 und R8 ohne Fehler', () => {
  const stepsByModule = {};
  for (const m of world.modules) stepsByModule[m.module] = planModule(m, m.content, world.grid);
  const res = validate({ grid: world.grid, world, stepsByModule, only: ['R3', 'R4', 'R5', 'R6', 'R7', 'R8'] });
  for (const r of res) assert.deepEqual(r.errors, [], r.rule);
});

test('Content: jedes Bauteil hat title, description, tip, caution, fact', () => {
  const file = path.join(__dirname, '..', '..', 'content', 'steps_de', 'modul_6.json');
  const c = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(c.title, 'Die Laterne');
  assert.match(c.subtitle, /^Bautüte 6: /);
  assert.equal(c.icon, '☀️');
  for (const p of mod6.parts) {
    for (const k of ['title', 'description', 'tip', 'caution', 'fact']) {
      assert.ok(typeof c.parts[p.id][k] === 'string' && c.parts[p.id][k].length > (k === 'title' ? 5 : 20), p.id + '.' + k);
    }
  }
});
