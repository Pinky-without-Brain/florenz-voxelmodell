'use strict';
// Uffizien Modul 0: Fundament und Bodenplatte (Katalog §1). Gelände bis Y 64, Bau ab Y 65.
const { plan, MATS, MAT } = require('./_plan.js');
const { get, TYP } = require('./_uf.js');
const { schliesse } = require('./_riss.js');

module.exports = {
  module: 0,
  build(ctx) {
    const P = plan();
    const S = get();
    const WZ = require('../../../tools/wahrzeichen');
    void MATS;
    const bodenY = S.BODEN;
    // 1) fundament: M_UF, von groundTopY+1 bis Y 64, wo das Gelände tiefer liegt
    const fund = [];
    for (let i = 0; i < S.N; i++) {
      const x = S.cx[i], z = S.cz[i];
      for (let y = WZ.boden.groundTopY(x, z) + 1; y <= bodenY - 1; y++) fund.push({ x, y, z });
    }
    // Diagonalrisse am Geländerand schließen (Verbindungszellen innerhalb der Maske)
    fund.push(...schliesse(fund, (x, y, z) => S.at(x, z) >= 0));
    if (fund.length) ctx.part('fundament').fill(fund, TYP.pietra_forte_bruch);
    // 2) bodenplatte: Y 65 über die ganze Maske; Portikusboden (t 1..10 an FW/FE und FSN) Pflaster, sonst Pietra serena
    const w = ctx.part('bodenplatte');
    const pf = [], ps = [];
    for (let i = 0; i < S.N; i++) {
      let portikus = false;
      if (P.tAll[i] && P.tAll[i] <= 10 && (P.zone[i] === P.ZONE_W || P.zone[i] === P.ZONE_E)) portikus = true;
      if (P.kind[i] === P.K_SER && Math.floor(S.ww[i] - P.fsn(S.uu[i])) + 1 <= 10) portikus = true;
      (portikus ? pf : ps).push({ x: S.cx[i], y: bodenY, z: S.cz[i] });
    }
    w.fill(pf, TYP.pflaster);
    w.fill(ps, TYP.pietra_serena);
    void MAT;
  }
};
