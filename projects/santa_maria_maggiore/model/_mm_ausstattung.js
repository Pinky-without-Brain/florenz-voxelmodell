'use strict';
// Ausstattung von Santa Maria Maggiore (Modul 5): Altäre und Bilder der Seitenkapellen, Hochaltar im Presbyterium, Orgel, Cantoria an der Gegenfassade,
// Madonna des Coppo di Marcovaldo mit den Grabmälern, Kopf der Berta am Campanile-Stumpf. Alles vereinfacht, nicht nach Vorbild (Katalog §3).
const K = require('../../../tools/wahrzeichen/kirche.js');
const WZ = require('../../../tools/wahrzeichen');

const FR = (n) => WZ.fresko(n);

function ausstatten(api) {
  const { D, set, ersetze, Y, T, zellen, key } = api;
  const C = require('./_mm.js');
  const { bayMitte, W_MITTE } = C;
  const { cellsIn, quader, feld } = K.ausstatter(api);
  const M = K.malerei;
  const aussen = (u) => D.aussen.get(Math.round(u)) || { n: 6, s: 47 };

  // ---- Altäre der Kapellen (Seitenschiffe): Mensa mit Kreuz und Kniebank an der Außenwand
  const altar = (seite, u, teil = 'seitenaltaere') => {
    const a = aussen(u);
    const w0 = seite === 'n' ? a.n + 2.4 : a.s - 3.4;
    quader(teil, { u0: u - 1.8, u1: u + 1.8, w0, w1: w0 + 1.6 }, 1, 2, T.weiss);
    quader(teil, { u0: u - 0.5, u1: u + 0.5, w0: w0 + 0.3, w1: w0 + 1.3 }, 3, 5, T.gold);
    const kw = seite === 'n' ? w0 + 2.6 : w0 - 2.2;
    quader(teil, { u0: u - 2.2, u1: u + 2.2, w0: kw, w1: kw + 1.2 }, 1, 1, T.holz);
  };
  const bild = (teil, seite, u, fn, B = 6, H = 9, j0 = 4) => {
    const a = aussen(u);
    const r = seite === 'n' ? { u0: u - B / 2, u1: u + B / 2, w0: a.n - 1, w1: a.n + 4 } : { u0: u - B / 2, u1: u + B / 2, w0: a.s - 4, w1: a.s + 1.5 };
    return feld(teil, r, 'u', u - B / 2, B, H, j0, fn, ['seitenwaende'], 2);
  };
  const gewBild = (teil, seite, u, fn) => {
    for (const c of cellsIn({ u0: u - 4, u1: u + 4, w0: seite === 'n' ? 0 : 38, w1: seite === 'n' ? 17.5 : 52 })) {
      if (c.zone !== (seite === 'n' ? 'sch_n' : 'sch_s') || c.d8 <= 2) continue;
      for (let yr = 24; yr >= 15; yr--) {
        const e = zellen.get(key(c.x, Y(yr), c.z));
        if (!e) continue;
        if (e.p === 'kreuzgewoelbe') ersetze(c.x, Y(yr), c.z, fn(c), teil);
        break;
      }
    }
  };
  // Süden (rechts): Panciatichi, Orlandini del Beccuto, zwei weitere Altäre, Carnesecchi (Zanobi)
  altar('s', bayMitte(0)); altar('s', bayMitte(1)); altar('s', bayMitte(2)); altar('s', bayMitte(3)); altar('s', 52.8);
  bild('panciatichi_pugliani', 's', bayMitte(0), M.tafel({ himmel: 'hellblau', boden: 'braun', gewand: ['rot', 'blau', 'weiss'], motiv: 'gruppe' }));       // Pugliani, Kommunion der Maria Magdalena (1636)
  bild('orlandini_santa_rita', 's', bayMitte(1), M.tafel({ himmel: 'gelb', boden: 'braun', gewand: ['schwarz', 'weiss'], motiv: 'figur' }));                  // Primo Conti, Santa Rita da Cascia (1949)
  bild('carnesecchi_dandini', 's', 52.8, M.tafel({ himmel: 'orange', boden: 'gruen', gewand: ['braun', 'weiss'], motiv: 'figur' }), 6, 9, 4);               // Dandini, Stigmata des heiligen Franziskus
  gewBild('carnesecchi_poccetti', 's', 52.8, (c) => ((Math.round(c.u) + Math.round(c.w)) % 4 === 0 ? T.gold : (Math.round(c.u / 2) % 2 ? FR('blau') : FR('weiss'))));   // Poccetti, Fries im Gewölbe
  for (const du of [-4.2, 4.2]) {                                                                                                                           // Statuen von Caccini: zwei weiße Figuren in der Wand
    const a = aussen(52.8);
    quader('carnesecchi_caccini', { u0: 52.8 + du - 0.5, u1: 52.8 + du + 0.5, w0: a.s - 3.6, w1: a.s - 2.6 }, 1, 4, (c, j) => (j === 4 ? FR('orange') : T.weiss));
  }
  // Norden (links): erste Kapelle ist der Campanile-Stumpf; Boni, Carnesecchi (1406), Orlandini, Carnesecchi (1449, links vom Chor)
  altar('n', bayMitte(1)); altar('n', bayMitte(2)); altar('n', bayMitte(3)); altar('n', 52.8);
  bild('boni_rosselli', 'n', bayMitte(1), M.tafel({ himmel: 'hellblau', boden: 'gruen', gewand: ['braun', 'weiss', 'blau'], motiv: 'gruppe' }));          // Rosselli (1634)
  bild('carnesecchi_marinari', 'n', bayMitte(2), M.tafel({ himmel: 'hellblau', boden: 'braun', gewand: ['blau', 'rot', 'weiss'], motiv: 'figur' }));      // Marinari (1672 bis 1674)
  gewBild('orlandini_volterrano', 'n', bayMitte(3), (c) => ((Math.round(c.u) + Math.round(c.w)) % 3 === 0 ? FR('weiss') : (Math.hypot(c.u - bayMitte(3), c.w - 9.5) < 3 ? T.gold : FR('orange'))));   // Volterrano, Himmelfahrt des Elija
  // Coppo di Marcovaldo zugeschrieben: Madonna als vergoldetes Relief über dem Altar der Kapelle links vom Chor (Ostwand)
  feld('coppo_madonna', { u0: 56.5, u1: 60, w0: 5, w1: 15 }, 'w', 5.5, 9, 10, 4, (q, jj, B, H) => {
    if (q === 0 || q === B - 1 || jj === 0 || jj === H - 1) return T.holz;
    const cx = (B - 1) / 2, dx = Math.abs(q - cx);
    if (jj >= H - 4 && dx <= 1) return jj === H - 3 ? FR('orange') : T.gold;                                       // Kopf mit Nimbus
    if (jj < H - 4 && dx <= 2) return jj < 3 ? FR('blau') : FR('rot');                                             // Mantel und Gewand
    return T.gold;                                                                                                // Goldgrund
  }, ['seitenwaende'], 2);
  {
    const a = aussen(52.8);                                                                                        // Grabmal des Brunetto Latini und Sarkophag im Stil des Tino di Camaino an der Nordwand
    quader('brunetto_latini', { u0: 49, u1: 52, w0: a.n + 2.2, w1: a.n + 4 }, 1, 1, T.ornament);
    quader('brunetto_latini', { u0: 53.6, u1: 56.6, w0: a.n + 2.2, w1: a.n + 4 }, 1, 1, T.weiss);
    feld('brunetto_latini', { u0: 49, u1: 52, w0: a.n - 1, w1: a.n + 4 }, 'u', 49, 3, 5, 3, (q, jj, B, H) => (q === 0 || q === B - 1 || jj === 0 || jj === H - 1 ? T.gold : T.ornament), ['seitenwaende'], 2);
  }

  // ---- Gegenfassade (Pietra serena, 1595/96) mit Cantoria aus Marmor über dem Portal und Resten der Orgel
  feld('cantoria', { u0: 1, u1: 2.2, w0: 22, w1: 33 }, 'w', 22, 11, 3, 17, (q, jj, B, H) => (jj === 0 || jj === H - 1 ? T.gold : (q % 2 ? T.ornament : T.weiss)), ['fassade']);

  // ---- Presbyterium: neugotischer Hochaltar aus Stein, Fresken von Jacopo di Cione an den Seitenwänden; Chor: Mascioni-Orgel hinter dem Altar
  {
    const ua = 41;
    quader('hochaltar', { u0: ua - 1.6, u1: ua + 1.6, w0: W_MITTE - 4.4, w1: W_MITTE + 4.4 }, 3, 3, T.weiss);       // Mensa auf dem Podest (Stehfläche Lage 3)
    quader('hochaltar', { u0: ua + 0.8, u1: ua + 1.6, w0: W_MITTE - 4.4, w1: W_MITTE + 4.4 }, 4, 6, T.serena);       // Retabel
    for (const dw of [-3.6, -1.2, 1.2, 3.6]) quader('hochaltar', { u0: ua + 0.8, u1: ua + 1.6, w0: W_MITTE + dw - 0.4, w1: W_MITTE + dw + 0.4 }, 7, 9, T.serena);   // Fialen
    quader('hochaltar', { u0: ua - 0.4, u1: ua + 0.4, w0: W_MITTE - 0.5, w1: W_MITTE + 0.5 }, 4, 6, T.gold);         // Altarkreuz
    const fresko = (q, jj, B, H) => ((q === 0 || q === B - 1 || jj === 0 || jj === H - 1) ? T.gold : (jj < 3 ? FR('braun') : ((q + (jj >> 1)) % 5 === 0 ? FR('rot') : (q % 4 === 0 ? FR('weiss') : FR('hellblau')))));
    feld('cione_fresken', { u0: 34.5, u1: 44.5, w0: 18.4, w1: 20 }, 'u', 34.5, 10, 9, 18, fresko, ['obergaden'], undefined);        // Geschichten des Herodes
    feld('cione_fresken', { u0: 34.5, u1: 44.5, w0: 35, w1: 36.6 }, 'u', 34.5, 10, 9, 18, fresko, ['obergaden'], undefined);       // Kindermord
    feld('spinello_fragment', { u0: 47, u1: 51, w0: 18.4, w1: 20 }, 'u', 47, 4, 5, 18, (q, jj, B, H) => (q === 0 || q === B - 1 || jj === 0 || jj === H - 1 ? T.holz : FR(jj < 2 ? 'braun' : 'gruen')), ['obergaden'], undefined);   // Fragment des Spinello Aretino
    feld('orgel_mascioni', { u0: 56.4, u1: 60, w0: 20.5, w1: 34.5 }, 'w', 20.5, 14, 17, 5, (q, jj, B, H) => (jj === 0 || jj === H - 1 || q === 0 || q === B - 1 ? T.gold : (q % 2 ? T.ornament : T.holz)), ['seitenwaende'], 2);   // Orgel Opus 893 (1967)
  }

  // ---- Berta: Kopf aus einem römischen Grabmal am Campanile-Stumpf (Seite zur Via dei Cerretani)
  {
    let best = null, bd = Infinity;
    for (const c of D.cells) {
      if (c.zone !== 'turm' || c.d8 !== 1 || c.w > 13) continue;
      const d = Math.hypot(c.u - 6, c.w - 7);
      if (d < bd) { bd = d; best = c; }
    }
    if (best) for (const [dx, dz] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const n = api.zelleBei(best.x + dx, best.z + dz);
      if (n && n.zone === 'turm' && n.d8 === 1) { ersetze(n.x, Y(6), n.z, T.weiss, 'berta_kopf'); ersetze(n.x, Y(7), n.z, T.ornament, 'berta_kopf'); }
    }
  }

  // ---- Kirchenbänke im Mittelschiff (eine Lage hoch)
  for (let u = 15; u < 31; u += 2.7) {
    quader('kirchenbaenke', { u0: u, u1: u + 1, w0: 21.2, w1: 25 }, 1, 1, T.holz);
    quader('kirchenbaenke', { u0: u, u1: u + 1, w0: 30, w1: 33.8 }, 1, 1, T.holz);
  }
}

module.exports = { ausstatten };
