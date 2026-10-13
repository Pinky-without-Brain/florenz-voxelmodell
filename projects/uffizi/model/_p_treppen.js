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

  // ---------------------------------------------------------------- gerade Läufe auf massivem Unterbau
  const voll = (rolle) => T.volltyp(rolle);
  /**
   * lauf({ start, richtung, stufen, breite, rolle, teil }): Treppenblöcke, massiver Unterbau bis zur Stehhöhe des Startbodens
   * (start.y - 1) und Luftzellen für die Kopffreiheit (Decken bleiben dort offen). Wirft, wenn eine Zelle schon belegt ist.
   */
  const lauf = ({ start, richtung, stufen, breite, rolle, teil }, nurPruefen = false) => {
    const blocks = T.geradeTreppe({ start, richtung, stufen, breite, rolle });
    const fuell = voll(rolle);
    const stufenZellen = [], fuellZellen = [], kopfZellen = [];
    const ok = (i, L) => i >= 0 && (own[i * SLOTS + L] === 0 || own[i * SLOTS + L] === AIR_ID);
    for (const b of blocks) {
      const i = S.at(b.x, b.z);
      const L = Lof(b.y);
      if (!ok(i, L)) { if (nurPruefen) { lauf.fehler = `Stufe (${b.x},${b.y},${b.z})`; return false; } throw new Error(`${teil}: Stufe auf belegter Zelle (${b.x},${b.y},${b.z})`); }
      stufenZellen.push([i, L, b.typ]);
      for (let y = start.y; y < b.y; y++) {
        if (!ok(i, Lof(y))) { if (nurPruefen) { lauf.fehler = `Unterbau (${b.x},${y},${b.z})`; return false; } throw new Error(`${teil}: Unterbau auf belegter Zelle (${b.x},${y},${b.z})`); }
        fuellZellen.push([i, Lof(y)]);
      }
    }
    for (const c of T.treppenloch(blocks.lauf)) {
      const i = S.at(c.x, c.z);
      if (!ok(i, Lof(c.y))) { if (nurPruefen) { lauf.fehler = `Kopf (${c.x},${c.y},${c.z})`; return false; } throw new Error(`${teil}: Kopffreiheit blockiert bei (${c.x},${c.y},${c.z})`); }
      kopfZellen.push([i, Lof(c.y)]);
    }
    if (nurPruefen) return true;
    for (const [i, L, typ] of stufenZellen) claim(i, L, teil, typ);
    for (const [i, L] of fuellZellen) claim(i, L, teil, fuell);
    for (const [i, L] of kopfZellen) air(i, L);
    return blocks;
  };
  P.lauf = lauf;

  // ---------------------------------------------------------------- Scalone del Vasari (Ostflügel, Halle hinter der Mittelwand, Joch 0 und 1)
  // Lauf 1 (EG -> Piano nobile, 20 Stufen) nach Süden, Lauf 2 (Piano nobile -> Galerie, 16 Stufen) daneben zurück nach Norden;
  // das Podest am Südende ist der Boden des Piano nobile. Läufe 5 breit (nach Westen), dazwischen keine Lücke.
  {
    const spec = (x1, z1) => [
      { start: { x: x1, y: B + 1, z: z1 }, richtung: 's', stufen: 20, breite: 5, rolle: 'pietra_serena', teil: 'scalone_treppe' },
      { start: { x: x1 - 9, y: B + 21, z: z1 + 20 }, richtung: 'n', stufen: 16, breite: 5, rolle: 'pietra_serena', teil: 'scalone_treppe' }
    ];
    const c = S.R.toWorld(72, 16);
    let best = null;
    for (let dx = -14; dx <= 14; dx++) {
      for (let dz = -12; dz <= 12; dz++) {
        const x1 = Math.round(c.x) + 5 + dx, z1 = Math.round(c.z) + dz;
        const [a1, a2] = spec(x1, z1);
        if (!lauf(a1, true) || !lauf(a2, true)) continue;
        const d = Math.hypot(dx, dz);
        if (!best || d < best.d) best = { x1, z1, d };
      }
    }
    if (!best) throw new Error('Scalone del Vasari: kein freier Platz gefunden');
    const [a1, a2] = spec(best.x1, best.z1);
    const l1 = lauf(a1), l2 = lauf(a2);
    P.scalone = { lauf1: l1.lauf, lauf2: l2.lauf, x1: best.x1, z1: best.z1, z2: best.z1 + 20 };
  }

  // ---------------------------------------------------------------- Treppe zum Cavalcavia (Südwestspitze)
  // Vom Galerieboden (Lage 36, Y 101) nach Westen hinab auf ein Podest in Höhe des Korridorbodens (Y 78); von dort führt die Tür der
  // Kante 1 (Lage 14..20) in den Lungarno-Korridor. 23 Stufen, 6 breit wie die Tür; der Aufstieg zeigt nach Osten.
  {
    const tuer = new Set();
    for (let i = 0; i < N; i++) {
      if (P.nearE[i] !== 1) continue;
      let t = true;
      for (let L = 14; L <= 20 && t; L++) t = own[i * SLOTS + L] === AIR_ID;
      if (t) tuer.add(S.cx[i] * 100000 + S.cz[i]);
    }
    const TB = 6;
    const platzFrei = (x, z) => { const i = S.at(x, z); if (i < 0) return false; for (let L = 1; L <= 13; L++) { const v = own[i * SLOTS + L]; if (v !== 0 && v !== AIR_ID) return false; } return true; };
    let best = null;
    for (let tx = -342; tx <= -328; tx++) {
      for (let z0 = 1120; z0 <= 1138; z0++) {
        for (let px = 1; px <= 8; px++) {
          const x0 = tx + px;
          // Podest x tx .. x0 - 1, z z0 .. z0 + TB - 1: alle Zellen frei und mindestens eine neben einer Türzelle
          let ok = true, nachbar = 0;
          for (let x = tx; x < x0 && ok; x++) for (let z = z0; z < z0 + TB && ok; z++) {
            ok = platzFrei(x, z);
            if (ok && (tuer.has((x - 1) * 100000 + z) || tuer.has(x * 100000 + z - 1) || tuer.has(x * 100000 + z + 1))) nachbar++;
          }
          if (!ok || nachbar < 1) continue;
          const spec = { start: { x: x0, y: B + 14, z: z0 }, richtung: 'o', stufen: 23, breite: TB, rolle: 'pietra_serena', teil: 'korridor_treppe' };
          if (!lauf(spec, true)) continue;
          const score = px * 10 - nachbar * 4 + Math.abs(z0 + 2.5 - 1134.5);
          if (!best || score < best.score) best = { tx, z0, x0, spec, score };
        }
      }
    }
    if (!best) throw new Error('Treppe zum Cavalcavia: kein freier Platz (' + lauf.fehler + ')');
    for (let x = best.tx; x < best.x0; x++) for (let z = best.z0; z < best.z0 + TB; z++) {
      const i = S.at(x, z);
      for (let L = 1; L <= 13; L++) claim(i, L, 'korridor_treppe', voll('pietra_serena'));
    }
    lauf(best.spec);
    P.korridorTreppe = { podestX: [best.tx, best.x0 - 1], z: [best.z0, best.z0 + TB - 1], startX: best.x0 };
  }
};
