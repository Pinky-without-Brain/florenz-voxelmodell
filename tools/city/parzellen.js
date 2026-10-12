'use strict';
// Parzellenraster (V3): Jede Zelle gehört genau einem Gebäude. Zellen, die zwei Grundrisse beanspruchen
// (gemeinsame Brandwand, Überlappung), gehen an das Gebäude mit der kleineren ID.

const P = require('./poly.js');

// Gebäude-ID "w123"/"r45" -> Ordnung: erst die Zahl, bei Gleichheit der Buchstabe
function idParts(id) {
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
  /** buildings: Array von { id, polygon }. */
  constructor(buildings) {
    this._owner = new Map();       // Zellschlüssel -> ID
    this._cells = new Map();       // ID -> [[x, z], ...] (sortiert nach x, z)
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
          if (o !== undefined && o !== id) { adj.get(id).add(o); adj.get(o).add(id); }
        }
      }
    }
    this._adj = adj;
    return adj;
  }
}

function makeParzellen(buildings) { return new Parzellen(buildings); }

module.exports = { Parzellen, makeParzellen, compareIds, N8 };
