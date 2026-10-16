'use strict';
// Palazzo des Complesso di San Firenze (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/san_firenze/): Konvent der Filippini
// (1745–49, Giovanni Filippo Ciocchi mit Zanobi del Rosso), später Tribunale, mit zwei Höfen; zwischen der Kirche San Filippo
// Neri (Nordost) und dem Oratorium (Süd). Bauplan aus tools/wahrzeichen/palazzo.js; Kirche und Oratorium: _kb.js.
// Rahmen SF (theta −75,2°): u entlang der Fassade zur Piazza San Firenze (von Süden nach Norden), w von der Fassade nach Osten.
// Lagen yr = Y − 62. Geschosse (OSM: 4 Geschosse, 30 Blöcke): EG 9, 1. OG 8, 2. OG 7, 3. OG 6.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const DIR = path.resolve(__dirname, '..');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
const SAND = WZ.typ('putz_sand'), SERENA = WZ.typ('pietra_serena'), FORTE = WZ.typ('pietra_forte');

let nachbarn = null;
/** Zelle der Palastmaske grenzt (Umkreis 2) an Kirche oder Oratorium: dort gibt es keine Fenster. */
function anBauKoerper(c) {
  if (!nachbarn) { const M = WZ.ladeMasken(PJ, { dir: DIR }).masken; nachbarn = [M.kirche, M.oratorium]; }
  for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (const m of nachbarn) if (m.has(c.x + dx, c.z + dz)) return true;
  return false;
}

const PZ = palazzo({
  dir: DIR,
  geschosse: [9, 8, 7, 6],
  dach: { art: 'walm', hoehe: 5 },
  hof: { tiefe: 3, joch: 6.5, kaempfer: 6, mitArkaden: [0] },
  fenster: { abstand: 9, breite: 3, sohle: [3, 2, 2, 2], hoehe: [4, 4, 3, 3], bifora: [false, false, false, false], aus: anBauKoerper },
  material: (s, c, yr, i) => (i.kranz || i.gesims ? SERENA : i.sockel || (c.w < 2.5 && yr <= 3) ? FORTE : SAND),
  hofMaterial: (s) => (s === 0 ? SERENA : SAND),
  portale: [],
  treppe: RAUM.TREPPE,
  innenwandTuer: RAUM.innenwandTuer,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: { vorher: RAUM.vorher, oeffnungen: RAUM.oeffnungen }
});
module.exports = PZ;
