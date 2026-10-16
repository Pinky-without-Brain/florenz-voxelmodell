'use strict';
// Palazzo Gondi (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_gondi/): Giuliano da Sangallo ab 1490.
// Rahmen GN an der Ostkante (Piazza San Firenze): u entlang der Fassade von Nord nach Süd, w von der Fassade nach Westen.
// Lagen yr = Y - 63. Geschosse nach OSM (23 Blöcke bis zur Traufe).
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const RUSTIKA = WZ.typ('pietra_forte_rustika'), FORTE = WZ.typ('pietra_forte'), SERENA = WZ.typ('pietra_serena');
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [9, 7, 7],
  dach: { art: 'walm', hoehe: 4 },
  hof: { tiefe: 3, joch: 4, kaempfer: 6, minZellen: 50 },
  fenster: { abstand: 10, breite: 4, versatz: 23.7, sohle: [3, 2, 2], hoehe: [3, 3, 4], bifora: [false, true, true] },
  material: (s, c, yr, i) => (i.gesims || i.kranz ? SERENA : (s === 0 ? (yr % 3 === 0 ? FORTE : RUSTIKA) : s === 1 ? (yr % 4 === 0 ? FORTE : RUSTIKA) : (yr % 6 === 0 ? RUSTIKA : FORTE))),
  portale: RAUM.PORTALE,
  treppe: RAUM.TREPPE,
  innenwandTuer: RAUM.innenwandTuer,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: { vorher: RAUM.vorher }
});
module.exports = PZ;
