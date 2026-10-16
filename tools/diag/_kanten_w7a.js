'use strict';
// Hilfsskript W7a: Welche Straße/Platz liegt vor welcher Polygonkante? Aufruf: node tools/diag/_kanten_w7a.js <osm-id> [bodenY]
const fs = require('node:fs');
const path = require('node:path');
const { Maske } = require('../wahrzeichen/maske.js');
const P = require('../city/poly.js');
const base = require('../city/ground_stadt.js');
const ROOT = path.resolve(__dirname, '..', '..');
const id = process.argv[2], bY = +(process.argv[3] || 0);
const M = Maske.ausGebaeude([id]);
const F = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stadt', 'flaechen.json'), 'utf8'));
const liste = [];
for (const k of ['strassen', 'plaetze']) for (const f of F[k]) liste.push({ k, f });
const ks = M.kanten();
const agg = new Map();
const seen = new Set();
for (const key of M._set) {
  const [x, z] = typeof key === 'string' ? key.split(',').map(Number) : [P.ckX(key), P.ckZ(key)];
  if (M.d8(x, z) !== 1) continue;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const X = x + dx, Z = z + dz;
    if (M.innen(X, Z) || seen.has(X + ',' + Z)) continue;
    seen.add(X + ',' + Z);
    let name = '(unbenannt)';
    for (const { f } of liste) if (f.name && P.contains(f.polygon, X + 0.5, Z + 0.5)) { name = f.name; break; }
    const e = M.naechsteKante(X, Z);
    const k = e + ' ' + name;
    const a = agg.get(k) || { n: 0, g0: 99, g1: -99 };
    a.n++; const g = base.groundTopY(X, Z) - bY; a.g0 = Math.min(a.g0, g); a.g1 = Math.max(a.g1, g);
    agg.set(k, a);
  }
}
ks.forEach((k) => console.log('kante', k.i, 'L', k.L.toFixed(1), 'von', k.a.x, k.a.z, 'nach', k.b.x, k.b.z));
for (const [k, a] of [...agg].sort((x, y) => parseInt(x[0]) - parseInt(y[0]))) console.log(k.padEnd(40), 'n', a.n, 'Gelände', a.g0, '..', a.g1);
