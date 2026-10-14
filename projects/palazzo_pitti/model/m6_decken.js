'use strict';
// Modul 6 – Decken (Katalog §7): Lage 24..25, 49..50, 73..74 auf H (W: 24..25, 49..50) im Inneren (dz > t),
// ohne Treppenlöcher und Lichter.
const G = require('./_pi.js');
const RA = require('./_raum.js');

module.exports = {
  module: 6,
  build(ctx) {
    const B = G.belegung(ctx);
    const { T, MATERIAL } = G;
    const frei = (c, L) => !RA.ausgespart(c.x, G.Y(L), c.z) && !RA.istLicht(c.x, G.Y(L), c.z) && !RA.ausstattung(c.x, G.Y(L), c.z);
    for (const [id, lagen, zonen] of [['decke_eg', G.DECKEN.eg, ['H', 'W']], ['decke_pn', G.DECKEN.pn, ['H', 'W']], ['decke_og', G.DECKEN.og, ['H']]]) {
      const w = ctx.part(id);
      for (const c of MATERIAL) {
        if (!zonen.includes(c.zone)) continue;
        for (const L of lagen) if (c.dz > G.t(c, L) && frei(c, L)) B.setL(w, c, L, T.serena);
      }
    }
  }
};
