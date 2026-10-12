'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const dome = require('../geom/dome.js');
const dims = require('../spec/dimensions.js');

const L = dome.doubleDomeLayout(dims);
const key = (x, y, z) => x + ',' + y + ',' + z;

function build(s, rhoMin) {
  const set = new Set();
  const list = [];
  for (const c of dome.shell({ springY: L.springY, ...s, rhoMin })) {
    set.add(key(c.x, c.y, c.z));
    list.push(c);
  }
  return { set, list };
}

test('Profil: Prüfwerte', () => {
  assert.ok(Math.abs(dome.profileHeight(0, 45, 0.8) - 72.25) < 0.05);
  assert.ok(Math.abs(dome.profileHeight(45, 45, 0.8)) < 1e-9);
  assert.ok(Number.isNaN(dome.profileHeight(46, 45, 0.8)));
});

test('Profil: Round-Trip', () => {
  for (const r of [0, 10, 30, 44]) {
    const back = dome.profileRho(dome.profileHeight(r, 45, 0.8), 45, 0.8);
    assert.ok(Math.abs(back - r) < 1e-9, `r=${r} -> ${back}`);
  }
});

test('solveProfileFactor', () => {
  const f = dome.solveProfileFactor({ a: 51, rhoTarget: 14, hTarget: 68 });
  assert.ok(f >= 0.5 && f <= 3);
  assert.ok(Math.abs(dome.profileHeight(14, 51, f) - 68) < 1e-9);
  assert.throws(() => dome.solveProfileFactor({ a: 51, rhoTarget: 14, hTarget: 5000 }));
});

test('Winkelfunktionen', () => {
  assert.ok(Math.abs(dome.cornerAngleDelta(1, 0) - 22.5) < 1e-9);
  const a = 22.5 * Math.PI / 180;
  assert.ok(dome.cornerAngleDelta(Math.cos(a), -Math.sin(a)) < 1e-9);
  assert.equal(dome.segmentIndex(10, 0), 0);
  const dirs = [[1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]];
  assert.equal(new Set(dirs.map(([x, z]) => dome.segmentIndex(x, z))).size, 8);
  assert.equal(dome.segmentIndex(0, -10), 2); // Norden = Index 2
  assert.ok(Math.abs(dome.webPosition(10, 0)) < 1e-9);
  assert.ok(Math.abs(Math.abs(dome.webPosition(Math.cos(0.3927), -Math.sin(0.3927))) - 1) < 1e-3);
});

test('Layout: Konvergenz und Zwischenraum', () => {
  assert.equal(L.outer.yTop, dims.CATHEDRAL.dome.eyeRingTopY - 6);
  const h = L.outer.yTop - L.springY;
  assert.ok(Math.abs(dome.profileHeight(L.eye.ringRhoOuter, L.outer.a, L.outer.f) - h) < 1e-9);
  for (let hh = 0; hh <= h; hh += 0.5) {
    if (!(dome.profileRho(hh, L.outer.a, L.outer.f) > L.eye.ringRhoOuter)) break;
    const gap = dome.profileRho(hh, L.outer.a, L.outer.f) -
      (dome.profileRho(hh, L.inner.a, L.inner.f) + dome.thickness(hh, L.inner.tBase, L.inner.tTop, h));
    assert.ok(gap >= 1, `Zwischenraum ${gap} bei h=${hh}`);
  }
});

const t0 = Date.now();
const inner = build(L.inner, L.eye.rhoMin);
const outer = build(L.outer, L.eye.rhoMin);
console.log(`Schalen erzeugt in ${Date.now() - t0} ms (innen ${inner.list.length}, außen ${outer.list.length})`);

test('D4-Symmetrie', () => {
  for (const s of [inner, outer]) {
    for (const c of s.list) {
      for (const [x, z] of [[-c.x, c.z], [c.x, -c.z], [-c.x, -c.z], [c.z, c.x], [-c.z, c.x], [c.z, -c.x], [-c.z, -c.x]]) {
        assert.ok(s.set.has(key(x, c.y, z)), `fehlt ${x},${c.y},${z}`);
      }
    }
  }
});

test('Innen- und Außenschale disjunkt', () => {
  for (const k of inner.set) assert.ok(!outer.set.has(k), k);
});

// 6er-Flutfüllung ohne Auge: darf die Schale nirgends durchdringen
function leak(params) {
  const s = build(params, 0).set;
  const hTop = params.yTop - params.springY;
  const y0 = params.springY + 1;
  const seen = new Set([key(0, y0, 0)]);
  const stack = [[0, y0, 0]];
  let worst = null, count = 0;
  while (stack.length) {
    const [x, y, z] = stack.pop();
    count++;
    const h = y - params.springY - 0.5;
    const lim = dome.profileRho(h, params.a, params.f) + dome.thickness(h, params.tBase, params.tTop, hTop);
    if (dome.rho(x, z) > lim) { worst = [x, y, z]; break; }
    for (const [ax, ay, az] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
      const nx = x + ax, ny = y + ay, nz = z + az;
      if (Math.abs(nx) > 60 || Math.abs(nz) > 60 || ny < y0 || ny > params.yTop) continue;
      const k = key(nx, ny, nz);
      if (seen.has(k) || s.has(k)) continue;
      seen.add(k);
      stack.push([nx, ny, nz]);
    }
  }
  return { worst, count };
}

test('Dichtheit Innenschale', () => {
  const r = leak(L.inner);
  assert.equal(r.worst, null, 'Leck bei ' + r.worst);
  assert.ok(r.count > 1000);
});

test('Dichtheit Außenschale', () => {
  const r = leak(L.outer);
  assert.equal(r.worst, null, 'Leck bei ' + r.worst);
  assert.ok(r.count > 1000);
});

test('Auge bleibt frei', () => {
  for (const c of inner.list) assert.ok(dome.rho(c.x, c.z) >= L.eye.rhoMin);
});
