'use strict';
// R4: Gesamtmodell = eine mit dem Gelände verbundene Komponente.
const { fmt, unpack, forNeighbors, capped, result } = require('./util.js');

module.exports = function r4(ctx) {
  const hasGroundContact = ctx.ground.hasGroundContact;
  const grid = ctx.grid;
  const all = grid.keysOf();
  const seen = new Set();
  const stack = [];
  for (const k of all) {
    const c = unpack(k);
    if (hasGroundContact(c.x, c.y, c.z)) { seen.add(k); stack.push(k); }
  }
  const flood = () => {
    while (stack.length) {
      forNeighbors(stack.pop(), (n) => {
        if (!seen.has(n) && grid.hasKey(n)) { seen.add(n); stack.push(n); }
      });
    }
  };
  flood();
  const errors = [];
  let islands = 0;
  let loose = 0;
  for (const k of all) {
    if (seen.has(k)) continue;
    // neue getrennte Komponente
    const before = seen.size;
    seen.add(k); stack.push(k); flood();
    const size = seen.size - before;
    loose += size;
    islands++;
    if (islands <= 20) errors.push(`R4 getrennter Teil mit ${size} Blöcken, z. B. ${fmt(k)}`);
  }
  if (islands) errors.push(`R4 gesamt: ${loose} Blöcke in ${islands} Teilen ohne Verbindung zum Gelände`);
  return result('R4', errors, [], { total: loose, islands });
};
