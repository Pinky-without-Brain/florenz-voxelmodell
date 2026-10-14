'use strict';
// Raumplan des Palazzo Pitti (Katalog §8, Modul 7): Trennwände, Türen, Treppen, Lichter – im Voraus berechnet, damit
// die Wandmodule (1–4, 7) Türen frei lassen und die Decken (5, 6) Treppenlöcher und Lichter aussparen.
// Geschosse: eg (Stehhöhe Lage 1, Decke 24..25), pn (26, Decke 49..50), og (51, Decke 73..74).
// Türen: geplante Türen 3 × 5 nach Katalog (Spinnwand, Trennwände, Appartamenti, Vestibül-Portal 7 × 9) und
// automatische Durchgänge: Zerfällt ein Geschoss trotzdem in mehrere Raumgruppen, wird je Gruppe der kürzeste Weg durch
// innere Wände (nie durch die Außenhaut) geöffnet und auf 3 Zellen verbreitert.

const G = require('./_pi.js');
const { ZELLEN, MATERIAL, AN, K2, ck3, Y, WZ } = G;
const TREPPE = WZ.treppe;
const PAL = require('../../../tools/spec/palette.js');

const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const GESCHOSSE = {
  eg: { stand: 1, decke: G.DECKEN.eg[0], zonen: ['H', 'W', 'F'] },
  pn: { stand: 26, decke: G.DECKEN.pn[0], zonen: ['H', 'W'] },
  og: { stand: 51, decke: G.DECKEN.og[0], zonen: ['H'] }
};
const TUER_H = 5;
const UN = (n) => 16.452 * n;
const TRENN = { eg: [4, 7, 9, 12, 15, 18], pn: [4, 7, 10, 13, 16, 19], og: [4, 7, 10, 13, 16, 19] };
const V = [5, 26], RR = [28, 49];          // Vorderreihe w 5..25, Rückreihe w 28..48
const SPINE = [26, 28];

// ---------------------------------------------------------------- Innenwände (je Geschoss)
const imH = (c) => c.hof < 0 && c.zone === 'H';
const spinnwand = (c) => imH(c) && c.u >= 6 && c.u < 340 && c.w >= SPINE[0] && c.w < SPINE[1];
function trennwand(c, g) {
  if (!imH(c) || !((c.w >= V[0] && c.w < V[1]) || (c.w >= RR[0] && c.w < RR[1]))) return false;
  for (const n of TRENN[g]) { const u0 = UN(n); if (c.u >= u0 && c.u < u0 + 2) return true; }
  if (g !== 'eg' && c.w >= V[0] && c.w < V[1] && ((c.u >= 26 && c.u < 28) || (c.u >= 327 && c.u < 329))) return true;
  return false;
}
const appartamenti = (c, g) => g === 'pn' && imH(c) && c.u >= 95 && c.u < 133 && ((c.w >= 83 && c.w < 85) || (c.w >= 115 && c.w < 117));
const innenwand = (c, g) => spinnwand(c) || trennwand(c, g) || appartamenti(c, g);

/** Wandzelle eines Geschosses (Hüllband, Hofband oder Innenwand)? */
function wandIm(c, g) {
  if (c.hof >= 0) return false;
  const L = GESCHOSSE[g].stand + 2;
  if (!GESCHOSSE[g].zonen.includes(c.zone)) return true;
  return c.dz <= G.t(c, L) || innenwand(c, g);
}

// ---------------------------------------------------------------- geplante Türen
const TUEREN = { eg: new Set(), pn: new Set(), og: new Set() };
function raumMitten(g, w0, w1) {
  // Mitten der Räume einer Reihe zwischen den Trennwänden
  const grenzen = [6, ...TRENN[g].map(UN), 340].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i + 1 < grenzen.length; i++) out.push((grenzen[i] + grenzen[i + 1]) / 2 + 1);
  void w0; void w1;
  return out;
}
for (const g of Object.keys(GESCHOSSE)) {
  const mitten = raumMitten(g);
  for (const c of MATERIAL) {
    if (!imH(c)) continue;
    // Spinnwand: je Raum der Vorderreihe eine Tür in der Mitte; im EG das Portal 7 × 9 zum Hof (Modul 7)
    if (spinnwand(c) && mitten.some((m) => Math.abs(c.u - m) < 1.5)) TUEREN[g].add(K2(c.x, c.z));
    if (g === 'eg' && spinnwand(c) && Math.abs(c.u - G.PORTAL_U) < 3.5) TUEREN[g].add(K2(c.x, c.z));
    // Trennwände: Tür in der Mitte der Reihe (Enfilade)
    if (trennwand(c, g) && (Math.abs(c.w - 15.5) < 1.5 || Math.abs(c.w - 38.5) < 1.5)) TUEREN[g].add(K2(c.x, c.z));
    if (appartamenti(c, g) && Math.abs(c.u - 114) < 1.5) TUEREN[g].add(K2(c.x, c.z));
  }
}
const PORTAL_SPINE_H = 9;

// ---------------------------------------------------------------- automatische Durchgänge
// Raumgruppen eines Geschosses: Zusammenhangskomponenten der Nicht-Wand-Zellen (Türen offen, Höfe nur im EG)
function gruppen(g) {
  const offen = (c) => c && (!wandIm(c, g) || TUEREN[g].has(K2(c.x, c.z))) && (c.hof < 0 || g === 'eg');
  const seen = new Set();
  const out = [];
  for (const c of ZELLEN) {
    if (!offen(c) || seen.has(K2(c.x, c.z))) continue;
    const comp = [];
    const st = [c]; seen.add(K2(c.x, c.z));
    while (st.length) {
      const q = st.pop(); comp.push(q);
      for (const [dx, dz] of N4) {
        const n = AN.get(K2(q.x + dx, q.z + dz));
        if (!offen(n) || seen.has(K2(n.x, n.z))) continue;
        seen.add(K2(n.x, n.z)); st.push(n);
      }
    }
    out.push(comp);
  }
  return out;
}
// Durchbruch: kürzester Weg durch innere Wände (Außenhaut d8 ≥ 2 und Hofhaut dH ≥ 2 bleiben) zu einer anderen Gruppe
const DURCHGANG_MAX = 30;
const UNVERBINDBAR = { eg: [], pn: [], og: [] };
function verbinden(g) {
  const fehl = new Set();
  for (let runde = 0; runde < 60; runde++) {
    const gs = gruppen(g).filter((comp) => comp.some((c) => c.hof < 0) && comp.length >= 20);
    gs.sort((a, b) => b.length - a.length);
    const offen = gs.slice(1).filter((comp) => !fehl.has(K2(comp[0].x, comp[0].z)));
    if (!offen.length) return;
    const klein = offen[offen.length - 1];
    const eigen = new Set(klein.map((c) => K2(c.x, c.z)));
    const fremd = new Set();
    for (const comp of gs) if (comp !== klein) for (const c of comp) fremd.add(K2(c.x, c.z));
    const prev = new Map([...eigen].map((k) => [k, null]));
    let q = klein.slice(), ziel = null, tiefe = 0;
    while (q.length && ziel === null && tiefe <= DURCHGANG_MAX) {
      const nq = [];
      for (const c of q) {
        for (const [dx, dz] of N4) {
          const n = AN.get(K2(c.x + dx, c.z + dz));
          if (!n || prev.has(K2(n.x, n.z))) continue;
          prev.set(K2(n.x, n.z), K2(c.x, c.z));
          if (fremd.has(K2(n.x, n.z))) { ziel = K2(c.x, c.z); break; }
          if (n.hof < 0 && wandIm(n, g) && n.d8 >= 2 && n.dH >= 2 && GESCHOSSE[g].zonen.includes(n.zone)) nq.push(n);
        }
        if (ziel !== null) break;
      }
      q = nq; tiefe++;
    }
    if (ziel === null) {
      // nicht verbindbar: Gruppe bleibt (R13 meldet sie); weiter mit der nächsten
      fehl.add(K2(klein[0].x, klein[0].z));
      UNVERBINDBAR[g].push(klein.length);
      continue;
    }
    const pfad = [];
    for (let k = ziel; k !== null && !eigen.has(k); k = prev.get(k)) pfad.push(AN.get(k));
    for (const c of pfad) {
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const n = AN.get(K2(c.x + dx, c.z + dz));
        if (n && n.hof < 0 && wandIm(n, g) && n.d8 >= 2 && n.dH >= 2) TUEREN[g].add(K2(n.x, n.z));
      }
    }
  }
}
for (const g of Object.keys(GESCHOSSE)) verbinden(g);

/** Türzelle (Luft) in Lage L? Tür 5 hoch über der Stehhöhe; Vestibül-Portal 9 hoch. */
function tuer(c, L) {
  for (const g of Object.keys(GESCHOSSE)) {
    const s = GESCHOSSE[g].stand;
    const h = g === 'eg' && spinnwand(c) && Math.abs(c.u - G.PORTAL_U) < 3.5 ? PORTAL_SPINE_H : TUER_H;
    if (L >= s && L < s + h && TUEREN[g].has(K2(c.x, c.z))) return true;
  }
  return false;
}

// ---------------------------------------------------------------- Treppen
const BELEGT2D = new Map();                // Geschoss -> Set(K2) (Fuß und Kopfraum der Treppen)
const STUFE = new Set(), LOCH = new Set();
const ck = (b) => ck3(b.x, b.y, b.z);
function mitAuflager(bloecke, yBoden, rolle) {
  const voll = TREPPE.volltyp(rolle);
  const out = bloecke.slice();
  const eigen = new Set(bloecke.map(ck));
  for (const b of bloecke) for (let y = b.y - 1; y > yBoden; y--) if (!eigen.has(ck3(b.x, y, b.z))) { out.push({ x: b.x, y, z: b.z, typ: voll }); eigen.add(ck3(b.x, y, b.z)); }
  return out;
}
/** Raumzellen eines Geschosses (frei von Wänden und Türen, mit 1 Zelle Abstand zu Türen) in einem Bereich */
function raumZellen(g, pred) {
  const s = new Set();
  const tuerNah = (c) => {
    for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) if (TUEREN[g].has(K2(c.x + dx, c.z + dz))) return true;
    return false;
  };
  for (const c of MATERIAL) if (!wandIm(c, g) && pred(c) && !tuerNah(c)) s.add(K2(c.x, c.z));
  return s;
}
/**
 * Treppe suchen: Podesttreppe (stufen2 > 0) oder gerade Treppe in einer Zellmenge; alle Fußzellen, Zugang und Austritt
 * in der Menge, Abstand zu belegten Zellen. ziel: bevorzugte Lage (x, z).
 */
function sucheTreppe(menge, { stufen1, stufen2, breite, yStart, rolle, ziel, sperre }) {
  const liste = [...menge].map((k) => AN.get(k)).sort((a, b) => ((a.x - ziel.x) ** 2 + (a.z - ziel.z) ** 2) - ((b.x - ziel.x) ** 2 + (b.z - ziel.z) ** 2) || a.x - b.x || a.z - b.z);
  for (const c of liste) {
    for (const richtung of ['n', 'o', 's', 'w']) {
      const d = TREPPE.DIR[richtung];
      const start = { x: c.x, y: yStart, z: c.z };
      let bl;
      try {
        bl = stufen2 ? TREPPE.podestTreppe({ start, richtung, stufen1, stufen2, breite, rolle, drehsinn: 'rechts' })
          : TREPPE.geradeTreppe({ start, richtung, stufen: stufen1, breite, rolle });
      } catch (e) { continue; }
      const fuss = new Set(bl.map((b) => K2(b.x, b.z)));
      const zugang = [K2(c.x - d[0], c.z - d[1])];
      for (let i = 1; i < breite; i++) { const r = TREPPE.DIR[TREPPE.RECHTS[richtung]]; zugang.push(K2(c.x - d[0] + r[0] * i, c.z - d[1] + r[1] * i)); }
      const oben = bl.lauf && bl.lauf.oben ? [K2(bl.lauf.oben.x, bl.lauf.oben.z)] : [];
      if (!stufen2) {
        // gerade Treppe: Austritt hinter der letzten Stufe
        const n = stufen1;
        for (let i = 0; i < breite; i++) { const r = TREPPE.DIR[TREPPE.RECHTS[richtung]]; oben.push(K2(c.x + d[0] * n + r[0] * i, c.z + d[1] * n + r[1] * i)); }
      }
      const alle = [...fuss, ...zugang, ...oben];
      if (!alle.every((k) => menge.has(k) && !(sperre && sperre.has(k)))) continue;
      return { bloecke: bl, fuss, alle: new Set(alle) };
    }
  }
  return null;
}
function treppeEintragen(t, g, yBoden, rolle, kopfGeschoss) {
  t.lauf = t.bloecke.lauf;
  const bl = mitAuflager(t.bloecke, yBoden, rolle);
  t.bloecke = bl;
  for (const b of bl) STUFE.add(ck(b));
  for (const c of TREPPE.treppenloch(t.lauf, 3)) LOCH.add(ck(c));
  for (const k of t.alle) { let s = BELEGT2D.get(g); if (!s) BELEGT2D.set(g, s = new Set()); s.add(k); }
  if (kopfGeschoss) for (const k of t.fuss) { let s = BELEGT2D.get(kopfGeschoss); if (!s) BELEGT2D.set(kopfGeschoss, s = new Set()); s.add(k); }
  return t;
}
const imRechteck = (u0, u1, w0, w1) => (c) => c.u >= u0 && c.u < u1 && c.w >= w0 && c.w < w1;
const zielVon = (u, w) => { const p = G.R.toWorld(u, w); return { x: Math.round(p.x), z: Math.round(p.z) }; };

const TREPPEN = {};
function plane(name, g, pred, opts, kopf) {
  const sperre = new Set([...(BELEGT2D.get(g) || [])]);
  const menge = raumZellen(g, pred);
  const t = sucheTreppe(menge, { ...opts, sperre });
  if (t) TREPPEN[name] = treppeEintragen(t, g, opts.yStart - 1, opts.rolle, kopf);
  else TREPPEN[name] = null;
}
// Hauptgebäude: EG -> PN (West und Ost), PN -> OG (West und Ost); Podesttreppen 13 + 12, Breite 3
const POD = { stufen1: 13, stufen2: 12, breite: 3, rolle: 'pietra_serena' };
plane('s3_west_eg', 'eg', (c) => imH(c) && c.u < 66 && c.w >= V[0] && c.w < V[1], { ...POD, yStart: Y(1), ziel: zielVon(15, 15) }, 'pn');
plane('s1_ost_eg', 'eg', (c) => imH(c) && c.u >= 296 && c.w >= V[0] && c.w < V[1], { ...POD, yStart: Y(1), ziel: zielVon(330, 15) }, 'pn');
plane('s4_west_pn', 'pn', (c) => imH(c) && c.u < 66 && c.w >= RR[0] && c.w < 100, { ...POD, yStart: Y(26), ziel: zielVon(20, 38) }, 'og');
plane('s2_ost_pn', 'pn', (c) => imH(c) && c.u >= 296 && c.w >= RR[0] && c.w < 100, { ...POD, yStart: Y(26), ziel: zielVon(330, 38) }, 'og');
// Nebenbau West: EG -> PN
plane('w_eg', 'eg', (c) => c.zone === 'W', { ...POD, yStart: Y(1), ziel: zielVon(30, 70) }, 'pn');
// Flügel: gerade Treppe 22 Stufen auf die Dachterrasse (Lage 22), Breite 3
const ALI = { stufen1: 22, stufen2: 0, breite: 3, rolle: 'pietra_forte' };
plane('ali_west', 'eg', (c) => c.zone === 'F' && c.u < 0 && c.w < -10, { ...ALI, yStart: Y(1), ziel: zielVon(-25, -80) }, null);
plane('ali_ost', 'eg', (c) => c.zone === 'F' && c.u > 345 && c.w < -10, { ...ALI, yStart: Y(1), ziel: zielVon(352, -80) }, null);

const ausgespart = (x, y, z) => LOCH.has(ck3(x, y, z)) || STUFE.has(ck3(x, y, z));

// ---------------------------------------------------------------- Licht (Seelaternen in den Decken, Abstand ≤ 10)
const LICHT = new Set(), LICHT_LISTE = [];
function licht(zellen, standL, deckeL) {
  if (!zellen.length) return;
  for (const l of WZ.lichtRaster(zellen.map((c) => [c.x, Y(standL), c.z]), { abstand: 10, hoehe: deckeL - standL })) {
    const k = ck3(l.x, l.y, l.z);
    if (LICHT.has(k) || ausgespart(l.x, l.y, l.z)) continue;
    LICHT.add(k);
    LICHT_LISTE.push({ x: l.x, y: l.y, z: l.z });
  }
}
for (const [g, def] of Object.entries(GESCHOSSE)) {
  for (const zone of def.zonen) {
    const zellen = MATERIAL.filter((c) => c.zone === zone && !wandIm(c, g));
    licht(zellen, def.stand, zone === 'F' ? G.F_DACH[0] : def.decke);
  }
}
const istLicht = (x, y, z) => LICHT.has(ck3(x, y, z));

/** Treppentyp aus Palette (für Module) */
const treppenTyp = (rolle, richtung) => PAL.treppe(rolle, richtung);

module.exports = { UNVERBINDBAR, GESCHOSSE, TUEREN, tuer, wandIm, innenwand, spinnwand, trennwand, appartamenti, TREPPEN, ausgespart, istLicht,
  LICHT_LISTE, treppenTyp, gruppen };
