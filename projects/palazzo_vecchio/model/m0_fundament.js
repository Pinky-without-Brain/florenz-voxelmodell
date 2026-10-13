'use strict';
// Modul 0: Fundament, Sockel und Bodenplatte (Katalog §1). Terrain bis Y 67, Palast ab Y 68 (Säulenregel §0.5).
const pv = require('./pv_lib.js');
const WZ = require('../../../tools/wahrzeichen');

module.exports = {
  module: 0,
  build(ctx) {
    const S = pv.state(ctx);
    const { M } = S.g;
    const TY = pv.TY;
    const top = WZ.boden.groundTopY;
    const REL = S.bodenY;                                  // y_rel = Y - bodenY; Y 67 -> -1
    // Säulen: Maskenzellen und Höfe (Lochsäulen = Hofboden-Unterbau)
    const cols = S.g.recs.map((r) => ({ x: r.x, z: r.z, d8: r.d8 }));
    for (const l of M.loecher()) for (const [x, z] of l.cells) cols.push({ x, z, d8: 0 });

    const fund = ctx.part('fundament');
    for (const c of cols) {
      if (c.d8 >= 1 && c.d8 <= 2) continue;               // Sockelband gehört Teil 2
      for (let Y = top(c.x, c.z) + 1; Y <= REL - 1; Y++) S.put(fund, c.x, Y - REL, c.z, TY.pietra_forte_bruch, 'fundament');
    }
    const sockel = ctx.part('sockel_rustika');
    for (const c of cols) {
      if (!(c.d8 >= 1 && c.d8 <= 2)) continue;
      for (let Y = top(c.x, c.z) + 1; Y <= REL - 1; Y++) S.put(sockel, c.x, Y - REL, c.z, TY.pietra_forte_rustika, 'sockel_rustika');
    }
    const platte = ctx.part('bodenplatte');
    for (const c of cols) S.put(platte, c.x, 0, c.z, S.lampe(c.x, 0, c.z) ? TY.licht : c.d8 >= 1 && c.d8 <= 5 ? TY.pietra_forte_bruch : TY.pflaster, 'bodenplatte');
  }
};
