'use strict';
// Hilfsskript W7a: Welche Straßen/Plätze grenzen an die Kanten des Hauptgebäudes? Aufruf: node tools/diag/_strassen_w7a.js <projekt-id>
// Ausgabe je Straße: Anzahl Randzellen, Bereich in u/w des Projektrahmens, Gelände relativ zu bodenY (Min/Max)
const path = require('node:path');
const fs = require('node:fs');
const WZ = require('../wahrzeichen');
const P = require('../city/poly.js');
const base = require('../city/ground_stadt.js');
const ROOT = path.resolve(__dirname, '..', '..');
const id = process.argv[2];
const dir = path.join(ROOT, 'projects', id);
const PJ = JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8'));
const M = WZ.ladeMasken(PJ, { dir });
const R = M.rahmen, H = M.haupt;
const F = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'stadt', 'flaechen.json'), 'utf8'));
const liste = [];
for (const k of ['strassen', 'plaetze']) for (const f of F[k]) liste.push({ k, f });
const out = new Map();
const seen = new Set();
for (const [x, z] of H.cells) {
  if (H.d8(x, z) !== 1) continue;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const X = x + dx, Z = z + dz;
    if (H.innen(X, Z) || seen.has(X + ',' + Z)) continue;
    seen.add(X + ',' + Z);
    const l = R.toLocal(X, Z), gt = base.groundTopY(X, Z) - PJ.bodenY;
    let name = '(keine Fläche)';
    for (const { k, f } of liste) {
      const pg = f.polygon;
      if (P.contains(pg, X + 0.5, Z + 0.5)) { const nm = (f.name || '~' + f.typ) + ' [' + k + ']'; if (name === '(keine Fläche)' || (f.name && name.startsWith('~'))) name = nm; }
    }
    const e = out.get(name) || { n: 0, u0: 1e9, u1: -1e9, w0: 1e9, w1: -1e9, g0: 99, g1: -99 };
    e.n++; e.u0 = Math.min(e.u0, l.u); e.u1 = Math.max(e.u1, l.u); e.w0 = Math.min(e.w0, l.w); e.w1 = Math.max(e.w1, l.w); e.g0 = Math.min(e.g0, gt); e.g1 = Math.max(e.g1, gt);
    out.set(name, e);
  }
}
for (const [n, e] of [...out].sort((a, b) => b[1].n - a[1].n)) console.log(n.padEnd(40), 'n', String(e.n).padStart(4), 'u', e.u0.toFixed(0), '..', e.u1.toFixed(0), 'w', e.w0.toFixed(0), '..', e.w1.toFixed(0), 'Gelände', e.g0, '..', e.g1);
