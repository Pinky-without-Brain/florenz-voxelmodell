'use strict';
// Generator "stadtgrund" (Spezifikation 20_Stadtmodell_Florenz/stadtgrund/SPEZIFIKATION.md): Gelände, Straßen,
// Plätze, Grün und Arno der ganzen Welt als Kachel-Module (Kachel 320 × 320, Modul n = j · 15 + i).
// Jede Kachel ist ein unabhängiges Modul (project.json "unabhaengig": true, eigenes Grid je Modul).
//
// Säulenregel (§3): In jeder Spalte belegt der Stadtgrund nur Zellen unter dem Besitzer.
//   Aussparung (Brückenpfeiler)      -> nichts
//   Wasser (OSM-Wasserflächen)       -> Bett W − 2, Wasser W − 1..W (nie besessen; unter minY gebauter Projekte)
//   gebautes Projekt (besitz.js)     -> nur Mantel bis tMax = min(groundTopY, minY − 1); liegt minY ≥ groundTopY + 4
//                                       (Gesims, Brücke, Korridor über der Straße), bleibt die Spalte frei (Deckel minY − 1)
//   Gebäudepolygon (noch nicht gebaut) -> nur Mantel bis tMax = groundTopY − 1 (Rückfall §3.2, konfliktfrei für Häuser)
//   frei                             -> Oberfläche t (Glättung §8) und Böschungsrand bis zur Unterkante der Nachbarn (§4)
// Mantel (§3.3): besessene Spalten bekommen Zellen (m, tMax], m = kleinste Unterkante der vier Nachbarn.

const fs = require('node:fs');
const path = require('node:path');
const P = require('./poly.js');
const ground = require('./ground_stadt.js');
const { ladeBesitz } = require('./besitz.js');

const ROOT = path.resolve(__dirname, '..', '..');
const DATEN = path.join(ROOT, 'data', 'stadt');
const RAND = 32;                 // Rand des Rechenbereichs um die Kachel (Wasserspiegel, Abstände)
const BLOCK = 16;                // Wasserspiegel: Median je 16er-Block über 3 × 3 Blöcke (48 × 48, Spezifikation: Fenster 31)
const TEICH_MAX = 50000;         // Wasserflächen bis zu dieser Zellzahl sind Teiche (ein Spiegel je Polygon)
const UFER = 10;                 // Uferband (Chebyshev-Abstand zum Wasser)
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// Flächenklassen (Priorität aufsteigend)
const K = { OFFEN: 0, HOF: 1, GRUEN: 3, GEHWEG: 4, STRASSE: 5, HAUPT: 6, STUFEN: 7, PLATZ: 8, WASSER: 9, GRUENWEG: 10 };
const STRASSEN_KLASSE = {
  footway: K.GEHWEG, path: K.GEHWEG, cycleway: K.GEHWEG, track: K.GEHWEG,
  primary: K.HAUPT, primary_link: K.HAUPT, busway: K.HAUPT, steps: K.STUFEN,
  residential: K.STRASSE, pedestrian: K.STRASSE, unclassified: K.STRASSE, service: K.STRASSE, living_street: K.STRASSE,
  traffic_island: K.STRASSE
};
// Besitz
const B = { FREI: 0, AUS: 1, PROJEKT: 2, POLYGON: 3 };

// Bauteile in Bauordnung (§11)
const TEILE = ['boeschung', 'arno_bett', 'arno_wasser', 'strassen_pflaster', 'strassen_fahrbahn', 'gehwege', 'stufen',
  'plaetze_pflaster', 'plaetze_rand', 'hof_pflaster', 'rasen', 'gruen_wege'];
const TEIL_VON = { [K.STRASSE]: 'strassen_pflaster', [K.HAUPT]: 'strassen_fahrbahn', [K.GEHWEG]: 'gehwege', [K.STUFEN]: 'stufen',
  [K.PLATZ]: 'plaetze_pflaster', [K.HOF]: 'hof_pflaster', [K.GRUEN]: 'rasen', [K.OFFEN]: 'rasen', [K.GRUENWEG]: 'gruen_wege' };

const h = (x, z) => (Math.imul(x, 73856093) ^ Math.imul(z, 19349663)) >>> 0;

// ---------------------------------------------------------------- Polygone
function ringsVon(poly) {
  const p = P.normalize(poly);
  return [...(p.aussen || []), ...(p.loecher || [])];
}
function bboxVonRings(rings) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const r of rings) for (const [x, z] of r) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; }
  return { x0, x1, z0, z1 };
}
const schneidet = (b, box) => b.x0 <= box.x1 && b.x1 >= box.x0 && b.z0 <= box.z1 && b.z1 >= box.z0;
/** Zeilen-Rasterung (gerade-ungerade über alle Ringe) im Kasten box: cb(x, z) für jede Zellmitte im Polygon. */
function rastere(rings, bb, box, cb) {
  const za = Math.max(box.z0, Math.ceil(bb.z0)), zb = Math.min(box.z1, Math.floor(bb.z1));
  const xs = [];
  for (let z = za; z <= zb; z++) {
    xs.length = 0;
    for (const r of rings) {
      for (let i = 0, n = r.length; i < n; i++) {
        const a = r[i], b = r[(i + 1) % n];
        if ((a[1] <= z && b[1] > z) || (b[1] <= z && a[1] > z)) xs.push(a[0] + ((z - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const x0 = Math.max(box.x0, Math.ceil(xs[i] - 1e-9)), x1 = Math.min(box.x1, Math.floor(xs[i + 1] + 1e-9));
      for (let x = x0; x <= x1; x++) cb(x, z);
    }
  }
}
/** Eintrag mit vorbereiteten Ringen; exakt: Punkt-in-Polygon wie tools/city/poly.js (für Gebäude) */
function eintrag(obj, exakt) {
  const rings = ringsVon(obj.polygon);
  return { obj, rings, bb: bboxVonRings(rings), norm: exakt ? P.normalize(obj.polygon) : null };
}

// ---------------------------------------------------------------- Daten (einmal je Prozess)
let DATEN_CACHE = null;
function daten() {
  if (DATEN_CACHE) return DATEN_CACHE;
  const f = JSON.parse(fs.readFileSync(path.join(DATEN, 'flaechen.json'), 'utf8'));
  const g = JSON.parse(fs.readFileSync(path.join(DATEN, 'gebaeude.json'), 'utf8'));
  const iso = JSON.parse(fs.readFileSync(path.join(DATEN, 'isolati.json'), 'utf8'));
  const strassen = f.strassen.filter((s) => s.polygon && !s.bruecke && !(s.layer > 0) && STRASSEN_KLASSE[s.typ] !== undefined)
    .map((s) => ({ ...eintrag(s), klasse: STRASSEN_KLASSE[s.typ] }));
  const plaetze = f.plaetze.filter((p) => p.polygon).map((p) => eintrag(p));
  const gruen = f.gruen.filter((p) => p.polygon).map((p) => eintrag(p));
  const wasser = f.wasser.filter((p) => p.polygon).map((p) => eintrag(p));
  const gebaeude = g.gebaeude.filter((b) => b.polygon).map((b) => eintrag(b, true));
  const isolati = iso.isolati.filter((i) => i.huelle && i.huelle.length >= 3).map((i) => {
    const rings = [i.huelle];
    return { obj: i, rings, bb: bboxVonRings(rings) };
  });
  // Wasserflächen: Teiche (klein) haben einen Spiegel je Polygon (Median), Flüsse den 16er-Blockmedian
  for (const w of wasser) {
    const werte = [];
    rastere(w.rings, w.bb, { x0: -1e9, x1: 1e9, z0: -1e9, z1: 1e9 }, (x, z) => { if (ground.inRaster(x, z)) werte.push(ground.groundTopY(x, z)); });
    w.zellen = werte.length;
    w.teich = werte.length <= TEICH_MAX;
    if (w.teich && werte.length) { werte.sort((a, b) => a - b); w.spiegel = werte[werte.length >> 1]; }
  }
  DATEN_CACHE = { strassen, plaetze, gruen, wasser, gebaeude, isolati };
  return DATEN_CACHE;
}

// Wahrzeichen (Glättung §8, Platzrahmen §6, Randband §6)
function wahrzeichen(root) {
  const { loadRegistry } = require('../projects.js');
  const WZ = require('../wahrzeichen');
  const out = [];
  for (const p of loadRegistry({ root }).projects) {
    if (p.type !== 'wahrzeichen' || !p.json || p.json.ohneMaske || typeof p.json.bodenY !== 'number') continue;
    const m = WZ.ladeMasken(p.json, { dir: p.dir, root });
    out.push({ id: p.id, bodenY: p.json.bodenY, alle: m.alle, rahmen: p.json.rahmen });
  }
  return out;
}

// ---------------------------------------------------------------- Generator
const caches = new Map();
function loadStadtgrund(project) {
  const hit = caches.get(project);
  if (hit) return hit;
  const q = baue(project);
  caches.set(project, q);
  return q;
}

function baue(project) {
  const meta = project.meta;
  if (meta.generator !== 'stadtgrund') throw new Error(`Projekt ${project.id}: generator "stadtgrund" erwartet`);
  const ka = meta.kacheln;
  if (!ka || ![ka.x0, ka.z0, ka.groesse, ka.spalten, ka.zeilen].every(Number.isInteger)) {
    throw new Error(`Projekt ${project.id}: "kacheln" braucht x0, z0, groesse, spalten, zeilen (ganze Zahlen)`);
  }
  const alleN = [];
  for (let j = 0; j < ka.zeilen; j++) for (let i = 0; i < ka.spalten; i++) alleN.push(j * ka.spalten + i);
  const aktiv = Array.isArray(meta.aktiv) ? meta.aktiv.slice().sort((a, b) => a - b) : alleN;
  for (const n of aktiv) if (!alleN.includes(n)) throw new Error(`Projekt ${project.id}: aktive Kachel ${n} gibt es nicht (0..${alleN.length - 1})`);
  const wasserCfg = { lagen: 2, bett: 1, ...(meta.wasser || {}) };
  const glatt = { band: 6, ruecklauf: 6, maxDelta: 3, ...(meta.glaettung || {}) };
  const root = project.dir ? path.resolve(project.dir, '..', '..') : ROOT;

  const kachel = (n) => {
    const i = n % ka.spalten, j = Math.floor(n / ka.spalten);
    const x0 = ka.x0 + ka.groesse * i, z0 = ka.z0 + ka.groesse * j;
    return { n, i, j, x0, z0, x1: x0 + ka.groesse - 1, z1: z0 + ka.groesse - 1 };
  };

  let WZL = null;
  const wzListe = () => (WZL || (WZL = wahrzeichen(root)));
  const platzRahmen = new Map();
  let letzterPlan = null;
  const planVon = (n) => {
    if (letzterPlan && letzterPlan.n === n) return letzterPlan;
    letzterPlan = planeKachel(kachel(n), { wasserCfg, glatt, wzListe, platzRahmen });
    return letzterPlan;
  };

  const q = {
    project, kachel, aktiv, alleN,
    moduleNummern: () => aktiv.slice(),
    plan: planVon,
    contentFor(n) {
      const pl = planVon(n);
      const parts = {};
      for (const id of TEILE) if (pl.teile[id] && pl.teile[id].length) parts[id] = TEXT[id];
      return { module: n, title: pl.titel, subtitle: `Stadtgrund: Kachel ${pl.kachel.i}/${pl.kachel.j}, x ${pl.kachel.x0}..${pl.kachel.x1}, z ${pl.kachel.z0}..${pl.kachel.z1}`,
        icon: '🗺️', parts };
    },
    moduleBuild(n) {
      return {
        module: n,
        build(ctx) {
          const pl = planVon(n);
          for (const id of TEILE) {
            const zellen = pl.teile[id];
            if (!zellen || !zellen.length) continue;
            const w = ctx.part(id, {});
            for (let i = 0; i < zellen.length; i += 4) w.set(zellen[i], zellen[i + 1], zellen[i + 2], TYPEN[zellen[i + 3]]);
          }
        }
      };
    }
  };
  return q;
}

// Rollen -> Typen (Palette); Index in den Zellisten
const ROLLEN = ['gelaende_fels', 'pietra_forte', 'gruen_weg', 'wasser', 'pflaster', 'pietra_serena', 'gruen_rasen'];
let TYPEN = null;
const R = Object.fromEntries(ROLLEN.map((r, i) => [r, i]));
function typen() {
  if (!TYPEN) { const WZ = require('../wahrzeichen'); TYPEN = ROLLEN.map((r) => WZ.typ(r)); }
  return TYPEN;
}

/** Rahmen eines Platzes (§6): Wahrzeichenplätze nach dem Wahrzeichen, sonst Richtung der langen Kanten. */
function rahmenFuer(platz, wzListe) {
  const name = platz.obj.name || '';
  const pv = wzListe().find((w) => w.id === 'palazzo_vecchio');
  let theta = null, ox = null, oz = null;
  if (name === 'Piazza della Signoria' && pv && pv.rahmen) ({ ox, oz, thetaDeg: theta } = pv.rahmen);
  else if (name === 'Piazza del Duomo' || name === 'Piazza San Giovanni') { theta = -1.36; ox = 0; oz = 0; }
  if (theta === null) {
    let sx = 0, sz = 0;
    for (const r of platz.rings) for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length];
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const t = 4 * Math.atan2(b[1] - a[1], b[0] - a[0]);
      sx += L * Math.cos(t); sz += L * Math.sin(t);
    }
    theta = (Math.atan2(sz, sx) / 4) * 180 / Math.PI;
  }
  const th = theta * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
  const lok = (x, z) => ({ u: (x - (ox || 0)) * c + (z - (oz || 0)) * s, w: -(x - (ox || 0)) * s + (z - (oz || 0)) * c });
  if (ox === null) {
    let umin = Infinity, wmin = Infinity;
    rastere(platz.rings, platz.bb, { x0: -1e9, x1: 1e9, z0: -1e9, z1: 1e9 }, (x, z) => {
      const l = lok(x, z); if (l.u < umin) umin = l.u; if (l.w < wmin) wmin = l.w;
    });
    return (x, z) => { const l = lok(x, z); return { u: l.u - umin, w: l.w - wmin }; };
  }
  return lok;
}

/**
 * Plan einer Kachel: { n, kachel, titel, teile: { id: [x, y, z, rolle, ...] }, statistik }
 * Rechenbereich = Kachel + RAND; gebaut wird nur in der Kachel.
 */
function planeKachel(kt, { wasserCfg, glatt, wzListe, platzRahmen }) {
  typen();
  const D = daten();
  const besitz = ladeBesitz();
  const aus = require('../wahrzeichen/projekt.js').ladeAussparung();
  const box = { x0: kt.x0 - RAND, x1: kt.x1 + RAND, z0: kt.z0 - RAND, z1: kt.z1 + RAND };
  const NX = box.x1 - box.x0 + 1, NZ = box.z1 - box.z0 + 1, N = NX * NZ;
  const idx = (x, z) => (x - box.x0) * NZ + (z - box.z0);
  const inBox = (x, z) => x >= box.x0 && x <= box.x1 && z >= box.z0 && z <= box.z1;
  const imRaster = new Uint8Array(N);
  const gt = new Int16Array(N);
  for (let x = box.x0; x <= box.x1; x++) for (let z = box.z0; z <= box.z1; z++) {
    if (!ground.inRaster(x, z)) continue;
    const i = idx(x, z);
    imRaster[i] = 1;
    gt[i] = ground.groundTopY(x, z);
  }

  // 1 Flächenklassen
  const iso = new Uint8Array(N), gruen = new Uint8Array(N), str = new Uint8Array(N), platz = new Int16Array(N).fill(-1);
  const wasserId = new Int16Array(N).fill(-1);
  for (const e of D.isolati) if (schneidet(e.bb, box)) rastere(e.rings, e.bb, box, (x, z) => { iso[idx(x, z)] = 1; });
  for (const e of D.gruen) if (schneidet(e.bb, box)) rastere(e.rings, e.bb, box, (x, z) => { gruen[idx(x, z)] = 1; });
  for (const e of D.strassen) if (schneidet(e.bb, box)) rastere(e.rings, e.bb, box, (x, z) => { const i = idx(x, z); if (e.klasse > str[i]) str[i] = e.klasse; });
  D.plaetze.forEach((e, k) => { if (schneidet(e.bb, box)) rastere(e.rings, e.bb, box, (x, z) => { platz[idx(x, z)] = k; }); });
  D.wasser.forEach((e, k) => { if (schneidet(e.bb, box)) rastere(e.rings, e.bb, box, (x, z) => { wasserId[idx(x, z)] = k; }); });
  const klasse = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (wasserId[i] >= 0) klasse[i] = K.WASSER;
    else if (platz[i] >= 0) klasse[i] = K.PLATZ;
    else if (str[i]) klasse[i] = gruen[i] && str[i] === K.GEHWEG ? K.GRUENWEG : str[i];
    else if (gruen[i]) klasse[i] = K.GRUEN;
    else klasse[i] = iso[i] ? K.HOF : K.OFFEN;
  }

  // 2 Wasserspiegel W
  const W = new Int16Array(N);
  {
    const BX = Math.ceil(NX / BLOCK), BZ = Math.ceil(NZ / BLOCK);
    const werte = Array.from({ length: BX * BZ }, () => []);
    for (let x = box.x0; x <= box.x1; x++) for (let z = box.z0; z <= box.z1; z++) {
      const i = idx(x, z);
      if (wasserId[i] < 0 || !imRaster[i] || D.wasser[wasserId[i]].teich) continue;
      werte[Math.floor((x - box.x0) / BLOCK) * BZ + Math.floor((z - box.z0) / BLOCK)].push(gt[i]);
    }
    const med = new Int16Array(BX * BZ).fill(-1);
    for (let bx = 0; bx < BX; bx++) for (let bz = 0; bz < BZ; bz++) {
      const a = [];
      for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
        const ux = bx + dx, uz = bz + dz;
        if (ux < 0 || uz < 0 || ux >= BX || uz >= BZ) continue;
        for (const v of werte[ux * BZ + uz]) a.push(v);
      }
      if (a.length) { a.sort((p, q) => p - q); med[bx * BZ + bz] = a[a.length >> 1]; }
    }
    for (let x = box.x0; x <= box.x1; x++) for (let z = box.z0; z <= box.z1; z++) {
      const i = idx(x, z);
      if (wasserId[i] < 0) continue;
      const e = D.wasser[wasserId[i]];
      W[i] = e.teich ? e.spiegel : med[Math.floor((x - box.x0) / BLOCK) * BZ + Math.floor((z - box.z0) / BLOCK)];
      if (W[i] < 0) W[i] = gt[i];
    }
  }

  // 3 Besitz und Oberkante
  const besitzArt = new Uint8Array(N);
  const tMax = new Int16Array(N);          // Oberkante (frei: t, besessen: tMax, Wasser: W)
  const deckel = new Int16Array(N).fill(32767); // höchste erlaubte Zelle (minY − 1 gebauter Projekte)
  const geb = new Uint8Array(N);
  for (const e of D.gebaeude) {
    if (!schneidet(e.bb, box)) continue;
    const xa = Math.max(box.x0, Math.ceil(e.bb.x0)), xb = Math.min(box.x1, Math.floor(e.bb.x1));
    const za = Math.max(box.z0, Math.ceil(e.bb.z0)), zb = Math.min(box.z1, Math.floor(e.bb.z1));
    for (let x = xa; x <= xb; x++) for (let z = za; z <= zb; z++) if (P.contains(e.norm, x, z)) geb[idx(x, z)] = 1;
  }
  for (let x = box.x0; x <= box.x1; x++) for (let z = box.z0; z <= box.z1; z++) {
    const i = idx(x, z);
    if (!imRaster[i]) continue;
    const g = gt[i];
    if (aus.hat(x, z)) { besitzArt[i] = B.AUS; tMax[i] = W[i] || g; continue; }
    const m = besitz.minY(x, z);
    if (m < Infinity) deckel[i] = m - 1;
    if (klasse[i] === K.WASSER) { besitzArt[i] = B.FREI; tMax[i] = Math.min(W[i], deckel[i]); continue; }
    if (m <= g + 3) { besitzArt[i] = B.PROJEKT; tMax[i] = Math.min(g, m - 1); continue; }
    if (geb[i] && m === Infinity) { besitzArt[i] = B.POLYGON; tMax[i] = g - 1; continue; }
    besitzArt[i] = B.FREI;
    tMax[i] = Math.min(g, deckel[i]);
  }

  // 4 Glättung an Wahrzeichen-Schwellen (§8): freie Platz- und Straßenspalten im Abstand ≤ band + ruecklauf
  const wzl = wzListe();
  const dMax = glatt.band + glatt.ruecklauf;
  const dBest = new Uint8Array(N).fill(255);   // das nächstgelegene Wahrzeichen bestimmt die Höhe
  for (const wz of wzl) {
    const bb = wz.alle.bbox;
    if (bb.x1 + dMax < box.x0 || bb.x0 - dMax > box.x1 || bb.z1 + dMax < box.z0 || bb.z0 - dMax > box.z1) continue;
    for (let x = Math.max(box.x0, bb.x0 - dMax); x <= Math.min(box.x1, bb.x1 + dMax); x++) {
      for (let z = Math.max(box.z0, bb.z0 - dMax); z <= Math.min(box.z1, bb.z1 + dMax); z++) {
        const i = idx(x, z);
        if (!imRaster[i] || besitzArt[i] !== B.FREI || klasse[i] < K.GEHWEG || klasse[i] > K.PLATZ) continue;
        const d = wz.alle.dAussen(x, z);
        if (!(d <= dMax) || d >= dBest[i] || Math.abs(gt[i] - wz.bodenY) > glatt.maxDelta) continue;
        dBest[i] = d;
        const t = d <= glatt.band ? wz.bodenY : Math.round(wz.bodenY + (gt[i] - wz.bodenY) * (d - glatt.band) / glatt.ruecklauf);
        tMax[i] = Math.min(t, deckel[i]);
      }
    }
  }

  // 5 Unterkanten: frei Land t, Wasser Bettunterkante, besessen tMax, Aussparung W − 2
  const unten = new Int16Array(N);
  for (let i = 0; i < N; i++) {
    if (!imRaster[i]) continue;
    if (besitzArt[i] === B.AUS) unten[i] = (W[i] || gt[i]) - 2;
    else if (klasse[i] === K.WASSER) unten[i] = Math.min(W[i] - 2, gt[i] + 1);
    else unten[i] = tMax[i];
  }
  const minNachbar = (x, z, eigen) => {
    let m = eigen;
    for (const [dx, dz] of N4) {
      const nx = x + dx, nz = z + dz;
      if (!inBox(nx, nz)) continue;
      const j = idx(nx, nz);
      if (!imRaster[j]) continue;
      if (unten[j] < m) m = unten[j];
    }
    return m;
  };

  // 6 Uferband: Chebyshev-Abstand zum Wasser ≤ UFER
  const ufer = new Uint8Array(N);
  {
    let front = [];
    for (let i = 0; i < N; i++) if (klasse[i] === K.WASSER) { ufer[i] = 1; front.push(i); }
    for (let d = 2; d <= UFER + 1 && front.length; d++) {
      const nf = [];
      for (const i of front) {
        const x = Math.floor(i / NZ), z = i % NZ;
        for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
          const ux = x + dx, uz = z + dz;
          if (ux < 0 || uz < 0 || ux >= NX || uz >= NZ) continue;
          const j = ux * NZ + uz;
          if (!ufer[j]) { ufer[j] = d; nf.push(j); }
        }
      }
      front = nf;
    }
  }

  // 7 Zellen der Kachel
  const teile = Object.fromEntries(TEILE.map((t) => [t, []]));
  const add = (teil, x, y, z, rolle) => { const a = teile[teil]; a.push(x, y, z, rolle); };
  const randMasken = wzl.filter((w) => ['palazzo_vecchio', 'loggia_dei_lanzi', 'palazzo_pitti'].includes(w.id));
  const stat = { frei: 0, wasser: 0, besessen: 0, aussparung: 0 };
  const namen = new Map();
  for (let x = kt.x0; x <= kt.x1; x++) for (let z = kt.z0; z <= kt.z1; z++) {
    const i = idx(x, z);
    if (!imRaster[i]) continue;
    const art = besitzArt[i];
    if (art === B.AUS) { stat.aussparung++; continue; }
    const imUfer = ufer[i] && ufer[i] <= UFER + 1;
    const fels = (y) => (imUfer ? R.pietra_forte : R.gelaende_fels);
    if (klasse[i] === K.WASSER) {
      stat.wasser++;
      const w = W[i], von = unten[i];
      for (let y = von; y <= w - 2 && y <= deckel[i]; y++) add('arno_bett', x, y, z, R.gruen_weg);
      for (let y = Math.max(von, w - 1); y <= w && y <= deckel[i]; y++) add('arno_wasser', x, y, z, R.wasser);
      continue;
    }
    if (art === B.PROJEKT || art === B.POLYGON) {
      stat.besessen++;
      const m = minNachbar(x, z, tMax[i]);
      for (let y = m + 1; y <= tMax[i]; y++) add('boeschung', x, y, z, fels(y));
      continue;
    }
    // frei
    stat.frei++;
    const t = tMax[i];
    const bot = Math.min(minNachbar(x, z, t), gt[i]);
    for (let y = bot; y < t; y++) add('boeschung', x, y, z, fels(y));
    const k = klasse[i];
    let gefaelle = 0;
    for (const [dx, dz] of N4) {
      const nx = x + dx, nz = z + dz;
      if (!inBox(nx, nz) || !imRaster[idx(nx, nz)]) continue;
      gefaelle = Math.max(gefaelle, Math.abs(gt[idx(nx, nz)] - gt[i]));
    }
    let teil = TEIL_VON[k], rolle;
    switch (k) {
      case K.STRASSE: case K.HOF: rolle = R.pflaster; break;
      case K.HAUPT: rolle = R.pietra_forte; break;
      case K.GEHWEG: case K.STUFEN: rolle = R.pietra_serena; break;
      case K.GRUENWEG: rolle = R.gruen_weg; break;
      case K.PLATZ: {
        const pz = D.plaetze[platz[i]];
        namen.set(pz.obj.name || '', (namen.get(pz.obj.name || '') || 0) + 1);
        if (randMasken.some((w) => w.alle.dAussen(x, z) <= 2)) { teil = 'plaetze_rand'; rolle = R.pietra_forte; break; }
        let f = platzRahmen.get(platz[i]);
        if (!f) { f = rahmenFuer(pz, wzListe); platzRahmen.set(platz[i], f); }
        const { u, w } = f(x, z);
        const r = Math.floor(w / 4);
        const pu = Math.floor((u + 4 * (((r % 2) + 2) % 2)) / 8);
        rolle = h(pu, r) % 100 < 12 ? R.pietra_serena : R.pflaster;
        break;
      }
      default: rolle = gefaelle >= 2 ? R.gelaende_fels : R.gruen_rasen;
    }
    if (imUfer && gefaelle >= 2 && k !== K.PLATZ) rolle = R.pietra_forte;
    add(teil, x, t, z, rolle);
  }

  // Titel: größter Platz, sonst Wahrzeichen, sonst häufigste Straße
  let titel = null;
  const best = [...namen].filter(([nm]) => nm).sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] >= 400) titel = best[0];
  if (!titel) {
    const wz = wzl.find((w) => { const b = w.alle.bbox; const cx = (b.x0 + b.x1) / 2, cz = (b.z0 + b.z1) / 2; return cx >= kt.x0 && cx <= kt.x1 && cz >= kt.z0 && cz <= kt.z1; });
    if (wz) titel = WZ_NAME[wz.id] || wz.id;
  }
  if (!titel) {
    const zaehl = new Map();
    for (const e of D.strassen) {
      if (!e.obj.name || !schneidet(e.bb, kt)) continue;
      const fl = (Math.min(e.bb.x1, kt.x1) - Math.max(e.bb.x0, kt.x0)) * (Math.min(e.bb.z1, kt.z1) - Math.max(e.bb.z0, kt.z0));
      zaehl.set(e.obj.name, (zaehl.get(e.obj.name) || 0) + Math.max(1, fl));
    }
    const s = [...zaehl].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0];
    if (s) titel = s[0];
  }
  return { n: kt.n, kachel: kt, titel: `Kachel ${kt.i}/${kt.j}${titel ? ' – ' + titel : ''}`, teile, statistik: stat };
}

const WZ_NAME = { duomo: 'Dom', palazzo_vecchio: 'Palazzo Vecchio', uffizi: 'Uffizien', loggia_dei_lanzi: 'Loggia dei Lanzi',
  orsanmichele: 'Orsanmichele', ponte_vecchio: 'Ponte Vecchio', palazzo_pitti: 'Palazzo Pitti' };

const TEXT = {
  boeschung: { title: 'Böschung und Mantel', description: 'Zellen unter der Oberfläche bis zur Unterkante der Nachbarspalten; unter fremden Gebäuden nur der Rand zu tieferen Nachbarn.',
    tip: 'Von unten nach oben setzen; die Oberfläche kommt im nächsten Bauteil.', caution: 'Im Uferband ist die Böschung die Ufermauer (Pietra forte).',
    fact: 'Florenz liegt im Arnotal; nach Süden steigt das Gelände zu den Hügeln von Boboli und San Miniato an.' },
  arno_bett: { title: 'Flussbett', description: 'Kies zwei Lagen unter dem Wasserspiegel.', tip: 'Zuerst das Bett, dann das Wasser.',
    caution: 'Unter den Brückenpfeilern bleibt das Bett frei (Aussparung).', fact: 'Der Wasserspiegel liegt im Zentrum bei Y 50 (gemessen aus dem Geländemodell).' },
  arno_wasser: { title: 'Arno', description: 'Zwei Lagen Wasser über dem Bett; Teiche und Becken mit einem Spiegel je Fläche.',
    tip: 'Wasser zuletzt einsetzen, damit es nicht abläuft.', caution: 'Die Wassertiefe von 1 m ist geschätzt.',
    fact: 'Beim Hochwasser vom 4. November 1966 stand das Wasser in der Altstadt mehrere Meter hoch.' },
  strassen_pflaster: { title: 'Straßenpflaster', description: 'Gassen, Wohn- und Fußgängerstraßen als glatte Pflasterfläche auf der obersten Geländezelle.',
    tip: 'Reihe für Reihe entlang der Straße legen.', caution: 'Vor den Wahrzeichen ist das Pflaster an deren Bodenhöhe angeglichen.',
    fact: 'Die Altstadtstraßen sind seit dem Mittelalter mit Sandsteinplatten gepflastert.' },
  strassen_fahrbahn: { title: 'Hauptstraßen', description: 'Fahrbahnen der Hauptstraßen in dunklerem Stein.', tip: 'Gleiche Höhe wie die angrenzenden Gehwege.',
    caution: 'Das Material ersetzt Asphalt.', fact: 'Die Viali entstanden ab 1865 an Stelle der nördlichen Stadtmauer.' },
  gehwege: { title: 'Gehwege', description: 'Gehwege, Fuß- und Radwege in Pietra serena.', tip: 'Neben der Fahrbahn auf gleicher Höhe.',
    caution: 'Wo ein anderer Straßentyp liegt, gewinnt dieser.', fact: 'Pietra serena ist der graue Sandstein der Florentiner Renaissance.' },
  stufen: { title: 'Treppenflächen', description: 'Treppen aus den Stadtdaten; die Stufen entstehen durch den Höhenverlauf.',
    tip: 'Von unten nach oben.', caution: 'Treppenblöcke folgen in einer späteren Stufe.', fact: 'Viele Treppen führen in Oltrarno die Hänge hinauf.' },
  plaetze_pflaster: { title: 'Plätze', description: 'Plattenmuster 8 × 4 im Verband, etwa jede achte Platte in Pietra serena.',
    tip: 'Erst die Reihen der Platten anlegen, dann die hellen Platten einsetzen.', caution: 'Das Muster ist geschätzt, das Pflaster selbst belegt.',
    fact: 'Die Piazza della Signoria wurde 1385 erstmals gepflastert.' },
  plaetze_rand: { title: 'Randband', description: 'Zwei Zellen Pietra forte vor den Fronten von Palazzo Vecchio, Loggia dei Lanzi und Palazzo Pitti.',
    tip: 'Das Band läuft der Fassade entlang.', caution: 'Nur auf Platzflächen.', fact: 'Pietra forte ist der braune Sandstein der Palastfassaden.' },
  hof_pflaster: { title: 'Höfe', description: 'Freie Flächen innerhalb der Häuserblöcke als Pflaster (Cortile).', tip: 'Glatt verlegen.',
    caution: 'Höfe der Wahrzeichen bauen die Wahrzeichen selbst.', fact: 'Hinter den Fassaden liegen viele kleine Innenhöfe.' },
  rasen: { title: 'Grün und offenes Gelände', description: 'Parks, Gärten, Wiesen und offenes Gelände als Rasen; steile Stellen als Fels.',
    tip: 'Am Hang Spalte für Spalte vorgehen.', caution: 'Bäume sind nicht vorgesehen.', fact: 'Der Boboli-Garten hinter dem Palazzo Pitti ist rund 45 Hektar groß.' },
  gruen_wege: { title: 'Wege im Grün', description: 'Fußwege in Parks und Gärten aus Kies.', tip: 'Auf gleicher Höhe wie der Rasen.',
    caution: 'Treppen im Park bleiben Treppenflächen.', fact: 'Die Kieswege von Boboli sind typisch für italienische Gärten.' }
};

module.exports = { loadStadtgrund, planeKachel, rastere, K, B, TEILE, ROLLEN };
