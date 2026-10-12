'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');
const m1 = require('../model/m1_langhaus.js');
const D = require('../spec/dimensions.js');
const { PALETTE } = require('../spec/palette.js');
const { packKey, unpackKey } = require('../geom/grid.js');

const N = D.CATHEDRAL.nave;
const world = buildWorld({ modules: [1] });
const grid = world.grid;
const parts = world.modules[0].parts.map((p) => p.id);

const EXPECTED_PARTS = ['aussenwand_nord', 'aussenwand_sued', 'wandvorlagen', 'pfeiler', 'arkaden',
  'seitenschiff_gewoelbe', 'hochschiffwand', 'mittelschiff_gewoelbe', 'gesimse', 'dach_seitenschiffe',
  'dach_mittelschiff'];

test('Modul 1 baut ohne Fehler, Bauteile in Katalogreihenfolge', () => {
  assert.deepEqual(world.errors, []);
  assert.deepEqual(parts, EXPECTED_PARTS);
});

test('Alle Blöcke liegen im Langhaus-Hoheitsgebiet (plus Gesims-Vorsprung) und in der Palette', () => {
  grid.forEach((x, y, z, e) => {
    assert.ok(x >= N.interiorWestX && x <= -D.CATHEDRAL.crossing.outerHalfFlat - 1, `x ${x}`);
    assert.ok(y >= D.LEVELS.walkY && y <= N.roofRidgeY, `y ${y}`);
    assert.ok(Math.abs(z) <= N.exteriorHalfZ + 1, `z ${z}`);
    assert.ok(PALETTE[e.type], `Typ ${e.type}`);
  });
});

test('Blockzahl im Rahmen (Richtwert 110–150 k, Toleranz ±30 %)', () => {
  assert.ok(grid.size >= 77000 && grid.size <= 195000, `Blöcke: ${grid.size}`);
});

// Z-Spiegelsymmetrie inkl. Typ. Außenwände: ohne die beiden Portaljoche (dort liegen die Portale).
function assertMirror(partId, skipX, mirrorId = partId) {
  const cells = [];
  grid.forEach((x, y, z, e) => { if (e.part === partId) cells.push([x, y, z, e.type]); });
  assert.ok(cells.length > 0, partId);
  for (const [x, y, z, type] of cells) {
    if (skipX && skipX(x)) continue;
    const m = grid.get(x, y, -z);
    assert.ok(m && m.part === mirrorId && m.type === type, `${partId}: ${x},${y},${z} (${type}) ohne Spiegel`);
  }
}

test('Z-Spiegelsymmetrie der symmetrischen Bauteile', () => {
  for (const id of ['wandvorlagen', 'pfeiler', 'arkaden', 'seitenschiff_gewoelbe', 'hochschiffwand',
    'mittelschiff_gewoelbe', 'gesimse', 'dach_seitenschiffe', 'dach_mittelschiff']) assertMirror(id);
});

test('Außenwände sind außerhalb der Portaljoche spiegelsymmetrisch', () => {
  const portalX = Object.values(m1.PORTAL_BAY).map((k) => m1.BAY_CENTER[k]);
  const skip = (x) => portalX.some((c) => Math.abs(x - c) <= 10);
  assertMirror('aussenwand_nord', skip, 'aussenwand_sued');
  assertMirror('aussenwand_sued', skip, 'aussenwand_nord');
});

test('Portale: Bronzetür in |z| = 41, Joch 4 Nord, Joch 3 Süd', () => {
  const door = (id) => {
    const xs = new Set();
    grid.forEach((x, y, z, e) => { if (e.part === id && e.type === 'cut_copper') { xs.add(x); assert.equal(Math.abs(z), 41); } });
    return xs;
  };
  const n = door('aussenwand_nord'), s = door('aussenwand_sued');
  assert.ok(n.has(m1.BAY_CENTER[3]) && !n.has(m1.BAY_CENTER[2]));
  assert.ok(s.has(m1.BAY_CENTER[2]) && !s.has(m1.BAY_CENTER[3]));
});

test('Gewölbescheitel: Seitenschiff ≤ aisleVaultY, Mittelschiff ≤ naveVaultY, Dach darüber', () => {
  let maxA = 0, maxN = 0, minRoofN = Infinity;
  grid.forEach((x, y, z, e) => {
    if (e.part === 'seitenschiff_gewoelbe') maxA = Math.max(maxA, y);
    if (e.part === 'mittelschiff_gewoelbe') maxN = Math.max(maxN, y);
    if (e.part === 'dach_mittelschiff') minRoofN = Math.min(minRoofN, y);
  });
  assert.equal(maxA, N.aisleVaultY);
  assert.ok(maxN <= N.naveVaultY && maxN >= N.naveVaultY - 2, `Mittelschiff-Scheitel ${maxN}`);
  assert.equal(minRoofN, N.naveVaultY);
});

// Dichtheit: Flutfüllung von innen darf weder durch Wände/Gewölbe noch in die Dachräume gelangen.
test('Innenraum ist dicht (kein Leck in Dachräume oder nach außen)', () => {
  const x0 = N.interiorWestX, x1 = -D.CATHEDRAL.crossing.outerHalfFlat - 1;
  const seen = new Set();
  const key = packKey;
  const stack = [[-155, 66, 0]];
  seen.add(key(-155, 66, 0));
  let maxY = 0, maxAbsZ = 0;
  while (stack.length) {
    const [x, y, z] = stack.pop();
    maxY = Math.max(maxY, y);
    maxAbsZ = Math.max(maxAbsZ, Math.abs(z));
    for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
      const nx = x + dx, ny = y + dy, nz = z + dz;
      if (nx < x0 || nx > x1 || ny < 65 || ny > 170 || Math.abs(nz) > 48) continue;
      const k = key(nx, ny, nz);
      if (seen.has(k) || grid.has(nx, ny, nz)) continue;
      seen.add(k);
      stack.push([nx, ny, nz]);
    }
  }
  assert.ok(seen.size > 100000, `Innenraum zu klein: ${seen.size}`);
  assert.ok(maxY <= N.naveVaultY - 1, `Leck nach oben bis Y ${maxY}`);
  assert.ok(maxAbsZ <= N.interiorHalfZ + 2, `Leck nach außen bis |z| ${maxAbsZ}`);
});

test('Dächer sind dicht: Außenluft erreicht keinen Dachraum', () => {
  const x0 = N.interiorWestX, x1 = -D.CATHEDRAL.crossing.outerHalfFlat - 1;
  const key = packKey;
  const roofTop = new Map();
  grid.forEach((x, y, z, e) => {
    if (e.part.startsWith('dach_')) {
      const k = x + ',' + z;
      roofTop.set(k, Math.max(roofTop.get(k) || 0, y));
    }
  });
  const seen = new Set([key(-155, 170, 0)]);
  const stack = [[-155, 170, 0]];
  while (stack.length) {
    const [x, y, z] = stack.pop();
    for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
      const nx = x + dx, ny = y + dy, nz = z + dz;
      if (nx < x0 || nx > x1 || ny < 100 || ny > 170 || Math.abs(nz) > 50) continue;
      const k = key(nx, ny, nz);
      if (seen.has(k) || grid.has(nx, ny, nz)) continue;
      seen.add(k);
      stack.push([nx, ny, nz]);
    }
  }
  for (const k of seen) {
    const { x, y, z } = unpackKey(k);
    const top = roofTop.get(x + ',' + z);
    // Spalten unter dem Dach (|z| ≤ 44) dürfen nicht von außen erreichbar sein
    // Außenluft in Fensternischen (Oculi, |z| 18..20), an der Traufkante (|z| 21) und unter dem Gesims ist erlaubt
    if (Math.abs(z) >= 18 && Math.abs(z) <= 21 || y <= N.aisleEavesY) continue;
    assert.ok(top === undefined || y > top, `Leck im Dach bei ${x},${y},${z}`);
  }
});

test('Content: alle Bauteile mit Titel, Beschreibung, Tipp, Warnung und Fakt', () => {
  const file = path.join(__dirname, '..', '..', 'content', 'steps_de', 'modul_1.json');
  const c = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(c.module, 1);
  assert.equal(c.title, 'Langhaus & Seitenschiffe');
  assert.match(c.subtitle, /^Bautüte 1: /);
  assert.equal(c.icon, '⛪');
  assert.deepEqual(Object.keys(c.parts), EXPECTED_PARTS);
  for (const id of EXPECTED_PARTS) {
    for (const f of ['title', 'description', 'tip', 'caution', 'fact']) {
      assert.ok(typeof c.parts[id][f] === 'string' && c.parts[id][f].length > (f === 'title' ? 3 : 20), `${id}.${f}`);
    }
  }
});
