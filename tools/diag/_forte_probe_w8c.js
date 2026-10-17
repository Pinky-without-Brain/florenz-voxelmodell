'use strict';
// Hilfsskript W8c: Sonde im Forte-Modell. Aufruf: node tools/diag/_forte_probe_w8c.js x z [yr0 yr1]  -> Säule (Blocktyp und Teil) und Erreichbarkeit der Stehzellen.
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const [x, z, a, b] = process.argv.slice(2).map(Number);
const project = getProject(process.env.PROJ || 'forte_belvedere', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const BY = project.json.bodenY;
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
const r = laufe(ctx, 'r13').einheiten[0];
for (let yr = (a === undefined ? -2 : a); yr <= (b === undefined ? 9 : b); yr++) {
  const y = BY + yr;
  const e = grid.has(x, y, z) ? grid.get(x, y, z) : null;
  const stand = grid.has(x, y - 1, z) && !grid.has(x, y, z) && !grid.has(x, y + 1, z) && !grid.has(x, y + 2, z);
  console.log('yr', yr, e ? `${e.type} [${e.part}]` : '-', stand ? 'stehbar ' + (r.erreicht(x, y, z) ? 'erreichbar' : 'NICHT erreichbar') : '');
}
