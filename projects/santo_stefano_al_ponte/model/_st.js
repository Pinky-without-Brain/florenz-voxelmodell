'use strict';
// Chiesa di Santo Stefano al Ponte (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/santo_stefano_al_ponte/): romanische Fassade (untere Zone,
// Marmorinkrustation, Portal mit Lünette und Okulus, 1233), barock umgebautes Innere (1631 bis 1641): einschiffiger Saal mit je fünf Seitenaltären,
// Presbyterium mit Tribuna unter achtseitiger Kuppel (Tambour mit Okuli), eine falsche und eine echte Seitenkapelle, Treppe mit Marmorbalustrade
// (Buontalenti 1574), dahinter der Chor.
// Rahmen: Ursprung (-435 | 974) = Nordwestecke der Fassade, θ 23,1 Grad: u von der Fassade (Piazza Santo Stefano, u = 0) nach Ost-Südost bis zum Chor
// (u 94), w quer nach Süd-Südwest (0..39,5). Der Umriss ist ein achsparalleles Rechteck u 0..81 × w 0..39,5 mit Chor u 81..94 × w 9,2..29,5.
// Lagen yr = Y − 64. Bauplan als Zellen im Speicher; die Module 0 bis 4 sind Teillisten.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 64;
const Y = (yr) => BODEN_Y + yr;
const hash = (a, b, c) => ((Math.imul(a, 73856093) ^ Math.imul(b, 19349663) ^ Math.imul(c, 83492791)) >>> 0);

// ------------------------------------------------------------------ Maße (lokal, Blöcke; Maßstab 1:2)
const W_MID = 19.75, W_MAX = 39.5;
const SCHIFF_ENDE = 55, ENDWAND = [55, 57], HAUPT_O = 79, CHOR_U = 81;
const TRIB = { w0: 14, w1: 25.5, cu: 67.5, cw: 19.75, a: 5.75, aussen: 7.75 };   // Tribuna und Kuppel (Mitte, Apothem innen / außen)
const KAP_N = { w0: 2, w1: 12, tiefe: 15, tuer: 7 }, KAP_S = { w0: 27.5, w1: 37.5, tiefe: 3, tuer: 32.5 };   // echte Kapelle (nord), falsche Kapelle (süd, 3 tief)
const STUFEN = 5, PODIUM_OBEN = 5;                          // Podest 5 Blöcke über dem Schiffsboden (2,5 m)
const C_W = 17, C_E = 21, STUFENWAND = [33, 35];            // Decke Lage 17 (westlicher Teil), 21 (östlicher Teil, "zwei Meter höher"); Stufenwand zwischen beiden
const CHOR_DECKE = 17, KAP_DECKE = 17, BAY_DECKE = 18;
const ALTAR_U = [8, 18.6, 29.2, 39.8, 50.4];                // fünf Seitenaltäre je Seite
const FENSTER_U = [13, 24, 42, 50];                         // Obergadenfenster in den Schiffswänden
const FASSADE = { portal: { w: W_MID, breite: 7, h: 8 }, seiten: [9.25, 30.25], untenBis: 20, dach0: 24, dachH: 8 };
const DOM = { y0: 23, trommel: 26, steigung: 0.65 };

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'), serena: WZ.typ('pietra_serena'),
  putz: WZ.typ('putz_weiss'), sand: WZ.typ('putz_sand'), ziegel: WZ.typ('dachziegel'), kuppel: WZ.typ('ziegel_kuppel'), holz: WZ.typ('holz'),
  gold: WZ.typ('gold'), weiss: WZ.typ('marmor_weiss'), gruen: WZ.typ('marmor_gruen'), ornament: WZ.typ('marmor_ornament'), rot: WZ.typ('marmor_rot'),
  bronze: WZ.typ('bronze'), pflaster: WZ.typ('pflaster'), terrakotta: WZ.typ('putz_rosa'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'),
  dunkel: WZ.typ('kontrast_dunkel')
};
const GLAS = PAL.typesForRole('glas');
const FR = (n) => WZ.fresko(n);
const g = (w) => Math.max(0, Math.floor(6 * (1 - Math.abs(w - W_MID) / W_MID)));
const oct = (du, dw) => Math.max(Math.abs(du), Math.abs(dw), (Math.abs(du) + Math.abs(dw)) / Math.SQRT2);

// ------------------------------------------------------------------ Laden und Zonen
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt;
  const cells = H.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    const c = { x, z, u: l.u, w: l.w, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z) };
    c.zone = zone(c);
    c.r8 = oct(c.u - TRIB.cu, c.w - TRIB.cw);
    c.dom = (c.zone === 'trib' || c.zone === 'tw') && c.r8 <= TRIB.aussen;
    c.top = topOf(c);
    return c;
  });
  const byKey = new Map();
  for (const c of cells) byKey.set(P.ck(c.x, c.z), c);
  L = { json, masken, R, H, cells, byKey, haupt: cells };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

function zone(c) {
  if (c.d8 <= 2 && c.u < 4) return 'fassade';             // Fassadenwand: die Randlagen der Westkante (Dicke nach d8, nicht nach u)
  if (c.d8 <= 2) return 'aussen';
  if (c.u >= CHOR_U) return 'chor';
  if (c.u >= HAUPT_O) return 'oswand';
  if (c.u >= ENDWAND[1]) {
    if (c.w < KAP_N.w1) return 'kn';
    if (c.w < TRIB.w0) return 'tw';
    if (c.w < TRIB.w1) return 'trib';
    if (c.w < KAP_S.w0) return 'tw';
    return 'ks';
  }
  if (c.u >= ENDWAND[0]) return 'endwand';
  return 'schiff';
}
function topOf(c) {
  const z = c.zone;
  if (z === 'fassade') return FASSADE.dach0 + Math.max(0, Math.floor(FASSADE.dachH * (1 - Math.abs(c.w - W_MID) / W_MID)));
  if (z === 'aussen') return c.u >= HAUPT_O ? 22 : c.u >= ENDWAND[1] ? 20 : c.u >= STUFENWAND[0] ? 22 : 18;
  if (z === 'trib' || z === 'tw') return c.dom ? 38 : 24;
  if (z === 'kn' || z === 'ks') return 20;
  if (z === 'oswand' || z === 'chor') return 22;
  return (c.u >= STUFENWAND[0] ? 22 : 18) + g(c.w);          // Schiff und Endwand: Satteldach, First in der Mitte
}
const rund = (y0, d, a) => (Math.abs(d) < a ? Math.floor(y0 + Math.sqrt(a * a - d * d)) : -1);

/** Zelle (c, yr) -> null (Luft) oder { p: Bauteil, t: Typ oder 'fill' }. */
function zelle(c, yr) {
  if (yr > c.top) return null;
  switch (c.zone) {
    case 'fassade': return fassadeZelle(c, yr);
    case 'aussen': return aussenZelle(c, yr);
    case 'schiff': {
      if (c.u >= STUFENWAND[0] && c.u < STUFENWAND[1]) return yr <= C_W - 1 ? null : { p: 'sa_decken', t: 'fill' };   // Stufenwand der Decke
      const C = c.u < STUFENWAND[0] ? C_W : C_E;
      if (yr < C) return null;
      if (yr === C) return { p: 'sa_decken', t: 'balken' };
      return { p: 'sa_dach', t: yr === c.top ? T.ziegel : T.mauer };
    }
    case 'endwand': return endwandZelle(c, yr);
    case 'tw': return c.dom && yr >= DOM.y0 ? kuppelZelle(c, yr) : { p: 'sa_innenwaende', t: 'fill' };
    case 'kn': case 'ks': {
      const K = c.zone === 'kn' ? KAP_N : KAP_S;
      if (c.u >= ENDWAND[1] + K.tiefe) return { p: 'sa_innenwaende', t: 'fill' };
      if (yr < KAP_DECKE) return null;
      if (yr === KAP_DECKE) return { p: 'sa_decken', t: 'fill' };
      return { p: 'sa_dach', t: yr === c.top ? T.ziegel : T.mauer };
    }
    case 'trib': return tribZelle(c, yr);
    case 'oswand': {
      if (yr <= PODIUM_OBEN) return podiumZelle(yr);
      const dw = Math.abs(c.w - W_MID);
      if (dw < 3.5 && yr <= 10 + Math.floor(Math.sqrt(Math.max(0, 12.25 - dw * dw)))) return null;   // Durchgang zum Chor
      return { p: 'sa_innenwaende', t: 'fill' };
    }
    case 'chor': {
      if (yr <= PODIUM_OBEN) return podiumZelle(yr);
      if (yr < CHOR_DECKE) return null;
      if (yr === CHOR_DECKE) return { p: 'sa_decken', t: 'fill' };
      return { p: 'sa_dach', t: yr === c.top ? T.ziegel : T.mauer };
    }
    default: return null;
  }
}
const podiumZelle = (yr) => ({ p: 'sa_podium', t: yr === PODIUM_OBEN ? 'podium_boden' : T.mauer });

function fassadeZelle(c, yr) {
  const dw = c.w - W_MID, adw = Math.abs(dw), top = c.top;
  const P0 = FASSADE.portal;
  if (adw < P0.breite / 2 && yr <= P0.h + Math.floor(Math.sqrt(Math.max(0, (P0.breite / 2) ** 2 - dw * dw)))) return null;       // Mittelportal, bis zum Boden offen
  if (yr === top) return { p: 'sa_fassade', t: T.serena };                                                                         // Gesims auf dem Giebel
  const sw = FASSADE.seiten.reduce((b, s) => (Math.abs(c.w - s) < Math.abs(c.w - b) ? s : b), FASSADE.seiten[0]);
  const ds = c.w - sw;
  // Lünette mit Okulus über dem Portal (Glas), Marmorinkrustation
  if (Math.hypot(dw, yr - 14) <= 1.6) return { p: 'sa_fassade_fenster', t: GLAS[(yr + Math.round(c.w)) % GLAS.length] };
  // Seitentüren (geschlossen, Holzflügel mit Rahmen aus Pietra serena)
  if (Math.abs(ds) < 2.2 && yr <= 8 + (Math.abs(ds) < 1.2 ? 1 : 0)) return { p: 'sa_fassade', t: Math.abs(ds) > 1.5 || yr >= 8 ? T.serena : T.holz };
  // Biforien über den Seitentüren, Rosetten darüber
  if (Math.abs(ds) < 1.6 && yr >= 12 && yr <= 15) return { p: 'sa_fassade_fenster', t: Math.abs(ds) < 0.55 ? T.serena : GLAS[(yr + (ds > 0 ? 1 : 0)) % GLAS.length] };
  const dr = Math.hypot(ds, yr - 18.6);
  if (dr <= 2.1) return { p: 'sa_fassade_fenster', t: GLAS[(yr + Math.round(c.w)) % GLAS.length] };
  if (dr <= 3.1 && yr >= 15) return { p: 'sa_fassade', t: T.serena };
  // Obergeschoss: drei Rundbogenfenster, Nische in der Mitte des Giebels
  for (const wf of [FASSADE.seiten[0], W_MID, FASSADE.seiten[1]]) {
    const d = Math.abs(c.w - wf);
    if (d < 1.6 && yr >= 22 && yr <= 26 - (d > 0.9 ? 1 : 0)) return { p: 'sa_fassade_fenster', t: GLAS[(yr + Math.round(wf)) % GLAS.length] };
    if (d < 2.6 && yr >= 21 && yr <= 27 - (d > 1.9 ? 1 : 0) && c.d8 === 1) return { p: 'sa_fassade', t: T.serena };
  }
  if (c.d8 === 1 && adw < 1.1 && yr >= 29 && yr <= 31) return null;                                                                // Nische (Außenlage, als relief deklariert)
  if (c.d8 === 1) {
    if (yr <= FASSADE.untenBis) {                                                                                                    // untere Zone: Inkrustation aus weißem und grünem Marmor
      if (yr <= 2) return { p: 'sa_fassade', t: T.serena };
      const ring = Math.hypot(dw, yr - 8);
      if (ring > P0.breite / 2 && ring < P0.breite / 2 + 1.2) return { p: 'sa_fassade', t: ((Math.round(c.w) + yr) & 1) ? T.gruen : T.weiss };
      const pil = [4.5, 14.5, 25, 35].some((p) => Math.abs(c.w - p) < 0.6);
      return { p: 'sa_fassade', t: (yr % 7 === 0 || pil) ? T.gruen : T.weiss };
    }
    if (yr === top - 1 && (Math.round(c.w) & 1)) return { p: 'sa_fassade', t: T.serena };                                         // Bogenfries (archetti) am Giebel
    return { p: 'sa_fassade', t: T.sand };
  }
  return { p: 'sa_fassade', t: T.putz };
}

function aussenZelle(c, yr) {
  const top = c.top;
  // Obergadenfenster der Schiffswände
  if (c.u >= 2.5 && c.u < ENDWAND[1] && (c.w < 4 || c.w > 35.5)) {
    for (const uc of FENSTER_U) {
      const du = Math.abs(c.u - uc), y0 = c.u < STUFENWAND[0] ? 10 : 14, y1 = y0 + 5;
      if (du < 1.6 && yr >= y0 && yr <= y1 - (du > 0.9 ? 1 : 0)) return { p: 'sa_fenster', t: GLAS[(yr + Math.round(c.u)) % GLAS.length] };
    }
  }
  if (c.u >= 91.5 && Math.abs(c.w - W_MID) < 1.8 && yr >= 9 && yr <= 14 - (Math.abs(c.w - W_MID) > 1 ? 1 : 0)) return { p: 'sa_fenster', t: GLAS[(yr + Math.round(c.w)) % GLAS.length] };
  if (yr === top) return { p: 'sa_aussenwaende', t: T.serena };
  if (c.d8 === 1) return { p: 'sa_aussenwaende', t: yr <= 2 ? T.serena : T.sand };
  return { p: 'sa_aussenwaende', t: T.putz };
}

function endwandZelle(c, yr) {
  const dw = c.w - W_MID;
  if (Math.abs(dw) < TRIB.a) {                                                       // mittlerer Bogen zur Tribuna (Podium im Durchgang)
    if (yr <= PODIUM_OBEN) return podiumZelle(yr);
    if (yr <= 11 + Math.floor(Math.sqrt(TRIB.a * TRIB.a - dw * dw))) return null;
  }
  for (const K of [KAP_N, KAP_S]) {                                                  // Öffnungen zur echten und zur falschen Kapelle (5 breit)
    const d = c.w - (K === KAP_N ? KAP_N.tuer : KAP_S.tuer);
    if (Math.abs(d) < 2.5 && yr <= 7 + Math.floor(Math.sqrt(Math.max(0, 6.25 - d * d)))) return null;
  }
  return { p: 'sa_innenwaende', t: yr === c.top ? T.serena : 'fill' };
}

function tribZelle(c, yr) {
  const du = c.u - TRIB.cu, dw = c.w - TRIB.cw;
  if (yr <= PODIUM_OBEN) return podiumZelle(yr);
  const inQuad = Math.abs(du) <= TRIB.a;
  if (yr < DOM.y0 || !c.dom) {
    if (inQuad && yr <= 22) return null;
    if (!inQuad) {
      if (yr < BAY_DECKE) return null;
      if (yr === BAY_DECKE) return { p: 'sa_decken', t: 'fill' };
    }
    return { p: 'sa_dach', t: yr === c.top ? T.ziegel : T.mauer };
  }
  return kuppelZelle(c, yr);
}

/** Tambour (Lage 23..26) und achtseitige Kuppel: Schalen aus Achteckringen, innen und außen (Spalten der Tribuna und der Mauern daneben). */
function kuppelZelle(c, yr) {
  const du = c.u - TRIB.cu, dw = c.w - TRIB.cw;
  const k = Math.max(0, yr - DOM.trommel);
  const innen = TRIB.a - DOM.steigung * k, aussen = TRIB.aussen - DOM.steigung * k;
  const teil = yr <= DOM.trommel ? 'sa_trommel' : 'sa_kuppel';
  if (innen < 0.9) {                                                                 // Scheitel: Glaslinse, darüber Gold
    if (c.r8 >= aussen) return null;
    if (yr >= 35 && yr <= 36 && c.r8 < 1.2) return { p: 'sa_kuppel', t: T.fenster };
    return { p: 'sa_kuppel', t: yr >= 37 ? T.gold : 'fill' };
  }
  if (c.r8 < innen) return null;
  if (c.r8 >= aussen) return yr <= 24 && c.top >= yr ? { p: 'sa_dach', t: T.mauer } : null;
  if (yr >= 24 && yr <= 25 && yr <= DOM.trommel) {                                   // acht Okuli in den Flächen des Tambours
    const ph = Math.atan2(dw, du) * 180 / Math.PI, m = Math.min(((ph % 45) + 45) % 45, 45 - (((ph % 45) + 45) % 45));
    if (m < 12) return { p: 'sa_trommel', t: GLAS[(yr + Math.round(ph / 45)) % GLAS.length] };
  }
  return { p: teil, t: 'fill' };
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
  const get = (x, y, z) => zellen.get(key(x, y, z)) || null;
  const frei = (x, y, z) => luft.add(key(x, y, z));
  const oeff = new Map();
  const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); frei(x, y, z); };
  const unz = new Map();
  const unzug = (p, b, x, y, z) => { const k = p + '|' + b; if (!unz.has(k)) unz.set(k, []); unz.get(k).push({ x, y, z }); };
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const api = { D, set, ersetze, hat, get, frei, oeffnung, unzug, key, Y, T, zellen, teile, zelleBei, N4, luft, FR, GLAS, hash };

  const roh = new Map();
  const rohBei = (c, yr) => { const k = c.x + ',' + yr + ',' + c.z; let v = roh.get(k); if (v === undefined) { v = zelle(c, yr); roh.set(k, v); } return v; };
  const istLuft = (x, yr, z) => { const n = zelleBei(x, z); if (!n) return false; return rohBei(n, yr) === null && yr >= 1 && yr <= n.top && !hat(x, Y(yr), z); };
  api.istLuft = istLuft;

  // ---- Öffnungen: Mittelportal (Tor), Nische der Fassade (relief)
  for (const c of D.cells) {
    if (c.zone !== 'fassade') continue;
    for (let yr = 1; yr <= c.top; yr++) {
      if (zelle(c, yr) !== null) continue;
      if (Math.abs(c.w - W_MID) < FASSADE.portal.breite / 2 + 0.01 && yr <= 12) oeffnung('tor', 'sa_fassade', c.x, Y(yr), c.z);
      else oeffnung('relief', 'sa_fassade', c.x, Y(yr), c.z);
    }
  }

  // ---- Treppe der Tribuna (Buontalenti): gerade Treppe, 5 Stufen, Breite 8, achsparallel in Weltkoordinaten; Lücke zum Podium als Podest
  const treppe = sucheTreppe(D);
  const arr = WZ.treppe.geradeTreppe({ start: { x: treppe.x0, y: Y(1), z: treppe.z0 }, richtung: 'o', stufen: STUFEN, breite: 8, rolle: 'marmor_weiss' });
  for (const b of arr) {
    for (let y = Y(1); y < b.y; y++) set(b.x, y, b.z, T.weiss, 'sa_treppe', true);
    set(b.x, b.y, b.z, b.typ, 'sa_treppe', true);
  }
  for (const [x, z] of treppe.podest) for (let yr = 1; yr <= PODIUM_OBEN; yr++) set(x, Y(yr), z, yr === PODIUM_OBEN ? T.weiss : T.mauer, 'sa_podium', true);
  for (const [x, z, h] of treppe.gelaender) for (let yr = 1; yr <= h; yr++) set(x, Y(yr), z, T.weiss, 'sa_balustrade', true);
  api.treppe = { arr, ...treppe };

  for (const c of D.cells) {
    for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'sa_fundament');
    set(c.x, Y(0), c.z, bodenTyp(c), 'sa_boden');
  }
  for (const c of D.cells) {
    for (let yr = 1; yr <= c.top; yr++) {
      const v = rohBei(c, yr);
      if (!v) continue;
      let t = v.t;
      if (t === 'fill' || t === 'balken' || t === 'podium_boden') t = flaeche(c, yr, v);
      set(c.x, Y(yr), c.z, t, v.p);
    }
  }
  function flaeche(c, yr, v) {
    if (v.t === 'podium_boden') return ((Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1) ? T.weiss : T.gruen;
    if (v.t === 'balken') {                                                           // Holzdecke mit sichtbaren Balken alle 4 Blöcke
      const q = Math.round(c.u);
      return (q % 4 === 0 || (Math.round(c.w) % 8 === 0)) ? T.holz : (((q + Math.round(c.w)) & 1) ? T.putz : T.sand);
    }
    const innen = N4.some(([dx, dz]) => istLuft(c.x + dx, yr, c.z + dz)) || istLuft(c.x, yr - 1, c.z) || istLuft(c.x, yr + 1, c.z);
    if (v.p === 'sa_kuppel' || v.p === 'sa_trommel') {
      if (!innen) return T.mauer;
      const ph = Math.atan2(c.w - TRIB.cw, c.u - TRIB.cu) * 180 / Math.PI, m = ((ph - 22.5) % 45 + 45) % 45;        // acht Rippen über den Ecken des Achtecks
      return (m < 3 || m > 42) ? T.serena : T.putz;
    }
    return innen ? T.putz : (c.d8 <= 2 ? T.putz : T.mauer);
  }
  require('./_st_ausstattung.js').ausstatten(api);

  teile.clear();
  for (const [k, e] of zellen) { let a = teile.get(e.p); if (!a) teile.set(e.p, a = []); a.push(k); }
  PLAN = { zellen, teile, oeff, unz };
  return PLAN;
}

function bodenTyp(c) {
  switch (c.zone) {
    case 'kn': case 'ks': return ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1) ? T.weiss : T.serena;
    case 'schiff': case 'endwand': return ((Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1) ? T.serena : T.ziegel;
    default: return T.serena;
  }
}

/** Platz für die Treppe: 5 Stufen × 8 Breite achsparallel in der Nordsüd-Mitte vor dem Durchgang zur Tribuna; Lücke bis zum Podium als Podest. */
function sucheTreppe(D) {
  const schiff = new Map(D.cells.filter((c) => c.zone === 'schiff').map((c) => [c.x + ',' + c.z, c]));
  const durchgang = new Map(D.cells.filter((c) => c.zone === 'endwand' && Math.abs(c.w - W_MID) < TRIB.a).map((c) => [c.x + ',' + c.z, c]));
  let best = null;
  for (const s of schiff.values()) {
    if (Math.abs(s.w - W_MID) > 8 || s.u < 44 || s.u > 54) continue;
    let ok = true;
    for (let k = 0; k < STUFEN && ok; k++) for (let q = 0; q < 8; q++) if (!schiff.has((s.x + k) + ',' + (s.z + q))) { ok = false; break; }
    if (!ok) continue;
    for (let q = -1; q <= 8 && ok; q++) if (!schiff.has((s.x - 1) + ',' + (s.z + q))) ok = false;     // Zugang vor der Treppe
    if (!ok) continue;
    const podest = [];
    for (let q = 0; q < 8 && ok; q++) {
      let x = s.x + STUFEN, n = 0;
      while (schiff.has(x + ',' + (s.z + q)) && n < 6) { podest.push([x, s.z + q]); x++; n++; }
      if (!durchgang.has(x + ',' + (s.z + q))) ok = false;                                            // die Zeile muss im Durchgang enden
    }
    if (!ok) continue;
    const l = s;
    const score = podest.length * 3 + Math.abs(l.w + 4 - W_MID) + Math.abs(l.u - 49);
    if (!best || score < best.score) best = { score, x0: s.x, z0: s.z, podest };
  }
  if (!best) throw new Error('Santo Stefano: kein Platz für die Treppe der Tribuna');
  const gelaender = [];
  for (let k = 0; k < STUFEN; k++) {
    if (schiff.has((best.x0 + k) + ',' + (best.z0 - 1))) gelaender.push([best.x0 + k, best.z0 - 1, k + 2]);
    if (schiff.has((best.x0 + k) + ',' + (best.z0 + 8))) gelaender.push([best.x0 + k, best.z0 + 8, k + 2]);
  }
  return { x0: best.x0, z0: best.z0, podest: best.podest, gelaender };
}

// ------------------------------------------------------------------ Module aus dem Plan
const OEFF_TEIL = {};
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

module.exports = { modul, lade, plan, zelleBei, zelle, Y, BODEN_Y, T, TRIB, KAP_N, KAP_S, ALTAR_U, FENSTER_U, FASSADE, W_MID, PODIUM_OBEN, STUFEN, C_W, C_E, oct };
