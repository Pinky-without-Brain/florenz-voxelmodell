'use strict';
// Raumplan und Ausstattung des Palazzo Medici Riccardi (V5a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_medici_riccardi/).
// Rahmen PM (theta 24 Grad): u < 0 von der Via Cavour ins Gebäude, w < 0 von der Via de' Gori nach Norden.
// Geschosse: EG Lage 0..22, Piano nobile 22..40, 2. OG 40..56. Höfe: Loch 0 Riccardi-Hof, Loch 1 Michelozzos Hof, Loch 2 Garten.
// Alles vereinfacht, nicht nach Vorbild; Lage der Räume im Grundriss Stufe C.
const { kit, typen, schach, kassette, figurenFries, hash, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [
  { achse: 'w', v: -53, von: -23, bis: -3, tueren: [-13] },          // Via-Cavour-Flügel: Nord | Kapelle
  { achse: 'w', v: -32, von: -23, bis: -3, tueren: [-13] },          // Kapelle | Süd
  { achse: 'u', v: -98, von: -16, bis: -4, tueren: [-10] },          // Galerie, Westende
  { achse: 'u', v: -62, von: -16, bis: -4, tueren: [-10] },          // Galerie, Ostende
  { achse: 'w', v: -17, von: -97, bis: -63, tueren: [-69] },         // Galerie, Nordwand
  { achse: 'u', v: -95, von: -149, bis: -110, tueren: [-130] },      // Nordblock
  { achse: 'u', v: -55, von: -149, bis: -110, tueren: [-130] },
  { achse: 'u', v: -20, von: -149, bis: -110, tueren: [-130] },
  { achse: 'u', v: -64, von: -143, bis: -85, tueren: [-120] },       // Westmasse | Riccardi-Hof-Flügel
  { achse: 'w', v: -112, von: -140, bis: -66, tueren: [-100] }       // Westmasse | Nordblock
];

const TEILE = ['cappella_dei_magi', 'galleria_luca_giordano', 'michelozzo_hof', 'medaillons', 'garten_medici', 'licht_ausstattung'];

/** Fresko "Apotheose der Medici": blauer Himmel, Wolken, goldene Sonne in der Mitte, Gestalten in Rot und Weiß. */
function deckenfresko(c, mitte, t, FR) {
  const du = c.u - mitte.u, dw = c.w - mitte.w;
  const d = Math.hypot(du / 1.6, dw);
  if (d < 2.2) return t.gold;
  if (d < 3.4) return FR('gelb');
  const h = hash(Math.floor(c.u / 2), Math.floor(c.w / 2), 17) % 11;
  if (h === 0) return FR('weiss');
  if (h === 1) return FR('rot');
  if (h === 2) return FR('orange');
  return (Math.floor(c.u) % 8 === 0 || Math.floor(c.w) % 8 === 0) ? t.gold : FR(h < 7 ? 'blau' : 'hellblau');
}

function ausstatten(api) {
  const { D, Y, BASIS, set, hat } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Cappella dei Magi (Piano nobile, Via-Cavour-Flügel)
  {
    const z = K.steh(1, { u0: -22, u1: -3, w0: -52, w1: -32 });
    const fo = { himmel: FR('hellblau'), wiese: FR('gruen'), huegel: FR('braun'), haut: FR('orange'), gold: t.gold, figuren: ['rot', 'blau', 'weiss', 'gelb', 'rot', 'gruen'].map(FR) };
    K.boden('cappella_dei_magi', 1, z, (c) => {
      const d = Math.max(Math.abs(c.u + 12.5), Math.abs(c.w + 42));
      return d < 2 ? t.gold : d < 4.5 ? t.rot : d < 7 ? t.weiss : schach(c, 2, t.gruen, t.weiss);
    });
    K.waende('cappella_dei_magi', 1, z, {
      pitch: 14, y0: 3, y1: 15, farben: ['hellblau'], rahmen: t.gold, pilaster: FR('gruen'), sockel: { h: 2, typ: t.holz },
      motiv: (k, q, j, B, H) => figurenFries(k, q, j, B, H, fo)                                    // Zug der Heiligen Drei Könige
    });
    K.decke('cappella_dei_magi', 1, z, (c) => kassette(c, 6, t.holz, t.gold, t.holz));
    K.quader('cappella_dei_magi', 1, { u0: -8, u1: -4, w0: -46, w1: -38 }, 1, 1, t.weiss);                   // Altar
    K.quader('cappella_dei_magi', 1, { u0: -7, u1: -5, w0: -45, w1: -39 }, 2, 2, t.weiss);
    K.quader('cappella_dei_magi', 1, { u0: -8, u1: -6, w0: -43, w1: -41 }, 3, 4, t.gold);                    // Kreuz
    K.flaeche('cappella_dei_magi', 1, { u0: -4.6, u1: -1.4, w0: -47, w1: -37 }, 4, 12, (c, jj) => {         // Altarbild (Anbetung)
      if (c.d8 !== 2) return null;
      const w = c.w + 42;
      if (jj === 0 || jj === 8 || Math.abs(w) > 4.4) return t.gold;
      if (Math.abs(w) < 1.2 && jj > 2 && jj < 6) return FR('weiss');
      return jj > 5 ? FR('blau') : FR('gruen');
    });
    for (const w of [-47, -43]) K.quader('cappella_dei_magi', 1, { u0: -19, u1: -14, w0: w, w1: w + 1 }, 1, 1, t.holz);   // Bänke
  }

  // ------------------------------------------------------------ Galleria di Luca Giordano (Piano nobile, Südflügel)
  {
    const z = K.steh(1, { u0: -97, u1: -62, w0: -16.5, w1: -3 });
    K.boden('galleria_luca_giordano', 1, z, (c) => schach(c, 4, t.weiss, t.rot));
    K.waende('galleria_luca_giordano', 1, z, {
      pitch: 9, y0: 3, y1: 12, farben: [WZ.typ('glas'), FR('hellblau')], rahmen: t.gold, pilaster: t.gold, sockel: { h: 2, typ: t.ornament }, fries: t.gold
    });
    K.decke('galleria_luca_giordano', 1, z, (c) => deckenfresko(c, { u: -79.5, w: -9.5 }, t, FR));       // Apotheose der Medici
    for (const u of [-90, -70]) K.figur('galleria_luca_giordano', 1, u, -9.5, { typ: t.weiss, sockelTyp: t.dunkel, sockel: 2, arme: 'seitlich' });
  }

  // ------------------------------------------------------------ Michelozzos Hof (Loch 1): Pflaster, Orpheus, Medaillons
  {
    K.hofboden('michelozzo_hof', { u0: -54, u1: -33, w0: -52, w1: -30 }, (c) => {
      const d = Math.hypot(c.u + 43.5, c.w + 41);
      if (d < 3.2) return t.serena;
      return (Math.abs(c.u + 43.5) < 1.2 || Math.abs(c.w + 41) < 1.2) ? t.serena : (((Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1) ? t.pflaster : null);
    });
    K.figur('michelozzo_hof', 0, -43.5, -41, { typ: t.weiss, sockelTyp: t.serena, sockel: 3, arme: 'hoch', schmuck: t.gold, draussen: true });   // Orpheus (Bandinelli)
    for (const c of D.haupt) {                                                                                                // Tondi über den Pfeilern der Arkaden
      if (c.dHof !== 1 || c.d8 <= 2 || !c.hofEntlang || D.H.dLoch(1, c.x, c.z) !== 1) continue;
      const v = c.hofEntlang === 'u' ? c.u : c.w;
      const dv = mod(Math.floor(v + 0.5) + 3, 7) - 3;                                                                          // Abstand zur Pfeilermitte (Raster 7)
      for (let yr = 14; yr <= 20; yr++) {
        const d = Math.hypot(dv, yr - 17);
        if (d > 2.7) continue;
        const k = Math.floor((v + 0.5) / 7);
        api.ersetze(c.x, Y(yr), c.z, d > 1.9 ? t.gold : (d < 0.8 ? FR(k % 2 ? 'rot' : 'blau') : t.weiss), 'medaillons');
      }
    }
  }

  // ------------------------------------------------------------ Garten (Loch 2): Wege, Brunnen, Statuen, Bäume
  {
    const cu = -94.5, cw = -50.5;
    K.hofboden('garten_medici', { u0: -114, u1: -75, w0: -84, w1: -17 }, (c) => {
      if (Math.abs(c.u - cu) < 1.6 || Math.abs(c.w - cw) < 1.6) return WZ.typ('gruen_weg');
      if (Math.hypot(c.u - cu, c.w - cw) < 8.5 && Math.hypot(c.u - cu, c.w - cw) > 6.5) return WZ.typ('gruen_weg');
      return null;
    });
    K.brunnen('garten_medici', 0, cu, cw, 5, { saeule: 5 });
    for (const [du, dw] of [[0, -22], [0, 22], [-14, 0], [14, 0]]) {
      K.figur('garten_medici', 0, cu + du, cw + dw, { typ: t.weiss, sockelTyp: t.serena, sockel: 3, arme: 'seitlich', draussen: true });
    }
    for (const [du, dw] of [[-14, -22], [14, -22], [-14, 22], [14, 22], [-14, -11], [14, 11]]) K.baum('garten_medici', 0, cu + du, cw + dw, 5);
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const INHALT = {
  titel: 'Ausgestaltete Innenräume und Höfe', untertitel: 'Cappella dei Magi, Galerie, Hof und Garten', icon: '🏛️',
  teile: {
    cappella_dei_magi: { title: 'Cappella dei Magi', description: 'Kapelle im Piano nobile am Via-Cavour-Flügel: Wandfelder ringsum mit dem Zug der Heiligen Drei Könige (Himmel, Hügel, Figuren in Rot, Blau, Weiß und Gelb mit goldenen Kronen), Boden mit goldener Mitte und Marmorringen, Kassettendecke aus Eiche und Gold, Altar mit Kreuz und Altarbild, zwei Bankreihen.', tip: 'Erst den Boden, dann den Fries Tafel für Tafel, zuletzt Altar und Bänke.', caution: VER + ' Der Zug ist als Farbfries angedeutet, die Lage im Haus ist Stufe C.', fact: 'Benozzo Gozzoli malte den Zug der Heiligen Drei Könige um 1459 bis 1461 für Piero de\' Medici (Quelle: it.wikipedia, Palazzo Medici Riccardi).' },
    galleria_luca_giordano: { title: 'Galleria di Luca Giordano', description: 'Langer Saal im Südflügel: Schachboden aus Marmor und Granit, Spiegelfelder aus weißem Glas und blaue Felder zwischen goldenen Pilastern, Deckenfresko in Blau mit goldener Sonne, Wolken und Gestalten, zwei Statuen.', tip: 'Die Decke ist eine Lage unter dem Geschossboden darüber.', caution: VER + ' Die Spiegel sind Glasfelder.', fact: 'Luca Giordano malte ab 1682 die Apotheose der Medici an die Decke der Galerie (Quelle: it.wikipedia, Palazzo Medici Riccardi).' },
    michelozzo_hof: { title: 'Michelozzos Hof', description: 'Hofpflaster mit Wegekreuz und Mittelrondell aus Pietra serena; in der Mitte die Orpheus-Statue als Blockfigur auf einem hohen Sockel (Marmor, erhobener Arm).', tip: 'Die Figur steht auf einem Sockel von 3 Blöcken.', caution: VER, fact: 'Im Hof steht der Orpheus von Baccio Bandinelli (Quelle: it.wikipedia, Palazzo Medici Riccardi).' },
    medaillons: { title: 'Medaillons über den Arkaden', description: 'Über jedem Pfeiler der Arkaden von Michelozzos Hof sitzt ein rundes Medaillon: weiße Scheibe mit goldenem Rand und buntem Mittelpunkt.', tip: 'Radius 2,7 Blöcke, Mitte auf Lage 17.', caution: VER, fact: 'Die Medaillons im Hof gehen auf Entwürfe nach Donatello zurück (Quelle: it.wikipedia, Palazzo Medici Riccardi).' },
    garten_medici: { title: 'Garten', description: 'Kieswege im Kreuz und als Ring um ein Brunnenbecken, Brunnensäule in der Mitte, vier Statuen auf Sockeln an den Wegenden und sechs Bäume auf dem Rasen.', tip: 'Wege und Brunnen zuerst, dann Statuen und Bäume.', caution: VER + ' Die Luft unter den Kronen ist offene Gartenluft.', fact: 'Der Palast besitzt einen Garten hinter den Höfen (Quelle: it.wikipedia, Palazzo Medici Riccardi).' },
    licht_ausstattung: { title: 'Licht in den Sälen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { WAENDE, TEILE, INHALT, ausstatten };
