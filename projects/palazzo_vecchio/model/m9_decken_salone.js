'use strict';
// Modul 9: Decken, Salone dei Cinquecento und Innenwände (Katalog §10).
// K2: Der Turm (turm_unterbau) steht in Modul 4; alle Decken sparen das Turmpolygon aus (Hohlraum y_rel 1..143 leer).
// K3: treppen_michelozzo entfällt. K4: Salone nur außerhalb der Außenwandbänder (d8 > t(y)).
const pv = require('./pv_lib.js');

module.exports = {
  module: 9,
  build(ctx) {
    const S = pv.state(ctx);
    const g = S.g, TY = pv.TY;
    const kein = (r) => r.zone !== 'T';

    // Geschossdecken: Zellen mit d8 > t, ohne Turm; die Salone-Außenrechtecke und die Lochbänder (Modul 6) sind schon belegt
    const decke = (id, y, minD, ohneSalone) => {
      const w = ctx.part(id);
      S.band(w, g.recs.filter((r) => kein(r) && r.d8 > minD && !(ohneSalone && r.sal)), y, y, () => TY.pietra_serena, id);
    };
    decke('decke_eg', 16, 5, false);
    decke('decke_og1', 33, 4, true);
    decke('decke_og2', 49, 4, true);
    decke('decke_dach', 56, 3, true);

    // Salone: Außenrechteck 112 x 52, Lichtmaß 104 x 44, Wände 4 dick y_rel 17..56, Rahmenpfeiler Pietra serena im Abstand 8
    const sw = ctx.part('salone_waende');
    const L = pv.SAL_LICHT;
    const ring = g.recs.filter((r) => r.sal && !r.salL);
    S.band(sw, ring, 17, 56, (r, y) => {
      if (r.d8 <= pv.tWall(y)) return null;                              // K4: die Außenwand gewinnt
      if (y <= 52) {
        const aufU = (r.u >= L.u0 - 1 && r.u < L.u0) || (r.u >= L.u1 && r.u < L.u1 + 1);
        const aufW = (r.w >= L.w0 - 1 && r.w < L.w0) || (r.w >= L.w1 && r.w < L.w1 + 1);
        if (aufU && r.w >= L.w0 && r.w < L.w1 && (r.w - L.w0) % 8 < 2) return TY.pietra_serena;
        if (aufW && r.u >= L.u0 && r.u < L.u1 && (r.u - L.u0) % 8 < 2) return TY.pietra_serena;
      }
      return TY.putz_sand;
    }, 'salone_waende');

    // Salone-Decke: y_rel 53 als Kassettenraster 8 x 8 (Holz / Pietra serena), y_rel 54..56 massiv
    const sd = ctx.part('salone_decke');
    const licht = g.recs.filter((r) => r.salL);
    S.band(sd, licht, 53, 53, (r, y) => {
      if (r.d8 <= 3) return null;
      const k = Math.floor((r.u - L.u0) / 8) + Math.floor((r.w - L.w0) / 8);
      return k % 2 === 0 ? TY.holz : TY.pietra_serena;
    }, 'salone_decke');
    S.band(sd, licht, 54, 56, (r, y) => (r.d8 <= 3 ? null : TY.pietra_serena), 'salone_decke');

    // Tragende Innenwände der Zone A (optional): 2 Wände entlang u (w = 27, 47; Abstand 20) und 2 entlang w (u = 55, 79;
    // Abstand 24), 2 dick, y_rel 1..49, Türen 3 x 8 an den Kreuzungen. Der Turm bleibt hohl.
    const iw = ctx.part('innenwaende_a');
    const WL = [27, 47], UL = [55, 79];
    const nahe = (v, list) => list.find((c) => v >= c - 1 && v < c + 1);
    S.band(iw, g.recs.filter((r) => r.zone === 'A'), 1, 49, (r, y) => {
      if (r.d8 <= pv.tWall(y) || r.dHm <= 8) return null;                // Außenwand samt Öffnungen und Hofgänge bleiben frei
      const aw = nahe(r.w, WL), au = nahe(r.u, UL);
      if (aw === undefined && au === undefined) return null;
      if (y <= 8) {
        if (aw !== undefined && UL.some((c) => Math.abs(r.u - c) < 1.5)) return null;
        if (au !== undefined && WL.some((c) => Math.abs(r.w - c) < 1.5)) return null;
      }
      return TY.pietra_forte;
    }, 'innenwaende_a');
    // Letzte Stufe: Diagonalrisse der einzelligen Schichten schließen (BEGEHBARKEIT.md 1.4)
    const vb = ctx.part('verbindungsbloecke');
    const nv = require('./pv_risse.js').schliesse(S, vb, 'verbindungsbloecke');
    if (process.env.PV_DEBUG) console.error('PV Verbindungsblöcke:', nv);
    if (process.env.PV_DEBUG) console.error('PV Auslassungen je Bauteil (K0):', JSON.stringify(S.skips));
  }
};
