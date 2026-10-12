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

// Load all modules
const allBlocks = new Map(); // "x,y,z" -> { mod, step, type, x, y, z }
const moduleBlocks = Array.from({ length: 10 }, () => []);

moduleFiles.forEach((file, modIdx) => {
  const filePath = path.join(dataDir, file);
  const code = fs.readFileSync(filePath, 'utf8');
  const windowObj = {};
  new Function('window', code)(windowObj);
  const steps = Object.values(windowObj)[0];

  steps.forEach((step, sIdx) => {
    step.blocks.forEach(b => {
      const k = `${b.x},${b.y},${b.z}`;
      const entry = { mod: modIdx, step: sIdx + 1, type: b.type, x: b.x, y: b.y, z: b.z };
      allBlocks.set(k, entry);
      moduleBlocks[modIdx].push(entry);
    });
  });
});

console.log(`Total blocks loaded across all 10 modules: ${allBlocks.size}`);

// 1. Support check: How many blocks have NO block directly beneath them (y - 1)?
// Note: Floor is at y=64 (or crypt y=56..58).
const noUnderneath = [];
allBlocks.forEach(b => {
  if (b.y > 64) {
    const underKey = `${b.x},${b.y - 1},${b.z}`;
    if (!allBlocks.has(underKey)) {
      noUnderneath.push(b);
    }
  }
});
console.log(`Blocks with no block directly underneath (y-1): ${noUnderneath.length}`);

// Group by module
const noUnderByMod = {};
noUnderneath.forEach(b => {
  noUnderByMod[b.mod] = (noUnderByMod[b.mod] || 0) + 1;
});
console.log('No-underneath count by module:', noUnderByMod);

// Look at blocks that have NO neighbor in 6 directions at y or y-1:
const completelyIsolated = [];
allBlocks.forEach(b => {
  if (b.y > 64) {
    const neighbors = [
      `${b.x},${b.y-1},${b.z}`,
      `${b.x+1},${b.y},${b.z}`, `${b.x-1},${b.y},${b.z}`,
      `${b.x},${b.y},${b.z+1}`, `${b.x},${b.y},${b.z-1}`,
      `${b.x+1},${b.y-1},${b.z}`, `${b.x-1},${b.y-1},${b.z}`,
      `${b.x},${b.y-1},${b.z+1}`, `${b.x},${b.y-1},${b.z-1}`
    ];
    const hasAny = neighbors.some(k => allBlocks.has(k));
    if (!hasAny) {
      completelyIsolated.push(b);
    }
  }
});
console.log(`Completely isolated blocks (no neighbor on same level or level below): ${completelyIsolated.length}`);
if (completelyIsolated.length > 0) {
  console.log('Sample isolated blocks:', completelyIsolated.slice(0, 10));
}
