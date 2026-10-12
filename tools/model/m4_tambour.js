'use strict';
// Modul 4: Tambour mit Ochsenaugen, tribune morte, Kranzgesims und Baccios Galerie
// (BAUTEIL_KATALOG, Modul 4). Reihenfolge: Ring, Ochsenaugen, tribune morte, Kranzgesims, Galerie.
//
// Flächenkonvention (wie dome.segmentIndex): k = 0 Ost (+X), dann gegen den Uhrzeigersinn von oben
// gesehen: 1 NO, 2 N (−Z), 3 NW, 4 W, 5 SW, 6 S (+Z), 7 SO. Ein Ochsenauge sitzt je Fläche k
// senkrecht zur Flächennormalen: u = tangentiale Koordinate (Achsflächen: ±z bzw. ±x, Diagonalflächen:
// (x∓z)/√2), v = y − oculusCenterY. Zelle gehört zum Fenster, wenn u² + v² ≤ r² + r.
const D = require('../spec/dimensions.js');
const { inExedra, EXEDRA_CENTERS, EXEDRA_R } = require('../spec/interfaces.js');
const { inOctagon } = require('../geom/shapes.js');
const { connectEdges } = require('../geom/vaults.js');

const L = D.LEVELS;
const C = D.CATHEDRAL;

// --- Maße aus dimensions.js ---------------------------------------------------------------
const WALK = L.walkY;                          // 65, Bezug der Inkrustationsfelder (wie Modul 3)
const RING_OUT = C.crossing.outerHalfFlat;     // 54
const RING_IN = C.crossing.innerHalfFlat - 1;  // 44 (Innenraum bis a = 44, Wand ab 45)
const Y_BASE = C.drum.baseY + 1;               // 149, erste Lage des Tambours
const Y_TOP = C.drum.springY;                  // 172, Kuppelauflager
const OC_Y = C.drum.oculusCenterY;             // 163
const OC_R = C.drum.oculusDiameter / 2 - 1;    // 4 (9 Zellen Durchmesser)

// --- Lokale Ableitungen und Katalogwerte ----------------------------------------------------
const SHELL = 2, BINDER = 12, TOP_FULL = 3;    // Regel A1
const PANEL_W = 9, PANEL_H = 8, FRAME_W = 1;   // Inkrustation: panelH 8 (Katalog Modul 4)
const OC_OPEN = OC_R * OC_R + OC_R;            // 20: Durchbruch
const OC_FRAME = (OC_R + 1) * (OC_R + 1) + (OC_R + 1); // 30: Rahmenring Breite 1
const GLASS_N = [49, 50];                      // Glasschicht in der Wandmitte (Achteck-Norm)
const CORNER_HALF = RING_OUT * Math.tan(Math.PI / 8); // 22,37: halbe Flächenlänge
const LISENE_D2 = 4.1;                         // Lisene: Abstand ≤ 2 zur Achteckecke → 2 Zellen breit
// tribune morte (Katalog): Halbkreis r 11, Wand 2 dick Y 150..160, Halbkuppel Kämpfer 161
const EX_R2 = EXEDRA_R * EXEDRA_R + EXEDRA_R;  // 132
const EX_IN2 = (EXEDRA_R - 2) * (EXEDRA_R - 2) + (EXEDRA_R - 2); // 90: Schalendicke 2
const EX_OUT2 = (EXEDRA_R - 1) * (EXEDRA_R - 1) + (EXEDRA_R - 1); // 110: Außenschicht
const EX_FLOOR_Y = Y_BASE, EX_WALL_Y1 = 151, EX_DOME_Y = 151;   // Wand nur Y 149..151, Kämpfer 151
const EX_DOME_V = 6;                           // vertikaler Radius: Scheitel Y 157, unter der Ochsenaugen-Unterkante (Y 158)
const EX_V_OUT2 = EX_DOME_V * EX_DOME_V + EX_DOME_V; // 42
const EX_V_IN2 = (EX_DOME_V - 2) * (EX_DOME_V - 2) + (EX_DOME_V - 2); // 20: Schalendicke 2
const EX_V_MID2 = (EX_DOME_V - 1) * (EX_DOME_V - 1) + (EX_DOME_V - 1); // 30: Außenschicht beginnt darüber
const PIER_ANGLES = [-72, -36, 0, 36, 72];    // gekuppelte Säulen (Paare)
const PIER_SPLIT = 4;                          // Säulenpaar bei Pfeilerwinkel ± 4°
// Gesims (ρ 55, Y 171) und Galerie (Konsolen 168, Boden 169, Brüstung 170)
const GESIMS_Y = Y_TOP - 1;
const GAL_CONSOLE_Y = 168, GAL_FLOOR_Y = 169, GAL_RAIL_Y = 170;
const S2 = Math.SQRT1_2;

// ============================================================================
// Schalenmauerwerk (aus Modul 3 kopiert): hohler Kern mit Schale 2
// ============================================================================
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

// Hohler Kern: Abstand ≥ 3 zu jeder leeren Zelle, nur wo die Masse ≥ 7 stark ist;
// Binderlagen (alle 12 ab yBase) und die obersten 3 Lagen bleiben voll.
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
  const hol = dilate(E3, nx, ny, nz, 1);
  for (let i = 0; i < n; i++) if (!E2[i]) hol[i] = 0;
  return (x, y, z) => {
    if (x < x0 || x > x1 || y < y0 || y > y1 || z < z0 || z > z1) return false;
    if ((y - yBase) % BINDER === 0 || y > yTop - TOP_FULL) return false;
    return hol[idx(x, y, z)] === 1;
  };
}

// ============================================================================
// Achteck, Flächen, Ochsenaugen
// ============================================================================
const octN = (ax, az) => {            // kleinstes a mit inOctagon(ax, az, a)
  let a = Math.max(ax, az);
  while (ax + az > Math.floor(a * Math.SQRT2 + 0.5)) a++;
  return a;
};

// Flächenindex 0..7 in ganzzahliger Arithmetik (gleiche Zuordnung wie dome.segmentIndex)
function faceOf(x, z) {
  const ax = Math.abs(x), az = Math.abs(z), m = Math.max(ax, az), s = ax + az;
  if (2 * m * m >= s * s) {           // Achsfläche
    if (ax >= az) return x > 0 ? 0 : 4;
    return z > 0 ? 6 : 2;
  }
  if (x > 0) return z > 0 ? 7 : 1;
  return z > 0 ? 5 : 3;
}
const isFlatFace = (k) => k % 2 === 0;

// u² + v² des Ochsenauges (u tangential in der Fläche k). Diagonal: u = a/√2 → u² = a²/2 (exakt).
function windowMetric(x, y, z) {
  const k = faceOf(x, z);
  const v = y - OC_Y;
  if (isFlatFace(k)) {
    const u = (k === 0 || k === 4) ? z : x;
    return u * u + v * v;
  }
  const a = (k === 7 || k === 3) ? x - z : x + z;
  return a * a / 2 + v * v;
}
// Mittellinie (Kreuz): u = 0
function onVerticalAxis(x, z) {
  const k = faceOf(x, z);
  if (isFlatFace(k)) return ((k === 0 || k === 4) ? z : x) === 0;
  return ((k === 7 || k === 3) ? x - z : x + z) === 0;
}

const inRing = (x, z) => inOctagon(x, z, RING_OUT) && !inOctagon(x, z, RING_IN);

function ringSolid(x, y, z) {
  if (y < Y_BASE || y > Y_TOP || !inRing(x, z)) return false;
  return windowMetric(x, y, z) > OC_FRAME;     // Durchbruch und Rahmen sind Aussparungen im Ring
}

// Inkrustation (Felder an der Flächenmitte gespiegelt, panelH 8); t = Abstand von der Flächenmitte
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
const faceT = (ax, az) => (Math.max(ax, az) >= (ax + az) * S2 ? Math.min(ax, az) : Math.abs(ax - az) * S2);

// Abstand² zur nächsten Achteckecke (Ecken bei (±54, ±22,37) und (±22,37, ±54))
function cornerD2(ax, az) {
  const a = (ax - RING_OUT) ** 2 + (az - CORNER_HALF) ** 2;
  const b = (ax - CORNER_HALF) ** 2 + (az - RING_OUT) ** 2;
  return Math.min(a, b);
}

function ringMaterial(x, y, z) {
  const ax = Math.abs(x), az = Math.abs(z);
  const n = octN(ax, az);
  if (n === RING_OUT) {
    if (cornerD2(ax, az) <= LISENE_D2) return 'smooth_quartz';          // Eckkante, Lisene
    return incrust(faceT(ax, az), y);
  }
  if (n >= RING_IN + 3) return 'stone_bricks';
  return 'smooth_stone';                                                // Pietra serena innen
}

let ringHollowFn = null;
function ringHollow() {
  if (!ringHollowFn) {
    ringHollowFn = hollowCells({
      x0: -RING_OUT - 1, x1: RING_OUT + 1, z0: -RING_OUT - 1, z1: RING_OUT + 1,
      y0: C.drum.baseY, y1: Y_TOP + 1, solid: ringSolid, yBase: Y_BASE, yTop: Y_TOP
    });
  }
  return ringHollowFn;
}

// Glas des Ochsenauges: blau, Kreuz gelb
function glassType(x, y, z) {
  return (onVerticalAxis(x, z) || y === OC_Y) ? 'yellow_stained_glass' : 'blue_stained_glass';
}

// ============================================================================
// tribune morte (eine Exedra in lokalen Koordinaten, dann auf die vier Diagonalen abgebildet)
// ============================================================================
const inO54 = (x, z) => inOctagon(x, z, RING_OUT);

// Lokale Koordinaten: pi = Normalenanteil·√2, qi = Tangentialanteil·√2 (ganzzahlig, exakt)
function exedraLocal(c, x, z) {
  const dx = x - c.cx, dz = z - c.cz;
  const pi = dx * c.sx + dz * c.sz;
  const qi = -dx * c.sz + dz * c.sx;
  return { dx, dz, d2: dx * dx + dz * dz, p: pi * S2, q: qi * S2 };
}
const RAYS = (list) => list.map((deg) => ({ s: Math.sin(deg * Math.PI / 180), c: Math.cos(deg * Math.PI / 180) }));
const PIER_RAYS = RAYS(PIER_ANGLES.flatMap((a) => [a - PIER_SPLIT, a + PIER_SPLIT]));
const rayDist = (r, p, q) => (p * r.c + q * r.s > 0 ? Math.abs(p * r.s - q * r.c) : Infinity);

function exedraCells(c) {
  const out = [];
  const x0 = c.cx - EXEDRA_R - 1, x1 = c.cx + EXEDRA_R + 1;
  const z0 = c.cz - EXEDRA_R - 1, z1 = c.cz + EXEDRA_R + 1;
  const inFoot = (x, z) => inExedra(x, z) && !inO54(x, z);
  // Boden Y 149 (volle Halbscheibe auf dem Sockel) und niedrige Wand Y 150..151 (Halbring, 2 dick);
  // gekuppelte Säulen ersetzen die Außenschicht Y 149..151 (statt Nischen: dafür ist zu wenig Platz)
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      if (!inFoot(x, z)) continue;
      const l = exedraLocal(c, x, z);
      const outer = l.d2 > EX_OUT2;
      const pierD = outer ? Math.min(...PIER_RAYS.map((r) => rayDist(r, l.p, l.q))) : Infinity;
      for (let y = EX_FLOOR_Y; y <= EX_WALL_Y1; y++) {
        if (y > EX_FLOOR_Y && l.d2 <= EX_IN2) continue;
        let t;
        if (y === EX_FLOOR_Y) t = outer ? incrust(Math.abs(l.q), y) : 'stone_bricks';
        else t = outer ? incrust(Math.abs(l.q), y) : 'smooth_stone';
        if (outer && pierD <= 0.5) t = 'quartz_pillar';
        out.push([x, y, z, t]);
      }
    }
  }
  // Abgeflachte Viertel-Ellipsoidschale: horizontal r 11, vertikal r 6, Kämpfer Y 151, Scheitel Y 157,
  // Dicke 2. vaults.halfDome kennt nur Halbebenen an den Achsen; die Schnittebene liegt hier diagonal.
  const inEll = (h2, dy, rh2, rv2) => h2 / rh2 + (dy * dy) / rv2 <= 1;
  const shell = [];
  for (let dy = 1; dy <= EX_DOME_V; dy++) {
    for (let x = x0; x <= x1; x++) {
      for (let z = z0; z <= z1; z++) {
        if (!inFoot(x, z)) continue;
        const l = exedraLocal(c, x, z);
        if (inEll(l.d2, dy, EX_R2, EX_V_OUT2) && !inEll(l.d2, dy, EX_IN2, EX_V_IN2)) {
          shell.push({ x, y: EX_DOME_Y + dy, z });
        }
      }
    }
  }
  const have = new Set(shell.map((s) => s.x + ',' + s.y + ',' + s.z));
  const extra = connectEdges(shell).filter((s) => inFoot(s.x, s.z) && s.y > EX_DOME_Y && s.y <= EX_DOME_Y + EX_DOME_V
    && !have.has(s.x + ',' + s.y + ',' + s.z));
  for (const s of shell.concat(extra)) {
    const l = exedraLocal(c, s.x, s.z);
    const inner = inEll(l.d2, s.y - EX_DOME_Y, EX_OUT2, EX_V_MID2);   // innere Schicht: Ellipsoid mit r 10 / 5
    out.push([s.x, s.y, s.z, inner ? 'smooth_stone' : 'terracotta']);
  }
  return out;
}

// ============================================================================
// Gesims und Galerie (Bänder ρ 55 = A und ρ 56 = B außerhalb des Rings)
// ============================================================================
const inBandA = (x, z) => inOctagon(x, z, RING_OUT + 1) && !inO54(x, z);
const inBandB = (x, z) => inOctagon(x, z, RING_OUT + 2) && !inOctagon(x, z, RING_OUT + 1);
// Galerie nur auf der SO-Fläche (k = 7), durchgehend über die ganze Fläche
const galerieColumn = (x, z) => faceOf(x, z) === 7;

// ============================================================================
// Bau
// ============================================================================
function build(ctx) {
  const SYM8 = { symmetry: { order: 8, cx: 0, cz: 0 } };

  // ---- 1 Ring ---------------------------------------------------------------------------
  const ring = ctx.part('tambour_ring', SYM8);
  const hol = ringHollow();
  for (let y = Y_BASE; y <= Y_TOP; y++) {
    for (let x = -RING_OUT; x <= RING_OUT; x++) {
      for (let z = -RING_OUT; z <= RING_OUT; z++) {
        if (ringSolid(x, y, z) && !hol(x, y, z)) ring.set(x, y, z, ringMaterial(x, y, z));
      }
    }
  }

  // ---- 2 Ochsenaugen: Rahmen über die volle Wanddicke, Glas in der mittleren Schicht ------------
  const oc = ctx.part('ochsenaugen', SYM8);
  for (let y = OC_Y - OC_R - 1; y <= OC_Y + OC_R + 1; y++) {
    for (let x = -RING_OUT; x <= RING_OUT; x++) {
      for (let z = -RING_OUT; z <= RING_OUT; z++) {
        if (!inRing(x, z)) continue;
        const m = windowMetric(x, y, z);
        if (m > OC_FRAME) continue;
        if (m > OC_OPEN) { oc.set(x, y, z, 'chiseled_quartz'); continue; }
        const n = octN(Math.abs(x), Math.abs(z));
        if (n >= GLASS_N[0] && n <= GLASS_N[1]) oc.set(x, y, z, glassType(x, y, z));
      }
    }
  }

  // ---- 3 tribune morte ---------------------------------------------------------------------
  const morte = ctx.part('tribune_morte', SYM8);
  for (const c of EXEDRA_CENTERS) {
    for (const [x, y, z, t] of exedraCells(c)) morte.set(x, y, z, t);
  }

  // ---- 4 Kranzgesims (Y 171, ρ 55, auf Y 170 getragen); läuft ringsum durch, auch über den Diagonalflächen ---------
  const gesims = ctx.part('kranzgesims', SYM8);
  for (let x = -RING_OUT - 1; x <= RING_OUT + 1; x++) {
    for (let z = -RING_OUT - 1; z <= RING_OUT + 1; z++) {
      if (!inBandA(x, z)) continue;
      gesims.set(x, GESIMS_Y, z, (Math.abs(x) + Math.abs(z)) % 4 === 0 ? 'chiseled_quartz' : 'quartz_bricks');
    }
  }

  // ---- 5 Galerie Südost (Konsolen 168, Boden 169, Brüstung 170) -----------------------------------
  const gal = ctx.part('galerie_suedost');
  for (let x = 1; x <= RING_OUT + 2; x++) {
    for (let z = 1; z <= RING_OUT + 2; z++) {
      if (!galerieColumn(x, z)) continue;
      const a = inBandA(x, z), b = inBandB(x, z);
      if (!a && !b) continue;
      if (a && x % 2 === 0 && windowMetric(x, GAL_CONSOLE_Y, z) > OC_FRAME) gal.set(x, GAL_CONSOLE_Y, z, 'smooth_quartz');
      gal.set(x, GAL_FLOOR_Y, z, 'quartz_bricks');
      if (b && x % 3 === 0) gal.set(x, GAL_RAIL_Y, z, 'smooth_quartz');
    }
  }
}

module.exports = {
  module: 4,
  build,
  _internal: { faceOf, windowMetric, ringSolid, ringHollow, hollowCells, exedraCells, inBandA, inBandB, galerieColumn,
    Y_BASE, Y_TOP, OC_Y, OC_R, GESIMS_Y }
};
