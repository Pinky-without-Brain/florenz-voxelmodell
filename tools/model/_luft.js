'use strict';
// Lufträume für Deklarationen (B5, BEGEHBARKEIT §3): Flutfüllung der Luft (6er-Nachbarschaft) ab Startzellen,
// begrenzt auf einen Kasten. Liest das bisher gebaute Grid (ctx.grid.has), schreibt nichts.
//   luftRaum(ctx, { seeds: [[x, y, z]], box: { x0, x1, y0, y1, z0, z1 } }) -> [{ x, y, z }]
// Feste Startzellen werden übersprungen. Grenze gegen Ausreißer: höchstens MAX Zellen.

const MAX = 400000;
const N6 = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

function luftRaum(ctx, { seeds, box }) {
  const { x0, x1, y0, y1, z0, z1 } = box;
  const inBox = (x, y, z) => x >= x0 && x <= x1 && y >= y0 && y <= y1 && z >= z0 && z <= z1;
  const seen = new Set();
  const out = [];
  const stack = [];
  for (const [x, y, z] of seeds) {
    const k = x + ',' + y + ',' + z;
    if (!inBox(x, y, z) || ctx.grid.has(x, y, z) || seen.has(k)) continue;
    seen.add(k);
    stack.push([x, y, z]);
  }
  while (stack.length) {
    const [x, y, z] = stack.pop();
    out.push({ x, y, z });
    if (out.length > MAX) throw new Error(`luftRaum: mehr als ${MAX} Zellen (Kasten undicht?)`);
    for (const [dx, dy, dz] of N6) {
      const nx = x + dx, ny = y + dy, nz = z + dz;
      if (!inBox(nx, ny, nz)) continue;
      const k = nx + ',' + ny + ',' + nz;
      if (seen.has(k) || ctx.grid.has(nx, ny, nz)) continue;
      seen.add(k);
      stack.push([nx, ny, nz]);
    }
  }
  return out;
}

module.exports = { luftRaum };
