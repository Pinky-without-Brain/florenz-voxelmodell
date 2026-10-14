'use strict';
// Modul 8: Baptisterium San Giovanni (BAUTEIL_KATALOG, Modul 8).
// Das Achteck wird über Flächen beschrieben: jede Zelle gehört zur Fläche mit der größten Projektion
// (Normale n_k, 45°-Schritte). Daraus folgen Tiefe d (0 = Außenfläche, 8 = Innenfläche) und die
// Koordinate u entlang der Fläche. Alle acht Flächen nutzen dieselbe Ansichtsfunktion, nur die
// Öffnungen (Portale O/N/S, Scarsella-Durchgang W) unterscheiden sich.
const D = require('../spec/dimensions.js');
const arches = require('../geom/arches.js');
const patterns = require('../geom/patterns.js');
const vaults = require('../geom/vaults.js');
const roofs = require('../geom/roofs.js');
const { inOctagon, box, octagonPrism } = require('../geom/shapes.js');

const B = D.BAPTISTERY;
const CX = B.centerX, CZ = B.centerZ;
const A_OUT = B.outerHalfFlat;                 // 33: Außenapothem
const A_VOID = B.innerHalfFlat - 1;            // 24: letzte Zelle des Innenraums (Wand a 25..33)
const WALK = D.LEVELS.walkY;                   // 65
const DEPTH_IN = A_OUT - B.innerHalfFlat;      // 8: Tiefe der innersten Wandschicht

// Höhenstufen laut Katalog (Modul 8)
const UG = [WALK, 90], OG = [91, 108], AT = [109, B.atticTopY];
const ROOF_Y0 = B.atticTopY + 1;               // 117: Pyramidenfuß auf der Attika
const GESIMS_ROWS = new Set([UG[1], OG[1]]);   // Gesimslagen mit 1 Block Vorsprung (ab Y 66 erlaubt)
const SHELL_TOP = B.atticTopY;

// Untergeschoss: Blendarkaden und Portale
const PORTAL_W = 5, PORTAL_TOP_Y = 82;         // Halbweite 5, Kämpfer Y 82 (Rechtecköffnung bis Y 82)
const PORTAL_FRAME = 2;                        // Marmorrahmen 2 breit
const PORTAL_LINTEL_TOP_Y = PORTAL_TOP_Y + PORTAL_FRAME;
const PLINTH_ROWS = 2;                         // Y 65..66: Sockelband
const ARC_BASE_Y = WALK + PLINTH_ROWS;         // 67: Fuß der Blendarkaden
const ARC_W = 3, ARC_SPRING_V = 13;            // Feldbreite 7, Kämpfer Y 80
const FIELD_C = [0, 8];                        // Feldmitten (|u|): 3 Felder je Fläche
const PIL_MID = 4, PIL_CORNER = 12;            // Pilaster bei |u| = 4 und ab 12
// Scarsella-Durchgang (Westfläche)
const WEST = 4;                                // Flächenindex West
// Durchgang: Oberkante wie die Portale (Y 82), damit der Hohlkern über Y 90 auf allen Flächen gleich bleibt
const WEST_W = 9, WEST_RISE = 5, WEST_SPRING_V = PORTAL_TOP_Y - WALK - WEST_RISE;
// Obergeschoss: Fenster
const WIN_SPRING_Y = 102, WIN_SPRING_V = 6, WIN_SILL_Y = WIN_SPRING_Y - WIN_SPRING_V; // 96
const WIN_GLASS_D = 4;                         // Glasebene in der Wandmitte (ρ 29)
const PED_Y0 = 105;                            // Giebel über dem mittleren Fenster
// Scarsella
const SC = B.scarsella;
const SC_X_EAST = CX - A_OUT - 1;              // -341: letzte Zelle vor der Westflucht des Achtecks
const SC_T = 3;                                // Wanddicke
const SC_ROOF_HIGH_Y = 100, SC_ROOF_LOW_Y = 93;
// Innenkuppel
const DOME_SPRING_Y = 98, DOME_A = 25, DOME_T = 2, EYE_R = 3;
// Laterne
const LANT_A = 4;
// Portale
const PORTAL_LEAF_D = 4;                       // Türblatt in der Wandmitte (ρ 29)
const LEAF_LINES_V = [0, 3, 6, 9, 13, 17];     // Rahmenlinien des Ostflügels (5 Zeilen Felder)
const LEAF_LINES_U = [0, 5, 10];               // 2 Spalten Felder

const S2 = Math.SQRT1_2;
const TAN22 = Math.tan(Math.PI / 8);
const ab = Math.abs;
const NX = [1, S2, 0, -S2, -1, -S2, 0, S2];
const NZ = [0, S2, 1, S2, 0, -S2, -1, -S2];
const PORTAL_FACES = new Set([0, 2, 6]);       // Ost, Süd, Nord
const GLASS = 'white_stained_glass';

// --- Flächenzuordnung -------------------------------------------------------
const infoCache = new Map();
function info(dx, dz) {
  const key = (dx + 64) * 256 + (dz + 64);
  let r = infoCache.get(key);
  if (r) return r;
  let k = 0, p = -Infinity;
  for (let i = 0; i < 8; i++) {
    const q = dx * NX[i] + dz * NZ[i];
    if (q > p) { p = q; k = i; }
  }
  const u = dx * -NZ[k] + dz * NX[k];
  r = { k, p, u, ua: ab(Math.round(u)), d: Math.round(A_OUT - p), hipDist: p * TAN22 - ab(u) };
  infoCache.set(key, r);
  return r;
}

const cellSet = (gen) => { const s = new Set(); for (const c of gen) s.add(ab(c.u) + ',' + c.v); return s; };

// --- Öffnungen und Rahmen ---------------------------------------------------
const WEST_OPEN = cellSet(arches.archOpeningRise(WEST_W, WEST_RISE, { springV: WEST_SPRING_V }));
const WEST_RING = cellSet(arches.archRingRise(WEST_W, WEST_RISE, PORTAL_FRAME, { springV: WEST_SPRING_V, jambs: true }));
const WIN_OPEN = cellSet(arches.archOpening(1, 0.5, { springV: WIN_SPRING_V }));
const WIN_RING = cellSet(arches.archRing(1, 0.5, 1, { springV: WIN_SPRING_V, jambs: true }));
const ARC_OPEN = cellSet(arches.archOpening(ARC_W, 0.5, { springV: ARC_SPRING_V }));
const ARC_RING = cellSet(arches.archRing(ARC_W, 0.5, 1, { springV: ARC_SPRING_V, jambs: false }));

// Mitte des Feldes, in dem u (≥ 0) liegt: u' = |u| − c
function inSet(set, ua, c, v) { return set.has(ab(ua - c) + ',' + v); }
const fieldHas = (set, ua, v) => FIELD_C.some((c) => inSet(set, ua, c, v));

const windowOpen = (ua, y) => y >= WIN_SILL_Y && fieldHas(WIN_OPEN, ua, y - WIN_SILL_Y);
const windowRing = (ua, y) => y >= WIN_SILL_Y && fieldHas(WIN_RING, ua, y - WIN_SILL_Y);
const portalOpen = (k, ua, y) => PORTAL_FACES.has(k) && ua <= PORTAL_W && y >= UG[0] && y <= PORTAL_TOP_Y;
const westOpen = (k, ua, y) => k === WEST && y >= WALK && WEST_OPEN.has(ua + ',' + (y - WALK));
const through = (k, ua, y) => portalOpen(k, ua, y) || westOpen(k, ua, y) || windowOpen(ua, y);
const portalFrame = (k, ua, y) => PORTAL_FACES.has(k) && y >= UG[0] && y <= PORTAL_LINTEL_TOP_Y &&
  ua <= PORTAL_W + PORTAL_FRAME && (ua > PORTAL_W || y > PORTAL_TOP_Y);
const westFrame = (k, ua, y) => k === WEST && y >= WALK && WEST_RING.has(ua + ',' + (y - WALK));

const REVEAL = 2;
// Massive Laibungen: Zellen bis REVEAL neben einer Durchgangsöffnung gelten für den hohlen Kern als leer
function nearThrough(k, ua, y) {
  for (let du = -REVEAL; du <= REVEAL; du++) {
    for (let dy = -REVEAL; dy <= REVEAL; dy++) if (through(k, ab(ua + du), y + dy)) return true;
  }
  return false;
}

// --- Ansichten (Außenschicht d = 0) ------------------------------------------

function ugFace(ua, y) {
  if (y === UG[0]) return 'dark_prismarine';
  if (y === UG[0] + 1) return 'smooth_quartz';
  if (y === UG[1]) return 'quartz_bricks';
  if (y === UG[1] - 2) return 'dark_prismarine';                 // Fries unter dem Gesims
  if (ua === PIL_MID || ua >= PIL_CORNER) return 'dark_prismarine'; // Pilaster
  const v = y - ARC_BASE_Y;
  if (fieldHas(ARC_RING, ua, v)) return 'dark_prismarine';
  return 'smooth_quartz';
}
const ugRecess = (ua, y) => y >= ARC_BASE_Y && y < UG[1] - 2 && fieldHas(ARC_OPEN, ua, y - ARC_BASE_Y);

function ogFace(ua, y) {
  if (y === OG[0]) return 'smooth_quartz';
  if (y === OG[1]) return 'quartz_bricks';
  if (windowRing(ua, y)) return 'chiseled_quartz';
  if (ua <= 3 && y >= PED_Y0 && y < OG[1]) {                     // Giebel über dem mittleren Fenster
    const hw = 3 - (y - PED_Y0);
    if (ua <= hw) return (ua === hw || y === PED_Y0) ? 'chiseled_quartz' : 'smooth_quartz';
  }
  if (ua === PIL_MID || ua >= PIL_CORNER) return 'dark_prismarine';
  return 'smooth_quartz';
}

const STRIPES = patterns.bands({ types: ['dark_prismarine', 'smooth_quartz'], period: 2, offset: AT[0] });

// Wandzelle ohne Hohlkern: null = leer
function wallType(k, ua, d, y) {
  if (windowOpen(ua, y)) return d === WIN_GLASS_D ? GLASS : null;
  if (through(k, ua, y)) return null;
  if (portalFrame(k, ua, y) || westFrame(k, ua, y)) return d <= 1 ? 'chiseled_quartz' : 'smooth_quartz';
  const inner = d >= DEPTH_IN ? 'smooth_stone' : 'stone_bricks';
  if (y <= UG[1]) {
    if (d === 0) return ugRecess(ua, y) ? null : ugFace(ua, y);
    if (d === 1 && ugRecess(ua, y)) return 'smooth_quartz';
    return inner;
  }
  if (y <= OG[1]) {
    if (d === 0) return ogFace(ua, y);
    if (d === 1 && windowRing(ua, y)) return 'chiseled_quartz';
    return inner;
  }
  if (d <= 1) return STRIPES(0, y);
  return inner;
}

const inWall = (dx, dz) => inOctagon(dx, dz, A_OUT) && !inOctagon(dx, dz, A_VOID);
const inScarsellaZone = (dx, dz) => dx <= -(A_OUT + 1) && ab(dz) <= SC.halfZ;

// Hohlkern nach A1: Schalen von je 2 Blöcken (gemessen als Tiefe d von der jeweiligen Fläche, auch auf den
// Diagonalen), Binderlage alle 12 Lagen, oberste 3 Lagen voll, Laibungen massiv.
const SHELL = 2, BINDER = 12, TOP_FULL = 3;
function isHollow(x, y, z) {
  if ((y - WALK) % BINDER === 0 || y > SHELL_TOP - TOP_FULL || y < WALK + SHELL) return false;
  const dx = x - CX, dz = z - CZ;
  if (!inWall(dx, dz)) return false;
  const f = info(dx, dz);
  if (f.d < SHELL || f.d > DEPTH_IN - SHELL) return false;
  return !nearThrough(f.k, f.ua, y);
}

// Zelle der Wand (Schale + Gesimsring) auf Höhe y
function wallCell(x, y, z) {
  const dx = x - CX, dz = z - CZ;
  if (inWall(dx, dz)) {
    const f = info(dx, dz);
    const t = wallType(f.k, f.ua, f.d, y);
    if (t === null) return null;
    if (t !== GLASS && isHollow(x, y, z)) return null;
    return t;
  }
  if (GESIMS_ROWS.has(y) && inOctagon(dx, dz, A_OUT + 1) && !inOctagon(dx, dz, A_OUT) && !(y === UG[1] && inScarsellaZone(dx, dz))) {
    return y === UG[1] ? 'chiseled_quartz' : 'quartz_bricks';
  }
  return null;
}

function fillWall(w, y0, y1, ctx) {
  w.fill(box(CX - A_OUT - 1, y0, CZ - A_OUT - 1, CX + A_OUT + 1, y1, CZ + A_OUT + 1), (x, y, z) => wallCell(x, y, z));
  if (!ctx) return;
  // B5: Hohlkern (A1) und Durchgänge deklarieren
  const hohl = [], tor = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = CX - A_OUT; x <= CX + A_OUT; x++) {
      for (let z = CZ - A_OUT; z <= CZ + A_OUT; z++) {
        const dx = x - CX, dz = z - CZ;
        if (!inWall(dx, dz)) continue;
        const f = info(dx, dz);
        const t = wallType(f.k, f.ua, f.d, y);
        if (t !== null && t !== GLASS && isHollow(x, y, z)) hohl.push({ x, y, z });
        if (t === null && (portalOpen(f.k, f.ua, y) || westOpen(f.k, f.ua, y)) && f.k !== 0) tor.push({ x, y, z });
      }
    }
  }
  if (hohl.length) ctx.unzugaenglich(hohl, 'Hohlkern des Schalenmauerwerks (A1): ringsum geschlossen, kein Raum');
  if (tor.length) ctx.oeffnung(tor, 'tor');
}

// --- Scarsella ----------------------------------------------------------------
const SC_INNER_HALF = SC.halfZ - SC_T;         // 10
function scarsellaCells() {
  const x0 = SC.westX, x1 = SC_X_EAST;
  const roof = [...roofs.shedRoof({ x0, x1, z0: -SC.halfZ, z1: SC.halfZ, axis: 'x', highAt: 'max',
    highY: SC_ROOF_HIGH_Y, lowY: SC_ROOF_LOW_Y })];
  const lowest = new Map();                    // Säule -> unterste Dachzelle
  for (const c of roof) {
    const k = c.x + ',' + c.z;
    if (!lowest.has(k) || c.y < lowest.get(k)) lowest.set(k, c.y);
  }
  const winOpen = arches.archOpening(2, 0.5, { springV: 6 });
  const WIN = new Set(); for (const c of winOpen) WIN.add(ab(c.u) + ',' + c.v);
  const WIN_BASE_Y = 76;
  const inc = patterns.incrustation({ axis: 'x', panelW: 7, panelH: 9, u0: -4, v0: WALK });
  const incW = patterns.incrustation({ axis: 'z', panelW: 7, panelH: 9, u0: -4, v0: WALK });
  const cells = [];
  for (let x = x0; x <= x1; x++) {
    for (let z = -SC.halfZ; z <= SC.halfZ; z++) {
      const westWall = x < x0 + SC_T, sideWall = ab(z) > SC_INNER_HALF;
      if (!westWall && !sideWall) continue;
      const dW = westWall ? x - x0 : Infinity, dS = sideWall ? SC.halfZ - ab(z) : Infinity;
      const dd = Math.min(dW, dS);
      for (let y = WALK; y < lowest.get(x + ',' + z); y++) {
        if (westWall && dW <= dS && ab(z) <= 2 && WIN.has(ab(z) + ',' + (y - WIN_BASE_Y))) {
          if (dd === 1) cells.push({ x, y, z, t: GLASS });
          continue;
        }
        let t;
        if (dd === 0) t = (dW <= dS ? incW : inc)(x, y, z);
        else t = dd === 1 ? 'stone_bricks' : 'smooth_stone';
        cells.push({ x, y, z, t });
      }
    }
  }
  for (const c of roof) cells.push({ x: c.x, y: c.y, z: c.z, t: 'terracotta' });
  return cells;
}

// --- Dach, Kuppel, Laterne ------------------------------------------------------
const hipAt = (dx, dz) => info(dx, dz).hipDist < 0.7;

function domeCells() {
  const rise = B.roofApexY - DOME_T - DOME_SPRING_Y + 0.4;   // Scheitel unter dem Pyramidenplateau (Y 126)
  // Das Dach liegt flächig auf dem Scheitel: Kuppelzellen werden unter der Dachunterkante gekappt
  const roofLow = new Map();
  for (const c of roofCells()) { const k = c.x + ',' + c.z; if (!(roofLow.get(k) <= c.y)) roofLow.set(k, c.y); }
  const raw = [...vaults.cloisterVault({ cx: CX, cz: CZ, a: DOME_A, springY: DOME_SPRING_Y, rise,
    thickness: DOME_T, rhoMin: EYE_R })]
    .filter((c) => inOctagon(c.x - CX, c.z - CZ, A_VOID) && !(c.y >= roofLow.get(c.x + ',' + c.z)));
  const set = new Set(raw.map((c) => c.x + ',' + c.y + ',' + c.z));
  const ZONES = ['blue_terracotta', 'gold_block', 'yellow_terracotta', 'gold_block'];
  return raw.map((c) => {
    if (set.has(c.x + ',' + (c.y - 1) + ',' + c.z)) return { ...c, t: 'stone_bricks' };
    const dx = c.x - CX, dz = c.z - CZ;
    if (hipAt(dx, dz)) return { ...c, t: 'gold_block' };
    const zone = Math.floor((vaults.rho(dx, dz) - EYE_R) / 3);
    return { ...c, t: ZONES[zone % ZONES.length] };
  });
}

function roofCells() {
  return [...roofs.octPyramid({ cx: CX, cz: CZ, a0: A_OUT, y0: ROOF_Y0, a1: 4.25, y1: B.roofApexY })]
    .filter((c) => vaults.rho(c.x - CX, c.z - CZ) >= EYE_R)
    .map((c) => ({ ...c, t: hipAt(c.x - CX, c.z - CZ) ? 'dark_prismarine' : 'smooth_quartz' }));
}

const LANT_Y0 = B.roofApexY + 1;               // 127
const LANT_COL_TOP = 133, LANT_BEAM_Y = 134;
function lanternCells() {
  const cells = [];
  const colRing = (dx, dz) => inOctagon(dx, dz, LANT_A) && (ab(dx) + ab(dz) === Math.floor(LANT_A * Math.SQRT2 + 0.5));
  for (let dx = -LANT_A; dx <= LANT_A; dx++) {
    for (let dz = -LANT_A; dz <= LANT_A; dz++) {
      const rand = inOctagon(dx, dz, LANT_A) && !inOctagon(dx, dz, LANT_A - 1);
      const saeule = colRing(dx, dz) && ab(dx) !== ab(dz);
      // B5: zwischen den Säulen verglast (das Kuppelauge darunter ist offen)
      if (saeule || rand) for (let y = LANT_Y0; y <= LANT_COL_TOP; y++) cells.push({ x: CX + dx, y, z: CZ + dz, t: saeule ? 'quartz_pillar' : GLASS });
    }
  }
  for (const c of octagonPrism(CX, CZ, LANT_A + 1, LANT_BEAM_Y, LANT_BEAM_Y)) {
    const edge = !inOctagon(c.x - CX, c.z - CZ, LANT_A);
    cells.push({ ...c, t: edge ? 'chiseled_quartz' : 'smooth_quartz' });
  }
  for (const c of roofs.octPyramid({ cx: CX, cz: CZ, a0: LANT_A, y0: LANT_BEAM_Y + 1, a1: 0, y1: B.lanternTopY, solid: true })) {
    cells.push({ ...c, t: c.y === B.lanternTopY ? 'gold_block' : 'smooth_quartz' });
  }
  return cells;
}

// --- Portale (Türblätter) ----------------------------------------------------------
function portalLeafCells() {
  const cells = [];
  const leafPos = (k, u) => (k === 0 ? [CX + PORTAL_A, CZ + u] : k === 6 ? [CX + u, CZ - PORTAL_A] : [CX + u, CZ + PORTAL_A]);
  // B5: Nord- und Südportal stehen offen (Zugang), das Ostportal (Paradiespforte) bleibt geschlossen
  for (const k of [0]) {
    for (let u = -PORTAL_W; u <= PORTAL_W; u++) {
      for (let y = WALK; y <= PORTAL_TOP_Y; y++) {
        const v = y - WALK, c = u + PORTAL_W;
        let t = 'cut_copper';
        if (k === 0) t = (LEAF_LINES_U.includes(c) || LEAF_LINES_V.includes(v)) ? 'cut_copper' : 'gold_block';
        const [x, z] = leafPos(k, u);
        cells.push({ x, y, z, t });
      }
    }
  }
  return cells;
}
const PORTAL_A = A_OUT - PORTAL_LEAF_D;        // 29

function build(ctx) {
  const SYM = { symmetry: { order: 8, cx: CX, cz: CZ } };

  // 1 Sockel und Untergeschoss (Portale O/N/S, Durchgang W; ohne Symmetrie-Flag)
  fillWall(ctx.part('sockel_und_untergeschoss'), UG[0], UG[1], ctx);

  // 2 Türblätter der Portale
  const leaves = ctx.part('portale');
  for (const c of portalLeafCells()) leaves.set(c.x, c.y, c.z, c.t);

  // 3 Scarsella (direkt nach dem Untergeschoss, vor dem Obergeschoss)
  const sc = ctx.part('scarsella');
  for (const c of scarsellaCells()) sc.set(c.x, c.y, c.z, c.t);

  // 4 Obergeschoss, 5 Attika
  fillWall(ctx.part('obergeschoss', SYM), OG[0], OG[1], ctx);
  fillWall(ctx.part('attika', SYM), AT[0], AT[1], ctx);

  // 6 Innenkuppel (liegt auf der Wand), 7 Pyramidendach (liegt auf Attika und Kuppel), 8 Laterne
  const dome = ctx.part('innenkuppel', SYM);
  for (const c of domeCells()) dome.set(c.x, c.y, c.z, c.t);
  const roof = ctx.part('pyramidendach', SYM);
  for (const c of roofCells()) roof.set(c.x, c.y, c.z, c.t);
  const lantern = ctx.part('laterne', SYM);
  for (const c of lanternCells()) lantern.set(c.x, c.y, c.z, c.t);

  // B5: Dachraum über der Innenkuppel, Laternenraum, Mauerkrone der Scarsella (bewusst unzugänglich)
  const domeTop = new Map();
  for (const c of domeCells()) { const k = c.x + ',' + c.z; if (!(domeTop.get(k) >= c.y)) domeTop.set(k, c.y); }
  const dach = [];
  for (const [k, top] of domeTop) {
    const [x, z] = k.split(',').map(Number);
    for (let y = top + 1; y <= B.roofApexY; y++) if (!ctx.grid.has(x, y, z)) dach.push({ x, y, z });
  }
  ctx.unzugaenglich(dach, 'Dachraum zwischen Innenkuppel und Pyramidendach: leerer Raum ohne Bedeutung');
  const lr = [];
  for (let dx = -LANT_A; dx <= LANT_A; dx++) for (let dz = -LANT_A; dz <= LANT_A; dz++) {
    if (!inOctagon(dx, dz, LANT_A)) continue;
    for (let y = B.roofApexY - 1; y < LANT_BEAM_Y; y++) if (!ctx.grid.has(CX + dx, y, CZ + dz)) lr.push({ x: CX + dx, y, z: CZ + dz });
  }
  ctx.unzugaenglich(lr, 'Inneres der Laterne über dem Dachauge: nur Lichtschacht, nicht begehbar');
  const unterGebaelk = [];
  for (let dx = -LANT_A - 1; dx <= LANT_A + 1; dx++) for (let dz = -LANT_A - 1; dz <= LANT_A + 1; dz++) {
    if (!inOctagon(dx, dz, LANT_A + 1) || inOctagon(dx, dz, LANT_A)) continue;
    for (let y = B.roofApexY - 2; y < LANT_BEAM_Y; y++) if (!ctx.grid.has(CX + dx, y, CZ + dz)) unterGebaelk.push({ x: CX + dx, y, z: CZ + dz });
  }
  ctx.oeffnung(unterGebaelk, 'loggia'); // außen, nur vom Gebälk der Laterne überdeckt
  const sk = [];
  for (let z = -SC.halfZ; z <= SC.halfZ; z++) for (let y = SC_ROOF_HIGH_Y + 1; y < OG[1]; y++) {
    if (!ctx.grid.has(SC_X_EAST, y, z)) sk.push({ x: SC_X_EAST, y, z });
  }
  ctx.unzugaenglich(sk, 'Dachkante der Scarsella unter dem Gesims des Achtecks: kein Standplatz');
  ctx.oeffnung(sk, 'loggia'); // außen, nur vom Gesims überdeckt
}

module.exports = {
  module: 8,
  build,
  _internal: { info, wallType, wallCell, domeCells, roofCells, lanternCells, scarsellaCells, portalLeafCells, through, inWall },
};
