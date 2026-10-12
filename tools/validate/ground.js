'use strict';
// Boden-Provider für R3/R4 (ARCHITEKTUR §10). Ein Projekt liefert entweder
//   hasGroundContact(x, y, z)  – volle Kontrolle (Dom), oder
//   groundTopY(x, z)           – Standardschnittstelle, optional mit isHollow(x, y, z) und minY/maxY.
// Standardregel bei groundTopY: Kontakt, wenn y == top + 1, oder wenn y <= top und die Zelle darunter
// (x, y−1, z) im Geländesinne nicht leer ist, also nicht ausgehoben (isHollow). Unter y = 0 gilt Fels als nicht leer.
// Ohne ground.js eines Projekts gilt groundTopY = 63.

const { LEVELS } = require('../spec/dimensions.js');

const FALLBACK_GROUND_TOP_Y = 63;

function fromGroundTopY(spec) {
  const top = spec.groundTopY;
  const hollow = typeof spec.isHollow === 'function' ? spec.isHollow : () => false;
  return function hasGroundContact(x, y, z) {
    const t = top(x, z);
    if (y === t + 1) return true;
    if (y > t) return false;
    return y - 1 < 0 || !hollow(x, y - 1, z);
  };
}

/**
 * Baut aus einem Boden-Modul (oder null) den Provider { hasGroundContact, minY, maxY }.
 * minY/maxY begrenzen R6 und sind optional im Modul; Vorgabe: LEVELS.foundationBottomY..maxY.
 */
function makeProvider(spec) {
  const s = spec || { groundTopY: () => FALLBACK_GROUND_TOP_Y };
  let fn;
  if (typeof s.hasGroundContact === 'function') fn = s.hasGroundContact;
  else if (typeof s.groundTopY === 'function') fn = fromGroundTopY(s);
  else throw new TypeError('Boden-Modul muss hasGroundContact(x,y,z) oder groundTopY(x,z) exportieren');
  return {
    hasGroundContact: fn,
    groundTopY: typeof s.groundTopY === 'function' ? s.groundTopY : null,
    minY: Number.isInteger(s.minY) ? s.minY : LEVELS.foundationBottomY,
    maxY: Number.isInteger(s.maxY) ? s.maxY : LEVELS.maxY
  };
}

// Rückwärtskompatibel: Dom-Logik (V2-Signatur)
function hasGroundContact(x, y, z, reserved) {
  return require('../spec/ground_duomo.js').hasGroundContact(x, y, z, reserved);
}

module.exports = { makeProvider, fromGroundTopY, hasGroundContact, FALLBACK_GROUND_TOP_Y };
