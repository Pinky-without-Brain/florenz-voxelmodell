'use strict';
// Hilfsskript W8c: Draufsicht der höchsten Blöcke (Lage über bodenY, Hexziffer; Palazzina Buchstaben, Stufen S) des Forte di Belvedere. Aufruf: node tools/diag/_forte_top_w8c.js [schritt]
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const { getProject } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const project = getProject('forte_belvedere', { root: ROOT });
const world = buildWorld({ project });
const g = world.grid;
const BY = project.json.bodenY;
const top = new Map();
g.forEach((x, y, z, e) => { const k = x + ',' + z; const t = top.get(k); if (!t || y > t.y) top.set(k, { y, type: e.type, part: e.part }); });
const st = +(process.argv[2] || 4);
for (let z = 2040; z <= 2445; z += st) {
  let s = String(z).padStart(5) + ' ';
  for (let x = -620; x <= -305; x += st) {
    const t = top.get(x + ',' + z);
    if (!t) { s += ' '; continue; }
    const yr = t.y - BY;
    s += /stairs/.test(t.type) ? 'S' : t.part && t.part.startsWith('pal_') ? String.fromCharCode(97 + Math.max(0, Math.min(25, yr))) : (yr < 0 ? '-' : yr.toString(16));
  }
  console.log(s);
}
