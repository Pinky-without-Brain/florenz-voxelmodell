'use strict';
// Diagnose: Blockzahlen je Bauteil von Modul 1
const { buildWorld } = require('../model/world.js');

const t0 = Date.now();
const w = buildWorld({ modules: [1] });
console.log('Fehler:', w.errors.length ? w.errors : 'keine', '| Warnungen:', w.warnings);
let total = 0;
for (const [part, n] of w.grid.countsBy('part')) {
  console.log(part.padEnd(26), String(n).padStart(8));
  total += n;
}
console.log('Summe'.padEnd(26), String(total).padStart(8), `(${Date.now() - t0} ms)`);
console.log(w.grid.bounds());
