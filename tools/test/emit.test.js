'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { encodeRuns, decodeRuns } = require('../emit/data');

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const PAL = ['stone_bricks', 'smooth_quartz', 'gold_block'];
const IDX = new Map(PAL.map((t, i) => [t, i]));
const keyOf = (b) => `${b.x},${b.y},${b.z},${b.type}`;
const sortedKeys = (bl) => bl.map(keyOf).sort();

test('Round-Trip mit 10.000 zufälligen Blöcken (fester Seed)', () => {
  const rnd = mulberry32(12345);
  const seen = new Set();
  const blocks = [];
  while (blocks.length < 10000) {
    const x = Math.floor(rnd() * 40) - 20, y = Math.floor(rnd() * 10) + 64, z = Math.floor(rnd() * 60) - 30;
    const k = `${x},${y},${z}`;
    if (seen.has(k)) continue;
    seen.add(k);
    blocks.push({ x, y, z, type: PAL[Math.floor(rnd() * 3)] });
  }
  const enc = encodeRuns(blocks, IDX);
  assert.equal(enc.blocks, 10000);
  const dec = decodeRuns(enc.base64, PAL);
  assert.deepEqual(sortedKeys(dec), sortedKeys(blocks));
});

test('Läufe werden an Typwechseln und Lücken getrennt', () => {
  const b = [
    { x: 0, y: 0, z: 0, type: 'stone_bricks' }, { x: 0, y: 0, z: 1, type: 'stone_bricks' },
    { x: 0, y: 0, z: 2, type: 'smooth_quartz' },
    { x: 0, y: 0, z: 4, type: 'smooth_quartz' }, { x: 0, y: 0, z: 5, type: 'smooth_quartz' }
  ];
  const enc = encodeRuns(b, IDX);
  assert.equal(enc.runs, 3);
  const raw = Buffer.from(enc.base64, 'base64');
  const lens = [0, 1, 2].map((i) => raw.readInt16LE(i * 10 + 6));
  assert.deepEqual(lens, [2, 1, 2]);
});

test('Negative Koordinaten', () => {
  const b = [{ x: -300, y: 70, z: -150, type: 'gold_block' }, { x: -300, y: 70, z: -149, type: 'gold_block' }];
  const enc = encodeRuns(b, IDX);
  assert.equal(enc.runs, 1);
  assert.deepEqual(decodeRuns(enc.base64, PAL), b);
});

test('Summe der len gleich Blockanzahl', () => {
  const b = [];
  for (let z = -5; z < 5; z++) b.push({ x: 1, y: 2, z, type: z < 0 ? 'stone_bricks' : 'gold_block' });
  b.push({ x: 2, y: 2, z: 0, type: 'gold_block' });
  const enc = encodeRuns(b, IDX);
  const raw = Buffer.from(enc.base64, 'base64');
  let sum = 0;
  for (let i = 0; i < enc.runs; i++) sum += raw.readInt16LE(i * 10 + 6);
  assert.equal(sum, b.length);
});
