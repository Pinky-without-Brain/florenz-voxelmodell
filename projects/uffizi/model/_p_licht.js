'use strict';
// Stufe 9: Licht (BEGEHBARKEIT.md §1.5). Seelaternen sind in die Decken eingebaut (ersetzen die Deckenzelle), höchstens 12 Blöcke
// voneinander entfernt (Bibliothek tools/wahrzeichen/licht.js, je Geschoss und Deckenhöhe).

const WZ = require('../../../tools/wahrzeichen');

module.exports = function licht(P) {
  const { S, N, own, mt, SLOTS, AIR_ID, PID, matId, zone, ZONE_X, NB_TRAUFE } = P;
  const { cx, cz } = S;
  const solid = (i, L) => { const v = own[i * SLOTS + L]; return v !== 0 && v !== AIR_ID; };
  const frei = (i, L) => { const v = own[i * SLOTS + L]; return v === 0 || v === AIR_ID; };
  const FLOORS = [{ stand: 1, decke: 14 }, { stand: 15, decke: 20 }, { stand: 21, decke: 36 }, { stand: 37, decke: 51, nb: NB_TRAUFE }];
  const typ = WZ.typ('licht');
  const DECKEN = new Set(['decke_14', 'decke_20', 'decke_36', 'decke_traufe', 'portikus_decke', 'loggia_boden'].map((n) => PID[n]));
  const deckeOk = (i, L) => DECKEN.has(own[i * SLOTS + L]);
  P.lampen = 0;
  for (const f of FLOORS) {
    const gruppen = new Map();                      // Deckenlage -> Stehzellen
    for (let i = 0; i < N; i++) {
      const lc = f.nb && zone[i] === ZONE_X ? f.nb : f.decke;
      if (!frei(i, f.stand) || !frei(i, f.stand + 1) || !frei(i, f.stand + 2)) continue;
      if (f.stand > 1 && !solid(i, f.stand - 1)) continue;
      if (!solid(i, lc)) continue;
      let leer = true;
      for (let h = f.stand; h < lc && leer; h++) leer = frei(i, h);
      if (!leer) continue;
      let a = gruppen.get(lc);
      if (!a) gruppen.set(lc, a = []);
      a.push([cx[i], S.BODEN + f.stand, cz[i]]);
    }
    for (const [lc, zellen] of gruppen) {
      // Abstand 10 statt 12: Verschiebungen um bis zu 2 Zellen (siehe unten) halten den Höchstabstand von 12 ein
      for (const l of WZ.licht.lichtRaster(zellen, { abstand: 10, hoehe: lc - f.stand })) {
        let gesetzt = false;
        for (let r = 0; r <= 2 && !gesetzt; r++) {
          for (let dx = -r; dx <= r && !gesetzt; dx++) for (let dz = -r; dz <= r && !gesetzt; dz++) {
            if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
            const i = S.at(l.x + dx, l.z + dz);
            if (i < 0 || !deckeOk(i, lc) || !frei(i, lc - 1) || !frei(i, f.stand)) continue;
            // eingebettet in der Platte: alle vier Nachbarn tragen dasselbe Deckenbauteil (keine Halbinseln, R3)
            const ok = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([a, b]) => { const j = S.at(S.cx[i] + a, S.cz[i] + b); return j >= 0 && deckeOk(j, lc); });
            if (!ok) continue;
            own[i * SLOTS + lc] = PID.beleuchtung; mt[i * SLOTS + lc] = matId(typ);
            P.lampen++; gesetzt = true;
          }
        }
      }
    }
  }
};
