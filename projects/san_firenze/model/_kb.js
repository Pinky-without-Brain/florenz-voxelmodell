'use strict';
// Kirche San Filippo Neri und Oratorium (Sala della Musica) des Complesso di San Firenze (Katalog: 20_Stadtmodell_Florenz/
// wahrzeichen/san_firenze/). Zwei Zusatzmasken des Projekts (Palast: _sf.js mit tools/wahrzeichen/palazzo.js), ein Bauplan für
// Rohbau (Module 6, 7), Licht (8) und Ausstattung (9, 10); erste Setzung gewinnt.
// Rahmen SF (theta −75,2°): u entlang der Fassade zur Piazza San Firenze (Süd → Nord), w von der Fassade nach Osten.
// Lagen yr = Y − 62. Kirche: einschiffig, Tonnengewölbe, drei Kapellen je Seite, Presbyterium, Apsis, Sakramentskapelle
// (Kuppel) auf der Südseite. Oratorium: Vestibül mit Treppe, Saal mit Emporen auf Säulen.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
const BODEN_Y = PJ.bodenY;
const Y = (yr) => BODEN_Y + yr;

// ------------------------------------------------------------------ Maße (Referenzmaße; Stufe C, soweit nicht anders vermerkt)
const K = {                                           // Kirche: Umriss u 75,4..108,2, w 0..81 (OSM)
  u0: 75.4, u1: 108.2, nc: 91.8, nh: 7.5,             // Mittelschiff u 84,3..99,3 (15 breit)
  bandS: [82.3, 84.3], bandN: [99.3, 101.3],          // Arkadenwände (2 dick)
  kapEnde: 60, presbEnde: 70, apsisR: 7.5,            // Kapellen bis w 60, Presbyterium w 60..70, Apsis w 70..77,5
  kapellen: [[2.5, 21], [23, 41], [43, 60]],          // drei Kapellen je Seite (6 Altarbilder nach it.wikipedia)
  ansatz: 14, stich: 9,                               // Tonnengewölbe: Ansatz Lage 14, Stich 9 (Scheitel Lage 23)
  sak: { u: 66.9, w: 53.3, r: 6.8, u1: 75.4, w0: 43.5 }  // Sakramentskapelle (Kuppel) im südlichen Anbau u 56,3..75,4, w 44..62
};
const O = { u0: 0, u1: 33.5, mitte: 16.7, vest: [2.5, 11], wand: [11, 13], emporeY: 8, decke: 17, gal: [8.5, 25], rueck: 50 };

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'), serena: WZ.typ('pietra_serena'),
  putz: WZ.typ('putz_weiss'), sand: WZ.typ('putz_sand'), ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'),
  gold: WZ.typ('gold'), weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), gruen: WZ.typ('marmor_gruen'), rot: WZ.typ('marmor_rot'),
  dunkel: WZ.typ('kontrast_dunkel'), bronze: WZ.typ('bronze'), pflaster: WZ.typ('pflaster'), terrakotta: WZ.typ('putz_rosa'),
  licht: WZ.typ('licht'), saeule: WZ.typ('marmor_saeule'), glas: WZ.typ('glas_fenster')
};
const GLAS = PAL.typesForRole('glas');
const FR = (n) => WZ.fresko(n);
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);
const sq = (v) => Math.sqrt(Math.max(0, v));

// ------------------------------------------------------------------ Laden und Zonen
let L = null;
function lade() {
  if (L) return L;
  const masken = WZ.ladeMasken(PJ, { dir: DIR });
  const R = masken.rahmen;
  const mk = (M) => M.cells.map(([x, z]) => { const l = R.toLocal(x, z); return { x, z, u: l.u, w: l.w, d8: M.d8(x, z), gt: GRUND.groundTopY(x, z) }; });
  const kirche = mk(masken.masken.kirche), orat = mk(masken.masken.oratorium);
  const kBy = new Map(), oBy = new Map();
  for (const c of kirche) { c.zone = kZone(c); kBy.set(P.ck(c.x, c.z), c); }
  for (const c of orat) { c.zone = oZone(c); oBy.set(P.ck(c.x, c.z), c); }
  L = { PJ, masken, R, kirche, orat, kBy, oBy };
  return L;
}

const kapIndex = (w) => (w < K.kapellen[0][1] + 1 ? 0 : w < K.kapellen[1][1] + 1 ? 1 : 2);
const rApsis = (c) => Math.hypot(c.u - K.nc, c.w - K.presbEnde);
function kZone(c) {
  const { u, w } = c;
  if (w < 2.5) return 'fassade';
  if (u < K.sak.u1 + 2 && w >= K.sak.w0) return u < K.sak.u1 ? 'sakr' : w < 61 ? 'sband' : 'masse';
  const kap = w < K.kapEnde;
  if (u < K.bandS[0]) return kap ? (w >= 21 && w < 23) || (w >= 41 && w < 43) ? 'kdiv' : 'kap' : 'masse';
  if (u < K.bandS[1]) return kap ? 'band' : 'masse';
  if (u < K.bandN[0]) {
    if (kap) return 'nave';
    if (w < K.presbEnde) return 'presb';
    return rApsis(c) < K.apsisR ? 'apsis' : 'masse';
  }
  if (u < K.bandN[1]) return kap ? 'band' : 'masse';
  return kap ? (w >= 21 && w < 23) || (w >= 41 && w < 43) ? 'kdiv' : 'kap' : 'masse';
}
const oZone = (c) => (c.w < O.vest[0] ? 'fassade' : c.w < O.vest[1] ? 'vest' : c.w < O.wand[1] ? 'vwand' : 'saal');

/** Höchster Block der Spalte (Dachhaut, Lage). */
function kTop(c) {
  switch (c.zone) {
    case 'fassade': return 26 + Math.round(7 * Math.max(0, 1 - Math.abs(c.u - K.nc) / 16.4));
    case 'nave': case 'presb': return 30 - Math.round(4 * Math.min(1, Math.abs(c.u - K.nc) / K.nh));
    case 'apsis': return 28 - Math.round(4 * Math.min(1, rApsis(c) / K.nh));
    case 'band': return 25;
    case 'kap': case 'kdiv': return 16 + Math.round(4 * Math.min(1, (c.u < K.nc ? c.u - K.u0 : K.u1 - c.u) / 6.9));
    case 'sakr': return 26;
    case 'sband': return 22;
    default: return 22;
  }
}
/** Erster massiver Block über der Luft (Gewölbe); null = massive Spalte ab Lage 1. */
function kDecke(c) {
  switch (c.zone) {
    case 'nave': case 'presb': return K.ansatz + Math.ceil(K.stich * sq(1 - ((c.u - K.nc) / K.nh) ** 2));
    case 'apsis': return K.ansatz + Math.ceil(K.stich * sq(1 - (rApsis(c) / K.nh) ** 2));
    case 'kap': { const [a, b] = K.kapellen[kapIndex(c.w)]; const d = (c.w - (a + b) / 2) / ((b - a) / 2 + 0.5); return 12 + Math.ceil(2 * sq(1 - d * d)); }
    case 'sakr': return 15 + Math.ceil(sq(K.sak.r ** 2 - Math.hypot(c.u - K.sak.u, c.w - K.sak.w) ** 2));
    default: return null;
  }
}
const oTop = (c) => (c.zone === 'fassade' ? 22 + Math.round(3 * Math.max(0, 1 - Math.abs(c.u - O.mitte) / 17)) : 23 - Math.round(3 * Math.min(1, Math.abs(c.u - O.mitte) / 15.5)));
const oDecke = (c) => (c.zone === 'vest' || c.zone === 'saal' ? O.decke : null);
const galU = (c) => c.u < O.gal[0] || c.u >= O.gal[1];
/** Emporenplatte (Lage 8): Vestibül, seitliche Emporen, Rückempore, Durchgänge in der Vestibülwand. */
const empore = (c) => c.d8 > 2 && (c.zone === 'vest' || (c.zone === 'vwand' && galU(c)) || (c.zone === 'saal' && (galU(c) || c.w >= O.rueck)));

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
  const ersetze = (x, y, z, t, p) => { const e = zellen.get(key(x, y, z)); if (!e) return false; e.t = t; e.p = p; return true; };
  const hat = (x, y, z) => zellen.has(key(x, y, z));
  const typBei = (x, y, z) => { const e = zellen.get(key(x, y, z)); return e ? e.t : null; };
  const frei = (x, y, z) => luft.add(key(x, y, z));
  const istFrei = (x, y, z) => luft.has(key(x, y, z));
  const oeff = new Map();
  const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); frei(x, y, z); };
  const unz = new Map();
  const unzug = (p, b, x, y, z) => { const k = p + '|' + b; if (!unz.has(k)) unz.set(k, []); unz.get(k).push({ x, y, z }); };
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const api = { D, set, ersetze, hat, typBei, frei, istFrei, oeffnung, unzug, key, Y, T, zellen, teile, N4, K, O, FR, GLAS };
  const kAlle = D.kirche, oAlle = D.orat;
  const zK = (x, z) => D.kBy.get(P.ck(x, z)), zO = (x, z) => D.oBy.get(P.ck(x, z));
  api.zK = zK; api.zO = zO;

  // ============================================================ KIRCHE
  const PORTAL_K = { mitte: K.nc, breite: 7, hoehe: 11 };
  for (const c of kAlle) {
    if (c.zone === 'fassade' && c.d8 <= 2) {
      const v = c.u - PORTAL_K.mitte;
      for (let yr = 1; yr <= rund(PORTAL_K.hoehe - PORTAL_K.breite / 2, v, PORTAL_K.breite / 2) + (Math.abs(v) < PORTAL_K.breite / 2 ? 0 : 0); yr++) oeffnung('tor', 'k_fassade', c.x, Y(yr), c.z);
    }
    if (c.zone === 'band') {                                               // Bögen der Arkadenwände zu den Kapellen (Kämpfer Lage 7)
      const [a, b] = K.kapellen[kapIndex(c.w)];
      const h = rund(7, c.w - (a + b) / 2, 5.5);
      for (let yr = 1; yr <= h; yr++) frei(c.x, Y(yr), c.z);
    }
    if (c.zone === 'sband' && c.w >= 47 && c.w < 53) for (let yr = 1; yr <= 8; yr++) frei(c.x, Y(yr), c.z);   // Durchgang zur Sakramentskapelle
  }

  // ---- Fundament, Boden
  for (const c of kAlle) {
    for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'k_fundament');
    let t = T.pflaster;
    if (c.zone === 'nave' || c.zone === 'presb' || c.zone === 'apsis') t = (Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1 ? T.serena : T.weiss;
    else if (c.zone === 'kap' || c.zone === 'kdiv') t = T.terrakotta;
    else if (c.zone === 'sakr') t = Math.hypot(c.u - K.sak.u, c.w - K.sak.w) < 3 ? T.gold : (Math.floor(Math.hypot(c.u - K.sak.u, c.w - K.sak.w) / 2.5) & 1) ? T.rot : T.weiss;
    set(c.x, Y(0), c.z, t, 'k_boden');
  }

  // ---- Fassade (Ferdinando Ruggieri, Pietra forte, nach dem Vorbild von San Gaetano): zwei Ordnungen, Portal, Giebel mit Wappen
  const bay = (K.u1 - K.u0) / 4;
  const pil = (u) => { const q = ((u - K.u0) % bay + bay) % bay; return q < 1.2 || q > bay - 1.2; };
  for (const c of kAlle) {
    if (c.zone !== 'fassade') continue;
    const top = kTop(c);
    const dU = c.u - K.nc;
    for (let yr = 1; yr <= top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      const aussen = c.w < 1;
      const gesims = yr === 15 || yr === 16 || yr === top;
      const portalRahmen = Math.abs(dU) < PORTAL_K.breite / 2 + 1.3 && yr <= rund(PORTAL_K.hoehe - PORTAL_K.breite / 2, dU, PORTAL_K.breite / 2 + 1.3) + 1;
      // Fenster über dem Portal (Lage 19..25)
      if (Math.abs(dU) < 2.2 && yr >= 19 && yr <= 24 + Math.round(sq(2.2 * 2.2 - dU * dU))) { set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.u)) % GLAS.length], 'k_fassade_fenster'); continue; }
      // Statuen Fede und Speranza (Fortini 1715) beiderseits des Portals
      const stat = [-7.8, 7.8].some((d) => Math.abs(dU - d) < 1.1 && yr >= 4 && yr <= 9);
      if (stat && aussen) { set(c.x, Y(yr), c.z, yr === 9 ? T.weiss : yr >= 7 ? T.ornament : T.weiss, 'k_fassade'); continue; }
      // Wappen der Serragli (zwei Engel mit Trompeten) im Giebel
      if (aussen && yr >= 26 && yr <= 30 && Math.abs(dU) < 2.1) { set(c.x, Y(yr), c.z, yr === 30 || Math.abs(dU) > 1.5 ? T.gold : FR(yr % 2 ? 'rot' : 'blau'), 'k_fassade'); continue; }
      if (aussen && yr >= 27 && yr <= 29 && Math.abs(Math.abs(dU) - 4.3) < 0.8) { set(c.x, Y(yr), c.z, T.weiss, 'k_fassade'); continue; }
      const t = aussen ? (yr <= 2 || gesims || portalRahmen || pil(c.u) ? T.serena : yr % 4 === 0 ? T.mauer : T.forte) : T.putz;
      set(c.x, Y(yr), c.z, t, 'k_fassade');
    }
  }

  // ---- Außenwände, Bänder, Trennwände, Massen, Gewölbe und Dach
  const wandZone = (z) => z === 'band' || z === 'kdiv' || z === 'sband' || z === 'masse';
  for (const c of kAlle) {
    if (c.zone === 'fassade') continue;
    const top = kTop(c), dk = kDecke(c);
    const aussenWand = c.d8 <= 2;
    for (let yr = 1; yr <= top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      if (dk !== null && yr < dk && !aussenWand) continue;                  // Luftraum der Räume
      let teil, typ;
      if (yr === top) { typ = T.ziegel; teil = 'k_dach'; }
      else if (aussenWand || wandZone(c.zone)) {
        // Obergaden der Kapellenbänder: Fenster über den Kapellendächern
        const fe = c.zone === 'band' && yr >= 21 && yr <= 24 && K.kapellen.some(([a, b]) => Math.abs(c.w - (a + b) / 2) < 2);
        if (fe) { set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.w)) % GLAS.length], 'k_fenster'); continue; }
        typ = aussenWand && c.d8 === 1 ? (yr <= 2 || yr === top - 1 ? T.serena : T.sand) : T.putz; teil = 'k_waende';
      } else { typ = T.putz; teil = 'k_gewoelbe'; }
      set(c.x, Y(yr), c.z, typ, teil);
    }
  }
  api.kDecke = kDecke; api.kTop = kTop;

  // ============================================================ ORATORIUM
  const PORTAL_O = { mitte: O.mitte, breite: 7, hoehe: 10 };
  for (const c of oAlle) {
    if (c.zone === 'fassade' && c.d8 <= 2) {
      const v = c.u - PORTAL_O.mitte;
      for (let yr = 1; yr <= rund(PORTAL_O.hoehe - PORTAL_O.breite / 2, v, PORTAL_O.breite / 2); yr++) oeffnung('tor', 'o_fassade', c.x, Y(yr), c.z);
    }
    if (c.zone === 'vwand') {                                              // Tür vom Vestibül in den Saal (6 breit, 8 hoch) und Durchgänge zu den Emporen
      const v = c.u - O.mitte;
      for (let yr = 1; yr <= rund(8 - 3, v, 3) + 0; yr++) frei(c.x, Y(yr), c.z);
      if (galU(c) && c.d8 > 2) for (let yr = O.emporeY + 1; yr <= O.emporeY + 5; yr++) frei(c.x, Y(yr), c.z);
    }
  }
  // Treppe Vestibül -> Empore: gerade Treppe aus Treppenblöcken (8 Stufen, Breite 3), Platz per Suche
  const vestOK = new Map();
  for (const c of oAlle) if (c.zone === 'vest' && c.d8 > 2 && Math.abs(c.u - O.mitte) > 4.2) vestOK.set(c.x + ',' + c.z, c);
  const in2 = (x, z) => vestOK.has(x + ',' + z);
  let treppe = null;
  {
    const Tr = WZ.treppe;
    let bd = Infinity;
    for (const s of vestOK.values()) {
      for (const richtung of ['n', 'o', 's', 'w']) for (const breite of [3]) {
        const bl = Tr.geradeTreppe({ start: { x: s.x, y: Y(1), z: s.z }, richtung, stufen: 8, breite, rolle: 'pietra_serena' });
        const [dx, dz] = Tr.DIR[bl.lauf.laeufe[0].d], [qx, qz] = Tr.DIR[bl.lauf.laeufe[0].quer];
        let ok = true;
        for (let k = -2; k < 8 && ok; k++) for (let q = 0; q < breite; q++) if (!in2(s.x + dx * k + qx * q, s.z + dz * k + qz * q)) { ok = false; break; }
        if (!ok) continue;
        // oben: die Zellen hinter der Treppe (Position 8, 9) müssen zur Empore gehören
        for (let k = 8; k < 10 && ok; k++) for (let q = 0; q < breite; q++) { const c = zO(s.x + dx * k + qx * q, s.z + dz * k + qz * q); if (!c || !empore(c)) { ok = false; break; } }
        if (!ok) continue;
        const d0 = Math.hypot(s.u - 6, s.w - 6);
        if (d0 < bd) { bd = d0; treppe = { bl, s, d: [dx, dz], q: [qx, qz] }; }
      }
    }
    if (!treppe) throw new Error('San Firenze: kein Platz für die Oratoriumstreppe');
    for (const l of Tr.treppenloch(treppe.bl.lauf, 3)) frei(l.x, l.y, l.z);
  }
  api.treppeO = treppe;

  for (const c of oAlle) {
    for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'o_fundament');
    set(c.x, Y(0), c.z, (Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1 ? T.terrakotta : T.weiss, 'o_boden');
  }
  for (const b of treppe.bl) {
    for (let y = Y(1); y < b.y; y++) set(b.x, y, b.z, T.serena, 'o_treppe', true);          // Unterbau (Auflager, R3)
    set(b.x, b.y, b.z, b.typ, 'o_treppe', true);
  }
  // Fassade (Zanobi del Rosso 1772–75): Portal, zwei Fenster, Gesims, flacher Giebel
  for (const c of oAlle) {
    if (c.zone !== 'fassade') continue;
    const top = oTop(c), dU = c.u - O.mitte;
    for (let yr = 1; yr <= top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      const aussen = c.w < 1;
      const fe = [-8.5, 8.5].some((d) => Math.abs(dU - d) < 1.6 && yr >= 12 && yr <= 17 + Math.round(sq(1.6 * 1.6 - (dU - Math.sign(d) * 8.5) ** 2)));
      if (fe) { set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.u)) % GLAS.length], 'o_fassade_fenster'); continue; }
      const portalRahmen = Math.abs(dU) < PORTAL_O.breite / 2 + 1.2 && yr <= rund(PORTAL_O.hoehe - PORTAL_O.breite / 2, dU, PORTAL_O.breite / 2 + 1.2) + 1;
      const t = aussen ? (yr <= 2 || yr === 11 || yr === top || portalRahmen ? T.serena : T.sand) : T.putz;
      set(c.x, Y(yr), c.z, t, 'o_fassade');
    }
  }
  // Wände, Vestibülwand, Saal: Decke, Dachmasse
  for (const c of oAlle) {
    if (c.zone === 'fassade') continue;
    const top = oTop(c), dk = oDecke(c);
    const aussenWand = c.d8 <= 2;
    for (let yr = 1; yr <= top; yr++) {
      if (istFrei(c.x, Y(yr), c.z) || hat(c.x, Y(yr), c.z)) continue;
      if (dk !== null && yr < dk && !aussenWand) continue;
      let teil, typ = T.putz;
      if (yr === top) { typ = T.ziegel; teil = 'o_dach'; }
      else if (aussenWand || c.zone === 'vwand') {
        // Saalfenster in der Südwand (Borgo de' Greci) auf Emporenhöhe; die Nord- und Rückwand grenzen an den Palast
        const sued = c.u < 4 && c.zone === 'saal' && yr >= 11 && yr <= 15 && (((Math.floor(c.w) % 9) + 9) % 9) < 3;
        if (sued) { set(c.x, Y(yr), c.z, GLAS[(yr + Math.round(c.w)) % GLAS.length], 'o_fenster'); continue; }
        typ = aussenWand && c.d8 === 1 ? (yr <= 2 || yr === top - 1 ? T.serena : T.sand) : T.putz; teil = 'o_waende';
      } else { typ = T.putz; teil = 'o_decke'; }
      set(c.x, Y(yr), c.z, typ, teil);
    }
  }
  // Emporen auf Säulen: Platte Lage 8, ionische Säulen am Rand, Brüstung (eine Lage)
  for (const c of oAlle) {
    if (!empore(c)) continue;
    set(c.x, Y(O.emporeY), c.z, (Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? T.holz : T.terrakotta, 'o_empore');
  }
  for (const c of oAlle) {
    if (!empore(c) || c.zone === 'vest' || c.zone === 'vwand') continue;
    const rand = N4.some(([dx, dz]) => { const n = zO(c.x + dx, c.z + dz); return n && n.zone === 'saal' && n.d8 > 2 && !empore(n); });
    if (!rand) continue;
    const knoten = c.u < O.gal[0] + 2 || c.u >= O.gal[1] - 2 ? (Math.round(c.w) % 6 === 0) : (Math.round(c.u) % 6 === 0);
    if (knoten) for (let yr = 1; yr < O.emporeY; yr++) set(c.x, Y(yr), c.z, T.saeule, 'o_saeulen');
    else set(c.x, Y(O.emporeY + 1), c.z, T.holz, 'o_bruestung');
  }
  // Dachmasse über dem Saal (Lage 17..): bereits als Decke/Dach gesetzt

  api.ausstattenKirche = (a) => require('./_kb_ausstattung.js').kirche(a);
  api.ausstattenOratorium = (a) => require('./_kb_ausstattung.js').oratorium(a);
  api.ausstattenKirche(api);
  api.ausstattenOratorium(api);

  // ---- Licht: Seelaternen im Boden (höchstens 12 Blöcke Abstand), getrennt nach Raum
  const lichtTeile = { k: [], o: [] };
  const licht = (cells, y, p, art) => {
    for (const l of WZ.lichtRaster(cells, { abstand: 12 })) {
      const k = key(l.x, l.y, l.z), e = zellen.get(k);
      if (!e) continue;
      teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = p; art.push(k);
    }
  };
  const stehListe = (alle, zoneOK, yFloor) => {
    const out = [];
    for (const c of alle) {
      if (!zoneOK(c)) continue;
      const b = zellen.get(key(c.x, Y(yFloor), c.z));
      if (b && !hat(c.x, Y(yFloor + 1), c.z) && !hat(c.x, Y(yFloor + 2), c.z) && !hat(c.x, Y(yFloor + 3), c.z)) out.push({ x: c.x, y: Y(yFloor + 1), z: c.z });
    }
    return out;
  };
  const kRaum = (c) => ['nave', 'presb', 'apsis', 'kap', 'sakr'].includes(c.zone) && c.d8 > 2;
  for (const f of [(c) => kRaum(c) && c.zone !== 'sakr' && c.zone !== 'kap', (c) => c.zone === 'sakr' && c.d8 > 2, (c) => c.zone === 'kap' && c.u < K.nc && c.d8 > 2, (c) => c.zone === 'kap' && c.u >= K.nc && c.d8 > 2]) {
    licht(stehListe(kAlle, f, 0), Y(0), 'k_licht', lichtTeile.k);
  }
  licht(stehListe(oAlle, (c) => (c.zone === 'saal' || c.zone === 'vest') && c.d8 > 2, 0), Y(0), 'o_licht', lichtTeile.o);
  licht(stehListe(oAlle, (c) => empore(c) && c.zone !== 'vwand', O.emporeY), Y(O.emporeY), 'o_licht', lichtTeile.o);
  teile.clear();
  for (const [k, e] of zellen) { let a = teile.get(e.p); if (!a) teile.set(e.p, a = []); a.push(k); }

  PLAN = { zellen, teile, oeff, unz, treppe };
  return PLAN;
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

module.exports = { lade, plan, modul, Y, K, O, T, FR, kZone, oZone, kTop, kDecke, oTop, empore, rund, sq };
