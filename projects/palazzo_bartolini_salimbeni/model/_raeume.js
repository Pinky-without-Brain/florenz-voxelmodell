'use strict';
// Raumplan und Ausstattung des Palazzo Bartolini Salimbeni (W7a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_bartolini_salimbeni/).
// Rahmen BS (theta 96,87 Grad): u entlang der Piazza di Santa Trinita (Nord → Süd), w von der Fassade nach Westen. Geschosse: EG Lage 0..11,
// Piano nobile 11..21, 2. OG 21..30. Der Hof (Loch 0) liegt bei u 15,2..22,8, w 27,0..36,9. Raumaufteilung Stufe C; Existenz von Durchgang,
// Hof, Kassettendecken und Sammlung nach it.wikipedia, Palazzo Bartolini Salimbeni.
const { kit, typen, schach, kassette, hash } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

// Fensterraster 10 (Mitte u 19 / w 19 + 10k): Portale in Fensterachsen; Kreuzfenster = Mittelpfosten (Bifora) plus Querriegel (fenster_kreuz)
const FENSTER = { abstand: 10, breite: 4, versatz: 14, sohle: [3, 3, 2], hoehe: [5, 5, 4], bifora: [true, true, true] };
const PORTALE = [{ u: 19, w: 0, breite: 7, hoehe: 9 }, { u: 0, w: 29, breite: 7, hoehe: 9 }];
const TREPPE = { u: 31, w: 58 };
const HOF = { u: 19, w: 31.95, hu: 3.8, hw: 4.95 };

// Türen der Hof-Innenwand: je Seite eine Tür 3 Blöcke breit in der Mitte
function innenwandTuer(c) {
  const du = Math.abs(c.u - HOF.u) - HOF.hu, dw = Math.abs(c.w - HOF.w) - HOF.hw;
  return du > dw ? Math.abs(c.w - HOF.w) < 1.5 : Math.abs(c.u - HOF.u) < 1.5;
}

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [
  { achse: 'u', v: 15, von: 0, bis: 19.4, tueren: [9] },            // Nordostraum | Durchgang
  { achse: 'u', v: 23, von: 0, bis: 19.4, tueren: [9] },            // Durchgang | Südostraum
  { achse: 'w', v: 19.5, von: -1, bis: 43, tueren: [7, 35] },       // Vorderräume | Nord- und Südflügel
  { achse: 'w', v: 44.5, von: -1, bis: 10, tueren: [4] },           // Nordflügel | Westflügel
  { achse: 'w', v: 44.5, von: 28, bis: 43, tueren: [35] },          // Südflügel | Westflügel
  { achse: 'u', v: 25, von: 45.6, bis: 74, tueren: [58] }           // Westflügel Nord | Süd
];

const TEILE = ['passaggio', 'hof_bartolini', 'sgraffito', 'sala_cassettoni', 'collezione_casamonti', 'inschriften', 'fries_mohn', 'fenster_kreuz', 'licht_ausstattung'];
const WAND_OHNE_HOF = ['aussenwand', 'innenwaende', 'innenwaende_og', 'trennwaende', 'trennwaende_og', 'loggiawand'];

function ausstatten(api) {
  const { Y, BASIS, set, zellen, key, ersetze, zelleBei } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Kreuzfenster: Querriegel aus Pietra serena auf 55 % der Fensterhöhe
  for (const [k, e] of zellen) {
    if (e.p !== 'fenster') continue;
    const c = zelleBei(e.x, e.z);
    if (!c) continue;
    const yr = e.y - Y(0);
    let s = 0;
    for (let q = BASIS.length - 2; q >= 0; q--) if (yr > BASIS[q]) { s = q; break; }
    const sohle = BASIS[s] + FENSTER.sohle[s], quer = sohle + Math.round(FENSTER.hoehe[s] * 0.55);
    if (yr === quer) ersetze(e.x, e.y, e.z, t.serena, 'fenster_kreuz');
  }

  // ------------------------------------------------------------ Durchgang vom Portal zum Hof (EG): flach angedeutetes Tonnengewölbe
  {
    const z = K.steh(0, { u0: 16.2, u1: 21.9, w0: 0.5, w1: 19 });
    K.boden('passaggio', 0, z, (c) => schach(c, 2, t.serena, t.weiss));
    K.decke('passaggio', 0, z, (c, d) => (d < Math.round(2.4 * (Math.abs(c.u - HOF.u) / 2.9) ** 2) ? t.putz : null), 3);
    K.waende('passaggio', 0, z, { pitch: 8, y0: 2, y1: 6, farben: ['weiss'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena }, nurTeile: ['aussenwand', 'trennwaende'] });
  }

  // ------------------------------------------------------------ Hof: Pflaster; Sgraffito an den Hofwänden der Obergeschosse
  K.hofboden('hof_bartolini', { u0: 14.5, u1: 23.5, w0: 26.5, w1: 37.5 }, (c) => ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? t.pflaster : t.weiss));
  for (const s of [1, 2]) {
    K.flaeche('sgraffito', s, { u0: 6, u1: 32, w0: 18, w1: 46 }, 2, BASIS[s + 1] - BASIS[s] - 2, (c, jj, j) => {
      if (c.dHof !== 1) return null;
      const h = hash(Math.floor(c.u), Math.floor(c.w), j);
      return ((Math.floor(c.u) + Math.floor(c.w) + j) % 5 === 0 || h % 11 === 0) ? t.dunkel : null;                     // Grotesken in einer Farbe
    });
  }

  // ------------------------------------------------------------ Sala mit Kassettendecke und Mohnkopf-Wappen (Piano nobile, Westflügel Nord)
  {
    const z = K.steh(1, { u0: 1, u1: 24, w0: 45.6, w1: 72 });
    K.boden('sala_cassettoni', 1, z, (c) => schach(c, 4, t.cotto, t.weiss));
    K.waende('sala_cassettoni', 1, z, { pitch: 9, y0: 2, y1: 6, farben: ['weiss', 'gelb'], rahmen: t.holz, pilaster: t.serena, sockel: { h: 2, typ: t.holz }, nurTeile: ['aussenwand', 'trennwaende_og', 'trennwaende'] });
    K.decke('sala_cassettoni', 1, z, (c) => kassette(c, 5, t.holz, t.putz, FR('rot')));                                     // roter Mohnkopf in der Kassettenmitte
  }

  // ------------------------------------------------------------ Sammlung Casamonti (Piano nobile, Westflügel Süd): Bilder auf Stellwänden
  {
    const z = K.steh(1, { u0: 26, u1: 40, w0: 45.6, w1: 72 });
    const farben = ['rot', 'blau', 'gelb', 'gruen'];
    K.boden('collezione_casamonti', 1, z, (c) => schach(c, 4, t.weiss, t.dunkel));
    K.waende('collezione_casamonti', 1, z, { pitch: 10, y0: 2, y1: 6, farben, rahmen: t.gold, pilaster: t.serena, sockel: { h: 1, typ: t.dunkel }, nurTeile: ['aussenwand', 'trennwaende_og', 'trennwaende'] });
    for (const w of [50, 67]) K.stellwand('collezione_casamonti', 1, 'w', w, 27, 38, { wand: t.putz, farben });
  }

  // ------------------------------------------------------------ Inschriftenbänder über den Portalen („Carpere promptius quam imitari“, „Per non dormire“)
  {
    const band = (c) => (Math.floor(c.u * 7 + c.w * 7) % 3 === 0 ? t.gold : t.weiss);
    K.flaeche('inschriften', 0, { u0: 12.5, u1: 25.5, w0: -0.5, w1: 2.5 }, 10, 10, (c) => (c.d8 <= 2 ? band(c) : null));      // Piazza-Portal
    K.flaeche('inschriften', 0, { u0: -0.5, u1: 3.5, w0: 22.5, w1: 35.5 }, 10, 10, (c) => (c.d8 <= 2 ? band(c) : null));    // Portal Via Porta Rossa
    // Kartuschen „Per non dormire“ an den Kreuzfenstern: ein Goldblock im Querriegel jedes zweiten Fensters
    for (const [, e] of zellen) {
      if (e.p !== 'fenster_kreuz' || (e.x + e.z) % 4) continue;
      ersetze(e.x, e.y, e.z, t.gold, 'inschriften');
    }
  }

  // ------------------------------------------------------------ Fries mit dem Mohn-Emblem unter dem Kranzgesims (alle Straßenfassaden)
  K.flaeche('fries_mohn', 2, { u0: -1, u1: 43, w0: -1, w1: 73 }, 7, 7, (c) => {
    if (c.d8 !== 1) return null;
    const v = c.entlang === 'u' ? c.u : c.w, r = ((Math.floor(v) % 6) + 6) % 6;
    return r === 1 || r === 3 ? FR('rot') : r === 2 ? FR('gruen') : null;                                               // drei Mohnblüten, mittlere Knospe grün
  });
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const Q = '(Quelle: it.wikipedia, Palazzo Bartolini Salimbeni)';
const INHALT = {
  titel: 'Ausgestaltete Räume, Hof und Fassadenschmuck', untertitel: 'Durchgang, Hof mit Sgraffito, Kassettensaal, Sammlung, Inschriften und Mohnfries', icon: '🌺',
  teile: {
    passaggio: { title: 'Durchgang zum Hof', description: 'Schmaler Gang hinter dem Portal an der Piazza di Santa Trinita (Schachboden aus Pietra serena und Marmor, Wandfelder mit Pilastern); die Decke ist nach den Seiten abgesenkt und deutet ein Tonnengewölbe an.', tip: 'Die Decke erst von den Wänden aus füllen.', caution: VER + ' Das Gewölbe ist nur flach angedeutet; Lage Stufe C.', fact: `Den Hof erreicht man durch einen tonnengewölbten Durchgang ${Q}.` },
    hof_bartolini: { title: 'Hofpflaster', description: 'Hofboden im Schachmuster aus Pflaster und Marmor zwischen den Arkaden auf vier Seiten.', tip: 'Erst das Pflaster, dann die Wandzier.', caution: VER + ' Der Hof hat im Modell auf vier Seiten Arkaden (Wirklichkeit: drei, die vierte Seite ist verbaut).', fact: `Der Hof hat einen Portikus an drei Seiten mit Säulen und Rundbögen ${Q}.` },
    sgraffito: { title: 'Sgraffito im Hof', description: 'Auf den Hofwänden des Piano nobile und des zweiten Obergeschosses verlaufen Muster aus dunklen Blöcken auf hellem Putz, die einfarbige Grotesken andeuten.', tip: 'Nur die Blöcke der Hofseite austauschen.', caution: VER + ' Die Muster sind zufällig verteilt, keine Figuren.', fact: `Der Hof trägt einfarbigen Sgraffito-Schmuck und Grotesken, Andrea Feltrini zugeschrieben, bis ins zweite Geschoss ${Q}.` },
    sala_cassettoni: { title: 'Saal mit Kassettendecke', description: 'Saal im Piano nobile des Westflügels: Cottoboden, helle Wandfelder mit Holzrahmen und eine Kassettendecke aus Holz, in deren Kassettenmitten rote Blöcke den Mohnkopf andeuten.', tip: 'Die Decke als Gitter unter dem Boden des Obergeschosses.', caution: VER + ' Lage Stufe C.', fact: `Hölzerne Kassettendecken mit Mohnkopf-Emblemen gehören zur Ausstattung ${Q}.` },
    collezione_casamonti: { title: 'Sammlung Casamonti', description: 'Galerie im Piano nobile des Westflügels: Schachboden in Weiß und Schwarz, Bildfelder in Rot, Blau, Gelb und Grün an den Wänden und zwei freistehende Stellwände mit Bildern.', tip: 'Die Stellwände lassen Durchgänge frei.', caution: VER + ' Die Bilder sind nur Farbflächen; Lage Stufe C.', fact: `Im Palast ist heute die Collezione Roberto Casamonti untergebracht, seit 2018 öffentlich zugänglich ${Q}.` },
    inschriften: { title: 'Inschriften und Kartuschen', description: 'Ein Band aus Gold und Weiß über dem Portal an der Piazza und über dem Portal an der Via Porta Rossa als Platzhalter der Inschriften, dazu einzelne Goldblöcke als Kartuschen im Querriegel der Fenster.', tip: 'Das Band liegt eine Lage über dem Portalbogen.', caution: VER + ' Die Schrift ist nicht lesbar nachgebildet.', fact: `Über dem Hauptportal steht „Carpere promptius quam imitari“; „Per non dormire“, der Wahlspruch der Familie, erscheint in Kartuschen auf den Kreuzfenstern ${Q}.` },
    fries_mohn: { title: 'Fries mit Mohnblüten', description: 'Unter dem Kranzgesims läuft ein Band aus roten und grünen Blöcken: Mohnblüte, Knospe, Mohnblüte im Wechsel.', tip: 'Eine Lage unter dem Gesims.', caution: VER, fact: `Der Fries trägt das Emblem der drei Mohnblüten, ein Hinweis auf „Per non dormire“ ${Q}.` },
    fenster_kreuz: { title: 'Querriegel der Kreuzfenster', description: 'In jedem Fenster liegt auf etwas mehr als der halben Höhe ein Querriegel aus Pietra serena; zusammen mit dem Mittelpfosten ergibt das ein Kreuz, das das Fenster in vier Scheiben teilt.', tip: 'Der Riegel ersetzt eine Glaslage.', caution: VER + ' Giebel und Architrave über den Fenstern sind nicht gebaut.', fact: `Die Fenster sind durch kreuzförmige Steinglieder in vier Felder geteilt ${Q}.` },
    licht_ausstattung: { title: 'Licht in den Räumen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { FENSTER, PORTALE, TREPPE, WAENDE, TEILE, INHALT, innenwandTuer, ausstatten, HOF };
