'use strict';
// Modul 5: flaches Walmdach (Katalog §6). Traufe Lage 75 bei d = 1 (und im Luftraum s <= 2), Anstieg 0,4 je Block ins Gebäude.
// Entscheidung: Die Haut ist überall 2 Lagen stark (Unterkante 75 + floor(0,4 (d-1)), höchstens 78, Oberkante höchstens 79);
// der Kamm (Lage 80, 2 breit entlang der Mittelachse) ist der Dachfirst (Y 148). So bleibt "Anstieg höchstens 6 bis Plateau
// Lage 80" erhalten, ohne dass Haut und Kamm dieselbe Lage belegen. Am Rand liegt die Haut auf dem Kranzgesims (Lage 74).
const WZ = require('../../../tools/wahrzeichen');
const O = require('../lib/om.js');

module.exports = {
  module: 5,
  build(ctx) {
    const L = O.lade();
    const ziegel = WZ.typ('dachziegel');

    // 1. Dachhaut über der Maske und der Traufauskragung
    const haut = [];
    for (const c of L.zellen) {
      for (let yr = O.dachUnten(c.d); yr <= O.dachOben(c.d); yr++) haut.push({ x: c.x, y: O.Y(yr), z: c.z });
    }
    for (const a of O.aussen()) for (let yr = O.dachUnten(1); yr <= O.dachOben(1); yr++) haut.push({ x: a.x, y: O.Y(yr), z: a.z });
    ctx.part('dach').fill(haut, ziegel);

    // 2. Kamm: Lage 80, 2 breit (w -1..0) auf dem Plateau
    const kamm = L.zellen.filter((c) => (c.wi === -1 || c.wi === 0) && O.dachOben(c.d) === O.DACH_MAX)
      .map((c) => ({ x: c.x, y: O.Y(O.KAMM), z: c.z }));
    ctx.part('dachkamm').fill(kamm, ziegel);
  }
};
