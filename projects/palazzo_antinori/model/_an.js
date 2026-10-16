'use strict';
// Palazzo Antinori (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_antinori/): Giuliano da Maiano zugeschrieben, 1461–69 (neuere Studie:
// ab 1463, vollendet 1472), nach dem Vorbild des Palazzo Medici. Glatte Bugnato im Erdgeschoss, zwei Geschosse mit Rundbogenfenstern, stark
// vorspringendes Kranzgesims, Hof mit Portikus, im Westen das frühere Haus der Via delle Belle Donne (Stallungen).
// Rahmen AN an der Fassade zur Piazza degli Antinori (Via degli Antinori): u entlang der Fassade nach Westen, w von der Fassade nach Norden.
// Lagen yr = Y - 63. Geschosse nach OSM (23 Blöcke bis zur Traufe).
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const RUSTIKA = WZ.typ('pietra_forte_rustika'), FORTE = WZ.typ('pietra_forte'), ORN = WZ.typ('marmor_ornament');
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [8, 8, 7],
  dach: { art: 'walm', hoehe: 4 },
  hof: { tiefe: 3, joch: 4, kaempfer: 6, minZellen: 50 },
  fenster: RAUM.FENSTER,
  material: (s, c, yr, i) => (i.kranz || i.gesims ? ORN : (s === 0 ? (yr % 2 === 0 ? RUSTIKA : FORTE) : FORTE)),
  portale: RAUM.PORTALE,
  treppe: RAUM.TREPPE,
  innenwandTuer: RAUM.innenwandTuer,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten }
});
module.exports = PZ;
