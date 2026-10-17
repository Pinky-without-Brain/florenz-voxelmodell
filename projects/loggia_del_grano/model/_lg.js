'use strict';
// Loggia del Grano (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/loggia_del_grano/): Giulio Parigi 1619 für Cosimo II. als Kornmarkt,
// offene Arkadenhalle mit drei Bögen an der Stirnseite und zwei an jeder Seite, geschlossene Rückwand mit Wappen; Mezzanin mit
// Rechteckfenstern, 1868 aufgestocktes Obergeschoss mit großen Bogenfenstern (Teatro della Loggia), Gebälk, Dachgeschoss mit
// Ochsenaugen, Satteldach. Rahmen LG (theta 33,69°): u entlang der Nordkante (Stirnseite zum Platz, 0..37,9), w nach Süden (0..27,7).
// Lagen yr = Y − 61: Halle 1..10, Boden Mezzanin 11, Mezzanin 12..14, Boden Obergeschoss 15, Obergeschoss 16..23, Decke 24, Dach bis 30.
// Bauplan als Zellen im Speicher (tools/wahrzeichen/zellplan.js); die Module m0–m6 sind Teillisten.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const { neuerPlan } = require('../../../tools/wahrzeichen/zellplan.js');
const GRUND = require('../spec/ground.js');

const DIR = path.resolve(__dirname, '..');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
const Y = (yr) => PJ.bodenY + yr;
const hash = (a, b, c) => (((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0);

// ------------------------------------------------------------------ Maße (Stufe C, soweit im Katalog nicht anders vermerkt)
const WAND = 3;                         // Mauerdicke
const HALLE_OBEN = 10, F_MEZZ = 11, F_OG = 15, DECKE = 24, GESIMS = [25, 26], ROOF0 = 27, ROOF_MAX = 30;
const SPRUNG = 5;                       // Bogenansatz der Arkaden
const T = {
  rust: WZ.typ('pietra_forte_rustika'), forte: WZ.typ('pietra_forte'), serena: WZ.typ('pietra_serena'), mauer: WZ.typ('mauerwerk'),
  putz: WZ.typ('putz_weiss'), sand: WZ.typ('putz_sand'), orn: WZ.typ('marmor_ornament'), saeule: WZ.typ('marmor_saeule'),
  weiss: WZ.typ('marmor_weiss'), pfl: WZ.typ('pflaster'), holz: WZ.typ('holz'), gold: WZ.typ('gold'), bronze: WZ.typ('bronze'),
  licht: WZ.typ('licht'), glas: WZ.typ('glas_fenster'), dach: WZ.typ('dachziegel'), bruch: WZ.typ('pietra_forte_bruch'), rot: WZ.typ('marmor_rot')
};
const FR = (n) => WZ.fresko(n);
const sq = (v) => Math.sqrt(Math.max(0, v));

// ------------------------------------------------------------------ Laden und Zonen
let L = null;
function lade() {
  if (L) return L;
  const masken = WZ.ladeMasken(PJ, { dir: DIR });
  const H = masken.haupt, R = masken.rahmen, K = H.kanten();
  const alle = H.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    const e = H.naechsteKante(x, z);
    const le = K[e].rahmen.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, e, ue: le.u, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z) };
  });
  const byKey = new Map(alle.map((c) => [c.x + ',' + c.z, c]));
  const innen = new Set(alle.filter((c) => c.d8 > WAND).map((c) => c.x + ',' + c.z));
  L = { PJ, masken, H, R, K, alle, byKey, innen };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(x + ',' + z);

/** Joch der Arkadenseiten (Kanten 0, 1, 2; Kante 3 ist die geschlossene Rückwand). */
function joch(c) {
  const D = lade();
  if (c.d8 > WAND || c.e === 3) return null;
  const Lk = D.K[c.e].L, n = c.e === 1 ? 3 : 2, b = Lk / n;
  const k = Math.max(0, Math.min(n - 1, Math.floor(c.ue / b))), q = c.ue - k * b;
  const eckpfeiler = c.ue < 3.2 || c.ue > Lk - 3.2;
  const pfeiler = eckpfeiler || q < 1.2 || q > b - 1.2;
  const r = (b - 2.4) / 2, d = Math.abs(q - b / 2);
  return { n, b, k, q, eckpfeiler, pfeiler, r, d };
}
/** Höchste offene Lage der Halle an der Zelle (0 = Wand/Pfeiler). */
function bogenOben(c) {
  const j = joch(c);
  if (!j || j.pfeiler) return 0;
  return Math.min(HALLE_OBEN, SPRUNG + Math.floor(sq(j.r * j.r - j.d * j.d)));
}
/** Mezzaninfenster (2 × 2) in der Achse jedes Jochs. */
function mezzFenster(c) {
  const j = joch(c);
  return !!j && !j.eckpfeiler && Math.abs(j.q - j.b / 2) <= 1.0;
}
/** Bogenfenster des Obergeschosses: höchste Glaslage an der Zelle (0 = keins). */
function ogFensterOben(c) {
  const j = joch(c);
  if (!j || j.eckpfeiler) return 0;
  const d = Math.abs(j.q - j.b / 2);
  return d <= 2.4 ? 21 + Math.floor(sq(2.4 * 2.4 - d * d)) : 0;
}
/** Satteldach: Firstlinie entlang u bei w = 13,85, Traufe Lage 27, First Lage 30. */
function dachOben(c) {
  const d = Math.min(c.w, 27.7 - c.w);
  return ROOF0 + Math.max(0, Math.min(ROOF_MAX - ROOF0, Math.floor(d / 4.2)));
}

// ------------------------------------------------------------------ Treppen
function sucheLauf(D, n, breite, richtung, pred, score, sperre) {
  let best = null;
  for (const c of D.alle) {
    if (c.d8 <= WAND + 1) continue;
    const arr = WZ.treppe.geradeTreppe({ start: { x: c.x, y: 0, z: c.z }, richtung, stufen: n, breite, rolle: 'pietra_forte' });
    const zs = new Set();
    for (const b of arr) for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) zs.add((b.x + dx) + ',' + (b.z + dz));
    // Landung am Ende (zwei Zellen weiter in Laufrichtung)
    const d = WZ.treppe.DIR[WZ.treppe.weltRichtung(richtung)];
    for (const b of arr.slice(-breite)) for (let r = 1; r <= 3; r++) zs.add((b.x + d[0] * r) + ',' + (b.z + d[1] * r));
    let ok = true;
    for (const k of zs) if (!D.innen.has(k) || (sperre && sperre.has(k))) { ok = false; break; }
    if (!ok || !pred(c)) continue;
    const s = score(c);
    if (!best || s < best.s) best = { s, x: c.x, z: c.z, zs };
  }
  if (!best) throw new Error('Loggia del Grano: keine Treppenfläche');
  return best;
}
let TR = null;
function treppenplan() {
  if (TR) return TR;
  const D = lade();
  const a = sucheLauf(D, F_MEZZ, 3, 'o', () => true, (c) => -c.w * 10 + c.u);
  const b = sucheLauf(D, F_OG - F_MEZZ, 3, 'o', () => true, (c) => c.w * 10 - c.u, a.zs);
  TR = { a, b };
  return TR;
}

// ------------------------------------------------------------------ Plan
let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const P = neuerPlan();
  const set = P.set;
  const api = { P, D, T, FR, Y, hash };
  const tr = treppenplan();

  // ---- Treppen und Löcher
  const laeufe = [
    { s: tr.a, n: F_MEZZ, y0: 0 }, { s: tr.b, n: F_OG - F_MEZZ, y0: F_MEZZ }
  ].map((t) => WZ.treppe.geradeTreppe({ start: { x: t.s.x, y: Y(t.y0) + 1, z: t.s.z }, richtung: 'o', stufen: t.n, breite: 3, rolle: 'pietra_forte' }));
  for (const arr of laeufe) for (const c of WZ.treppe.treppenloch(arr.lauf)) P.luft(c.x, c.y, c.z);

  // ---- Öffnungen vorab: Bögen der Halle (arkade)
  for (const c of D.alle) {
    const h = bogenOben(c);
    for (let yr = 1; yr <= h; yr++) P.oeffnung('arkade', 'arkadenwand', c.x, Y(yr), c.z);
  }
  for (const arr of laeufe) {
    for (const b of arr) set(b.x, b.y, b.z, b.typ, 'treppe');
    for (const b of arr) if (PAL.isTreppe(b.typ) && !P.hat(b.x, b.y - 1, b.z)) set(b.x, b.y - 1, b.z, T.forte, 'treppe');
  }

  for (const c of D.alle) {
    const { x, z } = c;
    for (let y = c.gt + 1; y <= Y(-1); y++) set(x, y, z, T.bruch, 'fundament');
    const topDach = dachOben(c);
    if (c.d8 > WAND) {
      set(x, Y(0), z, (Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1 ? T.serena : T.pfl, 'boden');
      set(x, Y(F_MEZZ), z, T.holz, 'geschossboeden');
      set(x, Y(F_OG), z, T.holz, 'geschossboeden');
      for (let yr = DECKE; yr <= topDach; yr++) set(x, Y(yr), z, yr === topDach ? T.dach : T.mauer, 'dach');
      continue;
    }
    set(x, Y(0), z, T.forte, 'boden');
    const j = joch(c);
    const aussen = c.d8 === 1, innenL = c.d8 === WAND;
    for (let yr = 1; yr <= topDach; yr++) {
      if (P.istLuft(x, Y(yr), z)) continue;
      if (yr <= F_MEZZ) {
        let t;
        if (yr === F_MEZZ) t = aussen ? T.orn : T.holz;
        else if (j && j.pfeiler && !j.eckpfeiler && yr === SPRUNG) t = aussen ? T.orn : T.serena;
        else if (j && j.pfeiler) t = j.eckpfeiler ? T.rust : T.serena;
        else if (aussen) t = yr <= 2 ? T.forte : T.rust;
        else t = innenL ? T.putz : T.mauer;
        set(x, Y(yr), z, t, j && j.pfeiler && yr < F_MEZZ ? 'pfeiler' : 'arkadenwand');
      } else if (yr < DECKE) {
        // Obergeschosswände: Mezzanin 12..14, Band 15, Obergeschoss 16..23
        let t = aussen ? T.sand : innenL ? T.putz : T.mauer, p = 'obergeschosse';
        if (yr === F_OG) t = aussen ? T.orn : T.holz;
        if (j && yr >= 12 && yr <= 13 && mezzFenster(c)) { t = T.glas; p = 'fenster'; }
        if (j && yr >= 17 && yr <= ogFensterOben(c)) { t = T.glas; p = 'fenster'; }
        set(x, Y(yr), z, t, p);
      } else if (yr === DECKE) {
        set(x, Y(yr), z, aussen ? T.orn : T.mauer, 'obergeschosse');
      } else if (yr <= GESIMS[1] && aussen) {
        set(x, Y(yr), z, yr === GESIMS[0] ? T.orn : T.serena, 'gesims');
      } else {
        // Dachgeschosswand und Satteldach; Ochsenaugen (3 × 3) in den Giebelwänden der Schmalseiten
        let t = yr === topDach ? T.dach : (aussen ? T.sand : T.mauer), p = 'dach';
        if ((c.e === 0 || c.e === 2) && yr >= 27 && yr <= 29 && Math.abs(c.w - 13.85) <= 1.4 && Math.abs(yr - 28) <= 1) {
          if (Math.hypot(c.w - 13.85, yr - 28) <= 1.6) { t = T.glas; p = 'dachfenster'; }
        }
        set(x, Y(yr), z, t, p);
      }
    }
  }
  require('./_lg_ausstattung.js').ausstatten(api);
  lichtSetzen(P, D);
  PLAN = P;
  return P;
}

/** Seelaternen im Boden (Raster 12) der drei Ebenen. */
function lichtSetzen(P, D) {
  for (const f of [0, F_MEZZ, F_OG]) {
    const zs = [];
    for (const c of D.alle) {
      if (c.d8 <= WAND) continue;
      const y = Y(f);
      const b = P.get(c.x, y, c.z);
      if (!b || P.hat(c.x, y + 1, c.z) || P.hat(c.x, y + 2, c.z) || P.hat(c.x, y + 3, c.z) || P.istLuft(c.x, y + 1, c.z)) continue;
      zs.push({ x: c.x, y: y + 1, z: c.z });
    }
    for (const l of WZ.licht.lichtRaster(zs, { abstand: 12 })) P.ersetze(l.x, l.y, l.z, T.licht, 'licht');
  }
}

module.exports = {
  modul: (n, ids) => ({ module: n, build(ctx) { return plan().modul(n, ids, plan).build(ctx); } }),
  lade, plan, Y, T, FR, hash, zelleBei, joch, bogenOben, treppenplan, WAND, HALLE_OBEN, F_MEZZ, F_OG, DECKE, ROOF_MAX, dachOben
};
