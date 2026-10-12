'use strict';
// R8: Symmetrie (order 4: Spiegelungen an X und Z; order 8: volle D4), inklusive Blocktyp.
const { fmt, unpack, capped, result } = require('./util.js');
const { packKey } = require('../geom/grid.js');

function images(dx, dz, order) {
  const out = [[-dx, dz], [dx, -dz], [-dx, -dz]];
  if (order === 8) out.push([dz, dx], [-dz, dx], [dz, -dx], [-dz, -dx]);
  return out;
}

module.exports = function r8(ctx) {
  const errors = [];
  let total = 0;
  for (const mod of ctx.world.modules) {
    for (const part of mod.parts) {
      const sym = part.opts && part.opts.symmetry;
      if (!sym) continue;
      const { order, cx = 0, cz = 0 } = sym;
      if (order !== 4 && order !== 8) {
        errors.push(`R8 Modul ${mod.module}, ${part.id}: ungültige Ordnung ${order}`);
        continue;
      }
      const types = new Map();
      for (const k of part.keys) types.set(k, ctx.grid.typeOfKey(k));
      const bad = [];
      let n = 0;
      for (const k of part.keys) {
        const c = unpack(k);
        const t = types.get(k);
        let ok = true;
        for (const [ix, iz] of images(c.x - cx, c.z - cz, order)) {
          const x = cx + ix, z = cz + iz;
          if (!Number.isInteger(x) || !Number.isInteger(z) || x < -512 || x > 511 || z < -512 || z > 511 ||
              types.get(packKey(x, c.y, z)) !== t) { ok = false; break; }
        }
        if (!ok) { n++; if (bad.length < 5) bad.push(k); }
      }
      if (n) {
        total += n;
        errors.push(`R8 Modul ${mod.module}, ${part.id} (order ${order}, Zentrum ${cx},${cz}): ${n} asymmetrische Blöcke, z. B. ${bad.map(fmt).join(' ')}`);
      }
    }
  }
  return result('R8', capped(errors), [], { total });
};
