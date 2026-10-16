'use strict';
// Spedale degli Innocenti (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/ospedale_degli_innocenti/): Findelhaus nach
// Filippo Brunelleschi (ab 1419). Zur Piazza Santissima Annunziata die Loggia mit neun Rundbögen auf Säulen aus Pietra
// serena, darüber ein Geschoss mit einem Fenster über jedem Bogen; dahinter der Chiostro degli Uomini (Loch 3) und
// weitere Höfe. Rahmen OI: u von der Piazza ins Gebäude, w entlang der Loggia (w 0 Nordende … 140 Südende).
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const { palazzo } = require('../../../tools/wahrzeichen/palazzo.js');
const RAUM = require('./_raeume.js');

const JOCH = 14, BOEGEN = 9, W0 = 7;                          // neun Bögen zwischen w 7 und 133
const PUTZ = WZ.typ('putz_weiss'), SERENA = WZ.typ('pietra_serena'), BRUCH = WZ.typ('pietra_forte_bruch'), TERRA = WZ.typ('putz_terrakotta');
const PZ = palazzo({
  dir: path.resolve(__dirname, '..'),
  geschosse: [20, 14],
  dach: { art: 'walm', hoehe: 5 },
  hof: { tiefe: 4, joch: 6, kaempfer: 9, mitArkaden: [3] },
  fenster: { abstand: JOCH, breite: 3, sohle: [9, 4], hoehe: [5, 6], bifora: [false, false], versatz: W0 },
  portikus: { test: (c) => c.u < 11 && c.w >= W0 && c.w < W0 + BOEGEN * JOCH, kaempfer: 13, joch: JOCH, versatz: W0 - JOCH / 2 },
  material: (s, c, yr, i) => (i.kranz || i.gesims ? SERENA : c.u < 1.5 ? (yr <= 2 ? SERENA : PUTZ) : (yr % 6 === 0 ? BRUCH : TERRA)),
  hofMaterial: (s) => (s === 0 ? SERENA : PUTZ),
  portale: [],
  treppe: { u: 25, w: 80 },
  raeume: { waende: RAUM.WAENDE, ausstatten: RAUM.ausstatten },
  extra: {
    // Tondi mit Wickelkindern (Andrea della Robbia, 1487) zwischen den Bögen: blau-weiße Scheiben über den Säulen
    nachher(api) {
      const { D, zellen, key, Y } = api;
      const BLAU = WZ.fresko('blau'), WEISS = WZ.fresko('weiss');
      for (const c of D.haupt) {
        if (!c.portikus || c.d8 !== 1) continue;
        for (let k = 1; k < BOEGEN; k++) {
          const r = Math.hypot(c.w - (W0 + k * JOCH), 0);
          for (let yr = 15; yr <= 18; yr++) {
            const d = Math.hypot(r, yr - 16.5);
            const e = zellen.get(key(c.x, Y(yr), c.z));
            if (e && d <= 1.8) e.t = d <= 0.9 ? WEISS : BLAU;
          }
        }
      }
    }
  }
});
module.exports = Object.assign(PZ, { JOCH, BOEGEN, W0 });
