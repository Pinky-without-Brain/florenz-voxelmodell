'use strict';
// Raumplan, Terrasse und Ausstattung des Palazzo Corsini al Parione (W8a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_corsini_parione/).
// Rahmen CP (theta -149,13 Grad): u entlang des Lungarno Corsini (-9..168), w von der Fassade ins Haus (0..152).
// Löcher: Haupthof (Loch 0, 2.450 Zellen, u 75,7..120,4 × w 15,1..71,6) mit Arkaden; Lichthöfe Loch 1 (401 Zellen, u 40..55 × w 85..112),
// Loch 2 (123 Zellen, u 7..19 × w 83..93) und Loch 3 (200 Zellen, u 29..40 × w 35..53). Das Dach ist als Terrasse mit Balustrade ausgebildet.
// Geschosse: EG Lage 0..12, Piano nobile 12..22, 2. Obergeschoss 22..30; Terrasse auf Lage 31. Raumaufteilung Stufe C; Existenz der Räume nach it.wikipedia (Palazzo Corsini al Parione).
const { kit, typen, schach, kassette, schildMotiv, hash } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

const GESCHOSSE = [12, 10, 8];
const PORTALE = [{ u: 98, w: 0, breite: 7, hoehe: 7 }];
const TREPPE = { u: 22, w: 25 };                                    // Wendeltreppe im Westteil
const HOF = { u: 98.05, w: 43.35, hu: 22.35, hw: 28.25 };         // Haupthof (Loch 0)
const SCALONE = { u: 55, w: 20, stufen: 12 };                      // Treppe Ferris im Treppenhaus links vom Hof, Aufstieg in Weltrichtung n
const TERRASSE = { u: 70, w: 7, stufen: 9 };                        // Treppe vom 2. Obergeschoss auf die Terrasse (Aufstieg in Weltrichtung o)

/** Hofinnenwand: je Seite eine Tür in der Mitte (am Lungarno in der Achse des Portals). */
function innenwandTuer(c) {
  const du = Math.abs(c.u - HOF.u) - HOF.hu, dw = Math.abs(c.w - HOF.w) - HOF.hw;
  return du > dw ? Math.abs(c.w - HOF.w) < 1.5 : Math.abs(c.u - HOF.u) < 1.5;
}

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [
  { achse: 'u', v: 89, von: -2, bis: 9, tueren: [5] },                // Vorderraum West | Vestibül (Portalachse)
  { achse: 'u', v: 107, von: -2, bis: 9, tueren: [5] },              // Vestibül | Vorderraum Ost
  { achse: 'w', v: 13.5, von: -10, bis: 75, tueren: [8, 36, 66] },   // Galerie am Lungarno | Räume im Westflügel
  { achse: 'u', v: 14, von: 14.5, bis: 62, tueren: [30, 55] },       // Westflügel: Westraum | Mittelraum (Wendeltreppe)
  { achse: 'u', v: 48, von: 14.5, bis: 62, tueren: [22, 58] },       // Mittelraum | Treppenhaus links vom Hof
  { achse: 'w', v: 63, von: -10, bis: 69, tueren: [6, 30, 62] },     // Westflügel | südlicher Trakt
  { achse: 'w', v: 13.5, von: 127, bis: 160, tueren: [142] },        // Ostflügel: Grotte | Salone
  { achse: 'w', v: 63, von: 127, bis: 170, tueren: [142] },          // Salone | Sala da Ballo
  { achse: 'w', v: 91, von: -10, bis: 160, tueren: [8, 70, 110] }    // südlicher Trakt | Dreieck am Fluss
];

const TEILE = ['vestibolo', 'cortile', 'treppenhaus', 'scalone', 'statuen_scalone', 'galleria', 'salone_del_trono', 'sala_da_ballo', 'grotta', 'portal', 'terrasse', 'licht_ausstattung'];

/** Treppen: Ferris Treppe (EG zum Piano nobile) und die Treppe vom 2. Obergeschoss auf die Terrasse; Läufe vor dem Rohbau, Treppenlöcher frei. */
function vorher(api) {
  const { D, Y, set, hat, frei, BASIS } = api;
  const serena = WZ.typ('pietra_serena');
  const lauf = (t, richtung, ys, stufen, teil) => {
    const p = D.R.toWorld(t.u, t.w);
    const treppe = WZ.treppe.geradeTreppe({ start: { x: Math.round(p.x), y: ys, z: Math.round(p.z) }, richtung, stufen, breite: 2, rolle: 'pietra_serena' });
    for (const l of WZ.treppe.treppenloch(treppe.lauf, 3)) {
      frei(l.x, l.y, l.z);
      if (teil === 'terrasse' && l.y >= Y(api.TRAUFE - 1)) api.oeffnung('loggia', 'terrasse', l.x, l.y, l.z);       // Luke zur Terrasse: offen zum Himmel
    }
    for (const b of treppe) {
      set(b.x, b.y, b.z, b.typ, teil, true);
      if (b.y - 1 > Y(0) && !hat(b.x, b.y - 1, b.z)) set(b.x, b.y - 1, b.z, serena, teil, true);       // Kragstein unter jeder Stufe
    }
    return treppe;
  };
  api.scalone = lauf(SCALONE, 'n', Y(1), SCALONE.stufen, 'scalone');
  api.terrassentreppe = lauf(TERRASSE, 'o', Y(BASIS[2] + 1), TERRASSE.stufen, 'terrasse');
}

/** Terrasse (Flachdach): Balustrade am Außen- und Hofrand, Statuen als Säulen auf der Balustrade, Vasen dazwischen. */
function nachher(api) {
  const { D, Y, set, TRAUFE } = api;
  const T = typen();
  const y0 = Y(TRAUFE + 2);
  for (const c of D.haupt) {
    const rand = c.d8 <= 2 || c.dHof <= 2;
    if (!rand) continue;
    set(c.x, y0, c.z, (Math.floor(c.u) + Math.floor(c.w)) & 1 ? T.saeule : T.weiss, 'terrasse');
    set(c.x, y0 + 1, c.z, T.weiss, 'terrasse');
  }
  for (const c of D.haupt) {                                         // Statuen und Vasen nur am Lungarno (Fassade, d8 = 1)
    if (c.d8 !== 1 || c.w >= 1.5 || c.u < 0 || c.u > 158) continue;
    const r = (((c.u - 2) % 12) + 12) % 12;
    if (r < 0.5 || r >= 11.5) for (let h = 0; h < 4; h++) set(c.x, y0 + 2 + h, c.z, h === 3 ? T.gold : T.weiss, 'terrasse');          // Statue
    else if (Math.abs(r - 6) < 0.5) { set(c.x, y0 + 2, c.z, T.cotto, 'terrasse'); set(c.x, y0 + 3, c.z, T.cotto, 'terrasse'); }        // Vase
  }
}

function ausstatten(api) {
  const { Y, set, BASIS } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);
  const antik = WZ.typ('antik');
  void set; void Y; void BASIS;

  // ------------------------------------------------------------ Vestibül hinter dem Portal (Achse zum Haupthof)
  {
    const z = K.steh(0, { u0: 90.2, u1: 105.8, w0: 2, w1: 9 });
    K.boden('vestibolo', 0, z, (c) => schach(c, 3, t.serena, t.weiss));
    K.waende('vestibolo', 0, z, { pitch: 8, y0: 2, y1: 7, farben: ['weiss'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena } });
  }

  // ------------------------------------------------------------ Haupthof: Pflaster mit Wegekreuz
  K.hofboden('cortile', { u0: 75, u1: 121, w0: 15, w1: 72 }, (c) => (Math.abs(c.u - HOF.u) < 0.8 || Math.abs(c.w - HOF.w) < 0.8 ? t.serena : schach(c, 4, t.pflaster, t.weiss)));

  // ------------------------------------------------------------ Treppenhaus links vom Hof: Treppe Ferris mit Statuen, Clemens XII. am oberen Absatz
  {
    for (const s of [0, 1]) {
      const z = K.steh(s, { u0: 49.2, u1: 68.6, w0: 14.6, w1: 62.4 });
      K.boden('treppenhaus', s, z, (c) => schach(c, 3, t.weiss, t.pflaster));
      K.waende('treppenhaus', s, z, { pitch: 8, y0: 2, y1: s === 0 ? 8 : 7, farben: ['weiss', 'gelb'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 1, typ: t.serena } });
    }
    K.figur('statuen_scalone', 0, 52, 17, { typ: t.weiss, sockelTyp: t.serena, sockel: 1, arme: 'seitlich' });          // neoklassizistische Statuen am Fuß der Treppe
    K.figur('statuen_scalone', 0, 66, 17, { typ: t.weiss, sockelTyp: t.serena, sockel: 1, arme: 'seitlich' });
    K.figur('statuen_scalone', 1, 62, 40, { typ: t.weiss, sockelTyp: t.serena, sockel: 1, arme: 'hoch', schmuck: t.gold });   // Papst Clemens XII. (Monaldi 1737), vereinfacht
  }

  // ------------------------------------------------------------ Galleria Corsini (Piano nobile, Lungarno-Flügel): Bildfelder in Goldrahmen
  {
    const z = K.steh(1, { u0: -9, u1: 75, w0: 2.4, w1: 13.3 });
    K.boden('galleria', 1, z, (c) => schach(c, 3, t.rot, t.weiss));
    K.waende('galleria', 1, z, { pitch: 8, y0: 3, y1: 8, farben: ['braun', 'blau', 'rot', 'gruen', 'gelb'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 2, typ: t.holz },
      motiv: (k, q, j, B, H) => (hash(k, q >> 1, j >> 1) % 3 === 0 ? FR('hellblau') : null) });
    K.decke('galleria', 1, z, (c) => kassette(c, 5, t.holz, t.putz, t.gold));
  }

  // ------------------------------------------------------------ Salone del Trono (Piano nobile, Ostflügel): Deckenfresko Apoteosi di Casa Corsini, Thron, Statuen auf der Galerie
  {
    const z = K.steh(1, { u0: 128, u1: 158, w0: 14.6, w1: 62.4 });
    K.boden('salone_del_trono', 1, z, (c) => schach(c, 4, t.rot, t.weiss));
    K.waende('salone_del_trono', 1, z, { pitch: 9, y0: 2, y1: 7, farben: ['rot', 'gelb'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 2, typ: t.holz }, fries: t.gold });
    const m = { u: 143, w: 38.5 };
    K.decke('salone_del_trono', 1, z, (c) => {                       // Götterhimmel in Ringen
      const d = Math.hypot(c.u - m.u, c.w - m.w);
      return d < 4 ? FR('weiss') : d < 8 ? FR('gelb') : d < 12 ? FR('hellblau') : d < 15 ? FR('rot') : FR('weiss');
    });
    K.quader('salone_del_trono', 1, { u0: 139, u1: 147, w0: 16, w1: 21 }, 1, 1, t.holz);                       // Podest
    K.quader('salone_del_trono', 1, { u0: 142, u1: 145, w0: 16, w1: 17.5 }, 2, 4, (c, j) => (j === 2 ? t.gold : t.rot));   // Thron
    for (const w of [26, 38.5, 51]) K.figur('salone_del_trono', 1, 131, w, { typ: t.weiss, sockelTyp: t.serena, sockel: 1, arme: 'seitlich' });         // antike Statuen entlang der Wand
  }

  // ------------------------------------------------------------ Sala da Ballo (Piano nobile, südlicher Trakt): Gewölbe Gherardinis
  {
    const z = K.steh(1, { u0: 128, u1: 168, w0: 64.6, w1: 90 });
    K.boden('sala_da_ballo', 1, z, (c) => schach(c, 4, t.holz, t.cotto));
    K.waende('sala_da_ballo', 1, z, { pitch: 8, y0: 2, y1: 7, farben: ['weiss', 'hellblau'], rahmen: t.gold, pilaster: t.weiss, sockel: { h: 1, typ: t.holz }, fries: t.gold });
    K.decke('sala_da_ballo', 1, z, (c, d) => {
      const e = Math.min(Math.abs(c.u - 148), Math.abs(c.w - 77));
      if (d === 1) return e < 4 ? FR('gelb') : null;
      return e < 3 ? FR('rot') : e < 7 ? FR('hellblau') : FR('weiss');
    }, 2);
  }

  // ------------------------------------------------------------ Künstliche Grotte (EG, Ostflügel am Lungarno, 1692-1698)
  {
    const z = K.steh(0, { u0: 128, u1: 158, w0: 2.4, w1: 13.3 });
    K.boden('grotta', 0, z, (c) => ((hash(Math.floor(c.u), Math.floor(c.w), 3) % 4 === 0) ? t.dunkel : t.serena));
    K.waende('grotta', 0, z, { pitch: 6, y0: 1, y1: 8, farben: ['mossy_stone_bricks', t.mauer], rahmen: antik, pilaster: antik, sockel: { h: 2, typ: antik } });
    K.decke('grotta', 0, z, (c, d) => (d === 0 ? antik : (hash(Math.floor(c.u), Math.floor(c.w), 9) % 5 === 0 ? antik : null)), 2);
  }

  // ------------------------------------------------------------ Portal mit Corsini-Wappen und seitlichen Säulen (Fassade am Lungarno)
  {
    K.flaeche('portal', 0, { u0: 95.5, u1: 100.5, w0: 0, w1: 2.5 }, 8, 11, (c, jj) => {
      const q = Math.floor(c.u - 95.5 + 0.5);
      const m = schildMotiv(0, q, jj, 5, 4, [1], 1, 1);
      if (m === null) return null;
      return q === 2 && jj === 2 ? t.gold : t.rot;                                                         // Wappenschild (Farben vereinfacht)
    });
    for (const u0 of [91, 103.4]) K.flaeche('portal', 0, { u0, u1: u0 + 1.7, w0: 0, w1: 2.5 }, 1, 10, () => t.saeule);   // Säulen links und rechts
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const Q = '(Quelle: it.wikipedia, Palazzo Corsini al Parione)';
const INHALT = {
  titel: 'Ausgestaltete Räume, Treppe, Galerie und Terrasse', untertitel: 'Vestibül, Hof, Treppe Ferris, Galleria, Thronsaal, Ballsaal, Grotte, Portal und Terrasse mit Statuen', icon: '🏛️',
  teile: {
    vestibolo: { title: 'Vestibül', description: 'Eingangshalle hinter dem Portal am Lungarno in der Achse zum Haupthof: Schachboden aus Pietra serena und Marmor, Wandfelder zwischen Pilastern aus Pietra serena.', tip: 'Boden zuerst, dann das Wandraster.', caution: VER + ' Lage Stufe C; die Quelle beschreibt den Durchgang nicht.', fact: `Ein Portal mit geschnitztem Corsini-Wappen und seitlichen Säulen führt in den Hof ${Q}.` },
    cortile: { title: 'Haupthof', description: 'Der Haupthof (Loch 0 des OSM-Umrisses, 45 × 56 Blöcke): Pflaster im Schachmuster mit Wegekreuz aus Pietra serena; rundum Arkaden im Erdgeschoss (Joch 5) mit einer Galerie dahinter.', tip: 'Erst das Pflaster, die Arkaden bleiben offen.', caution: VER + ' Die Balustrade auf Höhe des Piano nobile ist nicht gebaut; die Säulen stammen aus dem gemeinsamen Palazzo-Bauplan.', fact: `Der Plan in U-Form ordnet drei Flügel um einen zentralen Innenhof an; der rechte Flügel ist doppelt so breit wie der linke, weil der Entwurf unvollendet blieb ${Q}.` },
    treppenhaus: { title: 'Treppenhaus links vom Hof', description: 'Hoher Raum links neben dem Haupthof (Erdgeschoss und Piano nobile): Boden im Schachmuster aus Marmor und Pflaster, Wandfelder in Weiß und Gelb zwischen Pilastern aus Pietra serena mit Goldrahmen.', tip: 'Die Treppe steht vor dem Wandraster.', caution: VER + ' Lage und Größe sind Entwurf (Stufe C).', fact: `Der monumentale Treppenaufgang Ferris ist mit neoklassizistischen Statuen geschmückt ${Q}.` },
    scalone: { title: 'Treppe Ferris', description: 'Gerade Treppe aus zwölf Treppenblöcken aus Pietra serena, zwei Blöcke breit, vom Erdgeschoss zum Piano nobile; unter jeder Stufe trägt ein Kragstein, darüber ist der Boden offen (Kopffreiheit drei Blöcke).', tip: 'Stufe für Stufe von unten, Kragstein zuerst.', caution: VER + ' Der Lauf ist als gerade Treppe vereinfacht; die Wendeltreppe Silvanis und die prunkvolle Gestaltung sind nicht nachgebildet, Lage Stufe C.', fact: `Der monumentale Treppenaufgang stammt von Ferri, die Wendeltreppe wird Silvani zugeschrieben ${Q}.` },
    statuen_scalone: { title: 'Statuen im Treppenhaus', description: 'Zwei weiße Blockfiguren auf Sockeln am Fuß der Treppe und eine Figur mit goldener Krone auf dem oberen Absatz als Papst Clemens XII.', tip: 'Sockel zuerst, dann Beine, Rumpf, Arme, Kopf.', caution: VER + ' Die Zahl der neoklassizistischen Statuen ist nicht belegt.', fact: `Der Treppenaufgang ist mit neoklassizistischen Statuen geschmückt; oben steht eine Statue Clemens’ XII. (Lorenzo Corsini) von Carlo Monaldi, 1737 aufgestellt ${Q}.` },
    galleria: { title: 'Galleria Corsini', description: 'Lange Galerie im Piano nobile des Flügels am Lungarno: Boden im Schachmuster aus Rot und Marmor, Bildfelder in Braun, Blau, Rot, Grün und Gelb mit Goldrahmen zwischen Pilastern, Kassettendecke aus Holz und Gold.', tip: 'Boden, Wandraster, dann die Decke.', caution: VER + ' Die Bildfelder zeigen keine bestimmten Werke; Lage und Länge der Galerie sind Entwurf (Stufe C).', fact: `Im ersten Stock liegt die Galleria Corsini mit Werken von Filippo Lippi, Giovanni Bellini, Signorelli, Pontormo, Caravaggio, Salvator Rosa und Luca Giordano ${Q}.` },
    salone_del_trono: { title: 'Salone del Trono', description: 'Großer Saal im Piano nobile des Ostflügels: Boden in Rot und Marmor, Wandfelder in Rot und Gelb mit Goldrahmen und Fries, Deckenbild in farbigen Ringen (Götterhimmel), Podest mit Thron und drei Statuen an der Wand.', tip: 'Boden, Wände, Deckenringe, dann Podest, Thron und Figuren.', caution: VER + ' Das Fresko ist nur ein Ringmuster; Zahl und Standort der antiken Statuen sind Entwurf.', fact: `Der Salone del Trono trägt das Deckenfresko Apoteosi di Casa Corsini von Anton Domenico Gabbiani (um 1696) und hat eine Galerie mit antiken Statuen ${Q}.` },
    sala_da_ballo: { title: 'Sala da Ballo', description: 'Ballsaal im Piano nobile des südlichen Trakts: Holz-Cotto-Boden, weiße und hellblaue Wandfelder mit Goldrahmen, Gewölbebild in Ringen aus Rot, Hellblau und Weiß mit gelben Rippen.', tip: 'Boden, Wände, dann die zwei Lagen der Decke.', caution: VER + ' Das Gewölbe ist als flache Decke mit Rippen angedeutet; Lage Stufe C.', fact: `Die Sala da Ballo hat ein Gewölbe von Alessandro Gherardini ${Q}.` },
    grotta: { title: 'Künstliche Grotte', description: 'Saal im Erdgeschoss des Ostflügels am Lungarno mit Wänden und Decke aus Bruchstein, unregelmäßigen Tropfsteinen aus Bruchstein an der Decke und Boden aus Pietra serena und dunklem Stein.', tip: 'Boden, Wände, dann die Decke mit den Tropfsteinen.', caution: VER + ' Die Grotte ist nur als Raum aus rohem Stein angedeutet; Lage Stufe C.', fact: `Im Erdgeschoss liegt eine künstliche Grotte (1692–1698) ${Q}.` },
    portal: { title: 'Portal mit Wappen', description: 'Am Rand des Fornices zum Lungarno sitzen links und rechts Säulen aus Quarz, darüber ein rotes Wappenschild mit goldener Mitte.', tip: 'Säulen und Schild ersetzen einzelne Wandblöcke neben dem Portal.', caution: VER + ' Das geschnitzte Wappen ist nur als Farbfläche angedeutet; seine Farben sind nicht belegt.', fact: `Das Portal hat ein geschnitztes Corsini-Wappen und seitliche Säulen ${Q}.` },
    terrasse: { title: 'Terrasse mit Balustrade und Statuen', description: 'Das Flachdach ist als Terrasse über alle Flügel begehbar: Pflaster auf Lage 31, ringsum eine Balustrade von zwei Blöcken (abwechselnd Quarzsäule und Marmor) am Außen- und Hofrand; am Lungarno stehen alle zwölf Blöcke Statuen als Säulen mit goldenem Kopf und dazwischen Vasen aus Terrakotta; eine Treppe aus Pietra serena führt vom 2. Obergeschoss hinauf.', tip: 'Treppe zuerst, dann Balustrade, dann Statuen und Vasen.', caution: VER + ' Zahl und Form der Statuen sind nicht belegt; die Statuen sind einfache Säulen ohne Überhang, die Treppe ist Entwurf.', fact: `Das Dach zeigt eine Terrasse aus dem 18. Jahrhundert mit Steinbalustrade, geschmückt mit Statuen und Terrakotta-Vasen ${Q}.` },
    licht_ausstattung: { title: 'Licht in den Räumen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { GESCHOSSE, PORTALE, TREPPE, WAENDE, TEILE, INHALT, SCALONE, TERRASSE, HOF, innenwandTuer, vorher, nachher, ausstatten };
