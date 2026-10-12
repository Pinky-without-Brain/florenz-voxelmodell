'use strict';
// Reine Generatoren: geben {x,y,z} aus, Bereiche inklusive.

function* box(x0, y0, z0, x1, y1, z1) {
  const xa = Math.min(x0, x1), xb = Math.max(x0, x1);
  const ya = Math.min(y0, y1), yb = Math.max(y0, y1);
  const za = Math.min(z0, z1), zb = Math.max(z0, z1);
  for (let y = ya; y <= yb; y++) {
    for (let x = xa; x <= xb; x++) {
      for (let z = za; z <= zb; z++) yield { x, y, z };
    }
  }
}

function* hollowBox(x0, y0, z0, x1, y1, z1, wall = 1, { top = true, bottom = true } = {}) {
  const xa = Math.min(x0, x1), xb = Math.max(x0, x1);
  const ya = Math.min(y0, y1), yb = Math.max(y0, y1);
  const za = Math.min(z0, z1), zb = Math.max(z0, z1);
  for (let y = ya; y <= yb; y++) {
    const yShell = (top && y > yb - wall) || (bottom && y < ya + wall);
    for (let x = xa; x <= xb; x++) {
      const xShell = x < xa + wall || x > xb - wall;
      for (let z = za; z <= zb; z++) {
        if (yShell || xShell || z < za + wall || z > zb - wall) yield { x, y, z };
      }
    }
  }
}

function inDisk(dx, dz, r) {
  return r >= 0 && dx * dx + dz * dz <= r * r + r;
}

function* disk(cx, cz, r, y) {
  for (let x = cx - r; x <= cx + r; x++) {
    for (let z = cz - r; z <= cz + r; z++) {
      if (inDisk(x - cx, z - cz, r)) yield { x, y, z };
    }
  }
}

function* cylinder(cx, cz, r, y0, y1) {
  const ya = Math.min(y0, y1), yb = Math.max(y0, y1);
  for (let y = ya; y <= yb; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      for (let z = cz - r; z <= cz + r; z++) {
        if (inDisk(x - cx, z - cz, r)) yield { x, y, z };
      }
    }
  }
}

function* cylinderShell(cx, cz, rOuter, rInner, y0, y1) {
  const ya = Math.min(y0, y1), yb = Math.max(y0, y1);
  for (let y = ya; y <= yb; y++) {
    for (let x = cx - rOuter; x <= cx + rOuter; x++) {
      for (let z = cz - rOuter; z <= cz + rOuter; z++) {
        const dx = x - cx, dz = z - cz;
        if (inDisk(dx, dz, rOuter) && !inDisk(dx, dz, rInner)) yield { x, y, z };
      }
    }
  }
}

function inOctagon(dx, dz, a) {
  if (a < 0) return false;
  const ax = Math.abs(dx), az = Math.abs(dz);
  return ax <= a && az <= a && ax + az <= Math.floor(a * Math.SQRT2 + 0.5);
}

function* octagonPrism(cx, cz, a, y0, y1) {
  const ya = Math.min(y0, y1), yb = Math.max(y0, y1);
  for (let y = ya; y <= yb; y++) {
    for (let x = cx - a; x <= cx + a; x++) {
      for (let z = cz - a; z <= cz + a; z++) {
        if (inOctagon(x - cx, z - cz, a)) yield { x, y, z };
      }
    }
  }
}

function* octagonRing(cx, cz, aOuter, aInner, y0, y1) {
  const ya = Math.min(y0, y1), yb = Math.max(y0, y1);
  for (let y = ya; y <= yb; y++) {
    for (let x = cx - aOuter; x <= cx + aOuter; x++) {
      for (let z = cz - aOuter; z <= cz + aOuter; z++) {
        const dx = x - cx, dz = z - cz;
        if (inOctagon(dx, dz, aOuter) && !inOctagon(dx, dz, aInner)) yield { x, y, z };
      }
    }
  }
}

function inSphere(dx, dy, dz, r) {
  return r >= 0 && dx * dx + dy * dy + dz * dz <= r * r + r;
}

function* sphere(cx, cy, cz, r) {
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      for (let z = cz - r; z <= cz + r; z++) {
        if (inSphere(x - cx, y - cy, z - cz, r)) yield { x, y, z };
      }
    }
  }
}

// Punkt (x,z) liegt auf der Strecke p-q
function onSegment(x, z, p, q) {
  const cross = (q[0] - p[0]) * (z - p[1]) - (q[1] - p[1]) * (x - p[0]);
  if (cross !== 0) return false;
  return x >= Math.min(p[0], q[0]) && x <= Math.max(p[0], q[0]) &&
         z >= Math.min(p[1], q[1]) && z <= Math.max(p[1], q[1]);
}

// Even-Odd-Regel, Kantenpunkte zählen dazu
function pointInPolygon(x, z, pts) {
  let inside = false;
  const n = pts.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const p = pts[i], q = pts[j];
    if (onSegment(x, z, p, q)) return true;
    if ((p[1] > z) !== (q[1] > z) &&
        x < ((q[0] - p[0]) * (z - p[1])) / (q[1] - p[1]) + p[0]) {
      inside = !inside;
    }
  }
  return inside;
}

function* polygonPrism(points, y0, y1) {
  const ya = Math.min(y0, y1), yb = Math.max(y0, y1);
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [px, pz] of points) {
    if (px < minX) minX = px;
    if (px > maxX) maxX = px;
    if (pz < minZ) minZ = pz;
    if (pz > maxZ) maxZ = pz;
  }
  minX = Math.floor(minX); maxX = Math.ceil(maxX);
  minZ = Math.floor(minZ); maxZ = Math.ceil(maxZ);
  // Maske einmal berechnen, dann pro Ebene ausgeben
  const mask = [];
  for (let x = minX; x <= maxX; x++) {
    for (let z = minZ; z <= maxZ; z++) {
      if (pointInPolygon(x, z, points)) mask.push([x, z]);
    }
  }
  for (let y = ya; y <= yb; y++) {
    for (const [x, z] of mask) yield { x, y, z };
  }
}

// 3D-Bresenham (26er-Nachbarschaft), a und b inklusive
function* bresenham3d(a, b) {
  const d = [Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[2] - a[2])];
  const s = [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1]), Math.sign(b[2] - a[2])];
  const p = [a[0], a[1], a[2]];
  let m = 0;
  if (d[1] > d[m]) m = 1;
  if (d[2] > d[m]) m = 2;
  const o1 = (m + 1) % 3, o2 = (m + 2) % 3;
  let e1 = 2 * d[o1] - d[m], e2 = 2 * d[o2] - d[m];
  yield [p[0], p[1], p[2]];
  for (let i = 0; i < d[m]; i++) {
    p[m] += s[m];
    if (e1 > 0) { p[o1] += s[o1]; e1 -= 2 * d[m]; }
    if (e2 > 0) { p[o2] += s[o2]; e2 -= 2 * d[m]; }
    e1 += 2 * d[o1];
    e2 += 2 * d[o2];
    yield [p[0], p[1], p[2]];
  }
}

function* line3d(a, b, { faceConnected = false } = {}) {
  let prev = null;
  for (const c of bresenham3d(a, b)) {
    if (faceConnected && prev) {
      // Zwischenzellen echt zwischen prev und c: erst x, dann z, dann y
      const cur = [prev[0], prev[1], prev[2]];
      for (const axis of [0, 2, 1]) {
        while (cur[axis] !== c[axis]) {
          cur[axis] += Math.sign(c[axis] - cur[axis]);
          if (cur[0] !== c[0] || cur[1] !== c[1] || cur[2] !== c[2]) {
            yield { x: cur[0], y: cur[1], z: cur[2] };
          }
        }
      }
    }
    yield { x: c[0], y: c[1], z: c[2] };
    prev = c;
  }
}

function* symmetric(cells, cx, cz, maps) {
  const seen = new Set();
  for (const c of cells) {
    const dx = c.x - cx, dz = c.z - cz;
    for (const f of maps) {
      const [mx, mz] = f(dx, dz);
      const x = cx + mx, z = cz + mz;
      const k = x + ',' + c.y + ',' + z;
      if (seen.has(k)) continue;
      seen.add(k);
      yield { x, y: c.y, z };
    }
  }
}

const MIRROR4 = [
  (x, z) => [x, z], (x, z) => [-x, z], (x, z) => [x, -z], (x, z) => [-x, -z],
];
const DIHEDRAL8 = MIRROR4.concat([
  (x, z) => [z, x], (x, z) => [-z, x], (x, z) => [z, -x], (x, z) => [-z, -x],
]);

function mirror4(cells, cx = 0, cz = 0) { return symmetric(cells, cx, cz, MIRROR4); }
function dihedral8(cells, cx = 0, cz = 0) { return symmetric(cells, cx, cz, DIHEDRAL8); }

module.exports = {
  box, hollowBox, inDisk, disk, cylinder, cylinderShell,
  inOctagon, octagonPrism, octagonRing, inSphere, sphere,
  polygonPrism, line3d, mirror4, dihedral8,
};
