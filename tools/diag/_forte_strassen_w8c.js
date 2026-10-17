'use strict';
// Hilfsskript W8c: benannte Straßen/Plätze/Flächen nahe dem Forte di Belvedere (Bereich x −680..−260, z 2000..2500) mit Lage und Gelände.
const path = require('node:path');
const fs = require('node:fs');
const base = require('../city/ground_stadt.js');
const ROOT = path.resolve(__dirname, '..', '..');
const F = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stadt', 'flaechen.json'), 'utf8'));
for (const k of Object.keys(F)) {
  if (!Array.isArray(F[k])) continue;
  for (const f of F[k]) {
    const ring = f.polygon && (f.polygon.aussen ? f.polygon.aussen[0] : f.polygon);
    if (!ring || !ring.length || !Array.isArray(ring[0])) continue;
    const inB = ring.filter(([x, z]) => x > -680 && x < -260 && z > 2000 && z < 2500);
    if (!inB.length || !f.name) continue;
    const xs = inB.map((p) => p[0]), zs = inB.map((p) => p[1]);
    const gts = inB.map(([x, z]) => base.groundTopY(Math.round(x), Math.round(z)));
    console.log(k.padEnd(10), f.name.padEnd(34), 'x', Math.min(...xs).toFixed(0), '..', Math.max(...xs).toFixed(0), 'z', Math.min(...zs).toFixed(0), '..', Math.max(...zs).toFixed(0), 'Gelände', Math.min(...gts), '..', Math.max(...gts), f.typ || '');
  }
}
