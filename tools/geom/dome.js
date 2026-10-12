'use strict';
// Achteckige Doppelkuppel (quinto acuto). Alles läuft über die Achteck-Norm rho,
// denn die Kuppel wurde in horizontalen Ringen gemauert.

const { connectEdges } = require('./vaults');

const COS_HALF = Math.cos(Math.PI / 8); // cos 22,5°
const SQRT1_2 = Math.SQRT1_2;

function rho(dx, dz) {
  const ax = Math.abs(dx), az = Math.abs(dz);
  return Math.max(ax, az, (ax + az) * SQRT1_2);
}

// Hilfsgrößen: s = Halbmaß über die Ecken, R = Rippenradius
function geometry(a, f) {
  const s = a / COS_HALF;
  const R = f * 2 * s;
  return { s, R, off: R - s };
}

// Höhe über dem Ansatz bei Achteck-Norm rho (NaN außerhalb 0..a)
function profileHeight(r, a, f) {
  if (!(r >= 0) || r > a) return NaN;
  const { R, off } = geometry(a, f);
  const v = R * R - Math.pow(r / COS_HALF + off, 2);
  if (v < 0) return v > -1e-9 ? 0 : NaN;
  return Math.sqrt(v);
}

// Umkehrung: rho bei Höhe h über dem Ansatz (NaN außerhalb 0..H(0))
function profileRho(h, a, f) {
  const { R, off } = geometry(a, f);
  const v = R * R - h * h;
  if (h < 0 || v < 0) return NaN;
  return COS_HALF * (Math.sqrt(v) - off);
}

// Profilfaktor f in [0,5; 3], sodass profileHeight(rhoTarget, a, f) = hTarget.
// H wächst mit f (größerer Radius, höherer Scheitel), daher Bisektion.
function solveProfileFactor({ a, rhoTarget, hTarget }) {
  let lo = 0.5, hi = 3;
  const g = (f) => profileHeight(rhoTarget, a, f) - hTarget;
  const glo = g(lo), ghi = g(hi);
  if (Number.isNaN(glo) || Number.isNaN(ghi) || glo * ghi > 0) {
    throw new Error(`solveProfileFactor: keine Lösung in [0,5; 3] (a=${a}, rho=${rhoTarget}, h=${hTarget}, g(0,5)=${glo}, g(3)=${ghi})`);
  }
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const gm = g(mid);
    if (Math.abs(gm) < 1e-12 || hi - lo < 1e-13) return mid;
    if (glo * gm <= 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

// Dicke bei Höhe h über dem Ansatz: linear tBase -> tTop, gerundet, mindestens 1
function thickness(h, tBase, tTop, hTop) {
  const t = tBase + (tTop - tBase) * (hTop > 0 ? h / hTop : 0);
  return Math.max(1, Math.round(t));
}

// Schale als Generator von {x,y,z}; a = Apothem der Innenfläche auf Ansatzhöhe
function* rawShell({ cx = 0, cz = 0, springY, a, f, tBase, tTop, yTop, rhoMin = 0 }) {
  const hTop = yTop - springY;
  const bound = Math.ceil(a) + Math.max(tBase, tTop) + 1;
  const hMax = profileHeight(0, a, f);
  // Säulenwerte (nach q = rho) vorab: Unterkante y_s der vertikalen Regel
  for (let y = springY + 1; y <= yTop; y++) {
    const h = y - springY - 0.5;
    const t = thickness(h, tBase, tTop, hTop);
    const r0 = h <= hMax ? profileRho(h, a, f) : NaN;
    const lo = r0 - 0.5, hi = r0 - 0.5 + t;
    for (let dx = -bound; dx <= bound; dx++) {
      for (let dz = -bound; dz <= bound; dz++) {
        const q = rho(dx, dz);
        if (q < rhoMin) continue;
        let inShell = !Number.isNaN(r0) && q >= lo && q < hi;
        if (!inShell && q <= a) {
          const ys = springY + 1 + Math.floor(profileHeight(q, a, f));
          if (y >= ys) {
            // Dicke an der Unterkante der Säule
            const ts = thickness(ys - springY - 0.5, tBase, tTop, hTop);
            if (y <= ys + ts - 1) inShell = true;
          }
        }
        if (inShell) yield { x: cx + dx, y, z: cz + dz };
      }
    }
  }
}

// Wie rawShell, aber flächig (6er-Nachbarschaft) zusammenhängend: Zellen, die sich nur
// an Kanten berühren, werden durch eine Zusatzzelle verbunden (Auge bleibt frei).
function* shell(p) {
  const { cx = 0, cz = 0, rhoMin = 0 } = p;
  const cells = [...rawShell(p)];
  const extra = connectEdges(cells).filter((c) => rho(c.x - cx, c.z - cz) >= rhoMin);
  yield* cells.concat(extra).sort((u, v) => u.y - v.y || u.x - v.x || u.z - v.z);
}

// Winkel in Grad, 0..360, Konvention siehe segmentIndex
function angleDeg(dx, dz) {
  let ang = Math.atan2(-dz, dx) * 180 / Math.PI;
  if (ang < 0) ang += 360;
  return ang;
}

// Kleinster Winkelabstand (0..22,5) zur nächsten Ecke; Ecken bei 22,5° + k·45°
function cornerAngleDelta(dx, dz) {
  const m = ((angleDeg(dx, dz) % 45) + 45) % 45;
  return Math.abs(m - 22.5);
}

// Fläche 0..7. Index 0 = Fläche +X (Osten), dann gegen den Uhrzeigersinn in der
// X/Z-Ebene von oben gesehen (Winkel = atan2(-dz, dx); +Z liegt im Süden).
function segmentIndex(dx, dz) {
  return Math.floor(((angleDeg(dx, dz) + 22.5) % 360) / 45) % 8;
}

// Position in der Fläche: -1 (eine Ecke) .. 0 (Mitte) .. +1 (andere Ecke), als Winkelanteil
function webPosition(dx, dz) {
  const k = segmentIndex(dx, dz);
  let d = angleDeg(dx, dz) - k * 45;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d / 22.5;
}

// Reine Beschreibung der Doppelkuppel (keine Zellen)
function doubleDomeLayout(dims) {
  const C = dims.CATHEDRAL;
  const d = C.dome;
  const springY = d.springY;
  const ringTopY = d.eyeRingTopY;
  const ringRhoOuter = d.eyeHalfFlat + 8; // Schlussring 8 Blöcke breit
  const yTop = ringTopY - 6;              // Ring: 6 Lagen (ringTopY-5 .. ringTopY)
  const innerA = C.crossing.innerHalfFlat;
  const outerA = innerA + d.innerShellBase + d.gap;
  const inner = { a: innerA, f: d.profileRadiusFactor, tBase: d.innerShellBase, tTop: d.innerShellTop, yTop };
  const outer = {
    a: outerA,
    f: solveProfileFactor({ a: outerA, rhoTarget: ringRhoOuter, hTarget: yTop - springY }),
    tBase: d.outerShellBase, tTop: d.outerShellTop, yTop,
  };
  const hTop = yTop - springY;
  const fmt = (v) => v.toFixed(2);
  const gapAt = (h) => profileRho(h, outer.a, outer.f) -
    (profileRho(h, inner.a, inner.f) + thickness(h, inner.tBase, inner.tTop, hTop));
  let minGap = Infinity, minGapH = 0;
  for (let h = 0; h <= hTop; h += 0.5) {
    const r = profileRho(h, outer.a, outer.f);
    if (!(r > ringRhoOuter)) break; // ab hier mündet die Außenschale in den Ring
    const g = gapAt(h);
    if (g < minGap) { minGap = g; minGapH = h; }
  }
  const notes = [
    `outer.f = ${outer.f.toFixed(6)}`,
    `Scheitel innen (ohne Abschneiden): Y ${fmt(springY + profileHeight(0, inner.a, inner.f))}`,
    `Scheitel außen (ohne Abschneiden): Y ${fmt(springY + profileHeight(0, outer.a, outer.f))}`,
    'Zwischenraum (rho) bei h = ' + [0, 20, 40, 60].map((h) => `${h}: ${fmt(gapAt(h))}`).join(', '),
    `Minimaler Zwischenraum bis rho = ${ringRhoOuter}: ${fmt(minGap)} bei h = ${minGapH}`,
  ];
  return {
    springY,
    eye: { rhoMin: d.eyeHalfFlat, ringTopY, ringRhoOuter },
    inner, outer,
    apexInner: springY + profileHeight(0, inner.a, inner.f),
    notes,
  };
}

module.exports = {
  rho, profileHeight, profileRho, solveProfileFactor, thickness, shell,
  cornerAngleDelta, segmentIndex, webPosition, doubleDomeLayout,
};
