'use strict';
// Diagonalrisse in Zellenlisten schließen (BEGEHBARKEIT.md §1.4). Für Teile, die nicht über den Belegungsplan laufen
// (Fundament, Arkaden des Corridoio). zellen: [{x, y, z}]; erlaubt(x, y, z): darf eine Verbindungszelle hier stehen?
// -> zusätzliche Zellen [{x, y, z}] (ohne Doppelte). Je Riss genügt eine der beiden Kreuzzellen.

function schliesse(zellen, erlaubt, fremd) {
  const key = (x, y, z) => (x * 100003 + z) * 1024 + y;
  const set = new Set(zellen.map((c) => key(c.x, c.y, c.z)));
  const fest = (x, y, z) => set.has(key(x, y, z)) || (fremd && fremd(x, y, z));
  const extra = [];
  for (let pass = 0; pass < 6; pass++) {
    const neu = [];
    for (const c of [...zellen, ...extra]) {
      for (const dz of [1, -1]) {
        if (!fest(c.x + 1, c.y, c.z + dz)) continue;
        if (fest(c.x + 1, c.y, c.z) || fest(c.x, c.y, c.z + dz)) continue;
        if (erlaubt(c.x + 1, c.y, c.z)) neu.push({ x: c.x + 1, y: c.y, z: c.z });
        else if (erlaubt(c.x, c.y, c.z + dz)) neu.push({ x: c.x, y: c.y, z: c.z + dz });
      }
    }
    let n = 0;
    for (const c of neu) { const k = key(c.x, c.y, c.z); if (!set.has(k)) { set.add(k); extra.push(c); n++; } }
    if (!n) break;
  }
  return extra;
}

module.exports = { schliesse };
