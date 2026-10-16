'use strict';
// Gemeinsame Geometrie und Bauplan der Badia Fiorentina (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/badia_fiorentina/).
// Ein Bauplan für alle Module, erste Setzung gewinnt; Module sind Teillisten (modul(n, [...])).
//
// Rahmen BF (achsparallel, θ = 0°): u = x − 77 von Westen nach Osten (Via del Proconsolo), w = z − 580 von Norden
// (Via Dante Alighieri) nach Süden (Arno). Lagen yr = Y − 66.
// Barocker Umbau von Matteo Segaloni (1627–31): Saal mit geschnitzter Kassettendecke (Felice Gamberai), Altar im
// Süden (Presbyterium mit Chorgestühl), Nordarm zur Via Dante; dazu der sechseckige Campanile (1310–30, etwa 70 m).

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 66;
const Y = (yr) => BODEN_Y + yr;

// ------------------------------------------------------------------ Maße (Referenzmaße §2/§3)
const SAAL = { w0: -13, w1: 13, decke: 38, traufe: 44, first: 50 };
const NORD = { decke: 30, dach: 36 };
const SUED = { decke: 34, dach: 40 };
const TURM = { top: 140, basis: 48, orden: [[52, 62, 1], [66, 80, 2], [84, 100, 3]], spitze0: 104 };   // Monofore, Bifore, Trifore

const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'), ziegelw: WZ.typ('ziegel_kuppel'),
  serena: WZ.typ('pietra_serena'), putz: WZ.typ('putz_weiss'), ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'),
  weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), gold: WZ.typ('gold'),
  terrakotta: WZ.typ('putz_rosa'), licht: WZ.typ('licht'), fenster: WZ.typ('glas_fenster'), bronze: WZ.typ('bronze')
};
const FRESKO = ['hellblau', 'gelb', 'orange', 'blau', 'rot'].map((f) => WZ.fresko(f));
const fr = (i) => FRESKO[((Math.round(i) % FRESKO.length) + FRESKO.length) % FRESKO.length];
const GLAS = PAL.typesForRole('glas');
const glas = (a, b) => GLAS[Math.abs(a * 5 + b * 3) % GLAS.length];

// ------------------------------------------------------------------ Laden
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt, C = masken.masken.campanile;
  const mk = (x, z, m, wo) => { const l = R.toLocal(x, z); return { x, z, u: l.u, w: l.w, d8: m.d8(x, z), gt: GRUND.groundTopY(x, z), wo }; };
  const haupt = H.cells.map(([x, z]) => mk(x, z, H, 'kirche'));
  const camp = C.cells.map(([x, z]) => mk(x, z, C, 'campanile'));
  for (const c of haupt) c.zone = c.w < SAAL.w0 ? 'nord' : c.w >= SAAL.w1 ? 'sued' : 'saal';
  for (const c of camp) c.zone = 'campanile';
  const byKey = new Map();
  for (const c of haupt.concat(camp)) byKey.set(P.ck(c.x, c.z), c);
  // Kanten des Turmsechsecks (für die Lage der Fenster in den Seitenmitten)
  const g = JSON.parse(fs.readFileSync(path.join(DIR, '..', '..', 'data', 'stadt', 'gebaeude.json'), 'utf8'));
  const tg = (g.gebaeude || g).find((b) => b.id === 'w249686038');
  const ring = tg.polygon.aussen[0];
  const kanten = ring.map((p, i) => { const q = ring[(i + 1) % ring.length]; return { a: p, b: q, m: [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], l: Math.hypot(q[0] - p[0], q[1] - p[1]) }; });
  L = { json, masken, R, H, C, haupt, camp, alle: haupt.concat(camp), byKey, kanten };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));
const rund = (y0, x, a) => (Math.abs(x) < a ? Math.floor(y0 + Math.sqrt(a * a - x * x)) : -1);

function decke(c) { return c.zone === 'saal' ? SAAL.decke : c.zone === 'nord' ? NORD.decke : c.zone === 'sued' ? SUED.decke : null; }
function dach(c) {
  if (c.zone === 'saal') return Math.round(SAAL.first - (SAAL.first - SAAL.traufe) * Math.min(1, Math.abs(c.w) / 13.5));
  if (c.zone === 'nord') return NORD.dach;
  if (c.zone === 'sued') return SUED.dach;
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

  // ---- Öffnungen: Portal zur Via Dante (Nordarm), Turmfenster
  for (const c of D.haupt) if (c.zone === 'nord' && c.d8 <= 2 && c.w < -24 && Math.abs(c.u - 50) < 3) for (let yr = 1; yr <= rund(7, c.u - 50, 3); yr++) oeffnung('tor', 'portal', c.x, Y(yr), c.z);
  const turmFenster = (c, yr) => {
    for (const [y0, y1, n] of TURM.orden) {
      if (yr < y0 || yr > y1) continue;
      for (const k of D.kanten) {
        const d = Math.hypot(c.x + 0.5 - k.m[0], c.z + 0.5 - k.m[1]);
        const breite = n === 1 ? 1.2 : n === 2 ? 2.4 : 3.2;
        if (d < breite && yr <= y1 - 2) return true;           // Bogenscheitel geschlossen
      }
    }
    return false;
  };

  // ---- Modul 0: Fundament und Boden
  for (const c of D.alle) for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
  for (const c of D.alle) set(c.x, Y(0), c.z, c.zone === 'saal' ? (((Math.floor(c.u / 3) + Math.floor((c.w + 40) / 3)) % 2) ? T.serena : T.weiss) : c.zone === 'sued' ? T.weiss : T.terrakotta, 'boden');

  // ---- Modul 1: Außenwände (mit den vier blinden Monoforen zur Via del Proconsolo) und Fenster
  for (const c of D.haupt) {
    if (c.d8 > 2) continue;
    const top = dachBei(c.x, c.z);
    for (let yr = 1; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z) || luft.has(key(c.x, Y(yr), c.z))) continue;
      let t = c.d8 === 1 ? (yr <= 2 ? T.serena : T.bruch) : T.putz, p = 'aussenwaende';
      if (c.u > 65 && c.d8 === 1 && c.zone === 'saal' && yr >= 12 && yr <= 30 && [-9, -3, 3, 9].some((m) => Math.abs(c.w - m) < 1)) t = T.mauer;   // blinde Monoforen
      const hoch = c.zone === 'saal' && Math.abs(c.w) > 11 && yr >= 31 && yr <= rund(35, ((c.u % 11) + 11) % 11 - 5.5, 1.6) && yr > (Math.abs(c.w) > 12 ? 0 : 0);
      if (hoch || (c.zone !== 'saal' && yr >= 14 && yr <= 22 && Math.round(c.u) % 10 === 0)) { t = glas(Math.round(c.u), yr); p = 'fenster'; }
      if (c.zone === 'saal' && c.u < 2 && Math.hypot(c.w, yr - 28) <= 3.5) { t = Math.hypot(c.w, yr - 28) > 2.7 ? T.serena : glas(Math.round(c.w), yr); p = 'fenster'; }
      set(c.x, Y(yr), c.z, t, p);
    }
  }

  // ---- Modul 2: Bogenwände zu den Armen, Chorgestühl, Altar
  for (const c of D.haupt) {
    if (c.d8 <= 2) continue;
    const nord = c.w >= SAAL.w0 - 1.5 && c.w < SAAL.w0 + 0.5, sued = c.w >= SAAL.w1 - 0.5 && c.w < SAAL.w1 + 1.5;
    if (!nord && !sued) continue;
    const m = nord ? 45 : 42, a = nord ? 15 : 17;
    const lai = rund(nord ? 14 : 16, c.u - m, a);
    const top = dachBei(c.x, c.z);
    for (let yr = 1; yr < Math.max(top, SAAL.decke); yr++) {
      if (hat(c.x, Y(yr), c.z) || yr <= lai) continue;
      set(c.x, Y(yr), c.z, yr <= lai + 1 ? T.serena : yr > (nord ? NORD.dach : SUED.dach) ? T.mauer : T.putz, 'boegen');
    }
  }
  for (const c of D.haupt) {                                            // Chorgestühl der Del Tasso entlang der Wände des Presbyteriums
    if (c.zone !== 'sued' || c.d8 !== 3) continue;
    set(c.x, Y(1), c.z, T.holz, 'chorgestuehl');
  }
  for (const c of D.haupt) {
    if (c.zone !== 'sued' || Math.abs(c.u - 42) > 2.5 || c.w < 17 || c.w > 18.5) continue;
    for (let yr = 1; yr <= 4; yr++) set(c.x, Y(yr), c.z, yr === 4 ? T.gold : T.weiss, 'hochaltar');
  }

  // ---- Modul 3: Decken (Kassettendecke Gamberai, Fresko im Presbyterium) und Dächer
  for (const c of D.haupt) {
    if (c.d8 <= 2) continue;
    const dk = decke(c), top = dachBei(c.x, c.z);
    for (let yr = dk; yr < top; yr++) {
      if (hat(c.x, Y(yr), c.z)) continue;
      if (yr === dk) {
        let t = T.putz;
        if (c.zone === 'saal') t = (Math.round(c.u) % 4 === 0 || Math.round(c.w) % 4 === 0) ? T.gold : T.holz;
        if (c.zone === 'sued') t = fr(Math.floor(c.u / 5) + Math.floor(c.w / 4));
        set(c.x, Y(yr), c.z, t, 'decken');
      } else unzug('daecher', 'Dachraum über den Decken (ohne Zugang)', c.x, Y(yr), c.z);
    }
  }
  for (const c of D.haupt) {
    const top = dachBei(c.x, c.z);
    let lo = top;
    for (const [dx, dz] of N8) { const n = dachBei(c.x + dx, c.z + dz); if (n != null && n < lo) lo = n; }
    for (let yr = lo; yr <= top; yr++) if (!hat(c.x, Y(yr), c.z) && !luft.has(key(c.x, Y(yr), c.z))) set(c.x, Y(yr), c.z, yr === top ? T.ziegel : T.mauer, yr >= top - 1 ? 'daecher' : 'schildwaende');
  }

  // ---- Modul 4: Campanile (sechseckig auf quadratischem Sockel, 1310–30, etwa 70 m)
  let rmax = 0;
  for (const c of D.camp) rmax = Math.max(rmax, c.d8);
  for (const c of D.camp) {
    for (let yr = 1; yr <= TURM.top; yr++) {
      const y = Y(yr);
      if (hat(c.x, y, c.z) || luft.has(key(c.x, y, c.z))) continue;
      if (yr >= TURM.spitze0) {                                         // Spitze: sechseckige Pyramide
        const s = (yr - TURM.spitze0) / (TURM.top - TURM.spitze0) * (rmax - 0.5);
        if (c.d8 >= s && c.d8 < s + 1.5) set(c.x, y, c.z, yr >= TURM.top - 1 ? T.bronze : T.ziegelw, 'turmspitze');
        else if (c.d8 >= s + 1.5) unzug('turmspitze', 'Hohlraum der Turmspitze', c.x, y, c.z);
        continue;
      }
      if (c.d8 <= 2) {
        if (turmFenster(c, yr) && c.d8 >= 1) { oeffnung('fenster_offen', 'glockengeschosse', c.x, y, c.z); unzug('glockengeschosse', 'Turmschaft (im Modell ohne Zugang)', c.x, y, c.z); continue; }
        const gesims = yr === TURM.basis || TURM.orden.some(([y0, y1]) => yr === y0 - 1 || yr === y1 + 1);
        set(c.x, y, c.z, gesims ? T.serena : (c.d8 === 1 ? T.forte : T.mauer), yr > TURM.basis ? 'glockengeschosse' : 'turmschaft');
      } else if (TURM.orden.some(([y0]) => yr === y0 - 1)) set(c.x, y, c.z, T.holz, 'glockengeschosse');
      else unzug(yr > TURM.basis ? 'glockengeschosse' : 'turmschaft', 'Turmschaft (im Modell ohne Zugang)', c.x, y, c.z);
    }
  }

  // ---- Modul 6 (V5b): Ausstattung nach Quellen (it.wikipedia Badia Fiorentina), vereinfacht in vollen Blöcken
  //      Lage in Lokalkoordinaten (u, w): x = 77 + u, z = 580 + w (achsparallel); Stehzelle = Lage 1.
  const put = (u, w, yr, t, p) => { const c = zelleBei(77 + u, 580 + w); if (c) set(c.x, Y(yr), c.z, t, p); };
  const box = (u0, u1, w0, w1, y0, y1, t, p) => { for (let u = u0; u <= u1; u++) for (let w = w0; w <= w1; w++) for (let yr = y0; yr <= y1; yr++) put(u, w, yr, typ_(t, u, w, yr), p); };
  const typ_ = (t, u, w, yr) => (typeof t === 'function' ? t(u, w, yr) : t);
  const F = (n) => WZ.fresko(n);
  // Bildfeld an einer Wand: Zeilen von oben nach unten, Spalten in Richtung wachsender w; Goldrahmen rundum
  const tafel = (u, w0, yTop, zeilen, rahmen, p) => {
    const h = zeilen.length, b = zeilen[0].length;
    for (let j = 0; j < h; j++) for (let i = 0; i < b; i++) put(u, w0 + 1 + i, yTop - 1 - j, zeilen[j][i], p);
    for (let i = -1; i <= b; i++) { put(u, w0 + 1 + i, yTop, rahmen, p); put(u, w0 + 1 + i, yTop - h - 1, rahmen, p); }
    for (let j = 0; j < h; j++) { put(u, w0, yTop - 1 - j, rahmen, p); put(u, w0 + 1 + b, yTop - 1 - j, rahmen, p); }
  };
  const hb = F('hellblau'), bl = F('blau'), ge = F('gelb'), gr = F('gruen'), br = F('braun'), ro = F('rot'), we = F('weiss'), og = F('orange');

  // 1. Filippino Lippi: Erscheinung der Madonna vor dem hl. Bernhard (1482-86), im Nordarm links gleich hinter dem Nordportal
  //    (Ostwand des Nordarms u = 52, Blick nach Süden), 7 Blöcke breit, Unterkante Lage 2
  tafel(52, -24, 8, [
    [hb, hb, ge, hb, hb],
    [hb, hb, bl, hb, gr],
    [gr, hb, bl, gr, gr],
    [gr, gr, og, gr, gr],
    [br, we, gr, gr, ro]
  ], T.gold, 'lippi_tafel');

  // 2. Grabmal Bernardo Giugni (Mino da Fiesole, um 1466-69): Wandgrabmal nahe dem Eingang, Nordwand des Nordarms westlich des Portals
  box(39, 46, -25, -24, 1, 1, T.weiss, 'giugni_grabmal');                      // Sockel
  box(40, 45, -25, -24, 2, 3, T.weiss, 'giugni_grabmal');                      // Sarkophag
  box(40, 45, -25, -24, 4, 4, T.ornament, 'giugni_grabmal');                   // Deckel
  box(39, 39, -25, -25, 2, 9, T.ornament, 'giugni_grabmal');                   // Pilaster
  box(46, 46, -25, -25, 2, 9, T.ornament, 'giugni_grabmal');
  box(40, 45, -25, -25, 5, 8, bl, 'giugni_grabmal');                           // Lünettenfeld
  box(40, 45, -25, -25, 9, 9, T.ornament, 'giugni_grabmal');                   // Gebälk
  for (const [u, yr] of [[42, 6], [43, 6], [42, 7], [43, 7]]) put(u, -25, yr, we, 'giugni_grabmal');   // Tondo

  // 3. Grabmal Ugo von Tuszien (Mino da Fiesole, 1469-81) unter der Cantoria des linken Querarms (Ostwand des Saals) und Vasaris Assunta (1568)
  box(63, 64, -4, 4, 1, 2, T.weiss, 'ugo_grabmal');                            // Sockel
  box(63, 64, -3, 3, 3, 5, T.weiss, 'ugo_grabmal');                            // Sarkophag
  box(63, 64, -3, 3, 6, 6, T.ornament, 'ugo_grabmal');                         // Deckel
  box(64, 64, -4, 4, 7, 7, T.ornament, 'ugo_grabmal');
  box(64, 64, -3, 3, 8, 10, bl, 'ugo_grabmal');                                // Reliefgrund
  put(64, 0, 9, we, 'ugo_grabmal'); put(64, 0, 8, we, 'ugo_grabmal'); put(64, 1, 9, we, 'ugo_grabmal'); put(64, -1, 9, we, 'ugo_grabmal');
  box(62, 64, -6, 6, 11, 11, T.holz, 'cantoria_vasari');                       // Cantoria-Boden
  box(62, 62, -6, 6, 12, 12, T.holz, 'cantoria_vasari');                       // Brüstung
  box(63, 64, -6, -6, 12, 12, T.holz, 'cantoria_vasari'); box(63, 64, 6, 6, 12, 12, T.holz, 'cantoria_vasari');
  tafel(64, -3, 21, [
    [hb, we, ge, we, hb],
    [we, hb, bl, hb, we],
    [hb, we, bl, we, hb],
    [br, ro, we, ro, br]
  ], T.gold, 'cantoria_vasari');
  for (let w = -6; w <= 6; w++) for (let u = 62; u <= 64; u++) for (let yr = 12; yr <= 14; yr++) { const c = zelleBei(77 + u, 580 + w); if (c) unzug('cantoria_vasari', 'Cantoria (Empore, Zugang nur über die Orgelbühne)', c.x, Y(yr), c.z); }

  // 4. Orgel von Onofrio Zeffirini (1558) auf der Cantoria des rechten Querarms (Westwand des Saals)
  box(3, 5, -5, 5, 11, 11, T.holz, 'orgel_zeffirini');                         // Cantoria-Boden
  box(5, 5, -5, 5, 12, 12, T.holz, 'orgel_zeffirini');                         // Brüstung
  box(4, 4, -5, 5, 12, 14, T.holz, 'orgel_zeffirini');                         // Gehäuse
  for (let w = -5; w <= 5; w++) { const h = 24 - Math.abs(w) * 2 - (Math.abs(w) % 2); box(3, 3, w, w, 15, h, T.bronze, 'orgel_zeffirini'); put(4, w, 15, T.holz, 'orgel_zeffirini'); }
  for (let w = -5; w <= 5; w++) for (let u = 3; u <= 5; u++) for (let yr = 12; yr <= 26; yr++) { const c = zelleBei(77 + u, 580 + w); if (c) unzug('orgel_zeffirini', 'Orgelbühne (Zugang nur für die Orgelpflege)', c.x, Y(yr), c.z); }

  // 5. Hochaltar im Presbyterium (nach Süden zum Arno, 1627-31): Predella mit Stufen, Kruzifix und Leuchter auf der Mensa
  box(38, 46, 15, 19, 1, 1, T.weiss, 'hochaltar_aufbau');
  for (let u = 38; u <= 46; u++) put(u, 14, 1, PAL.treppe('marmor_weiss', 's'), 'hochaltar_aufbau');
  for (let yr = 5; yr <= 9; yr++) put(42, 17, yr, T.gold, 'hochaltar_aufbau');   // Kruzifix
  put(41, 17, 8, T.gold, 'hochaltar_aufbau'); put(43, 17, 8, T.gold, 'hochaltar_aufbau');
  put(40, 17, 5, T.gold, 'hochaltar_aufbau'); put(44, 17, 5, T.gold, 'hochaltar_aufbau'); put(40, 17, 6, T.licht, 'hochaltar_aufbau'); put(44, 17, 6, T.licht, 'hochaltar_aufbau');

  // 6. Chorgestühl der Del Tasso (16. Jh.): Rückwand hoch (Lage 2-4, Kranz in Gold), Sitzbank als Treppenblöcke davor
  const DIRV = [[1, 0, 'o'], [-1, 0, 'w'], [0, 1, 's'], [0, -1, 'n']];
  for (const c of D.haupt) {
    if (c.zone !== 'sued') continue;
    if (c.d8 === 3) {
      for (let yr = 2; yr <= 4; yr++) set(c.x, Y(yr), c.z, yr === 4 ? T.gold : T.holz, 'chorgestuehl_lehnen');
      unzug('chorgestuehl_lehnen', 'Oberkante des Chorgestühls (kein Gang)', c.x, Y(5), c.z);
    } else if (c.d8 === 4) {
      const d = DIRV.find(([dx, dz]) => { const n = zelleBei(c.x + dx, c.z + dz); return n && n.zone === 'sued' && n.d8 === 3; });
      if (d) set(c.x, Y(1), c.z, PAL.treppe('holz', d[2]), 'chorgestuehl_sitze');
    }
  }

  // 7. Kassettendecke des Saals (Felice Gamberai, bis 1631): hängende Rippen und goldene Rosetten in den Feldern
  for (const c of D.haupt) {
    if (c.zone !== 'saal' || c.d8 <= 2) continue;
    const u = Math.round(c.u), w = Math.round(c.w);
    if (u % 4 === 0 || w % 4 === 0) set(c.x, Y(SAAL.decke - 1), c.z, T.holz, 'kassettendecke');
    else if (u % 4 === 2 && w % 4 === 2) set(c.x, Y(SAAL.decke - 1), c.z, T.gold, 'kassettendecke');
  }

  // ---- Modul 5: Licht
  const steh = [];
  for (const c of D.haupt) {
    const b = zellen.get(key(c.x, Y(0), c.z));
    if (b && b.p === 'boden' && !hat(c.x, Y(1), c.z) && !hat(c.x, Y(2), c.z)) steh.push({ x: c.x, y: Y(1), z: c.z });
  }
  const lt = [];
  for (const l of WZ.lichtRaster(steh, { abstand: 12 })) {
    const k = key(l.x, l.y, l.z); const e = zellen.get(k); if (!e) continue;
    teile.set(e.p, teile.get(e.p).filter((q) => q !== k)); e.t = T.licht; e.p = 'licht'; lt.push(k);
  }
  teile.set('licht', lt);

  PLAN = { zellen, teile, oeff, unz };
  return PLAN;
}

const OEFF_TEIL = { portal: 'aussenwaende' };
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

module.exports = { modul, lade, plan, zelleBei, Y, BODEN_Y, T, TURM, SAAL };
