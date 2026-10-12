'use strict';
// Diagnose Modul 9: Draufsichten Krypta Y 57 / Y 60 (x -210..-130, z -30..30) und Chorschranke Y 66 (-24..24).
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');

const CHARS = {
  krypta_mauern: 'M', krypta_boden: 'b', krypta_stuetzen: 'S', brunelleschi_grab: 'G',
  chorschranke: 'C', hochaltar: 'A'
};
const world = buildWorld({ modules: [0, 9] });
const grid = world.grid;
const charAt = (x, y, z) => {
  const c = grid.get(x, y, z);
  if (!c) return '.';
  if (c.module === 0) return c.part === 'krypta_grube' ? '#' : 'f';
  const ch = CHARS[c.part] || '?';
  return c.part === 'krypta_boden' ? (c.type === 'red_terracotta' ? 'r' : 'w') : (c.type === 'gold_block' ? '$' : ch);
};
const LEGEND = 'M Mauer, r/w Mosaik rot/weiß, S Stütze, G Grabplatte, $ Gold, C Chorschranke, A Hochaltar, # Grube (M0), f Boden (M0), . leer';
const outDir = path.join(__dirname, '..', '..', 'build', 'diag');
fs.mkdirSync(outDir, { recursive: true });

function plan(y, x0, x1, z0, z1) {
  const out = [`Modul 9, Lage Y ${y}, X ${x0}..${x1} (+X rechts), Z ${z0}..${z1} (+Z unten)`, LEGEND];
  for (let z = z0; z <= z1; z++) {
    let row = String(z).padStart(4) + ' ';
    for (let x = x0; x <= x1; x++) row += charAt(x, y, z);
    out.push(row);
  }
  return out.join('\n') + '\n';
}
fs.writeFileSync(path.join(outDir, 'm9_krypta_y57.txt'), plan(57, -210, -130, -30, 30));
fs.writeFileSync(path.join(outDir, 'm9_krypta_y60.txt'), plan(60, -210, -130, -30, 30));
fs.writeFileSync(path.join(outDir, 'm9_chorschranke_y66.txt'), plan(66, -24, 24, -24, 24));
console.log('geschrieben: build/diag/m9_krypta_y57.txt, m9_krypta_y60.txt, m9_chorschranke_y66.txt');
