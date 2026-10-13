'use strict';
// Modul 5 – Fries, Medaillons, Terrasse, Aufbauhaube, Brüstung. Katalog §6 mit K0: fries/medaillons Lage 25..27.
// B3: Die Aufbauhaube ist die Spielzugang-Haube des Treppenturms (nicht historisch: im Original führte der Zugang über die
// Uffizien): ein Häuschen 7 x 7 über dem Turm mit Tür auf die Terrasse. Die Brüstung ist an Fuß (Lage 30) und Handlauf (Lage 32)
// durchgehend und flächenverbunden, dazwischen Baluster (Lage 31); die Balusterlücken sind als Loggia-Öffnungen deklariert.
const G = require('./_gemeinsam.js');
const TU = require('./_turm.js');
const { schliesse } = require('./_riss.js');

module.exports = {
  module: 5,
  build(ctx) {
    const { T, ZELLEN } = G;
    const B = G.belegung(ctx);
    const frei = (c, L) => B.frei(c, L);

    // Medaillon-Zellen: w 0 = Rahmen (Ring) bzw. Mitte, w 1 = blauer Grund. Die Fries-Zellen dort sind ausgespart.
    const medZelle = (c, L) => {
      const k = G.medaillonIndex(c.iu, L);
      return k >= 0 && c.rw <= 1 ? k : -1;
    };

    // 1) Fries: Front w 0..2, Lage 25..27, u -39..38.
    const fr = ctx.part('fries');
    for (const c of ZELLEN) {
      if (c.iw > 2) continue;
      for (let L = 25; L <= 27; L++) if (medZelle(c, L) < 0 && frei(c, L)) B.setL(fr, c, L, T.forte);
    }

    // 2) Medaillons: 3 x 3, Ring marmor_ornament, Mitte gold, dahinter (w 1) blauer Keramikgrund.
    const md = ctx.part('medaillons');
    for (const c of ZELLEN) {
      for (let L = 25; L <= 27; L++) {
        const k = medZelle(c, L);
        if (k < 0 || !frei(c, L)) continue;
        const mitte = c === G.MEDAILLON_MITTE[k] && L === 26;
        if (mitte) B.setL(md, c, L, T.gold);
        else B.setL(md, c, L, c.rw === 1 ? T.blau : T.ornament);
      }
    }

    // 3) Terrasse: Lage 28..29 über ganz M_LL; Wände und Fries tragen sie (belegte Zellen ausgelassen).
    const tr = ctx.part('terrasse');
    for (const c of ZELLEN) for (let L = 28; L <= 29; L++) if (frei(c, L)) B.setL(tr, c, L, T.serena);

    // 4) Aufbauhaube über dem Treppenturm: Mantel 7 x 7 Lage 30..32, Dach Lage 33; Tür (2 x 3) im Norden zur Terrasse.
    const t = TU.turm();
    const da = ctx.part('dachaustritt');
    const oben = new Set(t.tuerOben.map((q) => q.x + ',' + q.z));
    const tuerZellen = [];
    for (const c of ZELLEN) {
      if (!TU.imTurm(t, c.x, c.z)) continue;
      const mantel = TU.imMantel(t, c.x, c.z);
      for (let L = 30; L <= TU.HAUBE_OBEN; L++) {
        if (L === TU.HAUBE_OBEN) { if (frei(c, L)) B.setL(da, c, L, G.WZ.typ('dachziegel')); continue; }
        if (!mantel) continue;                       // Innenraum der Haube bleibt leer
        if (oben.has(c.x + ',' + c.z)) { tuerZellen.push({ x: c.x, y: G.lageY(L), z: c.z }); B.luft(c.x, G.lageY(L), c.z); continue; }
        if (frei(c, L)) B.setL(da, c, L, T.forte);
      }
    }
    ctx.oeffnung(tuerZellen, 'tuer');

    // 5) Brüstung: Ring d8 = 1 (nicht an der Haube); Lage 30 Fuß und Lage 32 Handlauf durchgehend, Lage 31 Baluster
    //    (jede zweite Zelle). Diagonale Stöße des gedrehten Rings werden durch eine Zusatzzelle flächig verbunden.
    const br = ctx.part('brustung');
    const ring = ZELLEN.filter((c) => G.bruestungZelle(c) && frei(c, 30));
    const ringSet = new Set(ring.map((c) => c.x + ',' + c.z));
    const extra = schliesse(ring.map((c) => ({ x: c.x, y: 0, z: c.z })),
      (x, y, z) => G.inMaske(x, z) && !ringSet.has(x + ',' + z) && B.frei({ x, z }, 30));
    const ringAlle = ring.concat(extra.map((e) => G.zelleAn(e.x, e.z)));
    const ringKeys = new Set(ringAlle.map((c) => c.x + ',' + c.z));
    const luecken = [];
    for (const c of ringAlle) {
      B.setL(br, c, 30, T.weiss);
      if (((c.ru + c.rw) & 1) === 0 && !extra.some((e) => e.x === c.x && e.z === c.z)) B.setL(br, c, 31, T.weiss);
      else luecken.push({ x: c.x, y: G.lageY(31), z: c.z });
      B.setL(br, c, 32, T.weiss);
    }
    void ringKeys;
    ctx.oeffnung(luecken, 'loggia');
  }
};
