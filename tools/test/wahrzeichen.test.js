'use strict';
// V3 W0: Bibliothek tools/wahrzeichen, Wahrzeichen-Felder der Registry, Vorrang im Quartiergenerator, R12.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const WZ = require('../wahrzeichen');
const { makeRahmen, Maske, typ, fresko, fundamentZellen, ladeMasken, wahrzeichenVorrang, pruefeFelder } = WZ;
const { makeParzellen, compareIds } = require('../city/parzellen.js');
const { makeKontext } = require('../city/kontext.js');
const { main } = require('../build.js');
const { main: entwurfMain } = require('../city/akten_entwurf.js');
const { loadRegistry } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { xOfKey, zOfKey } = require('../geom/grid.js');
const P = require('../city/poly.js');

const REAL_ROOT = path.resolve(__dirname, '..', '..');
const FIXTURE = path.join(__dirname, 'fixtures', 'wahrzeichen', 'wz_klein');
const ring = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
const quiet = (t) => { t.mock.method(console, 'log', () => {}); t.mock.method(console, 'warn', () => {}); };
const cleanup = (root) => fs.rmSync(root, { recursive: true, force: true });

// ------------------------------------------------------------------ Rahmen
test('Rahmen: Hin- und Rückweg, Formeln des Katalogs', () => {
  const r = makeRahmen({ ox: 10, oz: -20, thetaDeg: 30 });
  const c = Math.cos(Math.PI / 6), s = Math.sin(Math.PI / 6);
  const w = r.toWorld(5, 7);
  assert.ok(Math.abs(w.x - (10 + 5 * c - 7 * s)) < 1e-12);
  assert.ok(Math.abs(w.z - (-20 + 5 * s + 7 * c)) < 1e-12);
  assert.ok(Math.abs(r.cos - c) < 1e-12 && Math.abs(r.sin - s) < 1e-12);
  for (const [u, v] of [[0, 0], [12.5, -3], [-40, 99]]) {
    const p = r.toWorld(u, v), l = r.toLocal(p.x, p.z);
    assert.ok(Math.abs(l.u - u) < 1e-9 && Math.abs(l.w - v) < 1e-9);
  }
  assert.throws(() => makeRahmen({ ox: 0, oz: 0 }), /Zahlen/);
});

test('Rahmen: PV-Rahmen bildet die Nordecke der Westfassade auf u 89,9 / w 0 ab', () => {
  const pv = makeRahmen({ ox: -146.5, oz: 887, thetaDeg: -79.8 });
  const l = pv.toLocal(-130.5, 798.5);
  assert.ok(Math.abs(l.u - 89.9) < 0.15, `u=${l.u}`);
  assert.ok(Math.abs(l.w) < 0.15, `w=${l.w}`);
});

// ------------------------------------------------------------------ Maske (synthetisch)
// 12 x 10 Zellen (x 0..11, z 0..9) mit Loch (4..7 x 3..6; Lochzellen 5..6 x 4..5)
const GEB = [{ id: 'w1', polygon: { aussen: [ring(0, 0, 11, 9)], loecher: [ring(4, 3, 7, 6)] } },
  { id: 'w2', polygon: { aussen: [ring(30, 0, 33, 3)], loecher: [] } }];
const mk = (ids, o) => Maske.ausGebaeude(ids, { daten: GEB, ...o });

test('Maske: Zellen, Größe, Rand innen, sortiert, bbox', () => {
  const m = mk(['w1']);
  assert.equal(m.size, 12 * 10 - 4);
  assert.ok(m.has(0, 0) && m.has(11, 9) && m.has(4, 3) && m.has(7, 6));   // Loch-Rand zählt innen
  assert.ok(!m.has(5, 4) && !m.has(6, 5) && !m.has(-1, 0) && !m.has(12, 9));
  const c = m.cells;
  assert.equal(c.length, m.size);
  for (let i = 1; i < c.length; i++) assert.ok(c[i - 1][0] < c[i][0] || (c[i - 1][0] === c[i][0] && c[i - 1][1] < c[i][1]));
  assert.deepEqual(m.bbox, { x0: 0, x1: 11, z0: 0, z1: 9 });
  assert.throws(() => mk(['nope']), /unbekannte/);
});

test('Maske: xMin/xMax, union, minus', () => {
  const links = mk(['w1'], { xMax: 5 });
  assert.deepEqual(links.bbox, { x0: 0, x1: 5, z0: 0, z1: 9 });
  const a = mk(['w1']), b = mk(['w2']);
  assert.equal(a.union(b).size, a.size + 16);
  assert.equal(a.minus(links).size, a.size - links.size);
  assert.equal(mk(['w1'], { abzug: [links] }).size, a.size - links.size);
  assert.ok(!a.minus(links).has(0, 0) && a.minus(links).has(6, 0));
});

test('Maske: d8 = Chebyshev-Abstand zum Außenrand, Löcher zählen als innen', () => {
  const m = mk(['w1']);
  assert.equal(m.d8(0, 0), 1);
  assert.equal(m.d8(11, 5), 1);
  assert.equal(m.d8(1, 1), 2);
  assert.equal(m.d8(2, 5), 3);
  assert.equal(m.d8(3, 5), 4);       // neben dem Loch (4,5 ist Rand): Loch erzeugt keinen Rand
  assert.equal(m.d8(4, 4), 5);
  assert.equal(m.d8(5, 4), 0);       // Lochzelle: nicht in der Maske
  assert.equal(m.d8(-5, -5), 0);
  // Gegenprobe: Chebyshev-Abstand zu allen Nicht-Zellen des Rechtecks
  for (const [x, z] of m.cells) {
    const d = Math.min(x + 1, 12 - x, z + 1, 10 - z);
    assert.equal(m.d8(x, z), d, `(${x},${z})`);
  }
});

test('Maske: loecher, dLoch und dAussen', () => {
  const m = mk(['w1']);
  const l = m.loecher();
  assert.equal(l.length, 1);
  assert.equal(l[0].size, 4);
  assert.ok(l[0].has(5, 4) && l[0].has(6, 5));
  assert.equal(m.dLoch(0, 5, 4), 0);
  assert.equal(m.dLoch(0, 4, 4), 1);
  assert.equal(m.dLoch(0, 3, 4), 2);
  assert.equal(m.dLoch(0, 0, 0), 5);
  assert.throws(() => m.dLoch(1, 0, 0), /kein Loch/);
  assert.equal(m.dAussen(-1, 0), 1);
  assert.equal(m.dAussen(-3, 4), 3);
  assert.equal(m.dAussen(13, 11), 2);
  assert.equal(m.dAussen(5, 5), 1);       // Lochzelle: nicht in der Maske, grenzt an sie
  assert.equal(m.dAussen(0, 0), 0);
  assert.equal(m.dAussen(200, 0), Infinity);
});

test('Maske: dilate und erode (Chebyshev)', () => {
  const m = mk(['w2']);                // 4 x 4
  assert.equal(m.dilate(1).size, 36);
  assert.equal(m.dilate(2).size, 64);
  assert.equal(m.erode(1).size, 4);
  assert.equal(m.erode(2).size, 0);
  assert.equal(m.dilate(1).erode(1).size, 16);
});

test('Maske: Kanten mit w nach innen, auch bei gegenläufigem Ring; naechsteKante', () => {
  for (const r of [ring(0, 0, 11, 9), ring(0, 0, 11, 9).reverse()]) {
    const m = Maske.ausGebaeude(['q'], { daten: [{ id: 'q', polygon: { aussen: [r], loecher: [] } }] });
    const k = m.kanten();
    assert.equal(k.length, 4);
    for (const e of k) {
      assert.ok(e.L === 11 || e.L === 9);
      const p = e.rahmen.toWorld(e.L / 2, 1);              // 1 Zelle nach innen
      assert.ok(p.x > -0.001 && p.x < 11.001 && p.z > -0.001 && p.z < 9.001, JSON.stringify(e));
      const a = e.rahmen.toWorld(0, 0), b = e.rahmen.toWorld(e.L, 0);
      assert.ok(Math.hypot(a.x - e.a.x, a.z - e.a.z) < 1e-9 && Math.hypot(b.x - e.b.x, b.z - e.b.z) < 1e-9);
    }
  }
  const m = mk(['w1']);
  const k = m.kanten();
  const i = m.naechsteKante(5.0, 0.2);
  assert.equal(k[i].a.z, 0);
  assert.equal(k[i].b.z, 0);
  assert.equal(m.naechsteKante(0, 0), 0);          // Gleichstand an der Ecke: kleinster Index
});

test('Maske: lokal rastert durch Rückabbildung der Zellmitte', () => {
  const m = mk(['w1']);
  const r = makeRahmen({ ox: 0, oz: 0, thetaDeg: 0 });
  const zellen = m.lokal(r, (u, w) => u >= 2 && u < 4 && w < 2);
  assert.deepEqual(zellen, [[2, 0], [2, 1], [3, 0], [3, 1]]);
  const r90 = makeRahmen({ ox: 0, oz: 0, thetaDeg: 90 });   // u entlang +z, w entlang -x
  const nah = (a, b) => Math.abs(a - b) < 1e-9;
  const z90 = m.lokal(r90, (u, w, x, z) => nah(u, z) && nah(w, -x) && u < 0.5 && w > -2);
  assert.deepEqual(z90, [[0, 0], [1, 0]]);
});

// ------------------------------------------------------------------ Maske (echte Daten, Plausibilität)
test('Maskengrößen der Wahrzeichen entsprechen den Katalogwerten (1 %)', () => {
  const soll = { r1461712: 24104, w43284457: 2080, w477279033: 36275, w442508011: 3303 };
  for (const [id, n] of Object.entries(soll)) {
    const m = Maske.ausGebaeude([id]);
    assert.ok(Math.abs(m.size - n) / n < 0.01, `${id}: ${m.size} statt ${n}`);
  }
  const pv = Maske.ausGebaeude(['r1461712']);
  assert.equal(pv.loecher().length, 4);
  const cor = Maske.ausGebaeude(['w328477211', 'r2302811', 'w1344547176'], { xMin: -528,
    abzug: ['r1461712', 'w43284457', 'w442508011', 'w477279033'].map((id) => Maske.ausGebaeude([id])) });
  assert.ok(Math.abs(cor.size - 2943) / 2943 < 0.01, `Korridor ${cor.size}`);
});

// ------------------------------------------------------------------ Rollen, Boden
test('Rollen: typ und fresko', () => {
  assert.equal(typ('pflaster'), 'polished_tuff');
  assert.throws(() => typ('gibt_es_nicht'), /Unbekannte Rolle/);
  const farben = ['rot', 'weiss', 'blau', 'hellblau', 'gelb', 'orange', 'gruen', 'braun', 'schwarz'];
  const typen = farben.map(fresko);
  assert.equal(new Set(typen).size, 9);
  assert.equal(fresko('rot'), 'red_terracotta');
  assert.throws(() => fresko('lila'), /Freskenfarbe/);
});

test('Boden: fundamentZellen von groundTopY+1 bis bodenY-1', () => {
  const m = Maske.vonZellen([[-100, 900], [-99, 900]]);
  const top = WZ.boden.groundTopY(-100, 900);
  const z = fundamentZellen(m, top + 4);
  assert.deepEqual(z.filter((c) => c[0] === -100).map((c) => c[1]), [top + 1, top + 2, top + 3]);
  assert.deepEqual(fundamentZellen(m, top + 1), []);
  assert.equal(typeof WZ.boden.inRaster, 'function');
});

// ------------------------------------------------------------------ Projektfelder und Registry
test('Projektfelder: Prüfung und Vorrang-Datei', () => {
  const ok = { gebaeude: ['w1'], bodenY: 68, rahmen: { ox: 0, oz: 0, thetaDeg: 1 } };
  assert.deepEqual(pruefeFelder(ok), []);
  assert.equal(pruefeFelder({ ...ok, gebaeude: [] }).length, 1);
  assert.equal(pruefeFelder({ ...ok, bodenY: '68' }).length, 1);
  assert.equal(pruefeFelder({ ...ok, rahmen: { ox: 0, oz: 0 } }).length, 1);
  assert.equal(pruefeFelder({ ...ok, luftraum: -1 }).length, 1);
  assert.equal(pruefeFelder({ ...ok, masken: { k: { gebaeude: [] } } }).length, 1);
  assert.deepEqual(pruefeFelder({ ohneMaske: true }), []);
  const v = wahrzeichenVorrang(REAL_ROOT);
  assert.equal(v.size, 23); // Welle 1 (8), Welle 2 (11), Welle 3 (Santa Croce 2, San Lorenzo 2)
  assert.equal(v.get('w777563049'), 'santa_croce');
  assert.equal(v.get('r1461712'), 'palazzo_vecchio');
  assert.equal(v.get('w1394931261'), 'orsanmichele');
  assert.equal(wahrzeichenVorrang(os.tmpdir() + path.sep + 'gibt-es-nicht').size, 0);
});

function writeProject(root, id, json) {
  const dir = path.join(root, 'projects', id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'project.json'), JSON.stringify(json));
}

test('Registry: Wahrzeichen ohne gebaeude/bodenY/rahmen wird als Problem gemeldet', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wz-reg-'));
  try {
    writeProject(root, 'wz_a', { id: 'wz_a', title: 'A', type: 'wahrzeichen' });
    writeProject(root, 'wz_b', { id: 'wz_b', title: 'B', type: 'wahrzeichen', gebaeude: ['w1'], bodenY: 64,
      rahmen: { ox: 0, oz: 0, thetaDeg: 0 } });
    const reg = loadRegistry({ root, projectsRoot: path.join(root, 'projects'), entries: [] });
    assert.deepEqual(reg.projects.map((p) => p.id), ['wz_b']);
    assert.equal(reg.problems.length, 1);
    assert.match(reg.problems[0], /wz_a.*gebaeude.*bodenY.*rahmen/);
  } finally { cleanup(root); }
});

test('Webindex: Gebäude der Zusatzmasken gehören zum Projekt (Korridor-Platzhalter entfällt)', () => {
  const { buildIndex } = require('../emit/webindex.js');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wz-index-'));
  try {
    writeProject(root, 'uffizi', { id: 'uffizi', title: 'Uffizien', type: 'wahrzeichen', gebaeude: ['w477279033'], bodenY: 65,
      rahmen: { ox: -170, oz: 907, thetaDeg: 17.4 }, masken: { korridor: { gebaeude: ['w328477211', 'w1344547176'], xMin: -528 } } });
    const idx = buildIndex({ root: REAL_ROOT, projectsRoot: path.join(root, 'projects'), entries: [] });
    const u = idx.find((e) => e.id === 'uffizi');
    assert.deepEqual(u.gebaeude, ['w477279033', 'w328477211', 'w1344547176']);
    assert.ok(!idx.some((e) => e.id !== 'uffizi' && (e.gebaeude || []).includes('w1344547176')));
  } finally { cleanup(root); }
});

// ------------------------------------------------------------------ Vorrang in Parzellen und Quartier
const vorrangHaus = (id, x0, z0, x1, z1) => ({ id, polygon: { aussen: [ring(x0, z0, x1, z1)], loecher: [] } });

test('Parzellen: Vorrang-Polygon geht vor, Häuser belegen keine Vorrangzelle', () => {
  const a = vorrangHaus('w10', 0, 0, 10, 10), b = vorrangHaus('w11', 10, 0, 20, 10);
  const vor = { id: 'r5', polygon: vorrangHaus('x', 8, 3, 13, 7).polygon, projekt: 'wztest' };
  const p = makeParzellen([a, b], { vorrang: [vor] });
  const vz = P.cellsOf(vor.polygon);
  assert.ok(vz.length > 0);
  for (const [x, z] of vz) {
    assert.equal(p.owner(x, z), 'WZ:wztest');
    assert.ok(p.istVorrang(x, z));
    assert.ok(!p.cellsOf('w10').some((c) => c[0] === x && c[1] === z));
    assert.ok(!p.cellsOf('w11').some((c) => c[0] === x && c[1] === z));
  }
  assert.equal(p.vorrangZellen('WZ:wztest').length, vz.length);
  // jede Zelle gehört genau einem Eigner
  const alle = new Set();
  for (const g of [a, b, vor]) for (const c of P.cellsOf(g.polygon)) alle.add(P.ck(c[0], c[1]));
  assert.equal(p.cellsOf('w10').length + p.cellsOf('w11').length + vz.length, alle.size);
  assert.deepEqual(p.ids.sort(), ['w10', 'w11']);
  assert.equal(p.owner(1, 1), 'w10');
  // Adjazenz kennt nur Häuser
  const adj = p.adjazenz();
  assert.deepEqual([...adj.get('w10')], ['w11']);
  // Eigner "WZ:" sortiert vor allen Häusern
  assert.ok(compareIds('WZ:a', 'w1') < 0 && compareIds('w1', 'WZ:a') > 0);
});

test('Kontext: beanspruche vergibt nie eine Vorrangzelle', () => {
  const a = vorrangHaus('w10', 0, 0, 10, 10);
  const vor = { id: 'r5', polygon: vorrangHaus('x', 11, 0, 14, 10).polygon, projekt: 'wztest' };
  const k = makeKontext({ gebaeude: [a], akten: {}, vorrang: [vor] });
  assert.equal(k.beanspruche(12, 70, 5), false);
  assert.equal(k.beanspruche(-1, 70, 5), true);
  assert.equal(k.beanspruche(-1, 70, 5), false);
  assert.equal(k.gebaut('WZ:wztest'), true);
});

// Quartier mit zwei Häusern und einem Wahrzeichen-Gebäude im Datenordner (vorrang.json dort)
function quartierRoot(gebaeudeIds) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wz-quartier-'));
  fs.mkdirSync(path.join(root, 'webapp', 'js', 'data'), { recursive: true });
  fs.copyFileSync(path.join(REAL_ROOT, 'webapp', 'js', 'data', 'block-types.js'), path.join(root, 'webapp', 'js', 'data', 'block-types.js'));
  const dir = path.join(root, 'projects', 'qvor');
  fs.mkdirSync(path.join(dir, 'daten'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'spec'), { recursive: true });
  const haus = (id, x0, z0, x1, z1, h) => ({ id, name: null, tags: { building: 'yes' }, polygon: { aussen: [ring(x0, z0, x1, z1)], loecher: [] },
    flaecheBl: (x1 - x0) * (z1 - z0), hoeheBl: h, hoeheQuelle: 'levels', bodenY: 63, isolato: 'I0001', teile: [] });
  const gs = [haus('w1001', 0, 0, 24, 16, 24), haus('w1002', 24, 0, 48, 16, 30), haus('w2000', 20, 4, 30, 10, 40)];
  fs.writeFileSync(path.join(dir, 'project.json'), JSON.stringify({ id: 'qvor', title: 'Vorrang-Quartier', type: 'quartier',
    generator: 'quartier', daten: 'daten', gebaeude: gebaeudeIds }));
  fs.writeFileSync(path.join(dir, 'daten', 'gebaeude.json'), JSON.stringify({ meta: {}, gebaeude: gs }));
  fs.writeFileSync(path.join(dir, 'daten', 'vorrang.json'), JSON.stringify({ quelle: 'Test', ids: { w2000: 'wztest' } }));
  fs.writeFileSync(path.join(dir, 'daten', 'flaechen.json'), JSON.stringify({ strassen: [], plaetze: [], wasser: [], bruecken: [] }));
  fs.writeFileSync(path.join(dir, 'spec', 'ground.js'), "'use strict';\nmodule.exports = { groundTopY: () => 63, inRaster: () => true, minY: 0, maxY: 511 };\n");
  return { root, env: { root, projectsRoot: path.join(root, 'projects'), entries: [] } };
}

test('Quartier: Vorrang-Nachbar wird nicht gebaut, Häuser lassen seine Zellen aus', (t) => {
  quiet(t);
  const f = quartierRoot(['w1001', 'w1002']);
  try {
    entwurfMain(['--project', 'qvor'], f.env);
    assert.equal(main(['--project', 'qvor'], f.env), 0);
    const project = loadRegistry(f.env).projects.find((p) => p.id === 'qvor');
    const q = require('../city/quartier.js').loadQuartier(project);
    assert.deepEqual([...q.vorrangIds], ['w2000']);
    assert.ok(!q.alle.has('w2000'));
    const vz = new Set(P.cellsOf(q.vorrang[0].polygon).map((c) => P.ck(c[0], c[1])));
    assert.ok(vz.size > 0);
    const w = buildWorld({ project });
    assert.deepEqual(w.errors, []);
    let n = 0;
    w.grid.keysOf((k) => { if (vz.has(P.ck(xOfKey(k), zOfKey(k)))) n++; return false; });
    assert.equal(n, 0, 'Block auf einer Vorrangzelle');
    assert.ok(w.grid.size > 0);
  } finally { cleanup(f.root); }
});

test('Quartier: Vorrang-ID in gebaeude ist ein LOAD-Fehler', (t) => {
  quiet(t);
  const f = quartierRoot(['w1001', 'w2000']);
  try {
    const project = loadRegistry(f.env).projects.find((p) => p.id === 'qvor');
    const w = buildWorld({ project });
    assert.ok(w.errors.some((e) => e.rule === 'LOAD' && /w2000.*wztest/.test(e.message)), JSON.stringify(w.errors));
  } finally { cleanup(f.root); }
});

// ------------------------------------------------------------------ Fixture-Wahrzeichen, R12, Webindex
// Die Fixture wird in ein Temp-Verzeichnis kopiert; der Platzhalter @WZ_LIB@ zeigt auf die echte Bibliothek.
function wzRoot(opts = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wz-klein-'));
  fs.mkdirSync(path.join(root, 'webapp', 'js', 'data'), { recursive: true });
  fs.copyFileSync(path.join(REAL_ROOT, 'webapp', 'js', 'data', 'block-types.js'), path.join(root, 'webapp', 'js', 'data', 'block-types.js'));
  const dir = path.join(root, 'projects', 'wz_klein');
  fs.cpSync(FIXTURE, dir, { recursive: true });
  const mf = path.join(dir, 'model', 'm0_basis.js');
  let src = fs.readFileSync(mf, 'utf8').replace('@WZ_LIB@', path.join(REAL_ROOT, 'tools', 'wahrzeichen', 'index.js').split(path.sep).join('/'));
  src = src.replace('// @EXTRA@', opts.extra || '');
  fs.writeFileSync(mf, src);
  if (opts.projekt) {
    const pf = path.join(dir, 'project.json');
    fs.writeFileSync(pf, JSON.stringify({ ...JSON.parse(fs.readFileSync(pf, 'utf8')), ...opts.projekt }));
  }
  return { root, env: { root, projectsRoot: path.join(root, 'projects'), entries: [] } };
}
const r12 = (root) => JSON.parse(fs.readFileSync(path.join(root, 'build', 'report_wz_klein.json'), 'utf8')).rules.find((r) => r.rule === 'R12');

test('Fixture-Wahrzeichen: Build grün, R12 grün', (t) => {
  quiet(t);
  const f = wzRoot();
  try {
    assert.equal(main(['--project', 'wz_klein'], f.env), 0);
    const rep = JSON.parse(fs.readFileSync(path.join(f.root, 'build', 'report_wz_klein.json'), 'utf8'));
    assert.equal(rep.status, 'OK');
    // 116 Plattenzellen + Wandband (d8 <= 2) in zwei Lagen
    const m = Maske.ausGebaeude(['w9001'], { daten: path.join(FIXTURE, 'daten') });
    const band = m.cells.filter(([x, z]) => m.d8(x, z) <= 2).length;
    assert.equal(rep.totalBlocks, 116 + 2 * band);
    const r = r12(f.root);
    assert.equal(r.errors, 0);
    assert.equal(r.total, 0);
    assert.ok(fs.existsSync(path.join(f.root, 'webapp', 'data', 'wz_klein', 'module_0.js')));
  } finally { cleanup(f.root); }
});

test('R12: Zelle außerhalb der Maske ist ein Fehler, Luftraum erlaubt Auskragung', (t) => {
  quiet(t);
  // zwei zusammenhängende Zellen an der Wand: Abstand 1 und 2 zur Maske
  const extra = "ctx.part('ausleger').fill([{ x: -3101, y: 65, z: 3004 }, { x: -3102, y: 65, z: 3004 }], pflaster);";
  const lauf = (projekt, ex = extra) => {
    const f = wzRoot({ extra: ex, projekt });
    try {
      const code = main(['--project', 'wz_klein'], f.env);
      const rep = JSON.parse(fs.readFileSync(path.join(f.root, 'build', 'report_wz_klein.json'), 'utf8'));
      return { code, rep };
    } finally { cleanup(f.root); }
  };
  const a = lauf({});
  assert.notEqual(a.code, 0);
  assert.equal(a.rep.rules.find((x) => x.rule === 'R12').errors, 1);   // ein Bauteil
  assert.ok(a.rep.errors.some((e) => /R12 Modul 0, Bauteil ausleger: 2 Zellen/.test(e) && /[(]-3102,65,3004[)] dAussen=2/.test(e)), a.rep.errors.join(String.fromCharCode(10)));
  const b = lauf({ luftraum: 1 });
  assert.ok(b.rep.errors.some((e) => /Bauteil ausleger: 1 Zellen/.test(e) && /dAussen=2/.test(e)), b.rep.errors.join(String.fromCharCode(10)));
  const c = lauf({ luftraum: 2 });
  assert.equal(c.code, 0, c.rep.errors.join(String.fromCharCode(10)));
  assert.equal(c.rep.rules.find((x) => x.rule === 'R12').errors, 0);
  // Lochzellen (Hof) zählen als innen
  const d = lauf({}, "ctx.part('hofboden').fill([{ x: -3095, y: 64, z: 3004 }], pflaster);");
  assert.equal(d.code, 0, d.rep.errors.join(String.fromCharCode(10)));
});

test('Webindex: Wahrzeichen-Projekt mit gebaeude unterdrückt den geplanten Platzhalter', () => {
  const { buildIndex } = require('../emit/webindex.js');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wz-index-'));
  try {
    const { landmarks } = require('../emit/stadtbasis.js').loadLandmarks();
    const pv = landmarks.find((l) => l.gebaeude.includes('r1461712'));
    assert.ok(pv, 'Platzhalter für r1461712 in wahrzeichen.json');
    const ohne = buildIndex({ root: REAL_ROOT, projectsRoot: path.join(root, 'projects'), entries: [] });
    assert.ok(ohne.some((e) => e.id === pv.id && e.status === 'geplant'));
    writeProject(root, 'palazzo_vecchio', { id: 'palazzo_vecchio', title: 'Palazzo Vecchio', type: 'wahrzeichen',
      gebaeude: ['r1461712'], bodenY: 68, rahmen: { ox: -146.5, oz: 887, thetaDeg: -79.8 } });
    const before = buildIndex({ root: REAL_ROOT, projectsRoot: path.join(root, 'projects'), entries: [] });
    const mine = before.filter((e) => (e.gebaeude || []).includes('r1461712'));
    assert.equal(mine.length, 1);
    assert.equal(mine[0].id, 'palazzo_vecchio');
    // 'gebaut', sobald unter REAL_ROOT/webapp/data/palazzo_vecchio erzeugte Daten liegen (V3 W3)
    assert.ok(['in_arbeit', 'gebaut'].includes(mine[0].status), mine[0].status);
    assert.equal(mine[0].type, 'wahrzeichen');
    assert.ok(!before.some((e) => e.id === pv.id && e.status === 'geplant'));
    assert.ok(!before.some((e) => e.id !== 'palazzo_vecchio' && (e.gebaeude || []).includes('r1461712')));
  } finally { cleanup(root); }
});
