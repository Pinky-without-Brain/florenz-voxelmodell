'use strict';
// Modul 6: Innenhöfe (Katalog §7): vier Bänder um die Löcher des Polygons. d_H = Chebyshev-Abstand zum Loch (Randzelle = 1).
// Lage entlang der Lochkante und Bogenfelder werden aus den Polygonkanten des Lochs berechnet.
const pv = require('./pv_lib.js');

module.exports = {
  module: 6,
  build(ctx) {
    const S = pv.state(ctx);
    const g = S.g, TY = pv.TY;
    const bandRecs = (i, maxD) => g.recs.filter((r) => { const d = g.M.dLoch(i, r.x, r.z); r['dH' + i] = d; return d >= 1 && d <= maxD; });

    // Bogenfeld einer Arkade: Teilung T = L/n, Säulenachsen bei j*T
    const feld = (i, r, spacing) => {
      const q = pv.lochLage(g, i, r);
      const n = Math.max(1, Math.round(q.L / spacing)), T = q.L / n;
      if (q.t < 0 || q.t > q.L) return { ecke: true, T, t: q.t };
      let j = Math.min(n - 1, Math.floor(q.t / T));
      const c = (j + 0.5) * T;
      return { ecke: false, T, t: q.t, j, c, du: q.t - c, pd: Math.min(q.t - j * T, (j + 1) * T - q.t) };
    };

    // Arkade (EG, y_rel 1..16) um ein Loch. cfg: spacing, colHalf, wand (Schichten der Arkadenwand), gang (letzte Gangschicht),
    // rueck (letzte Rückwandschicht), pfeilerTyp (null = Säule mit Kapitell), tuer (Türen in der Rückwand)
    const arkade = (i, cfg) => (r, y) => {
      const d = r['dH' + i];
      const f = feld(i, r, cfg.spacing);
      if (d > cfg.gang) {                                                    // Rückwand, massiv
        if (cfg.tuer && !f.ecke && Math.abs(f.du) < 1.5 && y <= 8) return null;
        return TY.pietra_forte;
      }
      if (d > cfg.wand) return null;                                         // Gang, hohl
      const saeule = f.ecke || f.pd < cfg.colHalf;
      if (saeule) {
        if (cfg.pfeiler) return TY.pietra_serena;
        if (y === 7) return TY.gold;                                         // Bandring
        if (y <= 8) return TY.marmor_saeule;
        if (y <= 10) return TY.marmor_ornament;
        return TY.pietra_forte;
      }
      const rr = (f.T - 2 * cfg.colHalf) / 2;                                // lichte Halbweite
      const spring = 14 - rr;                                                // Scheitel immer y_rel 14
      const dy = y - spring;
      const offen = y <= spring ? Math.abs(f.du) < rr + 0.01 : f.du * f.du + dy * dy < rr * rr;
      if (offen) return null;
      if (y > spring - 1 && f.du * f.du + Math.max(0, dy) * Math.max(0, dy) < (rr + 1) * (rr + 1)) return TY.pietra_serena;   // Archivolte
      return TY.pietra_forte;                                                // Spandrillen bis y_rel 16
    };

    // 1) Michelozzo-Hof (Loch 1): Arkade mit Säulen, Gang, Rückwand mit Türen
    const mA = ctx.part('michelozzo_arkade');
    const r1 = bandRecs(1, 7);
    S.band(mA, r1, 1, 16, arkade(1, { spacing: 8, colHalf: 1, wand: 2, gang: 5, tuer: true }), 'michelozzo_arkade');

    // 2) Michelozzo-Obergeschosse: Wand d_H <= 3, Fenster 4 x 8 über jeder Arkadenöffnung, Gesimse y_rel 17 und 34
    const mO = ctx.part('michelozzo_obergeschosse');
    const r1o = r1.filter((r) => r.dH1 <= 3);
    S.band(mO, r1o, 17, 49, (r, y) => {
      const d = r.dH1;
      if (d === 1 && (y === 17 || y === 34)) return TY.marmor_weiss;
      const f = feld(1, r, 8);
      if (!f.ecke) {
        const q = pv.fenster(f.t, y, d, f.c, 2, y < 34 ? 20 : 37, y < 34 ? 27 : 44, TY.marmor_weiss);
        if (q !== undefined) return q;
      }
      return TY.pietra_forte;
    }, 'michelozzo_obergeschosse');

    // 3) Dogana-Pfeiler (Loch 0): Pfeiler 4 x 4 im Abstand 12, Bögen mit Scheitel y_rel 14 (r = 4), Rückwand d_H 7..8
    const dP = ctx.part('dogana_pfeiler');
    const r0 = bandRecs(0, 8);
    S.band(dP, r0, 1, 16, arkade(0, { spacing: 12, colHalf: 2, wand: 4, gang: 6, pfeiler: true }), 'dogana_pfeiler');

    // 4) Dogana-Obergeschosse: Putz, Fenster 4 x 8 pro Joch, Rahmen Pietra serena
    const dO = ctx.part('dogana_obergeschosse');
    S.band(dO, r0.filter((r) => r.dH0 <= 3), 17, 49, (r, y) => {
      const f = feld(0, r, 12);
      if (!f.ecke) {
        const q = pv.fenster(f.t, y, r.dH0, f.c, 2, y < 34 ? 20 : 37, y < 34 ? 27 : 44, TY.pietra_serena);
        if (q !== undefined) return q;
      }
      return TY.putz_sand;
    }, 'dogana_obergeschosse');

    // 5) Lichthöfe (Löcher 2 und 3): Putzband d_H <= 4, kleine Fenster 2 x 4 im Abstand 8
    const lh = ctx.part('lichthoefe');
    for (const i of [2, 3]) {
      S.band(lh, bandRecs(i, 4), 1, 49, (r, y) => {
        const q = pv.lochLage(g, i, r);
        const n = Math.max(1, Math.floor(q.L / 8)), T = q.L / n;
        if (q.t >= 0 && q.t <= q.L) {
          const c = (Math.floor(Math.min(q.t, q.L - 1e-6) / T) + 0.5) * T;
          const hoch = (y >= 9 && y <= 12) || (y >= 25 && y <= 28) || (y >= 41 && y <= 44);
          if (hoch && Math.abs(q.t - c) < 1) return r['dH' + i] === 2 ? TY.glas_fenster : null;
        }
        return TY.putz_sand;
      }, 'lichthoefe');
    }

    // 6) Attika und Dachrand der Höfe y_rel 50..56, Gesims y_rel 56 aus Pietra serena
    const at = ctx.part('hoefe_attika');
    for (let i = 0; i < 4; i++) {
      S.band(at, bandRecs(i, 3), 50, 56, (r, y) => (y === 56 ? TY.pietra_serena : TY.putz_sand), 'hoefe_attika');
    }
  }
};
