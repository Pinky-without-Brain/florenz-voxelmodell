'use strict';
// W5: Infrastruktur für Welle 2 (Masken aus Flächen, zMin/zMax, abzugAlle, hauptGrenzen, gelaendeBis, Aussparungen, Vorrang).
const test = require('node:test');
const assert = require('node:assert/strict');
const { ladeMasken, pruefeFelder, ladeAussparung, wahrzeichenVorrang } = require('../wahrzeichen/projekt.js');
const { Maske } = require('../wahrzeichen/maske.js');

const PV = {
  id: 'ponte_vecchio', type: 'wahrzeichen', gebaeude: ['r2302812'], bodenY: 63, rahmen: { ox: -539, oz: 1058, thetaDeg: 116.6 },
  hauptGrenzen: { xMax: -529 },
  masken: {
    bruecke: { flaechen: ['r5342094'], xMax: -529, abzugProjekte: ['uffizi'], abzugAlle: true },
    turm: { gebaeude: ['w306692132'] },
    korridor: { gebaeude: ['w1344547176', 'w1394832044'], xMax: -529, zMax: 1311.5, abzugProjekte: ['uffizi'], abzugAlle: true, gelaendeBis: 'boden' }
  },
  luftraum: 0
};

test('Maske aus flaechen.json: Brücke r5342094 (kein Gebäude) ergibt Zellen', () => {
  const m = Maske.ausFlaechen(['r5342094']);
  assert.ok(m.size > 9000, String(m.size));
  assert.throws(() => Maske.ausFlaechen(['gibt_es_nicht']), /Flächen-ID/);
});

test('Ponte Vecchio: Masken passen zu den gemessenen Zellzahlen der Spezifikation (10.844, ohne Uffizien)', () => {
  assert.deepEqual(pruefeFelder(PV), []);
  const m = ladeMasken(PV);
  assert.equal(m.masken.bruecke.size, 9570);
  assert.equal(m.masken.turm.size, 348);
  const u = ladeMasken(require('../../projects/uffizi/project.json'));
  let ov = 0;
  for (const [x, z] of m.alle.cells) if (u.alle.has(x, z)) ov++;
  assert.equal(ov, 0, 'keine gemeinsamen Zellen mit den Uffizien');
  assert.equal(m.alle.size, 10844);
  for (const [, z] of m.masken.korridor.cells) assert.ok(z <= 1311);
  for (const [x] of m.alle.cells) assert.ok(x <= -529);
  assert.deepEqual(m.gelaendeBis, { haupt: 'boden', bruecke: 'frei', turm: 'frei', korridor: 'boden' });
});

test('pruefeFelder: neue Felder werden geprüft', () => {
  const bad = { ...PV, gelaendeBis: 'irgendwo', hauptGrenzen: { xMax: 'x' },
    masken: { a: { flaechen: [] }, b: {}, c: { gebaeude: ['w1'], zMax: 'z', abzugAlle: 1, gelaendeBis: 'nein' } } };
  const p = pruefeFelder(bad).join(' | ');
  for (const t of ['gelaendeBis muss', 'hauptGrenzen.xMax', 'masken.a.gebaeude/flaechen', 'masken.b braucht', 'masken.c.zMax', 'masken.c.abzugAlle', 'masken.c.gelaendeBis']) {
    assert.ok(p.includes(t), `${t} fehlt in: ${p}`);
  }
});

test('Aussparung: Pfeilerspalten des Ponte Vecchio, Vorrang der Welle 2 eingetragen', () => {
  const a = ladeAussparung();
  assert.equal(a.eintraege.length, 2);
  assert.ok(a.zellen.size > 800 && a.zellen.size < 900, String(a.zellen.size));
  const v = wahrzeichenVorrang();
  for (const id of ['r2302812', 'w306692132', 'w1394832044']) assert.equal(v.get(id), 'ponte_vecchio');
  for (const id of ['r1637338', 'w1394832037', 'w1394832043']) assert.equal(v.get(id), 'palazzo_pitti');
  assert.equal(v.get('w1344547176'), 'uffizi');
});
