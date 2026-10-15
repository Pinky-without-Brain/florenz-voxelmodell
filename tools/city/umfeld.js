'use strict';
// Straßen, Plätze und Wasser aus flaechen.json: Punktabfrage und nächster Straßenname (V3, Hausgenerator).

const P = require('./poly.js');

const BUCKET = 128;
const KINDS = [['plaetze', 'platz'], ['strassen', 'strasse'], ['bruecken', 'strasse'], ['wasser', 'wasser']];

class Umfeld {
  constructor(flaechen) {
    this.polys = [];
    this.buckets = new Map();
    for (const [key, klasse] of KINDS) {
      for (const f of flaechen[key] || []) {
        if (!f.polygon) continue;
        const poly = P.normalize(f.polygon);
        if (!poly.aussen.length) continue;
        const bb = P.bbox(poly);
        const rec = { klasse, name: f.name || null, poly, bb, id: f.id };
        const i = this.polys.push(rec) - 1;
        for (let bx = Math.floor(bb.x0 / BUCKET); bx <= Math.floor(bb.x1 / BUCKET); bx++) {
          for (let bz = Math.floor(bb.z0 / BUCKET); bz <= Math.floor(bb.z1 / BUCKET); bz++) {
            const k = bx + ',' + bz;
            let l = this.buckets.get(k);
            if (!l) this.buckets.set(k, l = []);
            l.push(i);
          }
        }
      }
    }
  }

  _near(x, z, r) {
    const out = new Set();
    for (let bx = Math.floor((x - r) / BUCKET); bx <= Math.floor((x + r) / BUCKET); bx++) {
      for (let bz = Math.floor((z - r) / BUCKET); bz <= Math.floor((z + r) / BUCKET); bz++) {
        const l = this.buckets.get(bx + ',' + bz);
        if (l) for (const i of l) out.add(i);
      }
    }
    return [...out].sort((a, b) => a - b);
  }

  /** 'platz' | 'strasse' | 'wasser' | null (Vorrang in dieser Reihenfolge) */
  klasse(x, z) {
    let best = null;
    const rank = { platz: 3, strasse: 2, wasser: 1 };
    for (const i of this._near(x, z, 0)) {
      const r = this.polys[i];
      if (x < r.bb.x0 || x > r.bb.x1 || z < r.bb.z0 || z > r.bb.z1) continue;
      if (P.contains(r.poly, x, z) && (!best || rank[r.klasse] > rank[best])) best = r.klasse;
    }
    return best;
  }

  /** Name der benannten Straße (sonst des Platzes), deren Fläche die Zelle enthält, oder null. */
  nameBei(x, z) {
    let platz = null;
    for (const i of this._near(x, z, 0)) {
      const r = this.polys[i];
      if (!r.name || r.klasse === 'wasser') continue;
      if (x < r.bb.x0 || x > r.bb.x1 || z < r.bb.z0 || z > r.bb.z1 || !P.contains(r.poly, x, z)) continue;
      if (r.klasse === 'strasse') return r.name;
      if (!platz) platz = r.name;
    }
    return platz;
  }

  /** Nächster benannter Straßen- oder Platzname innerhalb maxD Blöcken: { name, d } oder null */
  nearestName(x, z, maxD = 40) {
    let best = null;
    for (const i of this._near(x, z, maxD)) {
      const r = this.polys[i];
      if (!r.name || r.klasse === 'wasser') continue;
      if (x < r.bb.x0 - maxD || x > r.bb.x1 + maxD || z < r.bb.z0 - maxD || z > r.bb.z1 + maxD) continue;
      let d = Infinity;
      if (P.contains(r.poly, x, z)) d = 0;
      else {
        for (const e of (r.edges || (r.edges = P.edges(r.poly)))) { const q = P.relToEdge(e, x, z).d; if (q < d) d = q; }
      }
      if (d <= maxD && (!best || d < best.d - 1e-9 || (Math.abs(d - best.d) <= 1e-9 && r.name < best.name))) {
        best = { name: r.name, d };
      }
    }
    return best;
  }
}

const cache = new WeakMap();
/** Umfeld zu flaechen.json-Daten (oder ein fertiges Umfeld); je Datenobjekt gecacht. */
function umfeldVon(flaechen) {
  if (flaechen instanceof Umfeld) return flaechen;
  if (!flaechen) return new Umfeld({});
  let u = cache.get(flaechen);
  if (!u) cache.set(flaechen, u = new Umfeld(flaechen));
  return u;
}

module.exports = { Umfeld, umfeldVon };
