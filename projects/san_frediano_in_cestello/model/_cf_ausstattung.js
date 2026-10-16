'use strict';
// Ausstattung von San Frediano in Cestello (Modul 5): Kapellen mit Altarbildern und Fresken, Querhausbilder, Hochaltar mit Paliotto,
// Orgel, Kuppelfresko und Pendentif-Tugenden, Chorgestühl, Bänke. Alles vereinfacht, nicht nach Vorbild (Katalog §3).
const K = require('../../../tools/wahrzeichen/kirche.js');
const WZ = require('../../../tools/wahrzeichen');

const FR = (n) => WZ.fresko(n);
const mod = K.mod;

function ausstatten(api) {
  const { D, set, ersetze, Y, T, zellen, key, unzug } = api;
  const C = require('./_cf.js');
  const { BAY_C, BAY, U_FASS, DOM } = C;
  const { cellsIn, quader, feld } = K.ausstatter(api);
  const M = K.malerei;

  // ---- Seitenaltäre in den acht Kapellen; benannte Kapellen mit Bildern (it.wikipedia)
  const ALT = (seite, k) => {
    const uc = BAY_C[k], tw = seite === 'w' ? [3.4, 5.4] : [48.6, 50.6];
    quader('seitenaltaere', { u0: uc - 2, u1: uc + 2, w0: tw[0], w1: tw[1] }, 1, 2, T.weiss);                             // Mensa mit Aufsatz
    quader('seitenaltaere', { u0: uc - 0.5, u1: uc + 0.5, w0: tw[0] + 0.2, w1: tw[1] - 0.2 }, 3, 5, T.gold);          // Altarkreuz
    quader('seitenaltaere', { u0: uc - 3, u1: uc + 3, w0: seite === 'w' ? 6.8 : 45.6, w1: seite === 'w' ? 8.2 : 47 }, 1, 1, T.holz);   // Kniebank
  };
  for (const k of [0, 1, 2, 3]) { ALT('w', k); ALT('o', k); }
  const wandBild = (teil, seite, k, fn, B = 7, H = 9, j0 = 4) => {
    const uc = BAY_C[k];
    return feld(teil, { u0: uc - B / 2, u1: uc + B / 2, w0: seite === 'w' ? 1 : 50, w1: seite === 'w' ? 3.6 : 53 }, 'u', uc - B / 2, B, H, j0, fn, ['seitenwaende'], 2);
  };
  const gewBild = (teil, seite, k, fn) => {              // Fresko auf dem Kapellengewölbe (Lage der Decke)
    const uc = BAY_C[k], lage = 14;
    const r = { u0: uc - BAY / 2 + 1.2, u1: uc + BAY / 2 - 1.2, w0: seite === 'w' ? 2.5 : 44, w1: seite === 'w' ? 9.4 : 51.5 };
    for (const c of cellsIn(r)) {
      const e = zellen.get(key(c.x, Y(lage), c.z));
      if (!e || e.p !== 'gewoelbe') continue;
      ersetze(c.x, Y(lage), c.z, fn(c), teil);
    }
  };
  // rechts: erste Kapelle (Maria Maddalena de' Pazzi): Sagrestani, Estasi della Santa (1702); Gewölbe von Bonechi
  wandBild('maddalena_sagrestani', 'o', 0, M.tafel({ himmel: 'gelb', boden: 'weiss', gewand: ['braun', 'weiss', 'rot'], motiv: 'himmel' }));
  gewBild('maddalena_gewoelbe_bonechi', 'o', 0, (c) => ((Math.round(c.u) + Math.round(c.w)) % 3 === 0 ? FR('weiss') : (Math.hypot(c.u - BAY_C[0], c.w - 47.7) < 1.6 ? T.gold : FR('hellblau'))));
  // rechts: dritte Kapelle: Gherardini, Natività della Vergine (1694), Gewölbefresken
  wandBild('gherardini_nativita', 'o', 2, M.tafel({ himmel: 'orange', boden: 'braun', gewand: ['rot', 'blau', 'weiss'], motiv: 'geburt' }));
  gewBild('gherardini_gewoelbe', 'o', 2, (c) => ((Math.round(c.u / 2) + Math.round(c.w / 2)) % 3 === 0 ? FR('weiss') : FR('blau')));
  // links: zweite Kapelle (Johannes der Täufer): Franchi, Battesimo di Cristo (1706)
  wandBild('franchi_taufe', 'w', 1, M.tafel({ himmel: 'hellblau', boden: 'gruen', gewand: ['braun', 'weiss'], motiv: 'taufe' }));
  // links: dritte Kapelle (San Bernardo): Fresken von Dandini (1688/89) auf den Trennwänden, Madonna del sorriso aus Holz
  for (const ub of [U_FASS + BAY * 2, U_FASS + BAY * 3]) {
    feld('bernardo_dandini', { u0: ub - 1.4, u1: ub + 1.4, w0: 3.4, w1: 9.2 }, 'w', 3.4, 5, 7, 3, M.tafel({ himmel: 'hellblau', boden: 'gruen', gewand: ['weiss', 'braun', 'schwarz'], motiv: 'gruppe' }), ['kapellen_trennwaende']);
  }
  {
    const uc = BAY_C[2];
    quader('bernardo_dandini', { u0: uc - 0.5, u1: uc + 0.5, w0: 4, w1: 5 }, 3, 3, T.gold);                          // Sockel
    quader('bernardo_dandini', { u0: uc - 0.5, u1: uc + 0.5, w0: 4, w1: 5 }, 4, 5, FR('blau'));                      // Madonna (vergoldet und bemalt)
    quader('bernardo_dandini', { u0: uc - 0.5, u1: uc + 0.5, w0: 4, w1: 5 }, 6, 6, FR('orange'));
  }
  // links: letzte Kapelle (Sant Anastasio): Ciabilli
  wandBild('anastasio_ciabilli', 'w', 3, M.tafel({ himmel: 'gelb', boden: 'braun', gewand: ['rot', 'weiss', 'blau'], motiv: 'figur' }));

  // ---- Querhaus: Curradi (rechts, Madonna in gloria e santi), Sellaio (links, Kreuzigung und Martyrium des Laurentius)
  feld('curradi_madonna', { u0: 54.6, u1: 66.6, w0: 50, w1: 53 }, 'u', 54.6, 12, 10, 4, M.tafel({ himmel: 'hellblau', boden: 'braun', gewand: ['blau', 'rot', 'weiss'], motiv: 'gruppe' }), ['seitenwaende'], 2);
  feld('sellaio_kreuzigung', { u0: 54.6, u1: 66.6, w0: 1, w1: 3.6 }, 'u', 54.6, 12, 10, 4, M.tafel({ himmel: 'hellblau', boden: 'gruen', gewand: ['rot', 'blau', 'weiss'], motiv: 'kreuz' }), ['seitenwaende'], 2);

  // ---- Hochaltar (18. Jh.) mit Paliotto aus Marmorintarsien (Piamontini, 1717)
  {
    const ua = 92, uu = 96;
    quader('hochaltar_piamontini', { u0: ua - 1.4, u1: ua, w0: 21, w1: 32.4 }, 1, 1, T.ornament);                          // Stufe
    quader('hochaltar_piamontini', { u0: ua, u1: ua + 1.2, w0: 22.2, w1: 31.2 }, 1, 2, (c, j) => {                         // Paliotto: Intarsien vor dem Altartisch
      const q = Math.floor(c.w - 22.2);
      return (q + j) % 3 === 0 ? T.rot : (q + j) % 3 === 1 ? T.gruen : T.ornament;
    });
    quader('hochaltar_piamontini', { u0: ua + 1.2, u1: uu, w0: 22.2, w1: 31.2 }, 1, 2, T.weiss);                          // Altartisch
    quader('hochaltar_piamontini', { u0: uu - 0.6, u1: uu, w0: 25.2, w1: 28.2 }, 3, 6, T.gold);                           // Tabernakel
    quader('hochaltar_piamontini', { u0: uu - 0.6, u1: uu, w0: 26.2, w1: 27.2 }, 7, 8, T.weiss);
    quader('hochaltar_piamontini', { u0: ua + 1.4, u1: ua + 2.4, w0: 22.4, w1: 23.4 }, 3, 4, T.gold);                     // Leuchter
    quader('hochaltar_piamontini', { u0: ua + 1.4, u1: ua + 2.4, w0: 30, w1: 31 }, 3, 4, T.gold);
    for (const c of D.cells) {                                                                                             // Chorgestühl an den Wänden des Chors
      if (c.zone !== 'chor' || c.u < 98) continue;
      if (c.d8 === 3 && Math.abs(c.w - 26.7) > 3) for (let j = 1; j <= 4; j++) set(c.x, Y(j), c.z, j === 4 ? T.gold : T.holz, 'chorgestuehl');
      else if (c.d8 === 4 && Math.abs(c.w - 26.7) > 3) set(c.x, Y(1), c.z, T.holz, 'chorgestuehl');
    }
  }

  // ---- Orgel (Antonio und Filippo Tronci, 1768; seit 1818 hier): Prospekt über einem Pfeiler der rechten Kapellenlinie (Lage Stufe C)
  {
    const pu = U_FASS + BAY * 2;
    feld('orgel_tronci', { u0: pu - 2.4, u1: pu + 2.4, w0: 41.8, w1: 42.9 }, 'u', pu - 2.4, 4, 9, 12, (q, jj, B, H) => (jj === 0 || jj === H - 1 || q === 0 || q === B - 1 ? T.gold : (q % 2 ? T.ornament : T.holz)), ['arkaden', 'obergaden']);
  }

  // ---- Pendentif-Tugenden (Bonechi) in den vier Ecken unter dem Tambour und Kuppelfresko (Gabbiani, 1702 bis 1718)
  {
    const tug = ['blau', 'rot', 'gruen', 'gelb'];
    for (const c of D.cells) {
      if (c.zone !== 'vierung') continue;
      const r = C.rDom(c);
      if (r < DOM.ra) continue;
      const e = zellen.get(key(c.x, Y(31), c.z));
      if (!e || e.p !== 'tonnengewoelbe') continue;
      const qd = (c.u < DOM.u ? 0 : 1) + (c.w < DOM.w ? 0 : 2);
      const d = Math.hypot(c.u - (qd & 1 ? 71.2 : 50), c.w - (qd & 2 ? 37.5 : 15.9));
      ersetze(c.x, Y(31), c.z, d < 1.6 ? T.gold : d < 3.4 ? FR(tug[qd]) : (r < DOM.ra + 1.2 ? T.gold : FR('weiss')), 'pendentifs_tugenden');
    }
    for (const c of D.cells) {
      if (c.zone !== 'vierung') continue;
      const r = C.rDom(c);
      if (r >= DOM.ri) continue;
      const phi = Math.atan2(c.w - DOM.w, c.u - DOM.u);
      for (let yr = 44; yr <= 62; yr++) {
        const e = zellen.get(key(c.x, Y(yr), c.z));
        if (!e || e.p !== 'kuppel' || zellen.has(key(c.x, Y(yr - 1), c.z))) continue;
        const rr = Math.hypot(r, yr - DOM.y1) / DOM.ri;            // 0 im Scheitel, 1 am Tambour
        let t;
        if (rr < 0.12) t = T.gold;                                  // Glorie der Magdalena im Zenit
        else if (rr < 0.6) t = (Math.floor(rr * 20 + phi * 3) % 4 === 0) ? FR('weiss') : (Math.floor(phi * 6 / Math.PI + rr * 8) % 3 === 0 ? FR('gelb') : FR('hellblau'));
        else t = ((Math.floor(phi * 16 / Math.PI) % 2) ? [FR('rot'), FR('blau'), FR('weiss'), FR('orange')][Math.abs(Math.floor(phi * 8 / Math.PI)) % 4] : FR('hellblau'));   // Heilige und Wolken am Rand
        ersetze(c.x, Y(yr), c.z, t, 'kuppelfresko_gabbiani');
      }
    }
  }

  // ---- Kirchenbänke im Schiff (eine Lage hoch)
  for (let u = 8; u < 38; u += 2.7) {
    quader('kirchenbaenke', { u0: u, u1: u + 1, w0: 14.6, w1: 21.4 }, 1, 1, T.holz);
    quader('kirchenbaenke', { u0: u, u1: u + 1, w0: 32, w1: 38.8 }, 1, 1, T.holz);
  }

  // ---- Nebenräume: Sakristei (links), Raum rechts neben dem Campanile; je ein Tisch und Truhen (Möbel eine Lage hoch, Stufe C)
  quader('nebenraeume', { u0: 94, u1: 98, w0: 4.6, w1: 6.2 }, 1, 1, T.holz);
  quader('nebenraeume', { u0: 98, u1: 100, w0: 47.4, w1: 49 }, 1, 1, T.holz);
}

module.exports = { ausstatten };
