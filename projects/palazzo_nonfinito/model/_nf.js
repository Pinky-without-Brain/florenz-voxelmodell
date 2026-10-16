'use strict';
// Palazzo Nonfinito (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_nonfinito/): Palast der Strozzi, ab 1593 nach Bernardo
// Buontalenti (Erdgeschoss mit Kniefenstern und Rustika), von Scamozzi und Caccini weitergeführt (Obergeschoss mit Pilastern
// in Kolossalordnung), Hof von Cigoli, unvollendet; seit 1924 Museo di Antropologia e Etnologia.
// Rahmen NF: u entlang der Fassade zur Via del Proconsolo (Süd → Nord, 0..97), w von dieser Fassade nach Osten (0..110);
// die Fassade zum Borgo degli Albizi liegt bei u 0. Lagen yr = Y − 66. Geschosse: EG 10, Piano nobile 13 (Summe 23 wie OSM).
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const ABST = 13.5, VERSATZ = 1.75;                          // Fensterachsen bei 8,5 + 13,5 k (Portale in der Mitte bei 49)
const RUSTIKA = WZ.typ('pietra_forte_rustika'), SERENA = WZ.typ('pietra_serena'), PUTZ = WZ.typ('putz_ocker'), FORTE = WZ.typ('pietra_forte');
const proconsolo = (c) => c.w < 1.6, albizi = (c) => c.u < 1.6;
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [10, 13],
  dach: { art: 'walm', hoehe: 3 },
  hof: { tiefe: 3, joch: 6, kaempfer: 7, mitArkaden: [1] },
  fenster: {
    abstand: ABST, breite: 3, sohle: [2, 4], hoehe: [7, 7], bifora: [false, false], versatz: VERSATZ, bogen: false,
    aus: (c) => (c.w < 4 && Math.abs(c.u - 49) < 7) || (c.u < 4 && (c.w < 15 || c.w > 82 || Math.abs(c.w - 49) < 7))   // Portalachsen, Eckfelder der Albizi-Seite
  },
  material: (s, c, yr, i) => {
    if (i.kranz || i.gesims) return SERENA;
    const fassade = proconsolo(c) || albizi(c);
    const ecke = c.u < 4 && c.w < 4;                          // monumentale Eckpilaster
    if (fassade && ecke) return SERENA;
    if (fassade && s === 0) return RUSTIKA;                   // Buontalentis glatte Rustika
    if (proconsolo(c) && s === 1) {                           // Piano nobile: Pilaster der Kolossalordnung zwischen den Fenstern
      const r = (((c.u - VERSATZ) % ABST) + ABST) % ABST;
      if (r < 1.8 || r > ABST - 1.8) return SERENA;
    }
    return fassade ? PUTZ : (yr % 6 === 0 ? FORTE : PUTZ);
  },
  portale: [],
  treppe: RAUM.TREPPE,
  innenwandTuer: RAUM.innenwandTuer,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: { oeffnungen: RAUM.oeffnungen, nachher: RAUM.nachher }
});
module.exports = Object.assign(PZ, { ABST, VERSATZ });
