'use strict';
// W6c: Complesso di San Firenze (projects/san_firenze): Palast (palazzo.js, zwei Höfe), Kirche San Filippo Neri, Oratorium
// (Sala della Musica): Masken, Portale, Treppe zur Empore, Räume, Begehbarkeit, Licht, Content.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const PAL = require('../spec/palette.js');
const SF = require('../../projects/san_firenze/model/_sf.js');
const KB = require('../../projects/san_firenze/model/_kb.js');
const RA = require('../../projects/san_firenze/model/_raeume.js');
const KA = require('../../projects/san_firenze/model/_kb_ausstattung.js');

const project = getProject('san_firenze', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const Y = SF.Y;
const D = SF.lade();
const KL = KB.lade();
const R = D.R;
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
const rr = laufe(ctx, 'r13').einheiten[0];

/** Nächste Stehzelle (Boden, drei Luftzellen) zum lokalen Punkt (u, w) auf der Standhöhe yStand (absolut). */
function steh(u, w, yStand) {
  const p = R.toWorld(u, w), x0 = Math.round(p.x), z0 = Math.round(p.z);
  let best = null, bd = 1e9;
  for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) {
    const x = x0 + dx, z = z0 + dz;
    if (grid.has(x, yStand - 1, z) && !grid.has(x, yStand, z) && !grid.has(x, yStand + 1, z) && !grid.has(x, yStand + 2, z) && dx * dx + dz * dz < bd) { bd = dx * dx + dz * dz; best = [x, yStand, z]; }
  }
  return best;
}

test('San Firenze: Projektfelder, drei Masken, keine Baufehler', () => {
  assert.equal(project.json.bodenY, 62);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.haupt.length, 9668, 'Palast (Relation r4084510)');
  assert.equal(D.H.loecher().length, 2, 'zwei Höfe');
  assert.equal(KL.kirche.length, 2981, 'Chiesa di San Filippo Neri (w361442655)');
  assert.equal(KL.orat.length, 1947, 'Sala della Musica (w307129115)');
  assert.equal(D.haupt.length + KL.kirche.length + KL.orat.length, 14596, 'Gesamtmaske (OSM: 14.595 Zellen, Rasterung der Ränder ±1)');
  let max = 0;
  grid.forEach((x, y) => { if (y > max) max = y; });
  assert.equal(max, Y(SF.TRAUFE + 1 + 5), 'höchster Block: First des Palastdachs (Lage 36)');
  assert.ok(KL.kirche.some((c) => c.zone === 'fassade' && grid.has(c.x, Y(33), c.z) && !grid.has(c.x, Y(34), c.z)), 'Giebelspitze der Kirchenfassade (Lage 33)');
  assert.equal(SF.TRAUFE, 30, 'Palast 30 Blöcke wie OSM (building:levels=4)');
});

test('San Firenze: Portale von Palast, Kirche und Oratorium offen', () => {
  const tor = (art, part) => world.oeffnungen.filter((o) => o.art === art && o.part === part).reduce((s, o) => s + o.keys.length, 0);
  assert.ok(tor('tor', 'aussenwand') > 100, 'Palastportale');
  assert.ok(tor('tor', 'k_fassade') > 60, 'Kirchenportal');
  assert.ok(tor('tor', 'o_fassade') > 60, 'Oratoriumsportal');
  // Portale mindestens 2 breit, 3 hoch: Lagen 1..4 sind in der Mitte jedes Portals Luft
  const mitten = [[KB.K.nc, 1], [KB.O.mitte, 1]];
  for (const [u] of mitten) {
    const cells = (u === KB.K.nc ? KL.kirche : KL.orat).filter((c) => c.zone === 'fassade' && c.d8 <= 2 && Math.abs(c.u - u) < 1);
    assert.ok(cells.length >= 2);
    for (const c of cells) for (let yr = 1; yr <= 4; yr++) assert.ok(!grid.has(c.x, Y(yr), c.z), `Portal u ${u} Lage ${yr}`);
  }
  for (const [achse, m] of [['w', 56], ['u', 101]]) {
    const cells = D.haupt.filter((c) => c.d8 <= 2 && (achse === 'w' ? c.w < 4 && Math.abs(c.u - m) < 1 : c.u < 12 && Math.abs(c.w - m) < 1));
    assert.ok(cells.length >= 2);
    for (const c of cells) for (let yr = 1; yr <= 4; yr++) assert.ok(!grid.has(c.x, Y(yr), c.z), `Palastportal ${achse}=${m} Lage ${yr}`);
  }
});

test('San Firenze: begehbar in Kirche (Schiff, Kapellen, Presbyterium, Apsis, Sakramentskapelle)', () => {
  assert.equal(rr.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const y = Y(1);
  const orte = [['Schiff', KB.K.nc, 30], ['Presbyterium', KB.K.nc, 64], ['Apsis', KB.K.nc, 74], ['Kapelle Süd 1', 79, 12], ['Kapelle Süd 2', 79, 32], ['Kapelle Nord 1', 104, 12],
    ['Kapelle Nord 2', 104, 32], ['Kapelle Nord 3', 104, 51], ['Sakramentskapelle', KB.K.sak.u - 3, KB.K.sak.w]];
  for (const [name, u, w] of orte) {
    const c = steh(u, w, y);
    assert.ok(c, `keine Stehzelle: ${name}`);
    assert.ok(rr.erreicht(...c), `nicht erreichbar: ${name}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('San Firenze: Oratorium, Treppe aus 8 Treppenblöcken, Emporen auf Säulen erreichbar', () => {
  const stufen = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'o_treppe' && PAL.isTreppe(e.type)) stufen.push({ x, y, z }); });
  assert.equal(stufen.length, 24, 'acht Stufen, Breite 3');
  for (const b of stufen) for (let h = 1; h <= 3; h++) assert.ok(!grid.has(b.x, b.y + h, b.z), `Kopffreiheit über ${b.x},${b.y},${b.z}`);
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  assert.ok(n.o_saeulen > 40 && n.o_empore > 600 && n.o_bruestung > 40);
  for (const [name, u, w, y] of [['Vestibül', 4, 6, Y(1)], ['Saal Mitte', KB.O.mitte, 34, Y(1)], ['Saal Rückseite', KB.O.mitte, 52, Y(1)], ['Empore Süd', 5, 30, Y(KB.O.emporeY + 1)],
    ['Empore Nord', 28, 30, Y(KB.O.emporeY + 1)], ['Rückempore', KB.O.mitte, 53, Y(KB.O.emporeY + 1)], ['Vestibülempore', 25, 7, Y(KB.O.emporeY + 1)]]) {
    const c = steh(u, w, y);
    assert.ok(c, `keine Stehzelle: ${name}`);
    assert.ok(rr.erreicht(...c), `nicht erreichbar: ${name}`);
  }
});

test('San Firenze: Palast, vier Geschosse erreichbar, Eingangshalle, Höfe', () => {
  for (const s of [0, 1, 2, 3]) {
    const c = steh(56, 20, Y(SF.BASIS[s] + 1));
    assert.ok(c, `keine Stehzelle im Geschoss ${s}`);
    assert.ok(rr.erreicht(...c), `Geschoss ${s} nicht erreichbar`);
  }
  for (const [name, u, w] of [['Eingangshalle', 57.5, 20], ['Großer Hof', 36, 90], ['Südflügel', 10, 140], ['Ostblock', 95, 110], ['Nordflügel', 58, 65]]) {
    const c = steh(u, w, Y(1));
    assert.ok(c, `keine Stehzelle: ${name}`);
    assert.ok(rr.erreicht(...c), `nicht erreichbar: ${name}`);
  }
});

test('San Firenze: Ausstattung als Bauteile mit Content, Quelle und Hinweis vereinfacht', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  const gruppen = [[9, KA.TEILE_K], [10, KA.TEILE_O], [11, RA.TEILE]];
  for (const [nr, teile] of gruppen) {
    const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'san_firenze', 'content', `modul_${nr}.json`), 'utf8'));
    assert.deepEqual(Object.keys(content.parts).sort(), teile.slice().sort());
    for (const t of teile) {
      assert.ok(n[t] > 0, `Bauteil ${t} ist leer`);
      const p = content.parts[t];
      for (const f of ['title', 'description', 'tip', 'caution', 'fact']) assert.ok(typeof p[f] === 'string' && p[f].length >= (f === 'title' ? 3 : 10), `${t}.${f}`);
      if (t !== 'licht_ausstattung') {
        assert.match(p.caution, /[Vv]ereinfacht/, `${t}: Hinweis vereinfacht`);
        assert.match(p.fact, /Quelle/, `${t}: Quelle`);
      }
    }
  }
  // Kirche: sechs Altarbilder (Farbfelder in Gold gerahmt), Gewölbe über dem Schiff, Deckenfresko
  assert.ok(n.k_altarbilder > 400 && n.k_gewoelbe > 5000 && n.k_deckenfresko > 500 && n.k_apsisfresko > 50);
});

test('San Firenze: Licht höchstens 12 Blöcke von einer Seelaterne (Palast, Kirche, Oratorium, Emporen)', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.type === 'sea_lantern') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 100);
  const hof = new Set(D.hofZellen.map((c) => c.x + ',' + c.z));
  const pruefe = (cells, y, name) => {
    let schlecht = 0, gepr = 0;
    for (const c of cells) {
      if (hof.has(c.x + ',' + c.z) || !grid.has(c.x, y, c.z) || grid.has(c.x, y + 1, c.z) || grid.has(c.x, y + 2, c.z) || grid.has(c.x, y + 3, c.z)) continue;
      gepr++;
      if (!lichter.some(([lx, ly, lz]) => ly === y && Math.hypot(lx - c.x, lz - c.z) <= 12.01)) schlecht++;
    }
    assert.ok(gepr > 0, name);
    assert.equal(schlecht, 0, `${name}: ${schlecht} Zellen ohne Licht`);
  };
  for (const s of [0, 1, 2, 3]) pruefe(D.haupt, Y(SF.BASIS[s]), `Palast Geschoss ${s}`);
  pruefe(KL.kirche, Y(0), 'Kirche');
  pruefe(KL.orat, Y(0), 'Oratorium');
  pruefe(KL.orat, Y(KB.O.emporeY), 'Emporen');
});
