const fs = require('fs');

// Test complete math for M4 upper, M5, and M6
function inOctagon(x, z, R, w) {
  const ax = Math.abs(x);
  const az = Math.abs(z);
  if (ax > R || az > R) return false;
  if (ax + az > w + R) return false;
  return true;
}

// Generate Drum top (Y=160)
function getDrumTop() {
  const R = 42;
  const Rin = 36;
  const w = 25;
  const win = 21;
  const set = new Set();
  for (let x = -R; x <= R; x++) {
    for (let z = -R; z <= R; z++) {
      if (inOctagon(x, z, R, w) && !inOctagon(x, z, Rin, win)) {
        set.add(`${x},${z}`);
      }
    }
  }
  return set;
}

const drum160 = getDrumTop();
console.log('Drum 160 solid blocks:', drum160.size);

// Generate M5 layer
function getM5Layer(y) {
  const dy = y - 160;
  const Rout = Math.sqrt((42 + 116.64)**2 - dy**2) - 116.64;
  const Rin = Math.sqrt((36 + 132.77)**2 - dy**2) - 132.77;

  const rOutInt = Math.round(Rout);
  const rInInt = Math.round(Rin);
  const wOut = Math.round(Rout * (25 / 42));
  const wIn = Math.round(Rin * (21 / 36));

  const set = new Set();
  for (let x = -rOutInt; x <= rOutInt; x++) {
    for (let z = -rOutInt; z <= rOutInt; z++) {
      if (inOctagon(x, z, rOutInt, wOut) && !inOctagon(x, z, rInInt, wIn)) {
        set.add(`${x},${z}`);
      }
    }
  }
  return set;
}

const m5_161 = getM5Layer(161);
let overhang161 = 0;
for (const k of m5_161) {
  if (!drum160.has(k)) overhang161++;
}
console.log('M5 161 total:', m5_161.size, 'overhang on Drum 160:', overhang161);

// Generate M5 250 (Schlussring)
function getSchlussring() {
  const set = new Set();
  for (let r = 6; r <= 16; r++) {
    const w = Math.round(r * (25 / 42));
    for (let x = -r; x <= r; x++) {
      for (let z = -r; z <= r; z++) {
        if (inOctagon(x, z, r, w) && !inOctagon(x, z, 5, 3)) {
          set.add(`${x},${z}`);
        }
      }
    }
  }
  return set;
}

const ring250 = getSchlussring();
console.log('Schlussring 250 total blocks:', ring250.size);

// Check M6 base on Schlussring 250
function getM6Base() {
  const set = new Set();
  for (let r = 7; r <= 13; r++) {
    const w = Math.round(r * 0.4142);
    for (let x = -r; x <= r; x++) {
      for (let z = -r; z <= r; z++) {
        if (inOctagon(x, z, r, w) && !inOctagon(x, z, 6, 2)) {
          set.add(`${x},${z}`);
        }
      }
    }
  }
  // Volute bases
  const volutes = [
    { x: -7, z: -15 }, { x:  7, z: -15 },
    { x:  15, z: -7 }, { x:  15, z:  7 },
    { x:   7, z:  15 }, { x: -7, z:  15 },
    { x: -15, z:   7 }, { x: -15, z: -7 },
    { x: -6, z: -14 }, { x:  6, z: -14 },
    { x:  14, z: -6 }, { x:  14, z:  6 },
    { x:   6, z:  14 }, { x: -6, z:  14 },
    { x: -14, z:   7 }, { x: -14, z: -6 }
  ];
  volutes.forEach(v => set.add(`${v.x},${v.z}`));
  return set;
}

const m6_251 = getM6Base();
let overhang251 = 0;
for (const k of m6_251) {
  if (!ring250.has(k)) overhang251++;
}
console.log('M6 251 total:', m6_251.size, 'overhang on Schlussring 250:', overhang251);
