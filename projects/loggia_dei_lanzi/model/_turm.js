'use strict';
// Treppenturm in der Rückwand (Spielzugang zur Terrasse, nicht historisch). Wendeltreppe 5 x 5 (Kern 1, Ringbreite 2) mit
// Mantel 7 x 7 in Weltachsen, Tür zur Halle im Norden (Lage 1..3, ggf. mit Tunnel durch die Rückwand), Aufbauhaube über der
// Terrasse mit Tür auf die Terrasse. Der Platz wird einmal gesucht: ganzer Mantel in der Maske, kein Zusammenstoß mit Pilastern,
// Statuensockeln und Konsolen, Tunnel höchstens 3 Zellen, möglichst nahe der Mitte der Rückwand (u -0,5).
const G = require('./_gemeinsam.js');

const LAGE_TERRASSE = 29;            // Oberkante der Terrasse (massive Zelle), Stehhöhe Lage 30
const HAUBE_OBEN = 33;               // Dach der Haube
const LAMPEN_LAGEN = [5, 11, 17, 23];

function blockiert(c) {
  if (!c) return true;
  if (c.rw >= 19 && c.rw <= 21 && G.inPfeilerU(c.ru)) return true;                                       // Pilaster
  if (c.rw >= 19 && c.rw <= 20 && G.RUECKWAND_SOCKEL_U.some((u) => c.ru >= u - 1 && c.ru <= u + 2)) return true;   // Figuren
  if (c.rw >= 19 && c.rw <= 20 && G.KONSOLEN_U.some((k) => c.ru >= k[0] - 1 && c.ru <= k[1] + 1)) return true;     // Peducci
  return c.ru >= 36;
}

let cache = null;
function turm() {
  if (cache) return cache;
  let best = null;
  for (const m of G.ZELLEN) {
    const cx = m.x, cz = m.z;
    let ok = true, hall = 0, koll = 0;
    for (let a = -3; a <= 3 && ok; a++) {
      for (let b = -3; b <= 3; b++) {
        const c = G.zelleAn(cx + a, cz + b);
        if (!c) { ok = false; break; }
        if (blockiert(c)) koll++;
        if (c.rw < 22) hall++;
      }
    }
    if (!ok || koll || hall > 16) continue;
    // Tür im Norden (x cx-2..cx-1): von der Mantelzeile z = cz-3 nach Norden, bis die erste Hallenzelle (rw <= 21) erreicht ist
    let tunnel = 0, tuer = true;
    for (const a of [-2, -1]) {
      let k = 3, gefunden = false;
      for (; k <= 6; k++) {
        const c = G.zelleAn(cx + a, cz - k);
        if (!c || blockiert(c)) break;
        if (c.rw <= 21) { gefunden = true; break; }
      }
      if (!gefunden) tuer = false; else tunnel = Math.max(tunnel, k - 3);
    }
    // Vorplatz vor der Tür frei (Hallenzellen vor dem Tunnel)
    if (!tuer || tunnel > 3) continue;
    const d = Math.abs(m.ru + 0.5);
    if (!best || d < best.d || (d === best.d && tunnel < best.tunnel)) best = { cx, cz, tunnel, d };
  }
  if (!best) throw new Error('Treppenturm: kein Platz in der Rückwand gefunden');
  const { cx, cz, tunnel } = best;
  const tuerUnten = [];                                  // Tür unten + Tunnel: x cx-2..cx-1, z cz-3-tunnel .. cz-3
  for (let k = 0; k <= tunnel; k++) for (const a of [-2, -1]) tuerUnten.push({ x: cx + a, z: cz - 3 - k });
  const tuerOben = [{ x: cx + 1, z: cz - 3 }, { x: cx + 2, z: cz - 3 }];
  cache = { cx, cz, tunnel, tuerUnten, tuerOben, rad: 3 };
  return cache;
}

/** Mantelzelle (Chebyshev-Abstand 3 vom Kern)? */
const imMantel = (t, x, z) => Math.max(Math.abs(x - t.cx), Math.abs(z - t.cz)) === 3;
/** Zelle im 7 x 7-Block des Turms? */
const imTurm = (t, x, z) => Math.max(Math.abs(x - t.cx), Math.abs(z - t.cz)) <= 3;

module.exports = { turm, imMantel, imTurm, LAGE_TERRASSE, HAUBE_OBEN, LAMPEN_LAGEN };
