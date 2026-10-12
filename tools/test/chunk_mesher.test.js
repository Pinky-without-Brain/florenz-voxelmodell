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
