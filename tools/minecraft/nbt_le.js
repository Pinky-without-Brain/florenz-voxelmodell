'use strict';
// Little-Endian-NBT (Bedrock). Ein Tag ist { t: Typ, v: Wert }.
//  Compound: v = Map(Name -> Tag), Reihenfolge bleibt erhalten.  List: v = { et: Elementtyp, items: [Rohwerte] }.
//  Long: BigInt.  ByteArray: Buffer.  IntArray: Array von Zahlen.  LongArray: Array von BigInt.
//  Rohwerte in Listen sind die Werte ohne Tag-Hülle.

const T = { END: 0, BYTE: 1, SHORT: 2, INT: 3, LONG: 4, FLOAT: 5, DOUBLE: 6, BYTEARRAY: 7, STRING: 8, LIST: 9, COMPOUND: 10, INTARRAY: 11, LONGARRAY: 12 };

const tag = (t, v) => ({ t, v });
const byte = (v) => tag(T.BYTE, v);
const short = (v) => tag(T.SHORT, v);
const int = (v) => tag(T.INT, v);
const long = (v) => tag(T.LONG, BigInt(v));
const float = (v) => tag(T.FLOAT, v);
const double = (v) => tag(T.DOUBLE, v);
const string = (v) => tag(T.STRING, v);
const byteArray = (v) => tag(T.BYTEARRAY, Buffer.from(v));
const list = (et, items) => tag(T.LIST, { et, items });
/** compound({a: tag, ...}) oder compound([[name, tag], ...]) oder compound(Map) */
const compound = (entries) => tag(T.COMPOUND, entries instanceof Map ? entries : new Map(Array.isArray(entries) ? entries : Object.entries(entries || {})));

class Writer {
  constructor() { this.parts = []; this.cur = Buffer.allocUnsafe(1 << 16); this.n = 0; }
  need(k) {
    if (this.n + k > this.cur.length) {
      this.parts.push(this.cur.subarray(0, this.n));
      this.cur = Buffer.allocUnsafe(Math.max(1 << 16, k));
      this.n = 0;
    }
  }
  u8(v) { this.need(1); this.cur[this.n++] = v & 255; }
  i16(v) { this.need(2); this.cur.writeInt16LE(v, this.n); this.n += 2; }
  i32(v) { this.need(4); this.cur.writeInt32LE(v, this.n); this.n += 4; }
  i64(v) { this.need(8); this.cur.writeBigInt64LE(BigInt.asIntN(64, v), this.n); this.n += 8; }
  f32(v) { this.need(4); this.cur.writeFloatLE(v, this.n); this.n += 4; }
  f64(v) { this.need(8); this.cur.writeDoubleLE(v, this.n); this.n += 8; }
  bytes(b) { this.need(b.length); b.copy(this.cur, this.n); this.n += b.length; }
  str(s) { const b = Buffer.from(s, 'utf8'); this.i16(b.length); this.bytes(b); }
  done() { this.parts.push(this.cur.subarray(0, this.n)); return Buffer.concat(this.parts); }
}

function writeValue(w, t, v) {
  switch (t) {
    case T.BYTE: w.u8(v); break;
    case T.SHORT: w.i16(v); break;
    case T.INT: w.i32(v); break;
    case T.LONG: w.i64(v); break;
    case T.FLOAT: w.f32(v); break;
    case T.DOUBLE: w.f64(v); break;
    case T.BYTEARRAY: w.i32(v.length); w.bytes(v); break;
    case T.STRING: w.str(v); break;
    case T.LIST:
      w.u8(v.et); w.i32(v.items.length);
      for (const it of v.items) writeValue(w, v.et, it);
      break;
    case T.COMPOUND:
      for (const [name, tg] of v) { w.u8(tg.t); w.str(name); writeValue(w, tg.t, tg.v); }
      w.u8(T.END);
      break;
    case T.INTARRAY: w.i32(v.length); for (const x of v) w.i32(x); break;
    case T.LONGARRAY: w.i32(v.length); for (const x of v) w.i64(x); break;
    default: throw new Error('NBT: unbekannter Typ ' + t);
  }
}

/** Schreibt einen benannten Wurzel-Tag. */
function write(name, tg) {
  const w = new Writer();
  w.u8(tg.t); w.str(name); writeValue(w, tg.t, tg.v);
  return w.done();
}

function readValue(b, o, t) {
  switch (t) {
    case T.BYTE: return [b.readInt8(o), o + 1];
    case T.SHORT: return [b.readInt16LE(o), o + 2];
    case T.INT: return [b.readInt32LE(o), o + 4];
    case T.LONG: return [b.readBigInt64LE(o), o + 8];
    case T.FLOAT: return [b.readFloatLE(o), o + 4];
    case T.DOUBLE: return [b.readDoubleLE(o), o + 8];
    case T.BYTEARRAY: { const n = b.readInt32LE(o); return [Buffer.from(b.subarray(o + 4, o + 4 + n)), o + 4 + n]; }
    case T.STRING: { const n = b.readUInt16LE(o); return [b.toString('utf8', o + 2, o + 2 + n), o + 2 + n]; }
    case T.LIST: {
      const et = b.readUInt8(o), n = b.readInt32LE(o + 1);
      let p = o + 5; const items = [];
      for (let i = 0; i < n; i++) { const [v, q] = readValue(b, p, et); items.push(v); p = q; }
      return [{ et, items }, p];
    }
    case T.COMPOUND: {
      const m = new Map(); let p = o;
      for (;;) {
        const tt = b.readUInt8(p++);
        if (tt === T.END) break;
        const n = b.readUInt16LE(p); const name = b.toString('utf8', p + 2, p + 2 + n); p += 2 + n;
        const [v, q] = readValue(b, p, tt); m.set(name, { t: tt, v }); p = q;
      }
      return [m, p];
    }
    case T.INTARRAY: { const n = b.readInt32LE(o); const a = []; for (let i = 0; i < n; i++) a.push(b.readInt32LE(o + 4 + 4 * i)); return [a, o + 4 + 4 * n]; }
    case T.LONGARRAY: { const n = b.readInt32LE(o); const a = []; for (let i = 0; i < n; i++) a.push(b.readBigInt64LE(o + 4 + 8 * i)); return [a, o + 4 + 8 * n]; }
    default: throw new Error('NBT: unbekannter Typ ' + t);
  }
}

/** Liest einen benannten Tag ab offset. -> { name, tag, end } */
function read(buf, offset = 0) {
  const t = buf.readUInt8(offset);
  const n = buf.readUInt16LE(offset + 1);
  const name = buf.toString('utf8', offset + 3, offset + 3 + n);
  const [v, end] = readValue(buf, offset + 3 + n, t);
  return { name, tag: { t, v }, end };
}

/** Liest hintereinander stehende benannte Tags (z. B. Palette eines Subchunks). */
function readAll(buf, offset = 0, count = Infinity) {
  const out = []; let o = offset;
  while (o < buf.length && out.length < count) { const r = read(buf, o); out.push(r); o = r.end; }
  return out;
}

/** Tag -> einfache JS-Werte (Compound -> Objekt, Liste -> Array, Long bleibt BigInt). */
function toPlain(tg) {
  const conv = (t, v) => {
    if (t === T.COMPOUND) { const o = {}; for (const [k, x] of v) o[k] = conv(x.t, x.v); return o; }
    if (t === T.LIST) return v.items.map((x) => conv(v.et, x));
    return v;
  };
  return conv(tg.t, tg.v);
}

module.exports = { T, tag, byte, short, int, long, float, double, string, byteArray, list, compound, write, read, readAll, toPlain };
