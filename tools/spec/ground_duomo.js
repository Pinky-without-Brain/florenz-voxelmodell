'use strict';
// Boden-Provider des Doms (ARCHITEKTUR §7 R3): Gelände reicht bis Y floorY−1, außer in der ausgehobenen Krypta.
// Genau die Logik von V2 (vorher in tools/validate/ground.js).

const { LEVELS } = require('./dimensions.js');
const { RESERVED } = require('./interfaces.js');

function hasGroundContact(x, y, z, reserved = RESERVED) {
  if (y === LEVELS.foundationBottomY) return true;
  if (y === LEVELS.floorY) return !reserved.some((r) => r.test(x, y - 1, z));
  return false;
}

module.exports = { hasGroundContact };
