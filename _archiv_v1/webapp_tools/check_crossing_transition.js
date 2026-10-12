const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'js', 'data');

function loadModule(file) {
  const code = fs.readFileSync(path.join(dataDir, file), 'utf8');
  const windowObj = {};
  new Function('window', code)(windowObj);
  return Object.values(windowObj)[0];
}

const mod3 = loadModule('module_3_steps.js');
const mod4 = loadModule('module_4_steps.js');

const m3Top = new Set();
mod3.forEach(s => {
  s.blocks.forEach(b => {
    if (b.y === 119) m3Top.add(`${b.x},${b.z}`);
  });
});

const m4Base = new Set();
mod4.forEach(s => {
  s.blocks.forEach(b => {
    if (b.y === 120) m4Base.add(`${b.x},${b.z}`);
  });
});

console.log(`Modul 3 top (Y=119) block count: ${m3Top.size}`);
console.log(`Modul 4 base (Y=120) block count: ${m4Base.size}`);

const m4FloatingAtBase = [];
m4Base.forEach(xz => {
  if (!m3Top.has(xz)) {
    m4FloatingAtBase.push(xz);
  }
});
console.log(`Modul 4 base blocks (Y=120) with NO Modul 3 block at Y=119 underneath: ${m4FloatingAtBase.length}`);
if (m4FloatingAtBase.length > 0) {
  console.log('Sample floating at Y=120:', m4FloatingAtBase.slice(0, 20));
}
