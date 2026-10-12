'use strict';
// Gemeinsame Ausgabe der Bauteile aus dem Belegungsplan in die Module.
const { cells } = require('./_plan.js');

/** emit(ctx, ['bauteil', ...]): registriert die Bauteile in dieser Reihenfolge und füllt sie je Material. */
function emit(ctx, names) {
  for (const name of names) {
    const groups = cells(name);
    const n = groups.reduce((a, g) => a + g.cells.length, 0);
    if (!n) continue;                      // leere Bauteile werden nicht angelegt
    const w = ctx.part(name);
    for (const g of groups) w.fill(g.cells, g.mat);
  }
}

module.exports = { emit };
