'use strict';
// Modul 2 – Seitenflügel (Ali, Katalog §3): Wandband dz ≤ 5, Lage 1..20; sechs offene Arkaden je Flügel zur Piazza
// (Archivolte), Fenster 5 × 9 an den übrigen Außenkanten, Tor 7 × 7 für den Korridor in der Ostwand des Ostflügels.
const G = require('./_pi.js');
const RA = require('./_raum.js');
const ARKADEN_W = [-8, -24, -40, -56, -72, -88];

// Arkadenseite: Innenkante zur Piazza (West: u ≈ 1,1, Ost: u ≈ 343), w −96..−4
const arkadenSeite = (c) => c.zone === 'F' && c.w < -3 && c.w > -96 && ((c.u < 2 && c.u >= -5) || (c.u > 342 && c.u <= 349));
const korridorTor = (c) => c.zone === 'F' && c.u >= 370 && c.w >= -32 && c.w < -23;

module.exports = {
  module: 2,
  arkadenSeite,
  ARKADEN_W,
  build(ctx) {
    const { T, MATERIAL } = G;
    const fl = MATERIAL.filter((c) => c.zone === 'F' && c.dz <= 5);
    const plan = G.bauplan(ctx);
    for (const c of fl) {
      const ark = arkadenSeite(c);
      const w0 = ARKADEN_W.reduce((a, b) => (Math.abs(c.w - b) < Math.abs(c.w - a) ? b : a));
      for (let L = 1; L <= G.F_TOP; L++) {
        if (RA.tuer(c, L)) { plan.luftL(c, L); continue; }
        if (ark) {
          const d = c.w - w0;
          if (G.bogenOffen(d, L, 9, 1, 8)) { plan.luftL(c, L, 'arkade'); continue; }
          if (G.bogenRahmen(d, L, 9, 1, 8, 1)) { plan.festL(c.u < 170 ? 'ali_west' : 'ali_ost', c, L, T.forte); continue; }
        }
        if (korridorTor(c)) {
          if (L <= 7 && c.w >= -31 && c.w < -24) { plan.luftL(c, L, 'tor'); continue; }
          if (L <= 8) { plan.festL(c.u < 170 ? 'ali_west' : 'ali_ost', c, L, T.forte); continue; }
        }
        if (!ark && c.d8 <= 5) {
          const op = G.aussenOeffnung(c, L);
          if (op === 'glas') { plan.festL(c.u < 170 ? 'ali_west' : 'ali_ost', c, L, T.glas); continue; }
          if (op === 'rahmen') { plan.festL(c.u < 170 ? 'ali_west' : 'ali_ost', c, L, T.forte); continue; }
          if (op === 'luft') { plan.laibungL(c, L); continue; }
        }
        if (c.d8 === 1 && c.dz === 1) {
          const ak = G.aussenKante(c);
          if (ak && G.fuge(c, L, ak.s, false)) { plan.luftL(c, L, 'relief'); continue; }
        }
        plan.festL(c.u < 170 ? 'ali_west' : 'ali_ost', c, L, T.rustika);
      }
    }
    plan.bauen();
  }
};
