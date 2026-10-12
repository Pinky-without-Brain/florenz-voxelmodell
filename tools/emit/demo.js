'use strict';
// DEMO-Projekt für die Webapp-Entwicklung (nur mit ?demo=1 sichtbar, nie im Projektindex).
// Erzeugt webapp/data/_demo/module_1.js und projekt.js: einen kleinen Turm mit Glasfenstern und Wasserbecken
// auf der Piazza della Signoria. Kein Teil der Pipeline und kein echtes Bauprojekt.
const fs = require('node:fs');
const path = require('node:path');
const { encodeRuns } = require('./data.js');
const geo = require('../geo/gelaende.js');

const ROOT = path.resolve(__dirname, '..', '..');
const CX = -160, CZ = 790;

function generate() {
  const base = geo.groundTopY(CX, CZ) + 1;
  const steps = [[], [], []];
  const put = (s, x, y, z, type) => steps[s].push({ x, y, z, type });
  // Schritt 0: Sockel 11x11 (3 Lagen) + Wasserbecken-Ring
  for (let x = -5; x <= 5; x++) for (let z = -5; z <= 5; z++) for (let y = 0; y < 3; y++) put(0, CX + x, base + y, CZ + z, 'stone_bricks');
  for (let x = -9; x <= 9; x++) for (let z = -9; z <= 9; z++) {
    const r = Math.max(Math.abs(x), Math.abs(z));
    if (r >= 7 && r <= 9) put(0, CX + x, base, CZ + z, r === 7 ? 'smooth_quartz' : 'water');
  }
  // Schritt 1: Schaft 7x7 hohl, 14 Lagen, Fenster aus Glas
  for (let y = 3; y < 17; y++) for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
    if (Math.max(Math.abs(x), Math.abs(z)) !== 3) continue;
    const win = (y % 4 === 1 || y % 4 === 2) && (Math.abs(x) === 0 || Math.abs(z) === 0) && y > 4;
    put(1, CX + x, base + y, CZ + z, win ? 'red_stained_glass' : 'smooth_quartz');
  }
  // Schritt 2: Dach (Pyramide) und Goldkugel
  for (let k = 0; k < 4; k++) for (let x = -3 + k; x <= 3 - k; x++) for (let z = -3 + k; z <= 3 - k; z++) put(2, CX + x, base + 17 + k, CZ + z, 'brown_terracotta');
  put(2, CX, base + 21, CZ, 'gold_block');
  return { base, steps };
}

function main() {
  const { base, steps } = generate();
  const palette = ['stone_bricks', 'smooth_quartz', 'water', 'red_stained_glass', 'brown_terracotta', 'gold_block'];
  const idx = new Map(palette.map((t, i) => [t, i]));
  const text = [
    ['Der Sockel', 'Setze den Sockel und den Wasserring.'],
    ['Der Schaft', 'Mauere den hohlen Turmschaft mit den Glasfenstern.'],
    ['Das Dach', 'Setze das Pyramidendach und die goldene Spitze.']
  ];
  let total = 0;
  const outSteps = steps.map((bl, i) => {
    const enc = encodeRuns(bl, idx);
    total += enc.blocks;
    return { stepNumber: i + 1, title: text[i][0], description: text[i][1] + ' (DEMO)', tip: 'Nur Testdaten.', caution: 'Kein echtes Bauprojekt.',
      fact: 'Dieses Demo-Projekt prüft Laden, Meshing und Stadtkarte.', cameraHint: { eye: [CX + 40, base + 30, CZ + 40], target: [CX, base + 8, CZ] },
      count: enc.blocks, yRange: [base, base + 21], runs: enc.base64 };
  });
  const data = { module: 1, title: 'Demo-Turm', subtitle: 'Testdaten', icon: '🧪', palette, steps: outSteps };
  const dir = path.join(ROOT, 'webapp', 'data', '_demo');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'module_1.js'),
    '// DEMO-DATEN (tools/emit/demo.js), nur mit ?demo=1 geladen.\nwindow.PROJECT_DATA_V3 = window.PROJECT_DATA_V3 || {};\n' +
    'window.PROJECT_DATA_V3["_demo"] = window.PROJECT_DATA_V3["_demo"] || {};\nwindow.PROJECT_DATA_V3["_demo"][1] = ' + JSON.stringify(data) + ';\n');
  const entry = { id: '_demo', title: 'Demo-Turm (Testdaten)', type: 'wahrzeichen', status: 'gebaut',
    bounds: { x0: CX - 9, z0: CZ - 9, x1: CX + 9, z1: CZ + 9, y0: base, y1: base + 21 },
    modules: [{ n: 1, title: 'Demo-Turm', blocks: total, steps: 3, file: 'data/_demo/module_1.js' }], gebaeude: [], demo: true };
  fs.writeFileSync(path.join(dir, 'projekt.js'),
    '// DEMO-EINTRAG (tools/emit/demo.js): wird von app.js nur bei ?demo=1 nachgeladen.\nwindow.PROJECT_INDEX = window.PROJECT_INDEX || [];\n' +
    'window.PROJECT_INDEX.push(' + JSON.stringify(entry) + ');\n');
  console.log(`_demo: ${total} Blöcke, Basis-Y ${base}`);
}
if (require.main === module) main();
module.exports = { generate, main };
