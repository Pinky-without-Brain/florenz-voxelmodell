'use strict';
// Hilfsskript W8c: Erreichbarkeit der Hoffläche, der Wallkrone und der Plattformen im Forte di Belvedere. Aufruf: node tools/diag/_forte_reach_w8c.js
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const FB = require('../../projects/forte_belvedere/model/_fb.js');
const project = getProject('forte_belvedere', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
const r = laufe(ctx, 'r13').einheiten[0];
const D = FB.lade();
const Y = FB.Y;
const stehbar = (x, y, z) => grid.has(x, y - 1, z) && !grid.has(x, y, z) && !grid.has(x, y + 1, z) && !grid.has(x, y + 2, z);
const z = { hof: [0, 0], krone: [0, 0], plattform: [0, 0], absatz: [0, 0] };
const bsp = [];
for (const c of D.alle) {
  if (c.zone === 'pal') continue;
  let art, y;
  if (c.zone === 'hof' && !c.bastion) { art = 'hof'; y = Y(1); }
  else if (c.zone === 'hof') { art = 'plattform'; y = Y(FB.CROWN + 1); }
  else if (c.d8 >= 4) { art = 'krone'; y = Y(FB.CROWN + 1); }
  else continue;
  if (!stehbar(c.x, y, c.z)) continue;
  z[art][0]++;
  if (r.erreicht(c.x, y, c.z)) z[art][1]++; else if (bsp.length < 400) bsp.push([art, c.x, c.z]);
}
console.log('Stehzellen gesamt / erreichbar:', JSON.stringify(z));
const gr = {};
for (const [a, x, zz] of bsp) { const k = a + ' ' + Math.round(x / 40) * 40 + ',' + Math.round(zz / 40) * 40; gr[k] = (gr[k] || 0) + 1; }
console.log('nicht erreichbar (Beispiele nach Gebiet):', JSON.stringify(gr));
console.log('Treppen Hof->Krone:', D.treppen ? D.treppen.length : '?', JSON.stringify((D.treppen || []).map((t) => [t.x, t.z, t.dir])));
