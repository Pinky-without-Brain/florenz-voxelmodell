'use strict';
const { kit, typen, schach, kassette } = require('../../../tools/wahrzeichen/palazzo_raum.js');
// Raumplan und Ausstattung des Palastes von San Firenze (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/san_firenze/).
// Rahmen SF (theta −75,2°): u entlang der Fassade zur Piazza San Firenze (Süd → Nord), w von der Fassade nach Osten.
// Vorderbau u 36..76 × w 2..43; Nordflügel w 60..73; Westflügel u 2..21; Hof (Loch 0) u 28..58 × w 75..127; Lichthof (Loch 1)
// u 72..86 × w 87..96; Ostblock u 60..107 × w 75..127; Südflügel w 129..152. Raumaufteilung Stufe C.
const TREPPE = { u: 13, w: 100 };

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 × 5)
const WAENDE = [
  { achse: 'u', v: 50.5, von: 2, bis: 43, tueren: [12, 32] },       // Vorderbau: Westhalle | Eingangshalle
  { achse: 'u', v: 64.5, von: 2, bis: 43, tueren: [12, 32] },       // Eingangshalle | Osthalle
  { achse: 'u', v: 35.5, von: 59, bis: 73, tueren: [66] },          // Nordflügel West | Mitte
  { achse: 'u', v: 80.5, von: 59, bis: 73, tueren: [66] },          // Nordflügel Mitte | Ost
  { achse: 'w', v: 90, von: 2, bis: 20, tueren: [12] },             // Westflügel
  { achse: 'w', v: 112, von: 2, bis: 20, tueren: [12] },
  { achse: 'w', v: 100.5, von: 60, bis: 107, tueren: [66, 96] },    // Ostblock Nord | Süd
  { achse: 'u', v: 84.5, von: 101, bis: 127, tueren: [114] },       // Ostblock Süd West | Ost
  { achse: 'u', v: 35.5, von: 129, bis: 151, tueren: [140] },       // Südflügel
  { achse: 'u', v: 70.5, von: 129, bis: 151, tueren: [140] }
];

const TEILE = ['eingangshalle', 'hof_san_firenze', 'licht_ausstattung'];

function ausstatten(api) {
  const K = kit(api);
  const t = typen();
  // Eingangshalle (Erdgeschoss, mittlere Halle des Vorderbaus hinter dem Portal zur Piazza San Firenze)
  const z = K.steh(0, { u0: 51, u1: 64.5, w0: 2, w1: 43 });
  K.boden('eingangshalle', 0, z, (c) => (Math.abs(c.u - 57.5) < 1.6 ? t.ornament : schach(c, 3, t.serena, t.weiss)));
  K.waende('eingangshalle', 0, z, { pitch: 9, y0: 3, y1: 7, farben: ['weiss', 'gelb'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena } });
  K.decke('eingangshalle', 0, z, (c) => kassette(c, 5, t.holz, t.putz, t.gold));
  // Großer Hof (Loch 0): Pflaster im Schachmuster mit Mittelkreuz aus Pietra serena
  K.hofboden('hof_san_firenze', { u0: 28, u1: 59, w0: 75, w1: 128 }, (c) => (Math.abs(c.u - 43.2) < 1.2 || Math.abs(c.w - 101.2) < 1.2 ? t.serena : schach(c, 3, t.pflaster, t.weiss)));
}

const VER = 'Vereinfachte Ausstattung, Lage und Größe Stufe C.';
const INHALT = {
  titel: 'Ausgestaltete Innenräume des Palastes', untertitel: 'Eingangshalle und Hof des Konvents', icon: '🏛️',
  teile: {
    eingangshalle: { title: 'Eingangshalle', description: 'Die Halle hinter dem Portal zur Piazza San Firenze: Schachboden aus Pietra serena und Marmor mit einem Mittelstreifen, Wandfelder in Weiß und Gelb zwischen Pilastern, Kassettendecke aus Holz und Gold.', tip: 'Boden, Wandfelder, Decke.', caution: VER + ' Das Aussehen der Halle ist nicht überliefert.', fact: 'Giovanni Filippo Ciocchi baute 1745 bis 1749 mit Zanobi Del Rosso den Konvent der Filippini; später war hier das Gericht (Quelle: it.wikipedia, Complesso di San Firenze).' },
    hof_san_firenze: { title: 'Großer Hof', description: 'Das Pflaster des großen Hofs im Schachmuster aus Stein und Marmor, durchzogen von einem Kreuz aus Pietra serena.', tip: 'Erst das Kreuz, dann das Schachmuster.', caution: VER + ' Der Boden des Hofs ist nicht überliefert.', fact: 'Der Palast des Complesso hat zwei Höfe (Quelle: OSM, Relation r4084510, zwei Löcher).' },
    licht_ausstattung: { title: 'Licht in den Sälen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

/** Portale in Rahmenkoordinaten (unabhängig von der Außennormale der Zelle): Piazza San Firenze und Borgo de' Greci. */
const TORE = [
  { achse: 'w', mitte: 56, breite: 8, hoehe: 11, bis: 4 },      // Fassade zur Piazza San Firenze (w < 4)
  { achse: 'u', mitte: 101, breite: 7, hoehe: 10, bis: 12 }     // Südflügel zum Borgo de' Greci (u < 12)
];
function oeffnungen(api) {
  const { D, Y, oeffnung } = api;
  for (const c of D.haupt) {
    if (c.d8 > 2) continue;
    for (const p of TORE) {
      const v = p.achse === 'w' ? c.u - p.mitte : c.w - p.mitte;
      const nah = p.achse === 'w' ? c.w < p.bis : c.u < p.bis;
      if (!nah || Math.abs(v) >= p.breite / 2) continue;
      const h = Math.floor(p.hoehe - p.breite / 2 + Math.sqrt(Math.max(0, (p.breite / 2) ** 2 - v * v)));
      for (let yr = 1; yr <= h; yr++) oeffnung('tor', 'portale', c.x, Y(yr), c.z);
    }
  }
}
module.exports = { TREPPE, WAENDE, TEILE, INHALT, TORE, ausstatten, vorher() {}, oeffnungen, innenwandTuer: undefined };
