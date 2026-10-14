'use strict';
// Modul 3 – Läden West und Terrasse (Katalog §4). Die Brüstung der Westfreifläche lässt die Mitte (Blick) und den
// Cellini-Brunnen (Modul 7) frei.
const G = require('./_pv.js');
const { bauLaeden } = require('./_laeden.js');

module.exports = {
  module: 3,
  build(ctx) {
    bauLaeden(ctx, 'west');
    const B = G.belegung(ctx);
    const br = ctx.part('terrasse_bruestung');
    for (const c of G.ZELLEN) {
      if (!c.B || c.L || c.K || c.w <= G.W_WEST || c.u < G.TERRASSE[0] || c.u >= G.TERRASSE[1]) continue;
      if (G.MPV.d8(c.x, c.z) !== 1 || Math.abs(c.u - 102) < 4.5) continue;
      for (const L of [1, 2]) B.setL(br, c, L, G.T.forte);
    }
  }
};
