'use strict';
// W5b: Santa Felicita (projects/santa_felicita): Schiff mit Kapellen, Querhaus, Cappella maggiore, Torre dei Fifanti als Campanile,
// Palco der Medici; Portikus unter dem Corridoio Vasariano (Pitti Modul 9, gemeinsame Geometrie _portikus.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const S = require('../../projects/santa_felicita/model/_sf.js');
const H = require('./campanile_helfer.js');

const project = getProject('santa_felicita', { root: ROOT });
const world = buildWorld({ project });
const ctx = { project, world, grid: world.grid, ground: loadSpecs(project).ground, root: ROOT };

test('Santa Felicita: Projektfelder, Maske ohne Korridor, Campanile', () => {
  assert.equal(project.json.bodenY, 66);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  const L = S.lade();
  assert.equal(L.haupt.length, 2462);            // 2.739 Zellen des Umrisses abzüglich 277 des Corridoio Vasariano
  assert.equal(L.camp.length, 190);              // Torre dei Fifanti (w119180019)
  for (const c of L.haupt) assert.ok(c.u >= 7.5, 'Portikus gehört dem Korridor');
  let maxY = 0;
  world.grid.forEach((x, y) => { if (y > maxY) maxY = y; });
  assert.equal(maxY - S.Y(0), S.TURM.top);
});

test('Santa Felicita: Portal offen, Schiff und Kapellen erreichbar, dicht', () => {
  assert.ok(world.oeffnungen.some((o) => o.art === 'tor'));
  const e = laufe(ctx, 'r13').einheiten[0];
  assert.equal(e.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
  const R = S.lade().R;
  const vor = (u, w, yr = 1) => { const p = R.toWorld(u, w); return e.erreicht(Math.floor(p.x), S.Y(yr), Math.floor(p.z)); };
  assert.ok(vor(16, 16), 'Schiff hinter dem Portal');
  assert.ok(vor(16, 27), 'Cappella Capponi');
  assert.ok(vor(16, 4), 'Cappella Canigiani');
  assert.ok(vor(55, 16), 'Vierung');
  assert.ok(vor(55, 5) && vor(55, 26), 'Querarme');
  assert.ok(vor(79, 14), 'Cappella maggiore');
  assert.ok(vor(97, 15), 'Turmfuß');
});

test('Santa Felicita: Campanile mit Treppe, Kopffreiheit, Glockenstube erreichbar', () => {
  const tr = H.zellen(world, 'campanile_treppe');
  assert.ok(tr.length > 100);
  assert.equal(H.kopffreiheitVerstoesse(world), 0);
  const e = laufe(ctx, 'r13').einheiten[0];
  const stube = H.zellen(world, 'glockenstube').filter((c) => e.erreicht(c.x, c.y + 1, c.z));
  assert.ok(stube.length > 0, 'Glockenstube erreichbar');
  assert.ok(H.zellen(world, 'glocken').length >= 20);
  assert.ok(world.oeffnungen.some((o) => o.art === 'fenster_offen' && o.part === 'glockenstube'));
});

test('Santa Felicita: Ausstattung nach Quellen mit Content, Stufe und Hinweis', () => {
  const teile = ['capponi_kreuzabnahme', 'capponi_verkuendigung', 'capponi_altar', 'canigiani_fresken', 'ciseri_makkabaeer', 'tosini_begegnung', 'franceschini_himmelfahrt', 'hochaltar_cigoli', 'chorgewoelbe_fresko', 'palco_medici'];
  const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'santa_felicita', 'content', 'modul_6.json'), 'utf8'));
  for (const id of teile) {
    const z = H.zellen(world, id);
    assert.ok(z.length >= 12, id + ': ' + z.length);
    const p = content.parts[id];
    assert.ok(p && p.description.length > 40 && p.tip && p.caution && p.fact, id + ' Content');
    assert.match(p.caution + ' ' + p.fact, /wikipedia/, id + ' Quelle');
  }
  for (const id of teile.filter((t) => !t.endsWith('_altar'))) assert.match(content.parts[id].caution, /Vereinfacht, nicht nach Vorbild/, id);
  const zone = (id) => new Set(H.zellen(world, id).map((c) => S.zelleBei(c.x, c.z).zone));
  assert.ok([...zone('capponi_kreuzabnahme')].every((z) => z === 'kapelle'));
  assert.ok(H.zellen(world, 'capponi_kreuzabnahme').every((c) => { const k = S.zelleBei(c.x, c.z); return k.w > S.AX && k.u < 22; }), 'Capponi: rechts, erste Kapelle');
  assert.ok(H.zellen(world, 'canigiani_fresken').every((c) => { const k = S.zelleBei(c.x, c.z); return k.w < S.AX && k.u < 22; }), 'Canigiani: links, erste Kapelle');
  assert.ok([...zone('hochaltar_cigoli')].every((z) => z === 'chor'));
  // Farbfelder: mindestens drei Farben, Unterkante in Augenhöhe
  const kreuz = H.zellen(world, 'capponi_kreuzabnahme');
  assert.ok(new Set(kreuz.map((c) => c.type)).size >= 4);
  assert.ok(Math.min(...kreuz.map((c) => c.y)) - S.Y(0) <= 4);
  // Palco: Loge in Höhe des Gangbodens (Lage 12), als unzugänglich deklariert
  const palco = H.zellen(world, 'palco_medici');
  assert.ok(palco.some((c) => c.y === S.Y(12)));
  assert.ok(world.unzugaenglich.some((u) => /Loge der Medici/.test(u.grund || u.begruendung || JSON.stringify(u))));
});
