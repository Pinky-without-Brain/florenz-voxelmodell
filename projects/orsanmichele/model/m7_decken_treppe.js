'use strict';
// Modul 7: Decken der Obergeschosse und Treppe (Katalog §8).
// K0: Decken lassen Treppenlöcher aus; decke_og2 (Lage 74) nur d >= 4 (der Wandring d <= 3 gehört dem Kranzgesims).
// Treppe: Der Katalog nennt 6 x 6 Zellen für 25 Stufen, das passt nicht (25 Stufen brauchen mindestens 13 Zellen Länge).
// Gewählt (einfachste plausible Lösung): U-Treppe an der Nordwand, 6 breit (zwei Läufe à 3), 25 Stufen 1 hoch / 1 tief,
// Lauf 1 w -21..-19 (u -30..-19, Stufen 1..12), Podest u -18 (Stufe 13), Lauf 2 w -18..-16 zurück (Stufen 14..25).
// Die Stufen sind massiv von Lage 27 bis zur Trittfläche; die oberste Trittfläche liegt auf Lage 51 (Deckenhöhe).
const WZ = require('../../../tools/wahrzeichen');
const O = require('../lib/om.js');

module.exports = {
  module: 7,
  build(ctx) {
    const L = O.lade();
    const serena = WZ.typ('pietra_serena');
    const innen = L.zellen.filter((c) => c.d >= 4);

    // 1. Decke Lage 51 (ohne Treppenloch über Lauf 2)
    ctx.part('decke_og1').fill(innen.filter((c) => !O.treppeLoch(c.ui, c.wi)).map((c) => ({ x: c.x, y: O.Y(51), z: c.z })), serena);
    // 2. Decke Lage 74
    ctx.part('decke_og2').fill(innen.map((c) => ({ x: c.x, y: O.Y(74), z: c.z })), serena);
    // 3. Treppe
    const st = [];
    for (const c of innen) {
      const h = O.treppeHoehe(c.ui, c.wi);
      for (let yr = 27; yr <= h; yr++) st.push({ x: c.x, y: O.Y(yr), z: c.z });
    }
    ctx.part('treppe').fill(st, serena);
  }
};
