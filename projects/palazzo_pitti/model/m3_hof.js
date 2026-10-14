'use strict';
// Modul 3 – Ammannati-Hof und Lichthöfe (Katalog §4): Hofbänder dH ≤ t, Blendarkaden (Nischen Tiefe 2) an drei
// Seiten des Ammannati-Hofes, Fenster, Hof-Tor 9 × 12 in der Vorderseite bei u 173 (offen, deklariert), Hofgesims.
const G = require('./_pi.js');
const RA = require('./_raum.js');

module.exports = {
  module: 3,
  build(ctx) {
    const B = G.belegung(ctx);
    const { T, MATERIAL } = G;
    const band = MATERIAL.filter((c) => c.dH <= 5 && c.dH <= c.dz);
    const plan = G.bauplan(ctx);
    for (const c of band) {
      const hk = G.hofKante(c);
      const vorne = c.hofSeite === 2 && hk && hk.seite === 'w0';
      for (let L = 1; L <= G.topVon(c); L++) {
        if (!G.istHofband(c, L)) continue;
        const teil = c.hofSeite !== 2 ? 'lichthoefe' : L <= 25 ? 'hof_waende_eg' : 'hof_waende_og';
        if (RA.tuer(c, L)) { plan.luftL(c, L); continue; }
        if (vorne) {
          const du = c.u - G.PORTAL_U;
          if (G.bogenOffen(du, L, 9, 1, 8)) { plan.luftL(c, L, 'tor'); continue; }
          if (G.bogenRahmen(du, L, 9, 1, 8, 1)) { plan.festL(teil, c, L, T.forte); continue; }
        }
        const op = G.hofOeffnung(c, L);
        if (op === 'nische') { plan.luftL(c, L, 'loggia'); continue; }
        if (op === 'luft') { plan.laibungL(c, L); continue; }
        if (op === 'rahmen') { plan.festL(teil, c, L, T.forte); continue; }
        if (op === 'glas') { plan.festL(teil, c, L, T.glas); continue; }
        if (c.dH === 1 && hk && G.fuge(c, L, hk.s, true)) { plan.luftL(c, L, 'relief'); continue; }
        plan.festL(teil, c, L, T.rustika);
      }
    }
    plan.bauen();
    const ge = ctx.part('hof_gesims');
    for (const L of G.H_GESIMS) for (const c of band) if (c.zone === 'H' && c.dH <= 4) B.setL(ge, c, L, T.forte);
  }
};
