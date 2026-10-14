'use strict';
// Gemeinsame Geometrie und Bauplan von Santa Croce (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/santa_croce/).
// Ein einziger Bauplan (Zelle -> Typ, Bauteil) für alle Module: Wer zuerst setzt, gewinnt (Detail vor Allgemeinem),
// deshalb überschneiden sich Bauteile nie. Die Module holen sich ihre Bauteile in fester Reihenfolge aus dem Plan.
//
// Rahmen SC: u entlang der Kirchenachse (Fassade u = 0, Chor u ≈ 237), w quer (w < 0 Norden). Lagen yr = Y − 64.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const BODEN_Y = 64;
const Y = (yr) => BODEN_Y + yr;

// ------------------------------------------------------------------ Maße (Referenzmaße §2/§3)
const JOCHE = [0, 25.5, 52.0, 78.4, 103.5, 129.9, 154.9, 180.1]; // 7 Langhausjoche (OSM-Querdächer)
const U_FASSADE = 2.5;        // u < 2,5: Fassade (Marmorvorsatz und alte Front)
const U_QUER = 180.1;         // Querhaus ab hier
const U_OST = 209;            // Ostwand des Querhauses (209..211), dahinter Kapellen und Chor
const W_PFEILER = 21.5;       // Pfeilerreihen |w| = 21,5
const W_OBER_I = 20, W_OBER_A = 23; // Obergadenwand |w| in [20, 23)
const W_SEITE = 37.5;         // Innenkante der Außenwand im Langhaus
const KAEMPFER = 24, SCHEITEL = 39; // Arkaden
const BALLATOIO = 41;
const TRAUFE_M = 62, FIRST_M = 70;  // Mittelschiff: Traufe/First (Innenraum bis Lage 69 = 34,5 m)
const TRAUFE_S = 30, GIEBEL_S = 42; // Seitenschiffe: Traufe, Querdachgiebel
const TRAUFE_Q = 56, FIRST_Q = 66;  // Querhaus
const CHOR_W0 = -7, CHOR_W1 = 21;   // Cappella maggiore
const KAP_NORD = [-55.1, -45.4, -35.8, -26.1, -16.5, -6.8]; // 5 Kapellen nördlich des Chors
const KAP_SUED = [20.7, 28.9, 37.0, 45.2, 53.3, 61.5];      // 5 Kapellen südlich

// ------------------------------------------------------------------ Typen
const T = {
  forte: WZ.typ('pietra_forte'), bruch: WZ.typ('pietra_forte_bruch'), mauer: WZ.typ('mauerwerk'),
  serena: WZ.typ('pietra_serena'), putz: WZ.typ('putz_weiss'), putzSand: WZ.typ('putz_sand'),
  ziegel: WZ.typ('dachziegel'), holz: WZ.typ('holz'), pflaster: WZ.typ('pflaster'), terrakotta: WZ.typ('putz_rosa'),
  weiss: WZ.typ('marmor_weiss'), ornament: WZ.typ('marmor_ornament'), saeule: WZ.typ('marmor_saeule'),
  gruen: WZ.typ('marmor_gruen'), rosa: WZ.typ('marmor_rot'), gold: WZ.typ('gold'), bronze: WZ.typ('bronze'),
  fenster: WZ.typ('glas_fenster'), licht: WZ.typ('licht'), dunkel: WZ.typ('kontrast_dunkel')
};
const GLAS = PAL.typesForRole('glas'); // farbige Kirchenfenster
const glas = (a, b) => GLAS[Math.abs(a * 7 + b * 3) % GLAS.length];

// ------------------------------------------------------------------ Laden
let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen;
  const H = masken.haupt, C = masken.masken.campanile;
  const zelle = (x, z, maske) => {
    const l = R.toLocal(x, z);
    return { x, z, u: l.u, w: l.w, ui: Math.floor(l.u + 0.5), wi: Math.floor(l.w + 0.5), d8: maske.d8(x, z),
      gt: WZ.boden.groundTopY(x, z) };
  };
  const haupt = H.cells.map(([x, z]) => zelle(x, z, H));
  const camp = C.cells.map(([x, z]) => zelle(x, z, C));
  const byKey = new Map();
  for (const c of haupt) { c.zone = zone(c); byKey.set(P.ck(c.x, c.z), c); }
  for (const c of camp) { c.zone = 'campanile'; byKey.set(P.ck(c.x, c.z), c); }
  // Chor: eigener Randabstand (Polygonschluss), für das Dach
  const chorZellen = haupt.filter((c) => c.zone === 'chor').map((c) => [c.x, c.z]);
  const chorM = WZ.Maske.vonZellen ? WZ.Maske.vonZellen(chorZellen) : null;
  for (const c of haupt) if (c.zone === 'chor') c.dChor = chorM ? chorM.d8(c.x, c.z) : c.d8;
  L = { json, masken, R, H, C, haupt, camp, alle: haupt.concat(camp), byKey };
  return L;
}
const zelleBei = (x, z) => lade().byKey.get(P.ck(x, z));

function zone(c) {
  if (c.u < U_FASSADE) return 'fassade';
  if (c.u < U_QUER) return Math.abs(c.w) < W_OBER_A ? 'mittel' : 'seite';
  if (c.u < U_OST) return Math.abs(c.w) < W_OBER_A ? 'vierung' : 'quer';
  if (c.u < U_OST + 2) return 'ostwand';
  if (c.w >= CHOR_W0 && c.w <= CHOR_W1) return 'chor';
  return 'kapelle';
}

// ------------------------------------------------------------------ Joche, Pfeiler
function joch(u) {
  for (let b = 0; b < 7; b++) if (u < JOCHE[b + 1]) return { b, u0: JOCHE[b], u1: JOCHE[b + 1], uc: (JOCHE[b] + JOCHE[b + 1]) / 2 };
  return { b: 6, u0: JOCHE[6], u1: JOCHE[7], uc: (JOCHE[6] + JOCHE[7]) / 2 };
}
const PFEILER_U = [25.5, 52.0, 78.4, 103.5, 129.9, 154.9, U_QUER]; // sechs Langhauspfeiler + Vierungspfeiler
/** Achteckpfeiler 5 × 5 (Ecken abgeschrägt) um (uc, ±21,5)? -> Index oder -1 */
function pfeiler(c) {
  for (let k = 0; k < PFEILER_U.length; k++) {
    const du = Math.abs(c.u - PFEILER_U[k]);
    if (du > 2.5) continue;
    const dw = Math.abs(Math.abs(c.w) - W_PFEILER);
    if (dw <= 2.5 && du + dw <= 3.6) return k;
  }
  return -1;
}
/** Arkadenöffnung: Höhe der Laibung (yr) über der Zelle der Obergadenlinie, oder -1 (Pfeiler/kein Bogen). */
function arkade(u) {
  const faces = [U_FASSADE].concat(PFEILER_U.map((p) => p - 2.5));
  const ends = PFEILER_U.map((p) => p - 2.5);
  for (let k = 0; k < ends.length; k++) {
    const a0 = k === 0 ? U_FASSADE : PFEILER_U[k - 1] + 2.5, a1 = ends[k];
    if (u >= a0 && u < a1) {
      const a = (a1 - a0) / 2, x = Math.abs(u - (a0 + a1) / 2);
      return Math.floor(KAEMPFER + (SCHEITEL - KAEMPFER) * Math.sqrt(Math.max(0, 1 - x / a)));
    }
  }
  void faces;
  return -1;
}
/** Spitzbogenprofil: Öffnung bis yTop über y0 bei relativer Lage x (0 Mitte) und halber Breite a. */
const spitz = (y0, hoehe, x, a) => Math.floor(y0 + hoehe * Math.sqrt(Math.max(0, 1 - Math.abs(x) / a)));

// ------------------------------------------------------------------ Dachhöhen je Spalte (Lage der Dachhaut)
function dachLage(c) {
  switch (c.zone) {
    case 'mittel': case 'vierung': {
      const d = Math.min(1, Math.abs(c.w - 0.5) / 23);
      return Math.round(FIRST_M - (FIRST_M - TRAUFE_M) * d);
    }
    case 'seite': {
      const j = joch(c.u);
      const t = Math.min(1, Math.abs(c.u - j.uc) / ((j.u1 - j.u0) / 2));
      return Math.round(GIEBEL_S - (GIEBEL_S - TRAUFE_S) * t);
    }
    case 'quer': {
      const t = Math.min(1, Math.abs(c.u - 194.55) / 14.45);
      return Math.round(FIRST_Q - (FIRST_Q - TRAUFE_Q) * t);
    }
    case 'ostwand': return Math.abs(c.w) < W_OBER_A ? dachLage({ ...c, zone: 'mittel' }) : TRAUFE_Q;
    case 'kapelle': return Math.round(36 - 6 * Math.min(1, (c.u - 211) / 12));
    case 'chor': return 54 + Math.min(8, Math.floor((c.dChor || 1) / 2));
    default: return null;
  }
}

// ------------------------------------------------------------------ Fassade (OSM-Teile, Referenzmaße §2)
function fassadeHoehe(c) {
  const w = c.w;
  if (w >= -0.5 && w <= 3 && c.u >= -4.5 && c.u <= -0.5) return 85;               // Stern/Mittelfiale (42,5 m)
  // Mittelgiebel bis 38 m (OSM); Fuß auf Lage 64 statt 54, damit der Giebel das Mittelschiffdach (First 70) überall verdeckt
  if (w >= -16.5 && w <= 18.7) return 64 + Math.round(12 * (1 - Math.abs(w - 1.1) / 17.6));
  const sp = (a, b) => w >= a && w <= b;
  if (sp(-20.6, -17.7) || sp(19.9, 22.7)) return c.u >= -4.5 && c.u <= -1 ? 72 : 64; // Fialen auf den Pfeilern (OSM 30,5/35 m, angehoben auf Dachhöhe)
  if (sp(-22.1, -16.5) || sp(18.6, 24.2)) return 64;
  if (sp(-35.3, -22.1) || sp(24.2, 37.5)) return 35 + Math.round(8 * (37.5 - Math.abs(w)) / 15.3); // Seitenteile 17,4–21,7 m
  if (sp(-39.7, -36.8) || sp(38.5, 41.5)) return c.u >= -4.3 && c.u <= -1 ? 45 : 35;  // Eckfialen 22,4 m
  return 35;
}
const PORTAL_MITTE = { w0: -3, w1: 5, h: 13, spitze: 3 };
const PORTALE_SEITE = [{ w0: -32, w1: -28, h: 9, spitze: 2 }, { w0: 28, w1: 32, h: 9, spitze: 2 }];
function portal(c, yr) {
  for (const p of [PORTAL_MITTE, ...PORTALE_SEITE]) {
    if (c.w < p.w0 || c.w >= p.w1) continue;
    const a = (p.w1 - p.w0) / 2, x = c.w - (p.w0 + p.w1) / 2;
    if (yr >= 1 && yr <= spitz(p.h, p.spitze, x, a)) return p === PORTAL_MITTE ? 'tor' : 'tuer';
  }
  return null;
}
const ROSETTE = { w: 1, yr: 46, r: 4.6 };
const inRosette = (c, yr) => (c.w - ROSETTE.w) ** 2 + (yr - ROSETTE.yr) ** 2 <= ROSETTE.r ** 2;

// ------------------------------------------------------------------ Fenster in Außenwänden
function fensterAussen(c, yr) {
  if (c.zone === 'seite') {                                 // je Joch ein Lanzettfenster, 2 breit
    const j = joch(c.u);
    if (Math.abs(c.u - j.uc) < 1 && yr >= 12 && yr <= spitz(24, 2, 0, 1)) return true;
    return false;
  }
  if (c.zone === 'quer' && Math.abs(c.w) > 55) {             // Stirnwände der Querarme: drei Lanzetten
    for (const uc of [186.5, 194.5, 202.5]) if (Math.abs(c.u - uc) < 1 && yr >= 14 && yr <= 44) return true;
    return false;
  }
  if (c.zone === 'kapelle' && c.u > 218 && !vorTurm(c)) {                  // Ostwand je Kapelle eine Lanzette
    const g = c.w < 0 ? KAP_NORD : KAP_SUED;
    for (let k = 0; k < 5; k++) { const m = (g[k] + g[k + 1]) / 2; if (Math.abs(c.w - m) < 1 && yr >= 8 && yr <= 22) return true; }
    return false;
  }
  if (c.zone === 'chor' && c.u > 223) {                     // Chor: vier hohe Lanzetten im Polygonschluss
    const phi = Math.atan2(c.w - 7, c.u - 224) * 180 / Math.PI;
    for (const m of [-60, -20, 20, 60]) if (Math.abs(phi - m) < 4.5 && yr >= 10 && yr <= 50) return true;
  }
  return false;
}
// Durchgang von der vierten Südkapelle in den Campanile (Kapellen-Ostwand vor der Turmtür)
const turmZugang = (c) => c.zone === 'kapelle' && c.u > 216 && c.w >= 48.9 && c.w < 51.9;
const vorTurm = (c) => c.u > 216 && c.w > 44 && c.w < 57.5;
// Nordportal (Seiteneingang im 6. Joch)
const NORDPORTAL = { u0: 140.4, u1: 144.4, h: 8 };
const nordportal = (c, yr) => c.zone === 'seite' && c.w < 0 && c.u >= NORDPORTAL.u0 && c.u < NORDPORTAL.u1 && yr >= 1 && yr <= NORDPORTAL.h;

// ------------------------------------------------------------------ Bauplan
let PLAN = null;
/**
 * plan() -> { zellen: Map(key -> { x, y, z, t, p }), teile: Map(p -> [keys in Setzreihenfolge]), oeff: [{art, p, zellen}],
 *             unz: [{p, begruendung, zellen}], ... }
 */
function plan() {
  if (PLAN) return PLAN;
  const D = lade();
  const zellen = new Map();
  const teile = new Map();
  const key = (x, y, z) => x + ',' + y + ',' + z;
  const set = (x, y, z, t, p) => {
    const k = key(x, y, z);
    if (zellen.has(k)) return false;
    zellen.set(k, { x, y, z, t, p });
    let a = teile.get(p);
    if (!a) teile.set(p, a = []);
    a.push(k);
    return true;
  };
  const luft = new Set(); // bewusst frei gehaltene Zellen (Öffnungen)
  const frei = (x, y, z) => luft.add(key(x, y, z));
  const istFrei = (x, y, z) => luft.has(key(x, y, z));
  const oeff = new Map(); // art|p -> zellen
  const oeffnung = (art, p, x, y, z) => { const k = art + '|' + p; if (!oeff.has(k)) oeff.set(k, []); oeff.get(k).push({ x, y, z }); frei(x, y, z); };
  const unz = new Map();
  const unzug = (p, begr, x, y, z) => { const k = p + '|' + begr; if (!unz.has(k)) unz.set(k, []); unz.get(k).push({ x, y, z }); };

  const dach = new Map(); // Spalte -> Lage der Dachhaut
  for (const c of D.haupt) dach.set(P.ck(c.x, c.z), c.zone === 'fassade' ? fassadeHoehe(c) : dachLage(c)); // Fassade nur als Nachbar
  const dachBei = (x, z) => dach.get(P.ck(x, z));
  const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

  // --- Öffnungen zuerst (Luft), damit Wände sie aussparen
  for (const c of D.haupt) {
    if (c.zone === 'fassade') {
      const top = fassadeHoehe(c);
      for (let yr = 1; yr <= top; yr++) {
        const art = portal(c, yr);
        if (art) oeffnung(art, 'portale', c.x, Y(yr), c.z);
      }
      continue;
    }
    if (c.d8 <= 3 && nordportal(c, 1)) for (let yr = 1; yr <= NORDPORTAL.h; yr++) oeffnung('tuer', 'nordportal', c.x, Y(yr), c.z);
    if (c.d8 <= 3 && turmZugang(c)) for (let yr = 1; yr <= 4; yr++) oeffnung('tuer', 'campanile_schaft', c.x, Y(yr), c.z);
  }

  // --- Modul 0: Fundament und Boden
  for (const c of D.alle) {
    for (let y = c.gt + 1; y <= Y(-1); y++) set(c.x, y, c.z, T.bruch, 'fundament');
  }
  for (const c of D.alle) {
    let t = T.serena;
    if (c.zone === 'mittel' && Math.abs(c.w) < 18) {
      const iu = Math.floor(c.u / 4), iw = Math.floor((c.w + 18) / 4);
      t = (iu + iw) % 2 ? T.serena : T.terrakotta;
      if (iu % 3 === 1 && iw % 3 === 1) t = T.weiss;                        // Grabplatten (276 im Boden)
    } else if (c.zone === 'kapelle' || c.zone === 'chor') t = T.terrakotta;
    else if (c.zone === 'campanile') t = T.serena;
    set(c.x, Y(0), c.z, t, t === T.weiss ? 'grabplatten' : 'bodenplatte');
  }

  // --- Modul 6 (Fassade) wird vor den Wänden geplant: eigene Spalten u < 2,5
  for (const c of D.haupt) {
    if (c.zone !== 'fassade') continue;
    const top = fassadeHoehe(c);
    const vorn = c.u < -2.5;                     // Marmorvorsatz (2 Lagen)
    for (let yr = 1; yr <= top; yr++) {
      if (istFrei(c.x, Y(yr), c.z)) continue;
      if (inRosette(c, yr)) {
        const r = Math.hypot(c.w - ROSETTE.w, yr - ROSETTE.yr);
        set(c.x, Y(yr), c.z, r > 3.6 ? T.ornament : glas(Math.round(r * 2), 1), 'rosette');
        continue;
      }
      // Portalgewände: 1 Zelle um die Portale, Marmorornament
      let gewaende = false;
      for (const [dw, dy] of [[1, 0], [-1, 0], [0, 1]]) {
        const n = { ...c, w: c.w + dw };
        if (portal(n, yr - dy) && !portal(c, yr)) gewaende = true;
      }
      let t;
      if (gewaende && vorn) t = T.ornament;
      else if (yr > top - 1 && top > 63) t = T.ornament;                        // Giebelkante
      else if (!vorn) t = T.mauer;
      else if (yr % 9 === 0) t = T.gruen;                                       // grüne Bänder (Prato)
      else if (Math.abs(c.w) > 16.5 && Math.abs(c.w) < 24.2) t = (yr % 9 < 2 ? T.gruen : T.weiss); // Pfeiler
      else if (yr > 18 && yr < 34 && (Math.round(c.w) % 6 === 0)) t = T.rosa;  // rosa Felder (Siena)
      else t = T.weiss;
      const p = yr > 76 || (top === 72 && yr > 64) || (top === 45 && yr > 35) ? 'fialen' : top > 64 && yr > 64 ? 'giebel' : 'fassade_marmor';
      set(c.x, Y(yr), c.z, t, vorn ? p : 'fassade_kern');
    }
  }

  // --- Modul 2: Pfeiler, Arkaden, Ballatoio (Langhaus |w| 19..24)
  for (const c of D.haupt) {
    if (c.zone !== 'mittel' && c.zone !== 'seite' && c.zone !== 'vierung' && c.zone !== 'quer') continue;
    const k = pfeiler(c);
    if (k >= 0) {
      for (let yr = 1; yr <= KAEMPFER; yr++) set(c.x, Y(yr), c.z, yr === KAEMPFER ? T.ornament : T.serena, 'pfeiler');
    }
  }
  for (const c of D.haupt) {
    if (c.zone !== 'mittel') continue;
    const aw = Math.abs(c.w);
    if (aw < W_OBER_I || aw >= W_OBER_A) continue;
    const top = dach.get(P.ck(c.x, c.z));
    const lai = arkade(c.u);
    // Außenseite: Zelle grenzt an eine Seitenschiffspalte (|w| ≥ 23); dort Steinziegel über den Seitenschiffdächern
    let aussenAb = Infinity;                // Lage, ab der die Zelle außen liegt (über dem Dach der Nachbarspalte)
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = zelleBei(c.x + dx, c.z + dz);
      if (n && n.zone === 'seite') aussenAb = Math.min(aussenAb, dachBei(n.x, n.z));
    }
    for (let yr = 1; yr < top; yr++) {
      if (zellen.has(key(c.x, Y(yr), c.z))) continue;
      if (lai >= 0 && yr <= lai) continue;                          // Arkadenöffnung (Luft)
      // Obergadenfenster je Joch, 3 breit, Lage 46..60
      const j = joch(c.u);
      if (Math.abs(c.u - j.uc) < 1.5 && yr >= 46 && yr <= (Math.abs(c.u - j.uc) < 0.5 ? 60 : 58)) {
        set(c.x, Y(yr), c.z, glas(j.b, yr), 'obergaden_fenster');
        continue;
      }
      let t, p;
      if (lai >= 0 && yr <= lai + 2) { t = T.serena; p = 'arkaden'; }     // Bogenlaibung
      else if (yr <= SCHEITEL + 1) { t = T.putz; p = 'arkaden'; }
      else { t = yr > aussenAb ? T.mauer : T.putz; p = 'obergaden'; }
      set(c.x, Y(yr), c.z, t, p);
    }
  }
  // Ballatoio: Gesims auf Konsolen über den Arkaden, |w| in [19, 20), Lage 41 (Konsolen 40 jede dritte Zelle)
  const ballatoioLuft = [];
  for (const c of D.haupt) {
    if (c.zone !== 'mittel') continue;
    const aw = Math.abs(c.w);
    if (aw < W_OBER_I - 1 || aw >= W_OBER_I) continue;
    if (c.u < U_FASSADE + 0.5 || c.u > U_QUER - 2.5) continue;
    set(c.x, Y(BALLATOIO), c.z, T.serena, 'ballatoio');
    if (c.ui % 3 === 0) set(c.x, Y(BALLATOIO - 1), c.z, T.serena, 'ballatoio');
    for (let yr = BALLATOIO + 1; yr <= BALLATOIO + 3; yr++) ballatoioLuft.push({ x: c.x, y: Y(yr), z: c.z });
  }

  // --- Modul 1, 4: Außenwände (d8 ≤ 3) und innere Wände (Ostwand, Kapellen-Trennwände, Chorwände)
  for (const c of D.haupt) {
    if (c.zone === 'fassade') continue;
    const top = dach.get(P.ck(c.x, c.z));
    const aussen = c.d8 <= 3;
    let innenWand = null;
    if (!aussen) {
      if (c.zone === 'ostwand') innenWand = 'kapellenwand';
      else if (c.zone === 'kapelle' || c.zone === 'chor') {
        const g = c.w < CHOR_W0 + 1 ? KAP_NORD : KAP_SUED;
        for (const b of g) if (Math.abs(c.w - b) < 1) innenWand = 'kapellen_trennwaende';
      }
    }
    if (!aussen && !innenWand) continue;
    const p = aussen
      ? (c.zone === 'seite' ? (c.w < 0 ? 'seitenwand_nord' : 'seitenwand_sued')
        : c.zone === 'chor' ? 'chor' : c.zone === 'kapelle' ? 'kapellen_aussen' : 'querhaus_waende')
      : innenWand;
    for (let yr = 1; yr < top; yr++) {
      const y = Y(yr);
      if (istFrei(c.x, y, c.z) || zellen.has(key(c.x, y, c.z))) continue;
      if (aussen && fensterAussen(c, yr)) {
        set(c.x, y, c.z, glas(c.ui + c.wi, yr), p === 'chor' ? 'chorfenster' : c.zone === 'seite' ? 'seitenfenster' : 'querhaus_fenster');
        continue;
      }
      if (innenWand === 'kapellenwand') {
        // Kapellenbögen (Lage 1..26), Triumphbogen zum Chor (Lage 1..48)
        if (c.w > CHOR_W0 + 2 && c.w < CHOR_W1 - 2) { if (yr <= spitz(36, 12, c.w - 7, 12)) continue; }
        else {
          const g = c.w < 0 ? KAP_NORD : KAP_SUED;
          let offen = false;
          for (let k = 0; k < 5; k++) {
            const a0 = g[k] + 1.5, a1 = g[k + 1] - 1.5;
            if (c.w >= a0 && c.w < a1 && yr <= spitz(18, 8, c.w - (a0 + a1) / 2, (a1 - a0) / 2)) offen = true;
          }
          // Ende des Nordarms hinter der Ostwand (w −76..−55): ein weiterer Kapellenbogen
          if (c.w >= -73 && c.w < -57 && yr <= spitz(18, 8, c.w + 65, 8)) offen = true;
          if (offen) continue;
        }
      }
      let t;
      if (aussen) t = c.d8 === 1 ? (yr <= 3 ? T.serena : T.forte) : c.d8 === 2 ? T.mauer : T.putz;
      else t = T.putz;
      set(c.x, y, c.z, t, p);
    }
  }

  // --- Modul 5: Dachhaut mit Schluss zu tieferen Nachbarn, Binder im Mittelschiff
  for (const c of D.haupt) {
    if (c.zone === 'fassade') continue;
    const top = dach.get(P.ck(c.x, c.z));
    let lo = top;
    for (const [dx, dz] of N8) {             // auch diagonal: sonst Diagonallücken in der Dachhaut (R14)
      const n = dachBei(c.x + dx, c.z + dz);
      if (n !== undefined && n < lo) lo = n;      // bis auf die Höhe des tieferen Nachbarn: Dachhaut ohne Diagonallücken
    }
    const p = c.zone === 'seite' ? 'dach_seitenschiffe' : c.zone === 'quer' ? 'dach_querhaus'
      : c.zone === 'kapelle' ? 'dach_kapellen' : c.zone === 'chor' ? 'dach_chor' : 'dach_mittelschiff';
    for (let yr = lo; yr <= top; yr++) {
      const y = Y(yr);
      if (zellen.has(key(c.x, y, c.z))) continue;
      set(c.x, y, c.z, yr === top ? T.ziegel : T.mauer, yr === top ? p : 'schildwaende');
    }
  }
  const binderLuft = [];
  // Binder (offener Dachstuhl): Zugbalken auf Traufhöhe und Streben unter der Dachhaut, alle 6 Blöcke
  for (const c of D.haupt) {
    if (c.zone !== 'mittel' && c.zone !== 'vierung') continue;
    if (Math.abs(c.w) >= W_OBER_I || ((c.ui % 6) + 6) % 6 > 1) continue; // 2 Zellen breit: im Weltraster flächig verbunden
    const top = dach.get(P.ck(c.x, c.z));
    set(c.x, Y(TRAUFE_M), c.z, T.holz, 'binder');
    if (top - 1 > TRAUFE_M) set(c.x, Y(top - 1), c.z, T.holz, 'binder');
    if (Math.abs(c.w) < 1) for (let yr = TRAUFE_M + 1; yr < top - 1; yr++) set(c.x, Y(yr), c.z, T.holz, 'binder'); // Hängesäule
    for (let yr = TRAUFE_M + 1; yr <= TRAUFE_M + 3; yr++) binderLuft.push({ x: c.x, y: Y(yr), z: c.z });
  }

  // --- Modul 7: Campanile
  const camp = campanile(D, set, frei, istFrei, oeffnung, unzug, zellen, key);

  // --- Modul 8: Ausstattung
  ausstattung(D, set, zellen, key, unzug);

  // Ballatoio-Luft: Laufgang ohne Zugang (Wartungsgang, Mauertreppen nicht modelliert)
  for (const z of ballatoioLuft) if (!zellen.has(key(z.x, z.y, z.z))) unzug('ballatoio', 'Ballatoio: Laufgang auf Konsolen über den Arkaden (Wartungsgang, Zugang durch Mauertreppen nicht modelliert)', z.x, z.y, z.z);

  for (const z of binderLuft) if (!zellen.has(key(z.x, z.y, z.z))) unzug('binder', 'Offener Dachstuhl: Oberseite der Zugbalken (kein Laufweg)', z.x, z.y, z.z);

  // Licht (Modul 8): Seelaternen im Boden, Raster ≤ 12 über allen Stehzellen der Kirche (BEGEHBARKEIT §1.5)
  const steh = [];
  for (const c of D.haupt) {
    const b = zellen.get(key(c.x, Y(0), c.z));
    if (!b || b.p !== 'bodenplatte') continue;
    if (zellen.has(key(c.x, Y(1), c.z)) || zellen.has(key(c.x, Y(2), c.z))) continue;
    steh.push({ x: c.x, y: Y(1), z: c.z });
  }
  const lichter = WZ.lichtRaster(steh, { abstand: 12 });
  const bodenListe = teile.get('bodenplatte');
  const weg = new Set();
  for (const l of lichter) { const k = key(l.x, l.y, l.z); const e = zellen.get(k); if (!e) continue; e.t = T.licht; e.p = 'licht'; weg.add(k); }
  teile.set('bodenplatte', bodenListe.filter((k) => !weg.has(k)));
  teile.set('licht', [...weg]);

  PLAN = { zellen, teile, oeff, unz, camp, istFrei };
  return PLAN;
}

// ------------------------------------------------------------------ Campanile (12 × 12, 78 m)
function campanile(D, set, frei, istFrei, oeffnung, unzug, zellen, key) {
  const lok = (c) => ({ iu: Math.floor(c.u - 221.8), iw: Math.floor(c.w - 44.9) });
  const rand = (c) => { const { iu, iw } = lok(c); return Math.min(iu, iw, 11 - iu, 11 - iw); };
  const TOP = 156, GLOCKE0 = 120, GLOCKE1 = 134, SPITZE0 = 140;
  const info = {};
  // 1. Wendeltreppe (Weltachsen, 5 × 5) im Inneren zuerst: Mitte so, dass alle Zellen innen liegen (nächst der Turmmitte)
  const innen = new Set();
  let sx = 0, sz = 0;
  for (const c of D.camp) if (rand(c) >= 2) { innen.add(P.ck(c.x, c.z)); sx += c.x; sz += c.z; }
  const mx = sx / innen.size, mz = sz / innen.size;
  let mitte = null, best = Infinity;
  for (const k of innen) {
    const x = P.ckX(k), z = P.ckZ(k);
    let ok = true;
    for (let dx = -2; dx <= 2 && ok; dx++) for (let dz = -2; dz <= 2; dz++) if (!innen.has(P.ck(x + dx, z + dz))) { ok = false; break; }
    const d = Math.hypot(x - mx, z - mz);
    if (ok && d < best) { best = d; mitte = { x, z }; }
  }
  if (!mitte) throw new Error('Campanile: kein Platz für die Wendeltreppe');
  const tr = WZ.treppe.wendeltreppe({ mitte, radiusInnen: 0, radiusAussen: 2, yVon: Y(0), yBis: Y(GLOCKE0), rolle: 'pietra_serena', drehsinn: 'rechts' });
  for (const l of WZ.treppe.treppenloch(tr.lauf, 3)) frei(l.x, l.y, l.z);
  // Kopffreiheit auch über den Eckpodesten unter dem Glockenstubenboden
  for (const b of tr) if (b.y >= Y(GLOCKE0) - 3 && b.y < Y(GLOCKE0)) for (let h = 1; h <= 3; h++) frei(b.x, b.y + h, b.z);
  for (const b of tr) if (b.y > Y(0)) set(b.x, b.y, b.z, b.typ, 'campanile_treppe');
  info.treppe = tr; info.mitte = mitte;

  // 2. Schaft, Glockenstube, Spitze
  for (const c of D.camp) {
    const { iu, iw } = lok(c);
    const r = rand(c);
    if (iu <= 1 && iw >= 4 && iw <= 6) for (let yr = 1; yr <= 4; yr++) oeffnung('tuer', 'campanile_schaft', c.x, Y(yr), c.z);
    const lang = (iu <= 1 || iu >= 10) ? iw : iu;
    for (let yr = 1; yr <= TOP; yr++) {
      const y = Y(yr);
      if (istFrei(c.x, y, c.z) || zellen.has(key(c.x, y, c.z))) continue;
      if (yr >= SPITZE0) {                       // Pyramidenspitze: Ring schrumpft alle 3 Lagen
        const s = Math.floor((yr - SPITZE0) / 3);
        if (r === s || r === s + 1 || (r > s && yr === SPITZE0)) set(c.x, y, c.z, yr > TOP - 3 ? T.bronze : T.ziegel, 'campanile_spitze');
        else if (r > s + 1) unzug('campanile_spitze', 'Hohlraum der Turmspitze über der Glockenstube', c.x, y, c.z);
        continue;
      }
      if (yr >= GLOCKE0 && yr <= GLOCKE1) {      // Glockenstube: zwei Bifore je Seite
        if (r <= 1) {
          const offen = yr >= GLOCKE0 + 3 && yr <= GLOCKE1 - 3 && ((lang >= 2 && lang <= 4) || (lang >= 7 && lang <= 9));
          if (offen) { oeffnung('fenster_offen', 'glockenstube', c.x, y, c.z); continue; }
          set(c.x, y, c.z, yr === GLOCKE1 ? T.serena : T.forte, 'glockenstube');
        } else if (yr === GLOCKE0) set(c.x, y, c.z, T.holz, 'glockenstube');
        else if (yr === GLOCKE1) set(c.x, y, c.z, T.serena, 'glockenstube');
        continue;
      }
      if (r > 1) { if (yr > GLOCKE1) unzug('campanile_spitze', 'Hohlraum der Turmspitze über der Glockenstube', c.x, y, c.z); continue; }
      const schlitz = yr % 20 >= 8 && yr % 20 <= 11 && (lang === 5 || lang === 6) && yr < GLOCKE0;
      set(c.x, y, c.z, schlitz ? T.fenster : (yr % 40 === 0 ? T.serena : T.forte), 'campanile_schaft');
    }
  }
  return info;
}

// ------------------------------------------------------------------ Ausstattung (Modul 8)
function ausstattung(D, set, zellen, key) {
  // 6 Altäre je Seitenschiff an der Außenwand (Joche 1..6), 4 breit, 2 tief, 3 hoch, Pietra serena
  for (const c of D.haupt) {
    if (c.zone !== 'seite' || c.d8 < 4 || c.d8 > 5) continue;
    const j = joch(c.u);
    if (j.b < 1 || Math.abs(c.u - j.uc) >= 3) continue;
    for (let yr = 1; yr <= 3; yr++) set(c.x, Y(yr), c.z, yr === 3 ? T.weiss : T.serena, 'altaere');
  }
  // Kanzel am dritten Pfeiler Süd (u 78,4): Marmorblock 3 × 3 auf Lage 5..7 an der Mittelschiffseite
  for (const c of D.haupt) {
    if (c.zone !== 'mittel' || c.w < 16 || c.w >= 19 || Math.abs(c.u - 78.4) > 1.5) continue;
    for (let yr = 5; yr <= 7; yr++) set(c.x, Y(yr), c.z, yr === 7 ? T.ornament : T.weiss, 'kanzel');
  }
  // Hochaltar im Chor
  for (const c of D.haupt) {
    if (c.zone !== 'chor' || Math.abs(c.u - 226) > 1 || Math.abs(c.w - 7) > 2) continue;
    for (let yr = 1; yr <= 3; yr++) set(c.x, Y(yr), c.z, yr === 3 ? T.gold : T.weiss, 'hauptaltar');
  }
}

// ------------------------------------------------------------------ Module aus dem Plan
const OEFF_TEIL = { portale: 'fassade_kern', nordportal: 'seitenwand_nord' };
/** modul(n, teile) -> { module, build(ctx) }: füllt die Bauteile in dieser Reihenfolge aus dem Plan, mit Öffnungen. */
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

module.exports = { modul, lade, zelleBei, plan, joch, dachLage, Y, BODEN_Y, T, JOCHE };
