'use strict';
// Portikus von Santa Felicita unter dem Corridoio Vasariano (gemeinsame Geometrie von santa_felicita und palazzo_pitti Modul 9).
// Der Korridor (Pitti-Maske `korridor`) belegt 277 Zellen des Kirchenumrisses: den Streifen u 0..8,8 vor der Fassade
// (Rahmen SF, siehe project.json). Historisch (Vasari 1564/65) läuft der Gang über dem offenen Portikus der Kirche;
// der Portikus hat drei Rundbogenjoche auf quadratischen Pfeilern (it.wikipedia Chiesa di Santa Felicita).
// Das Pitti-Modul 9 baut Pfeiler und Bögen und spart die Joche unter dem Gang aus (Luft als `arkade`, Pflaster auf Lage 0);
// die Kirche baut ihre Fassade ab u 9,2. Das Balkonfenster des Korridors (Palco der Medici) liegt in der Wand zwischen Gang und Schiff.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');

const PJ = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'project.json'), 'utf8'));
const R = WZ.makeRahmen(PJ.rahmen);
const BODEN_Y = PJ.bodenY;                       // 66
const Y = (yr) => BODEN_Y + yr;
let FUSS = null;
const fuss = () => FUSS || (FUSS = WZ.Maske.ausGebaeude(PJ.gebaeude));

const C = 16.3;                                   // Mitte der Fassade (w)
const BREITE = 3.3;                               // halbe lichte Weite eines Jochs
const MITTEN = [C - 9.9, C, C + 9.9];             // Mitten der drei Joche
const KAEMPFER = 6;                               // Bogenansatz Lage 6 (Y 72), Scheitel Lage 9,3 (Y 75), Unterbau darüber bis Y 76
// Balkonfenster: Breite ±6,5 um die Mitte, Lage yf + 2 .. yf + 6 (yf = 78 am Portikus)
const FENSTER = { a: 6.5, y0: 80, y1: 84 };

/** Lokale Koordinaten einer Zelle (Rahmen SF) oder null, wenn sie nicht im Kirchenumriss liegt. */
function lokal(x, z) {
  if (!fuss().has(x, z)) return null;
  const l = R.toLocal(x, z);
  return { u: l.u, w: l.w };
}
/** Index des Jochs (0..2), in dem w liegt, sonst -1 (Pfeiler). */
function joch(w) { for (let i = 0; i < 3; i++) if (Math.abs(w - MITTEN[i]) <= BREITE) return i; return -1; }
/** Ist die Zelle (x, y, z) im Portikus offen (Luft unter dem Gang)? y ab Pflaster (Y 67) bis Bogenscheitel. */
function offen(x, y, z) {
  const l = lokal(x, z); if (!l) return false;
  const i = joch(l.w); if (i < 0 || y <= Y(0)) return false;
  const dw = Math.abs(l.w - MITTEN[i]);
  return y <= Y(KAEMPFER) || y <= Math.floor(Y(KAEMPFER) + Math.sqrt(Math.max(0, BREITE * BREITE - dw * dw)));
}
/** Pflasterzelle des Portikus (Lage 0)? */
function pflaster(x, z) { const l = lokal(x, z); return !!l && joch(l.w) >= 0; }
/** Gehört die Wandzelle des Korridors zum Balkonfenster (Fensterfläche zum Schiff)? */
function balkonFenster(x, y, z) {
  const l = lokal(x, z); if (!l || l.u < 6) return false;
  return Math.abs(l.w - C) <= FENSTER.a && y >= FENSTER.y0 && y <= FENSTER.y1;
}

module.exports = { PJ, R, Y, BODEN_Y, C, MITTEN, BREITE, KAEMPFER, FENSTER, lokal, joch, offen, pflaster, balkonFenster };
