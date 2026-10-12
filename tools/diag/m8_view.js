'use strict';
// Diagnose Modul 8: ASCII-Ansicht von Osten (u = z, v = y, Außenfläche) und Schnitt bei z = 0.
// Aufruf: node tools/diag/m8_view.js  -> build/diag/m8_ost.txt, build/diag/m8_schnitt.txt
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');
const { packKey } = require('../geom/grid.js');
const D = require('../spec/dimensions.js');

const CHARS = {
  smooth_quartz: 'q', dark_prismarine: 'g', chiseled_quartz: 'c', quartz_bricks: 'b', stone_bricks: '#',
  smooth_stone: 's', gold_block: 'G', cut_copper: 'C', white_stained_glass: 'w', terracotta: 't',
  blue_terracotta: 'B', yellow_terracotta: 'Y', quartz_pillar: 'I', polished_granite: 'r',
};
const ch = (t) => (t === undefined ? ' ' : (CHARS[t] || '?'));

const world = buildWorld({ modules: [0, 8] });
const g = world.grid;
const B = D.BAPTISTERY;
const typeAt = (x, y, z) => (g.has(x, y, z) ? g.typeOfKey(packKey(x, y, z)) : undefined);
const outDir = path.resolve(__dirname, '..', '..', 'build', 'diag');
fs.mkdirSync(outDir, { recursive: true });

// Ansicht von Osten: für jedes (z, y) die östlichste belegte Zelle des Baptisteriums
const lines = [`Ansicht von Osten (u = z von ${-B.outerHalfFlat - 2} bis ${B.outerHalfFlat + 2}, v = y von 140 bis 64)`];
for (let y = 140; y >= 64; y--) {
  let row = String(y).padStart(3) + ' ';
  for (let z = -B.outerHalfFlat - 2; z <= B.outerHalfFlat + 2; z++) {
    let t;
    for (let x = B.centerX + B.outerHalfFlat + 2; x >= B.centerX - B.outerHalfFlat - 2 && t === undefined; x--) t = typeAt(x, y, z);
    row += ch(t);
  }
  lines.push(row);
}
fs.writeFileSync(path.join(outDir, 'm8_ost.txt'), lines.join('\n') + '\n');

// Schnitt z = 0
const sec = ['Schnitt z = 0 (x -350..-270, y 140 bis 60)'];
for (let y = 140; y >= 60; y--) {
  let row = String(y).padStart(3) + ' ';
  for (let x = -350; x <= -270; x++) row += ch(typeAt(x, y, 0));
  sec.push(row);
}
sec.push('    ' + Array.from({ length: 81 }, (_, i) => ((-350 + i) % 10 === 0 ? '|' : ' ')).join('') + '  (| = x durch 10 teilbar)');
fs.writeFileSync(path.join(outDir, 'm8_schnitt.txt'), sec.join('\n') + '\n');
console.log('geschrieben:', path.join(outDir, 'm8_ost.txt'), path.join(outDir, 'm8_schnitt.txt'));
