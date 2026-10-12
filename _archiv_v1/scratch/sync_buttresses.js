const fs = require('fs');

// Patch build_module_0_perfect.js to match buttressX exactly and add the 3 apse apex points
let code0 = fs.readFileSync('scratch/build_module_0_perfect.js', 'utf8');

// Replace buttress placement in Step 5
const oldS5 = `  for (let x = -168; x <= -45; x += 15) {
    for (let dx = -1; dx <= 1; dx++) {
      addBlock(s5, x + dx, 64, -43, "smooth_quartz");
      addBlock(s5, x + dx, 64, -44, "smooth_quartz");
      addBlock(s5, x + dx, 64,  43, "smooth_quartz");
      addBlock(s5, x + dx, 64,  44, "smooth_quartz");
    }
  }`;

const newS5 = `  const buttressX = [-167, -151, -135, -120, -105, -90, -75, -60, -45];
  buttressX.forEach(bx => {
    for (let dx = -1; dx <= 1; dx++) {
      addBlock(s5, bx + dx, 64, -43, "smooth_quartz");
      addBlock(s5, bx + dx, 64, -44, "smooth_quartz");
      addBlock(s5, bx + dx, 64,  43, "smooth_quartz");
      addBlock(s5, bx + dx, 64,  44, "smooth_quartz");
    }
  });`;

code0 = code0.replace(oldS5, newS5);

// Add the 3 apse apex points to Step 9, 10, 11
code0 = code0.replace(
  'for (let z = -10; z <= 10; z++) addBlock(s9, 162, 64, z, "stone_bricks");',
  'for (let z = -10; z <= 10; z++) addBlock(s9, 162, 64, z, "stone_bricks"); addBlock(s9, 163, 64, 0, "smooth_quartz");'
);
code0 = code0.replace(
  'for (let x = -10; x <= 10; x++) addBlock(s10, x, 64, -105, "stone_bricks");',
  'for (let x = -10; x <= 10; x++) addBlock(s10, x, 64, -105, "stone_bricks"); addBlock(s10, 0, 64, -106, "smooth_quartz");'
);
code0 = code0.replace(
  'for (let x = -10; x <= 10; x++) addBlock(s11, x, 64, 105, "stone_bricks");',
  'for (let x = -10; x <= 10; x++) addBlock(s11, x, 64, 105, "stone_bricks"); addBlock(s11, 0, 64, 106, "smooth_quartz");'
);

fs.writeFileSync('scratch/build_module_0_perfect.js', code0);
console.log('Successfully patched scratch/build_module_0_perfect.js');

// Now patch build_module_1_perfect.js so it uses buttressX in steps 8, 9, 10, 11, 12, 13, 14, 15
let code1 = fs.readFileSync('scratch/build_module_1_perfect.js', 'utf8');

// Replace any buttress loops in Module 1 with buttressX filters
code1 = code1.replace(
  /for \(let x = -167; x <= -107; x \+= 15\) \{/g,
  `[-167, -151, -135, -120].forEach(x => {`
);
code1 = code1.replace(
  /for \(let x = -106; x <= -45; x \+= 15\) \{/g,
  `[-105, -90, -75, -60, -45].forEach(x => {`
);
code1 = code1.replace(
  /for \(let x = -105; x <= -45; x \+= 15\) \{/g,
  `[-105, -90, -75, -60, -45].forEach(x => {`
);

fs.writeFileSync('scratch/build_module_1_perfect.js', code1);
console.log('Successfully patched scratch/build_module_1_perfect.js');
