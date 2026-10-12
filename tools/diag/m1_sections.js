'use strict';
// Diagnose: ASCII-Schnitte durch Modul 1 nach build/diag/m1_quer.txt und m1_laengs.txt
//   Querschnitt bei x = −155 (Mitte Joch 2), z −50..50, y 60..160, volle Auflösung
//   Längsschnitt bei z = 0 und z = 30, jede 2. Zelle in x
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');

const CHARS = {
  aussenwand_nord: 'W', aussenwand_sued: 'W', wandvorlagen: 'l', pfeiler: 'P', arkaden: 'A',
  seitenschiff_gewoelbe: 'g', hochschiffwand: 'H', mittelschiff_gewoelbe: 'G', gesimse: 'c',
  dach_seitenschiffe: 'd', dach_mittelschiff: 'D'
};
const TYPE_CHARS = {
  white_stained_glass: '~', yellow_stained_glass: 'o', orange_stained_glass: 'o', cut_copper: 'T',
  chiseled_quartz: 'q', polished_andesite: 'a'
};
const LEGEND = 'W Außenwand, l Lisene, P Pfeiler, A Arkade, g Seitenschiffgewölbe, H Hochschiffwand, ' +
  'G Mittelschiffgewölbe, c Gesims, d Dach Seitenschiff, D Dach Mittelschiff; ~ Fensterglas, o Oculusglas, ' +
  'T Bronzetür, q Gemeißelter Quarz (Laibung/Rahmen/Wimperg), a Andesit (Kapitell, Rippen), . leer';

const world = buildWorld({ modules: [1] });
const grid = world.grid;
const sym = (c, partsOnly) => {
  if (!c) return '.';
  if (!partsOnly && TYPE_CHARS[c.type]) return TYPE_CHARS[c.type];
  return CHARS[c.part] || '?';
};

function section(title, xs, ys, zs, at) {
  const lines = [title, LEGEND, ''];
  const head = (vals, step) => {
    let h = '';
    for (let i = 0; i < vals.length; i++) h += (i % step === 0) ? '|' : ' ';
    return h;
  };
  for (let y = ys[1]; y >= ys[0]; y--) {
    let row = String(y).padStart(4) + ' ';
    for (const a of (xs || zs)) {
      const c = xs ? grid.get(a, y, at) : grid.get(at, y, a);
      row += sym(c, false);
    }
    lines.push(row);
  }
  const axis = xs || zs;
  let lab = '     ';
  for (let i = 0; i < axis.length; i++) lab += (i % 10 === 0) ? '|' : ' ';
  lines.push(lab);
  let nums = '     ';
  for (let i = 0; i < axis.length; i += 10) nums += String(axis[i]).padEnd(10);
  lines.push(nums);
  return lines.join('\n');
}

const range = (a, b, step = 1) => { const r = []; for (let v = a; v <= b; v += step) r.push(v); return r; };

const quer = section('Querschnitt bei x = −155 (Mitte Joch 2), Blick nach Osten; Spalten z −50..50 (links Nord), Zeilen y 160..60',
  null, [60, 160], range(-50, 50), -155);
const l0 = section('Längsschnitt bei z = 0, jede 2. Zelle in x (−216..−50, links Westen), y 160..60',
  range(-216, -50, 2), [60, 160], null, 0);
const l30 = section('Längsschnitt bei z = 30 (Seitenschiff Süd), jede 2. Zelle in x (−216..−50), y 160..60',
  range(-216, -50, 2), [60, 160], null, 30);

const outDir = path.join(__dirname, '..', '..', 'build', 'diag');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'm1_quer.txt'), quer + '\n');
// Zusatzschnitte: Pfeilerachse/Arkaden (z 19), Schiffgewölbe seitlich der Scheitellinie (z 10, z 26), Glasebene (z 40)
const lx = (z, what) => section(`Längsschnitt bei z = ${z} (${what}), jede 2. Zelle in x (−216..−50), y 160..60`,
  range(-216, -50, 2), [60, 160], null, z);
fs.writeFileSync(path.join(outDir, 'm1_laengs.txt'),
  [l0, l30, lx(19, 'Pfeilerachse, Arkadenwand'), lx(10, 'Mittelschiffgewölbe seitlich der Scheitellinie'),
    lx(26, 'Seitenschiffgewölbe seitlich der Scheitellinie'), lx(40, 'Mittelebene der Südwand: Fenster, Portal')]
    .join('\n\n') + '\n');
console.log(quer);
