'use strict';
// Modul 7 – Statuen (optional): vereinfachte Blockfiguren, nicht nach Vorbild. Katalog §8.
// Die Figuren sitzen zentriert auf den Sockeln; Höhen zählen ab Oberkante Sockel.
const G = require('./_gemeinsam.js');

module.exports = {
  module: 7,
  build(ctx) {
    const { T } = G;
    const B = G.belegung(ctx);
    const tier = (w, cells, L0, L1, typ) => { for (const c of cells) for (let L = L0; L <= L1; L++) B.setL(w, c, L, typ); };
    const sk = (id) => G.SOCKEL[id];

    // Perseus (bronze): Körper 2 x 2 x 4, Kopf 1 x 1 x 1, seitlich auf Höhe 3 der Arm mit dem Medusenkopf (1 Zelle).
    {
      const s = sk('sockel_perseus'), b = s.h + 1;
      const w = ctx.part('perseus');
      const koerper = G.zentriert(s.u, s.w, 2, 2);
      tier(w, koerper, b, b + 3, T.bronze);
      const kopf = G.zentriert(s.u, s.w, 1, 1);
      tier(w, kopf, b + 4, b + 4, T.bronze);
      // Arm: freie Nachbarzelle des Körpers in +u-Richtung (Rahmen LL), flächig angebunden
      const ids = new Set(koerper.map((c) => c.x * 16384 + c.z));
      const arm = koerper.map((c) => [G.zelleAn(c.x + 1, c.z), G.zelleAn(c.x, c.z + 1)]).flat()
        .find((c) => c && !ids.has(c.x * 16384 + c.z));
      if (arm) B.setL(w, arm, b + 2, T.bronze);
    }

    // Sabinerinnen (marmor_weiss): dreistufig 4 x 4 x 4, 2 x 2 x 3, 1 x 1 x 2 -> Höhe 9.
    {
      const s = sk('sockel_sabinerinnen'), b = s.h + 1;
      const w = ctx.part('sabinerinnen');
      tier(w, G.zentriert(s.u, s.w, 4, 4), b, b + 3, T.weiss);
      tier(w, G.zentriert(s.u, s.w, 2, 2), b + 4, b + 6, T.weiss);
      tier(w, G.zentriert(s.u, s.w, 1, 1), b + 7, b + 8, T.weiss);
    }

    // Gruppen: 3 x 3 x 4 und darüber 2 x 2 x 3 -> Höhe 7.
    for (const [id, sid] of [['herkules_nessus', 'sockel_herkules'], ['polyxena', 'sockel_polyxena'], ['menelaos_patroklos', 'sockel_menelaos']]) {
      const s = sk(sid), b = s.h + 1;
      const w = ctx.part(id);
      tier(w, G.zentriert(s.u, s.w, 3, 3), b, b + 3, T.weiss);
      tier(w, G.zentriert(s.u, s.w, 2, 2), b + 4, b + 6, T.weiss);
    }

    // Sechs Frauenfiguren an der Rückwand: 2 x 2 x 5 auf den 2 x 2-Sockeln.
    {
      const w = ctx.part('rueckwand_figuren');
      for (const u of G.RUECKWAND_SOCKEL_U) tier(w, G.rechteck(u, u + 1, 19, 20), 3, 7, T.weiss);
    }

    // Medici-Löwen: 2 (u) x 3 (w) x 2, Lage 1..2 (K5: Y 68), beidseits der Treppe.
    {
      const w = ctx.part('medici_loewen');
      for (const l of G.LOEWEN) tier(w, G.rechteck(l.u[0], l.u[1], l.w[0], l.w[1]), 1, 2, T.weiss);
    }

    // Diagonalrisse schließen (BEGEHBARKEIT.md §1.4): Zwei feste Zellen derselben Lage, die sich nur an einer Kante berühren
    // (beide Kreuzzellen leer), bekommen eine Verbindungszelle in der Maske (größerer Randabstand, Material der ersten Zelle).
    // Reservierte Luft (Türen, Treppenraum) und Zellen außerhalb der Maske bleiben unberührt.
    {
      const w = ctx.part('rissfuellung');
      const { xOfKey, yOfKey, zOfKey, packKey } = require('../../../tools/geom/grid.js');
      const fest = (x, y, z) => B.typ.get(packKey(x, y, z)) != null;
      // Füllzelle: bevorzugt mit festem Nachbarn darüber oder darunter (sonst hinge sie und machte die Luft darunter zur Innenluft);
      // ohne Halt nur außerhalb der Balusterlage 31
      const halt = (x, y, z) => fest(x, y - 1, z) || fest(x, y + 1, z);
      const geht = (x, y, z) => B.freiXYZ(x, y, z) && G.inMaske(x, z) && (halt(x, y, z) || y !== G.lageY(31));
      for (let pass = 0; pass < 6; pass++) {
        const neu = new Map();
        for (const [k, typ] of B.typ) {
          if (typ == null) continue;
          const x = xOfKey(k), y = yOfKey(k), z = zOfKey(k);
          for (const dz of [1, -1]) {
            if (!fest(x + 1, y, z + dz) || fest(x + 1, y, z) || fest(x, y, z + dz)) continue;
            const a = geht(x + 1, y, z), b = geht(x, y, z + dz);
            let p = null;
            if (a && b) {
              const ha = halt(x + 1, y, z), hb = halt(x, y, z + dz);
              p = ha !== hb ? (ha ? [x + 1, z] : [x, z + dz]) : (G.zelleAn(x + 1, z).d8 >= G.zelleAn(x, z + dz).d8 ? [x + 1, z] : [x, z + dz]);
            }
            else if (a) p = [x + 1, z]; else if (b) p = [x, z + dz];
            if (p) neu.set(packKey(p[0], y, p[1]), [p[0], y, p[1], typ]);
          }
        }
        if (!neu.size) break;
        const liste = [...neu.values()].sort((p, q) => p[1] - q[1] || p[0] - q[0] || p[2] - q[2]);
        for (const [x, y, z, typ] of liste) B.put(w, x, y, z, typ);
      }
      // Standflächen auf Statuensockeln und Figuren (Boden fest, 3 Luftzellen darüber) sind nicht zu besteigen (R13)
      const unz = [];
      const sockel = [...Object.values(G.SOCKEL).flatMap((q) => G.rechteck(q.u[0] - 1, q.u[1] + 1, q.w[0] - 1, q.w[1] + 1)),
        ...G.RUECKWAND_SOCKEL_U.flatMap((u) => G.rechteck(u - 1, u + 2, 18, 21)), ...G.LOEWEN.flatMap((l) => G.rechteck(l.u[0] - 1, l.u[1] + 1, l.w[0] - 1, l.w[1] + 1))];
      for (const c of new Set(sockel)) {
        for (let L = 2; L <= 14; L++) {
          const y = G.lageY(L);
          if (fest(c.x, y - 1, c.z) && !B.belegt(c.x, y, c.z) && !B.belegt(c.x, y + 1, c.z) && !B.belegt(c.x, y + 2, c.z)) unz.push({ x: c.x, y, z: c.z });
        }
      }
      if (unz.length) ctx.unzugaenglich(unz, 'Standflächen auf Statuensockeln und Figuren: Die Kunstwerke sind keine Podeste, die Spielfigur soll sie nicht besteigen.');
    }
  }
};
