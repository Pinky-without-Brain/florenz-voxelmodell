'use strict';
// Palazzo Arcivescovile (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_arcivescovile/): Erzbischöflicher Palast an der
// Piazza San Giovanni. Fassade nach Giovanni Antonio Dosio (Wiederaufbau 1573–84), 1893–95 im Zuge des Risanamento
// zurückversetzt und um drei Achsen erweitert; Hof mit Arkaden, Rückseite zur Piazza dell'Olio mit der eingefügten Kirche
// San Salvatore al Vescovo. Rahmen AA: u entlang der Fassade (Nord → Süd), w von der Fassade (Piazza San Giovanni) nach Westen.
// Lagen yr = Y − 64. Geschosse nach OSM (37 Blöcke bis zur Traufe): EG, Piano nobile, zwei Mezzanin-Geschosse.
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const PUTZ = WZ.typ('putz_ocker'), SERENA = WZ.typ('pietra_serena'), ORN = WZ.typ('marmor_ornament'), FORTE = WZ.typ('pietra_forte');
const ACHSE = 116 / 13;                                   // dreizehn Fensterachsen auf der Fassade (Stufe C)
const fassade = (c) => c.w < 2.5;
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [10, 11, 8, 8],
  dach: { art: 'walm', hoehe: 4 },
  hof: { tiefe: 3, joch: 6, kaempfer: 7, minZellen: 150 },
  fenster: { abstand: ACHSE, breite: 3, sohle: [4, 3, 2, 2], hoehe: [4, 6, 4, 3], bifora: [false, false, false, false] },
  material: (s, c, yr, i) => {
    if (i.kranz || i.gesims) return ORN;
    if (fassade(c) && (i.sockel || yr <= 3)) return SERENA;          // Sockelzone der Fassade
    if (fassade(c) && yr % 4 === 0 && s === 0) return FORTE;          // feine Bänderung im Erdgeschoss
    return PUTZ;
  },
  portale: RAUM.PORTALE,
  treppe: RAUM.TREPPE,
  innenwandTuer: RAUM.innenwandTuer,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: { vorher: RAUM.vorher, nachher: RAUM.nachher, oeffnungen: RAUM.oeffnungen }
});
module.exports = Object.assign(PZ, { ACHSE });
