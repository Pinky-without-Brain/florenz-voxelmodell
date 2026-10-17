'use strict';
// Raumplan und Ausstattung des Palazzo Spini Feroni (W7a, Katalog: 20_Stadtmodell_Florenz/wahrzeichen/palazzo_spini_feroni/).
// Rahmen SF (theta 122,43 Grad): u entlang des Borgo Santi Apostoli (nach Südwesten), w von dort nach innen. Geschosse: EG Lage 0..11,
// Piano nobile 11..21, 2. OG 21..30. Der Hof (Loch 0) liegt bei u 28,6..47,8, w 12,6..29,5. Raumaufteilung Stufe C; Existenz der Räume
// (Androne, Cappella, Säle, Museum) nach it.wikipedia, Palazzo Spini Feroni.
const { kit, typen, schach, kassette, schildMotiv, figurenFries } = require('../../../tools/wahrzeichen/palazzo_raum.js');
const WZ = require('../../../tools/wahrzeichen');
const GRUND = require('../spec/ground.js');
const { umfeldVon } = require('../../../tools/city/umfeld.js');
const UMFELD = umfeldVon(JSON.parse(require('node:fs').readFileSync(require('node:path').join(__dirname, '..', '..', '..', 'data', 'stadt', 'flaechen.json'), 'utf8')));
const MASKE = WZ.ladeMasken(JSON.parse(require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'project.json'), 'utf8')), { dir: require('node:path').resolve(__dirname, '..') }).alle;
// Fremde Gebäude (gebaeude.json) im Umfeld der Maske: Straßenpolygone überlappen dort teils Hausgrundrisse, deshalb genügt die Flächenklasse nicht
const FREMDE = (() => { const PO = require('../../../tools/city/poly.js'); const g = JSON.parse(require('node:fs').readFileSync(require('node:path').join(__dirname, '..', '..', '..', 'data', 'stadt', 'gebaeude.json'), 'utf8')).gebaeude;
  const xs = MASKE.cells.map((c) => c[0]), zs = MASKE.cells.map((c) => c[1]); const x0 = Math.min(...xs) - 6, x1 = Math.max(...xs) + 6, z0 = Math.min(...zs) - 6, z1 = Math.max(...zs) + 6;
  const out = []; for (const b of g) { const r = b.polygon && b.polygon.aussen && b.polygon.aussen[0]; if (!r) continue; const bx = r.map((p) => p[0]), bz = r.map((p) => p[1]);
    if (Math.max(...bx) < x0 || Math.min(...bx) > x1 || Math.max(...bz) < z0 || Math.min(...bz) > z1) continue; out.push(PO.normalize(b.polygon)); }
  return { PO, out }; })();
const inFremdemGebaeude = (x, z) => FREMDE.out.some((poly) => FREMDE.PO.contains(poly, x + 0.5, z + 0.5));
const strasseOderEigen = (x, z) => { if (MASKE.innen(x, z)) return true; const k = UMFELD.klasse(x, z); return (k === 'strasse' || k === 'platz') && !inFremdemGebaeude(x, z); };
// Bank nur auf Straßen-/Platzzellen, und nur, wenn im Umkreis von 2 Blöcken kein fremdes Gebäude liegt (Nachbarhäuser bauen Eingangsstufen auf die Straße)
const aufStrasse = (x, z) => { if (!strasseOderEigen(x, z) || MASKE.innen(x, z)) return false; for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) if (!strasseOderEigen(x + dx, z + dz)) return false; return true; };

// Fensterraster 9 (Mitte u 38 / w 20 + 9k); Portale in Fensterachsen
const PORTALE = [{ u: 11, w: 0, breite: 7, hoehe: 9 }, { u: 38, w: 0, breite: 7, hoehe: 9 }, { u: -6, w: 20, breite: 7, hoehe: 9 }];
const TREPPE = { u: 95, w: 38 };
const HOF = { u: 38.2, w: 21.05, hu: 9.6, hw: 8.45 };

/** Vier Türen vom EG in den Hof (Hofwand ohne Arkaden), 3 Blöcke breit, 5 hoch. */
function oeffnungen(api) {
  const { D, Y, oeffnung } = api;
  for (const c of D.haupt) {
    if (c.dHof > 2 || c.d8 <= 2) continue;
    const du = Math.abs(c.u - HOF.u) - HOF.hu, dw = Math.abs(c.w - HOF.w) - HOF.hw;
    const tuer = du > dw ? Math.abs(c.w - HOF.w) < 1.6 : Math.abs(c.u - HOF.u) < 1.6;
    if (tuer) for (let yr = 1; yr <= 5; yr++) oeffnung('tuer', 'hofwaende', c.x, Y(yr), c.z);
  }
}

// ---------------------------------------------------------------- Trennwände (lokal; Türen 3 x 5)
const WAENDE = [
  { achse: 'w', v: 10.5, von: -7, bis: 30, tueren: [12] },           // Vorderraum West | Westflügel
  { achse: 'w', v: 10.5, von: 46, bis: 66, tueren: [56] },           // Vorderraum Ost | Ostraum am Hof
  { achse: 'u', v: 30, von: -1, bis: 10.4, tueren: [5] },            // Vorderraum West | Androne
  { achse: 'u', v: 46, von: -1, bis: 10.4, tueren: [5] },            // Androne | Vorderraum Ost
  { achse: 'w', v: 32, von: -7, bis: 26.5, tueren: [8] },            // Westflügel Nord | Süd
  { achse: 'u', v: 27, von: 32.5, bis: 53, tueren: [42] },           // Westflügel Süd | Südtrakt
  { achse: 'w', v: 31.6, von: 50, bis: 64, tueren: [57] },           // Ostraum am Hof | Südtrakt
  { achse: 'u', v: 64.5, von: 10.5, bis: 53, tueren: [20, 42] }      // Hofflügel | Ostflügel (Museum)
];

const TEILE = ['androne', 'cappella_poccetti', 'sala_del_pace', 'museo_ferragamo', 'hof_spini', 'panca', 'licht_ausstattung'];

function ausstatten(api) {
  const { Y, set } = api;
  const K = kit(api);
  const t = typen();
  const FR = (n) => WZ.fresko(n);

  // ------------------------------------------------------------ Androne (EG): Wappen und Hochrelief von 1705
  {
    const z = K.steh(0, { u0: 30.5, u1: 45.5, w0: 0.5, w1: 10.4 });
    const wf = ['rot', 'blau', 'gruen', 'gelb'].map(FR);
    K.boden('androne', 0, z, (c) => schach(c, 3, t.serena, t.weiss));
    K.waende('androne', 0, z, { pitch: 8, y0: 3, y1: 9, farben: ['weiss'], rahmen: t.serena, pilaster: t.serena, sockel: { h: 2, typ: t.serena },
      motiv: (k, q, j, B, H) => schildMotiv(k, q, j, B, H, wf, t.gold, FR('weiss')) });
    K.flaeche('androne', 0, { u0: 28.9, u1: 31.1, w0: 3, w1: 8 }, 3, 8, (c, jj, j) => ((jj === 0 || jj === 5 || c.w < 3.6 || c.w > 7.4) ? t.gold : t.ornament));   // Hochrelief
  }

  // ------------------------------------------------------------ Cappella privata (Piano nobile, Westflügel Nord): Fresken Poccettis
  {
    const z = K.steh(1, { u0: -6.5, u1: 26, w0: 12, w1: 31.5 });
    const fo = { himmel: FR('hellblau'), wiese: FR('gruen'), huegel: FR('braun'), haut: FR('orange'), gold: t.gold, figuren: ['rot', 'blau', 'weiss', 'gelb', 'gruen'].map(FR) };
    K.boden('cappella_poccetti', 1, z, (c) => schach(c, 3, t.cotto, t.pflaster));
    K.waende('cappella_poccetti', 1, z, { pitch: 12, y0: 3, y1: 8, farben: ['hellblau'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 2, typ: t.holz }, nurTeile: ['aussenwand', 'trennwaende_og', 'trennwaende'],
      motiv: (k, q, j, B, H) => figurenFries(k, q, j, B, H, fo) });
    K.quader('cappella_poccetti', 1, { u0: -2, u1: 1, w0: 19, w1: 24 }, 1, 2, t.weiss);                                              // Altar
    K.quader('cappella_poccetti', 1, { u0: -2, u1: 0, w0: 20.5, w1: 22.5 }, 3, 4, t.gold);                                           // Kreuz
    for (const u of [8, 13, 18]) for (const w of [17, 26]) K.quader('cappella_poccetti', 1, { u0: u, u1: u + 3, w0: w, w1: w + 1 }, 1, 1, t.holz);   // Bänke
  }

  // ------------------------------------------------------------ Säle mit Fresken von Ranieri del Pace (Piano nobile, Südtrakt)
  {
    const z = K.steh(1, { u0: 27.5, u1: 64, w0: 33, w1: 52 });
    K.boden('sala_del_pace', 1, z, (c) => schach(c, 4, t.cotto, t.weiss));
    K.waende('sala_del_pace', 1, z, { pitch: 10, y0: 3, y1: 8, farben: ['hellblau', 'gelb', 'weiss'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 2, typ: t.holz }, fries: t.gold, nurTeile: ['aussenwand', 'trennwaende_og', 'trennwaende'] });
    K.decke('sala_del_pace', 1, z, (c) => ((Math.floor(c.u) + Math.floor(c.w)) % 6 === 0 ? t.gold : FR(Math.hypot(c.u - 45, c.w - 42) < 7 ? 'blau' : 'hellblau')));   // Deckenfresko
    K.quader('sala_del_pace', 1, { u0: 40, u1: 50, w0: 41, w1: 43 }, 1, 1, t.holz);                                                  // Tafel
  }

  // ------------------------------------------------------------ Museo Salvatore Ferragamo (Ostflügel; in der Wirklichkeit im Untergeschoss)
  {
    const z = K.steh(0, { u0: 65.5, u1: 110, w0: 23, w1: 52 });
    K.boden('museo_ferragamo', 0, z, (c) => schach(c, 4, t.dunkel, t.weiss));
    K.waende('museo_ferragamo', 0, z, { pitch: 10, y0: 3, y1: 8, farben: ['weiss'], rahmen: t.gold, pilaster: t.serena, sockel: { h: 2, typ: t.dunkel }, nurTeile: ['aussenwand', 'trennwaende'],
      motiv: (k, q, j, B, H) => ((q + j) % 5 === 0 ? FR(['rot', 'blau', 'gelb', 'gruen'][k % 4]) : null) });
    for (const w of [29, 36, 43]) for (const u of [72, 82, 100]) {                                                                   // Vitrinen: Sockel mit Glashaube
      K.quader('museo_ferragamo', 0, { u0: u, u1: u + 5, w0: w, w1: w + 2 }, 1, 1, t.dunkel);
      K.quader('museo_ferragamo', 0, { u0: u, u1: u + 5, w0: w, w1: w + 2 }, 2, 2, t.glas);
    }
  }

  // ------------------------------------------------------------ Hof: Pflaster mit Wegekreuz
  K.hofboden('hof_spini', { u0: 28, u1: 48.5, w0: 12, w1: 30 }, (c) => {
    if (Math.abs(c.u - HOF.u) < 1.2 || Math.abs(c.w - HOF.w) < 1.2) return t.serena;
    return ((Math.floor(c.u / 3) + Math.floor(c.w / 3)) & 1) ? t.pflaster : t.weiss;
  });

  // ------------------------------------------------------------ Steinbank (panca di via) rund um den Palast (Luftraum 2)
  {
    const nahPortal = (p) => PORTALE.some((q) => Math.hypot(p.u - q.u, p.w - q.w) < 6.5);
    for (const p of K.aussenZellen()) {
      if (nahPortal(p) || GRUND.groundTopY(p.x, p.z) >= Y(1)) continue;
      if (!aufStrasse(p.x, p.z)) continue;
      set(p.x, Y(1), p.z, t.serena, 'panca');
    }
  }
}

// ---------------------------------------------------------------- Content der Bauteile (Modul 6)
const VER = 'Vereinfachte Ausstattung, nicht nach Vorbild.';
const Q = '(Quelle: it.wikipedia, Palazzo Spini Feroni)';
const INHALT = {
  titel: 'Ausgestaltete Räume, Museum und Hof', untertitel: 'Androne, Cappella, Säle, Museum Ferragamo und Hof', icon: '👞',
  teile: {
    androne: { title: 'Androne', description: 'Eingangshalle hinter dem mittleren Portal am Borgo Santi Apostoli: Schachboden aus Pietra serena und Marmor, Wandfelder mit Wappenschilden in Goldrahmen und ein Hochrelief aus Marmor in der Westwand; eine Tür führt in den Hof.', tip: 'Boden, Wandraster, dann das Relief in die Wand einsetzen.', caution: VER + ' Das Relief ist nur ein Marmorfeld, Wappen und Lage sind Stufe C.', fact: `Der Androne zeigt Wappenschmuck und ein Hochrelief von Giuseppe Piamontini von 1705 ${Q}.` },
    cappella_poccetti: { title: 'Cappella privata', description: 'Kapelle im Piano nobile des Westflügels: Cottoboden, Wände mit einem Figurenfries in Hellblau, Grün und Gewändern, Altar mit Kreuz und sechs Bänke.', tip: 'Boden und Wandfries zuerst, dann Altar und Bänke.', caution: VER + ' Die Szenen sind nur angedeutet; Lage Stufe C.', fact: `Die Privatkapelle trägt Fresken von Bernardino Poccetti (1609–1612) ${Q}.` },
    sala_del_pace: { title: 'Saal mit Fresken (Ranieri del Pace)', description: 'Großer Saal im Piano nobile des Südtrakts: Cottoboden, Wandfelder in Hellblau, Gelb und Weiß mit Goldrahmen und Goldfries, Deckenfresko in Blau mit Goldrippen, Tafel.', tip: 'Die Decke als Fläche unter dem Boden des Obergeschosses.', caution: VER + ' Das Deckenbild ist nur angedeutet; Lage Stufe C.', fact: `Die übrigen Repräsentationsräume sind mit Fresken des 17. und 18. Jahrhunderts von Ranieri del Pace geschmückt ${Q}.` },
    museo_ferragamo: { title: 'Museo Salvatore Ferragamo', description: 'Museumshalle im Ostflügel: Schachboden in Schwarz und Weiß, weiße Wände mit bunten Bildfeldern, neun Vitrinen aus dunklem Sockel mit Glashaube.', tip: 'Die Vitrinen sind einen Block hoch plus Glas.', caution: VER + ' Das Museum liegt in Wirklichkeit im Untergeschoss; im Modell steht es im Erdgeschoss, weil kein Untergeschoss gebaut wird.', fact: `Das Museo Salvatore Ferragamo befindet sich seit 1995 im Untergeschoss des Palasts ${Q}.` },
    hof_spini: { title: 'Hof', description: 'Offener Hof mit Wegekreuz aus Pietra serena und Schachmuster aus Pflaster und Marmor; vier Türen aus dem Erdgeschoss führen hinein.', tip: 'Erst das Pflaster, dann die Wegestreifen.', caution: VER + ' Arkaden sind nicht belegt und deshalb nicht gebaut.', fact: `Der Palast ist ein gotischer Bau aus unverputzter Pietra forte ${Q}.` },
    panca: { title: 'Steinbank (panca di via)', description: 'Steinbank aus Pietra serena entlang der Straßenfassaden, an den Portalen unterbrochen, eine Lage hoch auf dem Straßenpflaster.', tip: 'Die Bank liegt einen Block hoch auf dem Pflaster.', caution: VER + ' Nur innerhalb des Luftraums von 2 Blöcken und nur, wo das Gelände tiefer liegt.', fact: `Um das Erdgeschoss läuft eine Steinbank (panca di via) ${Q}.` },
    licht_ausstattung: { title: 'Licht in den Räumen', description: 'Seelaternen im Boden der ausgestalteten Räume, höchstens 12 Blöcke voneinander entfernt.', tip: 'Die Laternen ersetzen einzelne Bodenblöcke.', caution: 'Nicht in Türöffnungen setzen.', fact: 'In Minecraft sind Innenräume ohne Lichtquelle dunkel.' }
  }
};

module.exports = { PORTALE, TREPPE, WAENDE, TEILE, INHALT, oeffnungen, ausstatten, HOF };
