'use strict';
// Modul 0 – Boden: Bodenplatte (Y 67), Stufen an der Front und am Seitenbogen als Treppenblöcke. Katalog §1.
// B3: Die Eingangsstufen (Lage 0, Aufstieg in die Halle) ersetzen das alte Vollblock-Podest; die Halle liegt flächig auf Y 67.
const G = require('./_gemeinsam.js');

module.exports = {
  module: 0,
  build(ctx) {
    const { T, ZELLEN } = G;
    const B = G.belegung(ctx);
    const stufe = (c) => G.stufeFront(c) || G.stufeOst(c);

    // Kein Fundament nötig (Katalog §0.4): groundTopY >= 66 in der ganzen Maske.
    const fund = G.WZ.fundamentZellen(G.MASKE, G.BODEN_Y);
    if (fund.length) {
      const f = ctx.part('fundament');
      for (const [x, y, z] of fund) B.put(f, x, y, z, T.bruch);
    }

    // 1) Bodenplatte: ganz M_LL, Schachbrett 6 x 6 (u, w) aus Pflaster und Pietra serena; die Stufenzellen übernimmt Teil 2.
    const platte = ctx.part('bodenplatte');
    for (const c of ZELLEN) {
      if (stufe(c)) continue;
      const feld = (Math.floor(c.ru / 6) + Math.floor(c.rw / 6)) & 1;
      B.setL(platte, c, 0, feld ? T.serena : T.pflaster);
    }

    // 2) Eingangsstufen: Treppenblöcke der Rolle pietra_serena auf Lage 0 (Y 67), Aufstieg in die Halle
    //    (Front: lokal +w, Seitenbogen Ost: lokal -u). Stehhöhe oben = Y 68 = Hallenboden.
    const st = ctx.part('podest_front');
    const tFront = G.PAL.treppe('pietra_serena', G.RICHTUNG_FRONT);
    const tOst = G.PAL.treppe('pietra_serena', G.RICHTUNG_OST);
    for (const c of ZELLEN) {
      if (G.stufeFront(c)) B.setL(st, c, 0, tFront);
      else if (G.stufeOst(c)) B.setL(st, c, 0, tOst);
    }
  }
};
