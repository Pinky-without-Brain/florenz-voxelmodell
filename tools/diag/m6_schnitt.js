'use strict';
// Diagnose Modul 6: ASCII-Schnitt z = 0 (x -20..20, y 240..295), Blockzahl je Bauteil, einige Lagen.
// Aufruf: node tools/diag/m6_schnitt.js  ->  build/diag/m6_schnitt.txt
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');

const world = buildWorld({ modules: [0, 1, 2, 3, 4, 5, 6] });
const mod = world.modules.find((m) => m.module === 6);
const SYM = { smooth_quartz: '#', chiseled_quartz: '%', quartz_pillar: 'I', white_stained_glass: 'o', gold_block: 'G' };
const perPart = [];
for (const p of mod.parts) {
  perPart.push(`${p.id}: ${p.keys.length}`);
}
const cells = new Map();
world.grid.forEach((x, y, z, e) => { if (e.module === 6) cells.set(x + ',' + y + ',' + z, e.type); });
const ch = (x, y, z) => {
  const t = cells.get(x + ',' + y + ',' + z);
  return t ? (SYM[t] || '?') : (x === 0 ? '|' : '.');
};
const out = [];
out.push('Modul 6, Schnitt z = 0 (x -20..20, y 240..295). # smooth_quartz, % chiseled_quartz, I quartz_pillar, o Glas, G Gold');
for (let y = 295; y >= 240; y--) {
  let s = String(y).padStart(4) + ' ';
  for (let x = -20; x <= 20; x++) s += ch(x, y, 0);
  out.push(s);
}
out.push('', 'Blöcke je Bauteil: ' + perPart.join(', '));
for (const y of [247, 248, 255, 260, 266, 272]) {
  out.push('', 'Lage Y ' + y + ' (x waagerecht, z senkrecht)');
  for (let z = -15; z <= 15; z++) {
    let s = '';
    for (let x = -15; x <= 15; x++) s += ch(x, y, z);
    out.push(s);
  }
}
const dir = path.resolve(__dirname, '..', '..', 'build', 'diag');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'm6_schnitt.txt'), out.join('\n') + '\n');
console.log(out.slice(0, 58).join('\n'));
console.log(perPart.join('\n'));
