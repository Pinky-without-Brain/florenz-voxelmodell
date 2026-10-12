'use strict';
// Gemeinsame Geometrie von Orsanmichele (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/orsanmichele/BAUTEIL_KATALOG.md).
// Alle Module nutzen dieselbe Zellklassifikation, damit sich Bauteile nie überlappen (K0: Detail vor Allgemeinem).
//
// Lokaler Rahmen OM (Rückabbildung der Zellmitte): ui = floor(u + 0.5), wi = floor(w + 0.5), geklemmt auf das
// Nominalraster u -34..34, w -24..23. Tiefen d (Zellen von außen, 1 = Außenzelle) werden an der echten
// OSM-Maske gemessen (Kante je Spalte bzw. Zeile), damit Wände immer an der Maskenkante liegen (OSM gewinnt).

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');

const DIR = path.resolve(__dirname, '..');
const BODEN_Y = 68;
const U_MIN = -34, U_MAX = 34, W_MIN = -24, W_MAX = 23;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const Y = (yr) => BODEN_Y + yr;                 // y_rel -> Welt-Y
const K = (x, z) => x + ',' + z;

// ------------------------------------------------------------------ Laden
let cache = null;
function lade() {
  if (cache) return cache;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen;
  const H = masken.haupt;
  const roh = H.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, ui: clamp(Math.floor(l.u + 0.5), U_MIN, U_MAX), wi: clamp(Math.floor(l.w + 0.5), W_MIN, W_MAX) };
  });
  const colMin = new Map(), colMax = new Map(), rowMin = new Map(), rowMax = new Map();
  const upd = (m, k, v, f) => m.set(k, m.has(k) ? f(m.get(k), v) : v);
  for (const c of roh) {
    upd(colMin, c.ui, c.wi, Math.min); upd(colMax, c.ui, c.wi, Math.max);
    upd(rowMin, c.wi, c.ui, Math.min); upd(rowMax, c.wi, c.ui, Math.max);
  }
  const zellen = [];
  const byKey = new Map();
  for (const c of roh) {
    c.dN = c.wi - colMin.get(c.ui) + 1;
    c.dS = colMax.get(c.ui) - c.wi + 1;
    c.dW = c.ui - rowMin.get(c.wi) + 1;
    c.dE = rowMax.get(c.wi) - c.ui + 1;
    c.d = Math.min(c.dN, c.dS, c.dW, c.dE);
    c.seite = c.dN === c.d ? 'N' : c.dS === c.d ? 'S' : c.dW === c.d ? 'W' : 'E';
    zellen.push(c);
    byKey.set(K(c.x, c.z), c);
  }
  cache = { json, masken, R, H, zellen, byKey, bogen: masken.masken.bogen };
  return cache;
}

/** Zelle der Hauptmaske bei (x, z) oder undefined. */
const zelle = (x, z) => lade().byKey.get(K(x, z));

// ------------------------------------------------------------------ Seitenraster (Katalog §0.2)
const LANG = { A0: { mitte: -21 }, A1: { mitte: 0 }, A2: { mitte: 21 } };       // Bogenfelder lange Seiten (N, S)
const KURZ = { B0: { mitte: -11 }, B1: { mitte: 10 } };                          // Bogenfelder kurze Seiten (W, E)
const FENSTER_MITTEN = { N: [-21, 0, 21], S: [-21, 0, 21], W: [-11, 10], E: [-11, 10] };
const SEITEN = ['N', 'S', 'W', 'E'];
const tiefe = (c, s) => (s === 'N' ? c.dN : s === 'S' ? c.dS : s === 'W' ? c.dW : c.dE);
const laengs = (c, s) => (s === 'N' || s === 'S' ? c.ui : c.wi);      // Koordinate entlang der Seite

/**
 * Klasse einer Zelle im Pfeiler-/Feldring (d <= 6):
 *   { typ: 'eck' }                         Eckpfeiler (6 x 6)
 *   { typ: 'lang' | 'kurz', seite }        Pfeiler P1/P2 bzw. Q1
 *   { typ: 'feld', seite, feld, a, ds }    Bogenfeld mit lokaler Koordinate a (-7..7) und Tiefe ds
 *   null                                   Zelle liegt tiefer als 6 (innen)
 */
function ring(c) {
  if (c.d > 6) return null;
  if (Math.min(c.dW, c.dE) <= 6 && Math.min(c.dN, c.dS) <= 6) return { typ: 'eck' };
  const s = c.dN <= 6 ? 'N' : c.dS <= 6 ? 'S' : c.dW <= 6 ? 'W' : 'E';
  const q = laengs(c, s);
  const lang = s === 'N' || s === 'S';
  let feld, a;
  if (lang) {
    if (q <= -14) { feld = 'A0'; a = q + 21; } else if (q >= 14) { feld = 'A2'; a = q - 21; } else if (q >= -7 && q <= 7) { feld = 'A1'; a = q; }
  } else if (q <= -4 && q >= -18) { feld = 'B0'; a = q + 11; } else if (q >= 3 && q <= 17) { feld = 'B1'; a = q - 10; }
  if (!feld || Math.abs(a) > 7) return { typ: lang ? 'lang' : 'kurz', seite: s };
  return { typ: 'feld', seite: s, feld, a, ds: tiefe(c, s) };
}

// ------------------------------------------------------------------ Spitzbogen EG (Katalog §3)
const RHO = 9.15, KAEMPFER = 13;
/** Laibungshöhe y_in(a) in y_rel (kontinuierlich). */
const yIn = (a) => KAEMPFER + Math.sqrt(Math.max(0, RHO * RHO - (Math.abs(a) + 1.65) ** 2));
/** 'luft' unter dem Bogen, 'ring' (Archivolte, 2 Zellen), 'spandrille' darüber (Zellmitte y + 0.5). */
function bogenBereich(a, yr) {
  const h = yIn(a);
  if (yr + 0.5 < h) return 'luft';
  if (yr + 0.5 < h + 2) return 'ring';
  return 'spandrille';
}

// ------------------------------------------------------------------ Türen EG (Katalog §3 Teil 6)
const TUEREN = [{ seite: 'N', feld: 'A1', mitte: 0 }, { seite: 'E', feld: 'B1', mitte: 10 }];
/** 'offen' | 'holz' | 'laibung' | null für eine Zelle der Füllwand (d 3..6) bei y_rel yr. */
function tuer(r, yr, ds) {
  if (!r || r.typ !== 'feld' || ds < 3 || ds > 6) return null;
  const t = TUEREN.find((x) => x.seite === r.seite && x.feld === r.feld);
  if (!t) return null;
  const a = r.a;
  if (Math.abs(a) <= 2 && yr >= 3 && yr <= 12) return ds === 5 ? 'holz' : 'offen';
  if (Math.abs(a) === 3 && yr >= 3 && yr <= 12) return 'laibung';
  if (Math.abs(a) <= 3 && yr === 13) return 'laibung';
  return null;
}

// ------------------------------------------------------------------ Tabernakel (Katalog §2)
// Mitten: lange Seiten u = ±31 (Eckpfeiler, je 1 einwärts, damit sich die Eck-Tabernakel nicht überlappen), ±11;
// kurze Seiten w = -21 / 20 (Ecken) und -1 (Q1).
const TAB_DEFS = [];
for (const s of ['N', 'S']) for (const c of [-31, -11, 11, 31]) TAB_DEFS.push({ seite: s, mitte: c });
for (const s of ['W', 'E']) for (const c of [-21, -1, 20]) TAB_DEFS.push({ seite: s, mitte: c });
let tabMap = null;
function tabKarte() {
  if (tabMap) return tabMap;
  tabMap = new Map();
  const L = lade();
  TAB_DEFS.forEach((t, i) => {
    for (const c of L.zellen) {
      if (tiefe(c, t.seite) !== 1) continue;
      const e = laengs(c, t.seite) - t.mitte;
      if (Math.abs(e) > 2) continue;
      const k = K(c.x, c.z);
      if (tabMap.has(k)) throw new Error(`Tabernakel überlappen bei ${k}`);
      tabMap.set(k, { idx: i, e, seite: t.seite });
    }
  });
  return tabMap;
}
/** Inhalt einer Tabernakelzelle: 'luft' (Nische), 'bank', 'saeule', 'rahmen', 'giebel' oder null. */
function tabInhalt(c, yr) {
  const t = tabKarte().get(K(c.x, c.z));
  if (!t) return null;
  const e = Math.abs(t.e);
  if (yr === 7) return 'bank';
  if (yr >= 8 && yr <= 16) return e <= 1 ? 'luft' : 'saeule';
  if (yr === 17) return 'rahmen';
  if (yr === 18) return e <= 1 ? 'giebel' : null;
  if (yr === 19) return e === 0 ? 'giebel' : null;
  return null;
}

// ------------------------------------------------------------------ Obergeschoss-Fenster und Wappen (Katalog §4/§5)
// Fensteraußenmaß 7 breit (a -3..3), Rahmen 1 in der Außenlage (d = 1), Lichten a = +-1..2, Mittelstütze a = 0.
const FARBEN = ['rot', 'weiss', 'blau', 'gelb'];
const FENSTER_LISTE = [];
for (const s of SEITEN) for (const m of FENSTER_MITTEN[s]) FENSTER_LISTE.push({ seite: s, mitte: m });

/** Fenster, zu dem eine Wandzelle gehört: { idx, a } oder null (Wand d <= 3, Seite = kleinste Tiefe). */
function fensterVon(c) {
  if (c.d > 3) return null;
  const q = laengs(c, c.seite);
  for (const m of FENSTER_MITTEN[c.seite]) {
    if (Math.abs(q - m) <= 3) return { idx: FENSTER_LISTE.findIndex((f) => f.seite === c.seite && f.mitte === m), a: q - m };
  }
  return null;
}

/**
 * Inhalt einer Fensterzelle: 'weiss' (Rahmen/Stütze), 'glas', 'luft' oder null (Wand).
 * y0..y1 = Außenmaß des Fensters (Rahmenzeilen y0 und y1).
 */
function fensterInhalt(c, yr, y0, y1) {
  if (yr < y0 || yr > y1) return null;
  const f = fensterVon(c);
  if (!f) return null;
  const a = Math.abs(f.a), d = c.d;
  const innen = yr > y0 && yr < y1;
  if (innen && a === 0) return 'weiss';                       // Mittelstütze über die ganze Dicke
  if (d === 1 && (!innen || a === 3)) return 'weiss';         // Rahmen in der Außenlage
  if (innen && a >= 1 && a <= 2) return d === 2 ? 'glas' : 'luft';
  return null;
}

/** Wappen 2 x 2 (a -1..0) über einem Fenster in der Außenlage; liefert Farbindex-Basis oder -1. */
function wappenIdx(c, yr, y0, y1) {
  if (c.d !== 1 || yr < y0 || yr > y1) return -1;
  const f = fensterVon(c);
  if (!f || f.a < -1 || f.a > 0) return -1;
  return f.idx;
}

// ------------------------------------------------------------------ Außenzellen im Luftraum (Kranzgesims, Fries, Traufe)
let auss = null;
/** Zellen außerhalb der Maske mit 1 <= dAussen <= 2: { x, z, s, seite, q } (seite nur, wenn seitlich vor einer Fassade). */
function aussen() {
  if (auss) return auss;
  const L = lade();
  const bb = L.H.bbox;
  auss = [];
  for (let x = bb.x0 - 3; x <= bb.x1 + 3; x++) {
    for (let z = bb.z0 - 3; z <= bb.z1 + 3; z++) {
      if (L.H.has(x, z)) continue;
      const s = L.H.dAussen(x, z);
      if (!(s >= 1 && s <= 2)) continue;
      const l = L.R.toLocal(x, z);
      const oN = -24.5 - l.w, oS = l.w - 23.5, oW = -34.5 - l.u, oE = l.u - 34.5;
      let seite = null;
      if (oN > 0 && oW <= 0 && oE <= 0) seite = 'N';
      else if (oS > 0 && oW <= 0 && oE <= 0) seite = 'S';
      else if (oW > 0 && oN <= 0 && oS <= 0) seite = 'W';
      else if (oE > 0 && oN <= 0 && oS <= 0) seite = 'E';
      const ui = clamp(Math.floor(l.u + 0.5), U_MIN, U_MAX), wi = clamp(Math.floor(l.w + 0.5), W_MIN, W_MAX);
      auss.push({ x, z, s, seite, ui, wi, q: seite === 'N' || seite === 'S' ? ui : wi });
    }
  }
  return auss;
}

// Konsolenraster des Arkadenfrieses: Paare im Abstand 6, p = Position im 6er-Takt (0,1 = Konsole, 2..5 = Bogen)
const takt = (q, seite) => (((seite === 'N' || seite === 'S' ? q + 34 : q + 24) % 6) + 6) % 6;

// ------------------------------------------------------------------ Innenraum EG (Katalog §7)
// Joche in u und Schiffe in w. Katalog nennt u -27..27, w -17..16 (55 x 34); der Innenraum d >= 7 ist aber
// u -28..28, w -18..17 (57 x 36). Die Gewölbefelder werden um 1 erweitert, damit sie an die Füllwände stoßen.
const JOCHE = [[-28, -10], [-9, 9], [10, 28]];
const SCHIFFE = [[-18, -1], [0, 17]];
const GEW_ANSATZ = 14, GEW_ANSTIEG = 8;
function feldVon(c) {
  const j = JOCHE.findIndex(([a, b]) => c.ui >= a && c.ui <= b);
  const s = SCHIFFE.findIndex(([a, b]) => c.wi >= a && c.wi <= b);
  if (j < 0 || s < 0) return null;
  return { j, s, x0: JOCHE[j][0], x1: JOCHE[j][1], z0: SCHIFFE[s][0], z1: SCHIFFE[s][1] };
}
/** Laibungsunterkante (y_rel) des Kreuzgewölbes in der Säule (ui, wi) des Feldes f. */
function gewLaibung(vaults, f, ui, wi) {
  const p = { x0: f.x0, x1: f.x1, z0: f.z0, z1: f.z1, riseX: GEW_ANSTIEG, riseZ: GEW_ANSTIEG };
  return GEW_ANSATZ + Math.floor(vaults.groinVaultHeight(p, ui, wi));
}

// Freistehende Pfeiler (4 x 4) und Wandvorlagen (2 x 2)
const PFEILER_INNEN = { u: [[-11, -8], [8, 11]], w: [-2, 1] };
function innenpfeilerSaeule(c) {
  return c.wi >= PFEILER_INNEN.w[0] && c.wi <= PFEILER_INNEN.w[1] && PFEILER_INNEN.u.some(([a, b]) => c.ui >= a && c.ui <= b) && c.d >= 7;
}
function vorlageSaeule(c) {
  if (c.d < 7 || c.d > 8) return false;
  const s = c.seite;
  if (s === 'N' || s === 'S') return c.ui === -10 || c.ui === -9 || c.ui === 9 || c.ui === 10;
  return c.wi === -1 || c.wi === 0;
}

// ------------------------------------------------------------------ Treppe (Katalog §8)
// Geometrie des Katalogs (6 x 6) fasst 25 Stufen nicht; gewählt: U-Treppe an der Nordwand, Lauf 1 w -21..-19
// (Stufen 1..12, u -30..-19), Podest u -18 (w -21..-16, Stufe 13), Lauf 2 w -18..-16 zurück (Stufen 14..25, u -19..-30).
const TREPPE = { w1: [-21, -19], w2: [-18, -16], uA: -30, uB: -19, uPodest: -18, y0: 26 };
/** Stufenhöhe (y_rel der Trittfläche) in der Säule (ui, wi) oder 0. */
function treppeHoehe(ui, wi) {
  const T = TREPPE;
  if (wi >= T.w1[0] && wi <= T.w1[1] && ui >= T.uA && ui <= T.uB) return T.y0 + (ui - T.uA + 1);          // 27..38
  if (ui === T.uPodest && wi >= T.w1[0] && wi <= T.w2[1]) return T.y0 + 13;                                  // 39
  if (wi >= T.w2[0] && wi <= T.w2[1] && ui >= T.uA && ui <= T.uB) return T.y0 + 13 + (T.uB - ui + 1);        // 40..51
  return 0;
}
/** Treppenloch in der Decke OG1 (y 51): über Lauf 2 (inklusive oberster Stufe). */
const treppeLoch = (ui, wi) => wi >= TREPPE.w2[0] && wi <= TREPPE.w2[1] && ui >= TREPPE.uA && ui <= TREPPE.uB;

// ------------------------------------------------------------------ Dach (Katalog §6)
const TRAUFE = 75, DACH_MAX = 79, KAMM = 80, DACH_STAERKE = 2;
/** Unterkante der Dachhaut (y_rel) für Tiefe d (Maskenzellen d >= 1; die Traufe liegt bei d = 1 auf Lage 75). */
const dachUnten = (d) => TRAUFE + Math.min(DACH_MAX - TRAUFE - (DACH_STAERKE - 1), Math.max(0, Math.floor(0.4 * (d - 1))));
/** Oberkante der Dachhaut (y_rel): Unterkante + 1 (2 Lagen stark), höchstens Lage 79. */
const dachOben = (d) => dachUnten(d) + DACH_STAERKE - 1;

// ------------------------------------------------------------------ Verbindungsbogen (Katalog §9)
// Durchgang 5 x 7 in der Westwand OG1 (w 6..10, y_rel 27..33); nur, wenn Modul 8 im Projekt existiert.
const hatModul8 = () => fs.readdirSync(path.join(DIR, 'model')).some((f) => /^m8_.+.js$/.test(f));
const DURCHGANG = { w0: 6, w1: 10, y0: 27, y1: 33 };
/** Zelle der OG1-Westwand im Durchgang (ohne Rücksicht auf das Fenster darüber, das gewinnt, K0). */
const durchgang = (c, yr) => c.d <= 3 && c.seite === 'W' && c.wi >= DURCHGANG.w0 && c.wi <= DURCHGANG.w1 && yr >= DURCHGANG.y0 && yr <= DURCHGANG.y1;

/** Türlaibung des Durchgangs (Katalog §9 Teil 2): Zellen der Westwand OG1 neben dem Durchgang (w 5 und 11), Modul 8 baut sie. */
const laibung = (c, yr) => c.d <= 3 && c.seite === 'W' && (c.wi === DURCHGANG.w0 - 1 || c.wi === DURCHGANG.w1 + 1) && yr >= DURCHGANG.y0 && yr <= DURCHGANG.y1;
/** Fenster- und Wappenmaße der Obergeschosse (y_rel). */
const OG1 = { f0: 33, f1: 44, w0: 46, w1: 47 };
const OG2 = { f0: 58, f1: 67, w0: 68, w1: 69 };

module.exports = {
  hatModul8, DURCHGANG, durchgang, laibung, OG1, OG2,
  lade, zelle, Y, K, BODEN_Y, clamp, SEITEN, tiefe, laengs, ring, yIn, bogenBereich, tuer, TUEREN,
  TAB_DEFS, tabKarte, tabInhalt, FARBEN, FENSTER_LISTE, fensterVon, fensterInhalt, wappenIdx,
  aussen, takt, JOCHE, SCHIFFE, GEW_ANSATZ, GEW_ANSTIEG, feldVon, gewLaibung, innenpfeilerSaeule, vorlageSaeule,
  TREPPE, treppeHoehe, treppeLoch, TRAUFE, DACH_MAX, KAMM, DACH_STAERKE, dachUnten, dachOben
};
