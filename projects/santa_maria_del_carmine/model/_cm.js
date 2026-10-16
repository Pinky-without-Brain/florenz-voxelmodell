'use strict';
// Gemeinsame Geometrie und Bauplan von Santa Maria del Carmine (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/santa_maria_del_carmine/).
// Ein Bauplan für alle Module, erste Setzung gewinnt; Module sind Teillisten (modul(n, [...])).
//
// Rahmen CM: u von der Fassade (Norden, Piazza del Carmine) zum Chor (Süden), w quer (w > 0 Westen, rechts beim
// Eintreten: Cappella Brancacci; w < 0 Osten: Cappella Corsini). Lagen yr = Y − 60.
// Einschiffige Kirche über lateinischem Kreuz (Neubau nach dem Brand von 1771): Langhaus mit fünf flachen
// Kapellen je Seite, Querhaus, achteckige Vierung mit Kuppel, Chor mit ovaler Kuppel.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 60;
const Y = (yr) => BODEN_Y + yr;

// ------------------------------------------------------------------ Maße (Referenzmaße §1–§3)
const U_FASS = 3;                          // Fassade u < 3 (unverkleidetes Mauerwerk)
const U_QUER = 97.3;                       // Ende des Langhauses (OSM-Knick)
const W_SCHIFF = 15;                       // Innenkante: Schiff 30 Blöcke = 15 m breit (it.wikipedia „82 × 15“)
const KAPELLEN = 5;                        // fünf flache Kapellen je Seite
const JOCH = (U_QUER - U_FASS) / KAPELLEN;
const KAP_DECKE = 22;
const S_KAEMPFER = 34, S_SCHEITEL = 42;    // Tonne des Langhauses
const S_FIRST = 54, S_TRAUFE = 46;
const Q_DECKE = 40, Q_FIRST = 52, Q_TRAUFE = 46;
const OKT = { u: 135.8, w: -0.5, r: 17.6 };  // Achteck der Vierung (OSM-Teil w675876434)
const PFEILER_TOP = 40, TAMBUR_TOP = 53, R_KI = 15, R_KA = 17.5;   // Kuppel innen bis Lage 68 (≈ 35 m)
const U_CHOR = 153.6;
const CHOR = { u: 167, w: -1, au: 14, aw: 13, k: 36, h: 8, first: 50 };  // ovale Chorkuppel
const CORSINI = { u: 135.6, w: -54.3, ri: 8, ra: 9.5, k: 36, w0: -44.5 };
const BRANCACCI = { u: 137, w0: 31, hu: 9.5, decke: 26, dach: 32 };
// Campanile (V5b, Stufe C: in Quellen nicht beschrieben): im Kreuzgangshof westlich des Langhauses, Boden eine Lage tiefer (Hof)
const CAMP = { rect: { u0: 76, u1: 90, w0: 31, w1: 45 }, dy: -1, top: 72, glocke0: 48, glocke1: 60, spitze0: 61 };
const YT = (yr) => Y(yr + CAMP.dy);

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'), ziegelw: WZ.typ('ziegel_kuppel'),
  serena: WZ.typ('pietra_serena'), putz: WZ.typ('putz_weiss'), ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'),
  weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), gold: WZ.typ('gold'), ocker: WZ.typ('putz_ocker'),
  terrakotta: WZ.typ('putz_rosa'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), bronze: WZ.typ('bronze')
};
const FRESKO = ['blau', 'rot', 'gelb', 'gruen', 'braun', 'hellblau'].map((f) => WZ.fresko(f));
const GLAS = PAL.typesForRole('glas');
const glas = (a, b) => GLAS[Math.abs(a * 5 + b * 3) % GLAS.length];

// ------------------------------------------------------------------ Laden
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt, CA = masken.masken.campanile;
  const haupt = H.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z), wo: 'kirche' };
  });
  for (const c of haupt) c.zone = zone(c);
  const camp = CA.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, d8: CA.d8(x, z), gt: GRUND.groundTopY(x, z), wo: 'campanile', zone: 'campanile' };
  });
  const byKey = new Map();
  for (const c of haupt.concat(camp)) byKey.set(P.ck(c.x, c.z), c);
  L = { json, masken, R, H, CA, haupt, camp, alle: haupt, byKey };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

const okt = (c) => { const a = Math.abs(c.u - OKT.u), b = Math.abs(c.w - OKT.w); return Math.max(a, b, (a + b) / Math.SQRT2); };
const rOkt = (c) => Math.hypot(c.u - OKT.u, c.w - OKT.w);
const rCors = (c) => Math.hypot(c.u - CORSINI.u, c.w - CORSINI.w);
function zone(c) {
  if (c.u < U_FASS) return 'fassade';
  if (c.u < U_QUER) return Math.abs(c.w) < W_SCHIFF ? 'schiff' : 'kapelle';
  if (okt(c) < OKT.r) return 'vierung';
  if (c.w < CORSINI.w0) return 'corsini';
  if (c.w > BRANCACCI.w0 && Math.abs(c.u - BRANCACCI.u) < BRANCACCI.hu) return 'brancacci';
  if (c.u >= U_CHOR && Math.abs(c.w - CHOR.w) < CHOR.aw + 1) return 'chor';
  return 'quer';
}
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);
const kapMitte = (u) => U_FASS + (Math.floor((u - U_FASS) / JOCH) + 0.5) * JOCH;
const kapGrenze = (u) => { const k = Math.round((u - U_FASS) / JOCH); return k >= 1 && k < KAPELLEN && Math.abs(u - U_FASS - k * JOCH) < 1.5; };

function decke(c) {
  switch (c.zone) {
    case 'schiff': return S_KAEMPFER + Math.round((S_SCHEITEL - S_KAEMPFER) * Math.sqrt(Math.max(0, 1 - (c.w / W_SCHIFF) ** 2)));
    case 'kapelle': return KAP_DECKE;
    case 'quer': return Q_DECKE;
    case 'chor': { const e = 1 - ((c.u - CHOR.u) / CHOR.au) ** 2 - ((c.w - CHOR.w) / CHOR.aw) ** 2; return CHOR.k + Math.round(CHOR.h * Math.sqrt(Math.max(0, e))); }
    case 'brancacci': return BRANCACCI.decke;
    case 'corsini': return rCors(c) < CORSINI.ra ? null : CORSINI.k - 2;
    default: return null;
  }
}
function dach(c) {
  switch (c.zone) {
    case 'fassade': { const a = Math.abs(c.w); return 50 + Math.round(8 * Math.max(0, 1 - a / 21.5)); }
    case 'schiff': case 'kapelle': return Math.round(S_FIRST - (S_FIRST - S_TRAUFE) * Math.min(1, Math.abs(c.w) / 21.5));
    case 'quer': return Math.round(Q_FIRST - (Q_FIRST - Q_TRAUFE) * Math.min(1, Math.abs(c.u - OKT.u) / 33));
    case 'chor': return Math.round(CHOR.first - 4 * Math.min(1, Math.abs(c.w - CHOR.w) / 14));
    case 'brancacci': return BRANCACCI.dach;
    case 'corsini': return rCors(c) < CORSINI.ra ? null : CORSINI.k;
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

  // ---- Öffnungen: Hauptportal und zwei Seitentüren in der Fassade
  const PORTALE = [{ w: 0, a: 4, h: 10, art: 'tor' }, { w: -10, a: 2, h: 7, art: 'tuer' }, { w: 10, a: 2, h: 7, art: 'tuer' }];
  for (const c of D.haupt) {
    if (c.zone !== 'fassade') continue;
    for (const p of PORTALE) for (let yr = 1; yr <= rund(p.h, c.w - p.w, p.a); yr++) oeffnung(p.art, 'portale', c.x, Y(yr), c.z);
  }

  // ---- Modul 0: Fundament und Boden
  for (const c of D.alle) for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
  for (const c of D.alle) {
    let t = T.serena;
    if (c.zone === 'schiff' || c.zone === 'vierung') t = ((Math.floor(c.u / 4) + Math.floor((c.w + 40) / 4)) % 2) ? T.serena : T.weiss;
    else if (c.zone === 'chor' || c.zone === 'corsini') t = T.weiss;
    else if (c.zone === 'kapelle' || c.zone === 'brancacci') t = T.terrakotta;
    set(c.x, Y(0), c.z, t, 'boden');
  }

  // ---- Modul 1: Fassade (rohes Mauerwerk aus Bruchstein und Ziegel, unvollendet)
  for (const c of D.haupt) {
    if (c.zone !== 'fassade') continue;
    const top = dachBei(c.x, c.z);
    for (let yr = 1; yr <= top; yr++) {
      if (luft.has(key(c.x, Y(yr), c.z))) continue;
      const h = (Math.imul(c.x * 73856093 ^ yr * 19349663 ^ c.z * 83492791, 2654435761) >>> 28) & 3;
      const rahmen = PORTALE.some((p) => yr <= rund(p.h, c.w - p.w, p.a + 1) + 1 && Math.abs(c.w - p.w) < p.a + 1);
      const okulus = Math.hypot(c.w, yr - 36) <= 4;
      if (okulus) { set(c.x, Y(yr), c.z, Math.hypot(c.w, yr - 36) > 3.2 ? T.serena : glas(Math.round(c.w), yr), 'fassade'); continue; }
      set(c.x, Y(yr), c.z, rahmen ? T.serena : yr === top ? T.ziegelw : (h === 0 ? T.ziegelw : h === 1 ? T.mauer : T.bruch), 'fassade');
    }
  }

  // ---- Modul 2: Kapellen des Langhauses (Pfeiler, Bögen, Altäre) und Hochwand
  for (const c of D.haupt) {
    if (c.zone !== 'kapelle' || c.d8 <= 2) continue;
    const top = dachBei(c.x, c.z);
    const a = Math.abs(c.w);
    const um = kapMitte(c.u);
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (kapGrenze(c.u)) { set(c.x, Y(yr), c.z, yr <= KAP_DECKE ? T.serena : T.putz, yr <= KAP_DECKE ? 'kapellenpfeiler' : 'hochwand'); continue; }
      if (yr <= KAP_DECKE) {
        // Kapellenbogen zum Schiff (Rundbogen bis Lage 20), dahinter frei bis zur Kapellendecke; Altar an der Rückwand
        if (a < W_SCHIFF + 1) { if (yr > rund(14, c.u - um, JOCH / 2 - 1.5) && yr < KAP_DECKE) set(c.x, Y(yr), c.z, T.putz, 'kapellenpfeiler'); else if (yr === KAP_DECKE) set(c.x, Y(yr), c.z, T.serena, 'kapellenpfeiler'); continue; }
        if (yr === KAP_DECKE) { set(c.x, Y(yr), c.z, T.putz, 'kapellendecken'); continue; }
        if (c.d8 === 3 && Math.abs(c.u - um) < 3 && yr <= 3) set(c.x, Y(yr), c.z, yr === 3 ? T.gold : T.weiss, 'altaere');
        continue;
      }
      // Hochwand über den Kapellen mit einem Fenster je Joch
      const fe = Math.abs(c.u - um) < 2 && yr >= 25 && yr <= rund(31, c.u - um, 2.5);
      set(c.x, Y(yr), c.z, fe ? glas(Math.round(c.u), yr) : (a < W_SCHIFF + 1 && (yr === S_KAEMPFER - 1) ? T.serena : T.putz), fe ? 'fenster' : 'hochwand');
    }
  }

  // ---- Modul 3: Außenwände (d8 ≤ 2) mit Fenstern, Trennwände der Cappella Brancacci und Corsini
  for (const c of D.haupt) {
    if (c.zone === 'fassade' || c.zone === 'vierung' || c.d8 > 2) continue;
    let top = dachBei(c.x, c.z);
    if (top == null) top = CORSINI.k;                 // Corsini: Wand trägt die Kuppel
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      let fe = false;
      if (c.zone === 'kapelle') { const um = kapMitte(c.u); fe = Math.abs(c.u - um) < 2 && yr >= 25 && yr <= rund(31, c.u - um, 2.5); }
      else if (c.zone === 'quer') fe = yr >= 26 && yr <= 36 && ((Math.round(c.u) % 14 === 0) || (Math.round(c.w) % 14 === 0)) && c.d8 >= 1;
      else if (c.zone === 'chor') fe = yr >= 20 && yr <= 30 && Math.abs(c.w - CHOR.w) < 2;
      else if (c.zone === 'brancacci') fe = yr >= 14 && yr <= 20 && Math.abs(c.u - BRANCACCI.u) < 1.5;
      if (fe) { set(c.x, Y(yr), c.z, glas(Math.round(c.u + c.w), yr), 'fenster'); continue; }
      set(c.x, Y(yr), c.z, c.d8 === 1 ? (yr <= 2 ? T.serena : (yr % 9 === 0 ? T.ziegelw : T.bruch)) : T.putz, 'aussenwaende');
    }
  }
  for (const c of D.haupt) {
    if (c.d8 <= 2) continue;
    // Cappella Brancacci: Stirnwand zum Querarm mit Bogen (Rundbogen bis Lage 18), Seitenwände geschlossen
    if (c.zone === 'brancacci') {
      const rand = c.w < BRANCACCI.w0 + 1.5 || Math.abs(c.u - BRANCACCI.u) > BRANCACCI.hu - 1.5;
      if (!rand) continue;
      const top = Math.max(dach({ zone: 'quer', u: c.u, w: c.w }), BRANCACCI.dach);
      const bogen = c.w < BRANCACCI.w0 + 1.5 && Math.abs(c.u - BRANCACCI.u) < BRANCACCI.hu - 1.5 ? rund(14, c.u - BRANCACCI.u, BRANCACCI.hu - 2) : -1;
      for (let yr = 1; yr < top; yr++) {
        if (yr <= bogen || hat(c.x, Y(yr), c.z)) continue;
        set(c.x, Y(yr), c.z, yr <= bogen + 1 ? T.serena : T.putz, 'brancacci');
      }
    }
    // Cappella Corsini: Bogenwand zum östlichen Querarm (Rundbogen bis Lage 24)
    if (c.zone === 'corsini' && c.w > CORSINI.w0 - 1.5) {
      const top = dach({ zone: 'quer', u: c.u, w: c.w });
      const bogen = rund(16, c.u - CORSINI.u, CORSINI.ri);
      for (let yr = 1; yr < top; yr++) if (yr > bogen && !hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, yr <= bogen + 1 ? T.serena : T.putz, 'corsini');
    }
  }
  // Fresken der Cappella Brancacci auf den Innenseiten der Wände (Masaccio, Masolino, Filippino Lippi)
  for (const c of D.haupt) {
    if (c.zone !== 'brancacci' || c.d8 <= 2) continue;
    for (const [dx, dz] of N4) {
      const n = zelleBei(c.x + dx, c.z + dz);
      if (!n) continue;
      for (let yr = 4; yr < BRANCACCI.decke; yr++) {
        const k = key(n.x, Y(yr), n.z), e = zellen.get(k);
        if (!e || e.t !== T.putz || hat(c.x, Y(yr), c.z)) continue;
        e.t = yr % 7 === 0 ? T.ocker : FRESKO[(Math.floor((n.u + n.w) / 3) + Math.floor(yr / 7)) % FRESKO.length];
      }
    }
  }

  // ---- Modul 4: Vierung (Pfeiler, Bögen, Tambour, Kuppel, Laterne) und Cappella Corsini (Kuppel)
  for (const c of D.haupt) {
    if (c.zone !== 'vierung') continue;
    const o = okt(c), r = rOkt(c);
    if (o >= OKT.r - 2.5) {
      const du = c.u - OKT.u, dw = c.w - OKT.w;
      const diagonal = Math.abs(Math.abs(du) - Math.abs(dw)) < 7;
      if (diagonal) for (let yr = 1; yr <= PFEILER_TOP; yr++) set(c.x, Y(yr), c.z, yr === PFEILER_TOP ? T.ornament : T.serena, 'vierungspfeiler');
      else {
        const t = Math.abs(du) > Math.abs(dw) ? dw : du;
        const lai = rund(28, t, 7.5);
        for (let yr = Math.max(lai + 1, 1); yr <= PFEILER_TOP; yr++) set(c.x, Y(yr), c.z, yr <= lai + 1 ? T.serena : T.putz, 'vierungsboegen');
      }
      for (let yr = PFEILER_TOP + 1; yr <= TAMBUR_TOP; yr++) {
        const phi = Math.atan2(dw, du) * 180 / Math.PI;
        const fe = yr >= 45 && yr <= 50 && Math.abs((((phi % 45) + 45) % 45) - 22.5) > 16;
        set(c.x, Y(yr), c.z, fe ? T.fenster : (yr === TAMBUR_TOP ? T.serena : o >= OKT.r - 1 ? T.ziegelw : T.putz), 'tambour');
      }
      if (r >= R_KA) set(c.x, Y(TAMBUR_TOP + 1), c.z, T.ziegel, 'tambour');
    }
    if (r < R_KA) {
      const ho = TAMBUR_TOP + Math.sqrt(R_KA * R_KA - r * r), hi = r < R_KI ? TAMBUR_TOP + Math.sqrt(R_KI * R_KI - r * r) : TAMBUR_TOP;
      for (let yr = Math.ceil(hi); yr <= Math.floor(ho); yr++) set(c.x, Y(yr), c.z, yr >= Math.floor(ho) ? T.ziegel : (yr < TAMBUR_TOP + 6 ? T.putz : FRESKO[5]), 'kuppel');
      if (r < 2.5) for (let yr = Math.floor(ho) + 1; yr <= 78; yr++) set(c.x, Y(yr), c.z, yr >= 77 ? T.bronze : T.weiss, 'laterne');
    }
  }
  for (const c of D.haupt) {
    if (c.zone !== 'corsini') continue;
    const r = rCors(c);
    if (r >= CORSINI.ra) continue;
    const ho = CORSINI.k + Math.sqrt(CORSINI.ra ** 2 - r * r), hi = r < CORSINI.ri ? CORSINI.k + Math.sqrt(CORSINI.ri ** 2 - r * r) : CORSINI.k - 1;
    for (let yr = Math.ceil(hi); yr <= Math.floor(ho); yr++) set(c.x, Y(yr), c.z, yr >= Math.floor(ho) ? T.ziegel : FRESKO[(Math.round(r) + yr) % 3], 'corsini_kuppel');
    if (r < 1.5) for (let yr = Math.floor(ho) + 1; yr <= Math.floor(CORSINI.k + CORSINI.ra) + 5; yr++) set(c.x, Y(yr), c.z, T.weiss, 'corsini_kuppel');
  }

  // ---- Modul 5: Decken, Tonne, Chorkuppel, Dächer; Dachräume unzugänglich
  for (const c of D.haupt) {
    if (c.zone === 'fassade' || c.zone === 'vierung' || c.d8 <= 2) continue;
    const dk = decke(c), top = dachBei(c.x, c.z);
    if (dk == null || top == null) continue;
    let lo = dk;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); if (n && n.zone !== 'fassade' && n.zone !== 'vierung' && n.d8 > 2) { const nd = decke(n); if (nd != null && nd < lo) lo = nd; } }
    const p = c.zone === 'schiff' ? 'tonne' : c.zone === 'chor' ? 'chorkuppel' : 'decken';
    const t = c.zone === 'schiff' ? (Math.abs(c.w) > W_SCHIFF - 2 ? T.serena : FRESKO[(Math.floor(c.u / 8) + Math.floor((c.w + 15) / 10)) % FRESKO.length])
      : c.zone === 'quer' ? (Math.round(c.u) % 5 === 0 || Math.round(c.w) % 5 === 0 ? T.gold : T.holz) : T.putz;
    for (let yr = lo; yr <= dk; yr++) if (!hat(c.x, Y(yr), c.z) && !luft.has(key(c.x, Y(yr), c.z))) set(c.x, Y(yr), c.z, yr === dk ? t : T.putz, p);
    for (let yr = dk + 1; yr < top; yr++) if (!hat(c.x, Y(yr), c.z)) unzug('daecher', 'Dachraum über Decken und Gewölben (ohne Zugang)', c.x, Y(yr), c.z);
  }
  for (const c of D.haupt) {
    if (c.zone === 'fassade') continue;
    const top = dachBei(c.x, c.z);
    if (top == null) continue;
    let lo = top;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < lo) lo = n; }
    for (let yr = lo; yr <= top; yr++) if (!hat(c.x, Y(yr), c.z) && !luft.has(key(c.x, Y(yr), c.z))) set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.mauer, yr === top ? 'daecher' : 'schildwaende');
  }

  // ---- Modul 7: Campanile (Stufe C): eigener Boden eine Lage tiefer, Schaft mit Wendeltreppe, Glockenstube, Pyramidenhelm
  for (const c of D.camp) {
    for (let y = c.gt + 1; y <= YT(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
    set(c.x, YT(0), c.z, T.serena, 'boden');
  }
  const cw = (CAMP.rect.w0 + CAMP.rect.w1) / 2;
  const camp = WZ.campanile.baueCampanile({
    cells: D.camp, set, frei, istFrei: (x, y, z) => luft.has(key(x, y, z)), hat, oeffnung, unzug, Y: YT, zellen, teile, key,
    T: { wand: T.mauer, sockel: T.bruch, gesims: T.serena, dach: T.ziegel, spitze: T.bronze, holz: T.holz, glocke: T.bronze, fenster: T.fenster, licht: T.licht }
  }, {
    rect: CAMP.rect, top: CAMP.top, glocke0: CAMP.glocke0, glocke1: CAMP.glocke1, spitze0: CAMP.spitze0, abschluss: 'pyramide', sockel: 5,
    gesimse: [16, 32, CAMP.glocke0 - 1], schlitze: { periode: 16, a: 6, b: 9, bis: CAMP.glocke0 }, bogen: { anzahl: 2, breite: 3 }, lichtAbstand: 8,
    tueren: [D.camp.filter((c) => c.d8 <= 2 && c.u < CAMP.rect.u0 + 2 && Math.abs(c.w - cw) < 1.5)]
  });

  // ---- Modul 6: Hochaltar und Licht
  for (const c of D.haupt) {
    if (c.zone !== 'chor' || Math.abs(c.u - 166) > 1.5 || Math.abs(c.w - CHOR.w) > 2.5) continue;
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

  PLAN = { zellen, teile, oeff, unz, camp };
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

module.exports = { modul, lade, plan, zelleBei, zone, Y, YT, BODEN_Y, T, OKT, R_KI, TAMBUR_TOP, KAPELLEN, W_SCHIFF, CAMP };
