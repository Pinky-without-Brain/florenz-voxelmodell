'use strict';
// Palazzo Medici Riccardi (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_medici_riccardi/): Michelozzo ab
// 1444 für Cosimo il Vecchio, von den Riccardi im 17. Jh. erweitert. Dreifach abgestufte Fassade: Erdgeschoss mit
// grober Rustika, Piano nobile mit flachen Quadern, oberstes Geschoss glatt, mächtiges Kranzgesims. Drei Höfe im
// OSM-Umriss: Riccardi-Hof (Loch 0), Michelozzos Hof (Loch 1), Garten (Loch 2).
// Rahmen PM: u = 0 an der Via Cavour (u < 0 ins Gebäude), w = 0 an der Via de' Gori (w < 0 nach Norden).
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');

const RUSTIKA = WZ.typ('pietra_forte_rustika'), FORTE = WZ.typ('pietra_forte'), BRUCH = WZ.typ('pietra_forte_bruch'), SERENA = WZ.typ('pietra_serena'), PUTZ = WZ.typ('putz_weiss');
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [22, 18, 16],
  dach: { art: 'walm', hoehe: 6 },
  hof: { tiefe: 5, joch: 7, kaempfer: 11, mitArkaden: [0, 1], garten: [2] },
  fenster: { abstand: 10, breite: 4, sohle: [9, 3, 3], hoehe: [6, 11, 10], bifora: [false, true, true] },
  material: (s, c, yr, i) => (i.kranz || i.gesims ? SERENA : s === 0 ? (yr % 3 === 0 ? BRUCH : RUSTIKA) : s === 1 ? (yr % 3 === 0 ? FORTE : RUSTIKA) : FORTE),
  hofMaterial: (s) => (s === 0 ? SERENA : PUTZ),
  portale: [{ u: 0, w: -41, breite: 6, hoehe: 13 }, { u: -43, w: 0, breite: 5, hoehe: 11 }],
  treppe: { u: -20, w: -60 }
});
module.exports = PZ;
