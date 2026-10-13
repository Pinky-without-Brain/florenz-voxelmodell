'use strict';
// LevelDB (Mojang-Variante) ohne Fremdbibliothek: Reader und Writer.
// Tabellen: table_format.md; Log/MANIFEST: log_format.md; Blocktypen 0 roh, 2 zlib, 4 zlib-raw.

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { crc32c, mask, unmask } = require('./crc32c.js');

// Magic 0xdb4775248b80fb57 (Little Endian: 57 fb 80 8b 24 75 47 db)
const MAGIC_LO = 0x8b80fb57, MAGIC_HI = 0xdb477524;
const COMPARATOR = 'leveldb.BytewiseComparator';
const LOG_BLOCK = 32768;

// ---- Varint ----
function putVarint(arr, v) {
  v = BigInt(v);
  while (v >= 128n) { arr.push(Number(v & 127n) | 128); v >>= 7n; }
  arr.push(Number(v));
}
function getVarintNum(buf, o) {
  let r = 0, mul = 1;
  for (;;) {
    const b = buf[o++];
    r += (b & 127) * mul;
    if (b < 128) break;
    mul *= 128;
  }
  return [r, o];
}

// ---- Reader ----
function decodeBlockEntries(block) {
  const n = block.readUInt32LE(block.length - 4);
  const end = block.length - 4 - 4 * n;
  const out = [];
  let o = 0, key = Buffer.alloc(0);
  while (o < end) {
    let shared, nonShared, vlen;
    [shared, o] = getVarintNum(block, o);
    [nonShared, o] = getVarintNum(block, o);
    [vlen, o] = getVarintNum(block, o);
    key = Buffer.concat([key.subarray(0, shared), block.subarray(o, o + nonShared)]);
    o += nonShared;
    out.push([key, block.subarray(o, o + vlen)]);
    o += vlen;
  }
  return out;
}

function readBlock(file, off, size, verify, types) {
  const raw = file.subarray(off, off + size + 5);
  const type = raw[size];
  if (types) types.add(type);
  if (verify) {
    const want = unmask(raw.readUInt32LE(size + 1));
    if (crc32c(raw.subarray(0, size + 1)) !== want) throw new Error(`LevelDB: Blockprüfsumme falsch bei ${off}`);
  }
  const body = raw.subarray(0, size);
  if (type === 0) return body;
  if (type === 2) return zlib.inflateSync(body);
  if (type === 4) return zlib.inflateRawSync(body);
  throw new Error(`LevelDB: Blocktyp ${type} nicht unterstützt`);
}

/** Alle Einträge einer Tabelle: [{ key (user key), seq (BigInt), type, value }] */
function readTable(f, opts = {}) {
  const foot = f.subarray(f.length - 48);
  if (foot.readUInt32LE(40) !== MAGIC_LO || foot.readUInt32LE(44) !== MAGIC_HI) throw new Error('LevelDB: falsche Tabellen-Magie');
  let o = 0, mOff, mSize, iOff, iSize;
  [mOff, o] = getVarintNum(foot, o); [mSize, o] = getVarintNum(foot, o);
  [iOff, o] = getVarintNum(foot, o); [iSize, o] = getVarintNum(foot, o);
  const index = decodeBlockEntries(readBlock(f, iOff, iSize, opts.verify, opts.types));
  const out = [];
  for (const [, h] of index) {
    let p = 0, off, size;
    [off, p] = getVarintNum(h, p); [size, p] = getVarintNum(h, p);
    for (const [ik, v] of decodeBlockEntries(readBlock(f, off, size, opts.verify, opts.types))) {
      const tr = ik.readBigUInt64LE(ik.length - 8);
      out.push({ key: ik.subarray(0, ik.length - 8), seq: tr >> 8n, type: Number(tr & 255n), value: v });
    }
  }
  return out;
}

/** Records einer Logdatei (Block-Fragmente zusammengesetzt). */
function readLogRecords(buf) {
  const recs = [];
  let frag = [];
  let o = 0;
  while (o + 7 <= buf.length) {
    const rem = LOG_BLOCK - (o % LOG_BLOCK);
    if (rem < 7) { o += rem; continue; }
    const len = buf.readUInt16LE(o + 4), type = buf[o + 6];
    if (type === 0 && len === 0) { o += rem; continue; }
    if (o + 7 + len > buf.length) break; // abgeschnittener Rest
    const data = buf.subarray(o + 7, o + 7 + len);
    o += 7 + len;
    if (type === 1) recs.push(data);
    else if (type === 2) frag = [data];
    else if (type === 3) frag.push(data);
    else if (type === 4) { frag.push(data); recs.push(Buffer.concat(frag)); frag = []; }
  }
  return recs;
}

function parseVersionEdit(rec) {
  const e = { newFiles: [], deleted: [] };
  let o = 0;
  while (o < rec.length) {
    let tag; [tag, o] = getVarintNum(rec, o);
    const str = () => { let n; [n, o] = getVarintNum(rec, o); const s = rec.subarray(o, o + n); o += n; return s; };
    const num = () => { let v; [v, o] = getVarintNum(rec, o); return v; };
    if (tag === 1) e.comparator = str().toString();
    else if (tag === 2) e.logNumber = num();
    else if (tag === 3) e.nextFile = num();
    else if (tag === 4) e.lastSeq = num();
    else if (tag === 5) { num(); str(); }
    else if (tag === 6) { const level = num(); e.deleted.push([level, num()]); }
    else if (tag === 7) {
      const level = num(), number = num(), size = num();
      const smallest = Buffer.from(str()); const largest = Buffer.from(str());
      e.newFiles.push({ level, number, size, smallest, largest });
    } else if (tag === 9) e.prevLog = num();
    else throw new Error('LevelDB: unbekannter VersionEdit-Tag ' + tag);
  }
  return e;
}

function applyBatch(rec, put) {
  let seq = rec.readBigUInt64LE(0);
  const count = rec.readUInt32LE(8);
  let o = 12;
  for (let i = 0; i < count; i++) {
    const type = rec[o++];
    let n; [n, o] = getVarintNum(rec, o);
    const key = rec.subarray(o, o + n); o += n;
    let value = null;
    if (type === 1) { [n, o] = getVarintNum(rec, o); value = rec.subarray(o, o + n); o += n; }
    put(key, seq++, type, value);
  }
}

/**
 * Liest eine Datenbank. opts.filter(userKeyBuffer) -> bool begrenzt, was behalten wird.
 * -> { map: Map<latin1-Schlüssel, {key, value}> (neuester Wert, Löschungen entfernt), info, get(key) }
 */
function readDb(dir, opts = {}) {
  const filter = opts.filter || (() => true);
  const best = new Map();
  const put = (key, seq, type, value) => {
    if (!filter(key)) return;
    const k = key.toString('latin1');
    const old = best.get(k);
    if (!old || seq >= old.seq) best.set(k, { seq, type, key: Buffer.from(key), value: value && Buffer.from(value) });
  };
  const info = { tables: 0, logs: 0, blockTypes: new Set(), levels: [], manifest: null, lastSeq: null, logNumber: null, nextFile: null };
  const names = fs.readdirSync(dir);
  let tableNums = null, logNumber = 0;
  const curFile = path.join(dir, 'CURRENT');
  if (fs.existsSync(curFile)) {
    const txt = fs.readFileSync(curFile).toString('latin1');
    const m = /^(MANIFEST-\d+)\n?/.exec(txt);
    if (m && fs.existsSync(path.join(dir, m[1]))) {
      info.manifest = m[1];
      const live = new Map();
      for (const rec of readLogRecords(fs.readFileSync(path.join(dir, m[1])))) {
        const e = parseVersionEdit(rec);
        if (e.logNumber !== undefined) logNumber = info.logNumber = e.logNumber;
        if (e.lastSeq !== undefined) info.lastSeq = e.lastSeq;
        if (e.nextFile !== undefined) info.nextFile = e.nextFile;
        for (const [, n] of e.deleted) live.delete(n);
        for (const f of e.newFiles) live.set(f.number, f);
      }
      tableNums = [...live.keys()];
      info.levels = [...live.values()].map((f) => f.level);
    }
  }
  if (!tableNums) tableNums = names.filter((n) => /^\d+\.ldb$/.test(n)).map((n) => parseInt(n, 10));
  for (const n of tableNums.sort((a, b) => a - b)) {
    const buf = fs.readFileSync(path.join(dir, String(n).padStart(6, '0') + '.ldb'));
    for (const e of readTable(buf, { verify: opts.verify, types: info.blockTypes })) put(e.key, e.seq, e.type, e.value);
    info.tables++;
  }
  const logs = names.filter((n) => /^\d+\.log$/.test(n)).map((n) => parseInt(n, 10)).filter((n) => n >= logNumber).sort((a, b) => a - b);
  for (const n of logs) {
    const buf = fs.readFileSync(path.join(dir, String(n).padStart(6, '0') + '.log'));
    for (const rec of readLogRecords(buf)) if (rec.length >= 12) applyBatch(rec, put);
    info.logs++;
  }
  const map = new Map();
  for (const [k, v] of best) if (v.type === 1) map.set(k, { key: v.key, value: v.value });
  return { map, info, get: (key) => { const r = map.get(Buffer.from(key).toString('latin1')); return r ? r.value : undefined; } };
}

// ---- Writer ----
class BlockBuilder {
  constructor(restartInterval) {
    this.ri = restartInterval; this.parts = []; this.restarts = [0]; this.counter = 0; this.lastKey = Buffer.alloc(0); this.size = 0;
  }
  add(key, value) {
    let shared = 0;
    if (this.counter < this.ri) {
      const m = Math.min(this.lastKey.length, key.length);
      while (shared < m && this.lastKey[shared] === key[shared]) shared++;
    } else { this.restarts.push(this.size); this.counter = 0; }
    const h = []; putVarint(h, shared); putVarint(h, key.length - shared); putVarint(h, value.length);
    const hb = Buffer.from(h);
    this.parts.push(hb, key.subarray(shared), value);
    this.size += hb.length + key.length - shared + value.length;
    this.lastKey = key; this.counter++;
  }
  get empty() { return this.parts.length === 0; }
  estimate() { return this.size + 4 * this.restarts.length + 4; }
  finish() {
    const tail = Buffer.alloc(4 * this.restarts.length + 4);
    this.restarts.forEach((r, i) => tail.writeUInt32LE(r, 4 * i));
    tail.writeUInt32LE(this.restarts.length, 4 * this.restarts.length);
    return Buffer.concat([...this.parts, tail]);
  }
}

function internalKey(userKey, seq) {
  const t = Buffer.alloc(8);
  t.writeBigUInt64LE((BigInt(seq) << 8n) | 1n);
  return Buffer.concat([userKey, t]);
}

/** Schreibt eine Tabelle; add() mit aufsteigenden internen Schlüsseln. */
class TableBuilder {
  constructor(fd, opts = {}) {
    this.fd = fd; this.pos = 0;
    this.blockSize = opts.blockSize || 16384;
    this.compress = opts.compress === undefined ? 4 : opts.compress;
    this.data = new BlockBuilder(16);
    this.index = new BlockBuilder(1);
    this.lastKey = null; this.firstKey = null; this.entries = 0;
  }
  _writeRaw(contents) {
    let type = 0, body = contents;
    if (this.compress) {
      const z = this.compress === 4 ? zlib.deflateRawSync(contents, { level: 6 }) : zlib.deflateSync(contents, { level: 6 });
      if (z.length < contents.length - (contents.length >> 3)) { body = z; type = this.compress; }
    }
    const trailer = Buffer.alloc(5);
    trailer[0] = type;
    trailer.writeUInt32LE(mask(crc32c(trailer.subarray(0, 1), crc32c(body))), 1);
    fs.writeSync(this.fd, body); fs.writeSync(this.fd, trailer);
    const h = { offset: this.pos, size: body.length };
    this.pos += body.length + 5;
    return h;
  }
  _flush() {
    if (this.data.empty) return;
    const h = this._writeRaw(this.data.finish());
    const hb = []; putVarint(hb, h.offset); putVarint(hb, h.size);
    this.index.add(this.lastKey, Buffer.from(hb));
    this.data = new BlockBuilder(16);
  }
  add(ikey, value) {
    if (!this.firstKey) this.firstKey = ikey;
    this.data.add(ikey, value);
    this.lastKey = ikey; this.entries++;
    if (this.data.estimate() >= this.blockSize) this._flush();
  }
  get approxSize() { return this.pos + this.data.estimate(); }
  finish() {
    this._flush();
    const meta = this._writeRaw(new BlockBuilder(16).finish());
    const idx = this._writeRaw(this.index.finish());
    const foot = Buffer.alloc(48);
    const hb = []; putVarint(hb, meta.offset); putVarint(hb, meta.size); putVarint(hb, idx.offset); putVarint(hb, idx.size);
    Buffer.from(hb).copy(foot, 0);
    foot.writeUInt32LE(MAGIC_LO, 40); foot.writeUInt32LE(MAGIC_HI, 44);
    fs.writeSync(this.fd, foot); this.pos += 48;
    return { size: this.pos, smallest: this.firstKey, largest: this.lastKey };
  }
}

/** Logdatei-Inhalt für eine Liste von Records (mit Fragmentierung über 32-KB-Blöcke). */
function logRecords(records) {
  const out = []; let off = 0;
  const emit = (type, data) => {
    const h = Buffer.alloc(7);
    h.writeUInt16LE(data.length, 4); h[6] = type;
    h.writeUInt32LE(mask(crc32c(data, crc32c(h.subarray(6, 7)))), 0);
    out.push(h, data); off += 7 + data.length;
  };
  for (const rec of records) {
    let p = 0, first = true;
    do {
      let room = LOG_BLOCK - (off % LOG_BLOCK);
      if (room < 7) { out.push(Buffer.alloc(room)); off += room; room = LOG_BLOCK; }
      const frag = Math.min(rec.length - p, room - 7);
      const last = p + frag === rec.length;
      emit(first && last ? 1 : first ? 2 : last ? 4 : 3, rec.subarray(p, p + frag));
      p += frag; first = false;
    } while (p < rec.length);
  }
  return Buffer.concat(out);
}

function versionEditBuffer(e) {
  const a = [];
  const str = (b) => { putVarint(a, b.length); for (const x of b) a.push(x); };
  putVarint(a, 1); str(Buffer.from(COMPARATOR));
  putVarint(a, 2); putVarint(a, e.logNumber);
  putVarint(a, 3); putVarint(a, e.nextFile);
  putVarint(a, 4); putVarint(a, e.lastSeq);
  for (const f of e.files) {
    putVarint(a, 7); putVarint(a, f.level); putVarint(a, f.number); putVarint(a, f.size);
    str(f.smallest); str(f.largest);
  }
  return Buffer.from(a);
}

/**
 * DbWriter(dir, { level, blockSize, tableSize, compress }): add(userKey, value) mit streng aufsteigenden
 * Schlüsseln; close() schreibt MANIFEST-000002, CURRENT und LOCK.
 * Alle Tabellen liegen auf einem Level >= 1 mit disjunkten Bereichen (Vorgabe 3: Obergrenze 1 GB ohne
 * Verdichtungsdruck; Level 0 würde ab 4 Dateien Verdichtungen auslösen).
 */
class DbWriter {
  constructor(dir, opts = {}) {
    this.dir = dir; fs.mkdirSync(dir, { recursive: true });
    this.opts = opts; this.level = opts.level === undefined ? 3 : opts.level;
    this.tableSize = opts.tableSize || 4 * 1024 * 1024;
    this.fileNo = 4; this.seq = 0; this.files = []; this.cur = null; this.lastKey = null; this.count = 0;
  }
  _open() {
    const number = this.fileNo++;
    const fd = fs.openSync(path.join(this.dir, String(number).padStart(6, '0') + '.ldb'), 'w');
    this.cur = { number, fd, tb: new TableBuilder(fd, this.opts) };
  }
  _close() {
    if (!this.cur) return;
    const r = this.cur.tb.finish();
    fs.closeSync(this.cur.fd);
    this.files.push({ level: this.level, number: this.cur.number, size: r.size, smallest: r.smallest, largest: r.largest });
    this.cur = null;
  }
  add(key, value) {
    if (this.lastKey && Buffer.compare(this.lastKey, key) >= 0) throw new Error('LevelDB-Writer: Schlüssel nicht aufsteigend');
    this.lastKey = Buffer.from(key);
    if (!this.cur) this._open();
    this.cur.tb.add(internalKey(key, ++this.seq), value);
    this.count++;
    if (this.cur.tb.approxSize >= this.tableSize) this._close();
  }
  close() {
    this._close();
    const edit = versionEditBuffer({ logNumber: 3, nextFile: this.fileNo + 1, lastSeq: this.seq, files: this.files });
    fs.writeFileSync(path.join(this.dir, 'MANIFEST-000002'), logRecords([edit]));
    fs.writeFileSync(path.join(this.dir, 'CURRENT'), 'MANIFEST-000002\n');
    fs.writeFileSync(path.join(this.dir, 'LOCK'), '');
    return { tables: this.files.length, entries: this.count, bytes: this.files.reduce((s, f) => s + f.size, 0) };
  }
}

module.exports = { readDb, readTable, readLogRecords, DbWriter, TableBuilder, logRecords, parseVersionEdit, internalKey };
