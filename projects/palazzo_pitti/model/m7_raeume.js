'use strict';
// Modul 7 – Raumteilung, Treppen, Zugänge, Licht (Katalog §8): Spinnwand und Trennwände (2 dick, Putz) mit Türen 3 × 5,
// Appartamenti-Wände, Podesttreppen EG → PN → OG (West, Ost, Nebenbau), Flügeltreppen auf die Dachterrassen mit
// Brüstung, Außenstufen vor Arkaden, Portal und Tor (Luftraum ≤ 3), Lichter in allen Räumen.
const G = require('./_pi.js');
const RA = require('./_raum.js');
const PAL = require('../../../tools/spec/palette.js');
const ground = require('../../../tools/city/ground_stadt.js');

const DIR_VON = (dx, dz) => (dz === -1 ? 'n' : dx === 1 ? 'o' : dz === 1 ? 's' : 'w');

module.exports = {
  module: 7,
  build(ctx) {
    const B = G.belegung(ctx);
    const { T, MATERIAL } = G;

    // 1 Innenwände (Putz), Türen offen
    const plan = G.bauplan(ctx);
    for (const [g, def] of Object.entries(RA.GESCHOSSE)) {
      const bis = g === 'eg' ? G.DECKEN.eg[0] - 1 : g === 'pn' ? G.DECKEN.pn[0] - 1 : G.DECKEN.og[0] - 1;
      for (const c of MATERIAL) {
        if (c.zone !== 'H' || c.dz <= G.t(c, def.stand + 2)) continue;
        const sp = RA.spinnwand(c), tr = RA.trennwand(c, g), ap = RA.appartamenti(c, g);
        if (!sp && !tr && !ap) continue;
        const teil = sp ? 'spinnwand_haupt' : ap ? 'appartamenti_waende' : `trennwaende_${g}`;
        for (let L = def.stand; L <= bis; L++) {
          if (RA.tuer(c, L)) { plan.luftL(c, L); continue; }
          if (RA.ausgespart(c.x, G.Y(L), c.z) || RA.ausstattung(c.x, G.Y(L), c.z)) continue;
          plan.festL(teil, c, L, T.putz);
        }
      }
    }
    plan.bauen();

    // 2 Treppen
    for (const [name, t] of Object.entries(RA.TREPPEN)) {
      if (!t) continue;
      const w = ctx.part(`treppe_${name}`);
      for (const b of t.bloecke) B.set(w, b.x, b.y, b.z, b.typ);
    }

    // 2b Treppenausstieg der Flügeltreppen: Loch im Terrassendach (offen)
    for (const name of ['ali_west', 'ali_ost']) {
      const t = RA.TREPPEN[name];
      if (!t) continue;
      const aus = G.WZ.treppe.treppenloch(t.lauf, 3).filter((c) => c.y >= G.Y(G.F_DACH[0]) && c.y <= G.Y(G.F_DACH[1]) && B.frei(c.x, c.y, c.z));
      if (aus.length) ctx.oeffnung(aus, 'tuer');
    }

    // 3 Brüstung der Flügel-Dachterrassen (Lage 23..24 am Rand), Austritt der Flügeltreppen frei
    const br = ctx.part('ali_bruestung');
    for (const c of MATERIAL) {
      if (c.zone !== 'F' || c.dz !== 1) continue;
      for (const L of [23, 24]) if (!RA.ausgespart(c.x, G.Y(L), c.z)) B.setL(br, c, L, T.forte);
    }

    // 4 Außenstufen: vor jeder offenen Zelle in Lage 1 (Arkade, Portal, Tor) zum Gelände hin bis zu drei Treppenblöcke
    const st = ctx.part('aussenstufen');
    const zellen = new Map();
    for (const c of MATERIAL) {
      if (!B.istLuft(c.x, G.Y(1), c.z) || !ctx.grid.has(c.x, G.Y(0), c.z)) continue;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (G.MH.innen(c.x + dx, c.z + dz)) continue;
        // von außen nach innen steigen: Richtung (−dx, −dz)
        const dir = DIR_VON(-dx, -dz);
        for (let k = 1; k <= 3; k++) {
          const x = c.x + dx * k, z = c.z + dz * k;
          const gt = ground.groundTopY(x, z);
          const y = G.Y(1) - k;                 // Stufe k liegt k tiefer als die Stehhöhe innen − 1
          if (gt >= y) break;
          const kk = x + ',' + z;
          if (zellen.has(kk)) break;
          zellen.set(kk, { x, z, y, gt, dir });
        }
      }
    }
    for (const s of zellen.values()) {
      for (let y = s.gt + 1; y < s.y; y++) B.set(st, s.x, y, s.z, T.forte);
      B.set(st, s.x, s.y, s.z, PAL.treppe('pietra_forte', s.dir));
    }

    // 5 Licht
    const li = ctx.part('raum_licht');
    for (const l of RA.LICHT_LISTE) B.set(li, l.x, l.y, l.z, T.licht);
  }
};
