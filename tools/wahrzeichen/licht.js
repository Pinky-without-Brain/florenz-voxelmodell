'use strict';
// Licht-Hilfe (B0, BEGEHBARKEIT.md §1.5): Lichtquellen der Rolle "licht" so verteilen, dass jede Bodenzelle
// höchstens `abstand` (Vorgabe 12) Blöcke Luftlinie in der Grundrissebene von einer Lichtquelle entfernt ist.

const rollen = require('./rollen.js');

/**
 * lichtRaster(bodenZellen, { abstand = 12, hoehe })
 *  bodenZellen: Stehzellen [{x,y,z}] oder [[x,y,z]] (Luftzelle über dem Boden, y = Stehhöhe).
 *  hoehe: Zahl >= 1 -> Deckeneinbau: Lichtblock in Zelle y + hoehe (z. B. 3 = unter der Decke eines 3 hohen Raums,
 *         die Decke ist dann y + hoehe; der Aufrufer wählt die Zelle der Decke selbst). Fehlt hoehe oder ist 'boden':
 *         Bodeneinbau, der Lichtblock ersetzt den Boden in Zelle y − 1 (versteckt im Boden, z. B. unter Teppichmustern).
 * -> [{ x, y, z, typ, einbau: 'decke'|'boden' }] mit typ der Rolle "licht" (Seelaterne). Greedy je y-Ebene:
 * Lichter stehen immer über einer Bodenzelle und überdecken möglichst viele noch unbeleuchtete Zellen.
 * Gemessen wird in der Luftlinie der Grundrissebene (Wände werden nicht berücksichtigt), die Zahl der
 * Lichter ist also eher größer als nötig.
 */
function lichtRaster(bodenZellen, opts = {}) {
  const abstand = opts.abstand === undefined ? 12 : opts.abstand;
  if (!(abstand > 0)) throw new RangeError('abstand muss > 0 sein');
  const decke = opts.hoehe !== undefined && opts.hoehe !== 'boden';
  if (decke && !(Number.isInteger(opts.hoehe) && opts.hoehe >= 1)) throw new RangeError('hoehe muss eine Ganzzahl >= 1 oder "boden" sein');
  const typ = rollen.typ('licht');
  const a2 = abstand * abstand;
  const ebenen = new Map();
  for (const c of bodenZellen) {
    const x = Array.isArray(c) ? c[0] : c.x, y = Array.isArray(c) ? c[1] : c.y, z = Array.isArray(c) ? c[2] : c.z;
    let e = ebenen.get(y);
    if (!e) ebenen.set(y, e = new Map());
    e.set(x * 65536 + z, [x, z]); // |x|, |z| < 32768
  }
  const out = [];
  for (const y of [...ebenen.keys()].sort((p, q) => p - q)) {
    const zellen = [...ebenen.get(y).values()].sort((p, q) => (p[0] - q[0]) || (p[1] - q[1]));
    // Raster der Zellen in Kacheln der Kantenlänge `abstand` für die Nachbarsuche
    const K = Math.max(1, Math.floor(abstand));
    const kachel = new Map();
    const kk = (x, z) => Math.floor(x / K) * 65536 + Math.floor(z / K);
    zellen.forEach((c, i) => { const k = kk(c[0], c[1]); (kachel.get(k) || kachel.set(k, []).get(k)).push(i); });
    const nahe = (x, z, r2, fn) => {
      const kx = Math.floor(x / K), kz = Math.floor(z / K), reach = Math.ceil(Math.sqrt(r2) / K);
      for (let ax = kx - reach; ax <= kx + reach; ax++) for (let az = kz - reach; az <= kz + reach; az++) {
        const l = kachel.get(ax * 65536 + az);
        if (l) for (const i of l) { const dx = zellen[i][0] - x, dz = zellen[i][1] - z; if (dx * dx + dz * dz <= r2) fn(i); }
      }
    };
    const gedeckt = new Uint8Array(zellen.length);
    for (let i = 0; i < zellen.length; i++) {
      if (gedeckt[i]) continue;
      // Kandidaten: Zellen bis 0,6 * abstand um die erste ungedeckte Zelle (sie selbst bleibt immer möglich)
      let best = i, bestN = -1;
      nahe(zellen[i][0], zellen[i][1], (0.6 * abstand) ** 2, (j) => {
        let n = 0;
        nahe(zellen[j][0], zellen[j][1], a2, (m) => { if (!gedeckt[m]) n++; });
        if (n > bestN || (n === bestN && j < best)) { bestN = n; best = j; }
      });
      const [lx, lz] = zellen[best];
      nahe(lx, lz, a2, (m) => { gedeckt[m] = 1; });
      gedeckt[i] = 1;
      out.push(decke ? { x: lx, y: y + opts.hoehe, z: lz, typ, einbau: 'decke' } : { x: lx, y: y - 1, z: lz, typ, einbau: 'boden' });
    }
  }
  return out;
}

module.exports = { lichtRaster };
