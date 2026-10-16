'use strict';
// Palazzo Bartolini Salimbeni (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_bartolini_salimbeni/): Baccio d'Agnolo 1520–23 für
// Giovanni Bartolini, erster Florentiner Palast „alla romana“. Pietra forte zur Piazza di Santa Trinita, Pietra serena zur Via Porta Rossa,
// Kreuzfenster, rustizierte Ecken, Kranzgesims, Hof mit Portikus.
// Rahmen BS an der Ostkante (Piazza di Santa Trinita): u entlang der Piazzafassade von Nord nach Süd, w von der Fassade nach Westen.
// Lagen yr = Y - 62. Geschosse nach OSM-Schätzung (30 Blöcke bis zur Traufe).
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const RUSTIKA = WZ.typ('pietra_forte_rustika'), FORTE = WZ.typ('pietra_forte'), SERENA = WZ.typ('pietra_serena'), ORN = WZ.typ('marmor_ornament');
const eck = (c) => (c.u < 4 || c.u > 38) && (c.w < 4 || c.w > 66);                    // rustizierte Ecken (Stufe C)
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [11, 10, 9],
  dach: { art: 'walm', hoehe: 3 },
  hof: { tiefe: 3, joch: 4, kaempfer: 6, minZellen: 50 },
  fenster: RAUM.FENSTER,
  material: (s, c, yr, i) => {
    if (i.kranz || i.gesims) return ORN;
    if (eck(c)) return RUSTIKA;
    if (c.w < 4) return yr % 4 === 0 ? SERENA : FORTE;                                  // Piazza: Pietra forte
    return yr % 4 === 0 ? FORTE : SERENA;                                               // Via Porta Rossa und Via delle Terme: Pietra serena
  },
  portale: RAUM.PORTALE,
  treppe: RAUM.TREPPE,
  innenwandTuer: RAUM.innenwandTuer,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten }
});
module.exports = PZ;
