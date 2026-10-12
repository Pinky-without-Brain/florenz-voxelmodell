'use strict';
// Modul 9 (optional): 14 vereinfachte Blockfiguren in den Nischen der Tabernakel (Katalog §10).
// Vereinfachte Blockfigur, nicht nach Vorbild. Fuß 2 x 1 x 1 (y 8), Körper 2 x 1 x 3 (y 9..11), Kopf 1 x 1 x 1 (y 12),
// Höhe 5 = 2,5 m. Die Figur steht in der Nischenebene (d = 1) auf der Bank (y 7) und belegt die Spalten e 0 und 1 der
// Nische (e = Abstand von der Tabernakelmitte, Nische e -1..1); der Kopf sitzt auf e 0.
// Der Orcagna-Tabernakel im Inneren entfällt (Katalog).
const WZ = require('../../../tools/wahrzeichen');
const O = require('../lib/om.js');

module.exports = {
  module: 9,
  build(ctx) {
    const L = O.lade();
    const karte = O.tabKarte();
    const bronze = WZ.typ('bronze');
    const out = [];
    for (const c of L.zellen) {
      const t = karte.get(O.K(c.x, c.z));
      if (!t || (t.e !== 0 && t.e !== 1)) continue;
      const yMax = t.e === 0 ? 12 : 11;
      for (let yr = 8; yr <= yMax; yr++) out.push({ x: c.x, y: O.Y(yr), z: c.z });
    }
    ctx.part('statuen').fill(out, bronze);
  }
};
