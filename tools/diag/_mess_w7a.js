'use strict';
// Hilfsskript W7a: Kanten, Rahmen und Geländehöhen eines Gebäudes. Aufruf: node tools/diag/_mess_w7a.js <osm-id>
const { Maske } = require('../wahrzeichen/maske.js');
const base = require('../city/ground_stadt.js');
for (const id of process.argv.slice(2)) {
  const M = Maske.ausGebaeude([id]);
  const cells = M.cells ? M.cells : [...M._set];
  console.log('==', id, 'Zellen', cells.length);
  M.kanten().forEach((k) => console.log('kante', k.i, 'a', k.a.x, k.a.z, 'b', k.b.x, k.b.z, 'L', k.L.toFixed(1), 'theta', k.rahmen.thetaDeg === undefined ? 'gespiegelt' : k.rahmen.thetaDeg.toFixed(2)));
}
