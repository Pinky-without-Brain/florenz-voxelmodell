'use strict';
// Loggia dei Servi di Maria (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/loggia_dei_servi/): Portikus an der Nordwestseite der
// Piazza Santissima Annunziata nach Antonio da Sangallo d. Ä. und Baccio d'Agnolo (1516–25), Gegenstück zur Loggia des
// Spedale degli Innocenti; dahinter der Hauskomplex (heute Hotel). Rahmen LS: u entlang der Loggia (Nordost → Südwest),
// w von der Piazza ins Gebäude. Lagen yr = Y − 69. Geschosse: Portikus 12, Obergeschoss 11 (Summe 23 wie OSM-Höhe).
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const JOCH = 11, BOEGEN = 9, U0 = 11, TIEFE = 9;            // neun Bögen mit Mitten bei u 11, 22 … 99 (Jochzahl Stufe C)
const PUTZ = WZ.typ('putz_weiss'), SERENA = WZ.typ('pietra_serena'), BRUCH = WZ.typ('pietra_forte_bruch'), TERRA = WZ.typ('putz_terrakotta');
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [12, 11],
  dach: { art: 'walm', hoehe: 4 },
  hof: { tiefe: 0, joch: 6, kaempfer: 7, minZellen: 150 },
  fenster: { abstand: JOCH, breite: 3, sohle: [3, 3], hoehe: [6, 6], bifora: [false, false], versatz: U0 - JOCH / 2 },
  portikus: { test: (c) => c.w < TIEFE && c.u >= U0 - JOCH / 2 && c.u < U0 - JOCH / 2 + BOEGEN * JOCH, kaempfer: 7, joch: JOCH, entlang: 'u', versatz: U0 - JOCH / 2 },
  material: (s, c, yr, i) => (i.kranz || i.gesims ? SERENA : c.w < 1.5 && c.u < 112 ? (yr <= 2 ? SERENA : PUTZ) : (yr % 6 === 0 ? BRUCH : TERRA)),
  portale: [],
  treppe: RAUM.TREPPE,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: { oeffnungen: RAUM.oeffnungen }
});
module.exports = Object.assign(PZ, { JOCH, BOEGEN, U0, TIEFE });
