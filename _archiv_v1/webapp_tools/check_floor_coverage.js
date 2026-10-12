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
const buildingColumns = new Map(); // (x, z) -> list of blocks with y >= 65

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

console.log(`Total unique floor positions at Y=64: ${floorBlocks.size}`);
console.log(`Total building columns with Y>=65: ${buildingColumns.size}`);

// Check building columns that have NO floor at Y=64 underneath them!
const missingFloorUnderBuilding = [];
buildingColumns.forEach((blocks, xz) => {
  if (!floorBlocks.has(xz)) {
    const [x, z] = xz.split(',').map(Number);
    // Find min Y in this column
    const minY = Math.min(...blocks.map(b => b.y));
    const mods = [...new Set(blocks.map(b => b.mod))];
    missingFloorUnderBuilding.push({ x, z, minY, mods, count: blocks.length });
  }
});

console.log(`\nBuilding columns with NO floor block at Y=64 underneath: ${missingFloorUnderBuilding.length}`);
if (missingFloorUnderBuilding.length > 0) {
  console.log('Sample missing floor columns:');
  console.log(missingFloorUnderBuilding.slice(0, 30));
  // Group by module
  const byMod = {};
  missingFloorUnderBuilding.forEach(m => {
    m.mods.forEach(modId => {
      byMod[modId] = (byMod[modId] || 0) + 1;
    });
  });
  console.log('Missing floor by module having blocks above:', byMod);
}
