'use strict';
// Modul 3 – Bögen und Archivolten. Katalog §4. Die Wände (Modul 2) haben die Ringzellen ausgespart.
const G = require('./_gemeinsam.js');

module.exports = {
  module: 3,
  build(ctx) {
    const { T, ZELLEN } = G;
    const frei = (c, L) => !ctx.grid.has(c.x, G.lageY(L), c.z);

    // 1) Frontarchivolten: Ring R 9..11,5 um (u_m; Lage 13), Lage >= 14, w 0..2 (Front) und w 3..5 (Gurt innen).
    //    Die Schlusssteine (Teil 3) sind Details und werden hier ausgespart.
    const av = ctx.part('archivolten_front');
    for (const c of ZELLEN) {
      if (c.iw > 5) continue;
      for (let L = G.KAEMPFER + 1; L <= 24; L++) {
        if (G.archivolteFront(c.iu, c.iw, L) && !G.schlussstein(c.iu, c.iw, L) && frei(c, L)) G.setL(av, c, L, T.serena);
      }
    }

    // 2) Archivolte des Seitenbogens (Ost): Ring R 8..10,5 um (w 13,5; Lage 13), u 36..38, Lage >= 14.
    const ao = ctx.part('archivolte_ost');
    for (const c of ZELLEN) {
      if (c.iu < 36) continue;
      for (let L = G.KAEMPFER + 1; L <= 24; L++) {
        if (G.archivolteOst(c.iu, c.iw, L) && frei(c, L)) G.setL(ao, c, L, T.serena);
      }
    }

    // 3) Schlusssteine: je Bogen 2 breit x 2 hoch (Lage 23..24), Front w 0..2.
    const ss = ctx.part('schlusssteine');
    for (const c of ZELLEN) {
      for (let L = 23; L <= 24; L++) {
        if (G.schlussstein(c.iu, c.iw, L) && frei(c, L)) G.setL(ss, c, L, T.ornament);
      }
    }
  }
};
