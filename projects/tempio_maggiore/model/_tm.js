'use strict';
// Tempio Maggiore Israelitico (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/tempio_maggiore/).
// Bauplan als Spaltenmodell: jede Maskenzelle hat eine Spalte (Lagen 1..top), jede Lage ist Luft, Hohlraum oder Festes mit Bauteil.
// Rahmen θ = 32° (Ursprung (1483,5 | 0,5)): u von der Westfassade (Via Farini) zur Apsis im Osten, w nach Süden/rechts.
// Die sieben OSM-Teile liegen im Rahmen achsparallel: Mittelquadrat u 38..74 × w 12..48 mit dem Tambour (Kreis, Mitte (56,9 | 30,3)),
// Westarm (Hauptraum), Nord- und Südarm, Ostarm mit Apsis. Lagen yr = Y − 66.

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const PAL = require('../../../tools/spec/palette.js');
const P = require('../../../tools/city/poly.js');

const DIR = path.resolve(__dirname, '..');
const GRUND = require('../spec/ground.js');
const BODEN_Y = 66;
const Y = (yr) => BODEN_Y + yr;
const FR = (n) => WZ.fresko(n);
const GLAS = PAL.typesForRole('glas');
const glas = (a, b) => GLAS[Math.abs(a * 5 + b * 3) % GLAS.length];

const T = {
  trav: WZ.typ('putz_sand'), pomato: WZ.typ('putz_rosa'), mauer: WZ.typ('mauerwerk'), bruch: WZ.typ('pietra_forte_bruch'),
  pflaster: WZ.typ('pflaster'), serena: WZ.typ('pietra_serena'), weiss: WZ.typ('marmor_weiss'), orn: WZ.typ('marmor_ornament'),
  saeule: WZ.typ('marmor_saeule'), alt: WZ.typ('marmor_weiss_alt'), holz: WZ.typ('holz'), gold: WZ.typ('gold'), licht: WZ.typ('licht'),
  fenster: WZ.typ('glas_fenster'), kupfer: WZ.typ('marmor_gruen'), ziegel: WZ.typ('dachziegel'), dunkel: WZ.typ('kontrast_dunkel'),
  bronze: WZ.typ('bronze'), putz: WZ.typ('putz_weiss'), forte: WZ.typ('pietra_forte'), rot: WZ.typ('marmor_rot_alt')
};

// ------------------------------------------------------------------ Maße (Rahmen; Quelle und Stufen im Katalog)
const C0 = { u: 56.9, w: 30.3 };            // Mitte des Tambours (OSM-Teil w676106030)
const RI = 14.9, RO = 17.0;                 // lichter und äußerer Radius des Tambours (OSM-Kreis r ≈ 17)
const HP = 24;                              // Ansatz der Pendentifs
const TH = 11;                              // Tambourhöhe (lichte Luft)
const HD = 32;                              // Anstieg der Außenkuppel über dem Tambour
const SPITZE = 95;                          // Spitze der Kuppel: höchste Zellen auf Lage 94 (47 m, it.wikipedia)
const ROOF_C = 44;                          // Dach des Mittelquadrats (Ecken)
const RAUM = {
  vorhalle: { ceil: 27, top: 31 }, halle_w: { ceil: 27, top: 31 }, nord: { ceil: 22, top: 26 }, sued: { ceil: 22, top: 26 },
  chor: { ceil: 23, top: 27 }, annex: { ceil: 18, top: 22 }
};
const FASSADE_TOP = 38;
const GAL = { boden: 12, u: 16.0, wN: 19.7, wS: 40.9, pitch: 6 };    // Empore: Boden Lage 12, Pfeilerlinien

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const N8 = N4.concat([[1, 1], [1, -1], [-1, 1], [-1, -1]]);
const key = (x, y, z) => x + ',' + y + ',' + z;
const mod = (a, n) => ((a % n) + n) % n;

// Apsis (OSM-Teil w676106029) im Rahmen
const APSIS_POLY = [[84.4, 41.6], [83.4, 12.7], [89.1, 13.3], [93.3, 15.4], [97.8, 19.7], [99.1, 23.6], [99.3, 28.7], [98.2, 33.6], [93.8, 38.7], [88.0, 41.7]];
function inPoly(pg, u, w) {
  let r = false;
  for (let i = 0, j = pg.length - 1; i < pg.length; j = i++) {
    const a = pg[j], b = pg[i];
    if ((a[1] > w) !== (b[1] > w) && u < ((b[0] - a[0]) * (w - a[1])) / (b[1] - a[1]) + a[0]) r = !r;
  }
  return r;
}

// Türme: zwei Ecktürme der Westfassade
const TURM_N = { id: 'N', u: [-4, 14.7], w: [-3, 14.5] };
const TURM_S = { id: 'S', u: [-4, 14.7], w: [47.5, 65] };

let L = null;
function lade() {
  if (L) return L;
  const json = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
  const masken = WZ.ladeMasken(json, { dir: DIR });
  const R = masken.rahmen, H = masken.haupt;
  const cells = [];
  for (const [x, z] of H.cells) {
    const l = R.toLocal(x, z);
    const c = { x, z, u: l.u, w: l.w, dOut: H.d8(x, z), gt: GRUND.groundTopY(x, z), key: P.ck(x, z) };
    c.rho = Math.hypot(c.u - C0.u, c.w - C0.w);
    c.theta = Math.atan2(c.w - C0.w, c.u - C0.u);
    c.raum = raumVon(c);
    cells.push(c);
  }
  const byKey = new Map(cells.map((c) => [c.key, c]));
  for (const c of cells) {
    c.dPart = Infinity;
    if (c.tower) continue;
    for (const [dx, dz] of N8) {
      const n = byKey.get(P.ck(c.x + dx, c.z + dz));
      if (n && n.tower) continue;
      if (!n || n.raum !== c.raum) { c.dPart = 1; break; }
    }
  }
  for (const c of cells) c.wand = !c.tower && (c.dOut <= 2 || c.dPart <= 1 || c.raum === 'fuell');
  // Pendentifs: größter Abstand der freien Zellen des Mittelquadrats von der Mitte
  let rp = 0;
  for (const c of cells) if (c.raum === 'halle_c' && !c.wand) rp = Math.max(rp, c.rho);
  const RP = rp + 0.6;
  const HB = Math.floor(HP + Math.sqrt(RP * RP - RI * RI));
  const HTOP = HB + TH;
  L = { json, masken, R, H, cells, byKey, RP, HB, HTOP };
  return L;
}

function raumVon(c) {
  const { u, w } = c;
  const inT = (t) => u >= t.u[0] && u < t.u[1] && w >= t.w[0] && w < t.w[1];
  if (inT(TURM_N)) { c.tower = 'N'; return 'turm'; }
  if (inT(TURM_S)) { c.tower = 'S'; return 'turm'; }
  if (u < 10) return 'vorhalle';
  if (u < 38.5) return w < 12.2 || w >= 48.8 ? 'annex' : 'halle_w';
  if (u < 74.7) return w < 12.2 ? 'nord' : (w >= 48.2 ? 'sued' : 'halle_c');
  if (u < 84.5 && w >= 11.8 && w < 47.6) return 'chor';
  if (inPoly(APSIS_POLY, u, w)) return 'chor';
  if (w < 12.5) return 'annex';
  if (w >= 44.5) return 'annex';
  return 'fuell';
}

// ------------------------------------------------------------------ Höhen
const hs = (rho) => {                                       // Oberkante der Außenkuppel (Lage) in der Entfernung rho von der Mitte
  const D = lade();
  const f = Math.sqrt(Math.max(0, 1 - (rho / RO) * (rho / RO)));
  let h = D.HTOP + Math.floor(HD * f);
  if (rho < 2.4) h = Math.max(h, SPITZE - Math.floor(rho * 3));
  return h;
};
const innenA = (rho) => lade().HTOP + Math.floor(Math.sqrt(Math.max(0, RI * RI - rho * rho)));   // Luft unter der Innenkuppel
const pendA = (rho) => { const D = lade(); return Math.min(D.HB, Math.floor(HP + Math.sqrt(Math.max(0, D.RP * D.RP - rho * rho)))); };
const istFassade = (c) => c.raum === 'vorhalle' && c.u < 3.4 && c.wand;

function baseTop(c) {                                        // Dachlage ohne Rücksicht auf höhere Nachbarwände
  if (c.tower) return 0;
  if (istFassade(c)) return FASSADE_TOP;
  if (c.raum === 'halle_c') return c.rho <= RO ? hs(c.rho) : ROOF_C;
  if (c.raum === 'fuell') return RAUM.chor.top;
  return RAUM[c.raum].top;
}
function topOf(c) {
  if (c._top !== undefined) return c._top;
  const D = lade();
  let t = baseTop(c);
  if (c.wand && !(c.raum === 'halle_c' && c.rho <= RO)) {
    for (const [dx, dz] of N8) {
      const n = D.byKey.get(P.ck(c.x + dx, c.z + dz));
      if (!n || n.tower) continue;
      const nb = n.raum === 'halle_c' && n.rho <= RO ? ROOF_C : baseTop(n);
      if (nb > t) t = nb;
    }
  }
  c._top = t;
  return t;
}

// ------------------------------------------------------------------ Öffnungen in Wänden
const PORTALE = [20.5, 31.0, 41.5];
const hufeisen = (dw, yr, r, cy, hals) => Math.hypot(dw, yr - cy) <= r || (yr <= cy && Math.abs(dw) <= hals);
function openAt(c, yr) {
  if (!c.wand || c.tower) return false;
  const { u, w, raum } = c;
  // Portale der Fassade (drei Hufeisenbögen)
  if (istFassade(c) && u < 4.6) for (const wc of PORTALE) if (hufeisen(w - wc, yr, 3.7, 7.2, 3.2)) return true;
  // Trennwand Vorhalle / Hauptraum: drei Hufeisentüren und darüber drei Öffnungen zur Empore
  if ((raum === 'vorhalle' || raum === 'halle_w') && u >= 7.8 && u < 11.8 && !c.dOutRand) {
    for (const wc of PORTALE) {
      if (hufeisen(w - wc, yr, 3.2, 6.0, 2.7)) return true;
      if (yr >= 13 && yr <= 20 + Math.floor(1.2 * Math.sqrt(Math.max(0, 1 - ((w - wc) / 2.6) ** 2))) && Math.abs(w - wc) < 2.6) return true;
    }
  }
  // große Bögen: Westarm - Mittelquadrat, Mittelquadrat - Chor, Mittelquadrat - Nordarm / Südarm
  const bogen = (dw, a, y0) => Math.abs(dw) < a && yr <= y0 + Math.floor(Math.sqrt(a * a - dw * dw));
  if ((raum === 'halle_w' || raum === 'halle_c') && u >= 36.6 && u < 41 && bogen(w - C0.w, 9.8, 11)) return true;
  if ((raum === 'halle_c' || raum === 'chor') && u >= 72.2 && u < 77 && bogen(w - C0.w, 10.5, 10)) return true;
  if ((raum === 'halle_c' || raum === 'nord') && w >= 10.4 && w < 15.4 && u >= 38 && u < 74 && bogen(u - C0.u, 10, 9)) return true;
  if ((raum === 'halle_c' || raum === 'sued') && w >= 45.4 && w < 50.6 && u >= 38 && u < 74 && bogen(u - C0.u, 10, 9)) return true;
  // Türen zu den Nebenräumen
  const tuer = (a, b, a0, a1, h) => a >= a0 && a < a1 && yr <= h && yr >= 1 && b;
  if ((raum === 'halle_w' || raum === 'annex') && u >= 23.5 && u < 28 && ((w >= 10.0 && w < 15.0) || (w >= 45.6 && w < 50.4)) && yr <= 6) return true;
  if ((raum === 'chor' || raum === 'annex') && u >= 78 && u < 82.5 && ((w >= 10.0 && w < 14.6) || (w >= 44.6 && w < 49.2)) && yr <= 6) return true;
  if ((raum === 'nord' || raum === 'annex') && w >= -3 && w < 12.5 && u >= 72.6 && u < 77 && yr <= 6 && w > 3 && w < 8) return true;
  if ((raum === 'sued' || raum === 'annex') && w >= 48 && u >= 72.6 && u < 77 && yr <= 6 && w > 52 && w < 57) return true;
  void tuer;
  return false;
}

// ------------------------------------------------------------------ Empore
function galTyp(c) {                                         // 'pfeiler' | 'bay' | 'galerie' | null (nur vorhalle und halle_w)
  if (c.raum !== 'vorhalle' && c.raum !== 'halle_w') return null;
  const { u, w } = c;
  if (w < 14.5 || w > 47.7) return null;
  const linieW = u >= GAL.u && u < GAL.u + 1.6 && c.raum === 'halle_w' && w >= GAL.wN && w < GAL.wS + 1.6;
  const linieN = w >= GAL.wN && w < GAL.wN + 1.6 && u >= GAL.u && u < 38;
  const linieS = w >= GAL.wS && w < GAL.wS + 1.6 && u >= GAL.u && u < 38;
  if (linieW || linieN || linieS) {
    const s = linieW ? w : u;
    return mod(s - 16, GAL.pitch) < 2 ? 'pfeiler' : 'bay';
  }
  if (u < GAL.u) return 'galerie';
  if (w < GAL.wN && u >= GAL.u) return 'galerie';
  if (w >= GAL.wS + 1.6 && u >= GAL.u) return 'galerie';
  return null;
}
const bayX = (c) => { const s = (galTyp(c) === 'bay' && c.u >= GAL.u && c.u < GAL.u + 1.6 && c.raum === 'halle_w') ? c.w : c.u; return mod(s - 16, GAL.pitch) - 4; };

// ------------------------------------------------------------------ Spalten
const DESC = new Map();
const D_ = (p, k) => { const id = p + '|' + k; let d = DESC.get(id); if (!d) DESC.set(id, d = { s: 's', p, k }); return d; };
const AIR = { s: 'air' }, CAV = { s: 'cav' };

function buildCol(c) {
  if (c.col !== undefined) return c.col;
  const top = topOf(c);
  const arr = new Array(top + 2).fill(null);
  const fill = (y0, y1, d) => { for (let y = Math.max(1, y0); y <= Math.min(top, y1); y++) arr[y] = d; };
  const air = (y0, y1) => { for (let y = Math.max(1, y0); y <= Math.min(top, y1); y++) arr[y] = AIR; };
  c.col = arr; arr.top = top;
  if (c.tower) { c.col = null; return null; }
  if (c.raum === 'fuell') { fill(1, top, D_('mauerkern', 'kern')); return arr; }
  const kuppel = c.raum === 'halle_c' && c.rho <= RO;
  if (c.wand && !kuppel) {
    fill(1, top, D_('wand', 'wand'));
    for (let y = 1; y <= top; y++) if (openAt(c, y)) arr[y] = AIR;
    return arr;
  }
  if (c.raum === 'halle_c') {
    const D = lade();
    const rho = c.rho;
    const nbs = N8.map(([dx, dz]) => D.byKey.get(P.ck(c.x + dx, c.z + dz))).filter((n) => n && !n.tower);
    const nTop = (n) => (n.raum === 'halle_c' && n.rho <= RO ? hs(n.rho) : topOf(n));
    if (!kuppel) {                                           // Ecken des Mittelquadrats: Pendentifs und Dach
      const a = pendA(rho);
      air(1, a); fill(a + 1, top - 1, D_('gewoelbe', 'gew')); fill(top, top, D_('daecher', 'dach'));
      return arr;
    }
    if (c.wand) {                                            // Wandzelle im Kreis: Bogenöffnung, sonst massiv bis zum Tambour
      fill(1, D.HTOP, D_('wand', 'wand'));
      for (let y = 1; y <= D.HTOP; y++) if (openAt(c, y)) arr[y] = AIR;
    } else if (rho < RI) {                                   // Innenkuppel: Luft bis A, Schale darüber, Hohlraum, Außenschale
      const A = innenA(rho);
      air(1, A);
      let sTop = A + 2;
      for (const n of nbs) if (n.raum === 'halle_c' && !n.wand && n.rho < RI) sTop = Math.max(sTop, innenA(n.rho) + 1);
      fill(A + 1, sTop, D_('kuppel', 'innen'));
      let cHi = top - 2;
      for (const n of nbs) cHi = Math.min(cHi, nTop(n) - 1);
      for (let y = sTop + 1; y <= cHi; y++) arr[y] = CAV;
      fill(Math.max(sTop + 1, cHi + 1), top, D_('kuppel', 'aussen'));
      return arr;
    } else {                                                 // Tambourring über den Pendentifs
      const a = pendA(rho);
      air(1, a); fill(a + 1, ROOF_C, D_('gewoelbe', 'gew')); fill(ROOF_C + 1, D.HTOP, D_('tambour', 'ring'));
    }
    let cHi = top - 2;                                       // über dem Tambour: Hohlraum zwischen den Schalen, Außenschale
    for (const n of nbs) cHi = Math.min(cHi, nTop(n) - 1);
    for (let y = D.HTOP + 1; y <= cHi; y++) arr[y] = CAV;
    fill(Math.max(D.HTOP + 1, cHi + 1), top, D_('kuppel', 'aussen'));
    return arr;
  }
  // Räume mit Decke
  const r = RAUM[c.raum];
  const g = galTyp(c);
  const ceil = r.ceil;
  if (g === 'pfeiler') { fill(1, ceil - 1, D_('empore', 'pfeiler')); }
  else if (g === 'bay') {
    const x = bayX(c), ah = 6 + Math.floor(Math.sqrt(Math.max(0, 4.01 - x * x)));
    air(1, ah); fill(ah + 1, GAL.boden, D_('empore', 'arkade')); fill(GAL.boden + 1, GAL.boden + 2, D_('empore', 'gelaender'));
    air(GAL.boden + 3, ceil - 1);
  } else if (g === 'galerie') {
    air(1, GAL.boden - 1); fill(GAL.boden, GAL.boden, D_('empore', 'boden')); air(GAL.boden + 1, ceil - 1);
  } else air(1, ceil - 1);
  fill(ceil, top - 1, D_('gewoelbe', 'gew')); fill(top, top, D_('daecher', 'dach'));
  return arr;
}

// ------------------------------------------------------------------ Zustand einer Zelle
function zustand(c, y) {
  if (!c) return 'out';
  if (c.tower) return 'tower';
  const a = buildCol(c);
  if (y < 1) return 's';
  if (y > a.top) return 'out';
  const d = a[y];
  return d === null ? 'air' : (d.s === 'air' ? 'air' : d.s === 'cav' ? 'cav' : 's');
}

// ------------------------------------------------------------------ Fenster (Glas in Wandzellen)
function fensterAt(c, y) {
  const { u, w } = c;
  if (!c.wand) return null;
  const hoeh = (y0, y1, rund, along, per, a) => y >= y0 && y <= y1 + rund(along);
  void hoeh;
  // Fassade: Ajimez-Paare über den Portalen
  if (istFassade(c) && u < 4.6 && y >= 14 && y <= 23) for (const wc of PORTALE) for (const o of [-1.7, 1.7]) {
    const dw = w - wc - o;
    if (Math.abs(dw) <= 1.0 && y <= 20 + Math.floor(2.4 * Math.sqrt(Math.max(0, 1 - dw * dw)))) return glas(Math.round(w), y);
  }
  if (istFassade(c) && u < 4.6 && y >= 25 && y <= 28 && Math.abs(w - 31) < 3) return glas(Math.round(w), y);
  // Chor und Apsis: hohe Rundbogenfenster in der Außenwand
  if (c.raum === 'chor' && c.dOut <= 2) {
    const ang = Math.atan2(c.w - 27.5, c.u - 86) * 180 / Math.PI, s = mod(ang, 18) - 9;
    const lang = c.u > 84.5 ? Math.abs(s) * 0.34 : Math.abs(mod(c.u, 6) - 3) * 1;
    if (c.u > 84.5 && Math.abs(s) < 3.2 && y >= 5 && y <= 14 + Math.floor(2 * Math.sqrt(Math.max(0, 1 - (s / 3.2) ** 2)))) return glas(Math.round(ang), y);
    if (c.u <= 84.5 && lang < 1.1 && y >= 5 && y <= 14) return glas(Math.round(c.u), y);
  }
  if ((c.raum === 'nord' || c.raum === 'sued') && c.dOut <= 2) {
    const dx = mod(u - 41, 8) - 4;
    if (Math.abs(dx) < 1.5 && y >= 5 && y <= 14 + Math.floor(2 * Math.sqrt(Math.max(0, 1 - (dx / 1.5) ** 2)))) return glas(Math.round(u), y);
  }
  if (c.raum === 'annex' && c.dOut <= 2 && y >= 5 && y <= 11) {
    const s = c.dOut <= 2 && (c.w < 12.5 && c.w > 5 || c.w > 44) ? c.u : c.w;
    if (Math.abs(mod(s, 7) - 3.5) < 1.1) return glas(Math.round(s), y);
  }
  // Oberlicht des Hauptraums über den Dächern der Nebenräume
  if (c.raum === 'halle_w' && y >= 23 && y <= 26 && u > 18 && u < 36 && Math.abs(mod(u - 18, 6) - 3) < 1.2) {
    const D = lade();
    for (const [dx, dz] of N4) { const n = D.byKey.get(P.ck(c.x + dx, c.z + dz)); if (!n || (!n.tower && topOf(n) < y)) return glas(Math.round(u), y); }
  }
  return null;
}
const TAMBOUR_FENSTER = 16;
function tambourFenster(c, y) {
  const D = lade();
  if (y < ROOF_C + 1 || y > D.HTOP - 1) return null;
  const step = (2 * Math.PI) / TAMBOUR_FENSTER;
  const d = mod(c.theta, step) - step / 2;
  return Math.abs(c.rho * Math.sin(d)) < 1.15 && Math.abs(d) < step / 2 ? glas(Math.round(c.theta * 10), y) : null;
}

// ------------------------------------------------------------------ Materialien
function streifen(y) { return (Math.floor((y - 1) / 2) % 2) ? T.pomato : T.trav; }
function arabeske(c, y) {
  if (y <= 2) return T.serena;
  if (y % 9 === 0) return T.gold;
  const m = mod(Math.floor(c.u + c.w) + y, 6);
  return m === 0 ? T.gold : m <= 2 ? FR('rot') : m <= 4 ? FR('blau') : FR('weiss');
}
function deckenfresko(c) {
  const sterne = mod(Math.floor(c.u), 4) === 0 && mod(Math.floor(c.w), 4) === 0;
  return sterne ? T.gold : ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? FR('blau') : FR('hellblau'));
}
function pendentifFresko(c) {
  const b = Math.floor(c.rho / 1.5);
  return b % 4 === 0 ? T.gold : b % 4 === 1 ? FR('rot') : b % 4 === 2 ? FR('blau') : FR('rot');
}
function kuppelFresko(c, y) {
  const seg = Math.floor(((c.theta + Math.PI) / (2 * Math.PI)) * 16), ring = Math.floor(c.rho / 2.5);
  if (ring === 0) return T.gold;
  if ((y + ring) % 6 === 0) return T.gold;
  return ((seg + ring) & 1) ? FR('blau') : FR('rot');
}
function bodenTyp(c) {
  if (c.raum === 'halle_c' || c.raum === 'halle_w') {
    // Stern aus schwarzem und gelbem Marmor unter der Kuppel (it.wikipedia: Mattir Assurim)
    if (c.raum === 'halle_c' && c.rho < 11) {
      const rs = 3.2 + 7.5 * Math.pow(Math.abs(Math.cos(4 * (c.theta - Math.PI / 8))), 2.2);
      if (c.rho <= rs) return c.rho < rs * 0.55 ? FR('schwarz') : FR('gelb');
    }
    return ((Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1) ? T.serena : T.weiss;
  }
  if (c.raum === 'vorhalle') return ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1) ? T.pflaster : T.orn;
  if (c.raum === 'chor') return ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1) ? T.weiss : T.rot;
  if (c.tower) return T.bruch;
  return T.pflaster;
}

function matOf(c, y, d) {
  const D = lade();
  const N = N4.map(([dx, dz]) => D.byKey.get(P.ck(c.x + dx, c.z + dz)));
  const expo = () => N.some((n, i) => zustand(n, y) === 'out');
  const innen = () => N.some((n) => zustand(n, y) === 'air') || zustand(c, y - 1) === 'air' && false;
  const unten = zustand(c, y - 1) === 'air';
  switch (d.p) {
    case 'wand': {
      const gl = fensterAt(c, y); if (gl) return { t: gl, p: 'fenster' };
      const e = expo();
      if (e) {
        const top = topOf(c);
        if (y === top) return { t: T.serena, p: istFassade(c) ? 'fassade' : 'aussenwaende' };
        if (istFassade(c)) {
          for (const wc of PORTALE) {                          // Keilsteine des Hufeisenbogens im Wechsel
            const dw = c.w - wc, r = Math.hypot(dw, y - 7.2);
            if (y >= 6 && r > 3.7 && r < 5.2) return { t: (Math.floor(Math.atan2(dw, y - 7.2) * 5) & 1) ? T.pomato : T.trav, p: 'fassade' };
          }
          return { t: streifen(y), p: 'fassade' };
        }
        return { t: streifen(y), p: 'aussenwaende' };
      }
      if (innen() || unten) return { t: arabeske(c, y), p: 'wandmalerei' };
      return { t: T.mauer, p: 'mauerkern' };
    }
    case 'mauerkern': return { t: T.mauer, p: 'mauerkern' };
    case 'gewoelbe': {
      if (unten) return { t: c.raum === 'halle_c' ? pendentifFresko(c) : deckenfresko(c), p: c.raum === 'halle_c' ? 'pendentifs' : 'deckenmalerei' };
      if (innen()) return { t: c.raum === 'halle_c' ? pendentifFresko(c) : T.putz, p: c.raum === 'halle_c' ? 'pendentifs' : 'gewoelbe' };
      return { t: T.mauer, p: 'gewoelbe' };
    }
    case 'daecher': return { t: T.ziegel, p: 'daecher' };
    case 'empore': {
      if (d.k === 'pfeiler') return { t: y % 8 === 0 ? T.orn : T.saeule, p: 'empore' };
      if (d.k === 'arkade') return { t: (y === GAL.boden) ? T.orn : T.alt, p: 'empore' };
      if (d.k === 'gelaender') return { t: T.dunkel, p: 'empore' };
      return { t: ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1) ? T.holz : T.orn, p: 'empore' };
    }
    case 'tambour': {
      const tf = tambourFenster(c, y); if (tf) return { t: tf, p: 'tambour_fenster' };
      if (zustand(c, y - 1) === 'air' || N.some((n) => zustand(n, y) === 'air')) return { t: kuppelFresko(c, y), p: 'kuppel_fresko' };
      if (expo()) return { t: streifen(y), p: 'tambour' };
      return { t: T.mauer, p: 'tambour' };
    }
    case 'kuppel': {
      if (d.k === 'innen') {
        const luft = unten || N.some((n) => zustand(n, y) === 'air') || zustand(c, y + 1) === 'air';
        return luft ? { t: kuppelFresko(c, y), p: 'kuppel_fresko' } : { t: T.ziegel, p: 'kuppelschale' };
      }
      if (y >= SPITZE - 2 && c.rho < 1.3) return { t: T.gold, p: 'laterne' };
      if (c.rho < 2.4 && y > hs(Math.max(c.rho, 2.4))) return { t: T.kupfer, p: 'laterne' };
      return { t: ((Math.floor(c.theta * 16 / Math.PI + 16) % 2) && c.rho > 1) ? T.kupfer : T.kupfer, p: 'kuppel_aussen' };
    }
    default: return { t: T.mauer, p: d.p };
  }
}

module.exports = {
  lade, buildCol, zustand, matOf, bodenTyp, topOf, hs, innenA, pendA, openAt, galTyp, istFassade, fensterAt, tambourFenster,
  Y, BODEN_Y, T, FR, glas, C0, RI, RO, HP, TH, HD, SPITZE, ROOF_C, RAUM, GAL, PORTALE, TURM_N, TURM_S, N4, N8, key, mod, AIR, CAV
};
