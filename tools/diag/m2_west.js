'use strict';
// Diagnose: ASCII-Ansicht der Westfassade (u = z, v = y; je (z,y) die Zelle mit kleinstem x)
// und der Innenseite x −213 (Uhr). Ausgabe: build/diag/m2_west.txt
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');

const CH = {
  polished_granite: 'g', dark_prismarine: 'p', smooth_quartz: 'q', chiseled_quartz: 'Q', stone_bricks: 's',
  smooth_stone: 'S', cut_copper: 'T', gold_block: 'G', blue_terracotta: 'b', white_terracotta: 'w',
  black_concrete: '#', blue_stained_glass: '~', orange_stained_glass: 'o', yellow_stained_glass: 'y', calcite: 'c'
};
const world = buildWorld({ modules: [2] });
const grid = world.grid;
const ch = (c) => (c ? (CH[c.type] || '?') : '.');
const out = ['Westfassade von Westen (links Nord z −44, rechts Süd z +44), Zeilen y 164..65; Zelle mit kleinstem x', 
  'g Granit, p dunkler Prismarin, q Quarz, Q gemeißelter Quarz, s Steinziegel, S glatter Stein, T Bronzetür, G Gold, b Blau, o/y Glas, c Calcit, . leer', ''];
for (let y = 164; y >= 65; y--) {
  let row = String(y).padStart(4) + ' ';
  for (let z = -44; z <= 44; z++) {
    let c = null;
    for (let x = -216; x <= -213 && !c; x++) c = grid.get(x, y, z);
    row += ch(c);
  }
  out.push(row);
}
out.push('', 'Innenseite x −213, Uhr (z −12..12, y 120..98), Kartenansicht wie oben, links z −12 (Nord)', '');
for (let y = 120; y >= 98; y--) {
  let row = String(y).padStart(4) + ' ';
  for (let z = -12; z <= 12; z++) row += ch(grid.get(-213, y, z));
  out.push(row);
}
const file = path.join(__dirname, '..', '..', 'build', 'diag', 'm2_west.txt');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, out.join('\n') + '\n');
console.log(out.join('\n'));
