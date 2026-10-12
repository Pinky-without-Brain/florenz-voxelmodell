'use strict';
// Stufe 8: Statuen in den 22 Pfeilernischen (Modul 9, K6): vereinfachte Blockfiguren, nicht nach Vorbild.
// Fuß 2 x 1 x 1 (Lage 4), Körper 2 x 1 x 3 (Lage 5..7), Kopf 1 x 1 x 1 (Lage 8). Die Nische ist 1 tief; bei der
// gedrehten Fassade kommen mehrere Zellen mit t = 1 auf dieselbe Joch-Position, die Figur steht in der hintersten.

module.exports = function statuen(P) {
  const { S, N, place, kind, tF, side, fw, fe, elOf, fmod, K_F, ZONE_W } = P;
  const best = new Map();                 // Seite + Spaltenindex w -> Zelle mit größter Tiefe
  for (let i = 0; i < N; i++) {
    if (kind[i] !== K_F || tF[i] !== 1) continue;
    const { wl } = fmod(S.ww[i]);
    const el = elOf(wl);
    if (el.e !== 'P' || el.q < -1 || el.q > 0) continue;
    const dd = side[i] === ZONE_W ? fw(S.ww[i]) - S.uu[i] : S.uu[i] - fe(S.ww[i]);
    const key = side[i] * 10000 + Math.floor(S.ww[i]);
    const b = best.get(key);
    if (!b || dd > b.dd) best.set(key, { i, dd, q: el.q });
  }
  const nischen = [];
  for (const { i, q } of best.values()) {
    place(i, 4, 'statuen', 'weiss');
    for (let L = 5; L <= 7; L++) place(i, L, 'statuen', 'weiss');
    if (q === 0) place(i, 8, 'statuen', 'weiss');
    nischen.push(i);
  }
  P.statuenNischen = nischen;
};
