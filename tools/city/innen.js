'use strict';
// Innenausbau der Quartierhäuser (B4, BEGEHBARKEIT.md §1 und §4):
// Geschossböden, Treppenhaus aus Podesttreppen (echte Treppenblöcke, Breite 2), Treppenlöcher, Licht, einfache Ausstattung.
//   planInnen(plan, opts) -> Innenplan (reine Daten, deterministisch); wird in planHaus berechnet (plan.innen)
//   bauInnen(writer, plan) -> Anzahl gesetzter Zellen (eigenes Bauteil "<id>_innen", nach dem Rohbau)
//
// Geometrie (Weltkoordinaten, ganzzahlig):
//  - Innenzellen I: Grundrisszellen ohne Wandlagen und Teilwände.
//  - Geschoss s steht auf y = base_s (Stehhöhe); sein Boden liegt in y = base_s - 1. Für s = 0 ist das die Bodenplatte
//    des Rohbaus, für s >= 1 eine Decke in der obersten Reihe von Geschoss s - 1 (dort liegen nie Fenster, fassade.js).
//  - Treppenhaus: ein Rechteck aus 4 Spuren (Lauf 1 auf Spur 0..1, Lauf 2 auf Spur 2..3) und Reihen ab -2; alle Läufe
//    stehen übereinander. Je Geschoss eine Podesttreppe mit n1 + n2 = Geschosshöhe; n1 <= h - 4, damit über dem Podest
//    drei Zellen Luft bleiben. Die oberste Stufe von Lauf 2 liegt bündig in der Decke darüber.
//  - Flachdach: eine Treppe mehr, die Dachterrasse (Rohbau, y = Traufe) bekommt das Treppenloch.

const P = require('./poly.js');
const M = require('./material.js');
const T = require('../wahrzeichen/treppe.js');
const palette = require('../spec/palette.js');
const { lichtRaster } = require('../wahrzeichen/licht.js');
const { fnv1a, mulberry32 } = require('./akten_entwurf.js');

const BREITE = 2;          // Laufbreite (Standard: >= 2)
const PODEST = 2;          // Podesttiefe
const SPUREN = 2 * BREITE; // Breite des Treppenhauses
const LICHT_ABSTAND = 12;  // höchstens 12 Blöcke bis zur nächsten Lichtquelle
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const RICHTUNGEN = ['o', 's', 'w', 'n'];
const KOMP_MIN = 20;       // kleinere Innenbereiche bekommen kein eigenes Treppenhaus

const key3 = (x, y, z) => x + ',' + y + ',' + z;

/** Stufenzahlen eines Geschosses der Höhe h: n1 + n2 = h, n1 <= h - 4 (Kopffreiheit über dem Podest), n1 >= 1. */
function stufen(h) {
  const n1 = Math.min(Math.ceil(h / 2), h - 4);
  if (n1 < 1) return null;
  return { n1, n2: h - n1 };
}

// Rolle der Treppe und der Böden nach Bautyp
function materialFuer(akte) {
  const stein = akte.typ.startsWith('palazzo') || akte.typ === 'chiesa_minore';
  return { treppe: stein ? 'pietra_serena' : 'holz', boden: 'dach' };
}

/** Innenzellen (Schlüssel P.ck) eines Hausplans. */
function innenZellen(plan) {
  const I = new Set();
  for (const [x, z] of plan.cells) {
    const k = P.ck(x, z);
    if (!plan.w1.has(k) && !plan.w2.has(k) && !plan.partial.has(k)) I.add(k);
  }
  return I;
}

// Zellen des Treppenhauses für Ursprung (ox, oz), Aufstieg d, Drehsinn; Reihen r0..r1, Spuren 0..3
function kernZellen(ox, oz, d, drehsinn, r0, r1) {
  const [fx, fz] = T.DIR[d];
  const [qx, qz] = T.DIR[T.RECHTS[d]]; // das Laufpaar liegt immer rechts vom Start (treppe.js), drehsinn tauscht nur die Spuren
  const out = [];
  for (let r = r0; r <= r1; r++) for (let q = 0; q < SPUREN; q++) out.push([ox + fx * r + qx * q, oz + fz * r + qz * q, r, q]);
  return out;
}

// Zusammenhang (4er-Nachbarschaft) einer Zellmenge
function zusammenhaengend(cells) {
  if (!cells.size) return true;
  const first = cells.values().next().value;
  const seen = new Set([first]);
  const stack = [first];
  while (stack.length) {
    const k = stack.pop();
    const x = P.ckX(k), z = P.ckZ(k);
    for (const [dx, dz] of N4) {
      const n = P.ck(x + dx, z + dz);
      if (cells.has(n) && !seen.has(n)) { seen.add(n); stack.push(n); }
    }
  }
  return seen.size === cells.size;
}

// Zusammenhangskomponenten (4er-Nachbarschaft), Ausgabe nach kleinstem Schlüssel sortiert
function komponenten(cells) {
  const seen = new Set(), out = [];
  for (const start of [...cells].sort((a, b) => a - b)) {
    if (seen.has(start)) continue;
    const comp = new Set([start]);
    seen.add(start);
    const stack = [start];
    while (stack.length) {
      const k = stack.pop();
      const x = P.ckX(k), z = P.ckZ(k);
      for (const [dx, dz] of N4) {
        const n = P.ck(x + dx, z + dz);
        if (cells.has(n) && !seen.has(n)) { seen.add(n); comp.add(n); stack.push(n); }
      }
    }
    out.push(comp);
  }
  return out;
}

// Rechteck-Test über Präfixsummen: alle Zellen eines achsparallelen Rechtecks in C?
function rechteckTest(C) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const k of C) { const x = P.ckX(k), z = P.ckZ(k); if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; }
  const W = x1 - x0 + 2, H = z1 - z0 + 2;
  const S = new Int32Array(W * H);
  for (let x = 1; x < W; x++) for (let z = 1; z < H; z++) {
    S[x * H + z] = (C.has(P.ck(x0 + x - 1, z0 + z - 1)) ? 1 : 0) + S[(x - 1) * H + z] + S[x * H + z - 1] - S[(x - 1) * H + z - 1];
  }
  return (ax, az, bx, bz) => { // inklusive Grenzen
    if (ax > bx) [ax, bx] = [bx, ax];
    if (az > bz) [az, bz] = [bz, az];
    if (ax < x0 || bx > x1 || az < z0 || bz > z1) return false;
    const X0 = ax - x0, X1 = bx - x0 + 1, Z0 = az - z0, Z1 = bz - z0 + 1;
    const n = S[X1 * H + Z1] - S[X0 * H + Z1] - S[X1 * H + Z0] + S[X0 * H + Z0];
    return n === (X1 - X0) * (Z1 - Z0);
  };
}

const KANDIDATEN_MAX = 400;
let DIAG = null; // Diagnose: { kand, zus, koll }
function setDiag(d) { DIAG = d; } // so viele beste Kandidaten werden auf Zusammenhang und Kollision geprüft

function sucheKern(C, r0, r1, tuer, plan, laeufe, rolle, gesperrt) {
  const frei = gesperrt && gesperrt.size ? new Set([...C].filter((k) => !gesperrt.has(k))) : C;
  if (!frei.size) return null;
  const inRect = rechteckTest(frei);
  const kand = [];
  for (const k of frei) {
    const ox = P.ckX(k), oz = P.ckZ(k);
    for (const d of RICHTUNGEN) {
      const [fx, fz] = T.DIR[d];
      for (const drehsinn of ['rechts', 'links']) {
        const [qx, qz] = T.DIR[T.RECHTS[d]];
        const ax = ox + fx * r0, az = oz + fz * r0;
        const bx = ox + fx * r1 + qx * (SPUREN - 1), bz = oz + fz * r1 + qz * (SPUREN - 1);
        if (!inRect(ax, az, bx, bz)) continue;
        const xa = Math.min(ax, bx), xb = Math.max(ax, bx), za = Math.min(az, bz), zb = Math.max(az, bz);
        // Wertung: Anlehnung an Wände (Randzellen außerhalb von C), Abstand zur nächsten Tür (gedeckelt)
        let wand = 0;
        for (let x = xa; x <= xb; x++) { if (!C.has(P.ck(x, za - 1))) wand++; if (!C.has(P.ck(x, zb + 1))) wand++; }
        for (let z = za; z <= zb; z++) { if (!C.has(P.ck(xa - 1, z))) wand++; if (!C.has(P.ck(xb + 1, z))) wand++; }
        let dt = 12;
        for (const t of tuer) {
          const dx = Math.max(xa - t[0], 0, t[0] - xb), dz = Math.max(za - t[1], 0, t[1] - zb);
          if (dx + dz < dt) dt = dx + dz;
        }
        kand.push({ ox, oz, d, drehsinn, score: wand + dt * 2 });
      }
    }
  }
  kand.sort((a, b) => (b.score - a.score) || (a.ox - b.ox) || (a.oz - b.oz) ||
    (RICHTUNGEN.indexOf(a.d) - RICHTUNGEN.indexOf(b.d)) || (a.drehsinn < b.drehsinn ? -1 : a.drehsinn > b.drehsinn ? 1 : 0));
  if (DIAG) DIAG.kand += kand.length;
  for (const c of kand.slice(0, KANDIDATEN_MAX)) {
    c.zellen = kernZellen(c.ox, c.oz, c.d, c.drehsinn, r0, r1);
    // Reihen >= 0 sind Treppe; die Zugangsreihen (< 0) bleiben Boden, solange dort keine Stufe steht
    const rest = new Set(C);
    for (const [x, z, r] of c.zellen) if (r >= 0) rest.delete(P.ck(x, z));
    if (!zusammenhaengend(rest) && komponenten(rest).sort((a, b) => b.size - a.size).slice(1).some((k) => k.size >= KOMP_MIN)) { if (DIAG) DIAG.zus++; continue; }
    const t = treppenFuer(c, plan, laeufe, rolle, r0, r1);
    if (!t) { if (DIAG) DIAG.koll++; continue; }
    c.tr = t;
    c.komp = C;
    return c;
  }
  return null;
}

// Treppen eines Kerns erzeugen. Je Lauf wird die Teilung n1/n2 so gewählt (Vorzug zuerst, dann flacher), dass keine
// Stufe und kein Auflager in der Kopffreiheit eines anderen Laufs liegt und das Treppenhaus in den Reihen r0..r1 bleibt.
// Rückgabe null, wenn das nicht gelingt.
function treppenFuer(kern, plan, laeufe, rolle, r0, r1) {
  const voll = T.volltyp(rolle);
  const cache = new Map();
  // Lauf l mit Teilung n1: Blöcke (mit Auflagern) und Treppenloch, oder null außerhalb der Reihen r0..r1
  const lauf = (li, n1) => {
    const ck = li + ':' + n1;
    if (cache.has(ck)) return cache.get(ck);
    const l = laeufe[li], n2 = l.h - n1;
    let r = null;
    if (n1 + PODEST - 1 <= r1 && n1 - n2 - 1 >= r0) {
      const b = T.podestTreppe({ start: { x: kern.ox, y: l.y0, z: kern.oz }, richtung: kern.d, stufen1: n1, stufen2: n2,
        breite: BREITE, rolle, drehsinn: kern.drehsinn, podestTiefe: PODEST });
      const lo = T.treppenloch(b.lauf).map((c) => key3(c.x, c.y, c.z));
      // Auflager (R3): unter jeder Stufe, die nicht auf dem Boden, dem Podest oder einer Stufe steht, ein Vollblock;
      // er berührt die vorige Stufe seitlich, so hängt der ganze Lauf flächig am Boden
      const eigen = new Set(b.map((c) => key3(c.x, c.y, c.z)));
      const neu = b.slice();
      for (const c of b) {
        if (!palette.isTreppe(c.typ) || c.y - 1 <= l.y0 - 1 || eigen.has(key3(c.x, c.y - 1, c.z))) continue;
        neu.push({ x: c.x, y: c.y - 1, z: c.z, typ: voll });
      }
      const nk = neu.map((c) => key3(c.x, c.y, c.z));
      const loSet = new Set(lo);
      r = nk.some((k) => loSet.has(k)) ? null : { bloecke: neu, nk, lo };
    }
    cache.set(ck, r);
    return r;
  };
  // Tiefensuche über die Läufe (wenige Läufe, wenige Teilungen je Lauf)
  const loecher = new Set(), belegt = new Set(), wahl = [];
  const suche = (li) => {
    if (li === laeufe.length) return true;
    for (const n1 of laeufe[li].optionen) {
      const r = lauf(li, n1);
      if (!r) continue;
      if (r.nk.some((k) => loecher.has(k) || belegt.has(k)) || r.lo.some((k) => belegt.has(k))) continue;
      const neuLo = r.lo.filter((k) => !loecher.has(k));
      for (const k of neuLo) loecher.add(k);
      for (const k of r.nk) belegt.add(k);
      wahl.push(r);
      if (suche(li + 1)) return true;
      wahl.pop();
      for (const k of neuLo) loecher.delete(k);
      for (const k of r.nk) belegt.delete(k);
    }
    return false;
  };
  if (!suche(0)) return null;
  return { bloecke: wahl.flatMap((r) => r.bloecke), loecher, belegt };
}

// Ebenen: Geschosse mit eigenem Boden. Niedrige Geschosse (Mezzanin, h < EBENE_MIN) gehören zur Ebene darunter.
const EBENE_MIN = 5;
function ebenenVon(st) {
  const out = [];
  for (let s = 0; s < st.length; s++) {
    if (s === 0 || st[s].h >= EBENE_MIN) out.push({ base: st[s].base, h: st[s].h, geschosse: [s] });
    else { const e = out[out.length - 1]; e.h += st[s].h; e.geschosse.push(s); }
  }
  return out;
}

/**
 * planInnen(plan, { tuerZellen }) -> {
 *   status: 'ok' | 'ein_geschoss' | 'kein_platz' | 'zu_niedrig',
 *   kern: { ox, oz, d, drehsinn, zellen } | null,
 *   boeden: [{ y, cells: [[x, z]] }]      Decken/Böden der Geschosse s >= 1 (ohne Löcher, Treppen, Lichter)
 *   treppe: [{ x, y, z, typ }], loecher: Set("x,y,z"), belegt: Set("x,y,z") (Treppenzellen),
 *   licht: [{ x, y, z }], rohbauFrei: Set("x,y,z") (Zellen, die der Rohbau freilässt: Licht im EG-Boden, Dachloch),
 *   moebel: [{ x, y, z, typ, art }], kernSpalten: Set(P.ck) (Altana und Kamine meiden diese Spalten)
 * }
 */
function planInnen(plan, opts = {}) {
  const akte = plan.akte;
  const st = plan.storeys;
  const I = innenZellen(plan);
  const res = { status: 'ok', kern: null, boeden: [], treppe: [], loecher: new Set(), belegt: new Set(), licht: [],
    rohbauFrei: new Set(), moebel: [], kernSpalten: new Set(), innen: I };
  const mat = materialFuer(akte);
  const gesperrt = opts.gesperrt || new Set(); // Spalten der Eingangsstufen (EG): kein Treppenhaus, kein Licht, keine Möbel

  // Läufe: je Ebene i -> i + 1, beim Flachdach zusätzlich auf die Terrasse
  const ebenen = ebenenVon(st);
  res.ebenen = ebenen;
  const laeufe = [];
  const nLaeufe = ebenen.length - 1 + (plan.flach ? 1 : 0);
  for (let i = 0; i < nLaeufe; i++) {
    const h = ebenen[i].h;
    const n = stufen(h);
    if (!n) { res.status = 'zu_niedrig'; break; }
    const optionen = [];
    for (let n1 = n.n1; n1 >= 1; n1--) optionen.push(n1);
    laeufe.push({ i, y0: ebenen[i].base, h, ...n, optionen });
  }
  if (res.status === 'zu_niedrig') laeufe.length = 0;
  if (!laeufe.length && res.status === 'ok') res.status = 'ein_geschoss';

  // Treppenhaus suchen: je Zusammenhangskomponente der Innenzellen (ab KOMP_MIN Zellen) ein Kern
  const kerne = [];
  if (laeufe.length) {
    const r0 = Math.min(-1, ...laeufe.map((l) => l.n1 - l.n2 - 1));
    const r1 = Math.max(...laeufe.map((l) => l.n1 + PODEST - 1));
    for (const C of komponenten(I)) {
      if (C.size < KOMP_MIN) continue;
      const k = sucheKern(C, r0, r1, opts.tuerZellen || [], plan, laeufe, mat.treppe, gesperrt);
      if (k) kerne.push(k);
    }
    if (!kerne.length) res.status = 'kein_platz';
  }
  const kern = kerne.length ? kerne[0] : null;
  const tr = kerne.length ? {
    bloecke: kerne.flatMap((k) => k.tr.bloecke),
    loecher: new Set(kerne.flatMap((k) => [...k.tr.loecher])),
    belegt: new Set(kerne.flatMap((k) => [...k.tr.belegt]))
  } : null;
  // Komponenten mit Kern bekommen Obergeschosse; die übrigen bleiben ein hoher Raum
  const mitKern = new Set();
  for (const k of kerne) for (const c of k.komp) mitKern.add(c);

  if (kern) {
    res.kerne = kerne.map((k) => ({ ox: k.ox, oz: k.oz, d: k.d, drehsinn: k.drehsinn, zellen: k.zellen.map(([x, z, r, q]) => ({ x, z, r, q })) }));
    res.kern = res.kerne[0];
    for (const k of kerne) for (const [x, z] of k.zellen) res.kernSpalten.add(P.ck(x, z));
    res.treppe = tr.bloecke;
    res.loecher = tr.loecher;
    res.belegt = tr.belegt;
  }

  // Böden der Obergeschosse (nur wenn eine Treppe hinaufführt; sonst bleibt das Haus ein hoher Raum)
  const frei = (x, y, z) => !res.loecher.has(key3(x, y, z)) && !res.belegt.has(key3(x, y, z));
  const bodenZellen = (y) => {
    const out = [];
    for (const [x, z] of plan.cells) {
      const k = P.ck(x, z);
      if (plan.w1.has(k) || plan.w2.has(k)) continue;
      if (I.has(k) && !mitKern.has(k)) continue;
      const pt = plan.partial.get(k);
      if (pt && pt.ys.includes(y)) continue;
      if (frei(x, y, z)) out.push([x, z]);
    }
    return out;
  };
  const nEbenen = kern ? ebenen.length : 1;
  for (let i = 1; i < nEbenen; i++) res.boeden.push({ y: ebenen[i].base - 1, cells: bodenZellen(ebenen[i].base - 1) });
  if (kern && plan.flach) {
    for (const k of res.loecher) { const [x, y, z] = k.split(',').map(Number); if (y === plan.eaves) res.rohbauFrei.add(k); }
    for (const k of res.belegt) { const [x, y, z] = k.split(',').map(Number); if (y === plan.eaves) res.rohbauFrei.add(k); }
  }

  // Stehflächen je Geschoss (für Licht und Ausstattung): Innenzellen ohne Treppenhaus, Boden vorhanden, Luft darüber
  const tuerNah = (x, z) => (opts.tuerZellen || []).some((t) => Math.max(Math.abs(t[0] - x), Math.abs(t[1] - z)) <= 2);
  const kernNah = (x, z) => {
    for (const k of kerne) for (const c of k.zellen) if (Math.max(Math.abs(c[0] - x), Math.abs(c[1] - z)) <= 1) return true;
    return false;
  };
  const rng = mulberry32(fnv1a(plan.id + ':innen'));
  const holz = M.typ('holz');
  const moebelBelegt = new Set();
  for (let s = 0; s < nEbenen; s++) {
    const y = ebenen[s].base;
    const lichtZellen = [];
    const wandZellen = [];
    for (const k of [...I].sort((a, b) => a - b)) {
      const x = P.ckX(k), z = P.ckZ(k);
      if (res.kernSpalten.has(k)) continue;
      if (s === 0 && gesperrt.has(k)) continue;
      if (s >= 1 && !mitKern.has(k)) continue;
      if (!frei(x, y - 1, z) || !frei(x, y, z)) continue;
      lichtZellen.push([x, y, z]);
      let wand = 0;
      for (const [dx, dz] of N4) if (!I.has(P.ck(x + dx, z + dz))) wand++;
      if (wand === 1 && !kernNah(x, z) && !(s === 0 && tuerNah(x, z))) wandZellen.push([x, z]);
    }
    const lichter = lichtRaster(lichtZellen, { abstand: LICHT_ABSTAND });
    for (const l of lichter) {
      res.licht.push({ x: l.x, y: l.y, z: l.z });
      if (s === 0) res.rohbauFrei.add(key3(l.x, l.y, l.z));
    }
    const lichtSet = new Set(lichter.map((l) => key3(l.x, l.y, l.z)));
    // Ausstattung: Wandzellen mit genau einer Wandseite; Möbel stehen an der Wand, nie vor Tür oder Treppe
    const istFrei = (x, z) => wandZellen.some((c) => c[0] === x && c[1] === z) && !moebelBelegt.has(key3(x, y, z));
    const wandSeite = (x, z) => N4.find(([dx, dz]) => !I.has(P.ck(x + dx, z + dz)));
    const setze = (x, z, typ, art) => { res.moebel.push({ x, y, z, typ, art }); moebelBelegt.add(key3(x, y, z)); };
    const reihe = (n) => { // n Zellen entlang einer Wand, zufälliger Start
      if (!wandZellen.length) return null;
      for (let versuch = 0; versuch < 12; versuch++) {
        const [x, z] = wandZellen[Math.floor(rng() * wandZellen.length) % wandZellen.length];
        const w = wandSeite(x, z);
        const lang = [w[1] !== 0 ? 1 : 0, w[0] !== 0 ? 1 : 0]; // entlang der Wand
        const cells = [];
        for (let i = 0; i < n; i++) cells.push([x + lang[0] * i, z + lang[1] * i]);
        if (cells.every(([cx, cz]) => istFrei(cx, cz) && wandSeite(cx, cz) && wandSeite(cx, cz)[0] === w[0] && wandSeite(cx, cz)[1] === w[1] &&
          !lichtSet.has(key3(cx, y - 1, cz)))) return { cells, lang, w };
      }
      return null;
    };
    const laden = s === 0 && akte.fassade.erdgeschoss.art === 'bottega_arcata';
    const flaeche = lichtZellen.length;
    if (laden) {
      const r = reihe(3);
      if (r) for (const [x, z] of r.cells) setze(x, z, holz, 'theke');
    }
    // Tisch mit zwei Stühlen (Treppenblöcke, Lehne von Tisch weg)
    if (flaeche >= 12) {
      const r = reihe(3);
      if (r) {
        const [a, m, b] = r.cells;
        setze(m[0], m[1], holz, 'tisch');
        const richtung = (dx, dz) => (dx > 0 ? 'o' : dx < 0 ? 'w' : dz > 0 ? 's' : 'n');
        setze(a[0], a[1], palette.treppe('holz', richtung(a[0] - m[0], a[1] - m[1])), 'stuhl');
        setze(b[0], b[1], palette.treppe('holz', richtung(b[0] - m[0], b[1] - m[1])), 'stuhl');
      }
    }
    // Betten in den Obergeschossen (Kopfende Weiß, Decke Rot), eines je angefangene 40 Bodenzellen, höchstens 3
    if (s >= 1 && !(plan.akte.typ === 'chiesa_minore' || plan.akte.typ === 'loggia' || plan.akte.typ === 'zweckbau')) {
      const nBett = Math.min(3, Math.max(1, Math.floor(flaeche / 40)));
      for (let i = 0; i < nBett; i++) {
        const r = reihe(2);
        if (!r) break;
        setze(r.cells[0][0], r.cells[0][1], M.typ('bett_kissen'), 'bett');
        setze(r.cells[1][0], r.cells[1][1], M.typ('bett_decke'), 'bett');
      }
    }
  }
  // Bewusst unzugänglich (R13): Mauerkronen von Teilwänden (Stehfläche auf der Wand, kein Raum) und Häuser ohne Tür
  res.unzugaenglich = [];
  const kronen = [];
  for (const [k, pt] of [...plan.partial].sort((a, b) => a[0] - b[0])) {
    const x = P.ckX(k), z = P.ckZ(k);
    const ys = new Set(pt.ys);
    for (const y of pt.ys) if (!ys.has(y + 1) && y + 1 <= plan.eaves) for (let h = 1; h <= 3; h++) kronen.push([x, y + h, z]);
  }
  if (kronen.length) res.unzugaenglich.push({ zellen: kronen, begruendung: 'Mauerkrone einer Teilwand zum Nachbarhaus, kein Raum' });
  // Innenbereiche ohne Haustür (der Grundriss zerfällt an einer Engstelle in getrennte Bereiche): unzugänglich
  if ((opts.tuerZellen || []).length) {
    const tuerKeys = new Set();
    for (const [x, z] of opts.tuerZellen) { tuerKeys.add(P.ck(x, z)); for (const [dx, dz] of N4) tuerKeys.add(P.ck(x + dx, z + dz)); }
    const yTop = plan.eaves + 12;
    for (const C of komponenten(I)) {
      if ([...C].some((k) => tuerKeys.has(k))) continue;
      const zellen = [];
      for (const k of [...C].sort((a, b) => a - b)) for (let y = st[0].base; y <= yTop; y++) zellen.push([P.ckX(k), y, P.ckZ(k)]);
      res.unzugaenglich.push({ zellen, begruendung: 'Hausteil ohne eigenen Zugang: der Grundriss zerfällt an einer Engstelle, die Verbindung ist nicht modelliert' });
    }
  }
  if (!(opts.tuerZellen || []).length) {
    const alle = [];
    const yTop = plan.eaves + 12;
    for (const k of [...I].sort((a, b) => a - b)) for (let y = st[0].base; y <= yTop; y++) alle.push([P.ckX(k), y, P.ckZ(k)]);
    res.unzugaenglich.push({ zellen: alle, begruendung: 'Hinterhaus ohne Straßenfront: der OSM-Grundriss grenzt ringsum an Nachbarhäuser, der Zugang über Höfe oder Durchgänge ist nicht modelliert' });
  }
  return res;
}

/** Innenausbau bauen (eigenes Bauteil nach dem Rohbau). */
function bauInnen(writer, plan) {
  const inn = plan.innen;
  if (!inn) return 0;
  let n = 0;
  const set = (x, y, z, typ) => { writer.set(x, y, z, typ); n++; };
  const lichtTyp = M.typ('licht');
  const licht = new Set(inn.licht.map((l) => key3(l.x, l.y, l.z)));
  const bodenTyp = M.typ(materialFuer(plan.akte).boden);
  for (const b of inn.boeden) {
    for (const [x, z] of b.cells) if (!licht.has(key3(x, b.y, z))) set(x, b.y, z, bodenTyp);
  }
  for (const t of inn.treppe) set(t.x, t.y, t.z, t.typ);
  for (const l of inn.licht) set(l.x, l.y, l.z, lichtTyp);
  for (const m of inn.moebel) set(m.x, m.y, m.z, m.typ);
  return n;
}

module.exports = { setDiag, planInnen, bauInnen, innenZellen, stufen, BREITE, PODEST };
