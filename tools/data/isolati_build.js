'use strict';
// Isolati: Gebäude, die sich berühren oder höchstens 1 Block Abstand haben, bilden einen Block (Union-Find).
const g2 = require('./geom2d.js');

const GAP = 1;      // Blöcke
const CELL = 8;     // Raster für Kandidatensuche (Blöcke)

function buildIsolati(buildings) {
  const n = buildings.length;
  const parent = Int32Array.from({ length: n }, (_, i) => i);
  const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  const union = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[Math.max(a, b)] = Math.min(a, b); };

  const grid = new Map();
  const key = (cx, cz) => cx * 100003 + cz;
  const polys = buildings.map((b) => b.polygon);
  buildings.forEach((b, i) => {
    const bb = b._bb;
    for (let cx = Math.floor((bb.x0 - GAP) / CELL); cx <= Math.floor((bb.x1 + GAP) / CELL); cx++) {
      for (let cz = Math.floor((bb.z0 - GAP) / CELL); cz <= Math.floor((bb.z1 + GAP) / CELL); cz++) {
        const k = key(cx, cz);
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(i);
      }
    }
  });
  const tested = new Set();
  let pairs = 0;
  for (const list of grid.values()) {
    for (let a = 0; a < list.length; a++) for (let b = a + 1; b < list.length; b++) {
      const i = list[a], j = list[b];
      const pk = i * n + j;
      if (tested.has(pk)) continue;
      tested.add(pk);
      if (find(i) === find(j)) continue;
      const A = buildings[i]._bb, B = buildings[j]._bb;
      if (A.x1 + GAP < B.x0 || B.x1 + GAP < A.x0 || A.z1 + GAP < B.z0 || B.z1 + GAP < A.z0) continue;
      pairs++;
      if (g2.polysWithin(polys[i], polys[j], GAP)) union(i, j);
    }
  }
  const groups = new Map();
  for (let i = 0; i < n; i++) {
    const r = find(i);
    if (!groups.has(r)) groups.set(r, []);
    groups.get(r).push(i);
  }
  const list = [];
  for (const idx of groups.values()) {
    const pts = [];
    let bebaut = 0;
    for (const i of idx) {
      for (const r of buildings[i].polygon.aussen) for (const p of r) pts.push(p);
      bebaut += buildings[i].flaecheBl;
    }
    const hull = g2.convexHull(pts);
    const area = hull.length >= 3 ? Math.abs(g2.signedArea(hull)) : 0;
    const c = hull.length >= 3 ? g2.centroidRing(hull) : hull[0];
    list.push({ idx, hull, area, bebaut, c });
  }
  list.sort((a, b) => a.c[0] - b.c[0] || a.c[1] - b.c[1] || a.idx[0] - b.idx[0]);
  const isolati = list.map((l, k) => {
    const id = 'I' + String(k + 1).padStart(4, '0');
    for (const i of l.idx) buildings[i].isolato = id;
    return {
      id,
      gebaeude: l.idx.map((i) => buildings[i].id),
      huelle: l.hull,
      flaecheBl: Math.round(l.area * 4) / 4,
      bebautBl: Math.round(l.bebaut * 4) / 4,
      schwerpunkt: [Math.round(l.c[0] * 2) / 2, Math.round(l.c[1] * 2) / 2]
    };
  });
  const counts = isolati.map((i) => i.gebaeude.length).sort((a, b) => a - b);
  const stats = {
    anzahl: isolati.length,
    gebaeudeJeIsolato: { min: counts[0], median: counts[counts.length >> 1], max: counts[counts.length - 1] },
    gepruefteNachbarpaare: pairs
  };
  return { isolati, stats };
}

module.exports = { buildIsolati, GAP };
