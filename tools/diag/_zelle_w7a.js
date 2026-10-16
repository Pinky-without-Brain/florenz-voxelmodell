'use strict';
// Hilfsskript W7a: Zellen eines Palazzo-Projekts an Weltkoordinaten. Aufruf: node tools/diag/_zelle_w7a.js <projekt-id> <modul-datei _xx> <x> <z> [r]
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const [id, kz, x, z, r] = process.argv.slice(2);
const PZ = require(path.join(ROOT, 'projects', id, 'model', kz + '.js'));
const Pl = PZ.plan();
const rr = +(r || 1);
for (let dx = -rr; dx <= rr; dx++) for (let dz = -rr; dz <= rr; dz++) {
  const c = PZ.zelleBei(+x + dx, +z + dz);
  const col = [];
  for (let yr = -1; yr <= PZ.TRAUFE + 8; yr++) { const e = Pl.zellen.get((+x + dx) + ',' + PZ.Y(yr) + ',' + (+z + dz)); if (e) col.push(yr + ':' + e.p); }
  console.log((+x + dx) + ',' + (+z + dz), c ? 'u ' + c.u.toFixed(1) + ' w ' + c.w.toFixed(1) + ' d8 ' + c.d8 + ' dHof ' + c.dHof : 'außen', col.join(' '));
}
