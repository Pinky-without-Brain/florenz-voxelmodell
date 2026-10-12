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

// Profil zu gegebener Stichhöhe: rise >= w Spitzbogen (f = ((rise/w)² + 1)/4),
// sonst elliptischer Korbbogen. Außerhalb |u| <= w: NaN.
function profileForRise(w, rise) {
  if (rise >= w) {
    const f = ((rise / w) ** 2 + 1) / 4;
    return (u) => archHeight(u, w, f);
  }
  return (u) => (Math.abs(u) <= w ? rise * Math.sqrt(Math.max(0, 1 - (u / w) ** 2)) : NaN);
}

// Öffnung nach Höhenfunktion hOf(u, wCont) mit kontinuierlicher Halbweite wCont = w + 0.5
function isOpenBy(u, v, hOf, springV) {
  if (v < springV) return true;
  return v + 0.5 <= springV + hOf(u);
}

function* openingBy(w, hOf, springV) {
  let maxH = 0;
  for (let u = -w; u <= w; u++) maxH = Math.max(maxH, hOf(u));
  const vMax = Math.ceil(springV + maxH) + 1;
  for (let v = 0; v <= vMax; v++) {
    for (let u = -w; u <= w; u++) {
      if (isOpenBy(u, v, hOf, springV)) yield { u, v };
    }
  }
}

// Ring: offen bei w + t, aber nicht offen bei w. Pfosten (v < springV) nur mit opts.jambs.
function* ringBy(w, t, hFor, opts) {
  const springV = opts.springV || 0;
  const jambs = opts.jambs === true;
  const hIn = hFor(w);
  for (const c of openingBy(w + t, hFor(w + t), springV)) {
    if (Math.abs(c.u) <= w && isOpenBy(c.u, c.v, hIn, springV)) continue;
    if (!jambs && c.v < springV) continue;
    yield c;
  }
}

function* archOpening(w, f, { springV = 0 } = {}) {
  yield* openingBy(w, (u) => archHeight(u, w + 0.5, f), springV);
}

function* archRing(w, f, t, opts = {}) {
  yield* ringBy(w, t, (ww) => (u) => archHeight(u, ww + 0.5, f), opts);
}

function* archOpeningRise(w, rise, { springV = 0 } = {}) {
  yield* openingBy(w, profileForRise(w + 0.5, rise), springV);
}

function* archRingRise(w, rise, t, opts = {}) {
  yield* ringBy(w, t, (ww) => profileForRise(ww + 0.5, rise), opts);
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

module.exports = {
  archHeight, profileForRise, archOpening, archRing, archOpeningRise, archRingRise,
  elevation, placeElevation };
