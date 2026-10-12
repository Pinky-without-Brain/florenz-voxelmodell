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

const modulesData = [];
const allBlocksMap = new Map();
const collisions = [];

moduleFiles.forEach((file, modIdx) => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Missing file: ${file}`);
    return;
  }
  const code = fs.readFileSync(filePath, 'utf8');
  const windowObj = {};
  const fn = new Function('window', code);
  fn(windowObj);
  const dataKey = Object.keys(windowObj)[0];
  const steps = windowObj[dataKey];
  
  let totalBlocks = 0;
  const modBlocksMap = new Map();
  let internalDups = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  steps.forEach((step, sIdx) => {
    totalBlocks += step.blocks.length;
    step.blocks.forEach(b => {
      minX = Math.min(minX, b.x); maxX = Math.max(maxX, b.x);
      minY = Math.min(minY, b.y); maxY = Math.max(maxY, b.y);
      minZ = Math.min(minZ, b.z); maxZ = Math.max(maxZ, b.z);

      const k = `${b.x},${b.y},${b.z}`;
      if (modBlocksMap.has(k)) {
        internalDups++;
      } else {
        modBlocksMap.set(k, true);
      }

      if (allBlocksMap.has(k)) {
        const prev = allBlocksMap.get(k);
        collisions.push({ coord: k, modA: prev.mod, stepA: prev.step, modB: modIdx, stepB: sIdx + 1, typeA: prev.type, typeB: b.type });
      } else {
        allBlocksMap.set(k, { mod: modIdx, step: sIdx + 1, type: b.type });
      }
    });
  });

  modulesData.push({
    modIdx,
    file,
    stepsCount: steps.length,
    totalBlocks,
    internalDups,
    bounds: { minX, maxX, minY, maxY, minZ, maxZ },
    steps: steps.map(s => ({ stepNumber: s.stepNumber, title: s.title, count: s.blocks.length }))
  });
});

console.log('=== MODULE SUMMARY ===');
modulesData.forEach(m => {
  console.log(`Modul ${m.modIdx} (${m.file}): Steps=${m.stepsCount}, TotalBlocks=${m.totalBlocks}, InternalDups=${m.internalDups}`);
  console.log(`  Bounds: X[${m.bounds.minX}, ${m.bounds.maxX}], Y[${m.bounds.minY}, ${m.bounds.maxY}], Z[${m.bounds.minZ}, ${m.bounds.maxZ}]`);
  const overSteps = m.steps.filter(s => s.count > 3400);
  if (overSteps.length > 0) {
    console.log(`  WARNING: ${overSteps.length} steps > 3400 blocks!`, overSteps);
  }
});

console.log(`\nTotal Cross-Module Collisions: ${collisions.length}`);
if (collisions.length > 0) {
  console.log('Sample collisions (first 10):', collisions.slice(0, 10));
}
