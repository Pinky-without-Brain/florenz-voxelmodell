'use strict';
// Modul 2: Obergeschosse mit Biforien (Katalog §3), Wandband t = 4. Die Zone A trägt nach K1 durchgehend Rustika.
const pv = require('./pv_lib.js');

module.exports = {
  module: 2,
  build(ctx) {
    const S = pv.state(ctx);
    const TY = pv.TY;
    const A = S.g.recs.filter((r) => r.isA && r.d8 <= 4);
    const west = A.filter((r) => r.e >= 17);
    const nordSued = A.filter((r) => r.e < 17);
    const mitte = S.g.recs.filter((r) => !r.isA && r.d8 <= 4);

    const w1 = ctx.part('og1_wand_west');
    S.band(w1, west, 17, 33, (r, y) => pv.wandA(S, r, y), 'og1_wand_west');
    const w2 = ctx.part('og2_wand_west');
    S.band(w2, west, 34, 49, (r, y) => pv.wandA(S, r, y), 'og2_wand_west');
    const w3 = ctx.part('og_wand_nord_sued_a');
    S.band(w3, nordSued, 17, 49, (r, y) => pv.wandA(S, r, y), 'og_wand_nord_sued_a');
    const w4 = ctx.part('og_wand_mittelbauten');
    S.band(w4, mitte, 17, 49, (r, y) => pv.wandM(S, r, y), 'og_wand_mittelbauten');

    // Korridordurchgang: die Öffnung selbst bleibt Luft (Wände lassen sie aus), hier nur die Laibung
    const w5 = ctx.part('og_korridor_durchgang');
    const kor = S.g.recs.filter((r) => r.d8 <= 4 && (r.e === 14 || r.e === 15));
    S.band(w5, kor, 34, 41, (r, y) => (S.korridor(r, y) === 'laibung' ? TY.marmor_weiss : null), 'og_korridor_durchgang');
  }
};
