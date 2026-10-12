'use strict';
// Diagnose: ASCII-Draufsicht von Modul 0 auf Y 64 (jede 4. Zelle) nach build/diag/m0_plan.txt
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');
const { LEVELS } = require('../spec/dimensions.js');

const STEP = 4;
const CHARS = {
  krypta_grube: 'K', boden_langhaus: 'L', boden_vierung: 'V', boden_tribune_nord: 'N',
  boden_tribune_ost: 'O', boden_tribune_sued: 'S', boden_campanile: 'C', boden_baptisterium: 'B'
};
const world = buildWorld({ modules: [0] });
const grid = world.grid;
const b = grid.bounds();
const x0 = Math.floor(b.minX / STEP) * STEP, x1 = b.maxX;
const z0 = Math.floor(b.minZ / STEP) * STEP, z1 = b.maxZ;
const lines = [`Modul 0, Lage Y ${LEVELS.floorY}, jede ${STEP}. Zelle (Spalten X ${x0}..${x1}, Zeilen Z ${z0}..${z1}, +X rechts, +Z unten)`,
  'L Langhaus, V Vierung, N/O/S Tribunen, C Campanile, B Baptisterium, . leer', ''];
for (let z = z0; z <= z1; z += STEP) {
  let row = String(z).padStart(5) + ' ';
  for (let x = x0; x <= x1; x += STEP) {
    const c = grid.get(x, LEVELS.floorY, z);
    row += c ? (CHARS[c.part] || '?') : '.';
  }
  lines.push(row);
}
const out = path.join(__dirname, '..', '..', 'build', 'diag', 'm0_plan.txt');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join('\n') + '\n');
console.log(lines.join('\n'));
