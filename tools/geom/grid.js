'use strict';
// VoxelGrid: kompakter Speicher mit Eigentümer-Prüfung (jede Zelle genau einmal).

const X_MIN = -512, X_MAX = 511;
const Z_MIN = -512, Z_MAX = 511;
const Y_MIN = 0, Y_MAX = 511;

// Wert pro Zelle: seq * 2^28 + tagId * 2^16 + typeId (passt in eine Double-Zahl)
const TYPE_BITS = 65536;      // 2^16
const TAG_BITS = 4096;        // 2^12
const SEQ_SHIFT = TYPE_BITS * TAG_BITS; // 2^28

function packKey(x, y, z) {
  return ((x + 512) * 1024 + (z + 512)) * 512 + y;
}

function unpackKey(key) {
  const y = key % 512;
  const rest = (key - y) / 512;
  const zr = rest % 1024;
  const x = (rest - zr) / 1024 - 512;
  return { x, y, z: zr - 512 };
}

class VoxelConflictError extends Error {
  constructor(x, y, z, existing, incoming) {
    const d = (e) => `${e.module}/${e.part}/${e.type}`;
    super(`Voxel-Konflikt bei (${x},${y},${z}): vorhanden ${d(existing)}, neu ${d(incoming)}`);
    this.name = 'VoxelConflictError';
    this.x = x;
    this.y = y;
    this.z = z;
    this.existing = existing;
    this.incoming = incoming;
  }
}

function checkCoord(x, y, z) {
  if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z)) {
    throw new TypeError(`Koordinaten müssen ganzzahlig sein: (${x},${y},${z})`);
  }
  if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX || z < Z_MIN || z > Z_MAX) {
    throw new RangeError(`Koordinaten außerhalb des Bereichs: (${x},${y},${z})`);
  }
}

class VoxelGrid {
  constructor() {
    this._cells = new Map();   // key -> gepackter Wert
    this._seq = 0;
    this._types = [];          // typeId -> string
    this._typeIds = new Map(); // string -> typeId
    this._tags = [];           // tagId -> {module, part} (je Tag genau ein Objekt)
    this._tagIds = new Map();  // "module|part" -> tagId
  }

  _typeId(type) {
    let id = this._typeIds.get(type);
    if (id === undefined) {
      id = this._types.length;
      if (id >= TYPE_BITS) throw new RangeError('Zu viele verschiedene Typen');
      this._types.push(type);
      this._typeIds.set(type, id);
    }
    return id;
  }

  _tagId(module, part) {
    const k = module + '|' + part;
    let id = this._tagIds.get(k);
    if (id === undefined) {
      id = this._tags.length;
      if (id >= TAG_BITS) throw new RangeError('Zu viele verschiedene Tags');
      this._tags.push(Object.freeze({ module, part }));
      this._tagIds.set(k, id);
    }
    return id;
  }

  _decode(v) {
    const typeId = v % TYPE_BITS;
    const rest = (v - typeId) / TYPE_BITS;
    const tagId = rest % TAG_BITS;
    const seq = (rest - tagId) / TAG_BITS;
    return { typeId, tagId, seq };
  }

  _entry(v) {
    const { typeId, tagId, seq } = this._decode(v);
    const tag = this._tags[tagId];
    return { type: this._types[typeId], module: tag.module, part: tag.part, seq };
  }

  writer(tag, opts) {
    const trackKeys = !!(opts && opts.trackKeys);
    if (!tag || typeof tag !== 'object') throw new TypeError('tag muss ein Objekt sein');
    const { module, part } = tag;
    if (!Number.isInteger(module) || module < 0 || module > 9) {
      throw new RangeError(`tag.module muss eine Ganzzahl 0..9 sein: ${module}`);
    }
    if (typeof part !== 'string' || part.length === 0) {
      throw new TypeError('tag.part muss ein nicht-leerer String sein');
    }
    const grid = this;
    const tagId = this._tagId(module, part);
    const cells = this._cells;
    let count = 0;
    const keys = trackKeys ? [] : null; // Schlüssel in Einfügereihenfolge

    function put(x, y, z, type) {
      checkCoord(x, y, z);
      if (typeof type !== 'string' || type.length === 0) {
        throw new TypeError('type muss ein nicht-leerer String sein');
      }
      const key = packKey(x, y, z);
      const old = cells.get(key);
      if (old !== undefined) {
        throw new VoxelConflictError(x, y, z, grid._entry(old), { type, module, part });
      }
      cells.set(key, grid._seq++ * SEQ_SHIFT + tagId * TYPE_BITS + grid._typeId(type));
      if (keys) keys.push(key);
      count++;
    }

    // Eigentümer-Modul einer belegten Zelle
    function ownModule(key) {
      const old = cells.get(key);
      if (old === undefined) return undefined;
      return grid._tags[grid._decode(old).tagId].module;
    }

    const api = {
      set(x, y, z, type) { put(x, y, z, type); },
      fill(iterable, material) {
        const isFn = typeof material === 'function';
        if (!isFn && (typeof material !== 'string' || material.length === 0)) {
          throw new TypeError('material muss ein nicht-leerer String oder eine Funktion sein');
        }
        let n = 0;
        for (const c of iterable) {
          const t = isFn ? material(c.x, c.y, c.z) : material;
          if (t === null) continue;
          put(c.x, c.y, c.z, t);
          n++;
        }
        return n;
      },
      // Vereinigung: Zellen desselben Moduls werden übersprungen, fremde Zellen werfen.
      fillUnion(iterable, material) {
        const isFn = typeof material === 'function';
        if (!isFn && (typeof material !== 'string' || material.length === 0)) {
          throw new TypeError('material muss ein nicht-leerer String oder eine Funktion sein');
        }
        let n = 0;
        for (const c of iterable) {
          const t = isFn ? material(c.x, c.y, c.z) : material;
          if (t === null) continue;
          checkCoord(c.x, c.y, c.z);
          if (ownModule(packKey(c.x, c.y, c.z)) === module) continue;
          put(c.x, c.y, c.z, t);
          n++;
        }
        return n;
      },
      get count() { return count; },
    };
    if (keys) api.keys = keys;
    return api;
  }

  hasKey(key) { return this._cells.has(key); }

  // Modul, dem die Zelle gehört (Zahl) oder undefined
  ownerModule(x, y, z) {
    if (!this.has(x, y, z)) return undefined;
    return this.moduleOfKey(packKey(x, y, z));
  }

  moduleOfKey(key) {
    const v = this._cells.get(key);
    return v === undefined ? undefined : this._tags[this._decode(v).tagId].module;
  }

  typeOfKey(key) {
    const v = this._cells.get(key);
    return v === undefined ? undefined : this._types[this._decode(v).typeId];
  }

  // Gepackte Schlüssel (Einfügereihenfolge); optional gefiltert: predicate(key, module)
  keysOf(predicate) {
    const out = [];
    for (const [key, v] of this._cells) {
      if (!predicate || predicate(key, this._tags[this._decode(v).tagId].module)) out.push(key);
    }
    return out;
  }

  has(x, y, z) {
    if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(z)) return false;
    if (x < X_MIN || x > X_MAX || y < Y_MIN || y > Y_MAX || z < Z_MIN || z > Z_MAX) return false;
    return this._cells.has(packKey(x, y, z));
  }

  get(x, y, z) {
    if (!this.has(x, y, z)) return undefined;
    return this._entry(this._cells.get(packKey(x, y, z)));
  }

  get size() { return this._cells.size; }

  forEach(cb) {
    for (const [key, v] of this._cells) {
      const { x, y, z } = unpackKey(key);
      cb(x, y, z, this._entry(v));
    }
  }

  bounds() {
    if (this._cells.size === 0) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const key of this._cells.keys()) {
      const { x, y, z } = unpackKey(key);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    return { minX, maxX, minY, maxY, minZ, maxZ };
  }

  countsBy(field) {
    if (field !== 'module' && field !== 'part' && field !== 'type') {
      throw new RangeError(`Unbekanntes Feld: ${field}`);
    }
    const ids = new Map();
    for (const v of this._cells.values()) {
      const { typeId, tagId } = this._decode(v);
      const id = field === 'type' ? typeId : tagId;
      ids.set(id, (ids.get(id) || 0) + 1);
    }
    const out = new Map();
    for (const [id, n] of ids) {
      const val = field === 'type' ? this._types[id] : this._tags[id][field];
      out.set(val, (out.get(val) || 0) + n);
    }
    return out;
  }
}

module.exports = { VoxelGrid, VoxelConflictError, packKey, unpackKey };
