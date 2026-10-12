'use strict';
// Gewölbe als Generatoren. Schale je Säule von y_lo (Laibung) bis y_hi (Treppenschluss).
const { archHeight } = require('./arches');

const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function groinVaultHeight(p, x, z) {
  const { x0, x1, z0, z1, fx = 0.5, fz = 0.5 } = p;
  if (x < x0 || x > x1 || z < z0 || z > z1) return NaN;
  const hx = archHeight(x - (x0 + x1) / 2, (x1 - x0 + 1) / 2, fx);
  const hz = archHeight(z - (z0 + z1) / 2, (z1 - z0 + 1) / 2, fz);
  return Math.min(hx, hz);
}

function* groinVault(p) {
  const { x0, x1, z0, z1, springY, thickness = 1 } = p;
  const lo = (x, z) => springY + Math.floor(groinVaultHeight(p, x, z));
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      const yLo = lo(x, z);
      let yHi = yLo + thickness - 1;
      for (const [dx, dz] of NB) {
        const nx = x + dx, nz = z + dz;
        if (nx < x0 || nx > x1 || nz < z0 || nz > z1) continue;
        yHi = Math.max(yHi, lo(nx, nz) - 1);
      }
      for (let y = yLo; y <= yHi; y++) yield { x, y, z };
    }
  }
}

// Kontinuierliche Achteck-Norm
function rho(dx, dz) {
  const ax = Math.abs(dx), az = Math.abs(dz);
  return Math.max(ax, az, (ax + az) / Math.SQRT2);
}

function cloisterHeight(p, x, z) {
  return archHeight(rho(x - p.cx, z - p.cz), p.a + 0.5, p.f);
}

function* cloisterVault(p) {
  const { cx, cz, a, springY, thickness = 1, rhoMin = 0, sides = 'all' } = p;
  const lo = (x, z) => springY + Math.floor(cloisterHeight(p, x, z));
  for (let x = cx - a; x <= cx + a; x++) {
    for (let z = cz - a; z <= cz + a; z++) {
      const dx = x - cx, dz = z - cz;
      const r = rho(dx, dz);
      if (r > a || r < rhoMin) continue;
      if (sides !== 'all') {
        const d = sides.axis === 'x' ? dx : dz;
        if (sides.sign * d < 0) continue;
      }
      const yLo = lo(x, z);
      let yHi = yLo + thickness - 1;
      for (const [ddx, ddz] of NB) {
        if (rho(dx + ddx, dz + ddz) > a) continue;
        yHi = Math.max(yHi, lo(x + ddx, z + ddz) - 1);
      }
      for (let y = yLo; y <= yHi; y++) yield { x, y, z };
    }
  }
}

// Viertelkugelschale über Halbkreis (Exedra)
function* halfDome({ cx, cz, r, springY, axis, sign, thickness = 1 }) {
  const rIn = r - thickness;
  const outer = r * r + r;
  const inner = rIn >= 0 ? rIn * rIn + rIn : -1;
  for (let dy = 0; dy <= r; dy++) {
    for (let x = cx - r; x <= cx + r; x++) {
      for (let z = cz - r; z <= cz + r; z++) {
        const dx = x - cx, dz = z - cz;
        const d = axis === 'x' ? dx : dz;
        if (sign * d < 0) continue;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 <= outer && d2 > inner) yield { x, y: springY + dy, z };
      }
    }
  }
}

module.exports = { groinVault, groinVaultHeight, cloisterVault, cloisterHeight, rho, halfDome };
