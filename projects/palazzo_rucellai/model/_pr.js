'use strict';
// Palazzo Rucellai (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_rucellai/): Fassade von Leon Battista Alberti
// (um 1446–51, ausgeführt von Bernardo Rossellino): flache Quaderung, drei Pilasterordnungen, Biforen, Kranzgesims;
// sieben Achsen zur Via della Vigna Nuova (w = 0), die übrigen Seiten verputzt; kleiner Hof.
// Rahmen PR: u entlang der Fassade (Westen → Osten), w < 0 ins Gebäude; Lagen yr = Y − 60.
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');

const ACHSE = 53.5 / 7;                    // sieben Achsen auf 53,5 Blöcken Fassade
const FORTE = WZ.typ('pietra_forte'), MAUER = WZ.typ('mauerwerk'), SERENA = WZ.typ('pietra_serena'), PUTZ = WZ.typ('putz_ocker'), ORN = WZ.typ('marmor_ornament');
const fassade = (c) => c.w > -2.5;
const pilaster = (c) => { const r = ((c.u % ACHSE) + ACHSE) % ACHSE; return r < 0.9 || r > ACHSE - 0.9; };
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [20, 17, 15],
  dach: { art: 'walm', hoehe: 5 },
  hof: { tiefe: 3, joch: 6, kaempfer: 9 },
  fenster: { abstand: ACHSE, breite: 3.2, sohle: [10, 3, 3], hoehe: [4, 10, 9], bifora: [false, true, true] },
  material: (s, c, yr, i) => {
    if (!fassade(c)) return i.kranz ? SERENA : PUTZ;
    if (i.kranz || i.gesims) return ORN;                              // Gebälke und Kranzgesims
    if (yr <= 2) return SERENA;                                       // Sitzbank (panca) am Sockel
    if (pilaster(c)) return SERENA;                                   // Pilaster: dorisch, ionisch, korinthisch
    return yr % 3 === 0 ? MAUER : FORTE;                              // flache Quader mit Fugen
  },
  portale: [{ u: 1.5 * ACHSE, w: 0, breite: 4, hoehe: 11 }, { u: 5.5 * ACHSE, w: 0, breite: 4, hoehe: 11 }],
  treppe: { u: 40, w: -40 }
});
module.exports = Object.assign(PZ, { ACHSE });
