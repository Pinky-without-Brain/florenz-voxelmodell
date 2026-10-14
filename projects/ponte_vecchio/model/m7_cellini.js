'use strict';
// Modul 7 – Cellini-Brunnen auf der Westfreifläche (Katalog §8, vereinfachte Blockfigur, nicht nach Vorbild).
const G = require('./_pv.js');

module.exports = {
  module: 7,
  build(ctx) {
    const B = G.belegung(ctx);
    const MU = 102, MW = 13;
    const im = G.ZELLEN.filter((c) => Math.abs(c.u - MU) < 3.5 && Math.abs(c.w - MW) < 3.5);
    const br = ctx.part('cellini_brunnen');
    const ba = ctx.part('cellini_buste');
    const unz = [];
    for (const c of im) {
      const du = Math.abs(c.u - MU), dw = Math.abs(c.w - MW);
      if (du < 1.5 && dw < 1.5) {
        for (let L = 1; L <= 5; L++) B.setL(br, c, L, G.T.marmor);
        if (du < 1 && dw < 1) for (let L = 6; L <= 8; L++) B.setL(ba, c, L, G.T.bronze);
        for (let L = 6; L <= 9; L++) unz.push({ x: c.x, y: G.Y(L), z: c.z });
      } else if (du >= 2.5 || dw >= 2.5) {
        B.setL(br, c, 1, G.T.marmor); B.setL(br, c, 2, G.T.marmor);
      } else {
        B.setL(br, c, 1, G.T.wasser);
      }
    }
    ctx.unzugaenglich(unz, 'Sockel und Büste des Cellini-Brunnens: Kunstwerk, kein Standplatz');
  }
};
