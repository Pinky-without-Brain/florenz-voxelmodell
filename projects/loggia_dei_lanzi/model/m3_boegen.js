'use strict';
// Modul 3 – Bögen und Archivolten. Katalog §4. Die Wände (Modul 2) haben die Ringzellen ausgespart.
// B3: Die Bogenöffnungen der Front und des Seitenbogens sind als Arkaden deklariert (R14).
const G = require('./_gemeinsam.js');

module.exports = {
  module: 3,
  build(ctx) {
    const { T, ZELLEN } = G;
    const B = G.belegung(ctx);
    const frei = (c, L) => B.frei(c, L);

    // 1) Frontarchivolten: Ring R 9..11,5 um (u_m; Lage 13), Lage >= 14, w 0..2 (Front) und w 3..5 (Gurt innen).
    //    Die Schlusssteine (Teil 3) sind Details und werden hier ausgespart.
    const av = ctx.part('archivolten_front');
    for (const c of ZELLEN) {
      if (c.iw > 5) continue;
      for (let L = G.KAEMPFER + 1; L <= 24; L++) {
        if (G.archivolteFront(c.iu, c.iw, L) && !G.schlussstein(c.iu, c.iw, L) && frei(c, L)) B.setL(av, c, L, T.serena);
      }
    }
    // Arkaden der Front: Luft der drei Bogenöffnungen in den vordersten drei Reihen (Rohindex w 0..2), Lage 1..22
    const front = [];
    for (const c of ZELLEN) {
      if (c.rw > 2 || G.bogenIndex(c.iu) < 0) continue;
      for (let L = 1; L <= 22; L++) if (L < 3 || G.bogenLuft(c.iu, L)) front.push({ x: c.x, y: G.lageY(L), z: c.z });
    }
    ctx.oeffnung(front, 'arkade');

    // 2) Archivolte des Seitenbogens (Ost): Ring R 8..10,5 um (w 13,5; Lage 13), u 36..38, Lage >= 14.
    const ao = ctx.part('archivolte_ost');
    for (const c of ZELLEN) {
      if (c.iu < 36) continue;
      for (let L = G.KAEMPFER + 1; L <= 24; L++) {
        if (G.archivolteOst(c.iu, c.iw, L) && frei(c, L)) B.setL(ao, c, L, T.serena);
      }
    }
    // Seitenbogen Ost: Luft der Öffnung u 36..38, w 6..21, Lage 1..21
    const ost = [];
    for (const c of ZELLEN) {
      if (c.iu < 36 || c.rw < G.SEITENBOGEN.w0 || c.rw > G.SEITENBOGEN.w1) continue;
      for (let L = 1; L <= 21; L++) if (L < 3 || G.seitenbogenLuft(c.iu, c.rw, L)) ost.push({ x: c.x, y: G.lageY(L), z: c.z });
    }
    ctx.oeffnung(ost, 'arkade');

    // 3) Schlusssteine: je Bogen 2 breit x 2 hoch (Lage 23..24), Front w 0..2.
    const ss = ctx.part('schlusssteine');
    for (const c of ZELLEN) {
      for (let L = 23; L <= 24; L++) {
        if (G.schlussstein(c.iu, c.iw, L) && frei(c, L)) B.setL(ss, c, L, T.ornament);
      }
    }
  }
};
