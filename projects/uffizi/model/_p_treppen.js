'use strict';
// Stufe 6: Treppen aus echten Treppenblöcken (BEGEHBARKEIT.md §1.3, Bibliothek tools/wahrzeichen/treppe.js).
//  - Wendeltreppen in den Flügelenden und im Arno-Riegel: quadratische Spirale 5 x 5 (Kern 1, Ringbreite 2), 1 Block Anstieg je
//    Viertelumlauf, deshalb liegen die Ausstiege bündig mit den Geschossböden (EG und Piano nobile/Galerie an der Nordwestecke,
//    Mezzanin an der Südostecke).
//  - Scalone del Vasari und Treppe zum Corridoio: gerade Läufe auf massivem Unterbau.
// Treppen stehen in Weltachsen; die Plätze werden im gedrehten Rahmen UF gesucht (Zellen müssen frei sein, Kopffreiheit 3).

const WZ = require('../../../tools/wahrzeichen');
const T = WZ.treppe;

const TURM = [
  // Name, Zielpunkt im Rahmen UF (u, w), Suchradius
  { name: 'westen_nord', u: -20, w: 24 },
  { name: 'westen_sued', u: -20, w: 264 },
  { name: 'osten_sued', u: 46, w: 264 },
  { name: 'sued_west', u: -20, w: 288 },
  { name: 'sued_ost', u: 62, w: 288 }
];

module.exports = function treppen(P) {
  const { S, N, own, claim, air, SLOTS, AIR_ID } = P;
  const B = S.BODEN;
  const Lof = (y) => y - B;

  /** Zelle (Welt) im Plan frei (nicht belegt; bewusst leere Zellen zählen als frei)? */
  const frei = (x, y, z) => {
    const i = S.at(x, z);
    if (i < 0) return false;
    const L = Lof(y);
    if (L < 1) return true;
    const v = own[i * SLOTS + L];
    return v === 0 || v === AIR_ID;
  };
  const freiSpalte = (x, z, y0, y1) => { for (let y = y0; y <= y1; y++) if (!frei(x, y, z)) return false; return true; };

  /** Block eines Laufs belegen (Plan), falls die Zelle frei ist. Zellen ab Lage 1 (Y 66). */
  const setze = (b, teil) => {
    const i = S.at(b.x, b.z);
    const L = Lof(b.y);
    if (i < 0 || L < 1) return false;
    return claim(i, L, teil, b.typ);
  };

  // ---------------------------------------------------------------- Wendeltreppen
  const spiralPlatz = (u, w, radius) => {
    const c = S.R.toWorld(u, w);
    let best = null;
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const x = Math.round(c.x) + dx, z = Math.round(c.z) + dz;
        let ok = true;
        for (let ax = -2; ax <= 2 && ok; ax++) for (let az = -2; az <= 2 && ok; az++) ok = freiSpalte(x + ax, z + az, B + 1, B + 40);
        if (!ok) continue;
        // Ausstiege: neben der Nordwestecke (EG, Piano nobile, Galerie) und der Südostecke (Mezzanin) muss Boden mit Kopffreiheit liegen
        const nw = [[-3, -2], [-3, -1], [-2, -3], [-1, -3]], se = [[3, 1], [3, 2], [1, 3], [2, 3]];
        const aus = (liste, yStand) => liste.some(([a, b]) => freiSpalte(x + a, z + b, yStand, yStand + 2));
        if (!(aus(nw, B + 1) && aus(nw, B + 21) && aus(nw, B + 37) && aus(se, B + 15))) continue;
        const d = Math.hypot(dx, dz);
        if (!best || d < best.d) best = { x, z, d };
      }
    }
    return best;
  };

  P.tuerme = [];
  for (const t of TURM) {
    const pl = spiralPlatz(t.u, t.w, 40);
    if (!pl) { P.tuerme.push({ name: t.name, platz: null }); continue; }
    const blocks = T.wendeltreppe({ mitte: { x: pl.x, z: pl.z }, radiusInnen: 0, radiusAussen: 2, yVon: B, yBis: B + 36,
      rolle: 'pietra_serena', drehsinn: 'rechts', kern: true });
    for (const b of blocks) setze(b, 'treppen');
    // Deckenlöcher: der Schacht 5 x 5 bleibt in den Decken (Lage 14, 20, 36) offen, soweit die Spirale ihn nicht füllt
    for (let ax = -2; ax <= 2; ax++) {
      for (let az = -2; az <= 2; az++) {
        const i = S.at(pl.x + ax, pl.z + az);
        for (const L of [14, 20, 36]) air(i, L);
      }
    }
    P.tuerme.push({ name: t.name, platz: { x: pl.x, z: pl.z } });
  }
};
