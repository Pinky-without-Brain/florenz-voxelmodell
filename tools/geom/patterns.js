'use strict';
// Materialfunktionen (x,y,z) => Typ. Liefern nie null.

const mod = (n, m) => ((n % m) + m) % m;

function incrustation({
  base = 'smooth_quartz', frame = 'dark_prismarine', accent = 'polished_granite',
  panelW, panelH, frameW = 1, axis = 'x', u0 = 0, v0 = 0,
} = {}) {
  if (!(panelW > 0) || !(panelH > 0)) throw new RangeError('panelW und panelH müssen > 0 sein');
  if (axis !== 'x' && axis !== 'z') throw new RangeError(`axis muss 'x' oder 'z' sein: ${axis}`);
  const pu = panelW + frameW, pv = panelH + frameW;
  const rad = Math.min(panelW, panelH) / 4;
  return (x, y, z) => {
    const u = (axis === 'x' ? x : z) - u0, v = y - v0;
    const lu = mod(u, pu), lv = mod(v, pv);
    if (lu < frameW || lv < frameW) return frame;
    const iu = Math.floor(u / pu), iv = Math.floor(v / pv);
    if (mod(iu + iv, 2) === 0) {
      const du = lu - frameW - (panelW - 1) / 2;
      const dv = lv - frameW - (panelH - 1) / 2;
      if (Math.abs(du) + Math.abs(dv) <= rad) return accent;
    }
    return base;
  };
}

function cosmati({ center = [0, 0], cell = 8 } = {}) {
  const r = cell / 2 - 1;
  const rOut = r * r + r;
  const rIn = r - 1 >= 0 ? (r - 1) * (r - 1) + (r - 1) : -1;
  return (x, y, z) => {
    const lx = mod(x - center[0], cell), lz = mod(z - center[1], cell);
    if (lx === 0 || lz === 0) return 'calcite';
    const dx = lx - cell / 2, dz = lz - cell / 2;
    const d2 = dx * dx + dz * dz;
    if (d2 <= rOut) return d2 <= rIn ? 'polished_granite' : 'dark_prismarine';
    return 'smooth_quartz';
  };
}

// Fischgrät: 8 Achteck-Segmente, je 8 Spalten im Zickzack, diagonale Bänder über y.
function herringbone({ a = 'bricks', b = 'terracotta', period = 4, cx = 0, cz = 0 } = {}) {
  const SEG = Math.PI / 4;
  return (x, y, z) => {
    let th = Math.atan2(z - cz, x - cx);
    if (th < 0) th += 2 * Math.PI;
    const s = (th % SEG) / SEG;
    const col = Math.min(7, Math.floor(s * 8));
    const zig = col < 4 ? col : 7 - col;
    return mod(y + zig, period) === 0 ? b : a;
  };
}

function bands({ types, period, offset = 0 }) {
  if (!Array.isArray(types) || types.length === 0) throw new RangeError('types darf nicht leer sein');
  return (x, y) => types[mod(Math.floor((y - offset) / period), types.length)];
}

module.exports = { incrustation, cosmati, herringbone, bands };
