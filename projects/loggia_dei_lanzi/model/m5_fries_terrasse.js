'use strict';
// Modul 5 – Fries, Medaillons, Terrasse, Brüstung. Katalog §6 mit K0: fries/medaillons Lage 25..27.
const G = require('./_gemeinsam.js');

module.exports = {
  module: 5,
  build(ctx) {
    const { T, ZELLEN } = G;
    const frei = (c, L) => !ctx.grid.has(c.x, G.lageY(L), c.z);

    // Medaillon-Zellen: w 0 = Rahmen (Ring) bzw. Mitte, w 1 = blauer Grund. Die Fries-Zellen dort sind ausgespart.
    const medZelle = (c, L) => {
      const k = G.medaillonIndex(c.iu, L);
      return k >= 0 && c.rw <= 1 ? k : -1;
    };

    // 1) Fries: Front w 0..2, Lage 25..27, u -39..38.
    const fr = ctx.part('fries');
    for (const c of ZELLEN) {
      if (c.iw > 2) continue;
      for (let L = 25; L <= 27; L++) if (medZelle(c, L) < 0 && frei(c, L)) G.setL(fr, c, L, T.forte);
    }

    // 2) Medaillons: 3 x 3, Ring marmor_ornament, Mitte gold, dahinter (w 1) blauer Keramikgrund.
    const md = ctx.part('medaillons');
    for (const c of ZELLEN) {
      for (let L = 25; L <= 27; L++) {
        const k = medZelle(c, L);
        if (k < 0 || !frei(c, L)) continue;
        const mitte = c === G.MEDAILLON_MITTE[k] && L === 26;
        if (mitte) G.setL(md, c, L, T.gold);
        else G.setL(md, c, L, c.rw === 1 ? T.blau : T.ornament);
      }
    }

    // 3) Terrasse: Lage 28..29 über ganz M_LL; Wände und Fries tragen sie (belegte Zellen ausgelassen).
    const tr = ctx.part('terrasse');
    for (const c of ZELLEN) for (let L = 28; L <= 29; L++) if (frei(c, L)) G.setL(tr, c, L, T.serena);

    // 4) Brüstung: Ring d8 = 1; Lage 30..31 Balusterraster (jede zweite Zelle), Lage 32 durchgehender Handlauf.
    const br = ctx.part('brustung');
    for (const c of ZELLEN) {
      if (!G.bruestungZelle(c)) continue;
      if (((c.ru + c.rw) & 1) === 0) for (let L = 30; L <= 31; L++) G.setL(br, c, L, T.weiss);
      G.setL(br, c, 32, T.weiss);
    }

    // 5) Dachaustritt (Aufbauhaube): u -2..1, w 20..22, Lage 30..33.
    const da = ctx.part('dachaustritt');
    for (const c of ZELLEN) {
      if (c.iu < -2 || c.iu > 1 || c.iw < 20 || c.iw > 22) continue;
      for (let L = 30; L <= 33; L++) G.setL(da, c, L, T.forte);
    }
  }
};
