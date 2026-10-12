'use strict';
// Baut das Geländeraster im Modellsystem aus dem DTM (ETRS89 / UTM 32N).
const zlib = require('zlib');
const frame = require('../spec/frame.js');
const utm = require('../geo/utm.js');
const dtm = require('./dtm.js');
const { footprint } = require('../model/m0_fundament.js');

const BBOX = { latMin: 43.7615, latMax: 43.7795, lonMin: 11.2380, lonMax: 11.2670 };
const FLOOR_Y = 64;          // Domplatz-Pflaster (Fußboden) liegt bei Y 64
const Y_PER_M = 2;           // 1 Block = 0,5 m
const LATTICE = 8;           // exakte Projektion alle 8 Blöcke, dazwischen bilinear (Fehler << 1 mm)
const CHUNK = 16;

/** Grenzen: gemessene Bbox im Modellsystem + 16 Blöcke Rand, auf Chunk-Grenzen. */
function modelBounds() {
  const cs = [[BBOX.latMin, BBOX.lonMin], [BBOX.latMin, BBOX.lonMax], [BBOX.latMax, BBOX.lonMin], [BBOX.latMax, BBOX.lonMax]]
    .map(([a, b]) => frame.latLonToBlock(a, b));
  const m = 16;
  const x0 = Math.floor((Math.min(...cs.map((c) => c.x)) - m) / CHUNK) * CHUNK;
  const x1 = Math.ceil((Math.max(...cs.map((c) => c.x)) + m) / CHUNK) * CHUNK - 1;
  const z0 = Math.floor((Math.min(...cs.map((c) => c.z)) - m) / CHUNK) * CHUNK;
  const z1 = Math.ceil((Math.max(...cs.map((c) => c.z)) + m) / CHUNK) * CHUNK - 1;
  return { x0, x1, z0, z1 };
}

function utmOf(x, z) {
  const ll = frame.blockToLatLon(x, z);
  return utm.latLonToUtm(ll.lat, ll.lon);
}

function fillNoData(g, W, H) {
  let missing = 0;
  for (let i = 0; i < g.length; i++) if (Number.isNaN(g[i])) missing++;
  const initial = missing;
  let passes = 0;
  while (missing > 0 && passes < 400) {
    const upd = [];
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) {
      const i = r * W + c;
      if (!Number.isNaN(g[i])) continue;
      let s = 0, k = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        if (!dr && !dc) continue;
        const rr = r + dr, cc = c + dc;
        if (rr < 0 || cc < 0 || rr >= H || cc >= W) continue;
        const v = g[rr * W + cc];
        if (!Number.isNaN(v)) { s += v; k++; }
      }
      if (k) upd.push(i, s / k);
    }
    if (!upd.length) break;
    for (let u = 0; u < upd.length; u += 2) g[upd[u]] = upd[u + 1];
    missing -= upd.length / 2;
    passes++;
  }
  return { initial, remaining: missing, passes };
}

function median(arr) {
  const a = Float64Array.from(arr).sort();
  const n = a.length;
  return n ? (n % 2 ? a[(n - 1) / 2] : (a[n / 2 - 1] + a[n / 2]) / 2) : NaN;
}

/** Referenzhöhe H0: Mittel des DTM auf dem Ring 5..25 Blöcke außerhalb der Fundament-Grundfläche. */
function referenceHeight(sampleH) {
  const R0 = 5, R1 = 25;
  const X0 = -260, X1 = 200, Z0 = -140, Z1 = 140;
  const w = X1 - X0 + 1, h = Z1 - Z0 + 1;
  const mask = new Uint8Array(w * h);
  for (let x = X0; x <= X1; x++) for (let z = Z0; z <= Z1; z++) if (footprint(x, z)) mask[(z - Z0) * w + (x - X0)] = 1;
  const off = [];
  for (let dx = -R1; dx <= R1; dx++) for (let dz = -R1; dz <= R1; dz++) {
    const d = Math.hypot(dx, dz);
    if (d <= R1) off.push([dx, dz, d]);
  }
  let sum = 0, n = 0;
  const ring = [];
  for (let x = X0 + R1; x <= X1 - R1; x++) for (let z = Z0 + R1; z <= Z1 - R1; z++) {
    if (mask[(z - Z0) * w + (x - X0)]) continue;
    let dmin = Infinity;
    for (const [dx, dz, d] of off) if (d < dmin && mask[(z + dz - Z0) * w + (x + dx - X0)]) dmin = d;
    if (dmin >= R0 && dmin <= R1) { sum += sampleH(x, z); n++; ring.push([x, z]); }
  }
  return { h0: sum / n, cells: n, ring };
}

function yOf(h, h0) { return FLOOR_Y + Math.round(Y_PER_M * (h - h0)); }

function buildTerrain(dtmDir) {
  const b = modelBounds();
  const W = b.x1 - b.x0 + 1, H = b.z1 - b.z0 + 1;
  // UTM-Fenster
  const cs = [[b.x0, b.z0], [b.x1, b.z0], [b.x0, b.z1], [b.x1, b.z1]].map(([x, z]) => utmOf(x, z));
  const e0 = Math.min(...cs.map((c) => c.e)) - 5, e1 = Math.max(...cs.map((c) => c.e)) + 5;
  const n0 = Math.min(...cs.map((c) => c.n)) - 5, n1 = Math.max(...cs.map((c) => c.n)) + 5;
  const win = dtm.loadWindow(dtmDir, e0, e1, n0, n1);
  const fill = fillNoData(win.g, win.W, win.H);
  const g = win.g;
  const sampleUtm = (E, N) => {
    const fx = E - win.gx0 - 0.5, fy = N - win.gy0 - 0.5;
    let c = Math.floor(fx), r = Math.floor(fy);
    let tx = fx - c, ty = fy - r;
    if (c < 0) { c = 0; tx = 0; }
    if (r < 0) { r = 0; ty = 0; }
    if (c >= win.W - 1) { c = win.W - 2; tx = 1; }
    if (r >= win.H - 1) { r = win.H - 2; ty = 1; }
    const i = r * win.W + c;
    return (g[i] * (1 - tx) + g[i + 1] * tx) * (1 - ty) + (g[i + win.W] * (1 - tx) + g[i + win.W + 1] * tx) * ty;
  };
  // Gitter der exakten Projektion
  const GW = Math.ceil(W / LATTICE) + 1, GH = Math.ceil(H / LATTICE) + 1;
  const LE = new Float64Array(GW * GH), LN = new Float64Array(GW * GH);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const p = utmOf(b.x0 + i * LATTICE, b.z0 + j * LATTICE);
    LE[j * GW + i] = p.e; LN[j * GW + i] = p.n;
  }
  const utmAt = (x, z) => {
    const fx = (x - b.x0) / LATTICE, fz = (z - b.z0) / LATTICE;
    const i = Math.min(GW - 2, Math.max(0, Math.floor(fx))), j = Math.min(GH - 2, Math.max(0, Math.floor(fz)));
    const tx = fx - i, tz = fz - j;
    const k = j * GW + i;
    const bl = (A) => (A[k] * (1 - tx) + A[k + 1] * tx) * (1 - tz) + (A[k + GW] * (1 - tx) + A[k + GW + 1] * tx) * tz;
    return [bl(LE), bl(LN)];
  };
  const sampleH = (x, z) => { const [E, N] = utmAt(x, z); return sampleUtm(E, N); };

  const dm = new Int16Array(W * H);
  for (let z = b.z0; z <= b.z1; z++) {
    const row = (z - b.z0) * W;
    for (let x = b.x0; x <= b.x1; x++) dm[row + x - b.x0] = Math.round(sampleH(x, z) * 10);
  }
  const ref = referenceHeight(sampleH);
  return { bounds: b, W, H, dm, h0: ref.h0, h0Cells: ref.cells, ring: ref.ring, fill, tiles: win.tiles, utmWindow: { e0, e1, n0, n1 } };
}

/** Int16 (Zeile = z, Spalte = x) → x-Differenzen → zlib (deterministisch). */
function encodeBin(dm, W, H) {
  const d = new Int16Array(dm.length);
  for (let r = 0; r < H; r++) {
    let prev = 0;
    for (let c = 0; c < W; c++) { const v = dm[r * W + c]; d[r * W + c] = (v - prev) << 16 >> 16; prev = v; }
  }
  const raw = Buffer.from(d.buffer, d.byteOffset, d.byteLength);
  return zlib.deflateSync(raw, { level: 6 });
}

function decodeBin(buf, W, H) {
  const raw = zlib.inflateSync(buf);
  const d = new Int16Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length));
  const dm = new Int16Array(W * H);
  for (let r = 0; r < H; r++) {
    let prev = 0;
    for (let c = 0; c < W; c++) { prev = (prev + d[r * W + c]) << 16 >> 16; dm[r * W + c] = prev; }
  }
  return dm;
}

module.exports = { BBOX, FLOOR_Y, Y_PER_M, modelBounds, buildTerrain, encodeBin, decodeBin, yOf, median, utmOf };
