'use strict';
// Cappella de' Pazzi (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/cappella_pazzi/): Brunelleschi, ab 1429/1442, Kapitelsaal der Franziskaner von
// Santa Croce. Portikus mit sechs korinthischen Säulen und Mittelbogen, Saal mit quadratischem Mittelraum (Modul 20 Braccia = 11,66 m, hier 23 Blöcke)
// und zwei seitlichen Flügeln, Pendentifs und Schirmkuppel auf zwölf Rippen mit Laterne, Scarsella mit Altar.
// Rahmen wie der Konvent: θ 28,4 Grad, u nach Ost-Südost (Portikus im Westen, Scarsella im Osten), w nach Süd-Südwest. Lagen yr = Y − 61.
// Bauplan als Zellen im Speicher; die Module 7 (Rohbau), 8 (Gewölbe, Kuppel, Dach) und 9 (Licht, Ausstattung) sind Teillisten.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 61;
const Y = (yr) => BODEN_Y + yr;
const hash = (a, b, c) => ((Math.imul(a, 73856093) ^ Math.imul(b, 19349663) ^ Math.imul(c, 83492791)) >>> 0);

// ------------------------------------------------------------------ Maße (lokal, Blöcke; Maßstab 1:2)
const CU = 161, CW = 80;                                   // Mitte des Mittelraums und der Kuppel
const CUBE = { u0: 149.5, u1: 172.5, w0: 68.5, w1: 91.5 };   // Mittelquadrat 23 x 23 (Modul 20 Braccia = 11,66 m, it.wikipedia)
const U_PORT_END = 147, U_HALL0 = 149, U_OST0 = 172.5, U_OST1 = 175;   // Portikus | Eingangswand | Saal | Ostwand | Scarsella
const COLS = [65.5, 70.7, 75.5, 84.5, 89.3, 94.5];          // sechs Säulen (Mitten, w), mittleres Joch weiter
const SAEULE_H = 13, GEBAELK = [14, 15], ATTIKA = 21, PORT_DECKE = 14, PORT_DACH = 18, PORT_DOM = { u: 142.5, w: 80, r: 4.4, h: 2.5 };
const SAAL_DECKE = 13, ANNEX_TOP = 17, WUERFEL_TOP = 24;      // Flügeldecke Lage 13, Dach der Flügel 17, Würfel 24
const R_SPH = 16.3;                                          // Kugel durch die Würfelecken (Pendentifs)
const TRO = [24, 28], R_IN = 11.5, R_TRO = 13.5;             // Tambour Lage 24..28
const KUPPEL = { y0: 28, h: 4 };                             // Schirmkuppel: Kämpfer Lage 28, Stich 4
const LAT = { ri: 2.2, ra: 4, top: 42, kappe: [43, 44, 45, 46] };
const SC = { u0: 175, w: 81, tuerBreite: 5, h: 8, top: 14 };  // Scarsella: Mitte w 81, Öffnung 5 breit
const PORTAL = { w: 80, breite: 6, h: 7 };                   // Portal der Eingangswand (Rechteck 7 hoch, Rundbogen darüber)

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'), serena: WZ.typ('pietra_serena'),
  putz: WZ.typ('putz_weiss'), ziegel: WZ.typ('dachziegel'), kuppel: WZ.typ('ziegel_kuppel'), holz: WZ.typ('holz'), gold: WZ.typ('gold'),
  weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), saeule: WZ.typ('marmor_saeule'), bronze: WZ.typ('bronze'),
  pflaster: WZ.typ('pflaster'), terrakotta: WZ.typ('putz_rosa'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster')
};
const GLAS = PAL.typesForRole('glas');
const FR = (n) => WZ.fresko(n);

// ------------------------------------------------------------------ Laden und Zonen
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, K = masken.masken.kapelle;
  const cells = K.cells.map(([x, z]) => {
    const l = R.toLocal(x, z);
    const c = { x, z, u: l.u, w: l.w, d8: K.d8(x, z), gt: GRUND.groundTopY(x, z) };
    c.rho = Math.hypot(c.u - CU, c.w - CW);
    c.phi = Math.atan2(c.w - CW, c.u - CU) * 180 / Math.PI;
    c.zone = zone(c);
    c.dom = c.rho <= R_TRO && (c.zone === 'saal' || c.zone === 'wand' || c.zone === 'ostwand' || c.zone === 'portalwand');
    c.inCube = c.zone === 'saal' && c.u >= CUBE.u0 && c.u < CUBE.u1 && c.w >= CUBE.w0 && c.w < CUBE.w1;
    c.top = topOf(c);
    return c;
  });
  const byKey = new Map();
  for (const c of cells) byKey.set(P.ck(c.x, c.z), c);
  // Die Würfelwände steigen über die Dächer der Flügel auf: Spalten bis 2 Zellen neben dem Mittelquadrat reichen bis Lage 24 (sonst Lücken an den Ecken)
  for (const c of cells) {
    if (c.dom || c.inCube || !(c.zone === 'saal' || c.zone === 'wand' || c.zone === 'portalwand' || c.zone === 'ostwand')) continue;
    let nah = false;
    for (let dx = -2; dx <= 2 && !nah; dx++) for (let dz = -2; dz <= 2; dz++) { const n = byKey.get(P.ck(c.x + dx, c.z + dz)); if (n && n.inCube) { nah = true; break; } }
    if (nah) c.top = Math.max(c.top, WUERFEL_TOP);
  }
  L = { json, masken, R, K, cells, byKey, haupt: cells };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

function zone(c) {
  if (c.u >= U_OST1) return c.d8 <= 2 ? 'sc_wand' : 'sc';
  if (c.u >= U_OST0) return 'ostwand';
  if (c.u >= U_HALL0) return c.d8 <= 2 ? 'wand' : 'saal';
  if (c.u >= U_PORT_END) return 'portalwand';
  if (c.d8 <= 2) return c.u < 138.5 ? 'front' : 'pseite';
  return 'portico';
}
function topOf(c) {
  if (c.dom) return 46;
  switch (c.zone) {
    case 'front': return ATTIKA;
    case 'pseite': case 'portico': case 'portalwand': return PORT_DACH;
    case 'sc': case 'sc_wand': return SC.top;
    default: return c.inCube ? WUERFEL_TOP : ANNEX_TOP;
  }
}
const columnAt = (w) => COLS.findIndex((wc) => Math.abs(w - wc) < 1.05);
const portalOffen = (c, yr) => { const dw = Math.abs(c.w - PORTAL.w); return dw < PORTAL.breite / 2 && yr <= PORTAL.h + Math.floor(Math.sqrt(Math.max(0, (PORTAL.breite / 2) ** 2 - dw * dw))); };
const scOffen = (c, yr) => { const dw = Math.abs(c.w - SC.w); return dw < SC.tuerBreite / 2 && yr <= SC.h - 1 + Math.floor(Math.sqrt(Math.max(0, (SC.tuerBreite / 2) ** 2 - dw * dw))); };
/** Einbau der Schirmkuppel: oberste Lage der Innenluft über dem Kämpfer bei Abstand rho von der Achse. */
const domeIn = (rho) => KUPPEL.y0 + Math.floor(KUPPEL.h * Math.sqrt(Math.max(0, 1 - (rho * rho) / (R_IN * R_IN))));
const cone = (rho) => Math.floor(29 + (R_TRO - rho) * 0.95);
const pDomeIn = (r) => PORT_DECKE + Math.floor(PORT_DOM.h * Math.sqrt(Math.max(0, 1 - (r * r) / (4.5 * 4.5))));

/** Zelle (c, yr) -> null (Luft) oder { p: Bauteil, t: Typ oder 'fill' (Füllung: Fläche oder Mauerwerk je nach Nachbarn) }. */
function zelle(c, yr) {
  const z = c.zone;
  if (yr > c.top) return null;
  if (c.dom && yr >= TRO[0]) return kuppelZelle(c, yr);
  switch (z) {
    case 'front': return frontZelle(c, yr);
    case 'pseite': return { p: 'kap_aussenwaende', t: yr === c.top ? T.serena : 'fill' };
    case 'portico': {
      if (yr < PORT_DECKE) return null;
      const r = Math.hypot(c.u - PORT_DOM.u, c.w - PORT_DOM.w);
      if (r <= PORT_DOM.r && yr <= pDomeIn(r)) return null;                       // kleine Kuppel über dem mittleren Joch
      if (yr === PORT_DECKE || (r <= PORT_DOM.r + 1 && yr <= pDomeIn(r) + 1)) return { p: 'portikus_decke', t: 'fill' };
      return { p: 'kap_dach', t: yr === c.top ? T.ziegel : T.mauer };
    }
    case 'portalwand':
      if (portalOffen(c, yr) && c.d8 > 2) return null;
      return { p: 'kap_aussenwaende', t: 'fill' };
    case 'wand': return { p: 'kap_aussenwaende', t: yr === c.top ? T.serena : 'fill' };
    case 'ostwand':
      if (scOffen(c, yr)) return null;
      return { p: 'kap_aussenwaende', t: yr === c.top ? T.serena : 'fill' };
    case 'sc_wand': {
      if (c.u >= 184.5 && Math.abs(c.w - SC.w) < 1.6 && yr >= 4 && yr <= 8 && c.d8 <= 2 && c.u > 185) return { p: 'kap_fenster', t: GLAS[(yr + Math.round(c.w)) % GLAS.length] };
      return { p: 'kap_aussenwaende', t: yr === c.top ? T.serena : 'fill' };
    }
    case 'sc': {
      const dw = Math.abs(c.w - SC.w);
      const hoch = SC.h + Math.floor(Math.sqrt(Math.max(0, 9.5 - dw * dw)));
      if (yr <= hoch) return null;
      return { p: yr === hoch + 1 ? 'scarsella_gewoelbe' : 'kap_dach', t: yr === c.top ? T.ziegel : (yr === hoch + 1 ? 'fill' : T.mauer) };
    }
    case 'saal':
      if (c.inCube) {
        if (yr <= 11) return null;
        if (yr < TRO[0]) return c.rho * c.rho + (yr - 0.5 - 11.5) ** 2 <= R_SPH * R_SPH ? null : { p: 'kap_pendentifs', t: 'fill' };
        return { p: 'kap_wuerfeldach', t: yr === c.top ? T.ziegel : T.mauer };
      }
      if (yr < SAAL_DECKE) return null;
      if (yr === SAAL_DECKE) return { p: 'kap_decken', t: 'fill' };
      return { p: 'kap_dach', t: yr === c.top ? T.ziegel : T.mauer };
    default: return null;
  }
}

function frontZelle(c, yr) {
  const dw = c.w - PORT_DOM.w;
  if (c.w < 64.5 || c.w > 95.5) return { p: 'kap_aussenwaende', t: yr === c.top ? T.serena : 'fill' };   // Endpfeiler der Front
  const ad = Math.abs(dw) <= 4.5 ? Math.sqrt(Math.max(0, 20.25 - dw * dw)) : 0;
  const bogenOffen = Math.abs(dw) <= 4.5 && yr >= GEBAELK[0] && yr <= 13 + Math.floor(ad);
  if (bogenOffen) return null;                                                // Bogen im Gebälk des mittleren Jochs
  if (yr <= SAEULE_H) {
    const k = columnAt(c.w);
    if (k < 0) return null;                                                   // Intercolumnium (Arkade)
    return { p: 'portikus_saeulen', t: yr === 1 ? T.serena : yr >= SAEULE_H - 1 ? T.ornament : T.saeule };
  }
  const ring = Math.abs(dw) <= 4.5 + 1.2 && yr <= 13 + Math.floor(ad + 1.2) && ad > 0 && yr <= GEBAELK[1] + 3;
  if (yr === GEBAELK[0]) return { p: 'portikus_gebaelk', t: T.serena };          // Architrav
  if (ring) return { p: 'portikus_gebaelk', t: T.serena };
  if (yr === c.top) return { p: 'portikus_gebaelk', t: T.serena };              // Kranzgesims der Attika
  return { p: 'portikus_gebaelk', t: T.putz };
}

/** Tambour, Kegel, Kuppelschale, Laterne (Spalten mit rho <= R_TRO, Lagen ab 24). */
function kuppelZelle(c, yr) {
  const rho = c.rho;
  if (rho >= R_IN) {
    if (yr <= TRO[1]) {                                                       // Tambour mit zwölf Fenstern
      const wi = ((c.phi % 30) + 30) % 30;
      if (yr >= 25 && yr <= 27 && Math.abs(wi - 15) < 4.2 && rho < R_TRO - 0.2) return { p: 'kap_tambour', t: GLAS[(yr + Math.round(c.phi / 30)) % GLAS.length] };
      return { p: 'kap_tambour', t: 'fill' };
    }
    return yr <= cone(rho) ? { p: 'kap_kuppel', t: yr === cone(rho) ? T.kuppel : T.mauer } : null;
  }
  const din = domeIn(rho);
  if (rho < LAT.ri) {
    if (yr <= LAT.top) return null;
    return kappe(rho, yr);
  }
  if (yr <= din) return null;
  if (rho < LAT.ra) {
    if (yr <= LAT.top) {
      const w8 = ((c.phi % 45) + 45) % 45;
      if (yr >= 36 && yr <= 40 && Math.abs(w8 - 22.5) < 6 && rho < LAT.ra - 0.2 && yr > din + 1) return { p: 'kap_laterne', t: GLAS[(yr + Math.round(c.phi / 45)) % GLAS.length] };
      return { p: 'kap_laterne', t: yr === din + 1 ? T.putz : T.mauer };
    }
    return kappe(rho, yr);
  }
  if (yr > cone(rho)) return null;
  if (yr === din + 1) {                                                      // Innenfläche der Schale: Rippen (zwölf) aus Pietra serena auf Putz
    const wi = ((c.phi % 30) + 30) % 30;
    return { p: 'kap_kuppel', t: (wi < 3.2 || wi > 26.8) ? T.serena : T.putz };
  }
  return { p: 'kap_kuppel', t: yr === cone(rho) ? T.kuppel : T.mauer };
}
function kappe(rho, yr) {
  const i = LAT.kappe.indexOf(yr);
  if (i < 0) return null;
  const r = [4, 3.2, 2, 0.9][i];
  return rho < r ? { p: 'kap_laterne', t: i >= 2 ? T.gold : T.kuppel } : null;
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
  const ersetze = (x, y, z, t, p) => { const e = zellen.get(key(x, y, z)); if (!e) return false; e.t = t; if (e.p !== p) { e.p = p; } return true; };
  const hat = (x, y, z) => zellen.has(key(x, y, z));
  const get = (x, y, z) => zellen.get(key(x, y, z)) || null;
  const frei = (x, y, z) => luft.add(key(x, y, z));
  const oeff = new Map();
  const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); frei(x, y, z); };
  const unz = new Map();
  const unzug = (p, b, x, y, z) => { const k = p + '|' + b; if (!unz.has(k)) unz.set(k, []); unz.get(k).push({ x, y, z }); };
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const api = { D, set, ersetze, hat, get, frei, oeffnung, unzug, key, Y, T, zellen, teile, zelleBei, N4, luft, FR, GLAS, hash };

  // Luft der Hohlräume: Zelle (x, yr, z) ist Innenluft, wenn sie in der Maske liegt und zelle() null liefert
  const roh = new Map();
  const rohBei = (c, yr) => { const k = c.x + ',' + yr + ',' + c.z; let v = roh.get(k); if (v === undefined) { v = yr <= 0 ? { p: 'kap_boden', t: T.serena } : zelle(c, yr); roh.set(k, v); } return v; };
  const istLuft = (x, yr, z) => { const n = zelleBei(x, z); if (!n) return false; return rohBei(n, yr) === null && yr >= 1 && yr <= n.top; };
  api.istLuft = istLuft;

  for (const c of D.cells) {
    for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'kap_fundament');
    set(c.x, Y(0), c.z, bodenTyp(c), 'kap_boden');
  }
  // Öffnungen: Intercolumnien und Bogen der Front (arkade)
  for (const c of D.cells) {
    if (c.zone !== 'front' || c.w < 64.5 || c.w > 95.5) continue;
    for (let yr = 1; yr <= c.top; yr++) if (zelle(c, yr) === null) oeffnung('arkade', 'portikus_saeulen', c.x, Y(yr), c.z);
  }
  for (const c of D.cells) {
    for (let yr = 1; yr <= c.top; yr++) {
      const v = rohBei(c, yr);
      if (!v) continue;
      let t = v.t;
      if (t === 'fill') {
        const innen = N4.some(([dx, dz]) => istLuft(c.x + dx, yr, c.z + dz)) || istLuft(c.x, yr - 1, c.z) || istLuft(c.x, yr + 1, c.z);
        const aussenWand = c.d8 === 1 && c.zone !== 'saal';
        t = innen ? T.putz : aussenWand ? (yr <= 2 ? T.serena : T.putz) : (c.d8 === 2 || v.p === 'kap_pendentifs' || v.p === 'kap_tambour' || v.p === 'portikus_decke' || v.p === 'kap_decken' || v.p === 'scarsella_gewoelbe') ? T.putz : T.mauer;
      }
      set(c.x, Y(yr), c.z, t, v.p);
    }
  }
  // Ausstattung und Licht
  require('./_kap_ausstattung.js').ausstatten(api);

  teile.clear();
  for (const [k, e] of zellen) { let a = teile.get(e.p); if (!a) teile.set(e.p, a = []); a.push(k); }
  PLAN = { zellen, teile, oeff, unz };
  return PLAN;
}

function bodenTyp(c) {
  switch (c.zone) {
    case 'front': case 'pseite': case 'portico': return T.serena;
    case 'sc': case 'sc_wand': return (Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? T.weiss : T.serena;
    default: {
      if (c.rho < 2.6) return T.gold;
      if (c.rho < 4.2) return T.ornament;
      if (c.rho > 5.2 && c.rho < 6.2) return T.weiss;
      return ((Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1) ? T.serena : T.ziegel;
    }
  }
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

module.exports = { modul, lade, plan, zelleBei, zelle, Y, BODEN_Y, T, CU, CW, CUBE, COLS, PORTAL, SC, R_SPH, KUPPEL, LAT, TRO, SAAL_DECKE, domeIn, cone };
