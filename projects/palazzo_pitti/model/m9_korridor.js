'use strict';
// Modul 9 – Corridoio Vasariano, Oltrarno bis Pitti (Katalog §10). Maske `korridor` (8.742 Zellen) vom Schnitt
// z = 1312 (Anschluss Ponte Vecchio, Boden Y 78) bis zum Tor des Ostflügels (Boden Y 83, Gang Y 84..90).
// Gangboden Y_f nach Wegabstand d vom Nordschnitt: max(78, Gelände der 7 × 7-Umgebung + 3), monoton, höchstens
// +1 je 40 Zellen, höchstens 83. Querschnitt: Boden Y_f − 1..Y_f, Gang Y_f + 1..Y_f + 7, Decke Y_f + 8..Y_f + 9,
// Wände d8 ≤ 2 (Abstandsfeld über alle Korridorstücke, auch das des Ponte Vecchio, damit die Wände am Schnitt fluchten).
// Unterbau massiv vom Gelände bis Y_f − 2, außer über Straßen und am abgehobenen Teilstück w1394832042.
// Höhenwechsel als Treppenblöcke (Aufstieg zum Palast hin). Anschlussstück zwischen Maske und Ostflügel im Luftraum.
const fs = require('node:fs');
const path = require('node:path');
const G = require('./_pi.js');
const PAL = require('../../../tools/spec/palette.js');
const ground = require('../../../tools/city/ground_stadt.js');

const { P, K2, Y, T, WZ } = G;
const MK = G.M.masken.korridor;
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const ALLE_KORRIDOR = WZ.Maske.ausGebaeude(['w1344547176', 'w1394832044', 'w1394832037', 'w1394832038', 'w1394832039',
  'w1394832040', 'w1394832041', 'w1394832042', 'w1394832043']);
const ABGEHOBEN = WZ.Maske.ausGebaeude(['w1394832042']);
const Y0 = 78, Y_END = 83, STEIGUNG = 40;

// Anschlussstück (Rahmen PI): u 376,2..380, w −32,2..−22,5, außerhalb der Hauptmaske
const ANSCHLUSS = [];
{
  const bb = G.MH.bbox;
  for (let x = bb.x0; x <= bb.x1 + 6; x++) for (let z = bb.z0; z <= bb.z1; z++) {
    const l = G.R.toLocal(x, z);
    if (l.u >= 376.2 && l.u < 380 && l.w >= -32.2 && l.w < -22.5 && !G.MH.innen(x, z) && !MK.has(x, z)) ANSCHLUSS.push({ x, z, u: l.u, w: l.w });
  }
}
const ANSCHLUSS_SET = new Set(ANSCHLUSS.map((c) => K2(c.x, c.z)));

// Zellen und Wegabstand vom Nordschnitt
const ZK = [];
const AK = new Map();
// Kantenabstand über Korridor ∪ Palast: zur Flügelwand hin keine eigene Gangwand (die Flügelwand ist die Gangwand,
// das Tor des Ostflügels öffnet direkt in den Gang)
const WANDFELD = ALLE_KORRIDOR.union(G.MH);
for (const [x, z] of MK.cells) { const c = { x, z, gt: ground.groundTopY(x, z), d8: WANDFELD.d8(x, z) || 1 }; ZK.push(c); AK.set(K2(x, z), c); }
{
  let q = ZK.filter((c) => c.z <= 1313);
  for (const c of q) c.d = 0;
  let d = 0;
  while (q.length) {
    const nq = [];
    for (const c of q) for (const [dx, dz] of N4) {
      const n = AK.get(K2(c.x + dx, c.z + dz));
      if (!n || n.d !== undefined) continue;
      n.d = d + 1; nq.push(n);
    }
    q = nq; d++;
  }
}
const D_MAX = Math.max(...ZK.map((c) => c.d));
// Bodenhöhe je Wegabstand: Bedarf LB(d) = laufendes Maximum von min(83, Gelände 7 × 7 + 3), am Ende 83;
// benötigte Höhe R(d) = max über d' ≥ d von LB(d') − ⌊(d' − d) / 40⌋ (höchstens +1 je 40 Zellen bis dorthin),
// danach monoton nicht fallend, zwischen 78 und 83
const YF = new Array(D_MAX + 1).fill(Y0);
{
  const ziel = new Array(D_MAX + 1).fill(Y0);
  for (const c of ZK) {
    let g = -Infinity;
    for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) g = Math.max(g, ground.groundTopY(c.x + dx, c.z + dz));
    ziel[c.d] = Math.max(ziel[c.d], Math.min(Y_END, g + 3));
  }
  ziel[D_MAX] = Y_END;
  const LB = [];
  let lauf = Y0;
  for (let d = 0; d <= D_MAX; d++) { lauf = Math.max(lauf, ziel[d]); LB.push(lauf); }
  let mx = Y0;
  for (let d = 0; d <= D_MAX; d++) {
    let r = Y0;
    for (let e = d; e <= D_MAX; e++) { const v = LB[e] - Math.floor((e - d) / STEIGUNG); if (v > r) r = v; if (LB[e] - Math.floor((e - d) / STEIGUNG) < Y0 && e > d + STEIGUNG * 6) break; }
    mx = Math.max(mx, Math.min(Y_END, r));
    YF[d] = mx;
  }
}
for (const c of ZK) c.yf = YF[c.d];
for (const c of ANSCHLUSS) { c.yf = Y_END; c.d = D_MAX + 1; c.d8 = (c.w < -31.2 || c.w >= -23.5) ? 1 : 3; c.gt = ground.groundTopY(c.x, c.z); }

// Straßen (Stadtgrund-Straßenflächen am Boden): kein Unterbau
const STRASSE = new Set();
{
  const f = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/stadt/flaechen.json'), 'utf8'));
  const bb = MK.bbox;
  for (const s of f.strassen) {
    if (!s.polygon || s.bruecke || s.layer > 0) continue;
    const poly = P.normalize(s.polygon);
    const b = P.bbox(poly);
    if (b.x1 < bb.x0 || b.x0 > bb.x1 || b.z1 < bb.z0 || b.z0 > bb.z1) continue;
    for (const c of ZK) if (P.contains(poly, c.x, c.z)) STRASSE.add(K2(c.x, c.z));
  }
}
const ohneUnterbau = (c) => STRASSE.has(K2(c.x, c.z)) || ABGEHOBEN.has(c.x, c.z);

// Gangdurchbruch: Wo der Gang im gedrehten Raster nur über Ecken zusammenhängt, werden Zellen der inneren Wandlage
// (d8 = 2, die Außenlage bleibt) auf dem kürzesten Weg geöffnet, bis der Gang 4-seitig zusammenhängt
{
  for (let runde = 0; runde < 40; runde++) {
    const gang = ZK.filter((c) => c.d8 > 2);
    const seen = new Set(), komp = [];
    for (const c of gang) {
      if (seen.has(K2(c.x, c.z))) continue;
      const comp = []; const st = [c]; seen.add(K2(c.x, c.z));
      while (st.length) {
        const q = st.pop(); comp.push(q);
        for (const [dx, dz] of N4) { const n = AK.get(K2(q.x + dx, q.z + dz)); if (n && n.d8 > 2 && !seen.has(K2(n.x, n.z))) { seen.add(K2(n.x, n.z)); st.push(n); } }
      }
      komp.push(comp);
    }
    if (komp.length <= 1) break;
    komp.sort((a, b) => a.length - b.length);
    const klein = komp[0];
    const eigen = new Set(klein.map((c) => K2(c.x, c.z)));
    const prev = new Map([...eigen].map((k) => [k, null]));
    let q = klein.slice(), ziel = null;
    while (q.length && !ziel) {
      const nq = [];
      for (const c of q) {
        for (const [dx, dz] of N4) {
          const n = AK.get(K2(c.x + dx, c.z + dz));
          if (!n || prev.has(K2(n.x, n.z))) continue;
          prev.set(K2(n.x, n.z), K2(c.x, c.z));
          if (n.d8 > 2) { ziel = n; break; }
          if (n.d8 === 2) nq.push(n);
        }
        if (ziel) break;
      }
      q = nq;
    }
    if (!ziel) break;
    for (let k = prev.get(K2(ziel.x, ziel.z)); k !== null && !eigen.has(k); k = prev.get(k)) AK.get(k).d8 = 3;
  }
}

const ALLE = [...ZK, ...ANSCHLUSS];
for (const c of ANSCHLUSS) AK.set(K2(c.x, c.z), c);
const LICHT = new Set();
{
  const gang = ALLE.filter((c) => c.d8 > 2);
  for (const l of WZ.lichtRaster(gang.map((c) => [c.x, c.yf + 1, c.z]), { abstand: 10, hoehe: 7 })) LICHT.add(l.x + ',' + l.y + ',' + l.z);
}
const istWand = (c) => c.d8 <= 2;
const abschnitt = (c) => `korridor_${Math.min(3, Math.floor(c.d / 180))}`;
const DIR_VON = (dx, dz) => (dz === -1 ? 'n' : dx === 1 ? 'o' : dz === 1 ? 's' : 'w');

module.exports = {
  module: 9,
  YF, ZK, ANSCHLUSS,
  build(ctx) {
    const B = G.belegung(ctx);
    const teile = new Map();
    const teil = (id) => { if (!teile.has(id)) teile.set(id, ctx.part(id)); return teile.get(id); };
    // Treppenstufen an Höhenwechseln: Gangzelle, deren Gang-Nachbar 1 tiefer liegt -> Aufstieg von dort
    const stufe = new Map();
    for (const c of ALLE) {
      if (istWand(c)) continue;
      for (const [dx, dz] of N4) {
        const n = AK.get(K2(c.x + dx, c.z + dz));
        if (n && !istWand(n) && n.yf === c.yf - 1) { stufe.set(K2(c.x, c.z), DIR_VON(-dx, -dz)); break; }
      }
    }
    // 1 Unterbau: massiver Mauerkern, Außenband Putz, Sockel Rustika (8 Lagen über Gelände)
    const ub = teil('korridor_unterbau');
    for (const c of ZK) {
      if (ohneUnterbau(c)) continue;
      for (let y = c.gt + 1; y <= c.yf - 2; y++) B.set(ub, c.x, y, c.z, y - c.gt <= 8 ? T.rustika : c.d8 <= 2 ? T.putz : T.mauer);
    }
    // 2 je Abschnitt: Boden, Wände mit Fenstern, Decke
    const ab = [...new Set(ALLE.map(abschnitt))].sort();
    for (const a of ab) {
      const zellen = ALLE.filter((c) => abschnitt(c) === a);
      const bo = teil(`${a}_boden`);
      for (const c of zellen) {
        B.set(bo, c.x, c.yf - 1, c.z, T.serena);
        const r = stufe.get(K2(c.x, c.z));
        B.set(bo, c.x, c.yf, c.z, r ? PAL.treppe('pietra_serena', r) : T.serena);
      }
      const wa = teil(`${a}_waende`);
      for (const c of zellen) {
        if (!istWand(c)) continue;
        for (let y = c.yf + 1; y <= c.yf + 7; y++) {
          const fenster = c.d < D_MAX + 1 && (c.d % 8) < 2 && y >= c.yf + 3 && y <= c.yf + 5;
          B.set(wa, c.x, y, c.z, fenster ? T.glas : (c.d8 === 1 ? T.forte : T.putz));
        }
      }
      const de = teil(`${a}_decke`);
      for (const c of zellen) for (const y of [c.yf + 8, c.yf + 9]) if (!LICHT.has(c.x + ',' + y + ',' + c.z)) B.set(de, c.x, y, c.z, T.forte);
    }
    // 3 Licht in der Decke über dem Gang (Abstand ≤ 10)
    const li = teil('korridor_licht_olt');
    for (const k of LICHT) { const [x, y, z] = k.split(',').map(Number); B.set(li, x, y, z, T.licht); }
    // 3b Luft unter dem Gang über Straßen und am abgehobenen Teilstück: Durchgang (wie beim Ponte Vecchio)
    const unten = [];
    for (const c of ZK) if (ohneUnterbau(c)) for (let y = c.gt + 1; y <= c.yf - 2; y++) if (B.frei(c.x, y, c.z)) unten.push({ x: c.x, y, z: c.z });
    if (unten.length) ctx.oeffnung(unten, 'arkade');
    // 4 Schnitt zum Ponte Vecchio (z ≤ 1312): offen, Gang setzt sich fort
    const tor = [];
    for (const c of ZK) {
      if (istWand(c) || c.z > 1313) continue;
      if (!N4.some(([dx, dz]) => !MK.has(c.x + dx, c.z + dz) && !ANSCHLUSS_SET.has(K2(c.x + dx, c.z + dz)))) continue;
      for (let y = c.yf + 1; y <= c.yf + 7; y++) tor.push({ x: c.x, y, z: c.z });
    }
    if (tor.length) ctx.oeffnung(tor, 'tor');
  }
};
