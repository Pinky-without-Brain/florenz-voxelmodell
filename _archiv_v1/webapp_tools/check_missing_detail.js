const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'js', 'data');
const moduleFiles = [
  'module_0_steps.js',
  'module_1_steps.js',
  'module_2_steps.js',
  'module_3_steps.js',
  'module_4_steps.js',
  'module_5_steps.js',
  'module_6_steps.js',
  'module_7_steps.js',
  'module_8_steps.js',
  'module_9_steps.js'
];

const floorBlocks = new Map();
const buildingColumns = new Map();

moduleFiles.forEach((file, modIdx) => {
  const filePath = path.join(dataDir, file);
  const code = fs.readFileSync(filePath, 'utf8');
  const windowObj = {};
  const fn = new Function('window', code);
  fn(windowObj);
  const dataKey = Object.keys(windowObj)[0];
  const steps = windowObj[dataKey];

  steps.forEach((step, sIdx) => {
    step.blocks.forEach(b => {
      const xz = `${b.x},${b.z}`;
      if (b.y === 64) {
        floorBlocks.set(xz, { type: b.type, mod: modIdx, step: sIdx + 1 });
      }
      if (b.y >= 65) {
        if (!buildingColumns.has(xz)) buildingColumns.set(xz, []);
        buildingColumns.get(xz).push({ y: b.y, mod: modIdx, step: sIdx + 1, type: b.type });
      }
    });
  });
});

const missing = [];
buildingColumns.forEach((blocks, xz) => {
  if (!floorBlocks.has(xz)) {
    const [x, z] = xz.split(',').map(Number);
    const minY = Math.min(...blocks.map(b => b.y));
    const maxY = Math.max(...blocks.map(b => b.y));
    const mods = [...new Set(blocks.map(b => b.mod))];
    const types = [...new Set(blocks.map(b => b.type))];
    missing.push({ x, z, minY, maxY, mods, types, blockCount: blocks.length });
  }
});

console.log(`Missing count: ${missing.length}`);
// Print all missing grouped by mods
const byMods = {};
missing.forEach(m => {
  const k = m.mods.join(',');
  if (!byMods[k]) byMods[k] = [];
  byMods[k].push(m);
});

Object.keys(byMods).forEach(k => {
  console.log(`\n--- Modules ${k}: ${byMods[k].length} columns without Y=64 floor ---`);
  byMods[k].forEach(m => {
    console.log(`  (${m.x}, ${m.z}): Y=[${m.minY}..${m.maxY}], blocks=${m.blockCount}, types=${m.types.join(',')}`);
  });
});
