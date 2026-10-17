'use strict';
// Museo dell'Opera del Duomo (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/museo_opera_duomo/): Sitz der Opera di Santa Maria del Fiore seit 1296,
// Museum seit 1891, 2012-2015 nach Plänen von Adolfo Natalini um die Räume des Teatro degli Intrepidi (1779) erweitert; Piazza del Duomo 9.
// Rahmen MO: Ursprung (158 | −153), θ = 33,7°; u nach Ostsüdost, w nach Südsüdwest. Die Front zur Piazza del Duomo ist die lange Südwestkante
// (u 10..80, w 110..160). Lagen yr = Y − 65: Erdgeschoss 0..9, Obergeschoss 9..17, zweites Obergeschoss 17..23 (OSM: drei Ebenen, 23 Blöcke).
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const PUTZ = WZ.typ('putz_ocker'), SERENA = WZ.typ('pietra_serena'), SOCKEL = WZ.typ('pietra_forte');

const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [9, 8, 6],
  dach: { art: 'walm', hoehe: 4 },
  hof: { tiefe: 0, joch: 7, kaempfer: 6, minZellen: 1000000 },
  fenster: { abstand: 11, breite: 3, sohle: [4, 3, 2], hoehe: [4, 4, 3], bifora: [false, false, false], aus: (c) => !RAUM.fensterOrt(c) },
  material: (s, c, yr, i) => (i.kranz || i.gesims ? SERENA : i.sockel ? SOCKEL : PUTZ),
  portale: RAUM.PORTALE,
  treppe: RAUM.TREPPE,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: { vorher: RAUM.vorher }
});
module.exports = PZ;
