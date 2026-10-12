global.window = {};
require("../webapp/js/data/module_0_steps.js");
const m0Steps = global.window.MODULE_0_DATA;

global.window = {};
require("../webapp/js/data/module_7_steps.js");
const m7Steps = global.window.MODULE_7_DATA;

console.log("M7 steps:", m7Steps.length);
let totalBlocks = 0;
const blockSet = new Set();
const m0Set = new Set();

m0Steps.forEach(s => s.blocks.forEach(b => m0Set.add(`${b.x},${b.y},${b.z}`)));

let crossCollisions = 0;
let selfCollisions = 0;

m7Steps.forEach((s, idx) => {
  totalBlocks += s.blocks.length;
  s.blocks.forEach(b => {
    const k = `${b.x},${b.y},${b.z}`;
    if (m0Set.has(k)) crossCollisions++;
    if (blockSet.has(k)) selfCollisions++;
    blockSet.add(k);
  });
});

console.log("Total blocks in M7:", totalBlocks);
console.log("Self collisions:", selfCollisions);
console.log("Cross collisions with M0:", crossCollisions);

// Check ground reachability (supported from Y=64)
const supported = new Set();
for (let x = -200; x <= -100; x++) {
  for (let z = 0; z <= 100; z++) {
    if (m0Set.has(`${x},64,${z}`)) supported.add(`${x},64,${z}`);
  }
}

// Support propagation
let added = true;
while (added) {
  added = false;
  for (const k of blockSet) {
    if (supported.has(k)) continue;
    const [x, y, z] = k.split(",").map(Number);
    if (supported.has(`${x},${y-1},${z}`) ||
        supported.has(`${x+1},${y},${z}`) ||
        supported.has(`${x-1},${y},${z}`) ||
        supported.has(`${x},${y},${z+1}`) ||
        supported.has(`${x},${y},${z-1}`) ||
        supported.has(`${x},${y+1},${z}`)) {
      supported.add(k);
      added = true;
    }
  }
}

let unsupported = 0;
for (const k of blockSet) {
  if (!supported.has(k)) {
    unsupported++;
    if (unsupported <= 10) console.log("Unsupported block in M7:", k);
  }
}
console.log("Unsupported blocks in M7:", unsupported);
