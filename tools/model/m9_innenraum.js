'use strict';
// Modul 9: Innenausstattung und Krypta (BAUTEIL_KATALOG, Modul 9).
// Krypta Santa Reparata im RESERVED-Volumen (interfaces.CRYPT), Chorschranke und Hochaltar auf dem Boden Y 64.
const D = require('../spec/dimensions.js');
const { CRYPT } = require('../spec/interfaces.js');
const { inOctagon, inDisk } = require('../geom/shapes.js');

const L = D.LEVELS;
const FLOOR_Y = L.cryptFloorY;                 // 57, Kryptaboden
const CEIL_Y = L.floorY - 1;                   // 63, letzte Lage unter dem Boden (M0, Y 64)
const WALK = L.walkY;                          // 65

// --- Grundriss der kleinen Basilika (lokale Ableitungen aus CRYPT) ------------
const X0 = CRYPT.x[0] + 2;                     // −202: Westwand (2 Zellen Abstand zur Grubenmauer)
const WALL = 2;                                // Mauerstärke
const NAVE_HALF = 8;                           // Mittelschiff |z| ≤ 8 (Katalog)
const NAVE_WALL_OUT = NAVE_HALF + WALL;        // 10: Mittelschiffwand |z| 9..10
const AISLE_WALL_IN = NAVE_WALL_OUT + 1 + 7;   // 18: Seitenschiffe 7 breit (|z| 11..17), Außenwand |z| 18..19
const AISLE_WALL_OUT = AISLE_WALL_IN + WALL - 1; // 19
const APSE_CX = -140 - NAVE_WALL_OUT;          // −150: Mittelpunkt der Apsis, damit sie bei x −140 endet
const NARTHEX_X = X0 + 8, NARTHEX_DOOR = 2;     // Querwand der Vorhalle bei x −194, Tür |z| ≤ 2
const PRESB_X = APSE_CX - 3;                   // Chorboden ab x −153 (Abstand zu den Stützen)
const WALL_TOP_Y = 61;                         // Mauern Y 57..61 (Katalog)
const ARCADE_PERIOD = 10, ARCADE_GAP = 4;      // Durchgänge in der Mittelschiffwand: 4 breit alle 10

// Mauerzüge: Spalten (x, z), in denen die Mauern stehen
function inApse(x, z) {
  const dx = x - APSE_CX;
  return dx >= 0 && inDisk(dx, z, NAVE_WALL_OUT) && !inDisk(dx, z, NAVE_HALF);
}
function isWallColumn(x, z) {
  const az = Math.abs(z);
  const inLen = x >= X0 && x <= APSE_CX - 1;
  if (inLen && x <= X0 + WALL - 1 && az <= AISLE_WALL_OUT) return true;                 // Westwand
  if (inLen && az >= AISLE_WALL_IN && az <= AISLE_WALL_OUT) return true;                // Außenwände
  if (x >= APSE_CX - WALL && x <= APSE_CX - 1 && az > NAVE_WALL_OUT && az <= AISLE_WALL_OUT) return true; // Ostabschluss der Seitenschiffe
  if (inLen && az > NAVE_HALF && az <= NAVE_WALL_OUT) {                                 // Mittelschiffwand mit Durchgängen
    const k = (x - X0 - 4) % ARCADE_PERIOD;
    return !(x >= X0 + 4 && k >= 0 && k < ARCADE_GAP && x < APSE_CX - 4);
  }
  if (x >= NARTHEX_X && x < NARTHEX_X + WALL && az <= AISLE_WALL_IN - 1 && az > NARTHEX_DOOR) return true; // Querwand der Vorhalle
  return inApse(x, z);
}
// Presbyterium: erhöhter Chorboden (2 Lagen) im Osten des Mittelschiffs und in der Apsis
function inPresbytery(x, z) {
  if (x < PRESB_X) return false;
  return x < APSE_CX ? Math.abs(z) <= NAVE_HALF : inDisk(x - APSE_CX, z, NAVE_HALF);
}
// Gesamte Grundfläche innerhalb der äußeren Mauerlinie (Mauern eingeschlossen)
function inOutline(x, z) {
  const az = Math.abs(z);
  if (x >= X0 && x <= APSE_CX - 1 && az <= AISLE_WALL_OUT) return true;
  return x >= APSE_CX && inDisk(x - APSE_CX, z, NAVE_WALL_OUT);
}

// Pfeiler 2 × 2: 3 in Längsrichtung, 2 Reihen beidseits der Mitte (Katalog 3 × 2)
const PILLAR_X = [-188, -172, -156];
const PILLAR_Z = [-6, 4];
const inPillar = (x, z) => PILLAR_X.some((px) => x >= px && x <= px + 1) && PILLAR_Z.some((pz) => z >= pz && z <= pz + 1);

// Grabplatte 3 × 5 (Z × X), Inschrift in der Mittelzeile
const GRAVE_X = [-180, -176], GRAVE_Z = [-1, 1];
const inGrave = (x, z) => x >= GRAVE_X[0] && x <= GRAVE_X[1] && z >= GRAVE_Z[0] && z <= GRAVE_Z[1];

// Mosaik: Kosmatenmuster (Zelle 6) auf Terrakotta-Farben abgebildet
function mosaic(patterns) {
  const cos = patterns.cosmati({ center: [X0, -AISLE_WALL_OUT], cell: 6 });
  const map = {
    calcite: 'red_terracotta', dark_prismarine: 'red_terracotta',
    polished_granite: 'white_terracotta', smooth_quartz: 'white_terracotta'
  };
  return (x, y, z) => map[cos(x, y, z)];
}

// --- Chorschranke -------------------------------------------------------------
const SCREEN_OUT = 17, SCREEN_IN = 16;         // Ring a 16..17 (Katalog)
const SCREEN_Y0 = WALK, SCREEN_Y1 = WALK + 6;  // Y 65..71
const DOOR_HALF = 2;                           // Eingang West, Halbweite 2
const BAND_Y = [WALK + 1, WALK + 5];           // Reliefbänder Y 66 und 70
const PANEL_STEP = 6;                          // Felder auf der Außenfläche
const octNorm = (dx, dz) => {                  // kleinstes a mit inOctagon(dx, dz, a)
  let a = Math.max(Math.abs(dx), Math.abs(dz));
  while (!inOctagon(dx, dz, a)) a++;
  return a;
};

function screenMaterial(x, y, z) {
  if (BAND_Y.includes(y)) return 'polished_granite';
  if (y === SCREEN_Y1) return 'smooth_quartz';
  const n = octNorm(x, z);
  if (n === SCREEN_OUT) {                      // Außenschicht: Rahmenfelder, Füllung bleibt Marmor
    const ax = Math.abs(x), az = Math.abs(z);
    const flat = Math.max(ax, az) >= (ax + az) * Math.SQRT1_2;       // Flachseite oder Diagonale
    const t = flat ? Math.min(ax, az) : Math.round(Math.abs(ax - az) * Math.SQRT1_2);
    return (y === WALK + 2 || y === WALK + 4) && t % PANEL_STEP === 0 ? 'polished_granite' : 'smooth_quartz';
  }
  return 'smooth_quartz';
}

// --- Hochaltar und Kruzifix --------------------------------------------------
const ALTAR_HALF_X = 2, ALTAR_HALF_Z = 1;      // 5 × 3
const ALTAR_Y0 = WALK, ALTAR_Y1 = WALK + 1;    // Y 65..66
const CROSS_Y0 = ALTAR_Y1 + 1, CROSS_Y1 = CROSS_Y0 + 7; // Y 67..74
const ARMS_Y = CROSS_Y1 - 2;                   // Querbalken auf Y 72

// --- Abgang zur Krypta (B5) ---------------------------------------------------
// Gerade Treppe im südlichen Seitenschiff der Krypta, Aufstieg nach Westen: unterste Stufe bei x −180 auf dem
// Kryptaboden (Stehhöhe Y 58), 7 Stufen bis zum Langhausboden (Oberkante Y 64). Die oberste Stufe liegt in der
// Bodenplatte (Hoheitsgebiet Modul 0) und wird dort gesetzt; darüber hat Modul 0 ein Treppenloch.
const ABGANG = { start: { x: -180, y: FLOOR_Y + 1, z: 13 }, richtung: 'w', stufen: L.floorY - FLOOR_Y, breite: 2 };
function abgang(palette) {
  const T = require('../wahrzeichen/treppe.js');
  const b = T.geradeTreppe({ ...ABGANG, rolle: 'pietra_serena' });
  const loch = T.treppenloch(b.lauf, 4).filter((c) => c.y === L.floorY); // 4: Kopffreiheit auch beim Hinabgehen
  return { stufen: b, loch };
}

function* area(x0, x1, z0, z1, pred, y) {
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) if (pred(x, z)) yield { x, y, z };
}

function build(ctx) {
  const { patterns } = ctx;
  const bx0 = CRYPT.x[0], bx1 = CRYPT.x[1], bz0 = CRYPT.z[0], bz1 = CRYPT.z[1];

  // 2 Boden zuerst: die Mauern stehen danach auf der Grube und neben dem Boden (R3)
  const boden = ctx.part('krypta_boden');
  const mos = mosaic(patterns);
  boden.fill(area(bx0, bx1, bz0, bz1,
    (x, z) => inOutline(x, z) && !isWallColumn(x, z) && !inPillar(x, z) && !inGrave(x, z), FLOOR_Y), mos);

  // 1 Mauern: Y 57..61, flächig auf dem Grubenboden
  const mauern = ctx.part('krypta_mauern');
  for (let y = FLOOR_Y; y <= WALL_TOP_Y; y++) {
    mauern.fill(area(bx0, bx1, bz0, bz1, isWallColumn, y),
      (x, yy, z) => ((x * 7 + z * 3 + yy * 5) % 4 === 0 ? 'cobblestone' : 'mossy_stone_bricks'));
  }

  // Presbyterium: zwei Lagen über dem Mosaik, im Ostteil des Mittelschiffs
  for (let y = FLOOR_Y + 1; y <= FLOOR_Y + 2; y++) {
    mauern.fill(area(bx0, bx1, bz0, bz1, inPresbytery, y), 'cobblestone');
  }

  // 3 Stützen: 2 × 2, von Y 57 bis 63 (berühren den Boden Y 64 von unten)
  const stuetzen = ctx.part('krypta_stuetzen');
  for (let y = FLOOR_Y; y <= CEIL_Y; y++) {
    stuetzen.fill(area(bx0, bx1, bz0, bz1, inPillar, y), y === CEIL_Y ? 'polished_andesite' : 'stone_bricks');
  }

  // 4 Grab: Platte 3 × 5 bei Y 57, Inschrift (Goldzeile) in der Mitte
  const grab = ctx.part('brunelleschi_grab');
  grab.fill(area(bx0, bx1, bz0, bz1, inGrave, FLOOR_Y),
    (x, y, z) => (z === 0 && x > GRAVE_X[0] && x < GRAVE_X[1] ? 'gold_block' : 'polished_deepslate'));

  // 5 Chorschranke unter der Kuppel (Eingang im Westen)
  const schranke = ctx.part('chorschranke');
  for (let y = SCREEN_Y0; y <= SCREEN_Y1; y++) {
    schranke.fill(area(-SCREEN_OUT, SCREEN_OUT, -SCREEN_OUT, SCREEN_OUT,
      (x, z) => inOctagon(x, z, SCREEN_OUT) && !inOctagon(x, z, SCREEN_IN - 1) &&
        !(x < 0 && Math.abs(z) <= DOOR_HALF), y), screenMaterial);
  }

  // Treppe zur Krypta: Stufen unter der Bodenplatte samt Auflagern (die oberste Stufe setzt Modul 0)
  const tr = ctx.part('krypta_treppe');
  const { stufen } = abgang(ctx.palette);
  const voll = 'smooth_stone';
  for (const c of stufen) {
    if (c.y >= L.floorY) continue;
    tr.set(c.x, c.y, c.z, c.typ);
    for (let y = FLOOR_Y + 1; y < c.y; y++) tr.set(c.x, y, c.z, voll);
  }

  // Stufe zum erhöhten Chorboden (Presbyterium, 2 Lagen) und Grabungsgrube außerhalb der Mauern
  for (let z = -NAVE_HALF; z <= NAVE_HALF; z++) tr.set(PRESB_X - 1, FLOOR_Y + 1, z, ctx.palette.treppe('antik', 'o'));
  const grube = [];
  for (let x = bx0; x <= bx1; x++) for (let z = bz0; z <= bz1; z++) {
    if (inOutline(x, z)) continue;
    for (let y = FLOOR_Y; y <= CEIL_Y; y++) if (!ctx.grid.has(x, y, z)) grube.push({ x, y, z });
  }
  ctx.unzugaenglich(grube, 'Grabungsgrube außerhalb der Mauern von Santa Reparata: Erdreich der Ausgrabung, nicht begehbar');

  // B5: Mauerkrone der Chorschranke (Stehfläche auf der Schranke unter der Kuppel) bewusst unzugänglich
  const krone = [];
  for (let x = -SCREEN_OUT; x <= SCREEN_OUT; x++) for (let z = -SCREEN_OUT; z <= SCREEN_OUT; z++) {
    if (!inOctagon(x, z, SCREEN_OUT) || inOctagon(x, z, SCREEN_IN - 1)) continue;
    for (let y = SCREEN_Y1 + 1; y <= SCREEN_Y1 + 3; y++) krone.push({ x, y, z });
  }
  ctx.unzugaenglich(krone, 'Mauerkrone der Chorschranke: Brüstung, kein Standplatz');

  // 6 Hochaltar mit Kruzifix
  const altar = ctx.part('hochaltar', { symmetry: { order: 4, cx: 0, cz: 0 } });
  for (let y = ALTAR_Y0; y <= ALTAR_Y1; y++) {
    altar.fill(area(-ALTAR_HALF_X, ALTAR_HALF_X, -ALTAR_HALF_Z, ALTAR_HALF_Z, () => true, y),
      y === ALTAR_Y1 ? 'chiseled_quartz' : 'smooth_quartz');
  }
  for (let y = CROSS_Y0; y <= CROSS_Y1; y++) {
    altar.set(0, y, 0, y >= CROSS_Y0 + 2 && y <= ARMS_Y ? 'gold_block' : 'dark_oak_planks');
  }
  for (const z of [-2, -1, 1, 2]) altar.set(0, ARMS_Y, z, 'dark_oak_planks');
}

module.exports = { module: 9, build, ABGANG, abgang, _internal: { isWallColumn, inOutline, inPillar, inGrave } };
