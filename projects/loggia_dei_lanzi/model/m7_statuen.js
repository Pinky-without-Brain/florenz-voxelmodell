'use strict';
// Modul 7 – Statuen (optional): vereinfachte Blockfiguren, nicht nach Vorbild. Katalog §8.
// Die Figuren sitzen zentriert auf den Sockeln; Höhen zählen ab Oberkante Sockel.
const G = require('./_gemeinsam.js');

module.exports = {
  module: 7,
  build(ctx) {
    const { T } = G;
    const tier = (w, cells, L0, L1, typ) => { for (const c of cells) for (let L = L0; L <= L1; L++) G.setL(w, c, L, typ); };
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
      if (arm) G.setL(w, arm, b + 2, T.bronze);
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
  }
};
