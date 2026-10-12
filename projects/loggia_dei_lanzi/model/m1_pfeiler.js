'use strict';
// Modul 1 – Pfeiler mit Halbsäulen. Katalog §2. Pfeiler und Pilaster werden vor den Wänden gebaut;
// die Wände lassen belegte Zellen aus (K0: gleichrangig -> zuerst gebaut gewinnt).
const G = require('./_gemeinsam.js');

module.exports = {
  module: 1,
  build(ctx) {
    const { T, ZELLEN } = G;
    const inP = (c) => G.pfeilerIndex(c.iu);
    const fase = (c) => {                        // vier Eckzellen des 6 x 6-Pfeilers
      const [a, b] = G.PFEILER[G.pfeilerIndex(c.iu)];
      return (c.iu === a || c.iu === b) && (c.iw === 0 || c.iw === 5);
    };

    // 1) Sockel: je Frontpfeiler w 0..5, Lage 1..2, 6 x 6 voll.
    const sockel = ctx.part('sockel_pfeiler');
    for (const c of ZELLEN) {
      if (c.iw <= 5 && inP(c) >= 0) for (let L = 1; L <= 2; L++) G.setL(sockel, c, L, T.serena);
    }

    // 2) Schaft Lage 3..11 (ohne Fase) in Pietra forte; Halbsäulen in Marmor an Bogenseiten und Hallenseite.
    // Entscheidung: Die Halbsäulen der Endpfeiler P0/P3 zur Halle entfallen (dort stehen die Seitenwände).
    const schaft = ctx.part('pfeiler_front');
    for (const c of ZELLEN) {
      for (let L = 3; L <= 11; L++) {
        if (c.iw <= 5 && inP(c) >= 0 && !fase(c)) G.setL(schaft, c, L, T.forte);
        else if (G.halbsaeuleBogen(c.iu, c.iw, L) || G.halbsaeuleHalle(c.iu, c.iw, L)) G.setL(schaft, c, L, T.weiss);
      }
    }

    // 3) Kapitelle Lage 12..13: 6 x 6 voll (K0: "Fase wie oben" widerspricht "6 x 6 voll"; das Kapitell lädt aus).
    const kap = ctx.part('kapitelle_front');
    for (const c of ZELLEN) {
      if (c.iw <= 5 && inP(c) >= 0) for (let L = 12; L <= 13; L++) G.setL(kap, c, L, T.ornament);
    }

    // 4) Rückwandpilaster: w 19..21 bei den Pfeiler-u-Bereichen (Öffnung und Konsolsteine gewinnen, K0).
    const pil = ctx.part('pilaster_rueckwand');
    const mat = { sockel: T.serena, schaft: T.forte, kapitell: T.ornament };
    for (const c of ZELLEN) {
      if (c.iw < 19 || c.iw > 21) continue;
      for (let L = 1; L <= 13; L++) {
        const art = G.pilaster(c.iu, c.iw, L);
        if (art) G.setL(pil, c, L, mat[art]);
      }
    }
  }
};
