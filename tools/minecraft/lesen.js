'use strict';
// Eigener Leser für Bedrock-Welten (Prüfung ohne Minecraft): Blöcke, Höhenkarte, Spielerdatensatz, level.dat.
const fs = require('node:fs');
const path = require('node:path');
const { readDb } = require('./leveldb.js');
const chunk = require('./bedrock_chunk.js');
const { readLevelDat } = require('./leveldat.js');

/**
 * Öffnet eine Welt. opts.punkte: [[x, y, z], ...] begrenzt die gelesenen Chunks (schneller und sparsamer);
 * ohne punkte werden alle Schlüssel gelesen.
 */
function openWorld(dir, opts = {}) {
  let filter;
  if (opts.punkte) {
    const want = new Set(opts.punkte.map(([x, , z]) => (x >> 4) + ',' + (z >> 4)));
    filter = (k) => {
      if (k.length !== 9 && k.length !== 10) return /^(~local_player|player_)/.test(k.toString('latin1'));
      return want.has(k.readInt32LE(0) + ',' + k.readInt32LE(4));
    };
  }
  const db = readDb(path.join(dir, 'db'), { filter, verify: opts.verify });
  const cache = new Map();
  const sub = (cx, cz, yi) => {
    const id = cx + ',' + cz + ',' + yi;
    if (cache.has(id)) return cache.get(id);
    const v = db.get(chunk.chunkKey(cx, cz, chunk.TAG.SUBCHUNK, yi));
    const sc = v ? chunk.decodeSubChunk(v) : null;
    cache.set(id, sc);
    return sc;
  };
  return {
    db,
    /** Blockname (z. B. "minecraft:stone") oder "minecraft:air" bei fehlendem Subchunk, null außerhalb -64..319. */
    blockAt(x, y, z) {
      if (y < -64 || y > 319) return null;
      const sc = sub(x >> 4, z >> 4, y >> 4);
      if (!sc) return 'minecraft:air';
      return chunk.blockNameAt(sc, x & 15, y & 15, z & 15);
    },
    /** Bedrock-Palette-Eintrag { name, states, version } */
    stateAt(x, y, z) {
      const sc = sub(x >> 4, z >> 4, y >> 4);
      if (!sc) return null;
      const L = sc.layers[0];
      return L.palette[L.idx[((x & 15) * 16 + (z & 15)) * 16 + (y & 15)]];
    },
    /** Höchster nicht-leerer Block der Säule (aus den Subchunks). */
    topAt(x, z) {
      for (let yi = 19; yi >= -4; yi--) {
        const sc = sub(x >> 4, z >> 4, yi);
        if (!sc) continue;
        for (let y = 15; y >= 0; y--) if (chunk.blockNameAt(sc, x & 15, y, z & 15) !== 'minecraft:air') return yi * 16 + y;
      }
      return null;
    },
    data3D(cx, cz) { const v = db.get(chunk.chunkKey(cx, cz, chunk.TAG.DATA3D)); return v ? chunk.decodeData3D(v) : null; },
    versionTag(cx, cz) { const v = db.get(chunk.chunkKey(cx, cz, chunk.TAG.VERSION)); return v ? v[0] : null; },
    finalized(cx, cz) { const v = db.get(chunk.chunkKey(cx, cz, chunk.TAG.FINALIZED)); return v ? v.readInt32LE(0) : null; },
    player(key = '~local_player') { return db.get(Buffer.from(key, 'latin1')); },
    levelDat() { return readLevelDat(fs.readFileSync(path.join(dir, 'level.dat'))); },
    levelName() { return fs.readFileSync(path.join(dir, 'levelname.txt'), 'utf8'); }
  };
}

module.exports = { openWorld };
