'use strict';
// Raumplan und Ausstattung des Konvents von Santa Croce (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/cappella_pazzi/).
// Rahmen θ 28,4 Grad (wie die Basilika), u nach Ost-Südost, w nach Süd-Südwest. Geschosse: EG Lage 0..10, OG 10..19 (Lage = Y - 61).
// Die Lage der Räume im Grundriss ist Stufe C: die Quellen nennen Räume, nicht Koordinaten.

// Portale (lokale Mitte, 6 breit, 10 hoch, bis zum Boden offen): Cenacolo vom Primo Chiostro (Ostseite des Westarms), Westseite des Westarms
// (zur Straße), Museumssäle vom Primo Chiostro, Südtrakt vom Primo Chiostro (unterer Teil des P) und Osttrakt.
const PORTALE = [
  { u: 9.5, w: 76, breite: 6, hoehe: 10 },
  { u: -4, w: 76, breite: 6, hoehe: 10 },
  { u: 40, w: 99, breite: 7, hoehe: 10 },
  { u: 108, w: 132.5, breite: 7, hoehe: 10 },
  { u: 138, w: 115, breite: 7, hoehe: 10 }
];
// Wendeltreppe EG -> OG in der dritten Museumshalle (Halle C), Ziel (u, w)
const TREPPE = { u: 65, w: 116 };

// Trennwände (nur Erdgeschoss): Südwand des Cenacolo mit Tür zur Halle A; Hallen A | B | C des Museums
const WAENDE = [
  { s: 0, achse: 'w', v: 97.5, von: -9, bis: 12, tueren: [2.5], breite: 4 },
  { s: 0, achse: 'u', v: 22, von: 99, bis: 134, tueren: [127], breite: 4 },
  { s: 0, achse: 'u', v: 52, von: 99, bis: 134, tueren: [116], breite: 4 }
];

const TEILE = ['cenacolo', 'gaddi_fresko', 'cimabue_kruzifix', 'veneziano_tafel', 'san_ludovico', 'sala_orcagna', 'orcagna_fresken', 'sala_vasari', 'vasari_abendmahl',
  'kreuzgang_secondo', 'cortile_ost'];
function ausstatten(api) { require('./_ausstattung.js').ausstatten(api); }
function oeffnungen(api) {}
module.exports = { PORTALE, TREPPE, innenwandTuer: undefined, WAENDE, TEILE, oeffnungen, ausstatten };
