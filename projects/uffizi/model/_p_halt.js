'use strict';
// Letzte Stufe: Baubarkeit (R3) sichern. R3 setzt die Bauschritte der Reihe nach; jeder Block muss über Flächenkontakte innerhalb
// seines Schritts einen früher gesetzten Block oder den Boden erreichen. Der Plan bildet die Schritte nach (Planer: Bauteile in
// Listenreihenfolge, Teilung großer Bauteile mit splitPart) und behebt ungestützte Zellen:
//  1. Die Zelle geht an ein späteres Nachbarbauteil über, das sie trägt (z. B. Wandstück hinter einem Bild), sonst
//  2. wird eine Stütze (Säule gleichen Bauteils) nach unten bis zum nächsten festen Block gezogen.
// Module 0 (Bodenplatte auf Lage 0) und 8 (Corridoio) tragen nur Lage 1 bzw. nichts; der Corridoio wird hier nicht betrachtet.

const planner = require('../../../tools/steps/planner.js');
const { packKey, xOfKey, yOfKey, zOfKey } = require('../../../tools/geom/grid.js');

const STEP_X = 4194304, STEP_Z = 512;

module.exports = function halt(P) {
  const { S, N, own, mt, SLOTS, AIR_ID } = P;
  const NP = P.PART_COUNT;
  const solid = (v) => v !== 0 && v !== AIR_ID;
  const keyOf = (i, L) => packKey(S.cx[i], S.BODEN + L, S.cz[i]);
  const cellOfKey = (k) => ({ i: S.at(xOfKey(k), zOfKey(k)), L: yOfKey(k) - S.BODEN });
  let angepasst = 0, gestuetzt = 0;
  for (let durchlauf = 0; durchlauf < 6; durchlauf++) {
    const listen = Array.from({ length: NP + 1 }, () => []);
    for (let k = 0; k < own.length; k++) { const v = own[k]; if (solid(v)) listen[v].push(k); }
    const placed = new Set();
    let offen = 0;
    const fixe = [];                                         // [partId, Schlüssel] ungestützt
    for (let p = 1; p <= NP; p++) {
      const ks = listen[p];
      if (!ks.length) continue;
      const keys = ks.map((k) => { const i = Math.floor(k / SLOTS); return keyOf(i, k - i * SLOTS); });
      const pieces = planner.splitPart(planner.sortedKeys(keys));
      for (const piece of pieces) {
        const inStep = new Set(piece);
        const seen = new Set();
        const stack = [];
        for (const k of piece) {
          let ok = yOfKey(k) <= S.BODEN + 1;
          if (!ok) for (const n of [k + 1, k - 1, k + STEP_Z, k - STEP_Z, k + STEP_X, k - STEP_X]) if (placed.has(n)) { ok = true; break; }
          if (ok) { seen.add(k); stack.push(k); }
        }
        while (stack.length) {
          const k = stack.pop();
          for (const n of [k + 1, k - 1, k + STEP_Z, k - STEP_Z, k + STEP_X, k - STEP_X]) if (inStep.has(n) && !seen.has(n)) { seen.add(n); stack.push(n); }
        }
        if (seen.size !== piece.length) for (const k of piece) if (!seen.has(k)) fixe.push([p, k]);
        for (const k of piece) placed.add(k);
      }
    }
    offen = fixe.length;
    if (!offen) break;
    for (const [p, k] of fixe) {
      const { i, L } = cellOfKey(k);
      if (i < 0 || own[i * SLOTS + L] !== p) continue;
      // 1. späteres Nachbarbauteil
      let best = 0;
      for (const [di, dL] of [[0, 1], [0, -1]]) { const v = own[i * SLOTS + L + dL]; if (solid(v) && v > p && (!best || v < best)) best = v; void di; }
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const j = S.at(S.cx[i] + dx, S.cz[i] + dz);
        if (j < 0) continue;
        const v = own[j * SLOTS + L];
        if (solid(v) && v > p && (!best || v < best)) best = v;
      }
      if (best) { own[i * SLOTS + L] = best; angepasst++; continue; }
      // 2. Stütze nach unten bis zum nächsten festen Block (nur in freien Zellen)
      let m = L - 1;
      while (m > 0 && !solid(own[i * SLOTS + m])) m--;
      if (m < 0) continue;
      let frei = true;
      for (let q = m + 1; q < L; q++) if (own[i * SLOTS + q] !== 0 && own[i * SLOTS + q] !== AIR_ID) frei = false;
      if (!frei) continue;
      for (let q = m + 1; q < L; q++) { own[i * SLOTS + q] = p; mt[i * SLOTS + q] = mt[i * SLOTS + L]; gestuetzt++; }
    }
  }
  P.haltAngepasst = angepasst;
  P.haltStuetzen = gestuetzt;
};
