'use strict';
// Gemeinsame Geometrie und Bauplan von Santa Trinita (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/santa_trinita/).
// Ein Bauplan für alle Module, erste Setzung gewinnt; Module sind Teillisten (modul(n, [...])).
//
// Rahmen ST: u von der Fassade (Osten, Piazza Santa Trinita) zum Chor (Westen), w quer (w > 0 Norden, rechts beim
// Eintreten). Lagen yr = Y − 61. Gotische Kirche in T-Form (croce commissa): drei Schiffe mit Kreuzgewölben auf
// Rechteckpfeilern, links fünf Kapellen, Querhaus mit Kapellen am Kopf (Cappella maggiore mit quadratischer Apsis,
// daneben je zwei Kapellen, rechts außen die Cappella Sassetti), Kapelle des hl. Giovanni Gualberto am rechten
// Querhauskopf, Sakristei am linken; Fassade von Buontalenti (1593–94).

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 61;
const Y = (yr) => BODEN_Y + yr;

// ------------------------------------------------------------------ Maße (Referenzmaße §1–§3)
const AX = -2.5;                           // Achse (Mitte der Cappella maggiore)
const U_FASS = 3, U_QUER = 61, U_KOPF = 79;
const JOCHE = 5;                           // fünf Joche = fünf Kapellen je Seite
const JOCH = (U_QUER - U_FASS) / JOCHE;
const W_PF0 = 7.5, W_PF1 = 9.5;            // Pfeilerreihe |w − AX| 7,5..9,5
const W_SEITE = 17;                        // Seitenschiff bis |w − AX| 17, links dahinter die Kapellen
const M = { k: 30, s: 44, traufe: 48, first: 56 };          // Mittelschiff und Querhaus
const S = { k: 20, s: 28, dachI: 36, dachA: 30 };           // Seitenschiffe
const KAP = { decke: 18, dachI: 26, dachA: 22 };            // Kapellen links
const CHOR = { w0: -8.5, w1: 3.5, k: 26, s: 36, dach: 42 };
const KOPF = { decke: 22, dach: 30 };                        // Kapellen am Querhauskopf und Sassetti
const QK = { decke: 24, dach: 32 };                          // Gualberto (rechts) und Sakristei (links)
const W_GUAL = 30, W_SAK = -28, W_SASS = 10;

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), rustika: WZ.typ('pietra_forte_rustika'), mauer: WZ.typ('mauerwerk'),
  serena: WZ.typ('pietra_serena'), putz: WZ.typ('putz_weiss'), ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'),
  weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), gold: WZ.typ('gold'), sand: WZ.typ('putz_sand'),
  terrakotta: WZ.typ('putz_rosa'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), bronze: WZ.typ('bronze')
};
const FRESKO = ['blau', 'rot', 'gelb', 'gruen', 'braun', 'hellblau', 'orange'].map((f) => WZ.fresko(f));
const fr = (i) => FRESKO[((Math.round(i) % FRESKO.length) + FRESKO.length) % FRESKO.length];
const GLAS = PAL.typesForRole('glas');
const glas = (a, b) => GLAS[Math.abs(a * 5 + b * 3) % GLAS.length];

// ------------------------------------------------------------------ Laden
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt;
  const haupt = H.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, a: Math.abs(l.w - AX), d8: H.d8(x, z), gt: GRUND.groundTopY(x, z), wo: 'kirche' };
  });
  for (const c of haupt) c.zone = zone(c);
  const byKey = new Map();
  for (const c of haupt) byKey.set(P.ck(c.x, c.z), c);
  L = { json, masken, R, H, haupt, alle: haupt, byKey };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

function zone(c) {
  const a = Math.abs(c.w - AX);
  if (c.u < U_FASS) return 'fassade';
  if (c.u < U_QUER) return a < W_PF1 - 1 ? 'schiff' : a < W_SEITE ? 'seite' : 'kapelle';
  if (c.w > W_GUAL && c.u < U_KOPF) return 'gualberto';
  if (c.w < W_SAK) return 'sakristei';
  if (c.u < U_KOPF) return 'quer';
  if (c.w >= W_SASS) return 'sassetti';
  if (c.w >= CHOR.w0 && c.w < CHOR.w1) return 'chor';
  return 'kopfkapelle';
}
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);
const spitz = (y0, h, x, a) => (Math.abs(x) < a ? Math.floor(y0 + h * Math.sqrt(Math.max(0, 1 - Math.abs(x) / a))) : -1);
const joch = (u) => { const k = Math.max(0, Math.min(JOCHE - 1, Math.floor((u - U_FASS) / JOCH))); return { k, u0: U_FASS + k * JOCH, u1: U_FASS + (k + 1) * JOCH, uc: U_FASS + (k + 0.5) * JOCH }; };
const jochGrenze = (u) => { const k = Math.round((u - U_FASS) / JOCH); return k >= 1 && k <= JOCHE && Math.abs(u - U_FASS - k * JOCH) < 1.5; };
function gewoelbe(du, dw, hu, hw, k0, k1) {
  const f = (t) => Math.sqrt(Math.max(0, 1 - Math.min(1, Math.abs(t))));
  return Math.floor(k0 + (k1 - k0) * Math.max(f(du / hu), f(dw / hw)));
}
// Querhaus in Joche quer zur Achse (Breite 16)
const QJ = 16;
const querJoch = (w) => { const k = Math.floor((w - AX - W_PF0) / QJ); return AX + W_PF0 + (k + 0.5) * QJ; };

function decke(c) {
  switch (c.zone) {
    case 'schiff': { const j = joch(c.u); return gewoelbe(c.u - j.uc, c.w - AX, JOCH / 2, W_PF0, M.k, M.s); }
    case 'seite': { const j = joch(c.u); return gewoelbe(c.u - j.uc, c.a - (W_PF1 + W_SEITE) / 2, JOCH / 2, (W_SEITE - W_PF1) / 2, S.k, S.s); }
    case 'kapelle': return KAP.decke;
    case 'quer': { const mitte = Math.abs(c.w - AX) < W_PF0 ? AX : querJoch(c.w); return gewoelbe(c.u - (U_QUER + U_KOPF) / 2, c.w - mitte, (U_KOPF - U_QUER) / 2, Math.abs(c.w - AX) < W_PF0 ? W_PF0 : QJ / 2, M.k, M.s); }
    case 'chor': return gewoelbe(c.u - 88, c.w - AX, 9, 6, CHOR.k, CHOR.s);
    case 'kopfkapelle': case 'sassetti': return KOPF.decke;
    case 'gualberto': case 'sakristei': return QK.decke;
    default: return null;
  }
}
function fassadeHoehe(c) {
  const a = c.a;
  if (a <= 10) return 52 + Math.round(10 * (1 - a / 10));                              // Giebel über dem Mittelschiff
  if (a <= 14) return 40 + Math.round(12 * Math.sqrt(Math.max(0, 1 - ((a - 10) / 4) ** 2)));   // Voluten
  return 40;
}
function dach(c) {
  switch (c.zone) {
    case 'fassade': return fassadeHoehe(c);
    case 'schiff': return Math.round(M.first - (M.first - M.traufe) * Math.min(1, c.a / W_PF1));
    case 'seite': case 'kapelle': {
      if (c.zone === 'seite' || c.a < W_SEITE + 1) return Math.round(S.dachI - (S.dachI - S.dachA) * Math.min(1, (c.a - W_PF1) / (W_SEITE - W_PF1)));
      return Math.round(KAP.dachI - (KAP.dachI - KAP.dachA) * Math.min(1, (c.a - W_SEITE) / 18));
    }
    case 'quer': return Math.round(M.first - (M.first - M.traufe) * Math.min(1, Math.abs(c.u - (U_QUER + U_KOPF) / 2) / ((U_KOPF - U_QUER) / 2 + 1)));
    case 'chor': return CHOR.dach;
    case 'kopfkapelle': case 'sassetti': return KOPF.dach;
    case 'gualberto': case 'sakristei': return QK.dach;
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
  const hat = (x, y, z) => zellen.has(key(x, y, z));
  const frei = (x, y, z) => luft.add(key(x, y, z));
  const oeff = new Map();
  const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); frei(x, y, z); };
  const unz = new Map();
  const unzug = (p, b, x, y, z) => { const k = p + '|' + b; if (!unz.has(k)) unz.set(k, []); unz.get(k).push({ x, y, z }); };
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const N8 = N4.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
  const zoneBei = (x, z) => { const n = zelleBei(x, z); return n ? n.zone : null; };

  const D_ = new Map();
  for (const c of D.haupt) D_.set(P.ck(c.x, c.z), dach(c));
  const dachBei = (x, z) => D_.get(P.ck(x, z));

  // ---- Öffnungen: Hauptportal, zwei Seitenportale
  const PORTALE = [{ w: AX, a: 3.5, h: 11, art: 'tor' }, { w: AX - 12.5, a: 2, h: 7, art: 'tuer' }, { w: AX + 12.5, a: 2, h: 7, art: 'tuer' }];
  for (const c of D.haupt) {
    if (c.zone !== 'fassade') continue;
    for (const p of PORTALE) for (let yr = 1; yr <= rund(p.h, c.w - p.w, p.a); yr++) oeffnung(p.art, 'portale', c.x, Y(yr), c.z);
  }

  // ---- Modul 0: Fundament und Boden
  for (const c of D.alle) for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
  for (const c of D.alle) {
    let t = T.serena;
    if (c.zone === 'schiff' || c.zone === 'quer' || c.zone === 'chor') t = ((Math.floor(c.u / 3) + Math.floor((c.w + 60) / 3)) % 2) ? T.serena : T.weiss;
    else if (c.zone === 'kapelle' || c.zone === 'kopfkapelle' || c.zone === 'sassetti' || c.zone === 'gualberto' || c.zone === 'sakristei') t = T.terrakotta;
    set(c.x, Y(0), c.z, t, 'boden');
  }

  // ---- Modul 1: Fassade (Buontalenti 1593–94: zwei Pilasterordnungen, Giebel mit Rundfenster, Relief der Trinität)
  for (const c of D.haupt) {
    if (c.zone !== 'fassade') continue;
    const top = fassadeHoehe(c), vorn = c.u < 1;
    for (let yr = 1; yr <= top; yr++) {
      if (luft.has(key(c.x, Y(yr), c.z))) continue;
      const ok = Math.hypot(c.w - AX, yr - 46) <= 3.2;
      if (ok) { set(c.x, Y(yr), c.z, Math.hypot(c.w - AX, yr - 46) > 2.4 ? T.serena : glas(Math.round(c.w), yr), 'fassade'); continue; }
      let t = T.sand;
      if (vorn) {
        const ra = Math.round(c.a);
        const pilaster = ra === 9 || ra === 10 || ra === 20 || ra === 21 || (yr > 26 && (ra === 6 || ra === 7));
        if (yr === 25 || yr === 26 || yr === top || (yr >= 50 && c.a <= 10 && yr === 51)) t = T.serena;                // Gebälk, Giebelkante
        else if (pilaster) t = T.serena;
        else if (c.a < 3.5 && yr >= 15 && yr <= 21) t = Math.abs(c.w - AX) < 1.5 && yr >= 17 && yr <= 20 ? T.weiss : T.ornament;   // Relief der Trinität
        else if (c.a < 2 && yr >= 29 && yr <= 36) t = T.weiss;                                                       // Statue des hl. Alexius
      }
      set(c.x, Y(yr), c.z, t, 'fassade');
    }
  }

  // ---- Modul 2: Pfeiler, Arkaden, Obergaden; Kapellen links
  for (const c of D.haupt) {
    if (c.u < U_FASS || c.u >= U_QUER + 1) continue;
    if (c.a < W_PF0 || c.a >= W_PF1 || c.d8 <= 2) continue;
    const j = joch(c.u), top = Math.max(dachBei(c.x, c.z) || 0, M.traufe);
    const pfeiler = jochGrenze(c.u) || c.u >= U_QUER - 1;
    const a0 = j.u0 + 1.5, a1 = j.u1 - 1.5;
    const lai = pfeiler ? -1 : spitz(S.k, S.s - S.k, c.u - (a0 + a1) / 2, (a1 - a0) / 2);
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (pfeiler && yr <= M.k) { set(c.x, Y(yr), c.z, yr === S.k || yr === M.k ? T.ornament : T.serena, 'pfeiler'); continue; }
      if (lai >= 0 && yr <= lai) continue;
      const fe = !pfeiler && Math.abs(c.u - j.uc) < 1.5 && yr >= 38 && yr <= spitz(41, 3, c.u - j.uc, 1.6);
      if (fe) { set(c.x, Y(yr), c.z, glas(j.k, yr), 'obergaden'); continue; }
      set(c.x, Y(yr), c.z, lai >= 0 && yr <= lai + 1 ? T.serena : (yr > S.dachI ? T.mauer : T.putz), yr <= S.s + 1 ? 'arkaden' : 'obergaden');
    }
  }
  for (const c of D.haupt) {                                            // linke Kapellen: Trennwände und Bögen zum Seitenschiff
    if (c.zone !== 'kapelle' || c.d8 <= 2) continue;
    const j = joch(c.u), top = dachBei(c.x, c.z);
    const grenze = jochGrenze(c.u) || c.u < U_FASS + 1.5;
    const bogenwand = c.a < W_SEITE + 1.5;
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (grenze) { set(c.x, Y(yr), c.z, yr <= KAP.decke ? T.serena : T.putz, 'kapellen'); continue; }
      if (bogenwand) { const lai = spitz(10, KAP.decke - 12, c.u - j.uc, JOCH / 2 - 1.5); if (yr > lai) set(c.x, Y(yr), c.z, yr <= lai + 1 ? T.serena : T.putz, 'kapellen'); continue; }
      if (yr === KAP.decke) { set(c.x, Y(yr), c.z, T.putz, 'kapellen'); continue; }
      if (yr > KAP.decke) { unzug('daecher', 'Dachraum über Gewölben und Decken (ohne Zugang)', c.x, Y(yr), c.z); continue; }
      // Bartolini-Salimbeni-Kapelle (4. Joch) mit Fresken, sonst Altar an der Rückwand
      if (c.d8 === 3 && Math.abs(c.u - j.uc) < 2 && yr <= 3) set(c.x, Y(yr), c.z, yr === 3 ? T.gold : T.weiss, 'altaere');
    }
  }

  // ---- Modul 3: Außenwände und Trennwände der Kapellen am Querhaus
  for (const c of D.haupt) {
    if (c.zone === 'fassade' || c.d8 > 2) continue;
    const top = dachBei(c.x, c.z); if (top == null) continue;
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      let fe = false;
      if (c.zone === 'seite' || c.zone === 'kapelle') { const j = joch(c.u); fe = Math.abs(c.u - j.uc) < 1.2 && yr >= 7 && yr <= spitz(13, 3, c.u - j.uc, 1.3); }
      else if (c.zone === 'chor') fe = c.u > 94 && (Math.abs(c.w - AX + 1.5) < 0.8 || Math.abs(c.w - AX - 1.5) < 0.8) && yr >= 10 && yr <= 30;   // lange Bifora der Apsis
      else if (c.zone === 'quer') fe = yr >= 32 && yr <= spitz(38, 4, 0, 1) && Math.abs(c.u - 70) < 1.5;
      else if (c.zone === 'sassetti' || c.zone === 'gualberto' || c.zone === 'kopfkapelle' || c.zone === 'sakristei') fe = yr >= 8 && yr <= 15 && (Math.round(c.u + c.w) % 9 === 0);
      if (fe) { set(c.x, Y(yr), c.z, glas(Math.round(c.u + c.w), yr), 'fenster'); continue; }
      const links = c.w < AX && c.zone !== 'chor';
      set(c.x, Y(yr), c.z, c.d8 === 1 ? (links ? T.rustika : (yr <= 2 ? T.serena : T.bruch)) : T.putz, 'aussenwaende');
    }
  }
  // Trennwände: Querhaus | Kopfkapellen (u 79), zwischen den Kopfkapellen, Gualberto (w 30), Sakristei (w −28)
  const trenn = (c) => {
    if (c.d8 <= 2) return null;
    if (c.u >= U_KOPF && c.u < U_KOPF + 2 && c.zone !== 'gualberto' && c.zone !== 'sakristei') {
      const mitte = c.zone === 'chor' ? AX : c.zone === 'sassetti' ? 19.5 : c.w < AX ? -12 : 7;
      const a = c.zone === 'chor' ? 5 : c.zone === 'sassetti' ? 7.5 : 2.5;
      return { bogen: c.zone === 'chor' ? spitz(18, 14, c.w - mitte, a) : spitz(10, 8, c.w - mitte, a), p: c.zone === 'sassetti' ? 'sassetti' : 'kopfkapellen' };
    }
    if (c.u >= U_KOPF && (Math.abs(c.w - CHOR.w0) < 1 || Math.abs(c.w - CHOR.w1) < 1 || Math.abs(c.w - W_SASS) < 1)) return { bogen: -1, p: c.zone === 'sassetti' ? 'sassetti' : 'kopfkapellen' };
    if (c.zone === 'gualberto' && c.w < W_GUAL + 2) return { bogen: spitz(14, 10, c.u - 68, 5), p: 'gualberto' };
    if (c.zone === 'sakristei' && c.w > W_SAK - 2) return { bogen: Math.abs(c.u - 70) < 2 ? 7 : -1, p: 'sakristei' };
    return null;
  };
  for (const c of D.haupt) {
    const tr = trenn(c); if (!tr) continue;
    const top = dachBei(c.x, c.z);   // Giebel zum höheren Querhaus schließt dessen Dachabschluss
    let nbDach = Infinity;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < nbDach) nbDach = n; }
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (yr <= tr.bogen) { if (tr.p === 'sakristei') oeffnung('tuer', 'sakristei', c.x, Y(yr), c.z); continue; }
      set(c.x, Y(yr), c.z, yr <= tr.bogen + 1 ? T.serena : yr > nbDach ? T.mauer : T.putz, tr.p);
    }
  }
  // Fresken: Cappella Sassetti (Ghirlandaio 1483–86) und Bartolini Salimbeni (Lorenzo Monaco 1420–25)
  for (const c of D.haupt) {
    const sass = c.zone === 'sassetti' && c.u >= U_KOPF + 2, bart = c.zone === 'kapelle' && joch(c.u).k === 3;
    if ((!sass && !bart) || c.d8 <= 2) continue;
    for (const [dx, dz] of N4) {
      const n = zelleBei(c.x + dx, c.z + dz); if (!n) continue;
      for (let yr = 3; yr < (sass ? KOPF.decke : KAP.decke); yr++) {
        const e = zellen.get(key(n.x, Y(yr), n.z));
        if (!e || e.t !== T.putz || hat(c.x, Y(yr), c.z)) continue;
        e.t = yr % 6 === 0 ? T.gold : fr(Math.floor((n.u + n.w) / 3) + Math.floor(yr / 6));
      }
    }
  }

  // ---- Modul 4: Gewölbe, Decken und Dächer; Dachräume unzugänglich
  for (const c of D.haupt) {
    if (c.zone === 'fassade' || c.d8 <= 2 || c.zone === 'kapelle') continue;
    const dk = decke(c), top = dachBei(c.x, c.z);
    if (dk == null || top == null) continue;
    let lo = dk;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); if (n && n.zone !== 'fassade' && n.zone !== 'kapelle' && n.d8 > 2) { const nd = decke(n); if (nd != null && nd < lo) lo = nd; } }
    const gurt = (c.zone === 'schiff' || c.zone === 'seite') && jochGrenze(c.u);
    let nbDach = Infinity;                                              // außen sichtbar über niedrigeren Nachbardächern
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < nbDach) nbDach = n; }
    for (let yr = lo; yr <= dk; yr++) if (!hat(c.x, Y(yr), c.z) && !luft.has(key(c.x, Y(yr), c.z))) set(c.x, Y(yr), c.z, yr > nbDach ? T.mauer : gurt ? T.serena : T.putz, 'gewoelbe');
    for (let yr = dk + 1; yr < top; yr++) if (!hat(c.x, Y(yr), c.z)) unzug('daecher', 'Dachraum über Gewölben und Decken (ohne Zugang)', c.x, Y(yr), c.z);
  }
  for (const c of D.haupt) {
    if (c.zone === 'fassade') continue;
    const top = dachBei(c.x, c.z);
    if (top == null) continue;
    let lo = top;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < lo && zoneBei(c.x + dx, c.z + dz) !== 'fassade') lo = n; }
    for (let yr = lo; yr <= top; yr++) if (!hat(c.x, Y(yr), c.z) && !luft.has(key(c.x, Y(yr), c.z))) set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.mauer, yr >= top - 1 ? 'daecher' : 'schildwaende');   // Lage unter dem Ziegel im selben Schritt
  }

  // ---- Modul 5: Hochaltar und Licht
  for (const c of D.haupt) {
    if (c.zone !== 'chor' || Math.abs(c.u - 90) > 1.5 || Math.abs(c.w - AX) > 2.5) continue;
    for (let yr = 1; yr <= 4; yr++) set(c.x, Y(yr), c.z, yr === 4 ? T.gold : T.weiss, 'hochaltar');
  }
  const steh = [];
  for (const c of D.alle) {
    const b = zellen.get(key(c.x, Y(0), c.z));
    if (b && b.p === 'boden' && !hat(c.x, Y(1), c.z) && !hat(c.x, Y(2), c.z)) steh.push({ x: c.x, y: Y(1), z: c.z });
  }
  const lt = [];
  for (const l of WZ.lichtRaster(steh, { abstand: 12 })) {
    const k = key(l.x, l.y, l.z); const e = zellen.get(k); if (!e) continue;
    teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = 'licht'; lt.push(k);
  }
  teile.set('licht', lt);

  PLAN = { zellen, teile, oeff, unz };
  return PLAN;
}

const OEFF_TEIL = { portale: 'fassade' };
function modul(n, liste) {
  return {
    module: n,
    build(ctx) {
      const Pl = plan();
      for (const id of liste) {
        const keys = Pl.teile.get(id) || [];
        if (!keys.length) continue;
        const cells = keys.map((k) => Pl.zellen.get(k));
        const typ = new Map(cells.map((c) => [c.x + ',' + c.y + ',' + c.z, c.t]));
        ctx.part(id).fill(cells, (x, y, z) => typ.get(x + ',' + y + ',' + z));
        for (const [k, z] of Pl.oeff) { const [art, pp] = k.split('|'); if ((OEFF_TEIL[pp] || pp) === id) ctx.oeffnung(z, art); }
        for (const [k, z] of Pl.unz) { const i = k.indexOf('|'); if (k.slice(0, i) === id) ctx.unzugaenglich(z, k.slice(i + 1)); }
      }
    }
  };
}

module.exports = { modul, lade, plan, zelleBei, zone, Y, BODEN_Y, T, JOCHE, M, AX };
