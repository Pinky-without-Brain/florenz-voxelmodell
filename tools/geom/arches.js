'use strict';
// Bögen und Wandansichten. 2D-Zellen (u,v): u horizontal, v vertikal. Reine Generatoren.
const { inDisk } = require('./shapes');

// Höhe der Laibung über dem Kämpfer bei u; Halbweite w (kontinuierlich), Faktor f.
// R = 2·f·w, Kreismittelpunkte bei ∓(R − w) auf Kämpferhöhe.
function archHeight(u, w, f) {
  const a = Math.abs(u);
  if (!(a <= w)) return NaN;
  const R = 2 * f * w;
  const d = a + (R - w);
  return Math.sqrt(Math.max(0, R * R - d * d));
}

function isOpen(u, v, w, f, springV) {
  if (v < springV) return true;
  const h = archHeight(u, w + 0.5, f);
  return v + 0.5 <= springV + h;
}

function* archOpening(w, f, { springV = 0 } = {}) {
  let maxH = 0;
  for (let u = -w; u <= w; u++) maxH = Math.max(maxH, archHeight(u, w + 0.5, f));
  const vMax = Math.ceil(springV + maxH) + 1;
  for (let v = 0; v <= vMax; v++) {
    for (let u = -w; u <= w; u++) {
      if (isOpen(u, v, w, f, springV)) yield { u, v };
    }
  }
}

// Bogenring: offen bei w + t, aber nicht offen bei w. Pfosten (v < springV) nur mit opts.jambs.
function* archRing(w, f, t, opts = {}) {
  const springV = opts.springV || 0;
  const jambs = opts.jambs === true;
  for (const c of archOpening(w + t, f, { springV })) {
    if (Math.abs(c.u) <= w && isOpen(c.u, c.v, w, f, springV)) continue;
    if (!jambs && c.v < springV) continue;
    yield c;
  }
}

function openingPredicate(o) {
  if (o.type === 'arch') {
    const set = new Set();
    for (const c of archOpening(o.w, o.f, { springV: o.springV || 0 })) {
      set.add((c.u + o.cu) + ',' + (c.v + o.v0));
    }
    return (u, v) => set.has(u + ',' + v);
  }
  if (o.type === 'rect') {
    return (u, v) => u >= o.u0 && u <= o.u1 && v >= o.v0 && v <= o.v1;
  }
  if (o.type === 'circle') {
    return (u, v) => inDisk(u - o.cu, v - o.cv, o.r);
  }
  throw new RangeError(`Unbekannter Öffnungstyp: ${o.type}`);
}

function* elevation({ u0, u1, v0, v1, openings = [] }) {
  const preds = openings.map(openingPredicate);
  for (let v = v0; v <= v1; v++) {
    for (let u = u0; u <= u1; u++) {
      if (preds.some((p) => p(u, v))) continue;
      yield { u, v };
    }
  }
}

function* placeElevation(cells2d, { axis, origin, depth = [0, 0] }) {
  if (axis !== 'x' && axis !== 'z') throw new RangeError(`axis muss 'x' oder 'z' sein: ${axis}`);
  const d0 = Math.min(depth[0], depth[1]), d1 = Math.max(depth[0], depth[1]);
  for (const c of cells2d) {
    for (let d = d0; d <= d1; d++) {
      if (axis === 'x') yield { x: origin.x + c.u, y: origin.y + c.v, z: origin.z + d };
      else yield { x: origin.x + d, y: origin.y + c.v, z: origin.z + c.u };
    }
  }
}

module.exports = { archHeight, archOpening, archRing, elevation, placeElevation };
