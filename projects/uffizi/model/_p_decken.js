'use strict';
// Stufe 7: Decken (Modul 7): Lage 14, 20, 36 (Oberkante Y 101) und Traufdecke (Lage 51 bzw. 44). Die Decken nehmen alle
// Zellen, die kein Detail beansprucht hat (K0); Treppenlöcher, Tribuna-Raum und Durchgang sind schon belegt.

module.exports = function decken(P) {
  const { N, claim, free, zone, ZONE_X, NB_TRAUFE, TRAUFE } = P;
  for (const L of [14, 20]) {
    for (let i = 0; i < N; i++) if (free(i, L)) claim(i, L, `decke_${L}`, 'serena');
  }
  for (let i = 0; i < N; i++) if (free(i, 36)) claim(i, 36, 'decke_36', 'serena');       // Oberkante Y 101
  for (let i = 0; i < N; i++) {
    const L = zone[i] === ZONE_X ? NB_TRAUFE : TRAUFE;
    if (free(i, L)) claim(i, L, 'decke_traufe', 'serena');
  }
};
