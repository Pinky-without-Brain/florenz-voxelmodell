'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const utm = require('../geo/utm.js');
const frame = require('../spec/frame.js');

test('UTM: Mittelmeridian und Meridianbogen bei 45° (Referenzwert 4 984 944,378 m · k0)', () => {
  const a = utm.latLonToUtm(0, 9);
  assert.ok(Math.abs(a.e - 500000) < 1e-6 && Math.abs(a.n) < 1e-6);
  const b = utm.latLonToUtm(45, 9);
  assert.ok(Math.abs(b.n - 4984944.378 * 0.9996) < 0.01, String(b.n));
});

test('UTM: Rundreise unter 1 mm über das Untersuchungsgebiet', () => {
  let worst = 0;
  for (let lat = 43.76; lat <= 43.78; lat += 0.002) for (let lon = 11.23; lon <= 11.27; lon += 0.004) {
    const p = utm.latLonToUtm(lat, lon);
    const q = utm.utmToLatLon(p.e, p.n);
    const p2 = utm.latLonToUtm(q.lat, q.lon);
    worst = Math.max(worst, Math.hypot(p.e - p2.e, p.n - p2.n));
    // Grad → Meter: 1e-9° ≈ 0,1 mm
    assert.ok(Math.abs(q.lat - lat) < 1e-9 && Math.abs(q.lon - lon) < 1e-9);
  }
  assert.ok(worst < 0.001, `Rundreise ${worst} m`);
});

test('UTM: Kuppelmitte liegt in Florenz (E 68x xxx, N 4 849 xxx)', () => {
  const ll = frame.blockToLatLon(0, 0);
  const p = utm.latLonToUtm(ll.lat, ll.lon);
  assert.ok(p.e > 680000 && p.e < 683000, String(p.e));
  assert.ok(p.n > 4848000 && p.n < 4851000, String(p.n));
});
