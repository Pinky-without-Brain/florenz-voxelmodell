'use strict';
// Modul 4 – Kreuzgewölbe. Katalog §5. Die Gewölbe liegen im gedrehten Rahmen LL: Die Laibung wird je Weltzelle aus
// den Index-Koordinaten (U, W) der Zellmitte ausgewertet (Tonnenprofile aus ctx.arches.profileForRise, Laibung =
// max der beiden Tonnen wie vaults.groinVault), Flächenkontakt über ctx.vaults.connectEdges.
// K0: Gewölbe lassen belegte Zellen aus (Gurtring, Wände, Pfeiler); die Peducci sind Details der Pilaster.
// B3: Über den Gewölben liegt eine Aufschüttung (Hinterfüllung) bis unter die Terrasse (Lage 27), sonst bliebe über den
// Gewölbeschultern ein leerer Hohlraum ohne Zugang. In den Scheiteln hängen Laternen (Seelaternen) in der Gewölbeschale.
const G = require('./_gemeinsam.js');

module.exports = {
  module: 4,
  build(ctx) {
    const { T, ZELLEN } = G;
    const B = G.belegung(ctx);
    const { profileForRise } = ctx.arches;
    const { connectEdges } = ctx.vaults;
    const THICK = 2;                                       // Dicke 2 (Extrados Lage 24 am Scheitel)
    const NB = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    const hoehe = (c) => G.gewoelbeHoehe(c, profileForRise);
    // Untere Lage der Laibung einer Zelle (Kämpfer 13 -> erste Gewölbelage 14)
    const lo = (c) => G.GEWOELBE_BASIS + Math.floor(hoehe(c).h);
    const gurt = (c) => G.GURT_U.some(([a, b]) => c.ru >= a && c.ru <= b);

    // Laternenplätze: je Joch zwei Zellen auf der Längsachse (u_m -/+ 6, w-Mitte); die unterste Schalenzelle wird zur Laterne
    const wm = (G.GEWOELBE_W.w0 + G.GEWOELBE_W.w1) / 2;
    const laternen = new Map();                            // "x,z" -> Zelle
    for (const j of G.JOCHE) {
      for (const du of [-6, 6]) {
        const c = G.naechste(ZELLEN.filter((q) => G.imGewoelbe(q) && q.ru >= j.u0 && q.ru <= j.u1), j.m + du, wm);
        laternen.set(c.x + ',' + c.z, c);
      }
    }

    function joch(k) {
      const j = G.JOCHE[k];
      const cells = [];
      for (const c of ZELLEN) {
        if (!G.imGewoelbe(c) || c.ru < j.u0 || c.ru > j.u1) continue;
        let yLo = lo(c);
        let yHi = yLo + THICK - 1;
        for (const [dx, dz] of NB) {
          const n = G.zelleAn(c.x + dx, c.z + dz);
          if (n && G.imGewoelbe(n)) yHi = Math.max(yHi, lo(n));
        }
        // Gurtbogen über der Pfeilerachse (2 breit): eine Lage tiefer als die Laibung
        if (gurt(c)) yLo = Math.max(G.GEWOELBE_BASIS, yLo - 1);
        // Kämpferstütze: über einem Kapitell reicht die Schale bis auf Lage 14 hinunter
        if (G.kapitellDarunter(c)) yLo = G.GEWOELBE_BASIS;
        const lampe = laternen.has(c.x + ',' + c.z);
        for (let L = yLo; L <= yHi; L++) {
          if (lampe && L === yLo) continue;                // Laternenplatz bleibt für den Teil "gewoelbe_laternen" frei
          cells.push({ x: c.x, y: G.lageY(L), z: c.z });
        }
      }
      return cells;
    }

    function bauJoch(id, k) {
      const w = ctx.part(id);
      const cells = joch(k);
      const extra = connectEdges(cells);
      const alle = cells.concat(extra).filter((p) => B.freiXYZ(p.x, p.y, p.z)).sort((a, b) => a.y - b.y || a.x - b.x || a.z - b.z);
      for (const p of alle) {
        B.put(w, p.x, p.y, p.z, T.serena);
      }
    }

    bauJoch('kreuzgewoelbe_west', 0);
    bauJoch('kreuzgewoelbe_mitte', 1);
    bauJoch('kreuzgewoelbe_ost', 2);

    // 4) Konsolsteine (peducci) 2 x 2 x 2, Lage 11..12, w 19..20 – Details; der Pilaster hat ihre Zellen ausgespart.
    const kon = ctx.part('konsolen_peducci');
    for (const c of ZELLEN) {
      for (let L = G.KONSOL_L[0]; L <= G.KONSOL_L[1]; L++) {
        if (G.konsole(c.iu, c.iw, L) && B.frei(c, L)) B.setL(kon, c, L, T.ornament);
      }
    }

    // 5) Laternen in den Gewölbescheiteln: Seelaternen anstelle der untersten Schalenzelle
    const lt = ctx.part('gewoelbe_laternen');
    for (const c of laternen.values()) B.setL(lt, c, lo(c), G.WZ.typ('licht'));

    // 6) Hinterfüllung: freie Zellen über der höchsten festen Zelle der Säule (Gewölbeschale, Gurtring) bis Lage 27 (Unterkante
    //    der Terrasse), Bruchstein. Gilt für alle Säulen unter der Terrasse mit Raum darunter (w 3..21).
    const hf = ctx.part('gewoelbe_hinterfuellung');
    for (const c of ZELLEN) {
      if (!G.imGewoelbe(c)) continue;
      let top = -1;
      for (let L = 27; L >= G.GEWOELBE_BASIS; L--) if (B.fest(c.x, G.lageY(L), c.z)) { top = L; break; }
      if (top < 0) continue;
      for (let L = top + 1; L <= 27; L++) if (B.frei(c, L)) B.setL(hf, c, L, T.bruch);
    }
  }
};
