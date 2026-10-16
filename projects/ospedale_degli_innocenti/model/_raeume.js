'use strict';
// Raumplan und Ausstattung des Spedale degli Innocenti (V5a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/ospedale_degli_innocenti/).
// Rahmen OI (theta 37,2 Grad): u von der Piazza ins Gebäude, w entlang der Loggia. Geschosse: EG Lage 0..20, 1. OG 20..34.
// Loch 3 = Chiostro degli Uomini (Arkaden), Loch 2 = Chiostro delle Donne (Streifen), Löcher 0 und 1 = Lichthöfe.
// Museo degli Innocenti im 1. OG über der Loggia, Ruota an der Loggiawand. Alles vereinfacht, nicht nach Vorbild.
const { kit, typen, schach, kassette, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [
  { achse: 'w', v: 28, von: 3, bis: 29, tueren: [21] },            // Loggiasäle (je zwei Joche, Tür in der Loggiawand mittig)
  { achse: 'w', v: 56, von: 3, bis: 29, tueren: [21] },
  { achse: 'w', v: 84, von: 3, bis: 29, tueren: [21] },
  { achse: 'w', v: 112, von: 3, bis: 29, tueren: [21] },
  { achse: 'u', v: 30, von: 3, bis: 28, tueren: [16] },             // Loggiaflügel | Nordhalle
  { achse: 'u', v: 30, von: 80, bis: 143, tueren: [95, 130] },      // Loggiaflügel | Südhalle
  { achse: 'u', v: 60, von: 3, bis: 28, tueren: [16] },             // Nordhalle geteilt
  { achse: 'u', v: 82, von: 3, bis: 28, tueren: [16] },
  { achse: 'w', v: 40, von: 83, bis: 120, tueren: [100] },          // Ostmasse
  { achse: 'w', v: 72, von: 83, bis: 120, tueren: [100] },
  { achse: 'w', v: 100, von: 83, bis: 120, tueren: [100] }
];

const TEILE = ['ruota', 'chiostro_uomini', 'chiostro_donne', 'museo_tafelbilder', 'museo_ghirlandaio', 'museo_robbia', 'licht_ausstattung'];

/** Rundfeld (Tondo/Lünette) aus Weiß und Blau mit Goldrand: Radius r, Mitte (0, 0). */
const tondo = (d, r, t, FR, k) => (d > r ? null : d > r - 0.9 ? t.gold : d < 0.9 ? FR(k % 2 ? 'rot' : 'weiss') : FR(k % 2 ? 'weiss' : 'blau'));

function ausstatten(api) {
  const { D, Y, BASIS } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Ruota: Findelrad-Fenster in der Loggiawand (nur Nische, dicht)
  K.flaeche('ruota', 0, { u0: 10.9, u1: 12.6, w0: 8, w1: 12 }, 2, 8, (c, jj) => {
    const d = Math.hypot(c.w - 10, jj - 3.5);
    if (d > 2.6) return null;
    if (d > 1.9) return t.serena;                                  // Rahmen
    if (d < 0.7) return t.bronze;                                  // Nabe des Rades
    return (Math.abs(c.w - 10) < 0.6 || Math.abs(jj - 3.5) < 0.6) ? t.bronze : WZ.typ('glas_fenster');   // Speichen und dunkle Öffnung
  });

  // ------------------------------------------------------------ Museo (1. OG über der Loggia): drei Säle
  {
    const SAAL = (rect, teil, farben, rahmen) => {
      const z = K.steh(1, rect);
      K.boden(teil, 1, z, (c) => schach(c, 4, t.pflaster, t.weiss));
      K.waende(teil, 1, z, { pitch: 8, y0: 3, y1: 8, farben, rahmen, sockel: { h: 2, typ: t.serena } });
      K.decke(teil, 1, z, (c) => kassette(c, 6, t.holz, t.putz, t.gold));
      return z;
    };
    SAAL({ u0: 0, u1: 30, w0: 29, w1: 56 }, 'museo_tafelbilder', ['gelb', 'orange', 'blau', 'rot'], t.gold);
    SAAL({ u0: 0, u1: 30, w0: 85, w1: 112 }, 'museo_robbia', ['blau', 'weiss'], t.holz);
    SAAL({ u0: 0, u1: 30, w0: 57, w1: 84 }, 'museo_ghirlandaio', ['weiss'], t.holz);
    // Anbetung der Könige (Ghirlandaio): großes Farbfeld in der Fassadenwand zwischen zwei Fenstern
    K.flaeche('museo_ghirlandaio', 1, { u0: 0, u1: 4, w0: 58, w1: 68.5 }, 3, 12, (c, jj) => {
      if (c.d8 !== 2) return null;
      const q = c.w - 58;
      if (jj === 0 || jj === 9 || q < 0.6 || q > 9.9) return t.gold;
      if (jj >= 6) return FR('hellblau');
      if (jj <= 1) return FR('gruen');
      return [FR('rot'), FR('blau'), FR('weiss'), FR('gelb'), FR('orange'), t.gold][Math.floor(q) % 6];      // Gestalten
    });
    for (const w of [43, 98]) for (const u of [20, 24]) {                                                    // Vitrinen
      K.quader(w < 60 ? 'museo_tafelbilder' : 'museo_robbia', 1, { u0: u - 1, u1: u + 1, w0: w - 1, w1: w + 1 }, 1, 2, t.pflaster);
      K.quader(w < 60 ? 'museo_tafelbilder' : 'museo_robbia', 1, { u0: u - 1, u1: u + 1, w0: w - 1, w1: w + 1 }, 3, 3, t.glas);
    }
  }

  // ------------------------------------------------------------ Chiostro degli Uomini (Loch 3): Pflaster, Brunnen, Lünetten
  {
    const cu = 55.5, cw = 55;
    K.flaeche('chiostro_uomini', 0, { u0: 39, u1: 73, w0: 39, w1: 72 }, 0, 0, (c) => {
      if (Math.hypot(c.u - cu, c.w - cw) < 5.5) return t.serena;
      return (Math.abs(c.u - cu) < 1.2 || Math.abs(c.w - cw) < 1.2) ? t.serena : (((Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1) ? t.pflaster : null);
    });
    K.brunnen('chiostro_uomini', 0, cu, cw, 3.6, { saeule: 4 });
    for (const c of D.haupt) {                                                    // Lünetten (Rundfelder) über den Pfeilern der Arkaden
      if (c.dHof !== 1 || c.d8 <= 2 || !c.hofEntlang || D.H.dLoch(3, c.x, c.z) !== 1) continue;
      const v = c.hofEntlang === 'u' ? c.u : c.w;
      const dv = mod(Math.floor(v + 0.5) + 3, 6) - 3;                               // Abstand zur Pfeilermitte (Raster 6)
      const k = Math.floor((v + 0.5) / 6);
      for (let yr = 12; yr <= 18; yr++) {
        const typ = tondo(Math.hypot(dv, yr - 15), 2.6, t, FR, k);
        if (typ) api.ersetze(c.x, Y(yr), c.z, typ, 'chiostro_uomini');
      }
    }
  }

  // ------------------------------------------------------------ Chiostro delle Donne (Loch 2): Rasen, Wege, Brunnen
  {
    const cu = 61.5, cw = 114.5;
    K.flaeche('chiostro_donne', 0, { u0: 30, u1: 94, w0: 108, w1: 121 }, 0, 0, (c) => (Math.abs(c.w - cw) < 1.4 || Math.hypot(c.u - cu, c.w - cw) < 4.6 ? WZ.typ('gruen_weg') : t.rasen));
    K.brunnen('chiostro_donne', 0, cu, cw, 3.3, { saeule: 3 });
    for (const u of [40, 51, 72, 83]) K.baum('chiostro_donne', 0, u, cw - 3, 4);
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const INHALT = {
  titel: 'Ausgestaltete Innenräume und Höfe', untertitel: 'Museo, Ruota und die beiden Chiostri', icon: '🏛️',
  teile: {
    ruota: { title: 'Ruota', description: 'Das Findelrad als Fensternische in der Loggiawand: runder Rahmen aus Pietra serena, Speichen und Nabe aus Bronze, dahinter dunkles Glas. Die Nische ist dicht, es führt keine Öffnung ins Haus.', tip: 'Radius 2,6 Blöcke, Mitte auf Lage 5.', caution: VER, fact: 'In der Ruota, einem drehbaren Fach in der Wand, konnten Neugeborene anonym abgegeben werden (Quelle: it.wikipedia, Spedale degli Innocenti).' },
    chiostro_uomini: { title: 'Chiostro degli Uomini', description: 'Hofpflaster mit Wegekreuz und Mittelrondell aus Pietra serena, ein Brunnenbecken in der Mitte, über den Pfeilern der Arkaden runde Lünettenfelder in Blau und Weiß mit Goldrand.', tip: 'Radius der Lünetten 2,6 Blöcke, Mitte auf Lage 15.', caution: VER, fact: 'Der Chiostro degli Uomini ist der größere der beiden Kreuzgänge des Findelhauses (Quelle: it.wikipedia, Spedale degli Innocenti).' },
    chiostro_donne: { title: 'Chiostro delle Donne', description: 'Langgestreckter Hof mit Rasen, Kieswegen, einem Brunnenbecken mit Mittelsäule und vier Bäumen.', tip: 'Erst Rasen und Wege, dann Brunnen und Bäume.', caution: VER + ' Die Arkaden fehlen im Modell.', fact: 'Der Chiostro delle Donne diente den Frauen des Findelhauses (Quelle: it.wikipedia, Spedale degli Innocenti).' },
    museo_tafelbilder: { title: 'Museo, Saal der Tafelbilder', description: 'Saal im 1. Obergeschoss über der Loggia: Schachbrettboden, Wandfelder in Gelb, Orange, Blau und Rot mit Goldrahmen in Augenhöhe, Kassettendecke, zwei Vitrinen.', tip: 'Bildunterkante 2 Blöcke über dem Boden.', caution: VER, fact: 'Das Museo degli Innocenti zeigt Tafelbilder, darunter Werke von Botticelli und Piero di Cosimo (Quelle: it.wikipedia, Spedale degli Innocenti).' },
    museo_ghirlandaio: { title: 'Museo, Saal der Anbetung', description: 'Saal mit dem großen Bild der Anbetung der Könige als Farbfeld (10 Blöcke breit, 10 hoch) in der Fassadenwand: blauer Himmel, grüne Wiese, Gestalten in bunten Gewändern, Goldrahmen.', tip: 'Das Bild sitzt zwischen zwei Fenstern.', caution: VER + ' Das Bild ist nur als Farbfeld angedeutet.', fact: 'Domenico Ghirlandaio malte die Anbetung der Könige 1488 für die Kirche des Findelhauses (Quelle: it.wikipedia, Spedale degli Innocenti).' },
    museo_robbia: { title: 'Museo, Saal der Terrakotten', description: 'Saal mit blau-weißen Wandfeldern nach Art der glasierten Terrakotten, Holzrahmen, Schachbrettboden, Kassettendecke und zwei Vitrinen.', tip: 'Blau und Weiß wechseln von Tafel zu Tafel.', caution: VER, fact: 'Andrea della Robbia schuf 1487 die Wickelkinder-Medaillons an der Loggia (Quelle: it.wikipedia, Spedale degli Innocenti).' },
    licht_ausstattung: { title: 'Licht in den Sälen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { WAENDE, TEILE, INHALT, ausstatten };
