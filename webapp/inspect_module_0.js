const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'js', 'data', 'module_0_steps.js');
const code = fs.readFileSync(filePath, 'utf8');
const windowObj = {};
const fn = new Function('window', code);
fn(windowObj);
const steps = windowObj.MODULE_0_DATA;

console.log(`Modul 0 has ${steps.length} steps:`);
steps.forEach(s => {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  s.blocks.forEach(b => {
    minX = Math.min(minX, b.x); maxX = Math.max(maxX, b.x);
    minZ = Math.min(minZ, b.z); maxZ = Math.max(maxZ, b.z);
  });
  console.log(`Step ${s.stepNumber}: "${s.title}" (${s.blocks.length} blk) Bounds: X[${minX}, ${maxX}] Z[${minZ}, ${maxZ}]`);
});
