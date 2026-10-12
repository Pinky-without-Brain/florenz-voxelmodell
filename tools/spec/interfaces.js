'use strict';
/**
 * Schnittstellenverträge zwischen Modulen (V2).
 *
 * Konvention für Höhen: "<name>TopY" in dimensions.js ist die OBERSTE belegte Lage des unteren
 * Moduls. Das obere Modul beginnt eine Lage darüber (TopY + 1).
 *
 * SUPPORTS  – Auflager-Prüfung (R5): Jeder Block von `upper` auf Lage `y` muss direkt auf einem
 *             Block von `lower` (Lage y − 1) stehen. `coverage` (0..1) verlangt zusätzlich, dass
 *             mindestens dieser Anteil der Oberseite von `lower` auf Lage y − 1 innerhalb von
 *             `region` bedeckt ist (Kontrolle "bündig, keine offene Kante").
 * OWNERSHIP – Hoheitsgebiete: Ein Block, der `test` erfüllt, darf nur zu `module` gehören.
 * RESERVED  – Volumina, die alle Module außer `forModule` frei lassen müssen.
 */
const D = require('./dimensions.js');
const C = D.CATHEDRAL;
const { inOctagon } = require('../geom/shapes.js');

const crossingOuter = (x, z) => inOctagon(x, z, C.crossing.outerHalfFlat);

// Exedra-Sockel (M3) und tribune morte (M4): Halbkreis r 11 nach außen um den Mittelpunkt der
// Diagonalfläche des Tambours (rho = outerHalfFlat auf der Diagonalen → x = z = a/√2).
const EXEDRA_R = 11;
const EXEDRA_CENTERS = [[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz]) => {
  const c = Math.round(C.crossing.outerHalfFlat / Math.SQRT2); // 38
  return { cx: sx * c, cz: sz * c, sx, sz };
});
const inExedra = (x, z) => EXEDRA_CENTERS.some(({ cx, cz, sx, sz }) => {
  const dx = x - cx, dz = z - cz;
  return dx * dx + dz * dz <= EXEDRA_R * EXEDRA_R + EXEDRA_R && dx * sx + dz * sz >= 0;
});

const groundSupport = (upper) => ({
  name: `Modul ${upper} auf Boden`, lower: 0, upper, y: D.LEVELS.walkY,
  region: () => true, coverage: 0.0
});

const SUPPORTS = [
  ...[1, 2, 3, 7, 8, 9].map(groundSupport),
  { name: 'Krypta auf Grube',       lower: 0, upper: 9, y: D.LEVELS.cryptFloorY,
    region: () => true, coverage: 0.0 },
  { name: 'Exedren auf Sockel',     lower: 3, upper: 4, y: C.crossing.archTopY + 1,
    region: (x, y, z) => inExedra(x, z), coverage: 1.0 },
  { name: 'Tambour auf Vierung',    lower: 3, upper: 4, y: C.crossing.archTopY + 1,
    region: (x, y, z) => crossingOuter(x, z), coverage: 1.0 },
  { name: 'Kuppel auf Tambour',     lower: 4, upper: 5, y: C.dome.springY + 1,
    region: (x, y, z) => crossingOuter(x, z), coverage: 0.0 },
  { name: 'Laterne auf Schlussring', lower: 5, upper: 6, y: C.dome.eyeRingTopY + 1,
    region: (x, y, z) => inOctagon(x, z, C.lantern.halfFlat + 4), coverage: 0.0 }
];

// Krypta Santa Reparata unter den westlichen Jochen (ANNAHME: Lage nach Grabungsplan, vereinfacht)
const CRYPT = {
  x: [C.nave.interiorWestX + 8, C.nave.interiorWestX + 2 * C.nave.bayPitch],   // −204..−136
  z: [-(C.nave.centralHalfZ + 8), C.nave.centralHalfZ + 8],                       // −27..27
  y: [D.LEVELS.cryptFloorY, D.LEVELS.floorY - 1]                                  // 57..63
};

const OWNERSHIP = [
  { name: 'Westfassade', module: 2,
    test: (x, y, z) => y >= D.LEVELS.walkY && x >= C.facade.westFaceX && x < C.facade.westFaceX + C.facade.thickness
      && Math.abs(z) <= C.nave.exteriorHalfZ },
  { name: 'Langhaus', module: 1,
    test: (x, y, z) => y >= D.LEVELS.walkY && y <= C.nave.roofRidgeY
      && x >= C.facade.westFaceX + C.facade.thickness && x < -C.crossing.outerHalfFlat // bis −55, stößt an die Vierung
      && Math.abs(z) <= C.nave.exteriorHalfZ },
  { name: 'Tambour', module: 4,
    test: (x, y, z) => y > C.crossing.archTopY && y <= C.dome.springY && crossingOuter(x, z) },
  { name: 'Kuppel', module: 5,
    test: (x, y, z) => y > C.dome.springY && y <= C.dome.eyeRingTopY && crossingOuter(x, z) },
  { name: 'Laterne', module: 6,
    test: (x, y, z) => y > C.dome.eyeRingTopY && crossingOuter(x, z) },
  { name: 'Fundament', module: 0,
    test: (x, y, z) => y >= D.LEVELS.foundationBottomY && y <= D.LEVELS.floorY
      && !(x >= CRYPT.x[0] && x <= CRYPT.x[1] && z >= CRYPT.z[0] && z <= CRYPT.z[1] && y >= CRYPT.y[0]) }
];

const RESERVED = [
  { name: 'Krypta Santa Reparata', forModule: 9,
    test: (x, y, z) => x >= CRYPT.x[0] && x <= CRYPT.x[1] && z >= CRYPT.z[0] && z <= CRYPT.z[1]
      && y >= CRYPT.y[0] && y <= CRYPT.y[1] }
];

module.exports = { SUPPORTS, OWNERSHIP, RESERVED, CRYPT, EXEDRA_R, EXEDRA_CENTERS, inExedra };
