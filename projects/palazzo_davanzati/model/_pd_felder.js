'use strict';
// Räume des Palazzo Davanzati im Einzelnen (Teile in Modul 5: Piano nobile, Modul 6: obere Geschosse, EG, Altana).
// Inhalte nach it.wikipedia (Palazzo Davanzati) und der Museumsbeschreibung; Muster frei vereinfacht (Stufe B/C).
const WZ = require('../../../tools/wahrzeichen');

module.exports = function raeume(api) {
  const { P, T, FR, TR, feld, block, quader, tisch, stuhl, kamin, bett, rahmen, farbe } = api;
  const tile = (zeilen, a, b, grundfarbe) => {              // Muster als Textzeilen (oberste Zeile zuerst), Zeichen -> Farbe
    const h = zeilen.length, w = zeilen[0].length;
    const ch = zeilen[h - 1 - (b % h)][a % w];
    return ch === '.' ? grundfarbe : farbe(ch);
  };
  const sockel = (name, i, seite, teil, j1 = 2) => feld(name, i, seite, 1, j1, () => T.holz, teil);
  const alleSeiten = ['n', 's', 'w', 'o'];

  // ---------------------------------------------------------------- Modul 5: Piano nobile
  // Sala Madornale (1. Stock, Straßenseite, fünf Fenster): Deckenbalken, Wappenfries, langer Tisch, Kamin
  {
    const teil = 'sala_madornale';
    for (const s of alleSeiten) sockel('N', 1, s, teil);
    const FARBEN = ['rot', 'blau', 'gelb', 'gruen'];
    for (const s of alleSeiten) {
      feld('N', 1, s, 8, 9, (a, b) => {
        const k = Math.floor(a / 7), x = a % 7;
        if (x >= 5) return null;
        if (b === 0 || x === 0 || x === 4) return T.gold;
        return FR(FARBEN[k % 4]);
      }, teil);
    }
    for (const s of ['w', 'o']) {
      feld('N', 1, s, 3, 7, (a, b) => {
        if (rahmen(a % 8, b, 8, 5)) return T.gold;
        return ((Math.floor(a / 8) + (a % 8 > 3 ? 1 : 0)) & 1) ? FR('rot') : FR('weiss');
      }, teil);
    }
    for (let u = 8; u <= 32; u += 4) for (let w = 3; w <= 12; w++) block(teil, u, w, 1, 9, T.holz, 'N');
    tisch(teil, 'N', 1, 12, 24, 7, 8);
    for (let u = 12; u <= 24; u += 2) { stuhl(teil, 'N', 1, u, 6, 'n'); stuhl(teil, 'N', 1, u, 9, 's'); }
    kamin(teil, 'N', 1, 3, 7, 'w');
  }
  // Sala dei Pappagalli (1. Stock): Wandmalerei im Stil eines Wirkteppichs mit Papageien in Rautenfeldern
  {
    const teil = 'sala_pappagalli';
    const PAPAGEI = ['ggrrgg', 'grooyg', 'rwbwor', 'gryory', 'ggrrgg', 'gggggg'];
    for (const s of alleSeiten) {
      sockel('W1', 1, s, teil);
      feld('W1', 1, s, 3, 8, (a, b) => tile(PAPAGEI, a + (b >= 6 ? 3 : 0), b, FR('gruen')), teil);
    }
    tisch(teil, 'W1', 1, 6, 9, 19, 23);
    for (let w = 19; w <= 23; w += 2) { block(teil, 5, w, 1, 1, TR('holz', 'o'), 'W1'); block(teil, 10, w, 1, 1, TR('holz', 'w'), 'W1'); }
  }
  // Studiolo: Holztäfelung, Tafelbilder (Scheggia), Schreibtisch und Bücherwand
  {
    const teil = 'studiolo';
    for (const s of alleSeiten) feld('W2', 1, s, 1, 4, () => T.holz, teil);
    feld('W2', 1, 's', 6, 9, (a, b) => (a % 8 < 6 ? (rahmen(a % 8, b, 6, 4) ? T.gold : FR(['orange', 'hellblau', 'gruen'][Math.floor(a / 8) % 3])) : null), teil);
    feld('W2', 1, 'w', 6, 9, (a, b) => (a % 8 < 6 ? (rahmen(a % 8, b, 6, 4) ? T.gold : FR('braun')) : null), teil);
    quader(teil, 'W2', 1, 4, 5, 37, 40, 3, 3, T.holz);
    for (const w of [37, 40]) { block(teil, 4, w, 1, 1, T.holz, 'W2'); block(teil, 4, w, 1, 2, T.holz, 'W2'); }
    block(teil, 7, 38, 1, 1, TR('holz', 'w'), 'W2');
    for (let u = 7; u <= 12; u++) for (let j = 1; j <= 4; j++) block(teil, u, 41, 1, j, j % 2 ? T.holz : FR('braun'), 'W2');
  }
  // Sala dei Pavoni (Schlafzimmer): Pfauen, geometrischer Wirkteppich, Fries mit den Wappen verbündeter Familien
  {
    const teil = 'sala_pavoni';
    const PFAU = ['.gygygy.', 'gygygygy', '.gyssgy.', '..hssh..', '...ss...', '...ss...', '...k.k..'];
    const RAUTE = ['wbwb', 'bwbw'];
    for (const s of alleSeiten) {
      sockel('S', 1, s, teil);
      feld('S', 1, s, 8, 9, (a, b) => {
        const x = a % 6;
        if (x >= 4) return null;
        return (b === 0 || x === 0 || x === 3) ? T.gold : FR(['rot', 'blau', 'gelb', 'gruen'][Math.floor(a / 6) % 4]);
      }, teil);
    }
    feld('S', 1, 's', 2, 8, (a, b) => {
      const ch = PFAU[PFAU.length - 1 - (b % PFAU.length)][a % 8];
      if (ch === '.') return FR('hellblau');
      if (ch === 's') return FR('blau');
      return farbe(ch);
    }, teil);
    for (const s of ['w', 'o', 'n']) feld('S', 1, s, 3, 7, (a, b) => tile(RAUTE, a, b, FR('weiss')), teil);
    bett(teil, 'S', 1, 16, 38, 'u');
  }

  // ---------------------------------------------------------------- Modul 6: obere Geschosse, EG, Altana
  // Camera della Castellana di Vergy (2. Stock): Bildfries nach dem Roman der Dame von Vergy
  {
    const teil = 'camera_castellana';
    for (const s of alleSeiten) sockel('N', 2, s, teil);
    for (const s of alleSeiten) {
      feld('N', 2, s, 4, 8, (a, b) => {
        const x = a % 8, k = Math.floor(a / 8);
        if (x === 0 || x === 7 || b === 0 || b === 4) return T.gold;
        const ib = b - 1, ix = x - 1;                      // Bildfeld 6 x 3
        const burg = 1 + (k * 2) % 4;
        if (ib === 0) return (ix === 1 || ix === 3) && k % 2 === 0 ? FR('blau') : FR('gruen');
        if (ix >= burg && ix <= burg + 1) return ib === 2 ? FR('weiss') : FR('braun');
        if (ib === 1 && ix === 0) return FR('rot');
        return FR('hellblau');
      }, teil);
    }
    bett(teil, 'N', 2, 28, 4, 'u');
    quader(teil, 'N', 2, 22, 25, 4, 5, 1, 1, T.holz);
    quader(teil, 'N', 2, 22, 25, 4, 4, 2, 2, T.gold);
    feld('N', 2, 'o', 4, 6, (a, b) => (a >= 6 && a <= 8 ? (rahmen(a - 6, b, 3, 3) ? T.gold : FR('orange')) : null), teil);
  }
  // Camera delle Impannate (3. Stock): gemalte Draperie, Bett, Truhe
  {
    const teil = 'camera_impannate';
    for (const s of alleSeiten) {
      sockel('N', 3, s, teil);
      feld('N', 3, s, 3, 9, (a, b) => (Math.floor(a / 2) & 1 ? FR('weiss') : (b === 6 ? T.gold : FR('rot'))), teil);
    }
    bett(teil, 'N', 3, 28, 4, 'u');
    quader(teil, 'N', 3, 22, 24, 4, 5, 1, 2, T.holz);
    tisch(teil, 'N', 3, 8, 12, 7, 8);
  }
  // Küche im obersten Geschoss: gemauerter Herd mit Rauchfang, Tisch, Teigtrog, Regale mit Kupfergerät
  {
    const teil = 'kueche';
    quader(teil, 'S', 3, 18, 23, 40, 41, 1, 1, T.forte);
    for (const u of [18, 23]) for (let j = 2; j <= 6; j++) block(teil, u, 41, 3, j, T.forte, 'S');
    for (let u = 18; u <= 23; u++) { block(teil, u, 41, 3, 7, T.forte, 'S'); block(teil, u, 40, 3, 7, T.forte, 'S'); for (const j of [8, 9]) block(teil, u, 41, 3, j, T.forte, 'S'); }
    for (const u of [19, 21]) block(teil, u, 41, 3, 4, T.bronze, 'S');
    tisch(teil, 'S', 3, 16, 20, 34, 35);
    quader(teil, 'S', 3, 24, 26, 37, 39, 1, 2, T.holz);
    for (let w = 32; w <= 36; w++) { block(teil, 26, w, 3, 3, T.holz, 'S'); block(teil, 26, w, 3, 4, w % 2 ? T.bronze : T.holz, 'S'); }
    block(teil, 15, 38, 3, 1, T.bronze, 'S');
  }
  // Altana: Bänke zwischen den Pfeilern, Pflanzkübel, Wappen an der Rückwand
  {
    const teil = 'altana_ausstattung';
    for (let u = 4; u <= 13; u++) block(teil, u, 12, 4, 1, TR('holz', 'n'), 'N');
    for (let u = 20; u <= 32; u++) block(teil, u, 12, 4, 1, TR('holz', 'n'), 'N');
    for (const u of [6, 18, 30]) { block(teil, u, 5, 4, 1, T.antik, 'N'); block(teil, u, 5, 4, 2, WZ.typ('gruen_rasen'), 'N'); }
    for (const u0 of [8, 24]) feld('N', 4, 's', 3, 6, (a, b) => (a >= u0 - 3 && a <= u0 + 1 ? (rahmen(a - (u0 - 3), b, 5, 4) ? T.gold : FR('rot')) : null), teil);
  }
  // Androne (Eingangshalle): Steinbänke unter der Fassade
  {
    const teil = 'androne';
    for (const [u0, u1] of [[3, 4], [12, 14], [22, 24], [32, 33]]) for (let u = u0; u <= u1; u++) block(teil, u, 3, 0, 1, T.serena, 'N');
  }
};
