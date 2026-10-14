'use strict';
// Zellmasken für Wahrzeichen (W0): Menge ganzzahliger Zellen (x, z) mit Abstandsfeldern und Kantenrahmen.
// Schlüssel wie poly.ck. Rand der OSM-Polygone zählt innen (poly.cellsOf/contains), Löcher sind ausgespart.

const fs = require('node:fs');
const path = require('node:path');
const P = require('../city/poly.js');
const { makeRahmen, rahmenAusBasis } = require('./rahmen.js');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_DATEN = path.join(ROOT, 'data', 'stadt');
const AUSSEN_REICHWEITE = 32;   // dAussen ist bis zu diesem Abstand (Chebyshev) definiert, weiter draußen Infinity
const INF = 1 << 29;

// ------------------------------------------------------------------ Datenquelle
const datenCache = new Map();
/** daten: Ordner mit gebaeude.json | { gebaeude: [...] } | Array | undefined (data/stadt). -> Map id -> Gebäude */
function ladeGebaeude(daten) {
  if (daten && !Array.isArray(daten) && typeof daten === 'object') daten = daten.gebaeude;
  if (Array.isArray(daten)) return new Map(daten.map((g) => [g.id, g]));
  const dir = path.resolve(daten || DEFAULT_DATEN);
  const f = path.join(dir, 'gebaeude.json');
  const mt = fs.statSync(f).mtimeMs;
  const c = datenCache.get(f);
  if (c && c.mt === mt) return c.byId;
  const byId = new Map(JSON.parse(fs.readFileSync(f, 'utf8')).gebaeude.map((g) => [g.id, g]));
  datenCache.set(f, { mt, byId });
  return byId;
}

/** Flächen (flaechen.json: alle Kategorien mit Polygon) eines Datenordners -> Map id -> { id, polygon }. */
const flaechenCache = new Map();
function ladeFlaechen(daten) {
  if (daten && !Array.isArray(daten) && typeof daten === 'object') daten = daten.flaechen;
  if (Array.isArray(daten)) return new Map(daten.map((f) => [f.id, f]));
  const dir = path.resolve(daten || DEFAULT_DATEN);
  const f = path.join(dir, 'flaechen.json');
  const mt = fs.statSync(f).mtimeMs;
  const c = flaechenCache.get(f);
  if (c && c.mt === mt) return c.byId;
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  const byId = new Map();
  for (const [k, list] of Object.entries(j)) {
    if (!Array.isArray(list)) continue;
    for (const e of list) if (e && e.polygon && !byId.has(e.id)) byId.set(e.id, { ...e, kategorie: k });
  }
  flaechenCache.set(f, { mt, byId });
  return byId;
}

// ------------------------------------------------------------------ Abstandsfeld
// Chebyshev-Abstand zur nächsten Quellzelle (Quelle = 0) auf dem Raster x0..x0+w-1, z0..z0+h-1 (zwei Durchläufe).
function chessDist(x0, z0, w, h, isSource) {
  const d = new Int32Array(w * h);
  for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) d[i * h + j] = isSource(x0 + i, z0 + j) ? 0 : INF;
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      const k = i * h + j;
      let v = d[k];
      if (v === 0) continue;
      if (i > 0) {
        const a = (i - 1) * h + j;
        if (d[a] + 1 < v) v = d[a] + 1;
        if (j > 0 && d[a - 1] + 1 < v) v = d[a - 1] + 1;
        if (j < h - 1 && d[a + 1] + 1 < v) v = d[a + 1] + 1;
      }
      if (j > 0 && d[k - 1] + 1 < v) v = d[k - 1] + 1;
      d[k] = v;
    }
  }
  for (let i = w - 1; i >= 0; i--) {
    for (let j = h - 1; j >= 0; j--) {
      const k = i * h + j;
      let v = d[k];
      if (v === 0) continue;
      if (i < w - 1) {
        const a = (i + 1) * h + j;
        if (d[a] + 1 < v) v = d[a] + 1;
        if (j > 0 && d[a - 1] + 1 < v) v = d[a - 1] + 1;
        if (j < h - 1 && d[a + 1] + 1 < v) v = d[a + 1] + 1;
      }
      if (j < h - 1 && d[k + 1] + 1 < v) v = d[k + 1] + 1;
      d[k] = v;
    }
  }
  return d;
}

function bboxOf(set) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const k of set) {
    const x = P.ckX(k), z = P.ckZ(k);
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (z < z0) z0 = z; if (z > z1) z1 = z;
  }
  return set.size ? { x0, x1, z0, z1 } : null;
}

// Abstandsfeld zu einer Zellmenge über das Hüllrechteck von regionSet (Vorgabe set) + pad: { at(x, z) }
function feld(set, pad, regionSet) {
  const bb = bboxOf(regionSet || set);
  if (!bb) return { at: () => Infinity };
  const x0 = bb.x0 - pad, z0 = bb.z0 - pad, w = bb.x1 - bb.x0 + 1 + 2 * pad, h = bb.z1 - bb.z0 + 1 + 2 * pad;
  const d = chessDist(x0, z0, w, h, (x, z) => set.has(P.ck(x, z)));
  return {
    at(x, z) {
      const i = x - x0, j = z - z0;
      if (i < 0 || j < 0 || i >= w || j >= h) return Infinity;
      return d[i * h + j];
    }
  };
}

const keysSorted = (set) => [...set].sort((a, b) => a - b);

// ------------------------------------------------------------------ Maske
class Maske {
  /**
   * Intern; besser ausGebaeude/vonZellen. cells: Set von Zellschlüsseln; opts: fill (Fläche mit gefüllten
   * Löchern), rings (Außenringe für kanten), holes (Lochzellen je Loch).
   */
  constructor(cells, opts = {}) {
    this._set = cells;
    this._fill = opts.fill || cells;
    this._rings = opts.rings || [];
    this._holes = opts.holes || [];
    this._cache = {};
  }

  /** Maske aus Zellenliste [[x, z], ...]. */
  static vonZellen(list) {
    return new Maske(new Set(list.map((c) => P.ck(c[0], c[1]))));
  }

  /**
   * Maske der OSM-Polygone (Außenring minus Löcher, Rand innen).
   * opts: { daten?: Ordner|{gebaeude}|Array, xMin?, xMax?, abzug?: Maske[] }
   */
  static ausGebaeude(ids, opts = {}) {
    const byId = opts.quelle || ladeGebaeude(opts.daten);
    const cells = new Set(), fill = new Set(), rings = [], holes = [];
    const xOk0 = (x) => !((opts.xMin !== undefined && x < opts.xMin) || (opts.xMax !== undefined && x > opts.xMax));
    const zOk = (z) => !((opts.zMin !== undefined && z < opts.zMin) || (opts.zMax !== undefined && z > opts.zMax));
    for (const id of ids) {
      const g = byId.get(id);
      if (!g) throw new Error(`Maske.ausGebaeude: unbekannte ${opts.quelle ? 'Flächen' : 'Gebäude'}-ID ${id}`);
      const poly = P.normalize(g.polygon);
      for (const c of P.cellsOf(poly)) if (xOk0(c[0]) && zOk(c[1])) cells.add(P.ck(c[0], c[1]));
      for (const c of P.cellsOf({ aussen: poly.aussen, loecher: [] })) if (xOk0(c[0]) && zOk(c[1])) fill.add(P.ck(c[0], c[1]));
      for (const r of poly.aussen) rings.push(r);
      for (const hr of poly.loecher) {
        const hs = new Set();
        const b = P.bbox({ aussen: [hr] });
        for (let x = Math.ceil(b.x0); x <= Math.floor(b.x1); x++) {
          if (!xOk0(x)) continue;
          for (let z = Math.ceil(b.z0); z <= Math.floor(b.z1); z++) {
            if (zOk(z) && P.inRing(hr, x, z) === 1 && fill.has(P.ck(x, z))) hs.add(P.ck(x, z));
          }
        }
        holes.push(hs);
      }
    }
    for (const k of cells) fill.add(k);
    let m = new Maske(cells, { fill, rings, holes });
    if (opts.abzug && opts.abzug.length) m = m.minus(...opts.abzug);
    return m;
  }

  /** Maske aus Flächen von flaechen.json (z. B. Brücken), sonst wie ausGebaeude. */
  static ausFlaechen(ids, opts = {}) {
    return Maske.ausGebaeude(ids, { ...opts, quelle: ladeFlaechen(opts.daten) });
  }

  get size() { return this._set.size; }
  has(x, z) { return this._set.has(P.ck(x, z)); }
  /** Innen im Sinne der Fläche: Maskenzelle oder Lochzelle (Hof). */
  innen(x, z) { return this._fill.has(P.ck(x, z)); }
  /** Zellen [[x, z], ...] sortiert nach x, dann z. */
  get cells() {
    if (!this._cache.cells) this._cache.cells = keysSorted(this._set).map((k) => [P.ckX(k), P.ckZ(k)]);
    return this._cache.cells;
  }
  get bbox() {
    return bboxOf(this._set) || { x0: 0, x1: -1, z0: 0, z1: -1 };
  }

  union(...others) {
    const cells = new Set(this._set), fill = new Set(this._fill);
    const rings = this._rings.slice(), holes = this._holes.slice();
    for (const o of others) {
      for (const k of o._set) cells.add(k);
      for (const k of o._fill) fill.add(k);
      rings.push(...o._rings);
      holes.push(...o._holes);
    }
    return new Maske(cells, { fill, rings, holes });
  }

  /** Differenz: Zellen und Fläche der anderen Masken werden entfernt; die Außenringe bleiben die dieser Maske. */
  minus(...others) {
    const cells = new Set(this._set), fill = new Set(this._fill);
    for (const o of others) {
      for (const k of o._fill) { fill.delete(k); cells.delete(k); }
      for (const k of o._set) { fill.delete(k); cells.delete(k); }
    }
    for (const k of cells) fill.add(k);
    const holes = this._holes.map((h) => new Set([...h].filter((k) => fill.has(k) && !cells.has(k))));
    return new Maske(cells, { fill, rings: this._rings, holes });
  }

  /**
   * Chebyshev-Abstand zur nächsten Zelle außerhalb des Außenrings (Randzelle = 1). Löcher zählen als innen.
   * 0 für Zellen außerhalb der Maske (auch Lochzellen).
   */
  d8(x, z) {
    if (!this._set.has(P.ck(x, z))) return 0;
    if (!this._cache.d8) {
      const fill = this._fill;
      const bb = bboxOf(fill);
      const x0 = bb.x0 - 1, z0 = bb.z0 - 1, w = bb.x1 - bb.x0 + 3, h = bb.z1 - bb.z0 + 3;
      const d = chessDist(x0, z0, w, h, (a, b) => !fill.has(P.ck(a, b)));
      this._cache.d8 = (a, b) => d[(a - x0) * h + (b - z0)];
    }
    return this._cache.d8(x, z);
  }

  /** Lochmasken, ein Eintrag je Polygonloch in der Reihenfolge von gebaeude.json. */
  loecher() {
    if (!this._cache.loecher) this._cache.loecher = this._holes.map((h) => new Maske(new Set(h)));
    return this._cache.loecher;
  }

  /** Chebyshev-Abstand zum Loch i (erste Zelle außerhalb = 1, im Loch 0); Infinity außerhalb des Hüllrechtecks +1. */
  dLoch(i, x, z) {
    if (!this._holes[i]) throw new RangeError(`Maske.dLoch: kein Loch ${i} (vorhanden: ${this._holes.length})`);
    const c = this._cache.dLoch || (this._cache.dLoch = []);
    if (!c[i]) c[i] = feld(this._holes[i], 1, this._fill);
    const d = c[i].at(x, z);
    return d >= INF ? Infinity : d;
  }

  /** Für Zellen außerhalb der Maske: Chebyshev-Abstand zur Maske (1 = angrenzend); 0 in der Maske; Infinity jenseits 32. */
  dAussen(x, z) {
    if (!this._cache.aussen) this._cache.aussen = feld(this._set, AUSSEN_REICHWEITE);
    const d = this._cache.aussen.at(x, z);
    return d >= INF ? Infinity : d;
  }

  /** Außenring-Kanten { i, a, b, L, rahmen } mit w nach innen; i zählt über alle Außenringe (Index wie poly.edges). */
  kanten() {
    if (this._cache.kanten) return this._cache.kanten;
    const list = P.edges({ aussen: this._rings, loecher: [] });
    this._cache.polyKanten = list;
    this._cache.kanten = list.map((e) => {
      const ux = e.dir[0], uz = e.dir[1];
      const wx = -e.out[0], wz = -e.out[1];                   // nach innen
      const drehung = Math.abs(ux * wz - uz * wx - 1) < 1e-9;  // Rechtssystem: reine Drehung
      const rahmen = drehung
        ? makeRahmen({ ox: e.a[0], oz: e.a[1], thetaDeg: (Math.atan2(uz, ux) * 180) / Math.PI })
        : rahmenAusBasis(e.a[0], e.a[1], ux, uz, wx, wz);      // gegenläufiger Ring: gespiegelt
      return { i: e.index, a: { x: e.a[0], z: e.a[1] }, b: { x: e.b[0], z: e.b[1] }, L: e.len, rahmen };
    });
    return this._cache.kanten;
  }

  /** Index der Außenring-Kante mit kleinstem Abstand zur Zellmitte (Gleichstand: kleinster Index). */
  naechsteKante(x, z) {
    this.kanten();
    let best = -1, bd = Infinity;
    for (const e of this._cache.polyKanten) {
      const d = P.relToEdge(e, x, z).d;
      if (d < bd) { bd = d; best = e.index; }
    }
    return best;
  }

  _chebyMenge(set, k, aussen) {
    const bb = bboxOf(set);
    if (!bb) return new Set();
    const pad = aussen ? k : 1;
    const x0 = bb.x0 - pad, z0 = bb.z0 - pad, w = bb.x1 - bb.x0 + 1 + 2 * pad, h = bb.z1 - bb.z0 + 1 + 2 * pad;
    const out = new Set();
    if (aussen) {
      const d = chessDist(x0, z0, w, h, (x, z) => set.has(P.ck(x, z)));
      for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) if (d[i * h + j] <= k) out.add(P.ck(x0 + i, z0 + j));
    } else {
      const d = chessDist(x0, z0, w, h, (x, z) => !set.has(P.ck(x, z)));
      for (const key of set) if (d[(P.ckX(key) - x0) * h + (P.ckZ(key) - z0)] > k) out.add(key);
    }
    return out;
  }

  /** Aufweitung um k Zellen (Chebyshev). */
  dilate(k) {
    const cells = this._chebyMenge(this._set, k, true);
    const fill = this._chebyMenge(this._fill, k, true);
    for (const c of cells) fill.add(c);
    return new Maske(cells, { fill });
  }

  /** Verkleinerung um k Zellen (Chebyshev). */
  erode(k) {
    const cells = this._chebyMenge(this._set, k, false);
    const fill = this._chebyMenge(this._fill, k, false);
    for (const c of cells) fill.add(c);
    return new Maske(cells, { fill });
  }

  /**
   * Maskenzellen [x, z], deren Zellmitte im Rahmen die Bedingung praedikat(u, w, x, z) erfüllt
   * (Rasterung durch Rückabbildung).
   */
  lokal(rahmen, praedikat) {
    const out = [];
    for (const c of this.cells) {
      const l = rahmen.toLocal(c[0], c[1]);
      if (praedikat(l.u, l.w, c[0], c[1])) out.push(c);
    }
    return out;
  }
}

module.exports = { Maske, ladeGebaeude, ladeFlaechen, DEFAULT_DATEN, AUSSEN_REICHWEITE };
