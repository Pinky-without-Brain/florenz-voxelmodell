'use strict';
// Letzte Stufe: Diagonalrisse schließen (BEGEHBARKEIT.md §1.4). Eine einzellige Schicht im um 17,4 Grad gedrehten
// Raster hängt nur über Kanten zusammen, wenn ihre Dicke unter cos + sin = 1,29 liegt. Allgemeine Regel statt Einzelfixes:
// Zwei feste Zellen A, B in derselben Lage, die sich nur diagonal berühren (beide Zellen auf der Kreuzdiagonale sind
// nicht fest), bekommen eine Verbindungszelle. Gewählt wird die Kreuzzelle in der Maske mit dem größeren Randabstand d8
// (die Wand wird nach innen dicker, die Außenfläche bleibt); sie erhält Bauteil und Material von A.
// Nur Zellen, die bisher frei oder bewusst leer (Öffnungsraum) waren, werden gefüllt.

module.exports = function risse(P) {
  const { S, N, own, mt, over, AIR_ID } = P;
  const { cx, cz, at, d8 } = S;
  const SLOTS = P.SLOTS;
  // Außenzellen (Kranzgesims +1) je Lage
  const overMap = new Map();
  for (const o of over) overMap.set(o.x * 100000 + o.z + o.L * 1e10, o);
  const solidIdx = (i, L) => { const v = own[i * SLOTS + L]; return v !== 0 && v !== AIR_ID; };
  const solidXZ = (x, z, L) => {
    const i = at(x, z);
    if (i >= 0) return solidIdx(i, L);
    return overMap.has(x * 100000 + z + L * 1e10);
  };
  let total = 0;
  // Dachschalen: einzelne Lücken zwischen zwei Dachzellen derselben Säule schließen (Stoß von Flügel- und Nebenbaudach)
  for (const name of ['dach_fluegel', 'dach_nebenbau']) {
    const id = P.PID[name];
    for (let i = 0; i < N; i++) {
      for (let L = 2; L < SLOTS - 1; L++) {
        const k = i * SLOTS + L;
        if ((own[k] === 0 || own[k] === AIR_ID) && own[k - 1] === id && own[k + 1] === id) { own[k] = id; mt[k] = mt[k - 1]; total++; }
      }
    }
  }
  for (let pass = 0; pass < 8; pass++) {
    let n = 0;
    const todo = [];
    for (let i = 0; i < N; i++) {
      const x = cx[i], z = cz[i];
      for (let L = 1; L < SLOTS; L++) {
        if (!solidIdx(i, L)) continue;
        for (const dz of [1, -1]) {
          if (!solidXZ(x + 1, z + dz, L)) continue;
          if (solidXZ(x + 1, z, L) || solidXZ(x, z + dz, L)) continue;
          const c1 = at(x + 1, z), c2 = at(x, z + dz);
          const iB = at(x + 1, z + dz);
          const pa = own[i * SLOTS + L], pb = iB >= 0 ? own[iB * SLOTS + L] : 0;
          const ma = mt[i * SLOTS + L], mb = iB >= 0 ? mt[iB * SLOTS + L] : ma;
          const dach = (p) => p === P.PID.dach_fluegel || p === P.PID.dach_nebenbau;
          const nah = (j, p) => {
            for (let h = -4; h <= 4; h++) if (L + h > 0 && L + h < SLOTS && own[j * SLOTS + L + h] === p) return true;
            return false;
          };
          // Teil der Füllzelle: Teil von A, sonst von B; Dachteile nur dort, wo die Säule schon Dachzellen hat (kein Wachsen ins Leere)
          const teilFuer = (j) => {
            if (j < 0) return null;
            if (!dach(pa) || nah(j, pa)) return [pa, ma];
            if (pb && (!dach(pb) || nah(j, pb))) return [pb, mb];
            return null;
          };
          // Auswahl: Zelle mit festen Zellen darüber/darunter (trägt besser, z. B. Kuppelschale), dann größerer Randabstand
          const sc = (j) => {
            let a = 0;
            if (solidIdx(j, L - 1)) a += 2;
            if (solidIdx(j, L + 1)) a += 2;
            if (L > 2 && solidIdx(j, L - 2)) a += 1;
            if (L > 3 && solidIdx(j, L - 3)) a += 1;
            // Überhang vermeiden: eine Füllzelle über einer seitlich offenen Leerzelle würde diese zur "Innenluft" machen
            if (L > 1 && !solidIdx(j, L - 1)) {
              const x2 = cx[j], z2 = cz[j];
              if (![[1, 0], [-1, 0], [0, 1], [0, -1]].every(([a1, b1]) => solidXZ(x2 + a1, z2 + b1, L - 1))) a -= 10;
            }
            return a + d8[j] / 1000;
          };
          const t1 = teilFuer(c1), t2 = teilFuer(c2);
          let pick = -1, tt = null;
          if (t1 && t2) { pick = sc(c1) >= sc(c2) ? c1 : c2; tt = pick === c1 ? t1 : t2; }
          else if (t1) { pick = c1; tt = t1; }
          else if (t2) { pick = c2; tt = t2; }
          if (pick < 0) continue;
          todo.push([pick, L, tt[0], tt[1]]);
        }
      }
    }
    for (const [j, L, part, mat] of todo) {
      const k = j * SLOTS + L;
      if (own[k] !== 0 && own[k] !== AIR_ID) continue;
      own[k] = part; mt[k] = mat; n++;
      // Kuppelschale: seitlich offene Leerzellen unter einer Füllzelle mitfüllen (sonst wäre die Zelle darunter eine undichte "Innenluft")
      for (let h = 1; part === P.PID.tribuna_kuppel && h <= 3 && L - h > 0; h++) {
        const kb = k - h;
        if (own[kb] !== 0 && own[kb] !== AIR_ID) break;
        if ([[1, 0], [-1, 0], [0, 1], [0, -1]].every(([a1, b1]) => solidXZ(cx[j] + a1, cz[j] + b1, L - h))) break;
        own[kb] = part; mt[kb] = mat; n++;
      }
    }
    total += n;
    if (!n) break;
  }
  P.risseGefuellt = total;
};
