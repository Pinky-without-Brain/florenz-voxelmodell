'use strict';
// Modul 4 – Corridoio Vasariano auf der Brücke und am Oltrarno-Ufer (Katalog §5). Boden Lage 14..15 (Y 77..78),
// Gang Lage 16..22, Decke Lage 23..24. Wandstärke t_w aus dem ungeschnittenen Abstandsfeld (keine Stirnwand an den Schnitten).
const G = require('./_pv.js');

// Bilderfelder im Gang (Modul 8 Teil 4): 6 breit × 4 hoch, Unterkante Lage 18, Abstand 10 in u, innerste Wandlage
function bildZelle(c, L) {
  if (!c.K || !c.kWand || c.dK !== c.tw || c.tw < 2 || L < 18 || L > 21) return false;
  const r = ((Math.floor(c.u) % 10) + 10) % 10;
  if (r > 5) return false;
  for (let du = -7; du <= 7; du++) if (G.korridorFenster({ ...c, u: c.u + du, dK: 1 }, 19)) return false;
  return true;
}

module.exports = {
  module: 4,
  bildZelle,
  build(ctx) {
    const B = G.belegung(ctx);
    const { T, ZELLEN } = G;
    const kor = ZELLEN.filter((c) => c.K && !c.T);

    // 1 Boden außerhalb der Ostläden (dort ist die Ladendecke der Gangboden)
    const bo = ctx.part('korridor_boden_frei');
    for (const c of kor) if (!c.E) for (const L of G.L_DECKE) B.setL(bo, c, L, T.serena);

    // 2 Unterbau an Land: massiv vom Gelände bis Lage 13; Straßen (Via de' Bardi) und Brückenzellen bleiben offen
    const ub = ctx.part('korridor_unterbau');
    for (const c of kor) {
      if (c.E || c.B || c.L || G.strasse(c) || G.nahTurm(c)) continue;
      for (let y = c.gt + 1; y <= G.Y(13); y++) B.set(ub, c.x, y, c.z, c.dK <= 2 ? T.sand : T.mauer);
    }

    // 2b Durchgang am Turm (unter dem Gang auf Konsolen): gepflasterter Boden auf Fahrbahnhöhe, darunter Füllung
    const dg = ctx.part('durchgang_turm');
    for (const c of kor) {
      if (c.E || c.B || c.L || !G.nahTurm(c)) continue;
      for (let y = c.gt + 1; y <= G.Y(-1); y++) B.set(dg, c.x, y, c.z, T.mauer);
      B.setL(dg, c, 0, T.pflaster);
    }

    // 3 Wände mit Fenstern (Glas in den äußeren zwei Lagen, innen Laibung) – Bilderfelder bleiben für Modul 8 frei
    const wa = ctx.part('korridor_waende');
    for (const c of kor) {
      if (!c.kWand) continue;
      for (let L = G.L_GANG[0]; L <= G.L_GANG[1]; L++) {
        if (bildZelle(c, L)) continue;
        const f = G.korridorFenster(c, L);
        if (f) { if (c.dK <= 2) B.setL(wa, c, L, T.glas); continue; }
        B.setL(wa, c, L, T.forte);
      }
    }

    // 4 Decke Lage 23..24 (Lichter in Lage 23 setzt Modul 8)
    const de = ctx.part('korridor_decke');
    for (const c of kor) for (const L of G.L_GANGDECKE) if (!G.istLicht(c.x, G.Y(L), c.z)) B.setL(de, c, L, T.forte);

    // Durchgänge an den Schnitten zu den Uffizien (x = −529) und zum Palazzo Pitti (z = 1311): offen, Gang setzt sich fort
    const tor = [];
    for (const c of kor) {
      if (!G.kGang(c)) continue;
      const amSchnitt = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => !G.MPV.innen(c.x + dx, c.z + dz));
      if (!amSchnitt) continue;
      for (let L = G.L_GANG[0]; L <= G.L_GANG[1]; L++) tor.push({ x: c.x, y: G.Y(L), z: c.z });
    }
    if (tor.length) ctx.oeffnung(tor, 'tor');
  }
};
