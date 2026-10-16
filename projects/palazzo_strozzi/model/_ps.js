'use strict';
// Palazzo Strozzi (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_strozzi/): Benedetto da Maiano ab 1489,
// Kranzgesims von Il Cronaca. Allseitige Rustika aus Pietra forte, nach oben flacher werdend, Biforen in den
// Obergeschossen, drei Portale (Via Tornabuoni, Via Strozzi, Piazza Strozzi), Hof mit Arkaden.
// Rahmen PS: u = Osten (von der Via Tornabuoni zur Piazza Strozzi), w = Süden; Lagen yr = Y − 64.
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');

const RUSTIKA = WZ.typ('pietra_forte_rustika'), FORTE = WZ.typ('pietra_forte'), SERENA = WZ.typ('pietra_serena');
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [24, 20, 18],
  dach: { art: 'walm', hoehe: 6 },
  hof: { tiefe: 5, joch: 7, kaempfer: 12 },
  fenster: { abstand: 11, breite: 4, sohle: [12, 4, 4], hoehe: [5, 11, 10], bifora: [false, true, true] },
  // Rustika in allen Geschossen; Fugen (jede dritte Lage) im Erdgeschoss kräftiger, oben glatter
  material: (s, c, yr, i) => (i.gesims || i.kranz ? SERENA : (s === 0 ? (yr % 3 === 0 ? FORTE : RUSTIKA) : s === 1 ? (yr % 4 === 0 ? FORTE : RUSTIKA) : (yr % 5 === 0 ? RUSTIKA : FORTE))),
  portale: [{ u: 0.5, w: 43.5, breite: 6, hoehe: 14 }, { u: 57, w: 0, breite: 6, hoehe: 14 }, { u: 114, w: 43.5, breite: 6, hoehe: 14 }],
  treppe: { u: 20, w: 20 }
});
module.exports = PZ;
