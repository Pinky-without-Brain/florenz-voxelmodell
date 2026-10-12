'use strict';
// Modul 6 – Sockel für Statuen (optional, vereinfacht). Katalog §7. Marmor, auf der Bodenplatte (Lage 1 = Y 68).
const G = require('./_gemeinsam.js');

module.exports = {
  module: 6,
  build(ctx) {
    const { T } = G;
    for (const [id, s] of Object.entries(G.SOCKEL)) {
      const w = ctx.part(id);
      for (const c of G.rechteck(s.u[0], s.u[1], s.w[0], s.w[1])) {
        for (let L = 1; L <= s.h; L++) G.setL(w, c, L, T.weiss);
      }
    }
    G.RUECKWAND_SOCKEL_U.forEach((u, i) => {
      const w = ctx.part(`sockel_rueckwand_${i + 1}`);
      for (const c of G.rechteck(u, u + 1, 19, 20)) for (let L = 1; L <= 2; L++) G.setL(w, c, L, T.weiss);
    });
  }
};
