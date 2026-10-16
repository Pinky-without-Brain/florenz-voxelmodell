'use strict';
// Hilfsskript W7a: u-Intervalle der Maske je w-Zeile (alle <schritt>). Aufruf: node tools/diag/_laeufe_w7a.js <projekt-id> [schritt]
const path = require('node:path');
const fs = require('node:fs');
const WZ = require('../wahrzeichen');
const ROOT = path.resolve(__dirname, '..', '..');
const dir = path.join(ROOT, 'projects', process.argv[2]);
const st = +(process.argv[3] || 4);
const PJ = JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8'));
const M = WZ.ladeMasken(PJ, { dir });
const R = M.rahmen;
const rows = new Map();
for (const [x, z] of M.haupt.cells) {
  const l = R.toLocal(x, z), w = Math.round(l.w / st) * st;
  if (!rows.has(w)) rows.set(w, new Set());
  rows.get(w).add(Math.round(l.u));
}
for (const w of [...rows.keys()].sort((a, b) => a - b)) {
  const us = [...rows.get(w)].sort((a, b) => a - b), runs = [];
  let a = us[0], p = us[0];
  for (const u of us.slice(1)) { if (u - p > 2) { runs.push(a + '..' + p); a = u; } p = u; }
  runs.push(a + '..' + p);
  console.log('w', String(w).padStart(3), 'u', runs.join('  '));
}
