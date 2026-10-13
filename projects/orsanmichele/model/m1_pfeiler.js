'use strict';
// Modul 1: Erdgeschoss, Pfeiler mit 14 Tabernakeln (Katalog §2). Lagen y_rel 3..26, Pfeiler massiv bis d <= 6.
const WZ = require('../../../tools/wahrzeichen');
const O = require('../lib/om.js');

module.exports = {
  module: 1,
  build(ctx) {
    const L = O.lade();
    const forte = WZ.typ('pietra_forte');
    const mat = { bank: WZ.typ('marmor_weiss'), rahmen: WZ.typ('marmor_weiss'), saeule: WZ.typ('marmor_saeule'), giebel: WZ.typ('marmor_ornament') };

    // Pfeilerzellen einer Klasse; Nischen und Tabernakelteile (Teil 4) werden ausgelassen (K0: Detail gewinnt)
    function pfeiler(typ) {
      const out = [];
      for (let yr = 3; yr <= 26; yr++) {
        for (const c of L.zellen) {
          const r = O.ring(c);
          if (!r || r.typ !== typ) continue;
          if (O.tabInhalt(c, yr) !== null || O.laneZelle(c.x, c.z, yr)) continue;
          out.push({ x: c.x, y: O.Y(yr), z: c.z });
        }
      }
      return out;
    }
    ctx.part('pfeiler_eck').fill(pfeiler('eck'), forte);
    ctx.part('pfeiler_lang').fill(pfeiler('lang'), forte);
    ctx.part('pfeiler_kurz').fill(pfeiler('kurz'), forte);

    // 14 Tabernakel (N 4, S 4, W 3, E 3): Bank y7, Säulchen y8..16, Rahmenzeile y17, Giebel y18..19; Nische bleibt Luft.
    // Mitte der Tabernakel: lange Seiten u -31/-11/11/31, kurze w -21/-1/20 (Eck-Tabernakel eine Zelle einwärts).
    const tab = [];
    for (let yr = 7; yr <= 19; yr++) {
      for (const c of L.zellen) {
        const t = O.tabInhalt(c, yr);
        if (t && t !== 'luft') tab.push({ x: c.x, y: O.Y(yr), z: c.z, t });
      }
    }
    const byKey = new Map(tab.map((b) => [`${b.x},${b.y},${b.z}`, b.t]));
    ctx.part('tabernakel').fill(tab, (x, y, z) => mat[byKey.get(`${x},${y},${z}`)]);
    const nischen = [];                                // Statuennischen: offen zur Straße (B3, R14)
    for (let yr = 8; yr <= 16; yr++) for (const c of L.zellen) if (O.tabInhalt(c, yr) === 'luft') nischen.push({ x: c.x, y: O.Y(yr), z: c.z });
    ctx.oeffnung(nischen, 'fenster_offen');
  }
};
