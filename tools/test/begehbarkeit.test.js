'use strict';
// B0: Treppen-Bibliothek, Licht-Hilfe, ctx.oeffnung/unzugaenglich, R13 Begehbarkeit, R14 Dichtheit.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildWorld } = require('../model/world.js');
const { validate } = require('../validate/index.js');
const { VoxelGrid, packKey } = require('../geom/grid.js');
const B = require('../validate/begehbarkeit.js');
const W = require('../wahrzeichen');
const palette = require('../spec/palette.js');
const { makeRahmen } = require('../wahrzeichen/rahmen.js');

const T = W.treppe;
const WZ = path.resolve(__dirname, '..', 'wahrzeichen').split(path.sep).join('/');

// ---------------------------------------------------------------- Treppen-Bibliothek
test('geradeTreppe: Stufen steigen um 1 je Block in Aufstiegsrichtung, Breite nach rechts, Typ mit Richtung', () => {
  const g = T.geradeTreppe({ start: { x: 10, y: 70, z: 20 }, richtung: 'n', stufen: 4, breite: 2, rolle: 'mauerwerk' });
  assert.equal(g.length, 8);
  for (const b of g) assert.equal(b.typ, 'stone_brick_stairs@n');
  const at = (k, q) => g.find((b) => b.z === 20 - k && b.x === 10 + q);
  for (let k = 0; k < 4; k++) for (let q = 0; q < 2; q++) assert.equal(at(k, q).y, 70 + k);
  // Osten: x wächst, rechts = Süden (+z)
  const e = T.geradeTreppe({ start: { x: 0, y: 5, z: 0 }, richtung: 'o', stufen: 3, breite: 3, rolle: 'holz' });
  assert.equal(e.length, 9);
  assert.ok(e.every((b) => b.typ === 'dark_oak_stairs@o'));
  assert.deepEqual(e.filter((b) => b.x === 2).map((b) => [b.y, b.z]).sort(), [[7, 0], [7, 1], [7, 2]]);
  assert.throws(() => T.geradeTreppe({ start: { x: 0, y: 0, z: 0 }, richtung: 'n', stufen: 3, breite: 1, rolle: 'holz' }), /breite/);
  assert.throws(() => T.geradeTreppe({ start: { x: 0, y: 0, z: 0 }, richtung: 'q', stufen: 3, breite: 2, rolle: 'holz' }), /n\|o\|s\|w/);
  for (const b of g) assert.ok(palette.isTreppe(b.typ));
});

test('weltRichtung: lokale Richtung wird im gedrehten Rahmen auf die nächste Weltachse gerundet', () => {
  assert.equal(T.weltRichtung('o', null), 'o');
  const r = makeRahmen({ ox: 0, oz: 0, thetaDeg: 17.4 });
  assert.equal(T.weltRichtung('o', r), 'o');
  assert.equal(T.weltRichtung('s', r), 's');
  const pv = makeRahmen({ ox: 0, oz: 0, thetaDeg: -79.8 });
  assert.equal(T.weltRichtung('o', pv), 'n'); // +u zeigt fast nach -z
  assert.equal(T.weltRichtung('s', pv), 'o');
  const g = T.geradeTreppe({ start: { x: 0, y: 0, z: 0 }, richtung: 'o', rahmen: pv, stufen: 2, breite: 2, rolle: 'mauerwerk' });
  assert.ok(g.every((b) => b.typ === 'stone_brick_stairs@n'));
});

test('treppenloch: 3 Luftzellen über jeder Stufe; kopffreiheit meldet blockierte Zellen', () => {
  const g = T.geradeTreppe({ start: { x: 0, y: 70, z: 0 }, richtung: 'o', stufen: 4, breite: 2, rolle: 'mauerwerk' });
  const loch = T.treppenloch(g.lauf);
  assert.equal(loch.length, 4 * 2 * 3);
  assert.ok(loch.some((c) => c.x === 3 && c.y === 74 && c.z === 0));
  assert.ok(loch.some((c) => c.x === 3 && c.y === 76 && c.z === 1));
  assert.ok(!loch.some((c) => c.x === 0 && c.y === 70)); // Stufe selbst ist nicht Teil des Lochs
  assert.equal(T.treppenloch(g.lauf, 4).length, 4 * 2 * 4);
  const blockiert = T.kopffreiheit(g, (x, y, z) => !(x === 1 && y === 73 && z === 1), 3);
  assert.deepEqual(blockiert, [{ x: 1, y: 73, z: 1 }]);
  assert.deepEqual(T.kopffreiheit(g, () => true), []);
});

test('podestTreppe: zwei Läufe mit Podest aus Vollblöcken, obere Stehfläche liegt über beiden Läufen', () => {
  const p = T.podestTreppe({ start: { x: 0, y: 70, z: 0 }, richtung: 'n', stufen1: 4, stufen2: 4, breite: 2, rolle: 'mauerwerk' });
  const stairs = p.filter((b) => palette.isTreppe(b.typ));
  assert.equal(stairs.length, 16);
  assert.equal(stairs.filter((b) => b.typ.endsWith('@n')).length, 8);
  assert.equal(stairs.filter((b) => b.typ.endsWith('@s')).length, 8);
  assert.equal(p.lauf.podeste.length, 2 * 2 * 2);
  assert.ok(p.lauf.podeste.every((c) => c.y === 73));
  assert.equal(p.lauf.oben.y, 78);
  assert.equal(new Set(p.map((b) => b.x + ',' + b.y + ',' + b.z)).size, p.length, 'keine Doppelbelegung');
});

test('wendeltreppe: Spirale um den Kern, Podeste in den Ecken, Viertelumlauf steigt um 2*radiusInnen+1', () => {
  const w = T.wendeltreppe({ mitte: { x: 0, z: 0 }, radiusInnen: 1, radiusAussen: 3, yVon: 70, yBis: 82, rolle: 'mauerwerk' });
  assert.equal(new Set(w.map((b) => b.x + ',' + b.y + ',' + b.z)).size, w.length, 'keine Doppelbelegung');
  const stairs = w.filter((b) => palette.isTreppe(b.typ));
  assert.equal(stairs.length, 12 * 2); // 12 Stufen Anstieg, Breite 2
  assert.deepEqual(w.lauf.start, { x: -2, y: 71, z: -2 });
  assert.deepEqual(w.lauf.ende, { x: -2, y: 83, z: -2 });
  assert.equal(w.lauf.laeufe.length, 4);
  assert.ok(w.some((b) => b.typ === 'stone_bricks' && b.x === 0 && b.z === 0 && b.y === 75)); // Kern
  assert.ok(!T.wendeltreppe({ mitte: { x: 0, z: 0 }, radiusInnen: 1, radiusAussen: 3, yVon: 70, yBis: 82, rolle: 'mauerwerk', kern: false })
    .some((b) => b.x === 0 && b.z === 0));
  assert.throws(() => T.wendeltreppe({ mitte: { x: 0, z: 0 }, radiusInnen: 2, radiusAussen: 3, yVon: 0, yBis: 5, rolle: 'holz' }), /Breite/);
});

// ---------------------------------------------------------------- Licht
test('lichtRaster: jede Bodenzelle höchstens 12 von einer Lichtquelle, Rolle licht, Boden- und Deckeneinbau', () => {
  const boden = [];
  for (let x = 0; x < 40; x++) for (let z = 0; z < 25; z++) boden.push({ x, y: 65, z });
  const decke = W.lichtRaster(boden, { abstand: 12, hoehe: 3 });
  assert.ok(decke.length >= 3 && decke.length <= 12, 'Anzahl ' + decke.length);
  assert.ok(decke.every((l) => l.typ === 'sea_lantern' && l.y === 68 && l.einbau === 'decke'));
  for (const b of boden) assert.ok(decke.some((l) => Math.hypot(l.x - b.x, l.z - b.z) <= 12), `ungedeckt ${b.x},${b.z}`);
  const im = W.lichtRaster(boden.map((b) => [b.x, b.y, b.z]), { abstand: 12 });
  assert.ok(im.every((l) => l.y === 64 && l.einbau === 'boden'));
  assert.equal(W.lichtRaster([{ x: 3, y: 65, z: 3 }], {}).length, 1);
  // zwei Geschosse und eine nicht zusammenhängende Insel
  const mehr = W.lichtRaster([...boden, { x: 100, y: 65, z: 100 }, { x: 5, y: 70, z: 5 }], { hoehe: 3 });
  assert.ok(mehr.some((l) => l.x === 100 && l.z === 100));
  assert.ok(mehr.some((l) => l.y === 73));
  assert.deepEqual(W.lichtRaster([], {}), []);
});

// ---------------------------------------------------------------- ctx.oeffnung / ctx.unzugaenglich
function tmpModell(code) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'begeh-'));
  fs.writeFileSync(path.join(dir, 'm1_haus.js'), code);
  return dir;
}

test('ctx.oeffnung und ctx.unzugaenglich: gespeichert pro Modul und Bauteil, Prüfung der Art', () => {
  const dir = tmpModell(`
module.exports = { module: 1, build(ctx) {
  const w = ctx.part('wand');
  w.set(0, 70, 0, 'stone_bricks');
  ctx.oeffnung([{ x: 1, y: 70, z: 0 }, [1, 71, 0]], 'tuer');
  ctx.unzugaenglich([[5, 70, 5]], 'Dachboden ohne Bedeutung');
  ctx.part('zwei');
  ctx.oeffnung([[2, 70, 0]], 'scharte');
  let fehler = 0;
  try { ctx.oeffnung([[3, 70, 0]], 'portal'); } catch (e) { fehler++; }
  try { ctx.unzugaenglich([[3, 70, 0]], ''); } catch (e) { fehler++; }
  if (fehler !== 2) throw new Error('Prüfung fehlt');
} };`);
  const w = buildWorld({ modules: [1], modelDir: dir, contentDir: path.join(dir, 'x') });
  assert.deepEqual(w.errors, []);
  assert.equal(w.oeffnungen.length, 2);
  assert.deepEqual(w.oeffnungen.map((o) => [o.module, o.part, o.art, o.keys.length]), [[1, 'wand', 'tuer', 2], [1, 'zwei', 'scharte', 1]]);
  assert.equal(w.oeffnungen[0].keys[0], packKey(1, 70, 0));
  assert.deepEqual(w.unzugaenglich.map((o) => [o.part, o.begruendung, o.keys.length]), [['wand', 'Dachboden ohne Bedeutung', 1]]);
});

// ---------------------------------------------------------------- R13 / R14 mit Modellen
// Haus: Boden y64 (Gelände bis 63), Wände y65..67, Dach y68, Innen x1..5, z1..5. Optionen steuern Tür, Treppe, Löcher.
function hausCode(opt) {
  return `
const W = require('${WZ}');
module.exports = { module: 1, build(ctx) {
  const o = ${JSON.stringify(opt)};
  const box = (x0, y0, z0, x1, y1, z1) => { const c = []; for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) c.push({ x, y, z }); return c; };
  const key = (c) => c.x + ',' + c.y + ',' + c.z;
  const obenY = o.obergeschoss ? 71 : 67;   // oberste Wandzeile
  ctx.part('boden').fill(box(0, 64, 0, 6, 64, 6), 'polished_tuff');
  let treppe = null;
  const aus = new Set();
  if (o.treppe) {
    treppe = W.treppe.geradeTreppe({ start: { x: 2, y: 65, z: 5 }, richtung: 'n', stufen: 4, breite: 2, rolle: 'mauerwerk' });
    for (const c of W.treppe.treppenloch(treppe.lauf)) aus.add(key(c));
    for (const c of treppe) aus.add(key(c));
  }
  const wand = box(0, 65, 0, 6, obenY, 6).filter((c) => c.x === 0 || c.x === 6 || c.z === 0 || c.z === 6);
  const frei = (c) => !(o.tuer && c.x === 3 && c.z === 0 && c.y <= 67) && !(o.loch && c.x === 0 && c.z === 3 && c.y === 66);
  ctx.part('waende').fill(wand.filter(frei), 'stone_bricks');
  if (o.tuer) ctx.oeffnung(box(3, 65, 0, 3, 67, 0), 'tuer');
  if (o.lochDeklariert) ctx.oeffnung([{ x: 0, y: 66, z: 3 }], 'fenster_offen');
  if (o.obergeschoss) ctx.part('decke').fill(box(1, 68, 1, 5, 68, 5).filter((c) => !aus.has(key(c))), 'polished_tuff');
  ctx.part('dach').fill(box(0, obenY + 1, 0, 6, obenY + 1, 6), 'terracotta');
  if (treppe) ctx.part('treppe').fill(treppe, (x, y, z) => treppe.find((b) => b.x === x && b.y === y && b.z === z).typ);
  if (o.unz) ctx.unzugaenglich(box(1, 65, 1, 5, 67, 5), 'Testkammer');
} };`;
}

function pruefe(opt, json = {}, extra = {}) {
  const dir = tmpModell(hausCode(opt));
  const w = buildWorld({ modules: [1], modelDir: dir, contentDir: path.join(dir, 'x') });
  assert.deepEqual(w.errors, [], JSON.stringify(w.errors));
  const project = { id: 'test', title: 'Test', type: 'wahrzeichen', json: { ohneMaske: true, ...json } };
  const res = validate({ grid: w.grid, world: w, stepsByModule: {}, project, only: ['R13', 'R14'],
    ground: { groundTopY: () => 63, hasGroundContact: () => false, minY: 0, maxY: 511 }, interfaces: { RESERVED: [] }, ...extra });
  return { w, r13: res.find((r) => r.rule === 'R13'), r14: res.find((r) => r.rule === 'R14') };
}

test('R13: geschlossenes Haus -> Innenraum nicht erreichbar (Warnung ohne Schalter, Fehler mit "pflicht")', () => {
  const a = pruefe({});
  assert.equal(a.r13.errors.length, 0);
  assert.ok(a.r13.warnings.some((m) => /nicht erreichbare Komponente: 25 Zellen/.test(m)), a.r13.warnings.join('\n'));
  assert.equal(a.r13.bericht.anteil, 0);
  assert.equal(a.r13.bericht.modus, 'warnung');
  const b = pruefe({}, { begehbarkeit: 'pflicht' });
  assert.equal(b.r13.errors.length, 1);
  assert.match(b.r13.errors[0], /^R13 nicht erreichbare Komponente: 25 Zellen/);
  assert.match(b.r13.errors[0], /Boden: 1\/boden/);
});

test('R13: Tür im Erdgeschoss -> alles erreichbar; deklarierte Unzugänglichkeit nimmt den Fehler', () => {
  const a = pruefe({ tuer: true }, { begehbarkeit: 'pflicht' });
  assert.deepEqual(a.r13.errors, []);
  assert.equal(a.r13.bericht.anteil, 100);
  assert.equal(a.r13.bericht.erreichbar, a.r13.bericht.innenZellen);
  assert.ok(a.r13.bericht.innenZellen >= 25);
  const b = pruefe({ unz: true }, { begehbarkeit: 'pflicht' });
  assert.deepEqual(b.r13.errors, []);
  assert.equal(b.r13.bericht.nichtErreichbareKomponenten, 0);
});

test('R13: Obergeschoss nur mit Treppe erreichbar (Treppenblöcke ohne Sprung, Treppenloch in der Decke)', () => {
  const ohne = pruefe({ tuer: true, obergeschoss: true }, { begehbarkeit: 'pflicht' });
  assert.equal(ohne.r13.errors.length, 1, ohne.r13.errors.join('\n'));
  const mit = pruefe({ tuer: true, obergeschoss: true, treppe: true }, { begehbarkeit: 'pflicht' });
  assert.deepEqual(mit.r13.errors, [], mit.r13.errors.join('\n'));
  assert.equal(mit.r13.bericht.anteil, 100);
  assert.ok(mit.r13.bericht.innenZellen > 25 + 10);
  // Der Weg über die Treppe braucht den Treppenblock: gleiche Treppe aus Vollblöcken (Sprung nötig) ist ebenfalls begehbar,
  // aber die Stufen steigen um 1 und die Kopffreiheit stimmt
  assert.deepEqual(T.kopffreiheit(T.geradeTreppe({ start: { x: 2, y: 65, z: 5 }, richtung: 'n', stufen: 4, breite: 2, rolle: 'mauerwerk' }),
    (x, y, z) => !mit.w.grid.has(x, y, z)), []);
});

test('R14: Wandloch ist eine Lücke; deklarierte Öffnung nimmt sie weg; Tür ist deklariert', () => {
  const dicht = pruefe({});
  assert.equal(dicht.r14.bericht.luecken, 0);
  const loch = pruefe({ loch: true }, { begehbarkeit: 'pflicht' });
  assert.equal(loch.r14.bericht.luecken, 1);
  assert.equal(loch.r14.bericht.lueckenLoch, 1);
  assert.equal(loch.r14.errors.length, 1);
  assert.match(loch.r14.errors[0], /^R14 Bauteil 1\/waende: 1 Lücke\(n\) \(0 nur diagonal\)/);
  const dekl = pruefe({ loch: true, lochDeklariert: true }, { begehbarkeit: 'pflicht' });
  assert.deepEqual(dekl.r14.errors, []);
  const tuer = pruefe({ tuer: true }, { begehbarkeit: 'pflicht' });
  assert.deepEqual(tuer.r14.errors, []);
  // Tür ohne Deklaration wäre eine Lücke
  const dir = tmpModell(hausCode({ tuer: true }).replace("if (o.tuer) ctx.oeffnung(box(3, 65, 0, 3, 67, 0), 'tuer');", ''));
  const w = buildWorld({ modules: [1], modelDir: dir, contentDir: path.join(dir, 'x') });
  const r = validate({ grid: w.grid, world: w, stepsByModule: {}, project: { id: 't', type: 'wahrzeichen', json: { ohneMaske: true, begehbarkeit: 'pflicht' } },
    only: ['R14'], ground: { groundTopY: () => 63, minY: 0, maxY: 511 }, interfaces: { RESERVED: [] } })[0];
  assert.equal(r.errors.length, 1);
});

test('R14: Diagonallücke in einer dünnen Schicht wird erkannt (18er-Nachbarschaft), echte Wand nicht', () => {
  const g = new VoxelGrid();
  const wr = g.writer({ module: 1, part: 'diagonale' });
  // Wand und Dach reichen über das ganze Raster, damit die Innenseite nur durch die Diagonale getrennt ist
  for (let i = -3; i <= 12; i++) for (let y = 64; y <= 67; y++) wr.set(i, y, i, 'stone_bricks');
  for (let x = -3; x <= 12; x++) for (let z = x; z <= 12; z++) wr.set(x, 68, z, 'stone_bricks');
  const mk = (grid) => B.bauRaster({ x0: -3, x1: 12, z0: -3, z1: 12, y0: 63, y1: 72, grid, gelaendeTop: () => 63 });
  const innen = (x, z) => z > x;
  const R = mk(g);
  const d = B.pruefeDichtheit(R, { innen, oeffnungen: new Set(), grid: g });
  assert.ok(d.lueckenDiagonal >= 1, 'diagonal ' + d.lueckenDiagonal);
  assert.equal(d.lueckenLoch, 0);
  // flächenverbundene Wand (Stufenlinie) ist dicht
  const g2 = new VoxelGrid();
  const w2 = g2.writer({ module: 1, part: 'treppe' });
  for (let i = -3; i <= 12; i++) for (let y = 64; y <= 67; y++) { w2.set(i, y, i, 'stone_bricks'); if (i < 12) w2.set(i + 1, y, i, 'stone_bricks'); }
  for (let x = -3; x <= 12; x++) for (let z = x; z <= 12; z++) w2.set(x, 68, z, 'stone_bricks');
  const d2 = B.pruefeDichtheit(mk(g2), { innen, oeffnungen: new Set(), grid: g2 });
  assert.equal(d2.cluster.length, 0, JSON.stringify(d2.cluster));
});

test('Begehbarkeit: Schrittregeln (Sprung nur mit Kopffreiheit, Treppenblock frei, Fallen bis 3)', () => {
  const grid = new VoxelGrid();
  const w = grid.writer({ module: 1, part: 'a' });
  // Gelände bis 63 implizit. Plattform 2 hoch (y 64..65) -> nicht erreichbar; Plattform 1 hoch (y 64) -> Sprung
  for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) { w.set(x, 64, z, 'stone'); w.set(x, 65, z, 'stone'); }
  for (let x = 6; x < 9; x++) for (let z = 0; z < 3; z++) w.set(x, 64, z, 'stone');
  const R = B.bauRaster({ x0: -2, x1: 11, z0: -2, z1: 5, y0: 62, y1: 72, grid, gelaendeTop: () => 63 });
  const seed = ((-2 + 2) * R.Zn + (0 + 2)) * R.Yn + (64 - 62); // (x -2, z 0, y 64) steht auf Gelände
  const vis = B.erreichbar(R, [seed]);
  const idx = (x, y, z) => ((x + 2) * R.Zn + (z + 2)) * R.Yn + (y - 62);
  assert.equal(vis[idx(7, 65, 1)], 1, 'Sprung auf 1 hohe Plattform');
  assert.equal(vis[idx(1, 66, 1)], 0, '2 Block hoch ohne Treppe');
  // mit Treppenblöcken davor erreichbar
  const grid2 = new VoxelGrid();
  const w2 = grid2.writer({ module: 1, part: 'a' });
  for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) { w2.set(x, 64, z, 'stone'); w2.set(x, 65, z, 'stone'); }
  for (let z = 0; z < 3; z++) w2.set(-1, 64, z, 'stone_brick_stairs@o');
  const R2 = B.bauRaster({ x0: -3, x1: 6, z0: -2, z1: 5, y0: 62, y1: 72, grid: grid2, gelaendeTop: () => 63 });
  const s2 = ((-3 + 3) * R2.Zn + (1 + 2)) * R2.Yn + (64 - 62);
  const vis2 = B.erreichbar(R2, [s2]);
  const i2 = (x, y, z) => ((x + 3) * R2.Zn + (z + 2)) * R2.Yn + (y - 62);
  assert.equal(vis2[i2(-1, 65, 1)], 1, 'auf Treppenblock ohne Sprung');
  assert.equal(vis2[i2(0, 66, 1)], 1, 'weiter auf die 2 hohe Plattform (+1 auf Vollblock mit Sprung, Kopffreiheit)');
  // Treppe von der hohen Seite betreten: Aufstieg nach Westen, Läufer kommt von Osten -> Vollblock-Regel (hier Sprung möglich)
  assert.equal(B.klasseVon('stone_brick_stairs@o_oben'), 1);
  assert.equal(B.klasseVon('stone_brick_stairs@o') & 7, 2);
  assert.equal(B.klasseVon('water'), 3);
});

// ---------------------------------------------------------------- Bauanleitung mit Treppen
test('Bauanleitung: Treppenblock mit Richtung benannt, Materialliste zählt Treppen je Material', () => {
  const dir = tmpModell(`
const W = require('${WZ}');
module.exports = { module: 1, build(ctx) {
  const t = W.treppe.geradeTreppe({ start: { x: 0, y: 70, z: 0 }, richtung: 'n', stufen: 4, breite: 2, rolle: 'mauerwerk' });
  const u = W.treppe.geradeTreppe({ start: { x: 10, y: 70, z: 0 }, richtung: 'o', stufen: 3, breite: 2, rolle: 'holz' });
  const w = ctx.part('treppen');
  w.fill(t, (x, y, z) => t.find((b) => b.x === x && b.y === y && b.z === z).typ);
  w.fill(u, (x, y, z) => u.find((b) => b.x === x && b.y === y && b.z === z).typ);
  ctx.part('sockel').fill([{ x: 5, y: 69, z: 0 }], 'stone_bricks');
} };`);
  const w = buildWorld({ modules: [1], modelDir: dir, contentDir: path.join(dir, 'x') });
  assert.deepEqual(w.errors, []);
  const { planModule } = require('../steps/planner.js');
  const steps = { 1: planModule(w.modules[0], w.modules[0].content, w.grid) };
  const { renderDocs } = require('../emit/docs.js');
  const root = path.resolve(__dirname, '..', '..');
  const project = { id: 'testproj', title: 'Test', type: 'wahrzeichen', docsDir: path.join(root, 'projects', 'testproj', 'docs'), legacy: false };
  const out = renderDocs({ modules: w.modules, stepsByModule: steps, grid: w.grid, root, project, complete: true });
  const guide = out.get('projects/testproj/docs/BAUANLEITUNG_MODUL_1.md');
  assert.match(guide, /Steinziegeltreppe, Aufstieg nach Norden \| `stone_brick_stairs@n` \| 8 \|/);
  assert.match(guide, /Schwarzeichentreppe, Aufstieg nach Osten \| `dark_oak_stairs@o` \| 6 \|/);
  assert.match(guide, /\*\*Treppen je Material\*\* \(alle Richtungen\)/);
  assert.match(guide, /\| Steinziegeltreppe \| `stone_brick_stairs` \| 8 \|/);
  assert.match(guide, /\| Schwarzeichentreppe \| `dark_oak_stairs` \| 6 \|/);
  const readme = out.get('projects/testproj/docs/README.md');
  assert.match(readme, /Treppen je Material/);
});
