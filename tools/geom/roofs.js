'use strict';
// Dachformen als Generatoren. Kern ist surface(): Höhenfeld mit Dichtung zu niedrigeren Nachbarn.
const { rho } = require('./vaults');

const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// columns: Iterable von [x, z]; height(x, z) -> Zahl. Ausgabe x, dann z, dann y aufsteigend.
// overlap = 1 (Standard): Säule reicht bis top_n des niedrigeren Nachbarn (flächig verbunden);
// overlap = 0: nur bis top_n + 1 (dicht, aber Kontakt nur über Kanten).
function* surface({ columns, height, thickness = 1, overlap = 1 }) {
  const cols = [...columns].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  const tops = new Map();
  for (const [x, z] of cols) tops.set(x + ',' + z, Math.floor(height(x, z)));
  for (const [x, z] of cols) {
    const top = tops.get(x + ',' + z);
    let yLo = top - thickness + 1;
    for (const [dx, dz] of NB) {
      const t = tops.get((x + dx) + ',' + (z + dz));
      if (t !== undefined && t < top) yLo = Math.min(yLo, t + 1 - overlap);
    }
    for (let y = yLo; y <= top; y++) yield { x, y, z };
  }
}

function rectColumns(x0, x1, z0, z1) {
  const out = [];
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) out.push([x, z]);
  return out;
}

function* gableRoof({ x0, x1, z0, z1, ridgeAxis, eaveY, ridgeY, thickness = 1 }) {
  if (ridgeAxis !== 'x' && ridgeAxis !== 'z') throw new RangeError(`ridgeAxis muss 'x' oder 'z' sein: ${ridgeAxis}`);
  const [c0, c1] = ridgeAxis === 'x' ? [z0, z1] : [x0, x1];
  const mid = (c0 + c1) / 2;
  const hw = (c1 - c0) / 2; // (Breite − 1)/2
  const height = (x, z) => {
    const d = Math.abs((ridgeAxis === 'x' ? z : x) - mid);
    return hw === 0 ? ridgeY : ridgeY - (ridgeY - eaveY) * d / hw;
  };
  yield* surface({ columns: rectColumns(x0, x1, z0, z1), height, thickness });
}

function* shedRoof({ x0, x1, z0, z1, axis, highAt, highY, lowY, thickness = 1 }) {
  if (axis !== 'x' && axis !== 'z') throw new RangeError(`axis muss 'x' oder 'z' sein: ${axis}`);
  if (highAt !== 'min' && highAt !== 'max') throw new RangeError(`highAt muss 'min' oder 'max' sein: ${highAt}`);
  const [c0, c1] = axis === 'x' ? [x0, x1] : [z0, z1];
  const height = (x, z) => {
    const t = c1 === c0 ? 0 : ((axis === 'x' ? x : z) - c0) / (c1 - c0);
    return highAt === 'min' ? highY + (lowY - highY) * t : lowY + (highY - lowY) * t;
  };
  yield* surface({ columns: rectColumns(x0, x1, z0, z1), height, thickness });
}

// Gemeinsamer Kern der Pyramiden; norm(dx,dz) bestimmt die Form.
function* pyramid({ cx, cz, r0, y0, r1, y1, solid, thickness, half, norm }) {
  const columns = [];
  for (let x = cx - r0; x <= cx + r0; x++) {
    for (let z = cz - r0; z <= cz + r0; z++) {
      const dx = x - cx, dz = z - cz;
      if (norm(dx, dz) > r0) continue;
      if (half) {
        const d = half.axis === 'x' ? dx : dz;
        if (half.sign * d < 0) continue;
      }
      columns.push([x, z]);
    }
  }
  const height = (x, z) => {
    const r = norm(x - cx, z - cz);
    if (r <= r1 || r0 === r1) return y1;
    return y0 + (y1 - y0) * (r0 - r) / (r0 - r1);
  };
  if (!solid) {
    yield* surface({ columns, height, thickness });
    return;
  }
  columns.sort((p, q) => p[0] - q[0] || p[1] - q[1]);
  for (const [x, z] of columns) {
    const top = Math.floor(height(x, z));
    for (let y = Math.min(y0, top); y <= top; y++) yield { x, y, z };
  }
}

function* octPyramid({ cx, cz, a0, y0, a1, y1, solid = false, thickness = 1, half = null }) {
  yield* pyramid({ cx, cz, r0: a0, y0, r1: a1, y1, solid, thickness, half, norm: rho });
}

function* squarePyramid({ cx, cz, h0, y0, h1, y1, solid = false, thickness = 1 }) {
  yield* pyramid({
    cx, cz, r0: h0, y0, r1: h1, y1, solid, thickness, half: null,
    norm: (dx, dz) => Math.max(Math.abs(dx), Math.abs(dz)),
  });
}

module.exports = { surface, gableRoof, shedRoof, octPyramid, squarePyramid };
