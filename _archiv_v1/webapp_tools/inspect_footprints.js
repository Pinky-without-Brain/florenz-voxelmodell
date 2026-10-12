const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'js', 'data');

['module_3_steps.js', 'module_4_steps.js', 'module_5_steps.js'].forEach(file => {
  const code = fs.readFileSync(path.join(dataDir, file), 'utf8');
  const windowObj = {};
  new Function('window', code)(windowObj);
  const steps = Object.values(windowObj)[0];
  console.log(`\n=== ${file} ===`);
  const xzPoints = new Set();
  steps.forEach(s => {
    s.blocks.forEach(b => {
      xzPoints.add(`${b.x},${b.z}`);
    });
  });
  console.log(`Unique (x,z) footprint points: ${xzPoints.size}`);
  let minX=Infinity, maxX=-Infinity, minZ=Infinity, maxZ=-Infinity;
  xzPoints.forEach(p => {
    const [x, z] = p.split(',').map(Number);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z);
  });
  console.log(`Footprint bounds: X[${minX}, ${maxX}], Z[${minZ}, ${maxZ}]`);
});
