'use strict';
// W6a: San Frediano in Cestello (projects/san_frediano_in_cestello): Schiff mit vier Kapellen je Seite, Querhaus, Vierungskuppel auf Tambour,
// Presbyterium, Chor, Nebenräume, Campanile, Ausstattung nach Quellen.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const palette = require('../spec/palette.js');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const CF = require('../../projects/san_frediano_in_cestello/model/_cf.js');
const H = require('./campanile_helfer.js');

const project = getProject('san_frediano_in_cestello', { root: ROOT });
const world = buildWorld({ project });
const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
const D = CF.lade();
const e = laufe(ctx, 'r13').einheiten[0];
const Y = CF.Y;
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

test('Cestello: Projektfelder, Zellenzahl, Kuppel- und Turmhöhe', () => {
  assert.equal(project.json.bodenY, 58);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.cells.length, 5610);                                  // Zellen des OSM-Umrisses w118416085 (umschließt w673464782)
  assert.ok(D.cells.some((c) => c.zone === 'turm'));
  let maxY = 0;
  world.grid.forEach((x, y) => { if (y > maxY) maxY = y; });
  assert.equal(maxY, Y(CF.DOM.laterne));                               // Laterne ist der höchste Punkt
});

test('Cestello: Portal offen, alle Räume erreichbar, Hülle dicht', () => {
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor'));
  assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
  assert.ok(erreicht(8, 26.7), 'Schiff hinter dem Portal');
  for (const k of [0, 1, 2, 3]) {
    assert.ok(erreicht(CF.BAY_C[k], 6), 'Kapelle links ' + k);
    assert.ok(erreicht(CF.BAY_C[k], 47.5), 'Kapelle rechts ' + k);
  }
  assert.ok(erreicht(60.6, 26.7), 'Vierung unter der Kuppel');
  assert.ok(erreicht(60.6, 5), 'linker Querhausarm');
  assert.ok(erreicht(60.6, 48), 'rechter Querhausarm');
  assert.ok(erreicht(88, 26.7), 'Presbyterium');
  assert.ok(erreicht(103, 26.7), 'Chor');
  assert.ok(erreicht(90, 5), 'linker Nebenraum');
  assert.ok(erreicht(101, 48), 'rechter Nebenraum');
  assert.ok(erreicht(88, 47, 1), 'Fuß des Campanile');
});

test('Cestello: Kuppel, Tambour mit acht Fenstern, Pendentifs', () => {
  const kuppel = H.zellen(world, 'kuppel');
  assert.ok(kuppel.length > 2000);
  assert.ok(H.zellen(world, 'tambour').length > 1500);
  assert.ok(H.zellen(world, 'tambour_fenster').length > 300);
  assert.ok(H.zellen(world, 'laterne').length > 100);
  // Scheitel der Kuppel über dem Tambour (Tambour Lage 32..43, Scheitel Lage 59)
  assert.ok(Math.max(...kuppel.map((c) => c.y)) >= Y(58));
  // Innenraum der Kuppel ist offen: über der Vierungsmitte steht bis zur Kuppelschale kein Block
  const m = D.R.toWorld(CF.DOM.u, CF.DOM.w);
  const mx = Math.round(m.x), mz = Math.round(m.z);
  for (let yr = 1; yr < 55; yr++) assert.equal(world.grid.has(mx, Y(yr), mz), false, 'Lage ' + yr);
  assert.equal(H.zellen(world, 'pendentifs_tugenden').length > 100, true);
});

test('Cestello: Campanile mit Wendeltreppe, Glockenstube erreichbar', () => {
  assert.ok(H.zellen(world, 'campanile_treppe').length > 200);
  assert.equal(H.kopffreiheitVerstoesse(world), 0);
  const stube = H.zellen(world, 'glockenstube').filter((c) => e.erreicht(c.x, c.y + 1, c.z));
  assert.ok(stube.length > 0, 'Glockenstube erreichbar');
  assert.ok(H.zellen(world, 'glocken').length >= 20);
  assert.ok(world.oeffnungen.some((o) => o.art === 'fenster_offen' && o.part === 'glockenstube'));
  assert.ok(world.oeffnungen.some((o) => o.art === 'tuer' && o.part === 'campanile_schaft'));
  const tr = H.zellen(world, 'campanile_treppe').filter((c) => palette.isTreppe(c.type));
  assert.ok(tr.length >= 30);
});

test('Cestello: Licht höchstens 12 Blöcke von jeder Stehzelle in Schiff, Kapellen, Vierung und Chor', () => {
  const lichter = [];
  world.grid.forEach((x, y, z, el) => { if (el.part === 'licht') lichter.push({ x, y, z }); });
  assert.ok(lichter.length >= 20);
  for (const zone of ['mittel', 'kap_w', 'kap_o', 'vierung', 'presb', 'chor']) {
    let max = 0, n = 0;
    for (const c of D.cells) {
      if (c.zone !== zone || c.d8 <= 2) continue;
      const y = Y(1);
      if (world.grid.has(c.x, y, c.z) || world.grid.has(c.x, y + 1, c.z) || world.grid.has(c.x, y + 2, c.z) || !world.grid.has(c.x, y - 1, c.z)) continue;
      let d = Infinity;
      for (const l of lichter) if (l.y === y - 1) d = Math.min(d, Math.hypot(l.x - c.x, l.z - c.z));
      max = Math.max(max, d); n++;
    }
    assert.ok(n > 20 && max <= 12.01, `${zone}: ${n} Zellen, größter Abstand ${max}`);
  }
});

test('Cestello: Ausstattung nach Quellen mit Content, Quelle und Hinweis', () => {
  const teile = ['seitenaltaere', 'maddalena_sagrestani', 'maddalena_gewoelbe_bonechi', 'gherardini_nativita', 'gherardini_gewoelbe', 'franchi_taufe', 'bernardo_dandini', 'curradi_madonna', 'sellaio_kreuzigung', 'hochaltar_piamontini', 'orgel_tronci', 'pendentifs_tugenden', 'kuppelfresko_gabbiani'];
  const content = {};
  for (const n of [5]) Object.assign(content, JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'san_frediano_in_cestello', 'content', `modul_${n}.json`), 'utf8')).parts);
  for (const id of teile) {
    const z = H.zellen(world, id);
    assert.ok(z.length >= 5, id + ': ' + z.length);
    const p = content[id];
    assert.ok(p && p.description.length > 40 && p.tip && p.caution && p.fact, id + ' Content');
    assert.match(p.caution + ' ' + p.fact, /wikipedia/, id + ' Quelle');
    assert.match(p.caution, /Vereinfacht, nicht nach Vorbild/, id + ' Hinweis');
  }
  const seite = (id) => new Set(H.zellen(world, id).map((c) => (CF.zelleBei(c.x, c.z).w < CF.W_MITTE ? 'links' : 'rechts')));
  assert.deepEqual([...seite('curradi_madonna')], ['rechts']);        // rechtes Querhaus
  assert.deepEqual([...seite('sellaio_kreuzigung')], ['links']);      // linkes Querhaus
  assert.deepEqual([...seite('maddalena_sagrestani')], ['rechts']);
  assert.deepEqual([...seite('franchi_taufe')], ['links']);
  assert.ok(world.unzugaenglich.some((u) => /Dachraum/.test(JSON.stringify(u))));
});
