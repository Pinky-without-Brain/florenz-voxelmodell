'use strict';
// Konvent von Santa Croce mit den beiden Kreuzgängen (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/cappella_pazzi/).
// Bauplan aus tools/wahrzeichen/palazzo.js (Höfe = Löcher des OSM-Polygons r10782536). Die Cappella de' Pazzi hat einen eigenen Plan (_kap.js).
// Rahmen: derselbe wie bei der Basilika (santa_croce): θ 28,4 Grad, Ursprung (873,25 | 975); u nach Ost-Südost entlang dem Langhaus,
// w nach Süd-Südwest. Löcher: 0 = schmaler Innenhof im Ostflügel (u 218..278, w 113..128), 1 = Secondo Chiostro (u 79..139, w 170..244).
// Der Primo Chiostro (Gartenhof, u 12..135, w 59..131) ist in OSM kein Loch, sondern freie Fläche des Stadtgrunds außerhalb der Maske.
// Geschosse: Erdgeschoss Lage 0..10, Obergeschoss 10..19, Dach ab 20 (Lage = Y − 61).
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const PUTZ = WZ.typ('putz_sand'), SERENA = WZ.typ('pietra_serena'), SOCKEL = WZ.typ('pietra_forte');

const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [10, 9],
  dach: { art: 'walm', hoehe: 6 },
  hof: { tiefe: 5, joch: 7, kaempfer: 6, mitArkaden: [1], garten: [0, 1] },
  fenster: { abstand: 9, breite: 3, sohle: [4, 3], hoehe: [5, 5], bogen: true },
  material: (s, c, yr, i) => (i.kranz || i.gesims ? SERENA : i.sockel ? SOCKEL : PUTZ),
  hofMaterial: (s) => (s === 0 ? SERENA : PUTZ),
  portale: RAUM.PORTALE,
  treppe: RAUM.TREPPE,
  innenwandTuer: RAUM.innenwandTuer,
  extra: { oeffnungen: (api) => RAUM.oeffnungen(api) },
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten }
});
module.exports = PZ;
