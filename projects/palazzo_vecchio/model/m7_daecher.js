'use strict';
// Modul 7: Dächer (Katalog §8). Dachhöhe wie tools/city/haus.js über dem Chamfer-Abstandsfeld zum Rand der Dachfläche:
// top = Traufe + min(Kappe, floor(0,4 * Abstand)); die Dachhaut ist 2 Lagen stark, die unterste Lage nie unter der Traufe.
// Turm (Zone T) und Löcher bleiben ausgespart.
const pv = require('./pv_lib.js');

const TRAUFE = 57;
const ANSTIEG = 0.4;

module.exports = {
  module: 7,
  build(ctx) {
    const S = pv.state(ctx);
    const g = S.g, TY = pv.TY;

    const dachflaeche = (w, recs, kappe, tag, typ) => {
      const feld = pv.abstandsfeld(recs.map((r) => [r.x, r.z]));
      for (const r of recs) {
        const top = TRAUFE + Math.min(kappe, Math.floor(ANSTIEG * feld(r.x, r.z)));
        for (let y = Math.max(TRAUFE, top - 1); y <= top; y++) S.put(w, r.x, y, r.z, typ, tag);
      }
    };

    // 1) Arnolfo-Block: verdecktes Walmdach hinter der Brüstung (d8 > 3), Oberkante höchstens 61 < Zinnen 62
    const da = ctx.part('dach_arnolfo');
    dachflaeche(da, g.recs.filter((r) => r.zone === 'A' && r.d8 > 3 && r.dN > 2), 4, 'dach_arnolfo', TY.dachziegel);

    // 2) Mittelstreifen und Südblock: Flachdach (Platte y_rel 57), Brüstung y_rel 58 am Außenring, nicht an Grenzen zu A und B
    const tm = ctx.part('terrasse_mittelbauten');
    const MP0 = g.recs.filter((r) => (r.zone === 'M' || r.zone === 'P') && !r.sal);
    // Flachdachteile ohne Anschluss an die Ostgrenze der Zone A (dünne Säume entlang der Außenkante) gehören zum Ostblockdach
    const key = (r) => r.x * 8192 + r.z;
    const inMP = new Map(MP0.map((r) => [key(r), r]));
    const stuetz = new Set(g.recs.filter((r) => r.isA && r.dN <= 2).map(key));
    const seen = new Set(), MP = [], saum = [];
    for (const r0 of MP0) {
      if (seen.has(key(r0))) continue;
      const comp = [r0]; seen.add(key(r0));
      let ok = false;
      for (let i = 0; i < comp.length; i++) {
        const r = comp[i];
        for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const k = (r.x + dx) * 8192 + r.z + dz;
          if (stuetz.has(k)) ok = true;
          const n = inMP.get(k);
          if (n && !seen.has(k)) { seen.add(k); comp.push(n); }
        }
      }
      (ok ? MP : saum).push(...comp);
    }
    S.band(tm, MP, TRAUFE, TRAUFE, () => TY.pietra_serena, 'terrasse_mittelbauten');
    const grenzt = (r) => {
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const n = g.rec(r.x + dx, r.z + dz);
        if (n && (n.isA || n.zone === 'B')) return true;
      }
      return false;
    };
    S.band(tm, MP.filter((r) => r.d8 === 1 && !grenzt(r)), TRAUFE + 1, TRAUFE + 1, () => TY.putz_sand, 'terrasse_mittelbauten');

    // 3) Ostblock ohne Salone-Rechteck: Walmdach, Anstieg 0,4 je Block, höchstens 10
    const dob = ctx.part('dach_ostblock');
    dachflaeche(dob, g.recs.filter((r) => r.zone === 'B' && !r.sal).concat(saum), 10, 'dach_ostblock', TY.dachziegel);

    // 4) Salone: Satteldach, First parallel zur u-Achse in w = 114, Traufe 57, First 66, Giebel an den Schmalseiten
    const ds = ctx.part('dach_salone');
    const sal = g.recs.filter((r) => r.sal && r.d8 > 3);        // K4: nur außerhalb des Außenwandbands
    const b = pv.SAL_AUSSEN;
    for (const r of sal) {
      const dw = Math.min(r.w - b.w0, b.w1 - r.w);
      const top = TRAUFE + Math.min(9, Math.round((9 * dw) / ((b.w1 - b.w0) / 2)));
      for (let y = Math.max(TRAUFE, top - 1); y <= top; y++) S.put(ds, r.x, y, r.z, TY.dachziegel, 'dach_salone');
    }
  }
};
