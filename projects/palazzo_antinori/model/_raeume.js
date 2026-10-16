'use strict';
// Raumplan und Ausstattung des Palazzo Antinori (W7a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_antinori/).
// Rahmen AN (theta -179,63 Grad): u entlang der Fassade zur Piazza degli Antinori (nach Westen), w von der Fassade nach Norden.
// Geschosse: EG Lage 0..8, Piano nobile 8..16, 2. OG 16..23. Der Hof (Loch 0) liegt bei u 27,2..43,2, w 30,8..43,8. Das frühere Haus der
// Via delle Belle Donne liegt im Westen (u 106..133). Raumaufteilung Stufe C; Existenz von Cantinetta, Kassettendecken, Stallungen und
// Brunnen nach it.wikipedia, Palazzo Antinori.
const { kit, typen, schach, kassette } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

// Fensterraster 9,6 (acht Achsen auf 77 Blöcken, Mitten bei u 4,9 + 9,6 k); das schlichte Portal liegt in der Mitte der Fassade (u 38,5)
const FENSTER = { abstand: 9.6, breite: 4, versatz: 28.9, sohle: [2, 2, 2], hoehe: [3, 5, 4], bifora: [false, false, false] };
const PORTALE = [{ u: 38.5, w: 0, breite: 5, hoehe: 7 }, { u: 130, w: 33.7, breite: 6, hoehe: 7 }];
const TREPPE = { u: 9, w: 36 };
const HOF = { u: 35.2, w: 37.3, hu: 8, hw: 6.5 };

// Türen der Hof-Innenwand: je Seite eine Tür 3 Blöcke breit; an der Fassadenseite in der Achse des Portals
function innenwandTuer(c) {
  const du = Math.abs(c.u - HOF.u) - HOF.hu, dw = Math.abs(c.w - HOF.w) - HOF.hw;
  if (du > dw) return Math.abs(c.w - HOF.w) < 1.5;                                          // Ost- und Westseite des Hofs
  return Math.abs(c.u - (c.w < HOF.w ? 38.5 : HOF.u)) < 1.5;                                // Fassadenseite (Portalachse) und Nordseite
}

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [
  { achse: 'u', v: 35, von: 0.5, bis: 24, tueren: [10] },            // Cantinetta | Durchgang
  { achse: 'u', v: 42, von: 0.5, bis: 24, tueren: [10] },            // Durchgang | Ostraum
  { achse: 'w', v: 24.5, von: -4, bis: 78, tueren: [10, 62] }        // Vorderräume | Seitenflügel
];

const TEILE = ['androne', 'cantinetta', 'hof_antinori', 'pozzo', 'sala_cassettoni_ovest', 'sala_cassettoni_est', 'scuderie', 'treppe_stalltor', 'stemma', 'licht_ausstattung'];

function ausstatten(api) {
  const { D, Y, set } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Durchgang vom Portal zum Hof (EG)
  {
    const z = K.steh(0, { u0: 36, u1: 41.5, w0: 0.5, w1: 24 });
    K.boden('androne', 0, z, (c) => schach(c, 2, t.serena, t.weiss));
    K.waende('androne', 0, z, { pitch: 8, y0: 2, y1: 5, farben: ['weiss'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 1, typ: t.serena }, nurTeile: ['aussenwand', 'trennwaende'] });
  }

  // ------------------------------------------------------------ Cantinetta Antinori (EG, Vorderraum West): Tische und Bänke
  {
    const z = K.steh(0, { u0: -3, u1: 34, w0: 0.5, w1: 24 });
    K.boden('cantinetta', 0, z, (c) => schach(c, 3, t.cotto, t.holz));
    K.waende('cantinetta', 0, z, { pitch: 10, y0: 2, y1: 5, farben: ['weiss', 'gelb'], rahmen: t.holz, pilaster: t.serena, sockel: { h: 1, typ: t.holz }, nurTeile: ['aussenwand', 'trennwaende'] });
    for (const w of [6, 14]) for (const u of [3, 12, 21]) {
      K.quader('cantinetta', 0, { u0: u, u1: u + 4, w0: w, w1: w + 2 }, 1, 1, t.holz);                // Tisch
      K.quader('cantinetta', 0, { u0: u, u1: u + 4, w0: w - 1.5, w1: w - 0.5 }, 1, 1, t.holz);          // Bank
    }
  }

  // ------------------------------------------------------------ Hof: Pflaster mit Wegekreuz, Ziehbrunnen
  K.hofboden('hof_antinori', { u0: 26.5, u1: 44, w0: 30, w1: 44.5 }, (c) => {
    if (Math.abs(c.u - HOF.u) < 1.2 || Math.abs(c.w - HOF.w) < 1.2) return t.serena;
    return ((Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1) ? t.pflaster : t.weiss;
  });
  K.brunnen('pozzo', 0, HOF.u, HOF.w, 2.6, { saeule: 3 });

  // ------------------------------------------------------------ Säle im Piano nobile mit bemalten Kassettendecken
  {
    const z = K.steh(1, { u0: -12, u1: 20, w0: 25, w1: 50 });
    K.boden('sala_cassettoni_ovest', 1, z, (c) => schach(c, 4, t.cotto, t.weiss));
    K.waende('sala_cassettoni_ovest', 1, z, { pitch: 10, y0: 2, y1: 5, farben: ['weiss', 'gelb'], rahmen: t.holz, pilaster: t.serena, sockel: { h: 2, typ: t.holz }, nurTeile: ['aussenwand', 'trennwaende_og', 'trennwaende'] });
    K.decke('sala_cassettoni_ovest', 1, z, (c) => kassette(c, 6, t.holz, FR('blau'), t.gold));
    K.quader('sala_cassettoni_ovest', 1, { u0: -2, u1: 12, w0: 36, w1: 38 }, 1, 1, t.holz);               // Tafel
  }
  {
    const z = K.steh(1, { u0: 50, u1: 75, w0: 25, w1: 48 });
    K.boden('sala_cassettoni_est', 1, z, (c) => schach(c, 4, t.cotto, t.weiss));
    K.waende('sala_cassettoni_est', 1, z, { pitch: 10, y0: 2, y1: 5, farben: ['weiss', 'hellblau'], rahmen: t.holz, pilaster: t.serena, sockel: { h: 2, typ: t.holz }, nurTeile: ['aussenwand', 'trennwaende_og', 'trennwaende'] });
    K.decke('sala_cassettoni_est', 1, z, (c) => kassette(c, 6, t.holz, FR('rot'), t.gold));
    K.quader('sala_cassettoni_est', 1, { u0: 56, u1: 68, w0: 34, w1: 36 }, 1, 1, t.holz);
  }

  // ------------------------------------------------------------ Stallungen im früheren Haus der Via delle Belle Donne (EG)
  {
    const z = K.steh(0, { u0: 108, u1: 128, w0: 1, w1: 45 });
    K.boden('scuderie', 0, z, (c) => schach(c, 3, t.pflaster, t.terrakotta));
    K.waende('scuderie', 0, z, { pitch: 10, y0: 2, y1: 4, farben: ['weiss'], rahmen: t.holz, sockel: { h: 1, typ: t.holz }, nurTeile: ['aussenwand'] });
    for (let w = 6; w <= 40; w += 8) K.quader('scuderie', 0, { u0: 110, u1: 119, w0: w, w1: w + 1 }, 1, 1, t.holz);   // Boxentrennwände (eine Lage hoch)
    for (let w = 8; w <= 40; w += 8) K.quader('scuderie', 0, { u0: 119, u1: 121, w0: w, w1: w + 1 }, 1, 1, t.holz);   // Krippen
  }

  // ------------------------------------------------------------ Stufen vor dem Stalltor: Die Straße liegt hier bei Y 61, der Boden bei Y 63
  {
    const p = D.R.toWorld(PORTALE[1].u, PORTALE[1].w);
    const cz = Math.round(p.z);
    let face = null;
    for (const c of D.haupt) if (c.z === cz && c.d8 === 1 && (face === null || c.x < face)) face = c.x;
    const treppe = WZ.treppe.geradeTreppe({ start: { x: face - 2, y: Y(0) - 1, z: cz - 3 }, richtung: 'o', stufen: 2, breite: 7, rolle: 'pietra_serena' });
    for (const b of treppe) {
      set(b.x, b.y, b.z, b.typ, 'treppe_stalltor');
      if (b.y - 1 > Y(-2)) set(b.x, b.y - 1, b.z, t.serena, 'treppe_stalltor');                          // Kragstein unter der oberen Stufe
    }
  }

  // ------------------------------------------------------------ Wappen über dem Portal (Mitte der Fassade, Piano nobile)
  K.flaeche('stemma', 1, { u0: 36, u1: 41, w0: -0.5, w1: 2.5 }, 2, 7, (c, jj) => {
    if (c.d8 > 2) return null;
    const q = c.u - 36;
    if (jj === 0 || jj === 5 || q < 0.5 || q > 4.5) return t.gold;                                         // Rahmen
    if (jj >= 4) return FR('rot');                                                                         // Schildhaupt
    return Math.abs(q - 2.5) < 0.8 ? FR('weiss') : FR('blau');                                             // Pfahl und Feld (Farben Stufe C)
  });
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const Q = '(Quelle: it.wikipedia, Palazzo Antinori)';
const INHALT = {
  titel: 'Ausgestaltete Räume, Hof und Stallungen', untertitel: 'Durchgang, Cantinetta, Hof mit Brunnen, Kassettensäle, Stallungen und Wappen', icon: '🍷',
  teile: {
    androne: { title: 'Durchgang zum Hof', description: 'Gang hinter dem schlichten Portal in der Fassadenmitte: Schachboden aus Pietra serena und Marmor, Wandfelder mit Pilastern; am Ende öffnet sich der Hof.', tip: 'Boden zuerst, dann Wandraster.', caution: VER + ' Die Kreuzgewölbe sind nicht gebaut; Lage Stufe C.', fact: `Der Grundriss folgt dem Palazzo Medici mit der Achse Portal, Hof und Garten ${Q}.` },
    cantinetta: { title: 'Cantinetta Antinori', description: 'Gaststube im Erdgeschoss der Westhälfte: Schachboden aus Cotto und Holz, helle Wände mit Holzrahmen, sechs Tische mit je einer Bank (eine Lage hoch).', tip: 'Die Tische stehen in zwei Reihen mit Gang dazwischen.', caution: VER + ' Lage Stufe C.', fact: `Im Erdgeschoss befindet sich seit 1957 das Restaurant Cantinetta Antinori ${Q}.` },
    hof_antinori: { title: 'Hof', description: 'Hofboden mit Wegekreuz aus Pietra serena und Schachmuster aus Pflaster und Marmor zwischen den Arkaden.', tip: 'Erst das Pflaster, dann der Brunnen.', caution: VER + ' Die Arkaden laufen im Modell um vier Seiten (Wirklichkeit: drei Seiten); die Loggia im zweiten Geschoss ist nicht gebaut.', fact: `Der Hof hat auf drei Seiten Portiken mit Rundbögen und Kreuzgewölben, die Säulen aus Pietra serena tragen Kompositkapitelle ${Q}.` },
    pozzo: { title: 'Ziehbrunnen im Hof', description: 'Rundes Becken aus Pietra serena mit Wasserfläche und einer Mittelsäule als Brunnenaufsatz.', tip: 'Becken, Wasser, dann die Säule.', caution: VER + ' Die Verzierung des Brunnenkopfs ist nicht nachgebildet.', fact: `Im Hof steht ein verzierter Ziehbrunnen ${Q}.` },
    sala_cassettoni_ovest: { title: 'Saal mit bemalter Kassettendecke (West)', description: 'Großer Saal im Piano nobile des Westflügels: Cottoboden, helle Wandfelder, Kassettendecke aus Holz mit blau bemalten Feldern und Goldmitten, Tafel.', tip: 'Die Decke als Gitter unter dem Boden des Obergeschosses.', caution: VER + ' Die Konsolen unter der Decke sind nicht gebaut; Lage Stufe C.', fact: `Das Piano nobile hat große bemalte Holzkassettendecken auf Konsolen ${Q}.` },
    sala_cassettoni_est: { title: 'Saal mit bemalter Kassettendecke (Ost)', description: 'Saal im Piano nobile des Ostflügels: Cottoboden, Wandfelder in Weiß und Hellblau, Kassettendecke aus Holz mit rot bemalten Feldern und Goldmitten, Tafel.', tip: 'Die Decke als Gitter unter dem Boden des Obergeschosses.', caution: VER + ' Lage und Farben Stufe C.', fact: `Das Piano nobile hat große bemalte Holzkassettendecken auf Konsolen ${Q}.` },
    scuderie: { title: 'Stallungen und Remisen', description: 'Langgestreckte Halle im früheren Haus an der Via delle Belle Donne: Pflaster im Schachmuster, Boxentrennwände und Krippen aus Holz (eine Lage hoch), Tor zur Straße.', tip: 'Die Trennwände sind nur einen Block hoch.', caution: VER + ' Lage und Einteilung Stufe C; der Umbau stammt wahrscheinlich aus dem 18. Jahrhundert.', fact: `Das frühere Gebäude an der Via delle Belle Donne wurde wahrscheinlich im 18. Jahrhundert zu Stallungen und Remisen umgebaut ${Q}.` },
    treppe_stalltor: { title: 'Stufen vor dem Stalltor', description: 'Zwei Treppenblöcke aus Pietra serena (sieben Blöcke breit) führen von der tiefer liegenden Via delle Belle Donne zum Stalltor; unter der oberen Stufe trägt ein Kragstein.', tip: 'Erst der Kragstein, dann die beiden Stufen von außen nach innen.', caution: VER + ' Die Stufen gleichen den Höhenunterschied von zwei Blöcken zwischen Straße und Hausboden aus.', fact: `Das frühere Haus an der Via delle Belle Donne liegt am westlichen Ende des Grundstücks ${Q}.` },
    stemma: { title: 'Wappen über dem Portal', description: 'Goldgerahmtes Wappenschild als Farbfeld in der Fassadenmitte über dem Portal (Rot, Weiß und Blau).', tip: 'Das Schild liegt zwischen den beiden mittleren Fenstern.', caution: VER + ' Die Farben des Wappens sind Stufe C.', fact: `In der Fassadenmitte sitzt ein Wappen aus Stein, das ein gusseisernes des 19. Jahrhunderts ersetzt ${Q}.` },
    licht_ausstattung: { title: 'Licht in den Räumen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { FENSTER, PORTALE, TREPPE, WAENDE, TEILE, INHALT, innenwandTuer, ausstatten, HOF };
