'use strict';
// V3 W2: Loggia dei Lanzi (Katalog §11): Höhen, Bögen, Pfeiler, Medaillons, Maske, Blockzahlen.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');
const { loadRegistry } = require('../projects.js');
const { pruefeFelder } = require('../wahrzeichen');

const ROOT = path.resolve(__dirname, '..', '..');
const PROJ = path.join(ROOT, 'projects', 'loggia_dei_lanzi');
const project = loadRegistry(ROOT).projects.find((p) => p.id === 'loggia_dei_lanzi');
const G = require(path.join(PROJ, 'model', '_gemeinsam.js'));
const world = buildWorld({ project });
const grid = world.grid;
const rec = (n) => world.modules.find((m) => m.module === n);
const part = (id) => world.modules.flatMap((m) => m.parts).find((p) => p.id === id);
const Y0 = G.BODEN_Y;                                   // 67
const cellsAt = (iuList, iwList) => G.ZELLEN.filter((c) => iuList.includes(c.ru) && iwList.includes(c.rw));
const lowestSolid = (c, fromL = 3) => {                 // erste belegte Lage ab fromL (oder null)
  for (let L = fromL; L <= 40; L++) if (grid.has(c.x, Y0 + L, c.z)) return L;
  return null;
};

test('project.json: Pflichtfelder gültig, Werte laut Auftrag', () => {
  assert.deepEqual(pruefeFelder(project.json), []);
  assert.equal(project.json.bodenY, 67);
  assert.equal(project.json.luftraum, 0);
  assert.deepEqual(project.json.rahmen, { ox: -199, oz: 865, thetaDeg: 21.5 });
  assert.deepEqual(project.json.gebaeude, ['w43284457']);
});

test('Maske: 2.080 Zellen (OSM w43284457)', () => {
  assert.equal(G.MASKE.size, 2080);
  assert.equal(G.ZELLEN.length, 2080);
});

test('Build ohne Fehler, acht Module, Bauteile in Katalogreihenfolge', () => {
  assert.deepEqual(world.errors, []);
  assert.deepEqual(world.modules.map((m) => m.module), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(rec(0).parts.map((p) => p.id), ['bodenplatte', 'podest_front']);
  assert.deepEqual(rec(1).parts.map((p) => p.id), ['sockel_pfeiler', 'pfeiler_front', 'kapitelle_front', 'pilaster_rueckwand']);
  assert.deepEqual(rec(3).parts.map((p) => p.id), ['archivolten_front', 'archivolte_ost', 'schlusssteine']);
  assert.deepEqual(rec(4).parts.map((p) => p.id),
    ['kreuzgewoelbe_west', 'kreuzgewoelbe_mitte', 'kreuzgewoelbe_ost', 'konsolen_peducci']);
  assert.deepEqual(rec(5).parts.map((p) => p.id), ['fries', 'medaillons', 'terrasse', 'brustung', 'dachaustritt']);
  assert.equal(rec(6).parts.length, 11);
  assert.deepEqual(rec(7).parts.map((p) => p.id),
    ['perseus', 'sabinerinnen', 'herkules_nessus', 'polyxena', 'menelaos_patroklos', 'rueckwand_figuren', 'medici_loewen']);
});

test('Alle Zellen liegen in M_LL (Luftraum 0) und im Höhenbereich Y 67..100', () => {
  let n = 0;
  grid.forEach((x, y, z) => {
    n++;
    assert.ok(G.MASKE.has(x, z), `(${x},${y},${z}) außerhalb M_LL`);
    assert.ok(y >= 67 && y <= 100, `y ${y}`);
  });
  assert.ok(n > 20000);
});

test('Brüstungsoberkante Y 99, Terrasse Y 95..96', () => {
  const ys = (id) => { const y = part(id).keys.map((q) => q % 512); return [Math.min(...y), Math.max(...y)]; };
  assert.deepEqual(ys('brustung'), [97, 99]);
  assert.deepEqual(ys('terrasse'), [95, 96]);
  assert.deepEqual(ys('fries'), [92, 94]);                  // K0: Lage 25..27
  assert.deepEqual(ys('frontwand_ueber_bogen'), [81, 91]);   // K0: Lage 14..24
  assert.deepEqual(ys('medaillons'), [92, 94]);
});

test('Drei Frontbögen: Laibung im Scheitel auf Y 89 (Lage 22), darunter Luft bis zum Boden', () => {
  for (const b of G.BOGEN) {
    const mitte = cellsAt([Math.floor(b.m), Math.ceil(b.m)], [1, 2]);
    assert.ok(mitte.length >= 2, `Bogen ${b.m}: ${mitte.length} Zellen`);
    for (const c of mitte) {
      assert.equal(lowestSolid(c, 3), 22, `Bogen ${b.m} bei (${c.x},${c.z})`);
      assert.ok(!grid.has(c.x, Y0 + 21, c.z));
      assert.equal(Y0 + 22, 89);
    }
  }
});

test('Seitenbogen Ost: Scheitel der Laibung auf Y 88 (Lage 21), Spannweite 16 (w 6..21)', () => {
  const mitte = cellsAt([36, 37, 38], [13, 14]);
  assert.ok(mitte.length >= 4);
  for (const c of mitte) assert.equal(lowestSolid(c, 3), 21, `(${c.x},${c.z})`);
  const rand = cellsAt([36, 37, 38], [6, 21]);               // untere Öffnung: Luft von Lage 3 bis 13
  for (const c of rand) for (let L = 3; L <= 13; L++) {
    // Rand-Zellen können den Halbsäulen-/Pilasterzellen des Pfeilers gehören (K0): dort nur prüfen, was Luft sein soll
    if (G.seitenbogenLuft(c.iu, c.iw, L) && G.pfeilerIndex(c.iu) < 0 && !G.halbsaeuleHalle(c.iu, c.iw, L)) {
      assert.ok(!grid.has(c.x, Y0 + L, c.z), `(${c.x},${L},${c.z})`);
    }
  }
});

test('Vier Pfeiler, drei Bögen: Läufe entlang der Front (Y 75)', () => {
  const lauf = [];
  for (let u = G.U_MIN; u <= G.U_MAX; u++) {
    const cs = cellsAt([u], [1]);
    if (!cs.length) continue;                                  // Rohindex ohne Weltzelle im gedrehten Raster
    const solid = cs.some((c) => grid.has(c.x, Y0 + 8, c.z));
    if (!lauf.length || lauf[lauf.length - 1].solid !== solid) lauf.push({ solid, u0: u, u1: u });
    else lauf[lauf.length - 1].u1 = u;
  }
  assert.deepEqual(lauf.map((l) => l.solid), [true, false, true, false, true, false, true]);
  const pf = lauf.filter((l) => l.solid);
  for (const [i, l] of pf.entries()) {
    assert.ok(l.u0 >= G.PFEILER[i][0] - 1 && l.u1 <= G.PFEILER[i][1] + 1, `Pfeiler ${i}: ${l.u0}..${l.u1}`);
  }
});

test('Vier Medaillons: je ein goldener Mittelblock, Rahmen aus Ornament, Grund aus blauer Keramik', () => {
  const gold = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'gold_block') gold.push({ x, y, z }); });
  assert.equal(gold.length, 4);
  const lokal = gold.map((q) => { const l = G.RAHMEN.toLocal(q.x, q.z); return { ...q, u: Math.floor(l.u), w: Math.floor(l.w) }; });
  for (const q of lokal) {
    assert.equal(q.y, Y0 + 26);
    assert.ok(q.w <= 1, `w ${q.w}`);
  }
  assert.deepEqual(lokal.map((q) => G.MEDAILLON_U.findIndex((m) => Math.abs(q.u - m) <= 1)).sort(), [0, 1, 2, 3]);
  let blau = 0, ornament = 0;
  for (const k of part('medaillons').keys) {
    const t = grid.typeOfKey(k);
    if (t === 'blue_terracotta') blau++;
    if (t === 'chiseled_quartz') ornament++;
  }
  assert.ok(blau >= 28 && ornament >= 24, `blau ${blau}, ornament ${ornament}`);
});

test('Archivolten: Zellen des Rings gehören nur Modul 3 (K0, Details gewinnen)', () => {
  let ring = 0, andere = 0;
  for (const c of G.ZELLEN) {
    for (let L = 14; L <= 24; L++) {
      if (!(G.archivolteFront(c.iu, c.iw, L) || G.archivolteOst(c.iu, c.iw, L))) continue;
      if (!grid.has(c.x, Y0 + L, c.z)) continue;
      ring++;
      if (grid.ownerModule(c.x, Y0 + L, c.z) !== 3) andere++;
    }
  }
  assert.ok(ring > 1000, `Ringzellen ${ring}`);
  assert.equal(andere, 0);
});

test('Gewölbe: drei Joche, Scheitel Y 89, Dicke 2, Kämpferlage nicht unter Y 81', () => {
  for (const b of G.BOGEN) {
    const mitte = cellsAt([Math.floor(b.m), Math.ceil(b.m)], [11, 12, 13]);
    assert.ok(mitte.length >= 3);
    for (const c of mitte) {
      assert.equal(lowestSolid(c, 14), 22);      // darunter können Sockel/Statuen stehen
      assert.ok(grid.has(c.x, Y0 + 22, c.z) && grid.has(c.x, Y0 + 23, c.z));
      assert.equal(grid.ownerModule(c.x, Y0 + 22, c.z), 4);
    }
  }
  for (const id of ['kreuzgewoelbe_west', 'kreuzgewoelbe_mitte', 'kreuzgewoelbe_ost']) {
    const ys = part(id).keys.map((q) => q % 512);
    assert.equal(Math.min(...ys), Y0 + 14);
    assert.ok(Math.max(...ys) <= Y0 + 26);
  }
});

test('Konsolsteine: acht Gruppen im Rahmen LL, Lage 11..12 (Y 78..79)', () => {
  const ks = part('konsolen_peducci').keys;
  assert.ok(ks.length > 40);
  for (const k of ks) assert.ok([78, 79].includes(k % 512));
  for (const g of G.KONSOLEN_U) {
    const n = G.ZELLEN.filter((c) => c.iu >= g[0] && c.iu <= g[1] && c.iw >= 19 && c.iw <= 20 && grid.ownerModule(c.x, Y0 + 11, c.z) === 4).length;
    assert.ok(n >= 1, `Konsole u ${g}`);
  }
  assert.equal(G.KONSOLEN_U.length, 8);
});

test('K5: Medici-Löwen auf Y 68..69; Statuen: Content-Hinweis "vereinfachte Blockfigur"', () => {
  const ys = part('medici_loewen').keys.map((q) => q % 512);
  assert.equal(Math.min(...ys), 68);
  const c7 = JSON.parse(fs.readFileSync(path.join(PROJ, 'content', 'modul_7.json'), 'utf8'));
  assert.ok(c7.subtitle.includes('vereinfachte Blockfigur, nicht nach Vorbild'));
  for (const [id, t] of Object.entries(c7.parts)) {
    assert.ok(/vereinfachte Blockfigur, nicht nach Vorbild/i.test(t.description + t.caution), id);
  }
});

test('Materialien nur über Rollen (Palette), Blockzahlen je Modul ±30 % gegen den Richtwert', () => {
  const erlaubt = new Set(Object.values(G.T));
  grid.forEach((x, y, z, e) => assert.ok(erlaubt.has(e.type), e.type));
  const n = (m) => rec(m).parts.reduce((s, p) => s + p.keys.length, 0);
  const richt = [2300, 3000, 14000, 1500, 2700, 5500];
  richt.forEach((r, m) => assert.ok(n(m) >= r * 0.7 && n(m) <= r * 1.3, `Modul ${m}: ${n(m)} gegen ${r}`));
  assert.ok(n(6) + n(7) >= 650 * 0.7 && n(6) + n(7) <= 650 * 1.3, `Modul 6+7: ${n(6) + n(7)}`);
  const gesamt = [0, 1, 2, 3, 4, 5, 6, 7].reduce((s, m) => s + n(m), 0);
  assert.ok(gesamt >= 22000 && gesamt <= 38000, `Gesamt ${gesamt}`);
});

test('Content: jedes gebaute Bauteil hat Titel, Beschreibung, Tipp, Achtung, Fakt', () => {
  for (const m of world.modules) {
    const c = JSON.parse(fs.readFileSync(path.join(PROJ, 'content', `modul_${m.module}.json`), 'utf8'));
    assert.equal(c.module, m.module);
    for (const p of m.parts) {
      const t = c.parts[p.id];
      assert.ok(t, `Content fehlt: Modul ${m.module} ${p.id}`);
      for (const f of ['title', 'description', 'tip', 'caution', 'fact']) assert.ok(typeof t[f] === 'string' && t[f].length > (f === 'title' ? 3 : 10), `${p.id}.${f}`);
    }
  }
});
