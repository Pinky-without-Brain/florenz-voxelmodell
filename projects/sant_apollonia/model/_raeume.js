'use strict';
// Raumplan und Ausstattung von Sant'Apollonia (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/sant_apollonia/).
// Rahmen SA (theta 28,75 Grad): u entlang der Fassade zur Via XXVII Aprile (West → Ost, 0..117), w von ihr ins Gebäude (0..195).
// Aufbau: Vorderblock w 0..50 mit den Höfen 0 und 1, Mittelstreifen u 88..118 an der Via San Gallo (w 51..120), Hinterblock
// w 120..195 mit den großen Kreuzgängen 2 und 3 (Mensa). Geschosse: EG Lage 0..18, Obergeschoss 18..30.
// Lage der Räume Stufe C; belegt sind Refektorium mit Abendmahl (Westwand), Fenster zur Straße, Kirche an der Via San Gallo,
// Mensa im Kreuzgang an der Via Santa Reparata und der Eingang des Museums an der Via XXVII Aprile.
const { kit, typen, schach, kassette, mod, hash } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

const TREPPE = { u: 45, w: 38 };
const GAERTEN = [0, 1, 3];                                    // Kreuzgänge mit Rasen; Loch 2 (Chiostro della Badessa) gepflastert

// Portale: Museum (Cenacolo, Via XXVII Aprile 1), Kirche (Via San Gallo, Portal nach Dosio), Mensa (Via Santa Reparata)
const PORTALE = [
  { name: 'museum', test: (c) => c.w < 6, v: (c) => c.u - 106, breite: 5, hoehe: 9 },
  { name: 'kirche', test: (c) => c.u > 110 && c.w > 60 && c.w < 110, v: (c) => c.w - 86, breite: 6, hoehe: 10 },
  { name: 'mensa', test: (c) => c.u < 6 && c.w > 110 && c.w < 160, v: (c) => c.w - 133, breite: 5, hoehe: 9 }
];
const fensterAus = (c) => PORTALE.some((p) => p.test(c) && Math.abs(p.v(c)) < p.breite / 2 + 2.5);
function oeffnungen(api) {
  const { D, Y, oeffnung } = api;
  const bogen = (b, h, v) => Math.floor(h - b / 2 + Math.sqrt(Math.max(0, (b / 2) ** 2 - v * v)));
  for (const c of D.haupt) {
    if (c.d8 > 2) continue;
    for (const p of PORTALE) {
      if (!p.test(c)) continue;
      const v = p.v(c);
      if (Math.abs(v) >= p.breite / 2) continue;
      for (let yr = 1; yr <= bogen(p.breite, p.hoehe, v); yr++) oeffnung('tor', 'portale', c.x, Y(yr), c.z);
    }
  }
}

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3,4 × 5)
const WAENDE = [
  { achse: 'u', v: 89.5, von: 0, bis: 29.5, tueren: [] },             // Westwand des Refektoriums (Abendmahl)
  { achse: 'w', v: 29.5, von: 89.5, bis: 118, tueren: [104] },        // Südwand des Refektoriums
  { achse: 'u', v: 30, von: 30, bis: 51, tueren: [40] },              // Vorderblock, Südflügel
  { achse: 'u', v: 60, von: 30, bis: 51, tueren: [40] },
  { achse: 'w', v: 76, von: 70, bis: 119, tueren: [112] },            // Kirche im Mittelstreifen
  { achse: 'w', v: 96, von: 70, bis: 119, tueren: [104] },
  { achse: 'u', v: 89, von: 70, bis: 100, tueren: [86] },             // Westwand der Kirche (Apsiswand), Tür zur Sakristei im Westen
  { achse: 'u', v: 30, von: 119, bis: 146, tueren: [133] },           // Hinterblock, Nordflügel (Mensa im Westen)
  { achse: 'u', v: 60, von: 119, bis: 146, tueren: [133] },
  { achse: 'u', v: 90, von: 119, bis: 146, tueren: [133] }
];

const KIRCHE = { u0: 90.2, u1: 117, w0: 77.1, w1: 94.9 };
const REFEKTORIUM = { u0: 90.7, u1: 118, w0: 2, w1: 29 };
const MENSA = { u0: 2, u1: 29, w0: 121, w1: 145 };

const TEILE = ['cenacolo', 'abendmahl', 'cenacolo_oben', 'chiostro_badessa', 'meucci_lunette', 'kirche', 'kirche_apsis', 'mensa', 'licht_ausstattung'];

function ausstatten(api) {
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Refektorium (Cenacolo): Saal mit Kassettendecke, Abendmahl auf der Westwand
  {
    const z = K.steh(0, REFEKTORIUM);
    K.boden('cenacolo', 0, z, (c) => schach(c, 3, t.cotto, t.weiss));
    K.waende('cenacolo', 0, z, { pitch: 9, y0: 2, y1: 15, farben: ['weiss', 'gelb'], rahmen: t.holz, pilaster: t.serena, sockel: { h: 2, typ: t.holz }, fries: t.gold });
    K.decke('cenacolo', 0, z, (c) => kassette(c, 5, t.holz, t.putz, t.gold));
    // lange Tische der Nonnen an den Längswänden (eine Lage hoch), Gang in der Mitte
    K.quader('cenacolo', 0, { u0: 96, u1: 114, w0: 8, w1: 9.5 }, 1, 1, t.holz);
    K.quader('cenacolo', 0, { u0: 96, u1: 114, w0: 22, w1: 23.5 }, 1, 1, t.holz);
  }
  // Abendmahl (Castagno 1447, ca. 9,75 × 4,5 m = 19,5 × 9 Blöcke): Westwand, Gesichtsfeld nach Osten; ein Tisch, dreizehn Gestalten
  K.flaeche('abendmahl', 0, { u0: 89.7, u1: 90.8, w0: 5, w1: 25 }, 3, 11, (c, jj) => {
    const q = c.w - 5;                                               // 0..20; links (Betrachter nach Westen) = große w
    const qi = Math.floor(q);
    if (q < 0.5 || q > 19.5 || jj === 0 || jj === 8) return t.gold;  // Rahmen
    if (jj >= 5) return ((Math.floor(qi / 3) & 1) ? FR('orange') : FR('rot'));   // Marmortafeln im Hintergrund
    const fig = qi >= 1 && qi <= 18;
    if (jj === 1) return qi < 1 || qi > 18 ? FR('braun') : FR('weiss');         // Tischtuch
    if (jj === 0) return FR('braun');
    if (!fig) return FR('braun');
    if (jj === 4) return (qi === 9 || qi === 10) ? t.gold : FR('orange');       // Köpfe; Heiligenschein Christi in der Mitte
    return (qi === 9 || qi === 10) ? FR('weiss') : [FR('blau'), FR('gruen'), FR('rot'), FR('gelb'), FR('braun')][hash(qi, 3, 5) % 5];   // Gewänder
  });
  // oberes Register (Auferstehung, Kreuzigung, Grablegung von links nach rechts), von zwei Fenstern unterbrochen
  K.flaeche('cenacolo_oben', 0, { u0: 89.7, u1: 90.8, w0: 5, w1: 25 }, 13, 17, (c, jj) => {
    const q = 20 - (c.w - 5);                                        // von links (Betrachter nach Westen) nach rechts, 0..20
    if (jj === 0 || jj === 4 || c.w - 5 < 0.5 || c.w - 5 > 19.5) return t.gold;
    if ((q >= 7 && q < 8.5) || (q >= 13 && q < 14.5)) return FR('hellblau');       // die beiden Fenster
    if (q < 7) return jj <= 1 ? FR('braun') : (Math.abs(q - 3) < 1 && jj <= 3 ? FR('weiss') : FR('hellblau'));   // Auferstehung: Grab, Christus
    if (q < 13) {                                                                   // Kreuzigung
      if (Math.abs(q - 10.5) < 0.6 || (jj === 2 && Math.abs(q - 10.5) < 2)) return FR('braun');
      return jj <= 1 ? FR('gruen') : FR('hellblau');
    }
    return jj <= 1 ? FR('gruen') : (Math.abs(q - 17) < 1.5 && jj === 2 ? FR('weiss') : FR('hellblau'));   // Grablegung
  });

  // ------------------------------------------------------------ Chiostro della Badessa (Hof 2): Pflaster mit Wegekreuz, Lünette von Meucci
  K.hofboden('chiostro_badessa', { u0: 40, u1: 95, w0: 160, w1: 190 }, (c) => (Math.abs(c.u - 66) < 1.2 || Math.abs(c.w - 176) < 1.2 ? t.serena : schach(c, 3, t.pflaster, t.weiss)));
  K.flaeche('meucci_lunette', 0, { u0: 58, u1: 74, w0: 164, w1: 168 }, 11, 17, (c, jj) => {
    if (c.dHof !== 1) return null;
    const d = Math.hypot(c.u - 66, jj);
    if (d > 6) return null;
    if (d > 5) return t.gold;
    return jj > 3 ? FR('hellblau') : [FR('rot'), FR('weiss'), FR('blau'), FR('gelb')][Math.floor(c.u) % 4];
  });

  // ------------------------------------------------------------ Kirche (Mittelstreifen an der Via San Gallo): Schiff, Kassettendecke, Altar, Apsis
  {
    const z = K.steh(0, KIRCHE);
    K.boden('kirche', 0, z, (c) => (Math.abs(c.w - 86) < 1.2 ? t.ornament : schach(c, 3, t.weiss, t.rot)));
    K.waende('kirche', 0, z, { pitch: 8, y0: 2, y1: 13, farben: ['weiss', 'gelb'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.gruen }, fries: t.gold });
    K.decke('kirche', 0, z, (c) => kassette(c, 5, t.holz, t.putz, t.gold), 1);
    K.quader('kirche', 0, { u0: 92, u1: 95, w0: 83, w1: 89 }, 1, 1, t.serena);                   // Altartisch
    for (let u = 100; u <= 112; u += 4) for (const [w0, w1] of [[79, 84], [88, 93]]) K.quader('kirche', 0, { u0: u, u1: u + 1.5, w0, w1 }, 1, 1, t.holz);   // Bänke
  }
  K.flaeche('kirche_apsis', 0, { u0: 88.95, u1: 90.15, w0: 79, w1: 93 }, 3, 13, (c, jj) => {
    const q = c.w - 79;
    if (jj === 0 || jj === 10 || q < 0.5 || q > 13.5) return t.gold;
    if (jj >= 7) return FR('hellblau');
    return [FR('braun'), FR('rot'), FR('weiss'), FR('blau'), FR('gelb'), FR('orange')][Math.floor(q) % 6];
  });

  // ------------------------------------------------------------ Mensa im Kreuzgang an der Via Santa Reparata
  {
    const z = K.steh(0, MENSA);
    K.boden('mensa', 0, z, (c) => schach(c, 3, t.pflaster, t.weiss));
    K.waende('mensa', 0, z, { pitch: 9, y0: 3, y1: 8, farben: ['weiss', 'gelb'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.holz } });
    for (let w = 124; w <= 140; w += 4) {
      K.quader('mensa', 0, { u0: 8, u1: 26, w0: w, w1: w + 1.5 }, 1, 1, t.holz);                // Tische
    }
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, Lage und Größe Stufe C.';
const INHALT = {
  titel: 'Cenacolo, Kreuzgänge, Kirche und Mensa', untertitel: 'Refektorium mit Abendmahl, Chiostro della Badessa, ehemalige Kirche und Mensa', icon: '🍷',
  teile: {
    cenacolo: { title: 'Cenacolo (Refektorium)', description: 'Großer rechteckiger Saal im Erdgeschoss an der Via XXVII Aprile: Schachboden aus Cotto und Marmor, Wandfelder in Weiß und Gelb mit Holzrahmen und Pilastern, Kassettendecke aus Holz und Gold, zwei lange Tische. Die Fenster liegen in der Straßenwand.', tip: 'Boden zuerst, dann die Wandfelder, die Decke zuletzt.', caution: VER + ' Die Höhe des Saales und die Zahl der Fenster sind nicht belegt; die Lage im Erdgeschoss folgt dem Eingang des Museums (Via XXVII Aprile 1).', fact: 'Das Refektorium ist ein großer rechteckiger Saal mit Kassettendecke und einer Fensterreihe an der rechten Wand; Äbtissin Cecilia Donati ließ nach 1440 Kreuzgang und Cenacolo erweitern (Quelle: it.wikipedia, Cenacolo di Sant\'Apollonia).' },
    abendmahl: { title: 'Abendmahl von Andrea del Castagno', description: 'Auf der Westwand des Saals ein Farbfeld von 19 × 9 Blöcken: Marmortafeln in Rot und Orange im Hintergrund, ein langer Tisch mit weißem Tuch, dreizehn Gestalten in verschiedenen Gewändern, in der Mitte Christus in Weiß mit goldenem Heiligenschein, Goldrahmen.', tip: 'Von unten nach oben: Tisch, Gewänder, Köpfe, Hintergrund, Rahmen.', caution: VER + ' Gesichter, Gesten und die Anordnung der Apostel sind nicht nachgebildet; das Bild steht für das Fresko.', fact: 'Andrea del Castagno malte das Abendmahl 1447 (Eingriff Juni bis Herbst 1447); es nimmt die ganze Westwand des Refektoriums ein, das Maß von 9,75 × 4,5 m nennt der Auftrag (Quelle: it.wikipedia, Cenacolo di Sant\'Apollonia).' },
    cenacolo_oben: { title: 'Auferstehung, Kreuzigung und Grablegung', description: 'Über dem Abendmahl drei Farbfelder von links nach rechts (Betrachter schaut nach Westen): Auferstehung, Kreuzigung, Grablegung; dazwischen zwei hellblaue Streifen für die beiden Fenster. Goldene Rahmen oben und unten.', tip: 'Die Rahmen zuerst, dann die drei Bilder von links.', caution: VER + ' Die Szenen sind nur durch Farben und je eine Hauptfigur angedeutet; die Fenster sind gemalt, nicht verglast.', fact: 'Über dem Abendmahl zeigt der obere Teil von links Auferstehung, Kreuzigung und Grablegung, von zwei Fenstern unterbrochen; der obere Teil wurde 1953 abgelöst, die Sinopien 1961 abgenommen (Quelle: it.wikipedia, Cenacolo di Sant\'Apollonia).' },
    chiostro_badessa: { title: 'Chiostro della Badessa', description: 'Der Boden des größten Kreuzgangs ist im Schachmuster aus Pflaster und Marmor gelegt, durchzogen von zwei Wegen aus Pietra serena; ringsum laufen Rundbogenarkaden auf Säulen.', tip: 'Erst die Wegekreuz-Streifen, dann das Schachmuster.', caution: VER + ' Welcher der vier Höfe der Kreuzgang der Äbtissin ist, ist nicht belegt; der größte ist gewählt. Die ionischen Säulen und das obere Geschoss sind durch Arkaden und Fenster ersetzt.', fact: 'Der Kreuzgang der Äbtissin wurde 1442 begonnen, hat zwei Geschosse und eine ionische Kolonnade und wird seit 2010 restauriert (Quelle: it.wikipedia, Complesso di Sant\'Apollonia).' },
    meucci_lunette: { title: 'Lünette von Vincenzo Meucci', description: 'Über den Arkaden des Kreuzgangs, auf der Hofseite, ein halbrundes Farbfeld in Blau, Rot, Weiß und Gelb mit Goldrand.', tip: 'Von außen nach innen: Goldrand, dann die Füllung.', caution: VER + ' Das Motiv ist nur als Farbfläche angedeutet; die Lage an der Nordseite des Hofs ist nicht belegt.', fact: 'Die einzige noch an Ort und Stelle erhaltene Lünette des Kreuzgangs malte Vincenzo Meucci 1735 bis 1737 (Quelle: it.wikipedia, Complesso di Sant\'Apollonia).' },
    kirche: { title: 'Ehemalige Klosterkirche', description: 'Einschiffige Kirche im Mittelstreifen an der Via San Gallo: Marmorboden mit Mittelstreifen und Rot-Weiß-Schach, Wandfelder in Weiß und Gelb zwischen Pilastern, Kassettendecke aus Holz und Gold, Altartisch aus Pietra serena und vier Bankreihen. Das Portal liegt in der Ostwand zur Via San Gallo.', tip: 'Erst Boden und Wandfelder, dann Decke, Altar und Bänke.', caution: VER + ' Die Lage entlang der Via San Gallo, die Größe und das Portal sind Stufe C; der Nonnenchor auf Säulen ist nicht gebaut.', fact: 'Die Kirche ist einschiffig mit einem Nonnenchor auf Säulen und einer hölzernen Kassettendecke mit dem Wappen des Klosters; das Portal an der Via San Gallo wurde Michelangelo zugeschrieben, gilt heute als Werk von Giovanni Antonio Dosio; sie dient heute als Tagungssaal (Quelle: it.wikipedia, Complesso di Sant\'Apollonia).' },
    kirche_apsis: { title: 'Apsis mit Fresken Poccettis', description: 'Auf der Westwand der Kirche hinter dem Altar ein Farbfeld von 14 × 11 Blöcken: ein hellblauer Himmel über einer Reihe bunter Gestalten, mit Goldrahmen.', tip: 'Die Farbfelder ersetzen Wandblöcke hinter dem Altar.', caution: VER + ' Das Bildprogramm Poccettis ist nicht belegt; es sind nur Farben angedeutet.', fact: 'Die Apsis trägt Fresken von Bernardino Poccetti (Quelle: it.wikipedia, Complesso di Sant\'Apollonia).' },
    mensa: { title: 'Mensa im Kreuzgang', description: 'Speisesaal der Studierenden im Erdgeschoss des Hinterblocks an der Via Santa Reparata: Pflaster-Marmor-Schachboden, Wandfelder, fünf lange Holztische (eine Lage hoch).', tip: 'Die Tische stehen quer zum Saal, dazwischen bleibt ein Gang.', caution: VER + ' Lage und Größe des Saals sind nicht belegt, belegt ist nur die Mensa im Kreuzgang an der Via Santa Reparata.', fact: 'Im Kreuzgang an der Via Santa Reparata befindet sich die Mensa der Universität; die Räume dienen heute zum Teil dem Verteidigungsministerium und der Universität Florenz (Quelle: it.wikipedia, Complesso di Sant\'Apollonia).' },
    licht_ausstattung: { title: 'Licht in den Sälen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { TREPPE, GAERTEN, WAENDE, TEILE, INHALT, PORTALE, KIRCHE, REFEKTORIUM, MENSA, fensterAus, ausstatten, oeffnungen };
