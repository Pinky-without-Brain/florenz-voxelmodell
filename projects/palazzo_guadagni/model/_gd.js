'use strict';
// Palazzo Guadagni (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_guadagni/): Cronaca (zugeschrieben) um 1502-1506.
// Rahmen GD an der Fassade zur Piazza Santo Spirito (OSM-Kante 1): u entlang der Fassade, w von der Fassade ins Haus.
// Lagen yr = Y - 61. Geschosse: EG 8, 1. OG 7, 2. OG 7, Dachloggia 8 (OSM-Schätzung 30 Blöcke bis zur Traufe).
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const RUSTIKA = WZ.typ('pietra_forte_rustika'), FORTE = WZ.typ('pietra_forte'), SERENA = WZ.typ('pietra_serena');
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: RAUM.GESCHOSSE,
  dach: { art: 'walm', hoehe: 3 },
  hof: { tiefe: 0 },
  // Rundbogenfenster im Raster 10 (fünf Achsen, Portal in der mittleren); das oberste Geschoss ist die offene Loggia (keine Fenster)
  fenster: { abstand: 10, breite: 4, versatz: 0.5, sohle: [3, 2, 2, 99], hoehe: [3, 4, 4, 0] },
  // EG glatte Pietra forte mit Eckpilastern in Bugnato; 1. und 2. OG Bugnen (jede vierte Lage glatt); Loggiageschoss glatt
  material: (s, c, yr, i) => (i.gesims || i.kranz ? SERENA
    : s === 0 ? (c.u < 4 || c.u > 47 ? RUSTIKA : FORTE)
      : s < 3 ? (yr % 4 === 0 ? FORTE : RUSTIKA) : FORTE),
  portale: RAUM.PORTALE,
  treppe: RAUM.TREPPE,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: { vorher: RAUM.vorher, oeffnungen: RAUM.loggia }
});
module.exports = PZ;
