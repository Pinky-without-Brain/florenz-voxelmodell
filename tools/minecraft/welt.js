'use strict';
// Weltdaten für den Minecraft-Export: Gelände, Oberflächen, Platzhalter-Häuser und Projektblöcke je Chunk.
// Modellkoordinaten = Minecraft-Koordinaten (x, y, z). Chunks werden einzeln erzeugt (chunkBlocks).

const fs = require('node:fs');
const path = require('node:path');
const GEL = require('../geo/gelaende.js');
const grid = require('../geom/grid.js');
const { loadRegistry, ROOT } = require('../projects.js');
const { buildWorld } = require('../model/world.js');
const { typesForRole } = require('../spec/palette.js');
const { ALLE_TYPEN } = require('./bedrock_bloecke.js');

const Y_MIN = -64, Y_MAX = 319, SUBS = 24;
// Oberflächenarten im Raster `surf` (Bits 0-1) und Vorrang-Merker (Bit 2)
const S_GRAS = 0, S_PFLASTER = 1, S_WASSER = 2, S_VORRANG = 4;
const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'stadt');
// Gebäude des Doms (Kathedrale, Campanile, Baptisterium), wie tools/emit/webindex.js
const DOM_IDS = ['w43768260', 'w251650632', 'w166821303'];
const PUTZ_ROLLEN = ['putz_ocker', 'putz_gelb', 'putz_rosa', 'putz_sand', 'putz_weiss', 'putz_grau', 'putz_terrakotta'];

/** Zeilenweise Füllung eines Polygons (gerade-ungerade über alle Ringe). cb(z, xa, xb) mit ganzzahligen Zellmitten. */
function fillPolygon(poly, cb, zLimit) {
  const edges = [];
  for (const ring of [...poly.aussen, ...(poly.loecher || [])]) {
    const n = ring.length;
    for (let i = 0; i < n; i++) {
      const p = ring[i], q = ring[(i + 1) % n];
      if (p[1] === q[1]) continue;
      edges.push(p[1] < q[1] ? [p[1], q[1], p[0], q[0]] : [q[1], p[1], q[0], p[0]]); // zlo, zhi, x bei zlo, x bei zhi
    }
  }
  if (!edges.length) return;
  edges.sort((a, b) => a[0] - b[0]);
  let zmin = Infinity, zmax = -Infinity;
  for (const e of edges) { if (e[0] < zmin) zmin = e[0]; if (e[1] > zmax) zmax = e[1]; }
  let z0 = Math.ceil(zmin), z1 = Math.ceil(zmax) - 1; // halboffen: Zeile z gehört dazu, wenn zlo <= z < zhi
  if (zLimit) { z0 = Math.max(z0, zLimit[0]); z1 = Math.min(z1, zLimit[1]); }
  let next = 0; const active = [];
  const xs = [];
  for (let z = z0; z <= z1; z++) {
    while (next < edges.length && edges[next][0] <= z) active.push(edges[next++]);
    xs.length = 0;
    for (let i = active.length - 1; i >= 0; i--) {
      const e = active[i];
      if (e[1] <= z) { active[i] = active[active.length - 1]; active.pop(); continue; }
      xs.push(e[2] + (z - e[0]) * (e[3] - e[2]) / (e[1] - e[0]));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.ceil(xs[k] - 1e-9), xb = Math.floor(xs[k + 1] + 1e-9);
      if (xb >= xa) cb(z, xa, xb);
    }
  }
}

function bboxOf(poly) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const r of poly.aussen) for (const p of r) {
    if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
    if (p[1] < z0) z0 = p[1]; if (p[1] > z1) z1 = p[1];
  }
  return { x0, x1, z0, z1 };
}

function fnv(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

class WeltDaten {
  /**
   * opts: { registry: {root, projectsRoot, entries}, platzhalter (Vorgabe true), bereich: {x0,x1,z0,z1} (Blockkoordinaten),
   *         datenDir, log }
   */
  constructor(opts = {}) {
    this.opts = opts;
    this.log = opts.log || (() => {});
    this.platzhalter = opts.platzhalter !== false;
    const b = GEL.bounds();
    this.r = { x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, W: b.x1 - b.x0 + 1, H: b.z1 - b.z0 + 1 };
    const be = opts.bereich;
    this.bereich = be ? { x0: Math.max(be.x0, -4096), x1: Math.min(be.x1, 4095), z0: Math.max(be.z0, -4096), z1: Math.min(be.z1, 4095) } : null;
    // Typen: Id 0 = Luft
    this.typeNames = ['air'];
    this.typeIds = new Map();
    this.typ('bedrock'); this.typ('stone'); this.typ('dirt'); this.typ('grass_block'); this.typ('gravel'); this.typ('water');
    this.typ(typesForRole('pflaster')[0]); this.typ(typesForRole('dachziegel')[0]);
    this.T = {
      bedrock: this.typ('bedrock'), stone: this.typ('stone'), dirt: this.typ('dirt'), gras: this.typ('grass_block'),
      kies: this.typ('gravel'), wasser: this.typ('water'), pflaster: this.typ(typesForRole('pflaster')[0]), dach: this.typ(typesForRole('dachziegel')[0])
    };
    this.putz = PUTZ_ROLLEN.map((r) => this.typ(typesForRole(r)[0]));
    this.buckets = new Map();     // Chunk-Schlüssel -> Array gepackter Projektzellen
    this.projects = [];           // { id, blocks, bounds }
    this.stats = { projektBloecke: 0, verworfen: 0, haeuser: 0, haeuserCells: 0 };
    this.cursor = null;
  }

  typ(name) {
    let id = this.typeIds.get(name);
    if (id === undefined) {
      if (!ALLE_TYPEN.includes(name)) throw new Error(`Minecraft-Export: unbekannter Blocktyp "${name}"`);
      id = this.typeNames.length;
      if (id > 127) throw new Error('Zu viele Blocktypen');
      this.typeNames.push(name); this.typeIds.set(name, id);
    }
    return id;
  }

  inBereich(bb) {
    const b = this.bereich;
    if (!b) return true;
    return !(bb.x1 < b.x0 || bb.x0 > b.x1 || bb.z1 < b.z0 || bb.z0 > b.z1);
  }

  _idx(x, z) { return (z - this.r.z0) * this.r.W + (x - this.r.x0); }

  prepare() {
    const t0 = Date.now();
    const { W, H } = this.r;
    this.surf = new Uint8Array(W * H);
    this.deck = new Map();
    this.hInfo = this.platzhalter ? new Uint8Array(W * H) : null;
    this.hTop = this.platzhalter ? new Int16Array(W * H) : null;
    this._projekte();
    this.log(`  Projekte: ${this.projects.map((p) => `${p.id} ${p.blocks}`).join(', ')} (${Date.now() - t0} ms)`);
    this._flaechen();
    this.log(`  Flächen gerastert (${Date.now() - t0} ms)`);
    this._haeuser();
    this.log(`  Platzhalter-Häuser: ${this.stats.haeuser} (${Date.now() - t0} ms)`);
  }

  // ---- Projekte ----
  _projekte() {
    const reg = loadRegistry(this.opts.registry || {});
    this.projektGebaeude = new Set(DOM_IDS);
    this.gebauteProjekte = new Set(['duomo']);
    const bucketAdd = (key, v) => { let a = this.buckets.get(key); if (!a) this.buckets.set(key, a = []); a.push(v); };
    for (const p of reg.projects) {
      const w = buildWorld({ project: p });
      if (w.errors.length) throw new Error(`Projekt ${p.id}: Fehler im Bau (${w.errors[0].message})`);
      const g = w.grid;
      if (!g.size) continue;
      const json = p.json || {};
      this.gebauteProjekte.add(p.id);
      for (const id of json.gebaeude || []) this.projektGebaeude.add(id);
      for (const m of Object.values(json.masken && typeof json.masken === 'object' ? json.masken : {})) for (const id of (m && m.gebaeude) || []) this.projektGebaeude.add(id);
      const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity };
      let n = 0;
      const tid = new Map();
      const modMin = {};
      g.forEachKey((key, mod) => {
        const x = grid.xOfKey(key), y = grid.yOfKey(key), z = grid.zOfKey(key);
        if (x < bounds.minX) bounds.minX = x; if (x > bounds.maxX) bounds.maxX = x;
        if (y < bounds.minY) bounds.minY = y; if (y > bounds.maxY) bounds.maxY = y;
        if (z < bounds.minZ) bounds.minZ = z; if (z > bounds.maxZ) bounds.maxZ = z;
        if (modMin[mod] === undefined || x < modMin[mod]) modMin[mod] = x;
        if (y < Y_MIN || y > Y_MAX) { this.stats.verworfen++; return; }
        const t = g.typeOfKey(key);
        let id = tid.get(t);
        if (id === undefined) tid.set(t, id = this.typ(t));
        const cx = x >> 4, cz = z >> 4;
        if (this.bereich && (x < this.bereich.x0 || x > this.bereich.x1 || z < this.bereich.z0 || z > this.bereich.z1)) return;
        bucketAdd(cx * 65536 + cz, ((y * 256) + ((x & 15) * 16 + (z & 15))) * 128 + id);
        n++;
      });
      this.stats.projektBloecke += n;
      this.projects.push({ id: p.id, blocks: n, bounds, modMin });
    }
  }

  // ---- Flächen ----
  _flaechen() {
    const dir = this.opts.datenDir || DATA_DIR;
    const fl = JSON.parse(fs.readFileSync(path.join(dir, 'flaechen.json'), 'utf8'));
    const { x0, z0, x1, z1, W } = this.r;
    const surf = this.surf;
    const zl = this.bereich ? [this.bereich.z0, this.bereich.z1] : null;
    const paint = (poly, fn) => {
      if (!this.inBereich(bboxOf(poly))) return;
      fillPolygon(poly, (z, xa, xb) => {
        if (z < z0 || z > z1) return;
        const a = Math.max(xa, x0, this.bereich ? this.bereich.x0 : x0), b = Math.min(xb, x1, this.bereich ? this.bereich.x1 : x1);
        for (let x = a; x <= b; x++) fn(this._idx(x, z), x, z);
      }, zl);
    };
    for (const p of fl.wasser) paint(p.polygon, (i) => { surf[i] = S_WASSER; });
    const decks = [];
    for (const kind of ['strassen', 'plaetze', 'bruecken']) {
      for (const p of fl[kind]) {
        if (!p.polygon) continue;
        const cells = [];
        let wasser = 0;
        paint(p.polygon, (i, x, z) => { cells.push(i); if ((surf[i] & 3) === S_WASSER) wasser++; });
        if (!cells.length) continue;
        if (wasser === 0) { for (const i of cells) surf[i] = (surf[i] & ~3) | S_PFLASTER; continue; }
        // Brücke: Wasserzellen bekommen ein Deck auf Uferhöhe; Landzellen werden Pflaster
        let bank = -Infinity;
        for (const i of cells) {
          if ((surf[i] & 3) === S_WASSER) continue;
          const x = x0 + (i % W), z = z0 + Math.floor(i / W);
          let nearWater = false;
          for (let dz = -1; dz <= 1 && !nearWater; dz++) for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx, zz = z + dz;
            if (xx < x0 || xx > x1 || zz < z0 || zz > z1) continue;
            if ((surf[this._idx(xx, zz)] & 3) === S_WASSER) { nearWater = true; break; }
          }
          if (nearWater) bank = Math.max(bank, GEL.groundTopY(x, z));
        }
        for (const i of cells) {
          if ((surf[i] & 3) !== S_WASSER) { surf[i] = (surf[i] & ~3) | S_PFLASTER; continue; }
          if (bank > -Infinity) {
            const gy = GEL.groundTopY(x0 + (i % W), z0 + Math.floor(i / W));
            if (bank - gy <= 20) decks.push([i, bank]);
          }
        }
      }
    }
    for (const [i, y] of decks) this.deck.set(i, y);
    this.stats.deckZellen = this.deck.size;
  }

  // ---- Häuser ----
  _haeuser() {
    const dir = this.opts.datenDir || DATA_DIR;
    const geb = JSON.parse(fs.readFileSync(path.join(dir, 'gebaeude.json'), 'utf8')).gebaeude;
    const byId = new Map(geb.map((b) => [b.id, b]));
    const { x0, z0, x1, z1, W } = this.r;
    const vorAlle = fs.existsSync(path.join(dir, 'vorrang.json')) ? JSON.parse(fs.readFileSync(path.join(dir, 'vorrang.json'), 'utf8')).ids : {};
    // Vorrang gilt nur für Wahrzeichen, die schon gebaut sind; die übrigen bleiben Platzhalter-Häuser
    const gebaut = this.gebauteProjekte || null;
    const vor = Object.fromEntries(Object.entries(vorAlle).filter(([, pid]) => !gebaut || gebaut.has(pid)));
    for (const id of Object.keys(vor)) {
      const b = byId.get(id);
      if (!b) continue;
      fillPolygon(b.polygon, (z, xa, xb) => {
        if (z < z0 || z > z1) return;
        for (let x = Math.max(xa, x0); x <= Math.min(xb, x1); x++) this.surf[this._idx(x, z)] |= S_VORRANG;
      });
    }
    if (!this.platzhalter) return;
    const farben = this.putz;
    for (const b of geb) {
      if (this.projektGebaeude.has(b.id) || vor[b.id]) continue;
      const bb = bboxOf(b.polygon);
      if (!this.inBereich(bb)) continue;
      const mx0 = Math.floor(bb.x0) - 1, mz0 = Math.floor(bb.z0) - 1;
      const mw = Math.ceil(bb.x1) - mx0 + 2, mh = Math.ceil(bb.z1) - mz0 + 2;
      if (mw * mh > 4e6) continue;
      const mask = new Uint8Array(mw * mh);
      fillPolygon(b.polygon, (z, xa, xb) => { for (let x = xa; x <= xb; x++) mask[(z - mz0) * mw + (x - mx0)] = 1; });
      const top = Math.min(Y_MAX, b.bodenY + b.hoeheBl);
      const color = 1 + (fnv(b.id) % farben.length);
      let any = false;
      for (let zz = 1; zz < mh - 1; zz++) for (let xx = 1; xx < mw - 1; xx++) {
        const m = zz * mw + xx;
        if (!mask[m]) continue;
        const x = mx0 + xx, z = mz0 + zz;
        if (x < x0 || x > x1 || z < z0 || z > z1) continue;
        const i = this._idx(x, z);
        if ((this.surf[i] & S_VORRANG) || this.hInfo[i]) continue;
        const rand = !mask[m - 1] || !mask[m + 1] || !mask[m - mw] || !mask[m + mw];
        this.hInfo[i] = ((rand ? 1 : 2) << 3) | color;
        this.hTop[i] = top;
        any = true; this.stats.haeuserCells++;
      }
      if (any) this.stats.haeuser++;
    }
  }

  // ---- Chunks ----
  /** Alle Chunk-Koordinaten [cx, cz] des Exports. */
  chunkListe() {
    const set = new Set();
    const { x0, x1, z0, z1 } = this.r;
    const cx0 = x0 >> 4, cx1 = x1 >> 4, cz0 = z0 >> 4, cz1 = z1 >> 4;
    const be = this.bereich;
    for (let cx = cx0; cx <= cx1; cx++) {
      if (be && (cx < (be.x0 >> 4) || cx > (be.x1 >> 4))) continue;
      for (let cz = cz0; cz <= cz1; cz++) {
        if (be && (cz < (be.z0 >> 4) || cz > (be.z1 >> 4))) continue;
        set.add(cx * 65536 + cz);
      }
    }
    for (const k of this.buckets.keys()) set.add(k);
    return [...set].map((k) => { const cz = ((k % 65536) + 65536) % 65536; const czs = cz >= 32768 ? cz - 65536 : cz; return [(k - czs) / 65536, czs]; });
  }

  /**
   * Erzeugt einen Chunk. Rückgabe { blocks: Uint8Array(SUBS*4096, Index s*4096 + (xl*16+zl)*16 + yl), heights: Int16Array(256) }.
   * Die Puffer werden bei jedem Aufruf wiederverwendet.
   */
  chunkBlocks(cx, cz) {
    if (!this._buf) { this._buf = new Uint8Array(SUBS * 4096); this._minP = new Int16Array(256); this._top = new Int16Array(256); this._projCol = new Uint8Array(256); }
    const bl = this._buf, minP = this._minP, topY = this._top, projCol = this._projCol;
    bl.fill(0); minP.fill(32767); topY.fill(-32768); projCol.fill(0);
    const b = this.buckets.get(cx * 65536 + cz);
    if (b) for (const v of b) {
      const pos = (v >> 7) & 255, y = v >> 15;
      projCol[pos] = 1;
      if (y < minP[pos]) minP[pos] = y;
    }
    const T = this.T, r = this.r, surf = this.surf;
    const set = (pos, y, id) => { bl[((y - Y_MIN) >> 4) * 4096 + pos * 16 + ((y - Y_MIN) & 15)] = id; if (y > topY[pos]) topY[pos] = y; };
    const bx = cx << 4, bz = cz << 4;
    for (let xl = 0; xl < 16; xl++) {
      const x = bx + xl;
      for (let zl = 0; zl < 16; zl++) {
        const z = bz + zl, pos = xl * 16 + zl;
        if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue;
        const i = (z - r.z0) * r.W + (x - r.x0);
        const gy = GEL.groundTopY(x, z);
        const top = Math.min(gy, minP[pos] - 1, Y_MAX);
        const kind = surf[i] & 3;
        if (top >= Y_MIN) {
          set(pos, Y_MIN, T.bedrock);
          if (kind === S_WASSER) {
            for (let y = Y_MIN + 1; y <= top - 5; y++) set(pos, y, T.stone);
            for (let y = Math.max(Y_MIN + 1, top - 4); y <= top - 3; y++) set(pos, y, T.kies);
            for (let y = Math.max(Y_MIN + 1, top - 2); y <= top; y++) set(pos, y, T.wasser);
          } else if (kind === S_PFLASTER) {
            for (let y = Y_MIN + 1; y < top; y++) set(pos, y, T.stone);
            set(pos, top, T.pflaster);
          } else {
            for (let y = Y_MIN + 1; y <= top - 3; y++) set(pos, y, T.stone);
            for (let y = Math.max(Y_MIN + 1, top - 2); y < top; y++) set(pos, y, T.dirt);
            set(pos, top, T.gras);
          }
        }
        const dy = this.deck.get(i);
        if (dy !== undefined && !projCol[pos] && dy >= Y_MIN && dy <= Y_MAX) { set(pos, dy, T.pflaster); set(pos, dy - 1, T.stone); }
        if (this.hInfo && !projCol[pos] && top === gy) {
          const h = this.hInfo[i];
          if (h) {
            const ht = this.hTop[i], color = this.putz[(h & 7) - 1];
            if (ht > gy) {
              if ((h >> 3) === 1) for (let y = gy + 1; y < ht; y++) set(pos, y, color);
              set(pos, ht, T.dach);
            }
          }
        }
      }
    }
    if (b) for (const v of b) {
      const pos = (v >> 7) & 255, y = v >> 15;
      set(pos, y, v & 127);
    }
    const heights = this._heights || (this._heights = new Int16Array(256));
    for (let xl = 0; xl < 16; xl++) for (let zl = 0; zl < 16; zl++) {
      const t = topY[xl * 16 + zl];
      heights[zl * 16 + xl] = t === -32768 ? 0 : t + 65;
    }
    return { blocks: bl, heights };
  }

  /** Bodenhöhe der Oberfläche (oberster Block) an einer Stelle, nur Gelände. */
  oberflaeche(x, z) { return GEL.groundTopY(x, z); }

  /** Spawn-Punkt westlich der Westfassade des Doms (erste freie Pflasterspalte). */
  spawn() {
    const dom = this.projects.find((p) => p.id === 'duomo');
    const mitteZ = dom ? Math.round((dom.bounds.minZ + dom.bounds.maxZ) / 2) : Math.round((this.r.z0 + this.r.z1) / 2);
    // Westfassade = Modul 2 des Doms
    const startX = dom ? (dom.modMin[2] !== undefined ? dom.modMin[2] : dom.bounds.minX) - 12 : Math.round((this.r.x0 + this.r.x1) / 2);
    for (let dx = 0; dx <= 60; dx += 2) {
      for (const dz of [0, 4, -4, 8, -8, 12, -12]) {
        const x = startX - dx, z = mitteZ + dz;
        if (x < this.r.x0 || x > this.r.x1 || z < this.r.z0 || z > this.r.z1) continue;
        const i = this._idx(x, z);
        const b = this.buckets.get((x >> 4) * 65536 + (z >> 4));
        const proj = b && b.some((v) => ((v >> 7) & 255) === (x & 15) * 16 + (z & 15));
        if (proj || (this.surf[i] & 3) === S_WASSER || (this.hInfo && this.hInfo[i])) continue;
        return { x, y: GEL.groundTopY(x, z) + 1, z };
      }
    }
    return { x: startX, y: 80, z: mitteZ };
  }
}

module.exports = { WeltDaten, fillPolygon, DOM_IDS, Y_MIN, Y_MAX, SUBS };
