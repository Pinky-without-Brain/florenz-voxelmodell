'use strict';
// W6a: Santa Maria Maggiore (projects/santa_maria_maggiore): drei Schiffe zu je drei Jochen mit Kreuzgewölben, erhöhtes Presbyterium mit zwei
// Stufen aus Treppenblöcken, Stumpf des romanischen Campanile mit der Berta, Ausstattung nach Quellen.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const palette = require('../spec/palette.js');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const MM = require('../../projects/santa_maria_maggiore/model/_mm.js');
const H = require('./campanile_helfer.js');

const project = getProject('santa_maria_maggiore', { root: ROOT });
const world = buildWorld({ project });
const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
const D = MM.lade();
const e = laufe(ctx, 'r13').einheiten[0];
const Y = MM.Y;
/** Nächste Stehzelle (Boden darunter, drei Luft darüber) zu (u, w) auf Lage yr, dann Erreichbarkeit. */
function erreicht(u, w, yr = 1) {
  const g = world.grid;
  const y = Y(yr);
  for (let r = 0; r <= 3; r += 0.5) {
    for (let du = -r; du <= r; du += 0.5) for (let dw = -r; dw <= r; dw += 0.5) {
      const p = D.R.toWorld(u + du, w + dw), x = Math.round(p.x), z = Math.round(p.z);
      if (g.has(x, y - 1, z) && !g.has(x, y, z) && !g.has(x, y + 1, z) && !g.has(x, y + 2, z)) return e.erreicht(x, y, z);
    }
  }
  return false;
}

test('Santa Maria Maggiore: Projektfelder, Zellenzahl, Joche', () => {
  assert.equal(project.json.bodenY, 63);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.cells.length, 2604);                                  // Zellen des OSM-Umrisses w234429579
  assert.equal(MM.N_BAY, 5);                                           // drei Joche im Langhaus, Presbyterium und Chor
  assert.equal(MM.BREAKS.filter((b) => b <= MM.U_PRESB).length, 4);    // vier Grenzen = drei Joche im Langhaus (2,2 / 12,5 / 22,7 / 33)
  let maxY = 0;
  world.grid.forEach((x, y) => { if (y > maxY) maxY = y; });
  assert.equal(maxY, Y(46));                                           // Giebel der Fassade
});

test('Santa Maria Maggiore: Portale offen, alle Räume erreichbar, Hülle dicht', () => {
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor' && o.part === 'fassade'));
  assert.ok(world.oeffnungen.some((o) => o.art === 'tuer'));
  assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
  assert.ok(erreicht(8, MM.W_MITTE), 'Mittelschiff hinter dem Hauptportal');
  for (const u of [7, 17, 28, 40, 52]) assert.ok(erreicht(u, 44), 'südliches Seitenschiff / Kapelle bei u ' + u);
  for (const u of [17, 28, 40, 52]) assert.ok(erreicht(u, 12), 'nördliches Seitenschiff / Kapelle bei u ' + u);
  assert.ok(erreicht(30, MM.W_MITTE), 'drittes Joch');
  assert.ok(erreicht(40, MM.W_MITTE, 3), 'Presbyterium auf dem Podest');
  assert.ok(erreicht(55, MM.W_MITTE, 3), 'Chor');
  assert.ok(erreicht(7, 44), 'Südportal führt ins Seitenschiff');
});

test('Santa Maria Maggiore: Presbyterium zwei Stufen höher, Stufen aus Treppenblöcken', () => {
  const st = H.zellen(world, 'stufen');
  assert.ok(st.length >= 2 * 14);
  assert.ok(st.every((c) => palette.isTreppe(c.type)));
  assert.equal(new Set(st.map((c) => c.y)).size, 2);                   // zwei Höhen: zwei Stufen
  const pod = H.zellen(world, 'boden_presbyterium');
  assert.ok(pod.length > 300 && new Set(pod.map((c) => c.y)).size === 1 && pod[0].y === Y(MM.PODEST));
  assert.equal(H.kopffreiheitVerstoesse(world, 'stufen'), 0);
});

test('Santa Maria Maggiore: Kreuzgewölbe, spitze Arkaden, Obergaden mit Fenstern', () => {
  assert.ok(H.zellen(world, 'kreuzgewoelbe').length > 3000);
  assert.ok(H.zellen(world, 'arkaden').length > 1000);
  assert.ok(H.zellen(world, 'obergaden_fenster').length > 150);
  // Gewölbe über dem Mittelschiff in Jochmitte höher als an der Jochgrenze (Kreuzgewölbe)
  const hoehe = (u) => {
    const p = D.R.toWorld(u, 21.5);
    let h = 0;
    world.grid.forEach((x, y, z, el) => { if (x === Math.round(p.x) && z === Math.round(p.z) && el.part === 'kreuzgewoelbe') h = Math.max(h, y); });
    return h;
  };
  assert.ok(hoehe(MM.bayMitte(1)) > hoehe(MM.BREAKS[2]) + 3, 'Stichkappe in Jochmitte höher als am Pfeiler');
  assert.ok(world.unzugaenglich.some((u) => /Dachraum/.test(JSON.stringify(u))));
});

test('Santa Maria Maggiore: Campanile-Stumpf massiv mit Berta, keine Glockenstube', () => {
  assert.ok(H.zellen(world, 'campanile_stumpf').length > 4000);
  assert.equal(H.zellen(world, 'glockenstube').length, 0);
  assert.equal(H.zellen(world, 'glocken').length, 0);
  const berta = H.zellen(world, 'berta_kopf');
  assert.ok(berta.length >= 2);
  assert.ok(berta.every((c) => MM.zelleBei(c.x, c.z).zone === 'turm'));
  assert.ok(berta.every((c) => MM.zelleBei(c.x, c.z).w < 13));          // Nordseite, zur Via dei Cerretani
});

test('Santa Maria Maggiore: Licht höchstens 12 Blöcke von jeder Stehzelle in Mittelschiff, Seitenschiffen und Presbyterium', () => {
  const lichter = [];
  world.grid.forEach((x, y, z, el) => { if (el.part === 'licht') lichter.push({ x, y, z }); });
  assert.ok(lichter.length >= 10);
  for (const [zone, yr] of [['mittel', 1], ['sch_n', 1], ['sch_s', 1], ['presb', 3], ['chor', 3]]) {
    let max = 0, n = 0;
    for (const c of D.cells) {
      if (c.zone !== zone || c.d8 <= 2) continue;
      const y = Y(yr);
      if (world.grid.has(c.x, y, c.z) || world.grid.has(c.x, y + 1, c.z) || world.grid.has(c.x, y + 2, c.z) || !world.grid.has(c.x, y - 1, c.z)) continue;
      let d = Infinity;
      for (const l of lichter) if (l.y === y - 1) d = Math.min(d, Math.hypot(l.x - c.x, l.z - c.z));
      max = Math.max(max, d); n++;
    }
    assert.ok(n > 15 && max <= 12.01, `${zone}: ${n} Zellen, größter Abstand ${max}`);
  }
});

test('Santa Maria Maggiore: Ausstattung nach Quellen mit Content, Quelle und Hinweis', () => {
  const teile = ['seitenaltaere', 'panciatichi_pugliani', 'orlandini_santa_rita', 'carnesecchi_dandini', 'boni_rosselli', 'carnesecchi_marinari', 'orlandini_volterrano', 'coppo_madonna', 'brunetto_latini', 'cantoria', 'hochaltar', 'cione_fresken', 'orgel_mascioni'];
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'santa_maria_maggiore', 'content', 'modul_5.json'), 'utf8')).parts;
  for (const id of teile) {
    const z = H.zellen(world, id);
    assert.ok(z.length >= 5, id + ': ' + z.length);
    const p = content[id];
    assert.ok(p && p.description.length > 40 && p.tip && p.caution && p.fact, id + ' Content');
    assert.match(p.caution + ' ' + p.fact, /wikipedia/, id + ' Quelle');
    assert.match(p.caution, /Vereinfacht, nicht nach Vorbild/, id + ' Hinweis');
  }
  const seite = (id) => new Set(H.zellen(world, id).map((c) => (MM.zelleBei(c.x, c.z).w < MM.W_MITTE ? 'nord' : 'sued')));
  assert.deepEqual([...seite('panciatichi_pugliani')], ['sued']);       // rechts beim Eintreten
  assert.deepEqual([...seite('orlandini_santa_rita')], ['sued']);
  assert.deepEqual([...seite('boni_rosselli')], ['nord']);
  assert.deepEqual([...seite('coppo_madonna')], ['nord']);              // links vom Chor
  // Coppo-Madonna in der östlichen Kapelle links vom Chor
  const zz = H.zellen(world, 'coppo_madonna').map((c) => MM.zelleBei(c.x, c.z));
  assert.ok(zz.every((c) => c.u > 55));
  const p = content.cione_fresken;
  assert.match(p.caution, /1395 bis 1400/);
});
