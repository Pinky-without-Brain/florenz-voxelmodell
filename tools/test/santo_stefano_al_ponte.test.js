'use strict';
// W6b: Santo Stefano al Ponte (projects/santo_stefano_al_ponte): romanische Fassade, barock umgebauter Saal mit Seitenaltären, Tribuna mit
// achtseitiger Kuppel, Treppe aus Treppenblöcken, Chor; Begehbarkeit und Dichtheit.
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
const ST = require('../../projects/santo_stefano_al_ponte/model/_st.js');

const project = getProject('santo_stefano_al_ponte', { root: ROOT });
const world = buildWorld({ project });
const grid = world.grid;
const ctx = { project, world, grid, ground: loadSpecs(project).ground, root: ROOT };
const R = WZ.makeRahmen(project.json.rahmen);
const BODEN_Y = 64;

/** Stehzelle auf Lage yr0 (Boden darunter, drei Luft darüber) nahe einer lokalen Position (nächste zuerst). */
function steh(u, w, yr0, rad = 2) {
  const offs = [];
  for (let du = -rad; du <= rad; du += 0.5) for (let dw = -rad; dw <= rad; dw += 0.5) offs.push([du, dw]);
  offs.sort((a, b) => Math.hypot(...a) - Math.hypot(...b));
  const y = BODEN_Y + yr0;
  for (const [du, dw] of offs) {
    const p = R.toWorld(u + du, w + dw), x = Math.round(p.x), z = Math.round(p.z);
    if (grid.has(x, y - 1, z) && !grid.has(x, y, z) && !grid.has(x, y + 1, z) && !grid.has(x, y + 2, z)) return { x, y, z };
  }
  return null;
}

test('Santo Stefano: Projektfelder, Maske und Fehlerfreiheit', () => {
  assert.equal(project.json.type, 'wahrzeichen');
  assert.equal(project.json.bodenY, 64);
  assert.equal(project.json.begehbarkeit, 'pflicht');
  assert.deepEqual(world.errors, []);
  const M = WZ.ladeMasken(project.json, { dir: path.join(ROOT, 'projects', 'santo_stefano_al_ponte') });
  assert.ok(M.haupt.size > 3440 && M.haupt.size < 3480, String(M.haupt.size));       // OSM w253942619
  assert.equal(M.haupt.loecher().length, 0);
  assert.deepEqual(project.json.gebaeude, ['w253942619']);
});

test('Santo Stefano: Bauteile, Treppe aus Treppenblöcken mit Kopffreiheit, Kuppel als höchster Punkt', () => {
  const n = {};
  grid.forEach((x, y, z, e) => { n[e.part] = (n[e.part] || 0) + 1; });
  for (const p of ['sa_fassade', 'sa_fassade_fenster', 'sa_aussenwaende', 'sa_fenster', 'sa_innenwaende', 'sa_treppe', 'sa_balustrade', 'sa_decken', 'sa_dach', 'sa_trommel', 'sa_kuppel', 'sa_podium',
    'sa_altaere', 'sa_hochaltar', 'sa_kapelle', 'sa_scheinkapelle', 'sa_chorgestuehl', 'sa_stuckfigur', 'sa_orgel', 'sa_kruzifix', 'sa_licht']) assert.ok(n[p] > 0, p);
  const stufen = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'sa_treppe' && PAL.isTreppe(e.type)) stufen.push({ x, y, z }); });
  assert.equal(stufen.length, 40);                                    // 5 Stufen, Breite 8
  for (const s of stufen) for (let h = 1; h <= 3; h++) assert.equal(grid.has(s.x, s.y + h, s.z), false, `Kopffreiheit ${s.x},${s.y},${s.z}`);
  let hoechst = 0, hx = 0, hz = 0;
  grid.forEach((x, y, z) => { if (y > hoechst) { hoechst = y; hx = x; hz = z; } });
  assert.equal(hoechst, ST.Y(37));                                    // die Goldkugel auf der Kuppel
  const l = R.toLocal(hx, hz);
  assert.ok(Math.hypot(l.u - ST.TRIB.cu, l.w - ST.TRIB.cw) < 1.5);
  assert.ok(n['sa_altaere'] >= 10 * 3);                               // zehn Seitenaltäre
});

test('Santo Stefano: Mittelportal der Fassade bis zum Boden offen, Nische als relief', () => {
  const arten = {};
  for (const o of world.oeffnungen) arten[o.art + '|' + o.part] = (arten[o.art + '|' + o.part] || 0) + o.keys.length;
  assert.ok(arten['tor|sa_fassade'] >= 6 * 8, JSON.stringify(arten));
  assert.ok(arten['relief|sa_fassade'] > 0);
});

test('Santo Stefano: alle Räume erreichbar, R13 und R14 ohne Befund', () => {
  const r = laufe(ctx, 'r13').einheiten[0];
  assert.equal(r.komponenten.filter((k) => !k.unzugaenglich).length, 0);
  const punkte = [['Portal', 3, 19.75, 1], ['Schiff West', 12, 19.75, 1], ['Schiff Ost', 45, 12, 1], ['Seitenaltar Nord', 18.6, 4, 1], ['Seitenaltar Süd', 39.8, 35, 1],
    ['Orgelwand', 45, 33, 1], ['Treppe oben', 56, 19.75, 6], ['Tribuna', 62, 19.75, 6], ['unter der Kuppel', 67.5, 15, 6], ['Hochaltar', 71, 19.75, 6], ['Chor', 87, 19.75, 6],
    ['Kapelle Nord', 64, 7, 1], ['falsche Kapelle', 58.5, 32.5, 1]];
  for (const [name, u, w, yr] of punkte) {
    const s = steh(u, w, yr, 3);
    assert.ok(s, `keine Stehzelle: ${name}`);
    assert.ok(r.erreicht(s.x, s.y, s.z), `nicht erreichbar: ${name}`);
  }
  assert.equal(laufe(ctx, 'r14').einheiten[0].cluster.length, 0);
});

test('Santo Stefano: Licht im Schiff, Tribuna, Chor und Kapellen höchstens 12 Blöcke von jeder Stehzelle', () => {
  const lichter = [];
  grid.forEach((x, y, z, e) => { if (e.part === 'sa_licht') lichter.push([x, y, z]); });
  assert.ok(lichter.length >= 8);
  const L = ST.lade();
  let weit = 0;
  for (const c of L.cells) {
    if (!['schiff', 'trib', 'chor', 'kn', 'ks'].includes(c.zone)) continue;
    for (const y0 of [BODEN_Y, BODEN_Y + ST.PODIUM_OBEN]) {
      if (!grid.has(c.x, y0, c.z) || grid.has(c.x, y0 + 1, c.z) || grid.has(c.x, y0 + 2, c.z) || grid.has(c.x, y0 + 3, c.z)) continue;
      let d = Infinity;
      for (const [x, y, z] of lichter) if (y === y0) d = Math.min(d, Math.hypot(x - c.x, z - c.z));
      if (d > 12.5) weit++;
    }
  }
  assert.equal(weit, 0);
});

test('Santo Stefano: Content mit Quelle und Vereinfachung je ausgestattetem Teil', () => {
  for (const n of [0, 1, 2, 3, 4]) {
    const j = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'santo_stefano_al_ponte', 'content', `modul_${n}.json`), 'utf8'));
    for (const [id, t] of Object.entries(j.parts)) {
      assert.ok(t.fact.length > 20 && t.description.length > 40, `${n}/${id}`);
      if (n === 4 && id !== 'sa_licht') assert.ok(/ereinfacht/.test(t.caution + t.fact + t.description), `${n}/${id}: Hinweis „vereinfacht“`);
    }
  }
  const j4 = JSON.parse(fs.readFileSync(path.join(ROOT, 'projects', 'santo_stefano_al_ponte', 'content', 'modul_4.json'), 'utf8'));
  assert.ok(!new RegExp(String.fromCharCode(76, 101, 103, 111), 'i').test(JSON.stringify(j4)));
});
