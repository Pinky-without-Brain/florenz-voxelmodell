'use strict';
// Loggia del Bigallo (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/loggia_del_bigallo/).
// Gotische Loggia an der Ecke Piazza San Giovanni / Via dei Calzaiuoli (1352-1360): offene Halle mit drei Rundbögen
// zur Piazza und einem zur Via dei Calzaiuoli, Marmorverkleidung, Tabernakel mit Statuen; im Obergeschoss das Museo
// del Bigallo (drei Säle, Bifore). Westlich der Loggia die Eingangshalle mit der Treppe ins Museum.
// Rahmen: u entlang der Nordkante (Piazza San Giovanni) von West nach Ost (0..33,6), w nach Süden (0..12,8), θ = -4,14°.
// Lagen yr = Y - 64: Boden 0, EG-Luft 1..8, Obergeschossboden 9, OG-Luft 10..17, Decke 18, Dach 19..22.
// Bauplan als Zellen im Speicher (tools/wahrzeichen/zellplan.js); die Module m0-m5 sind Teillisten.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const { neuerPlan } = require('../../../tools/wahrzeichen/zellplan.js');
const GRUND = require('../spec/ground.js');

const DIR = path.resolve(__dirname, '..');
const BODEN_Y = 64;
const Y = (yr) => BODEN_Y + yr;
const hash = (a, b, c) => (((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0);

const T = {
  weiss: WZ.typ('marmor_weiss'), gruen: WZ.typ('marmor_gruen'), rot: WZ.typ('marmor_rot'), orn: WZ.typ('marmor_ornament'),
  saeule: WZ.typ('marmor_saeule'), alt: WZ.typ('marmor_weiss_alt'), forte: WZ.typ('pietra_forte'), serena: WZ.typ('pietra_serena'),
  mauer: WZ.typ('mauerwerk'), putzW: WZ.typ('putz_weiss'), pflaster: WZ.typ('pflaster'), ziegel: WZ.typ('dachziegel'),
  holz: WZ.typ('holz'), gold: WZ.typ('gold'), bronze: WZ.typ('bronze'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'),
  bruch: WZ.typ('pietra_forte_bruch')
};
const FR = (n) => WZ.fresko(n);
const TR = (rolle, dir) => PAL.treppe(rolle, dir);

// ---------------------------------------------------------------- Geometrie
const EG_OBEN = 8, F1 = 9, DECKE = 18, DACH_MAX = 4;             // Luft EG 1..8, OG-Boden 9, Decke 18
const THICK = [3, 3, 2, 2];                                       // Wanddicke je Kante: Nord, Ost, Süd, West
const HALL_U = 9.4, TR1_U = 11.6, TR2_U0 = 22.5, TR2_U1 = 24.7;   // Halle | Trennwand | Loggia/Säle | Trennwand | Saal 3
const BOGEN_N = [15.8, 22.3, 28.8], BOGEN_R = 2.3;               // drei Rundbögen zur Piazza (Mitte u, Halbbreite)
const BOGEN_O = 6.3, BOGEN_OR = 2.5;                              // ein Rundbogen zur Via dei Calzaiuoli (Mitte entlang der Ostkante)
const TUER_W = [6.0, 9.2];                                        // Türen in den Trennwänden (Bereich in w)
const HALL_TUER_U = [6.6, 9.2];                                   // Straßentür der Halle in der Nordwand
const NISCHEN_U = [15.8, 22.3, 28.8];                             // Tabernakel in der Südwand der Loggia
const bogenHoehe = (d, r) => 4 + Math.floor(Math.sqrt(Math.max(0, r * r - d * d)) + 0.0001);

let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const H = masken.haupt;
  const K = H.kanten();
  const RN = K[0].rahmen;
  const alle = H.cells.map(([x, z]) => {
    const l = RN.toLocal(x, z);
    const e = H.naechsteKante(x, z);
    const le = K[e].rahmen.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, e, ue: le.u, we: le.w, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z) };
  });
  const byKey = new Map(alle.map((c) => [c.x + ',' + c.z, c]));
  for (const c of alle) c.zone = zoneVon(c);
  L = { json, masken, H, K, RN, alle, byKey };
  return L;
}
function zoneVon(c) {
  if (c.d8 <= THICK[c.e]) return 'wand';
  if (c.u < HALL_U) return 'hall';
  if (c.u < TR1_U) return 'tr1';
  if (c.u < TR2_U0) return 'sal2';
  if (c.u < TR2_U1) return 'tr2';
  return 'sal3';
}
const zelleBei = (x, z) => lade().byKey.get(x + ',' + z);
// Luft in der Nachbarzelle (x, z) in Lage yr? (für Wandhäute)
function raumLuft(x, z, yr) {
  const c = zelleBei(x, z);
  if (!c || c.zone === 'wand') return false;
  if (yr >= 1 && yr <= EG_OBEN) return c.zone !== 'tr1';
  if (yr >= F1 + 1 && yr < DECKE) return c.zone !== 'tr1' && c.zone !== 'tr2';
  return false;
}
const inTuer = (c) => c.w >= TUER_W[0] && c.w <= TUER_W[1];

// ---------------------------------------------------------------- Plan
let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const P = neuerPlan();
  const set = P.set;

  // ---- Öffnungen vorab: Rundbögen (arkade), Straßentür der Halle (tuer), Türen der Trennwände, Nischen
  const bogenZellen = [];
  for (const c of D.alle) {
    if (c.zone !== 'wand') continue;
    if (c.e === 0) {
      for (const cu of BOGEN_N) {
        const d = Math.abs(c.u - cu);
        if (d <= BOGEN_R) for (let yr = 1; yr <= bogenHoehe(d, BOGEN_R); yr++) { P.oeffnung('arkade', 'fassade_eg', c.x, Y(yr), c.z); bogenZellen.push([c.x, yr, c.z]); }
      }
      if (c.u >= HALL_TUER_U[0] && c.u <= HALL_TUER_U[1]) for (let yr = 1; yr <= 5; yr++) P.oeffnung('tuer', 'fassade_eg', c.x, Y(yr), c.z);
    } else if (c.e === 1) {
      const d = Math.abs(c.ue - BOGEN_O);
      if (d <= BOGEN_OR) for (let yr = 1; yr <= bogenHoehe(d, BOGEN_OR); yr++) P.oeffnung('arkade', 'fassade_eg', c.x, Y(yr), c.z);
    } else if (c.e === 2) {
      for (const nu of NISCHEN_U) {
        if (c.d8 === 2 && Math.abs(c.u - nu) <= 1.3) for (let yr = 2; yr <= 6; yr++) P.luft(c.x, Y(yr), c.z);   // Tabernakelnische
      }
    }
  }
  for (const c of D.alle) {
    if (c.zone === 'tr1' && inTuer(c)) { for (let yr = 1; yr <= 5; yr++) P.luft(c.x, Y(yr), c.z); for (let yr = F1 + 1; yr <= F1 + 5; yr++) P.luft(c.x, Y(yr), c.z); }
    if (c.zone === 'tr2' && inTuer(c)) for (let yr = F1 + 1; yr <= F1 + 5; yr++) P.luft(c.x, Y(yr), c.z);
  }
  // Treppe in der Halle (Podesttreppe 5 + 4 Stufen) vorab suchen
  const treppe = sucheTreppe(D);
  treppeBauen(P, treppe);

  const nachbarn = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const hautInnen = (c, yr) => nachbarn.some(([dx, dz]) => raumLuft(c.x + dx, c.z + dz, yr));
  const rippeUm = (c, yr) => [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].some(([a, b, d]) => P.istLuft(c.x + a, Y(yr + d), c.z + b));

  for (const c of D.alle) {
    const { x, z } = c;
    for (let y = c.gt + 1; y <= Y(-1); y++) set(x, y, z, T.bruch, 'fundament');
    set(x, Y(0), z, bodenTyp(c, 0), 'boden');
    if (c.zone === 'wand' || c.zone === 'tr1' || c.zone === 'tr2') {
      for (let yr = 1; yr <= DECKE; yr++) {
        if (P.istLuft(x, Y(yr), z)) continue;
        if (c.zone === 'tr2' && yr <= F1 - 1) continue;                      // Loggia ohne Trennwand im Erdgeschoss
        const { t, p } = c.zone === 'wand' ? wand(c, yr, hautInnen(c, yr), rippeUm(c, yr)) : { t: hautInnen(c, yr) ? T.putzW : T.mauer, p: 'trennwaende' };
        set(x, Y(yr), z, t, p);
      }
    } else {
      if (!treppe.loch.has(x + ',' + z)) set(x, Y(F1), z, bodenTyp(c, 1), 'geschossboden');
      set(x, Y(DECKE), z, T.ziegel, 'obere_decke');
    }
    for (let yr = DECKE + 1; yr <= DECKE + Math.min(c.d8, DACH_MAX); yr++) set(x, Y(yr), z, T.ziegel, 'dach');
  }
  require('./_bg_raeume.js').ausstatten({ P, D, T, FR, TR, Y, zelleBei, hash, raumLuft });
  lichtSetzen(P, D);
  PLAN = P;
  return P;
}

// ---------------------------------------------------------------- Wände
function wand(c, yr, innen, ring) {
  if (c.e > 1) return { t: c.d8 === 1 ? T.forte : innen ? T.putzW : T.mauer, p: 'aussenwaende' };
  const u = c.e === 0 ? c.u : c.ue;
  if (yr <= EG_OBEN) return { t: egFassade(c, yr, u, innen, ring), p: 'fassade_eg' };
  return { t: ogFassade(c, yr, u, innen), p: 'fassade_og' };
}
function egFassade(c, yr, u, innen, ring) {
  if (ring) return ((Math.round(u * 1.5) + yr) & 1) ? T.rot : T.weiss;          // Archivolte: rote und weiße Keilsteine
  if (c.d8 > 1) return innen ? T.putzW : T.mauer;
  if (yr === 1 || yr === EG_OBEN) return T.weiss;                                  // Sockel und Gesims
  return ((Math.floor(u / 1.5) + yr) & 1) ? T.weiss : T.gruen;                     // Inkrustation: weiß und grün
}
function ogFassade(c, yr, u, innen) {
  const fenster = c.e === 0 ? [...BOGEN_N.map((cu) => [cu, 2.1, true]), [5.0, 1.4, false]] : [[BOGEN_O, 2.1, true]];
  for (const [cu, h, bifora] of fenster) {
    const du = Math.abs(u - cu);
    if (yr >= F1 + 3 && yr <= F1 + 7 && du <= h && (yr < F1 + 7 || du <= h - 0.6)) return bifora && du <= 0.55 ? T.saeule : T.fenster;
    if (c.d8 === 1 && yr >= F1 + 2 && yr <= F1 + 8 && du <= h + 0.9) return T.weiss;
  }
  if (yr === F1 || yr === DECKE) return c.d8 === 1 ? T.weiss : T.mauer;
  if (c.d8 === 1) return T.forte;
  return innen ? T.putzW : T.mauer;
}
function bodenTyp(c, i) {
  if (i === 1) return c.zone === 'sal3' ? T.holz : T.ziegel;
  if (c.zone === 'sal2' || c.zone === 'tr2' || c.zone === 'sal3') {
    const a = Math.floor(c.u / 2), b = Math.floor(c.w / 2);
    if (a % 4 === 1 && b % 2 === 1) return T.rot;
    return ((a + b) & 1) ? T.weiss : T.serena;
  }
  return T.pflaster;
}

// ---------------------------------------------------------------- Treppe der Halle
function sucheTreppe(D) {
  const hall = new Map(D.alle.filter((c) => c.zone === 'hall').map((c) => [c.x + ',' + c.z, c]));
  let best = null;
  for (const c of hall.values()) {
    const zellen = [];
    for (let r = 0; r <= 6; r++) for (let q = 0; q <= 3; q++) zellen.push([c.x - q, c.z + r]);
    if (!zellen.every(([x, z]) => hall.has(x + ',' + z))) continue;
    if (![[c.x, c.z - 1], [c.x - 1, c.z - 1], [c.x - 2, c.z - 1], [c.x - 3, c.z - 1]].every(([x, z]) => hall.has(x + ',' + z))) continue;
    const score = c.x * 1000 + c.z;
    if (!best || score < best.score) best = { score, start: { x: c.x, z: c.z } };
  }
  if (!best) throw new Error('Bigallo: keine Treppenfläche in der Halle');
  const loch = new Set();
  for (let r = 1; r <= 4; r++) for (const q of [2, 3]) loch.add((best.start.x - q) + ',' + (best.start.z + r));
  return { start: best.start, loch };
}
function treppeBauen(P, tr) {
  const arr = WZ.treppe.podestTreppe({ start: { x: tr.start.x, y: Y(1), z: tr.start.z }, richtung: 's', stufen1: 5, stufen2: 4, breite: 2, rolle: 'pietra_serena', drehsinn: 'rechts' });
  for (const b of arr) P.set(b.x, b.y, b.z, b.typ, 'treppe');
  for (const b of arr) if (PAL.isTreppe(b.typ) && !P.hat(b.x, b.y - 1, b.z)) P.set(b.x, b.y - 1, b.z, T.serena, 'treppe');   // Kragstein unter jeder Stufe
}

// Seelaternen im Boden, je Raum Abstand höchstens 9
function lichtSetzen(P, D) {
  for (const f of [0, F1]) {
    const gruppen = {};
    for (const c of D.alle) {
      const y = Y(f);
      const b = P.get(c.x, y, c.z);
      if (!b || (b.p !== 'boden' && b.p !== 'geschossboden')) continue;
      if (P.hat(c.x, y + 1, c.z) || P.hat(c.x, y + 2, c.z) || P.hat(c.x, y + 3, c.z)) continue;
      const z = f === 0 && (c.zone === 'sal2' || c.zone === 'tr2' || c.zone === 'sal3') ? 'loggia' : c.zone;
      (gruppen[z] || (gruppen[z] = [])).push({ x: c.x, y: y + 1, z: c.z });
    }
    for (const zs of Object.values(gruppen)) for (const l of WZ.licht.lichtRaster(zs, { abstand: 9 })) P.ersetze(l.x, l.y, l.z, T.licht, 'licht');
  }
}

module.exports = {
  modul: (n, ids) => ({ module: n, build(ctx) { return plan().modul(n, ids, plan).build(ctx); } }),
  lade, plan, zelleBei, Y, T, EG_OBEN, F1, DECKE
};
