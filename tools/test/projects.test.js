'use strict';
// V3 A1: Projekt-Registry, Boden-Provider, Mehrprojekt-Build, Emit-/Doku-Pfade und --cross.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

const { loadRegistry, getProject, loadSpecs } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { planModule, sortedKeys } = require('../steps/planner.js');
const { main, parseArgs } = require('../build.js');
const { checkCrossProject } = require('../validate/x_projects.js');
const { validate } = require('../validate');
const { makeProvider, fromGroundTopY, FALLBACK_GROUND_TOP_Y } = require('../validate/ground.js');
const { forNeighbors } = require('../validate/util.js');
const { packKey, unpackKey } = require('../geom/grid.js');
const { decodeRuns } = require('../emit/data.js');
const D = require('../spec/dimensions.js');

const REAL_ROOT = path.resolve(__dirname, '..', '..');
const FIXTURES = path.join(__dirname, 'fixtures', 'projects');
const BRAND = String.fromCharCode(108, 101, 103, 111);

// Temporäres Repository-Wurzelverzeichnis mit Kopie der Fixture-Projekte und block-types.js
function makeRoot(extra) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'proj-test-'));
  fs.mkdirSync(path.join(root, 'webapp', 'js', 'data'), { recursive: true });
  fs.copyFileSync(path.join(REAL_ROOT, 'webapp', 'js', 'data', 'block-types.js'),
    path.join(root, 'webapp', 'js', 'data', 'block-types.js'));
  fs.cpSync(FIXTURES, path.join(root, 'projects'), { recursive: true });
  if (extra) extra(root);
  return root;
}
const env = (root) => ({ root, projectsRoot: path.join(root, 'projects'), entries: [] });
const cleanup = (root) => fs.rmSync(root, { recursive: true, force: true });

// main() mit unterdrückter Konsole
function run(t, argv, e) {
  t.mock.method(console, 'log', () => {});
  t.mock.method(console, 'warn', () => {});
  return main(argv, e);
}

function writeProject(root, id, files) {
  for (const [rel, text] of Object.entries(files)) {
    const f = path.join(root, 'projects', id, ...rel.split('/'));
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, text);
  }
}

// ---------------------------------------------------------------- Registry

test('Registry: Dom ist registriert, Ordner projects/<id>/ werden automatisch ergänzt', () => {
  const real = loadRegistry();
  assert.equal(real.projects[0].id, 'duomo');
  assert.equal(real.projects[0].legacy, true);
  assert.equal(real.projects[0].docs, 'legacy-duomo');
  assert.equal(real.projects[0].webDataDir, path.join(REAL_ROOT, 'webapp', 'js', 'data', 'v2'));
  assert.deepEqual(real.problems, []);

  const reg = loadRegistry({ projectsRoot: FIXTURES });
  assert.deepEqual(reg.projects.map((p) => p.id), ['duomo', 'turm_konflikt', 'turm_ost', 'turm_west']);
  assert.deepEqual(reg.problems, []);
  const west = reg.projects[3];
  assert.equal(west.type, 'wahrzeichen');
  assert.equal(west.legacy, false);
  assert.equal(west.webDataDir, path.join(REAL_ROOT, 'webapp', 'data', 'turm_west'));
  assert.equal(west.docsDir, path.join(FIXTURES, 'turm_west', 'docs'));
  assert.equal(west.meta.note, 'Testprojekt (tools/test/fixtures/projects)');
  assert.throws(() => getProject('gibt_es_nicht'), /Unbekanntes Projekt/);
});

test('Registry: fehlerhafte project.json werden als Problem gemeldet, nicht gebaut', () => {
  const root = makeRoot((r) => {
    const p = (name, json) => {
      fs.mkdirSync(path.join(r, 'projects', name), { recursive: true });
      fs.writeFileSync(path.join(r, 'projects', name, 'project.json'), json);
    };
    p('falsche_id', JSON.stringify({ id: 'anders', title: 'T', type: 'quartier' }));
    p('falscher_typ', JSON.stringify({ id: 'falscher_typ', title: 'T', type: 'burg' }));
    p('kaputt', '{ nicht json');
    p('duomo', JSON.stringify({ id: 'duomo', title: 'T', type: 'quartier' }));
    fs.mkdirSync(path.join(r, 'projects', 'ohne_json'));
  });
  try {
    const reg = loadRegistry({ root, projectsRoot: path.join(root, 'projects') });
    assert.deepEqual(reg.projects.map((p) => p.id), ['duomo', 'turm_konflikt', 'turm_ost', 'turm_west']);
    assert.equal(reg.problems.length, 5);
    assert.ok(reg.problems.some((x) => /passt nicht zum Ordnernamen/.test(x)));
    assert.ok(reg.problems.some((x) => /type muss/.test(x)));
    assert.ok(reg.problems.some((x) => /nicht lesbar/.test(x)));
    assert.ok(reg.problems.some((x) => /schon registriert/.test(x)));
    assert.ok(reg.problems.some((x) => /project.json fehlt/.test(x)));
  } finally { cleanup(root); }
});

test('parseArgs: neue Schalter und Widersprüche', () => {
  assert.deepEqual(parseArgs([]), { modules: null, emit: true, strict: false, project: null, all: false, cross: false });
  assert.equal(parseArgs(['--project', 'duomo', '--modules', '0,1']).project, 'duomo');
  assert.equal(parseArgs(['--all']).all, true);
  assert.equal(parseArgs(['--cross']).cross, true);
  assert.throws(() => parseArgs(['--project']), /Projekt-ID/);
  assert.throws(() => parseArgs(['--all', '--project', 'x']), /schließen sich aus/);
});

// ---------------------------------------------------------------- Boden-Provider

test('Boden: Dom-Provider entspricht der V2-Logik (Fundamentunterkante, Fußboden außer Krypta)', () => {
  const g = loadSpecs(getProject('duomo')).ground;
  assert.equal(g.hasGroundContact(0, D.LEVELS.foundationBottomY, 0), true);
  assert.equal(g.hasGroundContact(0, D.LEVELS.floorY, 0), true);
  assert.equal(g.hasGroundContact(-170, D.LEVELS.floorY, 0), false); // über der Krypta
  assert.equal(g.hasGroundContact(0, D.LEVELS.floorY + 1, 0), false);
  assert.equal(g.minY, D.LEVELS.foundationBottomY);
  assert.equal(g.maxY, D.LEVELS.maxY);
});

test('Boden: Standardregel mit groundTopY (Kontakt bei top+1, darunter nur ohne Aushub)', () => {
  const top = (x, z) => (x >= 100 ? 70 : 63);
  const hollow = (x, y, z) => x === 5 && y >= 60 && y <= 62;
  const has = fromGroundTopY({ groundTopY: top, isHollow: hollow });
  assert.equal(has(0, 64, 0), true);      // y == top + 1
  assert.equal(has(0, 65, 0), false);     // darüber
  assert.equal(has(0, 63, 0), true);      // im Gelände, Zelle darunter fest
  assert.equal(has(5, 63, 0), false);     // Zelle darunter (5,62,0) ausgehoben
  assert.equal(has(5, 61, 0), false);     // ebenfalls ausgehoben darunter
  assert.equal(has(5, 59, 0), true);      // darunter wieder fest
  assert.equal(has(0, 0, 0), true);       // y−1 < 0: Fels
  assert.equal(has(100, 71, 0), true);    // höheres Gelände
  assert.equal(has(100, 64, 0), true);    // im Gelände
  assert.equal(has(100, 72, 0), false);
});

test('Boden: Fallback groundTopY = 63, volle Kontrolle über hasGroundContact, ungültiges Modul', () => {
  assert.equal(FALLBACK_GROUND_TOP_Y, 63);
  const fb = makeProvider(null);
  assert.equal(fb.hasGroundContact(3000, 64, -3500), true);
  assert.equal(fb.hasGroundContact(3000, 65, -3500), false);
  assert.equal(fb.groundTopY(1, 1), 63);
  const full = makeProvider({ hasGroundContact: (x, y) => y === 10, minY: 5, maxY: 99 });
  assert.equal(full.hasGroundContact(0, 10, 0), true);
  assert.equal(full.minY, 5);
  assert.equal(full.maxY, 99);
  assert.throws(() => makeProvider({}), /hasGroundContact/);
});

test('Boden: Fixture-Projekte nutzen ihr ground.js (groundTopY = 63)', () => {
  const p = getProject('turm_ost', { projectsRoot: FIXTURES });
  const g = loadSpecs(p).ground;
  assert.equal(g.groundTopY(3000, 0), 63);
  assert.equal(g.hasGroundContact(3000, 64, 0), true);
  assert.equal(g.hasGroundContact(3000, 66, 0), false);
});

// ---------------------------------------------------------------- Koordinaten nahe der Grenzen

test('Schlüssel und Nachbarn: Ecken des Bereichs liefern nur gültige Nachbarn', () => {
  const nb = (x, y, z) => { const o = []; forNeighbors(packKey(x, y, z), (k) => o.push(unpackKey(k))); return o; };
  assert.equal(nb(-4096, 0, -4096).length, 3);
  assert.equal(nb(4095, 511, 4095).length, 3);
  assert.equal(nb(0, 64, 0).length, 6);
  assert.deepEqual(nb(4095, 5, 0).filter((c) => c.x === 4096), []);
  assert.deepEqual(nb(-4096, 5, 0).filter((c) => c.x === -4097), []);
  assert.deepEqual(nb(3000, 70, -3500).map((c) => [c.x - 3000, c.y - 70, c.z + 3500]).sort(),
    [[-1, 0, 0], [0, -1, 0], [0, 0, -1], [0, 0, 1], [0, 1, 0], [1, 0, 0]]);
});

test('Planer sortiert (y, x, z) auch bei weit auseinanderliegenden Koordinaten', () => {
  const cells = [[3000, 70, 5], [-3500, 70, 2000], [-3500, 70, -4096], [4095, 64, 4095], [-4096, 64, -4096], [0, 70, 0]];
  const sorted = sortedKeys(cells.map(([x, y, z]) => packKey(x, y, z))).map((k) => {
    const c = unpackKey(k);
    return [c.x, c.y, c.z];
  });
  assert.deepEqual(sorted, [[-4096, 64, -4096], [4095, 64, 4095], [-3500, 70, -4096], [-3500, 70, 2000], [0, 70, 0], [3000, 70, 5]]);
});

// ---------------------------------------------------------------- Welt und Build über die Registry

test('Fixture-Türme: Welt über die Registry, Koordinaten bei x = 3000 und x = −3500', () => {
  for (const [id, cx, cz] of [['turm_ost', 3000, 0], ['turm_west', -3500, 2000]]) {
    const p = getProject(id, { projectsRoot: FIXTURES });
    const w = buildWorld({ project: p });
    assert.deepEqual(w.errors, []);
    assert.deepEqual(w.warnings, []);
    assert.equal(w.project.id, id);
    assert.equal(w.grid.size, 98 + 500);
    assert.deepEqual(w.grid.bounds(), { minX: cx - 3, maxX: cx + 3, minY: 64, maxY: 85, minZ: cz - 3, maxZ: cz + 3 });
    assert.ok(w.grid.has(cx, 85, cz));
    const m = w.modules[0];
    const steps = planModule(m, m.content, w.grid);
    assert.equal(steps.length, 1);
    assert.equal(steps[0].count, 598);
    assert.deepEqual(steps[0].yRange, [64, 85]);
  }
});

test('Build --project turm_ost: Bericht, Webapp-Daten, Doku, R3/R4/R6/R8 bei x = 3000', (t) => {
  const root = makeRoot();
  try {
    assert.equal(run(t, ['--project', 'turm_ost'], env(root)), 0);
    const report = JSON.parse(fs.readFileSync(path.join(root, 'build', 'report_turm_ost.json'), 'utf8'));
    assert.equal(report.status, 'OK');
    assert.equal(report.project, 'turm_ost');
    assert.equal(report.totalBlocks, 598);
    assert.deepEqual(report.errors, []);
    for (const r of report.rules) assert.equal(r.errors, 0, r.rule);
    assert.ok(report.resources.durationMs >= 0 && report.resources.peakRssMB > 0);
    assert.ok(!fs.existsSync(path.join(root, 'build', 'report.json'))); // report.json bleibt dem Dom vorbehalten
    assert.ok(!fs.existsSync(path.join(root, 'build', 'report_turm_west.json')));

    // Emit-Pfad: webapp/data/<id>/module_N.js im Format PROJECT_DATA_V3
    const file = path.join(root, 'webapp', 'data', 'turm_ost', 'module_1.js');
    assert.ok(fs.existsSync(file));
    assert.ok(!fs.existsSync(path.join(root, 'webapp', 'js', 'data', 'v2')));
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox);
    const data = sandbox.window.PROJECT_DATA_V3.turm_ost[1];
    assert.equal(data.title, 'Testturm Ost');
    assert.equal(data.steps.length, 1);
    const blocks = decodeRuns(data.steps[0].runs, data.palette);
    assert.equal(blocks.length, 598);
    assert.equal(Math.min(...blocks.map((b) => b.x)), 2997);
    assert.equal(Math.max(...blocks.map((b) => b.x)), 3003);

    // Doku-Pfad: projects/<id>/docs/
    const docs = path.join(root, 'projects', 'turm_ost', 'docs');
    const guide = fs.readFileSync(path.join(docs, 'BAUANLEITUNG_MODUL_1.md'), 'utf8');
    assert.match(guide, /^<!-- GENERIERT von tools\/emit\/docs\.js/);
    assert.match(guide, /# Bauanleitung Modul 1: Testturm Ost/);
    assert.match(guide, /### Schritt 1\.1 – Sockel & Schaft/);
    assert.match(guide, /\| X-Ausdehnung \| 2997 bis 3003 \(7 Blöcke\) \|/);
    const readme = fs.readFileSync(path.join(docs, 'README.md'), 'utf8');
    assert.match(readme, /# Testturm Ost/);
    assert.match(readme, /Statistik \(generiert\):\*\* 598 Blöcke in 1 Bauschritten, 1 Module/);
    assert.match(readme, /Ausdehnung des Modells: X 2997 bis 3003, Y 64 bis 85, Z -3 bis 3\./);
    assert.match(readme, /\[BAUANLEITUNG_MODUL_1\.md\]\(BAUANLEITUNG_MODUL_1\.md\)/);
    assert.ok(!fs.existsSync(path.join(root, 'projects', 'turm_west', 'docs')));
    // Dom-Legacy-Pfade wurden nicht angelegt
    assert.deepEqual(fs.readdirSync(root).filter((n) => /^\d\d_Modul/.test(n)), []);

    // Zweiter Lauf: R9 prüft gegen die Platte, nichts ändert sich
    const before = fs.readFileSync(path.join(docs, 'README.md'), 'utf8');
    assert.equal(run(t, ['--project', 'turm_ost'], env(root)), 0);
    assert.equal(fs.readFileSync(path.join(docs, 'README.md'), 'utf8'), before);
  } finally { cleanup(root); }
});

test('Build --project turm_west: negative Koordinaten (x = −3500, z = 2000) bleiben im Int16-Export erhalten', (t) => {
  const root = makeRoot();
  try {
    assert.equal(run(t, ['--project', 'turm_west'], env(root)), 0);
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'webapp', 'data', 'turm_west', 'module_1.js'), 'utf8'), sandbox);
    const data = sandbox.window.PROJECT_DATA_V3.turm_west[1];
    const blocks = decodeRuns(data.steps[0].runs, data.palette);
    assert.equal(Math.min(...blocks.map((b) => b.x)), -3503);
    assert.equal(Math.max(...blocks.map((b) => b.z)), 2003);
    assert.match(fs.readFileSync(path.join(root, 'projects', 'turm_west', 'docs', 'README.md'), 'utf8'), /X -3503 bis -3497/);
  } finally { cleanup(root); }
});

test('Build: --modules begrenzt auf Module des Projekts; R9 erkennt manipulierte Projekt-Doku', (t) => {
  const root = makeRoot();
  try {
    assert.equal(run(t, ['--project', 'turm_ost'], env(root)), 0);
    const guide = path.join(root, 'projects', 'turm_ost', 'docs', 'BAUANLEITUNG_MODUL_1.md');
    fs.writeFileSync(guide, fs.readFileSync(guide, 'utf8').replace('| Blöcke | 598 |', '| Blöcke | 599 |'));
    assert.equal(run(t, ['--project', 'turm_ost', '--no-emit'], env(root)), 1);
    const rep = JSON.parse(fs.readFileSync(path.join(root, 'build', 'report_turm_ost.json'), 'utf8'));
    assert.ok(rep.errors.some((e) => /^R9 projects\/turm_ost\/docs\/BAUANLEITUNG_MODUL_1\.md:/.test(e)));
    assert.equal(run(t, ['--project', 'turm_ost', '--modules', '1'], env(root)), 0); // Emit stellt wieder her
    assert.equal(run(t, ['--project', 'turm_ost', '--modules', '2'], env(root)), 0); // Modul 2 gibt es nicht: Warnung
  } finally { cleanup(root); }
});

test('Build --project mit unbekannter ID bricht ab', (t) => {
  const root = makeRoot();
  try {
    assert.throws(() => run(t, ['--project', 'nirgendwo'], env(root)), /Unbekanntes Projekt/);
  } finally { cleanup(root); }
});

test('Build ohne ground.js: Fallback groundTopY = 63 (Block auf Y 64 ok, schwebender Block fehlerhaft)', (t) => {
  const root = makeRoot((r) => {
    const proj = (id, body) => writeProject(r, id, {
      'project.json': JSON.stringify({ id, title: id, type: 'quartier' }),
      'model/m1_x.js': `'use strict';\nmodule.exports = { module: 1, build(ctx) { ${body} } };\n`
    });
    proj('flach_ok', "ctx.part('a').fill(ctx.shapes.box(10, 64, 10, 20, 66, 20), 'stone_bricks');");
    proj('flach_schwebt', "ctx.part('a').set(10, 65, 10, 'stone_bricks');");
  });
  try {
    assert.equal(run(t, ['--project', 'flach_ok'], env(root)), 0);
    assert.equal(run(t, ['--project', 'flach_schwebt'], env(root)), 1);
    const rep = JSON.parse(fs.readFileSync(path.join(root, 'build', 'report_flach_schwebt.json'), 'utf8'));
    assert.ok(rep.errors.some((e) => /^R3 /.test(e)));
    assert.ok(rep.errors.some((e) => /^R4 /.test(e)));
    // ohne Content: Warnung, README nennt die Bauteil-ID als Titel
    assert.ok(rep.warnings.some((w) => /kein Content \(projects\/flach_schwebt\/content\/modul_1\.json\)/.test(w)));
  } finally { cleanup(root); }
});

test('Build --all baut alle registrierten Projekte nacheinander mit eigenem Bericht', (t) => {
  const root = makeRoot((r) => fs.rmSync(path.join(r, 'projects', 'turm_konflikt'), { recursive: true }));
  try {
    assert.equal(run(t, ['--all'], env(root)), 0);
    for (const id of ['turm_ost', 'turm_west']) {
      const rep = JSON.parse(fs.readFileSync(path.join(root, 'build', `report_${id}.json`), 'utf8'));
      assert.equal(rep.status, 'OK');
      assert.ok(fs.existsSync(path.join(root, 'webapp', 'data', id, 'module_1.js')));
      assert.ok(fs.existsSync(path.join(root, 'projects', id, 'docs', 'README.md')));
    }
  } finally { cleanup(root); }
});

test('Build --all meldet fehlerhafte project.json als Fehler (Exit 1)', (t) => {
  const root = makeRoot((r) => writeProject(r, 'kaputt', { 'project.json': '{' }));
  try {
    assert.equal(run(t, ['--all'], env(root)), 1);
  } finally { cleanup(root); }
});

// ---------------------------------------------------------------- Projektübergreifende Prüfung

test('--cross: Ost- und Westturm überlappen nicht', () => {
  const r = checkCrossProject(['turm_ost', 'turm_west'], { projectsRoot: FIXTURES, entries: [] });
  assert.deepEqual(r.errors, []);
  assert.equal(r.conflicts, 0);
  assert.equal(r.columnOverlaps, 0);
  assert.equal(r.pairs.length, 1);
});

test('--cross: überlappender Turm wird als Zellkonflikt gemeldet (300 doppelte Zellen)', () => {
  const r = checkCrossProject(['turm_ost', 'turm_konflikt'], { projectsRoot: FIXTURES, entries: [] });
  // Sockel: x 2999..3003 (5) · z −2..3 (6) · y 64..65 (2) = 60; Schaft: x 3000..3002 (3) · z −1..2 (4) · y 66..85 (20) = 240
  assert.equal(r.conflicts, 300);
  assert.equal(r.pairs[0].conflicts, 300);
  assert.equal(r.pairs[0].columns, 5 * 6); // gemeinsame Säulen: x 2999..3003 · z −2..3
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /^X Projekte turm_ost und turm_konflikt: 300 Zellen doppelt belegt, z\. B\. \(/);
  assert.equal(r.pairs[0].examples.length, 10);
  assert.match(r.pairs[0].examples[0].turm_ost, /^1\/(sockel|schaft)$/);
});

test('--cross über main: Exit 1 bei Konflikt, 0 ohne; alle drei Türme zusammen melden genau ein Paar', (t) => {
  const root = makeRoot();
  try {
    assert.equal(run(t, ['--cross'], env(root)), 1);
    assert.equal(run(t, ['--cross', '--project', 'turm_ost,turm_west'], env(root)), 0);
    const all = checkCrossProject(null, { root, projectsRoot: path.join(root, 'projects'), entries: [] });
    assert.deepEqual(all.pairs.filter((p) => p.conflicts).map((p) => `${p.a}/${p.b}`), ['turm_konflikt/turm_ost']);
    assert.equal(all.pairs.length, 3);
  } finally { cleanup(root); }
});

test('--cross: Säule mit überlappendem y-Bereich ohne Zellkonflikt ist nur eine Warnung', () => {
  const root = makeRoot((r) => writeProject(r, 'luft', {
    'project.json': JSON.stringify({ id: 'luft', title: 'Luft', type: 'stadtgrund' }),
    'model/m1_x.js': "'use strict';\nmodule.exports = { module: 1, build(ctx) {\n" +
      "  const w = ctx.part('p'); w.set(3000, 60, 0, 'stone_bricks'); w.set(3000, 90, 0, 'stone_bricks');\n} };\n"
  }));
  try {
    const r = checkCrossProject(['turm_ost', 'luft'], { root, projectsRoot: path.join(root, 'projects'), entries: [] });
    assert.equal(r.conflicts, 0);
    assert.equal(r.columnOverlaps, 1);
    assert.deepEqual(r.errors, []);
    assert.equal(r.warnings.length, 1);
    assert.match(r.warnings[0], /1 Säulen mit überlappendem y-Bereich, aber ohne Zellkonflikt/);
    assert.throws(() => checkCrossProject(['nirgendwo'], { root, projectsRoot: path.join(root, 'projects'), entries: [] }), /Unbekanntes Projekt/);
  } finally { cleanup(root); }
});

test('--cross auf dem echten Repository: nur der Dom, 0 Konflikte', () => {
  const r = checkCrossProject(null);
  assert.deepEqual(r.projects, ['duomo']);
  assert.equal(r.conflicts, 0);
  assert.deepEqual(r.errors, []);
});

// ---------------------------------------------------------------- R10

test('R10 durchsucht zusätzlich projects/, data/ und 20_Stadtmodell_Florenz/, aber nicht data/osm/', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r10-test-'));
  try {
    const put = (rel, text) => {
      const f = path.join(root, ...rel.split('/'));
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, text);
    };
    const bad = `Ein ${BRAND} im Text\n`;
    put('projects/a/model/notiz.md', bad);
    put('projects/a/project.json', JSON.stringify({ note: `${BRAND} Haus` }));
    put('data/stadt/info.json', JSON.stringify({ x: BRAND }));
    put('20_Stadtmodell_Florenz/plan.md', bad);
    put('data/osm/roh.json', JSON.stringify({ x: BRAND }));          // Rohdaten: übersprungen
    put('webapp/data/a/module_1.js', `window.X = "${BRAND}";`);       // erzeugt: übersprungen
    put('projects/a/docs/ok.md', 'Alles sauber\n');
    const res = validate({ grid: null, world: { modules: [] }, root, only: ['R10'] })[0];
    assert.equal(res.total, 4);
    const files = res.errors.map((e) => e.split(':')[0]).sort();
    assert.deepEqual(files, [
      'R10 20_Stadtmodell_Florenz/plan.md', 'R10 data/stadt/info.json',
      'R10 projects/a/model/notiz.md', 'R10 projects/a/project.json'].sort());
  } finally { cleanup(root); }
});
