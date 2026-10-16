'use strict';
// W5a: San Marco (projects/san_marco): Konvent über palazzo.js (Höfe, Raumteilung, Zellen, Bibliothek), Basilika mit Campanile
// (_kirche.js), Content mit Quelle und Vereinfachung, Begehbarkeit (alle Räume, Glockenstube) und Dichtheit.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const { getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { laufe } = require('../validate/begehbarkeit_projekt.js');
const PAL = require('../spec/palette.js');
const WZ = require('../wahrzeichen');
const SM = require('../../projects/san_marco/model/_sm.js');
const KI = require('../../projects/san_marco/model/_kirche.js');
const RAUM = require('../../projects/san_marco/model/_raeume.js');

const project = getProject('san_marco', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
const R = WZ.makeRahmen(project.json.rahmen);

/** Stehzelle auf Lage yr0 (Boden darunter, drei Luft darüber) nahe einer lokalen Position (nächste zuerst). */
function steh(u, w, yr0) {
  const offs = [];
  for (let du = -2; du <= 2; du += 0.5) for (let dw = -2; dw <= 2; dw += 0.5) offs.push([du, dw]);
  offs.sort((a, b) => Math.hypot(...a) - Math.hypot(...b));
  const y = 68 + yr0;
  for (const [du, dw] of offs) {
    const p = R.toWorld(u + du, w + dw), x = Math.round(p.x), z = Math.round(p.z);
    if (grid.has(x, y - 1, z) && !grid.has(x, y, z) && !grid.has(x, y + 1, z) && !grid.has(x, y + 2, z)) return { x, y, z };
  }
  return null;
}

test('San Marco: Projektfelder, Masken und Fehlerfreiheit', () => {
  assert.equal(project.json.bodenY, 68);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  const M = WZ.ladeMasken(project.json, { dir: path.join(ROOT, 'projects', 'san_marco') });
  assert.equal(M.haupt.loecher().length, 6);
  assert.ok(M.haupt.size > 23700 && M.haupt.size < 23900, String(M.haupt.size));
  assert.ok(M.masken.basilika.size > 3850 && M.masken.basilika.size < 3950, String(M.masken.basilika.size));
  assert.equal([...M.masken.basilika.cells].filter(([x, z]) => M.haupt.has(x, z)).length, 0);   // Masken überlappen nicht
});

test('San Marco: 44 Zellen (41 Mönchszellen und 3 Räume Savonarolas), Bibliothek 45 m, Treppenblöcke', () => {
  assert.equal(RAUM.ALLE_ZELLEN.length + RAUM.SAVO.raeume.length, 44);
  assert.ok(Math.abs((RAUM.BIB.w[1] - RAUM.BIB.w[0]) / 2 - 45) < 1);
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of RAUM.TEILE.concat(['treppe', 'kassettendecke', 'tambour', 'kuppel', 'laterne', 'hochaltar', 'seitenaltaere', 'cappella_antonino', 'campanile_treppe', 'glockenstube', 'glocken', 'fassade', 'triumphbogen'])) assert.ok(n[p] > 0, p);
  const stufen = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'treppe' && PAL.isTreppe(e.type)) stufen.push({ x, y, z }); });
  assert.equal(stufen.length, 36);                                   // 2 Läufe zu 6 Stufen, Breite 3
  for (const s of stufen) for (let h = 1; h <= 3; h++) assert.equal(grid.has(s.x, s.y + h, s.z), false, `Kopffreiheit ${s.x},${s.y},${s.z}`);
  let hoechst = 0;
  grid.forEach((x, y) => { if (y > hoechst) hoechst = y; });
  assert.equal(hoechst, KI.Y(KI.TURM.top));                          // der Campanile ist der höchste Punkt (35 m)
});

test('San Marco: Portale, Tür zum Kreuzgang, Hofluft unter der Zypresse deklariert', () => {
  const arten = {};
  for (const o of world.oeffnungen) arten[o.art + '|' + o.part] = (arten[o.art + '|' + o.part] || 0) + o.keys.length;
  assert.ok(arten['tor|aussenwand'] >= 2 * 6 * 5, JSON.stringify(arten));
  assert.ok(arten['tor|fassade'] >= 8 * 8);
  assert.ok(arten['tuer|seitenwaende'] >= 3 * 5);
  assert.ok(arten['tuer|campanile_schaft'] >= 3 * 4);
  assert.ok(arten['fenster_offen|kreuzgang_antonino'] > 0);
});

test('San Marco: alle Räume erreichbar, Glockenstube über die Wendeltreppe, Höfe, Dichtheit', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const punkte = [['Eingangshalle', 10, 55, 1], ['Ospizio', 10, 80, 1], ['Kapitelsaal', 44, 108, 1], ['Refettorio piccolo', 68, 110, 1], ['Refettorio grande', 90, 60, 1],
    ['Kreuzgang Sant Antonino', 35, 60, 1], ['Kreuzgang San Domenico', 130, 10, 1], ['Westflügel EG', 60, -12, 1], ['Treppenhalle OG', 10, 52, 13], ['Savonarola 1', 36, 110, 13],
    ['Savonarola 3', 63, 110, 13], ['Bibliothek', 192, 55, 13], ['Zelle Nord', 79, 60, 13], ['Zelle West', 60, -20, 13], ['Zelle Süd', 13, 80, 13],
    ['Mittelschiff', 30, 21.5, 1], ['Cappella Salviati', 25.25, 6.2, 1], ['Presbyterium', 70, 21, 1], ['Chor', 91, 15, 1], ['Apsis', 100, 24, 1], ['Kapelle rechts mit Tür', 40, 36, 1],
    ['Campanile Fuß', 90, 31, 1], ['Glockenstube', 90, 31, 51]];
  for (const [name, u, w, yr] of punkte) {
    const s = steh(u, w, yr);
    assert.ok(s, `keine Stehzelle: ${name}`);
    assert.ok(r.erreicht(s.x, s.y, s.z), `nicht erreichbar: ${name}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('San Marco: Licht im Kirchenschiff höchstens 12 Blöcke von jeder Stehzelle', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'licht' && e.module === 10) lichter.push([x, z]); });
  assert.ok(lichter.length > 10);
  const L = KI.lade();
  let weit = 0;
  for (const c of L.cells) {
    if (c.zone === 'turm' || c.zone === 'masse' || c.d8 <= 2 || !grid.has(c.x, 68, c.z) || grid.has(c.x, 69, c.z) || grid.has(c.x, 70, c.z)) continue;
    let d = Infinity;
    for (const [x, z] of lichter) d = Math.min(d, Math.hypot(x - c.x, z - c.z));
    if (d > 12.5) weit++;
  }
  assert.equal(weit, 0);
});

test('San Marco: Content mit Quelle und Vereinfachung je ausgestaltetem Raum', () => {
  for (const n of [6, 10]) {
    const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'san_marco', 'content', `modul_${n}.json`), 'utf8'));
    for (const [id, t] of Object.entries(j.parts)) {
      if (id.startsWith('licht')) continue;
      assert.ok(/ereinfacht/.test(t.caution + t.fact + t.description), `${n}/${id}: Hinweis „vereinfacht“`);
      assert.ok(t.fact.length > 20 && t.description.length > 40, `${n}/${id}`);
    }
  }
  const j6 = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'san_marco', 'content', 'modul_6.json'), 'utf8'));
  for (const id of RAUM.TEILE) assert.ok(j6.parts[id], id);
  assert.ok(!/L\u0065\u0067\u006f/i.test(JSON.stringify(j6)));
});
