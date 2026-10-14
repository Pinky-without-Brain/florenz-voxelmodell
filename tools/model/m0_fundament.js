'use strict';
// Modul 0: Fundament, Böden und Krypta-Grube (BAUTEIL_KATALOG, Modul 0).
const D = require('../spec/dimensions.js');
const { inOctagon } = require('../geom/shapes.js');

const L = D.LEVELS;
const C = D.CATHEDRAL;
const FLOOR_Y = L.floorY;

// --- Footprint-Konstanten ---------------------------------------------------
// Ostkomplex: |x|, |z| <= Tambour-Außenmaß; Diagonalgrenze 98 aus BAUTEIL_KATALOG, OSM-abgeleitet.
const EAST_HALF = C.crossing.outerHalfFlat;          // 54
const EAST_DIAG = 98;                                 // aus BAUTEIL_KATALOG, OSM-abgeleitet
// Langhaus: von der Westfassade bis direkt an den Ostkomplex (−54 − 1 = −55).
const NAVE_X0 = C.facade.westFaceX;                   // −216
const NAVE_X1 = -EAST_HALF - 1;                       // −55
const NAVE_HALF_Z = C.nave.exteriorHalfZ;             // 44
// Tribunen: Achse a, Querkoordinate w.
const TRIB_CENTER = C.tribunes.centerDist;            // 59
const TRIB_A = C.tribunes.outerApothem;               // 37
const TRIB_MAX = TRIB_CENTER + TRIB_A;                // 96 (Scheitel)
// Campanile und Baptisterium
const CAMP = D.CAMPANILE;
const BAPT = D.BAPTISTERY;
const BAPT_A = BAPT.outerHalfFlat;                    // 33

// --- Prädikate --------------------------------------------------------------
const inNave = (x, z) => x >= NAVE_X0 && x <= NAVE_X1 && Math.abs(z) <= NAVE_HALF_Z;
const inEastComplex = (x, z) =>
  Math.abs(x) <= EAST_HALF && Math.abs(z) <= EAST_HALF && Math.abs(x) + Math.abs(z) <= EAST_DIAG;
const inTribuneAW = (a, w) =>
  (Math.abs(w) <= TRIB_A && a >= 0 && a <= TRIB_CENTER) ||
  (a >= TRIB_CENTER && inOctagon(w, a - TRIB_CENTER, TRIB_A));
// Tribunen: Nord a = −z, w = x; Ost a = x, w = z; Süd a = z, w = x
const TRIBUNES = {
  nord: { toAW: (x, z) => [-z, x], fromAW: (a, w) => [w, -a] },
  ost:  { toAW: (x, z) => [x, z],  fromAW: (a, w) => [a, w] },
  sued: { toAW: (x, z) => [z, x],  fromAW: (a, w) => [w, a] }
};
const inTribune = (t, x, z) => { const [a, w] = t.toAW(x, z); return inTribuneAW(a, w); };
const inCampanile = (x, z) =>
  Math.abs(x - CAMP.centerX) <= CAMP.half && Math.abs(z - CAMP.centerZ) <= CAMP.half;
const inBaptOct = (x, z) => inOctagon(x - BAPT.centerX, z - BAPT.centerZ, BAPT_A);
const inScarsella = (x, z) =>
  x >= BAPT.scarsella.westX && x <= BAPT.centerX - BAPT_A && Math.abs(z) <= BAPT.scarsella.halfZ;

function footprint(x, z) {
  return inNave(x, z) || inEastComplex(x, z) ||
    inTribune(TRIBUNES.nord, x, z) || inTribune(TRIBUNES.ost, x, z) || inTribune(TRIBUNES.sued, x, z) ||
    inCampanile(x, z) || inBaptOct(x, z) || inScarsella(x, z);
}

// --- Zellgeneratoren --------------------------------------------------------
function* area(x0, x1, z0, z1, pred, y = FLOOR_Y) {
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) if (pred(x, z)) yield { x, y, z };
}

// Achteck-Norm als ganze Zahl: kleinstes a mit inOctagon(dx, dz, a)
function octNorm(dx, dz) {
  let a = Math.max(Math.abs(dx), Math.abs(dz));
  while (!inOctagon(dx, dz, a)) a++;
  return a;
}

// --- Bodenmuster ------------------------------------------------------------
const BAND_W = 3;
const BAND_TYPES = ['smooth_quartz', 'dark_prismarine', 'polished_granite'];
const ROSETTE_R = 9;
function vierungPattern(x, y, z) {
  const ax = Math.abs(x), az = Math.abs(z);
  const n = octNorm(x, z);
  if (n === 0) return 'gold_block'; // Nullpunkt in der Kuppelmitte
  if (n <= ROSETTE_R) {
    if (n === ROSETTE_R) return 'polished_granite';
    return (ax === 0 || az === 0 || ax === az) ? 'dark_prismarine' : 'smooth_quartz';
  }
  return BAND_TYPES[Math.floor((n - ROSETTE_R - 1) / BAND_W) % BAND_TYPES.length];
}

const TRIB_SECTORS = 16;
function tribunePattern(t) {
  return (x, y, z) => {
    const [a, w] = t.toAW(x, z);
    const da = a - TRIB_CENTER;
    const n = octNorm(w, da);
    if (n <= 2) return 'polished_granite';
    if (n >= TRIB_A - 1) return 'polished_granite'; // Randband
    const th = Math.atan2(w, da) + Math.PI; // 0..2π
    const s = Math.floor(th / (2 * Math.PI / TRIB_SECTORS) + 1e-9);
    return s % 2 === 0 ? 'smooth_quartz' : 'dark_prismarine';
  };
}

function campanilePattern() {
  const x0 = CAMP.centerX - CAMP.half, z0 = CAMP.centerZ - CAMP.half;
  return (x, y, z) =>
    (Math.floor((x - x0) / 3) + Math.floor((z - z0) / 3)) % 2 === 0 ? 'smooth_quartz' : 'dark_prismarine';
}

const BAPT_SECTORS = 12;
function baptisteriumPattern(x, y, z) {
  if (!inBaptOct(x, z)) return 'polished_granite'; // Scarsella
  const dx = x - BAPT.centerX, dz = z - BAPT.centerZ;
  const n = octNorm(dx, dz);
  if (n <= 2) return 'gold_block';
  if (n >= BAPT_A - 1) return 'polished_granite';           // Randband
  if (n >= 14 && n <= 16) return 'polished_granite';        // Kreisband
  const th = Math.atan2(dz, dx) + Math.PI;
  const s = Math.floor(th / (2 * Math.PI / BAPT_SECTORS) + 1e-9);
  return s % 2 === 0 ? 'smooth_quartz' : 'dark_prismarine';
}

// Licht (B5, BEGEHBARKEIT §1.5): Seelaternen im Fußboden auf einem 10er-Raster (Abstand zur nächsten Lichtquelle
// höchstens 5·√2 ≈ 7 Blöcke); das Raster liegt auf ganzen Zehnern und ist damit symmetrisch zur Kuppelmitte
const LICHT_RASTER = 10;
const mitLicht = (fn) => (x, y, z) => (x % LICHT_RASTER === 0 && z % LICHT_RASTER === 0 ? 'sea_lantern' : fn(x, y, z));

// --- Bau --------------------------------------------------------------------
function build(ctx) {
  const { CRYPT } = ctx.interfaces;
  const [cx0, cx1] = CRYPT.x, [cz0, cz1] = CRYPT.z;
  const RING = 2; // Ringmauer, 2 Blöcke dick

  // 1 Krypta-Grube: Boden auf Y 56 (unter Box und Ringmauer), Ringmauer Y 57..63 außerhalb der Box
  const grube = ctx.part('krypta_grube');
  const inBox = (x, z) => x >= cx0 && x <= cx1 && z >= cz0 && z <= cz1;
  const ox0 = cx0 - RING, ox1 = cx1 + RING, oz0 = cz0 - RING, oz1 = cz1 + RING;
  grube.fill(area(ox0, ox1, oz0, oz1, () => true, L.foundationBottomY), 'cobblestone');
  const isCorner = (x, z) => (x < cx0 && z < cz0) || (x > cx1 && z < cz0) ||
    (x < cx0 && z > cz1) || (x > cx1 && z > cz1);
  for (let y = L.foundationBottomY + 1; y <= FLOOR_Y - 1; y++) {
    grube.fill(area(ox0, ox1, oz0, oz1, (x, z) => !inBox(x, z), y),
      (x, yy, z) => (isCorner(x, z) ? 'stone_bricks' : 'cobblestone'));
  }

  // 2 Langhaus: Kosmatenboden innen, Wandzonen Mauerwerk
  const langhaus = ctx.part('boden_langhaus');
  const cosm = ctx.patterns.cosmati({ center: [C.nave.interiorWestX, -C.nave.interiorHalfZ], cell: 8 });
  const inNaveInterior = (x, z) => x >= C.nave.interiorWestX && Math.abs(z) <= C.nave.interiorHalfZ;
  // Abgang zur Krypta (B5): Treppenloch und oberste Stufe in der Bodenplatte (Treppe sonst in Modul 9)
  const { stufen: kStufen, loch: kLoch } = require('./m9_innenraum.js').abgang();
  const kTop = kStufen.filter((c) => c.y === FLOOR_Y);
  const kFrei = new Set([...kLoch, ...kTop].map((c) => c.x + ',' + c.z));
  langhaus.fill(area(NAVE_X0, NAVE_X1, -NAVE_HALF_Z, NAVE_HALF_Z, (x, z) => inNave(x, z) && !kFrei.has(x + ',' + z)),
    (x, y, z) => (inNaveInterior(x, z) ? mitLicht(cosm)(x, y, z) : 'stone_bricks'));
  const kTreppe = ctx.part('krypta_abgang');
  for (const c of kTop) kTreppe.set(c.x, c.y, c.z, c.typ);

  // 3 Vierung: ganzer Ostkomplex, Achteckbänder
  const vierung = ctx.part('boden_vierung', { symmetry: { order: 8, cx: 0, cz: 0 } });
  vierung.fill(area(-EAST_HALF, EAST_HALF, -EAST_HALF, EAST_HALF, inEastComplex), mitLicht(vierungPattern));

  // 4–6 Tribunen ohne den Teil im Ostkomplex
  for (const key of ['nord', 'ost', 'sued']) {
    const t = TRIBUNES[key];
    const w = ctx.part('boden_tribune_' + key);
    w.fill(area(-TRIB_MAX, TRIB_MAX, -TRIB_MAX, TRIB_MAX,
      (x, z) => inTribune(t, x, z) && !inEastComplex(x, z)), mitLicht(tribunePattern(t)));
  }

  // 7 Campanile
  const camp = ctx.part('boden_campanile');
  camp.fill(area(CAMP.centerX - CAMP.half, CAMP.centerX + CAMP.half,
    CAMP.centerZ - CAMP.half, CAMP.centerZ + CAMP.half, inCampanile), mitLicht(campanilePattern()));

  // 8 Baptisterium: Achteck, dann Scarsella (Überlappungsspalte per fillUnion)
  const bapt = ctx.part('boden_baptisterium');
  bapt.fill(area(BAPT.centerX - BAPT_A, BAPT.centerX + BAPT_A, -BAPT_A, BAPT_A, inBaptOct), mitLicht(baptisteriumPattern));
  bapt.fillUnion(area(BAPT.scarsella.westX, BAPT.centerX, -BAPT.scarsella.halfZ, BAPT.scarsella.halfZ,
    inScarsella), baptisteriumPattern);

  // 9 Außenstufen (B5): je eine Stufe aus Marmor-Treppenblöcken vor den Eingängen, vom Platz (Y 63) auf den
  // Fußboden (Oberkante Y 64): Sagrato vor der Westfassade, Seitenportale, Baptisterium Nord/Süd, Campanile Ost
  const stufen = ctx.part('aussenstufen');
  const st = (dir) => ctx.palette.treppe('marmor_weiss', dir);
  const { BAY_CENTER, PORTAL_BAY } = require('./m1_langhaus.js');
  for (let z = -NAVE_HALF_Z; z <= NAVE_HALF_Z; z++) stufen.set(NAVE_X0 - 1, FLOOR_Y, z, st('o'));
  for (const [s, k] of [[-1, PORTAL_BAY.nord], [1, PORTAL_BAY.sued]]) {
    const c = BAY_CENTER[k];
    for (let x = c - 6; x <= c + 6; x++) stufen.set(x, FLOOR_Y, s * (NAVE_HALF_Z + 1), st(s < 0 ? 's' : 'n'));
  }
  for (const s of [-1, 1]) {
    for (let dx = -7; dx <= 7; dx++) stufen.set(BAPT.centerX + dx, FLOOR_Y, BAPT.centerZ + s * (BAPT_A + 1), st(s < 0 ? 's' : 'n'));
  }
  for (let dz = -4; dz <= 4; dz++) stufen.set(CAMP.centerX + CAMP.half + 1, FLOOR_Y, CAMP.centerZ + dz, st('w'));
}

module.exports = { module: 0, build, footprint };
