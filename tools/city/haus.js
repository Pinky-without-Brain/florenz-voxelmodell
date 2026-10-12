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

// Benannte Konstanten (HAUSAKTE §1 und §5)
const WALL_STREET = 2;          // Außenwand zur Straße
const WALL_PLAIN = 1;           // sonstige Außenwände und Brandwand
const ROOF_RISE = 0.4;          // Dachanstieg je Block Abstand zum Rand (ca. 22 Grad)
const ROOF_CAP = 10;            // größter Anstieg (Blöcke); große Grundrisse bekommen ein flaches Dachplateau
const PARAPET = 2;              // Brüstung des Flachdachs über der Terrasse
const FACADE_MIN_LEN = 6;       // kürzere Kanten bekommen keine Öffnungen
const FACADE_MARGIN = 2;        // Abstand der ersten Achse vom Kantenende
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

// ------------------------------------------------------------------ Öffnungen
// Form-Test in (u, v): u entlang der Kante (kontinuierlich, ab Kantenanfang), v = Höhe über dem Geschossboden.
function inShape(it, u, v) {
  const dx = u - it.uc;
  switch (it.kind) {
    case 'rect':
      return dx >= -it.w / 2 && dx < it.w / 2 && v >= it.v0 && v < it.v0 + it.h;
    case 'arch': {
      if (!(dx >= -it.w / 2 && dx < it.w / 2) || v < it.v0) return false;
      if (v < it.v0 + it.spring) return true;
      const r = it.w / 2;
      const q = v - (it.v0 + it.spring) + 0.5;
      return (dx / r) * (dx / r) + (q / r) * (q / r) <= 1;
    }
    case 'circle': {
      const r = it.w / 2, dv = v - it.vc;
      return dx * dx + dv * dv <= r * r;
    }
    default:
      return false;
  }
}
const inAny = (items, u, v) => items.some((it) => inShape(it, u, v));

// Öffnungen einer straßenseitigen Kante. Rückgabe: je Geschoss eine Liste von Elementen.
function layoutKante(e, istHaupt, akte, storeys, seedBit) {
  const out = storeys.map(() => []);
  const L = e.len;
  const avail = L - 2 * FACADE_MARGIN;
  if (avail < 3) return out;
  const f = akte.fassade;
  const nAx = Math.max(1, Math.min(f.achsen, Math.floor(avail / 5)));
  const sp = avail / nAx;
  const centers = [];
  for (let k = 0; k < nAx; k++) centers.push(FACADE_MARGIN + (k + 0.5) * sp);
  const eg = storeys[0];
  const frameMat = f.fenster.rahmen;
  const stucco = f.fenster.typ === 'rahmen_stuck';
  const stoneFrame = stucco || frameMat === 'pietra_forte' || frameMat === 'pietra_serena';
  const hasFrame = stoneFrame || (frameMat === 'putz' && !f.fenster.laeden);
  const mk = (extra) => ({ glass: true, frame: hasFrame, shutter: !!f.fenster.laeden && !stoneFrame, hood: false, ...extra });

  // Erdgeschoss
  const art = f.erdgeschoss.art;
  const pw = f.erdgeschoss.portalBreiteBl || 5;
  const items0 = out[0];
  const portalH = Math.max(4, Math.min(eg.h - 2, Math.round(pw * 1.8)));
  const portalAt = (uc, w) => {
    const h = Math.max(4, Math.min(eg.h - 2, Math.round(w * 1.8)));
    items0.push(mk({ kind: 'arch', uc, w, v0: 0, spring: Math.max(1, h - Math.ceil(w / 2)), glass: false, shutter: false, frame: true, portal: true }));
  };
  const egWindow = (uc) => {
    const ef = f.erdgeschoss.fenster;
    if (ef === 'keine') return;
    const h = Math.max(2, Math.min(4, eg.h - 5));
    if (ef === 'rundbogen') items0.push(mk({ kind: 'arch', uc, w: 2, v0: 2, spring: Math.max(1, h - 1) }));
    else if (ef === 'kniefenster') items0.push(mk({ kind: 'rect', uc, w: 2, v0: 1, h: h + 1 }));
    else items0.push(mk({ kind: 'rect', uc, w: 2, v0: 2, h }));
  };
  let blocked = [];
  const sideAxis = seedBit ? nAx - 1 : 0;
  if (istHaupt) {
    if (art === 'portal_mittig' || art === 'portal_giebel') {
      portalAt(L / 2, pw);
      blocked.push([L / 2 - pw / 2 - 2, L / 2 + pw / 2 + 2]);
      if (art === 'portal_giebel' && eg.h - portalH >= 5) {
        items0.push(mk({ kind: 'circle', uc: L / 2, w: 3, vc: portalH + (eg.h - portalH) / 2, glass: true, shutter: false }));
      }
    } else if (art === 'portal_seitlich' || art === 'tor_und_fenster') {
      const uc = centers[sideAxis];
      portalAt(uc, Math.min(pw, Math.max(3, Math.floor(sp) - 2)));
      blocked.push([uc - pw / 2 - 2, uc + pw / 2 + 2]);
    }
  }
  if (istHaupt && art === 'loggia_offen') {
    const w = Math.max(3, Math.floor(sp) - 2);
    for (const uc of centers) {
      const h = Math.max(4, eg.h - 2);
      items0.push(mk({ kind: 'arch', uc, w, v0: 0, spring: Math.max(1, h - Math.ceil(w / 2)), glass: false, shutter: false, frame: true, portal: true }));
    }
  } else if (istHaupt && art === 'bottega_arcata' && sp >= 7) {
    const w = Math.min(5, Math.floor(sp) - 3);
    for (const uc of centers) {
      const h = Math.max(4, Math.min(8, eg.h - 2));
      items0.push(mk({ kind: 'arch', uc, w, v0: 0, spring: Math.max(1, h - Math.ceil(w / 2)), glass: false, shutter: false, frame: true, portal: true }));
    }
  } else if (art !== 'geschlossen') {
    for (const uc of centers) {
      if (blocked.some(([a, b]) => uc >= a && uc <= b)) continue;
      egWindow(uc);
    }
  }

  // Obergeschosse
  const torre = akte.typ === 'casa_torre';
  for (let s = 1; s < storeys.length; s++) {
    const st = storeys[s];
    const h = Math.min(st.art === 'nobile' ? 6 : 5, st.h - 3);
    if (h < 2) continue;
    const w = torre ? 1 : 2;
    for (const uc of centers) {
      switch (f.fenster.typ) {
        case 'rundbogen': out[s].push(mk({ kind: 'arch', uc, w: Math.max(w, 2), v0: 2, spring: Math.max(1, h - 1) })); break;
        case 'bifora':
          out[s].push(mk({ kind: 'rect', uc: uc - 1, w: 1, v0: 2, h }), mk({ kind: 'rect', uc: uc + 1, w: 1, v0: 2, h }));
          break;
        case 'tabernakel': out[s].push(mk({ kind: 'rect', uc, w, v0: 2, h, hood: true })); break;
        default: out[s].push(mk({ kind: 'rect', uc, w, v0: 2, h }));
      }
    }
  }
  return out;
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
      if (np.boden > boden) ranges.push([boden + 1, np.boden]);
      if (plan.eaves > np.eaves) ranges.push([np.eaves + 1, plan.eaves]);
    }
    if (ranges.length) {
      const ys = new Set();
      for (const [a, b] of ranges) for (let y = a; y <= b; y++) ys.add(y);
      partial.set(k, { x, z, ys: [...ys].sort((p, q) => p - q) });
    }
  }
  plan.partial = partial;

  // Öffnungen je Straßenkante
  const strassenKanten = edgeList.filter((e) => plan.klasse[e.index] === 'strasse' && e.len >= FACADE_MIN_LEN);
  let haupt = null;
  for (const e of strassenKanten) if (!haupt || e.len > haupt.len + 1e-9) haupt = e;
  plan.hauptKante = haupt ? haupt.index : -1;
  const seedBit = (parseInt(String(id).replace(/\D/g, ''), 10) || 0) % 2;
  plan.oeffnungen = new Map();
  for (const e of strassenKanten) plan.oeffnungen.set(e.index, layoutKante(e, haupt === e, akte, plan.storeys, seedBit));

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
          plan.gesims.push({ x, z, depth });
          next.push({ x, z, edge: f.edge });
        }
      }
      front = next;
    }
  }

  // Dachhöhe
  if (!flach) {
    const dist = abstandsfeld(cells, S);
    plan.dachHoehe = (x, z) => plan.eaves + 1 + Math.min(ROOF_CAP, Math.floor(ROOF_RISE * dist(x, z)));
  }
  return plan;
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

// Grundrolle der Wand (ohne Öffnungen) für Fassade (Straßenseite) bzw. Nebenseite
function wandRolle(plan, fassade, s) {
  const f = plan.akte.fassade;
  const putz = putzRolle(plan.akte);
  const art = plan.storeys[s].art;
  if (!fassade) return f.material === 'putz' ? putz : 'pietra_forte_bruch';
  switch (f.material) {
    case 'putz': return putz;
    case 'bruchstein': return 'pietra_forte_bruch';
    case 'stein_glatt': return 'pietra_serena';
    case 'bugnato_glatt': return s === 0 ? 'pietra_forte_rustika' : 'pietra_forte';
    case 'bugnato_abgestuft':
      if (s === 0) return 'pietra_forte_rustika';
      if (art === 'nobile' || s === 1) return 'pietra_forte_bruch';
      return 'pietra_forte';
    default: return putz;
  }
}

// Rolle der Zelle einer Straßenwand an (u, v) im Geschoss s: 'offen' | 'glas' | Rolle | null (Grundwand)
function fassadenPunkt(plan, items, s, u, v, layer) {
  const f = plan.akte.fassade;
  const list = items[s];
  if (!list || !list.length) return null;
  for (const it of list) {
    if (inShape(it, u, v)) {
      if (!it.glass) return 'offen';
      return layer === 1 ? 'glas' : 'offen';
    }
  }
  // Rahmen (und Haube beim Tabernakel)
  const rahmenStein = f.fenster.rahmen === 'pietra_forte' ? 'pietra_forte' : 'pietra_serena';
  for (const it of list) {
    if (!it.frame) continue;
    const near = list.some((o) => o.frame && (inShape(o, u - 1, v) || inShape(o, u + 1, v) || inShape(o, u, v - 1) || inShape(o, u, v + 1)));
    const hood = it.hood && v === it.v0 + it.h + 1 && u >= it.uc - it.w / 2 - 1 && u < it.uc + it.w / 2 + 1;
    if (near || hood) {
      if (it.portal) return rahmenStein;
      return f.fenster.typ === 'rahmen_stuck' || f.fenster.rahmen === 'putz' ? 'putz_weiss' : rahmenStein;
    }
  }
  const lad = f.fenster.laeden;
  if (lad && layer === 1) {
    for (const it of list) {
      if (it.shutter && it.kind === 'rect' && v >= it.v0 && v < it.v0 + it.h &&
          ((u >= it.uc - it.w / 2 - 1 && u < it.uc - it.w / 2) || (u >= it.uc + it.w / 2 && u < it.uc + it.w / 2 + 1))) {
        return lad === 'gruen' ? 'fensterladen' : 'holz_sporto';
      }
    }
  }
  return null;
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
  for (const [x, z] of plan.cells) {
    for (let y = top(x, z) + 1; y < boden; y++) set(x, y, z, 'pietra_forte_bruch');
    set(x, boden, z, 'pflaster');
  }

  // Wände
  const yTop = plan.flach ? eaves + PARAPET : eaves;
  const wallCell = (c) => {
    const fassade = c.klasse === 'strasse';
    const items = fassade ? plan.oeffnungen.get(c.edge) : null;
    for (let y = boden + 1; y <= yTop; y++) {
      const s = storeyAt(plan, Math.min(y, eaves));
      let role = null;
      if (items) {
        const st = plan.storeys[s];
        const v = Math.min(y, eaves) - st.base;
        if (y <= eaves) {
          const r = fassadenPunkt(plan, items, s, c.u, v, c.layer);
          if (r === 'offen') continue;
          role = r === 'glas' ? 'glas_fenster' : r;
        }
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
    for (const y of c.ys) {
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
      set(x, eaves, z, dach);
    }
  } else {
    for (const c of roofs.surface({ columns: plan.cells, height: plan.dachHoehe, thickness: 1, overlap: 1 })) {
      set(c.x, c.y, c.z, 'dach');
    }
  }

  // Gesims (nur auf freien Zellen, einmal je Zelle im ganzen Projekt)
  const gr = gesimsRolle(plan);
  const stein = plan.akte.fassade.gesims.art === 'cornicione_stein';
  const sorted = plan.gesims.slice().sort((a, b) => (a.x - b.x) || (a.z - b.z));
  for (const c of sorted) {
    if (!kontext.beanspruche(c.x, eaves, c.z)) continue;
    set(c.x, eaves, c.z, gr);
    if (stein && c.depth === 1 && kontext.beanspruche(c.x, eaves - 1, c.z)) set(c.x, eaves - 1, c.z, gr);
  }
  return n;
}

module.exports = { planHaus, bauHaus, abstandsfeld, inShape, layoutKante, geschosseMitBasis,
  WALL_STREET, WALL_PLAIN, ROOF_RISE, ROOF_CAP, PARAPET };
