'use strict';
// Modul 1 – Gewölbe, Fahrbahn und Auskragungen (Katalog §2). Laibung als Kreissegment (Stich 8) über Kämpfer Y 51.
const G = require('./_pv.js');

module.exports = {
  module: 1,
  build(ctx) {
    const B = G.belegung(ctx);
    const { T, ZELLEN } = G;
    const ueberBoegen = ZELLEN.filter((c) => c.B && G.bogenVon(c.u) >= 0 && Math.abs(c.w) < G.TRAG);

    // 1 Stirnwände (Randspalten des Tragkörpers), Quaderverband
    const st = ctx.part('stirnwaende');
    for (const c of ueberBoegen) {
      if (Math.abs(c.w) < G.STIRN) continue;
      for (let y = Math.ceil(G.laibung(c.u)); y <= G.Y(-1); y++) B.set(st, c.x, y, c.z, T.rustika);
    }
    // 2 Gewölbering (2 Lagen über der Laibung), 3 Füllung bis Y 62
    const ring = ctx.part('gewoelbe_ringe');
    for (const c of ueberBoegen) {
      if (Math.abs(c.w) >= G.STIRN) continue;
      const yi = G.laibung(c.u);
      for (let y = Math.ceil(yi); y < yi + 2; y++) B.set(ring, c.x, y, c.z, T.forte);
    }
    const fu = ctx.part('fuellung');
    for (const c of ueberBoegen) {
      if (Math.abs(c.w) >= G.STIRN) continue;
      for (let y = Math.ceil(G.laibung(c.u) + 2); y <= G.Y(-1); y++) B.set(fu, c.x, y, c.z, T.mauer);
    }

    // 4 Fahrbahn Lage 0 (Y 63): Brücke und Läden; unter den Läden Pietra serena, Auskragung über dem Wasser Holz
    const fb = ctx.part('fahrbahn');
    const ueberWasser = (c) => c.u >= G.U_NORD && c.u < G.U_SUED;
    for (const c of ZELLEN) {
      if (c.T || !(c.B || c.E || c.W)) continue;
      let t = T.pflaster;
      if (c.E || c.W) t = ueberWasser(c) && Math.abs(c.w) >= G.TRAG ? T.sporto : T.serena;
      B.setL(fb, c, 0, t);
    }

    // 5 Konsolen unter den Auskragungen (je 4 Zellen in u zwei Konsolen)
    const ko = ctx.part('konsolen_sporti');
    for (const c of ZELLEN) {
      if (c.T || !(c.E || c.W) || !ueberWasser(c)) continue;
      const aw = Math.abs(c.w);
      const r = ((Math.floor(c.u) % 4) + 4) % 4;
      if (r > 1) continue;
      if (aw >= 19.5 && aw < 20.5) { B.setL(ko, c, -2, T.sporto); B.setL(ko, c, -1, T.sporto); }
      else if (aw >= 20.5 && aw < 21.5) B.setL(ko, c, -1, T.sporto);
    }
  }
};
