'use strict';
// Modul 1: Langhaus und Seitenschiffe (BAUTEIL_KATALOG, Modul 1).
const D = require('../spec/dimensions.js');
const { archHeight, archOpening, archRing, elevation, placeElevation } = require('../geom/arches.js');
const { inOctagon, inDisk } = require('../geom/shapes.js');
const { gableRoof, shedRoof } = require('../geom/roofs.js');
const { luftRaum } = require('./_luft.js');

const L = D.LEVELS;
const C = D.CATHEDRAL;
const N = C.nave;

// --- Längsachse (X) ---------------------------------------------------------
const XW = N.interiorWestX;                              // −212, erste Zelle des Langhauses
const EAST_FACE = -C.crossing.outerHalfFlat;             // −54, Westwand der Vierung (M3)
const XE = EAST_FACE - 1;                                // −55, letzte Zelle des Langhauses (Ostabschluss)
const WEST_FACE = C.facade.westFaceX + C.facade.thickness - 1; // −213, Innenseite der Fassadenmauer (M2)
const px = (k) => XW + k * N.bayPitch;                   // Pfeilerachsen k = 0..4
// Jochmitten: zwischen den Pfeilerachsen, das letzte Joch endet an der Vierungswand (Ostabschluss)
const BAY_CENTER = Array.from({ length: N.bays }, (_, k) =>
  (px(k) + (k === N.bays - 1 ? EAST_FACE : px(k + 1))) / 2); // −193 −155 −117 −76
const PORTAL_BAY = { nord: 3, sued: 2 };                 // Joch 4 (Mandorla), Joch 3 (Canonici)

// --- Querachse (Z) ----------------------------------------------------------
const Z_PIER = N.centralHalfZ;                           // 19, Pfeilerachse
const Z_IN = N.interiorHalfZ;                            // 38, Innenseite der Außenwand
const Z_WALL_T = 4;                                      // Dicke der Außenwand (Katalog: |z| 39..42)
const Z_EXT = N.exteriorHalfZ;                           // 44, Außenflucht inkl. Lisenen
const ARC_Z0 = Z_PIER - 2, ARC_Z1 = Z_PIER + 2;          // Arkadenwand |z| 17..21 (5 dick)
const CLE_Z0 = Z_PIER - 1, CLE_Z1 = Z_PIER + 1;          // Hochschiffwand |z| 18..20 (3 dick)
const CLE_MID = Z_PIER;                                  // Mittelebene der Hochschiffwand (|z| = 19)
const AISLE_Z0 = ARC_Z1 + 1;                            // 22, Seitenschiffgewölbe von 22 bis 38
const NAVE_HALF = CLE_Z0 - 1;                            // 17, lichte Halbbreite des Mittelschiffgewölbes (Innenflucht Hochschiffwand − 1)

// --- Höhen (Y) --------------------------------------------------------------
const Y0 = L.walkY;                                      // 65
const PIER_R = 4;                                        // Pfeilerfuß/-kapitell: inOctagon(4)
const FOOT_TOP = Y0 + 1;                                 // Fuß 65..66
const CAP_TOP = 98;                                      // Kapitell 97..98 (Katalog), Schaft 67..96
const AISLE_SPRING_Y = CAP_TOP + 1;                      // 99, Kämpfer Arkaden/Seitenschiffgewölbe
const NAVE_SPRING_Y = 124;                               // Kämpfer Mittelschiffgewölbe = erste Lage der Hochschiffwand (Katalog)
const ARC_WALL_TOP = NAVE_SPRING_Y - 1;                  // 123, Oberkante Arkadenwand
const CORNICE_AISLE_Y = N.aisleEavesY + 1;               // 115
const CORNICE_NAVE_Y = N.clerestoryTopY + 1;             // 149
const ROOF_AISLE_HIGH = ARC_WALL_TOP;                    // 123, Pultdach oben
const ROOF_AISLE_LOW = CORNICE_AISLE_Y + 1;              // 116, Pultdach unten (auf dem Gesims)
const VAULT_T = 2;                                       // Gewölbedicke (Regel A5)
const FRAC = 0.25;                                       // Zuschlag gegen Rundungsfehler an Zellmitten
// Aisle-Scheitel: Oberkante der Schale = aisleVaultY (Y 110)
const AISLE_RISE = N.aisleVaultY - (VAULT_T - 1) - AISLE_SPRING_Y + FRAC;      // 10,25
// Mittelschiff: Oberkante der Schale = naveVaultY − 1 (Y 149), damit das Dach (Traufe Y 150) frei bleibt
const NAVE_TOP_Y = N.naveVaultY - 1;
const NAVE_RISE = NAVE_TOP_Y - (VAULT_T - 1) - NAVE_SPRING_Y + FRAC;           // 24,25

// Fenster und Portale (Katalog Bauteil 1/2)
const WINDOW = { w: 3, f: 0.8, sillY: 80, springY: 98 };
const PORTAL = { w: 4, f: 0.8, springY: 82, topY: 100 };
const Z_GLASS = Z_IN + 2;                                // 40, Mittelebene der Außenwand
const Z_DOOR = Z_IN + 3;                                 // 41, Bronzetür
const OCULUS = { y: 134, r: 5 };                         // Obergaden-Rundfenster (Katalog Bauteil 7)

// --- Hilfsfunktionen --------------------------------------------------------
// Höhenprofil eines Bogens über Halbweite W (kontinuierlich). Spitzbogen nach A5, wenn rise ≥ W;
// ein flacherer Bogen ist als Spitzbogen nicht darstellbar (f < 0,5), dann Ellipse (Korbbogen).
function profile(W, rise) {
  if (rise >= W) {
    const f = ((rise / W) ** 2 + 1) / 4;
    return (u) => archHeight(u, W, f);
  }
  return (u) => rise * Math.sqrt(Math.max(0, 1 - (u / W) ** 2));
}

// Echtes Kreuzgewölbe: Höhe = max(hx, hz) (Vereinigung zweier Tonnen). Die Randbögen folgen
// dadurch den Gurt- und Schildbögen. Schalen wie in vaults.groinVault (dicht, flächig verbunden).
// below: Zellen, um die die Schale unter den Rand ragt (für Gurtbögen), nie unter springY.
function* crossVault({ x0, x1, z0, z1, springY, hx, hz, thickness = VAULT_T, below = 0 }) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const lo = (x, z) => springY + Math.floor(Math.max(hx(x - cx), hz(z - cz)));
  const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      const l = lo(x, z);
      let hi = l + thickness - 1;
      for (const [dx, dz] of NB) {
        const nx = x + dx, nz = z + dz;
        if (nx < x0 || nx > x1 || nz < z0 || nz > z1) continue;
        hi = Math.max(hi, lo(nx, nz));
      }
      for (let y = Math.max(springY, l - below); y <= hi; y++) yield { x, y, z };
    }
  }
}

const sides = [-1, 1];

// Pfeilerzellen um (cx, cz); room(x,z) beschneidet Halbpfeiler. part: 'foot' | 'shaft' | 'cap'
function* pierCells(p, part) {
  for (let dx = -PIER_R; dx <= PIER_R; dx++) {
    for (let dz = -PIER_R; dz <= PIER_R; dz++) {
      const x = p.cx + dx, z = p.cz + dz;
      if (!p.room(x, z)) continue;
      const wide = inOctagon(dx, dz, PIER_R);
      const core = inOctagon(dx, dz, 3) || (Math.abs(dx) === 4 && dz === 0) || (dx === 0 && Math.abs(dz) === 4);
      if (part === 'foot' && wide) for (let y = Y0; y <= FOOT_TOP; y++) yield { x, y, z };
      if (part === 'shaft' && core) for (let y = FOOT_TOP + 1; y <= CAP_TOP - 2; y++) yield { x, y, z };
      if (part === 'cap' && wide) for (let y = CAP_TOP - 1; y <= CAP_TOP; y++) yield { x, y, z };
    }
  }
}

// Lichte Arkadenöffnungen je Joch: Bereich [a, b] zwischen den Pfeilern (Mitte auf einer Zelle)
function arcadeBays() {
  const bays = [];
  for (let k = 0; k < N.bays; k++) {
    const east = k === 0 ? WEST_FACE : px(k);
    const west = k === N.bays - 1 ? EAST_FACE : px(k + 1);
    let a = east + PIER_R + 1;
    const b = west - PIER_R - 1;
    if ((b - a + 1) % 2 === 0) a++; // gerade Zellzahl: eine Zelle bleibt Laibung
    bays.push({ a, b, c: (a + b) / 2, W: (b - a + 1) / 2 });
  }
  return bays;
}

// --- Bau ---------------------------------------------------------------------
function build(ctx) {
  const incr = ctx.patterns.incrustation({ panelW: 9, panelH: 12, axis: 'x', u0: XW, v0: Y0 });

  // 1, 2 Außenwände mit Fenstern und je einem Portal
  const outerWall = (id, s) => {
    const w = ctx.part(id);
    const portalK = PORTAL_BAY[s < 0 ? 'nord' : 'sued'];
    const openings = BAY_CENTER.map((c, k) => (k === portalK
      ? { type: 'arch', w: PORTAL.w, f: PORTAL.f, springV: PORTAL.springY - Y0, cu: c, v0: Y0 }
      : { type: 'arch', w: WINDOW.w, f: WINDOW.f, springV: WINDOW.springY - WINDOW.sillY, cu: c, v0: WINDOW.sillY }));
    const zOrigin = s < 0 ? -(Z_IN + Z_WALL_T) : Z_IN + 1;
    const cu = BAY_CENTER[portalK];

    // Sonderzellen (Schlüssel x,y,|z|): massive Laibung (volle Dicke) und Wimperg (äußere Lagen)
    const special = new Set();
    for (const c of archRing(PORTAL.w, PORTAL.f, 1, { springV: PORTAL.springY - Y0, jambs: true })) {
      for (let az = Z_IN + 1; az <= Z_IN + Z_WALL_T; az++) special.add(`${cu + c.u},${Y0 + c.v},${az}`);
    }
    const gableBase = PORTAL.springY + 2;                  // Wimperg beginnt knapp über dem Kämpfer
    const gableHalf = 6;                                   // Halbbreite an der Basis
    for (let v = gableBase; v <= PORTAL.topY; v++) {
      const hw = gableHalf * (PORTAL.topY - v) / (PORTAL.topY - gableBase);
      for (let u = -gableHalf - 1; u <= gableHalf + 1; u++) {
        const a = Math.abs(u);
        if (a > hw - 1.5 && a <= hw + 0.5) {
          for (const az of [Z_IN + 3, Z_IN + 4]) special.add(`${cu + u},${v},${az}`);
        }
      }
    }
    const mat = (x, y, z) => {
      const az = Math.abs(z);
      if (special.has(`${x},${y},${az}`)) return 'chiseled_quartz';
      if (az === Z_IN + 1) return 'smooth_stone';       // innen Pietra serena
      if (az === Z_IN + Z_WALL_T) return incr(x, y, z);  // außen Inkrustation
      return 'stone_bricks';
    };
    const wall = placeElevation(
      elevation({ u0: XW, u1: XE, v0: Y0, v1: N.aisleEavesY, openings }),
      { axis: 'x', origin: { x: 0, y: 0, z: zOrigin }, depth: [0, Z_WALL_T - 1] });
    w.fill(wall, mat);

    // Glas in den Fenstern (Mittelebene), Bronzetür im Portal
    const glass = [];
    BAY_CENTER.forEach((c, k) => {
      if (k === portalK) return;
      for (const o of archOpening(WINDOW.w, WINDOW.f, { springV: WINDOW.springY - WINDOW.sillY })) {
        glass.push({ x: c + o.u, y: WINDOW.sillY + o.v, z: s * Z_GLASS });
      }
    });
    w.fill(glass, 'white_stained_glass');
    // Bronzetür (B5): unterhalb des Kämpfers offen (Durchgang), darüber das Bogenfeld aus Bronze
    const door = [], luft = [];
    for (const o of archOpening(PORTAL.w, PORTAL.f, { springV: PORTAL.springY - Y0 })) {
      const y = Y0 + o.v;
      if (y >= PORTAL.springY) door.push({ x: cu + o.u, y, z: s * Z_DOOR });
      else for (let az = Z_IN + 1; az <= Z_IN + Z_WALL_T; az++) luft.push({ x: cu + o.u, y, z: s * az });
    }
    w.fill(door, 'cut_copper');
    ctx.oeffnung(luft, 'tor');
  };
  outerWall('aussenwand_nord', -1);
  outerWall('aussenwand_sued', 1);

  // 3 Wandvorlagen (Lisenen) außen
  const lis = ctx.part('wandvorlagen');
  const lisenes = [XW, ...[1, 2, 3].map((k) => px(k) - 2), XE - 3]; // je 4 breit
  for (const s of sides) {
    for (const x0 of lisenes) {
      for (let y = Y0; y <= N.aisleEavesY; y++) {
        for (let x = x0; x <= x0 + 3; x++) {
          for (let az = Z_IN + Z_WALL_T + 1; az <= Z_EXT; az++) {
            lis.set(x, y, s * az, (x === x0 || x === x0 + 3) ? 'dark_prismarine' : 'smooth_quartz');
          }
        }
      }
    }
  }

  // 4 Pfeiler: Bündelpfeiler, Halbpfeiler an Fassade, Vierungswand und Seitenwänden
  const pf = ctx.part('pfeiler');
  const piers = [];
  for (const s of sides) {
    for (let k = 1; k < N.bays; k++) piers.push({ cx: px(k), cz: s * Z_PIER, room: () => true });
    piers.push({ cx: WEST_FACE, cz: s * Z_PIER, room: (x) => x >= XW });
    piers.push({ cx: EAST_FACE, cz: s * Z_PIER, room: (x) => x <= XE });
    for (let k = 1; k < N.bays; k++) {
      piers.push({ cx: px(k), cz: s * (Z_IN + 1), room: (x, z) => Math.abs(z) <= Z_IN });
    }
  }
  for (const p of piers) pf.fill(pierCells(p, 'foot'), 'smooth_stone');
  for (const p of piers) pf.fill(pierCells(p, 'shaft'), 'smooth_stone');
  for (const p of piers) pf.fill(pierCells(p, 'cap'), 'polished_andesite');

  // 5 Arkaden: Wand |z| 17..21 über den Kapitellen bis Y 123, Bögen mit Keilsteinen
  const ark = ctx.part('arkaden');
  const bays = arcadeBays();
  const ARC_RING_T = 2;
  const open = new Set(), ringIdx = new Map();
  for (const b of bays) {
    const hArc = profile(b.W, AISLE_RISE);
    const hOut = profile(b.W + ARC_RING_T, AISLE_RISE + ARC_RING_T);
    for (let u = -(b.W + ARC_RING_T - 0.5); u <= b.W + ARC_RING_T - 0.5; u++) {
      for (let v = 0; v <= AISLE_RISE + ARC_RING_T; v++) {
        const x = b.c + u, y = AISLE_SPRING_Y + v;
        const inOpen = Math.abs(u) <= b.W - 0.5 && v + 0.5 <= hArc(u);
        const inOut = v + 0.5 <= hOut(u);
        if (inOpen) open.add(`${x},${y}`);
        else if (inOut) {
          const t = Math.atan2((v + 0.5) / (AISLE_RISE + ARC_RING_T), u / (b.W + ARC_RING_T));
          ringIdx.set(`${x},${y}`, Math.floor(t / (Math.PI / 13)));
        }
      }
    }
  }
  for (const s of sides) {
    for (let y = AISLE_SPRING_Y; y <= ARC_WALL_TOP; y++) {
      for (let x = XW; x <= XE; x++) {
        if (open.has(`${x},${y}`)) continue;
        const ri = ringIdx.get(`${x},${y}`);
        const type = ri === undefined ? 'smooth_stone' : (ri % 2 === 0 ? 'smooth_quartz' : 'dark_prismarine');
        for (let az = ARC_Z0; az <= ARC_Z1; az++) ark.set(x, y, s * az, type);
      }
    }
  }

  // 6 Seitenschiffgewölbe: Kreuzgewölbe je Joch und Seite, Gurtbögen 2 breit über den Pfeilerachsen
  const sg = ctx.part('seitenschiff_gewoelbe');
  for (const s of sides) {
    const zA = s < 0 ? -Z_IN : AISLE_Z0, zB = s < 0 ? -AISLE_Z0 : Z_IN;
    const hz = profile((zB - zA + 1) / 2, AISLE_RISE);
    for (let k = 0; k < N.bays; k++) {
      const x0 = k === 0 ? XW : px(k) + 1;
      const x1 = k === N.bays - 1 ? XE : px(k + 1) - 2;
      const hx = profile((x1 - x0 + 1) / 2, AISLE_RISE);
      sg.fill(crossVault({ x0, x1, z0: zA, z1: zB, springY: AISLE_SPRING_Y, hx, hz }), 'smooth_stone');
    }
    for (let k = 1; k < N.bays; k++) {
      sg.fill(crossVault({ x0: px(k) - 1, x1: px(k), z0: zA, z1: zB, springY: AISLE_SPRING_Y,
        hx: () => 0, hz, below: 1 }), 'smooth_stone');
    }
  }

  // 7 Hochschiffwand mit Oculi
  const hw = ctx.part('hochschiffwand');
  const inOculus = (x, y, r) => BAY_CENTER.some((c) => inDisk(x - c, y - OCULUS.y, r));
  for (const s of sides) {
    const wall = [];
    for (let y = NAVE_SPRING_Y; y <= N.clerestoryTopY; y++) {
      for (let x = XW; x <= XE; x++) {
        if (inOculus(x, y, OCULUS.r)) continue;
        for (let az = CLE_Z0; az <= CLE_Z1; az++) wall.push({ x, y, z: s * az });
      }
    }
    hw.fill(wall, (x, y, z) => {
      if (inOculus(x, y, OCULUS.r + 1)) return 'chiseled_quartz'; // Rahmen Ring r 5..6
      const az = Math.abs(z);
      if (az === CLE_Z0) return 'smooth_stone';
      if (az === CLE_Z1) return incr(x, y, z);
      return 'stone_bricks';
    });
    const glass = [];
    for (const c of BAY_CENTER) {
      for (let y = OCULUS.y - OCULUS.r; y <= OCULUS.y + OCULUS.r; y++) {
        for (let x = c - OCULUS.r; x <= c + OCULUS.r; x++) {
          if (inDisk(x - c, y - OCULUS.y, OCULUS.r)) glass.push({ x, y, z: s * CLE_MID });
        }
      }
    }
    hw.fill(glass, (x, y) => {
      const c = BAY_CENTER.find((cc) => Math.abs(x - cc) <= OCULUS.r);
      return inDisk(x - c, y - OCULUS.y, OCULUS.r - 2) ? 'yellow_stained_glass' : 'orange_stained_glass';
    });
  }

  // 8 Mittelschiffgewölbe: Kreuzgewölbe je Joch, Gurtbögen 3 breit, Gratrippen
  const mg = ctx.part('mittelschiff_gewoelbe');
  const hzN = profile(NAVE_HALF + 0.5, NAVE_RISE);
  for (let k = 0; k < N.bays; k++) {
    const x0 = k === 0 ? XW : px(k) + 2;
    const x1 = k === N.bays - 1 ? XE : px(k + 1) - 2;
    const hxN = profile((x1 - x0 + 1) / 2, NAVE_RISE);
    const cx = (x0 + x1) / 2;
    const rib = (x, y, z) => {
      const a = hxN(x - cx), b = hzN(z);
      return Math.min(a, b) > 1 && Math.abs(a - b) < 0.6 ? 'polished_andesite' : 'smooth_stone';
    };
    mg.fill(crossVault({ x0, x1, z0: -NAVE_HALF, z1: NAVE_HALF, springY: NAVE_SPRING_Y,
      hx: hxN, hz: hzN }), rib);
  }
  for (let k = 1; k < N.bays; k++) {
    mg.fill(crossVault({ x0: px(k) - 1, x1: px(k) + 1, z0: -NAVE_HALF, z1: NAVE_HALF, springY: NAVE_SPRING_Y,
      hx: () => 0, hz: hzN, below: 1 }), 'polished_andesite');
  }

  // 9 Gesimse
  const ges = ctx.part('gesimse');
  for (const s of sides) {
    for (let x = XW; x <= XE; x++) {
      for (let az = Z_IN + 1; az <= Z_EXT + 1; az++) ges.set(x, CORNICE_AISLE_Y, s * az, 'quartz_bricks');
      for (let az = CLE_Z0; az <= CLE_Z1 + 1; az++) ges.set(x, CORNICE_NAVE_Y, s * az, 'quartz_bricks');
    }
  }

  // 10 Pultdächer der Seitenschiffe (auf der Arkadenwand-Oberkante bei |z| 22, auf dem Gesims bei |z| 44)
  const ds = ctx.part('dach_seitenschiffe');
  ds.fill(shedRoof({ x0: XW, x1: XE, z0: -Z_EXT, z1: -AISLE_Z0, axis: 'z', highAt: 'max',
    highY: ROOF_AISLE_HIGH, lowY: ROOF_AISLE_LOW }), 'terracotta');
  ds.fill(shedRoof({ x0: XW, x1: XE, z0: AISLE_Z0, z1: Z_EXT, axis: 'z', highAt: 'min',
    highY: ROOF_AISLE_HIGH, lowY: ROOF_AISLE_LOW }), 'terracotta');

  // 11 Satteldach des Mittelschiffs: Traufe auf dem Gesims (|z| 21), First über z = 0
  const dm = ctx.part('dach_mittelschiff');
  dm.fill(gableRoof({ x0: XW, x1: XE, z0: -(CLE_Z1 + 1), z1: CLE_Z1 + 1, ridgeAxis: 'x',
    eaveY: N.naveVaultY, ridgeY: N.roofRidgeY }), 'terracotta');

  // 12 Bewusst unzugänglich (B5): Dachräume über den Gewölben, Mauerkronen und Kapitelle
  const DACH = 'Dachraum zwischen Gewölbe und Dach: leerer Raum ohne Bedeutung, im Original nur über Luken erreichbar; bleibt im Modell geschlossen';
  for (const s of sides) {
    ctx.unzugaenglich(luftRaum(ctx, { seeds: BAY_CENTER.map((c) => [Math.round(c), N.aisleVaultY + 1, s * 30]),
      box: { x0: XW, x1: XE, y0: AISLE_SPRING_Y, y1: ROOF_AISLE_HIGH, z0: s < 0 ? -Z_EXT : AISLE_Z0, z1: s < 0 ? -AISLE_Z0 : Z_EXT } }), DACH);
    ctx.unzugaenglich(luftRaum(ctx, { seeds: BAY_CENTER.map((c) => [Math.round(c), ARC_WALL_TOP + 1, s * ARC_Z1]),
      box: { x0: XW, x1: XE + 4, y0: ARC_WALL_TOP, y1: N.clerestoryTopY, z0: s < 0 ? -(ARC_Z1 + 2) : ARC_Z1, z1: s < 0 ? -ARC_Z1 : ARC_Z1 + 2 } }),
    'Mauerkrone der Arkadenwand neben der Hochschiffwand, unter dem Kranzgesims: kein Raum, nur über das Dach erreichbar');
    const kap = [];
    for (let k = 1; k < N.bays; k++) kap.push([px(k), CAP_TOP + 1, s * (Z_IN - 1)]);
    ctx.unzugaenglich(luftRaum(ctx, { seeds: kap, box: { x0: XW, x1: XE, y0: CAP_TOP + 1, y1: CAP_TOP + 4,
      z0: s < 0 ? -Z_IN : Z_IN - 4, z1: s < 0 ? -(Z_IN - 4) : Z_IN } }),
    'Oberseite der Wandpfeiler-Kapitelle unter dem Gewölbeansatz: kein Standplatz');
  }
  ctx.unzugaenglich(luftRaum(ctx, { seeds: BAY_CENTER.map((c) => [Math.round(c), NAVE_TOP_Y + 2, 0]),
    box: { x0: XW, x1: XE + 4, y0: NAVE_SPRING_Y, y1: N.roofRidgeY + 6, z0: -CLE_Z1 - 1, z1: CLE_Z1 + 1 } }), DACH);
}

module.exports = { module: 1, build, PORTAL_BAY, BAY_CENTER, XW, XE };
