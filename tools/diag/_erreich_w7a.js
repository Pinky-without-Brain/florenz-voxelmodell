'use strict';
// Hilfsskript W7a: Erreichbarkeit der Stehzellen eines Bauteils. Aufruf: node tools/diag/_erreich_w7a.js <projekt-id> <modul-datei _xx> <teil> <lage-boden>
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const [id, kz, teil, yr] = process.argv.slice(2);
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const PZ = require(path.join(ROOT, 'projects', id, 'model', kz + '.js'));
const project = getProject(id, { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const r = laufe({ project, world, grid, ground: loadSpecs(project).ground, root: ROOT }, 'r13').einheiten[0];
const D = PZ.lade();
let ok = 0, nein = 0;
grid.forEach((x, y, z, e) => {
  if (e.part !== teil || y !== PZ.Y(+yr) || grid.has(x, y + 1, z) || grid.has(x, y + 2, z) || grid.has(x, y + 3, z)) return;
  const c = D.byKey.get(x + ',' + z);
  if (r.erreicht(x, y + 1, z)) ok++;
  else { nein++; if (nein <= 15) console.log('nicht erreichbar', x, y + 1, z, c ? 'u ' + c.u.toFixed(1) + ' w ' + c.w.toFixed(1) : ''); }
});
console.log('erreichbar', ok, 'nicht', nein);
