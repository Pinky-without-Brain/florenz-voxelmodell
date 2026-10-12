global.window = {};
require('../webapp/js/data/module_4_steps.js');
const m4Steps = global.window.MODULE_4_DATA;

global.window = {};
require('../webapp/js/data/module_5_steps.js');
const m5Steps = global.window.MODULE_5_DATA;

global.window = {};
require('../webapp/js/data/module_6_steps.js');
const m6Steps = global.window.MODULE_6_DATA;

console.log("M5 steps:", m5Steps.length);
console.log("M6 steps:", m6Steps.length);

const m4Top = new Set();
m4Steps.forEach(s => s.blocks.forEach(b => { if (b.y === 160) m4Top.add(`${b.x},${b.z}`); }));

const m5Set = new Set();
let m5OverhangM4 = 0;
m5Steps.forEach(s => s.blocks.forEach(b => {
  if (b.y === 161 && !m4Top.has(`${b.x},${b.z}`)) {
    m5OverhangM4++;
  }
  m5Set.add(`${b.x},${b.y},${b.z}`);
}));
console.log("M5 base overhang on M4 Y=160:", m5OverhangM4);

const m5Top = new Set();
m5Steps.forEach(s => s.blocks.forEach(b => { if (b.y === 250) m5Top.add(`${b.x},${b.z}`); }));

const m6Set = new Set();
let m6OverhangM5 = 0;
m6Steps.forEach(s => s.blocks.forEach(b => {
  if (b.y === 251 && !m5Top.has(`${b.x},${b.z}`)) {
    m6OverhangM5++;
  }
  m6Set.add(`${b.x},${b.y},${b.z}`);
}));
console.log("M6 base overhang on M5 Y=250:", m6OverhangM5);

// Check internal connectivity of M5 from M4 top
const supportedM5 = new Set();
m4Top.forEach(xz => supportedM5.add(`${xz.split(',')[0]},160,${xz.split(',')[1]}`));

let added = true;
while (added) {
  added = false;
  for (const k of m5Set) {
    if (supportedM5.has(k)) continue;
    const [x, y, z] = k.split(',').map(Number);
    if (supportedM5.has(`${x},${y-1},${z}`) ||
        supportedM5.has(`${x+1},${y},${z}`) ||
        supportedM5.has(`${x-1},${y},${z}`) ||
        supportedM5.has(`${x},${y},${z+1}`) ||
        supportedM5.has(`${x},${y},${z-1}`) ||
        supportedM5.has(`${x},${y+1},${z}`)) {
      supportedM5.add(k);
      added = true;
    }
  }
}

let m5Unsupp = 0;
for (const k of m5Set) {
  if (!supportedM5.has(k)) {
    m5Unsupp++;
    if (m5Unsupp <= 5) console.log("M5 unsupp:", k);
  }
}
console.log("Total unsupported in M5:", m5Unsupp);

// Check internal connectivity of M6 from supportedM5 top (Y=250)
const supportedM6 = new Set();
for (const k of supportedM5) {
  const [x, y, z] = k.split(',').map(Number);
  if (y === 250) supportedM6.add(k);
}

added = true;
while (added) {
  added = false;
  for (const k of m6Set) {
    if (supportedM6.has(k)) continue;
    const [x, y, z] = k.split(',').map(Number);
    if (supportedM6.has(`${x},${y-1},${z}`) ||
        supportedM6.has(`${x+1},${y},${z}`) ||
        supportedM6.has(`${x-1},${y},${z}`) ||
        supportedM6.has(`${x},${y},${z+1}`) ||
        supportedM6.has(`${x},${y},${z-1}`) ||
        supportedM6.has(`${x},${y+1},${z}`)) {
      supportedM6.add(k);
      added = true;
    }
  }
}

let m6Unsupp = 0;
for (const k of m6Set) {
  if (!supportedM6.has(k)) {
    m6Unsupp++;
    if (m6Unsupp <= 5) console.log("M6 unsupp:", k);
  }
}
console.log("Total unsupported in M6:", m6Unsupp);
