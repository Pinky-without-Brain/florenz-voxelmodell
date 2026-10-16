'use strict';
// Santi Michele e Gaetano (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/san_gaetano/): lateinisches Kreuz, einschiffig mit drei Kapellen je Seite,
// breites Querhaus mit je einer Kapelle im Arm, quadratischer Chor mit Kuppel (1630), Apsis mit kleiner Kuppel, Sakristei, Campanile (Buontalenti).
// Ein Bauplan für alle Module, erste Setzung gewinnt; Module sind Teillisten (modul(n, [...])).
// Rahmen SG (θ = 179,04°): u von der Fassade (u = 0, Piazza degli Antinori) nach Westen zur Apsis, w quer, w > 0 rechts beim Eintreten (Norden).
// Lagen yr = Y − 64.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const K = require('../../../tools/wahrzeichen/kirche.js');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 64;
const Y = (yr) => BODEN_Y + yr;
const { rund, ell } = K;

// ------------------------------------------------------------------ Maße (Stufe in Klammern: B aus OSM gemessen, C Entwurf)
const U_FASS = 2.5;                                      // Fassadenwand u < 2,5 (B)
const U_NAVE1 = 25.5;                                    // Ende des Langhauses, Beginn des Querhauses (B: Umriss springt bei u 22 bis 26)
const N_BAY = 3;                                         // drei Kapellen je Seite (A: it.wikipedia)
const BAY = (U_NAVE1 - U_FASS) / N_BAY;
const BAY_C = [0, 1, 2].map((k) => U_FASS + (k + 0.5) * BAY);
const W_MITTE = 15.5;
const WS = 8, WS1 = 10, WN0 = 21, WN1 = 23;             // Kapellen w < 8 und ≥ 23, Wandbänder 8..10 und 21..23, Mittelschiff w 10..21 (C)
const U_QU1 = 50, U_R1 = 52;                             // Querhaus bis u 50, Rückwand des Querhauses u 50..52 (B/C)
const CH = { u0: 52, u1: 76, w0: 4, w1: 27 };           // Chor, quadratisch 24 × 23 (A: quadratische Basis; Maße C)
const U_TRI = 78;                                        // Triumphbogenwand u 76..78
const AP = { w0: 7, w1: 24 };                            // Apsis w 7..24 (C)
const DOM = { u: 64, w: 15.5, ri: 9, ra: 11.5, y0: 27, y1: 35, laterne: 52 };   // Chorkuppel (1630): Tambour Lage 27..34, Kalotte ab 35 (C)
const DOMB = { u: 90, w: 15.5, ri: 6.5, ra: 8.5, y0: 23, y1: 23, laterne: 0 };  // kleine Kuppel der Apsis (A: it.wikipedia)
const TURM = { u0: 76, u1: 89, w0: -8, w1: 5, top: 56, glocke0: 42, glocke1: 51, spitze0: 52 };   // Campanile (Buontalenti 1604 bis 1618; Lage C)
const DECKE_KAP = 14, DECKE_SAK = 12;

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
const rDom = (c, d = DOM) => Math.hypot(c.u - d.u, c.w - d.w);
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
  const u = c.u, w = c.w;
  if (inTurm(c)) return 'turm';
  if (u < U_FASS) return 'fassade';
  if (u < U_NAVE1) {
    if (w >= 31.5 || w < 0) return 'masse';
    if (w < WS) return 'kap_s';
    if (w < WS1) return 'wand_s';
    if (w < WN0) return 'mittel';
    if (w < WN1) return 'wand_n';
    return 'kap_n';
  }
  if (u < U_QU1) {
    if (w < WS) return 'quer_s';
    if (w < WS1) return 'wand_qs';
    if (w < WN0) return 'vierung';
    if (w < WN1) return 'wand_qn';
    return 'quer_n';
  }
  if (u < U_R1) return 'wand_r';
  if (u < CH.u1) {
    if (w >= CH.w0 && w < CH.w1) return 'chor';
    if (w < CH.w0 - 2) return 'raum_s';
    if (w < CH.w0) return 'wand_cs';
    if (w < CH.w1 + 2) return 'wand_cn';
    return 'sakr_n';
  }
  if (u < U_TRI) return 'triumph';
  if (w >= AP.w0 && w < AP.w1) return 'apsis';
  if (w >= AP.w0 - 2 && w < AP.w1 + 2) return 'wand_a';
  return 'masse';
}
const bayVon = (u) => Math.max(0, Math.min(N_BAY - 1, Math.floor((u - U_FASS) / BAY)));
/** Rundbogen der Kapellenöffnung in den Wandbändern (Breite 5, Kämpfer Lage 6). */
const kapBogen = (c) => { const k = bayVon(c.u); return rund(6, c.u - BAY_C[k], 2.5); };

function facTop(c) {
  if (c.w >= WS && c.w < WN1) return 36 + Math.round(5 * (1 - Math.min(1, aMitte(c) / 7.5)));       // Mittelteil mit Giebel
  return 22;
}
const vonAussen = (c, w0, w1) => (c.w < W_MITTE ? c.w - w0 : w1 - c.w);
function dach(c) {
  switch (c.zone) {
    case 'turm': return null;
    case 'fassade': return facTop(c);
    case 'kap_s': case 'kap_n': return 16 + Math.round(3 * Math.min(1, vonAussen(c, 0, 31) / 8));
    case 'wand_s': case 'wand_n': case 'mittel': case 'vierung': case 'wand_qs': case 'wand_qn': return 38 - Math.round(7 * Math.min(1, aMitte(c) / 10));
    case 'quer_s': case 'quer_n': return 24 + Math.round(6 * (1 - Math.min(1, Math.abs(c.u - 37.75) / 12.25)));
    case 'wand_r': return 30;
    case 'chor': return rDom(c) < DOM.ra ? null : 32;
    case 'wand_cs': case 'wand_cn': return 30;
    case 'triumph': return 30;
    case 'apsis': return rDom(c, DOMB) < DOMB.ra ? null : 23;
    case 'wand_a': return 23;
    case 'raum_s': case 'sakr_n': return 17 + Math.round(3 * Math.min(1, Math.abs(c.u - 64) / 12));
    case 'masse': return 24;
    default: return null;
  }
}
function decke(c) {
  switch (c.zone) {
    case 'kap_s': case 'kap_n': return DECKE_KAP;
    case 'mittel': case 'vierung': return 24 + Math.floor(6 * ell(aMitte(c) / 5.6));
    case 'quer_s': case 'quer_n': return 19 + Math.floor(5 * ell(Math.abs(c.u - 37.75) / 12.25));
    case 'chor': return rDom(c) < DOM.ri ? null : 26;
    case 'apsis': return rDom(c, DOMB) < DOMB.ri ? null : 22;
    case 'raum_s': case 'sakr_n': return DECKE_SAK;
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

  // ---- Öffnungen: drei Portale (Fassade), Durchgänge zwischen den Kapellen, Triumphbogen, Türen zu Sakristei, Raum und Querhaus
  const PORTAL = { w0: 12, w1: 19, h: 12, name: 'portal' };
  const SEITENPORTALE = [{ w0: 2.8, w1: 6.8 }, { w0: 24.2, w1: 28.2 }];
  for (const c of D.cells) {
    if (c.zone === 'fassade') {
      if (c.w >= PORTAL.w0 && c.w < PORTAL.w1) for (let yr = 1; yr <= rund(PORTAL.h - 3, c.w - (PORTAL.w0 + PORTAL.w1) / 2, (PORTAL.w1 - PORTAL.w0) / 2) + 3; yr++) oeffnung('tor', 'portal', c.x, Y(yr), c.z);
      for (const s of SEITENPORTALE) if (c.w >= s.w0 && c.w < s.w1) for (let yr = 1; yr <= rund(5, c.w - (s.w0 + s.w1) / 2, (s.w1 - s.w0) / 2) + 2; yr++) oeffnung('tor', 'portal', c.x, Y(yr), c.z);
    }
    if (c.zone === 'wand_r' && c.w >= 7 && c.w < 24) for (let yr = 1; yr <= rund(10, c.w - W_MITTE, 8.5); yr++) oeffnung('loggia', 'triumphbogen', c.x, Y(yr), c.z);   // Bogen vom Querhaus zum Chor
    if (c.zone === 'triumph' && c.w >= 8 && c.w < 23) for (let yr = 1; yr <= rund(10, c.w - W_MITTE, 7.5); yr++) oeffnung('loggia', 'triumphbogen', c.x, Y(yr), c.z);       // Triumphbogen zur Apsis
    if (c.zone === 'wand_cn' && c.u >= 60 && c.u < 64) for (let yr = 1; yr <= 6; yr++) oeffnung('tuer', 'seitenwaende', c.x, Y(yr), c.z);                                   // Tür zur Sakristei
    if (c.zone === 'wand_cs' && c.u >= 68 && c.u < 72) for (let yr = 1; yr <= 6; yr++) oeffnung('tuer', 'seitenwaende', c.x, Y(yr), c.z);                                   // Tür zum Nebenraum
    if (c.zone === 'wand_r' && c.w >= 28 && c.w < 31 && false) oeffnung('tuer', 'seitenwaende', c.x, Y(1), c.z);
  }

  // ---- Modul 0: Fundament und Boden
  for (const c of D.cells) {
    for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
    let t = c.zone === 'turm' ? T.pflaster : T.terrakotta;
    if (c.zone === 'mittel' || c.zone === 'vierung') t = (Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1 ? T.serena : T.weiss;
    else if (c.zone === 'chor') { const r = rDom(c); t = r < 3 ? T.gold : (Math.floor(r / 2.5) % 2 ? T.rot : T.weiss); }
    else if (c.zone === 'apsis' || c.zone === 'triumph') t = (Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? T.ornament : T.weiss;
    else if (c.zone === 'fassade') t = T.serena;
    else if (c.zone === 'kap_s' || c.zone === 'kap_n' || c.zone === 'quer_s' || c.zone === 'quer_n') t = (Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? T.terrakotta : T.weiss;
    set(c.x, Y(0), c.z, t, 'boden');
  }

  // ---- Modul 1: Fassade (Silvani, Pietra forte, zwei Ordnungen mit Doppelpilastern, drei Portale mit Dreiecksgiebeln, Rosette)
  for (const c of D.cells) {
    if (c.zone !== 'fassade') continue;
    const top = dach(c);
    const mitte = c.w >= WS && c.w < WN1;
    for (let yr = 1; yr < top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      const aussen = c.u < 1.2;
      const doppel = Math.abs(((c.w + 0.5) % 5.2)) < 1.1 || c.w < 1.2 || c.w > 29.8;               // Pilasterpaare
      const gesims = yr === 15 || yr === 16 || yr === 29 || yr === 30 || yr === top - 1;
      const rose = mitte && Math.hypot(c.w - W_MITTE, yr - 24) < 3.1;
      if (rose) { set(c.x, Y(yr), c.z, Math.hypot(c.w - W_MITTE, yr - 24) > 2.2 ? T.gold : GLAS[(yr + Math.round(c.w)) % GLAS.length], 'fassade_fenster'); continue; }
      const dreieck = (w0, w1, hBasis) => c.w >= w0 && c.w < w1 && yr > hBasis && yr <= hBasis + Math.ceil((w1 - w0) / 2 - Math.abs(c.w - (w0 + w1) / 2));
      const giebel = dreieck(PORTAL.w0 - 1, PORTAL.w1 + 1, PORTAL.h + 1) || SEITENPORTALE.some((s) => dreieck(s.w0 - 1, s.w1 + 1, 8));
      const portalRahmen = (c.w >= PORTAL.w0 - 1 && c.w < PORTAL.w1 + 1 && yr <= PORTAL.h + 1) || SEITENPORTALE.some((s) => c.w >= s.w0 - 1 && c.w < s.w1 + 1 && yr <= 8);
      const t = aussen ? (yr <= 2 || gesims || giebel || portalRahmen || (doppel && yr <= 30) ? T.serena : T.forte) : T.putz;
      set(c.x, Y(yr), c.z, t, 'fassade');
    }
  }

  // ---- Modul 1: Außenwände der Kirche (d8 <= 2), Fenster
  const wandTop = (c) => { const d = dach(c); return d === null ? DOM.y1 - 1 : d; };
  for (const c of D.cells) {
    if (c.zone === 'fassade' || c.zone === 'turm' || c.d8 > 2) continue;
    const top = wandTop(c);
    const uc = BAY_C[bayVon(c.u)];
    for (let yr = 1; yr < top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      let fe = false;
      if ((c.zone === 'kap_s' || c.zone === 'kap_n') && Math.abs(c.u - uc) < 1.3 && yr >= 5 && yr <= rund(9, c.u - uc, 1.4) + 1) fe = true;
      if ((c.zone === 'quer_s' || c.zone === 'quer_n') && Math.abs(c.u - 37.75) < 2.6 && yr >= 7 && yr <= rund(14, c.u - 37.75, 2.7) + 1) fe = true;
      if (c.zone === 'chor' && Math.abs(c.w - 15.5) < 2.6 && yr >= 7 && yr <= rund(13, c.w - 15.5, 2.7) + 1) fe = true;
      if (c.zone === 'apsis' && Math.abs(c.w - 15.5) < 2 && yr >= 7 && yr <= 14) fe = true;
      if ((c.zone === 'sakr_n' || c.zone === 'raum_s') && Math.abs(c.u - 70) < 1.2 && yr >= 4 && yr <= 8) fe = true;
      if (fe) { set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.u)) % GLAS.length], 'fenster'); continue; }
      const t = c.d8 === 1 ? (yr <= 2 ? T.serena : yr === top - 1 ? T.serena : T.sand) : T.putz;
      set(c.x, Y(yr), c.z, t, c.zone === 'masse' ? 'seitenmassen' : 'seitenwaende');
    }
  }
  for (const c of D.cells) {                                                         // Mauermassen: massiv bis unter das Dach
    if (c.zone !== 'masse' || c.d8 <= 2) continue;
    for (let yr = 1; yr < wandTop(c); yr++) set(c.x, Y(yr), c.z, T.mauer, 'seitenmassen');
  }

  // ---- Modul 1: Wandbänder (Kapellenbögen, Querhausbögen, Triumphbögen, Wände der Nebenräume), Trennwände der Kapellen mit Durchgängen
  for (const c of D.cells) {
    const top = dach(c);
    if (c.zone === 'wand_s' || c.zone === 'wand_n') {
      const k = bayVon(c.u), uc = BAY_C[k], lai = kapBogen(c);
      for (let yr = 1; yr < top; yr++) {
        if (hat(c.x, Y(yr), c.z)) continue;
        if (lai >= 0 && yr <= lai) continue;
        const fe = Math.abs(c.u - uc) < 1.7 && yr >= 20 && yr <= 23 + Math.sqrt(Math.max(0, 2.6 * 2.6 - (c.u - uc) ** 2));   // Fenster über den Kapellen
        if (fe) { set(c.x, Y(yr), c.z, T.fenster, 'obergaden_fenster'); continue; }
        set(c.x, Y(yr), c.z, lai >= 0 && yr <= lai + 1 ? T.serena : T.putz, yr < 17 ? 'arkaden' : 'obergaden');
      }
    }
    if ((c.zone === 'wand_qs' || c.zone === 'wand_qn') && top != null) {
      const lai = rund(11, c.u - 37.75, 10.5);
      for (let yr = 1; yr < top; yr++) {
        if (hat(c.x, Y(yr), c.z)) continue;
        if (lai >= 0 && yr <= lai) continue;
        set(c.x, Y(yr), c.z, lai >= 0 && yr <= lai + 1 ? T.serena : T.putz, 'querhausbogen');
      }
    }
    if ((c.zone === 'wand_r' || c.zone === 'triumph') && top != null) {
      for (let yr = 1; yr < top; yr++) {
        if (hat(c.x, Y(yr), c.z) || istFrei(c.x, Y(yr), c.z)) continue;
        set(c.x, Y(yr), c.z, T.putz, 'triumphbogen');
      }
    }
    if ((c.zone === 'wand_cs' || c.zone === 'wand_cn' || c.zone === 'wand_a') && top != null) {
      for (let yr = 1; yr < top; yr++) { if (!hat(c.x, Y(yr), c.z) && !istFrei(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, T.putz, 'seitenwaende'); }
    }
    if ((c.zone === 'kap_s' || c.zone === 'kap_n') && c.d8 > 2 && top != null) {                           // Trennwände (Jochgrenzen) mit Durchgang 4 × 5 in Wandmitte
      if ([1, 2].some((k) => Math.abs(c.u - (U_FASS + BAY * k)) < 1.1)) {
        const wc = c.zone === 'kap_s' ? 4.5 : 26.5;
        for (let yr = 1; yr < top; yr++) {
          if (Math.abs(c.w - wc) < 2 && yr <= 5) { oeffnung('tuer', 'kapellen_trennwaende', c.x, Y(yr), c.z); continue; }
          set(c.x, Y(yr), c.z, T.putz, 'kapellen_trennwaende');
        }
      }
    }
  }

  // ---- Modul 2: Decken (Tonne mit Stichkappen, Kapellen, Querhaus, Chor, Apsis), Dachräume unzugänglich
  const deckenTyp = (c, dk) => {
    if (c.zone === 'mittel' || c.zone === 'vierung') return Math.round(c.u / 2.5) % 3 === 0 ? T.serena : T.putz;       // Gurtbögen
    if (c.zone === 'kap_s' || c.zone === 'kap_n') return (Math.round(c.u) % 4 === 0) ? T.gold : T.putz;
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

  // ---- Modul 2: Kuppeln (Chor 1630: Tambour mit Fenstern, Kalotte, Laterne; Apsis: kleine Kalotte)
  const kuppelBauen = (c, d, zonen, teilKuppel, fenster) => {
    if (!zonen.includes(c.zone)) return;
    const r = rDom(c, d);
    if (r >= d.ra) return;
    const phi = ((Math.atan2(c.w - d.w, c.u - d.u) * 180 / Math.PI) % 45 + 45) % 45;
    if (r >= d.ri) {
      for (let yr = d.y0; yr < d.y1; yr++) {
        const fe = fenster && yr >= d.y0 + 3 && yr <= d.y1 - 2 && Math.abs(phi - 22.5) < 7;
        if (fe) set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.u)) % GLAS.length], 'tambour_fenster');
        else set(c.x, Y(yr), c.z, T.putz, 'tambour');
      }
    }
    const ho = d.y1 + Math.sqrt(d.ra * d.ra - r * r), hi = r < d.ri ? d.y1 + Math.sqrt(d.ri * d.ri - r * r) : d.y1 - 1;
    for (let yr = Math.ceil(hi); yr <= Math.floor(ho); yr++) set(c.x, Y(yr), c.z, yr >= Math.floor(ho) ? T.kuppel : (r < d.ri ? FR(yr % 4 < 2 ? 'blau' : 'hellblau') : T.putz), teilKuppel);
    if (d.laterne && r < 2.5) for (let yr = Math.floor(ho) + 1; yr <= d.laterne; yr++) set(c.x, Y(yr), c.z, yr >= d.laterne - 1 ? T.gold : (r < 1.5 && yr % 4 === 0 ? T.fenster : T.weiss), 'laterne');
  };
  for (const c of D.cells) { kuppelBauen(c, DOM, ['chor'], 'kuppel', true); kuppelBauen(c, DOMB, ['apsis'], 'kuppel_apsis', false); }

  // ---- Modul 2: Dachhaut; Spalten ohne eigene Dachhöhe (Kuppel, Turm) liefern ihre Hülle selbst
  for (const c of D.cells) {
    const top = dach(c);
    if (top == null || c.zone === 'fassade' || c.zone === 'turm') continue;
    const dk = decke(c);
    let lo = top;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < lo) lo = n; }
    if (dk != null && c.d8 > 2) lo = Math.max(lo, dk + 1);
    const p = ['mittel', 'wand_s', 'wand_n', 'vierung', 'wand_qs', 'wand_qn'].includes(c.zone) ? 'dach_langhaus' : 'dach_seiten';
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

  // ---- Modul 3: Campanile (Buontalenti 1604 bis 1618; Lage und Höhe Stufe C)
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
    bogen: { anzahl: 1, breite: 4 }, kleineGlocken: 1, zugang: { u: 82, w: TURM.w0 }, lichtAbstand: 8
  });
  api.camp = camp;

  // ---- Modul 5: Ausstattung nach Quellen
  require('./_sg_ausstattung.js').ausstatten(api);

  // ---- Modul 4: Licht
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

module.exports = { modul, lade, plan, zelleBei, Y, BODEN_Y, T, BAY_C, BAY, TURM, DOM, DOMB, CH, AP, W_MITTE, N_BAY, U_FASS, U_NAVE1, bayVon, rDom, zone, dach, decke };
