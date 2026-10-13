'use strict';
// Letzte Stufe (B2): Diagonalrisse schließen (BEGEHBARKEIT.md §1.4). Der Rahmen des Palazzo Vecchio ist um 79,8 Grad gedreht;
// einzellige Schichten (Glas, Brüstungen, Edikula-Wand, Dachschalen) hängen im Weltraster nur über Kanten zusammen, wenn ihre
// Dicke unter cos + sin = 1,17 liegt. Allgemeine Regel wie bei den Uffizien: Zwei feste Zellen A, B in derselben Lage, die sich
// nur diagonal berühren (beide Kreuzzellen nicht fest), bekommen eine Verbindungszelle. Gewählt wird die freie Kreuzzelle mit
// Halt über oder unter sich und dem größeren Randabstand; sie erhält den Typ von A (bei Glas den von B).
// Gefüllt werden nur Zellen, die weder belegt noch freigehalten sind (Türen, Treppenschächte) und im erlaubten Luftraum liegen.

const { keyOf } = require('./pv_lib.js');

function decode(k) {
  const y = k % 512, r = (k - y) / 512, zi = r % 8192, xi = (r - zi) / 8192;
  return { x: xi - 4096, y, z: zi - 4096 };
}

const istGlas = (t) => typeof t === 'string' && (t.includes('glass') || t === 'sea_lantern');

/** Schließt alle Risse; W ist der Writer des Bauteils für die Verbindungszellen. Rückgabe: Anzahl gesetzter Zellen. */
function schliesse(S, W, tag) {
  const g = S.g, BY = g.bodenY;
  const fest = (x, y, z) => S.types.has(keyOf(x, y, z));
  const erlaubt = (x, y, z) => {
    const k = keyOf(x, y, z);
    if (S.claimed.has(k) || S.carve.has(k)) return false;
    return g.M.innen(x, z) || g.M.dAussen(x, z) <= 3;
  };
  let total = 0;
  for (let pass = 0; pass < 10; pass++) {
    const todo = new Map();
    for (const [k, typ] of S.types) {
      const { x, y, z } = decode(k);
      for (const dz of [1, -1]) {
        const kb = keyOf(x + 1, y, z + dz);
        if (!S.types.has(kb)) continue;
        if (fest(x + 1, y, z) || fest(x, y, z + dz)) continue;
        let best = null, bs = -Infinity;
        for (const [cx, cz] of [[x + 1, z], [x, z + dz]]) {
          if (!erlaubt(cx, y, cz)) continue;
          // Bevorzugt die Zelle mit mehr festen Nachbarn (Mauerseite): so bleiben Hohlräume, Türen und Fensterlaibungen frei
          let sc = 0;
          for (const [ax, az] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (fest(cx + ax, y, cz + az)) sc += 3;
          if (fest(cx, y - 1, cz)) sc += 2;
          if (fest(cx, y + 1, cz)) sc += 2;
          const r = g.rec(cx, cz);
          sc += (r ? r.d8 : 0) / 1000;
          if (sc > bs) { bs = sc; best = [cx, cz]; }
        }
        if (!best) continue;
        const t = istGlas(typ) ? S.types.get(kb) : typ;
        todo.set(keyOf(best[0], y, best[1]), { x: best[0], y: y - BY, z: best[1], t: istGlas(t) ? 'polished_andesite' : t });
      }
    }
    let n = 0;
    for (const c of todo.values()) if (S.put(W, c.x, c.y, c.z, c.t, tag)) n++;
    total += n;
    if (!n) break;
  }
  return total;
}

module.exports = { schliesse, decode };
