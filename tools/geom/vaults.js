'use strict';
// Gewölbe als Generatoren. Schale je Säule von y_lo (Laibung) bis y_hi (Treppenschluss).
const { archHeight, profileForRise } = require('./arches');

// Profilfunktion h(u) für Halbweite w: entweder Faktor f oder Stichhöhe rise
function profileOf(w, f, rise) {
  if (rise !== undefined) return profileForRise(w, rise);
  return (u) => archHeight(u, w, f);
}

const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function groinParts(p, x, z) {
  const { x0, x1, z0, z1, fx = 0.5, fz = 0.5, riseX, riseZ } = p;
  const hx = profileOf((x1 - x0 + 1) / 2, fx, riseX)(x - (x0 + x1) / 2);
  const hz = profileOf((z1 - z0 + 1) / 2, fz, riseZ)(z - (z0 + z1) / 2);
  return { hx, hz };
}

// Kreuzgewölbe = Vereinigung zweier Tonnenräume: Laibung max(Hx, Hz)
function groinVaultHeight(p, x, z) {
  if (x < p.x0 || x > p.x1 || z < p.z0 || z > p.z1) return NaN;
  const { hx, hz } = groinParts(p, x, z);
  return Math.max(hx, hz);
}

// opts ribs: Zellen auf den Graten (|Hx − Hz| < 0,6) tragen rib: true, alle anderen rib: false
function* groinVault(p) {
  const { x0, x1, z0, z1, springY, thickness = 1, ribs = false } = p;
  const lo = (x, z) => springY + Math.floor(groinVaultHeight(p, x, z));
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      const yLo = lo(x, z);
      let yHi = yLo + thickness - 1;
      for (const [dx, dz] of NB) {
        const nx = x + dx, nz = z + dz;
        if (nx < x0 || nx > x1 || nz < z0 || nz > z1) continue;
        yHi = Math.max(yHi, lo(nx, nz));
      }
      let rib = false;
      if (ribs) {
        const { hx, hz } = groinParts(p, x, z);
        rib = Math.abs(hx - hz) < 0.6;
      }
      for (let y = yLo; y <= yHi; y++) yield ribs ? { x, y, z, rib } : { x, y, z };
    }
  }
}

// Kontinuierliche Achteck-Norm
function rho(dx, dz) {
  const ax = Math.abs(dx), az = Math.abs(dz);
  return Math.max(ax, az, (ax + az) / Math.SQRT2);
}

function cloisterHeight(p, x, z) {
  return profileOf(p.a + 0.5, p.f, p.rise)(rho(x - p.cx, z - p.cz));
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
        yHi = Math.max(yHi, lo(x + ddx, z + ddz));
      }
      for (let y = yLo; y <= yHi; y++) yield { x, y, z };
    }
  }
}

// Kantenkontakte (zwei Zellen berühren sich nur diagonal in einer Ebene) werden flächig
// verbunden: Es wird die Zelle ergänzt, die über der unteren Zelle liegt (y-Paare)
// bzw. beide Zwischenzellen (reine XZ-Diagonale). Prüfung nur gegen die Eingabemenge,
// damit das Ergebnis unabhängig von der Reihenfolge und symmetrieerhaltend ist.
function connectEdges(cells) {
  const key = (x, y, z) => x + ',' + y + ',' + z;
  const set = new Set(cells.map((c) => key(c.x, c.y, c.z)));
  const added = new Map();
  const add = (x, y, z) => {
    const k = key(x, y, z);
    if (!set.has(k) && !added.has(k)) added.set(k, { x, y, z });
  };
  const AX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const PAIRS = [[0, 1], [0, 2], [1, 2]];
  for (const c of cells) {
    for (const [i, j] of PAIRS) {
      for (const sj of [1, -1]) {
        const a = AX[i], b = AX[j];
        const ox = c.x + a[0] + sj * b[0], oy = c.y + a[1] + sj * b[1], oz = c.z + a[2] + sj * b[2];
        if (!set.has(key(ox, oy, oz))) continue;
        const m1 = [c.x + a[0], c.y + a[1], c.z + a[2]];
        const m2 = [c.x + sj * b[0], c.y + sj * b[1], c.z + sj * b[2]];
        if (set.has(key(...m1)) || set.has(key(...m2))) continue;
        if (i === 1 || j === 1) {
          // y beteiligt: Zelle über der unteren, in deren Säule
          const o = { x: ox, y: oy, z: oz };
          const lower = c.y <= oy ? c : o;
          const upper = c.y <= oy ? o : c;
          add(lower.x, upper.y, lower.z);
        } else {
          add(...m1);
          add(...m2);
        }
      }
    }
  }
  return [...added.values()];
}

// Viertelkugelschale über Halbkreis (Exedra)
function* halfDome({ cx, cz, r, springY, axis, sign, thickness = 1 }) {
  const rIn = r - thickness;
  const outer = r * r + r;
  const inner = rIn >= 0 ? rIn * rIn + rIn : -1;
  const cells = [];
  for (let dy = 0; dy <= r; dy++) {
    for (let x = cx - r; x <= cx + r; x++) {
      for (let z = cz - r; z <= cz + r; z++) {
        const dx = x - cx, dz = z - cz;
        const d = axis === 'x' ? dx : dz;
        if (sign * d < 0) continue;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 <= outer && d2 > inner) cells.push({ x, y: springY + dy, z });
      }
    }
  }
  yield* mergeSorted(cells, connectEdges(cells));
}

// Ergänzte Zellen in die Reihenfolge y, x, z einsortieren
function mergeSorted(cells, extra) {
  return cells.concat(extra).sort((p, q) => p.y - q.y || p.x - q.x || p.z - q.z);
}

module.exports = { groinVault, groinVaultHeight, cloisterVault, cloisterHeight, rho, halfDome, connectEdges };
