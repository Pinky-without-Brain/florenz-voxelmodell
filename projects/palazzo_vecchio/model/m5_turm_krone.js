'use strict';
// Modul 5: Turm, Glockenstube und Krone (Katalog §6). T+k / T-k sind das um k Zellen aufgeweitete bzw. verkleinerte
// Turmpolygon (Chebyshev). Turmspitze y_rel 188 = Y 256.
const pv = require('./pv_lib.js');
const { TU0, TU1, TW0, TW1, TUC, TWC } = require('./m4_turm_schaft.js');

const frac = (q) => q - Math.floor(q);

module.exports = {
  module: 5,
  build(ctx) {
    const S = pv.state(ctx);
    const g = S.g, TY = pv.TY;
    const t = pv.turm();
    const MT = g.MT;
    const lokal = (x, z) => g.rf.toLocal(x, z);

    // Zellen des Rings T+3 minus T mit Offset (kleinstes k mit Zelle in T+k) und Lage im Turmrechteck
    const off = new Map();
    for (const k of [1, 2, 3]) for (const [x, z] of t.dilate(k).cells) if (!MT.has(x, z) && !off.has(x * 8192 + z)) off.set(x * 8192 + z, k);
    const ring3 = [];
    for (const [x, z] of t.dilate(3).cells) {
      if (MT.has(x, z)) continue;
      const l = lokal(x, z);
      const ex = Math.abs(l.u - TUC) - (TU1 - TU0) / 2, ey = Math.abs(l.w - TWC) - (TW1 - TW0) / 2;
      // ex > ey: Schmalseite (Position w), sonst Langseite (Position u); Ecke = beide überschritten
      ring3.push({ x, z, u: l.u, w: l.w, off: off.get(x * 8192 + z), ecke: ex > 0 && ey > 0, pos: ex > ey ? l.w : l.u });
    }
    const bandT = g.recs.filter((r) => r.zone === 'T' && r.dT <= 4);

    // 1) Konsolfries y_rel 145..152; Rückwand = Schaft (ergänzt, der Katalog nennt das Wandband in 145..152 nicht)
    const kon = ctx.part('turm_konsolen');
    S.band(kon, bandT, 145, 152, () => TY.pietra_forte, 'turm_konsolen');
    const byKey = new Map(ring3.map((c) => [c.x * 8192 + c.z, c]));
    const nb4 = (c) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dz]) => byKey.get((c.x + dx) * 8192 + c.z + dz)).filter(Boolean);
    // Konsolpfeiler: jede 3. Zelle des Umlaufs, innen schmal, nach außen nur mit Anschluss an die innere Schale
    for (const c of ring3) c.pf = c.off === 1 && (c.ecke || frac(c.pos / 3) < 0.34);
    for (const k of [2, 3]) for (const c of ring3) if (c.off === k) c.pf = (c.ecke || frac(c.pos / 3) < 0.5) && nb4(c).some((n) => n.off === k - 1 && n.pf);
    for (let y = 145; y <= 152; y++) {
      for (const c of ring3) {
        let ok;
        if (y <= 146) ok = c.off <= 1;
        else if (y <= 148) ok = c.off <= 2;
        else if (y === 152) ok = true;
        else ok = c.pf;                                     // 149..151: Pfeiler, dazwischen Spitzbogenfelder (frei)
        if (ok) S.put(kon, c.x, y, c.z, TY.pietra_forte, 'turm_konsolen');
      }
    }

    // 2) Turm-Ballatoio y_rel 153..160: Boden T+3, Brüstung 154..158 (T+3 minus T+1), ghibellinische Zinnen 159..160
    const bal = ctx.part('turm_ballatoio');
    for (const c of ring3) S.put(bal, c.x, 153, c.z, TY.pietra_forte, 'turm_ballatoio');
    const bru = ring3.filter((c) => c.off >= 2);
    for (let y = 154; y <= 158; y++) for (const c of bru) S.put(bal, c.x, y, c.z, TY.pietra_forte, 'turm_ballatoio');
    for (let y = 159; y <= 160; y++) {
      for (const c of bru) {
        const ph = frac(c.pos / 5);
        if (!(c.ecke || ph < 0.6)) continue;
        if (y === 160 && !c.ecke && ph >= 0.2 && ph < 0.4) continue;      // Schwalbenschwanz
        S.put(bal, c.x, y, c.z, TY.pietra_forte, 'turm_ballatoio');
      }
    }

    // 3) Glockenstube: Wand T (Band 4) mit vier Spitzbogenöffnungen 3 x 6 (y 154..159), Innenboden und drei Glocken
    const gl = ctx.part('glockenstube');
    const offen = (r, y) => {
      if (y < 154 || y > 159) return false;
      const dw = Math.min(r.w - TW0, TW1 - r.w), du = Math.min(r.u - TU0, TU1 - r.u);
      const d = dw < du ? Math.abs(r.u - TUC) : Math.abs(r.w - TWC);
      return d < (y <= 157 ? 1.5 : 0.5);
    };
    S.band(gl, bandT, 153, 160, (r, y) => (offen(r, y) ? null : TY.pietra_forte), 'glockenstube');
    const innen = g.recs.filter((r) => r.zone === 'T' && r.dT > 4);
    S.band(gl, innen, 153, 153, () => TY.pietra_forte, 'glockenstube');      // Boden der Glockenstube (trägt die Glocken)
    for (const du of [-4, 0, 4]) {
      const zellen = innen.filter((r) => r.u >= TUC + du - 1 && r.u < TUC + du + 1 && r.w >= TWC - 1 && r.w < TWC + 1);
      for (let y = 154; y <= 156; y++) for (const r of zellen) S.put(gl, r.x, y, r.z, TY.bronze, 'glockenstube');
    }

    // 4) Edikula y_rel 161..176 auf T-3: Boden, vier Eckpfeiler 2 x 2, Rundbögen (Kämpfer 171, Scheitel 175)
    const ed = ctx.part('edikula');
    const E3 = t.erode(3);
    const e3 = E3.cells.map(([x, z]) => { const l = lokal(x, z); return { x, z, u: l.u, w: l.w, d: E3.d8(x, z) }; });
    let uMin = Infinity, uMax = -Infinity, wMin = Infinity, wMax = -Infinity;
    for (const c of e3) { uMin = Math.min(uMin, c.u); uMax = Math.max(uMax, c.u); wMin = Math.min(wMin, c.w); wMax = Math.max(wMax, c.w); }
    const uMid = (uMin + uMax) / 2;
    for (const c of e3) S.put(ed, c.x, 161, c.z, TY.pietra_serena, 'edikula');
    const eckP = (c) => (c.u < uMin + 2 || c.u > uMax - 2) && (c.w < wMin + 2 || c.w > wMax - 2) && c.d <= 2;
    // Bögen in der 1 Zelle starken Wand: Langseiten (Position u) zwei Bögen mit Mittelpfeiler, Schmalseiten (Position w) ein Bogen
    const ellipse = (pos, a, b, y) => (((pos - (a + b) / 2) / ((b - a) / 2 + 0.5)) ** 2) + (Math.max(0, y - 171) / 4.5) ** 2 < 1;
    const offenBogen = (c, y) => {
      const lang = Math.min(c.w - wMin, wMax - c.w) < Math.min(c.u - uMin, uMax - c.u);
      if (lang) {
        if (Math.abs(c.u - uMid) < 0.8) return false;                    // Mittelpfeiler
        const a = c.u < uMid ? uMin + 2 : uMid + 0.8, b = c.u < uMid ? uMid - 0.8 : uMax - 2;
        return c.u >= a && c.u <= b && ellipse(c.u, a, b, y);
      }
      const a = wMin + 2, b = wMax - 2;
      return c.w >= a && c.w <= b && ellipse(c.w, a, b, y);
    };
    for (let y = 162; y <= 176; y++) {
      for (const c of e3) {
        if (eckP(c)) { S.put(ed, c.x, y, c.z, y === 169 || y === 170 ? TY.marmor_ornament : TY.pietra_serena, 'edikula'); continue; }
        if (c.d !== 1 || offenBogen(c, y)) continue;
        S.put(ed, c.x, y, c.z, TY.pietra_serena, 'edikula');
      }
    }

    // 5) Turmdach y_rel 177..184: Pyramide über T-2 (Anstieg 1 je Lage), darüber Stange
    const dach = ctx.part('turmdach');
    let top = null;
    for (let k = 0; k < 8; k++) {
      const m = t.erode(2 + k);
      if (!m.size) break;
      for (const [x, z] of m.cells) S.put(dach, x, 177 + k, z, TY.dachziegel, 'turmdach');
      top = { k, m };
    }
    const cw = t.cenW;
    let st = null, sd = Infinity;
    for (const [x, z] of top.m.cells) { const d = Math.hypot(x - cw.x, z - cw.z); if (d < sd) { sd = d; st = { x, z }; } }
    for (let y = 177 + top.k + 1; y <= 184; y++) S.put(dach, st.x, y, st.z, TY.bronze, 'turmdach');

    // 6) Marzocco-Fahne (vereinfachte Blockfigur) y_rel 185..188
    const fa = ctx.part('marzocco_fahne');
    for (let dx = 0; dx < 2; dx++) for (let dz = 0; dz < 2; dz++) S.put(fa, st.x + dx, 185, st.z + dz, TY.bronze, 'marzocco_fahne');
    for (let y = 186; y <= 187; y++) for (let dx = 0; dx < 2; dx++) for (let dz = 0; dz < 3; dz++) S.put(fa, st.x + dx, y, st.z + dz, TY.bronze, 'marzocco_fahne');
    S.put(fa, st.x, 188, st.z + 2, TY.bronze, 'marzocco_fahne');
  }
};
