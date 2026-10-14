'use strict';
// Modul 1 – Hauptfassade (Katalog §2): Fassadenstreifen FA (w < t), 21 Achsen, Rundbogenfenster 7 × 13 (Rahmen, Glas),
// Kniefenster, Hauptportal 9 × 15 (offen, deklariert, Laibung 2), Rustika mit Fugen, Kranzgesims mit Auskragung 2.
// Fenster und Laibungen gehören zum Wandbauteil ihres Geschosses (lagenweise gebaut, R3).
const G = require('./_pi.js');
const RA = require('./_raum.js');

module.exports = {
  module: 1,
  build(ctx) {
    const B = G.belegung(ctx);
    const { T, MATERIAL } = G;
    const fa = MATERIAL.filter((c) => G.istFA(c, 1) || G.istFA(c, 30));
    const plan = G.bauplan(ctx);
    const teilVon = (L) => (L <= 25 ? 'fassade_eg' : L <= 50 ? 'fassade_pn' : 'fassade_og');
    const fluegel = [];
    for (const c of fa) {
      for (let L = 1; L <= G.H_TOP; L++) {
        if (!G.istFA(c, L)) continue;
        const tiefe = c.d8;
        const dp = c.u - G.PORTAL_U;
        const teil = teilVon(L);
        // offene Torflügel (Holz) an der Innenseite der Laibung: eigenes Bauteil nach der Wand
        if (L <= 9 && tiefe >= G.t(c, L) && Math.abs(dp) >= 3.5 && Math.abs(dp) < 4.5) { fluegel.push([c, L]); plan.luftL(c, L); continue; }
        if (RA.tuer(c, L)) { plan.luftL(c, L); continue; }
        if (RA.ausstattung(c.x, G.Y(L), c.z)) continue;   // Wappen (Modul 8)
        const op = G.fassadenOeffnung(c, L);
        if (op === 'portal') { plan.luftL(c, L, 'tor'); continue; }
        if (op === 'laibung' || op === 'rahmen') { plan.festL(teil, c, L, T.forte); continue; }
        if (op === 'glas') { plan.festL(teil, c, L, T.glas); continue; }
        if (op === 'luft') { plan.laibungL(c, L); continue; }
        if (tiefe === 1 && G.fuge(c, L, c.u, false)) { plan.luftL(c, L, 'relief'); continue; }
        plan.festL(teil, c, L, T.rustika);
      }
    }
    plan.bauen();
    const po = ctx.part('hauptportal');
    for (const [c, L] of fluegel) B.ersetzeLuft(po, c.x, G.Y(L), c.z, T.holz);

    // Kranzgesims: Lage 75..76 auf w < 4, Auskragung bis w = −2 (Lage 76), Konsolen w = −1 (Lage 75) jede 4. Zelle
    const ge = ctx.part('fassade_gesims');
    for (const L of G.H_GESIMS) for (const c of fa) if (c.w < 4) B.setL(ge, c, L, T.forte);
    const bb = G.MH.bbox;
    for (const L of [75, 76]) {
      for (let x = bb.x0 - 3; x <= bb.x1 + 3; x++) for (let z = bb.z0 - 3; z <= bb.z1 + 3; z++) {
        const l = G.R.toLocal(x, z);
        if (l.u < 0 || l.u >= 345.5 || l.w >= 0 || l.w < -2 || G.MH.innen(x, z)) continue;
        if (L === 75 && !(l.w >= -1 && ((Math.floor(l.u) % 4) + 4) % 4 === 0)) continue;
        // nur mit Flächenkontakt zum schon gesetzten Gesims (im gedrehten Raster hängen manche Zellen nur über Ecken)
        if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => ctx.grid.has(x + dx, G.Y(L), z + dz))) continue;
        B.set(ge, x, G.Y(L), z, T.forte);
      }
    }
  }
};
