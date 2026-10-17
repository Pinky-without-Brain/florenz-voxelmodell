'use strict';
// Hilfsskript W7a: Stehzellen ohne Seelaterne im Umkreis 12 je Geschoss. Aufruf: node tools/diag/_licht_w7a.js <projekt-id> <modul-datei _xx>
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const [id, kz] = process.argv.slice(2);
const { getProject } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const PZ = require(path.join(ROOT, 'projects', id, 'model', kz + '.js'));
const grid = buildWorld({ project: getProject(id, { root: ROOT }) }).grid;
const D = PZ.lade(), Y = PZ.Y;
const lichter = [];
grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
for (let s = 0; s < PZ.BASIS.length - 1; s++) {
  const y = Y(PZ.BASIS[s]);
  for (const c of D.haupt) {
    if (hof.has(c.x + ',' + c.z) || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
    let best = Infinity;
    for (const [lx, ly, lz] of lichter) if (ly === y) best = Math.min(best, Math.hypot(lx - c.x, lz - c.z));
    if (best > 12.01) console.log('Geschoss', s, c.x + ',' + c.z, 'u', c.u.toFixed(1), 'w', c.w.toFixed(1), 'nächste Laterne', best.toFixed(1));
  }
}
