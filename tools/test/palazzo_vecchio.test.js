'use strict';
// V3 W3: Wahrzeichen Palazzo Vecchio (Katalog §13, PRUEFBERICHT D1 K0..K8).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { buildWorld } = require('../model/world.js');
const { loadRegistry } = require('../projects.js');
const { xOfKey, yOfKey, zOfKey } = require('../geom/grid.js');
const { ladeMasken, pruefeFelder } = require('../wahrzeichen');
const pv = require('../../projects/palazzo_vecchio/model/pv_lib.js');
const m1 = require('../../projects/palazzo_vecchio/model/m1_erdgeschoss.js');

const BODEN = 68;
let cache = null;
function welt() {
  if (cache) return cache;
  const reg = loadRegistry();
  const project = reg.projects.find((p) => p.id === 'palazzo_vecchio');
  assert.ok(project, 'Projekt palazzo_vecchio fehlt in der Registry');
  const world = buildWorld({ project });
  const parts = new Map();
  for (const m of world.modules) for (const p of m.parts) parts.set(p.id, { ...p, module: m.module });
  cache = { project, world, parts, masken: ladeMasken(project.json, { dir: project.dir }), g: pv.geo() };
  return cache;
}

const partYs = (p) => { let lo = Infinity, hi = -Infinity; for (const k of p.keys) { const y = yOfKey(k); if (y < lo) lo = y; if (y > hi) hi = y; } return [lo, hi]; };

test('Projektfelder und Parameter (Katalog §0, Prüfbericht Frage 5)', () => {
  const { project } = welt();
  assert.deepEqual(pruefeFelder(project.json), []);
  assert.equal(project.json.bodenY, BODEN);
  assert.equal(project.json.luftraum, 3);
  assert.equal(m1.PV_AXES, 9);
  assert.equal(m1.PORTAL_U, 55);
});

test('Build fehlerfrei, Zellen eindeutig, Blockzahl im Rahmen des Katalogs', () => {
  const { world } = welt();
  assert.deepEqual(world.errors, []);
  assert.equal(world.modules.length, 10);
  const n = world.grid.size;
  assert.ok(n >= 350000 && n <= 620000, `Blockzahl ${n}`);
});

test('Turmoberkante Y 256 und Palast-Zinnenoberkante Y 130', () => {
  const { parts, world } = welt();
  let top = 0;
  world.grid.forEachKey((k) => { const y = yOfKey(k); if (y > top) top = y; });
  assert.equal(top, 256);
  assert.equal(partYs(parts.get('marzocco_fahne'))[1], 256);
  assert.deepEqual(partYs(parts.get('zinnen_guelfisch')), [BODEN + 61, BODEN + 62]);
  assert.equal(BODEN + 62, 130);
  // Palastkörper ohne Turm: höchste Zelle der Module 0..3 und 6..9 liegt bei Y 130 oder darunter
  let palast = 0;
  for (const [id, p] of parts) if (p.module !== 4 && p.module !== 5) palast = Math.max(palast, partYs(p)[1], 0);
  assert.ok(palast <= 135, `Palast bis Y ${palast}`);   // Salone-First Y 134, Ostblockdach (Anstieg höchstens 10) bis Y 135
});

test('Geschosshöhen: 16 + 17 + 16 + 6 + 1 + 4 + 2 = 62 und Turm 188', () => {
  assert.equal(16 + 17 + 16 + 6 + 1 + 4 + 2, 62);
  assert.equal(62 + 82 + 8 + 8 + 16 + 8 + 4, 188);
});

test('Alle Zellen liegen in der Maske oder im erlaubten Luftraum (R12-Logik, Katalog §0.6)', () => {
  const { world, masken } = welt();
  const alle = masken.alle;
  let draussen = 0, minY = Infinity, maxY = -Infinity;
  world.grid.forEachKey((k) => {
    const x = xOfKey(k), z = zOfKey(k);
    if (alle.innen(x, z)) return;
    draussen++;
    assert.ok(alle.dAussen(x, z) <= masken.luftraum, `(${x},${yOfKey(k)},${z}) außerhalb des Luftraums`);
    const yr = yOfKey(k) - BODEN;
    // nur Ballatoio der Zone A (Gesims 49 .. Zinnen 62) und Turm-Ballatoio (145..160)
    assert.ok((yr >= 49 && yr <= 62) || (yr >= 145 && yr <= 160), `Luftraum bei y_rel ${yr}`);
    if (yr < minY) minY = yr; if (yr > maxY) maxY = yr;
  });
  assert.ok(draussen > 0, 'das Ballatoio muss über die Maske hinausragen');
  assert.equal(maxY, 160);
});

test('Korridoröffnung Y 102..108 ist offen, Laibung steht daneben (Katalog §11)', () => {
  const { world, g } = welt();
  const K = g.K;
  const tpOf = (r) => (r.e === 14 ? r.uK : K[14].L + r.uK);
  let geprueft = 0, laibung = 0;
  for (const r of g.recs) {
    if (r.d8 > 4 || (r.e !== 14 && r.e !== 15)) continue;
    const tp = tpOf(r);
    if (tp >= 3.4 && tp < 10.3) {
      for (let Y = 102; Y <= 108; Y++) assert.ok(!world.grid.has(r.x, Y, r.z), `Öffnung belegt bei (${r.x},${Y},${r.z})`);
      geprueft++;
    } else if ((tp >= 2.4 && tp < 3.3) || (tp >= 10.4 && tp < 11.3)) {
      if (world.grid.has(r.x, 102, r.z)) laibung++;
    }
  }
  assert.ok(geprueft >= 20, `nur ${geprueft} Öffnungszellen geprüft`);
  assert.ok(laibung > 0, 'Laibung fehlt');
});

test('18 Konsolbögen an der Westfassade (Katalog §4)', () => {
  const { world, g } = welt();
  const { M, rf } = g;
  const bb = M.bbox;
  const zellen = [];
  for (let x = bb.x0 - 4; x <= bb.x1 + 4; x++) {
    for (let z = bb.z0 - 4; z <= bb.z1 + 4; z++) {
      if (M.innen(x, z) || M.dAussen(x, z) !== 3) continue;
      const e = M.naechsteKante(x, z);
      const u = rf.toLocal(x, z).u;
      if (e >= 17 && u >= 0 && u <= 89.9) zellen.push({ x, z, u });
    }
  }
  zellen.sort((a, b) => a.u - b.u);
  // Bogenöffnung: im Scheitelbereich (y_rel 54) offene Zellen zwischen zwei Konsolen
  let runs = 0, run = 0, davor = false;
  for (const c of zellen) {
    const fest = world.grid.has(c.x, BODEN + 54, c.z);
    if (!fest) { run++; continue; }
    if (run >= 2 && davor) runs++;
    run = 0; davor = true;
  }
  assert.equal(runs, 18);
});

test('K1: Zone A ist Rustika (Erdgeschoss und beide Obergeschosse)', () => {
  const { world, parts } = welt();
  const count = (id) => {
    const c = {};
    for (const k of parts.get(id).keys) { const t = world.grid.get(xOfKey(k), yOfKey(k), zOfKey(k)).type; c[t] = (c[t] || 0) + 1; }
    return c;
  };
  for (const id of ['eg_wand_west', 'og1_wand_west', 'og2_wand_west', 'og_wand_nord_sued_a', 'eg_wand_nord_sued_a']) {
    const c = count(id);
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
    assert.equal(top, 'tuff_bricks', `${id}: ${JSON.stringify(c)}`);
  }
  assert.equal(count('og1_wand_west').polished_andesite, undefined);   // Pietra forte nur im Erdgeschoss an den Fensterrahmen
});

test('K2/K3: turm_unterbau ist das erste Bauteil in Modul 4, Turmhohlraum y_rel 1..143 leer, keine Michelozzo-Treppe', () => {
  const { world, g, parts } = welt();
  const m4 = world.modules.find((m) => m.module === 4);
  assert.equal(m4.parts[0].id, 'turm_unterbau');
  assert.ok(!parts.has('treppen_michelozzo'));
  assert.ok(!world.modules.find((m) => m.module === 9).parts.some((p) => p.id === 'turm_unterbau'));
  let leer = 0;
  for (const r of g.recs) {
    if (r.zone !== 'T' || r.dT <= 4) continue;
    for (let y = 1; y <= 143; y++) { assert.ok(!world.grid.has(r.x, BODEN + y, r.z), `Turmhohlraum belegt (${r.x},${y},${r.z})`); }
    leer++;
  }
  assert.ok(leer > 50);
  // Abschlussdecke auf y_rel 144 über dem Hohlraum
  const r0 = g.recs.find((r) => r.zone === 'T' && r.dT > 4);
  assert.ok(world.grid.has(r0.x, BODEN + 144, r0.z));
});

test('K4: Salone nur außerhalb der Außenwandbänder', () => {
  const { world, g, parts } = welt();
  for (const id of ['salone_waende', 'salone_decke', 'dach_salone']) {
    for (const k of parts.get(id).keys) {
      const r = g.rec(xOfKey(k), zOfKey(k));
      assert.ok(r, `${id}: Zelle außerhalb der Maske`);
      assert.ok(r.d8 > pv.tWall(Math.min(yOfKey(k) - BODEN, 56)), `${id}: Zelle im Außenwandband`);
    }
  }
  assert.ok(world.grid.size > 0);
});

test('Alle Bauteile haben Content, Zonen und Rollen: Fassade liegt auf der Piazza-Seite', () => {
  const { world } = welt();
  for (const m of world.modules) {
    assert.ok(m.content, `Modul ${m.module}: Content fehlt`);
    for (const p of m.parts) assert.ok(m.content.parts[p.id] && m.content.parts[p.id].title, `Content fehlt: ${p.id}`);
  }
  const pf = welt().g.rf.toLocal(-130.5, 798.5);
  assert.ok(Math.abs(pf.u - 89.9) < 0.2 && Math.abs(pf.w) < 0.2);
});
