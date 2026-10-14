'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');
const m3 = require('../model/m3_vierung_tribunen.js');
const D = require('../spec/dimensions.js');
const { inOctagon } = require('../geom/shapes.js');
const { inExedra, OWNERSHIP } = require('../spec/interfaces.js');

const world = buildWorld({ modules: [0, 3] });
const grid = world.grid;
const mod3 = world.modules.find((m) => m.module === 3);
const partIds = mod3.parts.map((p) => p.id);
const { TRIBUNES } = m3._internal;

const PART_ORDER = [
  'vierung_wand', 'vierung_gesims', 'sakristei_tueren',
  ...['nord', 'ost', 'sued'].flatMap((t) => ['mauern', 'gewoelbe', 'obergaden', 'daecher'].map((p) => `tribune_${t}_${p}`)),
  'eckbauten', 'kapellendach_abschluss', 'exedra_sockel'
];

// Zellen eines Bauteils als Map "x,y,z" -> Typ
function cellsOf(partId) {
  const m = new Map();
  grid.forEach((x, y, z, e) => { if (e.module === 3 && e.part === partId) m.set(x + ',' + y + ',' + z, e.type); });
  return m;
}
const solid = (x, y, z) => grid.ownerModule(x, y, z) === 3;

test('Modul 3 baut ohne Fehler, Bauteile in der geforderten Reihenfolge', () => {
  assert.deepEqual(world.errors, []);
  assert.deepEqual(partIds, PART_ORDER);
  for (const p of mod3.parts) assert.ok(p.keys.length > 0, `${p.id} ist leer`);
});

test('Symmetrie-Flags: vierung_wand order 8, Tribunenbauteile ohne Flag', () => {
  const byId = Object.fromEntries(mod3.parts.map((p) => [p.id, p.opts]));
  assert.equal(byId.vierung_wand.symmetry.order, 8);
  for (const id of partIds) if (id.startsWith('tribune_')) assert.equal(byId[id].symmetry, undefined, id);
  assert.equal(byId.sakristei_tueren.symmetry, undefined);
});

test('Schnittstelle nach oben: Y 148 ist voll auf dem Ring 45..54 und auf allen vier Exedra-Sockeln', () => {
  const Y = D.CATHEDRAL.crossing.archTopY;
  let ring = 0, exedra = 0;
  for (let x = -70; x <= 70; x++) {
    for (let z = -70; z <= 70; z++) {
      const isRing = inOctagon(x, z, 54) && !inOctagon(x, z, 44);
      const isEx = inExedra(x, z);
      if (isRing) { ring++; assert.ok(solid(x, Y, z), `Ring offen bei ${x},${Y},${z}`); }
      if (isEx) { exedra++; assert.ok(solid(x, Y, z), `Sockel offen bei ${x},${Y},${z}`); }
    }
  }
  assert.ok(ring > 2500 && exedra > 400);
  // keine Zelle von Modul 3 oberhalb von Y 148
  assert.ok(grid.bounds().maxY <= Y);
});

test('Hoheitsgebiet: keine Blöcke im Langhaus (x <= -55, |z| <= 44, Y 65..156)', () => {
  const own = OWNERSHIP.find((o) => o.name === 'Langhaus');
  let n = 0;
  grid.forEach((x, y, z, e) => { if (e.module === 3 && own.test(x, y, z)) n++; });
  assert.equal(n, 0);
});

test('Vierungswand und Gesims sind D4-symmetrisch (inkl. Blocktyp)', () => {
  for (const id of ['vierung_wand', 'vierung_gesims']) {
    const cells = cellsOf(id);
    for (const [k, t] of cells) {
      const [x, y, z] = k.split(',').map(Number);
      for (const [a, b] of [[-x, z], [x, -z], [z, x], [-z, x]]) {
        assert.equal(cells.get(a + ',' + y + ',' + b), t, `${id} asymmetrisch bei ${k}`);
      }
    }
  }
});

test('Vier große Bögen: gleiche Öffnung auf allen Achsen, Scheitel Y 140 ist Wand', () => {
  const axes = [(s, w) => [s, w], (s, w) => [-s, w], (s, w) => [w, s], (s, w) => [w, -s]];
  for (const f of axes) {
    for (const s of [45, 50, 54]) {
      const at = (y, w) => { const [x, z] = f(s, w); return solid(x, y, z); };
      assert.equal(at(70, 0), false, 'Durchgang unten');
      assert.equal(at(112, 17), false, 'Pfosten bis zum Kämpfer offen');
      assert.equal(at(112, 18), true, 'Laibung');
      assert.equal(at(139, 0), false, 'Scheitel offen bis Y 139');
      assert.equal(at(140, 0), true, 'Scheitel Y 140 geschlossen');
      assert.equal(at(113, 17), false);
      assert.equal(at(125, 17), true, 'Bogen schließt oberhalb des Kämpfers');
    }
  }
});

test('Schalenmauerwerk: hohler Kern, Binderlage Y 77 und oberste Lagen voll', () => {
  assert.equal(solid(47, 80, 25), false, 'Kern hohl');
  assert.equal(solid(47, 77, 25), true, 'Binderlage');
  for (const y of [146, 147, 148]) assert.equal(solid(47, y, 25), true, 'oberste Lagen');
  assert.equal(solid(40, 80, 25), true, 'innere Schale (Norm 46)');
  assert.equal(solid(50, 80, 25), true, 'äußere Schale (Norm 53)');
  assert.equal(solid(46, 80, 25), false, 'Kern (Norm 50)');
});

test('Sakristeitüren (B5): alle vier offen, Bronze nur im Bogenfeld, Rahmen aus gemeißeltem Quarz', () => {
  const doors = cellsOf('sakristei_tueren');
  let frames = 0, bronze = 0;
  for (const [k, t] of doors) {
    const y = Number(k.split(',')[1]);
    if (t === 'cut_copper') { bronze++; assert.ok(y > 75, 'Bronze nur über dem Kämpfer'); }
    if (t === 'chiseled_quartz') frames++;
  }
  assert.ok(frames > 100 && bronze > 0);
  // Durchgang in allen vier Diagonalen offen (Y 70)
  for (const [sx, sz] of [[1, -1], [1, 1], [-1, -1], [-1, 1]]) {
    assert.equal(solid(36 * sx, 70, 36 * sz), false);
    assert.equal(solid(37 * sx, 70, 37 * sz), false);
  }
});

// Lokale Zellen (a, y, w, Typ) einer Tribune aus der Welt
function localCells(key, suffix) {
  const t = TRIBUNES[key];
  const out = new Map();
  grid.forEach((x, y, z, e) => {
    if (e.module === 3 && e.part === `tribune_${key}_${suffix}`) {
      const [a, w] = t.toAW(x, z);
      out.set(a + ',' + y + ',' + w, e.type);
    }
  });
  return out;
}

test('Tribunen: drei identische Bauteilsätze, je Achse gespiegelt (Geometrie und Blocktyp)', () => {
  for (const suffix of ['mauern', 'gewoelbe', 'obergaden', 'daecher']) {
    const nord = localCells('nord', suffix);
    const ost = localCells('ost', suffix);
    const sued = localCells('sued', suffix);
    assert.ok(nord.size > 1000, `${suffix} zu klein`);
    for (const other of [ost, sued]) {
      assert.equal(other.size, nord.size, `${suffix}: Zellzahl`);
      for (const [k, t] of nord) assert.equal(other.get(k), t, `${suffix}: ${k}`);
    }
    for (const [k, t] of nord) {
      const [a, y, w] = k.split(',').map(Number);
      assert.equal(nord.get(a + ',' + y + ',' + (-w)), t, `${suffix}: Spiegelung an der Achse bei ${k}`);
    }
  }
});

test('Tribune: fünf Kapellen mit Raum, Fenster und Gewölbe; Raum und Obergaden-Fenster vorhanden', () => {
  const { isI } = m3._internal;
  const TC = D.CATHEDRAL.tribunes.centerDist;
  // Kapellenmitten (Tiefe 26 auf den fünf Seiten) in (a, w)
  const centers = [[TC, -26], [TC + 18, -18], [TC + 26, 0], [TC + 18, 18], [TC, 26]];
  const mauern = localCells('ost', 'mauern');
  const gew = localCells('ost', 'gewoelbe');
  for (const [a, w] of centers) {
    assert.equal(isI(a, w), false);
    for (const y of [66, 75, 85]) {
      assert.equal(mauern.has(a + ',' + y + ',' + w), false, `Kapellenraum belegt bei ${a},${y},${w}`);
      assert.equal(gew.has(a + ',' + y + ',' + w), false);
    }
    // Gewölbe und Verfüllung darüber
    assert.ok(gew.has(a + ',98,' + w) || gew.has(a + ',97,' + w), `Kapellenscheitel bei ${a},${w}`);
    assert.equal(mauern.has(a + ',100,' + w), true);
  }
  const glass = [...mauern.values()].filter((t) => t.endsWith('stained_glass')).length;
  assert.ok(glass >= 5 * 3 * 15 - 10, `Kapellenfenster: ${glass}`);
  const ober = localCells('ost', 'obergaden');
  const oc = [...ober.values()].filter((t) => t === 'yellow_stained_glass' || t === 'orange_stained_glass').length;
  assert.ok(oc >= 5 * 30, `Rundfenster: ${oc}`);
  // Gewölbescheitel des Tribunenraums bei Y 125/126 (Mitte a = 59)
  assert.ok(localCells('ost', 'gewoelbe').has(TC + ',125,0'));
  // Dächer: Tribunendach erreicht Y 136, Kapellendach beginnt bei Y 110
  const dach = localCells('ost', 'daecher');
  const ys = [...dach.keys()].map((k) => Number(k.split(',')[1]));
  assert.equal(Math.max(...ys), 136);
  assert.equal(Math.min(...ys), 105);
});

test('Eckbauten: Dach auf Y 104, Sakristeien (NO, SO) gewölbt, NW und SW ungewölbt', () => {
  const eck = cellsOf('eckbauten');
  for (const [k, t] of eck) {
    const y = Number(k.split(',')[1]);
    if (y === 104) assert.equal(t, 'terracotta');
    assert.ok(y >= 65 && y <= 104);
  }
  const { room } = m3._internal.eckbauModel();
  const vaulted = { ne: 0, se: 0, nw: 0, sw: 0 };
  for (const s of room) {
    const [x, z] = s.split(',').map(Number);
    for (let y = 89; y <= 100; y++) if (eck.has(x + ',' + y + ',' + z)) vaulted[(z < 0 ? 'n' : 's') + (x > 0 ? 'e' : 'w')]++;
  }
  assert.ok(vaulted.ne > 200 && vaulted.se > 200, JSON.stringify(vaulted));
  assert.equal(vaulted.nw + vaulted.sw, 0);
  // Raum ist ansonsten leer: Mitte der NO-Sakristei auf Lage Y 70
  const some = [...room].map((s) => s.split(',').map(Number)).find(([x, z]) => x > 0 && z < 0);
  assert.equal(solid(some[0], 70, some[1]), false);
});

test('Exedra-Sockel: Y 105..148, oberste 3 Lagen voll, Fläche entspricht inExedra', () => {
  const s = cellsOf('exedra_sockel');
  let minY = Infinity;
  for (const k of s.keys()) minY = Math.min(minY, Number(k.split(',')[1]));
  assert.equal(minY, 105);
  for (let x = -54; x <= 54; x++) {
    for (let z = -54; z <= 54; z++) {
      if (!inExedra(x, z) || inOctagon(x, z, 54)) continue;
      for (const y of [105, 106, 146, 147, 148]) assert.ok(s.has(x + ',' + y + ',' + z), `${x},${y},${z}`);
    }
  }
});

test('Content: vollständige Texte, Titel und Untertitel', () => {
  const c = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'content', 'steps_de', 'modul_3.json'), 'utf8'));
  assert.equal(c.module, 3);
  assert.equal(c.title, 'Vierung & Tribunen');
  assert.ok(c.subtitle.startsWith('Bautüte 3:'));
  assert.equal(c.icon, '✳️');
  assert.deepEqual(Object.keys(c.parts).sort(), [...PART_ORDER].sort());
  for (const [id, p] of Object.entries(c.parts)) {
    for (const f of ['title', 'description', 'tip', 'caution', 'fact']) assert.ok(p[f] && p[f].length > 10, `${id}.${f}`);
    assert.match(p.description, /Y \d+/, `${id}: Koordinatenhinweis`);
    const sentences = p.description.split(/(?<=[.!?])\s+/).filter(Boolean).length;
    assert.ok(sentences >= 2 && sentences <= 4, `${id}: ${sentences} Sätze`);
  }
  assert.equal(world.warnings.filter((w) => /Modul 3/.test(w)).length, 0);
});
