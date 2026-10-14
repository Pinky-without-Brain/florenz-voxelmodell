'use strict';
// Modul 6 – Dächer (Katalog §7): Walmdach über der Westzeile und über dem Südcluster der Ostzeile (ohne Korridor),
// auf der Decke ab Lage 16, Anstieg 0,4 je Block ins Gebäude, höchstens 3; massiv (kein Dachraum ohne Zugang).
const G = require('./_pv.js');

module.exports = {
  module: 6,
  build(ctx) {
    const B = G.belegung(ctx);
    const dach = (id, pred, d) => {
      const w = ctx.part(id);
      for (const c of G.ZELLEN) {
        if (!pred(c)) continue;
        const h = 16 + Math.min(3, Math.floor(0.4 * (d(c) - 1)));
        for (let L = 16; L <= h; L++) B.setL(w, c, L, G.T.dach);
      }
    };
    dach('dach_west', (c) => c.W, (c) => c.dW);
    dach('dach_ost_sued', (c) => c.E && !c.K, (c) => c.dE);
  }
};
