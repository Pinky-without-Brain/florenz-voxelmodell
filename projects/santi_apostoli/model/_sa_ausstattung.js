'use strict';
// Ausstattung von Santi Apostoli (Modul 5): Kapellen mit Altarbildern, Grabmäler, Tabernakel der Della Robbia, Polyptychon in der Apsis, Marmorbecken,
// Pazzi-Feuersteine, Mosaik im Boden. Alles vereinfacht, nicht nach Vorbild (Katalog §3).
const K = require('../../../tools/wahrzeichen/kirche.js');
const WZ = require('../../../tools/wahrzeichen');

const FR = (n) => WZ.fresko(n);

function ausstatten(api) {
  const { D, set, ersetze, Y, T, zellen, key } = api;
  const C = require('./_sa.js');
  const { cellsIn, quader, feld } = K.ausstatter(api);
  const M = K.malerei;
  // äußerster Rand je u (kleinstes und größtes w der Maske)
  const rand = new Map();
  for (const c of D.cells) {
    const k = Math.round(c.u);
    const a = rand.get(k) || { n: Infinity, s: -Infinity };
    if (c.w < a.n) a.n = c.w;
    if (c.w > a.s) a.s = c.w;
    rand.set(k, a);
  }
  const rd = (u) => rand.get(Math.round(u)) || { n: 0, s: 20 };

  // ---- Altäre (klein, 16. Jahrhundert): nördlich vier, südlich drei im Seitenschiff und einer in der Kapelle
  const altar = (seite, u, wo = null) => {
    const a = rd(u);
    const w0 = wo != null ? wo : (seite === 'n' ? a.n + 2.4 : a.s - 3.6);
    quader('seitenaltaere', { u0: u - 1.6, u1: u + 1.6, w0, w1: w0 + 1.4 }, 1, 2, T.weiss);
    quader('seitenaltaere', { u0: u - 0.4, u1: u + 0.4, w0: w0 + 0.2, w1: w0 + 1.2 }, 3, 4, T.gold);
  };
  const bild = (teil, seite, u, fn, B = 5, H = 7, j0 = 4, wo = null) => {
    const a = rd(u);
    const r = wo != null ? { u0: u - B / 2, u1: u + B / 2, w0: wo, w1: wo + 3.5 } : (seite === 'n' ? { u0: u - B / 2, u1: u + B / 2, w0: a.n - 1, w1: a.n + 4 } : { u0: u - B / 2, u1: u + B / 2, w0: a.s - 4, w1: a.s + 1.5 });
    return feld(teil, r, 'u', u - B / 2, B, H, j0, fn, ['seitenwaende'], 2);
  };
  // Süden (rechts vom Eingang)
  altar('s', 7); altar('s', 15); altar('s', 23);
  bild('martin_gamberucci', 's', 7, M.tafel({ himmel: 'hellblau', boden: 'braun', gewand: ['rot', 'weiss', 'braun'], motiv: 'gruppe' }));                    // Almosen des heiligen Martin
  bild('delbene_roncalli', 's', 15, M.tafel({ himmel: 'gelb', boden: 'braun', gewand: ['blau', 'rot', 'weiss'], motiv: 'gruppe' }));                       // Petrus heilt den Lahmen
  {
    // Grabmal des Piero Del Bene (1530): Sarkophag am Fuß der Wand, Marmorfeld darüber; gegenüber das Relief des heiligen Paulus (Stuck)
    const a = rd(23);
    quader('delbene_grabmal', { u0: 21.4, u1: 24.6, w0: a.s - 3.6, w1: a.s - 2.2 }, 1, 1, T.ornament);
    feld('delbene_grabmal', { u0: 21.4, u1: 24.6, w0: a.s - 4, w1: a.s + 1.5 }, 'u', 21.4, 3, 6, 3, M.rahmen((q, j, B, H) => (j > H - 3 ? T.weiss : T.ornament)), ['seitenwaende'], 2);
  }
  // Vierte Kapelle rechts (Altoviti, gegründet 1533): Vasari, Immacolata Concezione (1541), in der Kapelle der südlichen Ausbuchtung
  altar('s', 30.5, 23.4);
  feld('altoviti_vasari', { u0: 28, u1: 33, w0: 21, w1: 27 }, 'u', 28, 5, 8, 3, M.tafel({ himmel: 'hellblau', boden: 'weiss', gewand: ['blau', 'weiss', 'rot'], motiv: 'figur' }), ['seitenwaende'], 2);
  // Grabmal des Bindo Altoviti über der Tür zur Sakristei (Ammannati, 1570): Marmorfeld mit der Caritas am Ende des südlichen Seitenschiffs
  feld('altoviti_ammannati', { u0: 32.4, u1: 34.6, w0: 17, w1: 20 }, 'u', 32.4, 2, 6, 7, M.rahmen((q, j, B, H) => (j > H - 4 ? T.weiss : T.ornament)), ['arkaden', 'seitenwaende', 'triumphbogen']);
  // ---- Norden (links): Pazzi-Feuersteine, Altoviti-Grabmal, vier Kapellen
  altar('n', 6.5); altar('n', 14.5); altar('n', 22.5); altar('n', 30.5);
  bild('schiavo_madonna', 'n', 6.5, M.tafel({ himmel: 'hellblau', boden: 'gruen', gewand: ['blau', 'rot'], motiv: 'figur' }));                             // Madonna mit Kind und Engeln (Kopie nach Schiavo)
  bild('gabbiani_franz', 'n', 14.5, M.tafel({ himmel: 'gelb', boden: 'braun', gewand: ['schwarz', 'weiss', 'rot'], motiv: 'himmel' }));                    // Glorie des heiligen Franz von Sales (Gabbiani)
  bild('fei_michael', 'n', 22.5, M.tafel({ himmel: 'orange', boden: 'braun', gewand: ['rot', 'blau', 'weiss'], motiv: 'figur' }));                         // Erzengel Michael (Fei)
  bild('maso_triptychon', 'n', 30.5, M.tafel({ himmel: 'hellblau', boden: 'gruen', gewand: ['blau', 'rot', 'weiss'], motiv: 'gruppe' }), 8, 7, 4);        // drei Tafeln des Maso da San Friano
  {
    const a = rd(10);                                                                                    // Nische mit den Feuersteinen der Pazzi
    feld('pazzi_feuersteine', { u0: 9, u1: 11.4, w0: a.n - 1, w1: a.n + 4 }, 'u', 9, 2, 3, 2, (q, jj) => (jj === 1 ? FR('orange') : T.dunkel), ['seitenwaende'], 2);
    const b = rd(2.8);                                                                                   // Grabmal Antonio und Oddone Altoviti (Rovezzano 1507/08)
    quader('altoviti_rovezzano', { u0: 3.8, u1: 7.2, w0: b.n + 2.2, w1: b.n + 3.6 }, 1, 1, T.weiss);
    feld('altoviti_rovezzano', { u0: 3.8, u1: 7.2, w0: b.n - 1, w1: b.n + 4 }, 'u', 3.8, 3, 7, 2, M.rahmen((q, j, B, H) => (j > H - 3 ? T.weiss : T.ornament)), ['seitenwaende'], 2);
  }

  // ---- Chor: moderner Altar, Polyptychon (Jacopo di Cione und Niccolò Gerini, 1383) an der Apsiswand, Kenotaph des Antonio Altoviti (Dosio),
  //      polychromes Tabernakel aus glasierter Terrakotta (Della Robbia, 1512) links der Apsis
  quader('chor_altar', { u0: 43, u1: 45.6, w0: 10, w1: 15.6 }, 1, 1, T.weiss);
  quader('chor_altar', { u0: 44, u1: 44.8, w0: 12, w1: 13.6 }, 2, 4, T.gold);
  feld('polyptychon', { u0: 50, u1: 59, w0: 8, w1: 18 }, 'w', 8.5, 9, 10, 4, (q, jj, B, H) => {
    if (q === 0 || q === B - 1 || jj === 0 || jj === H - 1) return T.gold;
    const tafel = Math.floor(q / 2.5);
    return jj < 3 ? T.gold : [FR('rot'), FR('blau'), FR('weiss'), FR('gruen')][tafel % 4];
  }, ['seitenwaende'], 2);
  {
    const a = rd(40);
    quader('della_robbia_tabernakel', { u0: 40, u1: 43, w0: a.n + 2.2, w1: a.n + 3.6 }, 1, 1, T.weiss);                // Rest des Sarkophags von Donato Acciaiuoli (1333)
    feld('della_robbia_tabernakel', { u0: 40, u1: 43, w0: a.n - 1, w1: a.n + 4 }, 'u', 40, 3, 7, 2, (q, jj, B, H) => (q === 0 || q === B - 1 || jj === 0 ? FR('weiss') : (jj > H - 3 ? FR('blau') : (q === 1 ? FR('gelb') : FR('hellblau')))), ['seitenwaende'], 2);
    feld('kenotaph_altoviti', { u0: 46.5, u1: 49.5, w0: a.n - 1, w1: a.n + 4.5 }, 'u', 46.5, 3, 8, 2, M.rahmen((q, j, B, H) => (j > H - 4 ? T.bronze : T.ornament)), ['seitenwaende'], 2);    // Büsten von Karl dem Großen und Antonio Altoviti (Caccini)
  }

  // ---- Gegenfassade: Sinopia des Freskos von Paolo Schiavo über dem Portal, Weihwasserbecken von Rovezzano
  feld('schiavo_sinopia', { u0: 1, u1: 2.2, w0: 7.5, w1: 13.4 }, 'w', 7.5, 6, 3, 12, (q, jj, B, H) => (q === 0 || q === B - 1 || jj === 0 || jj === H - 1 ? T.holz : FR('braun')), ['fassade']);
  quader('weihwasserbecken', { u0: 3.2, u1: 4.2, w0: 14.2, w1: 15.2 }, 1, 1, T.weiss);

  // ---- Kirchenbänke im Mittelschiff (eine Lage hoch)
  for (let u = 9; u < 32; u += 2.7) {
    quader('kirchenbaenke', { u0: u, u1: u + 1, w0: 8, w1: 9.9 }, 1, 1, T.holz);
    quader('kirchenbaenke', { u0: u, u1: u + 1, w0: 11.1, w1: 13 }, 1, 1, T.holz);
  }
  void ersetze; void zellen; void key; void set; void cellsIn;
}

module.exports = { ausstatten };
