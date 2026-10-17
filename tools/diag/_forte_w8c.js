'use strict';
// Hilfsskript W8c: Gelände (groundTopY − 180 als Hexziffer) in der Maske des Forte di Belvedere, Weltachsen, Schritt s. Außerhalb: Umfeld (Ziffer klein in Klammern ersetzt durch Kleinbuchstaben).
// Aufruf: node tools/diag/_forte_w8c.js [schritt] [x0 x1 z0 z1]
const path = require('node:path');
const fs = require('node:fs');
const WZ = require('../wahrzeichen');
const base = require('../city/ground_stadt.js');
const ROOT = path.resolve(__dirname, '..', '..');
const dir = path.join(ROOT, 'projects', 'forte_belvedere');
const PJ = JSON.parse(fs.readFileSync(path.join(dir, 'project.json'), 'utf8'));
const M = WZ.ladeMasken(PJ, { dir });
const H = M.haupt;
const st = +(process.argv[2] || 4);
const [x0, x1, z0, z1] = process.argv[3] ? process.argv.slice(3, 7).map(Number) : [-640, -330, 2030, 2450];
for (let z = z0; z <= z1; z += st) {
  let s = String(z).padStart(5) + ' ';
  for (let x = x0; x <= x1; x += st) {
    const g = base.groundTopY(x, z) - 180;
    const ch = g >= 0 && g < 16 ? g.toString(16) : g < 0 ? '-' : '+';
    s += H.has(x, z) ? ch : (process.env.UMFELD ? '.' : ' ');
  }
  console.log(s);
}
