'use strict';
// Gemeinsame Geometrie und Bauplan der Santissima Annunziata (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/santissima_annunziata/).
// Ein Bauplan für alle Module, erste Setzung gewinnt; Module sind Teillisten (modul(n, [...])).
//
// Rahmen SA: u von der Piazza (Südwesten) zur Tribuna (Nordosten), w quer (w > 0 Südosten). Lagen yr = Y − 67.
// Von vorn nach hinten: Portikus (Caccini 1601), Chiostrino dei Voti (Michelozzo ab 1447, offener Hof mit
// Bogengängen), einschiffige Kirche mit Kapellen (links 8, rechts 9) und Michelozzos Tempietto, dahinter die
// runde Tribuna (Michelozzo/Alberti, 1444–1477) mit Kapellenkranz und Kuppel.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 67;
const Y = (yr) => BODEN_Y + yr;

// ------------------------------------------------------------------ Maße (Referenzmaße §1–§3)
const AX = 4;                              // Achse der Kirche (w), Mitte zwischen den Kapellenwänden
const U_PORT = 7, U_KIRCHE = 47, U_TRIB = 138;
const PORT = { kaempfer: 12, joche: 7, w0: -38.3, w1: 38.6, decke: 18, dach: 20 };
const CH = { u0: U_PORT, u1: U_KIRCHE, w0: -13, hof: { u0: 15, u1: 39, w0: -5, w1: 30 }, decke: 13, dachI: 14, dachA: 16 };
const SEITE = { decke: 18, dach: 20 };
const W_SCHIFF = 13;                       // Schiff innen |w − AX| < 13 (13 m)
const S_DECKE = 40, S_FIRST = 54, S_TRAUFE = 46, KAP_DECKE = 22, KAP_DACH_I = 34, KAP_DACH_A = 28;
const KAP = { links: 8, rechts: 9 };
const TRIB = { u: 165, w: 3.5, ri: 20, rd: 22.5, rk: 26, ra: 28, kap: 9, decke: 21, tambour: 42, rKa: 22.5 };
const TEMPIETTO = { u0: 49, u1: 58, w0: -8, w1: 0, saeule: 11 };   // 5,25 m hohe Säulen = 10,5 Blöcke

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'), ziegelw: WZ.typ('ziegel_kuppel'),
  serena: WZ.typ('pietra_serena'), putz: WZ.typ('putz_weiss'), ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'),
  weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), saeule: WZ.typ('marmor_saeule'), gold: WZ.typ('gold'),
  gelb: WZ.typ('putz_gelb'), terrakotta: WZ.typ('putz_rosa'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), bronze: WZ.typ('bronze')
};
const FRESKO = ['blau', 'rot', 'gelb', 'gruen', 'braun', 'hellblau', 'orange'].map((f) => WZ.fresko(f));
const GLAS = PAL.typesForRole('glas');
const glas = (a, b) => GLAS[Math.abs(a * 5 + b * 3) % GLAS.length];
const fr = (i) => FRESKO[((Math.round(i) % FRESKO.length) + FRESKO.length) % FRESKO.length];

// ------------------------------------------------------------------ Laden
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt;
  const haupt = H.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z), wo: 'kirche' };
  });
  for (const c of haupt) c.zone = zone(c);
  const byKey = new Map();
  for (const c of haupt) byKey.set(P.ck(c.x, c.z), c);
  L = { json, masken, R, H, haupt, alle: haupt, byKey };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

const rTrib = (c) => Math.hypot(c.u - TRIB.u, c.w - TRIB.w);
const phiTrib = (c) => Math.atan2(c.w - TRIB.w, c.u - TRIB.u) * 180 / Math.PI;   // 0° = Scheitel der Tribuna, ±180° = Schiff
function zone(c) {
  if (c.u < U_PORT) return 'portikus';
  if (c.u < U_KIRCHE) return c.w < CH.w0 ? 'seitenraum' : 'chiostrino';
  const r = rTrib(c);
  if (c.u >= U_TRIB || r < TRIB.ra) {
    if (r < TRIB.ri) return 'tribuna';
    const bogen = Math.abs(Math.atan2(c.w - TRIB.w, c.u - TRIB.u) * 180 / Math.PI) > 150;
    if (r < TRIB.rd || (r < TRIB.ra && !bogen)) return 'kranz';
    if (Math.abs(c.w - AX) < W_SCHIFF && c.u < U_TRIB + 12) return 'schiff';
    return 'neben';
  }
  return Math.abs(c.w - AX) < W_SCHIFF ? 'schiff' : 'kapelle';
}
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);
// Kapellen des Schiffs: links (w < AX) 8 zwischen u 47 und 116, rechts 9 zwischen u 47 und 138
const kapRaster = (c) => {
  const links = c.w < AX, n = links ? KAP.links : KAP.rechts, u1 = links ? 116 : U_TRIB;
  const j = (u1 - U_KIRCHE) / n, k = Math.floor((c.u - U_KIRCHE) / j);
  return { j, k, mitte: U_KIRCHE + (k + 0.5) * j, grenze: k >= 0 && k <= n && Math.abs(c.u - U_KIRCHE - Math.round((c.u - U_KIRCHE) / j) * j) < 1.3, imRaster: c.u < u1 };
};
// Kapellenkranz der Tribuna: 9 Kapellen auf 300° (die 60° zum Schiff sind der Triumphbogen)
const KRANZ_SPANNE = 300 / TRIB.kap;
const kranzLage = (c) => {
  const phi = phiTrib(c);
  if (Math.abs(phi) > 150) return { bogen: true };
  const t = (phi + 150) / KRANZ_SPANNE, k = Math.floor(t), f = t - k;
  const bog = f * KRANZ_SPANNE * Math.PI / 180 * TRIB.ri;            // Bogenlänge ab Kapellenrand auf dem Innenkreis
  const breite = KRANZ_SPANNE * Math.PI / 180 * TRIB.ri;
  return { bogen: false, k, pfeiler: bog < 1.5 || bog > breite - 1.5, mitte: bog - breite / 2 };
};

function dachSchiff(w) {
  const a = Math.abs(w - AX);
  if (a < W_SCHIFF + 1) return Math.round(S_FIRST - (S_FIRST - S_TRAUFE) * a / (W_SCHIFF + 1));
  return Math.round(KAP_DACH_I - (KAP_DACH_I - KAP_DACH_A) * Math.min(1, (a - W_SCHIFF - 1) / 20));
}
function decke(c) {
  switch (c.zone) {
    case 'portikus': return PORT.decke;
    case 'seitenraum': return SEITE.decke;
    case 'chiostrino': return imHof(c) ? null : CH.decke;
    case 'schiff': return S_DECKE;
    case 'kapelle': return KAP_DECKE;
    case 'kranz': return rTrib(c) >= TRIB.rd ? TRIB.decke : null;
    case 'neben': return 24;
    default: return null;
  }
}
const imHof = (c) => c.u >= CH.hof.u0 && c.u < CH.hof.u1 && c.w >= CH.hof.w0 && c.w < CH.hof.w1;
const hofAbstand = (c) => Math.max(CH.hof.u0 - c.u, c.u - CH.hof.u1 + 1, CH.hof.w0 - c.w, c.w - CH.hof.w1 + 1);
function dach(c) {
  switch (c.zone) {
    case 'portikus': return PORT.dach;
    case 'seitenraum': return SEITE.dach;
    case 'chiostrino': {
      if (imHof(c)) return null;
      if (c.u >= U_KIRCHE - 3) return dachSchiff(c.w);                 // Innenfassade der Kirche
      return Math.round(CH.dachI + (CH.dachA - CH.dachI) * Math.min(1, hofAbstand(c) / 8));
    }
    case 'schiff': case 'kapelle': return dachSchiff(c.w);
    case 'kranz': { const r = rTrib(c); return r < TRIB.rd ? null : Math.round(32 - 4 * Math.min(1, (r - TRIB.rd) / (TRIB.ra - TRIB.rd))); }
    case 'neben': return 26;
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

  const D_ = new Map();
  for (const c of D.haupt) D_.set(P.ck(c.x, c.z), dach(c));
  const dachBei = (x, z) => D_.get(P.ck(x, z));
  const zoneBei = (x, z) => { const n = zelleBei(x, z); return n ? n.zone : null; };

  // ---- Öffnungen: Portikus (7 Bögen), Türen ins Chiostrino, in den Seitenraum, Hauptportal der Kirche
  const portJoch = (PORT.w1 - PORT.w0) / PORT.joche;
  for (const c of D.haupt) {
    if (c.zone === 'portikus' && c.u < 2) {
      const k = Math.floor((c.w - PORT.w0) / portJoch), m = PORT.w0 + (k + 0.5) * portJoch;
      const lai = rund(PORT.kaempfer, c.w - m, portJoch / 2 - 1);
      for (let yr = 1; yr <= lai; yr++) oeffnung('tor', 'portikus', c.x, Y(yr), c.z);
    }
    if (c.zone === 'chiostrino' && c.u < U_PORT + 2 && Math.abs(c.w - AX) < 4) for (let yr = 1; yr <= rund(8, c.w - AX, 4); yr++) oeffnung('tor', 'chiostrino', c.x, Y(yr), c.z);
    if (c.zone === 'seitenraum' && c.u < U_PORT + 2 && Math.abs(c.w + 25) < 2) for (let yr = 1; yr <= 7; yr++) oeffnung('tuer', 'seitenraum', c.x, Y(yr), c.z);
    if (c.zone === 'chiostrino' && c.u >= U_KIRCHE - 3 && Math.abs(c.w - AX) < 4) for (let yr = 1; yr <= rund(9, c.w - AX, 4); yr++) oeffnung('tor', 'innenfassade', c.x, Y(yr), c.z);
  }

  // ---- Modul 0: Fundament und Boden
  for (const c of D.alle) for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
  for (const c of D.alle) {
    let t = T.serena;
    if (c.zone === 'schiff' || c.zone === 'tribuna') t = ((Math.floor(c.u / 4) + Math.floor((c.w + 40) / 4)) % 2) ? T.serena : T.weiss;
    else if (c.zone === 'chiostrino' && imHof(c)) t = T.serena;
    else if (c.zone === 'kapelle' || c.zone === 'kranz' || c.zone === 'neben') t = T.terrakotta;
    set(c.x, Y(0), c.z, t, 'boden');
  }

  // ---- Modul 1: Portikus und Chiostrino dei Voti
  for (const c of D.haupt) {
    if (c.zone !== 'portikus') continue;
    const k = Math.floor((c.w - PORT.w0) / portJoch), m = PORT.w0 + (k + 0.5) * portJoch;
    const saeule = c.u >= 0.5 && c.u < 2.5 && Math.abs(Math.abs(c.w - m) - portJoch / 2) < 1 && c.d8 > 1;
    for (let yr = 1; yr <= PORT.dach; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      const rand = c.d8 <= 2 && (c.w < PORT.w0 + 2 || c.w > PORT.w1 - 2);
      if (c.u < 2.5 || rand) { set(c.x, Y(yr), c.z, yr === PORT.dach ? T.ziegel : yr >= PORT.decke - 1 ? T.serena : (saeule || rand ? T.serena : T.putz), 'portikus'); continue; }
      if (yr === PORT.decke) set(c.x, Y(yr), c.z, (Math.round(c.w) % 4 === 0) ? T.serena : T.putz, 'portikus');
      else if (yr > PORT.decke) set(c.x, Y(yr), c.z, yr === PORT.dach ? T.ziegel : T.mauer, 'portikus');
    }
  }
  for (const c of D.haupt) {
    if (c.zone !== 'chiostrino' || imHof(c) || c.u >= U_KIRCHE - 3) continue;
    const wand = c.d8 <= 2 || c.u < U_PORT + 2;
    const top = c.u < U_PORT + 2 ? PORT.dach : dachBei(c.x, c.z);   // Rückwand des Portikus bis unter dessen Dach
    const innen = N8.some(([dx, dz]) => { const n = zelleBei(c.x + dx, c.z + dz); return n && n.zone === 'chiostrino' && imHof(n); });                                   // Säulenreihe am Hof
    const lu = c.u < CH.hof.u0 || c.u >= CH.hof.u1 ? c.w : c.u;         // Längsrichtung der Arkade
    const joch = 6, m = Math.floor(lu / joch) * joch + joch / 2;
    const saeule = innen && Math.abs(lu - Math.floor(lu / joch) * joch) < 1;
    for (let yr = 1; yr <= top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (yr === top) { set(c.x, Y(yr), c.z, T.ziegel, 'chiostrino'); continue; }
      if (wand) { set(c.x, Y(yr), c.z, c.d8 === 1 ? T.bruch : (yr >= 3 && yr <= 11 ? fr((Math.floor((c.u + c.w) / 5) + Math.floor(yr / 4))) : T.putz), 'chiostrino'); continue; }
      if (innen) {
        if (saeule || yr > rund(8, lu - m, joch / 2 - 0.5)) set(c.x, Y(yr), c.z, saeule && yr < 9 ? T.saeule : T.serena, 'chiostrino');
        else oeffnung('arkade', 'chiostrino', c.x, Y(yr), c.z);           // Bogengang zum offenen Hof
        continue;
      }
      if (yr >= CH.decke) set(c.x, Y(yr), c.z, yr === CH.decke ? T.putz : T.mauer, 'chiostrino');
    }
  }
  for (const c of D.haupt) {                                            // Seitenraum links am Portikus
    if (c.zone !== 'seitenraum') continue;
    const wand = c.d8 <= 2 || c.u < U_PORT + 2 || N8.some(([dx, dz]) => { const z = zoneBei(c.x + dx, c.z + dz); return z && z !== 'seitenraum'; });
    for (let yr = 1; yr <= SEITE.dach; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (yr === SEITE.dach) set(c.x, Y(yr), c.z, T.ziegel, 'seitenraum');
      else if (wand) set(c.x, Y(yr), c.z, c.d8 === 1 ? T.bruch : T.putz, 'seitenraum');
      else if (yr === SEITE.decke) set(c.x, Y(yr), c.z, T.putz, 'seitenraum');
      else if (yr > SEITE.decke) unzug('seitenraum', 'Hohlraum über der Decke', c.x, Y(yr), c.z);
    }
  }

  // ---- Modul 2: Innenfassade, Kapellen des Schiffs, Hochwand, Tempietto
  for (const c of D.haupt) {
    if (c.zone !== 'chiostrino' || c.u < U_KIRCHE - 3) continue;
    const top = dachBei(c.x, c.z);
    for (let yr = 1; yr <= top; yr++) if (!hat(c.x, Y(yr), c.z) && !luft.has(key(c.x, Y(yr), c.z))) set(c.x, Y(yr), c.z, yr === top ? T.ziegel : (c.u < U_KIRCHE - 2 ? T.bruch : T.putz), 'innenfassade');
  }
  for (const c of D.haupt) {
    if (c.zone !== 'kapelle' || c.d8 <= 2) continue;
    const top = dachBei(c.x, c.z), a = Math.abs(c.w - AX), kr = kapRaster(c);
    const aussenSeite = N4.some(([dx, dz]) => { const n = zelleBei(c.x + dx, c.z + dz); return n && Math.abs(n.w - AX) >= W_SCHIFF + 1; });
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (yr > KAP_DECKE) {
        if (a < W_SCHIFF + 1.5) {                                       // Hochwand mit Fenster je Kapelle
          const fe = Math.abs(c.u - kr.mitte) < 1.5 && yr >= 27 && yr <= rund(33, c.u - kr.mitte, 2) && kr.imRaster;
          set(c.x, Y(yr), c.z, fe ? glas(Math.round(c.u), yr) : (yr === S_DECKE - 1 ? T.serena : aussenSeite ? T.mauer : T.putz), 'hochwand');
        } else if (yr === KAP_DECKE + 1) set(c.x, Y(yr), c.z, T.putz, 'kapellendecken');
        else unzug('daecher', 'Dachraum über Decken und Kapellen (ohne Zugang)', c.x, Y(yr), c.z);
        continue;
      }
      if (kr.grenze || !kr.imRaster) { set(c.x, Y(yr), c.z, T.serena, 'kapellenpfeiler'); continue; }
      if (a < W_SCHIFF + 1.5) { if (yr > rund(14, c.u - kr.mitte, kr.j / 2 - 1.3)) set(c.x, Y(yr), c.z, yr <= rund(14, c.u - kr.mitte, kr.j / 2 - 1.3) + 1 ? T.serena : T.putz, 'kapellenpfeiler'); continue; }
      if (yr === KAP_DECKE) { set(c.x, Y(yr), c.z, T.putz, 'kapellendecken'); continue; }
      if (c.d8 === 3 && Math.abs(c.u - kr.mitte) < 2 && yr <= 3) set(c.x, Y(yr), c.z, yr === 3 ? T.gold : T.weiss, 'altaere');
    }
  }
  // Tempietto (Michelozzo 1447–48): vier Marmorsäulen, Gebälk, hölzerne Bekrönung (1674)
  for (const c of D.haupt) {
    if (c.zone !== 'schiff' || c.u < TEMPIETTO.u0 || c.u >= TEMPIETTO.u1 || c.w < TEMPIETTO.w0 || c.w >= TEMPIETTO.w1) continue;
    const ecke = (c.u < TEMPIETTO.u0 + 1 || c.u >= TEMPIETTO.u1 - 1) && (c.w < TEMPIETTO.w0 + 1 || c.w >= TEMPIETTO.w1 - 1);
    if (ecke) for (let yr = 1; yr <= TEMPIETTO.saeule; yr++) set(c.x, Y(yr), c.z, yr === TEMPIETTO.saeule ? T.ornament : T.saeule, 'tempietto');
    const du = Math.min(c.u - TEMPIETTO.u0, TEMPIETTO.u1 - 1 - c.u), dw = Math.min(c.w - TEMPIETTO.w0, TEMPIETTO.w1 - 1 - c.w), d = Math.min(du, dw);
    set(c.x, Y(TEMPIETTO.saeule + 1), c.z, T.weiss, 'tempietto');
    set(c.x, Y(TEMPIETTO.saeule + 2), c.z, d < 1 ? T.ornament : T.weiss, 'tempietto');
    for (let s = 1; s <= 4; s++) if (d >= s - 1) set(c.x, Y(TEMPIETTO.saeule + 2 + s), c.z, s === 4 ? T.gold : T.holz, 'tempietto');
    for (let yr = TEMPIETTO.saeule + 3; yr <= TEMPIETTO.saeule + 9; yr++) unzug('tempietto', 'Bekrönung des Tempietto (nicht begehbar)', c.x, Y(yr), c.z);
    if (Math.abs(c.u - (TEMPIETTO.u0 + TEMPIETTO.u1) / 2) < 1.5 && Math.abs(c.w - (TEMPIETTO.w0 + TEMPIETTO.w1) / 2) < 1.5) for (let yr = 1; yr <= 3; yr++) set(c.x, Y(yr), c.z, yr === 3 ? T.gold : T.weiss, 'tempietto');
  }

  // ---- Modul 3: Außenwände, Nebenräume der Tribuna
  for (const c of D.haupt) {
    if (c.zone === 'portikus' || c.zone === 'chiostrino' || c.zone === 'seitenraum' || c.d8 > 2) continue;
    if (c.zone === 'tribuna' || (c.zone === 'kranz' && rTrib(c) < TRIB.rk)) continue;
    let top = dachBei(c.x, c.z); if (top == null) continue;
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      let fe = false;
      if (c.zone === 'kapelle') { const kr = kapRaster(c); fe = kr.imRaster && Math.abs(c.u - kr.mitte) < 1.5 && yr >= 8 && yr <= rund(15, c.u - kr.mitte, 1.6); }
      if (fe) { set(c.x, Y(yr), c.z, glas(Math.round(c.u + c.w), yr), 'fenster'); continue; }
      set(c.x, Y(yr), c.z, c.d8 === 1 ? (yr <= 2 ? T.serena : T.bruch) : T.putz, 'aussenwaende');
    }
  }
  for (const c of D.haupt) {                                            // Nebenräume: Wände an allen Grenzen, innen hohl
    if (c.zone !== 'neben' || c.d8 <= 2) continue;
    const wand = N8.some(([dx, dz]) => { const z = zoneBei(c.x + dx, c.z + dz); return z && z !== 'neben'; });
    for (let yr = 1; yr < 26; yr++) {
      if (hat(c.x, Y(yr), c.z)) continue;
      if (wand || yr === 24) set(c.x, Y(yr), c.z, T.putz, 'nebenraeume');
      else unzug('nebenraeume', 'Nebenräume der Tribuna (im Modell ohne Zugang)', c.x, Y(yr), c.z);
    }
  }

  // ---- Modul 4: Tribuna (Kapellenkranz, Triumphbogen, Tambour, Kuppel, Laterne)
  for (const c of D.haupt) {
    if (c.zone !== 'kranz') continue;
    const r = rTrib(c), kl = kranzLage(c);
    const top = r < TRIB.rd ? (kl.bogen ? TRIB.tambour + 1 : TRIB.decke) : dachBei(c.x, c.z);   // Tambour darüber in Modul 4b
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (kl.bogen) {                                                   // Triumphbogen zum Schiff
        if (Math.abs(c.w - AX) < 11 && yr <= rund(24, c.w - AX, 11)) continue;
        set(c.x, Y(yr), c.z, yr <= rund(24, c.w - AX, 11) + 1 ? T.serena : T.putz, 'triumphbogen');
        continue;
      }
      if (r >= TRIB.rk) {                                               // Außenwand der Kapellen mit Fenstern
        const fe = Math.abs(kl.mitte) < 1.2 && yr >= 9 && yr <= 16;
        set(c.x, Y(yr), c.z, fe ? glas(kl.k, yr) : (r >= TRIB.ra - 1 ? T.bruch : T.putz), 'kranz');
        continue;
      }
      if (kl.pfeiler) { set(c.x, Y(yr), c.z, yr <= 20 ? T.serena : T.putz, 'kranz'); continue; }
      if (r < TRIB.rd) { if (yr > rund(16, kl.mitte, 5.5)) set(c.x, Y(yr), c.z, yr <= rund(16, kl.mitte, 5.5) + 1 ? T.serena : T.putz, 'kranz'); continue; }
      if (yr === TRIB.decke) { set(c.x, Y(yr), c.z, T.putz, 'kranz'); continue; }
      if (yr > TRIB.decke) { unzug('daecher', 'Dachraum über Decken und Kapellen (ohne Zugang)', c.x, Y(yr), c.z); continue; }
      if (r >= TRIB.rk - 1.5 && Math.abs(kl.mitte) < 2 && yr <= 3) set(c.x, Y(yr), c.z, yr === 3 ? T.gold : T.weiss, 'altaere');
    }
  }
  for (const c of D.haupt) {
    const r = rTrib(c);
    if (r >= TRIB.rd || (c.zone !== 'tribuna' && c.zone !== 'kranz')) continue;
    if (r >= TRIB.ri && !kranzLage(c).bogen) for (let yr = 1; yr <= TRIB.tambour; yr++) {     // Tambour über den Kapellen
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z)) || yr < 21) continue;
      const fe = yr >= 36 && yr <= 42 && Math.abs((((phiTrib(c) + 22.5) % 45) + 45) % 45 - 22.5) < 3;
      set(c.x, Y(yr), c.z, fe ? T.fenster : (yr === TRIB.tambour ? T.serena : r >= TRIB.rd - 1 ? T.ziegelw : T.putz), 'tambour');
    }
    const ho = TRIB.tambour + Math.sqrt(Math.max(0, TRIB.rKa ** 2 - r * r)), hi = r < TRIB.ri ? TRIB.tambour + Math.sqrt(TRIB.ri ** 2 - r * r) : TRIB.tambour;
    for (let yr = Math.ceil(hi); yr <= Math.floor(ho); yr++) set(c.x, Y(yr), c.z, yr >= Math.floor(ho) ? T.ziegel : (yr < TRIB.tambour + 8 ? T.putz : fr((Math.round(phiTrib(c) / 30) + yr))), 'kuppel');
    if (r < 2.5) for (let yr = Math.floor(ho) + 1; yr <= 82; yr++) set(c.x, Y(yr), c.z, yr >= 81 ? T.bronze : T.weiss, 'laterne');
  }

  // ---- Modul 5: Decken und Dächer; Dachräume unzugänglich
  for (const c of D.haupt) {
    if (c.d8 <= 2 || (c.zone !== 'schiff')) continue;
    const top = dachBei(c.x, c.z);
    if (top == null) continue;
    for (let yr = S_DECKE; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z)) continue;
      if (yr === S_DECKE) set(c.x, Y(yr), c.z, (Math.round(c.u) % 6 === 0 || Math.round(c.w) % 6 === 0) ? T.gold : (Math.abs(c.u - 92) < 8 && Math.abs(c.w - AX) < 6 ? fr(5) : T.holz), 'decke');
      else unzug('daecher', 'Dachraum über Decken und Kapellen (ohne Zugang)', c.x, Y(yr), c.z);
    }
  }
  for (const c of D.haupt) {
    if (c.zone === 'portikus' || c.zone === 'chiostrino' || c.zone === 'seitenraum') continue;
    const top = dachBei(c.x, c.z);
    if (top == null) continue;
    let lo = top;
    for (const [dx, dz] of N8) {
      const nz = zoneBei(c.x + dx, c.z + dz), n = dachBei(c.x + dx, c.z + dz);
      if (n != null && n < lo) lo = n;
      else if (n == null && (nz === 'tribuna' || nz === 'kranz')) lo = Math.min(lo, (decke(c) || top) + 1);   // Giebelwand zur Kuppel
    }
    for (let yr = lo; yr <= top; yr++) if (!hat(c.x, Y(yr), c.z) && !luft.has(key(c.x, Y(yr), c.z))) set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.mauer, yr === top ? 'daecher' : 'schildwaende');
  }

  // ---- Modul 6: Hochaltar und Licht
  for (const c of D.haupt) {
    if (c.zone !== 'tribuna' || rTrib(c) > 2.2) continue;
    for (let yr = 1; yr <= 4; yr++) set(c.x, Y(yr), c.z, yr === 4 ? T.gold : T.weiss, 'hochaltar');
  }
  const steh = [];
  for (const c of D.alle) {
    const b = zellen.get(key(c.x, Y(0), c.z));
    if (b && b.p === 'boden' && !hat(c.x, Y(1), c.z) && !hat(c.x, Y(2), c.z) && !(c.zone === 'chiostrino' && imHof(c)) && c.zone !== 'neben') steh.push({ x: c.x, y: Y(1), z: c.z });
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

const OEFF_TEIL = {};
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

module.exports = { modul, lade, plan, zelleBei, zone, Y, BODEN_Y, T, TRIB, TEMPIETTO, KAP, W_SCHIFF, AX };
