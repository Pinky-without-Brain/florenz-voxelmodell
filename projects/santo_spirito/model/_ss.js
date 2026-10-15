'use strict';
// Gemeinsame Geometrie und Bauplan von Santo Spirito (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/santo_spirito/).
// Brunelleschis Raster: Modul M = 11 Braccia = 6,42 m = 12,84 Blöcke. Ein lateinisches Kreuz aus Hauptschiffen
// (2 M breit: Langhaus, Querarme, Chor), rundum ein Umgang von 1 M (Seitenschiffe laufen um Querhaus und Chor herum)
// und dahinter die halbrunden Kapellennischen in der Außenwand (38 Altäre + 2 Apsidiolen = 40).
// Rahmen SS: u von der Fassade (Süden, Piazza Santo Spirito) zum Chor, w quer (w < 0 Westen, zur Sakristei);
// wc = w − W0 ist der Abstand zur Achse des Langhauses. Lagen yr = Y − 64. Erste Setzung gewinnt.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 64;
const Y = (yr) => BODEN_Y + yr;

const M = 12.84;                          // Modul (11 Braccia)
const W0 = -4.4;                          // Achse (Mitte der Vierungskuppel, OSM w673221316)
const VU = 136;                           // Vierungsmitte u
const U_FASS = 3;
const QA = { w0: -51.4, w1: 42.3 };       // Querarme (Hauptschiff 2 M breit, |u − VU| < M)
const CHOR_END = VU + 3 * M;              // Chorarm bis u ≈ 174,5
const SAEULE_H = 16, KAEMPFER = 19, DECKE = 44, TRAUFE = 48, FIRST = 56;
const U_DACH_I = 36, U_DACH_A = 31;       // Pultdach des Umgangs
const TAMBUR0 = 50, KUPPEL0 = 60, R_KI = 12.5, R_KA = 14.5;
const SAK = { u: 76.2, w: -61.9, ri: 11.5, wand: 26 };      // Achteck der Sakristei (OSM-Teil w673223525)
const TURM = { top: 140, glocke0: 112, glocke1: 124 };

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'),
  serena: WZ.typ('pietra_serena'), putz: WZ.typ('putz_weiss'), gelb: WZ.typ('putz_gelb'), ziegel: WZ.typ('dachziegel'),
  holz: WZ.typ('holz'), gold: WZ.typ('gold'), weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'),
  terrakotta: WZ.typ('putz_rosa'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), bronze: WZ.typ('bronze'), kuppel: WZ.typ('ziegel_kuppel')
};
const GLAS = PAL.typesForRole('glas');

// ------------------------------------------------------------------ Laden
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt, CA = masken.masken.campanile;
  // Der OSM-Umriss der Sakristei (r7101376) hat ein kleines Loch (Lichtschacht, 8 × 3 Blöcke) im Vorraum: als Innenraum geschlossen,
  const SA0 = masken.masken.sakristei, bb = SA0.bbox, voll = [];
  for (let x = bb.x0; x <= bb.x1; x++) for (let z = bb.z0; z <= bb.z1; z++) if (SA0.innen(x, z) && !CA.has(x, z)) voll.push([x, z]);   // ohne den Campanile-Grundriss (überlappt im OSM)
  const SA = WZ.Maske.vonZellen(voll);
  const mk = (x, z, m, wo) => { const l = R.toLocal(x, z); return { x, z, u: l.u, w: l.w, wc: l.w - W0, d8: m.d8(x, z), gt: GRUND.groundTopY(x, z), wo }; };
  const haupt = H.cells.map(([x, z]) => mk(x, z, H, 'kirche'));
  const sak = SA.cells.map(([x, z]) => mk(x, z, SA, 'sakristei'));
  const camp = CA.cells.map(([x, z]) => mk(x, z, CA, 'campanile'));
  for (const c of haupt) c.zone = zone(c);
  for (const c of sak) c.zone = 'sakristei';
  for (const c of camp) c.zone = 'campanile';
  const byKey = new Map();
  for (const c of haupt.concat(sak, camp)) byKey.set(P.ck(c.x, c.z), c);
  L = { json, masken, R, H, SA, CA, haupt, sak, camp, alle: haupt.concat(sak, camp), byKey };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

// Hauptschiffe (Kreuz), Umgang (1 M um das Kreuz), sonst Außenzone (Nischen und Wände)
const imKreuz = (c) => (Math.abs(c.wc) < M && c.u >= U_FASS && c.u < CHOR_END) || (Math.abs(c.u - VU) < M && c.w >= QA.w0 && c.w < QA.w1);
const kreuzAbstand = (c) => {           // Chebyshev-Abstand zum Kreuz im lokalen Raster (0 im Kreuz)
  const dN = Math.max(0, Math.abs(c.wc) - M), dNu = Math.max(0, U_FASS - c.u, c.u - CHOR_END);
  const dQ = Math.max(0, Math.abs(c.u - VU) - M), dQw = Math.max(0, QA.w0 - c.w, c.w - QA.w1);
  return Math.min(Math.max(dN, dNu), Math.max(dQ, dQw));
};
function zone(c) {
  if (c.u < U_FASS) return 'fassade';
  if (imKreuz(c)) return Math.abs(c.u - VU) < M && Math.abs(c.wc) < M ? 'vierung' : 'schiff';
  if (kreuzAbstand(c) < M) return 'umgang';
  return 'aussen';
}
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);
// Rasterpunkte (Säulen) auf den Kreuzrändern
const gitter = (v, v0) => Math.abs(((v - v0) / M) - Math.round((v - v0) / M)) * M;
function saeule(c) {
  if (c.zone !== 'schiff' && c.zone !== 'umgang') return false;
  const naheLinie = (d) => Math.abs(d - M) < 1.01;
  // Langhaus und Chor: Linien |wc| = M, Säulen alle M in u (ab der Vierungsmitte gezählt)
  if (naheLinie(Math.abs(c.wc)) && gitter(c.u, VU) < 1.01 && Math.abs(c.u - VU) > M + 1 && c.u > U_FASS + 2 && c.u < CHOR_END + 1) return true;
  // Querarme: Linien |u − VU| = M, Säulen alle M in w
  if (naheLinie(Math.abs(c.u - VU)) && gitter(c.wc, 0) < 1.01 && Math.abs(c.wc) > M + 1 && c.w > QA.w0 - 1 && c.w < QA.w1 + 1) return true;
  return false;
}
const vierungsPfeiler = (c) => Math.abs(Math.abs(c.wc) - M) < 2 && Math.abs(Math.abs(c.u - VU) - M) < 2;
/** Arkadenbogen zwischen zwei Säulen: Laibung über der Zelle (Säulenlinie) oder -1. */
function arkade(c) {
  let x;
  if (Math.abs(Math.abs(c.wc) - M) < 1.01 && Math.abs(c.u - VU) > M) x = ((c.u - VU) / M - Math.round((c.u - VU) / M + 0.5) + 0.5) * M;
  else if (Math.abs(Math.abs(c.u - VU) - M) < 1.01 && Math.abs(c.wc) > M) x = (c.wc / M - Math.round(c.wc / M + 0.5) + 0.5) * M;
  else return -1;
  return rund(KAEMPFER, x, M / 2 - 1);
}
// Dach je Spalte (Lage der Dachhaut)
function dach(c) {
  switch (c.zone) {
    case 'schiff': case 'vierung': {
      const q = Math.abs(c.u - VU) < M && !(Math.abs(c.wc) < M) ? Math.abs(c.u - VU) : Math.abs(c.wc); // Querarm: First quer
      return Math.round(FIRST - (FIRST - TRAUFE) * Math.min(1, q / (M + 1)));
    }
    case 'umgang': case 'aussen': return Math.round(U_DACH_I - (U_DACH_I - U_DACH_A) * Math.min(1, kreuzAbstand(c) / (M + 5)));
    default: return null;
  }
}
// Decke je Spalte: Kassettendecke in den Hauptschiffen, Hängekuppeln im Umgang, Nischen niedrig
function decke(c) {
  if (c.zone === 'schiff') return DECKE;
  if (c.zone === 'umgang') {
    const bu = Math.round((c.u - VU) / M - 0.5) + 0.5, bw = Math.round(c.wc / M - 0.5) + 0.5;
    const du = (c.u - VU) / M - bu, dw = c.wc / M - bw;
    return KAEMPFER + Math.max(0, Math.round(6 * (1 - 2 * (du * du + dw * dw))));
  }
  if (c.zone === 'aussen') return 15;
  return null;
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
    zellen.set(k, { x, y, z, t, p }); let a = teile.get(p); if (!a) teile.set(p, a = []); a.push(k); return true;
  };
  const hat = (x, y, z) => zellen.has(key(x, y, z));
  const frei = (x, y, z) => luft.add(key(x, y, z));
  const oeff = new Map();
  const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); frei(x, y, z); };
  const unz = new Map();
  const unzug = (p, b, x, y, z) => { const k = p + '|' + b; if (!unz.has(k)) unz.set(k, []); unz.get(k).push({ x, y, z }); };
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]], N8 = N4.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]);

  const fassTop = (c) => { const a = Math.abs(c.wc); return a < M ? 54 + Math.round(6 * Math.sqrt(Math.max(0, 1 - (a / M) ** 2))) : 36 + Math.round(18 * Math.sqrt(Math.max(0, 1 - ((a - M) / 17) ** 2))); };
  const D_ = new Map();
  for (const c of D.haupt) {
    let d = c.zone === 'fassade' ? fassTop(c) : dach(c);
    if (c.zone === 'vierung' && Math.hypot(c.u - VU, c.wc) < R_KA) d = null;   // offen zur Kuppel
    if (c.zone === 'vierung' && d !== null) d = TAMBUR0 - 1;
    D_.set(P.ck(c.x, c.z), d);
  }
  const dachBei = (x, z) => D_.get(P.ck(x, z));

  // ---- Öffnungen: Portale, Sakristeitür, Turmtür
  const PORTALE = [{ w0: -4, w1: 4, h: 12, art: 'tor' }, { w0: -21, w1: -17, h: 9, art: 'tuer' }, { w0: 17, w1: 21, h: 9, art: 'tuer' }];
  for (const c of D.haupt) {
    if (c.zone === 'fassade') for (const p of PORTALE) {
      if (c.wc < p.w0 || c.wc >= p.w1) continue;
      const top = rund(p.h, c.wc - (p.w0 + p.w1) / 2, (p.w1 - p.w0) / 2);
      for (let yr = 1; yr <= top; yr++) oeffnung(p.art, 'portale', c.x, Y(yr), c.z);
    }
    // Tür vom westlichen Umgang in den Sakristei-Vorraum (Westwand bei u 60..64)
    if ((c.zone === 'aussen' || c.d8 <= 3) && c.w < -26 && c.u >= 58 && c.u < 62) for (let yr = 1; yr <= 6; yr++) oeffnung('tuer', 'sakristei', c.x, Y(yr), c.z);
  }
  for (const c of D.sak) {
    if (c.d8 <= 2 && c.w > -36 && c.u >= 58 && c.u < 62) for (let yr = 1; yr <= 6; yr++) oeffnung('tuer', 'sakristei', c.x, Y(yr), c.z);
    if (c.d8 <= 2 && c.w < -71 && c.u >= 94 && c.u < 98) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'campanile_schaft', c.x, Y(yr), c.z);
  }
  for (const c of D.sak) {                               // Tür Vorraum -> Achteck (Seite zur Kirche)
    const aa = Math.abs(c.u - SAK.u), bb = Math.abs(c.w - SAK.w), okt = Math.max(aa, bb, (aa + bb) / Math.SQRT2);
    if (okt >= SAK.ri - 0.5 && okt < SAK.ri + 3 && c.w > SAK.w && aa < 2) for (let yr = 1; yr <= 6; yr++) oeffnung('tuer', 'sakristei', c.x, Y(yr), c.z);
  }
  for (const c of D.camp) if (c.d8 <= 2 && c.w > -76.5 && c.u >= 94 && c.u < 98) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'campanile_schaft', c.x, Y(yr), c.z);

  // ---- Campanile-Treppe zuerst (Treppenloch vor dem Glockenstubenboden)
  let treppe = null;
  {
    const innen = D.camp.filter((c) => c.d8 >= 3);
    const ok = new Set(innen.map((c) => P.ck(c.x, c.z)));
    const mx = innen.reduce((a, c) => a + c.x, 0) / innen.length, mz = innen.reduce((a, c) => a + c.z, 0) / innen.length;
    let best = null, bd = Infinity;
    for (const c of innen) {
      let pass = true;
      for (let dx = -2; dx <= 2 && pass; dx++) for (let dz = -2; dz <= 2; dz++) if (!ok.has(P.ck(c.x + dx, c.z + dz))) { pass = false; break; }
      const d = Math.hypot(c.x - mx, c.z - mz);
      if (pass && d < bd) { bd = d; best = c; }
    }
    if (!best) throw new Error('Santo Spirito: kein Platz für die Turmtreppe');
    treppe = WZ.treppe.wendeltreppe({ mitte: { x: best.x, z: best.z }, radiusInnen: 0, radiusAussen: 2, yVon: Y(0), yBis: Y(TURM.glocke0), rolle: 'pietra_serena', drehsinn: 'rechts' });
    for (const l of WZ.treppe.treppenloch(treppe.lauf, 3)) frei(l.x, l.y, l.z);
    for (const b of treppe) if (b.y >= Y(TURM.glocke0) - 3 && b.y < Y(TURM.glocke0)) for (let h = 1; h <= 3; h++) frei(b.x, b.y + h, b.z);
    for (const b of treppe) if (b.y > Y(0)) set(b.x, b.y, b.z, b.typ, 'campanile_treppe', true);
  }

  // ---- Modul 0: Fundament, Boden
  for (const c of D.alle) for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
  for (const c of D.alle) {
    let t = T.serena;
    if (c.zone === 'schiff' || c.zone === 'vierung') t = ((Math.floor((c.u - VU) / (M / 2)) + Math.floor(c.wc / (M / 2))) & 1) ? T.serena : T.weiss;
    else if (c.zone === 'aussen' || c.zone === 'sakristei') t = T.terrakotta;
    set(c.x, Y(0), c.z, t, 'boden');
  }

  // ---- Modul 1: Fassade (schlichter Putz, geschwungener Umriss, drei Portale, Rundfenster)
  for (const c of D.haupt) {
    if (c.zone !== 'fassade') continue;
    const top = fassTop(c);
    for (let yr = 1; yr <= top; yr++) {
      if (luft.has(key(c.x, Y(yr), c.z))) continue;
      const ok = Math.hypot(c.wc, yr - 40) <= 4.2;
      const rahmen = PORTALE.some((p) => c.wc >= p.w0 - 1 && c.wc < p.w1 + 1 && yr <= rund(p.h, c.wc - (p.w0 + p.w1) / 2, (p.w1 - p.w0) / 2 + 1));
      const kante = yr === top || yr === 33;
      set(c.x, Y(yr), c.z, ok ? GLAS[(yr + Math.round(c.wc)) % GLAS.length] : rahmen || kante ? T.serena : c.u < 1 ? T.gelb : T.mauer, ok ? 'fassade_okulus' : 'fassade');
    }
  }

  // ---- Modul 2: Säulen, Arkaden, Hochwände (Kreuzränder)
  for (const c of D.haupt) {
    if (vierungsPfeiler(c) && (c.zone === 'schiff' || c.zone === 'umgang' || c.zone === 'vierung')) { for (let yr = 1; yr <= 40; yr++) set(c.x, Y(yr), c.z, T.serena, 'vierungspfeiler'); continue; }
    if (saeule(c)) for (let yr = 1; yr <= KAEMPFER - 1; yr++) set(c.x, Y(yr), c.z, yr === SAEULE_H + 1 ? T.ornament : T.serena, 'saeulen');
  }
  for (const c of D.haupt) {
    if (c.zone !== 'schiff' && c.zone !== 'umgang') continue;
    const naheN = Math.abs(Math.abs(c.wc) - M) < 1.01 && Math.abs(c.u - VU) > M - 1;
    const naheQ = Math.abs(Math.abs(c.u - VU) - M) < 1.01 && Math.abs(c.wc) > M - 1;
    if (!naheN && !naheQ) continue;
    const top = Math.max(dachBei(c.x, c.z) || 0, TRAUFE);
    const lai = arkade(c);
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (lai >= 0 && yr <= lai) continue;
      // Rundfenster im Obergaden je Joch
      const x = naheN ? c.u - VU : c.wc;
      const mitte = Math.abs(((x / M) - Math.round(x / M + 0.5) + 0.5)) * M;
      if (Math.hypot(mitte, yr - 40) <= 1.8) { set(c.x, Y(yr), c.z, T.fenster, 'obergaden_fenster'); continue; }
      set(c.x, Y(yr), c.z, lai >= 0 && yr <= lai + 1 ? T.serena : (yr === DECKE ? T.serena : (yr > U_DACH_I ? T.mauer : T.putz)), yr <= KAEMPFER + 8 ? 'arkaden' : 'obergaden');
    }
  }

  // ---- Modul 3: Außenwände mit Kapellennischen
  for (const c of D.haupt) {
    if (c.zone === 'fassade') continue;
    const top = dachBei(c.x, c.z);
    if (top == null) continue;
    if (c.u < U_FASS + 3 && Math.abs(c.w) < 27 && c.zone !== 'aussen') continue;   // direkt hinter der Fassade: sie ist die Wand
    if (c.zone === 'aussen' || c.d8 <= 3) {
      // Nischen: Halbkreis (Radius 4,5) in der Außenzone vor jeder Umgangsjochmitte
      const a = kreuzAbstand(c) - M;                         // Tiefe hinter dem Umgang
      const bu = (Math.round((c.u - VU) / M - 0.5) + 0.5) * M + VU, bw = (Math.round(c.wc / M - 0.5) + 0.5) * M;
      const quer = Math.abs(c.u - VU) < 2 * M && c.wc !== 0 && (Math.abs(c.wc) > 2 * M);
      const t = quer ? Math.abs(c.u - bu) : Math.abs(c.wc) > 2 * M - 1 && Math.abs(c.u - VU) > 2 * M ? Math.abs(c.u - bu) : Math.abs(c.wc - bw);
      const nische = c.d8 > 1 && a >= 0 && Math.hypot(t, a) < 4.6;
      for (let yr = 1; yr < top; yr++) {
        if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
        if (nische && yr <= rund(9, 0, 4.6) - Math.round(t * 0.4)) continue;           // Kapellennische, Rundbogen
        const fe = c.d8 <= 3 && c.d8 >= 1 && Math.abs(t) < 1 && yr >= 22 && yr <= 28;   // Rundbogenfenster über den Nischen
        if (fe) { set(c.x, Y(yr), c.z, GLAS[(Math.round(c.u) + yr) % GLAS.length], 'fenster'); continue; }
        set(c.x, Y(yr), c.z, c.d8 === 1 ? (yr <= 2 ? T.serena : T.bruch) : c.d8 === 2 ? T.mauer : T.putz, 'aussenwaende');
      }
    }
  }

  // ---- Modul 4: Vierung (Pendentifs, Tambour, Kuppel, Laterne)
  for (const c of D.haupt) {
    const r = Math.hypot(c.u - VU, c.wc);
    if (r >= R_KA + 1 && c.zone !== 'vierung') continue;
    if (c.zone === 'vierung') {
      const amRand = Math.abs(c.u - VU) >= M - 2 || Math.abs(c.wc) >= M - 2;
      if (amRand && !vierungsPfeiler(c)) {
        const x = Math.abs(c.u - VU) >= M - 2 ? c.wc : c.u - VU;
        const lai = rund(30, x, M - 2);
        for (let yr = Math.max(lai + 1, 1); yr <= DECKE - 1; yr++) set(c.x, Y(yr), c.z, yr <= lai + 1 ? T.serena : T.putz, 'vierungsboegen');
      }
      for (let yr = 41; yr < TAMBUR0; yr++) if (r >= R_KI) set(c.x, Y(yr), c.z, T.putz, 'pendentifs');
    }
    if (r >= R_KI && r < R_KA) for (let yr = TAMBUR0; yr < KUPPEL0; yr++) {
      const phi = Math.atan2(c.wc, c.u - VU) * 180 / Math.PI;
      const fe = yr >= 53 && yr <= 56 && Math.abs((((phi % 45) + 45) % 45) - 22.5) < 6;
      set(c.x, Y(yr), c.z, fe ? T.fenster : T.serena, 'tambour');
    }
    if (r < R_KA) {
      const ho = KUPPEL0 + Math.sqrt(R_KA * R_KA - r * r), hi = r < R_KI ? KUPPEL0 + Math.sqrt(R_KI * R_KI - r * r) : KUPPEL0 - 1;
      for (let yr = Math.ceil(hi); yr <= Math.floor(ho); yr++) set(c.x, Y(yr), c.z, yr >= Math.floor(ho) ? T.ziegel : T.putz, 'kuppel');
      if (r < 2.5) for (let yr = Math.floor(ho) + 1; yr <= 82; yr++) set(c.x, Y(yr), c.z, yr >= 81 ? T.gold : T.weiss, 'laterne');
    }
  }

  // ---- Modul 5: Decken, Gewölbe, Dächer
  for (const c of D.haupt) {
    if (c.d8 <= 3 || c.zone === 'fassade') continue;
    const dk = decke(c), top = dachBei(c.x, c.z);
    if (dk == null || top == null) continue;
    const aussenRand = N4.some(([dx, dz]) => { const n = dachBei(c.x + dx, c.z + dz); return n != null && n < dk; });
    let lo = dk;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); if (n && n.wo === 'kirche' && n.d8 > 3 && n.zone !== 'fassade') { const nd = decke(n); if (nd != null && nd < lo) lo = nd; } }
    const kass = dk === DECKE;
    const t = kass ? (aussenRand ? T.mauer : ((Math.round(c.u) % 4 === 0 && Math.round(c.wc) % 4 === 0) ? T.gold : T.holz)) : T.putz;
    for (let yr = lo; yr <= dk; yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, t, kass ? 'kassettendecke' : 'gewoelbe');
    for (let yr = dk + 1; yr < top; yr++) unzug('daecher', 'Dachraum über Decke und Gewölben (ohne Zugang)', c.x, Y(yr), c.z);
  }
  for (const c of D.haupt) {
    if (c.zone === 'fassade') continue;
    const top = dachBei(c.x, c.z);
    if (top == null) continue;
    let lo = top;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < lo) lo = n; }
    for (let yr = lo; yr <= top; yr++) if (!hat(c.x, Y(yr), c.z) && !luft.has(key(c.x, Y(yr), c.z))) set(c.x, Y(yr), c.z, yr === top ? (c.zone === 'vierung' ? T.serena : T.ziegel) : T.mauer, yr === top ? 'daecher' : 'schildwaende');
  }

  // ---- Modul 6: Sakristei (Achteck mit Kuppel) und Vorraum
  for (const c of D.sak) {
    const r = Math.hypot(c.u - SAK.u, c.w - SAK.w);
    const okt = (() => { const a = Math.abs(c.u - SAK.u), b = Math.abs(c.w - SAK.w); return Math.max(a, b, (a + b) / Math.SQRT2); })();
    const imOkt = okt < SAK.ri + 2.5;
    const tasche = !imOkt && c.w < SAK.w - SAK.ri && Math.abs(c.u - SAK.u) < SAK.ri + 2.5;   // Zwickel hinter dem Achteck: Mauerwerk
    const wand = c.d8 <= 2 || tasche || (imOkt && okt >= SAK.ri);
    const top = imOkt ? SAK.wand + 2 : 22;
    for (let yr = 1; yr <= top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (wand) { set(c.x, Y(yr), c.z, yr === top ? T.ziegel : (c.d8 === 1 ? T.bruch : (yr % 7 === 0 ? T.serena : T.putz)), 'sakristei'); continue; }
      if (!imOkt && yr >= 20) set(c.x, Y(yr), c.z, yr === top ? T.ziegel : ((Math.round(c.u) + Math.round(c.w)) % 3 === 0 ? T.serena : T.weiss), 'sakristei');  // Kassettendecke des Vorraums
      else if (!imOkt && yr < 20 && yr > 0) { /* Vorraum frei */ }
    }
    if (!imOkt) for (let yr = 22; yr <= 21; yr++);
    if (imOkt && r < SAK.ri + 2) {
      const b = SAK.wand, R_A = SAK.ri + 2;
      const ho = b + Math.sqrt(Math.max(0, R_A * R_A - r * r)), hi = r < SAK.ri ? b + Math.sqrt(SAK.ri * SAK.ri - r * r) : b + 1;
      for (let yr = Math.ceil(hi); yr <= Math.floor(ho); yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, yr >= Math.floor(ho) ? T.ziegel : T.putz, 'sakristei_kuppel');
      if (r < 2) for (let yr = Math.floor(ho) + 1; yr <= b + R_A + 4; yr++) set(c.x, Y(yr), c.z, yr === b + R_A + 4 ? T.bronze : T.weiss, 'sakristei_kuppel');
    }
    if (imOkt && okt >= SAK.ri - 0.5 && okt < SAK.ri) for (let yr = SAK.wand - 2; yr <= SAK.wand; yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, T.putz, 'sakristei'); // Pendentifs
  }
  // Durchgang Vorraum -> Achteck (Nordseite des Achtecks)
  // (die Achteckwand wird bei u < SAK.u − ri über die Tür aus dem Vorraum geöffnet)

  // ---- Modul 7: Campanile (Baccio d'Agnolo, 70 m)
  for (const c of D.camp) {
    for (let yr = 1; yr <= TURM.top; yr++) {
      const y = Y(yr);
      if (hat(c.x, y, c.z) || luft.has(key(c.x, y, c.z))) continue;
      if (yr > TURM.glocke1 + 1) {
        const s = Math.floor((yr - TURM.glocke1 - 1) / 2);
        if (c.d8 >= s + 1 && c.d8 <= s + 2) set(c.x, y, c.z, yr > TURM.top - 2 ? T.bronze : T.kuppel, 'turmspitze');
        else if (c.d8 > s + 2) unzug('turmspitze', 'Hohlraum der Turmspitze', c.x, y, c.z);
        continue;
      }
      if (c.d8 <= 2) {
        if (yr >= TURM.glocke0 + 2 && yr <= TURM.glocke1 - 1 && c.d8 <= 2) {
          const l = R_lok(c);
          if (Math.abs(l) < 3) { oeffnung('fenster_offen', 'glockenstube', c.x, y, c.z); continue; }
        }
        set(c.x, y, c.z, yr % 28 === 0 ? T.weiss : (c.d8 === 1 ? T.forte : T.mauer), yr >= TURM.glocke0 ? 'glockenstube' : 'campanile_schaft');
      } else if (yr === TURM.glocke0 || yr === TURM.glocke1) set(c.x, y, c.z, yr === TURM.glocke0 ? T.holz : T.serena, 'glockenstube');
      else if (yr > TURM.glocke1) unzug('turmspitze', 'Hohlraum der Turmspitze', c.x, y, c.z);
    }
  }
  function R_lok(c) {                       // Lage entlang der Turmseite (Mitte = 0)
    const l = D.R.toLocal(c.x, c.z), mu = 96, mw = -83;
    return Math.abs(l.u - mu) > Math.abs(l.w - mw) ? l.w - mw : l.u - mu;
  }

  // ---- Modul 8: Hochaltar (Ciborium) und Licht
  for (const c of D.haupt) {
    const r = Math.hypot(c.u - VU, c.wc);
    if (c.zone !== 'vierung' || r > 2.3) continue;   // Ciborium als massiver Block (Oberseite < 20 Zellen)
    for (let yr = 1; yr <= 12; yr++) if (yr <= 10 || r <= 1.5) set(c.x, Y(yr), c.z, yr >= 10 ? T.gold : yr <= 3 ? T.weiss : T.ornament, 'hochaltar');
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
  PLAN = { zellen, teile, oeff, unz, treppe };
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

module.exports = { modul, lade, plan, zelleBei, Y, BODEN_Y, T, M, VU, TURM };
