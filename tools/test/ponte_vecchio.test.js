'use strict';
// V3 W6: Ponte Vecchio mit Corridoio Vasariano und Torre dei Mannelli (projects/ponte_vecchio).
// Der Test baut das Projekt einmal im Speicher (kein Emit) und prüft Geometrie und Begehbarkeit am Grid.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const G = require('../../projects/ponte_vecchio/model/_pv.js');

const project = getProject('ponte_vecchio', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

const partCells = (part) => {
  const out = [];
  grid.forEach((x, y, z, e) => { if (e.part === part) out.push({ x, y, z, type: e.type }); });
  return out;
};
// Zusammenhangskomponenten (4er-Nachbarschaft) einer Zellmenge in der Draufsicht
function komponenten(zellen) {
  const s = new Set(zellen.map((c) => G.K2(c.x, c.z)));
  const seen = new Set();
  let n = 0;
  for (const k of s) {
    if (seen.has(k)) continue;
    n++;
    const st = [k]; seen.add(k);
    while (st.length) {
      const q = st.pop();
      for (const [dx, dz] of N4) {
        const m = G.K2(G.P.ckX(q) + dx, G.P.ckZ(q) + dz);
        if (s.has(m) && !seen.has(m)) { seen.add(m); st.push(m); }
      }
    }
  }
  return n;
}

test('Ponte Vecchio: Projektfelder, Module, fehlerfreier Bau', () => {
  assert.equal(project.type, 'wahrzeichen');
  assert.equal(project.json.bodenY, 63);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.deepEqual(world.modules.map((m) => m.module), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
});

test('Ponte Vecchio: alle Blöcke in der Projektmaske (Luftraum 0), keine Uffizien-Zellen (x ≤ −529)', () => {
  let n = 0;
  grid.forEach((x, y, z) => {
    n++;
    assert.ok(G.MPV.has(x, z), `außerhalb der Maske: ${x},${y},${z}`);
    assert.ok(x <= -529);
  });
  assert.ok(n > 150000, String(n));
});

test('Ponte Vecchio: Gang des Korridors hängt 4-seitig zusammen (Engstelle und Knick am Turm)', () => {
  const gang = G.ZELLEN.filter((c) => G.kGang(c) && !c.T);
  assert.ok(gang.length > 1000, String(gang.length));
  assert.equal(komponenten(gang), 1);
  // Gangluft frei auf Lage 16..18 (Kopffreiheit 3)
  for (const c of gang) for (let L = 16; L <= 18; L++) {
    const e = grid.get(c.x, G.Y(L), c.z);
    assert.ok(!e || /stairs|light|lantern/.test(e.type) || e.part === 'gang_bilder', `Gang belegt: ${c.x},${G.Y(L)},${c.z} ${e && e.part}`);
  }
});

test('Ponte Vecchio: Turmtor verbindet Außen und Turminneres 4-seitig, Wendeltreppe aus Treppenblöcken', () => {
  const tor = G.ZELLEN.filter((c) => c.T && G.turmTor(c));
  const innen = G.ZELLEN.filter((c) => c.T && c.dT > 3);
  assert.equal(komponenten([...tor, ...innen]), 1);
  assert.ok(tor.some((c) => N4.some(([dx, dz]) => { const n = G.zelle(c.x + dx, c.z + dz); return n && !n.T; })));
  for (const c of tor) for (let L = 1; L <= 3; L++) assert.ok(!grid.get(c.x, G.Y(L), c.z), `Tor belegt ${c.x},${G.Y(L)},${c.z}`);
  const tr = partCells('turm_wendeltreppe');
  assert.ok(tr.filter((b) => /stairs/.test(b.type)).length > 50);
  assert.ok(Math.max(...tr.map((b) => b.y)) >= G.Y(G.TURM_TOP));
});

test('Ponte Vecchio: R13 ohne unerreichbare Komponenten, R14 dicht', () => {
  const specs = loadSpecs(project);
  const ctx = { world, grid, project, ground: specs.ground, interfaces: specs.interfaces, root: ROOT };
  const r13 = laufe(ctx, 'r13');
  for (const e of r13.einheiten) assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const r14 = laufe(ctx, 'r14');
  for (const e of r14.einheiten) assert.equal(e.cluster.length, 0);
});
