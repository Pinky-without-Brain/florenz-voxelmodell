'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildWorld } = require('../model/world.js');
const m4 = require('../model/m4_tambour.js');
const D = require('../spec/dimensions.js');
const dome = require('../geom/dome.js');
const { inOctagon } = require('../geom/shapes.js');
const { inExedra, OWNERSHIP } = require('../spec/interfaces.js');

const world = buildWorld({ modules: [0, 1, 3, 4] });
const grid = world.grid;
const mod4 = world.modules.find((m) => m.module === 4);
const partIds = mod4.parts.map((p) => p.id);
const { faceOf, windowMetric, Y_BASE, Y_TOP, OC_Y, GESIMS_Y } = m4._internal;

const cellsOf = (id) => {
  const m = new Map();
  grid.forEach((x, y, z, e) => { if (e.module === 4 && e.part === id) m.set(x + ',' + y + ',' + z, e.type); });
  return m;
};
const solid4 = (x, y, z) => grid.ownerModule(x, y, z) === 4;
const isRing = (x, z) => inOctagon(x, z, 54) && !inOctagon(x, z, 44);

test('Modul 4 baut ohne Fehler, Bauteile in der Reihenfolge Ring, Ochsenaugen, tribune morte, Gesims, Galerie', () => {
  assert.deepEqual(world.errors, []);
  assert.deepEqual(partIds, ['tambour_ring', 'ochsenaugen', 'tribune_morte', 'kranzgesims', 'galerie_suedost']);
  for (const p of mod4.parts) assert.ok(p.keys.length > 0, `${p.id} ist leer`);
});

test('Symmetrie-Flags: order 8 auf Ring, Ochsenaugen, tribune morte, Gesims; Galerie ohne Flag', () => {
  const byId = Object.fromEntries(mod4.parts.map((p) => [p.id, p.opts]));
  for (const id of ['tambour_ring', 'ochsenaugen', 'tribune_morte', 'kranzgesims']) {
    assert.equal(byId[id].symmetry.order, 8, id);
  }
  assert.equal(byId.galerie_suedost.symmetry, undefined);
});

test('Schnittstelle unten: Y 149 voll auf dem Ring 45..54 und auf allen vier Exedra-Halbkreisen', () => {
  let ring = 0, ex = 0;
  for (let x = -70; x <= 70; x++) {
    for (let z = -70; z <= 70; z++) {
      if (isRing(x, z)) { ring++; assert.ok(solid4(x, Y_BASE, z), `Ring offen bei ${x},${Y_BASE},${z}`); }
      if (inExedra(x, z)) { ex++; assert.ok(solid4(x, Y_BASE, z), `Exedra offen bei ${x},${Y_BASE},${z}`); }
    }
  }
  assert.ok(ring > 2500 && ex > 400, `${ring} / ${ex}`);
});

test('Schnittstelle oben: Y 170..172 voll auf dem Ring (Y 172 = Auflager der Kuppel)', () => {
  assert.equal(Y_TOP, D.CATHEDRAL.dome.springY);
  for (const y of [170, 171, 172]) {
    for (let x = -70; x <= 70; x++) {
      for (let z = -70; z <= 70; z++) {
        if (isRing(x, z)) assert.ok(solid4(x, y, z), `Ring offen bei ${x},${y},${z}`);
      }
    }
  }
  assert.equal(grid.bounds().maxY, Y_TOP);
});

test('Hoheitsgebiet Tambour: Zellen im Tambour-Volumen gehören zu Modul 4, Modul 4 liegt in Y 149..172', () => {
  const own = OWNERSHIP.find((o) => o.name === 'Tambour');
  let n = 0;
  grid.forEach((x, y, z, e) => { if (own.test(x, y, z) && e.module !== 4) n++; });
  assert.equal(n, 0);
  grid.forEach((x, y, z, e) => { if (e.module === 4) assert.ok(y >= Y_BASE && y <= Y_TOP); });
});

test('Flächenzuordnung stimmt für alle Zellen mit dome.segmentIndex überein', () => {
  let n = 0;
  for (let x = -56; x <= 56; x++) {
    for (let z = -56; z <= 56; z++) {
      if (!inOctagon(x, z, 56) || (x === 0 && z === 0)) continue;
      assert.equal(faceOf(x, z), dome.segmentIndex(x, z), `Fläche bei ${x},${z}`);
      n++;
    }
  }
  assert.ok(n > 10000);
});

test('Ochsenaugen: je Fläche gleiches Fenster, Zentrum Y 163, Durchbruch leer außer Glas in der Wandmitte', () => {
  const cells = cellsOf('ochsenaugen');
  const perFace = Array(8).fill(0), perFaceFrame = Array(8).fill(0);
  for (const [k, t] of cells) {
    const [x, y, z] = k.split(',').map(Number);
    const f = faceOf(x, z);
    if (t.endsWith('stained_glass')) {
      perFace[f]++;
      assert.ok(windowMetric(x, y, z) <= 20);
      assert.ok(inOctagon(x, z, 50) && !inOctagon(x, z, 48), `Glas nicht in der Wandmitte: ${k}`);
    } else {
      perFaceFrame[f]++;
      assert.equal(t, 'chiseled_quartz');
      assert.ok(windowMetric(x, y, z) > 20);
    }
  }
  assert.ok(perFace[0] > 50);
  // Achsflächen (0,2,4,6) und Diagonalflächen (1,3,5,7) sind je untereinander gleich
  for (const arr of [perFace, perFaceFrame]) {
    for (const par of [0, 1]) {
      const g = arr.filter((_, i) => i % 2 === par);
      assert.deepEqual(g.filter((n) => n !== g[0]), [], 'Zellen je Fläche ungleich');
    }
  }
  // Ostfenster: Mittelzeile (Kreuz) gelb auf x 49..50, davor und dahinter Durchgang
  for (let x = 45; x <= 54; x++) {
    const e = grid.get(x, OC_Y, 0);
    if (x === 49 || x === 50) assert.equal(e.type, 'yellow_stained_glass');
    else assert.equal(e, undefined, `Durchgang verstopft bei x=${x}`);
  }
  assert.equal(grid.get(49, OC_Y + 2, 2).type, 'blue_stained_glass');
  assert.equal(grid.get(49, OC_Y + 2, 0).type, 'yellow_stained_glass');
  assert.equal(grid.get(49, OC_Y - 5, 0).type, 'chiseled_quartz');
  for (let y = OC_Y - 5; y <= OC_Y + 5; y++) {
    for (let x = 45; x <= 54; x++) {
      const e = grid.get(x, y, 0);
      if (e) assert.equal(e.part, 'ochsenaugen');
    }
  }
});

test('Ring, Ochsenaugen, tribune morte und Gesims sind D4-symmetrisch (inkl. Blocktyp)', () => {
  for (const id of ['tambour_ring', 'ochsenaugen', 'tribune_morte', 'kranzgesims']) {
    const cells = cellsOf(id);
    for (const [k, t] of cells) {
      const [x, y, z] = k.split(',').map(Number);
      for (const [a, b] of [[-x, z], [x, -z], [z, x], [-z, x]]) {
        assert.equal(cells.get(a + ',' + y + ',' + b), t, `${id} asymmetrisch bei ${k}`);
      }
    }
  }
});

test('Gesims Y 171 und Galerie (nur SO, Y 168..170) haben getrennte Zellen', () => {
  const ges = cellsOf('kranzgesims'), gal = cellsOf('galerie_suedost');
  for (const k of ges.keys()) assert.equal(Number(k.split(',')[1]), GESIMS_Y);
  const ys = new Set();
  for (const k of gal.keys()) {
    const [x, y, z] = k.split(',').map(Number);
    ys.add(y);
    assert.ok(x > 0 && z > 0 && faceOf(x, z) === 7, `Galerie außerhalb der SO-Fläche: ${k}`);
    assert.ok(y >= 168 && y <= 170);
    assert.ok(!ges.has(k));
  }
  assert.deepEqual([...ys].sort(), [168, 169, 170]);
  let missing = 0;
  for (let x = -60; x <= 60; x++) {
    for (let z = -60; z <= 60; z++) {
      if (inOctagon(x, z, 55) && !inOctagon(x, z, 54) && !ges.has(x + ',171,' + z)) missing++;
    }
  }
  assert.equal(missing, 0, 'Gesims umläuft nicht lückenlos (auch über den Exedren)');
});

test('tribune morte: niedrig (Wand Y 149..151, Ellipsoid-Kuppel bis Y 157), Säulen, Terrakotta', () => {
  const t = cellsOf('tribune_morte');
  const types = new Set(t.values());
  for (const need of ['quartz_pillar', 'terracotta']) assert.ok(types.has(need), need);
  let maxY = 0;
  for (const k of t.keys()) maxY = Math.max(maxY, Number(k.split(',')[1]));
  assert.equal(maxY, 157);
  assert.ok(maxY < OC_Y - 5, 'Exedra muss unter der Unterkante der Ochsenaugen enden');
  for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    let top = 0;
    for (const k of t.keys()) { const [x, y, z] = k.split(',').map(Number); if (y === 157 && Math.sign(x) === sx && Math.sign(z) === sz) top++; }
    assert.ok(top > 0, 'Scheitel fehlt');
  }
});

test('Ochsenaugen frei: weder Ring noch Exedra noch Gesims in Durchbruch, Rahmen und davor', () => {
  let bad = 0;
  grid.forEach((x, y, z, e) => {
    if (e.module !== 4 || e.part === 'ochsenaugen') return;
    if (y < OC_Y - 6 || y > OC_Y + 6) return;
    if (windowMetric(x, y, z) <= 30 + 6 && inOctagon(x, z, 54 + 6)) {
      // alles im Fensterzylinder (auch außerhalb des Rings) muss frei sein
      if (windowMetric(x, y, z) <= 30) bad++;
    }
  });
  assert.equal(bad, 0);
});

test('Galerie läuft über die ganze SO-Fläche durch (ohne Lücke) und ist dort gleichmäßig', () => {
  const gal = cellsOf('galerie_suedost');
  let missing = 0, count = 0;
  for (let x = 1; x <= 60; x++) {
    for (let z = 1; z <= 60; z++) {
      if (faceOf(x, z) !== 7) continue;
      if ((inOctagon(x, z, 56) && !inOctagon(x, z, 54))) { count++; if (!gal.has(x + ',169,' + z)) missing++; }
    }
  }
  assert.ok(count > 40);
  assert.equal(missing, 0);
});
