'use strict';
/**
 * Geländezugriff im Modellsystem. Liest data/stadt/gelaende.json + gelaende.bin einmal und cached.
 * Format der .bin: Int16 (Dezimeter ü. NN), Zeile = z, Spalte = x, je Zeile x-Differenzen, zlib-komprimiert.
 * groundTopY(x,z) = 64 + round(2 · (h − H0)): Y der obersten Bodenzelle (Domplatz-Pflaster = 64).
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DEFAULT_DIR = path.join(__dirname, '..', '..', 'data', 'stadt');
let cache = null;

function load(dir) {
  const d = dir || DEFAULT_DIR;
  if (cache && cache.dir === d) return cache;
  const meta = JSON.parse(fs.readFileSync(path.join(d, 'gelaende.json'), 'utf8'));
  const { x0, x1, z0, z1 } = meta.grenzen;
  const W = x1 - x0 + 1, H = z1 - z0 + 1;
  const raw = zlib.inflateSync(fs.readFileSync(path.join(d, 'gelaende.bin')));
  const diff = new Int16Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length));
  if (diff.length !== W * H) throw new Error('gelaende.bin: falsche Größe');
  const dm = new Int16Array(W * H);
  for (let r = 0; r < H; r++) {
    let prev = 0;
    for (let c = 0; c < W; c++) { prev = (prev + diff[r * W + c]) << 16 >> 16; dm[r * W + c] = prev; }
  }
  cache = { dir: d, meta, x0, x1, z0, z1, W, H, dm, h0: meta.referenzhoehe.h0 };
  return cache;
}

function reset() { cache = null; }
function bounds(dir) { const g = load(dir); return { x0: g.x0, x1: g.x1, z0: g.z0, z1: g.z1 }; }

/** Geländehöhe in m ü. NN am Punkt (x,z) (bilinear, außerhalb auf den Rand geklemmt). */
function heightM(x, z) {
  const g = load();
  const fx = Math.min(g.x1 - 1e-9, Math.max(g.x0, x)) - g.x0, fz = Math.min(g.z1 - 1e-9, Math.max(g.z0, z)) - g.z0;
  const c = Math.floor(fx), r = Math.floor(fz), tx = fx - c, tz = fz - r;
  const i = r * g.W + c;
  const c1 = c + 1 < g.W ? 1 : 0, r1 = r + 1 < g.H ? g.W : 0;
  const v = (g.dm[i] * (1 - tx) + g.dm[i + c1] * tx) * (1 - tz) + (g.dm[i + r1] * (1 - tx) + g.dm[i + r1 + c1] * tx) * tz;
  return v / 10;
}

/** Y der obersten Bodenzelle an der Zelle (x,z). */
function groundTopY(x, z) {
  const g = load();
  return 64 + Math.round(2 * (heightM(Math.round(x), Math.round(z)) - g.h0));
}

module.exports = { load, reset, bounds, heightM, groundTopY };
