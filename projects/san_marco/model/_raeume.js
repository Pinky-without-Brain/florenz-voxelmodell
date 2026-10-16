'use strict';
// Raumplan und Ausstattung des Konvents von San Marco (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/san_marco/).
// Rahmen SM (theta -61,78 Grad): u von der Piazza San Marco nach NNO, w nach OSO (zum Konvent). Geschosse: EG Lage 0..12, OG 12..23.
// Löcher: 3 Chiostro di San Domenico, 5 Chiostro di Sant'Antonino, 0-2 und 4 Lichthöfe.
// Alles vereinfacht, nicht nach Vorbild; die Lage der Räume im Grundriss ist Stufe C (Quellen nennen Räume, nicht Koordinaten).
const { kit, typen, schach, kassette, figurenFries, hash, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

const TREPPE = { u0: 4, u1: 16, w0: 46, w1: 64.5, ziel: { u: 9, w: 52 } };   // Suchraum der Podesttreppe im Eingangsflügel

// ---------------------------------------------------------------- Türen der Innenwand um den Kreuzgang Sant'Antonino
// (Loch 5, u 28..65, w 52..92): Segment aus der Lage, Lage entlang der Wand selbst berechnet (die Ausrichtung der
// Palazzo-Vorgabe schwankt im gedrehten Rahmen).
const innenwandTuer = (c, s) => {
  let along;
  if (c.u < 28 && c.w > 40 && c.w < 102) along = c.w;                  // Südflügel (Eingangsseite)
  else if (c.u > 65 && c.w > 40 && c.w < 102) along = c.w;             // Nordflügel
  else if (c.w > 92 && c.u >= 26 && c.u <= 66) along = c.u;           // Ostflügel
  else return false;
  const r = ((along % 14) + 14) % 14;
  const raster = r > 5.5 && r < 8.5;
  if (s === 0) return raster;
  return c.u < 28 && along < 70 && raster;                            // Obergeschoss: nur zur Treppenhalle
};

// ---------------------------------------------------------------- Zellenblöcke des Dormitoriums (Obergeschoss)
// Ein Block: Gang (Breite ~5) zwischen zwei Zellenreihen. ax = Richtung, in der sich die Zellen reihen ('w': Gang läuft entlang w,
// Gangwände liegen bei konstantem u). rowA/rowB: quer-Intervall der Zelleninnenräume, vA/vB: Mitte der Gangwände, t0..t1: Länge, n: Zellen je Reihe.
const BLOECKE = [
  { id: 'nord', ax: 'w', t0: 41.2, t1: 102.2, n: 8, A: { v: 83.2, r: [76, 82.2] }, B: { v: 90.4, r: [91.5, 97.5] } },
  { id: 'west', ax: 'u', t0: 30, t1: 100, n: 9, A: { v: -16.4, r: [-23.5, -17.5] }, B: { v: -9.0, r: [-7.9, -3.2] } },
  { id: 'sued', ax: 'w', t0: 67.4, t1: 118, n: 7, A: null, B: { v: 9.6, r: [10.8, 16.4] } }
];
for (const b of BLOECKE) {
  b.pitch = (b.t1 - b.t0) / b.n;
  b.zellen = [];                                            // { block, reihe, k, t: [von, bis] (Innenraum), quer: [von, bis], tuerSeite: ±1 }
  for (const [reihe, S] of [['A', b.A], ['B', b.B]]) {
    if (!S) continue;
    for (let k = 0; k < b.n; k++) {
      const tm = b.t0 + (k + 0.5) * b.pitch;
      b.zellen.push({ block: b.id, reihe, k, tm, t: [b.t0 + k * b.pitch + 1.1, b.t0 + (k + 1) * b.pitch - 1.1], quer: S.r, vTuer: S.v, ax: b.ax, nr: 0 });
    }
  }
}
const ALLE_ZELLEN = [].concat(...BLOECKE.map((b) => b.zellen));
ALLE_ZELLEN.forEach((z, i) => { z.nr = i + 1; });

// Savonarola: Ostflügel, Obergeschoss, drei verbundene Räume in Reihe entlang u
const SAVO = { w: [104.3, 117], raeume: [[30.5, 42.3], [44.5, 55.5], [57.7, 69.5]], waende: [29.4, 43.4, 56.6, 70.6] };
// Bibliothek: Obergeschoss, Nordflügel
const BIB = { u: [181.5, 203.5], w: [9.8, 100.4], suedwand: 180.2, westwand: 8.6, ostwand: 101.6 };

const WAENDE = [];
// ---- Erdgeschoss
WAENDE.push({ s: 0, achse: 'w', v: 66.4, von: 3, bis: 17, tueren: [10] });                  // Eingangshalle | Ospizio
WAENDE.push({ s: 0, achse: 'w', v: 96.4, von: 3, bis: 17, tueren: [10] });                  // Ospizio | Foresteria
WAENDE.push({ s: 0, achse: 'u', v: 29.4, von: 104, bis: 118, tueren: [111] });              // Kapitelsaal, Südwand
WAENDE.push({ s: 0, achse: 'u', v: 58.4, von: 104, bis: 118, tueren: [111] });              // Kapitelsaal | Refettorio piccolo
WAENDE.push({ s: 0, achse: 'u', v: 76.4, von: 104, bis: 118, tueren: [111] });              // Refettorio piccolo | Nordflügel
WAENDE.push({ s: 0, achse: 'w', v: 103.4, von: 76, bis: 104, tueren: [90] });               // Refettorio grande | Küche
WAENDE.push({ s: 0, achse: 'u', v: 104.4, von: 35, bis: 118, tueren: [70, 111] });          // Refettorio grande, Nordwand
// ---- Obergeschoss: Zellenblöcke
for (const b of BLOECKE) {
  const quer = b.ax === 'w' ? 'u' : 'w';                    // Achse der Gangwände (konstantes u bei Gang entlang w)
  for (const [reihe, S] of [['A', b.A], ['B', b.B]]) {
    if (!S) continue;
    const tueren = b.zellen.filter((z) => z.reihe === reihe).map((z) => z.tm);
    WAENDE.push({ s: 1, achse: quer, v: S.v, von: b.t0 - 1, bis: b.t1 + 1, tueren, breite: 2.6, dicke: 2.2 });
    const lo = S.r[0] - 1, hi = S.r[1] + 1;
    for (let k = 1; k < b.n; k++) WAENDE.push({ s: 1, achse: b.ax, v: b.t0 + k * b.pitch, von: lo - 1.3, bis: hi + 1.3, tueren: [] });
  }
}
// ---- Obergeschoss: Savonarolas Zellen (Ostflügel)
SAVO.waende.forEach((v, i) => WAENDE.push({ s: 1, achse: 'u', v, von: SAVO.w[0] - 1, bis: SAVO.w[1] + 1, tueren: i < 3 ? [110.5] : [], breite: 3 }));
// ---- Obergeschoss: Bibliothek (Nordflügel, Südwand mit Tür, Stirnwände mit Türen)
WAENDE.push({ s: 1, achse: 'u', v: BIB.suedwand, von: BIB.westwand - 1, bis: BIB.ostwand + 1, tueren: [55], breite: 4 });
WAENDE.push({ s: 1, achse: 'w', v: BIB.westwand, von: 179, bis: 205, tueren: [192], breite: 4 });
WAENDE.push({ s: 1, achse: 'w', v: BIB.ostwand, von: 179, bis: 205, tueren: [192], breite: 4 });

const TEILE = ['kreuzgang_antonino', 'lunetten', 'kreuzigung_hof', 'ospizio', 'foresteria', 'kapitelsaal', 'refettorio_piccolo', 'refettorio_grande', 'kreuzgang_domenico', 'verkuendigung', 'zellen_nord', 'zellen_west', 'zellen_sued', 'savonarola', 'biblioteca', 'licht_ausstattung'];
function ausstatten(api) { require('./_ausstattung.js').ausstatten(api); }
function oeffnungen(api) {}
module.exports = { TREPPE, innenwandTuer, WAENDE, TEILE, BLOECKE, ALLE_ZELLEN, SAVO, BIB, INHALT: { titel: 't', untertitel: 'u', icon: 'x', teile: {} }, ausstatten, oeffnungen };
