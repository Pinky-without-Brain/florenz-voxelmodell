'use strict';
// Parzellenraster (V3): Jede Zelle gehört genau einem Gebäude. Zellen, die zwei Grundrisse beanspruchen
// (gemeinsame Brandwand, Überlappung), gehen an das Gebäude mit der kleineren ID.

const P = require('./poly.js');

// Wahrzeichen-Vorrang (W0): Zellen eines Wahrzeichen-Polygons gehören "WZ:<projekt>", nie einem Haus
const VORRANG_PREFIX = 'WZ:';
const istVorrangId = (id) => typeof id === 'string' && id.startsWith(VORRANG_PREFIX);

// Gebäude-ID "w123"/"r45" -> Ordnung: erst die Zahl, bei Gleichheit der Buchstabe; Vorrang-Eigner zählen als kleinste IDs
function idParts(id) {
  if (istVorrangId(id)) return [-Infinity, id];
  const m = /^([a-z]*)(\d+)$/.exec(id);
  return m ? [Number(m[2]), m[1]] : [Infinity, id];
}
function compareIds(a, b) {
  if (a === b) return 0;
  const [na, pa] = idParts(a), [nb, pb] = idParts(b);
  if (na !== nb) return na < nb ? -1 : 1;
  return pa < pb ? -1 : pa > pb ? 1 : 0;
}

const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

class Parzellen {
  /**
   * buildings: Array von { id, polygon }.
   * opts.vorrang: [{ id, polygon, projekt }] werden zuerst gerastert; ihre Zellen gehören "WZ:<projekt>" und
   * keinem Haus (owner() liefert diesen Eigner, ids/cellsOf kennen ihn nicht).
   */
  constructor(buildings, opts = {}) {
    this._owner = new Map();       // Zellschlüssel -> ID
    this._cells = new Map();       // ID -> [[x, z], ...] (sortiert nach x, z)
    this._vorrang = new Map();     // "WZ:<projekt>" -> [[x, z], ...]
    const vor = (opts.vorrang || []).slice().sort((a, b) => compareIds(a.id, b.id));
    for (const v of vor) {
      const eigner = VORRANG_PREFIX + v.projekt;
      let list = this._vorrang.get(eigner);
      if (!list) this._vorrang.set(eigner, list = []);
      for (const c of P.cellsOf(v.polygon)) {
        const k = P.ck(c[0], c[1]);
        if (this._owner.has(k)) continue;
        this._owner.set(k, eigner);
        list.push(c);
      }
    }
    const sorted = buildings.slice().sort((a, b) => compareIds(a.id, b.id));
    for (const g of sorted) {
      const mine = [];
      for (const c of P.cellsOf(g.polygon)) {
        const k = P.ck(c[0], c[1]);
        if (this._owner.has(k)) continue; // kleinere ID war zuerst da
        this._owner.set(k, g.id);
        mine.push(c);
      }
      this._cells.set(g.id, mine);
    }
    this._adj = null;
  }

  has(id) { return this._cells.has(id); }
  get ids() { return [...this._cells.keys()]; }
  cellsOf(id) { return this._cells.get(id) || []; }
  /** Ist die Zelle durch ein Wahrzeichen belegt? */
  istVorrang(x, z) { return istVorrangId(this._owner.get(P.ck(x, z))); }
  /** Zellen eines Vorrang-Eigners "WZ:<projekt>". */
  vorrangZellen(eigner) { return this._vorrang.get(eigner) || []; }
  owner(x, z) { const o = this._owner.get(P.ck(x, z)); return o === undefined ? null : o; }

  /** Nachbarschaft: Gebäude, die mit einer Zelle an eine Zelle des anderen grenzen (8er-Nachbarschaft). */
  adjazenz() {
    if (this._adj) return this._adj;
    const adj = new Map();
    for (const id of this._cells.keys()) adj.set(id, new Set());
    for (const [id, cells] of this._cells) {
      for (const [x, z] of cells) {
        for (const [dx, dz] of N8) {
          const o = this._owner.get(P.ck(x + dx, z + dz));
          if (o !== undefined && o !== id && !istVorrangId(o)) { adj.get(id).add(o); adj.get(o).add(id); }
        }
      }
    }
    this._adj = adj;
    return adj;
  }
}

function makeParzellen(buildings, opts) { return new Parzellen(buildings, opts); }

module.exports = { Parzellen, makeParzellen, compareIds, istVorrangId, VORRANG_PREFIX, N8 };
