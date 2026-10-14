'use strict';
// Modul 6: Laterne, Kugel und Kreuz (BAUTEIL_KATALOG, Modul 6).
// Alle Achteckmaße laufen über die Achteck-Norm rho (wie der Schlussring in M5), weil
// inOctagon(a) bei a = 14 über rho 14 hinausreicht und dort kein Auflager hätte (R5).
const D = require('../spec/dimensions.js');
const { rho } = require('../geom/vaults.js');

const C = D.CATHEDRAL;
const LN = C.lantern;
const DM = C.dome;

// --- Lokale Ableitungen und Katalogwerte -------------------------------------------------
const BASE_Y = DM.eyeRingTopY + 1;          // 247: erste Laternenlage, voll auf dem Schlussring
const SOCKEL_Y1 = BASE_Y + 2;               // 249: Sockel Y 247..249 (Katalog)
const SOCKEL_RHO = 14;                      // Außenmaß des Sockels (Katalog, = Schlussring)
const RING_RHO_MIN = 6;                     // innerer Rand des Schlussrings (M5 rhoMin)
const EYE_RHO = 4;                          // Auge rho < 4 (Katalog)
const TEMPLE_Y0 = SOCKEL_Y1 + 1;            // 250
const TEMPLE_Y1 = 270;                      // Eckpfeiler und Wand bis Y 270 (Katalog)
const TEMPLE_WALL = 2;                      // Wanddicke (Katalog)
const TEMPLE_IN = LN.halfFlat - TEMPLE_WALL; // 7: Innenrand der Wand
const ARCH_HALF = 2;                        // Fenster-Halbweite (Katalog)
const ARCH_SPRING_Y = 264;                  // Kämpfer (Katalog)
const SILL_Y = 256;                         // Fensterbank (Annahme: 6 Lagen über dem Tempelfuß)
const WIN_U = ARCH_HALF + 0.5;              // Fensterhalbbreite als Randabstand der Zellmitte
const PILLAR_X = [LN.halfFlat - 2, LN.halfFlat]; // 7..9: 3 breit, radial
const PILLAR_Z = [3, 5];                    // 3 breit, an der Achteckecke (Ecke bei z ca. 3,7)
const ENTAB_RHO = 10;                       // Gebälk a <= 10 (Katalog)
const ENTAB_Y0 = TEMPLE_Y1 + 1;             // 271
const VOL_RHO0 = 8;                         // Strebepfeiler beginnt radial bei 8 (Rest liegt im Tempel)
const VOL_RHO1 = SOCKEL_RHO;                // bis 14 (Katalog)
const VOL_TOP_Y = 262;                      // Kopf des Strebepfeilers am Tempel (Katalog: bis Y 262)
const VOL_HALF_W = 1;                       // 2 breit: Quermaß |t| <= 1
const COS_C = Math.cos(Math.PI / 8), SIN_C = Math.sin(Math.PI / 8); // Ecke bei 22,5 Grad
const CONE_Y0 = LN.templeTopY + 1;          // 275
const CONE_Y1 = LN.coneTopY - 1;            // 283: Kegelspitze, Kugel beginnt bei 284
const CONE_EDGE_DELTA = 3;                  // Kanten: höchstens 3 Grad von der Ecke
const SPHERE_Y = LN.sphereCenterY;          // 287
const CROSS_STEM_Y0 = SPHERE_Y + LN.sphereRadius + 1; // 291
const CROSS_BAR_Y = CROSS_STEM_Y0 + 1;      // 292

// Flächenkoordinaten einer Zelle: u = Lage entlang der Fläche
function faceU(x, z) {
  const ax = Math.abs(x), az = Math.abs(z);
  if (Math.max(ax, az) >= rho(x, z) - 1e-9) return Math.min(ax, az); // Fläche auf der Achse
  return Math.abs(ax - az) * Math.SQRT1_2;                           // Diagonalfläche
}

function* disc(rMax) {
  const m = Math.ceil(rMax);
  for (let x = -m; x <= m; x++) for (let z = -m; z <= m; z++) if (rho(x, z) <= rMax) yield { x, z };
}

// Fensteröffnung (Rundbogen) in den Flächen des Tempels
function inWindow(x, y, z) {
  if (y < SILL_Y || y > TEMPLE_Y1) return false;
  const u = faceU(x, z);
  if (u > WIN_U) return false;
  if (y < ARCH_SPRING_Y) return true;
  const dy = y - ARCH_SPRING_Y + 0.5;
  return u * u + dy * dy <= WIN_U * WIN_U;
}

// Strebepfeiler: Quermaß t zur Eckrichtung (22,5 bzw. 67,5 Grad durch die Betragsbildung)
function volutePos(x, z) {
  const ax = Math.abs(x), az = Math.abs(z);
  const fr = (c, s) => ({ s: ax * c + az * s, t: -ax * s + az * c });
  const a = fr(COS_C, SIN_C), b = fr(SIN_C, COS_C);
  const ok = (p) => p.s >= VOL_RHO0 && Math.abs(p.t) <= VOL_HALF_W;
  if (ok(a)) return a;
  if (ok(b)) return b;
  return null;
}
function voluteTop(s) {
  const k = Math.min(1, Math.max(0, (s - LN.halfFlat) / (VOL_RHO1 - LN.halfFlat)));
  return Math.floor(TEMPLE_Y0 + (VOL_TOP_Y - TEMPLE_Y0) * Math.sqrt(1 - k * k) + 1e-9);
}

function build(ctx) {
  const SYM8 = { symmetry: { order: 8, cx: 0, cz: 0 } };

  // ---- 1) Sockel ---------------------------------------------------------------------------
  // Y 247 nur rho 6..14 (liegt voll auf dem Schlussring), ab Y 248 bis rho 4 nach innen (Auge)
  const sockel = ctx.part('laternen_sockel', SYM8);
  const sc = [];
  for (let y = BASE_Y; y <= SOCKEL_Y1; y++) {
    const lo = y === BASE_Y ? RING_RHO_MIN : EYE_RHO;
    for (const { x, z } of disc(SOCKEL_RHO)) if (rho(x, z) >= lo) sc.push({ x, y, z });
  }
  sockel.fill(sc, 'smooth_quartz');

  // ---- 2) Voluten: 8 Strebepfeiler an den Ecken, Viertelkreis-Kontur -------------------------
  const volu = ctx.part('voluten', SYM8);
  const vc = [], vTop = new Map();
  for (const { x, z } of disc(VOL_RHO1)) {
    if (rho(x, z) <= LN.halfFlat) continue;           // innerhalb des Tempels
    const p = volutePos(x, z);
    if (!p) continue;
    const top = voluteTop(p.s);
    vTop.set(x + ',' + z, top);
    for (let y = TEMPLE_Y0; y <= top; y++) vc.push({ x, y, z });
  }
  vc.sort((p, q) => p.y - q.y || p.x - q.x || p.z - q.z);
  volu.fill(vc, (x, y, z) => (y === vTop.get(x + ',' + z) ? 'chiseled_quartz' : 'smooth_quartz'));

  // ---- 3) Tempel: Wand, Eckpfeiler, Rundbogenfenster, Gebälk ---------------------------------
  const tempel = ctx.part('tempel', SYM8);
  const tc = new Map();
  const put = (x, y, z, t) => tc.set(x + ',' + y + ',' + z, { x, y, z, t });
  const pillarCell = (x, z) => {
    const ax = Math.abs(x), az = Math.abs(z);
    const inBox = (p, q) => p >= PILLAR_X[0] && p <= PILLAR_X[1] && q >= PILLAR_Z[0] && q <= PILLAR_Z[1];
    return rho(x, z) <= LN.halfFlat && (inBox(ax, az) || inBox(az, ax));
  };
  for (let y = TEMPLE_Y0; y <= TEMPLE_Y1; y++) {
    for (const { x, z } of disc(LN.halfFlat)) {
      const wall = rho(x, z) > TEMPLE_IN;
      if (pillarCell(x, z) && faceU(x, z) > WIN_U) put(x, y, z, 'quartz_pillar');
      else if (wall) put(x, y, z, inWindow(x, y, z) ? 'white_stained_glass' : 'smooth_quartz');
    }
  }
  for (let y = ENTAB_Y0; y <= LN.templeTopY; y++) {
    const band = y === ENTAB_Y0 || y === LN.templeTopY; // Architrav und Kranzgesims
    for (const { x, z } of disc(ENTAB_RHO)) {
      put(x, y, z, band && rho(x, z) > LN.halfFlat ? 'chiseled_quartz' : 'smooth_quartz');
    }
  }
  const tl = [...tc.values()].sort((p, q) => p.y - q.y || p.x - q.x || p.z - q.z);
  tempel.fill(tl, (x, y, z) => tc.get(x + ',' + y + ',' + z).t);

  // ---- 4) Kegeldach: Achteckpyramide a 9 -> 1, Y 275..283 ------------------------------------
  const dach = ctx.part('kegeldach', SYM8);
  const rc = [...ctx.roofs.octPyramid({ cx: 0, cz: 0, a0: LN.halfFlat, y0: CONE_Y0, a1: 1, y1: CONE_Y1, solid: true })]; // B5: massiv (dicht)
  rc.sort((p, q) => p.y - q.y || p.x - q.x || p.z - q.z);
  dach.fill(rc, (x, y, z) => (rho(x, z) >= 2 && ctx.dome.cornerAngleDelta(x, z) <= CONE_EDGE_DELTA
    ? 'chiseled_quartz' : 'smooth_quartz'));

  // ---- 5) Kugel und Kreuz ----------------------------------------------------------------------
  const kk = ctx.part('kugel_und_kreuz', { symmetry: { order: 4, cx: 0, cz: 0 } });
  const kc = [];
  const R = LN.sphereRadius;
  for (let y = SPHERE_Y - R; y <= SPHERE_Y + R; y++) {
    for (let x = -R; x <= R; x++) {
      for (let z = -R; z <= R; z++) {
        if (ctx.shapes.inSphere(x, y - SPHERE_Y, z, R)) kc.push({ x, y, z });
      }
    }
  }
  for (let y = CROSS_STEM_Y0; y <= LN.crossTopY; y++) kc.push({ x: 0, y, z: 0 });
  kc.push({ x: 0, y: CROSS_BAR_Y, z: -1 }, { x: 0, y: CROSS_BAR_Y, z: 1 });
  kc.sort((p, q) => p.y - q.y || p.x - q.x || p.z - q.z);
  kk.fill(kc, 'gold_block');

  // B5: Inneres der Laterne (Sockel, Tempel, Kegel) ist bewusst unzugänglich; der Kuppelaufstieg wird nicht modelliert
  const innen = [];
  for (let y = BASE_Y; y <= CONE_Y1; y++) for (let x = -ENTAB_RHO; x <= ENTAB_RHO; x++) for (let z = -ENTAB_RHO; z <= ENTAB_RHO; z++) {
    if (ctx.shapes.inOctagon(x, z, ENTAB_RHO) && !ctx.grid.has(x, y, z)) innen.push({ x, y, z });
  }
  ctx.unzugaenglich(innen, 'Inneres der Laterne: im Modell ohne Kuppelaufstieg erreichbar nur über Dach und Kuppel, nicht begehbar');
  // Offene Bereiche außen an der Laterne (R14): Umgang zwischen Tempelwand und vorkragendem Gebälk bzw. Voluten,
  // Luft unter den Kreuzarmen
  const umgang = innen.filter((c) => c.y >= TEMPLE_Y0 && c.y <= LN.templeTopY && rho(c.x, c.z) > LN.halfFlat);
  ctx.oeffnung(umgang, 'loggia');
  ctx.oeffnung([{ x: 0, y: CROSS_BAR_Y - 1, z: -1 }, { x: 0, y: CROSS_BAR_Y - 1, z: 1 }], 'scharte');
  const unterKugel = [];
  for (let y = CONE_Y0; y < SPHERE_Y; y++) for (let x = -LN.sphereRadius - 1; x <= LN.sphereRadius + 1; x++) for (let z = -LN.sphereRadius - 1; z <= LN.sphereRadius + 1; z++) {
    if (!ctx.grid.has(x, y, z)) unterKugel.push({ x, y, z });
  }
  ctx.oeffnung(unterKugel, 'loggia'); // außen, unter der Kugel
}

module.exports = {
  module: 6,
  build,
  _internal: { BASE_Y, SOCKEL_Y1, TEMPLE_Y0, TEMPLE_Y1, SILL_Y, ARCH_SPRING_Y, CONE_Y0, CONE_Y1, VOL_TOP_Y, ENTAB_RHO, faceU, inWindow },
};
