'use strict';
// Palazzo dei Mozzi (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_mozzi/): 1266-1273 für die Familie Mozzi, Palazzo-Festung
// aus mehreren Häusern und Türmen. Rahmen MZ an der Fassade zur Piazza de' Mozzi (OSM-Kante 19): u entlang der Fassade, w von der
// Fassade bergauf ins Haus. Lagen yr = Y - 66. Geschosse 12 + 9 + 9 Blöcke (OSM-Schätzung 30), zentraler Turm darüber.
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const RUSTIKA = WZ.typ('pietra_forte_rustika'), FORTE = WZ.typ('pietra_forte'), BRUCH = WZ.typ('pietra_forte_bruch'), SERENA = WZ.typ('pietra_serena');
const T = RAUM.TURM;
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: RAUM.GESCHOSSE,
  dach: { art: 'walm', hoehe: 4 },
  entlangGlatt: true,
  hof: { tiefe: 0 },
  // Sieben Achsen im Raster 10 (Fornici im EG); darüber Rundbogenfenster
  fenster: { abstand: 10, breite: 3, versatz: 0.5, sohle: [99, 2, 2], hoehe: [0, 5, 5] },
  // kleine behauene Quader (bozze squadrate): Rustika mit glatten Lagen jede vierte; Kranzgesims aus Pietra serena
  material: (s, c, yr, i) => (i.kranz || i.gesims ? SERENA : (yr % 4 === 0 ? FORTE : (s === 0 ? RUSTIKA : BRUCH))),
  portale: RAUM.PORTALE,
  treppe: RAUM.TREPPE,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: {
    oeffnungen: RAUM.oeffnungen,
    // Turm über dem Dach: Schaft hohl (unzugänglich), oben verschlossen; die Zinnen sind im 19. Jahrhundert entfernt worden
    vorher(api) {
      const { D, set, unzug, frei, Y, TRAUFE } = api;
      for (const c of D.haupt) {
        if (c.u < T.u0 || c.u >= T.u1 || c.w < T.w0 || c.w >= T.w1) continue;
        const r = Math.floor(Math.min(c.u - T.u0, T.u1 - 1e-6 - c.u, T.w1 - 1e-6 - c.w, c.w)) + 1;      // 1 = äußerste Lage
        for (let yr = TRAUFE + 1; yr <= T.top; yr++) {
          if (r <= 2 || yr === T.top) set(c.x, Y(yr), c.z, yr === T.top ? SERENA : (yr % 5 === 0 ? FORTE : BRUCH), 'turm');
          else { frei(c.x, Y(yr), c.z); unzug('turm', 'Schaft des Turms über der Fassade (im Modell ohne Zugang)', c.x, Y(yr), c.z); }
        }
      }
    }
  }
});
module.exports = PZ;
