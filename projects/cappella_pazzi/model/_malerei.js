'use strict';
// Gemalte Felder des Konvents (Cenacolo, Museumssäle) als Farbfunktionen: (q, j, B, H) -> Blocktyp.
// q Spalte 0..B-1 (von links), j Zeile 0..H-1 (unten 0). Alles vereinfacht, nicht nach Vorbild (Katalog: Stufe C).
const WZ = require('../../../tools/wahrzeichen');
const { hash, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');

const FR = (n) => WZ.fresko(n);
const T = { gold: WZ.typ('gold'), holz: WZ.typ('holz'), weiss: WZ.typ('marmor_weiss'), dunkel: WZ.typ('kontrast_dunkel'), putz: WZ.typ('putz_weiss'), serena: WZ.typ('pietra_serena') };

/** Goldrahmen (1 breit) um ein Feld, innen inner(q, j, B, H). */
const rahmen = (inner) => (q, j, B, H) => ((q === 0 || q === B - 1 || j === 0 || j === H - 1) ? T.gold : inner(q - 1, j - 1, B - 2, H - 2));

/**
 * Albero della Vita und Ultima Cena (Taddeo Gaddi, um 1333): oben der Kreuzesbaum mit Medaillons auf blauem Grund, darunter
 * das Abendmahl als Tafel mit Figuren. Breite B, Höhe H (innen mindestens 6 Zeilen).
 */
const albero = rahmen((q, j, B, H) => {
  const cx = Math.floor((B - 1) / 2), dx = Math.abs(q - cx);
  if (j === 0) return FR('braun');                                    // Fußboden des Abendmahlssaals
  if (j === 1) return (dx > 11 || q % 3 === 1) ? [FR('rot'), FR('blau'), FR('gruen'), FR('gelb'), FR('orange')][hash(q, 1, 3) % 5] : T.weiss;   // Tafel und Gewänder
  if (j === 2) return (q % 3 === 1 && dx <= 11) ? (q % 6 === 1 ? T.gold : FR('orange')) : (dx <= 11 ? FR('weiss') : FR('blau'));   // Köpfe mit Nimbus
  const top = H - 1;
  if (j >= 3) {
    if (dx === 0) return j >= top - 1 ? FR('weiss') : T.holz;           // Stamm und Gekreuzigter
    if (j === 3 && dx <= 1) return FR('braun');
    const ast = j === 4 ? 12 : j === 5 ? 10 : 7;                          // Äste (zwölf Medaillons)
    if (j >= 4 && dx <= ast && dx >= 2) {
      if (dx % 4 === 2) return (j + q) % 2 ? FR('rot') : T.gold;          // Medaillon mit Propheten
      return FR('gruen');
    }
  }
  return FR('blau');
});

/** Ultima Cena (Giorgio Vasari, 1546): lange Tafel unter einer Loggia, 13 Figuren, dunkler Hintergrund. */
const vasari = rahmen((q, j, B, H) => {
  if (j === 0) return FR('braun');
  if (j === 1) return (q % 1 === 0 && q > 0 && q < B - 1 && q % 2 === 1) ? [FR('rot'), FR('blau'), FR('gruen'), FR('gelb'), FR('weiss')][hash(q, 2, 9) % 5] : T.weiss;
  if (j === 2) return (q > 0 && q < B - 1 && q % 2 === 1) ? (q === Math.floor(B / 2) ? T.gold : FR('orange')) : FR('braun');
  if (j === H - 1) return FR('braun');                                  // Gebälk der Loggia
  return (q % 5 === 0 && j < H - 1) ? T.weiss : FR(j >= H - 3 ? 'rot' : 'schwarz');
});

/** Kruzifix (Cimabue, um 1265): Kreuz aus Holz mit dem Corpus in Rot und Orange; Breite 8, Höhe 9 (448 x 390 cm bei 1:2 gerundet). */
const kruzifix = (q, j, B, H) => {
  const cx = Math.floor((B - 1) / 2), dx = Math.abs(q - cx);
  if (j === H - 1 && dx <= 1) return T.holz;                           // Kopfbrett
  if (dx === 0 || (j === H - 3 && dx <= 3)) return j >= 2 && j <= H - 3 && j % 3 === 1 ? FR('rot') : FR('orange');   // Corpus und Arme
  if (dx === 1 && j >= 2 && j <= H - 4) return FR('braun');
  if (dx === 2 && j === H - 3) return T.holz;
  return null;
};

/** Orcagna-Fresken (Fragmente, 14. Jh.): Trionfo della Morte, Giudizio universale, Inferno. */
const orcagna = (nr) => rahmen((q, j, B, H) => {
  if (nr === 0) {                                                       // Trionfo della Morte: Reiter und Gerippe
    if (j === 0) return FR('braun');
    if (j >= 1 && j <= 2) return (q % 3 === 1) ? FR('weiss') : FR('rot');
    return (hash(q, j, 5) % 7 === 0) ? FR('schwarz') : FR('braun');
  }
  if (nr === 1) {                                                       // Giudizio: Christus in der Mandorla
    const cx = Math.floor((B - 1) / 2);
    if (Math.abs(q - cx) <= 1 && j >= H - 4) return j === H - 2 ? FR('weiss') : T.gold;
    return j >= H / 2 ? FR('blau') : FR('rot');
  }
  return (hash(q, j, 13) % 3 === 0) ? FR('orange') : (j % 2 ? FR('schwarz') : FR('rot'));   // Inferno: Flammen
});

/** Tafel (Domenico Veneziano, Hll. Johannes und Franziskus, um 1450): zwei Heilige vor Goldgrund. */
const veneziano = rahmen((q, j, B, H) => {
  const mitte = Math.floor(B / 2);
  if (q === mitte) return T.gold;
  const links = q < mitte;
  if (j < 3) return links ? FR('braun') : FR('weiss');                  // Fell des Täufers und Kutte
  if (j === 3) return FR('orange');
  return T.gold;
});

module.exports = { FR, T, rahmen, albero, vasari, kruzifix, orcagna, veneziano };
