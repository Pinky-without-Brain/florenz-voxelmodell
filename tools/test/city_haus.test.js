'use strict';
// V3 C1: Hausgenerator auf synthetischen Grundrissen (Rechteck, schräger L-Grundriss, Brandwand-Paar).
const test = require('node:test');
const assert = require('node:assert/strict');
const { VoxelGrid, unpackKey, packKey } = require('../geom/grid.js');
const { makeKontext } = require('../city/kontext.js');
const { bauHaus } = require('../city/haus.js');
const { entwurf } = require('../city/akten_entwurf.js');
const A = require('../city/akte.js');
const P = require('../city/poly.js');
const palette = require('../spec/palette.js');

const GROUND = 63;
const ringRect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

function gebaeude(id, ring, hoehe, extra) {
  return { id, name: null, tags: { building: 'yes' }, polygon: { aussen: [ring], loecher: [] }, hoeheBl: hoehe, isolato: 'I1', ...extra };
}
// Akte aus dem Entwurf mit fester Geschosszahl und gewählten Merkmalen
function akte(g, over = {}) {
  const a = entwurf(g, [], {});
  a.geschosse = over.geschosse || [{ art: 'eg', hoeheBl: 10 }, { art: 'og', hoeheBl: 10 }, { art: 'og', hoeheBl: 10 }];
  Object.assign(a.fassade, over.fassade || {});
  Object.assign(a.dach, over.dach || {});
  assert.deepEqual(A.validiere(a), []);
  return a;
}

function baue(gs, akten, ground = () => GROUND) {
  const k = makeKontext({ gebaeude: gs, akten, groundTopY: ground });
  const grid = new VoxelGrid();
  const parts = new Map();
  let i = 0;
  for (const g of gs) {
    const w = grid.writer({ module: 0, part: 'h' + (i++) }, { trackKeys: true });
    bauHaus(w, g, akten[g.id], k);
    parts.set(g.id, w.keys);
  }
  return { grid, k, parts };
}

const N6 = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

// Zusammenhang über Flächenkontakte
function zusammenhaengend(keys) {
  const set = new Set(keys);
  const seen = new Set([keys[0]]);
  const st = [keys[0]];
  while (st.length) {
    const c = unpackKey(st.pop());
    for (const [dx, dy, dz] of N6) {
      const n = packKey(c.x + dx, c.y + dy, c.z + dz);
      if (set.has(n) && !seen.has(n)) { seen.add(n); st.push(n); }
    }
  }
  return seen.size === set.size;
}

// Dichtigkeit: Luft von außen (6er-Nachbarschaft, auch von oben) erreicht keine Innenluft unter der Traufe
function lecks(grid, plan) {
  const xs = plan.cells.map((c) => c[0]), zs = plan.cells.map((c) => c[1]);
  const x0 = Math.min(...xs) - 4, x1 = Math.max(...xs) + 4, z0 = Math.min(...zs) - 4, z1 = Math.max(...zs) + 4;
  const y0 = plan.boden + 1, y1 = plan.eaves + 16;
  const key = (x, y, z) => `${x},${y},${z}`;
  const seen = new Set();
  const st = [[x0, y1, z0]];
  seen.add(key(x0, y1, z0));
  while (st.length) {
    const [x, y, z] = st.pop();
    for (const [dx, dy, dz] of N6) {
      const nx = x + dx, ny = y + dy, nz = z + dz;
      if (nx < x0 || nx > x1 || nz < z0 || nz > z1 || ny < y0 || ny > y1) continue;
      if (grid.has(nx, ny, nz) || seen.has(key(nx, ny, nz))) continue;
      seen.add(key(nx, ny, nz)); st.push([nx, ny, nz]);
    }
  }
  const out = [];
  for (const [x, z] of plan.cells) {
    const k = P.ck(x, z);
    if (plan.w1.has(k) || plan.w2.has(k)) continue;
    for (let y = y0; y <= plan.eaves; y++) {
      if (!grid.has(x, y, z) && seen.has(key(x, y, z))) out.push([x, y, z]);
    }
  }
  return out;
}

function pruefeHaus(g, a) {
  const { grid, k, parts } = baue([g], { [g.id]: a });
  const plan = k.plan(g.id);
  const keys = parts.get(g.id);
  assert.ok(keys.length > 500, 'Haus hat Zellen');
  for (const key of keys) { const c = unpackKey(key); assert.ok(palette.TYPES.includes(grid.get(c.x, c.y, c.z).type)); }
  // Traufhöhe = Sockel + Summe der Geschosse, passend zur OSM-Höhe (±2)
  assert.equal(plan.eaves, GROUND + A.summeHoehe(a));
  assert.ok(Math.abs(plan.eaves - GROUND - g.hoeheBl) <= 2);
  let wallTop = -1, anyTop = -1, bottom = 999;
  for (const key of keys) {
    const c = unpackKey(key);
    if (grid.get(c.x, c.y, c.z).type !== 'terracotta') wallTop = Math.max(wallTop, c.y);
    anyTop = Math.max(anyTop, c.y); bottom = Math.min(bottom, c.y);
  }
  assert.equal(wallTop, plan.eaves, 'Wände enden an der Traufe');
  assert.ok(anyTop > plan.eaves, 'Dach liegt über der Traufe');
  assert.equal(bottom, GROUND, 'Bodenplatte auf der Sockelhöhe');
  for (const [x, z] of plan.cells) {
    let hoechste = -1;
    for (let y = anyTop; y >= GROUND; y--) if (grid.has(x, y, z)) { hoechste = y; break; }
    assert.ok(hoechste >= plan.eaves + 1, `Dach über (${x},${z})`);
  }
  assert.ok(zusammenhaengend(keys), 'ein einziger flächenverbundener Körper');
  assert.deepEqual(lecks(grid, plan).slice(0, 5), [], 'Hülle ist dicht');
  return { grid, plan, keys, parts };
}

const GESCHLOSSEN = { erdgeschoss: { art: 'geschlossen', fenster: 'keine' } };

test('Rechteckiges Haus: Traufhöhe, geschlossene Wände, geschlossenes Dach, zusammenhängend', () => {
  const g = gebaeude('w100', ringRect(0, 0, 20, 14), 30);
  const r = pruefeHaus(g, akte(g, { fassade: GESCHLOSSEN }));
  assert.ok(r.plan.w2.size > 0, 'Straßenseite hat eine zweite Wandlage');
  assert.ok(r.plan.w1.has(P.ck(0, 7)));
});

test('Schräger L-Grundriss: Hülle dicht, Dach geschlossen, verbunden, deterministisch', () => {
  const ang = 27 * Math.PI / 180, c = Math.cos(ang), s = Math.sin(ang);
  const L = [[0, 0], [30, 0], [30, 10], [12, 10], [12, 28], [0, 28]];
  const ring = L.map(([x, z]) => [Math.round((x * c - z * s) * 2) / 2, Math.round((x * s + z * c) * 2) / 2]);
  const g = gebaeude('w200', ring, 29);
  const a = akte(g, { geschosse: [{ art: 'eg', hoeheBl: 11 }, { art: 'og', hoeheBl: 9 }, { art: 'og', hoeheBl: 9 }], fassade: GESCHLOSSEN });
  const r1 = pruefeHaus(g, a);
  const r2 = baue([g], { [g.id]: a });
  const sig = (grid, keys) => keys.slice().sort((p, q) => p - q).map((k) => { const u = unpackKey(k); return `${k}:${grid.get(u.x, u.y, u.z).type}`; }).join('|');
  assert.equal(sig(r1.grid, r1.keys), sig(r2.grid, r2.parts.get(g.id)));
});

test('Fassade mit Öffnungen: Glas in der Straßenwand, Portal offen, Haus bleibt verbunden', () => {
  const g = gebaeude('w300', ringRect(0, 0, 30, 16), 30);
  const a = akte(g, { fassade: { achsen: 3, erdgeschoss: { art: 'portal_mittig', portalBreiteBl: 5, fenster: 'rechteck' },
    fenster: { typ: 'rechteck', rahmen: 'pietra_serena', laeden: null } } });
  const { grid, k, parts } = baue([g], { [g.id]: a });
  const plan = k.plan(g.id), keys = parts.get(g.id);
  assert.ok(zusammenhaengend(keys));
  let glas = 0;
  for (const key of keys) { const c = unpackKey(key); if (grid.get(c.x, c.y, c.z).type === 'gray_stained_glass') glas++; }
  assert.ok(glas >= 8, `Glaszellen: ${glas}`);
  const e = plan.edges[plan.hauptKante];
  const mid = [...plan.w1.values()].filter((c) => c.edge === e.index)
    .sort((p, q) => Math.abs(p.u - e.len / 2) - Math.abs(q.u - e.len / 2))[0];
  assert.equal(grid.has(mid.x, GROUND + 2, mid.z), false, 'Portal ist offen');
  assert.equal(grid.has(mid.x, GROUND, mid.z), true, 'Bodenplatte bleibt');
});

test('Flachdach: Terrasse mit Brüstung', () => {
  const g = gebaeude('w400', ringRect(0, 0, 18, 12), 30);
  const a = akte(g, { dach: { form: 'flach', material: 'terrasse' }, fassade: GESCHLOSSEN });
  const { grid, k, parts } = baue([g], { [g.id]: a });
  const plan = k.plan(g.id);
  assert.ok(zusammenhaengend(parts.get(g.id)));
  assert.equal(grid.has(9, plan.eaves, 6), true, 'Terrassenboden');
  assert.equal(grid.has(9, plan.eaves + 1, 6), false);
  assert.equal(grid.has(0, plan.eaves + 2, 6), true, 'Brüstung');
  assert.equal(grid.has(0, plan.eaves + 3, 6), false);
});

test('Brandwand: gemeinsame Zellen gehören der kleineren ID, das größere Haus lässt sie aus, nichts kollidiert', () => {
  const gA = gebaeude('w10', ringRect(0, 0, 14, 16), 30);
  const gB = gebaeude('w20', ringRect(14, 0, 30, 16), 40);
  const aA = akte(gA, { fassade: GESCHLOSSEN });
  const aB = akte(gB, { geschosse: [{ art: 'eg', hoeheBl: 10 }, { art: 'og', hoeheBl: 10 }, { art: 'og', hoeheBl: 10 }, { art: 'og', hoeheBl: 10 }],
    fassade: GESCHLOSSEN });
  const { grid, k, parts } = baue([gA, gB], { w10: aA, w20: aB }); // wirft bei Konflikten (R1)
  assert.equal(k.parz.owner(14, 8), 'w10');
  for (const key of parts.get('w20')) {
    const c = unpackKey(key);
    if (c.z >= 0 && c.z <= 16) assert.notEqual(c.x, 14, 'B belegt keine Zelle der gemeinsamen Linie');
  }
  const pA = k.plan('w10'), pB = k.plan('w20');
  assert.ok(pB.eaves > pA.eaves);
  assert.equal(grid.has(15, pA.eaves + 1, 8), true, 'Teilwand von B über dem niedrigeren Nachbarn');
  assert.equal(grid.has(15, pA.eaves, 8), false, 'darunter schützt die Wand von A');
  assert.ok(zusammenhaengend([...parts.get('w10'), ...parts.get('w20')]));
});

test('Hanglage: Sockel auf dem höchsten Geländepunkt, Fundament reicht bis zum Gelände', () => {
  const g = gebaeude('w500', ringRect(0, 0, 20, 14), 30);
  const a = akte(g, { fassade: GESCHLOSSEN });
  const hang = (x) => 60 + Math.floor(x / 4); // 60 .. 65
  const { grid, k, parts } = baue([g], { w500: a }, (x) => hang(x));
  assert.equal(k.plan('w500').boden, 65);
  for (let x = 0; x <= 20; x += 5) {
    for (let y = hang(x) + 1; y <= 65; y++) assert.equal(grid.has(x, y, 7), true, `Fundament (${x},${y})`);
  }
  assert.equal(grid.has(0, 60, 7), false);
  assert.ok(zusammenhaengend(parts.get('w500')));
});

test('Vollständig überdeckter Grundriss baut nichts und wirft nicht', () => {
  const gA = gebaeude('w1', ringRect(0, 0, 20, 20), 20);
  const gB = gebaeude('w2', ringRect(5, 5, 10, 10), 20);
  const { parts } = baue([gA, gB], { w1: akte(gA), w2: akte(gB) });
  assert.equal(parts.get('w2').length, 0);
});

test('Alle Fenstertypen auf schrägem Grundriss: dicht und verbunden', () => {
  const ang = 33 * Math.PI / 180, c = Math.cos(ang), s = Math.sin(ang);
  const R = [[0, 0], [34, 0], [34, 20], [0, 20]];
  const ring = R.map(([x, z]) => [Math.round((x * c - z * s) * 2) / 2, Math.round((x * s + z * c) * 2) / 2]);
  for (const typ of A.ENUM.fensterTyp) {
    for (const laeden of [null, 'gruen']) {
      const g = gebaeude('w600', ring, 30);
      const a = akte(g, { fassade: { achsen: 4, erdgeschoss: { art: 'geschlossen', fenster: 'keine' },
        fenster: { typ, rahmen: typ === 'rahmen_stuck' ? 'putz' : 'pietra_forte', laeden } } });
      pruefeHaus(g, a);
    }
  }
});
