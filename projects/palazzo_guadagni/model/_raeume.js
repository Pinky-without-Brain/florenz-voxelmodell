'use strict';
// Raumplan, Dachloggia und Ausstattung des Palazzo Guadagni (W8a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_guadagni/).
// Rahmen GD (theta -47,76 Grad): u entlang der Fassade zur Piazza Santo Spirito, w von der Fassade ins Haus.
// Geschosse: EG Lage 0..8, 1. OG 8..15, 2. OG 15..22, Dachloggia 22..30. Umriss: Hauptblock w 0..34 (u -8..51), schmaler Flügel w 34..54 (u -11..20).
// Raumaufteilung Stufe C; Existenz von Torweg, Treppe, Wandbrunnen, Wappen und Loggia nach it.wikipedia (Palazzo Guadagni).
const path = require('node:path');
const { kit, typen, schach, kassette, schildMotiv } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');
const GRUND = require('../spec/ground.js');
const aufStrasse = require('../../../tools/wahrzeichen/strasse.js').aufStrasseFuer(path.resolve(__dirname, '..'));

const GESCHOSSE = [8, 7, 7, 8];
const PORTALE = [{ u: 25.5, w: 0, breite: 7, hoehe: 7 }];
const TREPPE = { u: 40, w: 12 };                                    // Wendeltreppe im Ostraum an der Fassade (Aufstieg bis zur Loggia)
const SCALONE = { u: 2.5, w: 30, stufen: 8 };                       // Treppe aus Pietra serena im Treppenhaus links (Westseite), Aufstieg in Weltrichtung n

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [
  { achse: 'u', v: 19.5, von: -2, bis: 18.5, tueren: [9] },          // Westraum | Torweg
  { achse: 'u', v: 31.5, von: -2, bis: 18.5, tueren: [9] },          // Torweg | Ostraum (Wendeltreppe)
  { achse: 'w', v: 19.5, von: -10, bis: 52, tueren: [5, 25.5, 45] }, // Vorderräume | hintere Räume
  { achse: 'u', v: 19.5, von: 20.5, bis: 34, tueren: [27] },         // Treppenhaus | Hofhalle
  { achse: 'u', v: 41.5, von: 20.5, bis: 34, tueren: [27] },         // Hofhalle | Ostraum hinten
  { achse: 'w', v: 34.5, von: -12, bis: 19.5, tueren: [6] }          // Treppenhaus | Flügel
];

const TEILE = ['androne', 'treppenhaus', 'scalone', 'hofhalle', 'wandbrunnen', 'sala_piano_nobile', 'dachloggia', 'panca', 'licht_ausstattung'];

/** Dachloggia: Rechtecköffnungen (architraviert, Joch 5, Brüstung 2 Blöcke) in der Fassade zur Piazza und in der Westwand zur Via Mazzetta. */
function loggia(api) {
  const { D, oeffnung, BASIS, Y } = api;
  const b = BASIS[3];
  const imJoch = (v) => { const r = (((v - 0.5) % 5) + 5) % 5; return r < 1.5 || r > 3.5; };
  for (const c of D.haupt) {
    if (c.d8 > 2) continue;
    const vorn = c.w <= 2.5 && c.u >= 3.5 && c.u <= 47.5;
    const west = c.w > 2.5 && c.w >= 3.5 && c.w <= 30 && c.u <= -0.25 * c.w + 2.2;
    if (!(vorn && imJoch(c.u)) && !(west && imJoch(c.w))) continue;
    for (let yr = b + 3; yr <= b + 6; yr++) oeffnung('loggia', 'aussenwand', c.x, Y(yr), c.z);
  }
}

/** Treppe im Treppenhaus: Läufe vor dem Rohbau setzen und das Treppenloch im Boden des 1. Obergeschosses freihalten. */
function vorher(api) {
  const { D, Y, set, hat, frei } = api;
  const st = SCALONE.start || (SCALONE.start = (() => { const p = D.R.toWorld(SCALONE.u, SCALONE.w); return { x: Math.round(p.x), z: Math.round(p.z) }; })());
  const treppe = WZ.treppe.geradeTreppe({ start: { x: st.x, y: Y(1), z: st.z }, richtung: 'n', stufen: SCALONE.stufen, breite: 2, rolle: 'pietra_serena' });
  const serena = WZ.typ('pietra_serena');
  for (const l of WZ.treppe.treppenloch(treppe.lauf, 3)) frei(l.x, l.y, l.z);
  for (const b of treppe) {
    set(b.x, b.y, b.z, b.typ, 'scalone', true);
    if (b.y - 1 > Y(0) && !hat(b.x, b.y - 1, b.z)) set(b.x, b.y - 1, b.z, serena, 'scalone', true);       // Kragstein unter jeder Stufe
  }
  api.scalone = treppe;
}

function ausstatten(api) {
  const { Y, set } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Torweg (androne) mit Kreuzgewölbe auf Lisenen
  {
    const z = K.steh(0, { u0: 20.6, u1: 30.4, w0: 0.5, w1: 18.4 });
    K.boden('androne', 0, z, (c) => schach(c, 3, t.serena, t.pflaster));
    K.waende('androne', 0, z, { pitch: 5, y0: 2, y1: 5, farben: ['weiss'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 1, typ: t.serena } });
    const rippe = (c) => {                                           // zwei Joche (9 Blöcke), Diagonalrippen aus Pietra serena
      const du = Math.abs(c.u - 25.5), dw = Math.abs(c.w - (c.w < 9.5 ? 4.7 : 14.2));
      return Math.abs(du - dw) < 0.75 ? t.serena : t.putz;
    };
    K.decke('androne', 0, z, rippe);
  }

  // ------------------------------------------------------------ Treppenhaus (EG und 1. OG) um die Treppe aus Pietra serena
  for (const s of [0, 1]) {
    const z = K.steh(s, { u0: -12, u1: 18.4, w0: 20.6, w1: 33.4 });
    K.boden('treppenhaus', s, z, (c) => schach(c, 2, t.pflaster, t.weiss));
    K.waende('treppenhaus', s, z, { pitch: 8, y0: 2, y1: s === 0 ? 5 : 4, farben: ['weiss', 'gelb'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 1, typ: t.serena } });
  }

  // ------------------------------------------------------------ Hofhalle (EG): Pflaster mit Wegekreuz, Wandbrunnen an der Rückwand
  {
    const z = K.steh(0, { u0: 20.6, u1: 40.4, w0: 20.6, w1: 33.4 });
    K.boden('hofhalle', 0, z, (c) => (Math.abs(c.u - 30.5) < 0.8 || Math.abs(c.w - 27) < 0.8 ? t.serena : schach(c, 2, t.pflaster, t.weiss)));
    K.waende('hofhalle', 0, z, { pitch: 7, y0: 2, y1: 5, farben: ['weiss'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 1, typ: t.serena } });
    // Wandbrunnen: Muschelbecken mit Wasser, darüber Nische mit dem Einhorn der Guadagni
    const rand = (c) => c.u < 28.2 || c.u >= 32.8 || c.w < 26.8 || c.w >= 28.8;
    const sockel = (c) => Math.abs(c.u - 30.5) < 1.1 && Math.abs(c.w - 27.8) < 1.1;           // Sockel des Einhorns
    K.quader('wandbrunnen', 0, { u0: 27.2, u1: 33.8, w0: 25.8, w1: 29.8 }, 1, 2, (c, j) => (sockel(c) ? t.serena : j === 2 ? null : rand(c) ? t.weiss : WZ.typ('wasser')));
    K.figur('wandbrunnen', 0, 30.5, 28, { sockel: 0, beine: 2, rumpf: 1, typ: t.weiss, arme: 'keine', schmuck: t.gold, j0: 3 });
  }

  // ------------------------------------------------------------ Saal im Piano nobile mit geteiltem Wappen Guadagni und Dufour Berte
  {
    const z = K.steh(1, { u0: 20.6, u1: 40.4, w0: 20.6, w1: 33.4 });
    K.boden('sala_piano_nobile', 1, z, (c) => schach(c, 3, t.cotto, t.weiss));
    K.waende('sala_piano_nobile', 1, z, { pitch: 8, y0: 2, y1: 5, farben: ['gelb', 'weiss'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 1, typ: t.holz },
      motiv: (k, q, j, B, H) => schildMotiv(k, q, j, B, H, [FR('rot'), FR('blau')], t.gold, t.weiss) });
    K.decke('sala_piano_nobile', 1, z, (c) => kassette(c, 4, t.holz, t.putz, t.gold));
    K.quader('sala_piano_nobile', 1, { u0: 26, u1: 35, w0: 25, w1: 27 }, 1, 1, t.holz);
  }

  // ------------------------------------------------------------ Dachloggia: Boden und Balkendecke im obersten Geschoss
  {
    const z = K.steh(3, { u0: -12, u1: 52, w0: 0, w1: 60 });
    K.boden('dachloggia', 3, z, (c) => schach(c, 2, t.cotto, t.terrakotta));
    K.decke('dachloggia', 3, z, (c) => kassette(c, 5, t.holz, t.putz, null));
  }

  // ------------------------------------------------------------ Sockelbank (panca di via) an der Fassade zur Piazza Santo Spirito (Luftraum 2)
  {
    const nahPortal = (p) => PORTALE.some((q) => Math.hypot(p.u - q.u, p.w - q.w) < 6.5);
    for (const p of K.aussenZellen()) {
      if (p.w > 3 || p.u < 1 || p.u > 50 || nahPortal(p)) continue;
      if (GRUND.groundTopY(p.x, p.z) >= Y(1)) continue;
      if (!aufStrasse(p.x, p.z)) continue;
      set(p.x, Y(1), p.z, t.serena, 'panca');
    }
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const Q = '(Quelle: it.wikipedia, Palazzo Guadagni)';
const INHALT = {
  titel: 'Ausgestaltete Räume, Treppe und Dachloggia', untertitel: 'Torweg, Treppe in Pietra serena, Hofhalle mit Wandbrunnen, Saal, Dachloggia', icon: '🏛️',
  teile: {
    androne: { title: 'Torweg', description: 'Durchgang hinter dem Portal an der Piazza: Schachboden aus Pietra serena und Pflaster, Wandfelder zwischen Lisenen aus Pietra serena und eine Decke mit Diagonalrippen über zwei Jochen als Kreuzgewölbe.', tip: 'Boden zuerst, dann Wandraster, zuletzt die Rippen unter der Decke.', caution: VER + ' Die Gewölbe sind nur als Rippenmuster unter einer flachen Decke angedeutet; Lage und Breite Stufe C.', fact: `Der Torweg hat ein Kreuzgewölbe auf Lisenen und Säulen mit Renaissance-Kapitellen ${Q}.` },
    treppenhaus: { title: 'Treppenhaus', description: 'Raum links hinter dem Torweg um die Treppe: Pflaster im Schachmuster, Wandfelder zwischen Pilastern aus Pietra serena.', tip: 'Die Treppe steht vor dem Wandraster.', caution: VER + ' Lage Stufe C; die Zubauten des 19. Jahrhunderts sind nicht unterschieden.', fact: `Die Treppe auf der linken Seite gilt als ursprünglich, die übrigen Elemente des Treppenhauses stammen aus dem 19. Jahrhundert ${Q}.` },
    scalone: { title: 'Treppe aus Pietra serena', description: 'Gerade Treppe aus acht Treppenblöcken aus Pietra serena, zwei Blöcke breit, vom Erdgeschoss zum 1. Obergeschoss; unter jeder Stufe trägt ein Kragstein, darüber ist der Boden offen (Kopffreiheit drei Blöcke).', tip: 'Stufe für Stufe von unten, Kragstein zuerst.', caution: VER + ' Der Lauf ist als gerade Treppe vereinfacht; Länge und Lage Stufe C.', fact: `Die Treppe aus Pietra serena auf der linken Seite des Eingangs gilt als die ursprüngliche des 16. Jahrhunderts ${Q}.` },
    hofhalle: { title: 'Hofhalle', description: 'Halle hinter dem Torweg: Pflaster mit Wegekreuz aus Pietra serena, Wandfelder zwischen Pilastern. Im Modell überdeckt; die OSM-Fläche hat keinen offenen Hof.', tip: 'Erst das Pflaster, dann die Wandfelder.', caution: VER + ' Der Hof des Palastes ist im OSM-Umriss nicht ausgespart und deshalb als überdachte Halle gebaut; Lage Stufe C.', fact: `Der Hof hat Reste einer zugemauerten Loggia mit Kapitellen aus Delfinen, Voluten und Muscheln sowie zwei gedrückte Barockbögen auf Renaissance-Säulen ${Q}.` },
    wandbrunnen: { title: 'Wandbrunnen mit Einhorn', description: 'Becken aus Pietra serena mit Wasserfläche an der Rückwand der Hofhalle; dahinter steht das Einhorn der Guadagni als weiße Blockfigur mit goldenem Horn.', tip: 'Becken, Wasser, dann die Figur.', caution: VER + ' Muschelbecken und Nische sind nur als Becken und Figur angedeutet; Lage Stufe C.', fact: `Der Wandbrunnen mit Muschelbecken hat eine Nische mit einem Einhorn, dem Wappentier der Guadagni; das Wasser kam laut Inschrift mit großherzoglicher Genehmigung aus dem Boboli-Garten ${Q}.` },
    sala_piano_nobile: { title: 'Saal im Piano nobile', description: 'Saal über der Hofhalle: Schachboden aus Cotto und Marmor, Wandfelder in Gelb und Weiß mit Schilden in Rot und Blau (geteiltes Wappen), Kassettendecke aus Holz und Gold, eine Tafel.', tip: 'Boden, Wandraster mit Schilden, Decke, zuletzt die Tafel.', caution: VER + ' Das Wappen ist als Schildfeld angedeutet, seine Farben sind nicht belegt; Raum und Lage Stufe C.', fact: `Im Inneren ist ein geteiltes Wappen der Guadagni und der Dufour Berte erhalten ${Q}.` },
    dachloggia: { title: 'Dachloggia', description: 'Oberstes Geschoss: Cottoboden im Schachmuster und Balkendecke; die Außenwände zur Piazza und zur Via Mazzetta sind zwischen Pfeilern mit Rechtecköffnungen offen (Brüstung zwei Blöcke hoch), darüber der Architrav und das Walmdach.', tip: 'Boden und Decke zuerst, die Öffnungen bleiben frei.', caution: VER + ' Die Zahl der Joche ist nicht belegt (Entwurf: Joch 5); das weit vorspringende Dach ist nicht ausgeformt, und die Pfeiler sind Wandblöcke statt Säulen.', fact: `Das oberste Geschoss ist eine große Loggia mit architravierten Säulen unter einer weit vorspringenden Traufe ${Q}.` },
    panca: { title: 'Sockelbank (panca di via)', description: 'Steinbank aus Pietra serena entlang der Fassade zur Piazza Santo Spirito, am Portal unterbrochen, eine Lage hoch auf dem Straßenpflaster.', tip: 'Die Bank liegt einen Block hoch auf dem Pflaster.', caution: VER + ' Die gezahnte Basis ist nicht nachgebildet; nur innerhalb des Luftraums von 2 Blöcken.', fact: `Die Fassade hat eine Straßenbank (panca di via) mit gezahnter Basis ${Q}.` },
    licht_ausstattung: { title: 'Licht in den Räumen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { GESCHOSSE, PORTALE, TREPPE, WAENDE, TEILE, INHALT, vorher, loggia, ausstatten, SCALONE };
