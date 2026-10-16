'use strict';
// Raumplan und Ausstattung des Palazzo Gondi (W7a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_gondi/).
// Rahmen GN (theta 80,73 Grad): u entlang der Fassade zur Piazza San Firenze (Nord → Süd), w von der Fassade nach Westen.
// Geschosse: EG Lage 0..9, Piano nobile 9..16, 2. OG 16..23 (OSM: 3 Geschosse, 23 Blöcke). Der Hof (Loch 0) liegt bei u 25..32, w 25..36.
// Raumaufteilung Stufe C; Existenz der Räume und der Treppe nach it.wikipedia (Palazzo Gondi).
const { kit, typen, schach, kassette, hash } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');
const GRUND = require('../spec/ground.js');

const PORTALE = [{ u: 8.7, w: 0, breite: 7, hoehe: 8 }, { u: 28.7, w: 0, breite: 7, hoehe: 8 }, { u: 48.7, w: 0, breite: 7, hoehe: 8 }];
const TREPPE = { u: 48, w: 50 };                                    // Wendeltreppe im Südwestraum (Aufstieg zum 2. Obergeschoss)
const WAND_OHNE_HOF = ['aussenwand', 'innenwaende', 'innenwaende_og', 'trennwaende', 'trennwaende_og', 'loggiawand'];   // ohne Hofwände (Lichthof: Fenster bleiben ganz)
const HOF = { u: 28.65, w: 30.1 };                                  // Mitte des Hofs (Loch 0)
const SCALONE = { u: 5.5, w: 23, stufen: 9 };                       // Sangallos Treppe im Nordflügel, Aufstieg nach Westen (Welt −x)

// Türen der Hof-Innenwand: je Seite eine Tür 3 Blöcke breit in der Mitte, in allen Geschossen
function innenwandTuer(c, s) {
  const du = Math.abs(c.u - HOF.u) - 3.9, dw = Math.abs(c.w - HOF.w) - 5.5;           // Seite der Innenwand: Nord/Süd (Normale u) oder Ost/West (Normale w)
  return du > dw ? Math.abs(c.w - HOF.w) < 1.5 : Math.abs(c.u - HOF.u) < 1.5;
}

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [
  { achse: 'u', v: 21.5, von: -2, bis: 19, tueren: [] },            // Nordostraum | Vestibül
  { achse: 'u', v: 36, von: -2, bis: 19, tueren: [] },              // Vestibül | Südostraum
  { achse: 'w', v: 19.2, von: -6, bis: 21.5, tueren: [14] },        // Nordostraum | Nordflügel (Treppenhaus)
  { achse: 'w', v: 19.2, von: 36, bis: 75, tueren: [52] },          // Südostraum | Südflügel (großer Saal)
  { achse: 'w', v: 42.8, von: -6, bis: 19.5, tueren: [14] },        // Nordflügel | Nordwestraum
  { achse: 'w', v: 42.8, von: 39.5, bis: 75, tueren: [43] },        // Südflügel | Südwestraum
  { achse: 'u', v: 34, von: 42.9, bis: 62, tueren: [52] }           // Nordwestraum | Südwestraum
];

const TEILE = ['vestibolo', 'treppenhaus', 'scalone', 'cortile', 'hofbrunnen', 'sala_grande', 'kamin_sangallo', 'sala_paesaggi', 'sala_giove_ebe', 'alkoven', 'panca', 'licht_ausstattung'];

/** Sangallos Treppe: Läufe vor dem Rohbau setzen und das Treppenloch im Boden des Piano nobile freihalten. */
function vorher(api) {
  const { D, Y, set, hat, frei } = api;
  const st = SCALONE.start || (SCALONE.start = (() => { const p = D.R.toWorld(SCALONE.u, SCALONE.w); return { x: Math.round(p.x), z: Math.round(p.z) }; })());
  const treppe = WZ.treppe.geradeTreppe({ start: { x: st.x, y: Y(1), z: st.z }, richtung: 'w', stufen: SCALONE.stufen, breite: 2, rolle: 'pietra_serena' });
  const serena = WZ.typ('pietra_serena');
  for (const l of WZ.treppe.treppenloch(treppe.lauf, 3)) frei(l.x, l.y, l.z);
  for (const b of treppe) {
    set(b.x, b.y, b.z, b.typ, 'scalone', true);
    if (b.y - 1 > Y(0) && !hat(b.x, b.y - 1, b.z)) set(b.x, b.y - 1, b.z, serena, 'scalone', true);       // Kragstein unter jeder Stufe (Flächenkontakt)
  }
  api.scalone = treppe;
}

function ausstatten(api) {
  const { Y, BASIS, set } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Vestibül (EG): Reliefs in Pietra serena
  {
    const z = K.steh(0, { u0: 22.5, u1: 35.5, w0: 0.5, w1: 18.8 });
    K.boden('vestibolo', 0, z, (c) => schach(c, 3, t.serena, t.weiss));
    K.waende('vestibolo', 0, z, { pitch: 7, y0: 2, y1: 6, farben: ['weiss'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena }, fries: t.serena });
  }

  // ------------------------------------------------------------ Treppenhaus (EG und Piano nobile) mit Kassettendecke
  for (const s of [0, 1]) {
    const z = K.steh(s, { u0: -4, u1: 18.8, w0: 19.8, w1: 42.4 });
    K.boden('treppenhaus', s, z, (c) => ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? t.pflaster : t.weiss));
    K.waende('treppenhaus', s, z, { nurTeile: WAND_OHNE_HOF, pitch: 8, y0: 2, y1: s === 0 ? 6 : 5, farben: ['weiss', 'gelb'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 1, typ: t.serena } });
    if (s === 1) K.decke('treppenhaus', s, z, (c) => kassette(c, 4, t.holz, t.gold, t.gold));          // Kassetten mit Füllhörnern und Diamanten (vereinfacht)
  }

  // ------------------------------------------------------------ Hof: Pflaster und Brunnen mit doppelter Schale (1652)
  {
    K.hofboden('cortile', { u0: 24, u1: 34, w0: 24, w1: 37 }, (c) => {
      if (Math.abs(c.u - HOF.u) < 0.8 || Math.abs(c.w - HOF.w) < 0.8) return t.serena;
      return ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1) ? t.pflaster : t.weiss;
    });
    K.brunnen('hofbrunnen', 0, HOF.u, HOF.w, 3.0, { saeule: 3 });
  }

  // ------------------------------------------------------------ Großer Saal (Piano nobile, Südflügel): Ahnenporträts, Kamin Sangallos
  {
    const z = K.steh(1, { u0: 40, u1: 70, w0: 20, w1: 42 });
    K.boden('sala_grande', 1, z, (c) => schach(c, 4, t.cotto, t.weiss));
    K.waende('sala_grande', 1, z, { pitch: 7, y0: 2, y1: 5, farben: ['braun', 'rot', 'blau', 'gruen'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 1, typ: t.holz } });
    K.decke('sala_grande', 1, z, (c) => kassette(c, 5, t.holz, t.putz, t.gold));
    K.kamin('kamin_sangallo', 1, 51, 41.2, 'w-', {});
    K.figur('kamin_sangallo', 1, 46.5, 39.5, { typ: t.weiss, sockelTyp: t.serena, sockel: 2, arme: 'hoch' });         // Herkules
    K.figur('kamin_sangallo', 1, 56, 39.5, { typ: t.weiss, sockelTyp: t.serena, sockel: 2, arme: 'seitlich' });     // Samson
    K.quader('sala_grande', 1, { u0: 48, u1: 58, w0: 28, w1: 30 }, 1, 1, t.holz);                                      // Tafel
  }

  // ------------------------------------------------------------ Sala dei Paesaggi (Piano nobile, Nordostraum)
  {
    const z = K.steh(1, { u0: -4, u1: 21, w0: 0.5, w1: 18.8 });
    K.boden('sala_paesaggi', 1, z, (c) => schach(c, 3, t.cotto, t.weiss));
    K.waende('sala_paesaggi', 1, z, { pitch: 8, y0: 2, y1: 5, farben: ['gruen', 'hellblau'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 1, typ: t.holz },
      motiv: (k, q, j, B, H) => (j < H / 3 ? FR('gruen') : j < H * 2 / 3 ? FR('gruen') : FR('hellblau')) });
    K.quader('sala_paesaggi', 1, { u0: 6, u1: 12, w0: 8, w1: 10 }, 1, 1, t.holz);
  }

  // ------------------------------------------------------------ Sala di Giove ed Ebe (Piano nobile, Südostraum)
  {
    const z = K.steh(1, { u0: 37, u1: 70, w0: 0.5, w1: 18.8 });
    K.boden('sala_giove_ebe', 1, z, (c) => schach(c, 4, t.cotto, t.weiss));
    K.waende('sala_giove_ebe', 1, z, { pitch: 9, y0: 2, y1: 5, farben: ['blau', 'weiss'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 1, typ: t.holz } });
    K.decke('sala_giove_ebe', 1, z, (c) => (Math.hypot(c.u - 53, c.w - 9.5) < 5 ? FR(Math.hypot(c.u - 53, c.w - 9.5) > 4 ? 'gelb' : 'weiss') : FR('hellblau')));   // Götterhimmel (Giove ed Ebe, vereinfacht)
  }

  // ------------------------------------------------------------ Alkoven von 1710 (Piano nobile, Nordwestraum): Stuck und Deckenfresko
  {
    const z = K.steh(1, { u0: -6, u1: 33.5, w0: 43.5, w1: 62 });
    K.boden('alkoven', 1, z, (c) => schach(c, 3, t.holz, t.cotto));
    K.waende('alkoven', 1, z, { nurTeile: WAND_OHNE_HOF, pitch: 8, y0: 2, y1: 5, farben: ['weiss'], rahmen: t.gold, pilaster: t.weiss, sockel: { h: 1, typ: t.holz }, fries: t.gold });
    K.decke('alkoven', 1, z, (c) => ((Math.floor(c.u) + Math.floor(c.w)) % 6 === 0 ? t.gold : FR(Math.hypot(c.u - 14, c.w - 52) < 6 ? 'rot' : 'hellblau')));   // Deckenfresko (Bonechi), vereinfacht
  }

  // ------------------------------------------------------------ Sockelbank (panca di via) an der Fassade zur Piazza San Firenze (Luftraum 2)
  {
    const nahPortal = (p) => PORTALE.some((q) => Math.hypot(p.u - q.u, p.w - q.w) < 6.5);
    for (const p of K.aussenZellen()) {
      if (p.w > 3 || p.u < -1 || p.u > 74 || nahPortal(p)) continue;
      if (GRUND.groundTopY(p.x, p.z) >= Y(1)) continue;
      set(p.x, Y(1), p.z, t.serena, 'panca');
    }
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const Q = '(Quelle: it.wikipedia, Palazzo Gondi)';
const INHALT = {
  titel: 'Ausgestaltete Räume, Hoftreppe und Hof', untertitel: 'Vestibül, Sangallos Treppe, Hof mit Brunnen, Sala grande und Salons', icon: '🏛️',
  teile: {
    vestibolo: { title: 'Vestibül', description: 'Eingangshalle hinter dem mittleren Portal: Schachboden aus Pietra serena und Marmor, Wandfelder zwischen Pilastern und ein umlaufender Fries aus Pietra serena als Platzhalter für die Reliefs.', tip: 'Boden zuerst, dann Wandraster und Fries.', caution: VER + ' Die Reliefs selbst sind nicht nachgebildet; Lage Stufe C.', fact: `Das Vestibül hat Reliefs aus Pietra serena ${Q}.` },
    treppenhaus: { title: 'Treppenhaus', description: 'Großer Raum im Nordflügel um Sangallos Treppe: Pflaster im Schachmuster, Wandfelder zwischen Pilastern aus Pietra serena; im Piano nobile eine Kassettendecke aus Holz und Gold.', tip: 'Die Treppe steht vor dem Wandraster.', caution: VER + ' Füllhörner und Diamanten der Kassetten sind nur als Goldfelder angedeutet.', fact: `Die Deckenkassetten über der Treppe zeigen Füllhörner und Diamanten ${Q}.` },
    scalone: { title: 'Hoftreppe nach Sangallo', description: 'Gerade Treppe aus neun Treppenblöcken aus Pietra serena, zwei Blöcke breit, Aufstieg nach Westen vom Erdgeschoss zum Piano nobile; unter jeder Stufe trägt ein Kragstein, darüber ist der Boden des Piano nobile offen (Kopffreiheit drei Blöcke).', tip: 'Stufe für Stufe von unten, Kragstein zuerst.', caution: VER + ' Die Wangen mit Tier- und Pflanzenmotiven und die Balustraden mit gedrehten Kanneluren sind nicht gebaut; der Treppenraum liegt im Nordflügel (Stufe C).', fact: `Sangallo schuf die monumentale Treppe an der Nordseite des Hofs, die Wangen trugen Tier- und Pflanzenmotive (Originale heute im Victoria and Albert Museum) ${Q}.` },
    cortile: { title: 'Hof', description: 'Hofpflaster mit Wegekreuz aus Pietra serena und Schachmuster; rundum Arkaden (Joch 4) mit einer Galerie dahinter.', tip: 'Erst das Pflaster, dann der Brunnen.', caution: VER + ' Die Säulen sind aus dem gemeinsamen Palazzo-Bauplan, nicht korinthisch ausgeformt.', fact: `Der Hof hat auf allen vier Seiten Arkaden mit korinthischen Säulen ${Q}.` },
    hofbrunnen: { title: 'Brunnen im Hof', description: 'Rundes Becken aus Pietra serena mit Wasserfläche und einer Mittelsäule, die oben in einer zweiten, kleineren Schale endet (doppelte Schale).', tip: 'Becken, Wasser, dann die Säule.', caution: VER, fact: `Der zentrale Brunnen mit doppelter Schale stammt von 1652 und wurde aus dem Boboli-Garten gespeist ${Q}.` },
    sala_grande: { title: 'Großer Saal', description: 'Saal im Piano nobile des Südflügels: Schachboden aus Cotto und Marmor, Wandfelder mit Bildern in Goldrahmen als Ahnenporträts, Kassettendecke und eine Tafel aus Holz.', tip: 'Boden, Wandraster, Decke, zuletzt die Tafel.', caution: VER + ' Es sind Wandfelder im Raster, nicht genau elf Porträts; Lage Stufe C.', fact: `Der große Saal zeigt elf Ahnenporträts und einen monumentalen Steinkamin ${Q}.` },
    kamin_sangallo: { title: 'Kamin mit Herkules und Samson', description: 'Steinkamin an der Westwand des großen Saals (Wangen aus Pietra serena, Sturz aus Marmor, Rauchfang) mit zwei Blockfiguren auf Sockeln daneben.', tip: 'Kamin zuerst, dann die beiden Figuren.', caution: VER + ' Die Figuren stehen neben dem Kamin, nicht auf ihm.', fact: `Der Kamin Sangallos (1501–1505) wird von Figuren des Herkules und des Samson bekrönt ${Q}.` },
    sala_paesaggi: { title: 'Sala dei Paesaggi', description: 'Salon im Piano nobile der Nordostecke: Cottoboden, Wandfelder in Wiesengrün und Himmelblau als Landschaftsbilder in Goldrahmen, eine Tafel.', tip: 'Die Felder werden von unten nach oben grün, hell und blau.', caution: VER + ' Lage Stufe C; die Bilder sind nur Farbflächen.', fact: `Die Sala dei Paesaggi gehört zu den Räumen des Piano nobile ${Q}.` },
    sala_giove_ebe: { title: 'Sala di Giove ed Ebe', description: 'Salon im Piano nobile der Südostecke: Wandfelder in Blau und Weiß mit Goldrahmen, an der Decke ein rundes Götterhimmel-Bild (weiß und gelb auf Hellblau).', tip: 'Das Deckenbild als Kreis aus Farbblöcken.', caution: VER + ' Lage Stufe C; das Deckenbild ist nur angedeutet.', fact: `Die Sala di Giove ed Ebe gehört zu den Räumen des Piano nobile ${Q}.` },
    alkoven: { title: 'Alkoven von 1710', description: 'Raum im Nordwestflügel des Piano nobile mit Stuckwänden in Weiß und Gold und einem Deckenfresko in Rot und Hellblau.', tip: 'Wandfelder und Deckenbild trennen.', caution: VER + ' Lage Stufe C; Stuck und Fresko sind nur Farbflächen.', fact: `Der Alkoven von 1710 hat Stuck von Giovanni Battista Ciceri, Deckenfresken von Matteo Bonechi und Quadraturen von Lorenzo Del Moro ${Q}.` },
    panca: { title: 'Sockelbank (panca di via)', description: 'Steinbank aus Pietra serena entlang der Fassade zur Piazza San Firenze, an den Portalen unterbrochen, eine Lage hoch auf dem Straßenpflaster.', tip: 'Die Bank liegt einen Block hoch auf dem Pflaster.', caution: VER + ' Nur innerhalb des Luftraums von 2 Blöcken.', fact: `Die Fassade hat eine Sockelzone als Straßenbank ${Q}.` },
    licht_ausstattung: { title: 'Licht in den Räumen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { PORTALE, TREPPE, WAENDE, TEILE, INHALT, innenwandTuer, vorher, ausstatten, SCALONE, HOF };
