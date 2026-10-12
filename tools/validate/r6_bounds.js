'use strict';
// R6: Höhenbereich foundationBottomY..maxY.
const { fmt, capped, result } = require('./util.js');

module.exports = function r6(ctx) {
  const foundationBottomY = ctx.ground.minY, maxY = ctx.ground.maxY;
  const bad = [];
  let n = 0;
  ctx.grid.keysOf((k) => {
    const y = k % 512;
    if (y < foundationBottomY || y > maxY) { n++; if (bad.length < 20) bad.push(k); }
    return false;
  });
  const errors = bad.map((k) => `R6 Block ${fmt(k)} außerhalb Y ${foundationBottomY}..${maxY}`);
  if (n > bad.length) errors.push(`R6 gesamt: ${n} Blöcke außerhalb`);
  return result('R6', capped(errors), [], { total: n });
};
