'use strict';
// Raumplan und Ausstattung des Palazzo Strozzi (V5a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_strozzi/).
// Rahmen PS (theta -2 Grad): u nach Osten, w nach Süden. Geschosse: EG Lage 0..24, Piano nobile 24..44, 2. OG 44..62.
// Piano nobile als Ausstellungsgeschoss (heute Fondazione Palazzo Strozzi), Hof nach Cronaca, Steinbank und Laternenhalter
// an der Fassade. Alles vereinfacht, nicht nach Vorbild; Lage der Säle Stufe C.
const { kit, typen, schach, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');
const GRUND = require('../spec/ground.js');

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [
  { achse: 'u', v: 33, von: 3, bis: 26, tueren: [14] },              // Nordwest | Nord
  { achse: 'u', v: 80, von: 3, bis: 26, tueren: [14] },              // Nord | Nordost
  { achse: 'w', v: 27, von: 3, bis: 32, tueren: [18] },              // Nordwest | West
  { achse: 'w', v: 27, von: 81, bis: 112, tueren: [96] },            // Nordost | Ost
  { achse: 'w', v: 61, von: 3, bis: 32, tueren: [18] },              // West | Südwest
  { achse: 'w', v: 61, von: 81, bis: 112, tueren: [96] },            // Ost | Südost
  { achse: 'u', v: 33, von: 62, bis: 86, tueren: [74] },             // Südwest | Süd
  { achse: 'u', v: 80, von: 62, bis: 86, tueren: [74] }              // Süd | Südost
];

const TEILE = ['ausstellung_nord', 'ausstellung_sued', 'ausstellung_west', 'ausstellung_ost', 'hof_cronaca', 'panca_laternen', 'licht_ausstattung'];
const PORTALE = [{ u: 0.5, w: 43.5 }, { u: 57, w: 0 }, { u: 114, w: 43.5 }];

function ausstatten(api) {
  const { Y, BASIS, set } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Ausstellungssäle im Piano nobile
  const SAAL = [
    ['ausstellung_nord', { u0: 34, u1: 80, w0: 3, w1: 28 }, ['rot', 'blau', 'gelb', 'gruen'], [['w', 11, 42, 56], ['w', 19, 58, 72]]],
    ['ausstellung_sued', { u0: 34, u1: 80, w0: 62, w1: 88 }, ['blau', 'orange', 'weiss', 'rot'], [['w', 70, 42, 56], ['w', 78, 58, 72]]],
    ['ausstellung_west', { u0: 3, u1: 33, w0: 28, w1: 61 }, ['gruen', 'gelb', 'blau', 'braun'], [['u', 14, 34, 42], ['u', 22, 46, 54]]],
    ['ausstellung_ost', { u0: 81, u1: 114, w0: 28, w1: 61 }, ['orange', 'rot', 'hellblau', 'gruen'], [['u', 92, 34, 42], ['u', 102, 46, 54]]]
  ];
  for (const [teil, R, farben, stell] of SAAL) {
    const z = K.steh(1, R);
    K.boden(teil, 1, z, (c) => schach(c, 6, t.holz, t.pflaster));
    K.waende(teil, 1, z, { pitch: 12, y0: 3, y1: 8, farben, rahmen: t.holz });
    for (const [a, v, von, bis] of stell) K.stellwand(teil, 1, a, v, von, bis, { wand: t.putz, farben });
    const m = [(R.u0 + R.u1) / 2, (R.w0 + R.w1) / 2];                                       // Sitzbank in der Saalmitte
    K.quader(teil, 1, { u0: m[0] - 3, u1: m[0] + 3, w0: m[1] - 1, w1: m[1] }, 1, 1, t.holz);
  }

  // ------------------------------------------------------------ Hof (Cronaca): Wegekreuz, Kübel und Laternen
  {
    K.hofboden('hof_cronaca', { u0: 41, u1: 72, w0: 36, w1: 53 }, (c) => {
      if (Math.abs(c.u - 56) < 1.5 || Math.abs(c.w - 44.5) < 1.5) return t.serena;
      return ((Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1) ? t.pflaster : null;
    });
    for (const [u, w] of [[43, 38], [69, 38], [43, 50], [69, 50]]) {
      K.quader('hof_cronaca', 0, { u0: u - 1, u1: u + 1, w0: w - 1, w1: w + 1 }, 1, 1, t.terrakotta);
      K.baum('hof_cronaca', 0, u, w, 4, { j0: 2 });
    }
    for (const [u, w] of [[56, 40], [56, 49]]) K.laterne('hof_cronaca', 0, u, w, 5);
  }

  // ------------------------------------------------------------ Steinbank und Laternenhalter an der Fassade (Luftraum 2)
  {
    const aus = K.aussenZellen();
    const nahPortal = (p) => PORTALE.some((q) => Math.hypot(p.u - q.u, p.w - q.w) < 6.5);
    for (const p of aus) {
      if (nahPortal(p)) continue;
      if (GRUND.groundTopY(p.x, p.z) >= Y(1)) continue;
      set(p.x, Y(1), p.z, t.serena, 'panca_laternen');                                                // Steinbank (panca), Sitzhöhe Lage 1 über dem Straßenpflaster
    }
    const ecke = (p) => (p.u < 6 || p.u > 108) && (p.w < 6 || p.w > 82);
    const flanke = (p) => PORTALE.some((q) => Math.abs(Math.hypot(p.u - q.u, p.w - q.w) - 8) < 1.2);
    let n = 0;
    for (const p of aus) {
      if (!ecke(p) && !flanke(p)) continue;
      const gross = ecke(p);
      set(p.x, Y(11), p.z, t.bronze, 'panca_laternen');                                               // Halter aus Bronze an der Wand
      set(p.x, Y(12), p.z, t.licht, 'panca_laternen');                                                // Fackel / Laterne
      if (gross) { set(p.x, Y(13), p.z, t.bronze, 'panca_laternen'); set(p.x, Y(10), p.z, t.bronze, 'panca_laternen'); }
      n++;
    }
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const SAALTEXT = (wo) => `Ausstellungssaal im Piano nobile (${wo}): Boden im Schachmuster aus dunkler Eiche und Polierstein, weiße Wände mit farbigen Bildfeldern in Augenhöhe (Unterkante 2 Blöcke über dem Boden), zwei freistehende Stellwände mit Bildern und eine Sitzbank in der Mitte.`;
const INHALT = {
  titel: 'Ausgestaltete Räume und Fassade', untertitel: 'Ausstellungssäle, Hof, Steinbank und Laternen', icon: '🖼️',
  teile: {
    ausstellung_nord: { title: 'Ausstellungssaal Nord', description: SAALTEXT('Nordflügel'), tip: 'Boden und Wandfelder zuerst, dann die Stellwände.', caution: VER + ' Lage der Säle Stufe C.', fact: 'Das Piano nobile des Palazzo Strozzi dient heute der Fondazione Palazzo Strozzi für Wechselausstellungen (Quelle: it.wikipedia, Palazzo Strozzi).' },
    ausstellung_sued: { title: 'Ausstellungssaal Süd', description: SAALTEXT('Südflügel'), tip: 'Die Stellwände lassen Durchgänge frei.', caution: VER, fact: 'Die Fondazione zeigt Kunst vom Mittelalter bis zur Gegenwart (Quelle: it.wikipedia, Palazzo Strozzi).' },
    ausstellung_west: { title: 'Ausstellungssaal West', description: SAALTEXT('Westflügel'), tip: 'Die Bilder hängen auf Augenhöhe.', caution: VER, fact: 'Benedetto da Maiano begann den Bau 1489; Il Cronaca vollendete Hof und Kranzgesims (Quelle: it.wikipedia, Palazzo Strozzi).' },
    ausstellung_ost: { title: 'Ausstellungssaal Ost', description: SAALTEXT('Ostflügel'), tip: 'Bilder in zwei Reihen sind nicht nötig, eine genügt.', caution: VER, fact: 'Der Palast wurde bis 1538 gebaut (Quelle: it.wikipedia, Palazzo Strozzi).' },
    hof_cronaca: { title: 'Hof nach Cronaca', description: 'Hofpflaster mit Wegekreuz aus Pietra serena und Schachmuster, vier Kübel mit Bäumchen an den Ecken und zwei Laternenpfosten aus Bronze in der Mitte.', tip: 'Erst das Pflaster, dann Kübel und Pfosten.', caution: VER, fact: 'Der Hof mit Arkaden und korinthischen Säulen geht auf Il Cronaca zurück (Quelle: it.wikipedia, Palazzo Strozzi).' },
    panca_laternen: { title: 'Steinbank und Laternenhalter', description: 'Eine Steinbank (panca) aus Pietra serena zieht sich an den Straßenfassaden entlang, an den Portalen unterbrochen; an den Ecken und neben den Portalen hängen Halter aus Bronze mit Laternen.', tip: 'Die Bank sitzt eine Lage hoch auf dem Straßenpflaster.', caution: VER + ' Nur innerhalb des Luftraums von 2 Blöcken um die Fassade.', fact: 'Die schmiedeeisernen Laternen und Fackelhalter an der Fassade schuf Niccolò Grosso, genannt il Caparra (Quelle: it.wikipedia, Palazzo Strozzi).' },
    licht_ausstattung: { title: 'Licht in den Sälen', description: 'Seelaternen im Boden der ausgestalteten Säle, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { WAENDE, TEILE, INHALT, ausstatten };
