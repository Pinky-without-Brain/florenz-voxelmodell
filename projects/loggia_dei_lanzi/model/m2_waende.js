'use strict';
// Modul 2 – Wände. Katalog §3 mit K0 (PRUEFBERICHT_D1): frontwand_ueber_bogen Lage 14..24, fries/medaillons 25..27.
// Gleichrangige Bauteile: zuerst gebaut gewinnt (Pfeiler, Pilaster, Halbsäulen sind schon da); Details (Öffnungen,
// Archivolten, Konsolsteine) gewinnen vor den Wänden und werden hier ausgespart.
const G = require('./_gemeinsam.js');

module.exports = {
  module: 2,
  build(ctx) {
    const { T, ZELLEN } = G;
    const frei = (c, L) => !ctx.grid.has(c.x, G.lageY(L), c.z);   // K0: belegte Zellen auslassen
    const istRueckwand = (c) => c.iw >= 22 && (c.iu >= G.OST_AB ? c.iw <= 24 : c.iw <= 27);
    const istWestwand = (c) => c.iu <= -37 && c.iw >= 6 && c.iw <= 21;
    const istOstwandSockel = (c) => c.iu >= 36 && c.iw >= 6 && c.iw <= 21;

    // 0) Wandsockel Lage 1..2 unter Rück- und Westwand (Ergänzung zum Katalog, s. Bericht): die Wände schweben sonst
    //    zwei Lagen über der Platte. Pietra serena wie der Pfeilersockel.
    const sw = ctx.part('sockel_waende');
    for (const c of ZELLEN) {
      if (!(istRueckwand(c) || istWestwand(c))) continue;
      for (let L = 1; L <= 2; L++) if (frei(c, L)) G.setL(sw, c, L, T.serena);
    }

    // 0b) Fuß der Ostwand (Schwelle des Seitenbogens): u 36..38, w 6..21, Lage 1..2 Pietra serena.
    const fuss = ctx.part('seitenwand_pfeilerverbindung');
    for (const c of ZELLEN) {
      if (!istOstwandSockel(c)) continue;
      for (let L = 1; L <= 2; L++) if (frei(c, L)) G.setL(fuss, c, L, T.serena);
    }

    // 1) Rückwand: w 22..24, im Westteil (u <= 15) w 22..27, Lage 3..29.
    const rw = ctx.part('rueckwand');
    for (const c of ZELLEN) {
      if (!istRueckwand(c)) continue;
      for (let L = 3; L <= 29; L++) {
        if (G.archivolteOst(c.iu, c.iw, L) || !frei(c, L)) continue;
        G.setL(rw, c, L, T.forte);
      }
    }

    // 2) Westwand: u -39..-37, w 6..21, geschlossen (Annahme C). Pilaster/Halbsäulen sind belegt (K0).
    const ww = ctx.part('wand_west');
    for (const c of ZELLEN) {
      if (!istWestwand(c)) continue;
      for (let L = 3; L <= 29; L++) {
        if (G.konsole(c.iu, c.iw, L) || !frei(c, L)) continue;
        G.setL(ww, c, L, T.forte);
      }
    }
    // Eckfüllung (Lücke im Katalog): Über den Eckpfeilern (w 3..5) fehlt sonst die Seitenwand von Lage 14 an.
    // Gilt für Ost und West; unter Lage 14 sind die Zellen vom Pfeiler belegt.
    // Der Seitenbogen-Ring (Archivolte Ost) bleibt als Detail frei.

    // 3) Ostwand: u 36..38, w 6..21 mit Seitenbogen (Öffnung Luft), Lage 3..29.
    const ow = ctx.part('wand_ost');
    for (const c of ZELLEN) {
      if (c.iu < 36 || c.iw < 6 || c.iw > 21) continue;
      for (let L = 3; L <= 29; L++) {
        if (G.seitenbogenLuft(c.iu, c.iw, L) || G.archivolteOst(c.iu, c.iw, L) || !frei(c, L)) continue;
        G.setL(ow, c, L, T.forte);
      }
    }

    // 3b) Eckfüllung beider Seitenwände über den Eckpfeilern (w 3..5, ab Lage 14).
    const ec = ctx.part('seitenwand_ecken');
    for (const c of ZELLEN) {
      if (c.iw < 3 || c.iw > 5 || !(c.iu <= -37 || c.iu >= 36)) continue;
      for (let L = 14; L <= 29; L++) {
        if (G.archivolteOst(c.iu, c.iw, L) || !frei(c, L)) continue;
        G.setL(ec, c, L, T.forte);
      }
    }

    // 4) Frontwand über den Bögen: w 0..2, Lage 14..24; Bogenöffnungen Luft, Archivoltenring (Modul 3) frei.
    const fw = ctx.part('frontwand_ueber_bogen');
    for (const c of ZELLEN) {
      if (c.iw > 2) continue;
      for (let L = 14; L <= 24; L++) {
        if (G.bogenLuft(c.iu, L) || G.archivolteFront(c.iu, c.iw, L) || !frei(c, L)) continue;
        G.setL(fw, c, L, T.forte);
      }
    }

  }
};
