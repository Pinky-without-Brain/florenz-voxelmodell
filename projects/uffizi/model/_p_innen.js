'use strict';
// Stufe 5: Innenwände und Treppen (Modul 7): Längsmittelwand (spinnwand_fluegel), vier Flügeltreppen, Treppe zum Cavalcavia.

module.exports = function innen(P) {
  const { S, N, claim, air, kind, zone, tAll, fmod, ZONE_W, ZONE_E, K_GEN } = P;
  const { ww } = S;

  // --- spinnwand_fluegel: Längsmittelwand je Flügel bei t 27..28, Lage 1..49, Türen 3 x 8 im Abstand 24
  const TUER = [[1, 8], [21, 28], [37, 44]];      // je Geschoss eine Tür auf der Mitte des Moduls
  for (let i = 0; i < N; i++) {
    if (kind[i] !== K_GEN) continue;
    const z = zone[i];
    if ((z !== ZONE_W && z !== ZONE_E) || tAll[i] < 27 || tAll[i] > 28) continue;
    const w = Math.floor(ww[i]);
    if (w < 12 || w >= 276) continue;
    const { wl } = fmod(ww[i]);
    for (let L = 1; L <= 49; L++) {
      if (wl >= 13 && wl <= 15 && TUER.some(([a, b]) => L >= a && L <= b)) { air(i, L); continue; }
      claim(i, L, 'spinnwand_fluegel', 'putz');
    }
  }

  // --- treppen: 4 gerade Treppen, 6 breit (t 16..21), 36 Stufen (1 hoch, 1 tief) von Lage 1 bis 36
  const stufenSpalten = [];
  for (const sd of [ZONE_W, ZONE_E]) {
    for (const nord of [true, false]) {
      const byW = new Map();
      for (let i = 0; i < N; i++) {
        if (kind[i] !== K_GEN || zone[i] !== sd || tAll[i] < 16 || tAll[i] > 21) continue;
        const w = Math.floor(ww[i]);
        if (!byW.has(w)) byW.set(w, []);
        byW.get(w).push(i);
      }
      for (let k = 1; k <= 36; k++) {
        const w = nord ? 12 + k : 265 - k;
        for (const i of byW.get(w) || []) {
          for (let L = 1; L <= k; L++) claim(i, L, 'treppen', 'serena');
          // Deckenlöcher über der Treppe (Kopffreiheit 3): Lage 14, 20, 36
          for (const Ld of [14, 20, 36]) if (k < Ld && k >= Ld - 3) air(i, Ld);
          stufenSpalten.push(i);
        }
      }
    }
  }
  P.treppenSpalten = stufenSpalten;

  // --- korridor_treppe (K8: in M_UF, deshalb Modul 7): Treppe zum Cavalcavia in der Südwestspitze, im Rahmen UF u -91..-68,
  // 7 breit (w 260..266). 23 Stufen von Lage 36 (Y 101, u = -68) abwärts nach -u bis Lage 14; danach Podest bis Lage 13
  // (Y 78 = Boden des Lungarno-Korridors) bis zum Austritt in Kante 1. Seitenwände 2 dick, Höhe Stufe + 6.
  const KT = 'korridor_treppe';
  for (let i = 0; i < N; i++) {
    if (kind[i] !== K_GEN) continue;
    const iu = Math.floor(S.uu[i]), iw = Math.floor(ww[i]);
    const k = -68 - iu;
    if (k < 0 || k > 29) continue;
    const T = k <= 22 ? 36 - k : 13;
    if (iw >= 260 && iw <= 266) {
      for (let L = 1; L <= T; L++) claim(i, L, KT, 'serena');
      for (const Ld of [14, 20, 36]) if (T < Ld && T >= Ld - 3) air(i, Ld);        // Kopffreiheit unter den Decken
    } else if (iw === 258 || iw === 259 || iw === 267 || iw === 268) {
      for (let L = 1; L <= Math.min(44, Math.max(T, 13) + 6); L++) claim(i, L, KT, 'putz');
    }
  }
};
