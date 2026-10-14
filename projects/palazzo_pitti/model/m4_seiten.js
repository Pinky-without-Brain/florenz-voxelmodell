'use strict';
// Modul 4 – Seiten, Rückseiten und westlicher Nebenbau (Katalog §5): Wandbänder dz ≤ t der Zonen H (ohne FA und Höfe)
// und W, Fenster an den Außenkanten ≥ 24, Gesims Lage 75..76 (W: 51..52). Zonengrenzen sind geschlossene Wände.
const G = require('./_pi.js');
const RA = require('./_raum.js');

// Abschnitt der Außenwand: nach der nächsten Außenkante (Kanten in Ringfolge, gedrittelt nach Länge), damit jedes
// Fenster genau einem Bauteil gehört; Wände an Zonengrenzen nach u
const KANTEN = G.MH.kanten();
const GESAMT = KANTEN.reduce((a, k) => a + k.L, 0);
const DRITTEL = [];
{ let sum = 0; for (const k of KANTEN) { DRITTEL.push(Math.min(2, Math.floor((sum + k.L / 2) / (GESAMT / 3)))); sum += k.L; } }
const NAMEN = ['west', 'mitte', 'ost'];
function abschnitt(c) {
  if (c.d8 <= c.dz) { const ak = G.aussenKante(c); if (ak) return NAMEN[DRITTEL[ak.i]]; }
  return c.u < 115 ? 'west' : c.u < 230 ? 'mitte' : 'ost';
}

module.exports = {
  module: 4,
  build(ctx) {
    const B = G.belegung(ctx);
    const { T, MATERIAL } = G;
    const band = MATERIAL.filter((c) => (c.zone === 'H' || c.zone === 'W') && c.dz <= 5);
    const plan = G.bauplan(ctx);
    for (const c of band) {
      for (let L = 1; L <= G.topVon(c); L++) {
        if (!G.imWandband(c, L) || G.istFA(c, L) || G.istHofband(c, L)) continue;
        const teil = c.zone === 'W' ? 'nebenbau_west' : `aussen_waende_${L <= 25 ? 'eg' : 'og'}_${abschnitt(c)}`;
        if (RA.tuer(c, L)) { plan.luftL(c, L); continue; }
        if (G.istAussen(c, L)) {
          const op = G.aussenOeffnung(c, L);
          if (op === 'glas') { plan.festL(teil, c, L, T.glas); continue; }
          if (op === 'rahmen') { plan.festL(teil, c, L, T.forte); continue; }
          if (op === 'luft') { plan.laibungL(c, L); continue; }
          if (c.d8 === 1) { const ak = G.aussenKante(c); if (ak && G.fuge(c, L, ak.s, false)) { plan.luftL(c, L, 'relief'); continue; } }
        }
        plan.festL(teil, c, L, T.rustika);
      }
    }
    plan.bauen();
    const ge = ctx.part('aussen_gesims');
    for (const c of band) {
      if (c.dz > 4) continue;
      for (const L of c.zone === 'W' ? G.W_GESIMS : G.H_GESIMS) B.setL(ge, c, L, T.forte);
    }
  }
};
