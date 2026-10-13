'use strict';
// Modul 3: Ballatoio und Guelfenzinnen der Zone A (Katalog §4). Konsolbogen-Raster p = L/rund(L/5).
// s = Abstand nach außen von der Wandebene (s = 0 ist die Randzelle d8 = 1, s >= 1 sind Zellen außerhalb der Maske).
const pv = require('./pv_lib.js');

const STEMMI = ['rot', 'weiss', 'blau', 'gelb', 'rot', 'weiss', 'hellblau', 'orange', 'blau'];   // Volk, Lilie, Fiesole, Papst, ...

module.exports = {
  module: 3,
  build(ctx) {
    const S = pv.state(ctx);
    const g = S.g, TY = pv.TY;
    const WZ = require('../../../tools/wahrzeichen');
    // Randzellen des Rings: nur solche, die über eine Kette von Flächenkontakten an eine Wandzelle der Zone A anschließen
    const ring0 = pv.ringZellen();
    for (const r of ring0) r.ra = pv.raster(r.pos, r.L);
    const k0 = new Map(ring0.map((c) => [c.x * 8192 + c.z, c]));
    const front = ring0.filter((c) => c.s === 1 && [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => { const m = g.rec(c.x + dx, c.z + dz); return m && m.isA; }));
    const ok = new Set(front.map((c) => c.x * 8192 + c.z));
    for (let i = 0, q = front.slice(); i < q.length; i++) {
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = k0.get((q[i].x + dx) * 8192 + q[i].z + dz);
        if (n && !ok.has(n.x * 8192 + n.z)) { ok.add(n.x * 8192 + n.z); q.push(n); }
      }
    }
    const ring = ring0.filter((c) => ok.has(c.x * 8192 + c.z));
    const A = g.recs.filter((r) => r.isA);
    const LS = g.K[15].L + g.K[16].L, LN = g.K[0].L + g.K[1].L;
    // Lage einer Randzelle der Zone A im Raster (nur an den Ringkanten)
    const recPos = (r) => {
      if (!pv.RING_KANTEN.has(r.e)) return null;
      if (r.e >= 17) return pv.raster(r.u, 89.9);
      if (r.e <= 1) return pv.raster((r.e === 1 ? g.K[0].L : 0) + r.uK, LN);
      return pv.raster((r.e === 16 ? g.K[15].L : 0) + r.uK, LS);
    };
    // Konsolen: bei u = j*p je ein Strahl senkrecht zur Wand, gerastert und flächenverbunden (die Fassade liegt
    // 10 Grad gegen das Zellraster geneigt)
    const byKey = new Map(ring.map((c) => [c.x * 8192 + c.z, c]));
    for (const c of ring) c.cor = c.ra.cap;
    const rahmenAn = (grp, pos) => {                       // Rahmen und lokale Koordinate u an der Position pos der Gruppe
      if (grp === 'W') return { rf: g.rf, u: pos };
      const kk = grp === 'N' ? (pos < g.K[0].L ? 0 : 1) : (pos < g.K[15].L ? 15 : 16);
      const off = grp === 'N' ? (kk === 1 ? g.K[0].L : 0) : (kk === 16 ? g.K[15].L : 0);
      return { rf: g.K[kk].rahmen, u: pos - off };
    };
    for (const grp of ['W', 'N', 'S']) {
      const zellen = ring.filter((c) => c.grp === grp);
      if (!zellen.length) continue;
      const L = zellen[0].L, n = Math.max(1, Math.round(L / 5)), p = L / n;
      for (let j = 0; j <= n; j++) {
        const { rf, u } = rahmenAn(grp, Math.min(L, Math.max(0, j * p)));
        const o = rf.toWorld(u, 0), nw = rf.toWorld(u, -1);            // w zeigt nach innen, außen = -w
        const nx = nw.x - o.x, nz = nw.z - o.z;
        let prev = null;
        for (let t = 0.5; t <= 4.2; t += 0.2) {
          const x = Math.round(o.x + nx * t), z = Math.round(o.z + nz * t);
          const c = byKey.get(x * 8192 + z);
          if (!c || c.grp !== grp) continue;
          if (prev && Math.abs(prev.x - x) + Math.abs(prev.z - z) === 2) {
            for (const [qx, qz] of [[prev.x, z], [x, prev.z]]) { const q = byKey.get(qx * 8192 + qz); if (q && q.grp === grp) { q.cor = true; break; } }
          }
          c.cor = true;
          prev = c;
        }
      }
    }
    // Anschluss prüfen: jede Konsolenzelle s >= 2 braucht einen Nachbarn der inneren Schale (sonst Brücke oder Entfernen)
    const nb4 = (c) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dz]) => byKey.get((c.x + dx) * 8192 + c.z + dz)).filter(Boolean);
    for (const sh of [2, 3]) {
      for (const c of ring) {
        if (c.s !== sh || !c.cor || c.ra.cap) continue;
        const nn = nb4(c).filter((n) => n.s === sh - 1);
        if (nn.some((n) => n.cor)) continue;
        if (nn.length) nn[0].cor = true; else c.cor = false;
      }
    }
    // Konsolen ohne Kette zur Wand (Rückwand der Zone A) entfallen
    const frontSet = new Set(front.map((c) => c.x * 8192 + c.z));
    const erreicht = new Set();
    const queue = ring.filter((c) => c.cor && frontSet.has(c.x * 8192 + c.z));
    for (const c of queue) erreicht.add(c.x * 8192 + c.z);
    for (let i = 0; i < queue.length; i++) {
      for (const n of nb4(queue[i])) if (n.cor && !erreicht.has(n.x * 8192 + n.z)) { erreicht.add(n.x * 8192 + n.z); queue.push(n); }
    }
    for (const c of ring) if (c.cor && !erreicht.has(c.x * 8192 + c.z)) c.cor = false;
    const corbel = (c) => c.cor;
    const strip = A.filter((r) => r.dN <= 2);            // Ostgrenze zu M/P: Brüstung steht auf der Dachhöhe der Nachbarn
    const stripPh = (r) => { const q = r.u / 5; return q - Math.floor(q); };

    // 1) Marcapiano-Gesims y_rel 49: eine Zelle vorspringend
    const ges = ctx.part('gesims_marcapiano');
    for (const c of ring) if (c.s === 1) S.put(ges, c.x, 49, c.z, TY.pietra_forte, 'gesims_marcapiano');

    // 2) Konsolen, Rundbögen, Rückwand mit Stemmi
    const kon = ctx.part('konsolen');
    const rueck = A.filter((r) => r.d8 <= 3);
    S.band(kon, rueck, 50, 55, (r, y) => {
      if (r.d8 === 1 && (y === 51 || y === 52)) {
        const ra = recPos(r);
        if (ra && !ra.cap && Math.abs(ra.du) < 1) return WZ.fresko(STEMMI[ra.j % STEMMI.length]);
      }
      return TY.pietra_forte;
    }, 'konsolen');
    for (let y = 50; y <= 55; y++) {
      for (const c of ring) {
        if (y <= 51 ? (c.s === 1 && corbel(c)) : corbel(c)) S.put(kon, c.x, y, c.z, TY.pietra_forte, 'konsolen');
      }
    }
    // Bogenfeld in der Außenebene s = 3: Kämpfer y_rel 53, Scheitel 55; nur Zellen mit Anschluss an Konsole oder Bogen
    let kand = [];
    for (let y = 53; y <= 55; y++) {
      for (const c of ring) {
        if (c.s !== 3 || corbel(c)) continue;
        if (!((c.ra.du / 2) ** 2 + ((y - 53) / 2) ** 2 < 1)) kand.push({ c, y });
      }
    }
    for (let ändert = true; ändert;) {
      ändert = false;
      const rest = [];
      for (const k of kand) {
        const { c, y } = k;
        const halt = S.has(c.x, y - 1, c.z) || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => S.has(c.x + dx, y, c.z + dz));
        if (halt) { S.put(kon, c.x, y, c.z, TY.pietra_forte, 'konsolen'); ändert = true; } else rest.push(k);
      }
      kand = rest;
    }

    // 3) Ballatoio-Boden y_rel 56 mit Wurflöchern (Caditoie) in der Mitte jedes zweiten Bogens
    const bod = ctx.part('ballatoio_boden');
    S.band(bod, A.filter((r) => r.d8 <= 5 && !(r.zone === 'T' && r.dT > 4)), 56, 56, () => TY.pietra_forte, 'ballatoio_boden');
    for (const c of ring) {
      const ra = c.ra;
      if (!ra.cap && ra.j % 2 === 0 && c.s <= 2 && Math.abs(ra.du) < 0.5) { S.note('scharte', c.x, 56, c.z); continue; }   // Caditoia (Wurfloch)
      S.put(bod, c.x, 56, c.z, TY.pietra_forte, 'ballatoio_boden');
    }
    S.flush();
    S.band(bod, strip, 56, 56, () => TY.pietra_forte, 'ballatoio_boden');

    // 4) Brüstung y_rel 57..60: Ring s 2..3 (2 dick) und Ostgrenze
    const bru = ctx.part('bruestung');
    for (let y = 57; y <= 60; y++) for (const c of ring) if (c.s >= 2) S.put(bru, c.x, y, c.z, TY.pietra_forte, 'bruestung');
    S.band(bru, strip, 57, 60, () => TY.pietra_forte, 'bruestung');

    // 5) Guelfenzinnen y_rel 61..62: 3 breit, Lücken 2, Zinne über jedem Bogenmittelpunkt
    const zin = ctx.part('zinnen_guelfisch');
    for (let y = 61; y <= 62; y++) {
      for (const c of ring) {
        if (c.s < 2) continue;
        if (c.ra.cap || (c.ra.ph >= 0.2 && c.ra.ph < 0.8)) S.put(zin, c.x, y, c.z, TY.pietra_forte, 'zinnen_guelfisch');
        else S.note('scharte', c.x, y, c.z);                 // Zinnenlücke
      }
    }
    S.flush();
    S.band(zin, strip.filter((r) => { const q = stripPh(r); return q >= 0.2 && q < 0.8; }), 61, 62, () => TY.pietra_forte, 'zinnen_guelfisch');

    // 6) Eckmarzocchi (optional): 2 x 2 x 3 Nischenblock mit Löwe in den vier Ecken des Rechtecks A
    const eck = ctx.part('eckmarzocchi');
    const ecken = [[-130.5, 798.5], [-74, 809.5], [-91.5, 908.5], [-146.5, 887]];
    const okZelle = (r) => r && r.isA && r.d8 >= 2 && r.d8 <= 3 && r.dN >= 3;
    for (const [vx, vz] of ecken) {
      let best = null, bd = Infinity;
      for (let x0 = Math.floor(vx) - 8; x0 <= Math.ceil(vx) + 8; x0++) {
        for (let z0 = Math.floor(vz) - 8; z0 <= Math.ceil(vz) + 8; z0++) {
          const cs = [g.rec(x0, z0), g.rec(x0 + 1, z0), g.rec(x0, z0 + 1), g.rec(x0 + 1, z0 + 1)];
          if (!cs.every(okZelle)) continue;
          const d = Math.hypot(x0 + 0.5 - vx, z0 + 0.5 - vz);
          if (d < bd) { bd = d; best = { x0, z0 }; }
        }
      }
      if (!best) continue;
      for (let dx = 0; dx < 2; dx++) for (let dz = 0; dz < 2; dz++) {
        S.put(eck, best.x0 + dx, 57, best.z0 + dz, TY.pietra_serena, 'eckmarzocchi');
        S.put(eck, best.x0 + dx, 58, best.z0 + dz, TY.marmor_weiss, 'eckmarzocchi');
        S.put(eck, best.x0 + dx, 59, best.z0 + dz, TY.marmor_weiss, 'eckmarzocchi');
      }
    }
  }
};
