'use strict';
// Basilica di San Marco mit Campanile (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/san_marco/): einschiffige Saalkirche, vier Seitenkapellen
// je Seite, Triumphbogen, Presbyterium mit Kuppel, Chor mit Apsis, klassizistische Fassade (1777), Campanile (Baccio d Agnolo 1512).
// Ein Bauplan für die Module 7 (Rohbau), 8 (Ausstattung) und 9 (Campanile); erste Setzung gewinnt.
// Rahmen SM: u von der Fassade (u = 0, Piazza San Marco) nach NNO zur Apsis, w quer (w > 0 nach OSO, zum Konvent). Lagen yr = Y - 68.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');
const M = require('./_malerei.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 68;
const Y = (yr) => BODEN_Y + yr;

// ------------------------------------------------------------------ Maße (Referenzmaße, Stufe in Klammern)
const U_LH0 = 2, U_LH1 = 64, N_BAY = 4;                 // Langhaus u 2..64, vier Joche (OSM-Umriss, B; Joche nach Quellen: je Seite 3 bis 4 Altäre)
const BAY = (U_LH1 - U_LH0) / N_BAY;                    // 15,5
const W_NAVE0 = 12, W_NAVE1 = 31, W_MITTE = 21.5;       // Mittelschiff w 12..31 (19 Blöcke = 9,5 m)
const KAP_W = 10, KAP_O = 33;                           // Kapellenlinien: Wände w 10..12 und 31..33
const DECKE = 30, KAP_DECKE = 15, SAL_DECKE = 21;       // Kassettendecke Lage 30 (15 m), Kapellen 15, Cappella Salviati 21 (C)
const TRAUFE = 36, FIRST = 44;                          // Dach des Mittelschiffs
const TRIUMPH = [64, 66];                               // Triumphbogenwand
const PRESB = { u0: 66, u1: 86, w0: 11, w1: 32 };   // Presbyterium unter der Kuppel (quadratisch 18 x 20)
const DOM = { u: 76, w: 21.5, ri: 8, ra: 10, y0: 31, y1: 39, laterne: 57 };   // Trommel Lage 31..38 auf der Platte Lage 30, Kalotte ab 39
const CHOR = { u0: 86, u1: 96, w0: 9, w1: 26 };         // Chor vor der Apsis (der Campanile steht östlich davon)
const TURM = { u0: 85, u1: 96, w0: 26, w1: 37, top: 70, glocke0: 50, glocke1: 60, spitze0: 61 };   // Campanile (Lage nach OSM-Teil w599900776, 11 x 11 Blöcke, Stufe C)
const BAY_C = [0, 1, 2, 3].map((k) => U_LH0 + (k + 0.5) * BAY);
const SALVIATI = 1;                                     // Joch der Cappella di Sant Antonino (links, zweites Joch)
const TUER_KONVENT = { u: BAY_C[2], breite: 3.4 };      // Tür von der rechten Kapelle (3. Joch) in den Kreuzgang

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'), serena: WZ.typ('pietra_serena'),
  putz: WZ.typ('putz_weiss'), sand: WZ.typ('putz_sand'), ziegel: WZ.typ('dachziegel'), kuppel: WZ.typ('ziegel_kuppel'), holz: WZ.typ('holz'),
  gold: WZ.typ('gold'), weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), gruen: WZ.typ('marmor_gruen'), rot: WZ.typ('marmor_rot'),
  dunkel: WZ.typ('kontrast_dunkel'), bronze: WZ.typ('bronze'), pflaster: WZ.typ('pflaster'), terrakotta: WZ.typ('putz_rosa'),
  licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), saeule: WZ.typ('marmor_saeule')
};
const GLAS = PAL.typesForRole('glas');
const FR = M.FR;
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);
const inTurm = (c) => c.u >= TURM.u0 && c.u < TURM.u1 && c.w >= TURM.w0 && c.w < TURM.w1;
const rDom = (c) => Math.hypot(c.u - DOM.u, c.w - DOM.w);

// ------------------------------------------------------------------ Laden und Zonen
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, K = masken.masken.basilika;
  const cells = K.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, d8: K.d8(x, z), gt: GRUND.groundTopY(x, z) };
  });
  const byKey = new Map();
  for (const c of cells) { c.zone = zone(c); byKey.set(P.ck(c.x, c.z), c); }
  L = { json, masken, R, K, cells, byKey, haupt: cells };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

function zone(c) {
  if (inTurm(c)) return 'turm';
  if (c.u < U_LH0) return 'fassade';
  if (c.u < U_LH1) return c.w < KAP_W ? 'kap_w' : c.w < W_NAVE0 ? 'wand_w' : c.w < W_NAVE1 ? 'mittel' : c.w < KAP_O ? 'wand_o' : 'kap_o';
  if (c.u < TRIUMPH[1]) return c.w >= W_NAVE0 && c.w < W_NAVE1 ? 'triumph' : 'masse';
  if (c.u < PRESB.u1) return c.w >= PRESB.w0 && c.w < PRESB.w1 ? 'presb' : 'masse';
  if (c.u < CHOR.u1) return c.w >= CHOR.w0 && c.w < CHOR.w1 ? 'chor' : 'masse';
  return 'apsis';
}
const bayVon = (u) => Math.max(0, Math.min(N_BAY - 1, Math.floor((u - U_LH0) / BAY)));
/** Rundbogen der Kapellenöffnung in den Kapellenlinien (Breite 11, Kämpfer Lage 7). */
const kapBogen = (c) => { const k = bayVon(c.u); return rund(7, c.u - BAY_C[k], 5.5); };

/** Lage der Dachhaut (Oberkante der Dachschicht) je Spalte; null = eigene Hülle (Kuppel, Turm). */
function facTop(c) {
  const a = Math.abs(c.w - W_MITTE);
  if (c.w >= 9.5 && c.w < 33.5) return 38 + Math.round(8 * (1 - Math.min(1, a / 12)));       // Giebel
  return 25;                                                                                // Seitenteile der Fassade
}
function dach(c) {
  switch (c.zone) {
    case 'turm': return null;
    case 'fassade': return facTop(c);
    case 'kap_w': return (c.u >= U_LH0 + BAY * SALVIATI && c.u < U_LH0 + BAY * (SALVIATI + 1) ? 23 : 17) + Math.round((c.u >= U_LH0 + BAY * SALVIATI && c.u < U_LH0 + BAY * (SALVIATI + 1) ? 2 : 4) * Math.min(1, c.w / 9));
    case 'kap_o': return 17 + Math.round(4 * Math.min(1, (41.5 - c.w) / 9));
    case 'wand_w': case 'wand_o': case 'mittel': case 'triumph': return FIRST - Math.round(8 * Math.min(1, Math.abs(c.w - W_MITTE) / 11.5));
    case 'masse': return 33;
    case 'presb': return rDom(c) >= DOM.ra ? 33 : null;
    case 'chor': return 33;
    case 'apsis': return 33;
    default: return null;
  }
}
function decke(c) {
  switch (c.zone) {
    case 'kap_w': return c.u >= U_LH0 + BAY * SALVIATI && c.u < U_LH0 + BAY * (SALVIATI + 1) ? SAL_DECKE : KAP_DECKE;
    case 'kap_o': return KAP_DECKE;
    case 'mittel': case 'chor': case 'apsis': return DECKE;
    case 'presb': return rDom(c) >= DOM.ri ? DECKE : null;
    default: return null;
  }
}

// ------------------------------------------------------------------ Bauplan
let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const zellen = new Map(), teile = new Map();
  const key = (x, y, z) => x + ',' + y + ',' + z;
  const luft = new Set();
  const set = (x, y, z, t, p, force) => {
    const k = key(x, y, z);
    if (zellen.has(k) || (!force && luft.has(k))) return false;
    zellen.set(k, { x, y, z, t, p });
    let a = teile.get(p); if (!a) teile.set(p, a = []); a.push(k);
    return true;
  };
  const ersetze = (x, y, z, t, p) => { const e = zellen.get(key(x, y, z)); if (!e) return false; e.t = t; e.p = p; return true; };
  const hat = (x, y, z) => zellen.has(key(x, y, z));
  const frei = (x, y, z) => luft.add(key(x, y, z));
  const istFrei = (x, y, z) => luft.has(key(x, y, z));
  const oeff = new Map();
  const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); frei(x, y, z); };
  const unz = new Map();
  const unzug = (p, b, x, y, z) => { const k = p + '|' + b; if (!unz.has(k)) unz.set(k, []); unz.get(k).push({ x, y, z }); };
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const N8 = N4.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
  const api = { D, set, ersetze, hat, frei, istFrei, oeffnung, unzug, key, Y, T, zellen, teile, zelleBei, N4, N8 };

  const DACH = new Map();
  for (const c of D.cells) DACH.set(P.ck(c.x, c.z), dach(c));
  const dachBei = (x, z) => DACH.get(P.ck(x, z));
  api.dachBei = dachBei;

  // ---- Öffnungen: Hauptportal (Fassade), Tür zum Kreuzgang
  const PORTAL = { w0: 17.5, w1: 25.5, h: 9 };
  for (const c of D.cells) {
    if (c.zone === 'fassade') {
      const a = (PORTAL.w1 - PORTAL.w0) / 2;
      if (c.w >= PORTAL.w0 && c.w < PORTAL.w1) for (let yr = 1; yr <= rund(PORTAL.h, c.w - (PORTAL.w0 + PORTAL.w1) / 2, a); yr++) oeffnung('tor', 'portal', c.x, Y(yr), c.z);
    }
    if (c.zone === 'kap_o' && c.w >= 38 && Math.abs(c.u - TUER_KONVENT.u) < TUER_KONVENT.breite / 2) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'seitenwaende', c.x, Y(yr), c.z);
  }

  // ---- Modul 7: Fundament und Boden
  for (const c of D.cells) {
    for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
    let t = c.zone === 'turm' ? T.pflaster : T.terrakotta;
    if (c.zone === 'mittel' || c.zone === 'triumph') t = (Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1 ? T.serena : T.weiss;
    else if (c.zone === 'presb') t = rDom(c) < 3 ? T.gold : (Math.floor(rDom(c) / 2.5) % 2 ? T.rot : T.weiss);
    else if (c.zone === 'chor' || c.zone === 'apsis') t = (Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? T.ornament : T.weiss;
    else if (c.zone === 'fassade') t = T.serena;
    set(c.x, Y(0), c.z, t, 'boden');
  }

  // ---- Fassade (klassizistisch, 1777 bis 1778): Ordnungen mit Pilastern, ein Portal, darüber ein Fenster, Giebel
  for (const c of D.cells) {
    if (c.zone !== 'fassade') continue;
    const top = dach(c);
    for (let yr = 1; yr < top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      const aussen = c.u < 1;
      const pil = Math.abs(((c.w + 2) % 6.5)) < 1.2 || c.w < 1 || c.w > 40;
      const gesims = yr === 15 || yr === 16 || yr === 30 || yr === 31 || yr === top - 1;
      const portalRahmen = c.w >= PORTAL.w0 - 1.2 && c.w < PORTAL.w1 + 1.2 && yr <= rund(PORTAL.h, c.w - (PORTAL.w0 + PORTAL.w1) / 2, (PORTAL.w1 - PORTAL.w0) / 2 + 1.2);
      const fe = c.w >= 19 && c.w < 24 && yr >= 20 && yr <= 26 + Math.sqrt(Math.max(0, 2.5 * 2.5 - (c.w - 21.5) ** 2));
      if (fe) { set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.w)) % GLAS.length], 'fassade_fenster'); continue; }
      const t = aussen ? (yr <= 2 || gesims || portalRahmen || (pil && yr <= 30) ? T.serena : T.sand) : T.putz;
      set(c.x, Y(yr), c.z, t, 'fassade');
    }
  }

  // ---- Modul 7: Außenwände der Kirche (d8 <= 2), Fenster der Kapellen und des Chors
  const wandTop = (c) => { const d = dach(c); return d === null ? 33 : d; };
  for (const c of D.cells) {
    if (c.zone === 'fassade' || c.zone === 'turm' || c.d8 > 2) continue;
    const top = wandTop(c);
    const uc = BAY_C[bayVon(c.u)];
    for (let yr = 1; yr < top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      let fe = false;
      if ((c.zone === 'kap_w' || c.zone === 'kap_o') && Math.abs(c.u - uc) < 1.5 && yr >= 7 && yr <= rund(11, c.u - uc, 1.7) + 1) fe = true;
      if (c.zone === 'apsis' && Math.abs(c.w - 21.5) < 2.2 && c.u > 99 && yr >= 14 && yr <= 24) fe = true;
      if (c.zone === 'chor' && c.u > 90 && c.u < 93 && yr >= 14 && yr <= 24) fe = true;
      if (fe) { set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.u)) % GLAS.length], 'fenster'); continue; }
      const t = c.d8 === 1 ? (yr <= 2 ? T.serena : yr === top - 1 ? T.serena : T.sand) : T.putz;
      set(c.x, Y(yr), c.z, t, c.zone === 'masse' ? 'seitenmassen' : 'seitenwaende');
    }
  }
  // Seitenmassen neben dem Presbyterium und Chor: massives Mauerwerk bis unter das Dach
  for (const c of D.cells) {
    if (c.zone !== 'masse' || c.d8 <= 2) continue;
    for (let yr = 1; yr < wandTop(c); yr++) set(c.x, Y(yr), c.z, T.mauer, 'seitenmassen');
  }

  // ---- Modul 7: Kapellenlinien (Arkaden), Kapellentrennwände, Triumphbogen
  for (const c of D.cells) {
    const top = dach(c);
    if (c.zone === 'wand_w' || c.zone === 'wand_o') {
      const k = bayVon(c.u), uc = BAY_C[k], lai = kapBogen(c);
      for (let yr = 1; yr < top; yr++) {
        if (hat(c.x, Y(yr), c.z)) continue;
        if (lai >= 0 && yr <= lai) continue;                                             // Bogenöffnung zur Kapelle
        const fe = Math.abs(c.u - uc) < 1.7 && yr >= 22 && yr <= 26 + Math.sqrt(Math.max(0, 2.6 * 2.6 - (c.u - uc) ** 2));   // Obergaden
        if (fe) { set(c.x, Y(yr), c.z, T.fenster, 'obergaden_fenster'); continue; }
        const rand = lai >= 0 && yr <= lai + 1;
        set(c.x, Y(yr), c.z, rand ? T.serena : yr === DECKE ? T.serena : T.putz, yr < 20 ? 'arkaden' : 'obergaden');
      }
    }
    if ((c.zone === 'kap_w' || c.zone === 'kap_o') && c.d8 > 2) {                       // Trennwände zwischen den Kapellen (Jochgrenzen)
      if ([1, 2, 3].some((k) => Math.abs(c.u - (U_LH0 + BAY * k)) < 1.1)) for (let yr = 1; yr < top; yr++) set(c.x, Y(yr), c.z, T.putz, 'kapellen_trennwaende');
    }
    if (c.zone === 'triumph') {
      const lai = rund(19, c.w - W_MITTE, 9.2);
      for (let yr = 1; yr < top; yr++) {
        if (lai >= 0 && yr <= lai) continue;
        set(c.x, Y(yr), c.z, lai >= 0 && yr <= lai + 1 ? T.serena : T.putz, 'triumphbogen');
      }
    }
  }

  // ---- Modul 7: Decken (Kassettendecke des Mittelschiffs, Kapellengewölbe, bemalte Decken in Chor und Apsis), Dachräume unzugänglich
  const deckenTyp = (c, dk) => {
    if (c.zone === 'mittel') {
      const du = Math.abs(c.u - 33), dw = Math.abs(c.w - W_MITTE);                                  // Mittelbild: Assunzione (Pucci 1725)
      if (du < 8 && dw < 5) return (du > 7 || dw > 4) ? T.gold : (Math.hypot(du, dw) < 2 ? FR('weiss') : FR(c.w > W_MITTE ? 'blau' : 'hellblau'));
      return (Math.round(c.u) % 4 === 0 && Math.round(c.w) % 4 === 0) ? T.gold : (Math.round(c.u) % 4 === 0 || Math.round(c.w) % 4 === 0) ? T.holz : T.mauer;
    }
    if (c.zone === 'kap_w' || c.zone === 'kap_o') return (Math.round(c.u) % 8 === 0 || Math.round(c.w) % 4 === 0) ? T.serena : (dk === SAL_DECKE ? FR('hellblau') : T.putz);
    if (c.zone === 'chor' || c.zone === 'apsis') return (Math.round(c.u) % 6 === 0 && Math.round(c.w) % 6 === 0) ? T.gold : FR('blau');
    return T.putz;
  };
  for (const c of D.cells) {
    if (c.d8 <= 2 || c.zone === 'turm') continue;
    const top = dach(c), dk = decke(c);
    if (top == null || dk == null || c.zone === 'masse') continue;
    let lo = dk;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); if (n && n.d8 > 2) { const nd = decke(n); if (nd != null && nd < lo) lo = nd; } }
    for (let yr = lo; yr <= dk; yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, deckenTyp(c, dk), c.zone === 'mittel' ? 'kassettendecke' : 'gewoelbe');
    for (let yr = dk + 1; yr < top; yr++) if (!hat(c.x, Y(yr), c.z)) unzug(c.zone === 'mittel' ? 'dach_langhaus' : 'dach_seiten', 'Dachraum über Decke und Gewölben (ohne Zugang)', c.x, Y(yr), c.z);
  }

  // ---- Modul 7: Kuppel über dem Presbyterium (Trommel mit acht Fenstern, Kalotte, Laterne)
  for (const c of D.cells) {
    if (c.zone !== 'presb') continue;
    const r = rDom(c);
    if (r >= DOM.ra) continue;
    if (r >= DOM.ri) {
      const phi = ((Math.atan2(c.w - DOM.w, c.u - DOM.u) * 180 / Math.PI) % 45 + 45) % 45;
      for (let yr = DOM.y0; yr < DOM.y1; yr++) set(c.x, Y(yr), c.z, yr >= 33 && yr <= 36 && Math.abs(phi - 22.5) < 6 ? GLAS[(yr + Math.round(c.u)) % GLAS.length] : T.serena, 'tambour');
    }
    const ho = DOM.y1 + Math.sqrt(DOM.ra * DOM.ra - r * r), hi = r < DOM.ri ? DOM.y1 + Math.sqrt(DOM.ri * DOM.ri - r * r) : DOM.y1 - 1;
    for (let yr = Math.ceil(hi); yr <= Math.floor(ho); yr++) set(c.x, Y(yr), c.z, yr >= Math.floor(ho) ? T.kuppel : (r < DOM.ri ? FR(yr % 4 < 2 ? 'blau' : 'hellblau') : T.putz), 'kuppel');
    if (r < 2.5) for (let yr = Math.floor(ho) + 1; yr <= DOM.laterne; yr++) set(c.x, Y(yr), c.z, yr >= DOM.laterne - 1 ? T.gold : (r < 1.5 && yr % 4 === 0 ? T.fenster : T.weiss), 'laterne');
  }

  // ---- Modul 7: Dachhaut; Spalten ohne eigene Dachhöhe (Kuppel, Turm) liefern ihre Hülle selbst
  for (const c of D.cells) {
    const top = dach(c);
    if (top == null || c.zone === 'fassade' || c.zone === 'turm') continue;
    const dk = decke(c);
    let lo = top;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < lo) lo = n; }
    if (dk != null && c.d8 > 2) lo = Math.max(lo, dk + 1);
    const p = c.zone === 'mittel' || c.zone === 'wand_w' || c.zone === 'wand_o' || c.zone === 'triumph' ? 'dach_langhaus' : 'dach_seiten';
    for (let yr = lo; yr <= top; yr++) {
      if (hat(c.x, Y(yr), c.z) || istFrei(c.x, Y(yr), c.z)) continue;
      set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.mauer, yr === top ? p : 'schildwaende');
    }
  }
  // Fassade: Giebelkante mit Ziegelabdeckung (die Wand reicht bis top - 1), Dach des Mittelschiffs schließt dahinter an
  for (const c of D.cells) {
    if (c.zone !== 'fassade') continue;
    const top = dach(c);
    for (let yr = top; yr <= top; yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, T.serena, 'fassade');
  }

  // ---- Modul 9: Campanile (Baccio d Agnolo 1512): Schaft, Wendeltreppe, Glockenstube, Glocken, Helm
  const BU = TURM.u1 - TURM.u0, BW = TURM.w1 - TURM.w0;
  const turmZellen = D.cells.filter((c) => c.zone === 'turm').map((c) => {
    const iu = Math.floor(c.u - TURM.u0), iw = Math.floor(c.w - TURM.w0);
    return { x: c.x, z: c.z, u: c.u, w: c.w, d8: 1 + Math.min(iu, BU - 1 - iu, iw, BW - 1 - iw) };
  });
  const tuerZellen = turmZellen.filter((c) => c.w < TURM.w0 + 2 && Math.abs(c.u - (TURM.u0 + TURM.u1) / 2) < 1.6);
  const camp = WZ.campanile.baueCampanile({
    cells: turmZellen, set, frei, istFrei, hat, oeffnung, unzug, Y, zellen, teile, key,
    T: { wand: T.mauer, sockel: T.forte, gesims: T.serena, dach: T.kuppel, spitze: T.bronze, holz: T.holz, glocke: T.bronze, fenster: T.fenster, licht: T.licht }
  }, {
    rect: { u0: TURM.u0, u1: TURM.u1, w0: TURM.w0, w1: TURM.w1 }, top: TURM.top, glocke0: TURM.glocke0, glocke1: TURM.glocke1, spitze0: TURM.spitze0,
    abschluss: 'pyramide', sockel: 4, gesimse: [14, 30, TURM.glocke0 - 1], schlitze: { periode: 18, a: 8, b: 11, bis: TURM.glocke0 },
    bogen: { anzahl: 1, breite: 4 }, tueren: [tuerZellen], lichtAbstand: 8
  });
  api.camp = camp;

  if (api.ausstattenKirche) api.ausstattenKirche(api);

  // ---- Licht: Seelaternen im Fußboden der Kirche (höchstens 12 Blöcke Abstand)
  const steh = [];
  for (const c of D.cells) {
    const b = zellen.get(key(c.x, Y(0), c.z));
    if (b && b.p === 'boden' && !hat(c.x, Y(1), c.z) && !hat(c.x, Y(2), c.z) && !hat(c.x, Y(3), c.z)) steh.push({ x: c.x, y: Y(1), z: c.z });
  }
  const lichtTeil = [];
  for (const l of WZ.lichtRaster(steh, { abstand: 12 })) {
    const k = key(l.x, l.y, l.z), e = zellen.get(k);
    if (!e) continue;
    teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = 'licht'; lichtTeil.push(k);
  }
  teile.set('licht', (teile.get('licht') || []).concat(lichtTeil));
  teile.clear();
  for (const [k, e] of zellen) { let a = teile.get(e.p); if (!a) teile.set(e.p, a = []); a.push(k); }

  PLAN = { zellen, teile, oeff, unz, camp };
  return PLAN;
}

// ------------------------------------------------------------------ Module aus dem Plan
const OEFF_TEIL = { portal: 'fassade' };
function modul(n, liste) {
  return {
    module: n,
    build(ctx) {
      const Pl = plan();
      for (const id of liste) {
        const keys = Pl.teile.get(id) || [];
        if (keys.length) {
          const cells = keys.map((k) => Pl.zellen.get(k));
          const typ = new Map(cells.map((c) => [c.x + ',' + c.y + ',' + c.z, c.t]));
          ctx.part(id).fill(cells, (x, y, z) => typ.get(x + ',' + y + ',' + z));
        }
        for (const [k, z] of Pl.oeff) { const [art, pp] = k.split('|'); if ((OEFF_TEIL[pp] || pp) === id) ctx.oeffnung(z, art); }
        for (const [k, z] of Pl.unz) { const i = k.indexOf('|'); if (k.slice(0, i) === id) ctx.unzugaenglich(z, k.slice(i + 1)); }
      }
    }
  };
}

module.exports = { modul, lade, plan, zelleBei, Y, BODEN_Y, T, BAY_C, BAY, TURM, DOM, PRESB, CHOR, W_MITTE, DECKE, U_LH0, U_LH1, N_BAY, SALVIATI, TUER_KONVENT, rund, bayVon, rDom };
