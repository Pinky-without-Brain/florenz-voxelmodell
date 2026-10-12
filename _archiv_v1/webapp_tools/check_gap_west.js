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

const xCounts = {};

moduleFiles.forEach(file => {
  const code = fs.readFileSync(path.join(dataDir, file), 'utf8');
  const windowObj = {};
  new Function('window', code)(windowObj);
  const steps = Object.values(windowObj)[0];
  steps.forEach(s => {
    s.blocks.forEach(b => {
      if (b.y > 64) {
        xCounts[b.x] = (xCounts[b.x] || 0) + 1;
      }
    });
  });
});

for (let x = -175; x <= -160; x++) {
  console.log(`X = ${x}: ${xCounts[x] || 0} blocks (Y > 64)`);
}
