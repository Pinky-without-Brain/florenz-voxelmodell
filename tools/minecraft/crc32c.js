'use strict';
// CRC-32C (Castagnoli, reflektiert 0x82F63B78) und die LevelDB-Maskierung.
const TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0x82f63b78 : c >>> 1;
  TABLE[i] = c >>> 0;
}

/** crc32c(buf[, startCrc]) -> uint32. Fortsetzbar: crc32c(b, crc32c(a)) == crc32c(a+b). */
function crc32c(buf, crc = 0) {
  let c = ~crc >>> 0;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return ~c >>> 0;
}

const MASK_DELTA = 0xa282ead8;
const mask = (crc) => ((((crc >>> 15) | (crc << 17)) >>> 0) + MASK_DELTA) >>> 0;
const unmask = (m) => { const r = (m - MASK_DELTA) >>> 0; return ((r >>> 17) | (r << 15)) >>> 0; };

module.exports = { crc32c, mask, unmask };
