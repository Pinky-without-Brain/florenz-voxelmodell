'use strict';
// Palazzo dell'Arte della Lana (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_arte_della_lana/): Zunftsitz der Wollweber,
// 1308 errichtet (Inschriften) unter Einbeziehung eines älteren Turmhauses, heute Sitz der Società Dantesca Italiana.
// Steinerner Kern mit Quaderverkleidung, Zinnen auf Konsolen, gewölbte Fenster; Verbindungsbogen zu Orsanmichele (1569).
// Rahmen AL: Ursprung (−387 | 516,5) = Nordwestecke, θ = −5,5°; u nach Osten (Nordkante an der Via Orsanmichele),
// w nach Süden (Westkante an der Via Calimala). Lagen yr = Y − 66: fünf Geschosse (7, 7, 7, 7, 6), Decke Lage 34, Zinnen bis 37.
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const FORTE = WZ.typ('pietra_forte'), RUST = WZ.typ('pietra_forte_rustika'), SERENA = WZ.typ('pietra_serena');

const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [7, 7, 7, 7, 6],
  dach: { art: 'flach' },
  zinnen: { hoehe: 2, abstand: 2 },
  hof: { tiefe: 0, joch: 7, kaempfer: 7, minZellen: 100000 },
  fenster: { abstand: 8, breite: 3, sohle: [3, 2, 2, 2, 2], hoehe: [3, 3, 3, 3, 2], bifora: [false, true, true, true, true] },
  material: (s, c, yr, i) => (i.kranz || i.gesims ? SERENA : (yr % 3 === 0 ? RUST : FORTE)),
  portale: RAUM.PORTALE,
  treppe: RAUM.TREPPE,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  oeffnungTeil: { bruecke: 'bruecke_tuer' },
  extra: { vorher: RAUM.vorher }
});
module.exports = PZ;
