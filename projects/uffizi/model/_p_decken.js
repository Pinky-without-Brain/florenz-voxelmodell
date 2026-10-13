'use strict';
// Stufe 7: Decken (Modul 7): Lage 14, 20, 36 (Oberkante Y 101) und Traufdecke (Lage 51 bzw. 44). Die Decken nehmen alle
// Zellen, die kein Detail beansprucht hat (K0); Treppenlöcher, Tribuna-Raum und Durchgang sind schon belegt.

module.exports = function decken(P) {
  const { N, claim, free, zone, ZONE_X, NB_TRAUFE, TRAUFE, own, SLOTS, AIR_ID } = P;
  for (const L of [14, 20]) {
    for (let i = 0; i < N; i++) if (free(i, L)) claim(i, L, `decke_${L}`, 'serena');
  }
  for (let i = 0; i < N; i++) if (free(i, 36)) claim(i, 36, 'decke_36', 'serena');       // Oberkante Y 101
  for (let i = 0; i < N; i++) {
    const L = zone[i] === ZONE_X ? NB_TRAUFE : TRAUFE;
    if (free(i, L)) claim(i, L, 'decke_traufe', 'serena');
  }

  // Dachraum: Leerzellen zwischen Traufdecke und Dach (nicht zugänglich, R13); Zellen ohne festen Block darüber sind Himmel
  const { rhoO, aO } = P.tribuna;
  P.dachraum = [];
  for (let i = 0; i < N; i++) {
    if (rhoO[i] <= aO) continue;
    const Ls = zone[i] === ZONE_X ? NB_TRAUFE : TRAUFE;
    const v0 = own[i * SLOTS + Ls];
    if (v0 === 0 || v0 === AIR_ID) continue;
    const tmp = [];
    let dicht = false;
    for (let L = Ls + 1; L < SLOTS; L++) {
      const v = own[i * SLOTS + L];
      if (v === 0 || v === AIR_ID) tmp.push(i * SLOTS + L); else { dicht = true; break; }
    }
    if (dicht) for (const k of tmp) P.dachraum.push(k);
  }
};
