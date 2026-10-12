'use strict';
// Gemeinsame Hilfen der Prüfregeln.

const MAX_EXAMPLES = 20;

const unpack = (k) => ({ x: (k >> 19) - 512, y: k & 511, z: ((k >> 9) & 1023) - 512 });
const fmt = (k) => { const c = unpack(k); return `(${c.x},${c.y},${c.z})`; };

// Ruft fn(nachbarKey) für alle 6 Flächennachbarn innerhalb des Packbereichs.
// Packformel: key = ((x+512)·1024 + (z+512))·512 + y -> ±1 in y, ±512 in z, ±524288 in x
function forNeighbors(key, fn) {
  const y = key & 511;
  const z = (key >> 9) & 1023;
  const x = key >> 19;
  if (y > 0) fn(key - 1);
  if (y < 511) fn(key + 1);
  if (z > 0) fn(key - 512);
  if (z < 1023) fn(key + 512);
  if (x > 0) fn(key - 524288);
  if (x < 1023) fn(key + 524288);
}

// Fehlerliste, die nach MAX_EXAMPLES Zeilen mit einer Restzeile abschließt.
function capped(lines, max = MAX_EXAMPLES) {
  if (lines.length <= max) return lines;
  return lines.slice(0, max).concat(`… und ${lines.length - max} weitere`);
}

function result(rule, errors, warnings, extra) {
  return { rule, errors, warnings, ...extra };
}

module.exports = { MAX_EXAMPLES, unpack, fmt, forNeighbors, capped, result };
