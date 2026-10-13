'use strict';
// Stufe 5: Innenwände (Modul 7): Längsmittelwand (spinnwand_fluegel), Portal zur Tribuna, Trennwände der Joche mit Türen.
// Geschosse: EG Lage 1..13 (Decke 14), Mezzanin 15..19 (Decke 20), Piano nobile 21..35 (Decke 36), Galerie 37..50 (Decke 51).
// Treppen stehen in _p_treppen.js.

const GESCHOSSE = [
  { name: 'eg', von: 1, bis: 13, tuer: [1, 8] },
  { name: 'mz', von: 15, bis: 19, tuer: [15, 18] },
  { name: 'pn', von: 21, bis: 35, tuer: [21, 28] },
  { name: 'gal', von: 37, bis: 50, tuer: [37, 44] }
];

module.exports = function innen(P) {
  const { S, N, claim, air, carve, free, kind, zone, tAll, fmod, ZONE_W, ZONE_E, ZONE_X, K_GEN, tribuna } = P;
  const { ww, uu, cx, cz } = S;
  const { rhoO, aO } = tribuna;

  // --- spinnwand_fluegel: Längsmittelwand je Flügel bei t 27..28, Lage 1..49, Türen 3 x 8 (Mezzanin 3 x 4) in der Jochmitte
  for (let i = 0; i < N; i++) {
    if (kind[i] !== K_GEN) continue;
    const z = zone[i];
    if ((z !== ZONE_W && z !== ZONE_E) || tAll[i] < 27 || tAll[i] > 28) continue;
    const w = Math.floor(ww[i]);
    if (w < 12 || w >= 276) continue;
    const { wl } = fmod(ww[i]);
    for (let L = 1; L <= 49; L++) {
      if (wl >= 13 && wl <= 15 && GESCHOSSE.some((g) => L >= g.tuer[0] && L <= g.tuer[1])) { air(i, L); continue; }
      claim(i, L, 'spinnwand_fluegel', 'putz');
    }
  }

  // --- Portal zur Tribuna: 3 breit in der Mitte der Westfläche des Oktogons (w 204..206), durch Rückwände und Ring
  for (let i = 0; i < N; i++) {
    if (zone[i] !== ZONE_E || ww[i] < 204 || ww[i] >= 207) continue;
    const t = tAll[i];
    if (t < 11 || t > 20) continue;
    for (const g of GESCHOSSE) {
      if (t <= 14 && (g.name === 'mz' || g.name === 'pn')) continue;          // dort keine Rückwand
      for (let L = g.tuer[0]; L <= g.tuer[1]; L++) carve(i, L);
    }
  }

  // --- Trennwände: Ebenen am Jochanfang (w = 12 + 24 k, 2 dick), je Geschoss in jeder zusammenhängenden Spanne eine Tür (3 breit)
  const planeOf = (w) => {
    const f = Math.floor(w);
    if (f === 274 || f === 275) return 11;
    if (f < 36 || f >= 274) return -1;
    const k = Math.floor((f - 12) / 24);
    return (f - 12) % 24 <= 1 ? k : -1;
  };
  P.trennwandSpannen = [];
  for (const g of GESCHOSSE) {
    const spans = new Map();                               // Ebene -> Spalten
    for (let i = 0; i < N; i++) {
      const pl = planeOf(ww[i]);
      if (pl < 0) continue;
      if (rhoO[i] <= aO + 3.5) continue;
      const zn = zone[i];
      if (zn === P.ZONE_S) continue;
      let ok;
      if (zn === ZONE_W || zn === ZONE_E) {
        const t = tAll[i];
        if (g.name === 'eg' || g.name === 'gal') ok = kind[i] === K_GEN && t >= 15;
        else ok = (kind[i] === K_GEN || kind[i] === P.K_F) && t >= 5;
      } else ok = zn === ZONE_X && kind[i] === K_GEN && uu[i] > -45 && uu[i] < 96;
      if (!ok || !free(i, g.von)) continue;
      let a = spans.get(pl);
      if (!a) spans.set(pl, a = []);
      a.push(i);
    }
    for (const [pl, cols] of spans) {
      cols.sort((a, b) => uu[a] - uu[b]);
      let run = [];
      const flush = () => {
        if (!run.length) return;
        const lo = uu[run[0]], hi = uu[run[run.length - 1]];
        if (hi - lo >= 5) {
          const mid = (lo + hi) / 2;
          for (const i of run) {
            if (Math.abs(uu[i] - mid) <= 1.5) { for (let L = g.tuer[0]; L <= g.tuer[1]; L++) air(i, L); }
          }
          P.trennwandSpannen.push({ geschoss: g.name, ebene: pl, u0: lo, u1: hi, mitte: mid });
        }
        for (const i of run) for (let L = g.von; L <= (g.name === 'gal' && zone[i] === ZONE_X ? 43 : g.bis); L++) claim(i, L, 'trennwaende', 'putz');
        run = [];
      };
      for (const i of cols) {
        if (run.length && uu[i] - uu[run[run.length - 1]] > 2.2) flush();
        run.push(i);
      }
      flush();
    }
  }
  void cx; void cz;
};
