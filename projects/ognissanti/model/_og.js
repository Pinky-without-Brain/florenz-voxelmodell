'use strict';
// Gemeinsame Geometrie und Bauplan von Ognissanti (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/ognissanti/).
// Ein Bauplan für alle Module, erste Setzung gewinnt; Module sind Teillisten (modul(n, [...])).
//
// Rahmen OG (θ = −46,9°): u von der Fassade (Südwesten, Piazza d'Ognissanti) zur Apsis (Nordosten), w quer, w > 0 nach
// Südosten, also rechts beim Eintreten. Lagen yr = Y − 56. Der OSM-Umriss (w167273908, 7.280 Zellen) besteht aus 14
// Teilgebäuden (building:part), die im Rahmen alle achsparallel sind: Fassade g, Schiff k (mit Vierung und Presbyterium),
// linkes Querhaus j, Sakristei e, rechte Kapelle n, Chor h und i sowie der Konvent (m = Cenacolo-Trakt, f, c, l, d, b).
// Der Campanile (building:part w478272187) liegt links der Fassade am Schiff.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 56;
const Y = (yr) => BODEN_Y + yr;

// ------------------------------------------------------------------ Teile des Umrisses (Rechtecke im Rahmen OG, aus den OSM-Teilen gemessen)
const TEILE = [
  { id: 'k', kat: 'kirche', u: [0, 86.5], w: [0, 31] },              // Schiff mit Vierung und Presbyterium
  { id: 'j', kat: 'kirche', u: [46.8, 69.4], w: [-26.4, 0] },        // linkes Querhaus
  { id: 'e', kat: 'kirche', u: [68.4, 86.3], w: [-27.3, 0] },        // Sakristei
  { id: 'n', kat: 'kirche', u: [71.8, 98], w: [30, 44] },            // rechte Kapelle (S. Pietro d'Alcantara)
  { id: 'h', kat: 'kirche', u: [86.5, 99], w: [5, 23.4] },           // Chor hinter dem Hochaltar
  { id: 'i', kat: 'kirche', u: [87, 97], w: [23, 30] },              // Nebenraum am Chor
  { id: 'b', kat: 'konvent', u: [86.3, 98.5], w: [-0.6, 5.3] },
  { id: 'd', kat: 'konvent', u: [96.8, 124], w: [2.7, 26.6] },
  { id: 'c', kat: 'konvent', u: [70, 103.4], w: [43.7, 62.5] },
  { id: 'l', kat: 'konvent', u: [69.8, 87.7], w: [62, 76.3] },
  { id: 'f', kat: 'konvent', u: [54.4, 71.8], w: [43.5, 66.2] },
  { id: 'm', kat: 'konvent', u: [-5, 60.8], w: [31, 46.2] },         // Cenacolo-Trakt an der Borgo Ognissanti
  { id: 'g', kat: 'kirche', u: [-5, 1], w: [0, 31] }                 // Fassadenstreifen (gehört zum Raum des Schiffs)
];
const RAUM = (id) => (id === 'g' ? 'k' : id);
const OG_TEILE = ['m', 'f', 'c', 'd'];                              // Teile mit Obergeschoss (Wendeltreppe 5 × 5)
const TURM = { rect: { u0: 59.8, u1: 72.8, w0: 29.3, w1: 44.8 }, glocke0: 44, glocke1: 54, spitze0: 55, top: 60 };
const EG = { decke: 13, og: 25 };                                   // Konvent: Decke EG (= Boden OG) Lage 13, Decke OG Lage 25

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), rustika: WZ.typ('pietra_forte_rustika'), mauer: WZ.typ('mauerwerk'),
  serena: WZ.typ('pietra_serena'), putz: WZ.typ('putz_weiss'), ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'),
  weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), gold: WZ.typ('gold'), sand: WZ.typ('putz_sand'),
  terrakotta: WZ.typ('putz_rosa'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), bronze: WZ.typ('bronze'), travertin: WZ.typ('putz_sand'), marmor_ornament: WZ.typ('marmor_ornament')
};
const FR = (n) => WZ.fresko(n);
const GLAS = PAL.typesForRole('glas');
const glas = (a, b) => GLAS[Math.abs(a * 5 + b * 3) % GLAS.length];

// ------------------------------------------------------------------ Laden
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt, C = masken.masken.campanile;
  const tk = new Set(C.cells.map(([x, z]) => P.ck(x, z)));
  const cells = [];
  for (const [x, z] of H.cells) {
    if (tk.has(P.ck(x, z))) continue;
    const l = R.toLocal(x, z);
    cells.push({ x, z, u: l.u, w: l.w, dOut: H.d8(x, z), gt: GRUND.groundTopY(x, z), wo: 'kirche' });
  }
  const camp = C.cells.map(([x, z]) => { const l = R.toLocal(x, z); return { x, z, u: l.u, w: l.w, d8: C.d8(x, z), gt: GRUND.groundTopY(x, z), wo: 'campanile', zone: 'campanile' }; });
  const byKey = new Map();
  for (const c of cells) byKey.set(P.ck(c.x, c.z), c);
  for (const c of camp) byKey.set(P.ck(c.x, c.z), c);
  // Teil und Raum: erstes passendes Rechteck, sonst das nächste
  const abst = (t, c) => Math.hypot(Math.max(t.u[0] - c.u, 0, c.u - t.u[1]), Math.max(t.w[0] - c.w, 0, c.w - t.w[1]));
  for (const c of cells) {
    let best = null, bd = Infinity;
    for (const t of TEILE) { const d = abst(t, c); if (d < bd - 1e-9) { bd = d; best = t; } }
    c.teil = best.id; c.raum = RAUM(best.id); c.kat = best.kat;
  }
  // dPart: Abstand (Chebyshev) zur nächsten Zelle eines anderen Raums oder außerhalb der Maske (Turmzellen zählen nicht)
  let q = [];
  for (const c of cells) {
    c.dPart = Infinity;
    for (let dx = -1; dx <= 1 && c.dPart !== 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      if (!dx && !dz) continue;
      const k = P.ck(c.x + dx, c.z + dz);
      if (tk.has(k)) continue;
      const n = byKey.get(k);
      if (!n || n.raum !== c.raum) { c.dPart = 1; break; }
    }
    if (c.dPart === 1) q.push(c);
  }
  for (let d = 1; q.length; d++) {
    const nq = [];
    for (const c of q) for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const n = byKey.get(P.ck(c.x + dx, c.z + dz));
      if (n && n.raum === c.raum && n.wo === 'kirche' && n.dPart === Infinity) { n.dPart = d + 1; nq.push(n); }
    }
    q = nq;
  }
  for (const c of cells) c.wand = c.dOut <= 2 || c.dPart <= 1;
  L = { json, masken, R, H, C, cells, camp, alle: cells.concat(camp), byKey, tk };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);
const ell = (t) => Math.sqrt(Math.max(0, 1 - Math.min(1, t * t)));

const A = (c) => Math.abs(c.w - 15.5);                          // Abstand zur Schiffsachse
const FASSADE_U = -2.2;                                         // Fassadenwand: u < −2,2 im Streifen g
const istFassade = (c) => c.teil === 'g' && c.u < FASSADE_U;
function fassadeHoehe(c) { return 34 + Math.round(10 * ell(Math.abs(c.w - 16.4) / 16.5)); }
// Gewölbe/Decke einer Zelle (Lage der obersten Deckenzelle), null = keine Decke hier
function decke(c) {
  switch (c.teil) {
    case 'k': case 'g': return 20 + Math.floor(8 * ell(A(c) / 13.5));
    case 'j': return 20 + Math.floor(8 * ell(Math.abs(c.u - 58.1) / 11.3));
    case 'n': return 22;
    case 'h': return 24;
    case 'i': case 'e': return 22;
    case 'b': return 20;
    case 'l': return 22;
    default: return OG_TEILE.includes(c.teil) ? EG.og : null;
  }
}
function dach(c) {
  switch (c.teil) {
    case 'g': if (istFassade(c)) return fassadeHoehe(c);
    // fall through
    case 'k': return Math.round(38 - 8 * Math.min(1, A(c) / 15.5));
    case 'j': return Math.round(36 - 6 * Math.min(1, Math.abs(c.u - 58.1) / 11.5));
    case 'n': return Math.round(31 - 3 * Math.min(1, Math.abs(c.w - 37) / 7));
    case 'h': return Math.round(31 - 3 * Math.min(1, Math.abs(c.w - 14.2) / 9.5));
    case 'i': return 29;
    case 'e': return 28;
    case 'b': return 26;
    case 'm': return Math.round(33 - 5 * Math.min(1, Math.abs(c.w - 38.6) / 8.3));
    case 'f': return Math.round(33 - 5 * Math.min(1, Math.abs(c.u - 63.1) / 9));
    case 'c': return Math.round(33 - 5 * Math.min(1, Math.abs(c.w - 53.1) / 9.5));
    case 'd': return Math.round(33 - 5 * Math.min(1, Math.abs(c.w - 14.65) / 12.2));
    case 'l': return Math.round(32 - 4 * Math.min(1, Math.abs(c.w - 69.15) / 7.2));
    default: return null;
  }
}

// ------------------------------------------------------------------ Öffnungen (Türen, Bögen) als Rechtecke im Rahmen
// { u: [u0, u1], w: [w0, w1], h (Lagen), art, bogen (Scheitel über h), name }; die Zellen müssen Wandzellen sein
const OEFFNUNGEN = [
  { name: 'portal', art: 'tor', u: [-6, 1.2], w: [13, 19.8], h: 8, bogen: { m: 16.4, a: 3.4 }, achse: 'w', teil: 'fassade' },
  { name: 'cenacolo_tuer', art: 'tuer', u: [-6, 1.2], w: [36.8, 40.4], h: 7, teil: 'konvent_waende' },
  { name: 'm_f', art: 'tuer', u: [55.6, 58.8], w: [43.5, 48], h: 6, teil: 'konvent_waende' },
  { name: 'f_c', art: 'tuer', u: [69, 73.4], w: [53.2, 56.6], h: 6, teil: 'konvent_waende' },
  { name: 'c_l', art: 'tuer', u: [78, 81.4], w: [60.5, 64.8], h: 6, teil: 'konvent_waende' },
  { name: 'c_n', art: 'tuer', u: [84, 87.4], w: [42, 46], h: 6, teil: 'konvent_waende' },
  { name: 'h_d', art: 'tuer', u: [96.5, 100.5], w: [12.6, 16], h: 6, teil: 'konvent_waende' },
  { name: 'h_b', art: 'tuer', u: [92, 95.4], w: [3.5, 7], h: 6, teil: 'konvent_waende' },
  { name: 'h_i', art: 'tuer', u: [91, 94.4], w: [21.5, 25.3], h: 6, teil: 'konvent_waende' },
  { name: 'i_n', art: 'tuer', u: [91, 94.4], w: [28.5, 32.4], h: 6, teil: 'konvent_waende' },
  { name: 'schiff_j', art: 'loggia', u: [50, 66], w: [-2.6, 2.6], h: 14, bogen: { m: 58, a: 8, hoch: 4 }, achse: 'u', teil: 'querhaus_bogen' },
  { name: 'schiff_n', art: 'loggia', u: [74, 85], w: [28.4, 32.6], h: 12, bogen: { m: 79.5, a: 5.5, hoch: 3 }, achse: 'u', teil: 'querhaus_bogen' },
  { name: 'schiff_e', art: 'tuer', u: [76.2, 79.8], w: [-2.6, 2.6], h: 8, teil: 'querhaus_bogen' },
  { name: 'chor_t1', art: 'tuer', u: [85, 88.4], w: [8.4, 11.8], h: 8, teil: 'querhaus_bogen' },
  { name: 'chor_t2', art: 'tuer', u: [85, 88.4], w: [17.2, 20.6], h: 8, teil: 'querhaus_bogen' }
];

// ------------------------------------------------------------------ Bilder (Farbfelder)
const FARBEN = { H: 'hellblau', B: 'blau', G: 'gelb', O: 'orange', R: 'rot', N: 'gruen', K: 'braun', W: 'weiss', S: 'schwarz' };

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
  const istFrei = (x, y, z) => luft.has(key(x, y, z));
  const oeff = new Map();
  const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); frei(x, y, z); };
  const unz = new Map();
  const unzug = (p, b, x, y, z) => { const k = p + '|' + b; if (!unz.has(k)) unz.set(k, []); unz.get(k).push({ x, y, z }); };
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const N8 = N4.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
  const umteil = (x, y, z, t, p) => {
    const k = key(x, y, z), e = zellen.get(k);
    if (!e) return false;
    teile.set(e.p, teile.get(e.p).filter((q) => q !== k));
    e.t = t; e.p = p;
    let a = teile.get(p); if (!a) teile.set(p, a = []); a.push(k);
    return true;
  };
  const verschiebe = (k, p) => { const e = zellen.get(k); teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.p = p; let a = teile.get(p); if (!a) teile.set(p, a = []); a.push(k); };

  const D_ = new Map();
  for (const c of D.cells) D_.set(P.ck(c.x, c.z), dach(c));
  const dachBei = (x, z) => D_.get(P.ck(x, z));
  const infos = { stiegen: [] };

  // ---- Öffnungen: Türen, Portal und Bögen (Wandzellen im Rechteck, Höhe h über dem Boden, Rundbogen optional)
  for (const o of OEFFNUNGEN) {
    for (const c of D.cells) {
      if (!c.wand || c.u < o.u[0] || c.u >= o.u[1] || c.w < o.w[0] || c.w >= o.w[1]) continue;
      let top = o.h;
      if (o.bogen) { const x = (o.achse === 'u' ? c.u : c.w) - o.bogen.m; top = o.h + (o.bogen.hoch ? Math.floor(o.bogen.hoch * ell(x / o.bogen.a)) : Math.max(0, rund(0, x, o.bogen.a))); if (Math.abs(x) >= o.bogen.a) continue; }
      for (let yr = 1; yr <= top; yr++) oeffnung(o.art, o.teil, c.x, Y(yr), c.z);
    }
  }

  // ---- Campanile (13./14. Jh.): Tür vom Schiff, Wendeltreppe 5 × 5, Glockenstube, Pyramidendach
  const camp = WZ.campanile.baueCampanile({
    cells: D.camp, set, frei, istFrei, hat, oeffnung, unzug, Y, zellen, teile, key,
    T: { wand: T.mauer, sockel: T.rustika, gesims: T.serena, dach: T.ziegel, spitze: T.bronze, holz: T.holz, glocke: T.bronze, fenster: T.fenster, licht: T.licht }
  }, {
    rect: TURM.rect, top: TURM.top, glocke0: TURM.glocke0, glocke1: TURM.glocke1, spitze0: TURM.spitze0, abschluss: 'pyramide', sockel: 0,
    gesimse: [14, 28, TURM.glocke0 - 1], schlitze: { periode: 14, a: 6, b: 8, bis: TURM.glocke0 - 4 }, bogen: { anzahl: 1, breite: 4 }, kleineGlocken: 1, lichtAbstand: 8,
    zugang: { u: 66, w: TURM.rect.w0 }
  });
  infos.camp = camp;

  // ---- Modul 0: Fundament und Boden
  for (const c of D.alle) for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
  for (const c of D.alle) {
    let t = T.terrakotta;
    if (c.wo === 'campanile') t = T.bruch;
    else if (c.raum === 'k') t = ((Math.floor(c.u / 3) + Math.floor((c.w + 60) / 3)) % 2) ? T.serena : T.weiss;
    else if (c.raum === 'h' || c.raum === 'j') t = ((Math.floor(c.u / 2) + Math.floor((c.w + 60) / 2)) % 2) ? T.terrakotta : T.weiss;
    set(c.x, Y(0), c.z, t, 'boden');
  }

  // ---- Modul 1: Fassade, Außenwände der Kirche und des Konvents (Fenster)
  const fensterKirche = (c, yr) => {
    if (istFassade(c)) {
      const af = Math.abs(c.w - 16.4);
      if (af < 3.4 && yr >= 26 && yr <= 32) return true;                                   // Fenster über dem Portal
      return false;
    }
    if (c.teil === 'k' && c.w < 4 && c.dOut <= 2) { const dx = ((c.u + 4) % 8) - 4; return Math.abs(dx) < 1.6 && yr >= 20 && yr <= 21 + Math.round(5 * ell(dx / 1.7)); }   // Schiff: hohe Rundbogenfenster in der Nordwestwand
    if (c.teil === 'h' && c.dOut <= 2) { return yr >= 12 && yr <= 18 && (Math.abs(c.u - 93) < 1.4) && c.dOut <= 2; }
    return false;
  };
  const fensterKonvent = (c, yr) => {
    if (c.dOut > 2) return false;
    const s = Math.round(c.u + c.w);
    if (((s % 7) + 7) % 7 > 1) return false;
    return (yr >= 4 && yr <= 9) || (OG_TEILE.includes(c.teil) && yr >= 17 && yr <= 22);
  };
  for (const c of D.cells) {
    if (!c.wand) continue;
    const top = dachBei(c.x, c.z); if (top == null) continue;
    const kirche = c.kat === 'kirche';
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || istFrei(c.x, Y(yr), c.z)) continue;
      const fe = kirche ? fensterKirche(c, yr) : fensterKonvent(c, yr);
      if (fe) { set(c.x, Y(yr), c.z, glas(Math.round(c.u), yr), 'fenster'); continue; }
      let t = c.dOut <= 1 ? T.sand : T.putz;
      let p = kirche ? 'aussenwaende' : 'konvent_waende';
      if (istFassade(c)) {
        p = 'fassade';
        const af = Math.abs(c.w - 16.4), ra = Math.round(c.w);
        t = T.travertin;
        if (yr === 20 || yr === 21 || yr === 34 || yr === top - 1) t = T.serena;                           // Gebälke
        else if ((ra % 7 === 0 || ra % 7 === 1) && c.dOut <= 1 && yr >= 2 && yr <= 33 && af > 4) t = T.serena;      // Pilaster
        else if (af < 1.4 && yr >= 36 && yr <= 40) t = T.weiss;                                          // Wappenfeld im Giebel
      } else if (c.dOut <= 1 && yr <= 2) t = T.serena;
      set(c.x, Y(yr), c.z, t, p);
    }
  }

  // ---- Modul 2: Innenwände des Konvents (Erdgeschoss: Cenacolo-Saal | Treppenraum)
  const MTR = 46.5;                                                  // Trennwand im Trakt m zwischen Cenacolo-Saal und Treppenraum
  for (const c of D.cells) {
    if (c.teil !== 'm' || c.wand || c.u < MTR - 1 || c.u >= MTR + 1) continue;
    for (let yr = 1; yr < EG.decke; yr++) {
      if (hat(c.x, Y(yr), c.z) || istFrei(c.x, Y(yr), c.z)) continue;
      if (c.w >= 37.6 && c.w < 41.6 && yr <= 7) continue;           // Durchgang 4 × 7
      set(c.x, Y(yr), c.z, T.putz, 'konvent_waende');
    }
  }
  for (const c of D.cells) {                                         // Durchgang in der Trennwand deklarieren
    if (c.teil === 'm' && !c.wand && c.u >= MTR - 1 && c.u < MTR + 1 && c.w >= 37.6 && c.w < 41.6) for (let yr = 1; yr <= 7; yr++) oeffnung('tuer', 'konvent_waende', c.x, Y(yr), c.z);
  }

  // ---- Wendeltreppen im Konvent (Obergeschoss): 5 × 5 freie Fläche mit Zugang je Trakt, Spirale 5 × 5 bis zum Boden des Obergeschosses
  const stiegPraef = { m: [53, 38.6], f: [63, 55], c: [92, 53], d: [112, 15] };
  const innen = (c) => !c.wand && c.dOut > 2;
  for (const id of OG_TEILE) {
    const cand = D.cells.filter((c) => c.teil === id && innen(c) && (id !== 'm' || (c.u > MTR + 2.5)));
    const set7 = new Set(cand.map((c) => P.ck(c.x, c.z)));
    let best = null, bd = Infinity;
    for (const c of cand) {
      let ok = true;
      for (let dx = -2; dx <= 2 && ok; dx++) for (let dz = -2; dz <= 2; dz++) if (!set7.has(P.ck(c.x + dx, c.z + dz))) { ok = false; break; }
      if (!ok) continue;
      // Zugang zum Startpodest (Nordwestecke): zwei freie Zellen westlich oder nördlich davon
      const zugW = set7.has(P.ck(c.x - 3, c.z - 2)) && set7.has(P.ck(c.x - 3, c.z - 1)), zugN = set7.has(P.ck(c.x - 2, c.z - 3)) && set7.has(P.ck(c.x - 1, c.z - 3));
      if (!zugW && !zugN) continue;
      const d = Math.hypot(c.u - stiegPraef[id][0], c.w - stiegPraef[id][1]);
      if (d < bd) { bd = d; best = c; }
    }
    if (!best) throw new Error('Wendeltreppe: kein Platz in Trakt ' + id);
    const tr = WZ.treppe.wendeltreppe({ mitte: { x: best.x, z: best.z }, radiusInnen: 0, radiusAussen: 2, yVon: Y(0), yBis: Y(EG.decke), rolle: 'pietra_serena', drehsinn: 'rechts' });
    const trKeys = new Set([...tr].map((b) => key(b.x, b.y, b.z)));
    for (const l of WZ.treppe.treppenloch(tr.lauf, 3)) frei(l.x, l.y, l.z);
    for (const b of tr) if (b.y >= Y(EG.decke) - 3 && b.y < Y(EG.decke)) for (let h = 1; h <= 3; h++) if (!trKeys.has(key(b.x, b.y + h, b.z))) frei(b.x, b.y + h, b.z);
    for (const b of tr) if (b.y > Y(0)) set(b.x, b.y, b.z, b.typ, 'konvent_treppen', true);
    infos.stiegen.push({ teil: id, x: best.x, z: best.z });
  }

  // ---- Modul 3: Decken, Gewölbe, Dächer; Dachräume unzugänglich
  for (const c of D.cells) {
    if (c.wand) continue;
    const dk = decke(c), top = dachBei(c.x, c.z);
    if (dk == null || top == null) continue;
    const og = OG_TEILE.includes(c.teil);
    let lo = dk;
    if (!og) for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); if (n && n.wo === 'kirche' && !n.wand && !OG_TEILE.includes(n.teil)) { const nd = decke(n); if (nd != null && nd < lo) lo = nd; } }
    let nbDach = Infinity;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < nbDach) nbDach = n; }
    if (og) {                                                       // Decke des Erdgeschosses (Boden des Obergeschosses) und Decke des Obergeschosses
      if (!hat(c.x, Y(EG.decke), c.z) && !istFrei(c.x, Y(EG.decke), c.z)) set(c.x, Y(EG.decke), c.z, T.holz, 'konvent_decken');
      if (!hat(c.x, Y(EG.og), c.z) && !istFrei(c.x, Y(EG.og), c.z)) set(c.x, Y(EG.og), c.z, T.putz, 'konvent_decken');
    } else {
      for (let yr = lo; yr <= dk; yr++) if (!hat(c.x, Y(yr), c.z) && !istFrei(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, yr > nbDach ? T.mauer : T.putz, 'gewoelbe');
    }
    for (let yr = dk + 1; yr < top; yr++) if (!hat(c.x, Y(yr), c.z) && !istFrei(c.x, Y(yr), c.z)) unzug('daecher', 'Dachraum über Gewölben und Decken (ohne Zugang)', c.x, Y(yr), c.z);
  }
  for (const c of D.cells) {
    const top = dachBei(c.x, c.z);
    if (top == null || istFassade(c)) continue;
    let lo = top;
    for (const [dx, dz] of N8) { const n = zelleBei(c.x + dx, c.z + dz); const nd = n && n.wo === 'kirche' && !istFassade(n) ? dachBei(c.x + dx, c.z + dz) : null; if (nd != null && nd < lo) lo = nd; }
    for (let yr = lo; yr <= top; yr++) if (!hat(c.x, Y(yr), c.z) && !istFrei(c.x, Y(yr), c.z)) set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.mauer, yr >= top - 1 ? 'daecher' : 'schildwaende');
  }

  // ---- Modul 6/7: Ausstattung nach Quellen (Katalog §3), vereinfacht in vollen Blöcken
  const innenNb = (c, raum) => N4.some(([dx, dz]) => { const n = zelleBei(c.x + dx, c.z + dz); return n && n.wo === 'kirche' && n.raum === raum && !n.wand; });
  // Farbfeld auf der Innenseite einer Wand (Zellen der Wandlage, die an den Innenraum `raum` grenzen); Goldrahmen rundum
  const bild = (o) => {
    const { achse, ebene, s0, s1, y0, muster, teil, raum, tol } = o;
    const zeilen = muster.length, spalten = muster[0].length;
    let n = 0;
    for (const c of D.cells) {
      if (!c.wand || (raum && !innenNb(c, raum))) continue;
      const pl = achse === 'w' ? c.w : c.u, s = achse === 'w' ? c.u : c.w;
      if (Math.abs(pl - ebene) > (tol || 1.3) || s < s0 || s >= s1) continue;
      const col = Math.min(spalten - 1, Math.floor((s - s0) / (s1 - s0) * spalten));
      for (let yr = y0; yr < y0 + zeilen + 2; yr++) {
        const ry = yr - y0 - 1;
        let t;
        if (ry < 0 || ry >= zeilen || col === 0 || col === spalten - 1) t = o.ohneRahmen ? null : T.gold;
        else { const ch = muster[zeilen - 1 - ry][col]; t = ch === '.' ? null : ch === 'g' ? T.gold : ch === 'h' ? T.holz : FR(FARBEN[ch]); }
        if (t == null) continue;
        const e = zellen.get(key(c.x, Y(yr), c.z));
        if (!e || (e.p !== 'aussenwaende' && e.p !== 'fassade' && e.p !== 'konvent_waende')) continue;
        if (umteil(c.x, Y(yr), c.z, t, teil)) n++;
      }
    }
    return n;
  };
  // freie Innenzellen eines Raums in einem Rechteck (Rahmen OG) -> Liste
  const frei2 = (raeume, u0, u1, w0, w1) => D.cells.filter((c) => !c.wand && raeume.includes(c.raum) && c.u >= u0 && c.u < u1 && c.w >= w0 && c.w < w1);
  const quader = (liste, y0, y1, t, p) => { for (const c of liste) for (let yr = y0; yr <= y1; yr++) set(c.x, Y(yr), c.z, typeof t === 'function' ? t(yr, c) : t, p); };

  // Kirche: Seitenaltäre (sechs je Seite), Beichtstuhl, Gemälde
  const ALTAR_U = [5.5, 12.7, 19.9, 27.1, 34.3, 41.5];
  for (const uc of ALTAR_U) {
    for (const seite of [-1, 1]) {
      const l = D.cells.filter((c) => !c.wand && c.raum === 'k' && c.dPart <= 3 && Math.abs(c.u - uc) < 2.5 && (seite < 0 ? c.w < 15.5 : c.w > 15.5) && c.u > 2.5 && c.u < 46);
      quader(l, 1, 2, T.weiss, 'seitenaltaere');
      quader(l, 3, 3, T.gold, 'seitenaltaere');
    }
  }
  quader(frei2(['k'], 22, 25, 27, 30).filter((c) => c.dPart <= 3), 1, 1, T.holz, 'beichtstuhl');           // Beichtstuhl unter Botticellis Augustinus
  bild({ achse: 'w', ebene: 30.2, s0: 8.2, s1: 17.2, y0: 5, muster: ['HHHHHGHHHHH', 'HHHHBBBHHHH', 'HHHBWWWBHHH', 'HHBBWWWBBHH', 'HBBBBWBBBBH', 'BBBBBBBBBBB', 'BKRBBBBBRKB', 'BKRBBBBBRKB', 'NKRNBBBNRKN', 'NNNNNNNNNNN'], teil: 'vespucci_misericordia', raum: 'k' });
  bild({ achse: 'w', ebene: 30.2, s0: 20.4, s1: 27.6, y0: 6, muster: ['GGGGGGGG', 'GGWWGGKG', 'GOOOWGKG', 'GOROOGKG', 'GKKKKKKG', 'GKGGGGKG'], teil: 'botticelli_augustinus', raum: 'k' });
  bild({ achse: 'w', ebene: 1.2, s0: 20.4, s1: 27.6, y0: 6, muster: ['GGGGGGGG', 'GGRRGGKG', 'GRRRRGKG', 'GRWRRGKG', 'GKKKKKKG', 'GKGGGGKG'], teil: 'ghirlandaio_hieronymus', raum: 'k' });
  // linkes Querhaus: Giottos Kruzifix an der Stirnwand, Saio-Reliquiar
  bild({ achse: 'w', ebene: -23.6, s0: 54.6, s1: 61.6, y0: 5, muster: ['GGGKGGG', 'GGGKGGG', 'GGGKGGG', 'GKKKKKG', 'GGGKGGG', 'GGGKGGG', 'GGGKGGG', 'GGGKGGG', 'GGKKKGG', 'GGKKKGG'], teil: 'giotto_kruzifix', raum: 'j' });
  {
    const vit = frei2(['j'], 64.4, 67, -22.6, -20.8);
    quader(vit, 1, 2, T.serena, 'saio_reliquiar');
    quader(vit, 3, 5, (yr) => (yr === 5 ? T.gold : T.fenster), 'saio_reliquiar');
    quader(vit.filter((c) => Math.abs(c.u - 65.7) < 0.9 && Math.abs(c.w + 21.7) < 0.9), 3, 4, FR('braun'), 'saio_reliquiar');
  }
  // rechte Kapelle: Grabplatte Botticellis im Boden (Scheibe mit dem Wappen der Filipepi)
  for (const c of D.cells) {
    if (c.raum !== 'n' || c.wand) continue;
    const r = Math.hypot(c.u - 85, c.w - 37);
    if (r < 2.6) umteil(c.x, Y(0), c.z, r < 1.1 ? FR('rot') : r < 2 ? T.weiss : T.gold, 'botticelli_grabplatte');
  }
  // Hochaltar (Pietra dura, Ligorio) vor der Chorwand, Bild am Gewölbe (1770)
  {
    const alt = frei2(['k'], 82.4, 85.4, 12.6, 18.4);
    quader(alt, 1, 3, (yr, c) => (yr === 3 ? T.gold : ((Math.floor(c.u + c.w) % 2) ? T.marmor_ornament : T.weiss)), 'hochaltar_ligorio');
    quader(alt.filter((c) => Math.abs(c.u - 84) < 1.2 && Math.abs(c.w - 15.5) < 1.5), 4, 7, (yr) => (yr === 7 ? T.gold : T.ornament), 'hochaltar_ligorio');
  }
  for (const c of D.cells) {
    if (c.raum !== 'k' || c.wand || c.u < 69 || c.u > 85) continue;
    const dk = decke(c);
    const e = zellen.get(key(c.x, Y(dk), c.z));
    if (!e || e.p !== 'gewoelbe') continue;
    const r = Math.hypot((c.u - 77) / 8, (c.w - 15.5) / 11);
    if (r < 1) umteil(c.x, Y(dk), c.z, r < 0.25 ? T.gold : ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) % 3 === 0 ? FR('weiss') : FR('hellblau')), 'apsis_fresko');
  }
  // Veit Stoss: Holzkruzifix über der Sakristeitür
  bild({ achse: 'w', ebene: 1.0, s0: 76.2, s1: 79.8, y0: 10, muster: ['.h.', 'hhh', '.h.', '.h.', '.h.'], teil: 'veit_stoss_kruzifix', raum: 'k', ohneRahmen: true });
  // Portal: Lünette von Buglioni (glasierte Terrakotta, Krönung der Jungfrau) über der Tür
  for (const c of D.cells) {
    if (!istFassade(c)) continue;
    for (let yr = 13; yr <= 18; yr++) {
      const r = Math.hypot(c.w - 16.4, yr - 12.6);
      if (r > 5 || !zellen.has(key(c.x, Y(yr), c.z))) continue;
      const t = r > 4.2 ? T.gold : (Math.abs(c.w - 16.4) < 0.9 && yr <= 17 ? FR('weiss') : (Math.abs(c.w - 16.4) < 2.6 && yr >= 14 && yr <= 17 && (yr + Math.round(c.w)) % 2 === 0) ? FR('weiss') : FR('blau'));
      umteil(c.x, Y(yr), c.z, t, 'lunette_buglioni');
    }
  }

  // Konvent: Cenacolo (Ghirlandaio 1480, 400 × 810 cm = 8 × 16 Blöcke) an der Langwand des Saals, Sinopia an der Trennwand, zwei Romei-Fresken
  bild({ achse: 'w', ebene: 31.7, s0: 14, s1: 30.4, y0: 3, muster: [
    'WNNHHBNNHHNNBHHW', 'WNNHHBNNHHNNBHHW', 'GGGGGGGGGGGGGGGG', 'GOWRBKWGWBRWKBOG', 'GKWNOKRWWRKOWNKG', 'GKKKKKKKKKKKKKKG', 'GWWWWWWWWWWWWWWG', 'KKKKKKKKKKKKKKKK'
  ], teil: 'cenacolo_fresko', raum: 'm', tol: 1.6 });
  bild({ achse: 'u', ebene: 45.8, s0: 36.4, s1: 42.4, y0: 4, muster: ['KKOOKK', 'KOOKOK', 'OKKOKO', 'KOKKOK'], teil: 'cenacolo_sinopia', raum: 'm' });
  bild({ achse: 'w', ebene: 31.7, s0: 32.4, s1: 36.4, y0: 4, muster: ['HHHH', 'BBBB', 'NNNN', 'KKKK'], teil: 'romei_fresken', raum: 'm', tol: 1.6 });
  bild({ achse: 'w', ebene: 31.7, s0: 37.4, s1: 41.4, y0: 4, muster: ['HHHH', 'WBBW', 'NNNN', 'KKKK'], teil: 'romei_fresken', raum: 'm', tol: 1.6 });

  // ---- Modul 5: Licht
  const steh = [];
  for (const c of D.cells) {
    const b = zellen.get(key(c.x, Y(0), c.z));
    if (b && b.p === 'boden' && !hat(c.x, Y(1), c.z) && !hat(c.x, Y(2), c.z) && !istFrei(c.x, Y(1), c.z)) steh.push({ x: c.x, y: Y(1), z: c.z });
    if (OG_TEILE.includes(c.teil) && !c.wand) { const o = zellen.get(key(c.x, Y(EG.decke), c.z)); if (o && o.p === 'konvent_decken' && !hat(c.x, Y(EG.decke + 1), c.z) && !hat(c.x, Y(EG.decke + 2), c.z)) steh.push({ x: c.x, y: Y(EG.decke + 1), z: c.z }); }
  }
  const lt = [];
  for (const l of WZ.lichtRaster(steh, { abstand: 12 })) {
    const k = key(l.x, l.y, l.z); const e = zellen.get(k); if (!e) continue;
    teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = 'licht'; lt.push(k);
  }
  teile.set('licht', lt);

  PLAN = { zellen, teile, oeff, unz, infos };
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
        const cells = keys.map((k) => Pl.zellen.get(k));
        if (cells.length) {
          const typ = new Map(cells.map((c) => [c.x + ',' + c.y + ',' + c.z, c.t]));
          ctx.part(id).fill(cells, (x, y, z) => typ.get(x + ',' + y + ',' + z));
        }
        for (const [k, z] of Pl.oeff) { const [art, pp] = k.split('|'); if ((OEFF_TEIL[pp] || pp) === id) ctx.oeffnung(z, art); }
        for (const [k, z] of Pl.unz) { const i = k.indexOf('|'); if (k.slice(0, i) === id) ctx.unzugaenglich(z, k.slice(i + 1)); }
      }
    }
  };
}

module.exports = { modul, lade, plan, zelleBei, decke, dach, istFassade, Y, BODEN_Y, T, TEILE, TURM, EG, OEFFNUNGEN, OG_TEILE };
