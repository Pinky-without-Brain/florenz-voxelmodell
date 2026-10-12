'use strict';
// Diagnose: ASCII-Schnitte und Draufsichten der Doppelkuppel nach build/diag/
const fs = require('node:fs');
const path = require('node:path');
const dome = require('../geom/dome.js');
const dims = require('../spec/dimensions.js');

const L = dome.doubleDomeLayout(dims);
const key = (x, y, z) => x + ',' + y + ',' + z;
const sets = { inner: new Set(), outer: new Set() };
for (const name of ['inner', 'outer']) {
  for (const c of dome.shell({ springY: L.springY, ...L[name], rhoMin: L.eye.rhoMin })) sets[name].add(key(c.x, c.y, c.z));
}
const cell = (x, y, z) => (sets.inner.has(key(x, y, z)) ? '#' : sets.outer.has(key(x, y, z)) ? 'o' : (x === 0 && z === 0) ? '|' : '.');

function section(fn) {
  const lines = [];
  for (let y = L.eye.ringTopY + 2; y >= L.springY - 2; y--) {
    let s = String(y).padStart(4) + ' ';
    for (let x = -60; x <= 60; x++) s += (x === 0 && cell(...fn(x, y)) === '.') ? '|' : cell(...fn(x, y));
    lines.push(s);
  }
  return lines.join('\n') + '\n';
}

function rings() {
  const out = [];
  for (const y of [L.springY + 1, L.springY + 20, L.springY + 40, L.springY + 60, L.inner.yTop]) {
    out.push(`Lage Y ${y}`);
    for (let z = -60; z <= 60; z += 2) {
      let s = '';
      for (let x = -60; x <= 60; x += 2) s += cell(x, y, z);
      out.push(s);
    }
    out.push('');
  }
  return out.join('\n');
}

const dir = path.join(__dirname, '..', '..', 'build', 'diag');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'dome_section_x.txt'), section((x, y) => [x, y, 0]));
fs.writeFileSync(path.join(dir, 'dome_section_diag.txt'), section((x, y) => [x, y, x]));
fs.writeFileSync(path.join(dir, 'dome_rings.txt'), rings());
console.log(`Blöcke Innenschale: ${sets.inner.size}, Außenschale: ${sets.outer.size}`);
console.log(L.notes.join('\n'));
