'use strict';
// B4: Innenausbau der Quartierhäuser (Geschossböden, Treppenhaus, Licht, Ausstattung, Haustür, Eingangsstufen).
const test = require('node:test');
const assert = require('node:assert/strict');
const { VoxelGrid } = require('../geom/grid.js');
const { makeKontext } = require('../city/kontext.js');
const { bauHaus } = require('../city/haus.js');
const { bauInnen, stufen } = require('../city/innen.js');
const { entwurf } = require('../city/akten_entwurf.js');
const A = require('../city/akte.js');
const P = require('../city/poly.js');
const B = require('../validate/begehbarkeit.js');
const palette = require('../spec/palette.js');

const GROUND = 63;
const ringRect = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
const gebaeude = (id, ring, hoehe) => ({ id, name: null, tags: { building: 'yes' }, polygon: { aussen: [ring], loecher: [] }, hoeheBl: hoehe, isolato: 'I1' });

function akte(g, over = {}) {
  const a = entwurf(g, [], {});
  a.geschosse = over.geschosse || [{ art: 'eg', hoeheBl: 9 }, { art: 'og', hoeheBl: 7 }, { art: 'og', hoeheBl: 7 }];
  Object.assign(a.fassade, over.fassade || {});
  Object.assign(a.dach, over.dach || {});
  assert.deepEqual(A.validiere(a), []);
  return a;
}

function baue(g, a, ground = () => GROUND) {
  const k = makeKontext({ gebaeude: [g], akten: { [g.id]: a }, groundTopY: ground });
  const grid = new VoxelGrid();
  const w = grid.writer({ module: 0, part: 'h' }, { trackKeys: true });
  bauHaus(w, g, a, k);
  const plan = k.plan(g.id);
  const wi = grid.writer({ module: 0, part: 'h_innen' }, { trackKeys: true });
  bauInnen(wi, plan);
  return { grid, plan, k, keys: w.keys, innenKeys: wi.keys };
}

// R13 auf dem Haus: Anteil erreichbarer Raumzellen, nicht erreichbare Komponenten
function begehbar(grid, plan, ground = () => GROUND) {
  const xs = plan.cells.map((c) => c[0]), zs = plan.cells.map((c) => c[1]);
  const R = B.bauRaster({ x0: Math.min(...xs) - 3, x1: Math.max(...xs) + 3, z0: Math.min(...zs) - 3, z1: Math.max(...zs) + 3,
    y0: GROUND - 8, y1: plan.eaves + 16, grid, gelaendeTop: ground });
  const g = new Set(plan.cells.map(([x, z]) => x * 65536 + z));
  return B.pruefeBegehbarkeit(R, { innen: (x, z) => g.has(x * 65536 + z), unz: new Set(), grid, ring: 1 });
}

test('stufen: n1 + n2 = h, über dem Podest bleiben drei Zellen Luft (n1 <= h - 4)', () => {
  for (let h = 5; h <= 16; h++) {
    const s = stufen(h);
    assert.equal(s.n1 + s.n2, h);
    assert.ok(s.n1 >= 1 && s.n1 <= h - 4, `h=${h}`);
  }
  assert.equal(stufen(4), null);
});

test('Dreigeschossiges Haus: Böden je Ebene, Treppe aus Treppenblöcken, Licht, alle Räume erreichbar', () => {
  const g = gebaeude('w100', ringRect(0, 0, 22, 14), 23);
  const a = akte(g, { fassade: { erdgeschoss: { art: 'geschlossen', fenster: 'keine' } } });
  const { grid, plan, innenKeys } = baue(g, a);
  const inn = plan.innen;
  assert.equal(inn.status, 'ok');
  assert.equal(inn.boeden.length, 2, 'zwei Obergeschossböden');
  for (const b of inn.boeden) assert.ok(b.cells.length > 100);
  // Treppen: zwei Podesttreppen, jede Stufe ein Treppenblock mit Richtung, Kopffreiheit frei
  const treppen = inn.treppe.filter((t) => palette.isTreppe(t.typ));
  assert.equal(treppen.length, 2 * (9 + 7)); // Breite 2, je Ebene h Stufen
  for (const k of inn.loecher) { const [x, y, z] = k.split(',').map(Number); assert.equal(grid.has(x, y, z), false, `Kopffreiheit ${k}`); }
  // Haustür: offene Zellen im Erdgeschoss an der Straße
  assert.ok(plan.tuerZellen.length >= 2);
  // Licht: Seelaternen im Boden jeder Ebene
  const licht = inn.licht.map((l) => grid.get(l.x, l.y, l.z).type);
  assert.ok(licht.length >= 3 && licht.every((t) => t === 'sea_lantern'));
  assert.ok(innenKeys.length > 400);
  // R13: alles erreichbar
  const r = begehbar(grid, plan);
  assert.equal(r.komponenten.length, 0, JSON.stringify(r.komponenten.slice(0, 2)));
  assert.ok(r.erreichbar / r.innenZellen > 0.9, `${r.erreichbar} / ${r.innenZellen}`); // Reste: kleine Nischen unter den Läufen
});

test('Flachdach: Treppe bis auf die Terrasse, Treppenloch im Dach', () => {
  const g = gebaeude('w101', ringRect(0, 0, 20, 14), 16);
  const a = akte(g, { geschosse: [{ art: 'eg', hoeheBl: 9 }, { art: 'og', hoeheBl: 7 }], dach: { form: 'flach', material: 'terrasse', altana: false } });
  const { grid, plan } = baue(g, a);
  assert.equal(plan.innen.status, 'ok');
  const oben = plan.innen.treppe.filter((t) => t.y === plan.eaves && palette.isTreppe(t.typ));
  assert.ok(oben.length === 2, 'oberste Stufe liegt bündig im Dach');
  assert.ok([...plan.innen.rohbauFrei].some((k) => Number(k.split(',')[1]) === plan.eaves), 'Dachloch');
  // Stehfläche auf dem Dach über der Treppe erreichbar: oberste Stufe hat drei Luftzellen darüber
  for (const t of oben) for (let h = 1; h <= 3; h++) assert.equal(grid.has(t.x, t.y + h, t.z), false);
});

test('Mezzanin (h < 5) gehört zur Ebene darunter; deterministisch', () => {
  const g = gebaeude('w102', ringRect(0, 0, 24, 16), 29);
  const a = akte(g, { geschosse: [{ art: 'eg', hoeheBl: 8 }, { art: 'mezzanin', hoeheBl: 4 }, { art: 'nobile', hoeheBl: 9 }, { art: 'og', hoeheBl: 8 }] });
  const r1 = baue(g, a), r2 = baue(g, a);
  assert.equal(r1.plan.innen.status, 'ok');
  assert.deepEqual(r1.plan.innen.ebenen.map((e) => e.h), [12, 9, 8]);
  assert.equal(r1.plan.innen.boeden.length, 2);
  const sig = (r) => r.innenKeys.slice().sort((p, q) => p - q).join(',');
  assert.equal(sig(r1), sig(r2));
  assert.equal(begehbar(r1.grid, r1.plan).komponenten.length, 0);
});

test('Ladenbögen: Ladentür im mittleren Bogen, Theke im Erdgeschoss', () => {
  const g = gebaeude('w103', ringRect(0, 0, 26, 14), 23);
  const a = akte(g, { fassade: { achsen: 3, erdgeschoss: { art: 'bottega_arcata', fenster: 'keine' } } });
  const { grid, plan } = baue(g, a);
  assert.ok(plan.tuerZellen.length >= 2, 'Tür vorhanden');
  assert.ok(plan.innen.moebel.some((m) => m.art === 'theke'));
  assert.equal(begehbar(grid, plan).komponenten.length, 0);
});

test('Straße 2 Blöcke tiefer: Eingangsstufen in der Türlaibung, Haus erreichbar', () => {
  const g = gebaeude('w104', ringRect(0, 0, 22, 14), 23);
  const a = akte(g, { fassade: { erdgeschoss: { art: 'portal_mittig', fenster: 'rechteck' } } });
  // Gelände innerhalb des Grundrisses 62 (eine Ecke 63 = Hausboden), außen 61
  const ground = (x, z) => (x >= 0 && x <= 22 && z >= 0 && z <= 14 ? (x === 22 && z === 14 ? 63 : 62) : 61);
  const { grid, plan } = baue(g, a, ground);
  assert.ok(plan.eingang.stufen.size >= 3, 'Stufen gesetzt');
  for (const [k, typ] of plan.eingang.stufen) {
    const [x, y, z] = k.split(',').map(Number);
    assert.equal(grid.get(x, y, z).type, typ);
    assert.ok(palette.isTreppe(typ));
  }
  const r = begehbar(grid, plan, ground);
  assert.equal(r.komponenten.length, 0, JSON.stringify(r.komponenten.slice(0, 1)));
});

test('Schräger Grundriss: Tür führt über Durchbruch flächig ins Innere', () => {
  const ang = 45 * Math.PI / 180, c = Math.cos(ang), s = Math.sin(ang);
  const Rr = [[0, 0], [30, 0], [30, 16], [0, 16]];
  const ring = Rr.map(([x, z]) => [Math.round((x * c - z * s) * 2) / 2, Math.round((x * s + z * c) * 2) / 2]);
  const g = gebaeude('w105', ring, 23);
  const a = akte(g, { fassade: { erdgeschoss: { art: 'geschlossen', fenster: 'keine' } } });
  const { grid, plan } = baue(g, a);
  assert.ok(plan.tuerZellen.length > 0);
  const r = begehbar(grid, plan);
  assert.equal(r.komponenten.length, 0, JSON.stringify(r.komponenten.slice(0, 1)));
  assert.ok(r.erreichbar > 0);
});
