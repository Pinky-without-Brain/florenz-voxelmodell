'use strict';
// Torre degli Alberti (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/torre_alberti/): Turm der Alberti an Via de' Benci und
// Borgo Santa Croce (Ende 13. Jh.), trapezförmiger Grundriss, Pietra-forte-Mauerwerk, Eck-Loggetta (Anfang 15. Jh.) im obersten
// Geschoss, Terrasse mit Zinnen (19. Jh.). Rahmen TA (theta −17,2°): u entlang der Südkante (Borgo Santa Croce, West → Ost), w nach Norden negativ.
// Lagen yr = Y − 61: Böden 0, 7, 14, 21, 28; Terrassenboden 35; Brüstung 36 und 37 (OSM-Höhe 37).
// Bauplan als Zellen im Speicher (tools/wahrzeichen/zellplan.js); die Module m0–m5 sind Teillisten.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const { neuerPlan } = require('../../../tools/wahrzeichen/zellplan.js');
const GRUND = require('../spec/ground.js');

const DIR = path.resolve(__dirname, '..');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
const BODEN_Y = PJ.bodenY;
const Y = (yr) => BODEN_Y + yr;
const hash = (a, b, c) => (((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0);

// ------------------------------------------------------------------ Maße (Stufe C, soweit im Katalog nicht anders vermerkt)
const WAND = 3;                      // Mauerdicke in Zellen (Chebyshev-Abstand zum Rand)
const GESCH = 7;                     // Geschosshöhe: Boden alle 7 Lagen
const N_GESCH = 5;                   // building:levels = 5 (OSM)
const TERRASSE = GESCH * N_GESCH;    // Terrassenboden Lage 35
const TOP = 37;                      // OSM-Höhe
const STUFEN = 7;                    // Treppenlauf je Geschoss
const BAY = 5, BAY_OFFEN_VON = 1.5;  // Loggetta: Joch 5, Pfeiler bis 1,5 vom Jochrand
const LOGGIA_REICHWEITE = 11;        // Länge der Arkadenreihe an beiden Seiten der Ecke

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'), putz: WZ.typ('putz_weiss'),
  serena: WZ.typ('pietra_serena'), orn: WZ.typ('marmor_ornament'), saeule: WZ.typ('marmor_saeule'), weiss: WZ.typ('marmor_weiss'),
  pfl: WZ.typ('pflaster'), holz: WZ.typ('holz'), gold: WZ.typ('gold'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'),
  dach: WZ.typ('dachziegel'), kontrast: WZ.typ('kontrast_dunkel')
};
const FR = (n) => WZ.fresko(n);

// ------------------------------------------------------------------ Laden
let L = null;
function lade() {
  if (L) return L;
  const masken = WZ.ladeMasken(PJ, { dir: DIR });
  const H = masken.haupt, R = masken.rahmen, K = H.kanten();
  // Ecke der Loggetta: Zwischenpunkt der Kanten 1 und 2 (östlichste Ecke, Zusammenstoß von Via de' Benci und Borgo Santa Croce)
  const ecke = K[1].b;
  const alle = H.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    const e = H.naechsteKante(x, z);
    const le = K[e].rahmen.toLocal(x, z);
    const c = { x, z, u: l.u, w: l.w, e, ue: le.u, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z) };
    c.dEcke = Math.hypot(x - ecke.x, z - ecke.z);
    return c;
  });
  const byKey = new Map(alle.map((c) => [c.x + ',' + c.z, c]));
  const innen = new Set(alle.filter((c) => c.d8 > WAND).map((c) => c.x + ',' + c.z));
  L = { PJ, masken, H, R, K, ecke, alle, byKey, innen };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(x + ',' + z);

// Tür (Borgo Santa Croce): Südkante bei u 10..14
const inTuer = (c) => c.e === 3 && c.d8 <= WAND && c.u >= 10 && c.u <= 14.5;
// Fensterrasters je Kante: Mitten alle 7,5 ab 4,5, Breite 2
function fensterSpalte(c) {
  const D = lade();
  const Lk = D.K[c.e].L;
  if (Lk < 8) return false;
  for (let m = 4.5; m < Lk - 3; m += 7.5) if (Math.abs(c.ue - m) <= 0.9) return !(c.e === 3 && c.u >= 8.5 && c.u <= 16);
  return false;
}
// Eckloggetta: Joch der Zelle (Abstand zur Ecke entlang der Kante), null außerhalb
function loggiaJoch(c) {
  const D = lade();
  if (c.d8 > WAND || (c.e !== 1 && c.e !== 2)) return null;
  const dist = c.e === 1 ? D.K[1].L - c.ue : c.ue;
  if (dist > LOGGIA_REICHWEITE || c.dEcke > LOGGIA_REICHWEITE + 3) return null;
  const q = dist % BAY;
  return { dist, q, pfeiler: q < BAY_OFFEN_VON || q > BAY - 0.001, d: Math.abs(q - BAY / 2) };
}
const loggiaOffenBis = (j) => 32 + Math.floor(Math.sqrt(Math.max(0, 4 - j.d * j.d)));   // Bogenscheitel bis Lage 34
const LOGGIA_UNTEN = 31;                                                                   // Brüstung Lage 29..30

// ------------------------------------------------------------------ Plan
let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const P = neuerPlan();
  const set = P.set;
  const api = { P, D, T, FR, Y, hash };

  // ---- Treppen vorab (zwei Plätze im Wechsel), Löcher in den Böden
  const plaetze = treppenplaetze(D);
  const treppen = [];
  for (let k = 0; k < N_GESCH; k++) {
    const pl = plaetze[k % 2];
    const arr = WZ.treppe.geradeTreppe({ start: { x: pl.x, y: Y(GESCH * k) + 1, z: pl.z }, richtung: 's', stufen: STUFEN, breite: 2, rolle: 'pietra_forte' });
    treppen.push(arr);
    for (const c of WZ.treppe.treppenloch(arr.lauf)) { if (k === N_GESCH - 1 && c.y >= Y(TERRASSE)) P.oeffnung('tuer', 'treppe', c.x, c.y, c.z); else P.luft(c.x, c.y, c.z); }
  }

  // ---- Öffnungen: Tür, Loggetta
  for (const c of D.alle) {
    if (inTuer(c)) for (let yr = 1; yr <= 5; yr++) P.oeffnung('tuer', 'aussenwand', c.x, Y(yr), c.z);
    const j = loggiaJoch(c);
    if (j && !j.pfeiler) for (let yr = LOGGIA_UNTEN; yr <= loggiaOffenBis(j); yr++) P.oeffnung('loggia', 'loggetta', c.x, Y(yr), c.z);
  }

  // ---- Treppen setzen (Stufen, Kragstein unter jeder Stufe)
  for (const arr of treppen) {
    for (const b of arr) set(b.x, b.y, b.z, b.typ, 'treppe');
    for (const b of arr) if (PAL.isTreppe(b.typ) && !P.hat(b.x, b.y - 1, b.z)) set(b.x, b.y - 1, b.z, T.forte, 'treppe');
  }
  // ---- Fundament, Boden, Wände, Böden, Terrasse
  for (const c of D.alle) {
    const { x, z } = c;
    for (let y = c.gt + 1; y <= Y(-1); y++) set(x, y, z, T.bruch, 'fundament');
    set(x, Y(0), z, c.d8 <= WAND ? T.forte : (((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1) ? T.pfl : T.serena), 'boden');
    if (c.d8 <= WAND) {
      const j = loggiaJoch(c);
      for (let yr = 1; yr <= TERRASSE; yr++) {
        if (P.istLuft(x, Y(yr), z)) continue;
        let t, p = 'aussenwand';
        if (yr >= 29 && yr <= 34 && j) {
          // Loggetta: Pfeiler mit Ketten der Alberti im Kapitell, Brüstung aus Marmor
          if (yr < LOGGIA_UNTEN) t = T.orn;
          else if (j.pfeiler) t = T.serena;
          else t = T.serena;
          p = 'loggetta';
        } else if (c.d8 === 1) t = ((hash(c.x, yr, c.z) % 7) === 0 || (yr % 3 === 0 && hash(c.x >> 1, yr, c.z >> 1) % 3 === 0)) ? T.bruch : T.forte;
        else if (c.d8 === WAND) t = T.putz;
        else t = T.mauer;
        if (yr === TERRASSE) { t = c.d8 === 1 ? T.serena : T.forte; p = 'aussenwand'; }
        set(x, Y(yr), z, t, p);
      }
      // Fenster: Glas durch alle Lagen (Geschosse 1..5, 3 hoch), nicht im Loggettabereich
      if (fensterSpalte(c)) {
        for (let k = 0; k < N_GESCH; k++) {
          if (k === 4 && j) continue;
          for (let yr = GESCH * k + 3; yr <= GESCH * k + 5; yr++) {
            if (P.hat(x, Y(yr), z)) P.ersetze(x, Y(yr), z, T.fenster, 'fenster');
          }
        }
      }
      // Brüstung und Zinnen der Terrasse
      if (c.d8 <= 2) {
        set(x, Y(TERRASSE + 1), z, T.forte, 'zinnen');
        if (c.d8 === 1 && (Math.floor(c.ue / 2) & 1) === 0) set(x, Y(TOP), z, T.forte, 'zinnen');
      }
    } else {
      for (let k = 1; k <= N_GESCH; k++) set(x, Y(GESCH * k), z, k === N_GESCH ? T.pfl : T.holz, k === N_GESCH ? 'terrasse' : 'geschossboeden');
    }
  }
  require('./_ta_ausstattung.js').ausstatten(api);
  lichtSetzen(P, D);
  PLAN = P;
  return P;
}

/** Zwei Treppenplätze (Läufe nach Süden in Weltachse, 2 breit, 7 Stufen, Podest davor und dahinter), im Innenraum. */
function treppenplaetze(D) {
  const fp = (x, z) => {
    const zs = [];
    for (let r = -1; r <= STUFEN + 2; r++) for (const q of [0, -1, 1, -2]) zs.push([x + q, z + r]);
    return zs;
  };
  const gut = (x, z) => fp(x, z).every(([a, b]) => D.innen.has(a + ',' + b));
  let A = null, B = null;
  for (const c of D.alle) {
    if (c.d8 <= WAND + 1 || !gut(c.x, c.z)) continue;
    if (!A || c.u + c.w * 0.2 < A.s) A = { x: c.x, z: c.z, s: c.u + c.w * 0.2 };
    if (!B || c.u + c.w * 0.2 > B.s) B = { x: c.x, z: c.z, s: c.u + c.w * 0.2 };
  }
  if (!A || !B) throw new Error('Torre degli Alberti: keine Treppenplätze');
  return [{ x: A.x, z: A.z }, { x: B.x, z: B.z }];
}

/** Seelaternen im Boden (Raster 12) je Geschoss. */
function lichtSetzen(P, D) {
  for (let k = 0; k < N_GESCH; k++) {
    const zs = [];
    for (const c of D.alle) {
      if (c.d8 <= WAND) continue;
      const y = Y(GESCH * k);
      const b = P.get(c.x, y, c.z);
      if (!b || P.hat(c.x, y + 1, c.z) || P.hat(c.x, y + 2, c.z) || P.hat(c.x, y + 3, c.z) || P.istLuft(c.x, y + 1, c.z)) continue;
      zs.push({ x: c.x, y: y + 1, z: c.z });
    }
    for (const l of WZ.licht.lichtRaster(zs, { abstand: 12 })) P.ersetze(l.x, l.y, l.z, T.licht, 'licht');
  }
}

module.exports = {
  modul: (n, ids) => ({ module: n, build(ctx) { return plan().modul(n, ids, plan).build(ctx); } }),
  lade, plan, Y, T, FR, hash, zelleBei, inTuer, loggiaJoch, GESCH, N_GESCH, TERRASSE, TOP, WAND, treppenplaetze
};
