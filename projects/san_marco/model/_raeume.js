'use strict';
// Raumplan und Ausstattung des Konvents (Platzhalter, wird ausgebaut)
const TREPPE = { u0: 4, u1: 16, w0: 46, w1: 64.5, ziel: { u: 9, w: 52 } };
// Türen der Innenwand um den Kreuzgang Sant'Antonino (Loch 5, u 28..65, w 52..92): Segment aus der Lage, Lage entlang der Wand
// selbst berechnet (die Ausrichtung der Palazzo-Vorgabe schwankt im gedrehten Rahmen).
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
const WAENDE = [];
const TEILE = [];
function ausstatten(api) {}
function oeffnungen(api) {}
module.exports = { TREPPE, innenwandTuer, WAENDE, TEILE, INHALT: { titel: 't', untertitel: 'u', icon: 'x', teile: {} }, ausstatten, oeffnungen };
