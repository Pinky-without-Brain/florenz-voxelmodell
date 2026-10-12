'use strict';
// Diagnose Modul 3: ASCII-Draufsichten (Y 70, 95, 120, 148; -100..100, jede 2. Zelle) und Schnitt z = 0
// (x -60..100, y 60..150). Ausgabe nach build/diag/m3_plan.txt und build/diag/m3_schnitt.txt.
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');

const CHARS = {
  vierung_wand: 'W', vierung_gesims: 'G', sakristei_tueren: 'T',
  tribune_nord_mauern: 'a', tribune_nord_gewoelbe: 'b', tribune_nord_obergaden: 'c', tribune_nord_daecher: 'd',
  tribune_ost_mauern: 'e', tribune_ost_gewoelbe: 'f', tribune_ost_obergaden: 'g', tribune_ost_daecher: 'h',
  tribune_sued_mauern: 'i', tribune_sued_gewoelbe: 'j', tribune_sued_obergaden: 'k', tribune_sued_daecher: 'l',
  eckbauten: 'E', exedra_sockel: 'X'
};
const LEGEND = 'W Vierungswand, G Gesims, T Sakristeitüren, a-d Nordtribune (Mauern, Gewölbe, Obergaden, Dächer), ' +
  'e-h Osttribune, i-l Südtribune, E Eckbauten, X Exedra-Sockel, # Fußboden (Modul 0), . leer';

const world = buildWorld({ modules: [0, 3] });
const grid = world.grid;
const charAt = (x, y, z) => {
  const c = grid.get(x, y, z);
  if (!c) return '.';
  if (c.module === 0) return '#';
  return CHARS[c.part] || '?';
};

const outDir = path.join(__dirname, '..', '..', 'build', 'diag');
fs.mkdirSync(outDir, { recursive: true });

const STEP = 2;
const plan = [];
for (const y of [70, 95, 120, 148]) {
  plan.push(`Modul 3, Lage Y ${y}, jede ${STEP}. Zelle, Spalten X -100..100 (+X rechts), Zeilen Z -100..100 (+Z unten)`);
  plan.push(LEGEND);
  for (let z = -100; z <= 100; z += STEP) {
    let row = String(z).padStart(5) + ' ';
    for (let x = -100; x <= 100; x += STEP) row += charAt(x, y, z);
    plan.push(row);
  }
  plan.push('');
}
fs.writeFileSync(path.join(outDir, 'm3_plan.txt'), plan.join('\n'));

const sect = [`Schnitt z = 0, X -60..100 (+X rechts), Y 150..60 (oben nach unten), jede Zelle`, LEGEND];
for (let y = 150; y >= 60; y--) {
  let row = String(y).padStart(4) + ' ';
  for (let x = -60; x <= 100; x++) row += charAt(x, y, 0);
  sect.push(row);
}
fs.writeFileSync(path.join(outDir, 'm3_schnitt.txt'), sect.join('\n') + '\n');
console.log('geschrieben: build/diag/m3_plan.txt, build/diag/m3_schnitt.txt');
