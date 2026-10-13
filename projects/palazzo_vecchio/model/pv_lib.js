'use strict';
// Palazzo Vecchio: gemeinsame Geometrie der Module m0..m9 (keine Moduldatei, wird von world.js nicht geladen).
// Alles hier ist rein rechnerisch: Maske, Zonen, Kantenrahmen, Zellenliste (Records) und die Wandfunktionen.
// Je Build gibt es genau einen Zustand (state(ctx)) mit dem Register der belegten Zellen (K0: das zuerst
// gebaute Bauteil gewinnt; Details werden im Katalog vor den allgemeinen Teilen gebaut oder von diesen
// ausdrücklich ausgespart).

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const P = require('../../../tools/city/poly.js');

const PROJECT_DIR = path.resolve(__dirname, '..');
const OSM_ID = 'r1461712';

// ------------------------------------------------------------------ Katalog §0.2: Zonenpolygone (Weltpunkte)
const ZONEN = {
  T: [[-138.5, 842], [-124.5, 844.5], [-128.5, 866], [-142, 863.5]],
  A: [[-97, 906.5], [-146.5, 887], [-143.5, 870], [-142, 863.5], [-138.5, 842], [-132.5, 807.5], [-130.5, 798.5],
    [-121.5, 799.5], [-74, 809.5], [-88, 888], [-91.5, 908.5]],
  P: [[-84.5, 912], [-91.5, 908.5], [-88, 888], [-63, 895], [-57.5, 896.5], [-63, 921]],
  B: [[-57.5, 896.5], [-63, 895], [-47.5, 809], [-22, 809], [-0.5, 809], [102.5, 820.5], [56, 926.5], [22.5, 972],
    [-24.5, 936], [-63, 921]]
};
// Salone dei Cinquecento im Fassadenrahmen PV (Katalog Modul 9): Außenrechteck und Lichtmaß [u0,u1) x [w0,w1)
const SAL_AUSSEN = { u0: -18, u1: 94, w0: 88, w1: 140 };
const SAL_LICHT = { u0: -14, u1: 90, w0: 92, w1: 136 };
// Außenkanten der Zone A, an denen das Ballatoio umläuft (E15 gehört mit E16 zur Südflucht)
const RING_KANTEN = new Set([0, 1, 15, 16, 17, 18, 19, 20]);

/** Wanddicke t(y_rel): 1..16 -> 5, 17..49 -> 4, 50..56 -> 3 (Katalog §0.3). */
const tWall = (y) => (y <= 16 ? 5 : y <= 49 ? 4 : 3);

// ------------------------------------------------------------------ Blocktypen über Rollen
const _ty = {};
function ty(rolle) { return _ty[rolle] || (_ty[rolle] = WZ.typ(rolle)); }
const TY = new Proxy({}, { get: (_, k) => ty(k) });

// ------------------------------------------------------------------ Geometrie (einmal je Prozess)
let GEO = null;

function zoneMaske(ring) {
  return WZ.Maske.ausGebaeude(['z'], { daten: [{ id: 'z', polygon: { aussen: [ring], loecher: [] } }] });
}

function geo() {
  if (GEO) return GEO;
  const json = JSON.parse(fs.readFileSync(path.join(PROJECT_DIR, 'project.json'), 'utf8'));
  const lm = WZ.ladeMasken(json, { dir: PROJECT_DIR });
  const M = lm.haupt, rf = lm.rahmen, bodenY = json.bodenY;
  const K = M.kanten();
  const gb = WZ.ladeGebaeude().get(OSM_ID);
  const poly = P.normalize(gb.polygon);
  const zm = {};
  for (const k of Object.keys(ZONEN)) zm[k] = zoneMaske(ZONEN[k]);
  const MT = zm.T;
  const zoneOf = (x, z) => (zm.T.has(x, z) ? 'T' : zm.A.has(x, z) ? 'A' : zm.P.has(x, z) ? 'P' : zm.B.has(x, z) ? 'B' : 'M');

  // Records je Maskenzelle
  const recs = [];
  const byKey = new Map();
  for (const [x, z] of M.cells) {
    const l = rf.toLocal(x, z);
    const e = M.naechsteKante(x, z);
    let zone = zoneOf(x, z);
    // Randzellen an den Außenkanten der Zone A, die durch die Polygonrundung in keinem Teilpolygon liegen, gehören zu A
    if (zone === 'M' && RING_KANTEN.has(e)) zone = 'A';
    const rec = {
      x, z, u: l.u, w: l.w, zone, isA: zone === 'A' || zone === 'T', d8: M.d8(x, z), dT: MT.d8(x, z),
      e, uK: 0, wK: 0,
      dHm: Math.min(M.dLoch(0, x, z), M.dLoch(1, x, z), M.dLoch(2, x, z), M.dLoch(3, x, z)),
      sal: l.u >= SAL_AUSSEN.u0 && l.u < SAL_AUSSEN.u1 && l.w >= SAL_AUSSEN.w0 && l.w < SAL_AUSSEN.w1,
      salL: l.u >= SAL_LICHT.u0 && l.u < SAL_LICHT.u1 && l.w >= SAL_LICHT.w0 && l.w < SAL_LICHT.w1,
      dN: Infinity, lis: false, eck: false, hi: [null, null, null, null]
    };
    const kl = K[rec.e].rahmen.toLocal(x, z);
    rec.uK = kl.u; rec.wK = kl.w;
    recs.push(rec);
    byKey.set(P.ck(x, z), rec);
  }
  const rec = (x, z) => byKey.get(P.ck(x, z));

  // Abstand der Zone-A-Zellen zur nächsten Zelle anderer Zonen (Ostgrenze des Arnolfo-Blocks)
  const nonA = WZ.Maske.vonZellen(recs.filter((r) => !r.isA).map((r) => [r.x, r.z]));
  for (const r of recs) if (r.isA) r.dN = nonA.dAussen(r.x, r.z);

  // Lisenen der Via-dei-Leoni-Fassade (E9): 3 breit, Abstand 16, an den Ecken beginnend; Katalog Modul 8 Teil 4
  const L9 = K[9].L;
  for (const r of recs) {
    if (r.e !== 9 || r.d8 > 2) continue;
    const j = Math.round((r.uK - 1.5) / 16);
    const c = 1.5 + 16 * j;
    if (j >= 0 && c <= L9 - 1.5 + 1e-9 && Math.abs(r.uK - c) < 1.5) r.lis = true;
  }
  // Eckquader der B-Ecken (3 x 3): Eckpunkte des Außenrings mit Knick > 10 Grad innerhalb der Zone B
  const eckPunkte = [];
  for (let i = 0; i < K.length; i++) {
    const a = K[i], b = K[(i + 1) % K.length];
    const dax = (a.b.x - a.a.x) / a.L, daz = (a.b.z - a.a.z) / a.L;
    const dbx = (b.b.x - b.a.x) / b.L, dbz = (b.b.z - b.a.z) / b.L;
    const ang = Math.acos(Math.max(-1, Math.min(1, dax * dbx + daz * dbz))) * 180 / Math.PI;
    const px = a.b.x, pz = a.b.z;
    let nB = 0, nA = 0;
    for (let x = Math.ceil(px - 1.5); x <= Math.floor(px + 1.5); x++) for (let z = Math.ceil(pz - 1.5); z <= Math.floor(pz + 1.5); z++) {
      const r = rec(x, z);
      if (r && r.zone === 'B') nB++;
      if (r && r.isA) nA++;
    }
    if (ang > 10 && nB > 0 && nA === 0) eckPunkte.push([px, pz]);
  }
  for (const [px, pz] of eckPunkte) {
    for (let x = Math.ceil(px - 2.5); x <= Math.floor(px + 2.5); x++) {
      for (let z = Math.ceil(pz - 2.5); z <= Math.floor(pz + 2.5); z++) {
        const r = rec(x, z);
        if (r && r.zone === 'B' && r.d8 <= 3) r.eck = true;
      }
    }
  }

  // Turmwand: Zone T (Wandband 4) plus die Randzellen der Westfassade am Turmrechteck, die das Polygon T durch die Rundung verfehlt (sonst bleiben senkrechte Schlitze)
  const turmBand = recs.filter((r) => (r.zone === 'T' && r.dT <= 4) || (r.zone !== 'T' && r.d8 <= 1 && r.u >= 23.2 && r.u < 46.4 && r.w >= -0.7 && r.w < 14.8));

  // Löcher: Polygonkanten (Normale zeigt vom Loch weg ins Mauerwerk)
  const loecher = poly.loecher.map((ring, i) => ({ i, ring, kanten: P.edges({ aussen: [ring], loecher: [] }) }));

  GEO = { json, M, rf, bodenY, K, poly, zm, MT, recs, rec, byKey, loecher, eckPunkte, zoneOf, turmBand, ring: null, tower: {} };
  return GEO;
}

/** Lage einer Zelle zum Loch i: nächste Lochkante, t längs (ungeklemmt), L, Kanten-Index. */
function lochLage(g, i, r) {
  if (r.hi[i]) return r.hi[i];
  let best = null, bd = Infinity;
  for (const e of g.loecher[i].kanten) {
    const q = P.relToEdge(e, r.x, r.z);
    if (q.d < bd - 1e-9) { bd = q.d; best = { e, t: q.t, s: q.s, L: e.len, idx: e.index }; }
  }
  r.hi[i] = best;
  return best;
}

// ------------------------------------------------------------------ Ring des Ballatoio (Zellen außerhalb der Maske)
function ringZellen() {
  const g = geo();
  if (g.ring) return g.ring;
  const { M, K } = g;
  const bb = M.bbox;
  const out = [];
  // Das Ballatoio ragt nicht in die Polygone anderer Wahrzeichen (Uffizien, Korridor und Brücke, Loggia, Orsanmichele)
  const byId = WZ.ladeGebaeude();
  const fremdIds = [...WZ.wahrzeichenVorrang()].filter(([id, p]) => p !== 'palazzo_vecchio').map(([id]) => id)
    .concat(['w328477211', 'r2302811']).filter((id, i, a) => byId.has(id) && a.indexOf(id) === i);
  const fremd = WZ.Maske.ausGebaeude(fremdIds);
  const LS = K[15].L + K[16].L, LN = K[0].L + K[1].L;
  for (let x = bb.x0 - 3; x <= bb.x1 + 3; x++) {
    for (let z = bb.z0 - 3; z <= bb.z1 + 3; z++) {
      if (M.innen(x, z) || fremd.has(x, z)) continue;
      const s = M.dAussen(x, z);
      if (!(s >= 1 && s <= 3)) continue;
      const e = M.naechsteKante(x, z);
      if (!RING_KANTEN.has(e)) continue;
      let grp, pos, L;
      const kl = K[e].rahmen.toLocal(x, z);
      if (e >= 17) { grp = 'W'; pos = g.rf.toLocal(x, z).u; L = 89.9; }
      else if (e <= 1) { grp = 'N'; pos = (e === 1 ? K[0].L : 0) + kl.u; L = LN; }
      else { grp = 'S'; pos = (e === 16 ? K[15].L : 0) + kl.u; L = LS; }
      out.push({ x, z, s, e, grp, pos, L });
    }
  }
  g.ring = out;
  return out;
}

/** Konsolbogen-Raster: n = rund(L/5), Teilung L/n. Gibt Phase und Bogennummer zurück; cap = Eckzelle außerhalb 0..L. */
function raster(pos, L) {
  const n = Math.max(1, Math.round(L / 5));
  const p = L / n;
  if (pos < 0 || pos > L) return { cap: true, n, p };
  const q = pos / p;
  let j = Math.floor(q);
  if (j >= n) j = n - 1;
  const ph = q - j;                       // 0..1 innerhalb des Bogenfeldes j
  return { cap: false, n, p, j, ph, du: (ph - 0.5) * p };
}

// ------------------------------------------------------------------ Turm
function turm() {
  const g = geo();
  if (g.tower.ready) return g.tower;
  const t = g.tower;
  t.ready = true;
  t.cen = { u: 34.8, w: 7.05 };
  t.cenW = g.rf.toWorld(t.cen.u, t.cen.w);
  t.dil = {}; t.ero = {};
  t.dilate = (k) => t.dil[k] || (t.dil[k] = g.MT.dilate(k));
  t.erode = (k) => t.ero[k] || (t.ero[k] = g.MT.erode(k));
  return t;
}

// ------------------------------------------------------------------ Zustand je Build
const STATES = new WeakMap();
const keyOf = (x, y, z) => ((x + 4096) * 8192 + (z + 4096)) * 512 + y;

function state(ctx) {
  let S = STATES.get(ctx.grid);
  if (S) { S.ctx = ctx; return S; }
  const g = geo();
  const claimed = new Set();
  const skips = {};
  S = {
    g, claimed, skips, cfg: { PV_AXES: 9, PORTAL_U: 55 },
    bodenY: g.bodenY,
    ctx,
    plan: require('./pv_plan.js').plan(g),
    carve: null,   // freizuhaltende Zellen (Türen, Treppenlöcher, Treppen): put() setzt dort nichts (B2)
    types: new Map(),            // Zellschlüssel -> Blocktyp aller gesetzten Zellen (Rissschließung, Licht)
    pendN: [],
    pend: new Map(),             // Art -> noch nicht deklarierte Öffnungszellen [{x, y, z}]
    /** Setzt einen Block bei y_rel; false, wenn die Zelle schon belegt ist (K0) oder freigehalten wird. Prüft den Luftraum. */
    put(W, x, yr, z, type, tag) {
      const k = keyOf(x, yr + g.bodenY, z);
      if (S.carve.has(k)) return false;
      return S.setze(W, k, x, yr, z, type, tag);
    },
    /** Wie put, ignoriert aber die Freihaltung (für Treppen, Podeste und Türfüllungen, die selbst im freigehaltenen Raum stehen). */
    putForce(W, x, yr, z, type, tag) {
      return S.setze(W, keyOf(x, yr + g.bodenY, z), x, yr, z, type, tag);
    },
    setze(W, k, x, yr, z, type, tag) {
      if (claimed.has(k)) { const id = tag || '?'; skips[id] = (skips[id] || 0) + 1; return false; }
      if (!g.M.innen(x, z) && !(g.M.dAussen(x, z) <= 3)) {
        throw new Error(`Luftraum verletzt bei (${x},${yr},${z}) ${tag || ''}`);
      }
      claimed.add(k);
      S.types.set(k, type);
      W.set(x, yr + g.bodenY, z, type);
      return true;
    },
    has(x, yr, z) { return claimed.has(keyOf(x, yr + g.bodenY, z)); },
    /** Liegt in der Platte bei (x, y_rel, z) eine Lampe (Seelaterne als Bodeneinbau)? */
    lampe(x, yr, z) { return S.plan.lampen.has(keyOf(x, yr + g.bodenY, z)); },
    /** Öffnungszelle (Luft) für die spätere Deklaration vormerken (R14); art: tuer|tor|fenster_offen|arkade|loggia|scharte. */
    note(art, x, yr, z) {
      let l = S.pend.get(art);
      if (!l) S.pend.set(art, l = []);
      l.push({ x, y: yr + g.bodenY, z });
    },
    /** Fensternische hinter dem Glas (Luft, Sohlbank über Kopfhöhe): wird als unzugänglich deklariert. */
    nische(x, yr, z) { S.pendN.push({ x, y: yr + g.bodenY, z }); },
    /** Vorgemerkte Öffnungen beim aktuellen Bauteil des Moduls deklarieren. */
    flush() {
      if (S.pendN.length) {
        S.ctx.unzugaenglich(S.pendN, 'Fensternische hinter dem Glas: die Sohlbank liegt mindestens drei Blöcke über dem Fußboden, die Nische ist nur ein Wandeinschnitt und nicht begehbar');
        S.pendN = [];
      }
      for (const [art, l] of S.pend) if (l.length) S.ctx.oeffnung(l, art);
      S.pend.clear();
    },
    /** Schichtweise füllen: für y in y0..y1 und alle Records den Typ aus mat(rec, y) (null = nichts). */
    band(W, recs, y0, y1, mat, tag) {
      let n = 0;
      for (let y = y0; y <= y1; y++) for (const r of recs) { const t = mat(r, y); if (t && S.put(W, r.x, y, r.z, t, tag)) n++; }
      S.flush();
      return n;
    },
    korridor: (r, y) => korridor(g, r, y),
    dogana: (r, y) => dogana(r, y)
  };
  S.carve = new Set(S.plan.carve);
  STATES.set(ctx.grid, S);
  return S;
}

// ------------------------------------------------------------------ Korridoröffnung und Dogana-Tür
const KOR = { t0: 3.35, t1: 10.35 };
function korridor(g, r, y) {
  if (y < 34 || y > 41 || r.d8 > 4 || (r.e !== 14 && r.e !== 15)) return null;
  const tp = r.e === 14 ? r.uK : g.K[14].L + r.uK;
  const innen = tp >= KOR.t0 && tp < KOR.t1;
  if (innen && y <= 40) return 'air';
  if (innen && y === 41) return 'laibung';
  if (y <= 41 && ((tp >= KOR.t0 - 1 && tp < KOR.t0) || (tp >= KOR.t1 && tp < KOR.t1 + 1))) return 'laibung';
  return null;
}

// Dogana-Tür auf E6 bei x = -35 (Katalog Modul 1 Teil 4)
function dogana(r, y) {
  if (r.zone !== 'B' || r.e !== 6 || r.d8 > 5 || r.x < -37 || r.x > -33) return null;
  if (r.x >= -36 && r.x <= -34 && y <= 6) return 'air';
  if (r.d8 <= 2) {
    if ((r.x === -37 || r.x === -33) && y <= 7) return 'frame';
    if (y === 7) return 'frame';
    if (y >= 14 && y <= 15 && (r.x === -37 || r.x === -35 || r.x === -33)) return 'zinne';
  }
  return null;
}

// ------------------------------------------------------------------ Öffnungen (alle in Fassadenkoordinate u, Höhe y, Tiefe d)
// Rückgabe: undefined = keine Öffnung zuständig, null = Luft, sonst Blocktyp.
function fenster(u, y, d, u0, hw, y0, y1, rahmen) {
  if (u >= u0 - hw && u < u0 + hw && y >= y0 && y <= y1) return d === 1 ? TY.glas_fenster : null;
  if (d === 1 && u >= u0 - hw - 1 && u < u0 + hw + 1 && y >= y0 - 1 && y <= y1 + 1) return rahmen;
  return undefined;
}

// Bifora: Außenmaß 7 breit, Rahmen und Mittelstütze in den äußeren zwei Lagen, Dreipass in der obersten Lichtenzeile
function bifora(u, y, d, u0, y0, y1) {
  if (!(u >= u0 - 3.5 && u < u0 + 3.5 && y >= y0 && y <= y1)) return undefined;
  const du = u - u0;
  const rahmen = du < -2.5 || du >= 2.5 || y === y0 || y === y1 || (du >= -0.5 && du < 0.5);
  if (rahmen) return d <= 2 ? TY.marmor_weiss : undefined;
  if (y === y1 - 1) return TY.marmor_ornament;
  return d === 1 ? TY.glas_fenster : null;
}

// Hauptportal der Westfassade (Katalog Modul 1 Teil 1): 8 x 12, Marmorrahmen 2 breit, Sturz, Wappentafel, Tür in d 3..4
function portalW(u, y, d, u0) {
  const du = u - u0;
  if (y <= 12) {
    if (du >= -4 && du < 4) return null;
    if (d <= 2 && ((du >= -6 && du < -4) || (du >= 4 && du < 6))) return TY.marmor_weiss;
  } else if (y <= 14) {
    if (d <= 2 && du >= -6 && du < 6) return TY.marmor_weiss;
  } else if (y <= 17) {
    if (d === 1 && du >= -2 && du < 2) return TY.marmor_ornament;
  }
  return undefined;
}

// Tramontana-Portal auf E1: 6 x 10 mit Tympanon
function portalTramontana(u, y, d, u0) {
  const du = u - u0;
  if (y <= 10) {
    if (du >= -3 && du < 3) return null;
    if (d <= 2 && ((du >= -4 && du < -3) || (du >= 3 && du < 4))) return TY.marmor_weiss;
  } else if (y === 11) {
    if (d <= 2 && du >= -4 && du < 4) return TY.marmor_weiss;
  } else if (y <= 14) {
    const hb = 4 - (y - 12);               // 4, 3, 2 Halbbreite des Tympanons
    if (d === 1 && du >= -hb && du < hb) return TY.marmor_weiss;
  }
  return undefined;
}

// kleine Tür auf E16: 3 x 6
function tuerKlein(u, y, d, u0) {
  const du = u - u0;
  if (y <= 6 && du >= -1.5 && du < 1.5) return null;
  if (d === 1 && du >= -2.5 && du < 2.5 && y <= 7) return TY.pietra_forte;
  return undefined;
}

// Fassadeninfo einer Zone-A-Zelle: Gruppe, Koordinate und Achsen
function fassadeA(S, r) {
  if (r.fa !== undefined) return r.fa;
  const g = S.g;
  let f = null;
  const e = r.e;
  if (e >= 17) {
    const ax = [];
    for (let k = 0; k < S.cfg.PV_AXES; k++) ax.push(5 + 10 * k);
    f = { grp: 'W', u: r.u, axes: ax };
  } else if (e === 1) {
    f = { grp: 'N1', u: r.uK, axes: [4, 14, 24, 34, 44].filter((a) => a + 3.5 <= g.K[1].L) };
  } else if (e === 0) {
    f = { grp: 'N0', u: r.uK, axes: [g.K[0].L / 2] };
  } else if (e === 16) {
    f = { grp: 'S', u: r.uK, axes: [4, 14, 24, 34, 44].filter((a) => a + 3.5 <= g.K[16].L) };
  }
  r.fa = f;
  return f;
}

function oeffnungA(S, r, y) {
  const f = fassadeA(S, r);
  if (!f) return undefined;
  const { u, grp } = f, d = r.d8;
  let skipU = null, skipR = 0;
  if (y <= 17) {
    let q;
    if (grp === 'W') { q = portalW(u, y, d, S.cfg.PORTAL_U); skipU = S.cfg.PORTAL_U; skipR = 6; }
    else if (grp === 'N1') { q = portalTramontana(u, y, d, 24); skipU = 24; skipR = 5; }
    else if (grp === 'S') { q = tuerKlein(u, y, d, 40); skipU = 40; skipR = 5; }
    if (q !== undefined) {
      if (q === null) S.note('tuer', r.x, y, r.z);
      return q;
    }
  }
  {
    for (const u0 of f.axes) {
      let q;
      if (y <= 16) {
        if (skipU !== null && Math.abs(u0 - skipU) < skipR) continue;
        q = fenster(u, y, d, u0, 1.5, 6, 11, TY.pietra_forte);
      } else if (y <= 33) q = bifora(u, y, d, u0, 20, 30);
      else q = bifora(u, y, d, u0, 37, 46);
      if (q !== undefined) { if (q === null) S.nische(r.x, y, r.z); return q; }
    }
  }
  return undefined;
}

/** Wandmaterial der Zone A (Arnolfo-Block, einschließlich Turmzone) bei y_rel 1..49; null = keine Wand. */
function wandA(S, r, y) {
  if (r.d8 > tWall(y)) return null;
  if (r.zone === 'T' && r.dT > 4) return null;                          // K2: Turmhohlraum bleibt leer (Turmwand 4 dick)
  if (S.korridor(r, y)) { if (S.korridor(r, y) === 'air') S.note('tor', r.x, y, r.z); return null; }
  const q = oeffnungA(S, r, y);
  if (q !== undefined) return q;
  if (r.d8 === 1 && (y === 17 || y === 34)) return TY.marmor_weiss;     // Marcapiano
  return TY.pietra_forte_rustika;                                         // K1: ganze Fassade Rustika
}

// Fassadeninfo der Zonen M, P, B: Achsabstand 8, mittig auf der Kante
function fassadeM(S, r) {
  if (r.fm !== undefined) return r.fm;
  const L = S.g.K[r.e].L;
  let f = null;
  if (!RING_KANTEN.has(r.e) && r.zone !== 'A' && r.zone !== 'T' && L >= 12) {
    const n = Math.floor((L - 5) / 8);
    const axes = [];
    const s0 = (L - 8 * (n - 1)) / 2;
    for (let i = 0; i < n; i++) axes.push(s0 + 8 * i);
    f = { u: r.uK, axes, L };
  }
  r.fm = f;
  return f;
}

// Via-dei-Leoni-Portal (Buontalenti): 8 x 14 mit Keilsteinbogen, Wappen darüber
function portalLeoni(u, y, d, u0) {
  const du = u - u0;
  const r = 4, spring = 11;
  const offen = (a, b) => (b <= spring ? Math.abs(a) < r : a * a + (b - spring) * (b - spring) < r * r);
  if (offen(du, y)) return null;
  if (d <= 2) {
    if (y <= spring && Math.abs(du) < r + 1) return TY.pietra_serena;
    if (y > spring && du * du + (y - spring) * (y - spring) < (r + 1) * (r + 1)) return TY.pietra_serena;
  }
  if (d === 1 && y >= 17 && y <= 19 && du >= -1.5 && du < 1.5) return TY.marmor_ornament;
  return undefined;
}

/** Wandmaterial der Zonen M, P, B bei y_rel 1..49 (EG Rustika, OG Putz); null = keine Wand. */
function wandM(S, r, y) {
  if (r.d8 > tWall(y)) return null;
  const kz = S.korridor(r, y), dz = S.dogana(r, y);
  if (kz === 'air') S.note('tor', r.x, y, r.z);
  if (dz === 'air') S.note('tuer', r.x, y, r.z);
  if (kz || r.lis || r.eck || dz) return null;
  const f = fassadeM(S, r);
  const eg = y <= 16;
  const base = eg ? TY.pietra_forte_rustika : TY.putz_sand;
  if (f) {
    const d = r.d8;
    if (r.e === 9 && y <= 19) {
      const q = portalLeoni(f.u, y, d, f.L / 2);
      if (q !== undefined) { if (q === null) S.note('tuer', r.x, y, r.z); return q; }
    }
    for (const u0 of f.axes) {
      if (r.e === 9 && Math.abs(u0 - f.L / 2) < 5) continue;
      let q;
      if (eg) q = fenster(f.u, y, d, u0, 1.5, 7, 11, TY.pietra_forte);
      else if (y <= 33) q = fensterOG(f.u, y, d, u0, 20, 26);
      else q = fensterOG(f.u, y, d, u0, 37, 43);
      if (q !== undefined) { if (q === null) S.nische(r.x, y, r.z); return q; }
    }
  }
  return base;
}

// Fenster 3 x 7 der Mittelbauten: Steinrahmen, Läden links und rechts in d = 1
function fensterOG(u, y, d, u0, y0, y1) {
  const q = fenster(u, y, d, u0, 1.5, y0, y1, TY.pietra_serena);
  if (q !== undefined) return q;
  if (d === 1 && y >= y0 && y <= y1 && ((u >= u0 - 3.5 && u < u0 - 2.5) || (u >= u0 + 2.5 && u < u0 + 3.5))) return TY.fensterladen;
  return undefined;
}


// ------------------------------------------------------------------ Dachfläche: Chamfer-Abstandsfeld wie tools/city/haus.js
// cells: [[x, z], ...]; Randzellen (mit einem Nachbarn außerhalb der Menge in der 8er-Nachbarschaft) haben Abstand 0.
function abstandsfeld(cells) {
  const S = new Set(cells.map(([x, z]) => P.ck(x, z)));
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const [x, z] of cells) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; }
  const W = x1 - x0 + 1, H = z1 - z0 + 1, INF = 1e9, D = Math.SQRT2;
  const d = new Float32Array(W * H).fill(INF);
  const inS = new Uint8Array(W * H);
  const idx = (x, z) => (x - x0) * H + (z - z0);
  for (const [x, z] of cells) inS[idx(x, z)] = 1;
  for (const [x, z] of cells) {
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      if ((dx || dz) && !S.has(P.ck(x + dx, z + dz))) d[idx(x, z)] = 0;
    }
  }
  const relax = (i, j, w) => { if (inS[j] && d[j] + w < d[i]) d[i] = d[j] + w; };
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
    const i = idx(x, z);
    if (!inS[i]) continue;
    if (x > x0) { relax(i, idx(x - 1, z), 1); if (z > z0) relax(i, idx(x - 1, z - 1), D); if (z < z1) relax(i, idx(x - 1, z + 1), D); }
    if (z > z0) relax(i, idx(x, z - 1), 1);
  }
  for (let x = x1; x >= x0; x--) for (let z = z1; z >= z0; z--) {
    const i = idx(x, z);
    if (!inS[i]) continue;
    if (x < x1) { relax(i, idx(x + 1, z), 1); if (z < z1) relax(i, idx(x + 1, z + 1), D); if (z > z0) relax(i, idx(x + 1, z - 1), D); }
    if (z < z1) relax(i, idx(x, z + 1), 1);
  }
  return (x, z) => d[idx(x, z)];
}

module.exports = {
  abstandsfeld, fassadeM, geo, state, ringZellen, raster, turm, lochLage, tWall, TY, ty, keyOf,
  wandA, wandM, oeffnungA, KOR, SAL_AUSSEN, SAL_LICHT, RING_KANTEN, PROJECT_DIR,
  fenster, bifora
};
