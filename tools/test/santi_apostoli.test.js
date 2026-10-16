'use strict';
// W6a: Santi Apostoli (projects/santi_apostoli): romanische Säulenbasilika mit grünen Säulen und Rundbögen, offenes Holzdach (1333),
// Kapelle im Süden, Chor mit Apsis, Portal mit Lünette, Ausstattung nach Quellen.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const WZ = require('../wahrzeichen');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const SA = require('../../projects/santi_apostoli/model/_sa.js');
const H = require('./campanile_helfer.js');

const project = getProject('santi_apostoli', { root: ROOT });
const world = buildWorld({ project });
const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };
const D = SA.lade();
const e = laufe(ctx, 'r13').einheiten[0];
const Y = SA.Y;
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

test('Santi Apostoli: Projektfelder, Zellenzahl, höchster Block', () => {
  assert.equal(project.json.bodenY, 59);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  assert.equal(D.cells.length, 1127);                                  // Zellen des OSM-Umrisses w451785463
  let maxY = 0;
  world.grid.forEach((x, y) => { if (y > maxY) maxY = y; });
  assert.ok(maxY >= Y(23) && maxY <= Y(25), String(maxY));            // Giebel der Fassade bzw. Triumphwand
});

test('Santi Apostoli: Portal offen, alle Räume erreichbar, Hülle dicht', () => {
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor' && o.part === 'fassade'));
  assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
  assert.ok(erreicht(5, SA.W_MITTE), 'Mittelschiff hinter dem Portal');
  assert.ok(erreicht(25, SA.W_MITTE), 'Mittelschiff, fünftes Joch');
  for (const u of [10, 20, 30]) {
    assert.ok(erreicht(u, 4), 'linkes Seitenschiff bei u ' + u);
    assert.ok(erreicht(u, 17), 'rechtes Seitenschiff bei u ' + u);
  }
  assert.ok(erreicht(30, 22), 'Kapelle im Süden');
  assert.ok(erreicht(45, 13), 'Chor');
  assert.ok(erreicht(54, 12), 'Apsis');
});

test('Santi Apostoli: grüne Säulen mit Kapitellen und Rundbögen, offenes Holzdach', () => {
  const sa = H.zellen(world, 'saeulen');
  assert.ok(sa.length > 150);
  assert.ok(sa.every((c) => c.type === WZ.typ('marmor_gruen')));                  // Schäfte aus grünem Prato-Marmor
  assert.ok(H.zellen(world, 'kapitelle').length >= 14);
  assert.ok(H.zellen(world, 'arkaden').length > 600);
  const holz = H.zellen(world, 'holzdecke');
  assert.ok(holz.length > 400);
  const hoehen = holz.map((c) => c.y - Y(0));
  assert.ok(Math.min(...hoehen) <= 15 && Math.max(...hoehen) >= 20, 'Traufe bis First');
  assert.ok(world.unzugaenglich.some((u) => /Zwischenraum|Dach/.test(JSON.stringify(u))));
  // Mosaik: im Mittelschiff mindestens drei verschiedene Bodenarten
  const boden = new Set();
  for (const c of D.cells) if (c.zone === 'mittel') { const el = world.grid.get(c.x, Y(0), c.z); if (el) boden.add(el.type); }
  assert.ok(boden.size >= 3);
});

test('Santi Apostoli: Licht höchstens 12 Blöcke von jeder Stehzelle', () => {
  const lichter = [];
  world.grid.forEach((x, y, z, el) => { if (el.part === 'licht') lichter.push({ x, y, z }); });
  assert.ok(lichter.length >= 4);
  for (const zone of ['mittel', 'sch_n', 'sch_s', 'chor']) {
    let max = 0, n = 0;
    for (const c of D.cells) {
      if (c.zone !== zone || c.d8 <= 2) continue;
      const y = Y(1);
      if (world.grid.has(c.x, y, c.z) || world.grid.has(c.x, y + 1, c.z) || world.grid.has(c.x, y + 2, c.z) || !world.grid.has(c.x, y - 1, c.z)) continue;
      let d = Infinity;
      for (const l of lichter) if (l.y === y - 1) d = Math.min(d, Math.hypot(l.x - c.x, l.z - c.z));
      max = Math.max(max, d); n++;
    }
    assert.ok(n > 5 && max <= 12.01, `${zone}: ${n} Zellen, größter Abstand ${max}`);
  }
});

test('Santi Apostoli: Ausstattung nach Quellen mit Content, Quelle und Hinweis', () => {
  const teile = ['seitenaltaere', 'martin_gamberucci', 'delbene_roncalli', 'delbene_grabmal', 'altoviti_vasari', 'altoviti_ammannati', 'schiavo_madonna', 'gabbiani_franz', 'fei_michael', 'maso_triptychon', 'pazzi_feuersteine', 'altoviti_rovezzano', 'polyptychon', 'della_robbia_tabernakel', 'kenotaph_altoviti', 'schiavo_sinopia'];
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'santi_apostoli', 'content', 'modul_4.json'), 'utf8')).parts;
  for (const id of teile) {
    const z = H.zellen(world, id);
    assert.ok(z.length >= 5, id + ': ' + z.length);
    const p = content[id];
    assert.ok(p && p.description.length > 40 && p.tip && p.caution && p.fact, id + ' Content');
    assert.match(p.caution + ' ' + p.fact, /wikipedia/, id + ' Quelle');
    assert.match(p.caution, /Vereinfacht, nicht nach Vorbild/, id + ' Hinweis');
  }
  const seite = (id) => new Set(H.zellen(world, id).map((c) => (SA.zelleBei(c.x, c.z).w < SA.W_MITTE ? 'links' : 'rechts')));
  assert.deepEqual([...seite('martin_gamberucci')], ['rechts']);        // rechts beim Eintreten
  assert.deepEqual([...seite('delbene_roncalli')], ['rechts']);
  assert.deepEqual([...seite('altoviti_vasari')], ['rechts']);
  assert.deepEqual([...seite('fei_michael')], ['links']);
  assert.deepEqual([...seite('maso_triptychon')], ['links']);
  // Vasari in der südlichen Kapelle, Polyptychon in der Apsis hinter dem Altar (hinterster Teil)
  const mu = (id) => { const z = H.zellen(world, id).map((c) => SA.zelleBei(c.x, c.z).u); return z.reduce((a, b) => a + b, 0) / z.length; };
  assert.ok(mu('altoviti_vasari') > SA.UK0 && mu('altoviti_vasari') < SA.UK1);
  assert.ok(mu('polyptychon') > 50 && mu('polyptychon') > mu('chor_altar'));
  assert.ok(mu('della_robbia_tabernakel') < mu('polyptychon'));
});
