'use strict';
// Modul 5 – Torre dei Mannelli (Katalog §6): Wandband d8_T ≤ 3, Lagen 1..56, Decken, Dachterrasse mit Zinnen,
// Tor zur Fahrbahn, Wendeltreppe bis auf die Terrasse.
const G = require('./_pv.js');

module.exports = {
  module: 5,
  build(ctx) {
    const B = G.belegung(ctx);
    const { T, ZELLEN } = G;
    const turm = ZELLEN.filter((c) => c.T);
    const us = turm.map((c) => c.u), ws = turm.map((c) => c.w);
    const u0 = Math.min(...us), u1 = Math.max(...us), w0 = Math.min(...ws), w1 = Math.max(...ws);

    // Tor 3 × 5 in der Westwand (zur Fahrbahn, größtes w), Mitte der Kante, mit Durchbruch (G.turmTor)
    const tor = (c, L) => L >= 1 && L <= 5 && c.dT <= 3 && G.turmTor(c);
    // Fenster 2 × 4 je Geschoss, Abstand 8 entlang der Kanten (Rand 3), Glas in den äußeren zwei Lagen
    const FENSTER_L = [[6, 9], [20, 23], [34, 37], [48, 51]];
    const fenster = (c, L) => {
      if (c.dT > 3 || !FENSTER_L.some(([a, b]) => L >= a && L <= b)) return false;
      const anU = c.w < w0 + 3.5 || c.w > w1 - 3.5, anW = c.u < u0 + 3.5 || c.u > u1 - 3.5;
      if (anU && !anW && c.u > u0 + 4 && c.u < u1 - 4) return ((Math.floor(c.u - u0) % 8) + 8) % 8 >= 3 && ((Math.floor(c.u - u0) % 8) + 8) % 8 < 5;
      if (anW && !anU && c.w > w0 + 4 && c.w < w1 - 4) return ((Math.floor(c.w - w0) % 8) + 8) % 8 >= 3 && ((Math.floor(c.w - w0) % 8) + 8) % 8 < 5;
      return false;
    };

    // 0 Fundament und Erdgeschossboden
    const fu = ctx.part('turm_fundament');
    for (const c of turm) {
      for (let y = c.gt + 1; y <= G.Y(-1); y++) B.set(fu, c.x, y, c.z, T.bruch);
      B.setL(fu, c, 0, T.serena);
    }

    // 1 Wände
    const wa = ctx.part('turm_waende');
    const torLuft = [];
    for (const c of turm) {
      if (c.dT > 3) continue;
      for (let L = 1; L <= G.TURM_TOP; L++) {
        if (tor(c, L)) { torLuft.push({ x: c.x, y: G.Y(L), z: c.z }); B.luft(c.x, G.Y(L), c.z); continue; }
        if (fenster(c, L)) { if (c.dT <= 2) B.setL(wa, c, L, T.glas); continue; }
        B.setL(wa, c, L, L <= 8 ? T.rustika : T.forte);
      }
    }
    if (torLuft.length) ctx.oeffnung(torLuft, 'tor');

    // 2 Wendeltreppe (Kern 1, Ring 3) von Lage 0 bis zur Dachterrasse
    if (G.TURM_TREPPE) {
      const tr = ctx.part('turm_wendeltreppe');
      for (const b of G.TURM_TREPPE.bloecke) B.set(tr, b.x, b.y, b.z, b.typ);
    }

    // 3 Decken (Lage 14..15, 28..29, 42..43, Abschluss 55..56) im Inneren, ohne Treppenfuß und Lichter
    const de = ctx.part('turm_decken');
    for (const c of turm) {
      if (c.dT <= 3) continue;
      for (const L of [14, 15, 28, 29, 42, 43, 55, 56]) {
        const y = G.Y(L);
        if (G.ausgespart(c.x, y, c.z) || G.istLicht(c.x, y, c.z)) continue;
        B.setL(de, c, L, T.serena);
      }
    }

    // 4 Dach (Terrasse) Lage 57..58 auf d8 > 1, Zinnen Lage 57..59 auf d8 = 1 (2 Zahn, 2 Lücke)
    // Treppenausstieg auf die Dachterrasse (offen)
    if (G.TURM_TREPPE) {
      const aus = [];
      for (const k of G.TURM_TREPPE.fuss) for (const L of [55, 56, 57, 58]) aus.push({ x: G.P.ckX(k), y: G.Y(L), z: G.P.ckZ(k) });
      ctx.oeffnung(aus.filter((c) => B.frei(c.x, c.y, c.z)), 'tuer');
    }
    const da = ctx.part('turm_dach');
    for (const c of turm) {
      if (c.dT <= 1) continue;
      for (const L of [57, 58]) if (!G.ausgespart(c.x, G.Y(L), c.z)) B.setL(da, c, L, T.serena);
    }
    const zi = ctx.part('turm_zinnen');
    for (const c of turm) {
      if (c.dT !== 1) continue;
      const k = Math.floor((c.u - u0) + (c.w - w0));
      const zahn = ((Math.floor(k / 2) % 2) + 2) % 2 === 0;
      B.setL(zi, c, 57, T.forte);
      B.setL(zi, c, 58, T.forte);
      if (zahn) B.setL(zi, c, 59, T.forte);
    }

    // 5 Beccatelli: Konsolen am Turm im Korridorstreifen (nur wo kein Unterbau steht), Lage 12..13 im Schachbrett
    const ko = ctx.part('turm_konsolen');
    for (const c of ZELLEN) {
      if (!c.K || c.T || c.E) continue;
      const nahTurm = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]].some(([dx, dz]) => { const n = G.zelle(c.x + dx, c.z + dz); return n && n.T; });
      if (!nahTurm) continue;
      if (((c.x + c.z) & 1) === 0) { B.setL(ko, c, 12, T.serena); B.setL(ko, c, 13, T.serena); }
    }
  }
};
