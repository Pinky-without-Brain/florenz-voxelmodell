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
  const GLAS = matId('glas');
  const deckeOk = (i, L) => DECKEN.has(own[i * SLOTS + L]) || (solid(i, L) && mt[i * SLOTS + L] !== GLAS && own[i * SLOTS + L] !== PID.beleuchtung && own[i * SLOTS + L] !== PID.tribuna_kuppel);
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
      const gesetztePos = [];
      const versuche = (l, rMax) => {
        let gesetzt = false;
        for (let r = 0; r <= rMax && !gesetzt; r++) {
          for (let dx = -r; dx <= r && !gesetzt; dx++) for (let dz = -r; dz <= r && !gesetzt; dz++) {
            if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
            const i = S.at(l.x + dx, l.z + dz);
            if (i < 0 || !deckeOk(i, lc) || !frei(i, lc - 1) || !frei(i, f.stand)) continue;
            // eingebettet in der Platte: alle vier Nachbarn tragen dasselbe Deckenbauteil (keine Halbinseln, R3)
            const ok = [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([a, b]) => { const j = S.at(S.cx[i] + a, S.cz[i] + b); return j >= 0 && deckeOk(j, lc); });
            if (!ok) continue;
            own[i * SLOTS + lc] = PID.beleuchtung; mt[i * SLOTS + lc] = matId(typ);
            P.lampen++; gesetzt = true; gesetztePos.push([S.cx[i], S.cz[i]]);
          }
        }
        return gesetzt;
      };
      for (const l of WZ.licht.lichtRaster(zellen, { abstand: 10, hoehe: lc - f.stand })) versuche(l, 2);
      // Nachbesserung: Stehzellen, die weiter als 12 Blöcke von jeder Leuchte entfernt liegen, bekommen eine zusätzliche Leuchte
      const hash = new Map();
      const add = (x, z) => { const k = Math.floor(x / 12) + ',' + Math.floor(z / 12); let a = hash.get(k); if (!a) hash.set(k, a = []); a.push([x, z]); };
      gesetztePos.forEach(([x, z]) => add(x, z));
      const gedeckt = (x, z) => {
        const kx = Math.floor(x / 12), kz = Math.floor(z / 12);
        for (let a = kx - 1; a <= kx + 1; a++) for (let b = kz - 1; b <= kz + 1; b++) {
          const l = hash.get(a + ',' + b);
          if (l) for (const q of l) if ((q[0] - x) ** 2 + (q[1] - z) ** 2 <= 144) return true;
        }
        return false;
      };
      for (const c of zellen) {
        if (gedeckt(c[0], c[2])) continue;
        const vor = gesetztePos.length;
        versuche({ x: c[0], z: c[2] }, 6);
        if (gesetztePos.length > vor) { const q = gesetztePos[gesetztePos.length - 1]; add(q[0], q[1]); }
      }
    }
  }

  // Tonnengewölbe des Durchgangs zum Arno: Leuchten im Scheitel (erste feste Zelle über dem Boden), alle 9 Blöcke, zwei Reihen
  const { uu, ww } = S;
  for (let i = 0; i < N; i++) {
    if (zone[i] !== P.ZONE_S || Math.floor(ww[i]) % 9 !== 0) continue;
    const ur = Math.floor(uu[i]);
    if (ur !== 11 && ur !== 16) continue;
    if (!frei(i, 1) || !frei(i, 2) || !frei(i, 3)) continue;
    let L = 4;
    while (L < 20 && frei(i, L)) L++;
    if (L < 20 && own[i * SLOTS + L] === PID.durchgang_arno) { own[i * SLOTS + L] = PID.beleuchtung; mt[i * SLOTS + L] = matId(typ); P.lampen++; }
  }
};
