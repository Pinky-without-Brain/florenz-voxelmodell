'use strict';
// Santi Apostoli (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/santi_apostoli/): romanische Säulenbasilika mit drei Schiffen, Säulen aus grünem
// Prato-Marmor mit Rundbögen, offenem Holzdach (1333), flachem Chor mit halbrunder Apsis (aus dem OSM-Umriss), Seitenkapelle des 16. Jahrhunderts
// an der Südseite, Fassade zur tief liegenden Piazza del Limbo mit Portal des 16. Jahrhunderts. Ein Bauplan für alle Module (modul(n, [...])).
// Rahmen SA (θ = 20°): u von der Fassade (u = 0, Piazza del Limbo, Westnordwest) nach Ostsüdost zur Apsis, w quer, w > 0 rechts (Süden). Lagen yr = Y − 59.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const K = require('../../../tools/wahrzeichen/kirche.js');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 59;
const Y = (yr) => BODEN_Y + yr;
const { mod } = K;

// ------------------------------------------------------------------ Maße (Stufe in Klammern: B aus OSM gemessen, C Entwurf)
const U_FASS = 2.2;                                      // Fassadenwand u < 2,2
const N_BAY = 6;                                         // sechs Arkadenjoche (C; Quelle nennt Säulen, aber keine Zahl)
const U_ARK0 = 2.2, U_ARK1 = 34.8;                       // Arkaden von der Fassadenwand bis zur Triumphwand
const BAY = (U_ARK1 - U_ARK0) / N_BAY;
const U_TRI0 = 34.8, U_TRI1 = 36.8;                      // Triumphwand zwischen Langhaus und Chor
const WN0 = 6.2, WN1 = 7.6, WS0 = 13.4, WS1 = 14.8;      // Pfeilerreihen (Säulen) w 6,2..7,6 und 13,4..14,8; Mittelschiff w 7,6..13,4 (C)
const W_MITTE = 10.5;
const WK0 = 18.8, WK1 = 20.8, UK0 = 24.5, UK1 = 35.5;   // Wandband zur Seitenkapelle im Süden (B: Ausbuchtung des Umrisses)
const TRAUFE = 14, FIRST = 20;                           // innere Höhe des Holzdachs: Traufe 14, First 20 (C)
const DECKE_SCH = 11, DECKE_KAP = 10, DECKE_CHOR = 15;
const PORTAL = { w0: 8.2, w1: 12.8, h: 7 };              // Portal des 16. Jahrhunderts (A: Benedetto da Rovezzano zugeschrieben; Maße C)

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'), serena: WZ.typ('pietra_serena'),
  putz: WZ.typ('putz_weiss'), sand: WZ.typ('putz_sand'), ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'),
  gold: WZ.typ('gold'), weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), gruen: WZ.typ('marmor_gruen'), rot: WZ.typ('marmor_rot'),
  dunkel: WZ.typ('kontrast_dunkel'), bronze: WZ.typ('bronze'), pflaster: WZ.typ('pflaster'), terrakotta: WZ.typ('putz_rosa'),
  licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), saeule: WZ.typ('marmor_saeule')
};
const GLAS = PAL.typesForRole('glas');
const FR = (n) => WZ.fresko(n);
const aMitte = (c) => Math.abs(c.w - W_MITTE);
const spitzRund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);

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
  if (u < U_FASS) return 'fassade';
  if (u < U_TRI0) {
    if (u >= UK0 && u < UK1) {
      if (w >= WK1) return 'kap_s';
      if (w >= WK0) return 'wand_k';
    }
    if (w < WN0) return 'sch_n';
    if (w < WN1) return 'wand_n';
    if (w < WS0) return 'mittel';
    if (w < WS1) return 'wand_s';
    return 'sch_s';
  }
  if (u < U_TRI1) return 'triumph';
  return 'chor';
}
const bayVon = (u) => Math.max(0, Math.min(N_BAY - 1, Math.floor((u - U_ARK0) / BAY)));
const bayMitte = (k) => U_ARK0 + (k + 0.5) * BAY;

function facTop(c) {
  if (c.w >= WN0 && c.w < WS1) return FIRST + 4 - Math.round(5 * Math.min(1, aMitte(c) / 4.5));       // Giebel der Fassade über dem Mittelschiff
  return 15;
}
function dach(c) {
  switch (c.zone) {
    case 'fassade': return facTop(c);
    case 'mittel': return decke(c) + 2;
    case 'wand_n': case 'wand_s': return TRAUFE + 3;
    case 'sch_n': case 'sch_s': return DECKE_SCH + 2 + Math.round(1 * Math.min(1, (c.d8 - 1) / 3));
    case 'wand_k': return TRAUFE + 1;
    case 'kap_s': return DECKE_KAP + 2;
    case 'triumph': return c.w >= WN0 && c.w < WS1 ? FIRST + 4 - Math.round(5 * Math.min(1, aMitte(c) / 4.5)) : DECKE_CHOR + 3;
    case 'chor': return DECKE_CHOR + 2;
    default: return null;
  }
}
function decke(c) {
  switch (c.zone) {
    case 'mittel': return TRAUFE + Math.round((FIRST - TRAUFE) * (1 - Math.min(1, aMitte(c) / 2.9)));       // offenes Holzdach: Gespärre bis zum First
    case 'sch_n': case 'sch_s': return DECKE_SCH;
    case 'kap_s': return DECKE_KAP;
    case 'chor': return DECKE_CHOR;
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

  // ---- Öffnungen: Portal (Rovezzano, Rechteckdurchgang unter der Lünette)
  for (const c of D.cells) {
    if (c.zone === 'fassade' && c.w >= PORTAL.w0 && c.w < PORTAL.w1) for (let yr = 1; yr <= PORTAL.h; yr++) oeffnung('tor', 'portal', c.x, Y(yr), c.z);
  }

  // ---- Modul 0: Fundament und Boden (Mosaik im Mittelschiff, Terrakotta in Seitenschiffen und Kapelle)
  for (const c of D.cells) {
    for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
    let t = T.terrakotta;
    if (c.zone === 'mittel' || c.zone === 'triumph') t = mod(Math.floor(c.u / 2) + Math.floor(c.w / 2), 3) === 0 ? T.gruen : (mod(Math.floor(c.u / 2) + Math.floor(c.w / 2), 3) === 1 ? T.weiss : T.serena);
    else if (c.zone === 'fassade') t = T.serena;
    else if (c.zone === 'chor') t = (Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? T.serena : T.weiss;
    else if (c.zone === 'sch_n' || c.zone === 'sch_s' || c.zone === 'kap_s') t = (Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? T.terrakotta : T.weiss;
    set(c.x, Y(0), c.z, t, 'boden');
  }

  // ---- Modul 1: Fassade (romanisch, Bruchstein; Portal mit Lünette)
  for (const c of D.cells) {
    if (c.zone !== 'fassade') continue;
    const top = dach(c);
    for (let yr = 1; yr < top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      const aussen = c.u < 1.2;
      const rahmen = c.w >= PORTAL.w0 - 1 && c.w < PORTAL.w1 + 1 && yr <= PORTAL.h + 4;
      const luenette = Math.hypot(c.w - (PORTAL.w0 + PORTAL.w1) / 2, yr - (PORTAL.h + 1)) < 2.6 && yr > PORTAL.h;
      if (luenette && aussen) { set(c.x, Y(yr), c.z, Math.hypot(c.w - W_MITTE, yr - (PORTAL.h + 1)) < 0.9 ? FR('weiss') : FR('blau'), 'lunette_taube'); continue; }
      const t = aussen ? (yr <= 2 || rahmen || yr === top - 1 ? T.serena : T.forte) : T.putz;
      set(c.x, Y(yr), c.z, t, 'fassade');
    }
  }

  // ---- Modul 1: Außenwände (d8 <= 2) mit Rundbogenfenstern; Apsis aus rauem Bruchstein
  const wandTop = (c) => { const d = dach(c); return d === null ? 14 : d; };
  for (const c of D.cells) {
    if (c.zone === 'fassade' || c.d8 > 2) continue;
    const top = wandTop(c);
    for (let yr = 1; yr < top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      let fe = false;
      const sp = mod(Math.round(c.u), 6);
      if ((c.zone === 'sch_n' || c.zone === 'sch_s') && sp < 2 && c.u > 4 && yr >= 5 && yr <= 9) fe = true;
      if (c.zone === 'chor' && sp < 2 && c.u > 40 && yr >= 5 && yr <= 10) fe = true;
      if (c.zone === 'kap_s' && Math.abs(c.u - 30) < 1.2 && yr >= 4 && yr <= 8) fe = true;
      if (fe) { set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.u)) % GLAS.length], 'fenster'); continue; }
      const t = c.d8 === 1 ? (c.zone === 'chor' ? T.bruch : (yr <= 2 || yr === top - 1 ? T.serena : T.forte)) : T.putz;
      set(c.x, Y(yr), c.z, t, 'seitenwaende');
    }
  }

  // ---- Modul 1: Säulenreihen (Prato-Marmor) mit Rundbögen, Wandband zur Kapelle, Triumphwand
  for (const c of D.cells) {
    const top = dach(c);
    if (c.zone === 'wand_n' || c.zone === 'wand_s') {
      const k = bayVon(c.u), uc = bayMitte(k), a = BAY / 2 - 0.9;
      const lai = spitzRund(6, c.u - uc, a);
      const saeule = Math.abs(c.u - (uc + (c.u > uc ? BAY / 2 : -BAY / 2))) < 0.95;
      for (let yr = 1; yr < top; yr++) {
        if (hat(c.x, Y(yr), c.z)) continue;
        if (lai >= 0 && yr <= lai && !saeule) continue;
        if (saeule && yr <= 8) { set(c.x, Y(yr), c.z, T.gruen, 'saeulen'); continue; }                       // Schaft aus grünem Prato-Marmor
        if (saeule && yr <= 9) { set(c.x, Y(yr), c.z, (k + (c.zone === 'wand_n' ? 0 : 3)) % 5 < 2 ? T.ornament : T.weiss, 'kapitelle'); continue; }   // Kapitelle, die ersten Corinthisch
        set(c.x, Y(yr), c.z, lai >= 0 && yr <= lai + 1 ? T.serena : T.putz, 'arkaden');
      }
    }
    if (c.zone === 'wand_k' && top != null) {
      const lai = spitzRund(6, c.u - 31, 3.6);
      for (let yr = 1; yr < top; yr++) {
        if (hat(c.x, Y(yr), c.z) || istFrei(c.x, Y(yr), c.z)) continue;
        if (lai >= 0 && yr <= lai) continue;                                                              // Bogen zur Kapelle
        set(c.x, Y(yr), c.z, lai >= 0 && yr <= lai + 1 ? T.serena : T.putz, 'arkaden');
      }
    }
    if (c.zone === 'triumph') {
      const lai = spitzRund(6, c.w - 12.5, 5);
      for (let yr = 1; yr < top; yr++) {
        if (hat(c.x, Y(yr), c.z) || istFrei(c.x, Y(yr), c.z)) continue;
        if (lai >= 0 && yr <= lai) continue;                                                              // Triumphbogen zum Chor
        set(c.x, Y(yr), c.z, lai >= 0 && yr <= lai + 1 ? T.serena : T.putz, 'triumphbogen');
      }
    }
  }

  // ---- Modul 2: offenes Holzdach über dem Mittelschiff (Binder, Pfetten, Bretterdecke), flache Decken der Seitenschiffe, Kapelle und des Chors
  const deckenTyp = (c) => {
    if (c.zone === 'mittel') {
      const r = mod(c.u - U_ARK0, BAY / 2);
      const binder = r < 0.55 || r > BAY / 2 - 0.55;                                                      // Binder alle halbe Jochbreite
      return binder ? T.dunkel : (Math.round(c.w) % 3 === 0 ? T.gold : T.holz);
    }
    return c.zone === 'chor' ? T.putz : T.holz;
  };
  for (const c of D.cells) {
    if (c.d8 <= 2 || c.zone === 'fassade') continue;
    const top = dach(c), dk = decke(c);
    if (dk == null || top == null) continue;
    let lo = dk;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); if (n && n.d8 > 2) { const nd = decke(n); if (nd != null && nd < lo) lo = nd; } }
    for (let yr = lo; yr <= dk; yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, deckenTyp(c), c.zone === 'mittel' ? 'holzdecke' : 'decken');
    for (let yr = dk + 1; yr < top; yr++) if (!hat(c.x, Y(yr), c.z) && !istFrei(c.x, Y(yr), c.z)) unzug('dach', 'Zwischenraum unter der Dachhaut (ohne Zugang)', c.x, Y(yr), c.z);
  }

  // ---- Modul 2: Dachhaut je Spalte bis zum tiefsten der acht Nachbarn
  for (const c of D.cells) {
    const top = dach(c);
    if (top == null || c.zone === 'fassade') continue;
    const dk = decke(c);
    let lo = top;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < lo) lo = n; }
    if (dk != null && c.d8 > 2) lo = Math.max(lo, dk + 1);
    for (let yr = lo; yr <= top; yr++) {
      if (hat(c.x, Y(yr), c.z) || istFrei(c.x, Y(yr), c.z)) continue;
      set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.mauer, yr === top ? 'dach' : 'schildwaende');
    }
  }
  for (const c of D.cells) {                                                           // Fassade: Abdeckung der Kante
    if (c.zone !== 'fassade') continue;
    const top = dach(c);
    if (!hat(c.x, Y(top), c.z)) set(c.x, Y(top), c.z, T.serena, 'fassade');
  }

  // ---- Modul 5/6: Ausstattung nach Quellen
  require('./_sa_ausstattung.js').ausstatten(api);

  // ---- Modul 4: Licht
  const steh = [];
  for (const c of D.cells) {
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

module.exports = { modul, lade, plan, zelleBei, Y, BODEN_Y, T, BAY, N_BAY, bayMitte, bayVon, W_MITTE, U_FASS, U_TRI0, U_TRI1, WN0, WN1, WS0, WS1, WK0, WK1, UK0, UK1, PORTAL, zone, dach, decke };
