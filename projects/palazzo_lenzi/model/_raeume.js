'use strict';
// Raumplan, Loggetta und Ausstattung des Palazzo Lenzi (W8a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_lenzi/).
// Rahmen LN (theta 133,82 Grad): u entlang der Fassade zur Piazza d'Ognissanti (0..69), w von der Fassade ins Haus.
// Umriss: Hauptblock w 0..42 (u 0..69), Flügel zur Via Montebello w 42..67 (u 43..69); Borgo Ognissanti an der Kante u = 0, Via Montebello bei u = 69.
// Geschosse: EG Lage 0..10, 1. OG 10..20, 2. OG 20..30. Raumaufteilung Stufe C; Existenz von Loggetta, Sälen, Theater und Wappen nach it.wikipedia (Palazzo Lenzi).
const { kit, typen, schach, kassette, schildMotiv } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

const GESCHOSSE = [10, 10, 10];
const ACHSE = 13.7;                                                  // Achsabstand der fünf Portale und Fensterreihen
const PORTALE = [0, 1, 2, 3, 4].map((k) => ({ u: 6.85 + ACHSE * k, w: 0, breite: 6, hoehe: 8 })).concat([{ u: 0, w: 30, breite: 5, hoehe: 7 }]);   // fünf Portale zur Piazza, Seitenportal zum Borgo Ognissanti
const TREPPE = { u: 20.5, w: 10 };                                  // Wendeltreppe im zweiten Vorderraum

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [13.7, 27.4, 41.1, 54.8].map((v) => ({ achse: 'u', v, von: -2, bis: 18.5, tueren: [9] })).concat([
  { achse: 'w', v: 19.5, von: -2, bis: 71, tueren: [6.85, 34.3, 61.65] },   // Vorderräume | Hinterräume
  { achse: 'u', v: 41.1, von: 20.5, bis: 41.5, tueren: [31] },       // Ausstellungssaal | Bibliothek
  { achse: 'w', v: 42.5, von: 42, bis: 71, tueren: [55] }            // Hinterhaus | Flügel
]);

const TEILE = ['vestibolo', 'ausstellungssaal', 'bibliothek', 'stanza_alcova', 'teatro', 'dachloggetta', 'wappen', 'licht_ausstattung'];

/** Loggetta im obersten Geschoss über dem mittleren Portal: drei Rechtecköffnungen (3 breit, 5 hoch) auf einer Brüstung von 2 Blöcken. */
function loggetta(api) {
  const { D, oeffnung, BASIS, Y } = api;
  const b = BASIS[2];
  const mitten = [34.3 - 5, 34.3, 34.3 + 5];
  for (const c of D.haupt) {
    if (c.d8 > 2 || c.w > 2.5) continue;
    if (!mitten.some((m) => Math.abs(c.u - m) < 1.5)) continue;
    for (let yr = b + 3; yr <= b + 7; yr++) oeffnung('loggia', 'aussenwand', c.x, Y(yr), c.z);
  }
}

function ausstatten(api) {
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Vestibül hinter dem mittleren (ursprünglichen) Portal
  {
    const z = K.steh(0, { u0: 28.5, u1: 40, w0: 0.5, w1: 18.4 });
    K.boden('vestibolo', 0, z, (c) => schach(c, 3, t.serena, t.weiss));
    K.waende('vestibolo', 0, z, { pitch: 7, y0: 2, y1: 6, farben: ['weiss'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena } });
  }

  // ------------------------------------------------------------ Ausstellungssaal (EG) mit Gewölberippen
  {
    const z = K.steh(0, { u0: 0, u1: 40, w0: 20.6, w1: 41 });
    K.boden('ausstellungssaal', 0, z, (c) => schach(c, 4, t.pflaster, t.weiss));
    K.waende('ausstellungssaal', 0, z, { pitch: 8, y0: 2, y1: 6, farben: ['weiss'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 1, typ: t.serena } });
    K.decke('ausstellungssaal', 0, z, (c, d) => {                    // Kreuzgewölbe angedeutet: Rippenraster im Abstand 8, Kappen 1 Block tiefer an den Kreuzungen
      const a = ((Math.floor(c.u) % 8) + 8) % 8, b = ((Math.floor(c.w) % 8) + 8) % 8;
      if (d === 0) return a === 0 || b === 0 || a === 4 && b === 4 ? t.serena : t.putz;
      return a <= 1 && b <= 1 ? t.serena : null;
    }, 2);
  }

  // ------------------------------------------------------------ Bibliothek (1. OG, über dem Ausstellungssaal)
  {
    const z = K.steh(1, { u0: 0, u1: 40, w0: 20.6, w1: 41 });
    K.boden('bibliothek', 1, z, (c) => schach(c, 3, t.holz, t.cotto));
    K.waende('bibliothek', 1, z, { pitch: 6, y0: 1, y1: 6, farben: ['braun', 'rot', 'gruen'], rahmen: t.holz, pilaster: t.holz, sockel: { h: 1, typ: t.holz } });
    K.decke('bibliothek', 1, z, (c) => kassette(c, 5, t.holz, t.putz, null));
    K.quader('bibliothek', 1, { u0: 12, u1: 28, w0: 29, w1: 31 }, 1, 1, t.holz);       // Lesetisch
  }

  // ------------------------------------------------------------ Stanza dell'Alcova (1. OG): Stuck, Bogen mit den Wappen Buini und Frescobaldi
  {
    const z = K.steh(1, { u0: 42.2, u1: 68.8, w0: 20.6, w1: 41 });
    K.boden('stanza_alcova', 1, z, (c) => schach(c, 3, t.cotto, t.weiss));
    K.waende('stanza_alcova', 1, z, { pitch: 8, y0: 2, y1: 6, farben: ['weiss'], rahmen: t.gold, pilaster: t.weiss, sockel: { h: 1, typ: t.holz }, fries: t.gold,
      motiv: (k, q, j, B, H) => schildMotiv(k, q, j, B, H, [FR('rot'), FR('blau')], t.gold, t.weiss) });
    K.decke('stanza_alcova', 1, z, (c) => ((Math.floor(c.u) + Math.floor(c.w)) % 6 === 0 ? t.gold : FR('hellblau')));
  }

  // ------------------------------------------------------------ Theater (1. OG im Flügel): Bühne, Sitzreihen
  {
    const z = K.steh(1, { u0: 43, u1: 70, w0: 43.6, w1: 67.5 });
    K.boden('teatro', 1, z, (c) => schach(c, 3, t.holz, t.cotto));
    K.waende('teatro', 1, z, { pitch: 8, y0: 2, y1: 6, farben: ['rot', 'weiss'], rahmen: t.gold, pilaster: t.holz, sockel: { h: 1, typ: t.holz } });
    K.decke('teatro', 1, z, (c) => ((Math.floor(c.u) + Math.floor(c.w)) % 5 === 0 ? t.gold : FR('rot')));
    K.quader('teatro', 1, { u0: 45, u1: 68, w0: 62, w1: 66 }, 1, 1, t.holz);                                    // Bühne, ein Block hoch
    for (const w of [46, 49, 52, 55, 58]) {                                                                       // Sitzreihen, ein Block hoch, Mittelgang
      K.quader('teatro', 1, { u0: 46, u1: 55.5, w0: w, w1: w + 1 }, 1, 1, t.holz);
      K.quader('teatro', 1, { u0: 58, u1: 67.5, w0: w, w1: w + 1 }, 1, 1, t.holz);
    }
  }

  // ------------------------------------------------------------ Boden und Decke der Loggetta (2. OG über dem Vestibül)
  {
    const z = K.steh(2, { u0: 28.5, u1: 40, w0: 0.5, w1: 18.4 });
    K.boden('dachloggetta', 2, z, (c) => schach(c, 2, t.cotto, t.terrakotta));
    K.decke('dachloggetta', 2, z, (c) => kassette(c, 5, t.holz, t.putz, null));
  }

  // ------------------------------------------------------------ Wappen: Lenzi an der Ecke zur Piazza, Buini und Strozzi am Seitenportal
  {
    const schild = (farbe) => (c, jj, j) => schildMotiv(0, Math.floor(c.u - 1), jj, 5, 5, [FR(farbe)], t.gold, t.weiss) || null;
    K.flaeche('wappen', 0, { u0: 1, u1: 6, w0: 0, w1: 2.5 }, 5, 9, schild('rot'));                              // Lenzi (Farbe nicht belegt)
    K.flaeche('wappen', 0, { u0: 0, u1: 2.5, w0: 22.5, w1: 27.5 }, 3, 7, (c, jj, j) => schildMotiv(0, Math.floor(c.w - 22.5), jj, 5, 5, [FR('blau')], t.gold, t.weiss) || null);   // Buini (Farbe nicht belegt)
    K.flaeche('wappen', 0, { u0: 0, u1: 2.5, w0: 32.5, w1: 37.5 }, 3, 7, (c, jj, j) => schildMotiv(0, Math.floor(c.w - 32.5), jj, 5, 5, [FR('gelb')], t.gold, t.weiss) || null);   // Strozzi (Farbe nicht belegt)
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const Q = '(Quelle: it.wikipedia, Palazzo Lenzi)';
const INHALT = {
  titel: 'Ausgestaltete Räume und Wappen', untertitel: 'Vestibül, Ausstellungssaal, Bibliothek, Alkoven, Theater, Loggetta und Wappen', icon: '🏛️',
  teile: {
    vestibolo: { title: 'Vestibül hinter dem mittleren Portal', description: 'Eingangshalle hinter dem mittleren der fünf Portale: Schachboden aus Pietra serena und Marmor, Wandfelder zwischen Pilastern.', tip: 'Boden zuerst, dann das Wandraster.', caution: VER + ' Lage und Größe Stufe C; die Quelle sagt nur, dass im Erdgeschoss allein das mittlere Portal original ist.', fact: `Von den fünf großen Portalen zur Piazza ist im Erdgeschoss nur das zentrale ursprünglich ${Q}.` },
    ausstellungssaal: { title: 'Ausstellungssaal mit Gewölben', description: 'Saal im Erdgeschoss hinter den Vorderräumen: Schachboden aus Pflaster und Marmor, Wandfelder zwischen Pilastern aus Pietra serena und eine Decke mit Rippen im Abstand von acht Blöcken, die Kreuzgewölbe andeuten.', tip: 'Boden, Wandraster, dann die Rippen unter der Decke.', caution: VER + ' Die Gewölbe sind nur als Rippenraster angedeutet, die Kapitelle nicht ausgeformt; Lage Stufe C.', fact: `Der Ausstellungssaal hat Gewölbe, deren Kapitelle vielleicht neoquattrocentesk sind ${Q}.` },
    bibliothek: { title: 'Bibliothek', description: 'Saal im ersten Obergeschoss über dem Ausstellungssaal: Bretterboden mit Cotto im Schachmuster, Regalwände in Braun, Rot und Grün zwischen Pilastern aus Holz, Kassettendecke und ein Lesetisch.', tip: 'Boden, Regalwand, Decke, zuletzt der Tisch.', caution: VER + ' Die Regale sind Farbfelder (Buchrücken); Lage Stufe C.', fact: `Das Haus beherbergt eine Bibliothek mit der Stanza dell'Alcova ${Q}.` },
    stanza_alcova: { title: "Stanza dell'Alcova", description: 'Raum im ersten Obergeschoss neben der Bibliothek: Stuckwände in Weiß und Gold, Schilder in Rot und Blau, Deckenfeld in Hellblau mit Goldleisten.', tip: 'Wandfelder, Fries, dann die Decke.', caution: VER + ' Stuck und Wappen sind nur Farbflächen, ihre Farben sind nicht belegt; Lage Stufe C.', fact: `Die Stanza dell'Alcova hat Stuckdekor und einen Bogen mit den Wappen der Buini und Frescobaldi, der an eine Hochzeit von 1705 erinnert ${Q}.` },
    teatro: { title: 'Theater', description: 'Saal im ersten Obergeschoss des Flügels zur Via Montebello: Holzboden, rote Wandfelder, Bühne und fünf Sitzreihen (je ein Block hoch) mit Mittelgang, Decke in Rot und Gold.', tip: 'Boden, Wandraster, Decke, dann Bühne und Reihen.', caution: VER + ' Form, Größe und Lage des Theaters sind nicht belegt (Stufe C); nur seine Existenz im ersten Stock.', fact: `Im ersten Stock gibt es ein Theater ${Q}.` },
    dachloggetta: { title: 'Loggetta im obersten Geschoss', description: 'Offene Loggetta über dem mittleren Portal: drei Rechtecköffnungen auf einer Brüstung von zwei Blöcken, dahinter Cottoboden und Balkendecke.', tip: 'Boden und Decke zuerst, die Öffnungen bleiben frei.', caution: VER + ' Lage und Zahl der Öffnungen sind Entwurf; die Quelle nennt die Loggetta nur im obersten Geschoss.', fact: `Im obersten Geschoss sitzt eine Loggetta, die vermutlich auf alte Ansichten zurückgeht ${Q}.` },
    wappen: { title: 'Wappen', description: 'Schilder aus Farbblöcken mit Goldrand: eines der Lenzi an der Ecke zur Piazza, zwei neben dem Seitenportal zum Borgo Ognissanti (Buini und Strozzi).', tip: 'Die Schilder ersetzen einzelne Wandblöcke.', caution: VER + ' Die Farben der Wappen sind nicht belegt.', fact: `Die Ecke zwischen Piazza und Borgo Ognissanti trägt ein Wappen der Lenzi; das Seitenportal zum Borgo trägt die Wappen der Buini und der Strozzi ${Q}.` },
    licht_ausstattung: { title: 'Licht in den Räumen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { GESCHOSSE, ACHSE, PORTALE, TREPPE, WAENDE, TEILE, INHALT, loggetta, ausstatten };
