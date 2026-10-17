'use strict';
// Palazzo Lenzi (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_lenzi/): 15. Jahrhundert, Fassade mit Graffito (Sgraffito).
// Rahmen LN an der Fassade zur Piazza d'Ognissanti (OSM-Kante 0): u entlang der Fassade (0..69), w von der Fassade ins Haus.
// Lagen yr = Y - 55. Drei Geschosse zu je 10 Blöcken (OSM-Schätzung 30 Blöcke bis zur Traufe).
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const SERENA = WZ.typ('pietra_serena'), GRAU = WZ.typ('putz_grau'), SAND = WZ.typ('putz_sand'), WEISS = WZ.typ('putz_weiss'), DUNKEL = WZ.typ('kontrast_dunkel');
// Graffito an der Piazza-Fassade: Marcapiano-Bänder an den Geschossgrenzen und gemalte Säulchen zwischen den Fensterachsen
function graffito(s, c, yr, i) {
  if (i.kranz) return SERENA;
  if (c.w >= 3 || s === 0) return s === 0 ? GRAU : SAND;
  const rel = ((yr % 10) + 10) % 10;                                  // Lage im Geschoss (Geschosshöhe 10)
  const band = rel === 0 || rel === 9;
  if (band) return Math.floor(c.u / 2) % 2 ? DUNKEL : WEISS;
  const r = ((c.u % RAUM.ACHSE) + RAUM.ACHSE) % RAUM.ACHSE;
  if (r < 0.8 || r > RAUM.ACHSE - 0.8) return yr % 3 === 0 ? DUNKEL : WEISS;
  return Math.floor((c.u + yr) / 2) % 4 === 0 && rel > 1 && rel < 8 ? GRAU : SAND;
}
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: RAUM.GESCHOSSE,
  dach: { art: 'walm', hoehe: 3 },
  hof: { tiefe: 0 },
  // Fünf Achsen im Raster 13,7 (Portale im EG); die beiden Obergeschosse tragen einfache Rundbogenfenster
  fenster: { abstand: RAUM.ACHSE, breite: 4, versatz: 0, sohle: [99, 3, 3], hoehe: [0, 5, 5] },
  material: graffito,
  portale: RAUM.PORTALE,
  treppe: RAUM.TREPPE,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: { oeffnungen: RAUM.loggetta }
});
module.exports = PZ;
