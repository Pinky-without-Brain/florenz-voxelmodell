'use strict';
// Ausstattung von Santi Michele e Gaetano (Modul 5): Kapellen mit Altarbildern, Querhauskapellen, Hochaltar mit Ziborium, Chor mit Gestühl und
// Kruzifix, Kuppelfresko, Orgel, Kanzel, Sakristei. Alles vereinfacht, nicht nach Vorbild (Katalog §3).
const K = require('../../../tools/wahrzeichen/kirche.js');
const WZ = require('../../../tools/wahrzeichen');

const FR = (n) => WZ.fresko(n);

function ausstatten(api) {
  const { D, set, ersetze, Y, T, zellen, key } = api;
  const C = require('./_sg.js');
  const { BAY_C, BAY, U_FASS, DOM } = C;
  const { cellsIn, quader, feld } = K.ausstatter(api);
  const M = K.malerei;

  // ---- Altäre in den sechs Kapellen (Mensa mit Kreuz und Kniebank)
  const ALT = (seite, k) => {
    const uc = BAY_C[k], tw = seite === 's' ? [2.8, 4.6] : [26.4, 28.2];
    quader('seitenaltaere', { u0: uc - 1.8, u1: uc + 1.8, w0: tw[0], w1: tw[1] }, 1, 2, T.weiss);
    quader('seitenaltaere', { u0: uc - 0.5, u1: uc + 0.5, w0: tw[0] + 0.2, w1: tw[1] - 0.2 }, 3, 5, T.gold);
    quader('seitenaltaere', { u0: uc - 2.4, u1: uc + 2.4, w0: seite === 's' ? 5.6 : 24.2, w1: seite === 's' ? 7 : 25.6 }, 1, 1, T.holz);
  };
  for (const k of [0, 1, 2]) { ALT('s', k); ALT('n', k); }
  const wandBild = (teil, seite, k, fn, B = 6, H = 9, j0 = 4) => {
    const uc = BAY_C[k];
    return feld(teil, { u0: uc - B / 2, u1: uc + B / 2, w0: seite === 's' ? 0.5 : 28.4, w1: seite === 's' ? 3.6 : 31.5 }, 'u', uc - B / 2, B, H, j0, fn, ['seitenwaende'], 2);
  };
  const gewBild = (teil, seite, k, fn) => {
    const uc = BAY_C[k];
    const r = { u0: uc - BAY / 2 + 1.2, u1: uc + BAY / 2 - 1.2, w0: seite === 's' ? 2.5 : 23.5, w1: seite === 's' ? 7.6 : 28.6 };
    for (const c of cellsIn(r)) {
      const e = zellen.get(key(c.x, Y(14), c.z));
      if (e && e.p === 'gewoelbe') ersetze(c.x, Y(14), c.z, fn(c), teil);
    }
  };
  // rechts (Norden), von der Gegenfassade zum Altar: Cappella del Rosso, Mazzei, Martelli
  wandBild('rosso_della_robbia', 'n', 0, M.tafel({ himmel: 'weiss', boden: 'weiss', gewand: ['blau', 'weiss'], motiv: 'figur' }));          // Andrea della Robbia, Madonna mit Kind (glasierte Terrakotta)
  wandBild('mazzei_vignali', 'n', 1, M.tafel({ himmel: 'hellblau', boden: 'braun', gewand: ['rot', 'blau', 'weiss'], motiv: 'gruppe' }));    // Vignali, San Michele befreit die Seelen
  gewBild('mazzei_gewoelbe_colonna', 'n', 1, (c) => ((Math.round(c.u) + Math.round(c.w)) % 3 === 0 ? FR('weiss') : FR('hellblau')));
  wandBild('martelli_rosselli', 'n', 2, M.tafel({ himmel: 'gelb', boden: 'braun', gewand: ['rot', 'blau', 'weiss'], motiv: 'gruppe' }));    // Rosselli 1640
  // Martelli-Grabmäler (Janssens 1750): zwei Marmorfelder mit Mikromosaik-Bildnis auf den Trennwänden
  for (const ub of [U_FASS + BAY * 2, U_FASS + BAY * 3]) {
    feld('martelli_grabmaeler', { u0: ub - 1.4, u1: ub + 1.4, w0: 24.5, w1: 29 }, 'w', 24.5, 4, 8, 3, M.rahmen((q, j, B, H) => (j > H - 3 && q > 0 && q < B - 1 ? FR('rot') : T.weiss)), ['kapellen_trennwaende']);
  }
  // links (Süden), von der Gegenfassade zum Altar: Cappella Tornaquinci, Franceschi, Ardinghelli
  wandBild('tornaquinci_zanobi', 's', 0, M.tafel({ himmel: 'hellblau', boden: 'gruen', gewand: ['weiss', 'gelb', 'rot'], motiv: 'figur' }));
  wandBild('franceschi_cortona', 's', 1, M.tafel({ himmel: 'orange', boden: 'braun', gewand: ['rot', 'schwarz', 'weiss'], motiv: 'gruppe' }));   // Pietro da Cortona, Martirio di San Lorenzo
  gewBild('franceschi_gewoelbe_colonna', 's', 1, (c) => ((Math.round(c.u / 2) + Math.round(c.w / 2)) % 3 === 0 ? FR('weiss') : FR('blau')));
  wandBild('ardinghelli_hugford', 's', 2, M.tafel({ himmel: 'gelb', boden: 'braun', gewand: ['weiss', 'rot', 'blau'], motiv: 'figur' }));        // Hugford, Morte di Sant'Andrea Avellino
  feld('ardinghelli_lippi', { u0: U_FASS + BAY * 3 - 1.4, u1: U_FASS + BAY * 3 + 1.4, w0: 2.5, w1: 7.6 }, 'w', 2.5, 5, 8, 3, M.tafel({ himmel: 'hellblau', boden: 'gruen', gewand: ['rot', 'weiss'], motiv: 'gruppe' }), ['kapellen_trennwaende']);   // Lippi-Fresken

  // ---- Querhaus: rechter Arm (Cappella della Natività), linker Arm (Cappella della Croce); Bildfelder an den Stirnwänden
  const quer = (teil, seite, u0, fn, B = 6) => feld(teil, { u0, u1: u0 + B, w0: seite === 's' ? -14.5 : 46.5, w1: seite === 's' ? -10 : 51.5 }, 'u', u0, B, 10, 4, fn, ['seitenwaende'], 2);
  quer('nativita_rosselli', 'n', 28, M.tafel({ himmel: 'hellblau', boden: 'braun', gewand: ['rot', 'blau', 'weiss'], motiv: 'geburt' }));        // Rosselli, Natività (1631)
  quer('visitazione_rosselli', 'n', 41.5, M.tafel({ himmel: 'hellblau', boden: 'gruen', gewand: ['blau', 'rot'], motiv: 'gruppe' }));           // Rosselli, Visitazione
  quer('kreuz_vignali', 's', 28, M.tafel({ himmel: 'hellblau', boden: 'braun', gewand: ['rot', 'blau', 'weiss'], motiv: 'kreuz' }));             // Vignali, Cappella della Croce
  quer('kreuz_bilivert', 's', 41.5, M.tafel({ himmel: 'gelb', boden: 'braun', gewand: ['weiss', 'rot'], motiv: 'gruppe' }));                  // Bilivert
  // Wappen des Kardinals Carlo de’ Medici (Pettirossi, 1631) im Gewölbe der Vierung
  for (const c of cellsIn({ u0: 36.5, u1: 41, w0: 13.5, w1: 17.5 })) {
    for (let yr = 31; yr >= 27; yr--) {                                                // oberste Gewölbezelle der Spalte
      const e = zellen.get(key(c.x, Y(yr), c.z));
      if (!e) continue;
      if (e.p === 'tonnengewoelbe') ersetze(c.x, Y(yr), c.z, (Math.abs(c.u - 38.75) < 1 && Math.abs(c.w - 15.5) < 1) ? FR('rot') : T.gold, 'medici_wappen');
      break;
    }
  }

  // ---- Hochaltar (Silvani, 1675) in der Apsis: Stufen, Balustrade (1669), Mensa, Ziborium aus Silber, gewölbte Rückwand aus bunten Marmoren
  {
    quader('hochaltar_silvani', { u0: 86, u1: 87, w0: 8.6, w1: 11.6 }, 1, 1, T.ornament);                            // Balustrade, in der Mitte offen
    quader('hochaltar_silvani', { u0: 86, u1: 87, w0: 19.4, w1: 22.4 }, 1, 1, T.ornament);
    quader('hochaltar_silvani', { u0: 91.5, u1: 94, w0: 10, w1: 21 }, 1, 1, T.ornament);                            // Stufe
    quader('hochaltar_silvani', { u0: 94, u1: 96.4, w0: 11.5, w1: 19.5 }, 1, 2, T.weiss);                            // Mensa
    quader('hochaltar_silvani', { u0: 95, u1: 96, w0: 14.5, w1: 16.5 }, 3, 6, T.ornament);                           // Ziborium (Silber, Petrucci)
    quader('hochaltar_silvani', { u0: 95, u1: 96, w0: 14.5, w1: 16.5 }, 7, 7, T.gold);
    feld('hochaltar_rueckwand', { u0: 96.5, u1: 100, w0: 8, w1: 23 }, 'w', 8, 15, 14, 1, (q, jj, B, H) => {          // Rückwand: Rosso di Francia, Lapislazuli, Verde Greco, Giallo
      const band = Math.floor(q / 3) % 4;
      return (q === 0 || q === B - 1 || jj === 0 || jj === H - 1) ? T.gold : [FR('rot'), FR('blau'), T.gruen, FR('gelb')][(band + (jj >> 2)) % 4];
    }, ['seitenwaende', 'seitenmassen'], 2);
  }

  // ---- Chor: Gestühl aus Nussholz, Kruzifix von Susini auf einem Steinsockel, Kuppelfresko von Galletti und Allegorien in den Pendentifs
  {
    for (const c of D.cells) {
      if (c.zone !== 'chor' || c.d8 <= 2 || c.w < 25.5 || c.w >= 27) continue;
      if ((c.u >= 54.5 && c.u < 59) || (c.u >= 65.5 && c.u < 75)) for (let j = 1; j <= 4; j++) set(c.x, Y(j), c.z, j === 4 ? T.gold : T.holz, 'chorgestuehl');
    }
    quader('susini_kruzifix', { u0: 72.5, u1: 75, w0: 13, w1: 18 }, 1, 1, T.serena);                                  // Steinsockel
    quader('susini_kruzifix', { u0: 73.6, u1: 74.4, w0: 15, w1: 16 }, 2, 9, T.bronze);                               // Kreuz: Stamm
    quader('susini_kruzifix', { u0: 73.6, u1: 74.4, w0: 14, w1: 17 }, 8, 8, T.bronze);                               // Balken
    for (const c of D.cells) {                                                                                         // Allegorien in den Ecken des Chors (Decke Lage 26)
      if (c.zone !== 'chor' || C.rDom(c) < DOM.ra) continue;
      const e = zellen.get(key(c.x, Y(26), c.z));
      if (!e || e.p !== 'gewoelbe') continue;
      const qd = (c.u < DOM.u ? 0 : 1) + (c.w < DOM.w ? 0 : 2);
      ersetze(c.x, Y(26), c.z, C.rDom(c) < DOM.ra + 1.4 ? T.gold : FR(['blau', 'rot', 'gruen', 'gelb'][qd]), 'pendentifs_galletti');
    }
    for (const c of D.cells) {
      if (c.zone !== 'chor') continue;
      const r = C.rDom(c);
      if (r >= DOM.ri) continue;
      const phi = Math.atan2(c.w - DOM.w, c.u - DOM.u);
      for (let yr = DOM.y1; yr <= DOM.y1 + 12; yr++) {
        const e = zellen.get(key(c.x, Y(yr), c.z));
        if (!e || e.p !== 'kuppel' || zellen.has(key(c.x, Y(yr - 1), c.z))) continue;
        const rr = Math.hypot(r, yr - DOM.y1) / DOM.ri;
        let t;
        if (rr < 0.15) t = T.gold;
        else if (rr < 0.6) t = (Math.floor(rr * 18 + phi * 3) % 4 === 0) ? FR('weiss') : (Math.floor(phi * 6 / Math.PI + rr * 8) % 3 === 0 ? FR('gelb') : FR('hellblau'));
        else t = ((Math.floor(phi * 12 / Math.PI) % 2) ? [FR('rot'), FR('blau'), FR('weiss'), FR('orange')][Math.abs(Math.floor(phi * 6 / Math.PI)) % 4] : FR('hellblau'));
        ersetze(c.x, Y(yr), c.z, t, 'kuppelfresko_galletti');
      }
    }
  }

  // ---- Orgel über dem Hauptportal (Tronci 1820 mit Resten einer Orgel von Colonna), Weihwasserbecken (Pieratti), Kanzel
  feld('orgel_tronci', { u0: 0.5, u1: 2.6, w0: 8.5, w1: 12.2 }, 'w', 8.5, 3, 14, 15, (q, jj, B, H) => (jj === 0 || jj === H - 1 || q === 0 || q === B - 1 ? T.gold : (q % 2 ? T.ornament : T.holz)), ['fassade'], undefined);
  feld('orgel_tronci', { u0: 0.5, u1: 2.6, w0: 18.8, w1: 22.5 }, 'w', 18.8, 3, 14, 15, (q, jj, B, H) => (jj === 0 || jj === H - 1 || q === 0 || q === B - 1 ? T.gold : (q % 2 ? T.ornament : T.holz)), ['fassade'], undefined);
  quader('weihwasserbecken', { u0: 3.2, u1: 4.2, w0: 10.6, w1: 11.6 }, 1, 1, T.weiss);
  quader('weihwasserbecken', { u0: 3.2, u1: 4.2, w0: 19.4, w1: 20.4 }, 1, 1, T.weiss);
  {
    const ku = U_FASS + BAY * 2, kw = 10.5;                                                                            // Kanzel zwischen der zweiten und dritten Kapelle links
    quader('kanzel', { u0: ku - 0.5, u1: ku + 0.5, w0: kw, w1: kw + 1 }, 1, 5, T.serena);
    quader('kanzel', { u0: ku - 1.5, u1: ku + 1.5, w0: kw - 0.3, w1: kw + 2.2 }, 6, 6, T.holz);
    for (const c of cellsIn({ u0: ku - 1.5, u1: ku + 1.5, w0: kw - 0.3, w1: kw + 2.2 })) if (Math.abs(c.u - ku) > 1.0 || c.w > kw + 1.4) set(c.x, Y(7), c.z, T.holz, 'kanzel');
  }

  // ---- Sakristei: Wandschränke aus Holz (in der Wand), Lavabo (Mochi 1611), Deckenfresko (Dandini); Möbel niedrig
  {
    for (const c of D.cells) {
      if (c.zone !== 'sakr_n' || c.d8 !== 2) continue;
      for (let j = 1; j <= 6; j++) {
        const e = zellen.get(key(c.x, Y(j), c.z));
        if (e && e.p === 'seitenwaende') ersetze(c.x, Y(j), c.z, (j === 1 || j === 6 || Math.round(c.u) % 4 === 0) ? T.gold : T.holz, 'sakristei_ausstattung');
      }
    }
    quader('sakristei_ausstattung', { u0: 56, u1: 58, w0: 31.2, w1: 32.2 }, 1, 1, T.weiss);                          // Lavabo
    for (const c of cellsIn({ u0: 58, u1: 70, w0: 32, w1: 40 })) {
      const e = zellen.get(key(c.x, Y(12), c.z));
      if (e && e.p === 'gewoelbe') ersetze(c.x, Y(12), c.z, (Math.round(c.u) + Math.round(c.w)) % 3 === 0 ? FR('weiss') : (Math.hypot(c.u - 64, c.w - 36) < 2.5 ? T.gold : FR('hellblau')), 'sakristei_ausstattung');
    }
  }

  // ---- Kirchenbänke im Mittelschiff (eine Lage hoch)
  for (let u = 6; u < 23; u += 2.7) {
    quader('kirchenbaenke', { u0: u, u1: u + 1, w0: 11, w1: 14.2 }, 1, 1, T.holz);
    quader('kirchenbaenke', { u0: u, u1: u + 1, w0: 16.8, w1: 20 }, 1, 1, T.holz);
  }
}

module.exports = { ausstatten };
