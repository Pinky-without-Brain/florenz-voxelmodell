'use strict';
// Palazzo Spini Feroni (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_spini_feroni/): ab 1289 für Geri Spini gebaut,
// gotischer Palast aus unverputzter Pietra forte mit Zinnenkranz und drei Geschossen; heute Museo Salvatore Ferragamo.
// Rahmen SF an der Kante zum Borgo Santi Apostoli: u entlang des Borgo (nach Südwesten), w von dort nach innen (Nordwesten).
// Lagen yr = Y - 61. Geschosse nach OSM-Schätzung (30 Blöcke bis zur Traufe).
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const BRUCH = WZ.typ('pietra_forte_bruch'), FORTE = WZ.typ('pietra_forte');
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [11, 10, 9],
  dach: { art: 'walm', hoehe: 4 },
  zinnen: { hoehe: 4, abstand: 2 },
  hof: { tiefe: 0, joch: 7, kaempfer: 7, minZellen: 150 },
  fenster: { abstand: 9, breite: 4, versatz: 33.5, sohle: [3, 3, 2], hoehe: [5, 5, 4], bifora: [false, true, true] },
  material: (s, c, yr, i) => (i.kranz || i.gesims ? FORTE : (yr % 4 === 0 ? FORTE : BRUCH)),
  portale: RAUM.PORTALE,
  treppe: RAUM.TREPPE,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: { oeffnungen: RAUM.oeffnungen }
});
module.exports = PZ;
