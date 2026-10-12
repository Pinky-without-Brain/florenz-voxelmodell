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

const allBlocks = new Map();
const modSteps = [];

moduleFiles.forEach((file, modIdx) => {
  const filePath = path.join(dataDir, file);
  const code = fs.readFileSync(filePath, 'utf8');
  const windowObj = {};
  new Function('window', code)(windowObj);
  const steps = Object.values(windowObj)[0];
  modSteps.push(steps);
  steps.forEach((step, sIdx) => {
    step.blocks.forEach(b => {
      allBlocks.set(`${b.x},${b.y},${b.z}`, { mod: modIdx, step: sIdx + 1, type: b.type, x: b.x, y: b.y, z: b.z });
    });
  });
});

console.log('=== FLOATING / DISCONNECTED BLOCKS ANALYSIS ===');
// For each module, find blocks where:
// 1. No block directly underneath (y-1)
// 2. No block horizontally adjacent at y
// 3. No diagonal/stair support at (x±1, y-1, z) or (x, y-1, z±1)
for (let m = 0; m < 10; m++) {
  const isolated = [];
  const noDownSupport = [];
  modSteps[m].forEach((step, sIdx) => {
    step.blocks.forEach(b => {
      if (b.y > 64) {
        const under = `${b.x},${b.y-1},${b.z}`;
        const hasDirectUnder = allBlocks.has(under);
        const hasDiagUnder = allBlocks.has(`${b.x+1},${b.y-1},${b.z}`) ||
                             allBlocks.has(`${b.x-1},${b.y-1},${b.z}`) ||
                             allBlocks.has(`${b.x},${b.y-1},${b.z+1}`) ||
                             allBlocks.has(`${b.x},${b.y-1},${b.z-1}`);
        if (!hasDirectUnder && !hasDiagUnder) {
          noDownSupport.push({ step: sIdx + 1, ...b });
        }
      }
    });
  });
  console.log(`Modul ${m}: ${noDownSupport.length} blocks with NO direct or diagonal support underneath!`);
  if (noDownSupport.length > 0) {
    // group by step
    const byStep = {};
    noDownSupport.forEach(b => byStep[b.step] = (byStep[b.step] || 0) + 1);
    console.log(`   By step:`, byStep);
    console.log(`   Sample:`, noDownSupport.slice(0, 5).map(b => `Step ${b.step}: (${b.x},${b.y},${b.z}) ${b.type}`));
  }
}
