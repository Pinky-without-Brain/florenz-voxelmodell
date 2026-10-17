'use strict';
// W8a: Palazzo dei Mozzi (projects/palazzo_mozzi): Maske, sieben Fornici, Hanglage, Turm, Hof, Räume, Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const MZ = require('../../projects/palazzo_mozzi/model/_mz.js');
const RA = require('../../projects/palazzo_mozzi/model/_raeume.js');

const project = getProject('palazzo_mozzi', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = MZ.Y;
const D = MZ.lade();
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };

test('Mozzi: Projektfelder, Maske mit Hof, keine Baufehler, Turm überragt das Dach', () => {
  assert.equal(project.json.type, 'wahrzeichen');
  assert.equal(project.json.bodenY, 66);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 7084);
  assert.equal(D.H.loecher().length, 1);
  assert.equal(MZ.TRAUFE, 30, 'Traufe 30 Blöcke (OSM-Schätzung)');
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(RA.TURM.top), 'höchster Block: Deckplatte des Turms');
});

test('Mozzi: Hang abgetragen, Fußboden auf der Höhe der Piazza (bodenY 66)', () => {
  const ground = ctx.ground;
  let hoch = 0, tief = 0;
  for (const c of D.haupt) { const g = ground.groundTopY(c.x, c.z); if (g > Y(0) - 1) hoch++; if (g < Y(0) - 1) tief++; }
  assert.equal(hoch, 0, 'Gelände in der Maske höchstens bodenY − 1');
  assert.ok(tief < D.haupt.length, 'Teil der Maske liegt bereits tiefer (Fundament füllt auf)');
  const rueck = D.haupt.filter((c) => c.w > 90);
  assert.ok(rueck.length > 500, 'Rückseite an der Hangkante vorhanden');
});

test('Mozzi: sieben Fornici zur Piazza offen, mindestens 2 breit und 3 hoch', () => {
  assert.equal(RA.PORTALE.length, 7);
  for (const p of RA.PORTALE) {
    const c = D.haupt.filter((q) => q.d8 <= 2 && Math.abs(q.u - p.u) < 1 && q.w < 3);
    assert.ok(c.length >= 2, `Portalzellen bei u ${p.u}`);
    for (const q of c) for (let yr = 1; yr <= 6; yr++) assert.ok(!grid.has(q.x, Y(yr), q.z), `Portal u ${p.u} Lage ${yr}`);
  }
});

test('Mozzi: begehbar bis ins oberste Geschoss, Hof und benannte Räume, dicht', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const steh = (teil, yBoden) => {
    let best = null;
    grid.forEach((x, y, z, e) => {
      if (e.part !== teil || y !== yBoden || best) return;
      if (!grid.has(x, y + 1, z) && !grid.has(x, y + 2, z) && !grid.has(x, y + 3, z)) best = [x, y + 1, z];
    });
    return best;
  };
  for (const [teil, s] of [['vestibolo', 0], ['cortile', 0], ['sala_grande', 1], ['geschossboeden', 2]]) {
    const c = steh(teil, teil === 'geschossboeden' ? Y(MZ.BASIS[2]) : Y(MZ.BASIS[s]));
    assert.ok(c, `keine Stehzelle in ${teil}`);
    assert.ok(r.erreicht(...c), `nicht erreichbar: ${teil} Geschoss ${s}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Mozzi: Turm als hohle Schale (Schaft unzugänglich), Wappen über dem mittleren Fornice, Hoftüren offen', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RA.TEILE) assert.ok(n[p] > 0, p);
  assert.ok(n.turm > 500, `Turm ${n.turm}`);
  assert.ok(n.wappen > 10, `Wappen ${n.wappen}`);
  const mitte = D.haupt.filter((c) => c.u >= 33 && c.u < 38 && c.w < 2.5 && c.d8 <= 2);
  assert.ok(mitte.length > 0 && mitte.some((c) => !grid.has(c.x, Y(4), c.z)), 'mittlerer Fornice offen');
  const tuerZellen = D.haupt.filter((c) => c.dHof <= 2 && c.d8 > 2 && !grid.has(c.x, Y(3), c.z) && grid.has(c.x, Y(8), c.z));
  assert.ok(tuerZellen.length >= 6, `Hoftüren: ${tuerZellen.length} offene Zellen`);
});

test('Mozzi: Licht höchstens 12 Blöcke von einer Seelaterne in allen Räumen', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 10);
  const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
  for (const s of [0, 1, 2]) {
    const y = Y(MZ.BASIS[s]);
    for (const c of D.haupt) {
      if (hof.has(c.x + ',' + c.z) || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      assert.ok(lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01), `Geschoss ${s}: Zelle ${c.x},${c.z} ohne Licht`);
    }
  }
});

test('Mozzi: Content aller Module (Turm im Dachmodul), Ausstattung mit Quelle und Hinweis vereinfacht', () => {
  for (let m = 0; m <= 6; m++) assert.ok(fs.existsSync(path.join(ROOT, 'projects', 'palazzo_mozzi', 'content', `modul_${m}.json`)), `modul_${m}.json`);
  const dach = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'palazzo_mozzi', 'content', 'modul_4.json'), 'utf8'));
  assert.ok(dach.parts.turm, 'Turm im Content');
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'palazzo_mozzi', 'content', 'modul_6.json'), 'utf8'));
  assert.deepEqual(Object.keys(content.parts).sort(), RA.TEILE.slice().sort());
  for (const t of RA.TEILE) {
    const p = content.parts[t];
    for (const f of ['title', 'description', 'tip', 'caution', 'fact']) assert.ok(typeof p[f] === 'string' && p[f].length >= 10 || f === 'title', `${t}.${f}`);
    if (t !== 'licht_ausstattung') {
      assert.match(p.caution, /[Vv]ereinfacht/);
      assert.match(p.fact, /Quelle/);
    }
  }
});
