'use strict';
// Modul 0 – Boden: Bodenplatte (Y 67) und Front-Podest. Katalog §1.
const G = require('./_gemeinsam.js');

module.exports = {
  module: 0,
  build(ctx) {
    const { T, ZELLEN } = G;

    // Kein Fundament nötig (Katalog §0.4): groundTopY >= 66 in der ganzen Maske.
    const fund = G.WZ.fundamentZellen(G.MASKE, G.BODEN_Y);
    if (fund.length) {
      const f = ctx.part('fundament');
      for (const [x, y, z] of fund) f.set(x, y, z, T.bruch);
    }

    // 1) Bodenplatte: ganz M_LL, Schachbrett 6 x 6 (u, w) aus Pflaster und Pietra serena.
    const platte = ctx.part('bodenplatte');
    for (const c of ZELLEN) {
      const feld = (Math.floor(c.ru / 6) + Math.floor(c.rw / 6)) & 1;
      G.setL(platte, c, 0, feld ? T.serena : T.pflaster);
    }

    // 2) Podest: Lage 1, w 0..1 unter den drei Bogenöffnungen (zweite Stufe).
    const podest = ctx.part('podest_front');
    for (const c of ZELLEN) {
      if (c.iw <= 1 && G.bogenIndex(c.iu) >= 0) G.setL(podest, c, 1, T.serena);
    }
  }
};
