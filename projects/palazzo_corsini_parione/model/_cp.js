'use strict';
// Palazzo Corsini al Parione (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_corsini_parione/): Barock 1656-1737 (Silvani, Ferri) für die Corsini.
// Rahmen CP an der Fassade zum Lungarno Corsini (OSM-Kante 8): u entlang des Flusses (−9..168), w von der Fassade ins Haus (0..152).
// Lagen yr = Y - 59. Geschosse: EG 12, Piano nobile 10, 2. Obergeschoss 8 (OSM-Schätzung 30 Blöcke bis zur Traufe); Terrasse auf dem Flügel zum Lungarno.
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const SERENA = WZ.typ('pietra_serena'), GELB = WZ.typ('putz_gelb'), SAND = WZ.typ('putz_sand');
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: RAUM.GESCHOSSE,
  dach: { art: 'flach' },
  entlangGlatt: true,
  // Haupthof (Loch 0) mit Arkaden im Erdgeschoss, die drei kleineren Höfe sind Lichthöfe
  hof: { tiefe: 3, joch: 5, kaempfer: 7, mitArkaden: [0] },
  // Fensterachsen im Raster 12; das Portal (u 98) liegt in einer Achse
  fenster: { abstand: 12, breite: 4, versatz: 8, sohle: [3, 3, 2], hoehe: [5, 5, 4] },
  // gelber Putz mit Lisenen aus Pietra serena zwischen den Achsen; Mittelteil (u 83..113) heller; Gesimse und Sockel aus Pietra serena
  material: (s, c, yr, i) => {
    if (i.gesims || i.kranz || (i.sockel && c.w < 3)) return SERENA;
    const r = (((c.u - 2) % 12) + 12) % 12;
    if (r < 1 || r > 11) return SERENA;
    return c.u >= 83 && c.u <= 113 ? SAND : GELB;
  },
  hofMaterial: () => SAND,
  portale: RAUM.PORTALE,
  treppe: RAUM.TREPPE,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  innenwandTuer: RAUM.innenwandTuer,
  extra: { vorher: RAUM.vorher, nachher: RAUM.nachher }
});
module.exports = PZ;
