'use strict';
// Loggia del Pesce (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/loggia_del_pesce/): Giorgio Vasari 1568 für den Fischmarkt am
// Mercato Vecchio, 1955 auf die Piazza dei Ciompi versetzt. Offene Loggia aus neun Rundbögen je Langseite (Pfeiler und Säulen
// aus Pietra serena), je einem Bogen an den Schmalseiten, Tondi mit Fischen in den Zwickeln (Terrakotta), Kuppelgewölbe,
// Walmdach mit Dachüberstand. Rahmen LP (theta −2,24°): u entlang der Langseiten (Nordkante, West → Ost, 0..64), w nach Süden (0..12).
// Lagen yr = Y − 64. Bauplan als Zellen im Speicher (tools/wahrzeichen/zellplan.js); die Module m0–m5 sind Teillisten.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { neuerPlan } = require('../../../tools/wahrzeichen/zellplan.js');
const GRUND = require('../spec/ground.js');

const DIR = path.resolve(__dirname, '..');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
const BODEN_Y = PJ.bodenY;
const Y = (yr) => BODEN_Y + yr;
const hash = (a, b, c) => (((a * 73856093) ^ (b * 19349663) ^ (c * 83492791)) >>> 0);

// ------------------------------------------------------------------ Maße (Referenzmaße; Stufe C, soweit nicht anders vermerkt)
const L_LANG = 64, W_QUER = 12;                         // Umriss aus OSM (w204145494): 64 × 12 Blöcke = 32 × 6 m
const N_BOEGEN = 9, B = L_LANG / N_BOEGEN;              // neun Bögen je Langseite (it.wikipedia)
const PFEILER = 2.2;                                    // Pfeilerbreite zwischen zwei Bögen
const RB = (B - PFEILER) / 2;                           // Halbbreite der Bogenöffnung
const KAEMPFER = 5;                                     // Bogenansatz Lage 5, Scheitel Lage 7
const KURZ = { w: 6, r: 3, dicke: 3 };                  // ein Bogen an jeder Schmalseite (1699 ergänzt), Wand 3 dick
const FRIES = 9, KRANZ = [10, 11], DACH = 12;           // Zwickel bis Lage 9, Gebälk 10, Kranzgesims 11, Dachkante 12
const GEW_ANSATZ = 8, GEW_STICH = 2;                    // Kuppelgewölbe: Ansatz Lage 8, Scheitel Lage 10

const T = {
  serena: WZ.typ('pietra_serena'), forte: WZ.typ('pietra_forte'), putz: WZ.typ('putz_weiss'), mauer: WZ.typ('mauerwerk'),
  ornament: WZ.typ('marmor_ornament'), weiss: WZ.typ('marmor_weiss'), pflaster: WZ.typ('pietra_forte_bruch'), terrakotta: WZ.typ('putz_rosa'),
  ziegel: WZ.typ('dachziegel'), gold: WZ.typ('gold'), licht: WZ.typ('licht'), bruch: WZ.typ('pietra_forte_bruch'), holz: WZ.typ('holz'),
  pfl: WZ.typ('pflaster'), rot: WZ.typ('marmor_rot')
};
const FR = (n) => WZ.fresko(n);
const sq = (v) => Math.sqrt(Math.max(0, v));

// ------------------------------------------------------------------ Laden und Zonen
let L = null;
function lade() {
  if (L) return L;
  const masken = WZ.ladeMasken(PJ, { dir: DIR });
  const H = masken.haupt, R = masken.rahmen;
  const alle = H.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    const c = { x, z, u: l.u, w: l.w, d8: H.d8(x, z), gt: GRUND.groundTopY(x, z) };
    const lw = Math.min(c.w, W_QUER - c.w), sw = Math.min(c.u, L_LANG - c.u);
    c.zone = c.d8 <= KURZ.dicke && sw <= lw && sw < KURZ.dicke + 0.2 ? 'kurz' : c.d8 <= 2 ? 'lang' : 'halle';
    if (c.zone === 'lang') { const k = Math.max(0, Math.min(N_BOEGEN - 1, Math.floor(c.u / B))); c.k = k; c.q = c.u - k * B; c.pfeiler = c.q < PFEILER / 2 || c.q > B - PFEILER / 2; }
    return c;
  });
  const byKey = new Map(alle.map((c) => [c.x + ',' + c.z, c]));
  L = { PJ, masken, H, R, alle, byKey };
  return L;
}
/** Höhe der Bogenöffnung (höchste offene Lage) an der Zelle; 0 = Wand. */
function bogenHoehe(c) {
  if (c.zone === 'lang' && !c.pfeiler) return KAEMPFER + Math.floor(sq(RB * RB - (c.q - B / 2) ** 2));
  if (c.zone === 'kurz') { const dw = Math.abs(c.w - KURZ.w); return dw < KURZ.r ? KAEMPFER + Math.floor(sq(KURZ.r * KURZ.r - dw * dw)) : 0; }
  return 0;
}
/** Erster massiver Block über dem Raum (Kuppelgewölbe je Joch). */
function gewoelbe(c) {
  const k = Math.max(0, Math.min(N_BOEGEN - 1, Math.floor(c.u / B)));
  const x = (c.u - (k + 0.5) * B) / (B / 2), y = (c.w - W_QUER / 2) / (W_QUER / 2 - 2);
  return GEW_ANSATZ + Math.ceil(GEW_STICH * sq(1 - (x * x + y * y)));
}
const dachHoehe = (c) => DACH + Math.min(2, Math.floor((c.d8 - 1) / 2));

// ------------------------------------------------------------------ Plan
let PLAN = null;
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const P = neuerPlan();
  const set = P.set;
  const api = { P, D, T, FR, Y, hash };

  // ---- Öffnungen vorab: alle Bogenöffnungen (Luft, als `arkade` deklariert)
  for (const c of D.alle) {
    const h = bogenHoehe(c);
    for (let yr = 1; yr <= h; yr++) P.oeffnung('arkade', 'arkadenwand', c.x, Y(yr), c.z);
  }

  // ---- Fundament, Boden, Wände, Gewölbe, Dach
  for (const c of D.alle) {
    const { x, z } = c;
    for (let y = c.gt + 1; y <= Y(-1); y++) set(x, y, z, T.bruch, 'fundament');
    const boden = c.zone === 'halle' ? ((Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1 ? T.serena : T.pfl) : T.serena;
    set(x, Y(0), z, boden, 'boden');
    if (c.zone === 'halle') {
      const ce = gewoelbe(c), top = dachHoehe(c);
      for (let yr = ce; yr < top; yr++) set(x, Y(yr), z, yr === ce ? T.putz : T.mauer, 'gewoelbe');
      set(x, Y(top), z, T.ziegel, 'dach');
      continue;
    }
    for (let yr = 1; yr <= KRANZ[1]; yr++) {
      if (P.istLuft(x, Y(yr), z)) continue;
      let t, p = 'arkadenwand';
      const aussen = c.d8 === 1;
      if (yr === KRANZ[1]) { t = T.serena; p = 'gebaelk'; }
      else if (yr === KRANZ[0]) { t = aussen ? T.ornament : T.putz; p = 'gebaelk'; }
      else if (c.zone === 'lang' && c.pfeiler) { t = yr <= 2 ? T.forte : yr === KAEMPFER ? (aussen ? T.ornament : T.serena) : T.serena; p = 'pfeiler'; }
      else if (c.zone === 'kurz' && yr <= FRIES) { t = aussen ? (yr <= 2 ? T.forte : T.serena) : T.mauer; p = 'pfeiler'; }
      else if (yr <= 2 && aussen) { t = T.forte; }
      else if (yr === KAEMPFER && aussen) { t = T.ornament; p = 'pfeiler'; }
      else t = aussen ? T.putz : T.mauer;
      set(x, Y(yr), z, t, p);
    }
    set(x, Y(DACH), z, T.ziegel, 'dach');
  }
  // Dachüberstand: zwei Zellen um die Maske, Lage 11 (Luftraum 2)
  const ring = D.H.dilate(2);
  for (const [x, z] of ring.cells) if (!D.H.has(x, z)) set(x, Y(KRANZ[1]), z, T.ziegel, 'dach');

  require('./_lp_ausstattung.js').ausstatten(api);
  lichtSetzen(P, D);
  PLAN = P;
  return P;
}

/** Seelaternen im Boden (Raster 12) der Halle. */
function lichtSetzen(P, D) {
  const zs = [];
  for (const c of D.alle) {
    if (c.zone !== 'halle') continue;
    const b = P.get(c.x, Y(0), c.z);
    if (!b || P.hat(c.x, Y(1), c.z) || P.hat(c.x, Y(2), c.z) || P.hat(c.x, Y(3), c.z)) continue;
    zs.push({ x: c.x, y: Y(1), z: c.z });
  }
  for (const l of WZ.licht.lichtRaster(zs, { abstand: 12 })) P.ersetze(l.x, l.y, l.z, T.licht, 'licht');
}

module.exports = {
  modul: (n, ids) => ({ module: n, build(ctx) { return plan().modul(n, ids, plan).build(ctx); } }),
  lade, plan, Y, T, FR, hash, bogenHoehe, gewoelbe, dachHoehe, KAEMPFER, B, N_BOEGEN, L_LANG, W_QUER, KURZ, DACH, KRANZ
};
