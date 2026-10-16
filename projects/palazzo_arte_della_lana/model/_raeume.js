'use strict';
// Raumplan und Ausstattung des Palazzo dell'Arte della Lana (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_arte_della_lana/).
// Rahmen AL (θ −5,5°): u nach Osten, w nach Süden. Geschosse: EG Lage 0..7, 1. OG 7..14, 2. OG 14..21, 3. OG 21..28, 4. OG 28..34.
// Alles vereinfacht, nicht nach Vorbild; die Lage der Räume im Grundriss ist Stufe C (Quellen nennen sie nicht).
const { kit, typen, kassette, schildMotiv, schach, mod, hash } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

// Portale: Via Calimala (West, Sala delle Udienze) und Via dell'Arte della Lana (Ost)
const PORTALE = [{ u: 0, w: 38, breite: 5, hoehe: 8 }, { u: 35, w: 30, breite: 5, hoehe: 8 }];
const TREPPE = { u: 9, w: 19 };

// Trennwände (lokal; Türen 3 × 5): Westhalle (Nord | Süd), Ostteil in drei Säle
const WAENDE = [
  { achse: 'u', v: 16, von: 3, bis: 52, tueren: [10, 36, 48] },     // Westhalle | Ostsäle
  { achse: 'w', v: 30, von: 3, bis: 15, tueren: [8] },              // Westhalle Nord | Süd
  { achse: 'w', v: 24, von: 17, bis: 45, tueren: [26] },            // Ostsaal Nord | Mitte
  { achse: 'w', v: 44, von: 17, bis: 45, tueren: [26, 38] }         // Ostsaal Mitte | Süd
];

const TEILE = ['sala_udienze', 'bibliothek', 'lesesaal', 'sala_dantesca', 'brueckensaal', 'madonna_della_tromba', 'wappen_agnus_dei', 'licht_ausstattung'];

// Brücke zu Orsanmichele (OSM w1394931261, Projekt orsanmichele): Orsanmichele hat an ihrem Westende keine Öffnung (Wand d ≤ 2),
// deshalb endet die Tür im 4. OG blind: Nische in der Ostwand mit geschlossenem Türblatt (Lage 29..32), gerahmt von Pietra serena.
const BRUECKE = { x: [-343, -342], z0: 550, z1: 553, y0: 29, y1: 32 };

function vorher(api) {
  const { D, set, frei, Y } = api;
  const T = typen();
  for (const c of D.haupt) {
    if (c.x < BRUECKE.x[0] || c.x > BRUECKE.x[1] || c.z < BRUECKE.z0 - 1 || c.z > BRUECKE.z1 + 1) continue;
    const rahmen = c.z < BRUECKE.z0 || c.z > BRUECKE.z1;
    for (let yr = BRUECKE.y0; yr <= BRUECKE.y1 + 1; yr++) {
      if (yr > BRUECKE.y1) { set(c.x, Y(yr), c.z, T.serena, 'bruecke_tuer'); continue; }              // Sturz
      if (rahmen) set(c.x, Y(yr), c.z, T.serena, 'bruecke_tuer');                                       // Laibung
      else if (c.d8 === 1) set(c.x, Y(yr), c.z, T.holz, 'bruecke_tuer');                              // geschlossenes Türblatt
      else frei(c.x, Y(yr), c.z);                                                                      // Nische davor (Anschlussstück)
    }
  }
}

function ausstatten(api) {
  const { Y, BASIS } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);
  const tafelRahmen = (q, j, B, H) => q === 0 || q === B - 1 || j === 0 || j === H - 1;

  // ------------------------------------------------------------ Sala delle Udienze (EG, Westhalle Süd, Via Calimala)
  {
    const z = K.steh(0, { u0: 3, u1: 15, w0: 31, w1: 51 });
    K.boden('sala_udienze', 0, z, (c) => schach(c, 3, t.cotto, t.weiss));
    K.waende('sala_udienze', 0, z, {
      pitch: 10, y0: 2, y1: 5, farben: ['hellblau', 'weiss'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 1, typ: t.holz }
    });
    // Kreuzgewölbe mit Tugenden und Evangelisten (Trecento-Fresken): Rippen aus Holz, Felder blau, Schlusssteine golden
    K.decke('sala_udienze', 0, z, (c) => {
      const a = mod(Math.floor(c.u + 0.5), 6), b = mod(Math.floor(c.w + 0.5), 6);
      if (a === 0 || b === 0) return t.holz;
      return (a === 3 && b === 3) ? t.gold : FR((Math.floor((c.u + 0.5) / 6) + Math.floor((c.w + 0.5) / 6)) & 1 ? 'blau' : 'hellblau');
    });
    // Madonna auf dem Thron zwischen Engeln und Heiligen (Ostwand), 10 x 6
    K.flaeche('sala_udienze', 0, { u0: 14.5, u1: 15.9, w0: 36, w1: 46 }, 2, 7, (c, jj) => {
      const q = Math.floor(c.w - 36 + 0.0001), B = 10, H = 6;
      if (tafelRahmen(q, jj, B, H)) return t.gold;
      if (q >= 4 && q <= 5) return jj <= 2 ? FR('blau') : jj === 3 ? FR('orange') : t.gold;
      if (q === 3 || q === 6) return jj <= 2 ? t.gold : FR('hellblau');
      if (q === 2 || q === 7) return jj <= 2 ? FR(q === 2 ? 'rot' : 'gruen') : jj === 3 ? FR('orange') : FR('hellblau');
      return FR('hellblau');
    });
    // Investitur / Giostra um 1340 im sienesischen Stil (rechte Wand = Südwand), 8 x 5: Ritter in Rot und Blau vor Weiß
    K.flaeche('sala_udienze', 0, { u0: 5, u1: 13, w0: 46, w1: 52 }, 2, 6, (c, jj) => {
      if (c.d8 !== 2) return null;
      const q = Math.floor(c.u - 5 + 0.0001);
      if (jj === 0 || jj === 4) return t.gold;
      if (jj === 1) return q % 2 ? FR('rot') : FR('blau');
      if (jj === 2) return q % 3 === 1 ? FR('orange') : FR('weiss');
      return q % 2 ? FR('gelb') : FR('weiss');
    });
    for (const u of [5, 10]) K.quader('sala_udienze', 0, { u0: u, u1: u + 3, w0: 41, w1: 43 }, 1, 1, t.holz);        // Richtertische (1 Block hoch)
  }

  // ------------------------------------------------------------ Bibliothek der Società Dantesca (1. OG, Westhalle Nord, Treppenaufgang)
  {
    const z = K.steh(1, { u0: 3, u1: 15, w0: 3, w1: 29 });
    const buecher = ['rot', 'braun', 'gruen', 'blau', 'gelb', 'braun'].map(FR);
    K.boden('bibliothek', 1, z, (c) => schach(c, 3, t.cotto, t.holz));
    K.waende('bibliothek', 1, z, {
      pitch: 8, y0: 2, y1: 5, farben: ['braun'], rahmen: t.holz, pilaster: t.holz, sockel: { h: 1, typ: t.holz },
      motiv: (k, q, j) => ((hash(k, q, 9) % 7 === 0) ? null : buecher[hash(k, q, j + 4) % buecher.length])
    });
    // bemalte Dachstühle: Balken aus Holz, Felder rot und gelb
    K.decke('bibliothek', 1, z, (c) => (mod(Math.floor(c.u + 0.5), 4) === 0 ? t.holz : FR(mod(Math.floor(c.w + 0.5), 2) ? 'rot' : 'gelb')));
    // Lünette: Madonna auf dem Thron zwischen Engeln (Ostwand), 6 x 4
    K.flaeche('bibliothek', 1, { u0: 14.5, u1: 15.9, w0: 5, w1: 11 }, 3, 6, (c, jj) => {
      const q = Math.floor(c.w - 5 + 0.0001);
      if (tafelRahmen(q, jj, 6, 4)) return t.gold;
      if (q === 2 || q === 3) return jj === 1 ? FR('blau') : jj === 2 ? FR('orange') : FR('hellblau');
      return jj === 1 ? FR('weiss') : FR('hellblau');
    });
    // Wappen Florentiner Institutionen am Fries der Nordwand
    const farben = ['rot', 'blau', 'gruen', 'gelb', 'orange'].map(FR);
    K.flaeche('bibliothek', 1, { u0: 4, u1: 15, w0: 0, w1: 6 }, 5, 6, (c, jj) => {
      if (c.d8 !== 2) return null;
      const q = Math.floor(c.u - 4), k = Math.floor(q / 3), i = mod(q, 3);
      if (i === 2) return null;
      return jj === 1 ? t.gold : farben[mod(k, farben.length)];
    });
    for (const u of [4.5, 10.5]) K.quader('bibliothek', 1, { u0: u, u1: u + 2, w0: 5, w1: 14 }, 1, 1, t.holz);       // Lesetische
  }

  // ------------------------------------------------------------ Lesesaal (2. OG, Westhalle Nord)
  {
    const z = K.steh(2, { u0: 3, u1: 15, w0: 3, w1: 29 });
    const buecher = ['braun', 'rot', 'blau', 'braun', 'gruen'].map(FR);
    K.boden('lesesaal', 2, z, (c) => schach(c, 3, t.holz, t.cotto));
    K.waende('lesesaal', 2, z, {
      pitch: 8, y0: 2, y1: 5, farben: ['braun'], rahmen: t.holz, pilaster: t.holz, sockel: { h: 1, typ: t.holz },
      motiv: (k, q, j) => ((hash(k, q, 5) % 6 === 0) ? null : buecher[hash(k, q, j + 1) % buecher.length])
    });
    K.decke('lesesaal', 2, z, (c) => kassette(c, 4, t.holz, t.putz, null));
    for (const u of [4.5, 10.5]) K.quader('lesesaal', 2, { u0: u, u1: u + 2, w0: 5, w1: 14 }, 1, 1, t.holz);
  }

  // ------------------------------------------------------------ Sala della Società Dantesca (3. OG, Ostsaal Mitte)
  {
    const z = K.steh(3, { u0: 17, u1: 40, w0: 26, w1: 43 });
    K.boden('sala_dantesca', 3, z, (c) => schach(c, 4, t.cotto, t.weiss));
    K.waende('sala_dantesca', 3, z, {
      pitch: 10, y0: 2, y1: 5, farben: ['rot', 'blau'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 1, typ: t.holz },
      motiv: (k, q, j, B, H) => schildMotiv(k, q, j, B, H, ['rot', 'blau', 'gruen'].map(FR), t.gold, FR('weiss'))
    });
    K.decke('sala_dantesca', 3, z, (c) => kassette(c, 5, t.holz, t.putz, t.gold));
    K.quader('sala_dantesca', 3, { u0: 22, u1: 34, w0: 33, w1: 36 }, 1, 1, t.holz);                                     // langer Sitzungstisch
  }

  // ------------------------------------------------------------ Brückensaal (4. OG, Ostsaal Mitte) mit der Tür zur Brücke
  {
    const z = K.steh(4, { u0: 17, u1: 40, w0: 26, w1: 43 });
    K.boden('brueckensaal', 4, z, (c) => schach(c, 4, t.holz, t.cotto));
    K.waende('brueckensaal', 4, z, {
      pitch: 10, y0: 2, y1: 4, farben: ['weiss', 'hellblau'], rahmen: t.holz, pilaster: t.serena, sockel: { h: 1, typ: t.serena },
      nur: (e) => e.p !== 'bruecke_tuer'
    });
    K.decke('brueckensaal', 4, z, (c) => kassette(c, 6, t.holz, t.putz, null));
    K.quader('brueckensaal', 4, { u0: 24, u1: 32, w0: 32, w1: 34 }, 1, 1, t.holz);
  }

  // ------------------------------------------------------------ Tabernakel der Madonna della Tromba an der Nordwestecke (außen, Lage 9..15)
  {
    K.flaeche('madonna_della_tromba', 0, { u0: -1, u1: 1.3, w0: 3.5, w1: 8.5 }, 9, 15, (c, jj) => {
      if (c.d8 !== 1) return null;
      const q = Math.min(4, Math.max(0, Math.floor(c.w - 3.5 + 0.0001))), H = 7;
      if (jj === H - 1) return q === 2 ? t.gold : t.ornament;                                              // Giebel
      if (q === 0 || q === 4 || jj === 0) return t.serena;                                                  // Pfosten und Sockel
      if (q === 2) return jj === 4 ? FR('orange') : jj === 3 ? t.gold : FR('blau');                         // Madonna mit Nimbus
      return FR('hellblau');
    });
  }

  // ------------------------------------------------------------ Wappen mit dem Lamm (Agnus Dei) und Inschrift von 1308 an beiden Fassaden
  {
    const lamm = (c, jj, q) => {
      if (jj === 0 || jj === 3 || q === 0 || q === 3) return t.gold;
      return (jj === 1 || jj === 2) && (q === 1 || q === 2) ? FR('weiss') : FR('blau');
    };
    K.flaeche('wappen_agnus_dei', 0, { u0: -1, u1: 1.3, w0: 21, w1: 25 }, 17, 20, (c, jj) => (c.d8 === 1 ? lamm(c, jj, Math.floor(c.w - 21 + 0.0001)) : null));
    K.flaeche('wappen_agnus_dei', 0, { u0: 34, u1: 37.5, w0: 21, w1: 25 }, 17, 20, (c, jj) => (c.d8 === 1 ? lamm(c, jj, Math.floor(c.w - 21 + 0.0001)) : null));
    K.flaeche('wappen_agnus_dei', 0, { u0: -1, u1: 1.3, w0: 19, w1: 27 }, 15, 15, (c) => (c.d8 === 1 ? t.gold : null));
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6), erzeugt content/modul_6.json
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const QU = 'it.wikipedia, Palazzo dell’Arte della Lana';
const INHALT = {
  titel: 'Ausgestaltete Innenräume', untertitel: 'Sala delle Udienze, Bibliothek, Säle und Fassadenschmuck', icon: '🏛️',
  teile: {
    sala_udienze: { title: 'Sala delle Udienze', description: 'Saal im Erdgeschoss an der Via Calimala: Schachbrettboden aus Terrakotta und Marmor, Wandfelder in Hellblau und Weiß, Kreuzgewölbe mit Rippen und blauen Feldern (Tugenden und Evangelisten), an der Ostwand die Madonna auf dem Thron zwischen Engeln und Heiligen (Farbfeld 10 × 6), an der Südwand die Investitur / Giostra um 1340 (Farbfeld 8 × 5), zwei Richtertische.', tip: 'Boden und Wandfelder zuerst, die Bilder zuletzt.', caution: VER + ' Die Bildinhalte sind nur als Farbflächen angedeutet.', fact: `Die Sala delle Udienze trägt Trecento-Fresken (Gewölbe mit Tugenden und Evangelisten, thronende Madonna, Heilige; um 1310–1320) und eine Investitur um 1340 an der rechten Wand (Quelle: ${QU}).` },
    bibliothek: { title: 'Bibliothek der Società Dantesca', description: 'Saal im ersten Obergeschoss über dem Treppenaufgang: Bücherwände mit farbigen Rücken, bemalter Dachstuhl mit Balken und roten und gelben Feldern, Lünette mit der thronenden Madonna zwischen Engeln (6 × 4), ein Fries mit Wappen Florentiner Institutionen und zwei Lesetische.', tip: 'Die Bücherwände bestehen aus Wandfeldern, die Lesetische sind einen Block hoch.', caution: VER + ' Die Wappen sind nur farbige Schilde.', fact: `Im ersten Stock befinden sich der Treppenaufgang mit bemalten Dachstühlen und Wappen Florentiner Institutionen sowie die Bibliothek der Società Dantesca; eine Lünette zeigt eine thronende Madonna zwischen Engeln (Quelle: ${QU}).` },
    lesesaal: { title: 'Lesesaal', description: 'Saal im zweiten Obergeschoss mit Bücherwänden, Holz-Kassettendecke und zwei Lesetischen.', tip: 'Wie die Bibliothek eine Etage tiefer.', caution: VER + ' Raumfolge und Lage sind Stufe C.', fact: 'Dass die Società Dantesca Italiana das Haus seit 1903 besitzt, ist belegt; die Aufteilung in Lesesaal und Sitzungssaal ist ein Entwurf (Stufe C).' },
    sala_dantesca: { title: 'Sala della Società Dantesca', description: 'Sitzungssaal im dritten Obergeschoss: Boden aus Terrakotta und Marmor, rote und blaue Wandfelder mit Wappenschilden, Kassettendecke mit goldenen Mitten und ein langer Sitzungstisch.', tip: 'Die Kassettendecke gibt dem Raum seine Höhe.', caution: VER + ' Stufe C: Quellen beschreiben diesen Saal nicht.', fact: `Die Società Dantesca Italiana hat den Palazzo seit 1903 (Quelle: ${QU}).` },
    brueckensaal: { title: 'Brückensaal', description: 'Saal im vierten Obergeschoss, in dessen Ostwand die Tür zur Brücke nach Orsanmichele liegt: eine Nische mit geschlossenem Holztürblatt zwischen Pfeilern aus Pietra serena. Holzboden, Kassettendecke, ein Tisch.', tip: 'Die Nische ist zwei Blöcke tief; das Türblatt sitzt in der äußeren Lage.', caution: VER + ' Orsanmichele hat an seinem Westende keine Öffnung, deshalb bleibt die Tür im Modell geschlossen.', fact: `1569 ließ Cosimo I. de’ Medici nach einem Entwurf von Bernardo Buontalenti einen Verbindungsbau über die Via dell’Arte della Lana zu den Obergeschossen von Orsanmichele errichten; seine Überdachung wurde 1964–1967 entfernt (Quelle: ${QU}).` },
    madonna_della_tromba: { title: 'Tabernakel der Madonna della Tromba', description: 'Außen an der Nordwestecke, im zweiten Obergeschoss: ein Tabernakel aus Pietra serena mit Giebel; im Feld die Madonna in Blau mit goldenem Nimbus.', tip: 'Das Tabernakel ist 5 Blöcke breit und 7 hoch.', caution: VER + ' Die Madonna ist nur eine Farbfigur.', fact: `Das Tabernakel der Santa Maria della Tromba stand ursprünglich am Mercato Vecchio und wurde 1917 an der Ecke wieder aufgebaut (Quelle: ${QU}).` },
    wappen_agnus_dei: { title: 'Wappen mit dem Lamm', description: 'An der Westfassade (Via Calimala) und der Ostfassade (Via dell’Arte della Lana) je ein goldgerahmtes Wappen: weißes Lamm auf Blau (Agnus Dei); an der Westfassade darunter ein goldenes Band als Inschriftenzeile.', tip: 'Jedes Wappen ist 4 × 4 Blöcke groß.', caution: VER + ' Die Inschrift ist nur als goldenes Band angedeutet.', fact: `Die Wappen mit dem Agnus Dei und die lateinischen Inschriften von 1308 sitzen an beiden Fassaden (Quelle: ${QU}).` },
    licht_ausstattung: { title: 'Licht in den Sälen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { PORTALE, TREPPE, WAENDE, TEILE, BRUECKE, INHALT, vorher, ausstatten };
