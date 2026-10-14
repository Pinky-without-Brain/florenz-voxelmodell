'use strict';
// Läden einer Zeile (Ost: Modul 2, West: Modul 3), Katalog §3/§4. Wandband d8 ≤ 2, Lagen 1..13, Trennwände je 8 in u
// mit Türen (Erdgeschoss und Obergeschoss, B5-Standard), Zwischendecke Lage 8..9, Decke Lage 14..15.
const G = require('./_pv.js');

function bauLaeden(ctx, seite) {
  const B = G.belegung(ctx);
  const { T, ZELLEN } = G;
  const ost = seite === 'ost';
  const inZeile = (c) => (ost ? c.E : c.W);
  const zeile = ZELLEN.filter(inZeile);
  const loggia = (c) => ost && G.loggiaZelle(c);

  // Türen der Trennwände: die mittleren drei Zellen der Zeilentiefe (Abstand 4..6 vom Rand), EG Lage 1..5, OG Lage 10..12
  const trennTuer = (c, L) => G.dZone(c) >= 4 && G.dZone(c) <= 6 && ((L >= 1 && L <= 5) || (L >= 10 && L <= 12));
  // Seitenwände der Loggia (u 83 und u 121) mit Türen wie die Trennwände
  const loggiaSeite = (c) => ost && G.dZone(c) > G.wandDicke && ((c.u >= G.LOGGIA[0] && c.u < G.LOGGIA[0] + 2) || (c.u >= G.LOGGIA[1] - 2 && c.u < G.LOGGIA[1]));

  // 1 Außenwände mit Türen, Schaufenstern, Läden und Fenstern
  const waende = ctx.part(`laeden_${seite}_waende`);
  const tuerLuft = [];
  for (const c of zeile) {
    if (!G.imWandband(c) || loggia(c)) continue;
    for (let L = 1; L <= 13; L++) {
      const o = G.frontOeffnung(c, L) || G.rueckOeffnung(c, L);
      if (o === 'tuer') { tuerLuft.push({ x: c.x, y: G.Y(L), z: c.z }); B.luft(c.x, G.Y(L), c.z); continue; }
      const t = o === 'glas' || o === 'oberlicht' || o === 'fenster' ? T.glas : o === 'laden' ? T.laden : o === 'rahmen' ? T.serena : G.putzVon(c);
      B.setL(waende, c, L, t);
    }
  }
  if (tuerLuft.length) ctx.oeffnung(tuerLuft, 'tuer');

  // 2 Trennwände (1 dick) mit Türen
  const trenn = ctx.part(`laeden_${seite}_trennwaende`);
  for (const c of zeile) {
    if (!(G.istTrennwand(c) || loggiaSeite(c)) || (loggia(c) && !loggiaSeite(c))) continue;
    for (let L = 1; L <= 13; L++) if (!trennTuer(c, L)) B.setL(trenn, c, L, T.sand);
  }

  // 3 Loggia (nur Ost): drei Rundbögen in Front und Rückfront, Pfeiler und Bogenring Pietra serena, Saal ohne Zwischendecke
  if (ost) {
    const lo = ctx.part('laden_ost_loggia');
    const arkade = [];
    for (const c of zeile) {
      if (!loggia(c) || !G.imWandband(c)) continue;
      for (let L = 1; L <= 13; L++) {
        const b = G.loggiaBogen(c, L);
        if (b === 'offen') { arkade.push({ x: c.x, y: G.Y(L), z: c.z }); continue; }
        B.setL(lo, c, L, b === 'ring' ? T.serena : (c.seite === 'seite' ? T.sand : T.sand));
      }
    }
    ctx.oeffnung(arkade, 'arkade');
  }

  // 4 Zwischendecke Lage 8..9 (ohne Loggia, ohne Trennwände, ohne Treppenfuß und Lichter)
  const zw = ctx.part(`laeden_${seite}_zwischendecke`);
  for (const c of zeile) {
    if (G.dZone(c) <= G.wandDicke || loggia(c) || G.istTrennwand(c) || !c.laden) continue;
    for (const L of G.L_ZWISCHEN) {
      const y = G.Y(L);
      if (G.ausgespart(c.x, y, c.z) || G.istLicht(c.x, y, c.z)) continue;
      B.setL(zw, c, L, T.holz);
    }
  }

  // 5 Decke Lage 14..15 über der ganzen Zeile (Ost: zugleich Boden des Korridors), ohne Turm, Treppenloch, Lichter
  const de = ctx.part(`laeden_${seite}_decke`);
  for (const c of zeile) {
    for (const L of G.L_DECKE) {
      const y = G.Y(L);
      if (G.ausgespart(c.x, y, c.z) || G.istLicht(c.x, y, c.z)) continue;
      B.setL(de, c, L, T.serena);
    }
  }
}

module.exports = { bauLaeden };
