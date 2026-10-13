'use strict';
// Palazzo Vecchio, B2: Belegungsplan für Begehbarkeit und Innenräume (rein geometrisch, einmal je Prozess).
// Geschosse, Trennwände mit Türen, Treppen (Treppenblöcke), Freihaltungen (carve) und Licht werden hier geplant, bevor die Module
// bauen. Die Module setzen ihre Blöcke mit S.put; Zellen aus `carve` bleiben dabei frei (Türen, Treppenschächte), die Treppen
// selbst setzt pv_innen.js mit S.putForce.
//
// Rahmen: u entlang der Westfassade (Norden = +u = -z), w von der Fassade ins Haus (+w = +x). Treppen laufen in Weltachsen.

const WZ = require('../../../tools/wahrzeichen');
const T = WZ.treppe;
const pvl = require('./pv_lib.js');
const palette = require('../../../tools/spec/palette.js');

// Geschosse: stand = Stehzelle (y_rel), boden = Plattenzelle darunter, decke = Plattenzelle darüber
const GESCHOSSE = {
  eg: { id: 'eg', stand: 1, boden: 0, decke: 16, name: 'Erdgeschoss' },
  og1: { id: 'og1', stand: 17, boden: 16, decke: 33, name: 'Erstes Obergeschoss' },
  og2: { id: 'og2', stand: 34, boden: 33, decke: 49, name: 'Zweites Obergeschoss' },
  dg: { id: 'dg', stand: 50, boden: 49, decke: 56, name: 'Dachgeschoss' }
};
const TUERHOEHE = 7;          // lichte Türhöhe (Stehzelle .. +6)
const TUERBREITE = 4;

// ---------------------------------------------------------------- Trennwände (Rahmen u, w), 2 dick
// achse 'w': Wand liegt bei w = c und läuft entlang u von a bis b; achse 'u': Wand bei u = c, läuft entlang w.
// tueren: Mittelpunkte entlang der Wand (4 breit, 7 hoch).
const WAENDE = [
  // Erdgeschoss: Ost- und Westflügel der Zone A getrennt durch eine Mauer mit drei Durchgängen
  { id: 'eg_u66', ge: 'eg', achse: 'u', c: 66, a: 5, b: 57, tueren: [17, 33, 49], mat: 'pietra_forte' },
  { id: 'eg_w33', ge: 'eg', achse: 'w', c: 33, a: 66, b: 88, tueren: [76], mat: 'pietra_forte' },
  // 1. Obergeschoss: Quartiere im Nordteil der Zone A
  { id: 'og1_u55', ge: 'og1', achse: 'u', c: 55, a: 0, b: 47, tueren: [15, 37], mat: 'putz_sand' },
  { id: 'og1_u79', ge: 'og1', achse: 'u', c: 79, a: 0, b: 47, tueren: [15, 33], mat: 'putz_sand' },
  { id: 'og1_w27', ge: 'og1', achse: 'w', c: 27, a: 55, b: 79, tueren: [67], mat: 'putz_sand' },
  { id: 'og1_w47', ge: 'og1', achse: 'w', c: 47, a: 55, b: 79, tueren: [67], mat: 'putz_sand' },
  { id: 'og1_w27b', ge: 'og1', achse: 'w', c: 27, a: 79, b: 90, tueren: [], mat: 'putz_sand' },
  { id: 'og1_w39', ge: 'og1', achse: 'w', c: 39, a: 79, b: 90, tueren: [83], mat: 'putz_sand' },
  // 2. Obergeschoss: Quartiere Elementi und Karten
  { id: 'og2_u55', ge: 'og2', achse: 'u', c: 55, a: 0, b: 57, tueren: [15, 40], mat: 'putz_sand' },
  { id: 'og2_u79', ge: 'og2', achse: 'u', c: 79, a: 0, b: 27, tueren: [15], mat: 'putz_sand' },
  { id: 'og2_w27', ge: 'og2', achse: 'w', c: 27, a: 55, b: 90, tueren: [67, 84], mat: 'putz_sand' },
  { id: 'og2_w57', ge: 'og2', achse: 'w', c: 57, a: 55, b: 90, tueren: [70], mat: 'putz_sand' }
];

const SALONE_TUEREN = [{ seite: 'w', u: 22 }, { seite: 'w', u: 56 }, { seite: 'o', u: -10 }, { seite: 'o', u: 80 }];

const key = (x, z) => x * 8192 + z;

function istFrei(g, r, yLo, wandCols) {
  if (!r || r.zone === 'T' || r.sal) return false;
  if (r.d8 <= pvl.tWall(Math.min(yLo, 49)) + 1) return false;
  if (r.dHm <= 6) return false;
  if (wandCols && wandCols.has(key(r.x, r.z))) return false;
  return true;
}

// ---------------------------------------------------------------- Turm: Wendel-Treppe im Hohlraum
// Der Hohlraum (Zone T, dT > 4) ist 4 bis 5 Zellen breit und rund 13 lang (x -136..-131, z 848..860). Die Spirale ist eine
// rechteckige Doppelwendel: zwei Spuren (West x -135/-134, Ost x -133/-132) und Podeste aus Vollblöcken (2 x 4) an beiden Enden,
// 4 Stufen je Lauf. Das erste Nordpodest liegt bei y_rel 1 (Schwelle, Stufe am Eingang), das Nordpodest bei y_rel 153 ist der
// Boden der Glockenstube, das bei y_rel 161 der Boden der Edikula.
function turmTreppe(g, ck) {
  const BY = g.bodenY;
  const hohl = new Set(g.recs.filter((r) => r.zone === 'T' && r.dT > 4).map((r) => r.x * 8192 + r.z));
  const SP = { W: [-135, -134], O: [-133, -132] }, ALLE = [-135, -134, -133, -132];
  const N = [852, 853], S = [858, 859], LAUF = [854, 855, 856, 857];
  const fuell = T.volltyp('pietra_serena');
  const out = { stufen: [], podeste: [], unter: [], kopf: [], lampen: [], carve: new Set(), tuer: [], eingang: [], hoehen: { glocken: 153, edikula: 161 } };
  const seen = new Set();
  const add = (list, x, y, z, typ) => { const k = ck(x, y, z); if (!seen.has(list === out.kopf ? 'k' + k : k)) { seen.add(list === out.kopf ? 'k' + k : k); list.push(typ ? { x, y, z, typ } : { x, y, z }); } };
  const podest = (zs, H, lampe) => {
    for (const z of zs) for (const x of ALLE) {
      if (!hohl.has(x * 8192 + z)) throw new Error('Turm: Podest außerhalb des Hohlraums (' + x + ',' + z + ')');
      out.podeste.push({ x, y: H, z, typ: lampe && x === ALLE[1] && z === zs[0] ? 'LAMPE' : fuell });
      for (let h = 1; h <= 3; h++) add(out.kopf, x, H + h, z);
    }
  };
  const stufe = (x, z, y, dir) => {
    if (!hohl.has(x * 8192 + z)) throw new Error('Turm: Stufe außerhalb des Hohlraums (' + x + ',' + z + ')');
    out.stufen.push({ x, y, z, typ: palette.treppe('pietra_serena', dir) });
    out.unter.push({ x, y: y - 1, z, typ: fuell });
    for (let h = 1; h <= 3; h++) add(out.kopf, x, y + h, z);
  };
  // Eingangsstufe im Vorraum (Reihe 851) zum ersten Nordpodest
  for (const x of ALLE) stufe(x, 851, 1, 's');
  out.unter = out.unter.filter((u) => u.y >= 1);        // unter der Eingangsstufe liegt der Boden (y_rel 0)
  let H = 1;
  podest(N, H, true);
  while (H < 161) {
    for (let k = 0; k < 4; k++) for (const x of SP.W) stufe(x, LAUF[k], H + 1 + k, 's');
    H += 4;
    podest(S, H, true);
    for (let k = 0; k < 4; k++) for (const x of SP.O) stufe(x, LAUF[3 - k], H + 1 + k, 'n');
    H += 4;
    podest(N, H, true);
  }
  // Eingangstür in der Turmwand (Westseite): 3 breit (z 849..851), 7 hoch, vier Zellen tief
  for (let z = 849; z <= 851; z++) for (let x = -139; x <= -136; x++) {
    const r = g.rec(x, z);
    if (!r) continue;
    for (let y = 1; y <= 7; y++) { out.carve.add(ck(x, y, z)); if (!(r.zone === 'T' && r.dT > 4)) out.tuer.push({ x, y, z }); }
  }
  for (const list of [out.stufen, out.podeste, out.unter]) for (const b of list) out.carve.add(ck(b.x, b.y, b.z));
  for (const c of out.kopf) out.carve.add(ck(c.x, c.y, c.z));
  for (const b of out.podeste) if (b.typ === 'LAMPE') out.lampen.push(b);
  return out;
}

/** Plan für die Geometrie g; wird in g.plan zwischengespeichert. */
function plan(g) {
  if (g.plan) return g.plan;
  const P = { carve: new Set(), geschosse: GESCHOSSE, waende: [], treppen: [], tueren: [], log: [] };
  g.plan = P;
  const BY = g.bodenY;
  const ck = (x, yr, z) => pvl.keyOf(x, yr + BY, z);

  // ---- Trennwände: Zellen je Wand
  const wandCols = new Set();
  for (const w of WAENDE) {
    const ge = GESCHOSSE[w.ge];
    const cells = [];
    for (const r of g.recs) {
      if (r.zone === 'T' || r.sal) continue;
      const along = w.achse === 'w' ? r.u : r.w, across = w.achse === 'w' ? r.w : r.u;
      if (across < w.c - 1 || across >= w.c + 1 || along < w.a || along >= w.b) continue;
      if (r.d8 <= pvl.tWall(ge.stand) || r.dHm <= 7) continue;
      const tuer = w.tueren.some((t) => Math.abs(along - t) < TUERBREITE / 2);
      cells.push({ r, tuer });
      wandCols.add(key(r.x, r.z));
      if (tuer) for (let y = ge.stand; y < ge.stand + TUERHOEHE; y++) P.carve.add(ck(r.x, y, r.z));
    }
    P.waende.push({ ...w, ge, cells });
  }

  // ---- Salone: Türen 6 breit, 10 hoch in den Längswänden (Westseite zum Streifen, Ostseite zum Dogana-Flügel)
  P.saloneTueren = [];
  for (const t of SALONE_TUEREN) {
    for (const r of g.recs) {
      if (!r.sal || r.salL || r.zone === 'T') continue;
      const wand = t.seite === 'w' ? r.w < pvl.SAL_LICHT.w0 : r.w >= pvl.SAL_LICHT.w1;
      if (!wand || Math.abs(r.u - t.u) >= 3 || r.d8 <= 4) continue;
      P.saloneTueren.push({ x: r.x, z: r.z });
      for (let y = 17; y < 17 + 10; y++) P.carve.add(ck(r.x, y, r.z));
    }
  }

  // ---- Treppen
  const belegt = new Set();          // Spalten, die schon eine Treppe trägt
  const lauf = (spec, anker) => {
    const Y0 = BY + spec.y0;
    const bl = T.geradeTreppe({ start: { x: spec.x, y: Y0, z: spec.z }, richtung: spec.dir, stufen: spec.n, breite: spec.breite, rolle: spec.rolle || 'pietra_serena' });
    const stufen = bl.map((b) => ({ x: b.x, y: b.y - BY, z: b.z, typ: b.typ }));
    const unter = [];
    const fuell = T.volltyp(spec.rolle || 'pietra_serena');
    for (const b of bl) for (let y = spec.y0; y < b.y - BY; y++) unter.push({ x: b.x, y, z: b.z, typ: fuell });
    const kopf = T.treppenloch(bl.lauf).map((c) => ({ x: c.x, y: c.y - BY, z: c.z }));
    // Auslauf: zwei Zellen hinter der letzten Stufe
    const [dx, dz] = T.DIR[spec.dir], [qx, qz] = T.DIR[T.RECHTS[spec.dir]];
    const auslauf = [];
    for (let k = spec.n; k <= spec.n + 2; k++) for (let q = 0; q < spec.breite; q++) auslauf.push([spec.x + dx * k + qx * q, spec.z + dz * k + qz * q]);
    const spalten = [];
    for (let k = 0; k < spec.n; k++) for (let q = 0; q < spec.breite; q++) spalten.push([spec.x + dx * k + qx * q, spec.z + dz * k + qz * q]);
    return { ...spec, stufen, unter, kopf, spalten, auslauf, anker };
  };
  const pruefe = (L, yLo, yHi, opt = {}) => {
    const cols = L.spalten.concat(opt.ohneAuslauf ? [] : L.auslauf);
    for (const [x, z] of cols) {
      const r = g.rec(x, z);
      if (opt.rand) { if (!r || r.zone === 'T' || r.dHm <= 6 || r.sal) return false; continue; }
      if (!istFrei(g, r, yLo, wandCols) || belegt.has(key(x, z))) return false;
    }
    return true;
  };
  /** Sucht einen freien Platz in der Nähe von (u, w) im Rahmen; dir/n/breite fest, Startzelle = Lauf-Anfang. */
  const finde = (id, spec0, u, w, radius, yLo, yHi, opt) => {
    let best = null;
    for (let du = -radius; du <= radius; du++) {
      for (let dw = -radius; dw <= radius; dw++) {
        const p = g.rf.toWorld(u + du, w + dw);
        const x = Math.round(p.x), z = Math.round(p.z);
        const L = lauf({ ...spec0, x, z }, { u, w });
        if (!pruefe(L, yLo, yHi, opt)) continue;
        const d = du * du + dw * dw;
        if (!best || d < best.d) best = { d, L };
      }
    }
    if (!best) throw new Error(`Treppe ${id}: kein freier Platz bei u ${u}, w ${w}`);
    const L = best.L;
    L.id = id;
    for (const [x, z] of L.spalten.concat(L.auslauf)) belegt.add(key(x, z));
    P.treppen.push(L);
    return L;
  };
  P.finde = finde; P.lauf = lauf;

  // Scalone del Vasari (EG -> OG1): 4 breit, 16 Stufen nach Norden (+u), im Streifen zwischen Westflügel und Salone
  finde('scalone_vasari', { dir: 'n', n: 16, breite: 4, y0: 1 }, 68, 84, 6, 1, 33, {});
  // OG1 -> OG2 (17 Stufen) und OG2 -> Dachgeschoss (16 Stufen)
  finde('treppe_og1_og2', { dir: 's', n: 17, breite: 3, y0: 17 }, 8, 84, 8, 17, 49, {});
  finde('treppe_og2_dg', { dir: 'n', n: 16, breite: 3, y0: 34 }, 66, 66, 10, 34, 56, {});
  // Ostflügel (Dogana-Seite): eigene Treppen, weil der Salone die Obergeschosse von Westflügel und Ostflügel trennt
  finde('treppe_ost_eg_og1', { dir: 'n', n: 16, breite: 3, y0: 1 }, 74, 150, 8, 1, 33, {});
  finde('treppe_ost_og1_og2', { dir: 's', n: 17, breite: 3, y0: 17 }, 92, 156, 8, 17, 49, {});
  finde('treppe_ost_og2_dg', { dir: 'n', n: 16, breite: 3, y0: 34 }, 78, 162, 8, 34, 56, {});

  // Aufgänge vom Dachgeschoss zum Wehrgang (Ballatoio) an der Westfassade: nördlich (u > 46) und südlich (u < 23) des Turms
  const ballatoio = (id, uAnker) => {
    let best = null;
    for (const r of g.recs) {
      if (r.e < 17 || r.zone !== 'A' || r.d8 !== 3 || Math.abs(r.u - uAnker) > 12) continue;
      const L = lauf({ dir: 'w', n: 7, breite: 3, y0: 50, x: r.x + 7, z: r.z }, { u: uAnker });
      let ok = true;
      for (const [x, z] of L.spalten) { const q = g.rec(x, z); if (!q || q.zone !== 'A' || q.d8 < 4 || q.dHm <= 6 || belegt.has(key(x, z)) || wandCols.has(key(x, z))) { ok = false; break; } }
      if (!ok) continue;
      for (const [x, z] of L.auslauf.slice(0, 3)) { const q = g.rec(x, z); if (!q || q.zone !== 'A' || q.d8 > 3) ok = false; }
      if (!ok) continue;
      const d = Math.abs(r.u - uAnker);
      if (!best || d < best.d) best = { d, L };
    }
    if (!best) throw new Error('Ballatoio-Treppe ' + id + ': kein Platz');
    best.L.id = id;
    for (const [x, z] of best.L.spalten.concat(best.L.auslauf)) belegt.add(key(x, z));
    P.treppen.push(best.L);
    return best.L;
  };
  ballatoio('treppe_wehrgang_nord', 68);
  ballatoio('treppe_wehrgang_sued', 10);
  // Dachluken: die Luftzellen über den Wehrgangtreppen (Treppenschacht durch Dachplatte und Dach) sind eine deklarierte Öffnung (Tür)
  P.luken = [];
  for (const L of P.treppen) if (L.id.startsWith('treppe_wehrgang')) for (const c of L.kopf) P.luken.push(c);

  P.turm = turmTreppe(g, ck);
  for (const c of P.turm.carve) P.carve.add(c);

  for (const L of P.treppen) {
    for (const s of L.stufen) P.carve.add(ck(s.x, s.y, s.z));
    for (const s of L.unter) P.carve.add(ck(s.x, s.y, s.z));
    for (const s of L.kopf) P.carve.add(ck(s.x, s.y, s.z));
  }
  return P;
}

module.exports = { plan, GESCHOSSE, WAENDE, TUERHOEHE, TUERBREITE };
