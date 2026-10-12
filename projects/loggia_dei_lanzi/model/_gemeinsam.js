'use strict';
// Gemeinsame Geometrie der Loggia dei Lanzi (Rahmen LL, Maske M_LL, Zellentabelle, Bauteil-Prädikate).
// Katalog: 20_Stadtmodell_Florenz/wahrzeichen/loggia_dei_lanzi/BAUTEIL_KATALOG.md, Korrekturen: PRUEFBERICHT_D1.md.
// Index-Raum: Zelle (iu, iw) = Bereich [iu, iu+1) x [iw, iw+1) im Rahmen LL (floor der Rückabbildung der
// Zellmitte; mit dieser Wahl liegen 2073 von 2080 Maskenzellen im Nominalraster, mit Rundung nur 2025).
// Index-stetige Koordinaten U = u - 0.5, W = w - 0.5 (Zellmitte der Katalogindizes = ganze Zahl).
// Lagen: L = Y - BODEN_Y (Platte = Lage 0 = Y 67, Lage 1 = Y 68).

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');

const DIR = path.resolve(__dirname, '..');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
const BODEN_Y = PJ.bodenY; // 67
const MASKEN = WZ.ladeMasken(PJ, { dir: DIR });
const MASKE = MASKEN.haupt; // M_LL
const RAHMEN = WZ.makeRahmen(PJ.rahmen);

// ---------------------------------------------------------------- Rollen -> Blocktypen
const T = Object.freeze({
  bruch: WZ.typ('pietra_forte_bruch'),
  pflaster: WZ.typ('pflaster'),
  forte: WZ.typ('pietra_forte'),
  serena: WZ.typ('pietra_serena'),
  weiss: WZ.typ('marmor_weiss'),
  ornament: WZ.typ('marmor_ornament'),
  blau: WZ.fresko('blau'),
  gold: WZ.typ('gold'),
  bronze: WZ.typ('bronze')
});

// ---------------------------------------------------------------- Raster der Front (Katalog §0.2)
const U_MIN = -39, U_MAX = 38;                 // 78 Zellen, Spiegelachse u = -0,5
const OST_AB = 16;                             // Ostteil u >= 16: w 0..24; Westteil u <= 15: w 0..27
const W_OST = 24, W_WEST = 27;
const PFEILER = [[-39, -34], [-15, -10], [9, 14], [33, 38]];            // P0..P3 (6 breit)
const BOGEN = [{ u0: -33, u1: -16, m: -24.5 }, { u0: -9, u1: 8, m: -0.5 }, { u0: 15, u1: 32, m: 23.5 }]; // A0..A2
const MEDAILLON_U = [-36, -12, 11, 35];        // Mittelzelle (3 breit: m-1..m+1); symmetrisch um -0,5
const KAEMPFER = 13;                           // Kämpfer = oberste Kapitelllage
const SEITENBOGEN = { w0: 6, w1: 21, m: 13.5, r: 8 };

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// ---------------------------------------------------------------- Zellentabelle
// Jede Zelle von M_LL -> Index (iu, iw) im Nominalraster. Zellen knapp außerhalb des Nominalrasters
// (u = 39 oder w = 28; 7 Zellen) werden auf die Randzelle geklemmt (die Maske gewinnt, Katalog §0.1).
const ZELLEN = [];
const NACH_XZ = new Map();
for (const [x, z] of MASKE.cells) {
  const l = RAHMEN.toLocal(x, z);
  const ru = Math.floor(l.u), rw = Math.floor(l.w);
  const iu = clamp(ru, U_MIN, U_MAX);
  const iw = clamp(rw, 0, iu >= OST_AB ? W_OST : W_WEST);
  const c = { x, z, u: l.u, w: l.w, U: l.u - 0.5, W: l.w - 0.5, ru, rw, iu, iw, d8: MASKE.d8(x, z) };
  ZELLEN.push(c);
  NACH_XZ.set(x * 16384 + z, c);
}
const zelleAn = (x, z) => NACH_XZ.get(x * 16384 + z);

/** Zellen, deren Index in [u0,u1] x [w0,w1] liegt (Rohindex, ungeklemmt: so bleiben Aufbauten ineinander enthalten). */
function rechteck(u0, u1, w0, w1) {
  return ZELLEN.filter((c) => c.ru >= u0 && c.ru <= u1 && c.rw >= w0 && c.rw <= w1);
}

/** Zelle, deren Mitte dem Punkt (U, W) (Index-Raum) am nächsten liegt, aus der Liste. */
function naechste(liste, U, W) {
  let best = null, bd = Infinity;
  for (const c of liste) {
    const d = (c.U - U) ** 2 + (c.W - W) ** 2;
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

const inBereich = (v, [a, b]) => v >= a && v <= b;
const inPfeilerU = (iu) => PFEILER.some((p) => inBereich(iu, p));
const pfeilerIndex = (iu) => PFEILER.findIndex((p) => inBereich(iu, p));
const bogenIndex = (iu) => BOGEN.findIndex((b) => iu >= b.u0 && iu <= b.u1);

// ---------------------------------------------------------------- Prädikate (Index-Raum, Lage L)
/** Bogenöffnung Front (Luft): Lage 3..12 die ganze Bogenbreite, darüber Halbkreis R = 9 um (u_m; Lage 13). */
function bogenLuft(iu, L) {
  const k = bogenIndex(iu);
  if (k < 0 || L < 3) return false;
  if (L < KAEMPFER) return true;
  return (iu - BOGEN[k].m) ** 2 + (L - KAEMPFER) ** 2 <= 81;
}

/** Archivolte Front: Ring zwischen Öffnung (R 9) und Außenkante R 11,5, Lage >= 14 (über den Kapitellen), w 0..5. */
function archivolteFront(iu, iw, L) {
  if (iw > 5 || L <= KAEMPFER) return false;
  for (const b of BOGEN) {
    const d2 = (iu - b.m) ** 2 + (L - KAEMPFER) ** 2;
    if (d2 > 81 && d2 <= 132.25) return true;
  }
  return false;
}

/** Schlussstein: im Scheitel, 2 breit (u_m ± 0,5), Lage 23..24, w 0..2 (Front). */
function schlussstein(iu, iw, L) {
  if (iw > 2 || L < 23 || L > 24) return false;
  return BOGEN.some((b) => Math.abs(iu - b.m) < 1);
}

/** Seitenbogen Ost, Öffnung (Luft): u 36..38, w 6..21; bis Lage 13 rechteckig, darüber Halbkreis R 8 um (13,5; 13). */
function seitenbogenLuft(iu, iw, L) {
  if (iu < 36 || iw < SEITENBOGEN.w0 || iw > SEITENBOGEN.w1 || L < 3) return false;
  if (L <= KAEMPFER) return true;
  return (iw - SEITENBOGEN.m) ** 2 + (L - KAEMPFER) ** 2 <= SEITENBOGEN.r ** 2;
}

/** Archivolte Ost: Ring zwischen Öffnung (R 8) und R 10,5 um (13,5; 13), Lage >= 14, u 36..38. */
function archivolteOst(iu, iw, L) {
  if (iu < 36 || L <= KAEMPFER) return false;
  const d2 = (iw - SEITENBOGEN.m) ** 2 + (L - KAEMPFER) ** 2;
  return d2 > SEITENBOGEN.r ** 2 && d2 <= 110.25;
}

// Mittelzelle der Medaillons: die Weltzelle, die der Mitte (m; w 0) am nächsten liegt (im gedrehten Raster hat
// nicht jeder Rohindex eine Weltzelle; so ist die goldene Mitte garantiert vorhanden).
const MEDAILLON_MITTE = MEDAILLON_U.map((m) => naechste(ZELLEN.filter((c) => c.ru >= m - 1 && c.ru <= m + 1 && c.rw <= 1), m, 0));

/** Medaillon (Front): 3 x 3 Zellen Lage 25..27 über den Pfeilern, Index 0..3 oder -1. */
function medaillonIndex(iu, L) {
  if (L < 25 || L > 27) return -1;
  return MEDAILLON_U.findIndex((m) => iu >= m - 1 && iu <= m + 1);
}

// Konsolsteine (peducci): 8 x 2 x 2 x 2, Lage 11..12, w 19..20, an den Gewölbeansätzen der Rückwandpilaster.
// Je Pilasterachse c (Pfeilermitte) die beiden Joch-Ansätze: links {c-1,5; c-0,5}, rechts {c+0,5; c+1,5}.
// Ausnahme Ostende: Die rechte Seite von P3 (u 36..37) läge in der Öffnung des Seitenbogens und ist durch
// den Ansatz {32,33} ersetzt (Katalog nennt nur "8 Konsolsteine").
const KONSOLEN_U = [[-38, -37], [-36, -35], [-14, -13], [-12, -11], [10, 11], [12, 13], [32, 33], [34, 35]];
const KONSOL_W = [19, 20];
const KONSOL_L = [11, 12];
function konsole(iu, iw, L) {
  return L >= KONSOL_L[0] && L <= KONSOL_L[1] && iw >= KONSOL_W[0] && iw <= KONSOL_W[1]
    && KONSOLEN_U.some((k) => iu >= k[0] && iu <= k[1]);
}

/**
 * Rückwandpilaster (Katalog §2.4): u-Bereiche der Pfeiler, w 19..21; Lage 1..2 Sockel, 3..11 Schaft, 12..13 Kapitell.
 * K0: die Öffnung des Seitenbogens und die Konsolsteine (Details) gewinnen; Wand-Zellen lassen den Pilaster aus.
 * -> 'sockel' | 'schaft' | 'kapitell' | null
 */
function pilaster(iu, iw, L) {
  if (iw < 19 || iw > 21 || !inPfeilerU(iu) || L < 1 || L > 13) return null;
  if (seitenbogenLuft(iu, iw, L) || konsole(iu, iw, L)) return null;
  return L <= 2 ? 'sockel' : L <= 11 ? 'schaft' : 'kapitell';
}

/** Hallenseitige Halbsäule der Innenpfeiler P1/P2 (zwei breit, 1 vorspringend bei w 6), Lage 3..11. */
function halbsaeuleHalle(iu, iw, L) {
  if (iw !== 6 || L < 3 || L > 11) return false;
  const k = pfeilerIndex(iu);
  return (k === 1 || k === 2) && iu >= PFEILER[k][0] + 2 && iu <= PFEILER[k][0] + 3;
}
/** Halbsäulen an den Bogenseiten (±u): zwei breit (w 2..3), 1 vorspringend, Lage 3..11. */
function halbsaeuleBogen(iu, iw, L) {
  if (iw < 2 || iw > 3 || L < 3 || L > 11) return false;
  return BOGEN.some((b) => iu === b.u0 || iu === b.u1);
}

// ---------------------------------------------------------------- Kreuzgewölbe (Katalog §5)
// Joche A0..A2 (24 x 19 Zellen, Kämpfer Lage 13 -> erste Gewölbelage 14). Laibung = Kämpfer + max(hx, hz):
// hx Tonne mit Achse w (Halbweite 12, Stich 9), hz Tonne mit Achse u (Halbweite 9,5, Stich 9).
const JOCHE = [{ u0: -36, u1: -13 }, { u0: -12, u1: 11 }, { u0: 12, u1: 35 }].map((j) => ({ ...j, m: (j.u0 + j.u1) / 2, hw: (j.u1 - j.u0 + 1) / 2 }));
const GEWOELBE_W = { w0: 3, w1: 21 };
const GEWOELBE_STICH = 9;
const GEWOELBE_BASIS = KAEMPFER + 1;
const GURT_U = [[-13, -12], [11, 12]];                     // Gurtbögen über den Innenpfeilern (2 breit)

const jochIndex = (iu) => JOCHE.findIndex((j) => iu >= j.u0 && iu <= j.u1);
const imGewoelbe = (c) => c.ru >= JOCHE[0].u0 && c.ru <= JOCHE[2].u1 && c.rw >= GEWOELBE_W.w0 && c.rw <= GEWOELBE_W.w1;

/** Laibungshöhe über dem Kämpfer (kontinuierlich) an der Zelle c; profileForRise aus tools/geom/arches.js. */
function gewoelbeHoehe(c, profileForRise) {
  const j = JOCHE[jochIndex(clamp(c.ru, JOCHE[0].u0, JOCHE[2].u1))];
  const wz = (GEWOELBE_W.w1 - GEWOELBE_W.w0 + 1) / 2, wm = (GEWOELBE_W.w0 + GEWOELBE_W.w1) / 2;
  const du = clamp(c.U - j.m, -j.hw, j.hw), dw = clamp(c.W - wm, -wz, wz);
  const hx = profileForRise(j.hw, GEWOELBE_STICH)(du);
  const hz = profileForRise(wz, GEWOELBE_STICH)(dw);
  return { hx, hz, h: Math.max(hx, hz) };
}

/** Steht unter der Gewölbezelle ein Kapitell (Front w 3..5 / Pilaster w 19..21)? -> Kämpferstütze. */
function kapitellDarunter(c) {
  const k = pfeilerIndex(c.iu);
  return k >= 0 && ((c.iw >= 3 && c.iw <= 5) || (c.iw >= 19 && c.iw <= 21 && !seitenbogenLuft(c.iu, c.iw, 13)));
}

// ---------------------------------------------------------------- Brüstung (Katalog §6.4)
/** Ring d8 = 1 entlang der Außenkante, ohne die Rückseite östlich u >= 16 (Uffizien-Wand). */
function bruestungZelle(c) {
  if (c.d8 !== 1) return false;
  return !(c.iu >= OST_AB && c.iw >= 23);
}

/** Setzt Lage L der Zelle c (Y = 67 + L). */
function setL(w, c, L, typ) { w.set(c.x, BODEN_Y + L, c.z, typ); }

/** Zellen sortiert wie ein Bauteil gesetzt wird: nach (Lage, x, z) macht der Planer; hier nur stabil nach x, z. */
const lageY = (L) => BODEN_Y + L;

module.exports = {
  WZ, PJ, BODEN_Y, MASKE, MASKEN, RAHMEN, T, ZELLEN, zelleAn, rechteck, naechste, clamp, lageY, setL,
  U_MIN, U_MAX, OST_AB, W_OST, W_WEST, PFEILER, BOGEN, MEDAILLON_U, MEDAILLON_MITTE, KAEMPFER, SEITENBOGEN,
  inBereich, inPfeilerU, pfeilerIndex, bogenIndex,
  bogenLuft, archivolteFront, schlussstein, seitenbogenLuft, archivolteOst, medaillonIndex,
  KONSOLEN_U, KONSOL_W, KONSOL_L, konsole, pilaster, halbsaeuleHalle, halbsaeuleBogen,
  JOCHE, GEWOELBE_W, GEWOELBE_STICH, GEWOELBE_BASIS, GURT_U, jochIndex, imGewoelbe, gewoelbeHoehe, kapitellDarunter,
  bruestungZelle
};

// ---------------------------------------------------------------- Sockel und Statuen (Katalog §7, §8; optional)
// Sockel: Rohindex-Rechtecke im Rahmen LL; alle stehen auf der Bodenplatte (Lage 1 = Y 68).
const SOCKEL = {
  sockel_perseus: { u: [21, 25], w: [10, 14], h: 2 },
  sockel_sabinerinnen: { u: [-27, -22], w: [11, 16], h: 4 },
  sockel_herkules: { u: [-7, -4], w: [12, 15], h: 2 },
  sockel_polyxena: { u: [3, 6], w: [12, 15], h: 2 },
  sockel_menelaos: { u: [-32, -29], w: [15, 18], h: 2 }
};
const RUECKWAND_SOCKEL_U = [-29, -21, -5, 3, 19, 27];                 // je 2 breit, w 19..20, 2 x 2 x 2
const LOEWEN = [{ u: [-9, -8], w: [7, 9] }, { u: [7, 8], w: [7, 9] }]; // 2 x 3 x 2, Lage 1..2 (K5: Y 68)

/** Zentrierte Teilmenge der Zellen (Unterrechteck der Breite bu x bw aus dem Rechteck u x w). */
function zentriert(u, w, bu, bw) {
  const u0 = u[0] + Math.floor((u[1] - u[0] + 1 - bu) / 2), w0 = w[0] + Math.floor((w[1] - w[0] + 1 - bw) / 2);
  const liste = rechteck(u0, u0 + bu - 1, w0, w0 + bw - 1);
  if (liste.length) return liste;
  const alle = rechteck(u[0], u[1], w[0], w[1]);
  return [naechste(alle, (u0 + u0 + bu) / 2 - 0.5, (w0 + w0 + bw) / 2 - 0.5)];
}

module.exports.SOCKEL = SOCKEL;
module.exports.RUECKWAND_SOCKEL_U = RUECKWAND_SOCKEL_U;
module.exports.LOEWEN = LOEWEN;
module.exports.zentriert = zentriert;
