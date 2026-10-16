'use strict';
// Boden-Provider für Stadt-Projekte (ARCHITEKTUR §10): Gelände aus tools/geo/gelaende.js.
// groundTopY(x, z) wird je 16x16-Chunk gecacht (das Raster ist 4800 x 4160). Ein Projekt-ground.js
// exportiert dieses Modul einfach neu: module.exports = require('../../../tools/city/ground_stadt.js');

const geo = require('../geo/gelaende.js');

const CHUNK = 16;
const chunks = new Map();

function chunkOf(cx, cz) {
  const key = cx * 100003 + cz;
  let a = chunks.get(key);
  if (!a) {
    a = new Int16Array(CHUNK * CHUNK);
    for (let i = 0; i < CHUNK; i++) for (let j = 0; j < CHUNK; j++) a[i * CHUNK + j] = geo.groundTopY(cx * CHUNK + i, cz * CHUNK + j);
    chunks.set(key, a);
  }
  return a;
}

/** Y der obersten Bodenzelle an (x, z); Vorgabe-Rundung wie tools/geo/gelaende.js. */
function groundTopY(x, z) {
  // Außerhalb des Rasters: Wert der nächsten Randzelle (Randhäuser der Quartiere ragen teils hinaus)
  const b = geo.bounds();
  if (x < b.x0) x = b.x0; else if (x > b.x1) x = b.x1;
  if (z < b.z0) z = b.z0; else if (z > b.z1) z = b.z1;
  const cx = Math.floor(x / CHUNK), cz = Math.floor(z / CHUNK);
  return chunkOf(cx, cz)[(x - cx * CHUNK) * CHUNK + (z - cz * CHUNK)];
}

/** Liegt die Zelle im Geländeraster? */
function inRaster(x, z) {
  const b = geo.bounds();
  return x >= b.x0 && x <= b.x1 && z >= b.z0 && z <= b.z1;
}

function reset() { chunks.clear(); geo.reset(); }

// Stadtgrund reicht von Y 0 bis zur Obergrenze des Rasters (R6)
module.exports = { groundTopY, inRaster, minY: 0, maxY: 511, reset };
