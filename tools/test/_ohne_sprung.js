'use strict';
// Hilfe für Tests (B3): Erreichbarkeit OHNE Springen. Höhenschritte +1 nur auf einen Treppenblock (nicht von seiner hohen Seite),
// -1 bis -3 als Fallen. Damit lässt sich prüfen, dass eine Treppe wirklich aus Treppenblöcken besteht und ohne Sprung begehbar ist.
const palette = require('../spec/palette.js');

const DIR = { n: [0, -1], o: [1, 0], s: [0, 1], w: [-1, 0] };

/** erreichbar(grid, start {x,y,z}, ziel {x,y,z}, box {x0,x1,z0,z1,y0,y1}) -> true/false; y = Fußzelle (Luft), darunter fester Block. */
function erreichbar(grid, start, ziel, box) {
  const fest = (x, y, z) => grid.has(x, y, z);
  const stehbar = (x, y, z) => !fest(x, y, z) && !fest(x, y + 1, z) && !fest(x, y + 2, z) && fest(x, y - 1, z);
  const key = (x, y, z) => `${x},${y},${z}`;
  const seen = new Set([key(start.x, start.y, start.z)]);
  const queue = [[start.x, start.y, start.z]];
  while (queue.length) {
    const [x, y, z] = queue.pop();
    if (x === ziel.x && y === ziel.y && z === ziel.z) return true;
    for (const [dx, dz] of Object.values(DIR)) {
      const nx = x + dx, nz = z + dz;
      if (nx < box.x0 || nx > box.x1 || nz < box.z0 || nz > box.z1) continue;
      const cand = [];
      if (stehbar(nx, y, nz)) cand.push(y);
      if (stehbar(nx, y + 1, nz)) {
        const t = grid.get(nx, y, nz);
        const info = t && palette.treppeInfo(t.type);
        if (info && !info.oben) {
          const [sx, sz] = DIR[info.dir];
          if (!(sx === -dx && sz === -dz)) cand.push(y + 1);        // nicht von der hohen Seite her
        }
      }
      for (let f = 1; f <= 3; f++) if (stehbar(nx, y - f, nz)) { cand.push(y - f); break; }
      for (const ny of cand) {
        const k = key(nx, ny, nz);
        if (!seen.has(k) && ny >= box.y0 && ny <= box.y1) { seen.add(k); queue.push([nx, ny, nz]); }
      }
    }
  }
  return false;
}

module.exports = { erreichbar };
