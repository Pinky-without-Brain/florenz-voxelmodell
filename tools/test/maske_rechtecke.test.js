'use strict';
// V5b: Zusatzmasken aus Rechtecken im Rahmen des Projekts (projekt.json masken.<name>.rechtecke), z. B. für Campanili auf freiem Grund.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../wahrzeichen');

const ROOT = path.resolve(__dirname, '..', '..');
const json = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'san_lorenzo', 'project.json'), 'utf8'));

test('Rechteckmaske: Zellenzahl ≈ Fläche, Zellen liegen im Rechteck, Feldprüfung', () => {
  assert.deepEqual(WZ.pruefeFelder(json), []);
  const M = WZ.ladeMasken(json, { dir: path.join(ROOT, 'projects', 'san_lorenzo') });
  const C = M.masken.campanile;
  const r = json.masken.campanile.rechtecke[0];
  const flaeche = (r.u[1] - r.u[0]) * (r.w[1] - r.w[0]);
  assert.ok(C.size <= flaeche && C.size > flaeche * 0.8, C.size + ' von ' + flaeche);
  for (const [x, z] of C.cells) {
    const l = M.rahmen.toLocal(x, z);
    assert.ok(l.u >= r.u[0] && l.u < r.u[1] && l.w >= r.w[0] && l.w < r.w[1]);
    assert.ok(!M.haupt.has(x, z));                                         // abzugHaupt
  }
  assert.ok(M.alle.has(...C.cells[0]));
});

test('Rechteckmaske: ungültige Rechtecke werden gemeldet', () => {
  const schlecht = JSON.parse(JSON.stringify(json));
  schlecht.masken.campanile.rechtecke = [{ u: [1], w: [2, 3] }];
  assert.ok(WZ.pruefeFelder(schlecht).some((p) => /rechtecke/.test(p)));
  schlecht.masken.campanile.rechtecke = [];
  assert.ok(WZ.pruefeFelder(schlecht).some((p) => /rechtecke/.test(p)));
});
