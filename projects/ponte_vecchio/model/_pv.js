'use strict';
// Gemeinsame Geometrie des Ponte Vecchio (Katalog: 20_Stadtmodell_Florenz/wahrzeichen/ponte_vecchio/BAUTEIL_KATALOG.md).
// Rahmen PB (θ = 116,6°): u über die Brücke von Nord nach Süd, w > 0 nach West (stromab), w < 0 nach Ost.
// Lagen: L = Y − BODEN_Y (Fahrbahn und Ladenboden = Lage 0 = Y 63).
// Alles hier ist reine Geometrie (deterministisch); die Module setzen die Blöcke über das Belegungsregister
// (zuerst gebaut gewinnt, reservierte Luft bleibt frei: Türen, Treppenlöcher).

const fs = require('node:fs');
const path = require('node:path');
const WZ = require('../../../tools/wahrzeichen');
const P = require('../../../tools/city/poly.js');
const PAL = require('../../../tools/spec/palette.js');
const { packKey } = require('../../../tools/geom/grid.js');
const ground = require('../../../tools/city/ground_stadt.js');

const DIR = path.resolve(__dirname, '..');
const PJ = JSON.parse(fs.readFileSync(path.join(DIR, 'project.json'), 'utf8'));
const BODEN_Y = PJ.bodenY;                           // 63
const Y = (L) => BODEN_Y + L;
const R = WZ.makeRahmen(PJ.rahmen);
const M = WZ.ladeMasken(PJ, { dir: DIR });
const MPV = M.alle;
// Abstandsfeld des Gangs: ungeschnittene Korridormaske (keine Stirnwand an den Schnitten) samt Turm (die Turmmauer ist
// am Turm die Ostwand des Gangs, Katalog §5: Gang am Turm auf Konsolen)
const KORRIDOR_UNGESCHNITTEN = WZ.Maske.ausGebaeude(['w1344547176', 'w1394832044']).union(M.masken.turm);

// ---------------------------------------------------------------- Maße (Katalog §0.3, §1–§6)
const W_OST = -9.5, W_WEST = 6.5;                    // Ostzeile w < −9,5, Westzeile w > 6,5
const TRAG = 19.5;                                   // Tragkörper |w| < 19,5, sonst Auskragung
const STIRN = 17.5;                                  // Stirnlagen |w| ≥ 17,5
const U_NORD = 6, U_SUED = 176;                      // Widerlager u < 6 und u ≥ 176
const PFEILER = [[55, 64], [118, 127]];
const BOEGEN = [[6, 55], [64, 118], [127, 176]];
const KAEMPFER_Y = 51, STICH = 8, PFEILER_FUSS_Y = 47;
const LOGGIA = [83, 122];                            // Loggia (Ost) u 83..121; Terrasse (West) u 82..121
const TERRASSE = [82, 122];
const LOGGIA_BOEGEN = [89.5, 102.5, 115.5];
const LADEN = { periodeOst: 0, periodeWest: 4, breite: 8 };
const L_ZWISCHEN = [8, 9], L_DECKE = [14, 15], L_GANG = [16, 22], L_GANGDECKE = [23, 24];
const TURM_TOP = 56;

// ---------------------------------------------------------------- Zellentabelle
const K2 = (x, z) => P.ck(x, z);
const ZELLEN = [];
const AN = new Map();
for (const [x, z] of MPV.cells) {
  const l = R.toLocal(x, z);
  const c = { x, z, u: l.u, w: l.w, gt: ground.groundTopY(x, z),
    T: M.masken.turm.has(x, z), K: M.masken.korridor.has(x, z), L: M.haupt.has(x, z), B: M.masken.bruecke.has(x, z) };
  c.E = c.L && !c.T && c.w < W_OST;
  c.W = c.L && !c.T && c.w > W_WEST;
  ZELLEN.push(c);
  AN.set(K2(x, z), c);
}
const zelle = (x, z) => AN.get(K2(x, z));
const nachbarn4 = (c) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dz]) => zelle(c.x + dx, c.z + dz));

// Abstandsfelder je Zone (Chebyshev zum Zonenrand, Randzelle = 1)
const maskeVon = (pred) => WZ.Maske.vonZellen(ZELLEN.filter(pred).map((c) => [c.x, c.z]));
const ME = maskeVon((c) => c.E), MW = maskeVon((c) => c.W), MT = maskeVon((c) => c.T);
for (const c of ZELLEN) {
  c.dE = c.E ? ME.d8(c.x, c.z) : 0;
  c.dW = c.W ? MW.d8(c.x, c.z) : 0;
  c.dT = c.T ? MT.d8(c.x, c.z) : 0;
  c.dK = c.K ? KORRIDOR_UNGESCHNITTEN.d8(c.x, c.z) : 0;
}

// Brückenzonen
const inPfeiler = (u) => PFEILER.findIndex(([a, b]) => u >= a && u < b);
const bogenVon = (u) => BOEGEN.findIndex(([a, b]) => u >= a && u < b);
/** Laibung (Kreissegment, Stich 8): untere Kante des Gewölbekörpers bei u; NaN außerhalb der Bögen. */
function laibung(u) {
  const k = bogenVon(u);
  if (k < 0) return NaN;
  const [a, b] = BOEGEN[k], S = b - a, uc = a + S / 2;
  const rho = (S * S / 4 + STICH * STICH) / (2 * STICH);
  return KAEMPFER_Y + Math.sqrt(Math.max(0, rho * rho - (u - uc) ** 2)) - (rho - STICH);
}

// Korridor: Wandstärke t_w (3 auf den Läden, 2 sonst, 1 wo der Streifen schmal ist)
const maxDvon = (c) => {
  let maxD = 0;
  for (let dx = -4; dx <= 4; dx++) for (let dz = -4; dz <= 4; dz++) {
    const n = zelle(c.x + dx, c.z + dz);
    if (n && n.K) maxD = Math.max(maxD, n.dK);
  }
  return maxD;
};
// Engstelle nördlich des Turms: Der Korridorumriss ist dort nur ein Rand ohne Gangbreite (d8 ≤ 2). Der Gang greift
// auf die angrenzenden Ostläden aus (Anbau, ANBAU_R Zellen); dort ist die Ladendecke der Gangboden.
const ANBAU_R = 4;
const ANBAU = new Set();
for (const c of ZELLEN) {
  if (!c.K || c.T || maxDvon(c) > 2) continue;
  for (let dx = -ANBAU_R; dx <= ANBAU_R; dx++) for (let dz = -ANBAU_R; dz <= ANBAU_R; dz++) {
    const n = zelle(c.x + dx, c.z + dz);
    if (n && n.E && !n.K && !n.T) ANBAU.add(K2(n.x, n.z));
  }
}
if (ANBAU.size) {
  for (const k of ANBAU) { const c = AN.get(k); c.K = true; c.anbau = true; }
  const mk = KORRIDOR_UNGESCHNITTEN.union(WZ.Maske.vonZellen([...ANBAU].map((k) => [P.ckX(k), P.ckZ(k)])));
  for (const c of ZELLEN) c.dK = c.K ? mk.d8(c.x, c.z) : 0;
}
for (const c of ZELLEN) {
  if (!c.K) continue;
  const maxD = maxDvon(c);
  c.tw = c.E && !c.anbau ? 3 : (maxD <= 3 ? 1 : 2);
  c.kWand = c.dK <= c.tw;
}

// Gangdurchbruch: Wo der Gang im gedrehten Raster nur über Ecken zusammenhängt (Knick am Turm), werden Wandzellen
// (nicht die äußerste Lage) auf dem kürzesten Weg zum Gang geschlagen, bis der Gang 4-seitig zusammenhängt.
{
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const gang = () => new Set(ZELLEN.filter((c) => c.K && !c.T && !c.kWand).map((c) => K2(c.x, c.z)));
  for (let runde = 0; runde < 20; runde++) {
    const g = gang();
    const komp = [];
    const seen = new Set();
    for (const k of [...g].sort((a, b) => a - b)) {
      if (seen.has(k)) continue;
      const comp = new Set([k]); seen.add(k);
      const st = [k];
      while (st.length) {
        const q = st.pop();
        for (const [dx, dz] of N4) {
          const n = K2(P.ckX(q) + dx, P.ckZ(q) + dz);
          if (g.has(n) && !seen.has(n)) { seen.add(n); comp.add(n); st.push(n); }
        }
      }
      komp.push(comp);
    }
    if (komp.length <= 1) break;
    komp.sort((a, b) => b.size - a.size);
    const haupt = komp[komp.length - 1];               // kleinste Komponente sucht Anschluss an eine andere
    // BFS von der Hauptkomponente durch Wandzellen mit dK >= 2 zur nächsten anderen Gangzelle
    const prev = new Map([...haupt].map((k) => [k, null]));
    let q = [...haupt], ziel = null;
    while (q.length && ziel === null) {
      const nq = [];
      for (const k of q) {
        for (const [dx, dz] of N4) {
          const n = zelle(P.ckX(k) + dx, P.ckZ(k) + dz);
          if (!n || !n.K || n.T) continue;
          const nk = K2(n.x, n.z);
          if (prev.has(nk)) continue;
          prev.set(nk, k);
          if (g.has(nk)) { ziel = k; break; }
          if (n.kWand && n.dK >= 2) nq.push(nk);
        }
        if (ziel !== null) break;
      }
      q = nq;
    }
    if (ziel === null) break;
    for (let k = ziel; k !== null && !haupt.has(k); k = prev.get(k)) { const c = AN.get(k); c.kWand = false; }
  }
}

// Straßenspalten (Via de' Bardi): der Unterbau des Korridors lässt sie offen
const STRASSEN = (() => {
  const f = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../data/stadt/flaechen.json'), 'utf8'));
  const bb = MPV.bbox;
  const out = new Set();
  for (const s of f.strassen) {
    if (!s.polygon) continue;
    const poly = P.normalize(s.polygon);
    const b = P.bbox(poly);
    if (b.x1 < bb.x0 || b.x0 > bb.x1 || b.z1 < bb.z0 || b.z0 > bb.z1) continue;
    if (s.bruecke || s.layer > 0) continue;
    for (const c of ZELLEN) if (c.K && !c.B && !c.L && P.contains(poly, c.x, c.z)) out.add(K2(c.x, c.z));
  }
  return out;
})();
const strasse = (c) => STRASSEN.has(K2(c.x, c.z));
// Korridorzellen neben dem Turm (Chebyshev ≤ 5): dort steht kein Unterbau, der Gang ruht auf Konsolen (Durchgang zum Turmtor)
const NAH_TURM = new Set();
for (const c of ZELLEN) {
  if (!c.K || c.T) continue;
  for (let dx = -5; dx <= 5 && !NAH_TURM.has(K2(c.x, c.z)); dx++) for (let dz = -5; dz <= 5; dz++) {
    const n = zelle(c.x + dx, c.z + dz);
    if (n && n.T) { NAH_TURM.add(K2(c.x, c.z)); break; }
  }
}
const nahTurm = (c) => NAH_TURM.has(K2(c.x, c.z));

// ---------------------------------------------------------------- Läden
// Ladennummer und Mitte; Trennwand bei u ≡ periode (mod 8); Front zur Fahrbahn
function laden(c) {
  if (!(c.E || c.W)) return null;
  if (c.E && c.u >= LOGGIA[0] && c.u < LOGGIA[1]) return null; // Loggia
  const off = c.E ? LADEN.periodeOst : LADEN.periodeWest;
  const k = Math.floor((c.u - off) / LADEN.breite);
  return { seite: c.E ? 'ost' : 'west', k, mitte: off + k * LADEN.breite + LADEN.breite / 2 + 0.5, id: (c.E ? 'o' : 'w') + k };
}
const wandDicke = 2;
const dZone = (c) => (c.E ? c.dE : c.W ? c.dW : 0);
const imWandband = (c) => dZone(c) >= 1 && dZone(c) <= wandDicke;
// Front-/Rückseite je Zeile: Zellen am Rand zur Fahrbahn (Ost: größtes w, West: kleinstes w)
function frontSeite(c) {
  if (!imWandband(c)) return null;
  const aussen = nachbarn4(c);
  const zur = (pred) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz], i) => {
    for (let s = 1; s <= wandDicke; s++) {
      const n = zelle(c.x + dx * s, c.z + dz * s);
      const imZone = n && (c.E ? n.E : n.W);
      if (!imZone) return pred(c.x + dx * s, c.z + dz * s);
    }
    return false;
  });
  void aussen;
  const lw = (x, z) => R.toLocal(x, z).w;
  if (c.E) {
    if (zur((x, z) => lw(x, z) > c.w + 0.5)) return 'front';
    if (zur((x, z) => lw(x, z) < c.w - 0.5)) return 'rueck';
  } else {
    if (zur((x, z) => lw(x, z) < c.w - 0.5)) return 'front';
    if (zur((x, z) => lw(x, z) > c.w + 0.5)) return 'rueck';
  }
  return 'seite';
}
for (const c of ZELLEN) { c.laden = laden(c); c.seite = (c.E || c.W) ? frontSeite(c) : null; }
// Trennwand 2 dick (im gedrehten Raster ist eine 1 Zelle dicke Wand nur über Kanten verbunden)
const istTrennwandRoh = (c) => c.laden && dZone(c) > wandDicke &&
  ((Math.floor(c.u - (c.E ? LADEN.periodeOst : LADEN.periodeWest)) % LADEN.breite) + LADEN.breite) % LADEN.breite <= 1;
const istTrennwand = istTrennwandRoh;

/** Öffnung der Ladenfront bei (c, L): 'tuer' | 'glas' | 'laden' | 'oberlicht' | 'fenster' | 'rahmen' | null */
function frontOeffnung(c, L) {
  if (L >= 1 && L <= 5 && TUER_DURCHBRUCH.has(K2(c.x, c.z))) return 'tuer';
  if (c.seite !== 'front' || !c.laden) return null;
  const du = c.u - c.laden.mitte;
  if (L >= 1 && L <= 5 && du >= -1 && du < 1) return 'tuer';
  if (L >= 1 && L <= 5 && ((du >= -2 && du < -1) || (du >= 1 && du < 2))) return 'glas';
  if (L >= 1 && L <= 5 && ((du >= -3 && du < -2) || (du >= 2 && du < 3))) return 'laden';
  if (L === 6 && du >= -2 && du < 2) return 'oberlicht';
  if (L >= 10 && L <= 12 && du >= -1 && du < 1) return 'fenster';
  if (L >= 9 && L <= 13 && du >= -2 && du < 2 && dZone(c) === 1) return 'rahmen';
  return null;
}
// Türdurchbruch: Trifft eine Ladentür im gedrehten Raster das Ladeninnere nur über Eck, werden die Wandzellen auf dem
// kürzesten 4er-Weg von der Tür zum Inneren mitgeöffnet (wie im Hausgenerator).
const TUER_DURCHBRUCH = new Set();
{
  const zone = (c) => c && (c.E || c.W);
  const tuerZ = ZELLEN.filter((c) => c.seite === 'front' && c.laden && Math.abs(c.u - c.laden.mitte - 0) < 1 && c.u - c.laden.mitte >= -1);
  const innen = (c, id) => c && c.laden && c.laden.id === id && dZone(c) > wandDicke && !istTrennwandRoh(c);
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const offen = new Set(tuerZ.map((c) => K2(c.x, c.z)));
  const gruppen = new Map();
  for (const c of tuerZ) { const g = gruppen.get(c.laden.id) || []; g.push(c); gruppen.set(c.laden.id, g); }
  for (const [id, g] of gruppen) {
    // erreicht die Tür (über offene Türzellen) das Innere?
    const start = g.filter((c) => N4.some(([dx, dz]) => !zone(zelle(c.x + dx, c.z + dz))));
    const seen = new Set(start.map((c) => K2(c.x, c.z)));
    let q = start.slice(), ok = false;
    while (q.length && !ok) {
      const nq = [];
      for (const c of q) for (const [dx, dz] of N4) {
        const n = zelle(c.x + dx, c.z + dz);
        if (!n || seen.has(K2(n.x, n.z))) continue;
        if (innen(n, id)) { ok = true; break; }
        if (offen.has(K2(n.x, n.z)) || TUER_DURCHBRUCH.has(K2(n.x, n.z))) { seen.add(K2(n.x, n.z)); nq.push(n); }
      }
      q = nq;
    }
    if (ok || !start.length) continue;
    // kürzester Weg durch das Wandband
    const prev = new Map(start.map((c) => [K2(c.x, c.z), null]));
    q = start.slice();
    let ziel = null;
    for (let t = 0; t < 4 && q.length && !ziel; t++) {
      const nq = [];
      for (const c of q) {
        for (const [dx, dz] of N4) {
          const n = zelle(c.x + dx, c.z + dz);
          if (!n || prev.has(K2(n.x, n.z)) || !(n.E || n.W)) continue;
          prev.set(K2(n.x, n.z), K2(c.x, c.z));
          if (innen(n, id)) { ziel = K2(c.x, c.z); break; }
          if (imWandband(n)) nq.push(n);
        }
        if (ziel) break;
      }
      q = nq;
    }
    for (let k = ziel; k !== null && k !== undefined; k = prev.get(k)) TUER_DURCHBRUCH.add(k);
  }
}

function rueckOeffnung(c, L) {
  if (c.seite !== 'rueck' || !c.laden) return null;
  const du = c.u - c.laden.mitte;
  if (L >= 10 && L <= 12 && du >= -1 && du < 1) return 'fenster';
  if (L >= 9 && L <= 13 && du >= -2 && du < 2 && dZone(c) === 1) return 'rahmen';
  return null;
}

// Loggia (Ost): drei Rundbögen in Front und Rückfront, Spannweite 9, Kämpfer Lage 8, Scheitel 12,5
function loggiaZelle(c) { return c.E && c.u >= LOGGIA[0] && c.u < LOGGIA[1]; }
function loggiaBogen(c, L) {
  if (!loggiaZelle(c) || !imWandband(c) || (c.seite !== 'front' && c.seite !== 'rueck')) return null;
  for (const m of LOGGIA_BOEGEN) {
    const du = c.u - m;
    if (Math.abs(du) >= 4.5 + 1) continue;
    const offen = Math.abs(du) < 4.5 && L >= 1 && (L < 8 || du * du + (L - 8) ** 2 <= 4.5 * 4.5);
    if (offen) return 'offen';
    const ring = Math.abs(du) < 5.5 && L >= 1 && (L < 8 ? Math.abs(du) >= 4.5 : du * du + (L - 8) ** 2 <= 5.5 * 5.5);
    if (ring) return 'ring';
  }
  return null;
}

// ---------------------------------------------------------------- Korridor
const kGang = (c) => c.K && !c.kWand;
/** Fenster im Korridor bei (c, L): 'klein' | 'gross' | null (Wandzellen) */
function korridorFenster(c, L) {
  if (!c.K || !c.kWand) return null;
  // große Fenster in der Westwand über der Westfreifläche
  if (c.u >= TERRASSE[0] - 4 && c.u < TERRASSE[1] + 4 && c.w > -14 && L >= 17 && L <= 21) {
    for (const m of LOGGIA_BOEGEN) if (Math.abs(c.u - m) < 4.5) return 'gross';
  }
  if (c.tw < 2) return null;
  if (L >= 18 && L <= 20) {
    const r = ((Math.floor(c.u) % 8) + 8) % 8;
    if ((r === 3 || r === 4) && !(c.u >= TERRASSE[0] - 6 && c.u < TERRASSE[1] + 6)) return 'klein';
  }
  return null;
}

// ---------------------------------------------------------------- Belegungsregister (K0: zuerst gebaut gewinnt)
const REG = new WeakMap();
function belegung(ctx) {
  let b = REG.get(ctx.grid);
  if (b) return b;
  const typ = new Map();
  const key = (x, y, z) => packKey(x, y, z);
  b = {
    frei: (x, y, z) => !typ.has(key(x, y, z)) && !ctx.grid.has(x, y, z),
    set(w, x, y, z, t) {
      const k = key(x, y, z);
      if (typ.has(k) || ctx.grid.has(x, y, z)) return false;
      if (!MPV.innen(x, z)) return false; // Luftraum 0: nie außerhalb der Maske
      w.set(x, y, z, t);
      typ.set(k, t);
      return true;
    },
    setL(w, c, L, t) { return b.set(w, c.x, Y(L), c.z, t); },
    luft(x, y, z) { typ.set(key(x, y, z), null); },
    istLuft: (x, y, z) => typ.get(key(x, y, z)) === null
  };
  REG.set(ctx.grid, b);
  return b;
}

// ---------------------------------------------------------------- Treppen (im Voraus, damit Decken die Löcher kennen)
const TREPPE = WZ.treppe;
const ck3 = (x, y, z) => x + ',' + y + ',' + z;

// Gerade Treppe der Breite 2 mit n Stufen in einem Zellbereich (Set P.ck) suchen; Rückgabe { bloecke, loch, belegt } oder null
function sucheGerade(bereich, n, yStart, rolle, bevorzugt, frei) {
  const dirs = bevorzugt ? [bevorzugt, ...['o', 's', 'w', 'n'].filter((d) => d !== bevorzugt)] : ['o', 's', 'w', 'n'];
  const liste = [...bereich].sort((a, b) => a - b);
  for (const d of dirs) {
    const [fx, fz] = TREPPE.DIR[d], [qx, qz] = TREPPE.DIR[TREPPE.RECHTS[d]];
    for (const k of liste) {
      const ox = P.ckX(k), oz = P.ckZ(k);
      let ok = true;
      for (let r = -1; r <= n - 1 && ok; r++) for (let q = 0; q < 2; q++) {
        const x = ox + fx * r + qx * q, z = oz + fz * r + qz * q;
        if (!bereich.has(K2(x, z)) || (frei && !frei(x, z, r))) { ok = false; break; }
      }
      if (!ok) continue;
      const b = TREPPE.geradeTreppe({ start: { x: ox, y: yStart, z: oz }, richtung: d, stufen: n, breite: 2, rolle });
      return { bloecke: b, loch: TREPPE.treppenloch(b.lauf), richtung: d, start: { x: ox, z: oz } };
    }
  }
  return null;
}
// Auflager unter Stufen (R3): Vollblöcke von der Stufe bis zum Boden
function mitAuflager(bloecke, yBoden, rolle) {
  const voll = TREPPE.volltyp(rolle);
  const out = bloecke.slice();
  const eigen = new Set(bloecke.map((b) => ck3(b.x, b.y, b.z)));
  for (const b of bloecke) for (let y = b.y - 1; y > yBoden; y--) if (!eigen.has(ck3(b.x, y, b.z))) { out.push({ x: b.x, y, z: b.z, typ: voll }); eigen.add(ck3(b.x, y, b.z)); }
  return out;
}

// Ladentreppen: je Laden EG (Stehhöhe Lage 1) -> OG (Boden Oberkante Lage 9). Die Läden sind im gedrehten Raster
// rautenförmig (etwa 8 × 8); eine gerade Treppe mit 9 Stufen passt nicht. Deshalb eine Wendeltreppe 5 × 5 (Kern 1, Ring 2).
const LADEN_INNEN = new Map(); // id -> Set(P.ck)
for (const c of ZELLEN) {
  if (!c.laden || dZone(c) <= wandDicke || istTrennwand(c)) continue;
  let s = LADEN_INNEN.get(c.laden.id);
  if (!s) LADEN_INNEN.set(c.laden.id, s = new Set());
  s.add(K2(c.x, c.z));
}
function sucheWendel(bereich, r, frei, wertung) {
  let best = null;
  for (const k of [...bereich].sort((a, b) => a - b)) {
    const x = P.ckX(k), z = P.ckZ(k);
    let ok = true;
    for (let dx = -r; dx <= r && ok; dx++) for (let dz = -r; dz <= r; dz++) {
      if (!bereich.has(K2(x + dx, z + dz)) || (frei && !frei(x + dx, z + dz))) { ok = false; break; }
    }
    if (!ok) continue;
    const v = wertung(x, z);
    if (!best || v > best.v) best = { x, z, v };
  }
  return best;
}
const LADEN_TREPPEN = new Map(); // id -> { bloecke, fuss, mitte }
for (const [id, s] of [...LADEN_INNEN].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
  const any = zelle(P.ckX([...s][0]), P.ckZ([...s][0]));
  const mitte = any.laden.mitte;
  // Freiraum vor der Tür (2 breit × 3 tief) bleibt frei; die Treppe steht möglichst weit hinten
  const frei = (x, z) => { const c = zelle(x, z); return !(Math.abs(c.u - mitte) < 1.6 && nahFront(c)); };
  const best = sucheWendel(s, 2, frei, (x, z) => { const c = zelle(x, z); return any.E ? -c.w : c.w; });
  if (!best) continue;
  const b = TREPPE.wendeltreppe({ mitte: { x: best.x, z: best.z }, radiusInnen: 0, radiusAussen: 2, yVon: Y(0), yBis: Y(L_ZWISCHEN[1]),
    rolle: 'holz', drehsinn: 'rechts' });
  const fuss = new Set();
  for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) fuss.add(K2(best.x + dx, best.z + dz));
  LADEN_TREPPEN.set(id, { bloecke: b, fuss, mitte: best });
}
function nahFront(c) {
  // Zelle liegt auf der Frontseite des Ladens (näher an der Fahrbahn als an der Rückwand)
  return c.E ? c.w > -16 : c.w < 14;
}

// Loggia-Treppe: von der Loggia (Lage 0) in den Gang (Boden Oberkante Lage 15), 15 Stufen, Pietra serena
const LOGGIA_INNEN = new Set(ZELLEN.filter((c) => loggiaZelle(c) && dZone(c) > wandDicke).map((c) => K2(c.x, c.z)));
// Mitlaufende Treppe: Aufstieg in Weltrichtung d, je zwei Stufen eine Zelle seitlich versetzt (folgt einem schrägen
// Band im gedrehten Rahmen); 2 breit, aufeinanderfolgende Stufen überlappen immer um mindestens eine Zelle.
function mitlaufendeTreppe({ x0, z0, d, seit, n, y0, rolle }) {
  const [fx, fz] = TREPPE.DIR[d], [sx, sz] = TREPPE.DIR[seit];
  const typ = PAL.treppe(rolle, d);
  const bloecke = [], loch = [];
  for (let k = 0; k < n; k++) {
    const off = Math.floor(k / 2);
    for (let q = 0; q < 2; q++) {
      const x = x0 + fx * k + sx * (off + q), z = z0 + fz * k + sz * (off + q);
      bloecke.push({ x, y: y0 + k, z, typ });
      for (let h = 1; h <= 3; h++) loch.push({ x, y: y0 + k + h, z });
    }
  }
  return { bloecke, loch };
}
const LOGGIA_TREPPE = (() => {
  const n = L_DECKE[1];                 // 15 Stufen: Stehhöhe Lage 1 -> Gangboden Oberkante Lage 15
  for (const k0 of [...LOGGIA_INNEN].sort((a, b) => a - b)) {
    const x0 = P.ckX(k0), z0 = P.ckZ(k0);
    for (const [d, seit] of [['s', 'w'], ['n', 'o'], ['s', 'o'], ['n', 'w']]) {
      const t = mitlaufendeTreppe({ x0, z0, d, seit, n, y0: Y(1), rolle: 'pietra_serena' });
      const [fx, fz] = TREPPE.DIR[d];
      const ankunft = [0, 1].map((q) => { const b = t.bloecke[2 * (n - 1) + q]; return zelle(b.x + fx, b.z + fz); });
      const anfang = [0, 1].map((q) => { const b = t.bloecke[q]; return zelle(b.x - fx, b.z - fz); });
      const ok = t.bloecke.every((b, i) => {
        const c = zelle(b.x, b.z);
        if (!c || !LOGGIA_INNEN.has(K2(b.x, b.z))) return false;
        return Math.floor(i / 2) < n - 5 || kGang(c);       // die oberen fünf Stufen liegen unter dem Gang
      }) && ankunft.every((c) => c && kGang(c)) && anfang.every((c) => c && LOGGIA_INNEN.has(K2(c.x, c.z)));
      if (ok) return { ...t, bloecke: mitAuflager(t.bloecke, Y(0), 'pietra_serena'), richtung: d };
    }
  }
  return null;
})();

// Turm: Wendeltreppe (Kern 1, Ring 3) im Inneren d8_T > 3, von Lage 0 bis zur Dachterrasse
const TURM_INNEN = ZELLEN.filter((c) => c.T && c.dT > 3);
const TURM_TREPPE = (() => {
  if (!TURM_INNEN.length) return null;
  const s = new Set(TURM_INNEN.map((c) => K2(c.x, c.z)));
  let best = null;
  for (const c of TURM_INNEN) {
    let ok = true;
    for (let dx = -3; dx <= 3 && ok; dx++) for (let dz = -3; dz <= 3; dz++) if (!s.has(K2(c.x + dx, c.z + dz))) { ok = false; break; }
    if (!ok) continue;
    const mx = TURM_INNEN.reduce((a, q) => a + q.x, 0) / TURM_INNEN.length, mz = TURM_INNEN.reduce((a, q) => a + q.z, 0) / TURM_INNEN.length;
    const d = (c.x - mx) ** 2 + (c.z - mz) ** 2;
    if (!best || d < best.d) best = { c, d };
  }
  if (!best) return null;
  const b = TREPPE.wendeltreppe({ mitte: { x: best.c.x, z: best.c.z }, radiusInnen: 0, radiusAussen: 3, yVon: Y(0), yBis: Y(TURM_TOP + 2),
    rolle: 'pietra_serena', drehsinn: 'rechts' });
  const fuss = new Set();
  for (let dx = -3; dx <= 3; dx++) for (let dz = -3; dz <= 3; dz++) fuss.add(K2(best.c.x + dx, best.c.z + dz));
  return { bloecke: b, fuss, mitte: best.c };
})();

// Turmtor (Katalog §6): 3 breit in der Westwand (größtes w), Mitte der Kante. Im gedrehten Raster trifft das Tor das
// Innere nur über Eck; die Wandzellen auf dem kürzesten 4er-Weg vom Torrand zum Inneren werden mitgeöffnet.
const TURM_TOR = (() => {
  const turm = ZELLEN.filter((c) => c.T);
  const out = new Set();
  if (!turm.length) return out;
  const us = turm.map((c) => c.u), w1 = Math.max(...turm.map((c) => c.w));
  const uMid = (Math.min(...us) + Math.max(...us)) / 2;
  const roh = turm.filter((c) => c.dT <= 3 && c.w > w1 - 3.5 && Math.abs(c.u - uMid) < 1.5);
  for (const c of roh) out.add(K2(c.x, c.z));
  const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  const start = roh.filter((c) => N4.some(([dx, dz]) => { const n = zelle(c.x + dx, c.z + dz); return !n || !n.T; }));
  // 0-1-Suche: offene Torzellen kosten 0, Wandzellen 1
  const dist = new Map(start.map((c) => [K2(c.x, c.z), 0]));
  const prev = new Map(start.map((c) => [K2(c.x, c.z), null]));
  const dq = start.map((c) => K2(c.x, c.z));
  let ziel = null;
  while (dq.length) {
    const k = dq.shift();
    const c = AN.get(k);
    if (c.dT > 3) { ziel = k; break; }
    for (const [dx, dz] of N4) {
      const n = zelle(c.x + dx, c.z + dz);
      if (!n || !n.T) continue;
      const nk = K2(n.x, n.z);
      const d = dist.get(k) + (out.has(nk) || n.dT > 3 ? 0 : 1);
      if (dist.has(nk) && dist.get(nk) <= d) continue;
      dist.set(nk, d); prev.set(nk, k);
      if (d === dist.get(k)) dq.unshift(nk); else dq.push(nk);
    }
  }
  for (let k = ziel && prev.get(ziel); k !== null && k !== undefined; k = prev.get(k)) out.add(k);
  return out;
})();
const turmTor = (c) => TURM_TOR.has(K2(c.x, c.z));

/** Ist (x, y, z) ein Treppenloch / Treppenblock, den Decken auslassen müssen? */
const LOCH = new Set(), STUFE = new Set();
for (const t of [...LADEN_TREPPEN.values(), TURM_TREPPE, LOGGIA_TREPPE].filter(Boolean)) for (const b of t.bloecke) STUFE.add(ck3(b.x, b.y, b.z));
if (LOGGIA_TREPPE) for (const c of LOGGIA_TREPPE.loch) LOCH.add(ck3(c.x, c.y, c.z));
// Wendeltreppen: Decken sparen den ganzen Fuß aus (außer den Blöcken der Treppe selbst)
const inWendel = (x, y, z) => (TURM_TREPPE && TURM_TREPPE.fuss.has(K2(x, z)) && y > Y(0) && y <= Y(TURM_TOP + 2)) ||
  [...LADEN_TREPPEN.values()].some((t) => t.fuss.has(K2(x, z)) && y > Y(0) && y <= Y(L_ZWISCHEN[1]));
const ausgespart = (x, y, z) => LOCH.has(ck3(x, y, z)) || STUFE.has(ck3(x, y, z)) || inWendel(x, y, z);

// ---------------------------------------------------------------- Licht (Seelaternen in den Decken, Abstand ≤ 10)
const LICHT = new Set();
const LICHT_LISTE = [];
function licht(zellen, standL, deckeL) {
  if (!zellen.length) return;
  for (const l of WZ.lichtRaster(zellen.map((c) => [c.x, Y(standL), c.z]), { abstand: 10, hoehe: deckeL - standL })) {
    const k = ck3(l.x, l.y, l.z);
    if (LICHT.has(k) || ausgespart(l.x, l.y, l.z)) continue;
    LICHT.add(k);
    LICHT_LISTE.push({ x: l.x, y: l.y, z: l.z });
  }
}
{
  const ladenInnen = ZELLEN.filter((c) => c.laden && dZone(c) > wandDicke && !istTrennwand(c));
  for (const id of LADEN_INNEN.keys()) {
    const z = ladenInnen.filter((c) => c.laden.id === id);
    licht(z, 1, L_ZWISCHEN[0]);
    licht(z, L_ZWISCHEN[1] + 1, L_DECKE[0]);
  }
  licht(ZELLEN.filter((c) => loggiaZelle(c) && dZone(c) > wandDicke), 1, L_DECKE[0]);
  licht(ZELLEN.filter((c) => kGang(c)), L_GANG[0], L_GANGDECKE[0]);
  const ti = ZELLEN.filter((c) => c.T && c.dT > 3 && !(TURM_TREPPE && TURM_TREPPE.fuss.has(K2(c.x, c.z))));
  for (const [s0, d0] of [[1, 14], [16, 28], [30, 42], [44, 55]]) licht(ti, s0, d0);
}
const istLicht = (x, y, z) => LICHT.has(ck3(x, y, z));

// ---------------------------------------------------------------- Rollen
const T = Object.freeze({
  forte: WZ.typ('pietra_forte'), rustika: WZ.typ('pietra_forte_rustika'), mauer: WZ.typ('mauerwerk'),
  serena: WZ.typ('pietra_serena'), pflaster: WZ.typ('pflaster'), bruch: WZ.typ('pietra_forte_bruch'),
  holz: WZ.typ('holz'), sporto: WZ.typ('holz_sporto'), laden: WZ.typ('fensterladen'), glas: WZ.typ('glas_fenster'),
  dach: WZ.typ('dachziegel'), marmor: WZ.typ('marmor_weiss'), bronze: WZ.typ('bronze'), wasser: WZ.typ('wasser'),
  gold: WZ.typ('gold'), licht: WZ.typ('licht'), sand: WZ.typ('putz_sand')
});
const PUTZ = ['putz_ocker', 'putz_gelb', 'putz_terrakotta', 'putz_sand'].map((r) => WZ.typ(r));
const putzVon = (c) => PUTZ[(((c.laden ? c.laden.k : Math.floor(c.u / 8)) + 3 * (c.E ? 0 : 1)) % 4 + 4) % 4];

module.exports = {
  PJ, BODEN_Y, Y, R, M, MPV, ZELLEN, zelle, nachbarn4, T, PUTZ, putzVon, PAL, WZ, P, K2, ck3,
  W_OST, W_WEST, TRAG, STIRN, U_NORD, U_SUED, PFEILER, BOEGEN, KAEMPFER_Y, PFEILER_FUSS_Y, LOGGIA, TERRASSE, LOGGIA_BOEGEN,
  L_ZWISCHEN, L_DECKE, L_GANG, L_GANGDECKE, TURM_TOP, wandDicke,
  inPfeiler, bogenVon, laibung, dZone, imWandband, istTrennwand, frontOeffnung, rueckOeffnung, loggiaZelle, loggiaBogen,
  kGang, korridorFenster, strasse, belegung, LADEN_INNEN, LADEN_TREPPEN, LOGGIA_TREPPE, TURM_TREPPE, TURM_INNEN, ausgespart,
  LICHT_LISTE, istLicht, nahTurm, turmTor
};
