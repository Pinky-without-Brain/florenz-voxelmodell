'use strict';
// Modul 2 – Wände und Treppenturm. Katalog §3 mit K0 (PRUEFBERICHT_D1): frontwand_ueber_bogen Lage 14..24, fries/medaillons 25..27.
// Gleichrangige Bauteile: zuerst gebaut gewinnt (Pfeiler, Pilaster, Halbsäulen sind schon da); Details (Öffnungen,
// Archivolten, Konsolsteine) gewinnen vor den Wänden und werden hier ausgespart (Belegungsregister statt Gridabfrage).
// B3: Der Treppenturm (Spielzugang zur Terrasse) entsteht vor den Wänden in der Rückwand. Der Fuß der Ostwand entfällt:
// der Seitenbogen ist ein Eingang mit Stufen (Modul 0).
const G = require('./_gemeinsam.js');
const TU = require('./_turm.js');

module.exports = {
  module: 2,
  build(ctx) {
    const { T, ZELLEN } = G;
    const B = G.belegung(ctx);
    const frei = (c, L) => B.frei(c, L);
    const istRueckwand = (c) => c.iw >= 22 && (c.iu >= G.OST_AB ? c.iw <= 24 : c.iw <= 27);
    const istWestwand = (c) => c.iu <= -37 && c.iw >= 6 && c.iw <= 21;
    const t = TU.turm();
    const Y = G.BODEN_Y;
    const L1 = TU.LAGE_TERRASSE;

    // 0) Treppenturm: Wendeltreppe (Kern 1, Ring 2 breit, rechtsdrehend) von der Platte (Lage 0) bis zur Terrasse (Lage 29).
    //    Die Stufen sind Treppenblöcke (Pietra serena); die Zellen auf Lage 0 gehören der Bodenplatte. Im Kern sitzen
    //    Laternen (Teil 0b). Jede übrige Zelle des Schachts bleibt reserviert leer (Kopffreiheit, Haube).
    const lampenY = new Set(TU.LAMPEN_LAGEN.map((L) => Y + L));
    const spirale = G.WZ.treppe.wendeltreppe({ mitte: { x: t.cx, z: t.cz }, radiusInnen: 0, radiusAussen: 2, yVon: Y, yBis: Y + L1,
      rolle: 'pietra_serena', drehsinn: 'rechts', kern: true });
    const tt = ctx.part('turm_treppe');
    const gesetzt = new Set();
    for (const b of spirale) {
      if (b.y <= Y) continue;                                            // Lage 0 = Bodenplatte
      if (b.x === t.cx && b.z === t.cz && lampenY.has(b.y)) continue;    // Laternenplatz im Kern
      const k = b.x + ',' + b.y + ',' + b.z;
      if (gesetzt.has(k)) continue;
      gesetzt.add(k);
      B.put(tt, b.x, b.y, b.z, b.typ);
    }
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        for (let L = 1; L <= L1 + 3; L++) {
          if (!gesetzt.has((t.cx + dx) + ',' + (Y + L) + ',' + (t.cz + dz)) && !(dx === 0 && dz === 0 && lampenY.has(Y + L))) B.luft(t.cx + dx, Y + L, t.cz + dz);
        }
      }
    }
    // 0b) Laternen im Kern (Seelaternen, Rolle licht)
    const tl = ctx.part('turm_laternen');
    for (const L of TU.LAMPEN_LAGEN) B.put(tl, t.cx, Y + L, t.cz, G.WZ.typ('licht'));

    // 0c) Mantel 7 x 7 (Chebyshev-Abstand 3), Lage 1..29; unten die Tür zur Halle (2 breit, Lage 1..3, ggf. Tunnel durch die Rückwand)
    const tuerSet = new Set(t.tuerUnten.map((q) => q.x + ',' + q.z));
    const mantel = ctx.part('turm_huelle');
    for (const c of ZELLEN) {
      if (!TU.imMantel(t, c.x, c.z)) continue;
      for (let L = 1; L <= L1; L++) {
        if (tuerSet.has(c.x + ',' + c.z) && L <= 3) { B.luft(c.x, Y + L, c.z); continue; }
        B.setL(mantel, c, L, T.forte);
      }
    }
    // Tunnelzellen durch die Rückwand (Tür) reservieren
    for (const q of t.tuerUnten) for (let L = 1; L <= 3; L++) B.luft(q.x, Y + L, q.z);
    ctx.oeffnung(t.tuerUnten.flatMap((q) => [1, 2, 3].map((L) => ({ x: q.x, y: Y + L, z: q.z }))), 'tuer');

    // 1) Wandsockel Lage 1..2 unter Rück- und Westwand (Ergänzung zum Katalog): die Wände schweben sonst zwei Lagen über der Platte.
    const sw = ctx.part('sockel_waende');
    for (const c of ZELLEN) {
      if (!(istRueckwand(c) || istWestwand(c))) continue;
      for (let L = 1; L <= 2; L++) if (frei(c, L)) B.setL(sw, c, L, T.serena);
    }

    // 2) Rückwand: w 22..24, im Westteil (u <= 15) w 22..27, Lage 3..29.
    const rw = ctx.part('rueckwand');
    for (const c of ZELLEN) {
      if (!istRueckwand(c)) continue;
      for (let L = 3; L <= 29; L++) {
        if (G.archivolteOst(c.iu, c.iw, L) || !frei(c, L)) continue;
        B.setL(rw, c, L, T.forte);
      }
    }

    // 3) Westwand: u -39..-37, w 6..21, geschlossen (Annahme C). Pilaster/Halbsäulen sind belegt (K0).
    const ww = ctx.part('wand_west');
    for (const c of ZELLEN) {
      if (!istWestwand(c)) continue;
      for (let L = 3; L <= 29; L++) {
        if (G.konsole(c.iu, c.iw, L) || !frei(c, L)) continue;
        B.setL(ww, c, L, T.forte);
      }
    }

    // 4) Ostwand: u 36..38, w 6..21 mit Seitenbogen (Öffnung Luft), Lage 3..29.
    const ow = ctx.part('wand_ost');
    for (const c of ZELLEN) {
      if (c.iu < 36 || c.iw < 6 || c.iw > 21) continue;
      for (let L = 3; L <= 29; L++) {
        if (G.seitenbogenLuft(c.iu, c.iw, L) || G.archivolteOst(c.iu, c.iw, L) || !frei(c, L)) continue;
        B.setL(ow, c, L, T.forte);
      }
    }

    // 4b) Eckfüllung beider Seitenwände über den Eckpfeilern (w 3..5, ab Lage 14).
    const ec = ctx.part('seitenwand_ecken');
    for (const c of ZELLEN) {
      if (c.iw < 3 || c.iw > 5 || !(c.iu <= -37 || c.iu >= 36)) continue;
      for (let L = 14; L <= 29; L++) {
        if (G.archivolteOst(c.iu, c.iw, L) || !frei(c, L)) continue;
        B.setL(ec, c, L, T.forte);
      }
    }

    // 5) Frontwand über den Bögen: w 0..2, Lage 14..24; Bogenöffnungen Luft, Archivoltenring (Modul 3) frei.
    const fw = ctx.part('frontwand_ueber_bogen');
    for (const c of ZELLEN) {
      if (c.iw > 2) continue;
      for (let L = 14; L <= 24; L++) {
        if (G.bogenLuft(c.iu, L) || G.archivolteFront(c.iu, c.iw, L) || !frei(c, L)) continue;
        B.setL(fw, c, L, T.forte);
      }
    }
  }
};
