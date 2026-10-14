'use strict';
// Modul 2: Westfassade (BAUTEIL_KATALOG, Modul 2). Hoheitsgebiet X −216..−213, |Z| ≤ 44.
// Pfeilervorlagen und Fialen sind Teil der Zonen-Bauteile (empfohlene Variante).
const D = require('../spec/dimensions.js');
const { archOpening, archRing, elevation, placeElevation } = require('../geom/arches.js');
const { inDisk } = require('../geom/shapes.js');

const L = D.LEVELS;
const F = D.CATHEDRAL.facade;
const N = D.CATHEDRAL.nave;

// --- Maße -------------------------------------------------------------------
const XF = F.westFaceX;                       // −216, Außenschicht (d = 0)
const T = F.thickness;                        // 4 Schichten: d = 0..3 (x −216..−213)
const X_IN = XF + T - 1;                      // −213, Innenschicht (Uhr)
const Y0 = L.walkY;                           // 65
const PEAK = F.peakY;                         // 164
const Z_EXT = N.exteriorHalfZ;                // 44
const CENTRAL = N.centralHalfZ + 2;           // 21, Mittelteil |z| ≤ 21 (Hochschiffwand-Außenkante)
const NAVE_EAVE = N.naveVaultY;               // 150, Traufe/Dachansatz Mittelschiff bei |z| = 21
const SIDE_LOW = N.aisleEavesY + 2;           // 116, Seitenschiffdach unten (auf dem Gesims Y 115) bei |z| = 44
const SIDE_HIGH = 128;                        // Katalog: halber Giebel endet bei |z| = 22 auf Y 128 (Dach dort 123)
// Zonengrenzen (Katalog)
const SOCKEL_TOP = 72, PORTAL_TOP = 100, NICHE_TOP = 114, ROSE_TOP = 140;
// Portale (Katalog): Mitte w 6/Kämpfer 88, seitlich z ±29 w 4/Kämpfer 84
const PORTALS = [
  { cu: 0, w: 6, spring: 88 },
  { cu: -29, w: 4, spring: 84 },
  { cu: 29, w: 4, spring: 84 }
];
// Rosette
const ROSE = { y: 128, r: 9 };
// Uhr: Zifferblatt um (Y 109, z 0)
const CLOCK = { y: 109, r: 9 };
// Fialen (Spitzen) auf den Pfeilervorlagen
const FIAL_IN_Z = 22, FIAL_IN_TOP = 150;      // innen: bis Y 150
const FIAL_OUT_Z = 43, FIAL_OUT_TOP = 120;    // außen: bis Y 120
// Tondo im Giebel
const TONDO = { y: 152, r: 4 };

const key = (x, y, z) => x + ',' + y + ',' + z;
const sides = [-1, 1];

// Giebelsilhouette: Oberkante der Spalte bei |z|
function topAt(az) {
  if (az <= CENTRAL) return NAVE_EAVE + Math.round((PEAK - NAVE_EAVE) * (CENTRAL - az) / CENTRAL);
  return SIDE_LOW + Math.round((SIDE_HIGH - SIDE_LOW) * (Z_EXT - az) / (Z_EXT - CENTRAL - 1));
}

// Uhr-Zellen (x = −213): { 'z,y' → Typ }
const CLOCK_MARK_ANGLES = Array.from({ length: 24 }, (_, k) => k * 15);
const HAND = { deg: 285, len: 6 };            // Zeiger (asymmetrisch), Winkel ab oben, gegen den Uhrzeigersinn
function clockCells() {
  const m = new Map();
  const dirOf = (deg) => [Math.sin(deg * Math.PI / 180), Math.cos(deg * Math.PI / 180)]; // [dz, dy]
  for (let dy = -CLOCK.r; dy <= CLOCK.r; dy++) {
    for (let dz = -CLOCK.r; dz <= CLOCK.r; dz++) {
      if (!inDisk(dz, dy, CLOCK.r)) continue;
      m.set(dz + ',' + (CLOCK.y + dy), inDisk(dz, dy, CLOCK.r - 1) ? 'white_terracotta' : 'blue_terracotta');
    }
  }
  for (const deg of CLOCK_MARK_ANGLES) {
    const [sz, cy] = dirOf(deg);
    for (const r of [7, 8]) {
      m.set(Math.round(r * sz) + ',' + (CLOCK.y + Math.round(r * cy)), 'black_concrete');
    }
  }
  const [hz, hy] = dirOf(HAND.deg);
  for (let r = 0; r <= HAND.len; r++) {
    m.set(Math.round(r * hz) + ',' + (CLOCK.y + Math.round(r * hy)), 'gold_block');
  }
  // Stern an der Zeigerspitze (Plus-Form)
  const tz = Math.round(HAND.len * hz), ty = CLOCK.y + Math.round(HAND.len * hy);
  for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) m.set((tz + a) + ',' + (ty + b), 'gold_block');
  return m;
}
const CLOCK_MAP = clockCells();
const isClock = (x, y, z) => x === X_IN && CLOCK_MAP.has(z + ',' + y);

function build(ctx) {
  const wide = ctx.patterns.incrustation({ panelW: 9, panelH: 12, axis: 'z', u0: 0, v0: Y0 });
  const stripIn = ctx.patterns.incrustation({ panelW: 2, panelH: 11, axis: 'z', u0: 20, v0: Y0 });
  const stripOut = ctx.patterns.incrustation({ panelW: 3, panelH: 11, axis: 'z', u0: 40, v0: Y0 });

  // Grundmaterial nach Schicht d (0 außen … 3 innen); symmetrisch, da nur |z| benutzt wird
  function baseMat(x, y, z) {
    const d = x - XF, az = Math.abs(z);
    if (y <= SOCKEL_TOP) {
      if (d <= 1) return y === SOCKEL_TOP ? 'dark_prismarine' : 'polished_granite';
      return d === 2 ? 'stone_bricks' : 'smooth_stone';
    }
    if (d === 3) return 'smooth_stone';
    if (d >= 1) return 'stone_bricks';
    if (az >= 20 && az <= 23) return stripIn(x, y, az);
    if (az >= 40) return stripOut(x, y, az);
    return wide(x, y, az);
  }

  // Überschreibungen (Rahmen, Türen …) – immer spiegelbildlich eingetragen
  const newOverrides = () => {
    const ov = new Map();
    const put = (x, y, z, t) => { ov.set(key(x, y, z), t); ov.set(key(x, y, -z), t); };
    const mat = (x, y, z) => ov.get(key(x, y, z)) || baseMat(x, y, z);
    return { ov, put, mat };
  };

  // Wandzellen einer Zone: je Schicht eine Ansicht (arches.elevation) mit eigenen Öffnungen
  function zoneCells({ y0, y1, inside, openings = {} }) {
    const out = [];
    for (let d = 0; d < T; d++) {
      const view = elevation({ u0: -Z_EXT, u1: Z_EXT, v0: y0 - Y0, v1: y1 - Y0, openings: openings[d] || [] });
      const kept = [];
      for (const c of view) if (inside(Math.abs(c.u), Y0 + c.v)) kept.push(c);
      for (const p of placeElevation(kept, { axis: 'z', origin: { x: XF, y: Y0, z: 0 }, depth: [d, d] })) {
        if (!isClock(p.x, p.y, p.z)) out.push(p);
      }
    }
    return out;
  }
  const rectZone = (y0, y1) => (az, y) => y >= y0 && y <= y1;
  const noClock = (cells) => cells.filter((c) => !isClock(c.x, c.y, c.z));

  // Portale (B5): Die drei Portale reichen bis zum Fußboden (Y 65), die Bronzetüren stehen offen.
  // Laibung (Schichten d = 0, 1), Sturz und Lünette (d = 2, 3) gelten für Sockel- und Portalzone gemeinsam.
  const portal = newOverrides();
  const pz = Y0;                                          // Portalboden = Laufniveau
  const portalOpen = PORTALS.map((p) => ({ type: 'arch', w: p.w, f: 0.5, springV: p.spring - pz, cu: p.cu, v0: 0 }));
  const doorOpen = PORTALS.map((p) => ({ type: 'rect', u0: p.cu - p.w, u1: p.cu + p.w, v0: 0, v1: p.spring - 2 - Y0 }));
  const portalLuft = [];
  for (const p of PORTALS) {
    const springV = p.spring - pz;
    for (const c of archRing(p.w, 0.5, 1, { springV, jambs: true })) {
      const z = p.cu + c.u, y = pz + c.v;
      portal.put(XF, y, z, 'chiseled_quartz');
      portal.put(XF + 1, y, z, 'smooth_quartz');
    }
    for (const c of archOpening(p.w, 0.5, { springV })) {
      const z = p.cu + c.u, y = pz + c.v;
      portalLuft.push({ x: XF, y, z }, { x: XF + 1, y, z });
      if (y <= p.spring - 2) { portalLuft.push({ x: XF + 2, y, z }, { x: XF + 3, y, z }); continue; } // offene Tür
      const t = y === p.spring - 1 ? 'chiseled_quartz'
        : (Math.floor(Math.hypot(c.u, y - p.spring)) % 2 === 0 ? 'gold_block' : 'blue_terracotta');
      portal.put(XF + 2, y, z, t);
      portal.put(XF + 3, y, z, t);
    }
  }
  const portalOpenings = { 0: portalOpen, 1: portalOpen, 2: doorOpen, 3: doorOpen };

  // 1 Sockel (mit den unteren Teilen der Portale)
  {
    const w = ctx.part('sockel');
    w.fill(zoneCells({ y0: Y0, y1: SOCKEL_TOP, inside: rectZone(Y0, SOCKEL_TOP), openings: portalOpenings }), portal.mat);
    ctx.oeffnung(portalLuft.filter((c) => c.y <= SOCKEL_TOP), 'tor');
  }

  // 2 Portalzone
  {
    const w = ctx.part('portalzone');
    const { put } = portal;
    for (const p of PORTALS) {
      // Wimperg: Dreieck-Umriss auf der Außenschicht, Spitze auf Y 100
      const base = p.spring + p.w + 2;
      const hw0 = p.w + 2;
      const ratio = hw0 / (PORTAL_TOP - base);
      for (let y = base; y <= PORTAL_TOP; y++) {
        const hw = ratio * (PORTAL_TOP - y);
        for (let u = -hw0 - 1; u <= hw0 + 1; u++) {
          const a = Math.abs(u);
          if ((a <= hw + 0.5 && a > hw - Math.max(1.5, ratio + 0.5)) || (y === base && a <= hw0)) {
            put(XF, y, p.cu + u, 'chiseled_quartz');
          }
        }
      }
    }
    w.fill(zoneCells({ y0: SOCKEL_TOP + 1, y1: PORTAL_TOP, inside: rectZone(SOCKEL_TOP + 1, PORTAL_TOP),
      openings: portalOpenings }), portal.mat);
    ctx.oeffnung(portalLuft.filter((c) => c.y > SOCKEL_TOP), 'tor');
  }

  // 3 Nischenzone: 12 Statuennischen, 1 Block tief (Schicht d = 0)
  {
    const w = ctx.part('nischenzone');
    const { put, mat } = newOverrides();
    const NICHE = { base: 104, springV: 4 };
    const centers = [3, 9, 15, 27, 32, 37];                 // je ±; 12 Nischen
    const openings0 = [];
    for (const c of centers) {
      for (const s of sides) {
        const cu = s * c;
        openings0.push({ type: 'arch', w: 1, f: 0.5, springV: NICHE.springV, cu, v0: NICHE.base - Y0 });
        for (const r of archRing(1, 0.5, 1, { springV: NICHE.springV, jambs: true })) {
          put(XF, NICHE.base + r.v, cu + r.u, 'smooth_quartz');
        }
        for (let u = -2; u <= 2; u++) put(XF, NICHE.base - 1, cu + u, 'smooth_quartz');   // Sohlbank
      }
    }
    w.fill(zoneCells({ y0: NICHE_TOP - 13, y1: NICHE_TOP, inside: rectZone(NICHE_TOP - 13, NICHE_TOP),
      openings: { 0: openings0 } }), mat);
    // Statue in jeder Nische: Körper 3 hoch, Kopf aus Calcit
    const statue = [];
    for (const c of centers) {
      for (const s of sides) {
        for (let y = NICHE.base; y < NICHE.base + 3; y++) statue.push({ x: XF, y, z: s * c });
      }
    }
    w.fill(statue, 'smooth_quartz');
    const heads = [];
    for (const c of centers) for (const s of sides) heads.push({ x: XF, y: NICHE.base + 3, z: s * c });
    w.fill(heads, 'calcite');
  }

  // 4 Rosenzone: Mittelteil mit Rosette, Seitenteile mit halben Giebeln, Fialen bis Y ≤ 140
  {
    const w = ctx.part('rosenzone');
    const { put, mat } = newOverrides();
    const y0 = NICHE_TOP + 1;
    const hole = { type: 'circle', cu: 0, cv: ROSE.y - Y0, r: ROSE.r };
    // Maßwerkring r 9..10 in allen Schichten (Uhrzellen bleiben der Uhr)
    for (let dy = -ROSE.r - 1; dy <= ROSE.r + 1; dy++) {
      for (let dz = -ROSE.r - 1; dz <= ROSE.r + 1; dz++) {
        if (inDisk(dz, dy, ROSE.r + 1) && !inDisk(dz, dy, ROSE.r)) {
          for (let d = 0; d < T; d++) put(XF + d, ROSE.y + dy, dz, 'chiseled_quartz');
        }
      }
    }
    w.fill(zoneCells({ y0, y1: ROSE_TOP,
      inside: (az, y) => (az <= CENTRAL ? y <= ROSE_TOP : y <= topAt(az)),
      openings: { 0: [hole], 1: [hole], 2: [hole], 3: [hole] } }), mat);
    // Rosette in Schicht d = 1: Nabe, Ring, 8 Speichen, Glas orange/gelb
    const glass = [];
    for (let dy = -ROSE.r; dy <= ROSE.r; dy++) {
      for (let dz = -ROSE.r; dz <= ROSE.r; dz++) {
        if (inDisk(dz, dy, ROSE.r)) glass.push({ x: XF + 1, y: ROSE.y + dy, z: dz });
      }
    }
    w.fill(glass, (x, y, z) => {
      const dz = z, dy = y - ROSE.y, r = Math.hypot(dz, dy);
      if (inDisk(dz, dy, 1)) return 'chiseled_quartz';
      if (dz === 0 || dy === 0 || Math.abs(dz) === Math.abs(dy)) return 'chiseled_quartz';
      if (r > 4.5 && r <= 5.5) return 'chiseled_quartz';
      const th = Math.atan2(dy, Math.abs(dz));
      const k = Math.floor((th + Math.PI / 2) / (Math.PI / 4));
      return (k + (r > 5.5 ? 1 : 0)) % 2 === 0 ? 'orange_stained_glass' : 'yellow_stained_glass';
    });
    // Fialen: innen (|z| 22) ab Seitenteil-Oberkante bis Y 140, außen (|z| 43) bis Y 120
    const fial = [];
    for (const s of sides) {
      for (let y = topAt(FIAL_IN_Z) + 1; y <= ROSE_TOP; y++) {
        fial.push({ x: XF, y, z: s * FIAL_IN_Z }, { x: XF + 1, y, z: s * FIAL_IN_Z });
      }
      for (let y = topAt(FIAL_OUT_Z) + 1; y <= FIAL_OUT_TOP; y++) {
        fial.push({ x: XF, y, z: s * FIAL_OUT_Z });
        if (y < FIAL_OUT_TOP) fial.push({ x: XF + 1, y, z: s * FIAL_OUT_Z });
      }
    }
    w.fill(fial, (x, y) => (y === FIAL_OUT_TOP ? 'chiseled_quartz' : 'smooth_quartz'));
    // B5: Laibung der Rosette hinter dem Glas (Schichten d = 2, 3), hoch über dem Fußboden
    const laibung = [];
    for (let dy = -ROSE.r; dy <= ROSE.r; dy++) for (let dz = -ROSE.r; dz <= ROSE.r; dz++) {
      if (!inDisk(dz, dy, ROSE.r)) continue;
      for (const d of [2, 3]) if (!isClock(XF + d, ROSE.y + dy, dz)) laibung.push({ x: XF + d, y: ROSE.y + dy, z: dz });
    }
    ctx.unzugaenglich(laibung, 'Laibung der Rosette auf der Innenseite: Fensterrund hoch über dem Boden, nicht begehbar');
  }

  // 5 Giebel: Wandkörper |z| ≤ 21 bis Traufe Y 150, darüber Dreieck bis zur Spitze Y 164
  {
    const w = ctx.part('giebel');
    const { put, mat } = newOverrides();
    const y0 = ROSE_TOP + 1;
    const inside = (az, y) => az <= CENTRAL && y >= y0 && y <= topAt(az);
    // Randband auf der Außenschicht entlang der Schräge
    for (let az = 0; az <= CENTRAL; az++) {
      for (let y = Math.max(y0, topAt(az) - 1); y <= topAt(az); y++) {
        if (y > NAVE_EAVE - 1 || az < CENTRAL) put(XF, y, az, 'smooth_quartz');
      }
    }
    // Tondo (Schichten d = 0, 1): Goldrand, blaue Fläche, Goldkern
    for (let dy = -TONDO.r; dy <= TONDO.r; dy++) {
      for (let dz = -TONDO.r; dz <= TONDO.r; dz++) {
        if (!inDisk(dz, dy, TONDO.r)) continue;
        const t = !inDisk(dz, dy, TONDO.r - 1) || inDisk(dz, dy, 0) ? 'gold_block' : 'blue_terracotta';
        put(XF, TONDO.y + dy, dz, t);
        put(XF + 1, TONDO.y + dy, dz, t);
      }
    }
    w.fill(zoneCells({ y0, y1: PEAK, inside }), mat);
    // Fialen (Fortsetzung): |z| 22 von Y 141 bis 150
    const fial = [];
    for (const s of sides) {
      for (let y = ROSE_TOP + 1; y <= FIAL_IN_TOP; y++) {
        fial.push({ x: XF, y, z: s * FIAL_IN_Z });
        if (y <= FIAL_IN_TOP - 3) fial.push({ x: XF + 1, y, z: s * FIAL_IN_Z });
      }
    }
    w.fill(fial, (x, y) => (y === FIAL_IN_TOP ? 'chiseled_quartz' : 'smooth_quartz'));
    // Krabben: Einzelblöcke auf der Giebelkante (nur Schicht d = 0, nie über Y 164)
    const crabs = [];
    for (const s of sides) {
      for (const az of [3, 6, 9, 12, 15, 18]) {
        const y = topAt(az) + 1;
        if (y <= PEAK) crabs.push({ x: XF, y, z: s * az });
      }
    }
    w.fill(crabs, 'chiseled_quartz');
  }

  // 6 Uhr (Uccello) auf der Innenseite x −213: eigene Zellen, von den Zonen ausgespart
  {
    const w = ctx.part('facade_innenseite_uhr');
    const cells = [];
    for (const k of CLOCK_MAP.keys()) {
      const [z, y] = k.split(',').map(Number);
      cells.push({ x: X_IN, y, z });
    }
    cells.sort((a, b) => a.y - b.y || a.z - b.z);
    w.fill(cells, (x, y, z) => CLOCK_MAP.get(z + ',' + y));
  }
}

module.exports = { module: 2, build, topAt, isClock, CLOCK_MAP, PORTALS, XF, X_IN };
