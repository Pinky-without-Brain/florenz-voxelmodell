'use strict';
// Gemeinsame Hilfen der Prüfregeln.

const MAX_EXAMPLES = 20;

const { unpackKey, xOfKey, yOfKey, zOfKey, X_MIN, X_MAX, Y_MAX, Z_MIN, Z_MAX, KEY_STEP_X, KEY_STEP_Z } = require('../geom/grid.js');

const unpack = unpackKey;
const fmt = (k) => { const c = unpack(k); return `(${c.x},${c.y},${c.z})`; };

// Ruft fn(nachbarKey) für alle 6 Flächennachbarn innerhalb des Packbereichs.
// Packformel: key = ((x+4096)·8192 + (z+4096))·512 + y -> ±1 in y, ±512 in z, ±4194304 in x
function forNeighbors(key, fn) {
  const y = yOfKey(key);
  const z = zOfKey(key);
  const x = xOfKey(key);
  if (y > 0) fn(key - 1);
  if (y < Y_MAX) fn(key + 1);
  if (z > Z_MIN) fn(key - KEY_STEP_Z);
  if (z < Z_MAX) fn(key + KEY_STEP_Z);
  if (x > X_MIN) fn(key - KEY_STEP_X);
  if (x < X_MAX) fn(key + KEY_STEP_X);
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
