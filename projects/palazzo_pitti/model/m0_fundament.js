'use strict';
// Modul 0 – Fundament und Bodenplatte (Katalog §1). Fundament von groundTopY + 1 bis Y 82, Platte Y 83 (Lage 0).
const G = require('./_pi.js');

module.exports = {
  module: 0,
  build(ctx) {
    const B = G.belegung(ctx);
    const { T, ZELLEN } = G;
    const fu = ctx.part('fundament');
    for (const c of ZELLEN) {
      const aussen = c.hof < 0 && c.d8 <= 2;
      for (let y = c.gt + 1; y <= G.Y(-1); y++) B.set(fu, c.x, y, c.z, aussen ? T.rustika : T.bruch);
    }
    const pl = ctx.part('bodenplatte');
    for (const c of ZELLEN) B.setL(pl, c, 0, c.hof >= 0 ? T.pflaster : c.dz <= 5 ? T.bruch : T.serena);
  }
};
