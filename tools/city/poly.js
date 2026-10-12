'use strict';
// Polygon-Hilfen für den Hausgenerator (V3). Polygon = { aussen: [Ring], loecher: [Ring] }, Ring = [[x, z], ...]
// in Blockkoordinaten; die Zellmitte liegt auf der ganzzahligen Koordinate (Konvention von gebaeude.json).

// Zellschlüssel (x, z) -> Zahl (Packung wie grid.js ohne y)
const ck = (x, z) => (x + 4096) * 8192 + (z + 4096);
const ckX = (k) => Math.floor(k / 8192) - 4096;
const ckZ = (k) => (k % 8192) - 4096;

// Ring ohne wiederholten Schlusspunkt
function cleanRing(r) {
  const out = r.map((p) => [p[0], p[1]]);
  if (out.length > 1) {
    const a = out[0], b = out[out.length - 1];
    if (a[0] === b[0] && a[1] === b[1]) out.pop();
  }
  return out;
}

function normalize(poly) {
  return { aussen: (poly.aussen || []).map(cleanRing), loecher: (poly.loecher || []).map(cleanRing) };
}

// Vorzeichenbehaftete Fläche (Schuhband); Vorzeichen nur relativ zum Koordinatensystem sinnvoll
function signedArea(ring) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const p = ring[i], q = ring[(i + 1) % ring.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

function area(poly) {
  const p = normalize(poly);
  return p.aussen.reduce((s, r) => s + Math.abs(signedArea(r)), 0) - p.loecher.reduce((s, r) => s + Math.abs(signedArea(r)), 0);
}

const EPS = 1e-9;

// 0 außen, 1 innen, 2 auf dem Rand
function inRing(ring, x, z) {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const a = ring[j], b = ring[i];
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const cross = (x - a[0]) * dz - (z - a[1]) * dx;
    if (Math.abs(cross) <= EPS * (Math.abs(dx) + Math.abs(dz) + 1)) {
      const dot = (x - a[0]) * dx + (z - a[1]) * dz;
      if (dot >= -EPS && dot <= dx * dx + dz * dz + EPS) return 2;
    }
    if ((a[1] > z) !== (b[1] > z) && x < ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside ? 1 : 0;
}

/**
 * Punkt im Polygon mit Löchern. Rand der Außenringe zählt als innen, Rand der Löcher als innen (massiv).
 * poly muss normalisiert sein (normalize) oder schlicht ohne Schlusspunkt.
 */
function contains(poly, x, z) {
  let inOuter = false;
  for (const r of poly.aussen) if (inRing(r, x, z)) { inOuter = true; break; }
  if (!inOuter) return false;
  for (const h of poly.loecher) if (inRing(h, x, z) === 1) return false;
  return true;
}

function bbox(poly) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const r of poly.aussen) for (const p of r) {
    if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
    if (p[1] < z0) z0 = p[1]; if (p[1] > z1) z1 = p[1];
  }
  return { x0, x1, z0, z1 };
}

/**
 * Kantenliste mit globalem Index (erst alle Außenringe, dann die Löcher).
 * Kante: { index, ring, hole, a, b, len, dir:[dx,dz] (Einheit), out:[nx,nz] (Einheitsnormale, vom Material weg) }
 */
function edges(poly) {
  const p = normalize(poly);
  const list = [];
  const addRing = (ring, hole, ringIdx) => {
    const s = Math.sign(signedArea(ring)) || 1;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      const dx = b[0] - a[0], dz = b[1] - a[1];
      const len = Math.hypot(dx, dz);
      if (len < EPS) continue;
      const ux = dx / len, uz = dz / len;
      // Außenring mit positivem Schuhband: Innenseite links (-uz, ux), Außen rechts (uz, -ux)
      let out = s > 0 ? [uz, -ux] : [-uz, ux];
      if (hole) out = [-out[0], -out[1]];
      list.push({ index: list.length, ring: ringIdx, hole, a, b, len, dir: [ux, uz], out });
    }
  };
  p.aussen.forEach((r, i) => addRing(r, false, i));
  p.loecher.forEach((r, i) => addRing(r, true, p.aussen.length + i));
  return list;
}

/**
 * Lage eines Punkts zur Kante: t = Abstand entlang (ungeklemmt), s = Querabstand (positiv = außen),
 * d = Abstand zum Segment (geklemmt).
 */
function relToEdge(e, x, z) {
  const px = x - e.a[0], pz = z - e.a[1];
  const t = px * e.dir[0] + pz * e.dir[1];
  const s = px * e.out[0] + pz * e.out[1];
  const tc = Math.max(0, Math.min(e.len, t));
  const d = Math.hypot(px - tc * e.dir[0], pz - tc * e.dir[1]);
  return { t, s, d };
}

// Nächste Kante (optional gefiltert); bei Gleichstand die kleinere Kantennummer
function nearestEdge(list, x, z, filter) {
  let best = null, bd = Infinity;
  for (const e of list) {
    if (filter && !filter(e)) continue;
    const r = relToEdge(e, x, z);
    if (r.d < bd - 1e-9) { bd = r.d; best = { edge: e, ...r }; }
  }
  return best;
}

/** Alle ganzzahligen Zellen im Polygon, sortiert nach x, dann z. */
function cellsOf(poly) {
  const p = normalize(poly);
  const b = bbox(p);
  const out = [];
  for (let x = Math.ceil(b.x0); x <= Math.floor(b.x1); x++) {
    for (let z = Math.ceil(b.z0); z <= Math.floor(b.z1); z++) {
      if (contains(p, x, z)) out.push([x, z]);
    }
  }
  return out;
}

/**
 * Zellen im Band einer Kante: Projektion 0..len auf die Kante und Tiefe nach innen im Intervall [0, width).
 * cells: Iterable von [x, z] (z. B. cellsOf). Rückgabe: Array von [x, z, t, tiefe].
 */
function edgeBand(edge, cells, width) {
  const out = [];
  for (const c of cells) {
    const r = relToEdge(edge, c[0], c[1]);
    const depth = -r.s;
    if (r.t >= -EPS && r.t <= edge.len + EPS && depth >= -EPS && depth < width) out.push([c[0], c[1], r.t, depth]);
  }
  return out;
}

module.exports = { ck, ckX, ckZ, cleanRing, normalize, signedArea, area, inRing, contains, bbox, edges, relToEdge,
  nearestEdge, cellsOf, edgeBand };
