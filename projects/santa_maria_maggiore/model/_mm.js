'use strict';
// Santa Maria Maggiore (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/santa_maria_maggiore/): gotische dreischiffige Pfeilerkirche mit drei Jochen,
// Kreuzgewölbe, spitzen Arkaden auf quadratischen Pfeilern, erhöhtem quadratischem Presbyterium mit Chor, Seitenkapellen mit flachem Abschluss,
// Stumpf des romanischen Campanile mit der „Berta“ an der Fassade. Ein Bauplan für alle Module (modul(n, [...])).
// Rahmen MM (θ = 0): u von der Fassade (u = 0, Piazza di Santa Maria Maggiore, Westen) nach Osten, w quer, w > 0 nach Süden = rechts beim Eintreten.
// Lagen yr = Y − 63.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const K = require('../../../tools/wahrzeichen/kirche.js');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 63;
const Y = (yr) => BODEN_Y + yr;
const { mod } = K;

// ------------------------------------------------------------------ Maße (Stufe in Klammern: B aus OSM gemessen, C Entwurf)
const U_FASS = 2.2;                                      // Fassadenwand u < 2,2
const BREAKS = [2.2, 12.47, 22.73, 33, 46, 59.6];      // Joche: drei im Langhaus (A: it.wikipedia), Presbyterium (33..46, quadratisch) und Chor (46..59,6)
const N_BAY = 5;
const U_PRESB = 33;                                      // Beginn des erhöhten Presbyteriums (A: erhöht, einige Stufen)
const W_MITTE = 27.5;
const WN1 = 18, WN2 = 20, WS1 = 35, WS2 = 37;           // Mittelschiff w 20..35 (15), Pfeilerreihen 18..20 und 35..37, Seitenschiffe w < 18 und ≥ 37 (C)
const SPRING = 28, RISE = 8;                            // Mittelschiff: Gewölbeansatz Lage 28, Scheitel 36 (C)
const SPRING_S = 15, RISE_S = 7;                        // Seitenschiffe: Ansatz 15, Scheitel 22 (C)
const PODEST = 2;                                        // Presbyterium zwei Lagen erhöht (zwei Stufen aus Treppenblöcken)
const TURM = { u0: 0, u1: 12, w0: 7, w1: 20, top: 40 };  // Stumpf des Campanile (A: obere Glockenstube 1630 abgetragen; Höhe C)

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'), serena: WZ.typ('pietra_serena'),
  putz: WZ.typ('putz_weiss'), sand: WZ.typ('putz_sand'), ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'),
  gold: WZ.typ('gold'), weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), gruen: WZ.typ('marmor_gruen'), rot: WZ.typ('marmor_rot'),
  dunkel: WZ.typ('kontrast_dunkel'), bronze: WZ.typ('bronze'), pflaster: WZ.typ('pflaster'), terrakotta: WZ.typ('putz_rosa'),
  licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), saeule: WZ.typ('marmor_saeule')
};
const GLAS = PAL.typesForRole('glas');
const FR = (n) => WZ.fresko(n);
const inTurm = (c) => c.u >= TURM.u0 && c.u < TURM.u1 && c.w >= TURM.w0 && c.w < TURM.w1;
const aMitte = (c) => Math.abs(c.w - W_MITTE);
/** Spitzbogenprofil 0..1 (1 im Scheitel, 0 am Ansatz). */
const spitz = (t) => Math.max(0, 1 - Math.abs(t) ** 1.6);
/** Höhe eines Spitzbogens: y0 + hh · profil, −1 außerhalb der Weite a. */
const bogenHoehe = (y0, x, a, hh) => (Math.abs(x) < a ? Math.floor(y0 + hh * spitz(x / a)) : -1);

// ------------------------------------------------------------------ Laden und Zonen
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt;
  const cells = H.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z) };
  });
  const byKey = new Map();
  for (const c of cells) { c.zone = zone(c); byKey.set(P.ck(c.x, c.z), c); }
  // Seitenschiffbreite je u: äußerste Wand (kleinstes bzw. größtes w der Maske)
  const aussen = new Map();
  for (const c of cells) {
    const k = Math.round(c.u);
    const a = aussen.get(k) || { n: Infinity, s: -Infinity };
    if (c.w < WN1 && c.w < a.n) a.n = c.w;
    if (c.w >= WS2 && c.w > a.s) a.s = c.w;
    aussen.set(k, a);
  }
  L = { json, masken, R, H, cells, byKey, aussen };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

function zone(c) {
  const u = c.u, w = c.w;
  if (inTurm(c)) return 'turm';
  if (u < U_FASS) return 'fassade';
  if (w < WN1) return 'sch_n';
  if (w < WN2) return 'wand_n';
  if (w < WS1) return u < U_PRESB ? 'mittel' : (u < BREAKS[4] ? 'presb' : 'chor');
  if (w < WS2) return 'wand_s';
  return 'sch_s';
}
const bayVon = (u) => { for (let k = 0; k < N_BAY; k++) if (u < BREAKS[k + 1]) return k; return N_BAY - 1; };
const bayMitte = (k) => (BREAKS[k] + BREAKS[k + 1]) / 2;
const bayLaenge = (k) => BREAKS[k + 1] - BREAKS[k];
const tU = (c) => { const k = bayVon(c.u); return (c.u - bayMitte(k)) / (bayLaenge(k) / 2); };
/** Seitenschiff: Mitte und halbe Breite des Innenraums (zwischen innerer Wandlage und Pfeilerreihe). */
function schiff(c) {
  const a = lade().aussen.get(Math.round(c.u)) || { n: 8, s: 47 };
  if (c.zone === 'sch_n') { const w0 = a.n + 2, w1 = WN1; return { m: (w0 + w1) / 2, h: Math.max(2, (w1 - w0) / 2), aussen: a.n }; }
  const w0 = WS2, w1 = a.s - 1; return { m: (w0 + w1) / 2, h: Math.max(2, (w1 - w0) / 2), aussen: a.s };
}

function facTop(c) {
  if (c.w >= WN1 && c.w < WS2) return 46 - Math.round(6 * Math.min(1, aMitte(c) / 9.5));       // Mittelteil
  return 27;
}
function dach(c) {
  switch (c.zone) {
    case 'turm': return null;
    case 'fassade': return facTop(c);
    case 'sch_n': case 'sch_s': return 23 + Math.round(2 * Math.min(1, (c.d8 - 1) / 8));
    case 'wand_n': case 'wand_s': case 'mittel': case 'presb': case 'chor': return 44 - Math.round(8 * Math.min(1, aMitte(c) / 9.5));
    default: return null;
  }
}
function decke(c) {
  switch (c.zone) {
    case 'mittel': case 'presb': case 'chor': {
      const tw = (c.w - W_MITTE) / 7.5;
      return SPRING + Math.floor(RISE * Math.max(spitz(tU(c)), spitz(tw)));
    }
    case 'sch_n': case 'sch_s': {
      const s = schiff(c);
      return SPRING_S + Math.floor(RISE_S * Math.max(spitz(tU(c)), spitz((c.w - s.m) / s.h)));
    }
    default: return null;
  }
}

// ------------------------------------------------------------------ Bauplan
let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const W = K.werkzeuge();
  const { zellen, teile, set, hat, istFrei, oeffnung, key, oeff, unz, unzug, N8 } = W;
  const api = { D, ...W, Y, T, zelleBei };

  const DACH = new Map();
  for (const c of D.cells) DACH.set(P.ck(c.x, c.z), dach(c));
  const dachBei = (x, z) => DACH.get(P.ck(x, z));
  api.dachBei = dachBei;
  const podestHoehe = (c) => ((c.zone === 'presb' || c.zone === 'chor') ? PODEST : 0);

  // ---- Öffnungen: Hauptportal (spitz, mit Giebel), Portal des südlichen Seitenschiffs, Tür zur Via dei Cerretani (Nordwand)
  const PORTAL = { w0: 24, w1: 31, h: 8 };
  const SPORTAL = { w0: 40, w1: 44, h: 6 };
  for (const c of D.cells) {
    if (c.zone === 'fassade') {
      for (const [p, hh] of [[PORTAL, 5], [SPORTAL, 3]]) {
        if (c.w >= p.w0 && c.w < p.w1) for (let yr = 1; yr <= bogenHoehe(p.h, c.w - (p.w0 + p.w1) / 2, (p.w1 - p.w0) / 2, hh); yr++) oeffnung('tor', 'portal', c.x, Y(yr), c.z);
      }
    }
    if (c.zone === 'sch_n' && c.d8 <= 2 && c.u >= 24 && c.u < 28) for (let yr = 1; yr <= 6; yr++) oeffnung('tuer', 'seitenwaende', c.x, Y(yr), c.z);       // Portal zur Via dei Cerretani
  }

  // ---- Modul 0: Fundament, Boden, Podest des Presbyteriums mit zwei Stufen
  for (const c of D.cells) {
    for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
    let t = T.terrakotta;
    if (c.zone === 'mittel') t = (Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1 ? T.serena : T.weiss;
    else if (c.zone === 'turm') t = T.pflaster;
    else if (c.zone === 'fassade') t = T.serena;
    else if (c.zone === 'sch_n' || c.zone === 'sch_s') t = (Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? T.terrakotta : T.weiss;
    set(c.x, Y(0), c.z, t, 'boden');
    if (c.zone === 'presb' || c.zone === 'chor') {
      const k = c.u - U_PRESB;
      if (k < 1) set(c.x, Y(1), c.z, PAL.treppe('pietra_serena', 'o'), 'stufen');                                   // erste Stufe (Treppenblock, Aufstieg nach Osten)
      else {
        set(c.x, Y(1), c.z, T.serena, 'podest');
        if (k < 2) set(c.x, Y(2), c.z, PAL.treppe('pietra_serena', 'o'), 'stufen');                                 // zweite Stufe
        else set(c.x, Y(2), c.z, (Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? T.ornament : T.weiss, 'boden_presbyterium');
      }
    }
  }

  // ---- Modul 1: Fassade (Steinverkleidung, spitzes Hauptportal mit Giebel, Dreiecksgiebel über den Portalen)
  for (const c of D.cells) {
    if (c.zone !== 'fassade') continue;
    const top = dach(c);
    for (let yr = 1; yr < top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      const aussen = c.u < 1.2;
      const gurt = yr === 14 || yr === 26 || yr === top - 1;
      const dreieck = (p, hb, hh) => c.w >= p.w0 - 1 && c.w < p.w1 + 1 && yr > hb && yr <= hb + Math.ceil(hh - Math.abs(c.w - (p.w0 + p.w1) / 2) * hh / ((p.w1 - p.w0) / 2 + 1));
      const giebel = dreieck(PORTAL, PORTAL.h + 6, 6) || dreieck(SPORTAL, SPORTAL.h + 4, 4);
      const rahmen = (c.w >= PORTAL.w0 - 1 && c.w < PORTAL.w1 + 1 && yr <= PORTAL.h + 6) || (c.w >= SPORTAL.w0 - 1 && c.w < SPORTAL.w1 + 1 && yr <= SPORTAL.h + 4);
      const t = aussen ? (yr <= 2 || gurt || giebel || rahmen ? T.serena : T.forte) : T.serena;           // innen Pietra serena (Gegenfassade 1595/96)
      set(c.x, Y(yr), c.z, t, 'fassade');
    }
  }

  // ---- Modul 1: Außenwände (d8 <= 2) mit spitzen Fenstern in den Jochen
  const wandTop = (c) => { const d = dach(c); return d === null ? 30 : d; };
  for (const c of D.cells) {
    if (c.zone === 'fassade' || c.zone === 'turm' || c.d8 > 2) continue;
    const top = wandTop(c);
    const k = bayVon(c.u), uc = bayMitte(k);
    for (let yr = 1; yr < top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      let fe = false;
      if ((c.zone === 'sch_n' || c.zone === 'sch_s') && Math.abs(c.u - uc) < 1.3 && yr >= 6 && yr <= bogenHoehe(11, c.u - uc, 1.4, 4) + 1) fe = true;
      if (c.zone !== 'sch_n' && c.zone !== 'sch_s' && c.u > 56 && Math.abs(c.w - W_MITTE) < 2.6 && yr >= 8 && yr <= bogenHoehe(22, c.w - W_MITTE, 2.7, 5)) fe = true;     // Ostfenster des Chors
      if ((c.zone === 'sch_n' || c.zone === 'sch_s') && c.u > 56 && Math.abs(c.w - (c.zone === 'sch_n' ? 9 : 43)) < 1.6 && yr >= 7 && yr <= 14) fe = true;
      if (fe) { set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.u)) % GLAS.length], 'fenster'); continue; }
      const t = c.d8 === 1 ? (yr <= 2 || yr === top - 1 ? T.serena : T.forte) : T.putz;
      set(c.x, Y(yr), c.z, t, 'seitenwaende');
    }
  }

  // ---- Modul 1: Pfeilerreihen mit Spitzbogenarkaden (quadratische Pfeiler) und Obergaden mit spitzen Fenstern
  for (const c of D.cells) {
    if (c.zone !== 'wand_n' && c.zone !== 'wand_s') continue;
    const top = dach(c);
    const k = bayVon(c.u), uc = bayMitte(k), a = bayLaenge(k) / 2 - 1.4;
    const lai = bogenHoehe(8, c.u - uc, a, 8);
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z)) continue;
      if (lai >= 0 && yr <= lai) continue;
      const fe = Math.abs(c.u - uc) < 1.6 && yr >= 27 && yr <= bogenHoehe(27, c.u - uc, 1.7, 5);
      if (fe) { set(c.x, Y(yr), c.z, T.fenster, 'obergaden_fenster'); continue; }
      const rand = lai >= 0 && yr <= lai + 1;
      set(c.x, Y(yr), c.z, rand ? T.serena : T.putz, yr < 17 ? 'arkaden' : 'obergaden');
    }
  }

  // ---- Modul 1: Stumpf des Campanile (massiv bis Lage 40), Fensterschlitze in zwei Reihen, Kopf der Berta
  for (const c of D.cells) {
    if (c.zone !== 'turm') continue;
    for (let yr = 1; yr <= TURM.top; yr++) {
      if (hat(c.x, Y(yr), c.z)) continue;
      let t = c.d8 <= 2 ? (c.d8 === 1 ? T.forte : T.mauer) : T.mauer;
      if (c.d8 === 1 && yr >= 11 && yr <= 14 && mod(Math.round(c.u + c.w), 3) === 0) t = T.dunkel;       // Reihe der Einzelfenster (Schatten)
      if (c.d8 === 1 && yr >= 21 && yr <= 24 && mod(Math.round(c.u + c.w), 3) === 0) t = T.dunkel;
      if (yr === TURM.top) t = T.serena;
      set(c.x, Y(yr), c.z, t, 'campanile_stumpf');
    }
  }

  // ---- Modul 2: Kreuzgewölbe (Mittelschiff, Seitenschiffe, Presbyterium, Chor), Dachräume unzugänglich
  const deckenTyp = (c, dk) => {
    const gurt = BREAKS.some((b) => Math.abs(c.u - b) < 0.6);              // Gurtbögen an den Jochgrenzen
    if (gurt) return T.serena;
    return Math.round(c.w - c.u) % 6 === 0 && c.zone !== 'sch_n' && c.zone !== 'sch_s' ? T.serena : T.putz;       // Grate (Diagonalrippen)
  };
  for (const c of D.cells) {
    if (c.d8 <= 2 || c.zone === 'turm') continue;
    const top = dach(c), dk = decke(c);
    if (dk == null || top == null) continue;
    let lo = dk;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); if (n && n.d8 > 2) { const nd = decke(n); if (nd != null && nd < lo) lo = nd; } }
    const ph = podestHoehe(c);
    for (let yr = lo; yr <= dk; yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, deckenTyp(c, dk), 'kreuzgewoelbe');
    for (let yr = dk + 1; yr < top; yr++) if (!hat(c.x, Y(yr), c.z) && !istFrei(c.x, Y(yr), c.z)) unzug(c.zone === 'sch_n' || c.zone === 'sch_s' ? 'dach_seitenschiffe' : 'dach_mittelschiff', 'Dachraum über den Kreuzgewölben (ohne Zugang)', c.x, Y(yr), c.z);
    void ph;
  }

  // ---- Modul 2: Dachhaut je Spalte bis zum tiefsten der acht Nachbarn
  for (const c of D.cells) {
    const top = dach(c);
    if (top == null || c.zone === 'fassade' || c.zone === 'turm') continue;
    const dk = decke(c);
    let lo = top;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < lo) lo = n; }
    // an den Stumpf des Campanile: Schildwand bis zur Höhe des Nachbarn nicht nötig (Stumpf ist höher)
    if (dk != null && c.d8 > 2) lo = Math.max(lo, dk + 1);
    const p = c.zone === 'sch_n' || c.zone === 'sch_s' ? 'dach_seitenschiffe' : 'dach_mittelschiff';
    for (let yr = lo; yr <= top; yr++) {
      if (hat(c.x, Y(yr), c.z) || istFrei(c.x, Y(yr), c.z)) continue;
      set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.mauer, yr === top ? p : 'schildwaende');
    }
  }
  for (const c of D.cells) {                                                           // Fassade: Abdeckung der Kante
    if (c.zone !== 'fassade') continue;
    const top = dach(c);
    if (!hat(c.x, Y(top), c.z)) set(c.x, Y(top), c.z, T.serena, 'fassade');
  }

  // ---- Modul 5/6: Ausstattung nach Quellen
  require('./_mm_ausstattung.js').ausstatten(api);

  // ---- Modul 4: Licht (im Boden, auf dem Podest in der Podestplatte)
  const steh = [];
  for (const c of D.cells) {
    if (c.zone === 'presb' || c.zone === 'chor') {
      const b = zellen.get(key(c.x, Y(2), c.z));
      if (b && b.p === 'boden_presbyterium' && !hat(c.x, Y(3), c.z) && !hat(c.x, Y(4), c.z) && !hat(c.x, Y(5), c.z)) steh.push({ x: c.x, y: Y(3), z: c.z });
      continue;
    }
    const b = zellen.get(key(c.x, Y(0), c.z));
    if (b && b.p === 'boden' && !hat(c.x, Y(1), c.z) && !hat(c.x, Y(2), c.z) && !hat(c.x, Y(3), c.z)) steh.push({ x: c.x, y: Y(1), z: c.z });
  }
  K.licht(W, T, steh, 12);
  teile.clear();
  for (const [k, e] of zellen) { let a = teile.get(e.p); if (!a) teile.set(e.p, a = []); a.push(k); }

  PLAN = { zellen, teile, oeff, unz };
  return PLAN;
}

const modul = K.modul(plan, { portal: 'fassade' });

module.exports = { modul, lade, plan, zelleBei, Y, BODEN_Y, T, BREAKS, N_BAY, bayVon, bayMitte, bayLaenge, W_MITTE, U_FASS, U_PRESB, PODEST, TURM, zone, dach, decke, schiff, WN1, WN2, WS1, WS2 };
