'use strict';
// Raumplan und Ausstattung der Biblioteca Nazionale Centrale (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/biblioteca_nazionale/).
// Rahmen BN (θ 8°): u 5..283 von der Tribuna (West) nach Osten, w −10..92 vom Corso dei Tintori (Nord) zum Fluss (Süd).
// Geschosse: EG Lage 0..13, Piano 1 13..25, Piano 2 25..35. Belegt sind Zeit, Architekt, Verteilerhalle mit zwei Achsen, Portikus, zwei Türme mit
// den Statuen von Dante und Galileo, Tribuna, Lesesaal mit Säulenarkaden, Magazine im Rücken; die Raumaufteilung ist Stufe C.
const { kit, typen, schach, kassette, mod } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');

const TREPPE = { u: 173, w: 58 };
const TRIBUNA_PORTAL = { w: 32, breite: 6, hoehe: 9 };

const istFront = (c) => c.w > 76 || c.u < 10;
const fensterAus = (c) => c.u < 14 && Math.abs(c.w - TRIBUNA_PORTAL.w) < 5;
const bogen = (b, h, v) => Math.floor(h - b / 2 + Math.sqrt(Math.max(0, (b / 2) ** 2 - v * v)));

function oeffnungen(api) {
  const { D, Y, oeffnung } = api;
  for (const c of D.haupt) {
    if (c.d8 > 2 || c.u > 14) continue;
    const v = c.w - TRIBUNA_PORTAL.w;
    if (Math.abs(v) < TRIBUNA_PORTAL.breite / 2) for (let yr = 1; yr <= bogen(TRIBUNA_PORTAL.breite, TRIBUNA_PORTAL.hoehe, v); yr++) oeffnung('tor', 'portale', c.x, Y(yr), c.z);
  }
}

/** Zwei Türme über der Traufe (Dante und Galileo): Schaft zwei Blöcke dick, innen hohl (ohne Zugang), Abschlussplatte, Statue darauf. */
function tuerme(api, { TURM_W, TURM_O, TURM_TOP }) {
  const { D, set, frei, unzug, Y, TRAUFE, T } = api;
  const SERENA = T.serena;
  for (const tw of [TURM_W, TURM_O]) {
    const zs = D.haupt.filter((c) => c.u >= tw.u0 && c.u < tw.u1 && c.w >= tw.w0 && c.w < tw.w1);
    const uc = (tw.u0 + tw.u1) / 2, wc = (tw.w0 + tw.w1) / 2;
    for (const c of zs) {
      const innen = Math.min(c.u - tw.u0, tw.u1 - c.u, c.w - tw.w0);   // nur die Innenseiten des Turms kommen aus dem Rechteck, die Außenseiten aus der Maske
      const r = Math.min(c.d8, Math.floor(innen) + 1);
      c.turmR = r;
      for (let yr = TRAUFE + 1; yr <= TURM_TOP; yr++) {
        if (r <= 2) set(c.x, Y(yr), c.z, yr % 6 === 0 ? T.forte : (yr === TURM_TOP ? SERENA : T.putz), 'turm');
        else if (yr === TURM_TOP - 1 || yr === TURM_TOP) set(c.x, Y(yr), c.z, SERENA, 'turm');
        else { frei(c.x, Y(yr), c.z); unzug('turm', 'Schaft des Turms über der Traufe (im Modell ohne Zugang)', c.x, Y(yr), c.z); }
      }
      if (Math.hypot(c.u - uc, c.w - wc) < 2.2) {                                  // Sockel der Statue (rund, Radius 2)
        for (let yr = TURM_TOP + 1; yr <= TURM_TOP + 2; yr++) set(c.x, Y(yr), c.z, SERENA, 'turm_statuen');
      }
    }
    // Statue: Rumpf (3), Arme, Kopf auf der Mitte des Sockels; Dante im Westturm, Galileo im Ostturm (vereinfacht, Material Marmor)
    const mitte = zs.reduce((b, c) => (!b || Math.hypot(c.u - uc, c.w - wc) < Math.hypot(b.u - uc, b.w - wc) ? c : b), null);
    if (mitte) {
      for (let h = 0; h < 3; h++) set(mitte.x, Y(TURM_TOP + 3 + h), mitte.z, T.weiss, 'turm_statuen');
      set(mitte.x, Y(TURM_TOP + 6), mitte.z, T.weiss, 'turm_statuen');
      const arme = tw.id === 'W' ? [[1, 0]] : [[1, 0], [-1, 0]];                     // Dante: ein Arm (Buch), Galileo: beide Arme (Fernrohr, Himmel)
      for (const [dx, dz] of arme) for (let h = 0; h < 3; h++) set(mitte.x + dx, Y(TURM_TOP + 3 + h), mitte.z + dz, T.weiss, 'turm_statuen');   // Mantel/Arme bis zum Sockel, keine Hohlräume unter den Armen
    }
  }
}

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3,4 × 5)
// Querwände (achse 'u') trennen Tribuna, Westflügel, Mitteltrakt, Verteilerhalle und Ostflügel; Längswände (achse 'w') trennen im Westflügel
// die Verwaltung im Norden von den Lesesälen im Süden und in der Mitte die Magazine von der Verteilerhalle.
const WAENDE = [
  { achse: 'u', v: 20, von: -3, bis: 70, tueren: [32, 50] },
  { achse: 'u', v: 70, von: -3, bis: 80, tueren: [12, 55] },
  { achse: 'u', v: 133, von: 5, bis: 79, tueren: [20, 55] },
  { achse: 'u', v: 213.4, von: 3, bis: 82, tueren: [20, 55] },
  { achse: 'w', v: 34, von: 20, bis: 133, tueren: [45, 100] },
  { achse: 'w', v: 35, von: 134, bis: 213, tueren: [173] }
];

const TEILE = ['tribuna', 'verteilerhalle', 'katalogsaal', 'zeitschriftensaal', 'sala_lettura', 'sala_consultazione', 'lesesaal_oben', 'magazin_nord', 'magazin_ost', 'verwaltung', 'licht_ausstattung'];

function ausstatten(api) {
  const { BASIS } = api;
  // Wandfelder bleiben im Bauteil ihrer Wand (Lehre W7c)
  const kitApi = Object.assign({}, api, {
    ersetze: (x, y, z, typ, teil) => { const e = api.zellen.get(api.key(x, y, z)); return api.ersetze(x, y, z, typ, e && api.WAND_TEILE.has(e.p) ? e.p : teil); }
  });
  const K = kit(kitApi);
  const t = typen();
  const FR = (n) => WZ.fresko(n);
  const hoch = (s) => BASIS[s + 1] - BASIS[s] - 1;                         // Luftlagen des Geschosses
  const saal = (teil, s, rect, farben, o = {}) => {
    const z = K.steh(s, rect);
    K.boden(teil, s, z, (c) => schach(c, o.kachel || 4, o.a || t.weiss, o.b || t.serena));
    K.waende(teil, s, z, { pitch: 10, y0: 3, y1: Math.min(hoch(s) - 2, 9), farben, rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena } });
    if (o.decke !== false) K.decke(teil, s, z, o.decke || ((c) => kassette(c, 6, t.holz, t.putz, t.gold)));
    return z;
  };
  // Säulenreihe (Ionisch, vereinfacht): Säulen 2 × 2 mit Kapitell, Architrav darüber (Oberseite nicht begehbar: weniger als drei Lagen Luft)
  const arkade = (teil, s, wl, u0, u1, schritt) => {
    const h = hoch(s) - 3;
    for (let u = u0; u <= u1; u += schritt) K.quader(teil, s, { u0: u - 1, u1: u + 1, w0: wl - 1, w1: wl + 1 }, 1, h, (c, j) => (j === h ? t.ornament : t.saeule));
    K.quader(teil, s, { u0, u1: u1 + 1, w0: wl - 0.6, w1: wl + 0.6 }, h + 1, h + 2, t.weiss);
  };
  const tische = (teil, s, rect, reihen, abstand) => {
    for (const w of reihen) for (let u = rect.u0; u < rect.u1; u += abstand) K.quader(teil, s, { u0: u, u1: u + 4.5, w0: w, w1: w + 1.6 }, 1, 1, t.holz);
  };
  // Regalreihen der Magazine (Stufe C): Doppelregale vom Boden bis zur Decke, Querwege alle 20 Blöcke, Rand 4 Blöcke frei
  const regale = (teil, s, rect, periode) => {
    const z = K.steh(s, { u0: rect.u0, u1: rect.u1, w0: rect.w0, w1: rect.w1 });
    K.boden(teil, s, z, (c) => schach(c, 3, t.pflaster, t.cotto));
    for (const c of z) {
      if (c.u < rect.u0 + 4 || c.u > rect.u1 - 4 || c.w < rect.w0 + 4 || c.w > rect.w1 - 4) continue;
      if (mod(c.w, periode) >= 2 || mod(c.u, 20) < 3) continue;
      for (let j = 1; j <= hoch(s); j++) api.set(c.x, K.yS(s, j), c.z, (j % 3 === 0) ? FR('braun') : (j % 3 === 1 ? t.holz : FR('rot')), teil);
    }
    K.waende(teil, s, z, { pitch: 10, y0: 3, y1: Math.min(hoch(s) - 2, 9), farben: ['weiss'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena } });
  };

  // ------------------------------------------------------------ Erdgeschoss
  {   // Tribuna Dante e Galileo (Westende): runder Saal mit Marmorstern und den Statuen der beiden Dichter und Gelehrten
    const z = K.steh(0, { u0: 5, u1: 19.4, w0: 8, w1: 58 });
    K.boden('tribuna', 0, z, (c) => (Math.hypot(c.u - 12, c.w - 32) < 6 ? (Math.hypot(c.u - 12, c.w - 32) < 3 ? t.gold : t.rot) : schach(c, 3, t.weiss, t.serena)));
    K.waende('tribuna', 0, z, { pitch: 8, y0: 3, y1: 9, farben: ['weiss', 'blau'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 2, typ: t.serena } });
    K.decke('tribuna', 0, z, (c) => kassette(c, 5, t.serena, t.putz, t.gold));
    K.figur('tribuna', 0, 12, 22, { sockel: 2, sockelTyp: t.serena, typ: t.weiss, kopf: t.weiss, beine: 2, rumpf: 2, arme: 'seitlich' });   // Dante
    K.figur('tribuna', 0, 12, 42, { sockel: 2, sockelTyp: t.serena, typ: t.weiss, kopf: t.weiss, beine: 2, rumpf: 2, arme: 'hoch' });       // Galileo
  }
  {   // Verteilerhalle (Kreuzung der beiden Achsen) mit Säulen
    const z = K.steh(0, { u0: 134.1, u1: 212.4, w0: 36.1, w1: 80 });
    K.boden('verteilerhalle', 0, z, (c) => (Math.hypot(c.u - 173, c.w - 58) < 12 ? ((Math.floor(c.u + c.w) & 1) ? t.rot : t.weiss) : schach(c, 4, t.weiss, t.serena)));
    K.waende('verteilerhalle', 0, z, { pitch: 10, y0: 3, y1: 9, farben: ['weiss', 'gelb'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena } });
    K.decke('verteilerhalle', 0, z, (c) => kassette(c, 6, t.serena, t.putz, t.weiss));
    for (const [u, w] of [[148, 46], [198, 46], [148, 72], [198, 72]]) K.quader('verteilerhalle', 0, { u0: u - 1, u1: u + 1, w0: w - 1, w1: w + 1 }, 1, 10, (c, j) => (j === 10 ? t.ornament : t.saeule));
  }
  saal('katalogsaal', 0, { u0: 21.1, u1: 68.9, w0: 35.1, w1: 66 }, ['weiss', 'gelb']);
  tische('katalogsaal', 0, { u0: 27, u1: 64 }, [42, 50, 58], 9);                                       // Katalogkästen und Tische (eine Lage hoch)
  saal('zeitschriftensaal', 0, { u0: 71.1, u1: 131.9, w0: 35.1, w1: 76 }, ['weiss', 'blau']);
  tische('zeitschriftensaal', 0, { u0: 78, u1: 126 }, [44, 54, 64], 12);
  for (const r of [{ u0: 21.1, u1: 68.9, w0: -1, w1: 32.9 }, { u0: 71.1, u1: 131.9, w0: 8, w1: 32.9 }]) saal('verwaltung', 0, r, ['weiss', 'gelb'], { a: t.cotto, b: t.weiss });
  regale('magazin_nord', 0, { u0: 134.1, u1: 212.4, w0: 7, w1: 33.9 }, 5);
  regale('magazin_ost', 0, { u0: 214.4, u1: 282, w0: 4, w1: 81 }, 6);

  // ------------------------------------------------------------ Piano 1: Sala di lettura mit Ionischen Arkaden, Sala di consultazione
  {
    const r = { u0: 21.1, u1: 68.9, w0: 35.1, w1: 66 };
    saal('sala_lettura', 1, r, ['weiss', 'gruen']);
    arkade('sala_lettura', 1, 44, 27, 63, 9);
    arkade('sala_lettura', 1, 57, 27, 63, 9);
    tische('sala_lettura', 1, { u0: 28, u1: 62 }, [47, 51.5], 10);
  }
  saal('sala_consultazione', 1, { u0: 71.1, u1: 131.9, w0: 35.1, w1: 76 }, ['weiss', 'gelb']);
  tische('sala_consultazione', 1, { u0: 78, u1: 126 }, [48, 58], 12);
  regale('magazin_nord', 1, { u0: 134.1, u1: 212.4, w0: 7, w1: 33.9 }, 5);
  regale('magazin_ost', 1, { u0: 214.4, u1: 282, w0: 4, w1: 81 }, 6);

  // ------------------------------------------------------------ Piano 2
  saal('lesesaal_oben', 2, { u0: 21.1, u1: 68.9, w0: 35.1, w1: 66 }, ['weiss', 'blau'], { decke: (c) => kassette(c, 6, t.holz, t.putz, t.weiss) });
  tische('lesesaal_oben', 2, { u0: 28, u1: 62 }, [43, 50, 57], 10);
  regale('magazin_nord', 2, { u0: 134.1, u1: 212.4, w0: 7, w1: 33.9 }, 5);
  regale('magazin_ost', 2, { u0: 214.4, u1: 282, w0: 4, w1: 81 }, 6);
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 7)
const VER = 'Vereinfachte Ausstattung, Lage und Größe Stufe C.';
const INHALT = {
  titel: 'Tribuna, Verteilerhalle, Lesesäle und Magazine', untertitel: 'Tribuna Dante e Galileo, Verteilerhalle, Katalog-, Zeitschriften- und Lesesäle, Magazine', icon: '📚',
  teile: {
    tribuna: { title: 'Tribuna Dante e Galileo', description: 'Runder Saal im Westende hinter dem Portal am Corso dei Tintori: Boden mit rotem und goldenem Kreis in Schachbrett aus Marmor und Pietra serena, Wandfelder in Weiß und Blau mit Goldrahmen und eine Kassettendecke. Zwei Marmorfiguren auf Sockeln stehen für Dante und Galileo.', tip: 'Boden zuerst, dann Wandfelder, Decke und die beiden Figuren.', caution: VER + ' Die Figuren sind Blockfiguren ohne Gesichtszüge, die Zuordnung zu Dante und Galileo ist symbolisch.', fact: 'Die monumentale Tribüne an der Ecke Corso dei Tintori und Via Antonio Magliabechi ist 1929 für Dante und Galileo eröffnet worden (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).' },
    verteilerhalle: { title: 'Verteilerhalle', description: 'Die große Halle im Mitteltrakt, in der sich die beiden Achsen kreuzen: Marmorboden mit rotem Kreis um die Wendeltreppe, vier Säulen aus weißem Marmor, Wandfelder zwischen Pilastern und Kassettendecke.', tip: 'Die Wendeltreppe in der Mitte lässt du frei.', caution: VER + ' Die monumentale Treppe der Bibliothek ist hier eine Wendeltreppe.', fact: 'Zwei Achsen kreuzen sich in einer großen Verteilerhalle; innen gibt es klassizistische Bögen, Säulen und eine monumentale Treppe (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).' },
    katalogsaal: { title: 'Katalogsaal', description: 'Saal im Erdgeschoss des Westflügels mit Schachboden aus Marmor, Wandfeldern in Weiß und Gelb, Kassettendecke und drei Reihen eine Lage hoher Katalogkästen.', tip: 'Die Kästen bestehen aus Holzblöcken.', caution: VER + ' Die Kästen sind Blöcke ohne Schubladen.', fact: 'Entlang der Flussachse liegen Büros, Zeitschriften, Lesesäle und Kataloge (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).' },
    zeitschriftensaal: { title: 'Zeitschriftensaal', description: 'Saal im Erdgeschoss des mittleren Westtrakts mit Schachboden, Wandfeldern in Weiß und Blau, Kassettendecke und drei Reihen Tische.', tip: 'Die Tische sind eine Lage hoch.', caution: VER + ' Die Lage der Zeitschriften im Gebäude ist nicht belegt.', fact: 'Zeitschriften gehören zu den Räumen entlang der Flussachse (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).' },
    sala_lettura: { title: 'Sala di lettura', description: 'Der rechteckige Lesesaal im Piano 1 hat zwei Reihen weißer Säulen mit Kapitell und Architrav, dazwischen Lesetische; Wandfelder in Weiß und Grün und eine Kassettendecke.', tip: 'Säulen zuerst, dann der Architrav.', caution: VER + ' Die Arkaden sind als Gebälk auf Säulen vereinfacht, nicht als Bögen; die Kapitelle sind nicht ionisch ausgebildet.', fact: 'Der Lesesaal ist rechteckig, mit Arkaden auf Säulen mit ionischen Kapitellen (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).' },
    sala_consultazione: { title: 'Sala di consultazione', description: 'Ein zweiter Saal im Piano 1 des mittleren Westtrakts mit Schachboden, Wandfeldern in Weiß und Gelb, Kassettendecke und zwei Tischreihen.', tip: 'Die Tische sind eine Lage hoch.', caution: VER + ' Der Name und die Lage sind nicht belegt.', fact: 'Die Bibliothek hat mehrere Lesesäle (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).' },
    lesesaal_oben: { title: 'Lesesaal im Piano 2', description: 'Der Lesesaal im obersten Geschoss des Westflügels hat blaue Wandfelder, eine Kassettendecke und drei Tischreihen.', tip: 'Die Tische sind eine Lage hoch.', caution: VER + ' Die Raumfolge ist nicht belegt.', fact: 'Die Bibliothek hat mehrere Lesesäle (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).' },
    magazin_nord: { title: 'Magazin im Mitteltrakt', description: 'Der rückwärtige Teil des Mitteltrakts auf allen drei Geschossen ist als Magazin gebaut: Doppelregale vom Boden bis zur Decke (Holz mit braunen und roten Bücherreihen), Gänge und Querwege.', tip: 'Die Regale bleiben vom Rand und von den Türen vier Blöcke entfernt.', caution: VER + ' Die Regale reichen bis zur Decke und sind nicht begehbar; die Zahl der Magazingeschosse ist nicht belegt.', fact: 'Die zweite Achse führt vom Portikus zu den Magazinen im Rücken des Baus; die Regale sind insgesamt 138 km lang (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).' },
    magazin_ost: { title: 'Magazin im Ostflügel', description: 'Der Ostflügel ist auf drei Geschossen mit Regalreihen gefüllt, mit Querwegen alle 20 Blöcke und einem Gang an der Wand.', tip: 'Nach der Wand bleibt der Gang frei.', caution: VER + ' Die Verteilung der Regale ist nicht belegt.', fact: 'Der Block von 1962 hat vier Geschosse über der Erde und eine Verkleidung aus Pietra forte (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze); die Zuordnung zum Ostflügel ist Stufe C.' },
    verwaltung: { title: 'Verwaltungsräume', description: 'Zwei Säle im Erdgeschoss des nördlichen Westflügels mit Boden aus Cotto und Marmor und Wandfeldern in Weiß und Gelb.', tip: 'Wie in den Lesesälen: Boden, Wandfelder, Decke.', caution: VER + ' Die Nutzung ist nicht belegt.', fact: 'Die Büros liegen an der Flussachse (Quelle: it.wikipedia, Biblioteca nazionale centrale di Firenze).' },
    licht_ausstattung: { title: 'Licht in den Sälen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { TREPPE, WAENDE, TEILE, INHALT, ausstatten, oeffnungen, tuerme, fensterAus, istFront };
