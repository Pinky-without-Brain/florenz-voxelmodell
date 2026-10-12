const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'data', 'module_0_steps.js');
const code = fs.readFileSync(filePath, 'utf8');
const windowObj = {};
const fn = new Function('window', code);
fn(windowObj);
const steps = windowObj.MODULE_0_DATA;

const floorMap = new Set();
steps.forEach(s => {
  s.blocks.forEach(b => {
    floorMap.add(`${b.x},${b.z}`);
  });
});

console.log('Testing Nave floor for X in [-165, -45], Z in [-42, 42]:');
let naveMissing = [];
for (let x = -165; x <= -45; x++) {
  for (let z = -42; z <= 42; z++) {
    if (!floorMap.has(`${x},${z}`)) {
      naveMissing.push({ x, z });
    }
  }
}
console.log(`Nave missing floor blocks: ${naveMissing.length}`);
if (naveMissing.length > 0) {
  console.log('Sample nave missing:', naveMissing.slice(0, 20));
  // Group by X
  const byX = {};
  naveMissing.forEach(m => byX[m.x] = (byX[m.x] || 0) + 1);
  console.log('Nave missing by X:', byX);
  // Group by Z
  const byZ = {};
  naveMissing.forEach(m => byZ[m.z] = (byZ[m.z] || 0) + 1);
  console.log('Nave missing by Z:', byZ);
}
