'use strict';
// Modul 3: Vierung, Tribunen, Sakristeien (BAUTEIL_KATALOG, Modul 3).
// Aufbau: Vierungsachteck mit vier großen Bögen und zwei Sakristeitüren, drei identische Tribunen
// (eine Funktion in lokalen Koordinaten (a, w), per Drehung auf Nord/Ost/Süd abgebildet),
// vier Eckbauten und vier Exedra-Sockel unter den "tribune morte" von Modul 4.
const D = require('../spec/dimensions.js');
const { inExedra } = require('../spec/interfaces.js');
const { inOctagon } = require('../geom/shapes.js');
const { archHeight, archOpening } = require('../geom/arches.js');
const { rho, connectEdges } = require('../geom/vaults.js');
const { surface } = require('../geom/roofs.js');
const patterns = require('../geom/patterns.js');

const L = D.LEVELS;
const C = D.CATHEDRAL;

// --- Maße aus dimensions.js -------------------------------------------------
const WALK = L.walkY;                        // 65
const RING_OUT = C.crossing.outerHalfFlat;   // 54, Außenapothem des Vierungsachtecks
const RING_IN = C.crossing.innerHalfFlat - 1; // 44, Innenraum bis a = 44 (Wand ab 45)
const TOP_Y = C.crossing.archTopY;           // 148
const TC = C.tribunes.centerDist;            // 59
const TA = C.tribunes.outerApothem;          // 37
const TI = C.tribunes.innerApothem;          // 19
const CHAPEL_TOP_Y = C.tribunes.chapelRoofY; // 104
const TRIB_TOP_Y = C.tribunes.tribuneRoofY;  // 130

// --- Lokale Ableitungen und Katalogwerte (BAUTEIL_KATALOG, Modul 3) -----------------
// Große Bögen: Halbweite = Seitenhalbmaß 45·tan 22,5° = 18,6 → 18, minus 1 Kante = 17
const ARCH_HALF = Math.floor(C.crossing.innerHalfFlat * Math.tan(Math.PI / 8)) - 1;
const ARCH_SPRING_Y = 113, ARCH_CROWN_Y = 140;
const GESIMS_Y = 112;                        // Kämpfergesims, eine Lage unter dem Kämpfer
// Sakristeitüren: Halbweite 2 (stetig 2,5), Kämpfer Y 75, Rundbogen (f 0,5)
const DOOR_HALF = 2.5, DOOR_SPRING_Y = 75, DOOR_FRAME = 1;
const DOOR_LEAF_N = [49, 50];                // Türblatt in der Wandmitte (Achteck-Norm)
// Kapellen: Halbbreite 5, Tiefe ρ 20..31, Öffnung Kämpfer 84 (f 0,8), Gewölbe 90 → 98
const CH_HALF = 5, CH_P0 = 20, CH_P1 = 31;
const CH_ARCH_SPRING_Y = 84, CH_ARCH_F = 0.8;
const CH_VAULT_SPRING_Y = 90, CH_VAULT_CROWN_Y = 98;
const CH_PMIN = CH_P0 - 0.5, CH_PMAX = CH_P1 + 0.5;       // Zellmitten-Grenzen der Kapelle
const CH_PMID = (CH_PMIN + CH_PMAX) / 2;                  // 25,5
const CH_FRONT = 1.5;                        // Frontwand der Kapelle (ρ 20..21, 2 Zellen: auch diagonal flächig verbunden)
const CH_WIN_HALF = 1, CH_WIN_Y0 = 78, CH_WIN_Y1 = 92;
const WIN_GLASS_P = [33.5, 34.5];            // Glasebene in der Außenmauer (ρ 32..37)
// Obergaden: Wand ρ 20..25, Rundfenster r 3 bei Y 118
const OB_P1 = 25, OB_R = 3, OB_CY = 118;
// Tribunengewölbe: Kämpfer 102, Scheitel 125
const VAULT_SPRING_Y = 102, VAULT_CROWN_Y = 125;
// Dächer: Kapellendach 110 bei ρ 26 → 105 bei ρ 37; Tribunendach 131 bei ρ 25 → 136 bei ρ 5
const R1_RHO0 = OB_P1 + 1, R1_RHO1 = TA, R1_Y0 = 110, R1_Y1 = 105;
const R2_RHO0 = OB_P1, R2_Y0 = TRIB_TOP_Y + 1;
const R2_RHO1 = TC - RING_OUT;               // 5: Abstand Tribunenmitte → Vierungswand (a = 54)
const R2_Y1 = 136;
// Eckbauten / Sakristeien
const ECK_DIAG = 98;                         // Diagonalgrenze des Ostkomplexes (wie Modul 0)
const ECK_WALL_R = 4.3;                      // Wandstärke 4 (euklidisch, damit Diagonalen ähnlich dick sind)
const ECK_ROOM_TOP_Y = 100, ECK_SLAB_Y0 = 101, ECK_ROOF_Y = 104;
const SAK_SPRING_Y = 88, SAK_CROWN_Y = 99;
// Exedra-Sockel
const SOCKEL_Y0 = 105;
// Schalenmauerwerk (A1): Schalen 2, Binderlage alle 12, oberste 3 Lagen voll
const SHELL = 2, BINDER = 12, TOP_FULL = 3;
// Inkrustation (wie Modul 1)
const PANEL_W = 9, PANEL_H = 12, FRAME_W = 1;

const S2 = Math.SQRT1_2;

// Profilfaktor nach Regel A5: f = ((rise / w)² + 1) / 4 (kleiner Zuschlag gegen Rundungsfehler)
const profileFactor = (rise, w) => (((rise + 1e-6) / w) ** 2 + 1) / 4;

// ============================================================================
// Hilfen: Schalenmauerwerk (hohler Kern)
// ============================================================================
// Erosion eines Voxelfeldes um Radius r (Chebyshev); außerhalb gilt als leer.
function erode(src, nx, ny, nz, r) {
  const n = src.length;
  const sy = nx * nz;
  const run = (a, base, stride, len, dst, pre) => {
    pre[0] = 0;
    for (let i = 0; i < len; i++) pre[i + 1] = pre[i] + a[base + i * stride];
    for (let i = r; i < len - r; i++) {
      if (pre[i + r + 1] - pre[i - r] === 2 * r + 1) dst[base + i * stride] = 1;
    }
  };
  const pre = new Int32Array(Math.max(nx, ny, nz) + 1);
  let a = src;
  let b = new Uint8Array(n);
  for (let y = 0; y < ny; y++) for (let z = 0; z < nz; z++) run(a, (y * nz + z) * nx, 1, nx, b, pre);
  a = b; b = new Uint8Array(n);
  for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) run(a, y * sy + x, nx, nz, b, pre);
  a = b; b = new Uint8Array(n);
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) run(a, z * nx + x, sy, ny, b, pre);
  return b;
}

// Aufweitung (Dilatation) um Radius r; Gegenstück zu erode()
function dilate(src, nx, ny, nz, r) {
  const n = src.length;
  const sy = nx * nz;
  const run = (a, base, stride, len, dst) => {
    for (let i = 0; i < len; i++) {
      if (!a[base + i * stride]) continue;
      for (let j = Math.max(0, i - r); j <= Math.min(len - 1, i + r); j++) dst[base + j * stride] = 1;
    }
  };
  let a = src;
  let b = new Uint8Array(n);
  for (let y = 0; y < ny; y++) for (let z = 0; z < nz; z++) run(a, (y * nz + z) * nx, 1, nx, b);
  a = b; b = new Uint8Array(n);
  for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) run(a, y * sy + x, nx, nz, b);
  a = b; b = new Uint8Array(n);
  for (let z = 0; z < nz; z++) for (let x = 0; x < nx; x++) run(a, z * nx + x, sy, ny, b);
  return b;
}

/**
 * Hohler Kern nach A1. `solid(x, y, z)` beschreibt die Masse. Kern = Zellen mit Abstand ≥ 3 zu jeder
 * leeren Zelle (Schale 2), und zwar nur dort, wo die Masse mindestens 7 stark ist (Wände < 7 sind massiv).
 * Binderlagen (alle 12) und die obersten 3 Lagen bleiben voll. Liefert (x, y, z) → hohl?
 */
function hollowCells({ x0, x1, y0, y1, z0, z1, solid, yBase, yTop }) {
  const nx = x1 - x0 + 1, ny = y1 - y0 + 1, nz = z1 - z0 + 1;
  const n = nx * ny * nz;
  const idx = (x, y, z) => ((y - y0) * nz + (z - z0)) * nx + (x - x0);
  const S = new Uint8Array(n);
  for (let y = y0; y <= y1; y++) {
    for (let z = z0; z <= z1; z++) {
      for (let x = x0; x <= x1; x++) if (solid(x, y, z)) S[idx(x, y, z)] = 1;
    }
  }
  const E2 = erode(S, nx, ny, nz, SHELL);
  const E3 = erode(S, nx, ny, nz, SHELL + 1);
  // Kern nur dort, wo die Masse mindestens 7 stark ist: E2 ∩ (E3 um 1 aufgeweitet)
  const hol = dilate(E3, nx, ny, nz, 1);
  for (let i = 0; i < n; i++) if (!E2[i]) hol[i] = 0;
  return (x, y, z) => {
    if (x < x0 || x > x1 || y < y0 || y > y1 || z < z0 || z > z1) return false;
    if ((y - yBase) % BINDER === 0 || y > yTop - TOP_FULL) return false;
    return hol[idx(x, y, z)] === 1;
  };
}

// ============================================================================
// Vierungsachteck
// ============================================================================
const octN = (ax, az) => {            // kleinstes a mit inOctagon(ax, az, a)
  let a = Math.max(ax, az);
  while (ax + az > Math.floor(a * Math.SQRT2 + 0.5)) a++;
  return a;
};
// Fläche des Achtecks: Flachseite (flat) mit seitlicher Koordinate t = |w|, sonst Diagonale mit t entlang der Fläche
const faceInfo = (ax, az) => (Math.max(ax, az) >= (ax + az) * S2
  ? { flat: true, t: Math.min(ax, az) }
  : { flat: false, t: Math.abs(ax - az) * S2 });

// Inkrustation: Felder um die Flächenmitte (t = 0) zentriert, daher an der Mitte gespiegelt
function incrust(t, y) {
  const PU = PANEL_W + FRAME_W, PV = PANEL_H + FRAME_W;
  const half = (PANEL_W + FRAME_W) / 2;
  const s = Math.floor(t + half);
  const m = s % PU;
  const v = y - WALK;
  const lv = ((v % PV) + PV) % PV;
  if (m === 0 || lv === 0) return 'dark_prismarine';
  const iu = Math.floor(s / PU), iv = Math.floor(v / PV);
  if ((iu + iv) % 2 === 0) {
    const du = m - half, dv = lv - (FRAME_W + (PANEL_H - 1) / 2);
    if (Math.abs(du) + Math.abs(dv) <= Math.min(PANEL_W, PANEL_H) / 4) return 'polished_granite';
  }
  return 'smooth_quartz';
}

// Bogenöffnung (u ≥ 0 = |seitlicher Abstand|, y)
const ARCH_F = profileFactor(ARCH_CROWN_Y - ARCH_SPRING_Y, ARCH_HALF + 0.5);
const ARCH_SET = new Set();
for (const c of archOpening(ARCH_HALF, ARCH_F, { springV: 0 })) if (c.u >= 0) ARCH_SET.add(c.u + ',' + c.v);
const archOpen = (u, y) => u <= ARCH_HALF && (y < ARCH_SPRING_Y || ARCH_SET.has(u + ',' + (y - ARCH_SPRING_Y)));
const nearArch = (u, y) => {
  if (archOpen(u, y)) return false;
  for (let du = -1; du <= 1; du++) {
    for (let dy = -1; dy <= 1; dy++) if ((du || dy) && archOpen(Math.abs(u + du), y + dy)) return true;
  }
  return false;
};
// Öffnung in der Vierungswand (alle vier Achsen gleich)
const ringOpen = (x, y, z) => {
  const ax = Math.abs(x), az = Math.abs(z);
  if (ax >= RING_IN + 1 && az <= ARCH_HALF) return archOpen(az, y);
  if (az >= RING_IN + 1 && ax <= ARCH_HALF) return archOpen(ax, y);
  return false;
};

// Tür auf den Diagonalseiten: 'open' (Durchgang) | 'frame' (Laibung) | null
const doorShape = (t, y, w) => t <= w && (y < DOOR_SPRING_Y || y + 0.5 <= DOOR_SPRING_Y + archHeight(t, w, 0.5));
function doorClass(ax, az, y) {
  const f = faceInfo(ax, az);
  if (f.flat) return null;
  if (doorShape(f.t, y, DOOR_HALF)) return 'open';
  if (doorShape(f.t, y, DOOR_HALF + DOOR_FRAME)) return 'frame';
  return null;
}

const inRing = (x, z) => inOctagon(x, z, RING_OUT) && !inOctagon(x, z, RING_IN);
function ringSolid(x, y, z) {
  if (y < WALK || y > TOP_Y || !inRing(x, z)) return false;
  if (ringOpen(x, y, z)) return false;
  return doorClass(Math.abs(x), Math.abs(z), y) === null;
}

function ringMaterial(x, y, z) {
  const ax = Math.abs(x), az = Math.abs(z);
  const n = octN(ax, az);
  const f = faceInfo(ax, az);
  if (f.flat && (n === RING_IN + 1 || n === RING_OUT) && nearArch(f.t, y)) {
    return (f.t + y) % 2 === 0 ? 'smooth_quartz' : 'dark_prismarine';   // Keilsteine
  }
  if (n === RING_OUT) return incrust(f.t, y);
  if (n >= RING_IN + 3) return 'stone_bricks';
  return 'smooth_stone';                                                // Pietra serena innen
}

let ringHollowFn = null;
function ringHollow() {
  if (!ringHollowFn) {
    ringHollowFn = hollowCells({
      x0: -RING_OUT - 1, x1: RING_OUT + 1, z0: -RING_OUT - 1, z1: RING_OUT + 1,
      y0: L.floorY, y1: TOP_Y + 1, solid: ringSolid, yBase: WALK, yTop: TOP_Y
    });
  }
  return ringHollowFn;
}

// ============================================================================
// Tribune in lokalen Koordinaten (a = Abstand entlang der Achse, w = quer)
// ============================================================================
const isO = (a, w) => (Math.abs(w) <= TA && a >= RING_OUT && a <= TC) || (a >= TC && inOctagon(w, a - TC, TA));
const isI = (a, w) => (Math.abs(w) <= TI && a >= C.crossing.innerHalfFlat && a <= TC) || (a >= TC && inOctagon(w, a - TC, TI));
const isO25 = (a, w) => (Math.abs(w) <= OB_P1 && a >= RING_OUT && a <= TC) || (a >= TC && inOctagon(w, a - TC, OB_P1));
const oct54 = (a, w) => inOctagon(a, w, RING_OUT);
const wallCol = (a, w) => isO(a, w) && !isI(a, w) && !oct54(a, w);

// Fünf Seiten des Halbachtecks: Normale (da, w), p = Tiefe, q = Querkoordinate zur Seite
const NORMALS = [[0, -1], [S2, -S2], [1, 0], [S2, S2], [0, 1]];
const chapelCoords = (k, da, w) => {
  const [nd, nw] = NORMALS[k];
  return { p: nd * da + nw * w, q: nd * w - nw * da };
};
const sectorOf = (da, w) => {
  let best = 0, bp = -Infinity;
  for (let k = 0; k < NORMALS.length; k++) {
    const p = NORMALS[k][0] * da + NORMALS[k][1] * w;
    if (p > bp + 1e-9) { bp = p; best = k; }
  }
  return best;
};
const chapelOf = (a, w) => {
  const da = a - TC;
  for (let k = 0; k < NORMALS.length; k++) {
    const { p, q } = chapelCoords(k, da, w);
    if (p >= CH_PMIN && p <= CH_PMAX && Math.abs(q) <= CH_HALF + 0.5) return { k, p, q };
  }
  return null;
};
const archChapel = (q, y) => {
  const u = Math.abs(q);
  if (u > CH_HALF + 0.5) return false;
  if (y < CH_ARCH_SPRING_Y) return true;
  return y + 0.5 <= CH_ARCH_SPRING_Y + archHeight(u, CH_HALF + 0.5, CH_ARCH_F);
};
// Kapellengewölbe: gedrehtes Kreuzgewölbe. Die Tiefe hat eine gerade Zellzahl (Mitte zwischen zwei
// Zellreihen); +0,4 Zuschlag, damit die Scheitelzelle Y 98 erreicht.
const CH_RISE = CH_VAULT_CROWN_Y - CH_VAULT_SPRING_Y;
const CH_FP = profileFactor(CH_RISE + 0.4, (CH_PMAX - CH_PMIN) / 2);
const CH_FQ = profileFactor(CH_RISE, CH_HALF + 0.5);
const chapelLo = (p, q) => {
  const hp = archHeight(Math.abs(p - CH_PMID), (CH_PMAX - CH_PMIN) / 2, CH_FP);
  const hq = archHeight(Math.abs(q), CH_HALF + 0.5, CH_FQ);
  return CH_VAULT_SPRING_Y + Math.floor(Math.min(hp, hq));
};

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const GLASS_SLIT = ['blue_stained_glass', 'light_blue_stained_glass', 'red_stained_glass',
  'light_blue_stained_glass', 'blue_stained_glass'];
const GLASS_OCULUS = ['yellow_stained_glass', 'orange_stained_glass', 'yellow_stained_glass',
  'orange_stained_glass', 'yellow_stained_glass'];

function buildTribuneLocal() {
  const out = { mauern: [], gewoelbe: [], obergaden: [], daecher: [] };
  const K = (a, w) => a * 256 + (w + 128);
  const A0 = RING_OUT, A1 = TC + TA;

  const cols = [];
  for (let a = A0; a <= A1; a++) for (let w = -TA; w <= TA; w++) if (wallCol(a, w)) cols.push([a, w]);

  // --- Kapellenräume (nicht im Streifen a ≤ 54: dort liegt die Vierungswand) ---
  const cav = new Map();
  for (const [a, w] of cols) {
    if (a <= RING_OUT) continue;
    const c = chapelOf(a, w);
    if (c) cav.set(K(a, w), { a, w, k: c.k, p: c.p, q: c.q, front: c.p < CH_P0 + CH_FRONT, lo: chapelLo(c.p, c.q) });
  }
  for (const c of cav.values()) {
    let hi = c.lo + 1;
    for (const [da, dw] of N4) {
      const nb = cav.get(K(c.a + da, c.w + dw));
      if (nb) hi = Math.max(hi, nb.lo);
    }
    c.hi = hi;
  }
  // --- Fensterschlitze in der Außenmauer ---
  const win = new Map();
  for (const [a, w] of cols) {
    if (cav.has(K(a, w))) continue;
    const k = sectorOf(a - TC, w);
    const { p, q } = chapelCoords(k, a - TC, w);
    if (p > CH_PMAX && Math.abs(q) <= CH_WIN_HALF + 0.5) win.set(K(a, w), { k, p, q });
  }

  const geomMauern = (a, w, y) => {
    if (y < WALK || y > CHAPEL_TOP_Y || !wallCol(a, w)) return false;
    const c = cav.get(K(a, w));
    if (c) return c.front ? !archChapel(c.q, y) : y > c.hi;
    if (win.has(K(a, w)) && y >= CH_WIN_Y0 && y <= CH_WIN_Y1) return false;
    return true;
  };

  const hollow = hollowCells({
    x0: A0 - 1, x1: A1 + 1, z0: -TA - 1, z1: TA + 1, y0: L.floorY, y1: CHAPEL_TOP_Y + 1,
    solid: (a, y, w) => geomMauern(a, w, y) || ringSolid(w, y, a), yBase: WALK, yTop: CHAPEL_TOP_Y
  });

  // Spaltenmerkmale für Material: außen (Nachbar außerhalb) / innen (Nachbar Raum oder Kapelle)
  const isOutside = (a, w) => !(isO(a, w) || oct54(a, w));
  const isInside = (a, w) => isI(a, w) || cav.has(K(a, w));
  const colMat = (a, w, y, ext, int) => {
    if (ext) {
      const k = sectorOf(a - TC, w);
      return incrust(Math.abs(chapelCoords(k, a - TC, w).q), y);
    }
    return int ? 'smooth_stone' : 'stone_bricks';
  };

  // a: Mauern
  for (const [a, w] of cols) {
    const ext = N4.some(([da, dw]) => isOutside(a + da, w + dw));
    const int = isInside(a, w) || N4.some(([da, dw]) => isInside(a + da, w + dw));
    const wi = win.get(K(a, w));
    for (let y = WALK; y <= CHAPEL_TOP_Y; y++) {
      if (geomMauern(a, w, y)) {
        if (hollow(a, y, w)) continue;
        out.mauern.push([a, y, w, colMat(a, w, y, ext, int)]);
      } else if (wi && y >= CH_WIN_Y0 && y <= CH_WIN_Y1 && wi.p >= WIN_GLASS_P[0] && wi.p < WIN_GLASS_P[1]) {
        out.mauern.push([a, y, w, GLASS_SLIT[wi.k]]);
      }
    }
  }

  // c: Gewölbe (Reihenfolge im Bauteil: Kapellen, Tonne und halbes Klostergewölbe, Anläufe)
  const shell = [];            // {x: a, y, z: w}
  const place = (a, y, w) => { if (!geomMauern(a, w, y)) shell.push({ x: a, y, z: w }); };
  for (const c of cav.values()) for (let y = c.lo; y <= c.hi; y++) place(c.a, y, c.w);
  const vf = profileFactor(VAULT_CROWN_Y - VAULT_SPRING_Y, TI + 0.5);
  const vaultCols = new Map();
  for (let a = RING_OUT + 1; a <= TC + TI; a++) {
    for (let w = -TI; w <= TI; w++) {
      if (!isI(a, w) || oct54(a, w)) continue;
      const r = a >= TC ? rho(a - TC, w) : Math.abs(w);
      vaultCols.set(K(a, w), { a, w, lo: VAULT_SPRING_Y + Math.floor(archHeight(r, TI + 0.5, vf)) });
    }
  }
  for (const c of vaultCols.values()) {
    let hi = c.lo + 1;
    let skirt = false;
    for (const [da, dw] of N4) {
      const nb = vaultCols.get(K(c.a + da, c.w + dw));
      if (nb) hi = Math.max(hi, nb.lo);
      else if (wallCol(c.a + da, c.w + dw)) skirt = true;   // Auflager: Wand daneben
    }
    const y0 = skirt ? Math.min(VAULT_SPRING_Y, c.lo) : c.lo;
    for (let y = y0; y <= hi; y++) shell.push({ x: c.a, y, z: c.w });
  }
  // Diagonale Schalenstücke berühren sich nur an Kanten: flächig verbinden (nur in Gewölbespalten)
  const inShell = (c) => {
    const k = K(c.x, c.z);
    if (cav.has(k)) return c.y <= cav.get(k).hi && c.y >= CH_VAULT_SPRING_Y;
    return vaultCols.has(k) && c.y >= VAULT_SPRING_Y;
  };
  const extra = connectEdges(shell).filter((c) => inShell(c) && !geomMauern(c.x, c.z, c.y));
  for (const c of shell.concat(extra)) out.gewoelbe.push([c.x, c.y, c.z, 'smooth_stone']);

  // b: Obergaden
  const obCols = [];
  for (let a = A0; a <= A1; a++) for (let w = -OB_P1; w <= OB_P1; w++) {
    if (isO25(a, w) && !isI(a, w) && !oct54(a, w)) obCols.push([a, w]);
  }
  const obOutside = (a, w) => !(isO25(a, w) || oct54(a, w));
  for (const [a, w] of obCols) {
    const k = sectorOf(a - TC, w);
    const { p, q } = chapelCoords(k, a - TC, w);
    const ext = N4.some(([da, dw]) => obOutside(a + da, w + dw));
    const int = N4.some(([da, dw]) => isI(a + da, w + dw));
    for (let y = CHAPEL_TOP_Y + 1; y <= TRIB_TOP_Y; y++) {
      const dy = y - OB_CY;
      const d2 = q * q + dy * dy;
      if (d2 <= OB_R * OB_R + OB_R) {
        if (p >= 21.5 && p < 22.5) out.obergaden.push([a, y, w, GLASS_OCULUS[k]]);
        continue;
      }
      if (d2 <= (OB_R + 1) * (OB_R + 1) + (OB_R + 1) && (p < 20.5 || p >= OB_P1 - 0.5)) {
        out.obergaden.push([a, y, w, 'chiseled_quartz']);
        continue;
      }
      out.obergaden.push([a, y, w, colMat(a, w, y, ext, int)]);
    }
  }

  // d: Dächer (Terrakotta)
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const rhoAt = (a, w) => rho(a - TC, w);
  const r1cols = cols.filter(([a, w]) => !isO25(a, w)).map(([a, w]) => [a, w]);
  const h1 = (a, w) => R1_Y0 + (R1_Y1 - R1_Y0) * clamp01((rhoAt(a, w) - R1_RHO0) / (R1_RHO1 - R1_RHO0));
  for (const c of surface({ columns: r1cols, height: h1 })) out.daecher.push([c.x, c.y, c.z, 'terracotta']);
  const r2cols = [];
  for (let a = A0; a <= A1; a++) for (let w = -OB_P1; w <= OB_P1; w++) if (isO25(a, w) && !oct54(a, w)) r2cols.push([a, w]);
  const h2 = (a, w) => R2_Y0 + (R2_Y1 - R2_Y0) * clamp01((R2_RHO0 - rhoAt(a, w)) / (R2_RHO0 - R2_RHO1));
  for (const c of surface({ columns: r2cols, height: h2 })) out.daecher.push([c.x, c.y, c.z, 'terracotta']);

  return out;
}

// Abbildung lokal (a, w) → Welt (x, z). Nord = −Z, Ost = +X, Süd = +Z.
const TRIBUNES = {
  nord: { toXZ: (a, w) => [w, -a], toAW: (x, z) => [-z, x] },
  ost:  { toXZ: (a, w) => [a, w],  toAW: (x, z) => [x, z] },
  sued: { toXZ: (a, w) => [w, a],  toAW: (x, z) => [z, x] }
};

// ============================================================================
// Eckbauten und Sakristeien
// ============================================================================
const inTribAny = (x, z) => Object.values(TRIBUNES).some((t) => { const [a, w] = t.toAW(x, z); return isO(a, w); });
const inEck = (x, z) => Math.abs(x) <= RING_OUT && Math.abs(z) <= RING_OUT &&
  Math.abs(x) + Math.abs(z) <= ECK_DIAG && !inOctagon(x, z, RING_OUT) && !inTribAny(x, z);
const eckOutside = (x, z) => !(inEck(x, z) || inOctagon(x, z, RING_OUT));

let eckModel = null;
function eckbauModel() {
  if (eckModel) return eckModel;
  const wall = new Set(), room = new Set(), all = [];
  const R = Math.ceil(ECK_WALL_R);
  for (let x = -RING_OUT; x <= RING_OUT; x++) {
    for (let z = -RING_OUT; z <= RING_OUT; z++) {
      if (!inEck(x, z)) continue;
      all.push([x, z]);
      let isWall = false;
      for (let dx = -R; dx <= R && !isWall; dx++) {
        for (let dz = -R; dz <= R; dz++) {
          if (dx * dx + dz * dz <= ECK_WALL_R * ECK_WALL_R && eckOutside(x + dx, z + dz)) { isWall = true; break; }
        }
      }
      (isWall ? wall : room).add(x + ',' + z);
    }
  }
  eckModel = { all, wall, room };
  return eckModel;
}

// Kreuzgewölbe der Sakristei in gedrehten Koordinaten (p quer zur Diagonale, q längs); mehrere Joche
function sakristeiVault(roomCells) {
  const pq = (x, z) => [(Math.abs(x) + Math.abs(z)) * S2, (Math.abs(x) - Math.abs(z)) * S2];
  let pMin = Infinity, pMax = -Infinity, qMin = Infinity, qMax = -Infinity;
  for (const [x, z] of roomCells) {
    const [p, q] = pq(x, z);
    pMin = Math.min(pMin, p); pMax = Math.max(pMax, p); qMin = Math.min(qMin, q); qMax = Math.max(qMax, q);
  }
  const pc = (pMin + pMax) / 2, wp = (pMax - pMin) / 2 + 0.75;
  const bays = Math.max(1, Math.round((qMax - qMin + 1.5) / (2 * wp)));
  const bayW = (qMax - qMin) / bays || 1;
  const rise = SAK_CROWN_Y - SAK_SPRING_Y;
  const fp = profileFactor(rise, wp);
  const wq = bayW / 2 + 0.75;
  const fq = profileFactor(rise, wq);
  const lo = new Map();
  for (const [x, z] of roomCells) {
    const [p, q] = pq(x, z);
    const j = Math.max(0, Math.min(bays - 1, Math.floor((q - qMin) / bayW)));
    const qc = qMin + (j + 0.5) * bayW;
    const h = Math.min(archHeight(Math.abs(p - pc), wp, fp), archHeight(Math.abs(q - qc), wq, fq));
    lo.set(x + ',' + z, Math.min(SAK_CROWN_Y, SAK_SPRING_Y + Math.floor(h)));
  }
  const cells = [];
  for (const [x, z] of roomCells) {
    const l = lo.get(x + ',' + z);
    let hi = Math.min(ECK_ROOM_TOP_Y, l + 1);
    for (const [dx, dz] of N4) {
      const n = lo.get((x + dx) + ',' + (z + dz));
      if (n !== undefined) hi = Math.max(hi, n);
    }
    for (let y = l; y <= Math.min(hi, ECK_ROOM_TOP_Y); y++) cells.push({ x, y, z });
  }
  // Kantenkontakte (diagonale Schale) flächig verbinden, nur innerhalb des Raumes
  const extra = connectEdges(cells).filter((c) => lo.has(c.x + ',' + c.z) && c.y <= ECK_ROOM_TOP_Y);
  return cells.concat(extra);
}

// ============================================================================
// Bau
// ============================================================================
function build(ctx) {
  // ---- 1 Vierungswand --------------------------------------------------------
  const wand = ctx.part('vierung_wand', { symmetry: { order: 8, cx: 0, cz: 0 } });
  const hol = ringHollow();
  for (let y = WALK; y <= TOP_Y; y++) {
    for (let x = -RING_OUT; x <= RING_OUT; x++) {
      for (let z = -RING_OUT; z <= RING_OUT; z++) {
        if (ringSolid(x, y, z) && !hol(x, y, z)) wand.set(x, y, z, ringMaterial(x, y, z));
      }
    }
  }

  // ---- 2 Kämpfergesims (nur Diagonalseiten) -----------------------------------
  const gesims = ctx.part('vierung_gesims', { symmetry: { order: 8, cx: 0, cz: 0 } });
  for (let x = -RING_IN; x <= RING_IN; x++) {
    for (let z = -RING_IN; z <= RING_IN; z++) {
      const ax = Math.abs(x), az = Math.abs(z);
      if (ax < RING_IN && az < RING_IN && inOctagon(x, z, RING_IN) && !inOctagon(x, z, RING_IN - 1)) {
        gesims.set(x, GESIMS_Y, z, 'polished_andesite');
      }
    }
  }

  // ---- 3 Sakristeitüren (NO, SO offen; NW, SW als Blendnischen) -------------------
  const tueren = ctx.part('sakristei_tueren');
  for (let y = WALK; y <= DOOR_SPRING_Y + DOOR_HALF + DOOR_FRAME + 1; y++) {
    for (let x = -RING_OUT; x <= RING_OUT; x++) {
      for (let z = -RING_OUT; z <= RING_OUT; z++) {
        if (!inRing(x, z)) continue;
        const cls = doorClass(Math.abs(x), Math.abs(z), y);
        if (!cls) continue;
        if (cls === 'frame') { tueren.set(x, y, z, 'chiseled_quartz'); continue; }
        if (x < 0) { tueren.set(x, y, z, 'smooth_stone'); continue; }          // Blendnische im Westen
        if (DOOR_LEAF_N.includes(octN(Math.abs(x), Math.abs(z)))) tueren.set(x, y, z, 'cut_copper');
      }
    }
  }

  // ---- 4–15 Tribunen -----------------------------------------------------------
  const local = buildTribuneLocal();
  for (const key of ['nord', 'ost', 'sued']) {
    const t = TRIBUNES[key];
    // Reihenfolge: Gewölbe nach den Mauern und vor dem Obergaden (Katalog: a, c, b, d)
    for (const id of ['mauern', 'gewoelbe', 'obergaden', 'daecher']) {
      const w = ctx.part(`tribune_${key}_${id}`);
      for (const [a, y, wl, type] of local[id]) {
        const [x, z] = t.toXZ(a, wl);
        w.set(x, y, z, type);
      }
    }
  }

  // ---- 16 Eckbauten -------------------------------------------------------------
  const eck = ctx.part('eckbauten');
  const { all, wall, room } = eckbauModel();
  const incr = patterns.incrustation({ panelW: PANEL_W, panelH: PANEL_H, axis: 'x', v0: WALK });
  const incrZ = patterns.incrustation({ panelW: PANEL_W, panelH: PANEL_H, axis: 'z', v0: WALK });
  const isWall = (x, z) => wall.has(x + ',' + z);
  const isRoom = (x, z) => room.has(x + ',' + z);
  for (const [x, z] of all) {
    const xOut = eckOutside(x + 1, z) || eckOutside(x - 1, z);
    const zOut = eckOutside(x, z + 1) || eckOutside(x, z - 1);
    const ext = xOut || zOut;
    const int = N4.some(([dx, dz]) => isRoom(x + dx, z + dz));
    if (isWall(x, z)) {
      for (let y = WALK; y <= ECK_ROOM_TOP_Y; y++) {
        let t;
        if (ext) t = (xOut && !zOut ? incrZ : incr)(x, y, z);
        else t = int ? 'smooth_stone' : 'stone_bricks';
        eck.set(x, y, z, t);
      }
    }
    for (let y = ECK_SLAB_Y0; y < ECK_ROOF_Y; y++) eck.set(x, y, z, 'stone_bricks');
    eck.set(x, ECK_ROOF_Y, z, 'terracotta');
  }
  // Sakristeien im Nordosten und Südosten: Kreuzgewölbe über dem Raum
  for (const sz of [-1, 1]) {
    const cells = [...room].map((s) => s.split(',').map(Number)).filter(([x, z]) => x > 0 && Math.sign(z) === sz);
    for (const c of sakristeiVault(cells)) eck.set(c.x, c.y, c.z, 'smooth_stone');
  }

  // ---- 17 Exedra-Sockel -----------------------------------------------------------
  const sockel = ctx.part('exedra_sockel');
  const sockelCell = (x, z) => inExedra(x, z) && !inOctagon(x, z, RING_OUT);
  const sHollow = hollowCells({
    x0: -RING_OUT - 1, x1: RING_OUT + 1, z0: -RING_OUT - 1, z1: RING_OUT + 1, y0: SOCKEL_Y0 - 1, y1: TOP_Y + 1,
    solid: (x, y, z) => y >= SOCKEL_Y0 && y <= TOP_Y && (sockelCell(x, z) || inRing(x, z)),
    yBase: SOCKEL_Y0, yTop: TOP_Y
  });
  const sOut = (x, z) => !(inExedra(x, z) || inOctagon(x, z, RING_OUT));
  for (let x = -RING_OUT; x <= RING_OUT; x++) {
    for (let z = -RING_OUT; z <= RING_OUT; z++) {
      if (!sockelCell(x, z)) continue;
      const xOut = sOut(x + 1, z) || sOut(x - 1, z), zOut = sOut(x, z + 1) || sOut(x, z - 1);
      for (let y = SOCKEL_Y0; y <= TOP_Y; y++) {
        if (sHollow(x, y, z)) continue;
        let t = 'stone_bricks';
        if (xOut || zOut) t = (xOut && !zOut ? incrZ : incr)(x, y, z);
        sockel.set(x, y, z, t);
      }
    }
  }
}

module.exports = {
  module: 3,
  build,
  // für Tests und Diagnose
  _internal: { buildTribuneLocal, TRIBUNES, isO, isI, ringSolid, inEck, eckbauModel, hollowCells, profileFactor }
};
