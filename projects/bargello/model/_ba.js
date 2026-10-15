'use strict';
// Palazzo del Bargello (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/bargello/): ab 1255 als Palazzo del Popolo
// gebaut, später Sitz des Podestà und des Bargello (Polizeihauptmann), seit 1865 Nationalmuseum. Wehrhafter Block aus
// Pietra forte mit Zinnenkranz, Hof mit Arkaden (Loch 0), kleiner Hof (Loch 1), Torre Volognana (57 m, OSM-Teil
// w361442658) an der Nordwestecke. Rahmen BA (achsparallel): u = x − 153,5 nach Osten, w = z − 560 nach Süden.
const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const P = require('../../../tools/city/poly.js');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');

const DIR = path.resolve(__dirname, '..');
const BRUCH = WZ.typ('pietra_forte_bruch'), FORTE = WZ.typ('pietra_forte'), SERENA = WZ.typ('pietra_serena'), PUTZ = WZ.typ('putz_weiss');
const TURM = { top: 114, zinnen: 4 };                       // 57 m (OSM height=57 m)

let turmZellen = null;
function turm() {
  if (turmZellen) return turmZellen;
  const g = JSON.parse(fs.readFileSync(path.join(DIR, '..', '..', 'data', 'stadt', 'gebaeude.json'), 'utf8'));
  const b = (g.gebaeude || g).find((x) => x.id === 'r1461750');
  const t = b.teile.find((x) => x.osm.id === 361442658);
  const zellen = P.cellsOf(P.normalize(t.polygon));
  const S = new Set(zellen.map(([x, z]) => P.ck(x, z)));
  const rand = (x, z) => { let d = 0; for (let r = 1; r <= 4; r++) { let alle = true; for (let dx = -r; dx <= r && alle; dx++) for (let dz = -r; dz <= r; dz++) if (!S.has(P.ck(x + dx, z + dz))) { alle = false; break; } if (!alle) return r; d = r; } return d + 1; };
  turmZellen = zellen.map(([x, z]) => ({ x, z, r: rand(x, z) }));
  return turmZellen;
}

const PZ = palazzo({
  dir: DIR,
  geschosse: [20, 18, 16],
  dach: { art: 'walm', hoehe: 4 },
  zinnen: { hoehe: 4, abstand: 2 },
  hof: { tiefe: 5, joch: 8, kaempfer: 12, mitArkaden: [0] },
  fenster: { abstand: 14, breite: 3, sohle: [12, 6, 4], hoehe: [4, 9, 8], bifora: [false, true, true] },
  material: (s, c, yr, i) => (i.kranz || i.gesims ? SERENA : yr % 4 === 0 ? FORTE : BRUCH),
  hofMaterial: () => PUTZ,
  portale: [{ u: 6.4, w: 40, breite: 6, hoehe: 12 }, { u: 80, w: 83, breite: 5, hoehe: 10 }],
  treppe: { u: 110, w: 40 },
  extra: {
    // Torre Volognana: Schaft über dem Dach bis Lage 114, Zinnen, innen hohl (unzugänglich)
    vorher(api) {
      const { set, unzug, frei, Y, TRAUFE } = api;
      for (const c of turm()) {
        for (let yr = TRAUFE + 1; yr <= TURM.top; yr++) {
          if (c.r <= 2) {
            const zinne = yr > TURM.top - TURM.zinnen && c.r === 1 && ((c.x + c.z) & 1);
            if (yr > TURM.top - TURM.zinnen && !zinne && c.r === 1) continue;
            set(c.x, Y(yr), c.z, yr === TURM.top - TURM.zinnen ? SERENA : (yr % 5 === 0 ? FORTE : BRUCH), 'turm');
          } else if (yr === TURM.top - TURM.zinnen) set(c.x, Y(yr), c.z, FORTE, 'turm');
          else if (yr < TURM.top - TURM.zinnen) { frei(c.x, Y(yr), c.z); unzug('turm', 'Schaft der Torre Volognana (im Modell ohne Zugang)', c.x, Y(yr), c.z); }
        }
      }
    }
  }
});
module.exports = Object.assign(PZ, { TURM, turm });
