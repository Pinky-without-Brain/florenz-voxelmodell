'use strict';
// Diagnose Modul 7: ASCII-Ostansicht (u = z, v = y) nach build/diag/m7_ost.txt
// und Draufsichten bei Y 110, 140, 200, 226 nach build/diag/m7_plan.txt.
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');
const D = require('../spec/dimensions.js');

const CX = D.CAMPANILE.centerX, CZ = D.CAMPANILE.centerZ;
const MAT = {
  smooth_quartz: 'q', quartz_bricks: 'b', chiseled_quartz: 'c', quartz_pillar: 'I', calcite: 'k',
  dark_prismarine: 'g', polished_granite: 'r', stone_bricks: 's', smooth_stone: 'S', polished_andesite: 'a',
  dark_oak_planks: 'w', cut_copper: 'K', gold_block: 'G', polished_deepslate: 'd'
};

const world = buildWorld({ modules: [0, 7] });
if (world.errors.length) { console.error(world.errors); process.exit(1); }
const grid = world.grid;
const R = 15;
const lines = [];

// Ostansicht: je (z, y) die Zelle mit größtem x (Außenfläche) von Modul 7
lines.push(`Ostansicht Campanile: Spalten z ${CZ - R}..${CZ + R} (u = z - ${CZ}), Zeilen y 233..65, Außenfläche (größtes x)`);
lines.push('q glatter Quarz, b Quarzziegel, c gemeißelter Quarz, I Quarzsäule, k Calcit, g Prismarin, r Granit, s Steinziegel,');
lines.push('S glatter Stein, a Andesit, w Eiche, K Kupfer, G Gold, d Tiefenschiefer, . leer');
lines.push('      ' + Array.from({ length: 2 * R + 1 }, (_, i) => (Math.abs(i - R) % 5 === 0 ? String(Math.abs(i - R) % 10) : ' ')).join(''));
for (let y = D.CAMPANILE.topY; y >= 65; y--) {
  let row = String(y).padStart(4) + '  ';
  for (let z = CZ - R; z <= CZ + R; z++) {
    let ch = '.';
    for (let x = CX + R; x >= CX - R; x--) {
      const c = grid.get(x, y, z);
      if (c && c.module === 7) { ch = MAT[c.type] || '?'; break; }
    }
    row += ch;
  }
  lines.push(row);
}
const diagDir = path.join(__dirname, '..', '..', 'build', 'diag');
fs.mkdirSync(diagDir, { recursive: true });
fs.writeFileSync(path.join(diagDir, 'm7_ost.txt'), lines.join('\n') + '\n');

// Draufsichten (Zeichen nach Bauteil), x nach rechts, z nach unten
const PART = {
  sockel_reliefs: 'W', eingangstuer: 'T', nischengeschoss: 'W', biforien_1: 'W', biforien_2: 'W', triforien: 'W',
  glockenstuhl: 'B', kranz_konsolenfries: 'F', terrassenboden: 'D', bruestung_und_fialen: 'P'
};
const plan = [];
for (const y of [110, 140, 200, 226]) {
  plan.push(`Lage Y ${y} (x ${CX - R}..${CX + R} nach rechts, z ${CZ - R}..${CZ + R} nach unten)`);
  plan.push('W Wand, T Tür, S Treppe, D Decke/Boden, B Balken, K Glocke (Kupfer), d Klöppel, F Kranz, P Brüstung, . leer');
  for (let z = CZ - R; z <= CZ + R; z++) {
    let row = '';
    for (let x = CX - R; x <= CX + R; x++) {
      const c = grid.get(x, y, z);
      let ch = '.';
      if (c && c.module === 7) {
        if (c.part.startsWith('treppe')) ch = 'S';
        else if (c.part.startsWith('zwischendecke')) ch = 'D';
        else if (c.part === 'glockenstuhl') ch = c.type === 'cut_copper' ? 'K' : (c.type === 'polished_deepslate' ? 'd' : 'B');
        else ch = PART[c.part] || '?';
      }
      row += ch;
    }
    plan.push(row);
  }
  plan.push('');
}
fs.writeFileSync(path.join(diagDir, 'm7_plan.txt'), plan.join('\n'));
console.log(lines.join('\n'));
console.log(plan.join('\n'));
