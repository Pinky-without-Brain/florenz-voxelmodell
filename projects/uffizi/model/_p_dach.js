'use strict';
// Stufe 6: Dächer (Modul 6). Flügel und Südbau: Traufe Lage 52, Anstieg 0,4 je Block ab d8 = 3, höchstens 6;
// Nebenbau: Traufe Lage 45, Anstieg 0,4 je Block, höchstens 8. Zwei Lagen stark, Dachrampe wie tools/city/haus.js
// (roofs.surface). Das Oktogon der Tribuna bleibt ausgespart.

const roofs = require('../../../tools/geom/roofs.js');

module.exports = function dach(P) {
  const { S, N, claim, zone, ZONE_X } = P;
  const { cx, cz, d8, at } = S;
  const rhoO = P.tribuna.rhoO, aO = P.tribuna.aO;

  const columns = [];
  const top = new Map();
  for (let i = 0; i < N; i++) {
    if (rhoO[i] <= aO) continue;
    let h;
    if (zone[i] === ZONE_X) h = 45 + Math.min(8, Math.floor(0.4 * (d8[i] - 1)));
    else {
      if (d8[i] < 3) continue;
      h = 52 + Math.min(6, Math.floor(0.4 * (d8[i] - 3)));
    }
    columns.push([cx[i], cz[i]]);
    top.set(cx[i] + ',' + cz[i], h);
  }
  for (const c of roofs.surface({ columns, height: (x, z) => top.get(x + ',' + z), thickness: 2, overlap: 1 })) {
    const i = at(c.x, c.z);
    claim(i, c.y, zone[i] === ZONE_X ? 'dach_nebenbau' : 'dach_fluegel', 'dach');
  }
};
