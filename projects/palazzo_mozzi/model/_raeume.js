'use strict';
// Raumplan, Turm und Ausstattung des Palazzo dei Mozzi (W8a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_mozzi/).
// Rahmen MZ (theta 19,33 Grad): u entlang der Fassade zur Piazza de' Mozzi (0..71), w von der Fassade bergauf (0..113).
// Umriss: Vorderblock w 0..52 (u -4..71), Hof (Loch 0) bei u 26,1..46,8 und w 53..73, Westflügel bis u -15, Rückblock w 76..90 und ein schmaler
// Ausläufer nach Südosten (w 92..113, u 27..105). Gelände steigt von Y 66 (Piazza) auf Y 92 (Rückseite).
// Geschosse: EG Lage 0..12, 1. OG 12..21, 2. OG 21..30; Turm bis Lage 46. Raumaufteilung Stufe C; Existenz von Turm, Wappen und Saal nach it.wikipedia (Palazzo dei Mozzi).
const { kit, typen, schach, kassette, schildMotiv } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

const GESCHOSSE = [12, 9, 9];
const PORTALE = [0, 1, 2, 3, 4, 5, 6].map((k) => ({ u: 5.5 + 10 * k, w: 0, breite: 7, hoehe: 7 }));   // sieben Fornici zur Piazza, der mittlere unter dem Wappen
const TREPPE = { u: 60, w: 11 };                                    // Wendeltreppe im Ostraum der Fassade
const HOF = { u: 36.45, w: 63, hu: 10.4, hw: 10 };                  // Mitte und Halbmaße des Hofs (Loch 0)
const TURM = { u0: 29.5, u1: 41.5, w0: 0, w1: 12, top: 46 };       // Turm über der Fassadenmitte (Stufe C)

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [
  { achse: 'u', v: 20.5, von: -5, bis: 18.5, tueren: [9] },         // Vorderraum West | Mitte
  { achse: 'u', v: 50.5, von: -5, bis: 18.5, tueren: [9] },         // Mitte | Vorderraum Ost (Treppe)
  { achse: 'w', v: 19.5, von: -5, bis: 72, tueren: [10, 35.5, 60] },// Vorderräume | Mittelband
  { achse: 'u', v: 22.5, von: 20.5, bis: 75.5, tueren: [36, 62] },  // Westteil | Saalbau
  { achse: 'u', v: 48.5, von: 20.5, bis: 75.5, tueren: [36, 62] },  // Saalbau | Ostteil
  { achse: 'w', v: 76.5, von: -16, bis: 66, tueren: [10, 35, 56] }, // Hofgeviert | Rückblock
  { achse: 'w', v: 91.5, von: 25, bis: 106, tueren: [40, 62] }      // Rückblock | Ausläufer
];

const TEILE = ['vestibolo', 'cortile', 'sala_grande', 'wappen', 'licht_ausstattung'];

/** Hoftüren in der Hofwand des Erdgeschosses: eine je Seite in der Mitte. */
function oeffnungen(api) {
  const { D, Y, oeffnung } = api;
  for (const c of D.haupt) {
    if (c.dHof > 2 || c.d8 <= 2) continue;
    const du = Math.abs(c.u - HOF.u) - HOF.hu, dw = Math.abs(c.w - HOF.w) - HOF.hw;
    const tuer = du > dw ? Math.abs(c.w - HOF.w) < 1.6 : Math.abs(c.u - HOF.u) < 1.6;
    if (tuer) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'hofwaende', c.x, Y(yr), c.z);
  }
}

function ausstatten(api) {
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Eingangshalle unter dem Turm (Mittelraum der Fassade)
  {
    const z = K.steh(0, { u0: 21.6, u1: 49.4, w0: 0.5, w1: 18.4 });
    K.boden('vestibolo', 0, z, (c) => schach(c, 4, t.pflaster, t.weiss));
    K.waende('vestibolo', 0, z, { pitch: 9, y0: 2, y1: 7, farben: ['weiss'], rahmen: t.forte, pilaster: t.forte, sockel: { h: 2, typ: t.forte } });
  }

  // ------------------------------------------------------------ Hof: Pflaster mit Wegekreuz
  K.hofboden('cortile', { u0: 26, u1: 47, w0: 53, w1: 73 }, (c) => (Math.abs(c.u - HOF.u) < 0.8 || Math.abs(c.w - HOF.w) < 0.8 ? t.serena : schach(c, 3, t.pflaster, t.weiss)));

  // ------------------------------------------------------------ Großer Saal im ersten Stock mit Wandmalereien
  {
    const z = K.steh(1, { u0: 23.6, u1: 47.4, w0: 20.6, w1: 51 });
    K.boden('sala_grande', 1, z, (c) => schach(c, 4, t.cotto, t.weiss));
    K.waende('sala_grande', 1, z, { pitch: 9, y0: 2, y1: 7, farben: ['rot', 'gelb', 'blau', 'gruen'], rahmen: t.gold, pilaster: t.weiss, sockel: { h: 1, typ: t.holz },
      motiv: (k, q, j, B, H) => (j < H * 0.25 ? FR('braun') : (j > H * 0.75 ? FR('hellblau') : null)) });
    K.decke('sala_grande', 1, z, (c) => ((Math.floor(c.u) + Math.floor(c.w)) % 7 === 0 ? t.gold : FR('weiss')));
    K.quader('sala_grande', 1, { u0: 32, u1: 40, w0: 34, w1: 37 }, 1, 1, t.holz);                   // Tafel
  }

  // ------------------------------------------------------------ Wappen der Mozzi (Tolosakreuz) über dem mittleren Fornice
  {
    K.flaeche('wappen', 0, { u0: 33, u1: 38, w0: 0, w1: 2.5 }, 8, 11, (c, jj) => {
      const q = Math.floor(c.u - 33 + 0.5);
      if (schildMotiv(0, q, jj, 5, 4, [1], 1, 1) === null) return null;
      return q === 2 || jj === 1 ? t.weiss : t.dunkel;                                                  // Kreuz in Stein auf dunklem Schild
    });
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const Q = "(Quelle: it.wikipedia, Palazzo dei Mozzi)";
const INHALT = {
  titel: 'Ausgestaltete Räume, Hof und Wappen', untertitel: 'Eingangshalle, Hof, Großer Saal und Wappen der Mozzi', icon: '🏰',
  teile: {
    vestibolo: { title: 'Eingangshalle', description: 'Halle hinter dem mittleren der sieben Fornici: Schachboden aus Pflaster und Marmor, Wandfelder zwischen Pilastern aus Pietra forte.', tip: 'Boden zuerst, dann das Wandraster.', caution: VER + ' Lage und Größe sind Entwurf (Stufe C); die Quelle beschreibt nur die Fassade.', fact: `Das Erdgeschoss der Fassade ist eine ununterbrochene Reihe von Bögen mit vorspringenden Vordächern ${Q}.` },
    cortile: { title: 'Hof', description: 'Der Hof aus dem OSM-Umriss (21 × 20 Blöcke): Pflaster im Schachmuster mit Wegekreuz aus Pietra serena; vier Türen führen aus dem Erdgeschoss hinein.', tip: 'Erst das Pflaster, die Türen bleiben frei.', caution: VER + ' Die Quelle beschreibt keinen Hof; Form und Pflaster stammen aus dem OSM-Umriss und sind Entwurf.', fact: `Der Palast entstand 1266–1273 durch die Vereinigung mehrerer mittelalterlicher Häuser und Türme ${Q}.` },
    sala_grande: { title: 'Großer Saal im ersten Stock', description: 'Saal im ersten Obergeschoss über der Mitte des Vorderblocks: Cottoboden im Schachmuster, Wandfelder in Rot, Gelb, Blau und Grün mit Goldrahmen, Sockelzone in Braun und Fries in Hellblau als Wandmalereien, Deckenfeld in Weiß mit Goldpunkten, eine Tafel.', tip: 'Boden, Wandraster, Decke, zuletzt die Tafel.', caution: VER + ' Die Malereien sind nur Farbflächen; Lage und Größe des Saals sind Entwurf (Stufe C).', fact: `Im ersten Stock liegt der große Saal mit Wandmalereien von 1778 ${Q}.` },
    wappen: { title: 'Wappen der Mozzi', description: 'Schild aus dunklen Blöcken mit einem Kreuz aus hellem Stein über dem mittleren Fornice, an der Fassade zur Piazza.', tip: 'Die Schildfläche ersetzt einzelne Wandblöcke über dem Bogen.', caution: VER + ' Das Tolosakreuz ist als einfaches Kreuz angedeutet; die Quelle nennt keine Farben.', fact: `Über dem Eingang sitzt ein großes Wappen der Mozzi mit dem Tolosakreuz ${Q}.` },
    licht_ausstattung: { title: 'Licht in den Räumen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { GESCHOSSE, PORTALE, TREPPE, WAENDE, TEILE, INHALT, TURM, HOF, oeffnungen, ausstatten };
