'use strict';
// Raumplan und Ausstattung des Palazzo Arcivescovile (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_arcivescovile/).
// Rahmen AA (theta 93,7 Grad): u entlang der Fassade zur Piazza San Giovanni (Nord → Süd), w von der Fassade nach Westen
// (Piazza dell'Olio bei w ≈ 63..71). Geschosse: EG Lage 0..10, Piano nobile 10..21, zwei Mezzanin-Geschosse 21..29 und 29..37.
// Der Hof (Loch 0) liegt bei u 48..83, w 32..49. Raumaufteilung Stufe C; Existenz der Räume nach it.wikipedia.
const { kit, typen, schach, kassette, mod, hash } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

const PORTALE = [
  { u: 49.1, w: 0, breite: 6, hoehe: 9 },         // Hauptportale zur Piazza San Giovanni (Achse 5 und 8)
  { u: 75.8, w: 0, breite: 6, hoehe: 9 },
];
// Tore in der schrägen Westwand (Piazza dell'Olio): Schnitt im Rahmen unabhängig von der Außennormale der Zelle
const TORE_WEST = [{ u: 63, breite: 6, hoehe: 8 }, { u: 100, breite: 6, hoehe: 10 }];   // Kutschentor (1677), Portal der Kirche
function oeffnungen(api) {
  const { D, Y, oeffnung } = api;
  for (const c of D.haupt) {
    if (c.d8 > 2 || c.w < 50) continue;
    for (const p of TORE_WEST) {
      const v = c.u - p.u;
      if (Math.abs(v) >= p.breite / 2) continue;
      const h = Math.floor(p.hoehe - p.breite / 2 + Math.sqrt(Math.max(0, (p.breite / 2) ** 2 - v * v)));
      for (let yr = 1; yr <= h; yr++) oeffnung('tor', 'portale', c.x, Y(yr), c.z);
    }
  }
}
const TREPPE = { u: 20, w: 42 };

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 × 5)
const WAENDE = [
  { achse: 'u', v: 37.5, von: 1, bis: 27, tueren: [15] },        // Salone | Sala dell'Udienza
  { achse: 'u', v: 88.5, von: 1, bis: 27, tueren: [15] },        // Sala dell'Udienza | Südsaal
  { achse: 'w', v: 28.5, von: 0, bis: 37, tueren: [8] },         // Salone | Treppenhaus
  { achse: 'w', v: 55.5, von: 0, bis: 37, tueren: [20] },        // Treppenhaus | Westflügel
  { achse: 'u', v: 65, von: 54, bis: 70, tueren: [60] },         // Westflügel Nord | Süd
  { achse: 'u', v: 89, von: 52, bis: 70, tueren: [] },           // Westflügel Süd | Kirche
  { achse: 'w', v: 28.5, von: 89, bis: 127, tueren: [100, 115] },// Südsaal | Südflügel
  { achse: 'w', v: 36.5, von: 89, bis: 110, tueren: [] },        // Kirche, Chorwand
  { achse: 'u', v: 110.5, von: 29, bis: 70, tueren: [] }         // Kirche, Ostwand
];

// Türen der Innenwand um den Hof: Raster 14; Südseite (Kirche) und Westseite (Kutschentor) mit breiteren Türen im EG
function innenwandTuer(c, s, v) {
  if (c.u > 84 && c.hofEntlang === 'w') {
    if (s === 0) return Math.abs(v - 49) < 2.5 || Math.abs(v - 35) < 1.5;
    if (s === 1) return Math.abs(v - 35) < 1.5;                     // über der Kirche liegt der Luftraum des Schiffs
  }
  if (s === 0 && c.w > 45 && c.hofEntlang === 'u' && Math.abs(v - 63) < 3) return true;
  const r = ((v % 14) + 14) % 14 - 7;
  return Math.abs(r) < 1.5;
}

// ---------------------------------------------------------------- Kirche San Salvatore al Vescovo (Lage Stufe C)
// Schiff mit Tonnengewölbe, Achse entlang w: Chor an der Chorwand (w 37), Portal zur Piazza dell'Olio (w ≈ 64)
const KIRCHE = { u0: 90, u1: 110, w0: 37.4, w1: 62.8, uMitte: 99.8, halb: 9.7, ansatz: 13, hoehe: 8 };
const imKirche = (c) => c.u >= KIRCHE.u0 && c.u < KIRCHE.u1 - 0.5 && c.w >= KIRCHE.w0 && c.w < KIRCHE.w1;
const gewoelbeStart = (c) => KIRCHE.ansatz + Math.ceil(KIRCHE.hoehe * Math.sqrt(Math.max(0, 1 - ((c.u - KIRCHE.uMitte) / KIRCHE.halb) ** 2)));

/** Das Geschossbodenfeld des Piano nobile über dem Schiff entfällt (hoher Raum über zwei Geschosse). */
function vorher(api) {
  const { D, Y, BASIS, frei } = api;
  for (const c of D.haupt) if (imKirche(c) && c.d8 > 2) frei(c.x, Y(BASIS[1]), c.z);
}

function ausstatten(api) {
  const { D, Y, BASIS, set, hat, key } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Sala dell'Udienza (Piano nobile, Mitte der Fassade)
  {
    const z = K.steh(1, { u0: 39, u1: 88, w0: 2, w1: 28 });
    K.boden('sala_udienza', 1, z, (c) => schach(c, 3, t.cotto, t.weiss));
    K.waende('sala_udienza', 1, z, { pitch: 10, y0: 3, y1: 8, farben: ['gelb', 'weiss'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 2, typ: t.holz } });
    // Decke: Himmelsfeld mit vier Rundbildern (Bischofsbildnisse auf den Pendentifs) in den Ecken
    const cu = [45, 82], cw = [8, 23];
    K.decke('sala_udienza', 1, z, (c) => {
      for (const u of cu) for (const w of cw) {
        const d = Math.hypot(c.u - u, c.w - w);
        if (d < 3.6) return d > 2.7 ? t.gold : FR(((u + w) & 1) ? 'rot' : 'blau');
      }
      return ((Math.floor(c.u) + Math.floor(c.w)) % 7 === 0) ? t.gold : FR('hellblau');
    });
    K.quader('sala_udienza', 1, { u0: 60, u1: 68, w0: 22, w1: 25 }, 1, 1, t.holz);                // Thronpodest des Erzbischofs
    K.quader('sala_udienza', 1, { u0: 62, u1: 66, w0: 23, w1: 25 }, 2, 2, t.holz);
    K.quader('sala_udienza', 1, { u0: 50, u1: 76, w0: 11, w1: 14 }, 1, 1, t.holz);                 // Audienztisch
  }

  // ------------------------------------------------------------ Salone (Piano nobile, Nordende der Fassade; Fresken Meuccis verloren)
  {
    const z = K.steh(1, { u0: 0, u1: 37, w0: 2, w1: 28 });
    K.boden('salone', 1, z, (c) => schach(c, 4, t.cotto, t.weiss));
    K.waende('salone', 1, z, { pitch: 9, y0: 3, y1: 8, farben: ['weiss'], rahmen: t.holz, pilaster: t.serena, sockel: { h: 2, typ: t.holz } });
    K.decke('salone', 1, z, (c) => kassette(c, 5, t.holz, t.putz, t.gold));
    K.quader('salone', 1, { u0: 14, u1: 24, w0: 12, w1: 15 }, 1, 1, t.holz);
  }

  // ------------------------------------------------------------ Treppenhaus (Ausstattung 1736–38)
  for (const s of [0, 1]) {
    const z = K.steh(s, { u0: 0, u1: 38, w0: 29, w1: 55 });
    K.boden('treppenhaus', s, z, (c) => ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? t.pflaster : t.weiss));
    K.waende('treppenhaus', s, z, { pitch: 8, y0: 3, y1: s === 0 ? 7 : 9, farben: ['weiss', 'gelb'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena } });
  }

  // ------------------------------------------------------------ Kirche San Salvatore al Vescovo
  {
    const z = K.steh(0, { u0: KIRCHE.u0, u1: KIRCHE.u1, w0: KIRCHE.w0, w1: KIRCHE.w1 });
    K.boden('chiesa_san_salvatore', 0, z, (c) => (Math.abs(c.u - KIRCHE.uMitte) < 1.8 ? t.ornament : schach(c, 3, t.weiss, t.rot)));
    K.waende('chiesa_san_salvatore', 0, z, { pitch: 7, y0: 2, y1: 8, farben: ['weiss', 'gelb'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.gruen }, fries: t.gold });
    // Presbyterium, Hochaltar, Altarbild (Anbetung der Hirten, Ferretti 1738), Bänke
    K.quader('chiesa_san_salvatore', 0, { u0: 93, u1: 107, w0: 38, w1: 44 }, 1, 1, t.serena);
    K.quader('chiesa_san_salvatore', 0, { u0: 97.5, u1: 102.5, w0: 39.5, w1: 41.5 }, 2, 3, t.weiss);
    K.flaeche('chiesa_san_salvatore', 0, { u0: 94, u1: 106, w0: 35, w1: 38.6 }, 4, 12, (c, jj) => {
      const q = c.u - 94;
      if (jj === 0 || jj === 8 || q < 1 || q > 11) return t.gold;
      if (jj >= 6) return FR('hellblau');                                                                // Engelsglorie
      if (jj <= 1) return FR('gruen');
      return [FR('braun'), FR('rot'), FR('weiss'), FR('blau'), FR('gelb'), FR('orange')][Math.floor(q) % 6];   // Hirten und Krippe
    });
    for (let w = 47; w <= 59; w += 3) for (const [u0, u1] of [[92, 98], [102, 108]]) K.quader('chiesa_san_salvatore', 0, { u0, u1, w0: w, w1: w + 1 }, 1, 1, t.holz);
    // Fassade zur Piazza dell'Olio: drei Blendarkaden auf Halbsäulen, Marmorintarsien in Weiß und Grün (Stufe B)
    K.flaeche('chiesa_san_salvatore', 0, { u0: 89.5, u1: 110.5, w0: 58, w1: 70 }, 1, 12, (c, jj, j) => {
      if (c.d8 !== 1) return null;
      const P = (KIRCHE.u1 - KIRCHE.u0) / 3, q = c.u - KIRCHE.u0, k = Math.floor(q / P), tt = q - (k + 0.5) * P;
      const saeule = Math.abs(Math.abs(tt) - P / 2) < 0.7;
      if (saeule && j <= 7) return j % 3 === 0 ? t.gruen : t.weiss;
      const d = Math.hypot(tt, j - 7);
      if (j >= 7 && d <= P / 2 && d > P / 2 - 0.9) return k % 2 ? t.weiss : t.gruen;
      if (j === 12) return t.weiss;
      return null;
    });
  }
  // Tonnengewölbe über dem Schiff (Meucci: Himmelfahrt Christi am Gewölbe): massiv bis unter den Boden des 2. Geschosses
  {
    const FRG = ['hellblau', 'weiss', 'hellblau', 'gelb'];
    for (const c of D.haupt) {
      if (!imKirche(c) || c.d8 <= 2) continue;
      const j0 = gewoelbeStart(c);
      for (let yr = j0; yr < BASIS[2]; yr++) {
        if (hat(c.x, Y(yr), c.z)) continue;
        let typ = t.putz;
        if (yr === j0) {
          const rippe = mod(Math.floor(c.w - KIRCHE.w0), 6) === 0 || Math.abs(c.u - KIRCHE.uMitte) < 0.6;
          typ = rippe ? t.gold : FR(FRG[hash(Math.floor(c.u / 2), Math.floor(c.w / 2), 9) % 4]);
        }
        set(c.x, Y(yr), c.z, typ, 'chiesa_gewoelbe');
      }
    }
  }

  // ------------------------------------------------------------ Hof
  K.hofboden('hof_erzbischof', { u0: 44, u1: 87, w0: 29, w1: 53 }, (c) => (Math.abs(c.u - 65.5) < 1.2 || Math.abs(c.w - 40.5) < 1.2 ? t.serena : schach(c, 3, t.pflaster, t.weiss)));

  // ------------------------------------------------------------ Wappen an den Fassadenecken (Piano nobile)
  const wappen = (teil, u0, farbe, kron) => K.flaeche(teil, 1, { u0, u1: u0 + 4, w0: 0, w1: 1.5 }, 3, 9, (c, jj) => {
    const q = c.u - u0;
    if (c.d8 !== 1) return null;
    if (jj === 0 || jj === 5 || q < 0.5 || q > 3.5) return t.gold;
    if (jj >= 6) return kron;                                                                          // Triregno bzw. Hut
    return (jj === 3 && Math.floor(q) % 2) ? t.gold : FR(farbe);
  });
  wappen('wappen_fassade', 7, 'rot', t.weiss);                  // Medici-Wappen mit Triregno und Schlüsseln (Ecke Via de' Cerretani)
  wappen('wappen_fassade', 105.5, 'blau', t.rot);               // Wappen des Erzbischofs Bausa (1895)
}

// ---------------------------------------------------------------- Öffnungen: Luft unter den Gewölben gibt es nicht
const TEILE = ['sala_udienza', 'salone', 'treppenhaus', 'chiesa_san_salvatore', 'chiesa_gewoelbe', 'hof_erzbischof', 'wappen_fassade', 'licht_ausstattung'];

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, Lage und Größe Stufe C.';
const INHALT = {
  titel: 'Ausgestaltete Innenräume', untertitel: 'Sala dell\'Udienza, Salone, Treppenhaus, Kirche San Salvatore und Hof', icon: '⛪',
  teile: {
    sala_udienza: { title: 'Sala dell\'Udienza', description: 'Saal im Piano nobile mitten an der Fassade: Schachboden aus Cotto und Marmor, Wandfelder in Gelb und Weiß mit Goldrahmen und Pilastern, Decke als Himmelsfeld mit vier Rundbildern in den Ecken, ein Thronpodest und ein langer Tisch.', tip: 'Boden, Wandfelder, Decke, dann Podest und Tisch.', caution: VER + ' Die Rundbilder stehen für die Bischofsbildnisse, einzelne Gesichter gibt es nicht.', fact: '1615 bis 1620 wurde der Saal umgestaltet und von Nicodemo Ferrucci ausgemalt; auf den Pendentifs sind Bischofsbildnisse erhalten (Quelle: it.wikipedia, Palazzo Arcivescovile).' },
    salone: { title: 'Salone', description: 'Saal im Piano nobile am Nordende der Fassade: Schachboden, schlichte weiße Wandfelder mit Holzrahmen, Kassettendecke aus Holz und Gold, ein Tisch.', tip: 'Die Wände bleiben bewusst ohne Bilder.', caution: VER + ' Die Wandfelder sind leer, weil die Fresken verloren sind.', fact: 'Die Fresken von Vincenzo Meucci im Salon gingen später verloren (Quelle: it.wikipedia, Palazzo Arcivescovile).' },
    treppenhaus: { title: 'Treppenhaus', description: 'Raum um die Wendeltreppe im Nordflügel, Erdgeschoss und Piano nobile: Pflaster im Schachmuster, Wandfelder in Weiß und Gelb zwischen Pilastern aus Pietra serena.', tip: 'Den Treppenkern lässt du frei, die Wandfelder laufen um ihn herum.', caution: VER + ' Die Treppe selbst ist eine Wendeltreppe, die Palasttreppe im Hof ist nicht nachgebaut.', fact: 'Bischof Martelli ließ 1736 bis 1738 Salon, Treppenhaus und die Kirche San Salvatore ausstatten (Quelle: it.wikipedia, Palazzo Arcivescovile).' },
    chiesa_san_salvatore: { title: 'Kirche San Salvatore al Vescovo', description: 'Einschiffige Kirche über zwei Geschosse an der Rückseite zur Piazza dell\'Olio: Marmorboden mit Mittelstreifen, Wandfelder zwischen Pilastern, Presbyterium mit Hochaltar und Altarbild als Farbfeld, zehn Holzbänke. Außen drei Blendarkaden auf Halbsäulen in Weiß und Grün.', tip: 'Erst Boden und Wandfelder, dann Presbyterium, Altar, Bänke und die Außenfassade.', caution: VER + ' Der Zugang vom Hof und die Lage an der Piazza dell\'Olio sind belegt, Grundriss und Größe nicht. Die Chorkuppel und die Altäre fehlen.', fact: 'Die Kirche ist seit 1032 belegt; der Zugang erfolgt über den Innenhof, die Innenausstattung wurde 1737 abgeschlossen. Die Hirtenanbetung malte Ferretti 1738 hinter dem Altar (Quelle: it.wikipedia, Chiesa di San Salvatore al Vescovo).' },
    chiesa_gewoelbe: { title: 'Tonnengewölbe der Kirche', description: 'Das hohe Tonnengewölbe über dem Schiff, massiv von der Bogenlinie bis unter den Boden des zweiten Mezzanin-Geschosses: Himmelsblau und Weiß mit goldenen Gurtrippen als Bild der Himmelfahrt Christi.', tip: 'Von den Wänden zur Mitte bauen, die Rippen zuletzt.', caution: VER + ' Die Himmelfahrt Christi ist nur als Farbfläche angedeutet.', fact: 'Das Gewölbe des einschiffigen Raums ist hoch und stammt aus dem 18. Jahrhundert; Vincenzo Meucci malte die Himmelfahrt Christi (Quelle: it.wikipedia, Chiesa di San Salvatore al Vescovo).' },
    hof_erzbischof: { title: 'Hof', description: 'Pflaster des Hofs im Schachmuster aus hellem Stein und Marmor, durchzogen von zwei Mittelstreifen aus Pietra serena.', tip: 'Erst die Streifen, dann das Schachmuster.', caution: VER + ' Die Palasttreppe und die Serliana an den Schmalseiten sind nicht nachgebaut.', fact: 'Der rechteckige Hof wird auf Dosio zurückgeführt und ist von Rundbogenarkaden auf dorischen Säulen und Pilastern umgeben; oben verläuft eine Loggia mit ionischen Säulen (Quelle: it.wikipedia, Palazzo Arcivescovile).' },
    wappen_fassade: { title: 'Wappen an der Fassade', description: 'Zwei Wappenschilde als Farbfelder im Piano nobile: links das Medici-Wappen mit Triregno an der Ecke zur Via de\' Cerretani, rechts das Wappen des Erzbischofs Bausa vom Wiederaufbau 1895.', tip: 'Die Felder ersetzen Fassadenblöcke zwischen zwei Fenstern.', caution: VER + ' Die Farben sind frei gewählt.', fact: 'An der Ecke zur Via de\' Cerretani steht das Medici-Wappen mit Triregno und Schlüsseln, am anderen Ende das Wappen Bausas (Quelle: it.wikipedia, Palazzo Arcivescovile).' },
    licht_ausstattung: { title: 'Licht in den Sälen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { PORTALE, TREPPE, WAENDE, TEILE, INHALT, KIRCHE, vorher, ausstatten, nachher() {}, oeffnungen, innenwandTuer };
