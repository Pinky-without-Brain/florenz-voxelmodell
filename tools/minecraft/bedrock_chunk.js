'use strict';
// Bedrock-Chunkformat: Subchunk Version 9 (Tag 47), Data3D (Tag 43), Schlüssel.
const nbt = require('./nbt_le.js');

const TAG = { DATA3D: 43, VERSION: 44, SUBCHUNK: 47, FINALIZED: 54 };
const Y_MIN_INDEX = -4, Y_MAX_INDEX = 19; // y -64..319
const BITS_ERLAUBT = [1, 2, 3, 4, 5, 6, 8, 16];

/** Chunk-Schlüssel ohne Dimension: x, z (int32 LE), Tag [, y-Index int8]. */
function chunkKey(cx, cz, tag, yIndex) {
  const b = Buffer.alloc(yIndex === undefined ? 9 : 10);
  b.writeInt32LE(cx, 0); b.writeInt32LE(cz, 4); b[8] = tag;
  if (yIndex !== undefined) b.writeInt8(yIndex, 9);
  return b;
}

const wordsFor = (bits) => Math.ceil(4096 / Math.floor(32 / bits));

/** Gepackte Indizes (Länge 4096, Werte < 2^bits) -> Puffer ohne Wortüberlauf, Index 0 in den niedrigen Bits. */
function packIndices(idx, bits) {
  const per = Math.floor(32 / bits), n = wordsFor(bits);
  const out = Buffer.alloc(n * 4);
  for (let w = 0; w < n; w++) {
    let v = 0;
    const base = w * per;
    const lim = Math.min(per, 4096 - base);
    for (let j = 0; j < lim; j++) v += idx[base + j] * 2 ** (j * bits);
    out.writeUInt32LE(v >>> 0, w * 4);
  }
  return out;
}

function unpackIndices(buf, off, bits) {
  const per = Math.floor(32 / bits), n = wordsFor(bits), mod = 2 ** bits;
  const idx = new Uint16Array(4096);
  for (let w = 0; w < n; w++) {
    const v = buf.readUInt32LE(off + w * 4);
    const base = w * per;
    const lim = Math.min(per, 4096 - base);
    for (let j = 0; j < lim; j++) idx[base + j] = Math.floor(v / 2 ** (j * bits)) % mod;
  }
  return { idx, end: off + n * 4 };
}

function bitsFor(n) {
  const need = Math.max(1, Math.ceil(Math.log2(n)));
  const b = BITS_ERLAUBT.find((x) => x >= need);
  if (!b) throw new Error('Palette zu groß: ' + n);
  return b;
}

/**
 * Subchunk kodieren. blocks: 4096 globale Ids, Reihenfolge ((x*16)+z)*16+y. entryOf(id) -> Palette-Eintrag (Puffer).
 * Id 0 = Luft. Reine Luft -> null. Einheitliche Subchunks: 1 Bit, zwei Einträge (Block, Luft), alle Indizes 0.
 */
function encodeSubChunk(yIndex, blocks, entryOf) {
  const local = new Map(); const order = [];
  const idx = new Uint16Array(4096);
  for (let i = 0; i < 4096; i++) {
    const id = blocks[i];
    let l = local.get(id);
    if (l === undefined) { l = order.length; local.set(id, l); order.push(id); }
    idx[i] = l;
  }
  if (order.length === 1 && order[0] === 0) return null;
  if (order.length === 1) order.push(0);
  const bits = bitsFor(order.length);
  const head = Buffer.from([9, 1, yIndex & 255, bits << 1]);
  const cnt = Buffer.alloc(4); cnt.writeInt32LE(order.length);
  return Buffer.concat([head, packIndices(idx, bits), cnt, ...order.map(entryOf)]);
}

/** Subchunk lesen (Version 8 und 9; Layer mit 0 Bit = ein Eintrag ohne Zähler, wie in der echten Welt). */
function decodeSubChunk(buf) {
  const version = buf[0];
  if (version !== 8 && version !== 9) throw new Error('Subchunk-Version ' + version + ' nicht unterstützt');
  const nl = buf[1];
  let p = 2, yIndex = null;
  if (version === 9) { yIndex = buf.readInt8(2); p = 3; }
  const layers = [];
  for (let l = 0; l < nl; l++) {
    const hdr = buf[p++], bits = hdr >> 1;
    let idx, count;
    if (bits === 0) { idx = new Uint16Array(4096); count = 1; }
    else { const r = unpackIndices(buf, p, bits); idx = r.idx; p = r.end; count = buf.readInt32LE(p); p += 4; }
    const ents = nbt.readAll(buf, p, count);
    p = ents[ents.length - 1].end;
    layers.push({ bits, runtime: !!(hdr & 1), palette: ents.map((e) => nbt.toPlain(e.tag)), idx });
  }
  return { version, yIndex, layers, end: p };
}

/** Palettenname des Blocks (x, y, z lokal 0..15) in Layer 0. */
function blockNameAt(sc, x, y, z, layer = 0) {
  const L = sc.layers[layer];
  return L.palette[L.idx[(x * 16 + z) * 16 + y]].name;
}

/**
 * Data3D: Höhenkarte (256 × int16) und Biome je Abschnitt (24 Abschnitte, y -64..319).
 * Abschnitt 0: Kopf 3 (1 Bit, Runtime-Flag), 128 Nullwörter, Zähler 1, Biom-Id; weitere Abschnitte 0xFF (= wie vorher).
 * Aufbau an der Weltkopie geprüft.
 */
function encodeData3D(heights, biomeId, sections = 24) {
  const hm = Buffer.alloc(512);
  for (let i = 0; i < 256; i++) hm.writeInt16LE(heights[i], i * 2);
  const first = Buffer.alloc(1 + 512 + 4 + 4);
  first[0] = (1 << 1) | 1;
  first.writeInt32LE(1, 513); first.writeInt32LE(biomeId, 517);
  return Buffer.concat([hm, first, Buffer.alloc(sections - 1, 0xff)]);
}

/** Data3D lesen -> { heights: Int16Array(256), sections: [{ same } | { bits, idx, palette }] } */
function decodeData3D(buf) {
  const heights = new Int16Array(256);
  for (let i = 0; i < 256; i++) heights[i] = buf.readInt16LE(i * 2);
  const sections = [];
  let p = 512;
  while (p < buf.length) {
    const h = buf[p++];
    if (h === 0xff) { sections.push({ same: true }); continue; }
    const bits = h >> 1;
    let idx = new Uint16Array(4096);
    if (bits > 0) { const r = unpackIndices(buf, p, bits); idx = r.idx; p = r.end; }
    let n = 1;
    if (bits > 0) { n = buf.readInt32LE(p); p += 4; }
    const palette = [];
    for (let i = 0; i < n; i++) { palette.push(buf.readInt32LE(p)); p += 4; }
    sections.push({ bits, idx, palette });
  }
  return { heights, sections };
}

module.exports = { TAG, Y_MIN_INDEX, Y_MAX_INDEX, chunkKey, packIndices, unpackIndices, wordsFor, bitsFor, encodeSubChunk, decodeSubChunk, blockNameAt, encodeData3D, decodeData3D };
