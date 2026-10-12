'use strict';
// Demo: Testmodell (Modul 9) -> webapp/js/data/v2/module_9.js. Mit --clean wird die Datei gelöscht.
const fs = require('node:fs');
const path = require('node:path');
const { VoxelGrid, packKey } = require('../geom/grid');
const shapes = require('../geom/shapes');
const { emitModuleData } = require('../emit/data');

const outDir = path.join(__dirname, '..', '..', 'webapp', 'js', 'data', 'v2');
const outFile = path.join(outDir, 'module_9.js');

if (process.argv.includes('--clean')) {
  if (fs.existsSync(outFile)) { fs.unlinkSync(outFile); console.log('gelöscht: ' + outFile); }
  else console.log('nichts zu löschen');
  process.exit(0);
}

const SOCKEL_HALF = 14;   // 30 x 30 Zellen: -15..+14
const TURM_APOTHEM = 10;
const TURM_HOEHE = 40;
const BASE_Y = 64;
const grid = new VoxelGrid();
const parts = [];
function part(id, cells, material) {
  const w = grid.writer({ module: 9, part: id });
  const keys = [];
  for (const c of cells) keys.push(packKey(c.x, c.y, c.z));
  w.fill(cells.map ? cells : cells, material);
  parts.push({ id, keys });
}
function collect(gen) { return Array.from(gen); }

const sockel = collect(shapes.box(-15, BASE_Y, -15, 14, BASE_Y + 1, 14));
const turm = collect(shapes.octagonPrism(0, 0, TURM_APOTHEM, BASE_Y + 2, BASE_Y + 1 + TURM_HOEHE));
const kugel = collect(shapes.sphere(0, BASE_Y + 2 + TURM_HOEHE + 6, 0, 6));

part('sockel', sockel, 'stone_bricks');
part('turm', turm, (x, y) => (Math.floor((y - (BASE_Y + 2)) / 5) % 2 === 0 ? 'stone_bricks' : 'smooth_quartz'));
part('kugel', kugel, 'gold_block');

const defs = [
  ['Sockel', 'Ein flacher Sockel aus Steinziegeln.'],
  ['Achteckiger Turm', 'Der Turm wechselt alle 5 Lagen zwischen Steinziegeln und Quarz.'],
  ['Goldkugel', 'Die Goldkugel krönt den Turm.']
];
const steps = parts.map((p, i) => {
  const ys = p.keys.map((k) => k % 512);
  return {
    module: 9, stepNumber: i + 1, parts: [p.id], partIndex: 1, partCount: 1,
    yRange: [Math.min(...ys), Math.max(...ys)], count: p.keys.length,
    title: defs[i][0], description: defs[i][1], tip: 'Demo-Tipp', caution: 'Demo-Warnung', fact: 'Demo-Fakt',
    cameraHint: { eye: [60, 120, 60], target: [0, 90, 0] }, cells: p.keys
  };
});

const res = emitModuleData({
  moduleMeta: { module: 9, title: 'Demo-Turm', subtitle: 'Bautüte 9: Testmodell', icon: '🗼' },
  steps, grid, outDir
});
console.log(`Datei: ${res.file}\nGröße: ${res.bytes} Bytes\nBlöcke: ${res.blocks}\nLäufe: ${res.runs}`);
