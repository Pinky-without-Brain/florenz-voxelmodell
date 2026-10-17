'use strict';
// Hilfsskript W8c: Gebäude und Flächen, die innerhalb oder am Rand der Maske des Forte di Belvedere liegen.
const path = require('node:path');
const fs = require('node:fs');
const WZ = require('../wahrzeichen');
const ROOT = path.resolve(__dirname, '..', '..');
const dir = path.join(ROOT, 'projects', 'forte_belvedere');
const PJ = JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8'));
const H = WZ.ladeMasken(PJ, { dir }).haupt;
const G = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stadt', 'gebaeude.json'), 'utf8'));
const arr = G.gebaeude || G;
for (const b of arr) {
  if (b.id === 'w24879633') continue;
  const ring = b.polygon.aussen[0];
  let n = 0;
  for (const [x, z] of ring) if (H.innen(Math.round(x), Math.round(z))) n++;
  const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length, cz = ring.reduce((s, p) => s + p[1], 0) / ring.length;
  const nahe = cx > -650 && cx < -300 && cz > 2020 && cz < 2460;
  if (n > 0 || nahe) console.log(b.id, b.name || '-', 'Ecken innen', n + '/' + ring.length, 'Mitte', cx.toFixed(0), cz.toFixed(0), 'Fläche', b.flaecheBl, 'Höhe', b.hoeheBl);
}
const F = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stadt', 'flaechen.json'), 'utf8'));
const P = require('../city/poly.js');
for (const k of Object.keys(F)) {
  if (!Array.isArray(F[k])) continue;
  for (const f of F[k]) {
    const ring = f.polygon && (f.polygon.aussen ? f.polygon.aussen[0] : f.polygon);
    if (!ring || !ring.length || !Array.isArray(ring[0])) continue;
    let n = 0;
    for (const [x, z] of ring) if (H.innen(Math.round(x), Math.round(z))) n++;
    if (n > 0) console.log('Fläche', k, f.name || ('~' + f.typ), 'Ecken innen', n + '/' + ring.length);
  }
}
