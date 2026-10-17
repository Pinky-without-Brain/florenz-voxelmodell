'use strict';
// Hilfsskript W8c: ASCII-Schnitt eines Projekts auf Lage yr (Weltachsen x/z). Aufruf: node tools/diag/_karte_w8c.js <projekt> <yr> [x0 x1 z0 z1]
const path = require('node:path');
const fs = require('node:fs');
const ROOT = path.resolve(__dirname, '..', '..');
const { getProject } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const id = process.argv[2], yr = +process.argv[3];
const pj = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', id, 'project.json'), 'utf8'));
const world = buildWorld({ project: getProject(id, { root: ROOT }) });
const g = world.grid, Y = pj.bodenY + yr;
let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
g.forEach((x, y, z) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); });
if (process.argv[4]) { x0 = +process.argv[4]; x1 = +process.argv[5]; z0 = +process.argv[6]; z1 = +process.argv[7]; }
const sym = (t) => /stairs/.test(t) ? 'S' : /glass/.test(t) ? 'g' : /lantern/.test(t) ? 'L' : /oak|spruce/.test(t) ? 'h' : /quartz|marble/.test(t) ? 'm' : /gold/.test(t) ? '$' : '#';
console.log('x', x0, '..', x1, ' z', z0, '..', z1, ' Lage', yr);
for (let z = z0; z <= z1; z++) {
  let s = String(z).padStart(5) + ' ';
  for (let x = x0; x <= x1; x++) { const e = g.has(x, Y, z) ? g.get(x, Y, z) : null; s += e ? sym(e.type || '') : '.'; }
  console.log(s);
}
