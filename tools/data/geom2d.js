'use strict';
// 2D-Geometrie für die Stadtdaten (Modellkoordinaten x, z; Blöcke).
const frame = require('../spec/frame.js');

const round05 = (v) => Math.round(v * 2) / 2;

/** [{lat,lon}] → [[x,z]] (kontinuierlich). */
function toModel(geom) {
  return geom.map((p) => { const b = frame.latLonToBlock(p.lat, p.lon); return [b.x, b.z]; });
}

/** Vorzeichenbehaftete Fläche (Schnürsenkelformel in x,z). */
function signedArea(r) {
  let s = 0;
  for (let i = 0, n = r.length; i < n; i++) {
    const a = r[i], b = r[(i + 1) % n];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return s / 2;
}

/** Rundet auf 0,5, entfernt Doppelpunkte und den Schlusspunkt. Gibt null bei Entartung zurück. */
function cleanRing(ring) {
  const out = [];
  for (const p of ring) {
    const q = [round05(p[0]), round05(p[1])];
    const last = out[out.length - 1];
    if (!last || last[0] !== q[0] || last[1] !== q[1]) out.push(q);
  }
  while (out.length > 1 && out[0][0] === out[out.length - 1][0] && out[0][1] === out[out.length - 1][1]) out.pop();
  if (out.length < 3 || signedArea(out) === 0) return null;
  return out;
}

function orient(ring, positive) {
  return (signedArea(ring) > 0) === positive ? ring : ring.slice().reverse();
}

function bbox(rings) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const r of rings) for (const p of r) {
    if (p[0] < x0) x0 = p[0];
    if (p[0] > x1) x1 = p[0];
    if (p[1] < z0) z0 = p[1];
    if (p[1] > z1) z1 = p[1];
  }
  return { x0, x1, z0, z1 };
}

function pointInRing(x, z, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

/** Punkt in Polygon mit Löchern (gerade-ungerade). */
function pointInPoly(x, z, poly) {
  let inside = false;
  for (const r of poly.aussen) if (pointInRing(x, z, r)) inside = !inside;
  for (const r of poly.loecher) if (pointInRing(x, z, r)) inside = !inside;
  return inside;
}

function polyArea(poly) {
  let a = 0;
  for (const r of poly.aussen) a += Math.abs(signedArea(r));
  for (const r of poly.loecher) a -= Math.abs(signedArea(r));
  return a;
}

function centroidRing(r) {
  let a = 0, cx = 0, cz = 0;
  for (let i = 0, n = r.length; i < n; i++) {
    const p = r[i], q = r[(i + 1) % n];
    const c = p[0] * q[1] - q[0] * p[1];
    a += c; cx += (p[0] + q[0]) * c; cz += (p[1] + q[1]) * c;
  }
  if (a === 0) return [r[0][0], r[0][1]];
  return [cx / (3 * a), cz / (3 * a)];
}

/** Konvexe Hülle (Andrew), gegen den Uhrzeigersinn im (x,z)-System mit positiver Fläche. */
function convexHull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const uniq = pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]);
  if (uniq.length < 3) return uniq;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of uniq) { while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop(); lower.push(p); }
  const upper = [];
  for (let i = uniq.length - 1; i >= 0; i--) { const p = uniq[i]; while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop(); upper.push(p); }
  lower.pop(); upper.pop();
  return lower.concat(upper);
}

function segSegIntersect(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const o1 = o(a, b, c), o2 = o(a, b, d), o3 = o(c, d, a), o4 = o(c, d, b);
  return ((o1 > 0) !== (o2 > 0) && o1 !== 0 && o2 !== 0) && ((o3 > 0) !== (o4 > 0) && o3 !== 0 && o4 !== 0);
}

function pointSegDist2(p, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const l2 = dx * dx + dz * dz;
  let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  const qx = a[0] + t * dx - p[0], qz = a[1] + t * dz - p[1];
  return qx * qx + qz * qz;
}

/** Haben zwei Ringsätze Abstand <= d (oder schneiden/überdecken sich)? */
function polysWithin(A, B, d) {
  const d2 = d * d;
  const ra = A.aussen.concat(A.loecher), rb = B.aussen.concat(B.loecher);
  for (const r of ra) for (const s of rb) {
    for (let i = 0, n = r.length; i < n; i++) {
      const a = r[i], b = r[(i + 1) % n];
      for (let j = 0, m = s.length; j < m; j++) {
        const c = s[j], e = s[(j + 1) % m];
        if (segSegIntersect(a, b, c, e)) return true;
        if (pointSegDist2(a, c, e) <= d2 || pointSegDist2(b, c, e) <= d2 ||
            pointSegDist2(c, a, b) <= d2 || pointSegDist2(e, a, b) <= d2) return true;
      }
    }
  }
  // vollständig ineinander
  if (pointInPoly(A.aussen[0][0][0], A.aussen[0][0][1], B)) return true;
  if (pointInPoly(B.aussen[0][0][0], B.aussen[0][0][1], A)) return true;
  return false;
}

/** Puffert eine Linie zu einem Ring (Gehrung begrenzt auf 2·Halbbreite). */
function bufferLine(pts, half) {
  // Doppelpunkte entfernen
  const p = [];
  for (const q of pts) { const l = p[p.length - 1]; if (!l || l[0] !== q[0] || l[1] !== q[1]) p.push(q); }
  if (p.length < 2) return null;
  const closed = p.length > 2 && p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1];
  if (closed) p.pop();
  const n = p.length;
  const dirs = [];
  const segCount = closed ? n : n - 1;
  for (let i = 0; i < segCount; i++) {
    const a = p[i], b = p[(i + 1) % n];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    dirs.push([(b[0] - a[0]) / l, (b[1] - a[1]) / l]);
  }
  const side = (sign) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      let dPrev = closed ? dirs[(i - 1 + segCount) % segCount] : (i > 0 ? dirs[i - 1] : null);
      let dNext = closed ? dirs[i % segCount] : (i < segCount ? dirs[i] : null);
      const d0 = dPrev || dNext, d1 = dNext || dPrev;
      const n0 = [-d0[1] * sign, d0[0] * sign], n1 = [-d1[1] * sign, d1[0] * sign];
      let mx = n0[0] + n1[0], mz = n0[1] + n1[1];
      const ml = Math.hypot(mx, mz);
      if (ml < 1e-9) { out.push([p[i][0] + n0[0] * half, p[i][1] + n0[1] * half]); continue; }
      mx /= ml; mz /= ml;
      let k = 1 / Math.max(0.5, mx * n0[0] + mz * n0[1]); // Gehrungsfaktor, <= 2
      out.push([p[i][0] + mx * half * k, p[i][1] + mz * half * k]);
    }
    return out;
  };
  const left = side(1), right = side(-1);
  if (closed) return { aussen: [left], loecher: [right] };
  return { aussen: [left.concat(right.reverse())], loecher: [] };
}

/** Fügt Linienstücke eines Multipolygons zu geschlossenen Ringen zusammen. */
function joinRings(ways) {
  const key = (p) => p.lat + ',' + p.lon;
  const pool = ways.filter((w) => w.length >= 2).map((w) => w.slice());
  const rings = [];
  let open = 0;
  while (pool.length) {
    let cur = pool.shift();
    let grew = true;
    while (grew && key(cur[0]) !== key(cur[cur.length - 1])) {
      grew = false;
      const end = key(cur[cur.length - 1]);
      for (let i = 0; i < pool.length; i++) {
        const w = pool[i];
        if (key(w[0]) === end) { cur = cur.concat(w.slice(1)); pool.splice(i, 1); grew = true; break; }
        if (key(w[w.length - 1]) === end) { cur = cur.concat(w.slice().reverse().slice(1)); pool.splice(i, 1); grew = true; break; }
      }
    }
    if (key(cur[0]) === key(cur[cur.length - 1]) && cur.length >= 4) rings.push(cur);
    else open++;
  }
  return { rings, open };
}

/**
 * Relation (members mit geometry) → { polys: [{aussen:[ring], loecher:[ring...]}], offen }.
 * Ringe in Modellkoordinaten, gerundet, außen positiv, innen negativ orientiert.
 */
function assembleMultipolygon(members) {
  const wayGeoms = (role) => members.filter((m) => m.type === 'way' && m.geometry && (m.role || 'outer') === role).map((m) => m.geometry);
  const o = joinRings(wayGeoms('outer'));
  const inn = joinRings(wayGeoms('inner'));
  const toRing = (r, pos) => { const c = cleanRing(toModel(r)); return c ? orient(c, pos) : null; };
  const outers = o.rings.map((r) => toRing(r, true)).filter(Boolean).map((r) => ({ aussen: [r], loecher: [], area: Math.abs(signedArea(r)) }));
  const holes = inn.rings.map((r) => toRing(r, false)).filter(Boolean);
  outers.sort((a, b) => b.area - a.area);
  for (const h of holes) {
    const pt = h[0];
    let best = null;
    for (const op of outers) if (pointInRing(pt[0], pt[1], op.aussen[0]) && (!best || op.area < best.area)) best = op;
    if (best) best.loecher.push(h);
  }
  return { polys: outers.map((p) => ({ aussen: p.aussen, loecher: p.loecher })), offen: o.open + inn.open };
}

/** Zeilenweise Rasterung (Zellmittelpunkte ganzzahlig, gerade-ungerade) → cb(z, xStart, xEndExklusiv). */
function scanPoly(poly, cb) {
  const rings = poly.aussen.concat(poly.loecher);
  const bb = bbox(rings);
  const zStart = Math.ceil(bb.z0), zEnd = Math.floor(bb.z1);
  for (let z = zStart; z <= zEnd; z++) {
    const xs = [];
    for (const r of rings) {
      for (let i = 0, n = r.length; i < n; i++) {
        const a = r[i], b = r[(i + 1) % n];
        if ((a[1] <= z) !== (b[1] <= z)) xs.push(a[0] + (z - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.ceil(xs[k]), xb = Math.ceil(xs[k + 1]);
      if (xb > xa) cb(z, xa, xb);
    }
  }
}

module.exports = {
  round05, toModel, signedArea, cleanRing, orient, bbox, pointInRing, pointInPoly, polyArea,
  centroidRing, convexHull, polysWithin, bufferLine, joinRings, assembleMultipolygon, scanPoly
};
