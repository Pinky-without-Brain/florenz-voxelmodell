'use strict';
// Modul 7: Campanile di Giotto (BAUTEIL_KATALOG, Modul 7).
// Eine Ansichtsfunktion je Geschoss (a, d, y): a = Abstand von der Flächenmitte, d = Tiefe in der
// Wand (0 = außen, 4 = innen). Alle vier Seiten sind identisch; nur die Tür liegt im Osten.
const D = require('../spec/dimensions.js');
const arches = require('../geom/arches.js');
const patterns = require('../geom/patterns.js');
const { box, inOctagon } = require('../geom/shapes.js');

const CAMP = D.CAMPANILE;
const CX = CAMP.centerX, CZ = CAMP.centerZ;
const HALF = CAMP.half;                       // 14: Außenflucht
const WALL_T = 5;                             // Wanddicke (Katalog)
const INNER = HALF - WALL_T;                  // 9: letzte Zelle des Innenraums
const WALL_IN = INNER + 1;                    // 10: innerste Wandzelle
const OUT = HALF + 1;                         // 15: Vorsprung (Eckpfeiler, Kranz)
const PILLAR_C = HALF - 2;                    // 12: Mitte der Eckpfeiler (Katalog)
const PILLAR_A = 3;                           // Apothem der Eckpfeiler (Katalog)
const WALK_Y = D.LEVELS.walkY;                // 65
const TOP_Y = CAMP.topY;                      // 233

// Höhenstufen laut Katalog (Modul 7)
const SOCKEL = [65, 100], NISCHEN = [101, 122], BIF1 = [123, 150], BIF2 = [151, 178], TRIF = [179, 221];
const PILLAR_TOP_Y = 222;
const FRIEZE = [222, 224];
const TERRACE_Y = 225;
const PARAPET = [226, 228];
const FIAL_Y0 = 229;
const DECKS = [SOCKEL[1], NISCHEN[1], BIF1[1], BIF2[1], TERRACE_Y];   // 100, 122, 150, 178, 225
const CORNICE_ROWS = new Set(DECKS.slice(0, 4));

const ab = Math.abs;
const keyOf = (u, w, y) => u + ',' + w + ',' + y;
const baseType = (d) => (d >= WALL_T - 1 ? 'smooth_stone' : 'stone_bricks');
const inPillar = (u, w) => inOctagon(ab(u) - PILLAR_C, ab(w) - PILLAR_C, PILLAR_A);

// Treppenloch: 3 × 3 in der NW-Ecke des Innenraums (u, w −9..−7)
const HOLE_MIN = -INNER, HOLE_MAX = -INNER + 2;
const inHole = (u, w) => u >= HOLE_MIN && u <= HOLE_MAX && w >= HOLE_MIN && w <= HOLE_MAX;

const cellSet = (gen) => { const s = new Set(); for (const c of gen) s.add(c.u + ',' + c.v); return s; };

// --- Eckpfeiler und Wandzelle -----------------------------------------------
function pillarType(u, w, y) {
  const m = Math.max(ab(u), ab(w));
  if (m === OUT && y <= WALK_Y) return null;   // Vorsprung erst ab Y 66: das Auflager (Boden M0) endet bei Maß 14
  if (m === WALL_IN) return 'smooth_stone';
  if (m >= HALF - 1) return CORNICE_ROWS.has(y) ? 'quartz_bricks' : 'smooth_quartz';
  return 'stone_bricks';
}

// Wandzelle (u, w) auf Höhe y mit Ansichtsfunktion view(a, d, y); null = nicht belegt
function wallCell(u, w, y, view) {
  const au = ab(u), aw = ab(w), m = Math.max(au, aw);
  if (m < WALL_IN || m > OUT) return null;
  if (inPillar(u, w)) return pillarType(u, w, y);
  if (m === OUT) return null;
  const a = au >= WALL_IN ? aw : au;           // Koordinate entlang der Fläche (nicht Ecke: dort Pfeiler)
  return view(a, HALF - m, y);
}

const ringBox = (y0, y1) => box(CX - OUT, y0, CZ - OUT, CX + OUT, y1, CZ + OUT);
function fillWall(w, y0, y1, view, filter) {
  return w.fill(ringBox(y0, y1), (x, y, z) => {
    const u = x - CX, v = z - CZ;
    if (filter && filter(u, v, y)) return null;
    return wallCell(u, v, y, view);
  });
}

// --- Sockel (Y 65..100) -----------------------------------------------------
const DOOR_W = 2, DOOR_SPRING = 72 - WALK_Y;   // Halbweite 2, Kämpfer Y 72
const DOOR_F = 0.5;
const DOOR_OPEN = cellSet(arches.archOpening(DOOR_W, DOOR_F, { springV: DOOR_SPRING }));
const DOOR_ZONE = cellSet(arches.archOpening(DOOR_W + 1, DOOR_F, { springV: DOOR_SPRING }));
const DOOR_RING = cellSet(arches.archRing(DOOR_W, DOOR_F, 1, { springV: DOOR_SPRING, jambs: true }));

const HEX_HALF = [1, 2, 2, 2, 2, 2, 2, 1];     // Sechseck 5 breit, 8 hoch
const inHex = (du, lv) => lv >= 0 && lv < HEX_HALF.length && ab(du) <= HEX_HALF[lv];
function hexType(du, lv) {
  if (!inHex(du, lv)) return 'dark_prismarine';
  const edge = !inHex(du - 1, lv) || !inHex(du + 1, lv) || !inHex(du, lv - 1) || !inHex(du, lv + 1);
  return edge ? 'smooth_quartz' : 'polished_granite';
}
function sockelFace(a, y) {
  if (y === 65) return 'dark_prismarine';
  if (y === 66) return 'smooth_quartz';
  if (y === 75 || y === 84) return 'smooth_quartz';
  if (y <= 83) {                                // Register 1: Sechseck-Reliefs, zwei Reihen
    const lv = y < 75 ? y - 67 : y - 76;
    const du = a <= 2 ? a : (a >= 4 && a <= 8 ? a - 6 : null);
    return du === null ? 'dark_prismarine' : hexType(du, lv);
  }
  if (y <= 98) {                                // Register 2: Rauten, zwei Reihen
    const da = Math.min(a, ab(a - 7));
    const dv = ab(y - (y <= 91 ? 88 : 95));
    const s = da + dv;
    return s <= 1 ? 'polished_granite' : (s <= 3 ? 'dark_prismarine' : 'smooth_quartz');
  }
  return y === 99 ? 'smooth_quartz' : 'quartz_bricks';
}
const sockelView = (a, d, y) => (d === 0 ? sockelFace(a, y) : baseType(d));

// --- Nischengeschoss (Y 101..122) -------------------------------------------
const NICHE_C = [2, 7];                        // Mitten der Nischen (|a|), je Seite 4
const NICHE_BASE_Y = 106, NICHE_SPRING = 114 - NICHE_BASE_Y;
const NICHE_OPEN = cellSet(arches.archOpening(1, 0.5, { springV: NICHE_SPRING }));
const NICHE_RING = cellSet(arches.archRing(1, 0.5, 1, { springV: NICHE_SPRING, jambs: true }));
const INC_NISCHEN = patterns.incrustation({ axis: 'x', panelW: 5, panelH: 6, u0: 3, v0: NISCHEN[0] + 1 });
function nischenView(a, d, y) {
  if (d > 0) return baseType(d);
  if (y === NISCHEN[0]) return 'smooth_quartz';
  if (y === NISCHEN[1]) return 'quartz_bricks';
  for (const c of NICHE_C) {
    const du = a - c;
    if (ab(du) > 2) continue;
    const key = du + ',' + (y - NICHE_BASE_Y);
    if (NICHE_OPEN.has(key)) {
      const v = y - NICHE_BASE_Y;
      if (du === 0 && v === 0) return 'polished_andesite';     // Sockel der Figur
      if (du === 0 && v >= 1 && v <= 4) return 'calcite';      // Statue
      return null;
    }
    if (NICHE_RING.has(key)) return 'chiseled_quartz';
  }
  return INC_NISCHEN(a, y, 0);
}

// --- Biforien (Y 123..150 und 151..178) -------------------------------------
const BI_SILL = 126 - BIF1[0], BI_SPRING = 140 - 126;          // Unterkante / Kämpfer relativ zum Geschoss
const BI_ENC_BASE = 125 - BIF1[0], BI_ENC_SPRING = 138 - 125;  // umfassender Bogen
const BI_SMALL = cellSet(arches.archOpening(2, 0.8, { springV: BI_SPRING }));
const BI_ENC = cellSet(arches.archOpening(7, 0.8, { springV: BI_ENC_SPRING }));
const BI_ENC_RING = cellSet(arches.archRing(7, 0.8, 1, { springV: BI_ENC_SPRING, jambs: true }));
function biforienView(seg) {
  const y0 = seg[0], top = seg[1];
  const sill = y0 + BI_SILL, encBase = y0 + BI_ENC_BASE;
  const inc = patterns.incrustation({ axis: 'x', panelW: 5, panelH: 8, u0: 3, v0: y0 });
  return (a, d, y) => {
    if (y === top) return d === 0 ? 'quartz_bricks' : baseType(d);
    const vS = y - sill;
    if (BI_SMALL.has((a - 3) + ',' + vS)) return null;              // offene Doppelbogen, ganze Wanddicke
    if (a === 0 && vS >= 0 && vS < BI_SPRING) return 'quartz_pillar'; // Mittelsäule
    if (a === 0 && vS === BI_SPRING) return 'polished_andesite';     // Kapitell
    const eKey = a + ',' + (y - encBase);
    if (d === 0) {
      if (BI_ENC_RING.has(eKey)) return 'chiseled_quartz';
      if (BI_ENC.has(eKey)) return null;                             // Rücksprung des umfassenden Bogens
      return inc(a, y, 0);
    }
    if (d === 1 && BI_ENC.has(eKey)) return 'polished_granite';
    return baseType(d);
  };
}

// --- Triforien (Y 179..221) --------------------------------------------------
const TRI_SILL = 186,TRI_SPRING = 208 - TRI_SILL, TRI_COLUMN_A = 3, TRI_C = [0, 6];
const TRI_OPEN = cellSet(arches.archOpening(2, 0.8, { springV: TRI_SPRING }));
const TRI_RING = cellSet(arches.archRing(2, 0.8, 1, { springV: TRI_SPRING, jambs: true }));
const GABLE_Y0 = 213, GABLE_HALF0 = INNER;
const INC_TRIF = patterns.incrustation({ axis: 'x', panelW: 5, panelH: 8, u0: 3, v0: TRIF[0] });
function triforienView(a, d, y) {
  const vT = y - TRI_SILL;
  for (const c of TRI_C) if (TRI_OPEN.has((a - c) + ',' + vT)) return null;
  if (a === TRI_COLUMN_A && vT >= 0 && vT < TRI_SPRING) return 'quartz_pillar';
  if (a === TRI_COLUMN_A && vT === TRI_SPRING) return 'polished_andesite';
  if (y >= GABLE_Y0) {                          // Wimperg: dreieckiger Giebel über den Bögen
    const hw = GABLE_HALF0 - (y - GABLE_Y0);
    if (a <= hw) {
      const border = y === GABLE_Y0 || a >= hw - 1;
      if (d === 0) return border ? 'chiseled_quartz' : null;
      if (d === 1 && !border) return 'dark_prismarine';
      return baseType(d);
    }
  }
  if (d > 0) return baseType(d);
  for (const c of TRI_C) if (TRI_RING.has((a - c) + ',' + vT)) return 'chiseled_quartz';
  return INC_TRIF(a, y, 0);
}

// --- Kranz, Terrasse, Brüstung, Fialen --------------------------------------
function friezeCell(u, w, y) {
  const au = ab(u), aw = ab(w), m = Math.max(au, aw);
  if (m < WALL_IN || m > OUT) return null;
  if (y === PILLAR_TOP_Y && inPillar(u, w)) return pillarType(u, w, y);
  if (m <= HALF) {
    const d = HALF - m;
    if (d === 0) return y === FRIEZE[1] ? 'quartz_bricks' : 'smooth_quartz';
    return baseType(d);
  }
  if (y === FRIEZE[1]) return 'quartz_bricks';                   // Gesimsband, voll
  return (au + aw) % 2 === 0 ? 'polished_andesite' : null;       // Konsolen, jede 2. Zelle
}
function terraceCell(u, w) {
  if (inHole(u, w)) return null;
  return (Math.floor((u + OUT) / 3) + Math.floor((w + OUT) / 3)) % 2 === 0 ? 'smooth_quartz' : 'dark_prismarine';
}
function parapetCell(u, w, y) {
  const au = ab(u), aw = ab(w), m = Math.max(au, aw);
  if (m < HALF || m > OUT) return null;
  if (y === PARAPET[0]) return 'smooth_quartz';
  if (y === PARAPET[1]) return 'quartz_bricks';
  if (au >= HALF && aw >= HALF) return 'smooth_quartz';          // Ecken bleiben voll
  const a = au >= aw ? aw : au;
  return a % 2 === 0 ? 'chiseled_quartz' : null;                 // Maßwerk: jede 2. Zelle offen
}
function fialeCell(u, w, y) {
  if (ab(u) < HALF || ab(w) < HALF || ab(u) > OUT || ab(w) > OUT) return null;
  if (y < TOP_Y - 1) return 'smooth_quartz';
  if (y === TOP_Y - 1) return 'chiseled_quartz';
  return ab(u) === OUT && ab(w) === OUT ? 'chiseled_quartz' : null;   // Spitze: nur die äußerste Ecke
}

// --- Treppe -------------------------------------------------------------------
// Innen an den Wänden umlaufend, Breite 2 (Windmühlenaufteilung des Rings, 4 × 17 Positionen).
// Jede Position hat einen Tritt (y = t) und einen Stützblock darunter (y = t − 1), damit die Treppe
// ein zusammenhängendes Bauteil ist. Je Geschoss ein Umlauf; durch die Decke geht sie am Treppenloch.
const RING_N = 4 * (2 * INNER - 1);           // 68 Positionen je Umlauf
const SIDE_N = RING_N / 4;                    // 17
function posCells(q) {
  q = ((q - 1) % RING_N + RING_N) % RING_N + 1;
  const o = INNER, i = INNER - 1;
  if (q <= SIDE_N) { const u = -o + (q - 1); return [[u, -o], [u, -i]]; }
  if (q <= 2 * SIDE_N) { const w = -o + (q - SIDE_N - 1); return [[o, w], [i, w]]; }
  if (q <= 3 * SIDE_N) { const u = o - (q - 2 * SIDE_N - 1); return [[u, o], [u, i]]; }
  const w = o - (q - 3 * SIDE_N - 1);
  return [[-o, w], [-i, w]];
}
const CORNER_GAPS = [0, SIDE_N, 2 * SIDE_N, 3 * SIDE_N, RING_N];
const cornerDist = (g) => Math.min(...CORNER_GAPS.map((c) => ab(g - c)));
const HOLE_Q = [RING_N, 1, 2, 3];             // Positionen im Treppenloch
const START_Q = 23;                           // Ostseite, vor der Tür

// Läuft von Position qFrom bis qTo; Stufen (Anstieg 1) liegen mittig an den Seiten, Podeste an den Ecken.
function addRun(path, qFrom, qTo, h0, h1) {
  const gaps = [];
  for (let g = qFrom; g < qTo; g++) gaps.push(g);
  const rise = h1 - h0;
  if (rise < 0 || rise > gaps.length) throw new RangeError(`Treppe: Anstieg ${rise} passt nicht auf ${gaps.length} Schritte`);
  const zeros = new Set(gaps.slice().sort((x, y) => cornerDist(x) - cornerDist(y) || x - y).slice(0, gaps.length - rise));
  let h = h0;
  for (let q = qFrom; q <= qTo; q++) {
    path.push({ q, t: h });
    if (q < qTo && !zeros.has(q)) h++;
  }
}
function addHole(path, deck, last) {
  const n = last ? 3 : 4;                     // letztes Loch: Austritt auf die Terrasse
  for (let k = 0; k < n; k++) path.push({ q: HOLE_Q[k], t: deck - 2 + k });
}
function stairPath() {
  const path = [];
  addRun(path, START_Q, RING_N - 1, WALK_Y, DECKS[0] - 3);
  addHole(path, DECKS[0], false);
  for (let s = 1; s < DECKS.length; s++) {
    addRun(path, 4, RING_N - 1, DECKS[s - 1] + 2, DECKS[s] - 3);
    addHole(path, DECKS[s], s === DECKS.length - 1);
  }
  return path;
}
// Zellen der Treppe: Map "u,w,y" -> Typ
function stairCells() {
  const cells = new Map();
  for (const { q, t } of stairPath()) {
    for (const [u, w] of posCells(q)) {
      cells.set(keyOf(u, w, t), 'polished_andesite');
      if (t - 1 >= WALK_Y) cells.set(keyOf(u, w, t - 1), 'stone_bricks');
    }
  }
  return cells;
}
const STAIR_SECTIONS = [[65, 100], [101, 122], [123, 150], [151, 178], [179, 221], [222, 225]];

// --- Glockenstuhl -------------------------------------------------------------
const BEAM_Y = 214;
// Glockenschale: obere Halbkugel, Dicke 1,5 (Abstand zur Mitte d: r − 1 < d ≤ r + 0,5), flächig zusammenhängend
const inBellShell = (dx, dy, dz, r) => {
  const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return d <= r + 0.5 && d > r - 1;
};
// Glocken: Mitte (u, w), Radius, Unterkante der Glocke (Rand). Der Hänger füllt von der Spitze bis zum Balken.
const BELLS = [
  { name: 'Campanone', u: 0, w: 0, r: 3, rim: 207 },
  { u: 6, w: 0, r: 2, rim: 210 }, { u: -6, w: 0, r: 2, rim: 210 },
  { u: 0, w: 6, r: 2, rim: 210 }, { u: 0, w: -6, r: 2, rim: 210 },
  { u: 5, w: 5, r: 1, rim: 211 }, { u: -5, w: -5, r: 1, rim: 211 }
];
function beamCells() {
  const s = new Map();
  for (let k = -INNER; k <= INNER; k++) {
    for (let j = -1; j <= 1; j++) { s.set(keyOf(k, j, BEAM_Y), 1); s.set(keyOf(j, k, BEAM_Y), 1); }
  }
  // Stichbalken zu den kleinen Glocken in den Ecken (an den Balken in w = ±1 angesetzt)
  for (const sgn of [1, -1]) for (let k = 2; k <= 5; k++) s.set(keyOf(5 * sgn, sgn * k, BEAM_Y), 1);
  return [...s.keys()];
}

function build(ctx) {
  const SYM = { symmetry: { order: 4, cx: CX, cz: CZ } };
  const stair = stairCells();
  const stairPart = (id, [y0, y1]) => {
    const w = ctx.part(id);
    for (const [k, type] of stair) {
      const [u, v, y] = k.split(',').map(Number);
      if (y >= y0 && y <= y1) w.set(CX + u, y, CZ + v, type);
    }
  };
  const deck = (id, y) => {
    const w = ctx.part(id);
    w.fill(box(CX - INNER, y, CZ - INNER, CX + INNER, y, CZ + INNER),
      (x, yy, z) => (inHole(x - CX, z - CZ) ? null : 'smooth_stone'));
  };

  // 1 Sockel mit den zwei Reliefregistern (Tür im Osten ausgespart, darum ohne Symmetrie-Flag)
  const doorZone = (u, v, y) => u >= WALL_IN && ab(v) <= DOOR_W + 1 && DOOR_ZONE.has(v + ',' + (y - WALK_Y));
  fillWall(ctx.part('sockel_reliefs'), SOCKEL[0], SOCKEL[1], sockelView, doorZone);

  // 2 Eingangstür (nur Osten): Rahmen aus Marmor und Bronzeflügel
  const tuer = ctx.part('eingangstuer');
  for (let d = 0; d < WALL_T; d++) {
    const x = CX + HALF - d;
    for (const key of DOOR_RING) {
      const [v, h] = key.split(',').map(Number);
      tuer.set(x, WALK_Y + h, CZ + v, 'chiseled_quartz');
    }
  }
  for (const key of DOOR_OPEN) {
    const [v, h] = key.split(',').map(Number);
    const knob = ab(v) === 1 && h === 3;
    tuer.set(CX + HALF - 2, WALK_Y + h, CZ + v, knob ? 'gold_block' : 'cut_copper');
  }

  stairPart('treppe_1', STAIR_SECTIONS[0]);
  deck('zwischendecke_1', DECKS[0]);

  // 3 Nischengeschoss
  fillWall(ctx.part('nischengeschoss', SYM), NISCHEN[0], NISCHEN[1], nischenView);
  stairPart('treppe_2', STAIR_SECTIONS[1]);
  deck('zwischendecke_2', DECKS[1]);

  // 4 Biforien, erstes Geschoss
  fillWall(ctx.part('biforien_1', SYM), BIF1[0], BIF1[1], biforienView(BIF1));
  stairPart('treppe_3', STAIR_SECTIONS[2]);
  deck('zwischendecke_3', DECKS[2]);

  // 5 Biforien, zweites Geschoss
  fillWall(ctx.part('biforien_2', SYM), BIF2[0], BIF2[1], biforienView(BIF2));
  stairPart('treppe_4', STAIR_SECTIONS[3]);
  deck('zwischendecke_4', DECKS[3]);

  // 6 Triforien (Glockengeschoss)
  fillWall(ctx.part('triforien', SYM), TRIF[0], TRIF[1], triforienView);
  stairPart('treppe_5', STAIR_SECTIONS[4]);

  // 7 Glockenstuhl: Balkenkreuz, Hänger und sieben Glocken aus Kupfer
  const gs = ctx.part('glockenstuhl');
  for (const k of beamCells()) {
    if (stair.has(k)) continue;
    const [u, v, y] = k.split(',').map(Number);
    gs.set(CX + u, y, CZ + v, 'dark_oak_planks');
  }
  for (const b of BELLS) {
    const top = b.rim + b.r;
    for (let y = top + 1; y < BEAM_Y; y++) gs.set(CX + b.u, y, CZ + b.w, 'dark_oak_planks');
    for (let dy = 0; dy <= b.r; dy++) {
      for (let dx = -b.r; dx <= b.r; dx++) {
        for (let dz = -b.r; dz <= b.r; dz++) {
          if (inBellShell(dx, dy, dz, b.r)) {
            gs.set(CX + b.u + dx, b.rim + dy, CZ + b.w + dz, 'cut_copper');
          }
        }
      }
    }
    if (b.r > 1) {                              // Klöppel im hohlen Inneren, hängt an der Glockenspitze
      for (let dy = 0; dy < b.r; dy++) gs.set(CX + b.u, b.rim + dy, CZ + b.w, 'polished_deepslate');
    }
  }

  // 8 Kranz mit Konsolenfries
  const kranz = ctx.part('kranz_konsolenfries', SYM);
  kranz.fill(ringBox(FRIEZE[0], FRIEZE[1]), (x, y, z) => friezeCell(x - CX, z - CZ, y));
  stairPart('treppe_6', STAIR_SECTIONS[5]);

  // 9 Terrassenboden (mit Treppenloch, deshalb ohne Flag)
  const terr = ctx.part('terrassenboden');
  terr.fill(box(CX - OUT, TERRACE_Y, CZ - OUT, CX + OUT, TERRACE_Y, CZ + OUT), (x, y, z) => terraceCell(x - CX, z - CZ));

  // 10 Brüstung und Eckfialen
  const brue = ctx.part('bruestung_und_fialen', SYM);
  brue.fill(ringBox(PARAPET[0], PARAPET[1]), (x, y, z) => parapetCell(x - CX, z - CZ, y));
  brue.fill(ringBox(FIAL_Y0, TOP_Y), (x, y, z) => fialeCell(x - CX, z - CZ, y));
}

module.exports = { module: 7, build, BELLS, DECKS, stairPath, stairCells, posCells, inHole, wallCell, STAIR_SECTIONS };
