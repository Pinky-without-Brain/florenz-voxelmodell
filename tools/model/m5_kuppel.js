'use strict';
// Modul 5: Brunelleschis Doppelkuppel (BAUTEIL_KATALOG, Modul 5).
// Geometrie ausschließlich aus dome.doubleDomeLayout / dome.shell. Bauteile sind Höhenbänder
// kuppel_ring_01..08 (9 Lagen ab springY + 1, das letzte bis yTop) und der Schlussring.
// Vorgehen: Erst werden alle Zellen samt Material in einer Map gesammelt (Rippen gewinnen gegen
// die Schalen), danach wird je Band geschrieben. So sind alle Elemente disjunkt.
const D = require('../spec/dimensions.js');

const C = D.CATHEDRAL;
const DM = C.dome;

// --- Lokale Ableitungen und Katalogwerte ----------------------------------------------------
const BAND_H = 9;                 // Lagen je Höhenband (Katalog)
const BAND_COUNT = 8;             // kuppel_ring_01 .. 08
const CHAIN_EVERY = 12;           // Ringkette alle 12 Lagen (Katalog)
const MAJOR_DELTA = 3;            // Hauptrippe: cornerAngleDelta <= 3 Grad
const MINOR_WEB = 1 / 3;          // Zwischenrippen bei webPosition = +-1/3
const MINOR_HALF_W = 0.72;        // halbe Rippenbreite in Zellen (>= sqrt(2)/2: Rippe bleibt flächig zusammenhängend)
const RING_RHO_MAX = 14;          // Schlussring bis rho 14 (Katalog)
const RING_BAND_Y_OFFSET = 3;     // Granitband in der 4. Ringlage (Y 244 bei 241..246)
const SCAN = 70;                  // Suchfenster |x|,|z| <= 70 (Außenschale reicht bis ~ rho 54)

// Fresko: 5 Ringzonen von unten (Katalog), je zwei Farben
const FRESCO = [
  { a: 'black_concrete', b: 'red_terracotta' },          // Hölle
  { a: 'brown_terracotta', b: 'orange_terracotta' },     // Todsünden und Tugenden
  { a: 'light_blue_terracotta', b: 'white_terracotta' }, // Seligkeiten, Heilige
  { a: 'yellow_terracotta', b: 'white_terracotta' },     // Ältestenchor
  { a: 'blue_terracotta', b: 'gold_block' }              // Christus und Engel
];

const key = (x, y, z) => x + ',' + y + ',' + z;

function build(ctx) {
  const dome = ctx.dome;
  const lay = dome.doubleDomeLayout(ctx.dims);
  const springY = lay.springY;
  const yTop = lay.inner.yTop;                    // eyeRingTopY - 6
  const rhoMin = lay.eye.rhoMin;                  // 6
  const y0 = springY + 1;                         // 173
  const ringY0 = lay.eye.ringTopY - 5;            // 241
  const ringY1 = lay.eye.ringTopY;                // 246
  const rho = dome.rho;

  // ---- 1) Rohzellen der beiden Schalen --------------------------------------------------
  const innerCells = [...dome.shell({ springY, ...lay.inner, rhoMin })];
  const outerCells = [...dome.shell({ springY, ...lay.outer, rhoMin })];
  const innerSet = new Set(innerCells.map((c) => key(c.x, c.y, c.z)));
  const outerSet = new Set(outerCells.map((c) => key(c.x, c.y, c.z)));
  for (const k of outerSet) if (innerSet.has(k)) throw new Error('Innen- und Außenschale überlappen bei ' + k);

  const mat = new Map(); // key -> { x, y, z, type }
  const put = (x, y, z, type) => mat.set(key(x, y, z), { x, y, z, type });

  // ---- 2) Innenschale: Fischgrät, innerste Zelllage trägt das Fresko --------------------
  const herring = ctx.patterns.herringbone({ a: 'bricks', b: 'terracotta' });
  const nSteps = yTop - springY; // 68 Lagen
  const zoneOf = (y) => Math.min(FRESCO.length - 1, Math.floor(((y - y0) * FRESCO.length) / nSteps));
  // Neben Richtung kleineres rho (x/z) oder darunter (y-1) leer = zur Kuppelmitte sichtbar
  const faceInward = (c) => {
    const q = rho(c.x, c.z);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (rho(c.x + dx, c.z + dz) < q && !innerSet.has(key(c.x + dx, c.y, c.z + dz))) return true;
    }
    return c.y > y0 && !innerSet.has(key(c.x, c.y - 1, c.z)); // unterste Lage ruht auf dem Tambour
  };
  const fresco = (c) => {
    const zone = zoneOf(c.y);
    const seg = dome.segmentIndex(c.x, c.z);
    const wp = dome.webPosition(c.x, c.z);
    const col = Math.floor((wp + 1) * 4); // 0..7, Spalten im Segment
    const t = FRESCO[zone];
    if (zone === 4) {
      // Christus/Engel: Ostsegment trägt den Thron aus Gold, sonst Engel (Gold-Punkte im Himmelblau)
      if (seg === 0) return Math.abs(wp) <= 0.6 ? t.b : t.a;
      return Math.abs(wp) <= 0.2 && ((c.y % 4) + 4) % 4 === 0 ? t.b : t.a;
    }
    // Figurengruppen als schräge Bänder je Spalte und Höhe
    return ((col * 2 + c.y) % 6 + 6) % 6 < 2 ? t.b : t.a;
  };
  for (const c of innerCells) put(c.x, c.y, c.z, faceInward(c) ? fresco(c) : herring(c.x, c.y, c.z));

  // ---- 3) Außenschale: Ziegel, äußerste Zelllage Terrakotta ----------------------------------
  const faceOutward = (c) => {
    const q = rho(c.x, c.z);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (rho(c.x + dx, c.z + dz) > q && !outerSet.has(key(c.x + dx, c.y, c.z + dz))) return true;
    }
    return c.y < yTop && !outerSet.has(key(c.x, c.y + 1, c.z));
  };
  for (const c of outerCells) put(c.x, c.y, c.z, faceOutward(c) ? 'terracotta' : 'bricks');

  // ---- 4) Zwischenraum je Lage: rho zwischen Innenschale und Außenschale -----------------------
  const innerMax = new Map(), outerMin = new Map();
  for (const c of innerCells) innerMax.set(c.y, Math.max(innerMax.get(c.y) ?? -1, rho(c.x, c.z)));
  for (const c of outerCells) outerMin.set(c.y, Math.min(outerMin.get(c.y) ?? Infinity, rho(c.x, c.z)));
  const gapCells = []; // alle freien Zwischenraumzellen
  for (let y = y0; y <= yTop; y++) {
    if (!innerMax.has(y) || !outerMin.has(y)) continue;
    const lo = innerMax.get(y), hi = outerMin.get(y);
    for (let x = -SCAN; x <= SCAN; x++) {
      for (let z = -SCAN; z <= SCAN; z++) {
        const q = rho(x, z);
        if (q > lo && q < hi && q >= rhoMin && !innerSet.has(key(x, y, z)) && !outerSet.has(key(x, y, z))) {
          gapCells.push({ x, y, z });
        }
      }
    }
  }

  // ---- 5) 16 Zwischenrippen (bricks) im Zwischenraum ---------------------------------------------
  for (const c of gapCells) {
    const wp = dome.webPosition(c.x, c.z);
    const tol = (MINOR_HALF_W / Math.hypot(c.x, c.z)) * (180 / Math.PI) / 22.5; // Winkelanteil
    if (Math.abs(Math.abs(wp) - MINOR_WEB) <= tol) put(c.x, c.y, c.z, 'bricks');
  }

  // ---- 6) Ringketten: alle 12 Lagen eine volle Lage im Zwischenraum (stone_bricks) --------------
  for (const c of gapCells) if ((c.y - springY) % CHAIN_EVERY === 0) put(c.x, c.y, c.z, 'stone_bricks');

  // ---- 7) 8 Hauptrippen: gewinnen gegen alles (Außenschale, Zwischenraum, 1 Lage nach außen) -------
  for (const c of gapCells) {
    if (dome.cornerAngleDelta(c.x, c.z) <= MAJOR_DELTA) put(c.x, c.y, c.z, 'bricks');
  }
  const ribOuter = outerCells.filter((c) => dome.cornerAngleDelta(c.x, c.z) <= MAJOR_DELTA);
  for (const c of ribOuter) put(c.x, c.y, c.z, 'smooth_quartz');
  for (const c of ribOuter) { // sichtbare Rippe: 1 Lage nach außen (rho+1 bzw. darüber)
    const q = rho(c.x, c.z);
    const cand = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]]
      .filter(([dx, , dz]) => rho(c.x + dx, c.z + dz) > q).map(([dx, , dz]) => [c.x + dx, c.y, c.z + dz]);
    if (c.y < yTop) cand.push([c.x, c.y + 1, c.z]);
    for (const [x, y, z] of cand) {
      if (outerSet.has(key(x, y, z)) || innerSet.has(key(x, y, z))) continue;
      put(x, y, z, 'smooth_quartz');
    }
  }

  // ---- 8) Bänder schreiben --------------------------------------------------------------------------
  const byY = new Map();
  for (const c of mat.values()) {
    if (!byY.has(c.y)) byY.set(c.y, []);
    byY.get(c.y).push(c);
  }
  const bandRange = (i) => [y0 + i * BAND_H, i === BAND_COUNT - 1 ? yTop : y0 + (i + 1) * BAND_H - 1];
  for (let i = 0; i < BAND_COUNT; i++) {
    const [a, b] = bandRange(i);
    const w = ctx.part('kuppel_ring_' + String(i + 1).padStart(2, '0'));
    const cells = [];
    for (let y = a; y <= b; y++) for (const c of byY.get(y) || []) cells.push(c);
    cells.sort((p, q) => p.y - q.y || p.x - q.x || p.z - q.z);
    w.fill(cells, (x, y, z) => mat.get(key(x, y, z)).type);
  }
  for (const k of mat.keys()) { const c = mat.get(k); if (c.y < y0 || c.y > yTop) throw new Error('Zelle außerhalb der Bänder: ' + k); }

  // ---- 9) Schlussring: rho eye..14, Y 241..246, deckt Schalen und Zwischenraum ab ----------------
  const ring = ctx.part('schlussring', { symmetry: { order: 8, cx: 0, cz: 0 } });
  const ringCells = [];
  for (let y = ringY0; y <= ringY1; y++) {
    for (let x = -RING_RHO_MAX; x <= RING_RHO_MAX; x++) {
      for (let z = -RING_RHO_MAX; z <= RING_RHO_MAX; z++) {
        const q = rho(x, z);
        if (q >= rhoMin && q <= RING_RHO_MAX) ringCells.push({ x, y, z });
      }
    }
  }
  // Die Außenschale (flach, rho bis ~17) und die Rippen enden bei yTop außerhalb von rho 14:
  // Eine Deckplatte in der ersten Ringlage (Y 241) liegt darüber und schließt sie ab.
  for (const c of byY.get(yTop)) if (rho(c.x, c.z) > RING_RHO_MAX) ringCells.push({ x: c.x, y: ringY0, z: c.z });
  const bandY = ringY0 + RING_BAND_Y_OFFSET;
  ring.fill(ringCells, (x, y) => (y === bandY ? 'polished_granite' : 'smooth_quartz'));
}

module.exports = {
  module: 5,
  build,
  _internal: { BAND_H, BAND_COUNT, CHAIN_EVERY, MAJOR_DELTA, RING_RHO_MAX, FRESCO },
};
