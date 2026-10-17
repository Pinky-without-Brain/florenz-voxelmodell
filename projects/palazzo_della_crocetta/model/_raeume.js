'use strict';
// Raumplan und Ausstattung des Palazzo della Crocetta (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_della_crocetta/).
// Rahmen CR (θ 33,6°): u 0..413 entlang der Via Laura, w 0..83 zur Via della Colonna. Geschosse: EG Lage 0..12, Piano 1 12..24, Piano 2 24..33.
// Belegt sind Umriss, drei hohe Geschosse, 24 Achsen, U-Form, Portal an der Via della Colonna mit zwei Säulen, Museumsnutzung (Ägyptische Sammlung
// im 1. Stock, Etruskische und griechisch-römische Sammlungen im 2. Stock, Chimäre, Idolino, Salone del Nicchio); die Raumaufteilung ist Stufe C.
const { kit, typen, schach, kassette, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

const TREPPE = { u: 24, w: 52 };
const PORTAL_COLONNA = { u: 336, breite: 9, hoehe: 11 };         // Haupteingang Via della Colonna 38 (Ostflügel), mit zwei Säulen (Comotto 1865–71)
const PORTAL_CAPPONI = { w: 26, breite: 6, hoehe: 9 };           // Eingang Via Gino Capponi (Westseite)
const COURT_TUEREN = [{ u: 357, w: 36.5, nach: 'w' }, { u: 322.5, w: 21, nach: 'u' }, { u: 393, w: 31, nach: 'u' }];

const istFront = (c) => c.w < 3 || c.w > 78 || c.u < -2;
const fensterAus = (c) => (c.w > 74 && Math.abs(c.u - PORTAL_COLONNA.u) < 6) || (c.u < 3 && Math.abs(c.w - PORTAL_CAPPONI.w) < 5);

const bogen = (b, h, v) => Math.floor(h - b / 2 + Math.sqrt(Math.max(0, (b / 2) ** 2 - v * v)));

/** Portale und Hoftüren in lokalen Koordinaten (die Fronten liegen im Rahmen achsparallel, aber mit Treppenzellen am Rand). */
function oeffnungen(api) {
  const { D, Y, oeffnung } = api;
  for (const c of D.haupt) {
    if (c.d8 > 2) continue;
    if (c.w > 74 && c.u > 255) {
      const v = c.u - PORTAL_COLONNA.u;
      if (Math.abs(v) < PORTAL_COLONNA.breite / 2) for (let yr = 1; yr <= bogen(PORTAL_COLONNA.breite, PORTAL_COLONNA.hoehe, v); yr++) oeffnung('tor', 'portale', c.x, Y(yr), c.z);
    }
    if (c.u < 6) {
      const v = c.w - PORTAL_CAPPONI.w;
      if (Math.abs(v) < PORTAL_CAPPONI.breite / 2) for (let yr = 1; yr <= bogen(PORTAL_CAPPONI.breite, PORTAL_CAPPONI.hoehe, v); yr++) oeffnung('tor', 'portale', c.x, Y(yr), c.z);
    }
  }
  for (const c of D.haupt) {
    if (c.dHof > 2 || c.d8 <= 2) continue;
    for (const t of COURT_TUEREN) {
      const a = t.nach === 'w' ? c.u - t.u : c.w - t.w, b = t.nach === 'w' ? c.w - t.w : c.u - t.u;
      if (Math.abs(a) < 2.2 && Math.abs(b) < 3.5) for (let yr = 1; yr <= 7; yr++) oeffnung('tuer', 'hofwaende', c.x, Y(yr), c.z);
    }
  }
}

function vorher() {}
function nachher() {}

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3,4 × 5)
const WAENDE = [];
const F_WAENDE = [80, 115, 150, 185, 220, 255];
for (const v of F_WAENDE) WAENDE.push({ achse: 'u', v, von: -1, bis: 23, tueren: [10.5] });                       // Vorderflügel
WAENDE.push({ achse: 'w', v: 38, von: -7, bis: 54, tueren: [14, 38] }, { achse: 'w', v: 60, von: -7, bis: 54, tueren: [14, 38] });   // Westflügel
WAENDE.push({ achse: 'u', v: 353, von: 40, bis: 80, tueren: [60] }, { achse: 'u', v: 361, von: 40, bis: 80, tueren: [60] });        // Androne des Ostflügels

const TEILE = ['androne', 'salone_nicchio', 'cortile', 'museo_egizio', 'sala_chimera', 'corridoio_maddalena', 'museo_etrusco', 'galleria_idolino', 'licht_ausstattung'];

// Räume des Vorderflügels zwischen den Querwänden (lokal, mit Abstand zur Wandmitte)
const F_RAUM = [[55, 78.9], [81.1, 113.9], [116.1, 148.9], [151.1, 183.9], [186.1, 218.9], [221.1, 253.9], [256.1, 291]];

function ausstatten(api) {
  const { Y } = api;
  // Wandfelder bleiben im Bauteil ihrer Wand (Lehre W7c: Wände und Wandfelder stehen im selben Bauschritt, sonst verlieren Restzellen den Halt, R3)
  const kitApi = Object.assign({}, api, {
    ersetze: (x, y, z, typ, teil) => { const e = api.zellen.get(api.key(x, y, z)); return api.ersetze(x, y, z, typ, e && api.WAND_TEILE.has(e.p) ? e.p : teil); }
  });
  const K = kit(kitApi);
  const t = typen();
  const FR = (n) => WZ.fresko(n);
  const wand = (teil, s, z, farben, y1) => K.waende(teil, s, z, { pitch: 9, y0: 3, y1: y1 || 8, farben, rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena } });
  const saal = (teil, s, rect, farben, o = {}) => {
    const z = K.steh(s, rect);
    K.boden(teil, s, z, (c) => schach(c, o.kachel || 4, o.a || t.cotto, o.b || t.weiss));
    wand(teil, s, z, farben, s === 2 ? 6 : 8);
    if (o.decke !== false) K.decke(teil, s, z, o.decke || ((c) => kassette(c, 5, t.holz, t.putz, t.gold)));
    return z;
  };
  const vitrinen = (teil, s, reihen) => { for (const r of reihen) K.quader(teil, s, r, 1, 1, t.glas); };
  const sockelFigur = (teil, s, u, w, o) => K.figur(teil, s, u, w, Object.assign({ sockel: 2, sockelTyp: t.serena, beine: 2, rumpf: 2, arme: 'seitlich' }, o));

  // ------------------------------------------------------------ Erdgeschoss
  {   // Androne hinter dem Portal an der Via della Colonna (zwischen den beiden Wänden), führt zum Cortile
    const z = K.steh(0, { u0: 355.2, u1: 358.8, w0: 38, w1: 80 });
    K.boden('androne', 0, z, (c) => schach(c, 3, t.pflaster, t.weiss));
    wand('androne', 0, z, ['weiss', 'gelb']);
    K.decke('androne', 0, z, (c) => kassette(c, 5, t.serena, t.putz, t.weiss));
  }
  saal('salone_nicchio', 0, { u0: -3, u1: 52, w0: 20, w1: 36.9 }, ['weiss', 'gelb'], { decke: (c) => kassette(c, 6, t.serena, t.putz, t.gold) });
  // Cortile dei Fiorentini: Pflaster im Schachmuster mit Mittelstreifen
  K.hofboden('cortile', { u0: 322, u1: 394, w0: 6, w1: 37 }, (c) => (Math.abs(c.u - 357) < 1.2 || Math.abs(c.w - 21.5) < 1.2 ? t.serena : schach(c, 3, t.pflaster, t.weiss)));
  K.figur('cortile', 0, 357, 21.5, { sockel: 2, sockelTyp: t.serena, typ: t.weiss, kopf: t.weiss, beine: 2, rumpf: 2, arme: 'seitlich', draussen: true });

  // ------------------------------------------------------------ Piano 1: Ägyptische Sammlung, Chimäre, Korridor der Maria Maddalena
  saal('museo_egizio', 1, { u0: 296, u1: 351.9, w0: 40, w1: 80 }, ['weiss', 'gelb']);
  saal('museo_egizio', 1, { u0: 362.1, u1: 410, w0: 40, w1: 80 }, ['weiss', 'gelb']);
  saal('museo_egizio', 1, { u0: 296.5, u1: 320, w0: 22.5, w1: 62 }, ['weiss', 'blau']);
  vitrinen('museo_egizio', 1, [{ u0: 300, u1: 346, w0: 50, w1: 51.5 }, { u0: 300, u1: 346, w0: 66, w1: 67.5 }, { u0: 368, u1: 404, w0: 50, w1: 51.5 }, { u0: 368, u1: 404, w0: 66, w1: 67.5 }, { u0: 302, u1: 303.5, w0: 28, w1: 56 }, { u0: 312, u1: 313.5, w0: 28, w1: 56 }]);
  K.quader('museo_egizio', 1, { u0: 322, u1: 328, w0: 70, w1: 72.5 }, 1, 1, t.holz);                 // Streitwagen (15. Jh. v. Chr.), vereinfacht

  {   // Sala della Chimera (Fresken von Filippo Tarchiani): Decke als bemalter Himmel
    const z = saal('sala_chimera', 1, { u0: -3, u1: 50, w0: 40, w1: 58 }, ['weiss', 'gruen'], {
      decke: (c) => ((Math.floor(c.u / 3) + Math.floor(c.w / 3)) % 5 === 0 ? FR('weiss') : (Math.abs(c.w - 49) < 2 ? t.gold : FR('hellblau')))
    });
    void z;
    K.loewe('sala_chimera', 1, 24, 49, { achse: 'u', sockel: 2, sockelTyp: t.serena, typ: t.bronze, maehne: t.bronze });                 // Chimäre von Arezzo
    sockelFigur('sala_chimera', 1, 10, 49, { typ: t.bronze, kopf: t.bronze, arme: 'hoch' });                                               // Arringatore
    sockelFigur('sala_chimera', 1, 38, 49, { typ: t.bronze, kopf: t.bronze });                                                             // Minerva von Arezzo
  }
  saal('corridoio_maddalena', 1, { u0: 81.1, u1: 113.9, w0: 0, w1: 23 }, ['weiss', 'gelb']);                                             // Kameen der Medici und Lothringer
  saal('corridoio_maddalena', 1, { u0: 116.1, u1: 148.9, w0: 0, w1: 23 }, ['weiss', 'gelb']);
  vitrinen('corridoio_maddalena', 1, [{ u0: 86, u1: 108, w0: 5, w1: 6.5 }, { u0: 86, u1: 108, w0: 15, w1: 16.5 }, { u0: 121, u1: 143, w0: 5, w1: 6.5 }, { u0: 121, u1: 143, w0: 15, w1: 16.5 }]);

  // ------------------------------------------------------------ Piano 2: Etruskische, griechische und römische Sammlungen, Galleria dell'Idolino
  for (const [u0, u1] of F_RAUM.slice(2)) {
    saal('museo_etrusco', 2, { u0, u1, w0: 0, w1: 23 }, ['weiss', 'blau'], { decke: (c) => kassette(c, 5, t.holz, t.putz, t.weiss) });
    vitrinen('museo_etrusco', 2, [{ u0: u0 + 4, u1: u1 - 4, w0: 5, w1: 6.5 }, { u0: u0 + 4, u1: u1 - 4, w0: 15, w1: 16.5 }]);
  }
  K.quader('museo_etrusco', 2, { u0: 166, u1: 168, w0: 9.5, w1: 11.5 }, 1, 1, t.serena);                                              // Vitrine des Vaso François
  K.quader('museo_etrusco', 2, { u0: 166, u1: 168, w0: 9.5, w1: 11.5 }, 2, 3, (c, j) => (j === 3 ? t.glas : FR('schwarz')));
  sockelFigur('museo_etrusco', 2, 202, 11, { typ: t.weiss, kopf: t.weiss, arme: 'keine', beine: 2, rumpf: 2 });                       // Kouros (Apollo Milani)
  saal('galleria_idolino', 2, { u0: 55, u1: 78.9, w0: 0, w1: 23 }, ['weiss', 'gelb']);
  saal('galleria_idolino', 2, { u0: 81.1, u1: 113.9, w0: 0, w1: 23 }, ['weiss', 'gelb']);
  sockelFigur('galleria_idolino', 2, 66, 11, { typ: t.bronze, kopf: t.bronze, arme: 'keine' });                                       // Idolino von Pesaro

  // ------------------------------------------------------------ Portal an der Via della Colonna: zwei Säulen (Comotto 1865–71)
  for (const sg of [-1, 1]) {
    const u0 = sg < 0 ? PORTAL_COLONNA.u - 7.2 : PORTAL_COLONNA.u + 4.7;
    K.flaeche('aussenwand', 0, { u0, u1: u0 + 2.5, w0: 74, w1: 84 }, 1, 9, (c, jj) => (c.d8 === 1 ? (jj === 8 ? t.ornament : t.saeule) : null));
  }
  void Y; void mod;
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, Lage und Größe Stufe C.';
const INHALT = {
  titel: 'Museumssäle, Cortile und Portal', untertitel: 'Androne, Salone del Nicchio, Cortile dei Fiorentini, Museumssäle, Portalsäulen', icon: '🏺',
  teile: {
    androne: { title: 'Androne', description: 'Die Eingangshalle hinter dem Portal an der Via della Colonna ist ein schmaler Gang zwischen zwei Wänden und führt zum Cortile. Der Boden hat ein Schachmuster aus Pflaster und Marmor, die Wandfelder sind weiß und gelb zwischen Pilastern aus Pietra serena, die Decke eine Kassettenverkleidung.', tip: 'Boden zuerst, dann die Wandfelder, die Decke zuletzt.', caution: VER + ' Die Raumfolge hinter dem Portal ist nicht belegt.', fact: 'Der Haupteingang lag an der Via della Colonna 38; die Portalsäulen setzte Paolo Comotto 1865 bis 1871 (Quelle: it.wikipedia, Palazzo della Crocetta).' },
    salone_nicchio: { title: 'Salone del Nicchio', description: 'Der Saal im Erdgeschoss des Westflügels neben dem Eingang an der Via Gino Capponi hat einen Cotto-Marmor-Schachboden, Wandfelder in Weiß und Gelb und eine Kassettendecke aus Pietra serena mit Goldfeldern.', tip: 'Boden, Wandfelder, dann die Decke.', caution: VER + ' Das Nicchio (die Muschelnische) ist nicht nachgebaut.', fact: 'Der Salone del Nicchio liegt neben dem Eingang und zeigt Sonderausstellungen (Quelle: it.wikipedia, Museo archeologico nazionale (Firenze)).' },
    cortile: { title: 'Cortile dei Fiorentini', description: 'Der offene Hof im Ostflügel (72 × 30 Blöcke) hat ein Schachmuster aus Pflaster und Marmor mit Mittelstreifen aus Pietra serena und eine Statue auf einem Sockel aus Pietra serena.', tip: 'Erst die Streifen, dann das Schachmuster.', caution: VER + ' Die Statue ist eine Blockfigur ohne Vorbild.', fact: 'Der Hof „Cortile dei Fiorentini“ ist in OpenStreetMap als Teilfläche des Palastes erfasst; seine Gestaltung ist Stufe C.' },
    museo_egizio: { title: 'Ägyptische Sammlung (Piano 1)', description: 'Im ersten Obergeschoss des Ostflügels liegen drei Säle mit Cotto-Marmor-Schachboden, Wandfeldern, Kassettendecke und Vitrinenreihen aus Glasblöcken. Ein Streitwagen aus Holz steht im Saal an der Via della Colonna.', tip: 'Die Vitrinen sind eine Lage hoch.', caution: VER + ' Die Vitrinen sind leer.', fact: 'Das erste Obergeschoss zeigt die Ägyptische Sammlung; dazu gehören ein Streitwagen aus dem 15. Jahrhundert v. Chr., ein Relief der Maat und Fayum-Porträts (Quelle: it.wikipedia, Museo archeologico nazionale (Firenze)).' },
    sala_chimera: { title: 'Sala della Chimera', description: 'Im Westflügel steht die Chimäre von Arezzo als Bronzeblock-Figur auf einem Sockel; daneben der Arringatore mit erhobenem Arm und die Minerva von Arezzo. Die Decke ist als bemalter Himmel mit Wolken und einem Goldband gestaltet.', tip: 'Sockel zuerst, dann die Figuren.', caution: VER + ' Die Chimäre ist als Raubtier ohne Ziegenkopf nachgebildet.', fact: 'Der Saal mit der Chimäre ist von Filippo Tarchiani ausgemalt, dort steht auch der Arringatore (Quelle: it.wikipedia, Museo archeologico nazionale (Firenze)).' },
    corridoio_maddalena: { title: 'Corridoio di Maria Maddalena', description: 'Zwei Säle im Vorderflügel mit Vitrinenreihen, vereinfacht für den Korridor mit den Kameen der Medici und der Lothringer.', tip: 'Wie in den anderen Sälen: Boden, Wände, Decke, Vitrinen.', caution: VER + ' Der echte Korridor ist ein erhöhter Gang zur Santissima Annunziata, der hier nicht nachgebaut ist.', fact: 'Maria Maddalena nutzte einen erhöhten Korridor nach Art des Vasari-Korridors; heute zeigt ein Gang Kameen der Medici und der Lothringer (Quelle: it.wikipedia, Palazzo della Crocetta; Museo archeologico nazionale).' },
    museo_etrusco: { title: 'Etruskische, griechische und römische Sammlungen (Piano 2)', description: 'Im obersten Geschoss des Vorderflügels reihen sich fünf Säle mit Vitrinen (Vasen, Bronzen, Spiegel, Waffen). Eine Vitrine zeigt das Vaso François (schwarz auf Sockel mit Glashaube), ein Kouros aus Marmor steht auf einem Sockel.', tip: 'Die Vitrinen sind eine Lage hoch, der Sockel des Vasos zwei.', caution: VER + ' Die Reihenfolge der Sammlungen ist nicht belegt.', fact: 'Im zweiten Obergeschoss liegen die etruskischen, griechischen und römischen Sammlungen mit attischen Vasen und griechischer Skulptur (Quelle: it.wikipedia, Museo archeologico nazionale (Firenze)).' },
    galleria_idolino: { title: 'Galleria dell\'Idolino', description: 'Am Ende der Galerie des zweiten Obergeschosses steht der Idolino von Pesaro, eine Bronzeblock-Figur auf einem Sockel; zwei Säle mit Cotto-Marmor-Schachboden.', tip: 'Sockel zuerst, dann die Figur.', caution: VER + ' Die Haltung der Figur ist nicht nachgebildet.', fact: 'Die Galerie des Idolino liegt am Ende der Galerie im zweiten Obergeschoss (Quelle: it.wikipedia, Museo archeologico nazionale (Firenze)).' },
    licht_ausstattung: { title: 'Licht in den Sälen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { TREPPE, WAENDE, TEILE, INHALT, PORTAL_COLONNA, PORTAL_CAPPONI, ausstatten, oeffnungen, nachher, vorher, fensterAus, istFront, innenwandTuer: undefined, F_RAUM };
