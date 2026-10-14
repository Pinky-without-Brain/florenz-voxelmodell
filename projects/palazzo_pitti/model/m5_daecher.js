'use strict';
// Modul 5 – Dächer (Katalog §6): Walmdach über H und W (Traufe Lage 77 bzw. 53, Anstieg 0,4 je Zelle ins Innere,
// höchstens 6), massiv von der obersten Decke bis zur Dachfläche (kein Dachraum ohne Zugang, wie beim Ponte Vecchio);
// flaches Dach der Flügel Lage 21..22 (Dachterrasse).
const G = require('./_pi.js');
const RA = require('./_raum.js');

module.exports = {
  module: 5,
  build(ctx) {
    const B = G.belegung(ctx);
    const { T, MATERIAL } = G;
    const dh = ctx.part('dach_haupt');
    for (const c of MATERIAL) {
      if (c.zone === 'F') continue;
      const tr = c.zone === 'W' ? G.W_TRAUFE : G.H_TRAUFE;
      const top = tr + Math.min(6, Math.floor(0.4 * (c.dz - 1)));
      const von = (c.zone === 'W' ? G.W_TOP : G.H_TOP) + 1;
      for (let L = von; L <= top; L++) B.setL(dh, c, L, T.dach);
    }
    const da = ctx.part('dach_ali');
    for (const c of MATERIAL) {
      if (c.zone !== 'F') continue;
      for (const L of G.F_DACH) if (!RA.ausgespart(c.x, G.Y(L), c.z) && !RA.istLicht(c.x, G.Y(L), c.z)) B.setL(da, c, L, T.dach);
    }
  }
};
