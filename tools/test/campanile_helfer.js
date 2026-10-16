'use strict';
// Hilfen für die Campanile-Tests (V5b): Zellen eines Bauteils, Zusammenhangskomponenten, Kopffreiheit über Treppenblöcken,
// Lichtabstand und Erreichbarkeit der Glockenstube. Wird von den Tests der Kirchen mit Glockenturm benutzt (kein eigener Test).
const palette = require('../spec/palette.js');

/** Alle Zellen eines Bauteils [{x, y, z, type}]. */
function zellen(world, part) {
  const out = [];
  world.grid.forEach((x, y, z, e) => { if (e.part === part) out.push({ x, y, z, type: e.type }); });
  return out;
}

/** Anzahl der 6-zusammenhängenden Gruppen einer Zellenliste. */
function gruppen(liste) {
  const key = (c) => c.x + ',' + c.y + ',' + c.z;
  const rest = new Map(liste.map((c) => [key(c), c]));
  let n = 0;
  for (const [k, c] of rest) {
    if (!rest.has(k)) continue;
    n++;
    const st = [c];
    rest.delete(k);
    while (st.length) {
      const q = st.pop();
      for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
        const kk = (q.x + dx) + ',' + (q.y + dy) + ',' + (q.z + dz);
        if (rest.has(kk)) { st.push(rest.get(kk)); rest.delete(kk); }
      }
    }
  }
  return n;
}

/** Über jedem Treppenblock der Wendeltreppe müssen 3 Zellen frei sein: -> Anzahl Verstöße. */
function kopffreiheitVerstoesse(world, part = 'campanile_treppe') {
  let v = 0;
  for (const c of zellen(world, part)) {
    if (!palette.isTreppe(c.type)) continue;
    for (let h = 1; h <= 3; h++) if (world.grid.has(c.x, c.y + h, c.z)) { v++; break; }
  }
  return v;
}

/** Größter senkrechter Abstand zwischen den Lichtebenen (alle Säulen zusammen) einschließlich der Enden yVon und yBis. */
function lichtMaxLuecke(licht, yVon, yBis) {
  const ys = [...new Set(licht.map((c) => c.y))].sort((a, b) => a - b);
  if (!ys.length) return Infinity;
  let max = Math.max(ys[0] - yVon, yBis - ys[ys.length - 1]);
  for (let i = 1; i < ys.length; i++) max = Math.max(max, ys[i] - ys[i - 1]);
  return max;
}

module.exports = { zellen, gruppen, kopffreiheitVerstoesse, lichtMaxLuecke };
