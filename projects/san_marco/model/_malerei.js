'use strict';
// Gemalte Felder (Fresken und Tafelbilder) des Konvents San Marco als Farbfunktionen: (q, j, B, H) -> Blocktyp.
// q Spalte 0..B-1 (von links), j Zeile 0..H-1 (unten 0). Alles vereinfacht, nicht nach Vorbild.
const WZ = require('../../../tools/wahrzeichen');
const { hash, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');

const FR = (n) => WZ.fresko(n);
const T = { gold: WZ.typ('gold'), holz: WZ.typ('holz'), weiss: WZ.typ('marmor_weiss'), dunkel: WZ.typ('kontrast_dunkel'), putz: WZ.typ('putz_weiss'), serena: WZ.typ('pietra_serena') };

/** Goldrahmen (1 breit) um ein Feld, innen inner(q, j, B, H). */
const rahmen = (inner) => (q, j, B, H) => ((q === 0 || q === B - 1 || j === 0 || j === H - 1) ? T.gold : inner(q - 1, j - 1, B - 2, H - 2));

/** Kleines Zellenfresko: Himmel, Boden, eine Hauptfigur mit Heiligenschein; Szene und Farben aus der Zellennummer. */
const zelle = (nr) => rahmen((q, j, B, H) => {
  const szene = nr % 6, cx = Math.floor((B - 1) / 2);
  const boden = Math.max(1, Math.floor(H * 0.25));
  const robe = ['weiss', 'rot', 'blau', 'gelb', 'orange', 'gruen'][(nr * 5) % 6];
  const himmel = szene === 3 ? FR('gelb') : szene === 4 ? FR('blau') : FR('hellblau');
  if (j < boden) return szene === 0 || szene === 5 ? FR('gruen') : FR('braun');
  const dx = Math.abs(q - cx);
  if (szene === 1) {                                           // Kreuzigung
    if (dx === 0 && j < H - 1) return j === H - 2 ? FR('orange') : T.holz;
    if (j === H - 3 && dx <= 1) return T.holz;
  } else if (szene === 2) {                                    // Verkündigung: zwei Figuren
    if (j < boden + 2 && (q === 0 || q === B - 1)) return FR(q === 0 ? 'rot' : 'blau');
    if (j === boden + 2 && (q === 0 || q === B - 1)) return FR('orange');
  } else {
    if (dx === 0 && j < boden + 2) return FR(robe);
    if (dx === 0 && j === boden + 2) return FR('orange');
    if (dx <= 1 && j === boden + 3) return T.gold;             // Heiligenschein
  }
  return himmel;
});

/** Verkündigung (Fra Angelico, um 1442): Loggia mit zwei Säulen, links Gabriel (Rosa/Rot), rechts Maria (Blau), Garten und Boden. */
const verkuendigung = rahmen((q, j, B, H) => {
  const boden = 1, bogen = H - 2;
  if (j < boden) return FR('braun');
  const mitte = Math.floor(B / 2);
  if (q === mitte && j < bogen) return T.weiss;                // Säule
  if (j === bogen && Math.abs(q - mitte) < 4) return T.weiss;   // Bogenansatz
  if (j >= bogen - 1 && Math.abs(q - mitte) < 4) return FR('gelb');
  const gabriel = q >= 1 && q <= 2, maria = q >= B - 3 && q <= B - 2;
  if (gabriel) { if (j < 4) return FR('rot'); if (j === 4) return FR('orange'); if (j === 5) return T.gold; if (q === 1 && j < 6 && j > 3) return T.gold; }
  if (maria) { if (j < 3) return FR('blau'); if (j === 3) return FR('orange'); if (j === 4) return T.gold; }
  if (q < mitte - 1 && j < 3) return FR('gruen');              // Garten
  return FR('hellblau');
});

/** Kreuzigung mit Heiligen (Kapitelsaal, Fra Angelico 1442): drei Kreuze, Reihen kniender Heiliger am Fuß. */
const kreuzigung = rahmen((q, j, B, H) => {
  const cx = Math.floor((B - 1) / 2), boden = 3;
  if (j < boden) return hash(q, j, 5) % 3 === 0 ? FR('braun') : FR('gruen');
  const dx = Math.abs(q - cx);
  for (const off of [-Math.floor(B / 4), 0, Math.floor(B / 4)]) {
    const x = cx + off, hoch = off === 0 ? H - 2 : H - 5;
    if (q === x && j <= hoch) return j === hoch - 1 ? FR('orange') : (j > hoch - 4 && off === 0 ? FR('weiss') : T.holz);
    if (j === hoch - 3 && Math.abs(q - x) === 1) return T.holz;
  }
  if (j < boden + 5 && dx > 2) {                               // kniende Heilige in Reihen (Weiß und Schwarz der Dominikaner)
    const sp = mod(q, 3);
    if (sp === 1 && j < boden + 3) return hash(q, 7, 1) % 2 ? T.weiss : FR('schwarz');
    if (sp === 1 && j === boden + 3) return FR('orange');
    if (sp === 1 && j === boden + 4) return T.gold;
  }
  return FR('hellblau');
});

/** Abendmahl (Ghirlandaio 1486): Tafel, dreizehn Figuren, Landschaft mit Arkade dahinter. */
const abendmahl = rahmen((q, j, B, H) => {
  const tisch = 2, kopf = 5;
  if (j < tisch) return T.holz;
  if (j === tisch) return T.weiss;
  const sp = mod(q, 1);
  if (j <= kopf - 2) { const f = hash(q, 3, 9) % 5; return [FR('rot'), FR('blau'), FR('weiss'), FR('gruen'), FR('orange')][f]; }
  if (j === kopf - 1) return (q === Math.floor(B / 2)) ? T.gold : FR('orange');
  if (j === kopf) return (q === Math.floor(B / 2)) ? T.gold : FR('braun');
  if (j >= H - 2) return mod(q, 3) === 0 ? T.weiss : FR('hellblau');       // Arkade
  return mod(q, 3) === 0 && j > kopf ? FR('gruen') : FR('hellblau');
});

/** Speisung der Dominikaner (Sogliani 1536): Tafel mit Mönchen in Weiß und Schwarz, Engel (Weiß und Gold) im Himmel. */
const speisung = rahmen((q, j, B, H) => {
  const tisch = 3;
  if (j < 2) return hash(q, j, 3) % 2 ? FR('braun') : FR('gelb');
  if (j === 2) return T.holz;
  if (j === tisch) return T.weiss;
  if (j <= tisch + 3) { const sp = mod(q, 3); if (sp === 1) return j === tisch + 3 ? FR('orange') : (hash(q, 5, 5) % 2 ? T.weiss : FR('schwarz')); return FR('hellblau'); }
  if (j >= H - 3 && mod(q, 7) < 2) return j === H - 3 ? T.gold : T.weiss;      // Engel
  return FR('hellblau');
});

/** Tafelbild (Ospizio, Foresteria): Goldgrund mit Figurengruppe. */
const tafel = (nr) => rahmen((q, j, B, H) => {
  const mitte = Math.floor(B / 2);
  if (j < 2) return FR('braun');
  if (Math.abs(q - mitte) <= 1 && j < H - 3) return FR(['rot', 'blau', 'weiss'][nr % 3]);
  if (Math.abs(q - mitte) <= 1 && j === H - 3) return FR('orange');
  if (Math.abs(q - mitte) <= 1 && j === H - 2) return T.gold;
  if (q < mitte - 1 && j < H - 4 && q > 0) return FR(['gruen', 'gelb', 'blau'][(nr + q) % 3]);
  if (q > mitte + 1 && j < H - 4) return FR(['orange', 'rot', 'weiss'][(nr + q) % 3]);
  return T.gold;
});

module.exports = { FR, T, rahmen, zelle, verkuendigung, kreuzigung, abendmahl, speisung, tafel };
