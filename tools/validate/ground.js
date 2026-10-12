'use strict';
// Geländekontakt (ARCHITEKTUR §7 R3): Gelände reicht bis Y floorY−1, außer in der ausgehobenen Krypta.

const { LEVELS } = require('../spec/dimensions.js');
const { RESERVED } = require('../spec/interfaces.js');

function hasGroundContact(x, y, z, reserved = RESERVED) {
  if (y === LEVELS.foundationBottomY) return true;
  if (y === LEVELS.floorY) return !reserved.some((r) => r.test(x, y - 1, z));
  return false;
}

module.exports = { hasGroundContact };
