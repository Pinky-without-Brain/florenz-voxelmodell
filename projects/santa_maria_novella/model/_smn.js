'use strict';
// Gemeinsame Geometrie und Bauplan von Santa Maria Novella (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/santa_maria_novella/).
// Ein Bauplan für alle Module, erste Setzung gewinnt; Module sind Teillisten (modul(n, [...])).
//
// Rahmen SMN: u von der Fassade (Süden, Piazza Santa Maria Novella) zum Chor (Norden), w quer (w > 0 Osten).
// θ = −90°: u = −(z − oz), w = x − ox. Lagen yr = Y − 61.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 61;
const Y = (yr) => BODEN_Y + yr;

// ------------------------------------------------------------------ Maße (Referenzmaße §2/§3)
const U_FASS = 3;                          // Fassade u < 3 (Marmorfront Albertis)
const U_VIER0 = 140, U_VIER1 = 175;        // Vierung/Querhaus (u), Chorkapellen dahinter
// sechs Joche, nach Norden kürzer werdend (15 m → 11,5 m, Verhältnis aus it.wikipedia)
const JOCHE = (() => {
  const n = 6, l0 = 15, l1 = 11.5, sum = (l0 + l1) / 2 * n, s = (U_VIER0 - U_FASS) / sum;
  const out = [U_FASS];
  for (let k = 0; k < n; k++) out.push(out[k] + (l0 + (l1 - l0) * k / (n - 1)) * s);
  return out;
})();
const W_PF0 = 9, W_PF1 = 13;               // Bündelpfeiler |w| 9..13 (Mitte 11)
const W_WAND = 30;                         // Innenkante der Außenwand
const S_KAEMPFER = 24, S_SCHEITEL = 40;    // Arkaden (Spitzbogen)
const SV_KAEMPFER = 26, SV_SCHEITEL = 42;  // Gewölbe der Seitenschiffe
const MV_KAEMPFER = 44, MV_SCHEITEL = 54;  // Gewölbe des Mittelschiffs (27 m)
const TRAUFE_M = 56, FIRST_M = 64, S_DACH_I = 50, S_DACH_A = 45;
const CHOR = { w0: -14, w1: 19 };
const FASS = { breite: 67, hoehe: 67 };    // Fassade quadratisch (Breite = Höhe, Alberti)
const TURM = { u0: 153.5, u1: 168, w0: -51.6, w1: -38.6, top: 136, glocke0: 104, glocke1: 116 };

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'), ziegelw: WZ.typ('ziegel_kuppel'),
  serena: WZ.typ('pietra_serena'), putz: WZ.typ('putz_weiss'), ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'),
  weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), gruen: WZ.typ('marmor_gruen'), gold: WZ.typ('gold'),
  terrakotta: WZ.typ('putz_rosa'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), bronze: WZ.typ('bronze')
};
const GLAS = PAL.typesForRole('glas');
const glas = (a, b) => GLAS[Math.abs(a * 5 + b * 3) % GLAS.length];

// ------------------------------------------------------------------ Laden
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt, C = masken.masken.campanile;
  const mk = (x, z, m, wo) => {
    const l = R.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, d8: m.d8(x, z), gt: GRUND.groundTopY(x, z), wo };
  };
  const haupt = H.cells.map(([x, z]) => mk(x, z, H, 'kirche'));
  const camp = C.cells.map(([x, z]) => mk(x, z, C, 'campanile'));
  for (const c of haupt) c.zone = zone(c);
  for (const c of camp) c.zone = 'campanile';
  const byKey = new Map();
  for (const c of haupt.concat(camp)) byKey.set(P.ck(c.x, c.z), c);
  L = { json, masken, R, H, C, haupt, camp, alle: haupt.concat(camp), byKey };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

function zone(c) {
  const a = Math.abs(c.w);
  if (c.u < U_FASS) return 'fassade';
  if (c.u < U_VIER0) {
    if (a > W_WAND + 3.5) return 'quer';        // Querarm-Ansätze westlich ab u 119, östlich ab u 131
    return a < W_PF1 ? 'mittel' : 'seite';
  }
  if (c.u < U_VIER1) return a < W_PF1 ? 'vierung' : 'quer';
  if (c.w >= CHOR.w0 && c.w <= CHOR.w1) return 'chor';
  return 'kapelle';
}
function joch(u) {
  for (let k = 0; k < 6; k++) if (u < JOCHE[k + 1]) return { k, u0: JOCHE[k], u1: JOCHE[k + 1], uc: (JOCHE[k] + JOCHE[k + 1]) / 2 };
  return { k: 5, u0: JOCHE[5], u1: JOCHE[6], uc: (JOCHE[5] + JOCHE[6]) / 2 };
}
const spitz = (y0, h, x, a) => (Math.abs(x) < a ? Math.floor(y0 + h * Math.sqrt(Math.max(0, 1 - Math.abs(x) / a))) : -1);
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);
const PFEILER_U = JOCHE.slice(1, 6).concat([U_VIER0, U_VIER1]);
const istPfeiler = (c) => PFEILER_U.some((p) => Math.abs(c.u - p) < 2) && Math.abs(c.w) >= W_PF0 && Math.abs(c.w) < W_PF1;

// Gewölbehöhe (Kreuzrippengewölbe aus zwei Spitztonnen): Kämpfer + H · max(√(1−|du|/hu), √(1−|dw|/hw))
function gewoelbe(du, dw, hu, hw, k0, k1) {
  const f = (t) => Math.sqrt(Math.max(0, 1 - Math.min(1, Math.abs(t))));
  return Math.floor(k0 + (k1 - k0) * Math.max(f(du / hu), f(dw / hw)));
}
function decke(c) {
  const a = Math.abs(c.w);
  switch (c.zone) {
    case 'mittel': { const j = joch(c.u); return gewoelbe(c.u - j.uc, c.w, (j.u1 - j.u0) / 2, 9, MV_KAEMPFER, MV_SCHEITEL); }
    case 'seite': { const j = joch(c.u); return gewoelbe(c.u - j.uc, a - 21.5, (j.u1 - j.u0) / 2, 8.5, SV_KAEMPFER, SV_SCHEITEL); }
    case 'vierung': return gewoelbe(c.u - 157.5, c.w, 17.5, 9, MV_KAEMPFER, MV_SCHEITEL);
    case 'quer': { const n = Math.floor((a - 13) / 18); const wc = Math.sign(c.w) * (13 + 9 + n * 18); return gewoelbe(c.u - 157.5, c.w - wc, 17.5, 9, MV_KAEMPFER - 4, MV_SCHEITEL - 4); }
    case 'chor': return gewoelbe(c.u - 190.5, c.w - 2.5, 15.5, 16.5, 34, 50);
    case 'kapelle': return 34;
    default: return null;
  }
}
function dach(c) {
  const a = Math.abs(c.w);
  switch (c.zone) {
    case 'mittel': case 'vierung': return Math.round(FIRST_M - (FIRST_M - TRAUFE_M) * Math.min(1, a / 13));
    case 'seite': return Math.round(S_DACH_I - (S_DACH_I - S_DACH_A) * Math.min(1, (a - 13) / 20));
    case 'quer': return Math.round(FIRST_M - 2 - (FIRST_M - 2 - TRAUFE_M + 4) * Math.min(1, Math.abs(c.u - 157.5) / 17.5));
    case 'chor': return Math.round(58 - 6 * Math.min(1, Math.abs(c.w - 2.5) / 16.5));
    case 'kapelle': return 40;
    default: return null;
  }
}

// ------------------------------------------------------------------ Fassade (Alberti 1470, quadratisch)
function fassadeHoehe(c) {
  const a = Math.abs(c.w);
  if (a <= 17) return 58 + Math.round(9 * (1 - a / 17));                 // Tempelfront mit Giebel bis 67
  if (a <= 30) return 38 + Math.round(16 * Math.sqrt(Math.max(0, 1 - ((a - 17) / 13) ** 2))); // Voluten
  return 38;                                                              // Untergeschoss bis 19 m
}
const PORTAL = { w0: -5, w1: 5 };                                          // Mittelportal: Höhe 1,5 × Breite
const SEITENPORTALE = [{ w0: -24, w1: -20 }, { w0: 20, w1: 24 }];
function portal(c, yr) {
  if (c.w >= PORTAL.w0 && c.w < PORTAL.w1) return yr >= 1 && yr <= rund(10, c.w, 5) ? 'tor' : null;
  for (const p of SEITENPORTALE) if (c.w >= p.w0 && c.w < p.w1 && yr >= 1 && yr <= rund(7, c.w - (p.w0 + p.w1) / 2, 2)) return 'tuer';
  return null;
}
const ROSETTE = { yr: 47, r: 5.5 };

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
  for (const c of D.haupt) D_.set(P.ck(c.x, c.z), c.zone === 'fassade' ? fassadeHoehe(c) : dach(c));
  const dachBei = (x, z) => D_.get(P.ck(x, z));

  // ---- Öffnungen
  for (const c of D.haupt) {
    if (c.zone === 'fassade') { for (let yr = 1; yr <= 12; yr++) { const a = portal(c, yr); if (a) oeffnung(a, 'portale', c.x, Y(yr), c.z); } continue; }
    // Tür vom westlichen Querarm in den Campanile
    if (c.d8 <= 3 && c.w < -36 && c.u >= 159 && c.u < 162) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'campanile_schaft', c.x, Y(yr), c.z);
  }
  // Campanile: Tür (Ostseite zum Querarm), Treppe, Glockenstube
  const turmLok = (c) => ({ iu: c.u - TURM.u0, iw: c.w - TURM.w0, ru: TURM.u1 - c.u, rw: TURM.w1 - c.w });
  const turmRand = (c) => { const l = turmLok(c); return Math.min(l.iu, l.iw, l.ru, l.rw); };
  for (const c of D.camp) if (turmRand(c) < 2.5 && c.w > TURM.w1 - 2.5 && c.u >= 159 && c.u < 162) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'campanile_schaft', c.x, Y(yr), c.z);
  let treppe = null;
  {
    const innen = D.camp.filter((c) => turmRand(c) >= 2.5);
    const set2 = new Set(innen.map((c) => P.ck(c.x, c.z)));
    let best = null, bd = Infinity;
    const mu = (TURM.u0 + TURM.u1) / 2, mw = (TURM.w0 + TURM.w1) / 2;
    for (const c of innen) {
      let ok = true;
      for (let dx = -3; dx <= 3 && ok; dx++) for (let dz = -3; dz <= 3; dz++) if (!set2.has(P.ck(c.x + dx, c.z + dz))) { ok = false; break; }
      const d = Math.hypot(c.u - mu, c.w - mw);
      if (ok && d < bd) { bd = d; best = c; }
    }
    if (!best) throw new Error('SMN: kein Platz für die Turmtreppe');
    treppe = WZ.treppe.wendeltreppe({ mitte: { x: best.x, z: best.z }, radiusInnen: 1, radiusAussen: 3, yVon: Y(0), yBis: Y(TURM.glocke0), rolle: 'pietra_serena', drehsinn: 'rechts' });
    for (const l of WZ.treppe.treppenloch(treppe.lauf, 3)) frei(l.x, l.y, l.z);
    for (const b of treppe) if (b.y >= Y(TURM.glocke0) - 3) for (let h = 1; h <= 3; h++) if (b.y + h <= Y(TURM.glocke0)) frei(b.x, b.y + h, b.z);
    for (const b of treppe) if (b.y > Y(0)) set(b.x, b.y, b.z, b.typ, 'campanile_treppe', true);
  }

  // ---- Modul 0: Fundament und Boden
  for (const c of D.alle) for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
  for (const c of D.alle) {
    let t = T.serena;
    if (c.zone === 'mittel' || c.zone === 'vierung') t = ((Math.floor(c.u / 3) + Math.floor((c.w + 30) / 3)) % 2) ? T.serena : T.weiss;
    else if (c.zone === 'chor' || c.zone === 'kapelle') t = T.terrakotta;
    set(c.x, Y(0), c.z, t, 'boden');
  }

  // ---- Modul 1: Fassade
  for (const c of D.haupt) {
    if (c.zone !== 'fassade') continue;
    const top = fassadeHoehe(c), a = Math.abs(c.w), vorn = c.u < 1;
    for (let yr = 1; yr <= top; yr++) {
      if (luft.has(key(c.x, Y(yr), c.z))) continue;
      const rr = Math.hypot(c.w, yr - ROSETTE.yr);
      if (rr <= ROSETTE.r) { set(c.x, Y(yr), c.z, rr > 4.4 ? T.ornament : glas(Math.round(rr * 2), 2), 'rosette'); continue; }
      let t = T.mauer;
      if (vorn) {
        if (yr === 35 || yr === 38 || yr === top) t = T.ornament;                         // Gesimse, Giebelkante
        else if (yr > 35 && yr < 38) t = (Math.round(c.w) % 4 === 0) ? T.gruen : T.weiss;  // Fries mit Rucellai-Segeln
        else if (yr < 35) {                                                                  // Untergeschoss: Arkaden der Avelli
          const fach = ((Math.round(c.w) % 8) + 8) % 8;
          const bogen = spitz(20, 8, fach - 4, 4);                                         // Blendbögen der Avelli
          t = (fach === 0 || yr === bogen || yr % 17 === 0) ? T.gruen : T.weiss;
          if (a > 31) t = (yr % 3 === 0) ? T.gruen : T.weiss;                              // Eckpilaster gestreift
        } else if (a <= 17) {                                                                // Tempelfront: Pilaster, Gebälk, Giebel
          const ra = Math.abs(Math.round(c.w));
          t = (ra === 16 || ra === 17 || ra === 9 || yr === 57 || yr === 58 || (yr > 58 && yr >= top - 1)) ? T.gruen : T.weiss;
          if (yr > 59 && yr < top - 1 && Math.hypot(c.w, yr - 62) < 1.6) t = T.gold;           // Sonnenscheibe im Giebel
        }
        else t = (Math.round(Math.hypot(a - 17, yr - 38)) % 4 === 0) ? T.gruen : T.weiss;   // Voluten mit Ringen
      }
      set(c.x, Y(yr), c.z, t, vorn ? (yr > 38 ? 'fassade_oben' : 'fassade_unten') : 'fassade_kern');
    }
  }

  // ---- Modul 2: Bündelpfeiler, Arkaden, Hochwände
  for (const c of D.haupt) {
    if (!(c.zone === 'mittel' || c.zone === 'seite' || c.zone === 'vierung' || c.zone === 'quer')) continue;
    if (!istPfeiler(c)) continue;
    const bis = c.zone === 'mittel' || c.zone === 'seite' ? S_KAEMPFER : MV_KAEMPFER - 4;
    for (let yr = 1; yr <= bis; yr++) set(c.x, Y(yr), c.z, yr === bis ? T.ornament : T.serena, 'pfeiler');
  }
  for (const c of D.haupt) {
    if (c.zone !== 'mittel' && c.zone !== 'seite') continue;
    const a = Math.abs(c.w);
    if (a < W_PF0 + 1 || a >= W_PF1 - 1) continue;                // Wandlinie |w| 10..12
    const top = Math.max(dachBei(c.x, c.z) || 0, TRAUFE_M);
    const j = joch(c.u);
    const a0 = j.u0 + 2, a1 = j.u1 - 2;
    const lai = c.u >= a0 && c.u < a1 ? spitz(S_KAEMPFER, S_SCHEITEL - S_KAEMPFER, c.u - (a0 + a1) / 2, (a1 - a0) / 2) : -1;
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (lai >= 0 && yr <= lai) continue;
      // Okuli im Obergaden je Joch über dem Seitenschiffdach
      if (Math.hypot(c.u - j.uc, yr - 52) <= 2.2) { set(c.x, Y(yr), c.z, glas(j.k, yr), 'obergaden_fenster'); continue; }
      set(c.x, Y(yr), c.z, lai >= 0 && yr <= lai + 1 ? T.serena : (yr > S_DACH_I && a >= 11 ? T.mauer : T.putz), yr <= S_SCHEITEL + 1 ? 'arkaden' : 'obergaden');
    }
  }

  // ---- Modul 3: Außenwände (d8 ≤ 3), Kapellen- und Chorwände
  for (const c of D.haupt) {
    if (c.zone === 'fassade') continue;
    const top = dachBei(c.x, c.z);
    const a = Math.abs(c.w);
    let innen = null;
    if ((c.zone === 'chor' || c.zone === 'kapelle') && c.u < U_VIER1 + 2 && c.d8 > 3) innen = 'querhaus_nordwand';
    if (c.zone === 'kapelle' && c.d8 > 3 && (Math.abs(c.w - CHOR.w1) < 1.5 || Math.abs(c.w - CHOR.w0) < 1.5 || Math.abs(c.w - 32.5) < 1 || Math.abs(c.w + 27.5) < 1)) innen = 'kapellenwaende';
    if (c.zone === 'chor' && c.d8 > 3 && (Math.abs(c.w - CHOR.w1) < 1.5 || Math.abs(c.w - CHOR.w0) < 1.5)) innen = 'kapellenwaende';
    if (c.d8 > 3 && !innen) continue;
    const p = c.d8 <= 3 ? (c.zone === 'seite' || c.zone === 'mittel' ? 'seitenwaende' : c.zone === 'chor' ? 'chor' : 'querhaus_waende') : innen;
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      if (innen === 'querhaus_nordwand') {
        // Spitzbögen in die Kapellen (bis Lage 30) und in den Chor (bis Lage 44)
        if (c.zone === 'chor' && c.w > CHOR.w0 + 2 && c.w < CHOR.w1 - 2 && yr <= spitz(28, 16, c.w - 2.5, 14.5)) continue;
        if (c.zone === 'kapelle' && yr <= spitz(18, 12, ((a - 20) % 13) - 6.5, 5.5) && a < 45) continue;
      }
      if (c.d8 <= 3) {
        const j = joch(c.u);
        const fe = (c.zone === 'seite' && Math.abs(c.u - j.uc) < 1.5 && yr >= 14 && yr <= spitz(30, 6, c.u - j.uc, 1.6))
          || (c.zone === 'quer' && a > 50 && Math.abs(c.u - 157.5) < 2 && yr >= 20 && yr <= 44)
          || (c.zone === 'chor' && c.u > 200 && (Math.abs(c.w - 2.5) < 1.5 || Math.abs(c.w + 6) < 1 || Math.abs(c.w - 11) < 1) && yr >= 12 && yr <= spitz(42, 6, 0, 1));
        if (fe) { set(c.x, Y(yr), c.z, glas(Math.round(c.w), yr), 'fenster'); continue; }
      }
      const t = c.d8 <= 3 ? (c.d8 === 1 ? (yr <= 2 ? T.serena : (c.zone === 'seite' ? T.ziegelw : T.mauer)) : c.d8 === 2 ? T.mauer : T.putz) : T.putz;
      set(c.x, Y(yr), c.z, t, p);
    }
  }

  // ---- Modul 4: Gewölbe (Kreuzrippen) und Dächer, Dachräume unzugänglich
  for (const c of D.haupt) {
    if (c.zone === 'fassade' || c.d8 <= 3) continue;
    const dk = decke(c), top = dachBei(c.x, c.z);
    if (dk == null || top == null) continue;
    let lo = dk;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); if (n && n.wo === 'kirche' && n.zone !== 'fassade' && n.d8 > 3) { const nd = decke(n); if (nd != null && nd < lo) lo = nd; } }
    const j = joch(c.u);
    const rippe = c.zone === 'mittel' && Math.abs(Math.abs(c.u - j.uc) / ((j.u1 - j.u0) / 2) - Math.abs(c.w) / 9) < 0.12;
    const gurt = (c.zone === 'mittel' || c.zone === 'seite') && JOCHE.some((q) => Math.abs(c.u - q) < 1);
    for (let yr = lo; yr <= dk; yr++) if (!hat(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, rippe || gurt ? T.serena : T.putz, 'gewoelbe');
    for (let yr = dk + 1; yr < top; yr++) unzug('daecher', 'Dachraum über den Gewölben (ohne Zugang)', c.x, Y(yr), c.z);
  }
  for (const c of D.haupt) {
    if (c.zone === 'fassade') continue;
    const top = dachBei(c.x, c.z);
    if (top == null) continue;
    let lo = top;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < lo) lo = n; }
    for (let yr = lo; yr <= top; yr++) if (!hat(c.x, Y(yr), c.z) && !luft.has(key(c.x, Y(yr), c.z))) set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.mauer, yr === top ? 'daecher' : 'schildwaende');
  }

  // ---- Modul 5: Campanile (Talenti 1332–33, über 68 m)
  for (const c of D.camp) {
    const r = turmRand(c);
    const l = turmLok(c);
    const lang = Math.min(l.iu, l.ru) < 2.5 ? c.w : c.u;
    const lm = Math.min(l.iu, l.ru) < 2.5 ? (TURM.w0 + TURM.w1) / 2 : (TURM.u0 + TURM.u1) / 2;
    for (let yr = 1; yr <= TURM.top; yr++) {
      const y = Y(yr);
      if (hat(c.x, y, c.z) || luft.has(key(c.x, y, c.z))) continue;
      if (yr > TURM.glocke1 + 2) {                                    // gotische Spitze (cuspide)
        const s = (yr - TURM.glocke1 - 2) / 3;
        if (r >= s - 0.5 && r < s + 1.5) set(c.x, y, c.z, yr >= TURM.top - 1 ? T.bronze : T.ziegelw, 'turmspitze');
        else if (r >= s + 1.5) unzug('turmspitze', 'Hohlraum der Turmspitze', c.x, y, c.z);
        continue;
      }
      if (r < 2.5) {
        const trifora = yr >= TURM.glocke0 + 2 && yr <= TURM.glocke1 - 1 && Math.abs(lang - lm) < 4.5 && Math.abs(lang - lm) % 3 > 0.8;
        if (trifora) { oeffnung('fenster_offen', 'glockenstube', c.x, y, c.z); continue; }
        const bogenfries = yr % 26 === 0;
        set(c.x, y, c.z, bogenfries ? T.weiss : (r < 1 ? T.forte : T.mauer), yr >= TURM.glocke0 ? 'glockenstube' : 'campanile_schaft');
      } else if (yr === TURM.glocke0 || yr === TURM.glocke1 + 1) set(c.x, y, c.z, yr === TURM.glocke0 ? T.holz : T.serena, 'glockenstube');
      else if (yr > TURM.glocke1 + 1) unzug('turmspitze', 'Hohlraum der Turmspitze', c.x, y, c.z);
    }
  }

  // ---- Modul 6: Ausstattung und Licht
  for (const c of D.haupt) {
    if (c.zone !== 'chor' || Math.abs(c.u - 196) > 1 || Math.abs(c.w - 2.5) > 3) continue;
    for (let yr = 1; yr <= 3; yr++) set(c.x, Y(yr), c.z, yr === 3 ? T.gold : T.weiss, 'hochaltar');
  }
  for (const c of D.haupt) {                                       // Giottos Kruzifix hängt in der Mittelschiffachse
    if (c.zone !== 'mittel' || Math.abs(c.u - 70) > 0.5 || Math.abs(c.w) > 3) continue;
    for (let yr = 28; yr <= 36; yr++) if (Math.abs(c.w) < 1 || yr === 33) set(c.x, Y(yr), c.z, T.gold, 'kruzifix');
    if (Math.abs(c.w) < 1) for (let yr = 37; yr < decke(c); yr++) set(c.x, Y(yr), c.z, T.holz, 'kruzifix'); // Aufhängung am Gewölbe
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

const OEFF_TEIL = { portale: 'fassade_kern' };
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

module.exports = { modul, lade, plan, zelleBei, Y, BODEN_Y, T, JOCHE, TURM, FASS };
