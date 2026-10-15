'use strict';
// Hausgenerator (V3, HAUSAKTE_SCHEMA §5): aus Hausakte und OSM-Grundriss entstehen die Zellen eines Hauses.
//   planHaus(gebaeude, akte, kontext) -> Plan (reine Daten, deterministisch)
//   bauHaus(writer, gebaeude, akte, kontext) -> Anzahl gesetzter Zellen
// Aufbau: Fundament und Bodenplatte auf der Sockelhöhe, Wände (Straßenseite 2 Blöcke, sonst 1 Block),
// Öffnungen nach Akte, Gesims am Traufpunkt, Dach über dem Abstandsfeld zum Rand (Anstieg 0,4 je Block).

const P = require('./poly.js');
const M = require('./material.js');
const { compareIds } = require('./parzellen.js');
const roofs = require('../geom/roofs.js');
const F = require('./fassade.js');
const { fnv1a, mulberry32 } = require('./akten_entwurf.js');
const { planInnen } = require('./innen.js');
const palette = require('../spec/palette.js');

// Benannte Konstanten (HAUSAKTE §1 und §5)
const WALL_STREET = 2;          // Außenwand zur Straße
const WALL_PLAIN = 1;           // sonstige Außenwände und Brandwand
const ROOF_RISE = 0.4;          // Dachanstieg je Block Abstand zum Rand (ca. 22 Grad)
const ROOF_CAP = 10;            // größter Anstieg (Blöcke); große Grundrisse bekommen ein flaches Dachplateau
const PARAPET = 2;              // Brüstung des Flachdachs über der Terrasse
const ECK_MIN_WINKEL = 0.5;     // Eckquader nur bei Knicken ab 30 Grad (|sin| des Knickwinkels)
const GASSE_MIN = 3;            // Vorsprünge (Sohlbänke, Marcapiano) nur in Gassen ab 3 freien Zellen Tiefe
const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// ------------------------------------------------------------------ Geschosse
function geschosseMitBasis(akte, boden) {
  let base = boden + 1;
  return akte.geschosse.map((g) => {
    const s = { art: g.art, h: g.hoeheBl, base };
    base += g.hoeheBl;
    return s;
  });
}

// ------------------------------------------------------------------ Abstandsfeld (Chamfer 1 / √2) zum Rand
function abstandsfeld(cells, S) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const [x, z] of cells) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; }
  const W = x1 - x0 + 1, H = z1 - z0 + 1;
  const INF = 1e9, D = Math.SQRT2;
  const d = new Float32Array(W * H).fill(INF);
  const inS = new Uint8Array(W * H);
  for (const [x, z] of cells) inS[(x - x0) * H + (z - z0)] = 1;
  const idx = (x, z) => (x - x0) * H + (z - z0);
  for (const [x, z] of cells) {
    for (const [dx, dz] of N8) {
      if (!S.has(P.ck(x + dx, z + dz))) { d[idx(x, z)] = 0; break; }
    }
  }
  const relax = (i, j, w) => { if (inS[j] && d[j] + w < d[i]) d[i] = d[j] + w; };
  for (let x = x0; x <= x1; x++) {
    for (let z = z0; z <= z1; z++) {
      const i = idx(x, z);
      if (!inS[i]) continue;
      if (x > x0) { relax(i, idx(x - 1, z), 1); if (z > z0) relax(i, idx(x - 1, z - 1), D); if (z < z1) relax(i, idx(x - 1, z + 1), D); }
      if (z > z0) relax(i, idx(x, z - 1), 1);
    }
  }
  for (let x = x1; x >= x0; x--) {
    for (let z = z1; z >= z0; z--) {
      const i = idx(x, z);
      if (!inS[i]) continue;
      if (x < x1) { relax(i, idx(x + 1, z), 1); if (z < z1) relax(i, idx(x + 1, z + 1), D); if (z > z0) relax(i, idx(x + 1, z - 1), D); }
      if (z < z1) relax(i, idx(x, z + 1), 1);
    }
  }
  return (x, z) => d[idx(x, z)];
}

// ------------------------------------------------------------------ Plan
function planHaus(g, akte, kontext) {
  const id = g.id;
  const cells = kontext.parz.cellsOf(id);
  const plan = { id, leer: cells.length === 0, cells, akte };
  if (plan.leer) return plan;
  const S = new Set(cells.map((c) => P.ck(c[0], c[1])));
  plan.S = S;
  const top = (x, z) => kontext.groundTopY(x, z);
  let boden = -Infinity;
  for (const [x, z] of cells) boden = Math.max(boden, top(x, z));
  plan.boden = boden;
  plan.storeys = geschosseMitBasis(akte, boden);
  const summe = akte.geschosse.reduce((a, s) => a + s.hoeheBl, 0);
  plan.eaves = boden + summe;
  const flach = akte.dach.form === 'flach';
  plan.flach = flach;

  // Nachbarn mit kleinerer ID, die gebaut werden: ihre Zellen sind durch deren Wand abgedeckt
  const gedeckt = (x, z) => {
    if (S.has(P.ck(x, z))) return true;
    const o = kontext.parz.owner(x, z);
    return o !== null && o !== id && compareIds(o, id) < 0 && kontext.gebaut(o);
  };

  // Kanten und ihre Klasse
  const poly = P.normalize(g.polygon);
  const edgeList = P.edges(poly);
  const festeKanten = Array.isArray(akte.fassade.kanten) ? new Set(akte.fassade.kanten) : null;
  plan.edges = edgeList;
  plan.klasse = edgeList.map((e) => {
    if (e.hole) return 'hof';
    if (festeKanten) return festeKanten.has(e.index) ? 'strasse' : 'nachbar';
    const n = Math.max(1, Math.floor(e.len / 2));
    let nach = 0;
    for (let i = 0; i < n; i++) {
      const t = ((i + 0.5) / n) * e.len;
      const x = Math.round(e.a[0] + e.dir[0] * t + e.out[0] * 1.5), z = Math.round(e.a[1] + e.dir[1] * t + e.out[1] * 1.5);
      const o = kontext.parz.owner(x, z);
      if (o !== null && o !== id) nach++;
    }
    return nach * 2 > n ? 'nachbar' : 'strasse';
  });

  // Wandschicht 1: Zellen mit einem offenen Nachbarn (8er-Nachbarschaft)
  const w1 = new Map();
  for (const [x, z] of cells) {
    let offen = false;
    for (const [dx, dz] of N8) if (!gedeckt(x + dx, z + dz)) { offen = true; break; }
    if (!offen) continue;
    const ne = P.nearestEdge(edgeList, x, z);
    w1.set(P.ck(x, z), { x, z, layer: 1, edge: ne ? ne.edge.index : -1, u: ne ? ne.t : 0, d: ne ? ne.d : 99,
      klasse: ne ? plan.klasse[ne.edge.index] : 'nachbar' });
  }
  // Wandschicht 2: zweite Lage hinter Straßenkanten
  const w2 = new Map();
  for (const [x, z] of cells) {
    const k = P.ck(x, z);
    if (w1.has(k)) continue;
    let adj = false;
    for (const [dx, dz] of N4) {
      const n = w1.get(P.ck(x + dx, z + dz));
      if (n && n.klasse === 'strasse') { adj = true; break; }
    }
    if (!adj) continue;
    const ne = P.nearestEdge(edgeList, x, z);
    if (ne && plan.klasse[ne.edge.index] === 'strasse' && ne.d < WALL_STREET + 0.6) {
      w2.set(k, { x, z, layer: 2, edge: ne.edge.index, u: ne.t, d: ne.d, klasse: 'strasse' });
    }
  }
  plan.w1 = w1;
  plan.w2 = w2;

  // Teilwände an Brandwänden zu kleineren, gebauten Nachbarn (höher oder tiefer gelegen als dieser)
  const partial = new Map();
  for (const [x, z] of cells) {
    const k = P.ck(x, z);
    if (w1.has(k) || w2.has(k)) continue;
    const ranges = [];
    for (const [dx, dz] of N8) {
      const o = kontext.parz.owner(x + dx, z + dz);
      if (o === null || o === id || compareIds(o, id) >= 0 || !kontext.gebaut(o)) continue;
      const np = kontext.plan(o);
      if (!np || np.leer) continue;
      if (np.boden > boden) ranges.push([boden + 1, Math.min(np.boden, plan.eaves)]);
      if (plan.eaves > np.eaves) ranges.push([Math.max(np.eaves, boden) + 1, plan.eaves]);
    }
    if (ranges.length) {
      const ys = new Set();
      for (const [a, b] of ranges) for (let y = a; y <= b; y++) ys.add(y);
      partial.set(k, { x, z, ys: [...ys].sort((p, q) => p - q) });
    }
  }
  plan.partial = partial;

  // Rückseite: hat eine Zelle der Wandlage 1 dahinter vollständig Wandlage 2? (dann darf sie zurückspringen)
  for (const c of w1.values()) {
    let innen = 0, ok = true;
    for (const [dx, dz] of N4) {
      const nk = P.ck(c.x + dx, c.z + dz);
      if (!S.has(nk) || w1.has(nk)) continue;
      innen++;
      if (!w2.has(nk)) ok = false;
    }
    c.hinten = innen > 0 && ok;
  }

  // Fassaden je Straßenkante (Achsen, Öffnungen, Bugnato, Marcapiano, Eckquader)
  const strassenKanten = edgeList.filter((e) => plan.klasse[e.index] === 'strasse');
  let haupt = null;
  for (const e of strassenKanten) if (e.len >= F.MIN_LEN && (!haupt || e.len > haupt.len + 1e-9)) haupt = e;
  plan.hauptKante = haupt ? haupt.index : -1;
  const seed = fnv1a(String(id));
  const seedBit = (parseInt(String(id).replace(/\D/g, ''), 10) || 0) % 2;
  const ringKanten = new Map();
  for (const e of edgeList) {
    if (!ringKanten.has(e.ring)) ringKanten.set(e.ring, []);
    ringKanten.get(e.ring).push(e);
  }
  const putzR = putzRolle(akte);
  plan.fassaden = new Map();
  plan.oeffnungen = new Map();
  for (const e of strassenKanten) {
    const lst = ringKanten.get(e.ring), i = lst.indexOf(e);
    const prev = lst[(i - 1 + lst.length) % lst.length], next = lst[(i + 1) % lst.length];
    const eckStart = prev !== e && plan.klasse[prev.index] === 'strasse' && prev.len >= 3 &&
      e.out[0] * prev.dir[0] + e.out[1] * prev.dir[1] > ECK_MIN_WINKEL;
    const eckEnd = next !== e && plan.klasse[next.index] === 'strasse' && next.len >= 3 &&
      e.out[0] * next.dir[0] + e.out[1] * next.dir[1] < -ECK_MIN_WINKEL;
    const lay = F.layoutKante(e, {
      istHaupt: haupt === e, hauptAvail: haupt ? haupt.len - 2 * F.MARGIN : 0, akte, storeys: plan.storeys, seedBit, seed,
      rng: mulberry32(fnv1a(id + ':' + e.index)), eckStart, eckEnd, putz: putzR
    });
    plan.fassaden.set(e.index, lay);
    plan.oeffnungen.set(e.index, lay.items);
  }

  // Haustür auch ohne Hauptfassade (alle Straßenkanten kürzer als F.MIN_LEN): an der längsten Straßenkante ab 3 Blöcken
  if (![...plan.fassaden.values()].some((lay) => F.hatTuer(lay.items[0]))) {
    let best = null;
    for (const e of strassenKanten) if (e.len >= 3 && (!best || e.len > best.len + 1e-9)) best = e;
    if (best) {
      const lay = plan.fassaden.get(best.index);
      const w = lay.achsparallel ? 2 : Math.min(F.TUER_W_SCHRAEG, Math.max(2, Math.floor(best.len) - 1));
      lay.items[0].length = 0;
      F.tuerEinsetzen(lay, best.len / 2, w, Math.max(3, Math.min(F.TUER_H, plan.storeys[0].h - 2)));
    }
  }
  // Zellen der Türöffnungen (Außenlage, Gehhöhe)
  plan.tuerZellen = [];
  for (const c of w1.values()) {
    if (c.klasse !== 'strasse') continue;
    const lay = plan.fassaden.get(c.edge);
    if (lay && F.zelle(lay, 0, 0, c) === 'offen') plan.tuerZellen.push([c.x, c.z]);
  }
  plan.tuerZellen.sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
  plan.durchbruch = tuerDurchbruch(plan);
  taschenDurchbruch(plan, plan.durchbruch);
  plan.eingang = eingangsStufen(plan, kontext);

  // Vorsprünge (Sohlbänke, Konsolen, Marcapiano): eine Zelle vor der Außenlage, nie in fremden Parzellen,
  // nur in Gassen ab GASSE_MIN freien Zellen und über dem Gelände
  plan.vorsprung = [];
  {
    const vmap = new Map();
    const ks = [...w1.keys()].sort((a, b) => a - b);
    const dbTop = boden + Math.max(3, Math.min(F.TUER_H, plan.storeys[0].h - 2));
    for (const k of ks) {
      const c = w1.get(k);
      const lay = c.klasse === 'strasse' ? plan.fassaden.get(c.edge) : null;
      if (!lay) continue;
      const e = edgeList[c.edge];
      for (let s = 0; s < plan.storeys.length; s++) {
        for (const vo of F.vorsprungeAn(lay, s, c.u)) {
          const y = plan.storeys[s].base + vo.v;
          if (y > plan.eaves || vo.v < 0) continue;
          if (plan.durchbruch.has(k) && y <= dbTop) continue;               // Wand dahinter ist durchbrochen: kein Halt
          const r0 = F.zelle(lay, s, vo.v, c);
          if (r0 === 'offen' || r0 === 'glas') continue;
          for (const [dx, dz] of N4) {
            const x1 = c.x + dx, z1 = c.z + dz;
            if (S.has(P.ck(x1, z1)) || kontext.parz.owner(x1, z1) !== null) continue;
            if (P.relToEdge(e, x1, z1).s <= 0.2) continue;
            let frei = true;
            for (let i = 2; i <= GASSE_MIN; i++) {
              if (S.has(P.ck(c.x + dx * i, c.z + dz * i)) || kontext.parz.owner(c.x + dx * i, c.z + dz * i) !== null) { frei = false; break; }
            }
            if (!frei || y <= top(x1, z1)) continue;
            const key = `${x1},${y},${z1}`;
            if (!vmap.has(key)) vmap.set(key, { x: x1, y, z: z1, role: vo.role });
          }
        }
      }
    }
    plan.vorsprung = [...vmap.values()].sort((a, b) => (a.x - b.x) || (a.z - b.z) || (a.y - b.y));
  }

  // Gesims: freie Zellen vor Straßenwänden, vierseitig zusammenhängend
  plan.gesims = [];
  const gs = akte.fassade.gesims;
  if (gs.art !== 'keiner' && gs.tiefeBl > 0) {
    const seen = new Map();
    let front = [];
    for (const c of w1.values()) {
      if (c.klasse === 'strasse' && c.edge >= 0) front.push({ x: c.x, z: c.z, edge: c.edge });
    }
    for (let depth = 1; depth <= gs.tiefeBl; depth++) {
      const next = [];
      for (const f of front) {
        const e = edgeList[f.edge];
        for (const [dx, dz] of N4) {
          const x = f.x + dx, z = f.z + dz, k = P.ck(x, z);
          if (seen.has(k) || S.has(k) || kontext.parz.owner(x, z) !== null) continue;
          if (P.relToEdge(e, x, z).s <= 0.2) continue; // nur nach außen
          seen.set(k, depth);
          plan.gesims.push({ x, z, depth, par: (x + z) & 1 });
          next.push({ x, z, edge: f.edge });
        }
      }
      front = next;
    }
  }

  // Innenausbau: Geschossböden, Treppenhaus, Licht, Ausstattung (innen.js)
  plan.innen = planInnen(plan, { tuerZellen: plan.tuerZellen, gesperrt: plan.eingang.spalten });

  // Dachhöhe, First, Altana, Kamine
  plan.first = new Set();
  plan.kamine = [];
  plan.altana = null;
  let dist = null;
  if (!flach) {
    dist = abstandsfeld(cells, S);
    plan.dist = dist;
    plan.dachHoehe = (x, z) => plan.eaves + 1 + Math.min(ROOF_CAP, Math.floor(ROOF_RISE * dist(x, z)));
    // Firstlinie: strenge Spitze des Abstandsfelds entlang einer Achse (Mittellinie des Daches)
    const eps = 1e-4;
    for (const [x, z] of cells) {
      const d = dist(x, z);
      if (d < 2) continue;
      const nb = (dx, dz) => (S.has(P.ck(x + dx, z + dz)) ? dist(x + dx, z + dz) : null);
      const spitze = (a, b) => a !== null && b !== null && ((d - a > eps && d - b >= -eps) || (d - b > eps && d - a >= -eps));
      if (spitze(nb(-1, 0), nb(1, 0)) || spitze(nb(0, -1), nb(0, 1))) plan.first.add(P.ck(x, z));
    }
  }
  const dachY = flach ? () => plan.eaves : plan.dachHoehe;
  const freiInnen = (x, z) => {
    const k = P.ck(x, z);
    if (!S.has(k) || w1.has(k) || w2.has(k) || partial.has(k)) return false;
    if (flach && plan.innen.kernSpalten.has(k)) return false; // Treppenloch der Dachterrasse
    return flach ? true : dist(x, z) >= 2;
  };

  // Altana: offene Dachloggia (4 x 4, vier Pfeiler, kleines Dach) auf möglichst ebener Stelle
  if (akte.dach.altana === true) {
    let best = null;
    for (const [x0, z0] of cells) {
      let ok = true, lo = Infinity, hi = -Infinity, score = 0;
      for (let dx = 0; dx < 4 && ok; dx++) {
        for (let dz = 0; dz < 4; dz++) {
          const x = x0 + dx, z = z0 + dz;
          if (!freiInnen(x, z)) { ok = false; break; }
          const h = dachY(x, z);
          lo = Math.min(lo, h); hi = Math.max(hi, h);
          score += flach ? 0 : dist(x, z);
        }
      }
      if (!ok || hi - lo > 1) continue;
      score -= (hi - lo) * 4;
      if (!best || score > best.score) best = { x0, z0, fl: hi, score };
    }
    if (best) plan.altana = { x0: best.x0, z0: best.z0, fl: best.fl, holz: !akte.typ.startsWith('palazzo') };
  }

  // Kamine: 1 x 1 oder 2 x 1, 3 Blöcke hoch, nahe dem First
  const rngK = mulberry32(fnv1a(id + ':kamin'));
  const rKamin = rngK();
  const wunschKamine = akte.dach.kamine !== undefined ? akte.dach.kamine : (rKamin < 0.25 ? 0 : rKamin < 0.8 ? 1 : 2);
  if (!flach && wunschKamine > 0) {
    let maxH = -Infinity;
    for (const [x, z] of cells) maxH = Math.max(maxH, plan.dachHoehe(x, z));
    const al = plan.altana;
    const inAltana = (x, z) => !!al && x >= al.x0 - 1 && x <= al.x0 + 4 && z >= al.z0 - 1 && z <= al.z0 + 4;
    const kand = cells.filter(([x, z]) => dist(x, z) >= 2 && plan.dachHoehe(x, z) >= maxH - 1 && !inAltana(x, z));
    const gesetzt = [];
    for (let i = 0; i < wunschKamine && kand.length; i++) {
      const [x, z] = kand[Math.floor(rngK() * kand.length) % kand.length];
      const rZwei = rngK();
      if (gesetzt.some(([gx, gz]) => Math.abs(gx - x) + Math.abs(gz - z) < 6)) continue;
      const h = plan.dachHoehe(x, z);
      const zwei = rZwei < 0.4 && S.has(P.ck(x + 1, z)) && plan.dachHoehe(x + 1, z) === h && dist(x + 1, z) >= 2 && !inAltana(x + 1, z);
      gesetzt.push([x, z]);
      plan.kamine.push({ x, z, y: h, zwei });
    }
  }
  return plan;
}

// ------------------------------------------------------------------ Türdurchbruch
// In schrägen Wänden trifft die Türöffnung die innere Wandlage manchmal nur über Eck. Dann werden die Wandzellen
// auf dem kürzesten 4er-Weg von der Tür zum Innenraum in Türhöhe geöffnet (Rückgabe: Set P.ck der Spalten).
const DURCHBRUCH_MAX = 4;
function tuerDurchbruch(plan) {
  const out = new Set();
  const wand = (k) => plan.w1.has(k) || plan.w2.has(k) || plan.partial.has(k);
  const innen = (k) => plan.S.has(k) && !wand(k);
  const offen = (k) => {
    const c = plan.w1.get(k) || plan.w2.get(k);
    if (!c || c.klasse !== 'strasse') return false;
    const lay = plan.fassaden.get(c.edge);
    return !!lay && F.zelle(lay, 0, 0, c) === 'offen';
  };
  for (const [x, z] of plan.tuerZellen) {
    // erreicht die Tür über offene Wandzellen das Innere?
    const start = P.ck(x, z);
    const seen = new Set([start]);
    let q = [start], ok = false;
    while (q.length && !ok) {
      const nq = [];
      for (const k of q) for (const [dx, dz] of N4) {
        const n = P.ck(P.ckX(k) + dx, P.ckZ(k) + dz);
        if (seen.has(n)) continue;
        if (innen(n)) { ok = true; break; }
        if (offen(n) || out.has(n)) { seen.add(n); nq.push(n); }
      }
      q = nq;
    }
    if (ok) continue;
    // kürzester Weg durch Wandzellen zum Innenraum
    const prev = new Map([[start, null]]);
    q = [start];
    let ziel = null;
    for (let tiefe = 0; tiefe < DURCHBRUCH_MAX && q.length && ziel === null; tiefe++) {
      const nq = [];
      for (const k of q) {
        for (const [dx, dz] of N4) {
          const n = P.ck(P.ckX(k) + dx, P.ckZ(k) + dz);
          if (prev.has(n) || !plan.S.has(n)) continue;
          prev.set(n, k);
          if (innen(n)) { ziel = k; break; }
          if (wand(n)) nq.push(n);
        }
        if (ziel !== null) break;
      }
      q = nq;
    }
    for (let k = ziel; k !== null && k !== start; k = prev.get(k)) out.add(k);
  }
  return out;
}

// Taschen im Erdgeschoss: Innenbereiche, die Wände (z. B. Teilwände zu tiefer liegenden Nachbarn am Hang) vom Rest
// abschneiden, bekommen einen Durchbruch auf kürzestem Weg (≤ TASCHE_MAX Wandzellen) zum Bereich mit der Tür.
const TASCHE_MAX = 8;
function taschenDurchbruch(plan, out) {
  const eg = (k) => { const p = plan.partial.get(k); return !!p && (p.ys.includes(plan.boden + 1) || p.ys.includes(plan.boden + 2)); };
  const wand = (k) => (plan.w1.has(k) || plan.w2.has(k) || eg(k)) && !out.has(k);
  const innen = (k) => plan.S.has(k) && !wand(k);
  const comp = new Map(), groesse = [];
  for (const k of plan.S) {
    if (!innen(k) || comp.has(k)) continue;
    const id = groesse.length; let n = 0; let q = [k]; comp.set(k, id);
    while (q.length) {
      const nq = [];
      for (const a of q) { n++; for (const [dx, dz] of N4) { const b = P.ck(P.ckX(a) + dx, P.ckZ(a) + dz); if (!comp.has(b) && innen(b)) { comp.set(b, id); nq.push(b); } } }
      q = nq;
    }
    groesse.push(n);
  }
  if (groesse.length < 2) return out;
  const haupt = new Set();
  const start = [...plan.tuerZellen.map(([x, z]) => P.ck(x, z)), ...out];
  for (const k of start) for (const [dx, dz] of N4) { const b = P.ck(P.ckX(k) + dx, P.ckZ(k) + dz); if (comp.has(b)) haupt.add(comp.get(b)); }
  if (!haupt.size) haupt.add(groesse.indexOf(Math.max(...groesse)));
  const ids = groesse.map((n, i) => i).filter((i) => !haupt.has(i) && groesse[i] >= 4).sort((a, b) => groesse[b] - groesse[a]);
  for (const id of ids) {
    if (haupt.has(id)) continue;
    const prev = new Map(); let q = [];
    for (const [k, c] of comp) if (c === id) { prev.set(k, null); q.push(k); }
    let ziel = null;
    for (let tiefe = 0; tiefe <= TASCHE_MAX && q.length && ziel === null; tiefe++) {
      const nq = [];
      for (const a of q) {
        for (const [dx, dz] of N4) {
          const b = P.ck(P.ckX(a) + dx, P.ckZ(a) + dz);
          if (prev.has(b) || !plan.S.has(b)) continue;
          prev.set(b, a);
          if (innen(b) && haupt.has(comp.get(b))) { ziel = a; break; }
          if (wand(b)) nq.push(b);
        }
        if (ziel !== null) break;
      }
      q = nq;
    }
    if (ziel === null) continue;
    for (let k = ziel; k !== null && comp.get(k) !== id; k = prev.get(k)) out.add(k);
    haupt.add(id);
  }
  return out;
}

// ------------------------------------------------------------------ Eingangsstufen
// Liegt die Straße vor einer Tür d = boden - Gelände >= 2 Blöcke tiefer, führen d Treppenblöcke in der Türlaibung
// und dahinter nach innen hinauf (Zelle k = 0 ist die Außenlage, Stufe in y = Gelände + 1 + k, darüber Luft bis zum
// Boden). So bleibt jede Stufe <= 1 und alles innerhalb der Parzelle (BEGEHBARKEIT §1.1, §1.3).
const EINGANG_MAX = 14;
function eingangsStufen(plan, kontext) {
  const out = { stufen: new Map(), luft: new Set(), spalten: new Set() };
  const top = (x, z) => kontext.groundTopY(x, z);
  const richtung = (dx, dz) => (dx > 0 ? 'o' : dx < 0 ? 'w' : dz > 0 ? 's' : 'n');
  for (const [x, z] of plan.tuerZellen) {
    let best = null;
    for (const [dx, dz] of N4) {
      const ax = x - dx, az = z - dz; // Außenzelle; Aufstieg (dx, dz) nach innen
      if (plan.S.has(P.ck(ax, az)) || kontext.parz.owner(ax, az) !== null) continue;
      const t = top(ax, az);
      if (!best || t > best.t) best = { t, dx, dz };
    }
    if (!best) continue;
    const d = plan.boden - best.t;
    if (d < 2 || d > EINGANG_MAX) continue;
    const zellen = [];
    for (let k = 0; k < d; k++) {
      const cx = x + best.dx * k, cz = z + best.dz * k;
      if (!plan.S.has(P.ck(cx, cz))) { zellen.length = 0; break; }
      zellen.push([cx, cz, best.t + 1 + k]);
    }
    if (!zellen.length) continue;
    const typ = palette.treppe('pflaster', richtung(best.dx, best.dz));
    for (const [cx, cz, ys] of zellen) {
      const t = top(cx, cz);
      if (ys > t) {
        const k = cx + ',' + ys + ',' + cz;
        if (!out.stufen.has(k)) out.stufen.set(k, typ);
        for (let y = ys + 1; y <= plan.boden; y++) out.luft.add(cx + ',' + y + ',' + cz);
      } else if (t < plan.boden) {
        for (let y = t + 1; y <= plan.boden; y++) out.luft.add(cx + ',' + y + ',' + cz); // Gelände ist die Stufe
      } // sonst bleibt die Bodenplatte als Stufe stehen
      out.spalten.add(P.ck(cx, cz));
    }
  }
  // Stufen haben Vorrang; unter jeder Stufe bleibt das Fundament stehen (überlappende Eingänge, R3)
  for (const k of out.stufen.keys()) {
    const [x, y, z] = k.split(',').map(Number);
    for (let yy = y; yy >= y - EINGANG_MAX - 1; yy--) out.luft.delete(x + ',' + yy + ',' + z);
  }
  return out;
}

// ------------------------------------------------------------------ Material einer Wandzelle
function putzRolle(akte) {
  return M.PUTZ_ROLLE[akte.fassade.putzfarbe] || 'putz_sand';
}

function storeyAt(plan, y) {
  let s = 0;
  for (let i = 0; i < plan.storeys.length; i++) if (y >= plan.storeys[i].base) s = i;
  return s;
}

// Grundrolle der Wand (ohne Öffnungen) der Nebenseiten
function wandRolle(plan, fassade, s) {
  const m = plan.akte.fassade.material;
  if (m === 'putz') return putzRolle(plan.akte);
  if (fassade && m === 'stein_glatt') return 'pietra_serena';
  if (fassade && (m === 'bugnato_abgestuft' || m === 'bugnato_glatt')) return 'pietra_forte';
  return 'pietra_forte_bruch';
}

// Gesims: Reihen (dy zur Traufe) einer Zelle in Tiefe depth; par = Parität für Konsolen
function gesimsReihen(art, T, depth, par, flach, rolle) {
  const rows = [];
  if (art === 'gronda_holz') {
    rows.push({ dy: 0, role: rolle });
    if (depth === 1 && par === 0) rows.push({ dy: -1, role: rolle });
    if (!flach) rows.push({ dy: 1, role: 'dach' });
  } else {
    const bottom = -Math.min(2, T - depth + (T === 1 ? 1 : 0));
    const b = art === 'putzgesims' ? Math.max(-1, bottom) : bottom;
    for (let dy = b; dy <= 0; dy++) rows.push({ dy, role: rolle });
    if (!flach && depth <= Math.max(1, art === 'putzgesims' ? 1 : T - 1)) rows.push({ dy: 1, role: 'dach' });
  }
  return rows;
}

function gesimsRolle(plan) {
  const art = plan.akte.fassade.gesims.art;
  if (art === 'gronda_holz') return 'holz_sporto';
  if (art === 'putzgesims') return putzRolle(plan.akte);
  return 'pietra_serena';
}

// ------------------------------------------------------------------ Bau
function bauHaus(writer, g, akte, kontext) {
  const plan = kontext.plan(g.id, akte);
  if (plan.leer) return 0;
  const top = (x, z) => kontext.groundTopY(x, z);
  const { boden, eaves } = plan;
  let n = 0;
  const set = (x, y, z, role) => { writer.set(x, y, z, M.typ(role)); n++; };

  // Fundament bis zum Gelände und Bodenplatte
  const frei = plan.innen ? plan.innen.rohbauFrei : new Set(); // Lichter im Boden, Treppenloch im Flachdach
  const eg = plan.eingang || { stufen: new Map(), luft: new Set() };
  for (const [x, z] of plan.cells) {
    for (let y = top(x, z) + 1; y < boden; y++) {
      const k = x + ',' + y + ',' + z;
      if (eg.stufen.has(k)) { writer.set(x, y, z, eg.stufen.get(k)); n++; } else if (!eg.luft.has(k)) set(x, y, z, 'pietra_forte_bruch');
    }
    const k = x + ',' + boden + ',' + z;
    if (eg.stufen.has(k)) { writer.set(x, boden, z, eg.stufen.get(k)); n++; } else if (!frei.has(k) && !eg.luft.has(k)) set(x, boden, z, 'pflaster');
  }

  // Wände
  const yTop = plan.flach ? eaves + PARAPET : eaves;
  const wallCell = (c) => {
    const fassade = c.klasse === 'strasse';
    const lay = fassade ? plan.fassaden.get(c.edge) : null;
    const db = plan.durchbruch && plan.durchbruch.has(P.ck(c.x, c.z));
    const dbTop = boden + Math.max(3, Math.min(F.TUER_H, plan.storeys[0].h - 2));
    for (let y = boden + 1; y <= yTop; y++) {
      if (db && y <= dbTop) continue; // Türdurchbruch
      const s = storeyAt(plan, Math.min(y, eaves));
      let role = null;
      if (lay && y <= eaves) {
        const v = y - plan.storeys[s].base;
        const r = F.zelle(lay, s, v, c);
        if (r === 'offen') continue;
        role = r === 'glas' ? 'glas_fenster' : r;
      }
      set(c.x, y, c.z, role || wandRolle(plan, fassade, s));
    }
  };
  const keys = [...plan.w1.keys(), ...plan.w2.keys()].sort((a, b) => a - b);
  for (const k of keys) wallCell(plan.w1.get(k) || plan.w2.get(k));

  // Teilwände zu kleineren Nachbarn
  const pk = [...plan.partial.keys()].sort((a, b) => a - b);
  for (const k of pk) {
    const c = plan.partial.get(k);
    const db = plan.durchbruch && plan.durchbruch.has(k);
    const dbTop = boden + Math.max(3, Math.min(F.TUER_H, plan.storeys[0].h - 2));
    for (const y of c.ys) {
      if (db && y <= dbTop) continue;
      set(c.x, y, c.z, wandRolle(plan, false, storeyAt(plan, Math.min(y, eaves))));
    }
  }

  // Dach
  if (plan.flach) {
    const dach = 'pflaster';
    for (const [x, z] of plan.cells) {
      const k = P.ck(x, z);
      if (plan.w1.has(k) || plan.w2.has(k)) continue;
      const pt = plan.partial.get(k);
      if (pt && pt.ys.includes(eaves)) continue; // Teilwand reicht bis zur Traufe
      if (frei.has(x + ',' + eaves + ',' + z)) continue;
      set(x, eaves, z, dach);
    }
  } else {
    for (const c of roofs.surface({ columns: plan.cells, height: plan.dachHoehe, thickness: 1, overlap: 1 })) set(c.x, c.y, c.z, 'dach');
    // Firstkamm: eine Reihe Ziegel auf der Mittellinie des Daches (nicht unter Kaminen und Altana)
    const frei = new Set();
    for (const k of plan.kamine) { frei.add(P.ck(k.x, k.z)); if (k.zwei) frei.add(P.ck(k.x + 1, k.z)); }
    if (plan.altana) for (let dx = 0; dx < 4; dx++) for (let dz = 0; dz < 4; dz++) frei.add(P.ck(plan.altana.x0 + dx, plan.altana.z0 + dz));
    for (const k of [...plan.first].sort((a, b) => a - b)) {
      if (frei.has(k)) continue;
      const x = P.ckX(k), z = P.ckZ(k), h = plan.dachHoehe(x, z);
      if (h >= eaves + 3) set(x, h + 1, z, 'dach_first');
    }
  }

  // Kamine
  for (const k of plan.kamine) {
    for (let y = k.y + 1; y <= k.y + 3; y++) {
      set(k.x, y, k.z, 'dach_first');
      if (k.zwei) set(k.x + 1, y, k.z, 'dach_first');
    }
  }

  // Altana: Boden eben aufgefüllt, vier Pfeiler, kleines Dach
  if (plan.altana) {
    const al = plan.altana;
    const pfeiler = al.holz ? 'holz_sporto' : 'pietra_serena';
    for (let dx = 0; dx < 4; dx++) {
      for (let dz = 0; dz < 4; dz++) {
        const x = al.x0 + dx, z = al.z0 + dz;
        const h = plan.flach ? eaves : plan.dachHoehe(x, z);
        for (let y = h + 1; y <= al.fl; y++) set(x, y, z, 'dach');
        const ecke = (dx === 0 || dx === 3) && (dz === 0 || dz === 3);
        if (ecke) for (let y = al.fl + 1; y <= al.fl + 4; y++) set(x, y, z, pfeiler);
        set(x, al.fl + 5, z, 'dach');
        if ((dx === 1 || dx === 2) && (dz === 1 || dz === 2)) set(x, al.fl + 6, z, 'dach_first');
      }
    }
  }

  // Gesims als Konsolreihe (Stufen zur Wand hin) mit überstehendem Dach; nur auf freien Zellen, einmal je Zelle im Projekt
  const gr = gesimsRolle(plan);
  const gsm = plan.akte.fassade.gesims;
  const sorted = plan.gesims.slice().sort((a, b) => (a.x - b.x) || (a.z - b.z));
  for (const c of sorted) {
    for (const row of gesimsReihen(gsm.art, gsm.tiefeBl, c.depth, c.par, plan.flach, gr)) {
      if (!kontext.beanspruche(c.x, eaves + row.dy, c.z, plan.id)) continue;
      set(c.x, eaves + row.dy, c.z, row.role);
    }
  }

  // Vorsprünge der Fassade (Sohlbänke, Konsolen, Marcapiano)
  for (const v of plan.vorsprung) {
    if (!kontext.beanspruche(v.x, v.y, v.z, plan.id)) continue;
    set(v.x, v.y, v.z, v.role);
  }
  return n;
}

module.exports = { planHaus, bauHaus, abstandsfeld, inShape: F.inShape, layoutKante: F.layoutKante, geschosseMitBasis,
  WALL_STREET, WALL_PLAIN, ROOF_RISE, ROOF_CAP, PARAPET };
