'use strict';
// Modul 8 – Innenräume und Begehbarkeit (Katalog §8a, nach dem Rohbau): Ladentreppen (Wendeltreppen, die
// rautenförmigen Läden sind für einen geraden Lauf zu klein), Treppe von der Loggia in den Korridor (Spielzugang,
// nicht belegt), Ladeneinrichtung, Bilder im Gang, Licht, Deklarationen für R13/R14.
const G = require('./_pv.js');
const { bildZelle } = require('./m4_korridor.js');

const FARBEN = ['rot', 'blau', 'gelb', 'gruen', 'braun'];

module.exports = {
  module: 8,
  build(ctx) {
    const B = G.belegung(ctx);
    const { T, ZELLEN } = G;

    // 2 Ladentreppen
    const lt = ctx.part('laden_treppen');
    for (const id of [...G.LADEN_TREPPEN.keys()].sort()) {
      for (const b of G.LADEN_TREPPEN.get(id).bloecke) B.set(lt, b.x, b.y, b.z, b.typ);
    }
    // 3 Treppe Loggia -> Korridor
    if (G.LOGGIA_TREPPE) {
      const tr = ctx.part('loggia_treppe_korridor');
      for (const b of G.LOGGIA_TREPPE.bloecke) B.set(tr, b.x, b.y, b.z, b.typ);
    }

    // 1 Ladeneinrichtung: Tresen 2 × 1 an der Wand auf der Rückseite, nicht im Treppenfuß, nicht vor der Tür
    const ein = ctx.part('laden_einrichtung');
    for (const [id, s] of [...G.LADEN_INNEN].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
      const tr = G.LADEN_TREPPEN.get(id);
      const kand = [...s].map((k) => G.zelle(G.P.ckX(k), G.P.ckZ(k)))
        .filter((c) => !(tr && tr.fuss.has(G.K2(c.x, c.z))) && G.dZone(c) === G.wandDicke + 1 && c.seite !== 'front' &&
          !(c.E ? c.w > -16 : c.w < 14) && B.frei(c.x, G.Y(1), c.z))
        .sort((a, b) => (a.x - b.x) || (a.z - b.z));
      for (const c of kand.slice(0, 2)) B.setL(ein, c, 1, T.holz);
    }

    // 4 Bilder im Gang (Autoritratti-Sammlung, vereinfacht): Rahmen Gold, Feld Keramikfarbe
    const bi = ctx.part('korridor_bilder');
    for (const c of ZELLEN) {
      if (!c.K || c.T) continue;
      for (let L = 18; L <= 21; L++) {
        if (!bildZelle(c, L)) continue;
        const r = ((Math.floor(c.u) % 10) + 10) % 10;
        const rand = r === 0 || r === 5 || L === 18 || L === 21;
        const farbe = FARBEN[((Math.floor(c.u / 10) % 5) + 5) % 5];
        B.setL(bi, c, L, rand ? T.gold : G.WZ.fresko(farbe));
      }
    }

    // 5 Licht
    const li = ctx.part('raum_licht');
    for (const l of G.LICHT_LISTE) B.set(li, l.x, l.y, l.z, T.licht);

    // Deklarationen (R14): Luft unter der Brücke (Bögen, Auskragungen) und unter den Korridorbrücken über Fahrbahn
    // und Via de' Bardi ist außen; sie ist nur überdeckt
    const unten = [];
    for (const c of ZELLEN) {
      const bis = c.K && !c.E && !c.W && !c.T ? G.Y(13) : G.Y(-1);
      for (let y = c.gt + 1; y <= bis; y++) if (B.frei(c.x, y, c.z)) unten.push({ x: c.x, y, z: c.z });
    }
    ctx.oeffnung(unten, 'arkade');
  }
};
