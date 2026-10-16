'use strict';
// Hilfsskript W7a: ASCII-Karte eines Palazzo-Projekts im lokalen Rahmen (. = Maske, o = Loch/Hof, Zahl = groundTopY-bodenY an der Außenkante). Aufruf: node tools/diag/_karte_w7a.js <projekt-id> [schritt]
const path = require('node:path');
const fs = require('node:fs');
const WZ = require('../wahrzeichen');
const ROOT = path.resolve(__dirname, '..', '..');
const id = process.argv[2], st = +(process.argv[3] || 2);
const dir = path.join(ROOT, 'projects', id);
const PJ = JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8'));
const base = require('../city/ground_stadt.js');
const M = WZ.ladeMasken(PJ, { dir });
const R = M.rahmen, H = M.haupt;
let u0 = 1e9, u1 = -1e9, w0 = 1e9, w1 = -1e9;
const cells = H.cells;
for (const [x, z] of cells) { const l = R.toLocal(x, z); u0 = Math.min(u0, l.u); u1 = Math.max(u1, l.u); w0 = Math.min(w0, l.w); w1 = Math.max(w1, l.w); }
console.log('Zellen', cells.length, 'Löcher', H.loecher().map((l) => l.size), 'u', u0.toFixed(1), u1.toFixed(1), 'w', w0.toFixed(1), w1.toFixed(1));
const gt = {};
for (const [x, z] of cells) { const t = base.groundTopY(x, z); gt[t] = (gt[t] || 0) + 1; }
console.log('groundTop (Basis, vor Abtrag)', JSON.stringify(gt));
const grid = new Map();
for (const [x, z] of cells) { const l = R.toLocal(x, z); grid.set(Math.round(l.u / st) + ',' + Math.round(l.w / st), '.'); }
H.loecher().forEach((lo, i) => { for (const [x, z] of lo.cells) { const l = R.toLocal(x, z); grid.set(Math.round(l.u / st) + ',' + Math.round(l.w / st), String(i)); } });
// Umgebung: Gelände relativ zu bodenY an Außenzellen
for (const [x, z] of cells) {
  if (H.d8(x, z) !== 1) continue;
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    if (H.innen(x + dx, z + dz)) continue;
    const l = R.toLocal(x + dx, z + dz), k = Math.round(l.u / st) + ',' + Math.round(l.w / st);
    if (!grid.has(k)) grid.set(k, String(Math.max(-9, Math.min(9, base.groundTopY(x + dx, z + dz) - PJ.bodenY)) + 9).slice(-1) === '9' ? '=' : (base.groundTopY(x + dx, z + dz) - PJ.bodenY > 0 ? '+' : '-'));
  }
}
console.log('Karte: Spalten = u (Schritt', st, '), Zeilen = w; = Straße auf bodenY, + höher, - tiefer');
for (let w = Math.floor(w0 / st) - 1; w <= Math.ceil(w1 / st) + 1; w++) {
  let s = String(Math.round(w * st)).padStart(4) + ' ';
  for (let u = Math.floor(u0 / st) - 1; u <= Math.ceil(u1 / st) + 1; u++) s += grid.get(u + ',' + w) || ' ';
  console.log(s);
}
