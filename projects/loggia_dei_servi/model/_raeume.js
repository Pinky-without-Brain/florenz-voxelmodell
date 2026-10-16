'use strict';
// Raumplan und Ausstattung der Loggia dei Servi di Maria (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/loggia_dei_servi/).
// Rahmen LS (theta 132,03 Grad): u entlang der Loggia (Nordost → Südwest, 0..109), w von der Piazza ins Gebäude (0..55).
// Geschosse: Portikus/EG Lage 0..12, Obergeschoss 12..23. Sechs Lichthöfe (Löcher) im Streifen w 32..41, alle klein (Lichtschächte).
// Raumaufteilung Stufe C (Hotelzimmer); belegt sind Portikus, Oratorium, Gedenktafel 1613 und die Hotelnutzung.
const { kit, typen, schach, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

const TREPPE = { u: 71, w: 44 };

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3,4 × 5)
// Längswand A (Vorderzimmer | Flur) und B (Flur | Hinterzimmer), Querwände; Türen der Wand A in der Achse der Bögen (u 11 + 22 k)
const WAENDE = [
  { achse: 'w', v: 21.5, von: -10, bis: 109, tueren: [11, 33, 55, 77, 99] },
  { achse: 'w', v: 28.5, von: -10, bis: 109, tueren: [4, 32.5, 40.5, 72, 104] },
  { achse: 'u', v: 22, von: 0, bis: 21, tueren: [] },
  { achse: 'u', v: 44, von: 0, bis: 21, tueren: [] },
  { achse: 'u', v: 66, von: 0, bis: 21, tueren: [] },
  { achse: 'u', v: 88, von: 0, bis: 21, tueren: [] },
  { achse: 'u', v: 18.8, von: 28, bis: 60, tueren: [] },
  { achse: 'u', v: 36, von: 28, bis: 60, tueren: [] },
  { achse: 'u', v: 66.5, von: 28, bis: 60, tueren: [] },
  { achse: 'u', v: 89, von: 28, bis: 60, tueren: [] },
  { achse: 'u', v: 110, von: 0, bis: 20, tueren: [7] }           // Querflügel hinter der Ecke
];
const VORDER = [[0, 21], [23.2, 43], [45.2, 65], [67.2, 87], [89.2, 109]];
const HINTER = [[0, 17.7], [19.9, 34.9], [37.1, 65.4], [90.1, 109]];

// Gedenktafel von 1613 an der Rückwand der Loggia (zwischen den Türen bei u 55 und 77)
function oeffnungen() {}

function ausstatten(api) {
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Hotelzimmer (Stufe C): je Raum ein Bett und ein Tisch, ein Lage hoch
  const bett = (s, u, w, laengs) => {
    const r = laengs === 'u' ? { u0: u, u1: u + 5, w0: w, w1: w + 2.5 } : { u0: u, u1: u + 2.5, w0: w, w1: w + 5 };
    const decke = laengs === 'u' ? { u0: u + 1.5, u1: u + 5, w0: w, w1: w + 2.5 } : { u0: u, u1: u + 2.5, w0: w + 1.5, w1: w + 5 };
    K.quader('hotelzimmer', s, decke, 1, 1, (c) => (((Math.floor(c.u) + Math.floor(c.w)) & 1) ? FR('rot') : FR('weiss')));
    K.quader('hotelzimmer', s, r, 1, 1, t.holz);
  };
  for (const s of [0, 1]) {
    for (const [a] of VORDER) bett(s, a + 14, 13, 'u');
    bett(s, 3, 48, 'u');
    bett(s, 22, 47, 'u');
    bett(s, 38, 47, 'u');
    bett(s, 56, 47, 'u');
    bett(s, 103, 48, 'u');
    K.quader('hotelzimmer', s, { u0: 8, u1: 10, w0: 52, w1: 54 }, 1, 1, t.holz);
  }

  // ------------------------------------------------------------ Empfangshalle (EG, Stufe C): Halle um die Treppe mit Lichthof
  {
    const z = K.steh(0, { u0: 67.2, u1: 88, w0: 29.6, w1: 56 });
    K.boden('hotel_empfang', 0, z, (c) => schach(c, 3, t.cotto, t.weiss));
    K.waende('hotel_empfang', 0, z, { pitch: 9, y0: 3, y1: 8, farben: ['weiss', 'gelb'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena } });
    K.quader('hotel_empfang', 0, { u0: 75, u1: 85, w0: 48, w1: 50 }, 1, 1, t.holz);            // Empfangstresen
  }

  // ------------------------------------------------------------ Oratorium (EG, Südwestecke des Hinterhauses): Altar und Altarbild
  {
    const z = K.steh(0, { u0: 90.1, u1: 109, w0: 29.6, w1: 56 });
    K.boden('oratorium', 0, z, (c) => schach(c, 3, t.weiss, t.rot));
    K.waende('oratorium', 0, z, { pitch: 8, y0: 3, y1: 8, farben: ['weiss', 'blau'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 2, typ: t.holz } });
    K.quader('oratorium', 0, { u0: 98, u1: 106, w0: 50, w1: 52 }, 1, 2, t.serena);          // Altar
    K.flaeche('oratorium', 0, { u0: 97, u1: 107, w0: 48, w1: 56 }, 3, 8, (c, jj) => {
      if (c.d8 !== 2) return null;
      const q = c.u - 97;
      if (jj === 0 || jj === 5 || q < 0.5 || q > 9.5) return t.gold;
      if (jj >= 4) return FR('hellblau');
      return [FR('braun'), FR('rot'), FR('weiss'), FR('blau'), FR('gelb')][Math.floor(q) % 5];
    });
    for (let u = 94; u <= 106; u += 4) K.quader('oratorium', 0, { u0: u, u1: u + 3, w0: 43, w1: 44 }, 1, 1, t.holz);   // Bänke
  }

  // ------------------------------------------------------------ Gedenktafel von 1613 an der Loggiarückwand
  K.flaeche('gedenktafel_1613', 0, { u0: 62, u1: 70, w0: 7, w1: 13 }, 3, 7, (c, jj) => {
    if (c.d8 < 2 && c.w < 8) return null;
    const q = c.u - 62;
    if (jj === 0 || jj === 4 || q < 0.5 || q > 7.5) return t.gold;
    return jj === 2 ? FR('schwarz') : FR('weiss');
  });

  // ------------------------------------------------------------ Lichthöfe: Pflaster im Schachmuster
  K.hofboden('lichthoefe', { u0: 0, u1: 120, w0: 20, w1: 56 }, (c) => schach(c, 2, t.pflaster, t.weiss));
}

const TEILE = ['hotelzimmer', 'hotel_empfang', 'oratorium', 'gedenktafel_1613', 'lichthoefe', 'licht_ausstattung'];

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, Lage und Größe Stufe C.';
const INHALT = {
  titel: 'Hotel, Oratorium und Gedenktafel', untertitel: 'Zimmer, Empfangshalle, Oratorium, Tafel von 1613 und Lichthöfe', icon: '🏨',
  teile: {
    hotelzimmer: { title: 'Hotelzimmer', description: 'In allen Vorder- und Hinterräumen beider Geschosse steht ein Bett aus Holz mit rot-weiß gemusterter Decke, eine Lage hoch; im Hinterhaus kommt ein kleiner Tisch dazu.', tip: 'Bett zuerst, dann die Decke in den freien Feldern.', caution: VER + ' Die Zimmeraufteilung ist erfunden, belegt ist nur die Nutzung als Hotel.', fact: 'Die Anlage ist heute das Hotel „Loggiato dei Serviti“; die Familie Budini Gattai übernahm den Betrieb 1984 und ließ das Haus in zwei Jahren restaurieren, davor war es eine Pension (Quelle: it.wikipedia, Loggiato dei Servi di Maria).' },
    hotel_empfang: { title: 'Empfangshalle', description: 'Halle im Erdgeschoss um die Treppe und einen Lichthof: Schachboden aus Cotto und Marmor, Wandfelder in Weiß und Gelb zwischen Pilastern aus Pietra serena und ein Tresen aus Holz.', tip: 'Die Treppe in der Mitte lässt du frei.', caution: VER + ' Lage und Größe der Halle sind nicht belegt.', fact: 'Die Häuser der Anlage sind um einen zentralen Hof (Corte) angeordnet, je zwei Häuser haben einen gemeinsamen Eingang (Quelle: it.wikipedia, Loggiato dei Servi di Maria).' },
    oratorium: { title: 'Oratorium der Bruderschaft', description: 'Kleiner Betsaal im Erdgeschoss des Hinterhauses: Boden im Rot-Weiß-Schach, Wandfelder in Weiß und Blau mit Goldrahmen, ein Altar aus Pietra serena mit einem Altarbild als Farbfeld und drei Bankreihen.', tip: 'Erst Boden und Wandfelder, dann Altar und Bänke.', caution: VER + ' Das Altarbild ist nur als Farbfeld angedeutet; Lage und Größe des Raumes sind nicht belegt.', fact: 'Im Gebäude befindet sich das Oratorium der Confraternita di San Girolamo e San Francesco Poverino mit Werken unter anderem von Gennaro Landi und Andrea del Verrocchio (Quelle: it.wikipedia, Loggiato dei Servi di Maria).' },
    gedenktafel_1613: { title: 'Gedenktafel von 1613', description: 'Auf der Rückwand der Loggia zwischen zwei Türen sitzt eine Tafel als Farbfeld: weiße Schriftfläche mit Goldrahmen und einer dunklen Zeile.', tip: 'Die Tafel ersetzt Wandblöcke, der Rahmen zuerst.', caution: VER + ' Die Schrift ist nicht lesbar nachgebaut; die genaue Lage der Tafel ist nicht belegt.', fact: 'Eine Tafel von 1613 verbietet unter den Loggien Spiele, Abfälle und Versammlungen; die Strafe beträgt 10 Scudi (Quelle: it.wikipedia, Loggiato dei Servi di Maria).' },
    lichthoefe: { title: 'Lichthöfe', description: 'Der Boden der sechs kleinen Höfe im Hinterhaus ist im Schachmuster aus Pflaster und hellem Marmor gelegt; die Höfe bleiben nach oben offen.', tip: 'Nur der Boden, kein Dach.', caution: VER + ' Zahl und Lage der Höfe folgen den Löchern im OSM-Umriss.', fact: 'Der Umriss des Gebäudes in OpenStreetMap hat sechs kleine Innenhöfe (Quelle: OpenStreetMap, Relation 7021619).' },
    licht_ausstattung: { title: 'Licht in den Räumen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { TREPPE, WAENDE, TEILE, INHALT, VORDER, HINTER, ausstatten, oeffnungen };
