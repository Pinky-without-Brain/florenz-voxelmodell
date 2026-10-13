'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { createWorld, meshChunk } = require('../../webapp/js/engine/chunk-mesher.js');

const INFO = {
  stone: { top: [200, 200, 200], side: [150, 150, 150] },
  brick: { top: [200, 100, 80], side: [160, 80, 60] },
  glass: { transparent: true, top: [150, 200, 220], side: [150, 200, 220] },
  water: { transparent: true, top: [60, 100, 200], side: [60, 100, 200] }
};
const mk = () => createWorld({ yMin: 0, yMax: 40, typeInfo: (n) => INFO[n] });
const total = (m) => (m ? m.quads : 0);

test('einzelner Block ergibt 6 Flächen', () => {
  const w = mk();
  w.set(3, 5, 4, w.typeId('stone'));
  const m = meshChunk(w, 0, 0);
  assert.strictEqual(m.opaque.quads, 6);
  assert.strictEqual(m.opaque.positions.length, 6 * 4 * 3);
  assert.strictEqual(m.opaque.indices.length, 6 * 6);
  assert.strictEqual(m.transparent, null);
});

test('2x2x2-Würfel ergibt 6 zusammengefasste Flächen', () => {
  const w = mk();
  const id = w.typeId('stone');
  for (let x = 4; x < 6; x++) for (let y = 4; y < 6; y++) for (let z = 4; z < 6; z++) w.set(x, y, z, id);
  const m = meshChunk(w, 0, 0);
  assert.strictEqual(m.opaque.quads, 6);
});

test('zwei Blöcke verschiedener Typen: keine Innenflächen', () => {
  const w = mk();
  w.set(2, 3, 2, w.typeId('stone'));
  w.set(3, 3, 2, w.typeId('brick'));
  const m = meshChunk(w, 0, 0);
  // 2 Blöcke: je 5 sichtbare Flächen (die gemeinsame fehlt), verschiedene Typen verschmelzen nicht
  assert.strictEqual(m.opaque.quads, 10);
});

test('gleicher Typ nebeneinander verschmilzt zu 6 Flächen', () => {
  const w = mk();
  const id = w.typeId('stone');
  w.set(2, 3, 2, id); w.set(3, 3, 2, id);
  assert.strictEqual(meshChunk(w, 0, 0).opaque.quads, 6);
});

test('transparent neben opak: opake Fläche bleibt, transparente entfällt', () => {
  const w = mk();
  w.set(2, 3, 2, w.typeId('stone'));
  w.set(3, 3, 2, w.typeId('glass'));
  const m = meshChunk(w, 0, 0);
  assert.strictEqual(m.opaque.quads, 6);       // alle 6 Flächen des Steins, auch zum Glas hin
  assert.strictEqual(m.transparent.quads, 5);  // Glas ohne die Fläche zum Stein
});

test('zwei verschiedene transparente Typen behalten ihre Trennfläche, gleiche nicht', () => {
  const w = mk();
  w.set(2, 3, 2, w.typeId('glass')); w.set(3, 3, 2, w.typeId('water'));
  assert.strictEqual(meshChunk(w, 0, 0).transparent.quads, 11); // 5 + 5 + 1 gemeinsame Fl�che
  const w2 = mk();
  w2.set(2, 3, 2, w2.typeId('glass')); w2.set(3, 3, 2, w2.typeId('glass'));
  assert.strictEqual(meshChunk(w2, 0, 0).transparent.quads, 6);
});

test('Verdeckung über Chunk-Grenzen', () => {
  const w = mk();
  const id = w.typeId('stone');
  w.set(15, 3, 2, id); w.set(16, 3, 2, id); // benachbarte Chunks
  const a = meshChunk(w, 0, 0), b = meshChunk(w, 1, 0);
  assert.strictEqual(a.opaque.quads, 5);
  assert.strictEqual(b.opaque.quads, 5);
  // Negative Koordinaten und z-Grenze
  const w2 = mk();
  const id2 = w2.typeId('stone');
  w2.set(-1, 3, 15, id2); w2.set(-1, 3, 16, id2);
  assert.strictEqual(meshChunk(w2, -1, 0).opaque.quads, 5);
  assert.strictEqual(meshChunk(w2, -1, 1).opaque.quads, 5);
});

test('leerer Chunk liefert null, Normalen zeigen nach außen', () => {
  const w = mk();
  assert.strictEqual(meshChunk(w, 3, 3), null);
  w.set(1, 1, 1, w.typeId('stone'));
  const m = meshChunk(w, 0, 0).opaque;
  // Für jede Fläche: Normale parallel zum Kreuzprodukt der Dreieckskanten
  for (let q = 0; q < m.quads; q++) {
    const i0 = m.indices[q * 6], i1 = m.indices[q * 6 + 1], i2 = m.indices[q * 6 + 2];
    const P = (i) => [m.positions[i * 3], m.positions[i * 3 + 1], m.positions[i * 3 + 2]];
    const a = P(i0), b = P(i1), c = P(i2);
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    const n = [m.normals[i0 * 3], m.normals[i0 * 3 + 1], m.normals[i0 * 3 + 2]];
    assert.ok(cr[0] * n[0] + cr[1] * n[1] + cr[2] * n[2] > 0, 'Wicklung passt zur Normalen');
    // Fläche liegt auf der Außenseite des Blocks (1,1,1)
    const mid = [(a[0] + c[0]) / 2 - 1.5, (a[1] + c[1]) / 2 - 1.5, (a[2] + c[2]) / 2 - 1.5];
    assert.ok(mid[0] * n[0] + mid[1] * n[1] + mid[2] * n[2] > 0);
  }
});

test('Quader 40x1x40 über 3x3 Chunks: wenige Flächen, alle Blöcke abgedeckt', () => {
  const w = mk();
  const id = w.typeId('stone');
  for (let x = 0; x < 40; x++) for (let z = 0; z < 40; z++) w.set(x, 2, z, id);
  let quads = 0;
  for (let cx = 0; cx < 3; cx++) for (let cz = 0; cz < 3; cz++) quads += total(meshChunk(w, cx, cz).opaque);
  // Oben + unten je 9 Chunk-Flächen = 18 (Teilquader), Seiten je Chunk-Rand
  assert.ok(quads < 60, 'zusammengefasst: ' + quads);
  assert.strictEqual(w.blockCount(), 1600);
});

// ---- Treppen (B0)
const STAIR = (dir, oben) => ({ top: [180, 170, 160], side: [140, 130, 120], stair: { dir, oben: !!oben } });
const mkS = (dir, oben) => createWorld({ yMin: 0, yMax: 40, typeInfo: (n) => (n === 'tr' ? STAIR(dir, oben) : INFO[n]) });

function volumenUndFlaechen(positions, indices) {
  // Rauminhalt über Dreiecke (Divergenzsatz) und Summe der Dreiecksnormalen-Richtung
  let v = 0;
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3, b = indices[i + 1] * 3, c = indices[i + 2] * 3;
    const p = positions, ax = p[a], ay = p[a + 1], az = p[a + 2];
    const bx = p[b], by = p[b + 1], bz = p[b + 2], cx = p[c], cy = p[c + 1], cz = p[c + 2];
    v += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
  }
  return v;
}

test('Treppe: einzelner Block hat 11 Flächen und das Volumen 0,75', () => {
  for (const dir of ['n', 'o', 's', 'w']) {
    for (const oben of [false, true]) {
      const w = mkS(dir, oben);
      w.set(3, 5, 4, w.typeId('tr'));
      const m = meshChunk(w, 0, 0, { variation: 0 });
      assert.strictEqual(m.opaque.quads, 11, dir + oben);
      assert.ok(Math.abs(volumenUndFlaechen(m.opaque.positions, m.opaque.indices) - 0.75) < 1e-6, 'Volumen ' + dir + oben);
    }
  }
});

test('Treppe: hohe Hälfte liegt auf der Aufstiegsseite (n = -z, o = +x, s = +z, w = -x), umgedreht oben nach unten', () => {
  const hoch = { n: [4, 4.5], o: [3.5, 4], s: [4.5, 4], w: [3, 4] }; // erwartete Mitte der hohen Stufe (x, z) im Block (3, 5, 4)
  for (const dir of ['n', 'o', 's', 'w']) {
    const w = mkS(dir, false);
    w.set(3, 5, 4, w.typeId('tr'));
    const p = meshChunk(w, 0, 0).opaque.positions;
    // Oberseite auf y = 6 (hohe Stufe): x- und z-Bereich der Punkte mit y = 6
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (let i = 0; i < p.length; i += 3) if (p[i + 1] === 6) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); z0 = Math.min(z0, p[i + 2]); z1 = Math.max(z1, p[i + 2]); }
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    assert.deepStrictEqual([mx, mz].map((v) => v), dir === 'n' ? [3.5, 4.25] : dir === 's' ? [3.5, 4.75] : dir === 'o' ? [3.75, 4.5] : [3.25, 4.5], dir);
  }
  const w = mkS('n', true);
  w.set(3, 5, 4, w.typeId('tr'));
  const p = meshChunk(w, 0, 0).opaque.positions;
  let hat = false;
  for (let i = 0; i < p.length; i += 3) if (p[i + 1] === 5) hat = true; // hohe Stufe hängt unten
  assert.ok(hat);
  void hoch;
});

test('Treppe: Nachbarn zeichnen ihre Fläche gegen die Treppe, Treppenflächen auf der Grenze entfallen gegen Vollblöcke', () => {
  const w = mkS('n', false);
  w.set(3, 5, 4, w.typeId('tr'));
  w.set(3, 4, 4, w.typeId('stone')); // unter der Treppe
  const m = meshChunk(w, 0, 0);
  // Stein: 6 Flächen (Oberseite gegen Treppe sichtbar); Treppe ohne Unterseite: 10
  assert.strictEqual(m.opaque.quads, 6 + 10);
  // Stein neben der Treppe: Seite des Steins bleibt sichtbar, die Treppenseite zum Stein entfällt
  const w2 = mkS('n', false);
  w2.set(3, 5, 4, w2.typeId('tr'));
  w2.set(4, 5, 4, w2.typeId('stone'));
  const m2 = meshChunk(w2, 0, 0);
  assert.strictEqual(m2.opaque.quads, 6 + (11 - 2)); // +x-Seite: Platte und Stufe (2 Flächen) entfallen
});

test('Treppe: zählt nicht als Greedy-Fläche, Vollblöcke daneben verschmelzen weiter', () => {
  const w = mkS('n', false);
  const s = w.typeId('stone');
  for (let x = 2; x < 6; x++) w.set(x, 3, 4, s);
  w.set(3, 4, 4, w.typeId('tr'));
  const m = meshChunk(w, 0, 0);
  assert.ok(m.opaque.quads >= 6 + 10);
  assert.strictEqual(w.hasStairs(), true);
  assert.strictEqual(mk().hasStairs(), false);
});

