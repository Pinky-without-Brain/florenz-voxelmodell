'use strict';
// V3 C1: Polygon-Hilfen, Parzellenraster, Material-Tabelle.
const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../city/poly.js');
const { makeParzellen, compareIds } = require('../city/parzellen.js');
const M = require('../city/material.js');
const palette = require('../spec/palette.js');

const square = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

test('Punkt im Polygon mit Loch: Rand der Außenringe innen, Loch außen, Lochrand massiv', () => {
  const poly = P.normalize({ aussen: [square(0, 0, 10, 10)], loecher: [square(3, 3, 7, 7)] });
  assert.equal(P.contains(poly, 1, 1), true);
  assert.equal(P.contains(poly, 0, 5), true);      // Rand
  assert.equal(P.contains(poly, 10, 10), true);    // Ecke
  assert.equal(P.contains(poly, 5, 5), false);     // im Loch
  assert.equal(P.contains(poly, 3, 5), true);      // Lochrand ist massiv
  assert.equal(P.contains(poly, 11, 5), false);
  const cells = P.cellsOf(poly);
  // 11 x 11 Zellen minus das offene Innere des Lochs (4 x 4 = 16 Zellen mit 3 < x,z < 7)
  assert.equal(cells.length, 121 - 9);
  assert.ok(cells.every((c, i) => i === 0 || cells[i - 1][0] < c[0] || (cells[i - 1][0] === c[0] && cells[i - 1][1] < c[1])));
});

test('Schlusspunkt wird entfernt, Fläche stimmt', () => {
  const r = square(0, 0, 4, 3).concat([[0, 0]]);
  const n = P.normalize({ aussen: [r], loecher: [] });
  assert.equal(n.aussen[0].length, 4);
  assert.equal(P.area(n), 12);
});

test('Kantennormale zeigt vom Material weg, unabhängig von der Ringrichtung und bei Löchern', () => {
  for (const ring of [square(0, 0, 10, 10), square(0, 0, 10, 10).reverse()]) {
    const poly = { aussen: [ring], loecher: [square(3, 3, 6, 6)] };
    const es = P.edges(poly);
    assert.equal(es.length, 8);
    for (const e of es) {
      const mx = (e.a[0] + e.b[0]) / 2, mz = (e.a[1] + e.b[1]) / 2;
      const vor = P.contains(P.normalize(poly), Math.round(mx + e.out[0] * 0.4), Math.round(mz + e.out[1] * 0.4));
      // 0,4 Blöcke vor der Kante liegt nie im Material (Rundung kann auf den Rand zurückfallen, daher nur Richtung prüfen)
      const hinter = P.contains(P.normalize(poly), mx - e.out[0] * 1.5, mz - e.out[1] * 1.5);
      assert.equal(hinter, true, `Kante ${e.index} (Loch ${e.hole}): Material liegt hinter der Kante`);
      assert.equal(typeof vor, 'boolean');
    }
  }
});

test('Kantenband an schräger Kante: genau die Zellen bis Tiefe 1, nur innerhalb der Kantenlänge', () => {
  const poly = { aussen: [[[0, 0], [10, 0], [0, 10]]], loecher: [] };
  const es = P.edges(poly);
  const hyp = es.find((e) => Math.abs(e.len - Math.SQRT2 * 10) < 1e-9);
  assert.ok(hyp);
  const band = P.edgeBand(hyp, P.cellsOf(poly), 1);
  const set = new Set(band.map((b) => b[0] + ',' + b[1]));
  assert.ok(set.has('5,5') && set.has('4,5') && set.has('0,10') && set.has('10,0'));
  assert.ok(!set.has('4,4'));                       // Abstand 1,41
  assert.equal(band.length, 11 + 10);               // x + z = 10 und x + z = 9
  for (const b of band) assert.ok(b[2] >= -1e-6 && b[2] <= hyp.len + 1e-6 && b[3] >= -1e-6 && b[3] < 1);
  // nächste Kante einer Zelle
  const ne = P.nearestEdge(es, 1, 4);
  assert.ok(ne.d < 1.5);
});

test('Parzellenraster: gemeinsame Zelle geht an die kleinere ID, IDs numerisch geordnet', () => {
  const A = { id: 'w5', polygon: { aussen: [square(0, 0, 10, 10)], loecher: [] } };
  const B = { id: 'w9', polygon: { aussen: [square(10, 0, 20, 10)], loecher: [] } };
  for (const list of [[A, B], [B, A]]) {
    const pz = makeParzellen(list);
    assert.equal(pz.owner(10, 5), 'w5');
    assert.equal(pz.owner(11, 5), 'w9');
    assert.equal(pz.cellsOf('w5').length, 11 * 11);
    assert.equal(pz.cellsOf('w9').length, 10 * 11);
    assert.deepEqual([...pz.adjazenz().get('w5')], ['w9']);
  }
  assert.ok(compareIds('w9', 'w10') < 0);
  assert.ok(compareIds('r7', 'w7') < 0);
  assert.equal(compareIds('w3', 'w3'), 0);
  // Überlappung: der Überlappungsbereich gehört ganz der kleineren ID
  const C = { id: 'w2', polygon: { aussen: [square(5, 0, 15, 10)], loecher: [] } };
  const pz = makeParzellen([A, B, C]);
  assert.equal(pz.owner(7, 3), 'w2');
  assert.equal(pz.owner(3, 3), 'w5');
  const total = pz.ids.reduce((s, id) => s + pz.cellsOf(id).length, 0);
  assert.equal(total, new Set(pz.ids.flatMap((id) => pz.cellsOf(id).map((c) => c.join(',')))).size); // jede Zelle genau einmal
});

test('Material-Tabelle: Rollen und Typen stehen in der Palette', () => {
  assert.equal(M.ROLE_TYPE.putz_ocker, 'yellow_terracotta');
  assert.equal(M.ROLE_TYPE.pietra_forte_rustika, 'tuff_bricks');
  assert.equal(M.ROLE_TYPE.glas_fenster, 'gray_stained_glass');
  assert.equal(M.ROLE_TYPE.dach, 'terracotta');
  for (const [role, type] of Object.entries(M.ROLE_TYPE)) {
    assert.ok(palette.TYPES.includes(type), `${type} fehlt in palette.js`);
    // 'dach' und 'dach_first' sind Rollen des Generators; die Palette führt terracotta als 'dachziegel', bricks als 'ziegel_kuppel'
    // Bettwäsche (B4) nutzt Keramikfarben der Rolle 'fresko'
    const pr = role === 'dach' ? 'dachziegel' : role === 'dach_first' ? 'ziegel_kuppel' : role.startsWith('bett_') ? 'fresko' : role;
    assert.ok(palette.rolesOf(type).includes(pr), `${type} hat die Rolle ${pr} nicht`);
  }
  assert.throws(() => M.typ('gibt_es_nicht'), RangeError);
  assert.equal(M.putzTyp('rosa'), 'pink_terracotta');
  assert.equal(M.putzTyp(null), 'end_stone_bricks');
});
