'use strict';
// Prüft die erzeugten Stadtdaten (data/stadt) und die Hilfsfunktionen. Erst `node tools/data/build_stadtdaten.js` ausführen.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const g2 = require('../data/geom2d.js');
const gb = require('../data/gelaende_build.js');
const dtm = require('../data/dtm.js');
const gel = require('../geo/gelaende.js');
const { roadWidthM } = require('../data/flaechen_build.js');
const { parseHeightM, parseLevels, levelsToBl } = require('../data/gebaeude_build.js');

const DIR = path.join(__dirname, '..', '..', 'data', 'stadt');
const rd = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));

test('geom2d: Multipolygon mit Loch, Puffer, Hülle', () => {
  const sq = (a, b) => [{ lat: 43.77, lon: 11.25 }, { lat: 43.77, lon: 11.25 + b }, { lat: 43.77 + a, lon: 11.25 + b }, { lat: 43.77 + a, lon: 11.25 }, { lat: 43.77, lon: 11.25 }];
  const sm = (a, b) => sq(a, b).map((p) => ({ lat: p.lat + 0.0001, lon: p.lon + 0.0001 }));
  const mp = g2.assembleMultipolygon([
    { type: 'way', role: 'outer', geometry: sq(0.001, 0.001) },
    { type: 'way', role: 'inner', geometry: sm(0.0003, 0.0003) }
  ]);
  assert.equal(mp.polys.length, 1);
  assert.equal(mp.polys[0].loecher.length, 1);
  assert.ok(g2.polyArea(mp.polys[0]) > 0);
  const buf = g2.bufferLine([[0, 0], [100, 0]], 3);
  assert.ok(Math.abs(g2.polyArea({ aussen: [g2.orient(buf.aussen[0], true)], loecher: [] }) - 600) < 1e-6);
  assert.equal(g2.convexHull([[0, 0], [4, 0], [4, 4], [0, 4], [2, 2]]).length, 4);
  assert.equal(g2.cleanRing([[0.1, 0.1], [0.2, 0.2], [3, 0], [3, 3]]).length, 3);
});

test('Gelände: Kodierung verlustfrei, DTM-Kopf mit Dezimalkomma', () => {
  const dm = Int16Array.from({ length: 12 }, (_, i) => (i * 7919) % 1500 - 200);
  assert.deepEqual(Array.from(gb.decodeBin(gb.encodeBin(dm, 4, 3), 4, 3)), Array.from(dm));
  const h = dtm.parseHeader(Buffer.from('ncols 10\nnrows 5\nxllcorner 672842,5\nyllcorner 4848653,25\ncellsize 1\nNODATA_value -9999\n'));
  assert.equal(h.xllcorner, 672842.5);
  assert.equal(h.nodata_value, -9999);
});

test('Regeln: Breiten und Höhen', () => {
  assert.equal(roadWidthM({ highway: 'pedestrian' }).m, 8);
  assert.equal(roadWidthM({ highway: 'residential' }).m, 7);
  assert.equal(roadWidthM({ highway: 'footway' }).m, 3);
  assert.equal(roadWidthM({ highway: 'primary' }).m, 12);
  assert.equal(roadWidthM({ highway: 'residential', width: '5,5 m' }).m, 5.5);
  assert.equal(parseHeightM('12.5 m'), 12.5);
  assert.equal(parseLevels('3;4'), 4);
  assert.equal(levelsToBl(3), Math.round((3 * 3.4 + 1.5) * 2));
});

test('gelaende.json: Lizenz, Grenzen, Y-Bereich', () => {
  const j = rd('gelaende.json');
  assert.equal(j.quelle.namensnennung, 'Comune di Firenze, DTM LiDAR 2017, CC BY 4.0');
  assert.equal(j.quelle.lizenz, 'CC BY 4.0');
  assert.equal((j.grenzen.x1 - j.grenzen.x0 + 1) % 16, 0);
  assert.ok(j.pruefpunkte.yBereich.min >= 0 && j.pruefpunkte.yBereich.max <= 319);
  assert.ok(j.referenzhoehe.h0 > 40 && j.referenzhoehe.h0 < 60);
  // Domplatz-Ring um Y 64
  assert.ok(Math.abs(j.pruefpunkte.domplatzRing.median - 64) <= 1);
});

test('groundTopY / heightM: Domplatz um 64, Arno tiefer, Klemmung am Rand', () => {
  gel.reset();
  assert.ok(Math.abs(gel.groundTopY(-300, 140) - 64) <= 3);
  const b = gel.bounds();
  assert.equal(gel.groundTopY(b.x0 - 50, b.z0 - 50), gel.groundTopY(b.x0, b.z0));
  assert.equal(typeof gel.heightM(0.5, 0.5), 'number');
  const ar = rd('gelaende.json').pruefpunkte.arnoWasser;
  assert.ok(ar.median < 64 - 6);
});

test('Gebäude: Kuppel bei (0,0), Felder, eindeutige IDs', () => {
  const g = rd('gebaeude.json').gebaeude;
  assert.ok(g.length > 6500);
  assert.equal(new Set(g.map((x) => x.id)).size, g.length);
  for (const x of g) {
    assert.ok(x.polygon.aussen.length >= 1 && x.flaecheBl > 0);
    assert.ok(['height', 'levels', 'schaetzung'].includes(x.hoeheQuelle) && x.hoeheBl > 0);
    assert.ok(x.bodenY >= 0 && x.bodenY <= 319);
    assert.match(x.isolato, /^I\d{4}$/);
  }
  const dom = g.find((x) => x.name === 'Cattedrale di Santa Maria del Fiore');
  const kuppel = dom.teile.find((t) => t.osm.id === 397848200);
  const c = g2.centroidRing(kuppel.polygon.aussen[0]);
  assert.ok(Math.abs(c[0]) <= 1 && Math.abs(c[1]) <= 1, String(c));
  assert.ok(g.some((x) => x.osm.typ === 'relation' && x.polygon.aussen.length >= 1));
});

test('Isolati: jedes Gebäude genau einmal, IDs lückenlos', () => {
  const g = rd('gebaeude.json').gebaeude, iso = rd('isolati.json').isolati;
  const seen = new Set();
  iso.forEach((i, k) => {
    assert.equal(i.id, 'I' + String(k + 1).padStart(4, '0'));
    for (const id of i.gebaeude) { assert.ok(!seen.has(id)); seen.add(id); }
  });
  assert.equal(seen.size, g.length);
});

test('Flächen und Wahrzeichen', () => {
  const f = rd('flaechen.json');
  for (const k of ['strassen', 'plaetze', 'wasser', 'gruen', 'bruecken', 'mauern']) assert.ok(f[k].length > 0, k);
  assert.ok(f.meta.statistik.flaechen.strasse.vereinigungBl > 1e6);
  const w = rd('wahrzeichen.json');
  const vecchio = w.plan.find((p) => p.name === 'Palazzo Vecchio');
  assert.ok(vecchio.gefunden);
  assert.ok(Array.isArray(w.nichtGefunden));
  assert.ok(fs.statSync(path.join(DIR, 'uebersicht.svg')).size > 100000);
});
