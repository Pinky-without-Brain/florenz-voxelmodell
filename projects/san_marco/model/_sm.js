'use strict';
// Konvent von San Marco (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/san_marco/): Michelozzo ab 1437, Dominikanerkonvent,
// heute Museo nazionale di San Marco. Bauplan aus tools/wahrzeichen/palazzo.js (Höfe = Löcher des OSM-Polygons).
// Rahmen SM: u von der Piazza San Marco (Fassade der Kirche, u = 0) nach Norden-Nordosten, w quer (w > 0 nach Osten-Südosten, zum Konvent).
// Löcher: 0..2 und 4 kleine Lichthöfe, 3 Chiostro di San Domenico, 5 Chiostro di Sant'Antonino.
// Geschosse: Erdgeschoss Lage 0..12, Obergeschoss (Dormitorium, Bibliothek) 12..23, Dach ab 24.
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const PUTZ = WZ.typ('putz_sand'), SERENA = WZ.typ('pietra_serena'), SOCKEL = WZ.typ('pietra_forte');

/** Treppe Erdgeschoss -> Obergeschoss: Podesttreppe (6 + 6 Stufen, Breite 3) im Eingangsflügel, Unterbau massiv. */
function treppe(api) {
  const { D, set, frei, Y, BASIS } = api;
  const T = WZ.treppe;
  const R = RAUM.TREPPE;                                           // Suchraum und Ziel (lokal)
  const ok = new Map();
  for (const c of D.haupt) {
    if (c.d8 > 3 && !api.istHofwand(c) && !api.istLoggia(c) && !api.istInnenwand(c) && c.dHof > 3 && c.u >= R.u0 && c.u <= R.u1 && c.w >= R.w0 && c.w <= R.w1) ok.set(c.x + ',' + c.z, c);
  }
  const in2 = (x, z) => ok.has(x + ',' + z);
  let best = null, bd = Infinity;
  for (const s of ok.values()) {
    const d0 = Math.hypot(s.u - R.ziel.u, s.w - R.ziel.w);
    if (d0 >= bd) continue;
    for (const richtung of ['n', 'o', 's', 'w']) for (const drehsinn of ['rechts', 'links']) {
      const bl = T.podestTreppe({ start: { x: s.x, y: Y(1), z: s.z }, richtung, stufen1: 6, stufen2: 6, breite: 3, rolle: 'pietra_serena', drehsinn });
      const L = bl.lauf;
      let pass = true;
      for (const b of bl) if (!in2(b.x, b.z)) { pass = false; break; }
      if (!pass) continue;
      const [dx, dz] = T.DIR[L.laeufe[0].d];
      const g = L.laeufe[1].d, [gx, gz] = T.DIR[g];
      // Zugang vor dem ersten Lauf und Austritt hinter dem zweiten (je 2 Zellen, quer 3 Zellen breit)
      const [qx, qz] = T.DIR[T.RECHTS[L.laeufe[0].d]];
      for (let k = 1; k <= 2 && pass; k++) for (let q = 0; q < 3; q++) if (!in2(s.x - dx * k + qx * q * (drehsinn === 'rechts' ? 1 : -1), s.z - dz * k + qz * q * (drehsinn === 'rechts' ? 1 : -1))) { pass = false; break; }
      const o = L.oben;
      for (let k = 0; k <= 2 && pass; k++) if (!in2(o.x + gx * k, o.z + gz * k)) pass = false;
      if (!pass) continue;
      best = { bl, L, richtung, drehsinn, g, s }; bd = d0;
    }
  }
  if (!best) throw new Error('San Marco: kein Platz für die Treppe');
  for (const l of T.treppenloch(best.L, 3)) frei(l.x, l.y, l.z);
  for (const b of best.bl) {
    for (let y = Y(1); y < b.y; y++) set(b.x, y, b.z, SERENA, 'treppe', true);       // Unterbau (Auflager, R3)
    set(b.x, b.y, b.z, b.typ, 'treppe', true);
  }
  api.treppeInfo = { oben: best.L.oben, g: best.g, d: best.L.laeufe[0].d, start: best.s, drehsinn: best.drehsinn, bloecke: best.bl };
}

const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [12, 11],
  dach: { art: 'walm', hoehe: 6 },
  hof: { tiefe: 5, joch: 6.5, kaempfer: 8, mitArkaden: [5], garten: [3, 5] },
  fenster: { abstand: 9, breite: 3, sohle: [5, 3], hoehe: [5, 6], bogen: true },
  material: (s, c, yr, i) => (i.kranz || i.gesims ? SERENA : i.sockel ? SOCKEL : PUTZ),
  hofMaterial: (s) => (s === 0 ? SERENA : PUTZ),
  portale: [{ u: 0, w: 56, breite: 7, hoehe: 10 }, { u: 0, w: -13, breite: 7, hoehe: 10 }],
  treppe: false,
  innenwandTuer: RAUM.innenwandTuer,
  extra: { vorher: treppe, oeffnungen: (api) => RAUM.oeffnungen(api) },
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten }
});
module.exports = PZ;
