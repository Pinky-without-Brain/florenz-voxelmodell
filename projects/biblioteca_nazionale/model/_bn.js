'use strict';
// Biblioteca Nazionale Centrale di Firenze (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/biblioteca_nazionale/): Bau von Cesare Bazzani
// (1911–1935) auf dem Gelände der Kaserne der Cavalleggeri zwischen Santa Croce, Arno und Corso dei Tintori; zwei Achsen kreuzen sich in einer
// großen Verteilerhalle: die eine parallel zum Fluss (Verwaltung, Zeitschriften, Lesesäle, Kataloge), die andere vom Säulenportikus an der
// Piazza dei Cavalleggeri zu den Magazinen im Rücken. Zwei Türme an der Flussfront tragen Statuen von Dante und Galileo, im Westen die
// Tribuna Dante e Galileo. Rahmen BN (θ 8°): u von der Tribuna im Westen (0..283) zur Ostseite, w vom Corso dei Tintori im Norden (0) zum
// Fluss im Süden (bis 92). Lagen yr = Y − 61.
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const SERENA = WZ.typ('pietra_serena'), RUSTIKA = WZ.typ('pietra_forte_rustika'), TRAV = WZ.typ('putz_sand'), PUTZ = WZ.typ('putz_weiss'), FORTE = WZ.typ('pietra_forte');
const ABST = 10;
const PORTIKUS = { u0: 153, u1: 193, w0: 82, joch: 8 };         // Säulenportikus an der Piazza dei Cavalleggeri (fünf Joche zwischen den Türmen)
const TURM_W = { u0: 133.3, u1: 152.6, w0: 70, w1: 94, id: 'W' }, TURM_O = { u0: 194, u1: 213.6, w0: 70, w1: 94, id: 'O' };
const TURM_TOP = 58;                                              // Türme: Oberkante Lage 58 (Stufe C), Statuen darüber

const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [13, 12, 10],
  dach: { art: 'walm', hoehe: 3 },
  hof: { tiefe: 0 },
  fenster: { abstand: ABST, breite: 3, sohle: [2, 2, 2], hoehe: [8, 8, 6], bifora: [false, false, false], versatz: 2, aus: RAUM.fensterAus },
  portikus: { test: (c) => c.w > PORTIKUS.w0 && c.u >= PORTIKUS.u0 && c.u < PORTIKUS.u1 && c.d8 > 0, kaempfer: 9, joch: PORTIKUS.joch, entlang: 'u', versatz: PORTIKUS.u0 },
  material: (s, c, yr, i) => {
    if (i.kranz || i.gesims) return SERENA;
    if (s === 0 && RAUM.istFront(c)) return RUSTIKA;           // Sockelgeschoss: Rustika (Stufe C)
    return yr % 8 === 0 ? FORTE : TRAV;
  },
  portale: [],
  treppe: RAUM.TREPPE,
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: { oeffnungen: RAUM.oeffnungen, vorher: (api) => RAUM.tuerme(api, { TURM_W, TURM_O, TURM_TOP }) }
});
module.exports = Object.assign(PZ, { ABST, PORTIKUS, TURM_W, TURM_O, TURM_TOP });
void PUTZ;
