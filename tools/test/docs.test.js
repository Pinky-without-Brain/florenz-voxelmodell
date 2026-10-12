'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildWorld } = require('../model/world');
const { planModule } = require('../steps/planner');
const { validate } = require('../validate');
const { renderDocs, emitDocs, replaceMarkerBlock, MARK_START, MARK_END, GEN_HEADER } = require('../emit/docs');

const REAL_ROOT = path.resolve(__dirname, '..', '..');

// Kleine Welt aus den Modulen 0 und 6 (reicht für Bauanleitung und Modul-README)
let cache = null;
function world() {
  if (cache) return cache;
  const w = buildWorld({ modules: [0, 6] });
  assert.deepEqual(w.errors, []);
  const stepsByModule = {};
  for (const m of w.modules) stepsByModule[m.module] = planModule(m, m.content, w.grid);
  cache = { w, stepsByModule };
  return cache;
}

// Minimaler Projektbaum: nur die Dateien, die der Emitter liest
function makeRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'docs-test-'));
  fs.mkdirSync(path.join(root, 'webapp', 'js', 'data'), { recursive: true });
  fs.copyFileSync(path.join(REAL_ROOT, 'webapp', 'js', 'data', 'block-types.js'), path.join(root, 'webapp', 'js', 'data', 'block-types.js'));
  for (const [n, name] of [[0, '02_Modul_0_Fundament_und_Gelaende'], [6, '08_Modul_6_Laterne_und_Kugel']]) {
    fs.mkdirSync(path.join(root, name));
    fs.writeFileSync(path.join(root, name, 'README.md'), `# Modul ${n}\n\nText vor den Markern.\n\n${MARK_START}\nalt\n${MARK_END}\n\nText nach den Markern.\n`);
  }
  return root;
}

function args(root) {
  const { w, stepsByModule } = world();
  return { modules: w.modules, stepsByModule, grid: w.grid, root };
}

test('Ausgabe ist deterministisch', () => {
  const root = makeRoot();
  try {
    const a = renderDocs(args(root));
    const b = renderDocs(args(root));
    assert.deepEqual([...a.keys()], [...b.keys()]);
    for (const [k, v] of a) assert.equal(v, b.get(k), k);
    const guide = a.get('08_Modul_6_Laterne_und_Kugel/BAUANLEITUNG_MODUL_6.md');
    assert.ok(guide.startsWith(GEN_HEADER + '\n'));
    assert.match(guide, /### Schritt 6\.1 – /);
    assert.match(guide, /## Gesamt-Stückliste/);
    // Projekt-README und Palette entstehen nur bei vollständigem Modulsatz
    assert.ok(!a.has('README.md'));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('Marker-Ersatz lässt den Text außerhalb unverändert', () => {
  const text = `# Titel\n\nVorher.\n\n${MARK_START}\nalt\n${MARK_END}\n\nNachher.\n`;
  const out = replaceMarkerBlock(text, 'neu\nzwei');
  assert.equal(out, `# Titel\n\nVorher.\n\n${MARK_START}\nneu\nzwei\n${MARK_END}\n\nNachher.\n`);
  assert.equal(replaceMarkerBlock(out, 'neu\nzwei'), out); // idempotent
  // CRLF bleibt erhalten
  const crlf = text.replace(/\n/g, '\r\n');
  const o2 = replaceMarkerBlock(crlf, 'a\nb');
  assert.ok(o2.startsWith('# Titel\r\n\r\nVorher.\r\n\r\n'));
  assert.ok(o2.endsWith('\r\n\r\nNachher.\r\n'));
  assert.ok(!/[^\r]\n/.test(o2));
});

test('Fehlen die Marker, kommen sie direkt nach der ersten Überschrift', () => {
  const out = replaceMarkerBlock('# Titel\n\nText.\n', 'x');
  assert.equal(out, `# Titel\n\n${MARK_START}\nx\n${MARK_END}\n\nText.\n`);
});

test('emitDocs schreibt die Dateien und ändert beim zweiten Lauf nichts', () => {
  const root = makeRoot();
  try {
    const first = emitDocs(args(root));
    assert.ok(first.changed.length >= 4);
    const second = emitDocs(args(root));
    assert.deepEqual(second.changed, []);
    const readme = fs.readFileSync(path.join(root, '08_Modul_6_Laterne_und_Kugel', 'README.md'), 'utf8');
    assert.ok(readme.includes('Text vor den Markern.'));
    assert.ok(readme.includes('Text nach den Markern.'));
    assert.match(readme, /Statistik \(generiert\)/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('R9 erkennt eine manipulierte Zahl', () => {
  const root = makeRoot();
  try {
    const a = args(root);
    emitDocs(a);
    const run = () => validate({ grid: a.grid, world: world().w, stepsByModule: a.stepsByModule, root,
      only: ['R9'], docs: {} })[0];
    assert.deepEqual(run().errors, []);

    const rel = '08_Modul_6_Laterne_und_Kugel/BAUANLEITUNG_MODUL_6.md';
    const file = path.join(root, ...rel.split('/'));
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    const i = lines.findIndex((l) => l.startsWith('| Blöcke | '));
    assert.ok(i > 0);
    lines[i] = lines[i].replace(/\d[\d.]*/, (m) => String(Number(m.replace(/\./g, '')) + 1));
    fs.writeFileSync(file, lines.join('\n'));
    const r = run();
    assert.equal(r.errors.length, 1);
    assert.match(r.errors[0], new RegExp(`R9 ${rel}:${i + 1}:`));

    // Fehlende Datei
    fs.rmSync(file);
    assert.match(run().errors[0], /Datei fehlt/);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('R9 wird ohne docs-Option übersprungen', () => {
  const { w, stepsByModule } = world();
  const r = validate({ grid: w.grid, world: w, stepsByModule, only: ['R9'] })[0];
  assert.deepEqual(r.errors, []);
  assert.equal(r.skipped, true);
});
