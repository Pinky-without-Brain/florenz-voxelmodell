'use strict';
// Orsanmichele (V3 W1): Prüfliste des Katalogs (§13) und Konsistenz mit der OSM-Maske.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');
const { loadRegistry } = require('../projects.js');
const { main } = require('../build.js');
const { unpackKey } = require('../geom/grid.js');
const O = require('../../projects/orsanmichele/lib/om.js');

const ROOT = path.resolve(__dirname, '..', '..');
const project = loadRegistry().projects.find((p) => p.id === 'orsanmichele');
const world = project ? buildWorld({ project }) : null;
const L = O.lade();
const partCells = (mod, id) => {
  const m = world.modules.find((x) => x.module === mod);
  const p = m.parts.find((x) => x.id === id);
  return p.keys.map((k) => unpackKey(k));
};
const allParts = () => world.modules.flatMap((m) => m.parts.map((p) => ({ module: m.module, id: p.id, keys: p.keys })));

test('Projekt orsanmichele ist registriert, 10 Module, keine Baufehler', () => {
  assert.ok(project, 'Projekt nicht in der Registry');
  assert.deepEqual(world.errors, []);
  assert.deepEqual(world.modules.map((m) => m.module), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const mj = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'orsanmichele', 'project.json'), 'utf8'));
  assert.equal(mj.type, 'wahrzeichen');
  assert.equal(mj.bodenY, 68);
  assert.deepEqual(mj.gebaeude, ['w442508011']);
});

test('Blockzahlen: Gesamtsumme im Richtwert 60 k bis 105 k, kein Modul leer', () => {
  assert.ok(world.grid.size >= 60000 && world.grid.size <= 105000, String(world.grid.size));
  for (const m of world.modules) assert.ok(m.parts.reduce((s, p) => s + p.keys.length, 0) > 0, 'Modul ' + m.module);
});

test('Dachfirst Y 148 (Lage 80), Traufe Y 143 (Lage 75), Gesimsoberkante Y 142 (Lage 74)', () => {
  const b = world.grid.bounds();
  assert.equal(b.maxY, 148);
  const dach = partCells(5, 'dach');
  assert.equal(Math.min(...dach.map((c) => c.y)), 143);
  assert.ok(Math.max(...dach.map((c) => c.y)) <= 147);
  assert.ok(partCells(5, 'dachkamm').every((c) => c.y === 148));
  const kg = partCells(4, 'kranzgesims');
  assert.ok(kg.length > 0 && kg.every((c) => c.y === 142));
});

test('14 Tabernakel: 4 / 4 (N, S) und 3 / 3 (W, E)', () => {
  assert.equal(O.TAB_DEFS.length, 14);
  const n = { N: 0, S: 0, W: 0, E: 0 };
  for (const t of O.TAB_DEFS) n[t.seite]++;
  assert.deepEqual(n, { N: 4, S: 4, W: 3, E: 3 });
  // jedes Tabernakel hat in der Welt eine Bank (Lage 7) mit mindestens 5 Zellen
  const karte = O.tabKarte();
  const proTab = new Map();
  for (const t of karte.values()) proTab.set(t.idx, (proTab.get(t.idx) || 0) + 1);
  assert.equal(proTab.size, 14);
  for (const k of proTab.values()) assert.ok(k >= 5);
  const bank = partCells(1, 'tabernakel').filter((c) => c.y === 68 + 7);
  assert.equal(bank.length, [...karte.values()].length);
  // 14 Statuen in den Nischen: je Tabernakel mindestens ein Kopf (Lage 12); Doppelzellen der Drehung zählen mit
  const koepfe = new Set();
  for (const c of partCells(9, 'statuen').filter((x) => x.y === 68 + 12)) koepfe.add(karte.get(O.K(c.x, c.z)).idx);
  assert.equal(koepfe.size, 14);
});

test('Außenmaße 69 x 48: alle Zellen in der OSM-Maske oder im erlaubten Luftraum', () => {
  const M = L.masken;
  let draussen = 0;
  const erlaubt = new Set(['kranzgesims', 'arkadenfries', 'dach']);
  for (const p of allParts()) {
    for (const k of p.keys) {
      const c = unpackKey(k);
      if (M.alle.has(c.x, c.z)) continue;
      assert.ok(erlaubt.has(p.id), `${p.id} außerhalb der Maske bei ${c.x},${c.y},${c.z}`);
      assert.ok(L.H.dAussen(c.x, c.z) <= 2, `${p.id}: Auskragung weiter als 2`);
      assert.ok(c.y >= 68 + 70, `${p.id}: Auskragung unterhalb Lage 70`);
      draussen++;
    }
  }
  assert.ok(draussen > 0);
  // Nominalraster: Maske liegt im Rahmen u -34.6..34.5, w -24..23.8
  let umin = 1e9, umax = -1e9, wmin = 1e9, wmax = -1e9;
  for (const c of L.zellen) { umin = Math.min(umin, c.u); umax = Math.max(umax, c.u); wmin = Math.min(wmin, c.w); wmax = Math.max(wmax, c.w); }
  assert.ok(umax - umin > 68 && umax - umin < 70, String(umax - umin));
  assert.ok(wmax - wmin > 47 && wmax - wmin < 49, String(wmax - wmin));
});

test('Gewölbescheitel (Lage 22) liegt unter der Deckenunterkante (Lage 25)', () => {
  const gw = partCells(6, 'kreuzgewoelbe');
  const decke = partCells(6, 'decke_eg');
  const scheitel = Math.max(...gw.map((c) => c.y));
  assert.ok(scheitel < Math.min(...decke.map((c) => c.y)), `${scheitel}`);
  assert.equal(Math.min(...decke.map((c) => c.y)), 68 + 25);
  assert.equal(scheitel, 68 + 23);                     // Laibung Lage 22, Dicke 2
  assert.ok(gw.some((c) => c.y === 68 + 22));
});

test('Pfeiler: 4 Eck-, 4 lange und 2 kurze Pfeiler, Höhe Lage 3..26', () => {
  for (const id of ['pfeiler_eck', 'pfeiler_lang', 'pfeiler_kurz']) {
    const c = partCells(1, id);
    assert.equal(Math.min(...c.map((x) => x.y)), 68 + 3, id);
    assert.equal(Math.max(...c.map((x) => x.y)), 68 + 26, id);
  }
  const eck = L.zellen.filter((c) => { const r = O.ring(c); return r && r.typ === 'eck'; });
  assert.ok(eck.length >= 4 * 36 && eck.length <= 4 * 36 + 30, String(eck.length));
});

test('Bogenfelder: 10 Spitzbögen, Scheitel Lage 22, Kämpfer Lage 13', () => {
  assert.ok(Math.abs(O.yIn(0) - 22) < 1e-9);
  assert.ok(Math.abs(O.yIn(7.5) - 13) < 1e-9);
  const ringe = partCells(2, 'bogenringe');
  assert.ok(ringe.length > 0);
  assert.ok(Math.max(...ringe.map((c) => c.y)) <= 68 + 24);
  // zwei Türen mit Holz
  const tueren = partCells(2, 'tueren');
  assert.ok(tueren.length > 0);
});

test('Obergeschosse: Wappen in den Lagen 46..47 und 68..69, Fries 70..73, Decken ohne Wandring', () => {
  const w1 = partCells(3, 'og1_wappen');
  assert.ok(w1.length > 0 && w1.every((c) => c.y === 68 + 46 || c.y === 68 + 47));
  const og2 = partCells(4, 'og2_biforien').filter((c) => c.y >= 68 + 68);
  assert.ok(og2.length > 0 && og2.every((c) => c.y === 68 + 68 || c.y === 68 + 69));
  const fries = partCells(4, 'arkadenfries');
  assert.equal(Math.min(...fries.map((c) => c.y)), 68 + 70);
  assert.equal(Math.max(...fries.map((c) => c.y)), 68 + 73);
  const d2 = partCells(7, 'decke_og2');
  assert.ok(d2.every((c) => c.y === 68 + 74 && L.byKey.get(O.K(c.x, c.z)).d >= 4));
  const d1 = partCells(7, 'decke_og1');
  assert.ok(d1.every((c) => c.y === 68 + 51));
  assert.ok(d1.length < L.zellen.filter((c) => c.d >= 4).length, 'Treppenloch fehlt');
});

test('Verbindungsbogen: Durchgang in der Westwand OG1 ist offen', () => {
  const wand = new Set(partCells(3, 'og1_wand').map((c) => `${c.x},${c.y},${c.z}`));
  let offen = 0;
  for (const c of L.zellen) {
    if (!O.durchgang(c, 30)) continue;
    assert.ok(!wand.has(`${c.x},${68 + 30},${c.z}`), 'Wand im Durchgang');
    offen++;
  }
  assert.ok(offen >= 5 * 3 - 3, String(offen));
});

test('Content: jedes Bauteil hat Titel und Beschreibung, Statuen mit Hinweis', () => {
  for (const m of world.modules) {
    assert.ok(m.content, 'Modul ' + m.module);
    for (const p of m.parts) {
      const t = m.content.parts[p.id];
      assert.ok(t && t.title && t.description && t.tip && t.caution && t.fact, `${m.module}/${p.id}`);
    }
  }
  const st = world.modules.find((m) => m.module === 9).content.parts.statuen;
  assert.match(st.description, /vereinfachte Blockfigur, nicht nach Vorbild/);
});

test('Build orsanmichele ist grün (R1 bis R12)', (t) => {
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'warn', () => {});
  assert.equal(main(['--project', 'orsanmichele', '--no-emit'], { root: ROOT }), 0);
  const rep = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', 'report_orsanmichele.json'), 'utf8'));
  assert.equal(rep.status, 'OK');
  for (const r of rep.rules) assert.equal(r.errors, 0, r.rule);
  assert.ok(rep.rules.some((r) => r.rule === 'R12'));
});
