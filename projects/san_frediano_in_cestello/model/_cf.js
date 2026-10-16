'use strict';
// San Frediano in Cestello (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/san_frediano_in_cestello/): lateinisches Kreuz, einschiffig mit vier
// tiefen Seitenkapellen je Seite, Querhaus, Vierungskuppel auf Tambour (Ferri 1689), Presbyterium, Chor, zwei Nebenräume, Campanile (Stufe C).
// Ein Bauplan für alle Module, erste Setzung gewinnt; Module sind Teillisten (modul(n, [...])).
// Rahmen CF (θ = 107,2°): u von der Fassade (u = 0, zum Arno) zur Apsis (u ≈ 106), w quer, w > 0 rechts beim Eintreten. Lagen yr = Y − 58.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const K = require('../../../tools/wahrzeichen/kirche.js');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 58;
const Y = (yr) => BODEN_Y + yr;
const { rund, ell } = K;

// ------------------------------------------------------------------ Maße (Referenzmaße, Stufe in Klammern)
const U_FASS = 2.2;                                      // Fassadenwand u < 2,2 (B: OSM-Umriss)
const U_KAP1 = 40.3;                                     // Ende der Kapellenstreifen (A: building:part w673464736 / w673464734, u 0..40)
const N_BAY = 4;                                         // vier Kapellen je Seite (C: it.wikipedia nennt die „ultima“ links, dritte rechts und links)
const BAY = (U_KAP1 - U_FASS) / N_BAY;
const BAY_C = [0, 1, 2, 3].map((k) => U_FASS + (k + 0.5) * BAY);
const W_N0 = 11.6, W_N1 = 41.8, W_MITTE = 26.7;          // Mittelband (Schiff, Vierung, Presbyterium); Tambour w 11,6..41,8 (A: building:part w673464756)
const WK_W = 9.6, WK_O = 43.8;                           // Kapellenlinien: Wandbänder w 9,6..11,6 und 41,8..43,8
const U_VIE0 = 45.6, U_VIE1 = 75.6;                      // Vierung (A: Tambour u 45,6..75,6)
const U_PRESB1 = 96, U_END = 106.6;                      // Presbyterium bis u 96, Chor bis zur Apsiswand
const W_S0 = 12.6;                                       // Presbyterium und Chor: Mittelband w 12,6..41,8 (A: Nebenräume w < 12,6)
const SAK_W = 10.6;                                      // Nebenraum links: Innenraum w < 10,6, Wandband 10,6..12,6
const U_SAK0 = 79.2;                                     // Nebenräume ab u 79,2 (A: w673464690)
const DOM = { u: 60.6, w: 26.7, ri: 12.5, ra: 15, y0: 32, y1: 44, laterne: 66 };   // Tambour Lage 32..43, Kalotte ab 44 (Durchmesser 30: A)
const DECKE_VIE = 31;                                    // Vierung: Decke der Pendentif-Ecken
const TURM = { u0: 82, u1: 94, w0: 41.8, w1: 52.8, top: 58, glocke0: 42, glocke1: 51, spitze0: 52 };   // Campanile (Lage Stufe C, Rechteck ≈ 12 × 11)
const DECKE_KAP = 14, DECKE_QUER = 22, DECKE_SAK = 11;

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'), serena: WZ.typ('pietra_serena'),
  putz: WZ.typ('putz_weiss'), sand: WZ.typ('putz_sand'), ziegel: WZ.typ('dachziegel'), kuppel: WZ.typ('ziegel_kuppel'), holz: WZ.typ('holz'),
  gold: WZ.typ('gold'), weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), gruen: WZ.typ('marmor_gruen'), rot: WZ.typ('marmor_rot'),
  dunkel: WZ.typ('kontrast_dunkel'), bronze: WZ.typ('bronze'), pflaster: WZ.typ('pflaster'), terrakotta: WZ.typ('putz_rosa'),
  licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), saeule: WZ.typ('marmor_saeule')
};
const GLAS = PAL.typesForRole('glas');
const FR = (n) => WZ.fresko(n);
const inTurm = (c) => c.u >= TURM.u0 && c.u < TURM.u1 && c.w >= TURM.w0 && c.w < TURM.w1;
const rDom = (c) => Math.hypot(c.u - DOM.u, c.w - DOM.w);
const aMitte = (c) => Math.abs(c.w - W_MITTE);

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
  L = { json, masken, R, H, cells, byKey };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

function zone(c) {
  if (inTurm(c)) return 'turm';
  if (c.u < U_FASS) return 'fassade';
  const w = c.w, u = c.u;
  if (u < U_VIE0) {
    if (u >= U_KAP1 && (w < WK_W || w >= WK_O)) return 'masse';
    if (w < WK_W) return 'kap_w';
    if (w < W_N0) return 'wand_w';
    if (w < W_N1) return 'mittel';
    if (w < WK_O) return 'wand_o';
    return 'kap_o';
  }
  if (u < U_VIE1) {
    if (w < WK_W) return 'quer_w';
    if (w < W_N0) return 'wand_qw';
    if (w < W_N1) return 'vierung';
    if (w < WK_O) return 'wand_qo';
    return 'quer_o';
  }
  if (u < U_SAK0) return w >= W_S0 && w < W_N1 ? 'presb' : 'masse';
  const mitte = w >= W_S0 && w < W_N1 ? (u < U_PRESB1 ? 'presb' : 'chor') : null;
  if (mitte) return mitte;
  if (w < SAK_W) return 'sakr_w';
  if (w < W_S0) return 'wand_sw';
  if (w < WK_O) return 'wand_so';
  return u >= TURM.u1 ? 'sakr_o' : 'masse';
}
const bayVon = (u) => Math.max(0, Math.min(N_BAY - 1, Math.floor((u - U_FASS) / BAY)));
/** Rundbogen der Kapellenöffnung in den Kapellenlinien (Breite 7,5, Kämpfer Lage 7). */
const kapBogen = (c) => { const k = bayVon(c.u); return rund(7, c.u - BAY_C[k], 3.75); };

/** Lage der Dachhaut (Oberkante der Dachschicht) je Spalte; null = eigene Hülle (Kuppel, Turm). */
function facTop(c) {
  if (c.w >= WK_W - 1 && c.w < WK_O + 1) return 40 + Math.round(6 * (1 - Math.min(1, aMitte(c) / 17)));       // Giebel der Fassade
  return 22;
}
const von = (c, w0, w1) => (c.w < W_MITTE ? c.w - w0 : w1 - c.w);                      // Abstand von der Außenwand der Seite
function dach(c) {
  switch (c.zone) {
    case 'turm': return null;
    case 'fassade': return facTop(c);
    case 'kap_w': case 'kap_o': return 15 + Math.round(3 * Math.min(1, von(c, 0.5, 53.5) / 9.6));
    case 'wand_w': case 'wand_o': case 'mittel': return 43 - Math.round(9 * Math.min(1, aMitte(c) / 17));
    case 'vierung': return rDom(c) < DOM.ra ? null : 43 - Math.round(9 * Math.min(1, aMitte(c) / 17));
    case 'wand_qw': case 'wand_qo': return rDom(c) < DOM.ra ? null : 43 - Math.round(9 * Math.min(1, aMitte(c) / 17));
    case 'quer_w': case 'quer_o': return 24 + Math.round(6 * Math.min(1, von(c, 0.5, 53.5) / 9.6));
    case 'presb': case 'wand_sw': case 'wand_so': return 38 - Math.round(8 * Math.min(1, aMitte(c) / 17));
    case 'chor': return 34 - Math.round(6 * Math.min(1, aMitte(c) / 17));
    case 'sakr_w': case 'sakr_o': return 17 + Math.round(4 * Math.min(1, von(c, 0.5, 53.5) / 10));
    case 'masse': return 24;
    default: return null;
  }
}
function decke(c) {
  switch (c.zone) {
    case 'kap_w': case 'kap_o': return DECKE_KAP;
    case 'quer_w': case 'quer_o': return DECKE_QUER;
    case 'mittel': return 24 + Math.floor(7 * ell(aMitte(c) / 15.1));
    case 'vierung': return rDom(c) < DOM.ri ? null : DECKE_VIE;
    case 'presb': return 20 + Math.floor(6 * ell(aMitte(c) / 15.1));
    case 'chor': return 19 + Math.floor(4 * ell(aMitte(c) / 15.1));
    case 'sakr_w': case 'sakr_o': return DECKE_SAK;
    default: return null;
  }
}

// ------------------------------------------------------------------ Bauplan
let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const W = K.werkzeuge();
  const { zellen, teile, set, hat, frei, istFrei, oeffnung, unzug, key, oeff, unz, N8 } = W;
  const api = { D, ...W, Y, T, zelleBei };

  const DACH = new Map();
  for (const c of D.cells) DACH.set(P.ck(c.x, c.z), dach(c));
  const dachBei = (x, z) => DACH.get(P.ck(x, z));
  api.dachBei = dachBei;

  // ---- Öffnungen: Hauptportal (Fassade), Türen zu den Nebenräumen
  const PORTAL = { w0: 21.9, w1: 31.5, h: 10 };
  for (const c of D.cells) {
    if (c.zone === 'fassade' && c.w >= PORTAL.w0 && c.w < PORTAL.w1) {
      for (let yr = 1; yr <= rund(PORTAL.h, c.w - (PORTAL.w0 + PORTAL.w1) / 2, (PORTAL.w1 - PORTAL.w0) / 2); yr++) oeffnung('tor', 'portal', c.x, Y(yr), c.z);
    }
    if (c.zone === 'wand_sw' && c.u >= 88.4 && c.u < 92) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'seitenwaende', c.x, Y(yr), c.z);
    if (c.zone === 'wand_so' && c.u >= 99.4 && c.u < 103) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'seitenwaende', c.x, Y(yr), c.z);
  }

  // ---- Modul 0: Fundament und Boden
  for (const c of D.cells) {
    for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
    let t = c.zone === 'turm' ? T.pflaster : T.terrakotta;
    if (c.zone === 'mittel') t = (Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1 ? T.serena : T.weiss;
    else if (c.zone === 'vierung') { const r = rDom(c); t = r < 3 ? T.gold : (Math.floor(r / 2.5) % 2 ? T.rot : T.weiss); }
    else if (c.zone === 'presb' || c.zone === 'chor') t = (Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? T.ornament : T.weiss;
    else if (c.zone === 'fassade') t = T.serena;
    else if (c.zone === 'kap_w' || c.zone === 'kap_o') t = (Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? T.terrakotta : T.weiss;
    set(c.x, Y(0), c.z, t, 'boden');
  }

  // ---- Modul 1: Fassade (Cerutti 1680: die Achse zum Arno gedreht): Portal, Gebälke, Fenster darüber, Giebel
  for (const c of D.cells) {
    if (c.zone !== 'fassade') continue;
    const top = dach(c);
    for (let yr = 1; yr < top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      const aussen = c.u < 1;
      const pil = Math.abs(((c.w + 2) % 7)) < 1.2 || c.w < 1.5 || c.w > 52;
      const gesims = yr === 14 || yr === 15 || yr === 28 || yr === 29 || yr === top - 1;
      const portalRahmen = c.w >= PORTAL.w0 - 1.2 && c.w < PORTAL.w1 + 1.2 && yr <= rund(PORTAL.h, c.w - (PORTAL.w0 + PORTAL.w1) / 2, (PORTAL.w1 - PORTAL.w0) / 2 + 1.2);
      const fe = Math.abs(c.w - W_MITTE) < 2.4 && yr >= 19 && yr <= 24 + Math.sqrt(Math.max(0, 2.4 * 2.4 - (c.w - W_MITTE) ** 2));
      if (fe) { set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.w)) % GLAS.length], 'fassade_fenster'); continue; }
      const t = aussen ? (yr <= 2 || gesims || portalRahmen || (pil && yr <= 28) ? T.serena : T.sand) : T.putz;
      set(c.x, Y(yr), c.z, t, 'fassade');
    }
  }

  // ---- Modul 1: Außenwände der Kirche (d8 <= 2), Fenster der Kapellen, des Querhauses, des Presbyteriums
  const wandTop = (c) => { const d = dach(c); return d === null ? DOM.y1 - 1 : d; };
  for (const c of D.cells) {
    if (c.zone === 'fassade' || c.zone === 'turm' || c.d8 > 2) continue;
    const top = wandTop(c);
    const uc = BAY_C[bayVon(c.u)];
    for (let yr = 1; yr < top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      let fe = false;
      if ((c.zone === 'kap_w' || c.zone === 'kap_o') && c.u < U_KAP1 && Math.abs(c.u - uc) < 1.6 && yr >= 6 && yr <= rund(10, c.u - uc, 1.8) + 1) fe = true;
      if ((c.zone === 'quer_w' || c.zone === 'quer_o') && Math.abs(c.u - 60.6) < 1.6 && yr >= 7 && yr <= rund(13, c.u - 60.6, 1.8) + 1) fe = true;
      if (c.zone === 'chor' && c.u > 100 && Math.abs(c.w - W_MITTE) < 2.2 && yr >= 11 && yr <= 20) fe = true;
      if ((c.zone === 'sakr_w' || c.zone === 'sakr_o') && Math.abs(c.u - 100) < 1.2 && yr >= 5 && yr <= 8) fe = true;
      if (fe) { set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.u)) % GLAS.length], 'fenster'); continue; }
      const t = c.d8 === 1 ? (yr <= 2 ? T.serena : yr === top - 1 ? T.serena : T.sand) : T.putz;
      set(c.x, Y(yr), c.z, t, c.zone === 'masse' ? 'seitenmassen' : 'seitenwaende');
    }
  }
  // Seitenmassen: massives Mauerwerk bis unter das Dach
  for (const c of D.cells) {
    if (c.zone !== 'masse' || c.d8 <= 2) continue;
    for (let yr = 1; yr < wandTop(c); yr++) set(c.x, Y(yr), c.z, T.mauer, 'seitenmassen');
  }

  // ---- Modul 1: Kapellenlinien (Bögen), Querhausbögen, Trennwände der Kapellen, Wände der Nebenräume, Obergaden
  for (const c of D.cells) {
    const top = dach(c);
    if (c.zone === 'wand_w' || c.zone === 'wand_o') {
      const k = bayVon(c.u), uc = BAY_C[k], lai = kapBogen(c);
      for (let yr = 1; yr < top; yr++) {
        if (hat(c.x, Y(yr), c.z)) continue;
        if (lai >= 0 && yr <= lai) continue;                                             // Bogenöffnung zur Kapelle
        const fe = Math.abs(c.u - uc) < 1.7 && yr >= 17 && yr <= 21 + Math.sqrt(Math.max(0, 2.2 * 2.2 - (c.u - uc) ** 2));   // Obergaden
        if (fe) { set(c.x, Y(yr), c.z, T.fenster, 'obergaden_fenster'); continue; }
        const rand = lai >= 0 && yr <= lai + 1;
        set(c.x, Y(yr), c.z, rand ? T.serena : T.putz, yr < 18 ? 'arkaden' : 'obergaden');
      }
    }
    if ((c.zone === 'wand_qw' || c.zone === 'wand_qo') && top != null) {
      const lai = rund(11, c.u - 60.6, 8.5);
      for (let yr = 1; yr < top; yr++) {
        if (hat(c.x, Y(yr), c.z)) continue;
        if (lai >= 0 && yr <= lai) continue;
        set(c.x, Y(yr), c.z, lai >= 0 && yr <= lai + 1 ? T.serena : T.putz, 'querhausbogen');
      }
    }
    if ((c.zone === 'wand_sw' || c.zone === 'wand_so') && top != null) {
      for (let yr = 1; yr < top; yr++) { if (!hat(c.x, Y(yr), c.z) && !istFrei(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, T.putz, 'seitenwaende'); }
    }
    if ((c.zone === 'kap_w' || c.zone === 'kap_o') && c.d8 > 2 && c.u < U_KAP1 && top != null) {                          // Trennwände zwischen den Kapellen (Jochgrenzen)
      if ([1, 2, 3].some((k) => Math.abs(c.u - (U_FASS + BAY * k)) < 1.1)) for (let yr = 1; yr < top; yr++) set(c.x, Y(yr), c.z, T.putz, 'kapellen_trennwaende');
    }
  }

  // ---- Modul 2: Decken (Tonnengewölbe des Schiffs, Kapellen, Querhaus, Presbyterium, Chor), Dachräume unzugänglich
  const deckenTyp = (c, dk) => {
    if (c.zone === 'mittel') return (Math.round(c.u) % 6 === 0) ? T.serena : ((Math.round(c.u / 3) + Math.round(c.w / 3)) % 5 === 0 ? FR('hellblau') : T.putz);
    if (c.zone === 'kap_w' || c.zone === 'kap_o') return (Math.round(c.u) % 5 === 0) ? T.gold : T.putz;
    return T.putz;
  };
  for (const c of D.cells) {
    if (c.d8 <= 2 || c.zone === 'turm') continue;
    const top = dach(c), dk = decke(c);
    if (dk == null || c.zone === 'masse') continue;
    const tp = top == null ? DOM.y1 : top;
    let lo = dk;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); if (n && n.d8 > 2) { const nd = decke(n); if (nd != null && nd < lo) lo = nd; } }
    for (let yr = lo; yr <= dk; yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, deckenTyp(c, dk), c.zone === 'mittel' || c.zone === 'vierung' ? 'tonnengewoelbe' : 'gewoelbe');
    if (top != null) for (let yr = dk + 1; yr < tp; yr++) if (!hat(c.x, Y(yr), c.z) && !istFrei(c.x, Y(yr), c.z)) unzug(c.zone === 'mittel' ? 'dach_langhaus' : 'dach_seiten', 'Dachraum über Decke und Gewölben (ohne Zugang)', c.x, Y(yr), c.z);
  }

  // ---- Modul 2: Kuppel über der Vierung (Ferri 1689): Tambour mit acht Fenstern, Kalotte, Laterne
  for (const c of D.cells) {
    if (c.zone !== 'vierung' && c.zone !== 'wand_qw' && c.zone !== 'wand_qo') continue;
    const r = rDom(c);
    if (r >= DOM.ra) continue;
    const phi = ((Math.atan2(c.w - DOM.w, c.u - DOM.u) * 180 / Math.PI) % 45 + 45) % 45;
    const kk = Math.floor(((Math.atan2(c.w - DOM.w, c.u - DOM.u) * 180 / Math.PI) + 360) / 45) % 8;
    if (r >= DOM.ri) {
      for (let yr = DOM.y0; yr < DOM.y1; yr++) {
        const fenster = yr >= 35 && yr <= 41 && Math.abs(phi - 22.5) < 7;
        const rahmen = !fenster && yr >= 34 && yr <= 43 && Math.abs(phi - 22.5) < 9 && r >= DOM.ra - 1.2;      // Rahmen der Fenster
        const giebel = yr >= 42 && r >= DOM.ra - 1.2 && Math.abs(phi - 22.5) < 9 && (kk % 2 === 0 ? yr - 42 <= (9 - Math.abs(phi - 22.5)) * 0.35 : yr - 42 <= Math.sqrt(Math.max(0, 81 - (phi - 22.5) ** 2)) * 0.25);   // Dreiecks- und Segmentgiebel im Wechsel
        if (fenster) set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.u)) % GLAS.length], 'tambour_fenster');
        else set(c.x, Y(yr), c.z, rahmen || giebel ? T.serena : T.putz, 'tambour');
      }
    }
    const ho = DOM.y1 + Math.sqrt(DOM.ra * DOM.ra - r * r), hi = r < DOM.ri ? DOM.y1 + Math.sqrt(DOM.ri * DOM.ri - r * r) : DOM.y1 - 1;
    for (let yr = Math.ceil(hi); yr <= Math.floor(ho); yr++) set(c.x, Y(yr), c.z, yr >= Math.floor(ho) ? T.kuppel : (r < DOM.ri ? FR(yr % 4 < 2 ? 'blau' : 'hellblau') : T.putz), 'kuppel');
    if (r < 2.5) for (let yr = Math.floor(ho) + 1; yr <= DOM.laterne; yr++) set(c.x, Y(yr), c.z, yr >= DOM.laterne - 1 ? T.gold : (r < 1.5 && yr % 4 === 0 ? T.fenster : T.weiss), 'laterne');
  }

  // ---- Modul 2: Dachhaut; Spalten ohne eigene Dachhöhe (Kuppel, Turm) liefern ihre Hülle selbst
  for (const c of D.cells) {
    const top = dach(c);
    if (top == null || c.zone === 'fassade' || c.zone === 'turm') continue;
    const dk = decke(c);
    let lo = top;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < lo) lo = n; }
    if (dk != null && c.d8 > 2) lo = Math.max(lo, dk + 1);
    const p = ['mittel', 'wand_w', 'wand_o', 'vierung', 'wand_qw', 'wand_qo'].includes(c.zone) ? 'dach_langhaus' : 'dach_seiten';
    for (let yr = lo; yr <= top; yr++) {
      if (hat(c.x, Y(yr), c.z) || istFrei(c.x, Y(yr), c.z)) continue;
      set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.mauer, yr === top ? p : 'schildwaende');
    }
  }
  for (const c of D.cells) {                                                          // Fassade: Giebelkante mit Abdeckung
    if (c.zone !== 'fassade') continue;
    const top = dach(c);
    if (!hat(c.x, Y(top), c.z)) set(c.x, Y(top), c.z, T.serena, 'fassade');
  }

  // ---- Modul 3: Campanile (Stufe C: Lage und Höhe)
  const BU = TURM.u1 - TURM.u0, BW = TURM.w1 - TURM.w0;
  const turmZellen = D.cells.filter((c) => c.zone === 'turm').map((c) => {
    const iu = Math.floor(c.u - TURM.u0), iw = Math.floor(c.w - TURM.w0);
    return { x: c.x, z: c.z, u: c.u, w: c.w, d8: 1 + Math.min(iu, BU - 1 - iu, iw, BW - 1 - iw) };
  });
  const camp = WZ.campanile.baueCampanile({
    cells: turmZellen, set, frei, istFrei, hat, oeffnung, unzug, Y, zellen, teile, key,
    T: { wand: T.mauer, sockel: T.forte, gesims: T.serena, dach: T.kuppel, spitze: T.bronze, holz: T.holz, glocke: T.bronze, fenster: T.fenster, licht: T.licht }
  }, {
    rect: { u0: TURM.u0, u1: TURM.u1, w0: TURM.w0, w1: TURM.w1 }, top: TURM.top, glocke0: TURM.glocke0, glocke1: TURM.glocke1, spitze0: TURM.spitze0,
    abschluss: 'pyramide', sockel: 4, gesimse: [14, 28, TURM.glocke0 - 1], schlitze: { periode: 16, a: 7, b: 10, bis: TURM.glocke0 },
    bogen: { anzahl: 1, breite: 4 }, zugang: { u: 88, w: TURM.w0 }, lichtAbstand: 8
  });
  api.camp = camp;

  // ---- Modul 5/6: Ausstattung nach Quellen
  require('./_cf_ausstattung.js').ausstatten(api);

  // ---- Modul 4: Licht (Seelaternen im Boden, höchstens 12 Blöcke Abstand)
  const steh = [];
  for (const c of D.cells) {
    const b = zellen.get(key(c.x, Y(0), c.z));
    if (b && b.p === 'boden' && !hat(c.x, Y(1), c.z) && !hat(c.x, Y(2), c.z) && !hat(c.x, Y(3), c.z)) steh.push({ x: c.x, y: Y(1), z: c.z });
  }
  K.licht(W, T, steh, 12);
  teile.clear();
  for (const [k, e] of zellen) { let a = teile.get(e.p); if (!a) teile.set(e.p, a = []); a.push(k); }

  PLAN = { zellen, teile, oeff, unz, camp };
  return PLAN;
}

const modul = K.modul(plan, { portal: 'fassade' });

module.exports = { modul, lade, plan, zelleBei, Y, BODEN_Y, T, BAY_C, BAY, TURM, DOM, W_MITTE, N_BAY, U_FASS, U_KAP1, bayVon, rDom, zone, dach, decke };
