'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildWorld } = require('../model/world.js');
const { planModule } = require('../steps/planner.js');
const { validate } = require('../validate/index.js');
const { unpackKey, packKey } = require('../geom/grid.js');
const D = require('../spec/dimensions.js');
const { rho } = require('../geom/vaults.js');

const B = D.BAPTISTERY;
const CX = B.centerX, CZ = B.centerZ;
const world = buildWorld({ modules: [0, 8] });
const grid = world.grid;
const mod8 = world.modules.find((m) => m.module === 8);
const part = (id) => {
  const p = mod8.parts.find((q) => q.id === id);
  assert.ok(p, `Bauteil ${id} fehlt`);
  return p;
};
const cellsOf = (id) => part(id).keys.map((k) => ({ ...unpackKey(k), type: grid.typeOfKey(k) }));
const has = (x, y, z) => grid.has(x, y, z);

test('Modul 8 baut ohne Fehler, Bauteile in der geplanten Reihenfolge', () => {
  assert.deepEqual(world.errors, []);
  assert.deepEqual(mod8.parts.map((p) => p.id), [
    'sockel_und_untergeschoss', 'portale', 'scarsella', 'obergeschoss', 'attika', 'matroneum',
    'innenkuppel', 'pyramidendach', 'laterne']);
});

test('Ausdehnung und Blockzahl im Richtwert', () => {
  let minY = 1e9, maxY = -1, minX = 1e9, maxA = 0, n = 0;
  for (const p of mod8.parts) {
    for (const k of p.keys) {
      const c = unpackKey(k);
      n++;
      minY = Math.min(minY, c.y); maxY = Math.max(maxY, c.y); minX = Math.min(minX, c.x);
      if (c.x >= CX - B.outerHalfFlat - 1) maxA = Math.max(maxA, Math.abs(c.x - CX), Math.abs(c.z - CZ));
    }
  }
  assert.equal(minY, D.LEVELS.walkY);
  assert.equal(maxY, B.lanternTopY);
  assert.equal(minX, B.scarsella.westX);
  assert.equal(maxA, B.outerHalfFlat + 1);
  assert.ok(n >= 50000 && n <= 70000, `Blockzahl ${n} außerhalb 50–70 k`);
});

test('Untergeschoss, Portale und Scarsella sind Z-spiegelsymmetrisch (inklusive Blocktyp)', () => {
  for (const id of ['sockel_und_untergeschoss', 'portale', 'scarsella']) {
    const cells = cellsOf(id);
    const types = new Map(cells.map((c) => [packKey(c.x, c.y, c.z), c.type]));
    let bad = 0;
    for (const c of cells) if (types.get(packKey(c.x, c.y, 2 * CZ - c.z)) !== c.type) bad++;
    assert.equal(bad, 0, `${id}: ${bad} asymmetrische Blöcke`);
  }
});

test('Flagged Bauteile ohne Portale sind D4-symmetrisch (eigene Prüfung)', () => {
  for (const id of ['obergeschoss', 'attika', 'innenkuppel', 'pyramidendach', 'laterne']) {
    const p = part(id);
    assert.equal(p.opts.symmetry.order, 8, id);
    const cells = cellsOf(id);
    const types = new Map(cells.map((c) => [packKey(c.x, c.y, c.z), c.type]));
    let bad = 0;
    for (const c of cells) {
      const dx = c.x - CX, dz = c.z - CZ;
      for (const [a, b] of [[-dx, dz], [dx, -dz], [dz, dx], [-dz, dx]]) {
        if (types.get(packKey(CX + a, c.y, CZ + b)) !== c.type) bad++;
      }
    }
    assert.equal(bad, 0, `${id}: ${bad} Abweichungen`);
  }
});

test('Portale: Türblatt nur im Osten (Paradiespforte, ρ 29); Nord und Süd offen (B5)', () => {
  const cells = cellsOf('portale');
  assert.ok(cells.every((c) => c.y >= 65 && c.y <= 82));
  const gold = cells.filter((c) => c.type === 'gold_block');
  assert.equal(gold.length, 96);                       // 2 Spalten à 4 Zellen × (2+2+2+3+3) Zeilen
  assert.ok(gold.every((c) => c.x === CX + 29));
  assert.ok(!cells.some((c) => c.z === CZ - 29 || c.z === CZ + 29));
  assert.ok(!cells.some((c) => c.x < CX - 5 && Math.abs(c.z - CZ) < 12));
  assert.ok(!has(CX + 33, 70, CZ) && !has(CX, 70, CZ - 33) && !has(CX, 70, CZ + 33), 'Portalöffnungen frei');
});

test('Öffnungen: Portale O/N/S und Durchgang zur Scarsella sind frei, Wand ist hohl', () => {
  assert.ok(!has(CX + 33, 70, CZ + 3) && !has(CX + 25, 70, CZ + 3));
  assert.ok(!has(CX - 33, 70, CZ + 3) && !has(CX - 29, 70, CZ + 3) && !has(CX - 25, 70, CZ + 3));
  assert.ok(!has(CX - 43, 70, CZ), 'Scarsella innen offen');
  assert.ok(has(B.scarsella.westX, 80, CZ + 6), 'Westwand der Scarsella');
  assert.ok(!has(CX + 29, 70, CZ + 12), 'Hohlkern');
  assert.ok(has(CX + 29, 114, CZ + 12) && has(CX + 29, 77, CZ + 12), 'oberste Lagen und Binderlage voll');
});

test('Auge offen, Kuppel liegt flächig auf Wand und Dach', () => {
  const dome = cellsOf('innenkuppel'), roof = cellsOf('pyramidendach');
  assert.ok(dome.every((c) => rho(c.x - CX, c.z - CZ) >= 3));
  assert.ok(roof.every((c) => rho(c.x - CX, c.z - CZ) >= 3));
  assert.ok(!has(CX, 125, CZ) && !has(CX, 126, CZ), 'Auge');
  assert.ok(dome.some((c) => has(c.x, c.y + 1, c.z) && grid.ownerModule(c.x, c.y + 1, c.z) === 8 &&
    roof.some((r) => r.x === c.x && r.y === c.y + 1 && r.z === c.z)), 'Kuppel unter Dach');
  const wall = new Set([...cellsOf('obergeschoss'), ...cellsOf('attika')].map((c) => packKey(c.x, c.y, c.z)));
  assert.ok(dome.some((c) => wall.has(packKey(c.x + 1, c.y, c.z)) || wall.has(packKey(c.x - 1, c.y, c.z)) ||
    wall.has(packKey(c.x, c.y, c.z + 1)) || wall.has(packKey(c.x, c.y, c.z - 1))), 'Kuppel an Wand');
  assert.ok(Math.max(...dome.map((c) => c.y)) <= 125 && Math.max(...roof.map((c) => c.y)) === B.roofApexY);
});

test('Laterne sitzt auf dem Pyramidendach, Spitze bei lanternTopY', () => {
  const lan = cellsOf('laterne');
  assert.equal(Math.max(...lan.map((c) => c.y)), B.lanternTopY);
  assert.equal(lan.filter((c) => c.type === 'quartz_pillar').length, 8 * 7);
  for (const c of lan.filter((q) => q.y === 127)) assert.ok(has(c.x, 126, c.z));
});

test('Ganze Pipeline: Planer und alle Prüfregeln ohne Fehler (R3 ohne verletzende Blöcke)', () => {
  const stepsByModule = {};
  for (const m of world.modules) stepsByModule[m.module] = planModule(m, m.content, grid);
  assert.deepEqual([...stepsByModule[8].warnings], []);
  const res = validate({ grid, world, stepsByModule });
  for (const r of res) assert.deepEqual(r.errors, [], r.rule);
  assert.equal(res.find((r) => r.rule === 'R3').total, 0);
  for (const s of stepsByModule[8]) assert.ok(s.count <= 2500);
});

test('Matroneum (V5c): vier Wendeltreppen aus Treppenblöcken, Emporenring frei, Kolonnade zum Raum', () => {
  const m8 = require('../model/m8_baptisterium.js')._internal;
  const mat = part('matroneum');
  const cells = cellsOf('matroneum');
  assert.equal(cells.length, m8.SPIRAL.size);
  const stairs = cells.filter((c) => /stairs@/.test(c.type));
  assert.ok(stairs.length >= 4 * 20, `Treppenblöcke: ${stairs.length}`);
  assert.equal(cells.filter((c) => c.type === 'sea_lantern').length, 4);
  assert.equal(m8.ZONES.length, 4);
  // Emporenring: auf der Mittellinie einer Achsfläche (Ost, d 6) Luft von Y 90 bis 100, Boden und Decke fest
  const x = CX + 33 - 6;
  for (let y = 90; y <= 100; y++) assert.ok(!has(x, y, CZ + 3), `Emporenluft Y ${y}`);
  assert.ok(has(x, 89, CZ + 3) && has(x, 101, CZ + 3), 'Boden und Decke der Empore');
  assert.ok(mat);
});
