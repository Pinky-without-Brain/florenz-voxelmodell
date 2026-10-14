'use strict';
// Modul 0 – Gründung (Katalog §1): Pfeiler und Vorköpfe ab Y 47 in den ausgesparten Pfeilerspalten,
// Widerlager Nord und Süd vom Gelände bis Y 62 unter der Fahrbahn und den Läden.
const G = require('./_pv.js');

module.exports = {
  module: 0,
  build(ctx) {
    const B = G.belegung(ctx);
    const { T, ZELLEN } = G;

    // 1 Pfeiler: Tragkörper |w| < 19,5, Y 47..62; Stirnlagen |w| ≥ 17,5 Rustika
    const pf = ctx.part('pfeiler');
    for (const c of ZELLEN) {
      if (!c.B || G.inPfeiler(c.u) < 0 || Math.abs(c.w) >= G.TRAG) continue;
      for (let y = G.PFEILER_FUSS_Y; y <= G.Y(-1); y++) B.set(pf, c.x, y, c.z, Math.abs(c.w) >= G.STIRN ? T.rustika : T.forte);
    }

    // 2 Vorköpfe: dreieckig nach außen (Reihen |w| 20, 21, 22 mit 7, 5, 3 Zellen), Y 47..56
    const vk = ctx.part('vorkoepfe');
    for (const c of ZELLEN) {
      const k = G.inPfeiler(c.u);
      if (k < 0) continue;
      const [a, b] = G.PFEILER[k];
      const aw = Math.abs(c.w);
      const reihe = aw >= 19.5 && aw < 20.5 ? 1 : aw >= 20.5 && aw < 21.5 ? 2 : aw >= 21.5 && aw < 22.5 ? 3 : 0;
      if (!reihe || c.u < a + reihe || c.u >= b - reihe) continue;
      for (let y = G.PFEILER_FUSS_Y; y <= G.Y(-7); y++) B.set(vk, c.x, y, c.z, T.rustika);
    }

    // 3, 4 Widerlager: alle Zellen unter dem Boden Lage 0 an Land (u < 6 bzw. u ≥ 176), vom Gelände bis Y 62
    const widerlager = (id, pred) => {
      const w = ctx.part(id);
      for (const c of ZELLEN) {
        if (c.T || !(c.B || c.E || c.W) || !pred(c)) continue;
        const rand = G.MPV.d8(c.x, c.z) <= 2;
        for (let y = c.gt + 1; y <= G.Y(-1); y++) B.set(w, c.x, y, c.z, rand ? T.rustika : T.mauer);
      }
    };
    widerlager('widerlager_nord', (c) => c.u < G.U_NORD);
    widerlager('widerlager_sued', (c) => c.u >= G.U_SUED);
  }
};
