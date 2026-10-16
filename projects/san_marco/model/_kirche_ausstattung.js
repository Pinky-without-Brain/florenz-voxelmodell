'use strict';
// Ausstattung der Basilica di San Marco (Modul 10): Seitenaltäre, Cappella di Sant Antonino (Giambologna, Allori), Hochaltar mit dem Kruzifix
// Fra Angelicos, Chorgestühl, Kanzel, Kirchenbänke, Fresken im Presbyterium (Parrocel). Alles vereinfacht, nicht nach Vorbild.
const M = require('./_malerei.js');

const FR = M.FR;
const mod = (a, n) => ((a % n) + n) % n;
const hash2 = (a, b) => ((a * 7 + b * 13) % 3) === 0;

function ausstatten(api) {
  const { D, set, ersetze, Y, T, zellen, key } = api;
  const K = require('./_kirche.js');
  const { BAY_C, BAY, U_LH0 } = K;
  const imR = (c, r) => c.u >= r.u0 && c.u < r.u1 && c.w >= r.w0 && c.w < r.w1;
  const cellsIn = (r) => D.cells.filter((c) => imR(c, r));
  const quader = (teil, r, j0, j1, typ) => { for (const c of cellsIn(r)) for (let j = j0; j <= j1; j++) set(c.x, Y(j), c.z, typeof typ === 'function' ? typ(c, j) : typ, teil); };
  /** Farbfeld auf bestehenden Wandzellen (Teile nurTeile): Rechteck r, Zeilen j0..j0+H-1, Spalten q = floor(Lage - start) entlang achse. */
  const feld = (teil, r, achse, start, B, H, j0, fn, nurTeile) => {
    for (const c of cellsIn(r)) {
      const q = Math.floor((achse === 'u' ? c.u : c.w) - start);
      if (q < 0 || q >= B) continue;
      for (let jj = 0; jj < H; jj++) {
        const e = zellen.get(key(c.x, Y(j0 + jj), c.z));
        if (!e || (nurTeile && !nurTeile.includes(e.p)) || e.p === 'fenster') continue;
        ersetze(c.x, Y(j0 + jj), c.z, fn(q, jj, B, H), teil);
      }
    }
  };

  // ---- Seitenaltäre: links drei (ohne Cappella Salviati), rechts drei; das dritte Joch rechts führt in den Kreuzgang
  const ALTAERE = [['w', 0], ['w', 2], ['w', 3], ['o', 0], ['o', 1], ['o', 3]];
  ALTAERE.forEach(([seite, k], i) => {
    const uc = BAY_C[k], tw = seite === 'w' ? [3.2, 5.0] : [36.4, 38.2];
    quader('seitenaltaere', { u0: uc - 2, u1: uc + 2, w0: tw[0], w1: tw[1] }, 1, 2, T.weiss);                          // Mensa und Aufsatz
    quader('seitenaltaere', { u0: uc - 0.5, u1: uc + 0.5, w0: tw[0] + 0.2, w1: tw[1] - 0.2 }, 3, 5, T.gold);          // Altarkreuz
    quader('seitenaltaere', { u0: uc - 3.5, u1: uc + 3.5, w0: seite === 'w' ? 6 : 33.5, w1: seite === 'w' ? 8.5 : 36 }, 1, 1, T.holz);   // Kniebank
    const wf = seite === 'w' ? [3.2, 8] : [34, 38.8];                                                                // Altarbilder auf den Trennwänden
    for (const ub of [U_LH0 + BAY * k, U_LH0 + BAY * (k + 1)]) {
      if (ub <= U_LH0 + 1 || ub >= K.U_LH1 - 1) continue;
      feld('seitenaltaere', { u0: ub - 1.3, u1: ub + 1.3, w0: wf[0], w1: wf[1] }, 'w', wf[0], 5, 8, 4, M.tafel(i * 2 + (ub > uc ? 1 : 0)), ['kapellen_trennwaende']);
    }
  });

  // ---- Cappella di Sant Antonino (Giambologna, 1580 bis 1589): Marmorboden, Bronzereliefs, Fresken Alloris, Baldachinaltar
  {
    const k = K.SALVIATI, uc = BAY_C[k], u0 = U_LH0 + BAY * k, u1 = u0 + BAY;
    for (const c of cellsIn({ u0, u1, w0: 2, w1: 10 })) {
      const d = Math.max(Math.abs(c.u - uc) / 1.9, Math.abs(c.w - 6) / 1.5);
      ersetze(c.x, Y(0), c.z, d < 1.2 ? T.gold : (Math.floor(d) % 2 ? T.rot : T.weiss), 'cappella_antonino');
    }
    const rel = (q, jj, B, H) => ((q === 0 || q === B - 1 || jj === 0 || jj === H - 1) ? T.gold : (hash2(q, jj) ? T.bronze : T.weiss));
    for (const ub of [u0, u1]) feld('cappella_antonino', { u0: ub - 1.3, u1: ub + 1.3, w0: 2.5, w1: 9 }, 'w', 3, 6, 9, 3, rel, ['kapellen_trennwaende']);
    for (const c of cellsIn({ u0: u0 + 1, u1: u1 - 1, w0: 2, w1: 10 })) {                                                   // Deckenfresko (Allori): Himmel, Wolken, Gold
      if (!zellen.get(key(c.x, Y(21), c.z))) continue;
      ersetze(c.x, Y(21), c.z, mod(Math.floor(c.u) + Math.floor(c.w * 1.5), 5) === 0 ? FR('weiss') : mod(Math.floor(c.u), 7) === 0 ? T.gold : FR('hellblau'), 'cappella_antonino');
    }
    quader('cappella_antonino', { u0: uc - 3, u1: uc + 3, w0: 3.4, w1: 5.6 }, 1, 2, T.weiss);                                // Altar
    for (const du of [-3, 3]) for (const dw of [3.4, 7.4]) quader('cappella_antonino', { u0: uc + du - 0.5, u1: uc + du + 0.5, w0: dw, w1: dw + 1 }, 1, 8, T.ornament);   // Baldachinsäulen
    quader('cappella_antonino', { u0: uc - 3.5, u1: uc + 3.5, w0: 3.0, w1: 8.4 }, 9, 9, T.gold);                              // Baldachin
    for (const c of cellsIn({ u0: uc - 3.5, u1: uc + 3.5, w0: 3.0, w1: 8.4 })) for (let j = 10; j <= 12; j++) api.unzug('cappella_antonino', 'Oberseite des Baldachins (nur Zierde, ohne Zugang)', c.x, Y(j), c.z);
    quader('cappella_antonino', { u0: uc - 0.6, u1: uc + 0.6, w0: 4, w1: 5 }, 3, 6, T.bronze);                                // Reliquienschrein
  }

  // ---- Hochaltar mit dem Kruzifix Fra Angelicos (1425 bis 1428), Stufen und Chorgestühl in der Apsis
  {
    quader('hochaltar', { u0: 92.4, u1: 94.6, w0: 17, w1: 28 }, 1, 1, T.ornament);                                    // untere Stufe
    quader('hochaltar', { u0: 94.6, u1: 98.2, w0: 18.5, w1: 26.5 }, 1, 2, T.weiss);                                    // Altartisch
    quader('hochaltar', { u0: 97.4, u1: 99, w0: 21, w1: 23 }, 3, 11, T.holz);                                          // Kruzifix: Stamm
    quader('hochaltar', { u0: 97.4, u1: 99, w0: 19.2, w1: 24.8 }, 9, 10, T.holz);                                      // Kruzifix: Balken
    quader('hochaltar', { u0: 97.4, u1: 99, w0: 21, w1: 23 }, 12, 12, T.gold);
    quader('hochaltar', { u0: 94.7, u1: 95.7, w0: 18.7, w1: 19.7 }, 3, 4, T.gold);                                     // Leuchter
    quader('hochaltar', { u0: 94.7, u1: 95.7, w0: 25.3, w1: 26.3 }, 3, 4, T.gold);
    for (const c of D.cells) {                                                                                          // Chorgestühl: Rückwand und Sitz
      if (c.zone !== 'apsis' || c.u < 99.5) continue;
      if (c.d8 === 3) for (let j = 1; j <= 4; j++) set(c.x, Y(j), c.z, j === 4 ? T.gold : T.holz, 'chorgestuehl');
      else if (c.d8 === 4) set(c.x, Y(1), c.z, T.holz, 'chorgestuehl');
    }
  }

  // ---- Kanzel (Pfeiler und Kasten an der Nordwand des Mittelschiffs), Kirchenbänke
  {
    const ku = 30, kw = 12.6;
    quader('kanzel', { u0: ku - 0.5, u1: ku + 0.5, w0: kw - 0.5, w1: kw + 0.5 }, 1, 5, T.serena);                        // Pfeiler
    quader('kanzel', { u0: ku - 1.6, u1: ku + 1.6, w0: kw - 1.6, w1: kw + 1.6 }, 6, 6, T.holz);                         // Boden des Kastens
    for (const c of cellsIn({ u0: ku - 1.6, u1: ku + 1.6, w0: kw - 1.6, w1: kw + 1.6 })) {                                // Brüstung (offen zur Wand)
      const rand = Math.abs(c.u - ku) > 1.0 || Math.abs(c.w - kw) > 1.0;
      if (rand && c.w > kw - 0.6) set(c.x, Y(7), c.z, T.holz, 'kanzel');
    }
    const benk = (u0, u1, w0, w1) => quader('kirchenbaenke', { u0, u1, w0, w1 }, 1, 1, T.holz);
    for (let u = 10; u < 61; u += 2.7) { if (Math.abs(u - 30) < 2.6) continue; benk(u, u + 1, 13.4, 19.2); benk(u, u + 1, 23.8, 29.6); }
  }

  // ---- Fresken im Presbyterium (Ignace Parrocel): Wandfelder an beiden Seiten
  {
    const fn = (q, jj, B, H) => ((q === 0 || q === B - 1 || jj === 0 || jj === H - 1) ? T.gold : (mod(q + (jj >> 1), 4) < 2 ? FR('hellblau') : FR(['gelb', 'rot', 'weiss', 'gruen'][(q >> 2) % 4])));
    feld('praesbyterium_fresken', { u0: 68, u1: 84, w0: 9.8, w1: 11.2 }, 'u', 68, 16, 10, 5, fn, ['seitenmassen']);
    feld('praesbyterium_fresken', { u0: 68, u1: 84, w0: 31.8, w1: 33.2 }, 'u', 68, 16, 10, 5, fn, ['seitenmassen']);
  }
}

module.exports = { ausstatten };
