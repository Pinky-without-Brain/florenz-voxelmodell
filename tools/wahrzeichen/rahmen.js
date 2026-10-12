'use strict';
// Lokaler Rahmen eines Wahrzeichens (Kataloge, jeweils §0.1).
// x = ox + u*cos(t) - w*sin(t),  z = oz + u*sin(t) + w*cos(t)   (t von +x nach +z, z nach Süd)
// Rückabbildung: u = (x-ox)*cos(t) + (z-oz)*sin(t),  w = -(x-ox)*sin(t) + (z-oz)*cos(t)

function basis(ox, oz, ux, uz, wx, wz) {
  return Object.freeze({
    ox, oz, cos: ux, sin: uz,
    toWorld(u, w) { return { x: ox + u * ux + w * wx, z: oz + u * uz + w * wz }; },
    toLocal(x, z) { return { u: (x - ox) * ux + (z - oz) * uz, w: (x - ox) * wx + (z - oz) * wz }; }
  });
}

/** makeRahmen({ ox, oz, thetaDeg }) -> { toWorld(u, w) -> {x, z}, toLocal(x, z) -> {u, w}, cos, sin, ox, oz }. */
function makeRahmen({ ox, oz, thetaDeg }) {
  if (![ox, oz, thetaDeg].every(Number.isFinite)) throw new TypeError('makeRahmen: ox, oz, thetaDeg müssen Zahlen sein');
  const t = (thetaDeg * Math.PI) / 180;
  const c = Math.cos(t), s = Math.sin(t);
  const r = basis(ox, oz, c, s, -s, c);
  return Object.freeze({ ...r, thetaDeg });
}

/**
 * Rahmen aus Ursprung und Basisvektoren (Einheitsvektoren u und w). Nur für gespiegelte Kantenrahmen
 * (w nach innen bei gegenläufigem Ring); sonst makeRahmen.
 */
function rahmenAusBasis(ox, oz, ux, uz, wx, wz) { return basis(ox, oz, ux, uz, wx, wz); }

module.exports = { makeRahmen, rahmenAusBasis };
