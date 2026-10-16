'use strict';
// Raumplan und Ausstattung des Palazzo Rucellai (V5a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_rucellai/).
// Rahmen PR (theta -13,5 Grad): u entlang der Fassade nach Osten, w < 0 ins Gebäude. Geschosse: EG Lage 0..20, Piano nobile
// 20..37, 2. OG 37..52. Schlichte Saalfolge im Piano nobile (Stufe C), Hof. Alles vereinfacht, nicht nach Vorbild.
const { kit, typen, schach, kassette } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [
  { achse: 'u', v: 20, von: -36, bis: -4, tueren: [-12, -28] },     // Fassadensäle: West | Mitte
  { achse: 'u', v: 36, von: -36, bis: -4, tueren: [-12, -28] },     // Mitte | Ost
  { achse: 'w', v: -20, von: 3, bis: 51, tueren: [8, 25, 41] },     // Vorder- und Hinterreihe
  { achse: 'w', v: -52, von: 34, bis: 51, tueren: [43] }            // Ostflügel: Treppenhaus | Nord
];

const TEILE = ['sala_prima', 'sala_seconda', 'sala_terza', 'hof_rucellai', 'licht_ausstattung'];

function ausstatten(api) {
  const { Y, BASIS } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Piano nobile: drei Säle an der Fassade (Enfilade)
  const SAELE = [
    ['sala_prima', { u0: 4, u1: 21, w0: -20, w1: -3 }, ['gelb', 'weiss'], 14],
    ['sala_seconda', { u0: 20, u1: 37, w0: -20, w1: -3 }, ['hellblau', 'weiss'], 30],
    ['sala_terza', { u0: 36, u1: 53, w0: -20, w1: -3 }, ['gruen', 'weiss'], 46]
  ];
  for (const [teil, R, farben, mitte] of SAELE) {
    const z = K.steh(1, R);
    K.boden(teil, 1, z, (c) => schach(c, 3, t.cotto, t.weiss));
    K.waende(teil, 1, z, { pitch: 8, y0: 3, y1: 9, farben, rahmen: t.holz, pilaster: t.serena, sockel: { h: 2, typ: t.holz } });
    K.decke(teil, 1, z, (c) => kassette(c, 5, t.holz, t.putz, t.gold));
    K.kamin(teil, 1, mitte, -18.5, 'w+');                                                       // Kamin an der Hinterwand
    K.quader(teil, 1, { u0: mitte - 3, u1: mitte + 3, w0: -12, w1: -10 }, 1, 1, t.holz);          // Tisch
    for (const du of [-4, 4]) K.quader(teil, 1, { u0: mitte + du - 1, u1: mitte + du, w0: -12, w1: -10 }, 1, 1, t.holz);   // Bänke
  }

  // ------------------------------------------------------------ Hof: Pflaster, Brunnenrand, Kübel
  {
    K.hofboden('hof_rucellai', { u0: 12, u1: 26, w0: -66, w1: -43 }, (c) => (Math.hypot(c.u - 19, c.w + 54.5) < 3 ? t.serena : (((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1) ? t.pflaster : null)));
    K.brunnen('hof_rucellai', 0, 19, -54.5, 2.6, { saeule: 3 });
    for (const [u, w] of [[14, -62], [24, -62], [14, -46], [24, -46]]) {
      K.quader('hof_rucellai', 0, { u0: u - 1, u1: u + 1, w0: w - 1, w1: w + 1 }, 1, 1, t.terrakotta);
      K.baum('hof_rucellai', 0, u, w, 4, { j0: 2 });
    }
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const SAAL = (farbe) => `Saal im Piano nobile an der Fassade: Boden im Schachmuster aus Terrakotta und Marmor, Wandfelder in ${farbe} mit Pilastern und Holzsockel, Kassettendecke aus dunkler Eiche und Gold, Kamin an der Hinterwand, Tisch und Bänke.`;
const INHALT = {
  titel: 'Ausgestaltete Innenräume', untertitel: 'Saalfolge im Piano nobile und Hof', icon: '🏛️',
  teile: {
    sala_prima: { title: 'Erster Saal', description: SAAL('Gelb und Weiß'), tip: 'Boden, Wandfelder, Decke, dann Kamin und Möbel.', caution: VER + ' Schlicht, Stufe C.', fact: 'Der Palast entstand um 1446 bis 1451 nach Plänen Leon Battista Albertis (Quelle: it.wikipedia, Palazzo Rucellai).' },
    sala_seconda: { title: 'Zweiter Saal', description: SAAL('Hellblau und Weiß'), tip: 'Die Tür zum Nachbarsaal bleibt frei.', caution: VER, fact: 'Bernardo Rossellino führte den Bau aus (Quelle: it.wikipedia, Palazzo Rucellai).' },
    sala_terza: { title: 'Dritter Saal', description: SAAL('Grün und Weiß'), tip: 'Alle drei Säle liegen hintereinander an der Fassade.', caution: VER, fact: 'Die Fassade zeigt dorisch, ionisch und korinthisch übereinander (Quelle: it.wikipedia, Palazzo Rucellai).' },
    hof_rucellai: { title: 'Hof', description: 'Hofpflaster im Schachmuster, ein Brunnenbecken mit Mittelsäule und vier Kübel mit Bäumchen an den Ecken.', tip: 'Erst das Pflaster, dann Brunnen und Kübel.', caution: VER + ' Form und Lage des Brunnens sind Stufe C.', fact: 'Der Hof des Palazzo Rucellai ist von Arkaden umgeben (Quelle: it.wikipedia, Palazzo Rucellai).' },
    licht_ausstattung: { title: 'Licht in den Sälen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { WAENDE, TEILE, INHALT, ausstatten };
