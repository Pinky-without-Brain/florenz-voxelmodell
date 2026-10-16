'use strict';
// Ex monastero di Sant'Apollonia (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/sant_apollonia/): Camaldulenserinnenkloster seit
// 1339, Refektorium mit Andrea del Castagnos Abendmahl (1447), Kreuzgänge (Badessa ab 1442), ehemalige Kirche, heute Museum,
// Universität und Mensa. Rahmen SA: u entlang der Fassade zur Via XXVII Aprile (West → Ost, 0..117), w von dieser
// Fassade ins Gebäude (0..195); Via San Gallo liegt bei u ≈ 118 (rechte Kante des Mittelstreifens), Via Santa Reparata bei u ≈ 0.
// Lagen yr = Y − 66. Geschosse nach OSM-Schätzung 30 Blöcke: EG 18 (hohes Refektorium), Obergeschoss 12.
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const PUTZ = WZ.typ('putz_weiss'), OCKER = WZ.typ('putz_ocker'), SERENA = WZ.typ('pietra_serena'), BRUCH = WZ.typ('pietra_forte_bruch');
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [18, 12],
  dach: { art: 'walm', hoehe: 4 },
  hof: { tiefe: 3, joch: 6, kaempfer: 7, mitArkaden: [0, 1, 2, 3], garten: RAUM.GAERTEN },
  fenster: { abstand: 9, breite: 3, sohle: [6, 3], hoehe: [8, 6], bifora: [false, false], aus: RAUM.fensterAus },
  material: (s, c, yr, i) => {
    if (i.kranz || i.gesims) return SERENA;
    if (i.sockel) return BRUCH;
    return yr % 9 === 0 ? OCKER : PUTZ;
  },
  portale: [],
  treppe: RAUM.TREPPE,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: { oeffnungen: RAUM.oeffnungen }
});
module.exports = PZ;
