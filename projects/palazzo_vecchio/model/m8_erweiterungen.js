'use strict';
// Modul 8: Erweiterungen hinten, Dachgeschosse und Ostfassade (Katalog §9).
const pv = require('./pv_lib.js');

module.exports = {
  module: 8,
  build(ctx) {
    const S = pv.state(ctx);
    const g = S.g, TY = pv.TY;
    const mitte = g.recs.filter((r) => !r.isA && r.d8 <= 3);
    const frei = (r) => !r.lis && !r.eck;                    // Lisenen und Eckquader baut dieses Modul selbst (Teil 4, 5)

    // 1) Dachgeschoss der Mittelbauten y_rel 50..55, Fenster 2 x 3 im Abstand 8 (y 52..54)
    const dg = ctx.part('dachgeschoss_mittelbauten');
    S.band(dg, mitte.filter(frei), 50, 55, (r, y) => {
      const f = pv.fassadeM(S, r);
      if (f && y >= 52 && y <= 54) {
        for (const u0 of f.axes) if (Math.abs(f.u - u0) < 1) return r.d8 === 2 ? TY.glas_fenster : null;
      }
      return TY.putz_sand;
    }, 'dachgeschoss_mittelbauten');

    // 2) Traufgesims y_rel 56: Wandlage d8 <= 3, farbig als Gesims
    const tg = ctx.part('traufgesims_ost');
    S.band(tg, mitte.filter(frei), 56, 56, () => TY.pietra_serena, 'traufgesims_ost');

    // 3) Giebelwände der Salone-Schmalseiten (2 dick) von y_rel 57 bis unter die Dachhaut
    const gi = ctx.part('salone_giebel');
    const b = pv.SAL_AUSSEN;
    const ende = g.recs.filter((r) => r.sal && (r.u < b.u0 + 2 || r.u >= b.u1 - 2));
    S.band(gi, ende, 57, 64, (r, y) => {
      const dw = Math.min(r.w - b.w0, b.w1 - r.w);
      const top = 57 + Math.min(9, Math.round((9 * dw) / ((b.w1 - b.w0) / 2)));
      return y <= top - 2 ? TY.putz_sand : null;
    }, 'salone_giebel');

    // 4) Lisenen der Via-dei-Leoni-Fassade (E9): 3 breit, y_rel 1..56, in d8 <= 2
    const li = ctx.part('ostbau_strebepfeiler');
    S.band(li, g.recs.filter((r) => r.lis), 1, 56, () => TY.pietra_forte, 'ostbau_strebepfeiler');

    // 5) Eckquader der B-Ecken (3 x 3, y_rel 1..56)
    const eq = ctx.part('ostbau_eckquader');
    S.band(eq, g.recs.filter((r) => r.eck), 1, 56, () => TY.pietra_forte_rustika, 'ostbau_eckquader');
  }
};
