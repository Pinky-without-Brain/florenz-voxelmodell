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
  // Haustüren (B4) sind gewollte Öffnungen: Tür-, Durchbruch- und offene Wandzellen im Erdgeschoss gelten als zu
  const tuer = new Set([...(plan.tuerZellen || []).map(([x, z]) => P.ck(x, z)), ...(plan.durchbruch || [])]);
  const egTop = plan.boden + plan.storeys[0].h;
  const zu = (x, y, z) => y <= egTop && tuer.has(P.ck(x, z));
  const seen = new Set();
  const st = [[x0, y1, z0]];
  seen.add(key(x0, y1, z0));
  while (st.length) {
    const [x, y, z] = st.pop();
    for (const [dx, dy, dz] of N6) {
      const nx = x + dx, ny = y + dy, nz = z + dz;
      if (nx < x0 || nx > x1 || nz < z0 || nz > z1 || ny < y0 || ny > y1) continue;
      if (grid.has(nx, ny, nz) || zu(nx, ny, nz) || seen.has(key(nx, ny, nz))) continue;
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
    const ty = grid.get(c.x, c.y, c.z).type;
    if (ty !== 'terracotta' && ty !== 'bricks') wallTop = Math.max(wallTop, c.y); // Dach, First und Kamine zählen nicht
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

// ------------------------------------------------------------------ C2b: Fassaden
const F = require('../city/fassade.js');
const FASSADE = {
  achsen: 5, material: 'putz', putzfarbe: 'ocker', erdgeschoss: { art: 'portal_mittig', portalBreiteBl: 5, fenster: 'rechteck' },
  fenster: { typ: 'rechteck', rahmen: 'pietra_serena', laeden: 'gruen' }, gesims: { art: 'gronda_holz', tiefeBl: 2 }
};
const GES4 = [{ art: 'eg', hoeheBl: 10 }, { art: 'nobile', hoeheBl: 10 }, { art: 'og', hoeheBl: 9 }, { art: 'og', hoeheBl: 8 }];
function bauMit(id, W, H, typ, fassade, over = {}) {
  const g = gebaeude(id, ringRect(0, 0, W, H), 37);
  const a = akte(g, { geschosse: over.geschosse || GES4, fassade, dach: over.dach });
  a.typ = typ;
  const r = baue([g], { [id]: a });
  const plan = r.k.plan(id);
  return { g, a, ...r, plan, lay: plan.fassaden.get(plan.hauptKante) };
}
const zaehle = (grid, keys, type) => { let n = 0; for (const k of keys) { const c = unpackKey(k); if (grid.get(c.x, c.y, c.z).type === type) n++; } return n; };

test('Fenster: 2-3 Blöcke breit, 4-6 hoch (Piano nobile höher), Achsabstand 5-9, mittig, 2 Blöcke Wand am Kantenende', () => {
  for (const [W, achsen] of [[44, 5], [30, 15], [70, 1], [24, 3]]) {
    const { lay } = bauMit('w800', W, 20, 'palazzo_cinquecento', { ...FASSADE, achsen });
    assert.ok(lay.nAxes >= 1);
    if (lay.nAxes > 1) assert.ok(lay.spacing >= F.SP_MIN - 1e-9 && lay.spacing <= F.SP_MAX + 1e-9, `Abstand ${lay.spacing} bei L=${lay.L}, achsen ${achsen}`);
    assert.ok(Math.abs(lay.centers[0] - (lay.L - lay.centers[lay.centers.length - 1])) < 1e-9, 'Achsen mittig');
    for (let s = 1; s < lay.items.length; s++) {
      for (const it of lay.items[s]) {
        assert.ok(it.w >= 2 && it.w <= 3, `Breite ${it.w}`);
        const h = it.top - it.v0;
        assert.ok(h >= (s === lay.items.length - 1 ? 3 : 4) && h <= 6, `Höhe ${h}`); // oberstes Geschoss darf kleinere Fenster haben
        assert.ok(it.uL >= 2 && it.uR <= lay.L - 2, 'Wand am Kantenende');
      }
    }
    const nobile = lay.items[1][0].top - lay.items[1][0].v0, og = lay.items[2][0].top - lay.items[2][0].v0;
    assert.ok(nobile >= og && nobile >= 5, `nobile ${nobile} og ${og}`);
  }
});

test('Läden: grüne Läden an Putzhäusern, keine bei laeden false und an Steinfassaden', () => {
  const mit = bauMit('w801', 36, 18, 'casa_a_schiera', FASSADE);
  assert.ok(zaehle(mit.grid, mit.parts.get('w801'), 'green_concrete') >= 20, 'Läden vorhanden');
  const auto = bauMit('w802', 36, 18, 'casa_a_schiera', { ...FASSADE, fenster: { typ: 'rechteck', rahmen: 'pietra_serena', laeden: null } });
  assert.ok(zaehle(auto.grid, auto.parts.get('w802'), 'green_concrete') >= 20, 'automatisch bei Putz');
  const ohne = bauMit('w803', 36, 18, 'casa_a_schiera', { ...FASSADE, fenster: { typ: 'rechteck', rahmen: 'pietra_serena', laeden: false } });
  assert.equal(zaehle(ohne.grid, ohne.parts.get('w803'), 'green_concrete'), 0);
  const stein = bauMit('w804', 36, 18, 'palazzo_rinascimento', { ...FASSADE, material: 'bugnato_abgestuft', putzfarbe: null });
  assert.equal(zaehle(stein.grid, stein.parts.get('w804'), 'green_concrete'), 0);
  // Läden sitzen in der Außenlage beiderseits des Fensters und hängen an der Wand (R4)
  assert.ok(zusammenhaengend(mit.parts.get('w801')));
});

test('Bifora: zwei Lichter (2 breit) mit einem Block Mittelsäulchen unter einem Entlastungsbogen', () => {
  const r = bauMit('w805', 48, 20, 'palazzo_rinascimento', {
    ...FASSADE, achsen: 5, material: 'bugnato_abgestuft', putzfarbe: null,
    fenster: { typ: 'bifora', rahmen: 'pietra_serena', laeden: null }, gesims: { art: 'cornicione_stein', tiefeBl: 3 } });
  const { lay, plan, grid } = r;
  const it = lay.items[1][0];
  assert.equal(it.shapes.length, 2);
  const [a, b] = it.shapes;
  assert.equal(a.w, 2); assert.equal(b.w, 2);
  assert.ok(Math.abs((b.uc - b.w / 2) - (a.uc + a.w / 2) - 1) < 1e-9, 'ein Block Säulchen');
  assert.ok(it.outer && it.outer.t === 'arch' && it.outer.w === 5, 'Bogen über 5 Blöcken');
  // im Raster: mittlere Lichtreihe der Außenlage: Luft, Luft, Stein, Luft, Luft
  const e = plan.edges[plan.hauptKante];
  const y = plan.storeys[1].base + it.v0 + 1;
  const cells = [...plan.w1.values()].filter((c) => c.edge === e.index && c.u >= it.uL && c.u < it.uR).sort((p, q) => p.u - q.u);
  assert.equal(cells.length, 5);
  const row = cells.map((c) => (grid.has(c.x, y, c.z) ? grid.get(c.x, y, c.z).type : '_'));
  assert.deepEqual(row.map((t) => (t === '_' ? 0 : 1)), [0, 0, 1, 0, 0]);
  assert.equal(row[2], 'smooth_stone');
});

test('Ladenbogen: 5-7 breit, Bogen, Außenlage offen, Glas dahinter', () => {
  const r = bauMit('w806', 40, 18, 'casa_a_schiera', { ...FASSADE, achsen: 4, erdgeschoss: { art: 'bottega_arcata', fenster: 'rechteck' } },
    { geschosse: [{ art: 'eg', hoeheBl: 10 }, { art: 'og', hoeheBl: 9 }, { art: 'og', hoeheBl: 9 }] });
  const arcs = r.lay.items[0].filter((it) => it.shapes[0].t === 'arch');
  assert.ok(arcs.length >= 3);
  for (const it of arcs) {
    assert.ok(it.w >= 5 && it.w <= 7, `Breite ${it.w}`);
    assert.ok(it.top - it.v0 >= 7, 'Bogenhöhe');
  }
  const it = arcs[0], plan = r.plan;
  const y = plan.boden + 2;
  const c1 = [...plan.w1.values()].find((c) => c.edge === plan.hauptKante && Math.abs(c.u - it.uc) < 0.51);
  assert.equal(r.grid.has(c1.x, y, c1.z), false, 'Außenlage offen (zurückgesetzt)');
  const c2 = [...plan.w2.values()].find((c) => c.edge === plan.hauptKante && Math.abs(c.u - it.uc) < 0.51);
  assert.equal(r.grid.get(c2.x, y, c2.z).type, 'gray_stained_glass');
  assert.ok(zusammenhaengend(r.parts.get('w806')));
});

test('Gesims und Vorsprünge: nie in fremden Parzellen, Konsolstufen, Dachüberstand', () => {
  const gA = gebaeude('w10', ringRect(0, 0, 16, 18), 37);
  const gB = gebaeude('w20', ringRect(16, 0, 34, 18), 37);
  const mk = (g, art, tiefe) => akte(g, { geschosse: GES4, fassade: { ...FASSADE, gesims: { art, tiefeBl: tiefe } } });
  for (const art of ['cornicione_stein', 'gronda_holz', 'putzgesims']) {
    const aA = mk(gA, art, art === 'putzgesims' ? 2 : 3), aB = mk(gB, art, art === 'putzgesims' ? 2 : 3);
    aA.typ = 'palazzo_rinascimento'; aB.typ = 'palazzo_cinquecento';
    const { k, parts, grid } = baue([gA, gB], { w10: aA, w20: aB });
    for (const id of ['w10', 'w20']) {
      const plan = k.plan(id);
      let maxAbstand = 0;
      for (const key of parts.get(id)) {
        const c = unpackKey(key);
        if (plan.S.has(P.ck(c.x, c.z))) continue;
        assert.equal(k.parz.owner(c.x, c.z), null, `${art}: Vorsprung (${c.x},${c.y},${c.z}) liegt in einer Parzelle`);
        let d = 99;
        for (const [x, z] of plan.cells) d = Math.min(d, Math.abs(c.x - x) + Math.abs(c.z - z));
        maxAbstand = Math.max(maxAbstand, d);
      }
      assert.ok(maxAbstand >= 2 && maxAbstand <= 3, `${art}: Überstand ${maxAbstand}`);
    }
    if (art === 'cornicione_stein') {
      const plan = k.plan('w10');
      const c0 = plan.gesims.find((c) => c.depth === 1 && c.z < 0);
      assert.equal(grid.has(c0.x, plan.eaves - 2, c0.z), true, 'unterste Konsole bei Tiefe 1');
      const c3 = plan.gesims.find((c) => c.depth === 3 && c.z < 0);
      assert.equal(grid.has(c3.x, plan.eaves - 1, c3.z), false);
      assert.equal(grid.has(c3.x, plan.eaves, c3.z), true);
      assert.equal(grid.has(c3.x, plan.eaves + 1, c3.z), false, 'Dachüberstand endet eine Stufe früher');
      assert.ok(zusammenhaengend([...parts.get('w10'), ...parts.get('w20')]));
    }
  }
});

test('Eckquader, Marcapiano und First: Palazzo-Ecken sauber, Geschossbänder, Dachfirst', () => {
  const r = bauMit('w807', 40, 20, 'palazzo_cinquecento', { ...FASSADE, material: 'putz', putzfarbe: 'rosa' });
  const { grid, plan } = r;
  const e = plan.edges[plan.hauptKante];
  const eck = [...plan.w1.values()].filter((c) => c.edge === e.index && (c.u < 2 || c.u > e.len - 2));
  assert.ok(eck.length >= 4);
  let quoin = 0;
  for (const c of eck) for (let y = plan.boden + 1; y <= plan.eaves; y++) if (grid.get(c.x, y, c.z).type === 'polished_andesite') quoin++;
  assert.ok(quoin >= 20, `Eckquader ${quoin}`);
  const mid = [...plan.w1.values()].find((c) => c.edge === e.index && Math.abs(c.u - 12) < 0.51);
  assert.equal(grid.get(mid.x, plan.storeys[1].base - 1, mid.z).type, 'smooth_stone', 'Marcapiano');
  let first = 0;
  for (const key of r.parts.get('w807')) { const c = unpackKey(key); if (c.y > plan.eaves && grid.get(c.x, c.y, c.z).type === 'bricks') first++; }
  assert.ok(first >= 10, `First ${first}`);
  assert.ok(zusammenhaengend(r.parts.get('w807')));
});

test('Schräge Kante: Fenster werden schmaler statt zerrissen (Treppeneffekt <= ca. 1 Block je Fensterbreite)', () => {
  const ang = 40 * Math.PI / 180, c = Math.cos(ang), s = Math.sin(ang);
  const R = [[0, 0], [40, 0], [40, 22], [0, 22]];
  const ring = R.map(([x, z]) => [Math.round((x * c - z * s) * 2) / 2, Math.round((x * s + z * c) * 2) / 2]);
  const g = gebaeude('w808', ring, 37);
  const a = akte(g, { geschosse: GES4, fassade: { ...FASSADE, erdgeschoss: { art: 'geschlossen', fenster: 'keine' } } });
  const { grid, k, parts } = baue([g], { w808: a });
  const plan = k.plan('w808');
  let geprueft = 0;
  for (const lay of plan.fassaden.values()) {
    for (let st = 1; st < lay.items.length; st++) {
      for (const it of lay.items[st]) { geprueft++; assert.ok(it.w * lay.sinPhi <= 1.05 + 1e-9 || it.w === 1, `Breite ${it.w} bei sin ${lay.sinPhi}`); }
    }
  }
  assert.ok(geprueft > 0);
  assert.ok(zusammenhaengend(parts.get('w808')));
  assert.deepEqual(lecks(grid, plan).slice(0, 3), []);
});

test('Altana und Kamine: Dachloggia mit vier Pfeilern, Kamine aus Ziegel, alles verbunden', () => {
  const r = bauMit('w809', 40, 22, 'casa_a_schiera', FASSADE, { dach: { altana: true, kamine: 2 } });
  const { grid, plan } = r;
  assert.ok(plan.altana, 'Altana gefunden');
  const al = plan.altana;
  for (const [dx, dz] of [[0, 0], [3, 0], [0, 3], [3, 3]]) {
    for (let y = al.fl + 1; y <= al.fl + 4; y++) assert.equal(grid.get(al.x0 + dx, y, al.z0 + dz).type, 'spruce_planks');
  }
  assert.equal(grid.has(al.x0 + 1, al.fl + 3, al.z0 + 1), false, 'offen zwischen den Pfeilern');
  assert.equal(grid.get(al.x0 + 1, al.fl + 5, al.z0 + 1).type, 'terracotta');
  assert.ok(plan.kamine.length >= 1);
  for (const km of plan.kamine) assert.equal(grid.get(km.x, km.y + 3, km.z).type, 'bricks');
  assert.ok(zusammenhaengend(r.parts.get('w809')));
});

test('Fassaden sind deterministisch (zwei Läufe, gleiche Zellen)', () => {
  const sig = (r) => r.parts.get('w810').slice().sort((p, q) => p - q).map((key) => { const u = unpackKey(key); return `${key}:${r.grid.get(u.x, u.y, u.z).type}`; }).join('|');
  const f = { ...FASSADE, material: 'bugnato_abgestuft', putzfarbe: null, fenster: { typ: 'bifora', rahmen: 'pietra_forte', laeden: null }, gesims: { art: 'cornicione_stein', tiefeBl: 3 } };
  assert.equal(sig(bauMit('w810', 46, 20, 'palazzo_rinascimento', f)), sig(bauMit('w810', 46, 20, 'palazzo_rinascimento', f)));
});

test('Zurückspringende Fenster, Ladenbögen und Bugnato-Fugen: Hülle dicht und verbunden (achsparallel und leicht schräg)', () => {
  for (const grad of [0, 9]) {
    const ang = grad * Math.PI / 180, c = Math.cos(ang), s = Math.sin(ang);
    const R = [[0, 0], [44, 0], [44, 22], [0, 22]];
    const ring = R.map(([x, z]) => [Math.round((x * c - z * s) * 2) / 2, Math.round((x * s + z * c) * 2) / 2]);
    for (const typ of A.ENUM.fensterTyp) {
      for (const [material, egArt, egFenster] of [['putz', 'bottega_arcata', 'kniefenster'], ['bugnato_abgestuft', 'geschlossen', 'keine'], ['bugnato_glatt', 'tor_und_fenster', 'rechteck_vergittert']]) {
        const g = gebaeude('w700', ring, 37);
        const a = akte(g, { geschosse: GES4, fassade: { ...FASSADE, material, putzfarbe: material === 'putz' ? 'gelb' : null, achsen: 5,
          erdgeschoss: { art: egArt, portalBreiteBl: 5, fenster: egFenster },
          fenster: { typ, rahmen: typ === 'rahmen_stuck' ? 'putz' : 'pietra_forte', laeden: material === 'putz' ? 'gruen' : null } } });
        if (egArt === 'tor_und_fenster') a.fassade.erdgeschoss.art = 'geschlossen', a.fassade.erdgeschoss.fenster = 'rechteck_vergittert';
        pruefeHaus(g, a);
      }
    }
  }
});
