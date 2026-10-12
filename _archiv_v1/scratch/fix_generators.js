const fs = require('fs');

// 1. Fix build_module_0_perfect.js:
let code0 = fs.readFileSync('scratch/build_module_0_perfect.js', 'utf8');

// In Step 5, ensure Z=-43 and Z=43 are solid along the whole length
const oldS5 = `  for (let x = -168; x <= -45; x++) {
    addBlock(s5, x, 64, -41, "stone_bricks");
    addBlock(s5, x, 64, -42, "stone_bricks");
    addBlock(s5, x, 64,  41, "stone_bricks");
    addBlock(s5, x, 64,  42, "stone_bricks");
  }`;

const newS5 = `  for (let x = -168; x <= -45; x++) {
    addBlock(s5, x, 64, -41, "stone_bricks");
    addBlock(s5, x, 64, -42, "stone_bricks");
    addBlock(s5, x, 64, -43, "stone_bricks");
    addBlock(s5, x, 64,  41, "stone_bricks");
    addBlock(s5, x, 64,  42, "stone_bricks");
    addBlock(s5, x, 64,  43, "stone_bricks");
  }`;

code0 = code0.replace(oldS5, newS5);
fs.writeFileSync('scratch/build_module_0_perfect.js', code0);
console.log('Successfully updated build_module_0_perfect.js');

// 2. Fix build_module_1_perfect.js:
// Let's rewrite the buttress loops cleanly in build_module_1_perfect.js
let code1 = fs.readFileSync('scratch/build_module_1_perfect.js', 'utf8');

code1 = code1.replace(
  /\[-167, -151, -135, -120\]\.forEach\(x => \{/g,
  `const bxListWest = [-167, -151, -135, -120]; for (const x of bxListWest) {`
);
code1 = code1.replace(
  /\[-105, -90, -75, -60, -45\]\.forEach\(x => \{/g,
  `const bxListEast = [-105, -90, -75, -60, -45]; for (const x of bxListEast) {`
);

fs.writeFileSync('scratch/build_module_1_perfect.js', code1);
console.log('Successfully updated build_module_1_perfect.js');
