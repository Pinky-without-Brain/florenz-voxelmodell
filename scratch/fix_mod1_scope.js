const fs = require('fs');

let code = fs.readFileSync('scratch/build_module_1_perfect.js', 'utf8');

// Declare lists at top once
code = code.replace(
  'const windowCentersX = [-151, -120, -90, -60];',
  'const windowCentersX = [-151, -120, -90, -60];\n  const bxListWest = [-167, -151, -135, -120];\n  const bxListEast = [-105, -90, -75, -60, -45];'
);

// Remove duplicate const declarations
code = code.replace(/const bxListWest = \[-167, -151, -135, -120\];\s*/g, '');
code = code.replace(/const bxListEast = \[-105, -90, -75, -60, -45\];\s*/g, '');

fs.writeFileSync('scratch/build_module_1_perfect.js', code);
console.log('Successfully updated scratch/build_module_1_perfect.js');
