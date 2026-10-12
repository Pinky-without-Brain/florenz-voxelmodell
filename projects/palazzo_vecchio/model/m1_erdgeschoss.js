'use strict';
// Modul 1: Erdgeschoss mit Rustika (Katalog §2), Wandband t = 5, y_rel 1..16, nur Außenring.
// Parameter, die sich nach einer Fotoprüfung leicht ändern lassen (PRUEFBERICHT D1, Frage 5):
const PV_AXES = 9;        // Fensterachsen der Westfassade (u = 5 + 10k)
const PORTAL_U = 55;      // Hauptportal der Westfassade, Fassadenkoordinate u

const pv = require('./pv_lib.js');

module.exports = {
  module: 1,
  PV_AXES,
  PORTAL_U,
  build(ctx) {
    const S = pv.state(ctx);
    S.cfg = { PV_AXES, PORTAL_U };
    const TY = pv.TY;
    const A = S.g.recs.filter((r) => r.isA && r.d8 <= 5);
    const west = A.filter((r) => r.e >= 17);
    const nordSued = A.filter((r) => r.e < 17);
    const mitte = S.g.recs.filter((r) => !r.isA && r.d8 <= 5);

    // 1) Westfassade: Fenster, Portal; die Wappentafel reicht bis y_rel 17 (Modul 2 lässt sie aus)
    const w1 = ctx.part('eg_wand_west');
    S.band(w1, west, 1, 16, (r, y) => pv.wandA(S, r, y), 'eg_wand_west');
    S.band(w1, west, 17, 17, (r, y) => { const q = pv.oeffnungA(S, r, y); return q === TY.marmor_ornament ? q : null; }, 'eg_wand_west');

    // 2) Nord- und Südkanten der Zone A: Tramontana-Portal (E1), kleine Tür (E16)
    const w2 = ctx.part('eg_wand_nord_sued_a');
    S.band(w2, nordSued, 1, 16, (r, y) => pv.wandA(S, r, y), 'eg_wand_nord_sued_a');

    // 3) Mittelbauten (Zonen M, P, B): Fenster, Via-dei-Leoni-Portal; Lisenen und Eckquader bleiben für Modul 8 frei
    const w3 = ctx.part('eg_wand_mittelbauten');
    S.band(w3, mitte, 1, 16, (r, y) => pv.wandM(S, r, y), 'eg_wand_mittelbauten');

    // 4) Dogana-Tür (optional): Rahmen und Zinnenkrone aus Pietra serena, Öffnung bleibt Luft
    const w4 = ctx.part('eg_dogana_tuer');
    const dog = mitte.filter((r) => r.zone === 'B' && r.e === 6 && r.x >= -37 && r.x <= -33);
    S.band(w4, dog, 1, 16, (r, y) => { const k = S.dogana(r, y); return k === 'frame' || k === 'zinne' ? TY.pietra_serena : null; }, 'eg_dogana_tuer');
  }
};
