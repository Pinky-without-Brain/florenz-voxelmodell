'use strict';
// Palazzo della Crocetta (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_della_crocetta/): Palast der Maria Maddalena de' Medici
// von Giulio Parigi (1619–51), U-förmiger Grundriss um den Garten, 24 Achsen an der Via della Colonna, seit 1880 Museo Archeologico Nazionale.
// Rahmen CR (θ 33,6°): u entlang der langen Seite zur Via Laura (West → Ost, 0..413), w von dort nach Süden zur Via della Colonna (0..83).
// Westflügel (u −6..52, w 0..82) an der Via Gino Capponi, Vorderflügel (w 0..20) entlang der Via Laura, Ostflügel (u 293..411, w 0..83) mit dem
// Cortile dei Fiorentini (Loch, u 322..393, w 6,5..36). Der Garten zwischen den Flügeln liegt außerhalb des Umrisses. Lagen yr = Y − 68.
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const ABST = 8.6, VERSATZ = 4.0;                            // 24 Achsen auf den beiden Fronten zur Via della Colonna (57 + 150 Blöcke)
const GELB = WZ.typ('putz_gelb'), SERENA = WZ.typ('pietra_serena'), RUSTIKA = WZ.typ('pietra_forte_rustika'), FORTE = WZ.typ('pietra_forte');
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [12, 12, 9],
  dach: { art: 'walm', hoehe: 3 },
  hof: { tiefe: 0, joch: 6, kaempfer: 7, mitArkaden: [0] },
  fenster: {
    abstand: ABST, breite: 3, sohle: [2, 2, 2], hoehe: [7, 7, 5], bifora: [false, false, false], versatz: VERSATZ, bogen: false,
    aus: RAUM.fensterAus
  },
  material: (s, c, yr, i) => {
    if (i.kranz || i.gesims) return SERENA;
    if (s === 0 && RAUM.istFront(c)) return RUSTIKA;          // Sockelgeschoss der Fronten: glatte Rustika (Stufe C)
    return RAUM.istFront(c) ? GELB : (yr % 6 === 0 ? FORTE : GELB);
  },
  portale: [],
  treppe: RAUM.TREPPE,
  innenwandTuer: RAUM.innenwandTuer,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: { oeffnungen: RAUM.oeffnungen, nachher: RAUM.nachher, vorher: RAUM.vorher }
});
module.exports = Object.assign(PZ, { ABST, VERSATZ });
