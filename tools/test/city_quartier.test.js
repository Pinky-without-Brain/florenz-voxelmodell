'use strict';
// V3 C1: Quartier-Projekte (>10 Module), Entwurfs-Akten, Validator R11, Ablehnung außerhalb des Geländerasters.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { main } = require('../build.js');
const { main: entwurfMain, entwurf, geometrie } = require('../city/akten_entwurf.js');
const A = require('../city/akte.js');
const { makeParzellen } = require('../city/parzellen.js');
const { Umfeld } = require('../city/umfeld.js');
const { VoxelGrid } = require('../geom/grid.js');
const { loadRegistry } = require('../projects.js');
const { buildWorld } = require('../model/world.js');

const REAL_ROOT = path.resolve(__dirname, '..', '..');
const ring = (x0, z0, x1, z1) => [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];

function haus(id, x0, z0, x1, z1, hoehe, iso, extra) {
  return { id, name: null, tags: { building: 'yes' }, polygon: { aussen: [ring(x0, z0, x1, z1)], loecher: [] },
    flaecheBl: (x1 - x0) * (z1 - z0), hoeheBl: hoehe, hoeheQuelle: 'levels', bodenY: 63, isolato: iso, teile: [], ...extra };
}

// Quartier mit 12 Isolati (ein Isolato mit zwei Häusern an einer Brandwand)
function fixtureHaeuser() {
  const gs = [haus('w1001', 0, 0, 24, 16, 24, 'I0001'), haus('w1002', 24, 0, 48, 16, 30, 'I0001')];
  for (let i = 2; i <= 12; i++) gs.push(haus('w' + (1001 + i), i * 100, 0, i * 100 + 22, 16, 22 + i, 'I' + String(i).padStart(4, '0')));
  return gs;
}

function makeRoot(opts = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'quartier-test-'));
  fs.mkdirSync(path.join(root, 'webapp', 'js', 'data'), { recursive: true });
  fs.copyFileSync(path.join(REAL_ROOT, 'webapp', 'js', 'data', 'block-types.js'), path.join(root, 'webapp', 'js', 'data', 'block-types.js'));
  const gs = opts.haeuser || fixtureHaeuser();
  const dir = path.join(root, 'projects', 'qtest');
  fs.mkdirSync(path.join(dir, 'daten'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'spec'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'project.json'), JSON.stringify({ id: 'qtest', title: 'Testquartier', type: 'quartier',
    generator: 'quartier', daten: 'daten', gebaeude: gs.map((g) => g.id) }));
  fs.writeFileSync(path.join(dir, 'daten', 'gebaeude.json'), JSON.stringify({ meta: {}, gebaeude: gs }));
  const strasse = { id: 'ws1', typ: 'residential', name: 'Via Prova', polygon: { aussen: [ring(-20, -14, 1400, -2)], loecher: [] } };
  fs.writeFileSync(path.join(dir, 'daten', 'flaechen.json'), JSON.stringify({ strassen: [strasse], plaetze: [], wasser: [], bruecken: [] }));
  fs.writeFileSync(path.join(dir, 'spec', 'ground.js'), opts.ground ||
    "'use strict';\nmodule.exports = { groundTopY: () => 63, inRaster: () => true, minY: 0, maxY: 511 };\n");
  return { root, dir, env: { root, projectsRoot: path.join(root, 'projects'), entries: [] }, gs };
}
const cleanup = (root) => fs.rmSync(root, { recursive: true, force: true });

function quiet(t) {
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'warn', () => {});
}

test('Quartier-Projekt mit 12 Isolati: ein Modul je Isolato, Teile je Haus, Daten und Doku für Modul 11', (t) => {
  quiet(t);
  const f = makeRoot();
  try {
    const r = entwurfMain(['--project', 'qtest'], f.env);
    assert.equal(r.geschrieben.length, 13);
    assert.equal(main(['--project', 'qtest'], f.env), 0);
    const rep = JSON.parse(fs.readFileSync(path.join(f.root, 'build', 'report_qtest.json'), 'utf8'));
    assert.equal(rep.moduleCount, 12);
    assert.equal(rep.status, 'OK');
    assert.ok(rep.rules.find((x) => x.rule === 'R11'));
    assert.equal(rep.rules.find((x) => x.rule === 'R11').errors, 0);
    assert.ok(rep.modules[0].title.startsWith('Isolato I0001'));
    assert.ok(rep.modules[0].title.includes('Via Prova'), rep.modules[0].title);
    assert.ok(fs.existsSync(path.join(f.root, 'webapp', 'data', 'qtest', 'module_11.js')));
    assert.ok(fs.existsSync(path.join(f.root, 'projects', 'qtest', 'docs', 'BAUANLEITUNG_MODUL_11.md')));
    // Welt: Teile heißen wie die Gebäude-IDs, aufsteigend
    const reg = loadRegistry(f.env);
    const project = reg.projects.find((p) => p.id === 'qtest');
    const w = buildWorld({ project });
    assert.deepEqual(w.errors, []);
    assert.equal(w.modules.length, 12);
    assert.deepEqual(w.modules[0].parts.map((p) => p.id), ['w1001', 'w1002']);
    assert.equal(w.modules[11].parts[0].id, 'w1013');
    assert.equal(w.modules[0].content.parts.w1001.title.startsWith('Reihenhaus an Via Prova') ||
      w.modules[0].content.parts.w1001.title.includes('an Via Prova'), true, w.modules[0].content.parts.w1001.title);
    assert.match(w.modules[0].content.parts.w1001.description, /geschätzt/);
    // Modul 11 ist über --modules ansprechbar
    assert.equal(main(['--project', 'qtest', '--modules', '11', '--no-emit'], f.env), 0);
  } finally { cleanup(f.root); }
});

test('Entwurfs-CLI überschreibt vorhandene Akten nie', (t) => {
  quiet(t);
  const f = makeRoot();
  try {
    entwurfMain(['--project', 'qtest'], f.env);
    const file = path.join(f.dir, 'hausakten', 'w1005.json');
    const a = JSON.parse(fs.readFileSync(file, 'utf8'));
    a.notiz = 'von Hand';
    fs.writeFileSync(file, JSON.stringify(a));
    fs.rmSync(path.join(f.dir, 'hausakten', 'w1006.json'));
    const r = entwurfMain(['--project', 'qtest'], f.env);
    assert.deepEqual(r.geschrieben, ['w1006']);
    assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).notiz, 'von Hand');
  } finally { cleanup(f.root); }
});

test('R11 erkennt falsche Höhe, ungültige Felder, fehlende Akte und gleiche Nachbarn', (t) => {
  quiet(t);
  const f = makeRoot();
  try {
    entwurfMain(['--project', 'qtest'], f.env);
    const hd = path.join(f.dir, 'hausakten');
    const lies = (id) => JSON.parse(fs.readFileSync(path.join(hd, id + '.json'), 'utf8'));
    const schreib = (id, a) => fs.writeFileSync(path.join(hd, id + '.json'), JSON.stringify(a));
    // 1) Höhe weicht um mehr als 2 ab
    const a3 = lies('w1003'); a3.geschosse = [{ art: 'eg', hoeheBl: 9 }]; schreib('w1003', a3);
    // 2) ungültiger Enum-Wert
    const a4 = lies('w1004'); a4.fassade.fenster.typ = 'kreisrund'; schreib('w1004', a4);
    // 3) fehlende Akte
    fs.rmSync(path.join(hd, 'w1005.json'));
    // 4) Nachbarn mit gleichen Merkmalen (kein Ensemble)
    const a1 = lies('w1001'), a2 = lies('w1002');
    a2.fassade = JSON.parse(JSON.stringify(a1.fassade)); a2.geschosse = a1.geschosse; a2.typ = a1.typ; schreib('w1002', a2);
    a1.geschosse = [{ art: 'eg', hoeheBl: 10 }, { art: 'og', hoeheBl: 8 }, { art: 'og', hoeheBl: 6 }]; schreib('w1001', a1);
    const reg = loadRegistry(f.env);
    const project = reg.projects.find((p) => p.id === 'qtest');
    const w = buildWorld({ project });
    const { validate } = require('../validate/index.js');
    const [r] = validate({ grid: w.grid, world: w, project, only: ['R11'], root: f.root });
    const text = r.errors.join('\n');
    assert.match(text, /Haus w1003: Geschosshöhen ergeben 9/);
    assert.match(text, /Haus w1004: fassade\.fenster\.typ ungültig/);
    assert.match(text, /Haus w1005: keine Hausakte/);
    assert.match(text, /Nachbarn w1001 \/ w1002: nur 0 Unterschied/);
    // gemeinsames Ensemble hebt die Nachbarschaftsregel auf
    a1.ensemble = 'testplatz'; a2.ensemble = 'testplatz'; schreib('w1001', a1); schreib('w1002', a2);
    const project2 = loadRegistry(f.env).projects.find((p) => p.id === 'qtest'); // frischer Cache
    const w2 = buildWorld({ project: project2 });
    const [r2] = validate({ grid: w2.grid, world: w2, project: project2, only: ['R11'], root: f.root });
    assert.ok(!r2.errors.join('\n').includes('Nachbarn w1001'));
    assert.ok(r2.info.length === 12);
    // Build schlägt fehl (Exit 1)
    assert.equal(main(['--project', 'qtest', '--no-emit'], f.env), 1);
  } finally { cleanup(f.root); }
});

test('Gebäude außerhalb des Geländerasters werden mit klarer Meldung abgelehnt', (t) => {
  quiet(t);
  const f = makeRoot({ ground: "'use strict';\nmodule.exports = { groundTopY: () => 63, inRaster: (x) => x < 500, minY: 0, maxY: 511 };\n" });
  try {
    const reg = loadRegistry(f.env);
    const project = reg.projects.find((p) => p.id === 'qtest');
    const w = buildWorld({ project });
    assert.equal(w.modules.length, 0);
    assert.match(w.errors[0].message, /außerhalb des Geländerasters/);
    assert.match(w.errors[0].message, /w1013/);
    assert.equal(main(['--project', 'qtest', '--no-emit'], f.env), 1);
  } finally { cleanup(f.root); }
});

test('Entwurf: gültige Akte, quelle typologie, sicherheit <= 0.4, deterministisch, Typ aus Name', () => {
  const g = haus('w77', 0, 0, 60, 20, 36, 'I1', { name: 'Palazzo Prova' });
  const a = entwurf(g, [], {});
  assert.deepEqual(A.validiere(a), []);
  assert.equal(a.quelle, 'typologie');
  assert.ok(a.sicherheit <= 0.4);
  assert.match(a.typ, /^palazzo_/);
  assert.equal(a.name, 'Palazzo Prova');
  assert.deepEqual(entwurf(g, [], {}), a);
  assert.equal(A.summeHoehe(a), 36);
  const t = entwurf(haus('w78', 0, 0, 14, 12, 38, 'I1', { name: 'Torre dei Prova' }), [], {});
  assert.equal(t.typ, 'casa_torre');
  assert.equal(A.summeHoehe(t), 38);
});

test('Entwurf: Nachbarn einer Häuserzeile unterscheiden sich in mindestens zwei Merkmalen', () => {
  const gs = [];
  for (let i = 0; i < 14; i++) gs.push(haus('w' + (200 + i), i * 14, 0, i * 14 + 14, 18, 30, 'I1'));
  const pz = makeParzellen(gs);
  const adj = pz.adjazenz();
  const akten = new Map();
  for (const g of gs) {
    const nach = [...adj.get(g.id)].map((n) => akten.get(n)).filter(Boolean);
    akten.set(g.id, entwurf(g, nach, {}));
  }
  let paare = 0;
  for (const g of gs) for (const n of adj.get(g.id)) {
    if (n <= g.id) continue;
    paare++;
    assert.ok(A.nachbarnOk(akten.get(g.id), akten.get(n)), `${g.id}/${n}: ${A.unterschiede(akten.get(g.id), akten.get(n))} Unterschiede`);
  }
  assert.equal(paare, 13);
});

test('Umfeld: Straßenfront und Straßenname', () => {
  const u = new Umfeld({ strassen: [{ id: 's', typ: 'residential', name: 'Via Prova', polygon: { aussen: [ring(-50, -12, 300, -2)], loecher: [] } }] });
  assert.equal(u.klasse(10, -5), 'strasse');
  assert.equal(u.klasse(10, 5), null);
  assert.equal(u.nearestName(10, 2).name, 'Via Prova');
  const geo = geometrie(haus('w1', 0, 0, 30, 14, 20, 'I1'), u);
  assert.equal(geo.front, 30);
  assert.equal(geo.strassenKanten, 1);
});

test('Grid: Modulnummern bis 511 erlaubt, 512 nicht', () => {
  const g = new VoxelGrid();
  g.writer({ module: 511, part: 'x' }).set(0, 70, 0, 'tuff');
  assert.throws(() => g.writer({ module: 512, part: 'x' }), RangeError);
});
