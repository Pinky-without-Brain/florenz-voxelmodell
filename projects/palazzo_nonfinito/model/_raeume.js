'use strict';
// Raumplan und Ausstattung des Palazzo Nonfinito (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_nonfinito/).
// Rahmen NF (theta -93,26 Grad): u entlang der Fassade zur Via del Proconsolo (Süd → Nord, 0..97), w von dieser Fassade nach
// Osten (0..110); die Fassade zum Borgo degli Albizi liegt bei u 0. Geschosse: EG Lage 0..10, Piano nobile 10..23.
// Hof Cigolis (Loch 1) bei u 31..71, w 47..65, kleiner Lichthof (Loch 0) bei u 30..42, w 81..90. Raumaufteilung Stufe C;
// belegt sind Portale, Kniefenster, Atrium, Treppe rechts des Atriums, Hof mit Perseus und die Museumsnutzung.
const { kit, typen, schach, kassette, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

const TREPPE = { u: 76, w: 32 };
const PORTAL_PROCONSOLO = { u: 49, breite: 7, hoehe: 9 };    // großes Bogenportal (Caccini) in der Mitte der Fassade
const PORTAL_ALBIZI = { w: 49, breite: 6, hoehe: 9 };        // Portal Buontalentis in der Mitte der Kniefenster

/** Portale in lokalen Koordinaten (nicht über cfg.portale: die Fassaden liegen nur um 3,3 Grad schief, Treppenzellen am Rand). */
function oeffnungen(api) {
  const { D, Y, oeffnung } = api;
  const bogen = (b, h, v) => Math.floor(h - b / 2 + Math.sqrt(Math.max(0, (b / 2) ** 2 - v * v)));
  for (const c of D.haupt) {
    if (c.d8 > 2) continue;
    if (c.w < 6) {
      const v = c.u - PORTAL_PROCONSOLO.u;
      if (Math.abs(v) < PORTAL_PROCONSOLO.breite / 2) for (let yr = 1; yr <= bogen(PORTAL_PROCONSOLO.breite, PORTAL_PROCONSOLO.hoehe, v); yr++) oeffnung('tor', 'portale', c.x, Y(yr), c.z);
    }
    if (c.u < 6) {
      const v = c.w - PORTAL_ALBIZI.w;
      if (Math.abs(v) < PORTAL_ALBIZI.breite / 2) for (let yr = 1; yr <= bogen(PORTAL_ALBIZI.breite, PORTAL_ALBIZI.hoehe, v); yr++) oeffnung('tor', 'portale', c.x, Y(yr), c.z);
    }
  }
}

/** Fensterrahmen der Kniefenster in der Wandebene: die Wandzellen um jedes Fenster werden Pietra serena (Sohlbank, Gewände, Sturz). */
function nachher(api) {
  const { zellen, key } = api;
  const SERENA = WZ.typ('pietra_serena');
  const N6 = [[1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1], [0, 1, 0], [0, -1, 0]];
  for (const e of zellen.values()) {
    if (e.p !== 'fenster') continue;
    for (const [dx, dy, dz] of N6) {
      const n = zellen.get(key(e.x + dx, e.y + dy, e.z + dz));
      if (n && n.p === 'aussenwand') n.t = SERENA;
    }
  }
}

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3,4 × 5)
const WAENDE = [
  // Erdgeschoss, Nordflügel: Atrium (u 41,6..55,4) zwischen je zwei Räumen
  { s: 0, achse: 'u', v: 40.5, von: 0, bis: 41, tueren: [11, 32] },
  { s: 0, achse: 'u', v: 57.5, von: 0, bis: 41, tueren: [11, 32] },
  { s: 0, achse: 'w', v: 22.5, von: 0, bis: 40, tueren: [] },
  { s: 0, achse: 'w', v: 22.5, von: 58, bis: 100, tueren: [] },
  // Piano nobile, Nordflügel: fünf Säle (die Ringtüren liegen bei u 35, 49 und 63)
  { s: 1, achse: 'u', v: 28, von: 0, bis: 41, tueren: [20] },
  { s: 1, achse: 'u', v: 42, von: 0, bis: 41, tueren: [] },
  { s: 1, achse: 'u', v: 56, von: 0, bis: 41, tueren: [] },
  { s: 1, achse: 'u', v: 70, von: 0, bis: 41, tueren: [20] },
  // beide Geschosse, Westflügel (Albizi-Seite): Vestibül und Raum daneben
  { achse: 'w', v: 42, von: 0, bis: 23, tueren: [] },
  { achse: 'w', v: 58, von: 0, bis: 23, tueren: [] }
];

const TEILE = ['androne', 'treppenhaus', 'hof_cigoli', 'perseus', 'museum_nord', 'museum_west', 'museum_ost', 'fassadenschmuck', 'licht_ausstattung'];

/** Deckenmuster: Wappen von Savoyen (weißes Kreuz auf Rot) und der Stadt (roter Lilienstern auf Weiß) im Wechsel, Kachel 8 × 8. */
function wappenDecke(c, t, FR) {
  const a = mod(Math.floor(c.u), 8) - 3.5, b = mod(Math.floor(c.w), 8) - 3.5;
  const k = Math.floor(c.u / 8) + Math.floor(c.w / 8);
  if (Math.abs(a) > 3 || Math.abs(b) > 3) return t.gold;
  if (k & 1) return (Math.abs(a) < 0.9 || Math.abs(b) < 0.9) ? FR('weiss') : FR('rot');
  return Math.abs(a) + Math.abs(b) < 3 ? FR('rot') : FR('weiss');
}

function ausstatten(api) {
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Atrium (EG hinter dem Proconsolo-Portal)
  {
    const z = K.steh(0, { u0: 41.6, u1: 56.4, w0: 2, w1: 42 });
    K.boden('androne', 0, z, (c) => schach(c, 3, t.pflaster, t.weiss));
    K.waende('androne', 0, z, { pitch: 9, y0: 3, y1: 7, farben: ['weiss', 'gelb'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena } });
    K.decke('androne', 0, z, (c) => kassette(c, 5, t.serena, t.putz, t.weiss));
  }

  // ------------------------------------------------------------ Treppenhaus (rechts vom Atrium, EG und Piano nobile)
  for (const s of [0, 1]) {
    const z = K.steh(s, s === 0 ? { u0: 59, u1: 98, w0: 24, w1: 42 } : { u0: 71.1, u1: 98, w0: 2, w1: 42 });
    K.boden('treppenhaus', s, z, (c) => ((Math.floor(c.u / 2) + Math.floor(c.w / 2)) & 1 ? t.pflaster : t.weiss));
    K.waende('treppenhaus', s, z, { pitch: 8, y0: 3, y1: s === 0 ? 7 : 9, farben: ['weiss', 'gelb'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena } });
  }

  // ------------------------------------------------------------ Hof Cigolis mit Perseus (Lorenzi)
  K.hofboden('hof_cigoli', { u0: 29, u1: 73, w0: 46, w1: 67 }, (c) => (Math.abs(c.u - 51) < 1.2 || Math.abs(c.w - 56.2) < 1.2 ? t.serena : schach(c, 3, t.pflaster, t.weiss)));
  K.figur('perseus', 0, 51, 61.5, { sockel: 2, sockelTyp: t.serena, typ: t.bronze, kopf: t.bronze, beine: 2, rumpf: 2, arme: 'hoch', draussen: true });

  // ------------------------------------------------------------ Museo di Antropologia e Etnologia (Piano nobile): Säle mit Wappendecke und Vitrinen
  const SAAL = (teil, rect, farben) => {
    const z = K.steh(1, rect);
    K.boden(teil, 1, z, (c) => schach(c, 4, t.cotto, t.weiss));
    K.waende(teil, 1, z, { pitch: 9, y0: 3, y1: 9, farben, rahmen: t.holz, pilaster: t.serena, sockel: { h: 2, typ: t.holz } });
    K.decke(teil, 1, z, (c) => wappenDecke(c, t, FR));
    return z;
  };
  const vitrinen = (teil, rect, reihen) => {                                  // Glasblöcke eine Lage hoch
    for (const r of reihen) K.quader(teil, 1, r, 1, 1, t.glas);
    void rect;
  };
  // Nordflügel: fünf Säle
  SAAL('museum_nord', { u0: 2, u1: 26.9, w0: 2, w1: 41 }, ['weiss', 'gelb']);
  SAAL('museum_nord', { u0: 29.1, u1: 40.9, w0: 2, w1: 41 }, ['weiss']);
  SAAL('museum_nord', { u0: 43.1, u1: 54.9, w0: 2, w1: 41 }, ['weiss', 'gelb']);
  SAAL('museum_nord', { u0: 57.1, u1: 68.9, w0: 2, w1: 41 }, ['weiss']);
  vitrinen('museum_nord', null, [{ u0: 8, u1: 20, w0: 8, w1: 9.5 }, { u0: 8, u1: 20, w0: 30, w1: 31.5 }, { u0: 32, u1: 38, w0: 14, w1: 15.5 }, { u0: 46, u1: 52, w0: 14, w1: 15.5 }, { u0: 60, u1: 66, w0: 14, w1: 15.5 }]);
  // Westflügel und Ostflügel um den Hof
  SAAL('museum_west', { u0: 2, u1: 23, w0: 44, w1: 57 }, ['weiss', 'blau']);
  SAAL('museum_west', { u0: 2, u1: 23, w0: 59, w1: 72 }, ['weiss']);
  vitrinen('museum_west', null, [{ u0: 6, u1: 16, w0: 49, w1: 50.5 }, { u0: 6, u1: 16, w0: 64, w1: 65.5 }]);
  SAAL('museum_ost', { u0: 77, u1: 98, w0: 44, w1: 73 }, ['weiss', 'gelb']);
  vitrinen('museum_ost', null, [{ u0: 82, u1: 94, w0: 50, w1: 51.5 }, { u0: 82, u1: 94, w0: 62, w1: 63.5 }]);

  // ------------------------------------------------------------ Fassadenschmuck: Strozzi-Wappen über dem Proconsolo-Portal, Inschrifttafel über dem Albizi-Portal
  K.flaeche('fassadenschmuck', 1, { u0: 46, u1: 52, w0: 0, w1: 3 }, 3, 10, (c, jj) => {
    if (c.d8 !== 1) return null;
    const q = c.u - 46;
    if (jj === 0 || jj === 7 || q < 0.5 || q > 5.5) return t.gold;
    if (jj >= 5) return FR('gelb');
    return Math.floor(q) % 2 ? FR('rot') : FR('weiss');
  });
  K.flaeche('fassadenschmuck', 1, { u0: 0, u1: 3, w0: 45.5, w1: 52.5 }, 3, 7, (c, jj) => {
    if (c.d8 !== 1) return null;
    const q = c.w - 45.5;
    if (jj === 0 || jj === 4 || q < 0.5 || q > 6.5) return t.gold;
    return jj === 2 ? FR('schwarz') : FR('weiss');
  });
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, Lage und Größe Stufe C.';
const INHALT = {
  titel: 'Atrium, Hof und Museum', untertitel: 'Atrium, Treppenhaus, Hof mit Perseus, Museumssäle und Fassadenschmuck', icon: '🏛️',
  teile: {
    androne: { title: 'Atrium', description: 'Eingangshalle hinter dem Portal an der Via del Proconsolo: Schachboden aus Pflaster und Marmor, Wandfelder in Weiß und Gelb zwischen Pilastern aus Pietra serena, eine Kassettendecke aus Pietra serena; zu beiden Seiten je zwei Türen.', tip: 'Boden zuerst, dann die Wandfelder, die Decke zuletzt.', caution: VER + ' Das Gewölbe der Halle ist nicht nachgebaut, die Decke ist eine Kassettenverkleidung.', fact: 'Die große rechteckige Halle im Erdgeschoss hat ein Spiegelgewölbe und drei Türen zu zwei weiteren Räumen; die Treppe liegt rechts vom Atrium (Quelle: it.wikipedia, Palazzo Nonfinito).' },
    treppenhaus: { title: 'Treppenhaus', description: 'Raum um die Wendeltreppe rechts vom Atrium, Erdgeschoss und Piano nobile: Pflaster im Schachmuster, Wandfelder in Weiß und Gelb zwischen Pilastern aus Pietra serena.', tip: 'Den Treppenkern lässt du frei.', caution: VER + ' Die echte Treppe hat drei ellbogenförmige Läufe unter Tonnengewölben; hier ersetzt eine Wendeltreppe sie.', fact: 'Die Treppe rechts vom Atrium hat Tonnengewölbe und drei Läufe; Buontalenti verließ 1600 den Bau nach einem Streit mit den Strozzi über ihre Lage, Santi di Tito baute sie (Quelle: it.wikipedia, Palazzo Nonfinito).' },
    hof_cigoli: { title: 'Hof', description: 'Pflaster des Hofs im Schachmuster aus hellem Stein und Marmor, durchzogen von zwei Mittelstreifen aus Pietra serena; rundum Arkaden.', tip: 'Erst die Streifen, dann das Schachmuster.', caution: VER + ' Die Arkaden sind Rundbögen statt der venezianisch beeinflussten Serlianen.', fact: 'Zwei Seiten des Hofs entstanden um 1604 nach Cigoli, die beiden anderen ergänzte der Ingenieur Nasi 1865 bis 1866; die Arkaden sind Serlianen auf toskanischen Säulen (Quelle: it.wikipedia, Palazzo Nonfinito).' },
    perseus: { title: 'Perseus im Hof', description: 'Auf einem Sockel aus Pietra serena steht eine Blockfigur aus Bronze mit erhobenen Armen: Perseus, der den Drachen tötet.', tip: 'Sockel zuerst, dann Beine, Rumpf, Arme und Kopf.', caution: VER + ' Der Drache fehlt, die Statue steht frei im Hof statt in einer Nische.', fact: 'Im Hof steht in einer Nische eine Statue des Perseus, der den Drachen tötet, von Giovanni Battista Lorenzi aus dem 16. Jahrhundert (Quelle: it.wikipedia, Palazzo Nonfinito).' },
    museum_nord: { title: 'Museumssäle im Nordflügel', description: 'Fünf Säle im Piano nobile hinter der Fassade zur Via del Proconsolo: Boden aus Cotto und Marmor im Schachmuster, Wandfelder zwischen Pilastern, Decke mit den Wappen Savoyens und der Stadt im Wechsel, dazu Vitrinen aus Glasblöcken.', tip: 'Boden, Wandfelder, Decke; die Vitrinen sind eine Lage hoch.', caution: VER + ' Die Vitrinen sind leer; was ausgestellt ist, ist nicht nachgebaut.', fact: 'Die Decken des Piano nobile stammen aus der Zeit von Florenz als Hauptstadt und tragen die Wappen Savoyens und der Stadt; die Universität erhielt den Palast 1919, das Museum zog 1924 ein und wurde 1932 eröffnet (Quelle: it.wikipedia, Palazzo Nonfinito).' },
    museum_west: { title: 'Museumssäle im Westflügel', description: 'Zwei Säle im Piano nobile an der Seite zum Borgo degli Albizi: Cotto-Marmor-Schachboden, Wandfelder in Weiß und Blau, Wappendecke und Vitrinen aus Glasblöcken.', tip: 'Wie im Nordflügel: Boden, Wände, Decke, Vitrinen.', caution: VER + ' Lage und Größe der Säle sind nicht belegt.', fact: 'Das Museum für Anthropologie und Ethnologie gründete Paolo Mantegazza; es wurde später von Aldobrandino Mochi, Nello Puccioni und anderen erweitert (Quelle: it.wikipedia, Palazzo Nonfinito).' },
    museum_ost: { title: 'Museumssaal im Ostflügel', description: 'Großer Saal im Piano nobile östlich des Hofs mit Schachboden, Wandfeldern in Weiß und Gelb, Wappendecke und zwei Vitrinenreihen.', tip: 'Wie im Nordflügel.', caution: VER + ' Lage und Größe sind nicht belegt.', fact: 'Der Palast bleibt unvollendet: Beide Entwürfe, der Buontalentis und der Scamozzis, sahen zwei weitere Geschosse vor (Quelle: it.wikipedia, Palazzo Nonfinito).' },
    fassadenschmuck: { title: 'Wappen und Inschrift', description: 'Zwei Farbfelder in der Fassade: über dem Portal an der Via del Proconsolo das Wappen der Strozzi in Gold, Rot und Weiß, über dem Portal am Borgo degli Albizi eine weiße Inschrifttafel mit Goldrahmen.', tip: 'Die Felder ersetzen Fassadenblöcke im Piano nobile.', caution: VER + ' Die Farben des Wappens sind frei gewählt, die Schrift ist nicht lesbar nachgebaut; der Balkon über dem Portal fehlt.', fact: 'Das Portal an der Via del Proconsolo trägt einen Balkon und das Strozzi-Wappen von 1614; am Borgo degli Albizi erinnert eine Inschrift von 1607 an die Widmung (Quelle: it.wikipedia, Palazzo Nonfinito).' },
    licht_ausstattung: { title: 'Licht in den Sälen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { TREPPE, WAENDE, TEILE, INHALT, PORTAL_PROCONSOLO, PORTAL_ALBIZI, ausstatten, oeffnungen, nachher };
