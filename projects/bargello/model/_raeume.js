'use strict';
// Raumplan und Ausstattung des Palazzo del Bargello (V5a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/bargello/).
// Rahmen BA (achsparallel): u = x - 153,5, w = z - 560. Geschosse: EG Lage 0..20, 1. OG 20..38, 2. OG 38..54.
// Alles vereinfacht, nicht nach Vorbild; Lage der Räume im Grundriss Stufe C (die Räume des Museums sind frei verteilt).
const { kit, typen, kassette, schildMotiv, figurenFries, schach, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [
  { achse: 'w', v: 50, von: 5, bis: 34, tueren: [19.5] },          // Westflügel: Nord- und Südhälfte
  { achse: 'u', v: 36, von: 3, bis: 17, tueren: [10] },            // Nordflügel | Westflügel
  { achse: 'u', v: 66, von: 3, bis: 17, tueren: [10] },            // Nordflügel geteilt
  { achse: 'u', v: 94, von: 9, bis: 17, tueren: [13] },            // Nordflügel | Ostflügel
  { achse: 'w', v: 31, von: 95, bis: 134, tueren: [99] },          // Ostflügel: Nord | Mitte (Treppe, kleiner Hof)
  { achse: 'w', v: 56, von: 95, bis: 134, tueren: [99, 126] },     // Ostflügel: Mitte | Süd
  { achse: 'u', v: 36, von: 70, bis: 82, tueren: [76] },           // Westflügel | Südflügel
  { achse: 'u', v: 48, von: 70, bis: 82, tueren: [76] },           // Südflügel geteilt
  { achse: 'u', v: 94, von: 70, bis: 82, tueren: [76] }            // Südflügel | Ostflügel
];

const TEILE = ['freitreppe', 'verone', 'hof_wappen', 'hofbrunnen', 'michelangelo_saal', 'salone_di_donatello', 'cappella_del_podesta', 'licht_ausstattung'];

// Freitreppe (Weltzellen): Aufstieg nach Westen (Lauf 20 Stufen, Breite 3) entlang der Nordarkade zur Verone (1. OG)
const FT = { x0: 237, z0: 591, n: 20, bx: [210, 217], bz: [586, 592], tor: [211, 214] };   // Start, Plattform, Hofwand-Tor

/** Öffnung der Hofwand im 1. Obergeschoss: Eingang der Verone (vor dem Rohbau der Hofwand freigehalten). */
function oeffnungen(api) {
  const { D, Y, BASIS } = api;
  for (const c of D.haupt) {
    if (c.dHof > 2 || c.d8 <= 2 || !c.grossHof || c.z >= FT.bz[0]) continue;
    if (c.x < FT.tor[0] || c.x > FT.tor[1] || c.z < FT.bz[0] - 3) continue;
    for (let k = 1; k <= 6; k++) api.oeffnung('loggia', 'verone', c.x, Y(BASIS[1] + k), c.z);
  }
}

function ausstatten(api) {
  const { Y, BASIS, set } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Freitreppe und Verone im Hof
  {
    const ft = WZ.treppe.geradeTreppe({ start: { x: FT.x0, y: Y(1), z: FT.z0 }, richtung: 'w', stufen: FT.n, breite: 3, rolle: 'pietra_serena' });
    for (const b of ft) {
      set(b.x, b.y, b.z, b.typ, 'freitreppe');
      for (let y = Y(1); y < b.y; y++) set(b.x, y, b.z, t.forte, 'freitreppe');                   // massiver Unterbau (Auflager)
    }
    // Brüstung an der offenen Südseite des Laufs
    for (let k = 0; k < FT.n; k++) {
      const x = FT.x0 - k;
      for (let y = Y(1); y <= Y(2 + k); y++) set(x, y, FT.z0 + 1, y === Y(2 + k) ? t.serena : t.forte, 'freitreppe');
    }
    // Plattform der Verone (Boden = Geschossboden des 1. OG), Säulen, Brüstung und Dach
    for (let x = FT.bx[0]; x <= FT.bx[1]; x++) for (let z = FT.bz[0]; z <= FT.bz[1]; z++) {
      for (let y = Y(1); y < Y(BASIS[1]); y++) set(x, y, z, t.forte, 'verone');
      set(x, Y(BASIS[1]), z, ((x + z) & 1) ? t.weiss : t.serena, 'verone');
    }
    for (const [x, z] of [[FT.bx[0], FT.bz[0]], [FT.bx[0], FT.bz[1]], [FT.bx[1], FT.bz[1]]]) for (let k = 1; k <= 6; k++) set(x, Y(BASIS[1] + k), z, t.saeule, 'verone');
    for (let x = FT.bx[0] + 1; x < FT.bx[1]; x++) set(x, Y(BASIS[1] + 1), FT.bz[1], t.serena, 'verone');
    for (let z = FT.bz[0] + 1; z < FT.bz[1]; z++) set(FT.bx[0], Y(BASIS[1] + 1), z, t.serena, 'verone');
    for (let x = FT.bx[0]; x <= FT.bx[1]; x++) for (let z = FT.bz[0]; z <= FT.bz[1]; z++) set(x, Y(BASIS[1] + 7), z, t.cotto, 'verone');
    // offene, überdachte Loggia zum Hof (Luft unter dem Dach ist deklarierte Öffnung)
    for (let x = FT.bx[0]; x <= FT.bx[1]; x++) for (let z = FT.bz[0]; z <= FT.bz[1]; z++) for (let k = 1; k <= 6; k++) if (!api.hat(x, Y(BASIS[1] + k), z)) api.oeffnung('loggia', 'verone', x, Y(BASIS[1] + k), z);
  }

  // ------------------------------------------------------------ Wappen der Podestà an den Hofwänden (1. und 2. OG)
  {
    const farben = ['rot', 'blau', 'gruen', 'gelb', 'orange', 'braun'].map(FR);
    for (const s of [1, 2]) {
      for (const c of api.D.haupt) {
        if (c.dHof !== 1 || c.d8 <= 2 || !c.grossHof || !c.hofEntlang) continue;
        const v = c.hofEntlang === 'u' ? c.u : c.w;
        const r = mod(Math.floor(v + 0.5), 14);                                  // Wappen zwischen den Biforen (Raster 14)
        if (r < 6 || r > 8) continue;
        const k = Math.floor((v + 0.5) / 14);
        for (let j = 3; j <= 6; j++) {
          const y = j - 3, x = r - 6;
          let typ = null;
          if (y === 3) typ = t.gold; else if (y === 0) typ = x === 1 ? farben[mod(k + s, farben.length)] : null;
          else typ = (y === 2 && x === 1) ? FR('weiss') : farben[mod(k + s, farben.length)];
          if (typ) api.ersetze(c.x, Y(BASIS[s] + j + 2), c.z, typ, 'hof_wappen');
        }
      }
    }
  }

  // Brunnen (Pozzo) in der Mitte des Hofs, Rand aus Pietra serena
  K.brunnen('hofbrunnen', 0, 62.5, 46, 4, { saeule: 3 });

  // ------------------------------------------------------------ Michelangelo-Saal (EG, Westflügel Nord)
  {
    const z = K.steh(0, { u0: 5, u1: 35, w0: 4, w1: 50 });
    K.boden('michelangelo_saal', 0, z, (c) => schach(c, 4, t.weiss, t.rot));
    K.waende('michelangelo_saal', 0, z, {
      pitch: 10, y0: 3, y1: 11, farben: ['weiss', 'hellblau'], rahmen: t.holz, pilaster: t.serena,
      sockel: { h: 2, typ: t.serena }, fries: t.gold
    });
    K.decke('michelangelo_saal', 0, z, (c) => kassette(c, 6, t.holz, t.putz, t.gold));
    K.figur('michelangelo_saal', 0, 19.5, 16, { typ: t.weiss, arme: 'seitlich', sockel: 2, sockelTyp: t.serena });                    // Bacchus
    K.figur('michelangelo_saal', 0, 19.5, 34, { sockelTyp: t.dunkel, sockel: 3, beine: 0, rumpf: 2, typ: t.weiss, arme: 'keine' });   // Brutus (Büste)
    // Tondo Pitti: Marmortondo (Radius 2) mit Goldrand in der Westwand
    K.flaeche('michelangelo_saal', 0, { u0: 5, u1: 6.5, w0: 22, w1: 31 }, 4, 10, (c, jj, j) => {
      if (c.d8 !== 2) return null;
      const d = Math.hypot(c.w - 26.5, j - 7);
      return d <= 2.2 ? t.weiss : d <= 3.4 ? t.gold : null;
    });
    for (const w of [12, 42]) for (const u of [11, 28]) {                                                                              // Vitrinen
      K.quader('michelangelo_saal', 0, { u0: u - 1, u1: u + 1, w0: w - 1, w1: w + 1 }, 1, 2, t.pflaster);
      K.quader('michelangelo_saal', 0, { u0: u - 1, u1: u + 1, w0: w - 1, w1: w + 1 }, 3, 3, t.glas);
    }
  }

  // ------------------------------------------------------------ Salone di Donatello (1. OG, Ostflügel Nord)
  {
    const z = K.steh(1, { u0: 94, u1: 136, w0: 9, w1: 31 });
    const wf = ['rot', 'blau', 'gruen', 'gelb'].map(FR);
    K.boden('salone_di_donatello', 1, z, (c) => schach(c, 4, t.cotto, t.weiss));
    K.waende('salone_di_donatello', 1, z, {
      pitch: 10, y0: 3, y1: 9, farben: ['rot', 'blau', 'gruen', 'gelb'], rahmen: t.gold, pilaster: t.serena,
      sockel: { h: 2, typ: t.holz }, fries: t.holz,
      motiv: (k, q, j, B, H) => schildMotiv(k, q, j, B, H, wf, t.gold, FR('weiss'))
    });
    K.decke('salone_di_donatello', 1, z, (c) => kassette(c, 8, t.holz, t.putz, t.gold));
    K.figur('salone_di_donatello', 1, 104.5, 21, { typ: t.bronze, sockelTyp: t.weiss, sockel: 3, arme: 'seitlich' });             // David (Bronze)
    K.figur('salone_di_donatello', 1, 118.5, 21, { typ: t.weiss, sockelTyp: t.dunkel, sockel: 3, arme: 'seitlich' });             // David (Marmor)
    K.figur('salone_di_donatello', 1, 127.5, 15, { typ: t.weiss, sockelTyp: t.serena, sockel: 2, arme: 'hoch', schmuck: t.gold });  // hl. Georg
    K.loewe('salone_di_donatello', 1, 112.5, 26, { achse: 'x', typ: t.serena, sockelTyp: t.forte, sockel: 2, maehne: t.serena });  // Marzocco
    for (const u of [100, 130]) K.quader('salone_di_donatello', 1, { u0: u - 1, u1: u + 1, w0: 26, w1: 29 }, 1, 1, t.holz);        // Bänke
  }

  // ------------------------------------------------------------ Cappella del Podestà (1. OG, Nordflügel West)
  {
    const z = K.steh(1, { u0: 36, u1: 66, w0: 3, w1: 18 });
    const himmel = FR('hellblau'), wiese = FR('gruen');
    const fo = { himmel, wiese, huegel: FR('braun'), haut: FR('orange'), gold: t.gold, figuren: ['rot', 'blau', 'weiss', 'gelb', 'gruen'].map(FR) };
    K.boden('cappella_del_podesta', 1, z, (c) => schach(c, 3, t.cotto, t.pflaster));
    K.waende('cappella_del_podesta', 1, z, {
      pitch: 12, y0: 3, y1: 14, farben: ['hellblau'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 2, typ: t.holz },
      motiv: (k, q, j, B, H) => figurenFries(k, q, j, B, H, fo)
    });
    K.decke('cappella_del_podesta', 1, z, (c) => ((Math.floor(c.u + 0.5) + Math.floor(c.w + 0.5)) % 5 === 0 ? t.gold : FR('blau')));
    K.quader('cappella_del_podesta', 1, { u0: 38, u1: 41, w0: 8, w1: 14 }, 1, 2, t.weiss);                                          // Altar
    K.quader('cappella_del_podesta', 1, { u0: 38, u1: 40, w0: 10, w1: 12 }, 3, 4, t.gold);                                           // Kreuz
    for (const u of [47, 53, 59]) for (const w of [7, 13]) K.quader('cappella_del_podesta', 1, { u0: u, u1: u + 4, w0: w, w1: w + 1 }, 1, 1, t.holz);   // Bänke
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 7), erzeugt content/modul_7.json
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const INHALT = {
  titel: 'Ausgestaltete Innenräume und Hof', untertitel: 'Freitreppe, Verone, Säle und Kapelle', icon: '🏛️',
  teile: {
    freitreppe: { title: 'Freitreppe im Hof', description: 'Zwanzig Treppenblöcke aus Pietra serena steigen entlang der Nordarkade des Hofs zur Verone; darunter ein massiver Unterbau, an der offenen Seite eine Brüstung.', tip: 'Erst den Unterbau Lage für Lage, dann die Treppenblöcke mit Aufstieg nach Westen.', caution: VER + ' Lage und Länge sind Stufe C.', fact: 'Die Außentreppe führt zur Verone, der offenen Loggia im ersten Obergeschoss (Quelle: it.wikipedia, Palazzo del Bargello; Neri di Fioravante, 14. Jahrhundert).' },
    verone: { title: 'Verone', description: 'Offene, überdachte Loggia am oberen Ende der Treppe: Plattform in der Höhe des ersten Obergeschosses, drei Säulen, niedrige Brüstung und Terrakottadach; ein Tor in der Hofwand führt in die Galerie.', tip: 'Plattform, Säulen, Brüstung, dann das Dach.', caution: VER + ' Die Öffnung zum Hof ist gewollt.', fact: 'Die Verone ist die Loggia, zu der die Hoftreppe emporsteigt (Quelle: it.wikipedia, Palazzo del Bargello).' },
    hof_wappen: { title: 'Wappen der Podestà', description: 'An den Hofwänden des ersten und zweiten Obergeschosses hängen farbige Schilde zwischen den Fenstern: Schildhaupt in Gold, Feld in Rot, Blau, Grün, Gelb, Orange oder Braun.', tip: 'Ein Schild ist 3 Blöcke breit und 4 hoch.', caution: VER + ' Die Farben sind nicht die echten Wappen.', fact: 'Die Wände des Bargello-Hofs sind mit den Wappen der Podestà und Richter geschmückt (Quelle: it.wikipedia, Palazzo del Bargello).' },
    hofbrunnen: { title: 'Brunnen im Hof', description: 'Rundes Becken aus Pietra serena in der Mitte des Hofs, Wasser im Becken und eine kurze Mittelsäule.', tip: 'Erst den Rand, dann das Wasser.', caution: VER, fact: 'Im Hof steht ein Brunnen (pozzo); Form und Lage sind hier Stufe C (Quelle: it.wikipedia, Palazzo del Bargello).' },
    michelangelo_saal: { title: 'Michelangelo-Saal', description: 'Saal im Erdgeschoss des Westflügels: Schachbrettboden aus Marmor und rotem Granit, Wandfelder mit Pilastern, Holz-Kassettendecke, Bacchus als Blockfigur, Brutus-Büste auf hohem Sockel, Tondo Pitti als Marmorscheibe in der Westwand, vier Vitrinen.', tip: 'Boden und Wandfelder zuerst, die Figuren zuletzt.', caution: VER + ' Die Lage im Haus ist Stufe C.', fact: 'Das Museum zeigt Michelangelos Bacchus, den Brutus und den Tondo Pitti (Quelle: it.wikipedia, Museo nazionale del Bargello).' },
    salone_di_donatello: { title: 'Salone di Donatello', description: 'Großer Saal im ersten Obergeschoss des Ostflügels: Boden aus Terrakotta und Marmor, Wandfelder mit Wappenschilden, Holz-Kassettendecke, zwei Davids (Bronze und Marmor), der heilige Georg und der Marzocco-Löwe auf Sockeln.', tip: 'Die Figuren stehen auf Sockeln in zwei Reihen.', caution: VER + ' Lage und Maße sind Stufe C.', fact: 'Der Salone del Consiglio Generale zeigt heute Donatellos Davids, den heiligen Georg und den Marzocco (Quelle: it.wikipedia, Palazzo del Bargello).' },
    cappella_del_podesta: { title: 'Cappella del Podestà', description: 'Kapelle der Maddalena im ersten Obergeschoss des Nordflügels: Wandfelder mit Figurenfries in Hellblau, Grün und Rot (Fresken der Giotto-Schule), blaue Decke mit goldenen Sternen, Altar mit goldenem Kreuz und drei Bankreihen.', tip: 'Der Fries hat Himmel oben, Wiese unten und Figuren dazwischen.', caution: VER, fact: 'Die Kapelle der Maddalena trägt Fresken aus dem Umkreis Giottos mit Paradies und Hölle (Quelle: it.wikipedia, Palazzo del Bargello).' },
    licht_ausstattung: { title: 'Licht in den Sälen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { WAENDE, TEILE, FT, INHALT, oeffnungen, ausstatten };
