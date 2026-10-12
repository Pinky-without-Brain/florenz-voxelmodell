'use strict';
// Stadt-Basisdaten für die Webapp (V3 B1): Gelände (4er-Raster), vereinfachte Gebäudegrundrisse, Flächen, Wahrzeichen.
// Ausgabe: webapp/data/stadt/basis.js  (window.STADT_BASIS = {...}, per <script> ladbar, file://-fähig)
//
// Ringformat (alle Polygone): flaches Array [x0, z0, dx1, dz1, ...] in Halbblöcken (Blockkoordinate · 2), erster Punkt
// absolut, danach Differenzen zum Vorgänger. Ring ist offen (letzter Punkt != erster Punkt).

const fs = require('node:fs');
const path = require('node:path');
const geo = require('../geo/gelaende.js');

const ROOT = path.resolve(__dirname, '..', '..');
const STEP = 4;
const DP_EPS = 0.9;          // Vereinfachungstoleranz Gebäude (Blöcke)
const DP_EPS_FLAECHE = 1.2;  // Straßen, Plätze, Wasser, Grün
const TINY_HOLE = 8;         // Löcher kleiner als so viele Blöcke² entfallen

function readJson(rel) { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); }

// --- Geometrie --------------------------------------------------------------
function area(ring) {
  let a = 0;
  for (let i = 0, n = ring.length; i < n; i++) {
    const p = ring[i], q = ring[(i + 1) % n];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
}

function distSeg(p, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const l2 = dx * dx + dz * dz;
  let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz);
}

// Douglas-Peucker auf offener Punktfolge pts[lo..hi]; markiert zu behaltende Punkte in keep
function dp(pts, lo, hi, eps, keep) {
  let best = -1, bi = -1;
  for (let i = lo + 1; i < hi; i++) {
    const d = distSeg(pts[i], pts[lo], pts[hi]);
    if (d > best) { best = d; bi = i; }
  }
  if (best > eps) { keep[bi] = 1; dp(pts, lo, bi, eps, keep); dp(pts, bi, hi, eps, keep); }
}

// Geschlossener Ring: zwei weit entfernte Ankerpunkte, DP auf beiden Hälften
function simplifyRing(ring, eps) {
  const n = ring.length;
  if (n <= 3) return ring.slice();
  let ai = 0, bi = 0, far = -1;
  for (let i = 1; i < n; i++) {
    const d = Math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]);
    if (d > far) { far = d; bi = i; }
  }
  const keep = new Uint8Array(n);
  keep[ai] = 1; keep[bi] = 1;
  dp(ring, ai, bi, eps, keep);
  const second = ring.slice(bi).concat([ring[0]]);
  const keep2 = new Uint8Array(second.length);
  keep2[0] = 1; keep2[second.length - 1] = 1;
  dp(second, 0, second.length - 1, eps, keep2);
  const out = [];
  for (let i = 0; i < n; i++) if (keep[i] && i < bi) out.push(ring[i]);
  for (let i = 0; i < second.length - 1; i++) if (keep2[i]) out.push(second[i]);
  return out;
}

// Offene Linie
function simplifyLine(pts, eps) {
  const n = pts.length;
  if (n <= 2) return pts.slice();
  const keep = new Uint8Array(n);
  keep[0] = 1; keep[n - 1] = 1;
  dp(pts, 0, n - 1, eps, keep);
  return pts.filter((_, i) => keep[i]);
}

const half = (v) => Math.round(v * 2);

// Ring -> Delta-Array in Halbblöcken; entfernt doppelte Folgepunkte. null, wenn < 3 Punkte.
function encodeRing(ring, closed) {
  const out = [];
  let px = 0, pz = 0, cnt = 0;
  for (const p of ring) {
    const x = half(p[0]), z = half(p[1]);
    if (cnt > 0 && x === px && z === pz) continue;
    out.push(cnt === 0 ? x : x - px, cnt === 0 ? z : z - pz);
    px = x; pz = z; cnt++;
  }
  // geschlossene Eingabe (letzter == erster) bereinigen
  if (closed && cnt > 1) {
    let sx = out[0], sz = out[1];
    for (let i = 2; i < out.length; i += 2) { sx += out[i]; sz += out[i + 1]; }
    if (sx === out[0] && sz === out[1]) { out.length -= 2; cnt--; }
  }
  return cnt >= (closed ? 3 : 2) ? out : null;
}

function ringsOf(list, eps, minArea) {
  const out = [];
  for (const r of list || []) {
    const s = simplifyRing(r, eps);
    if (s.length < 3) continue;
    if (Math.abs(area(s)) < minArea) continue;
    const e = encodeRing(s, true);
    if (e) out.push(e);
  }
  return out;
}

// --- Gelände ----------------------------------------------------------------
function buildTerrain() {
  const g = geo.load();
  const w = Math.floor((g.x1 - g.x0) / STEP) + 1, h = Math.floor((g.z1 - g.z0) / STEP) + 1;
  const buf = Buffer.alloc(w * h * 2);
  let yMin = 1e9, yMax = -1e9;
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const x = g.x0 + c * STEP, z = g.z0 + r * STEP;
      const y = geo.groundTopY(x, z);
      if (y < yMin) yMin = y; if (y > yMax) yMax = y;
      buf.writeInt16LE(y, (r * w + c) * 2);
    }
  }
  return { x0: g.x0, z0: g.z0, step: STEP, width: w, height: h, yMin, yMax, data: buf.toString('base64') };
}

// --- Hash für Farbhinweise ----------------------------------------------------
function strHash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 15;
  return h >>> 0;
}

// --- Gebäude ----------------------------------------------------------------
function buildBuildings(src) {
  const out = [];
  for (const b of src.gebaeude) {
    const o = ringsOf(b.polygon.aussen, DP_EPS, 1);
    if (!o.length) continue;
    const l = ringsOf(b.polygon.loecher, DP_EPS, TINY_HOLE);
    const h = strHash(b.id);
    const e = { i: b.id, h: b.hoeheBl, b: b.bodenY, r: h % 4, w: (h >>> 4) % 8, o };
    if (b.name) e.n = b.name;
    if (b.isolato) e.s = b.isolato;
    if (l.length) e.l = l;
    out.push(e);
  }
  return out;
}

function polyList(list, eps, extra) {
  const out = [];
  for (const f of list) {
    const o = ringsOf(f.polygon.aussen, eps, 2);
    if (!o.length) continue;
    const l = ringsOf(f.polygon.loecher, eps, 16);
    const e = { o };
    if (l.length) e.l = l;
    if (f.name) e.n = f.name;
    if (extra) extra(e, f);
    out.push(e);
  }
  return out;
}

// --- Wahrzeichen ---------------------------------------------------------------
function slug(name) {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function buildLandmarks(wz, byId) {
  const cand = new Map(wz.kandidaten.map((k) => [k.id, k]));
  const bridgePos = new Map(wz.bruecken.map((b) => [b.name, b]));
  const out = [];
  for (const p of wz.plan) {
    if (!p.gefunden) continue;
    let ids = p.gewaehlt ? [p.gewaehlt] : (p.treffer || []).map((t) => t.id);
    ids = ids.filter((id) => byId.has(id));
    const bp = bridgePos.get(p.name);
    if (bp && byId.has(bp.id) && !ids.includes(bp.id)) ids.push(bp.id);
    let c = null;
    if (ids.length && cand.has(ids[0])) c = cand.get(ids[0]).schwerpunkt;
    if (!c && ids.length) {
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (const id of ids) for (const r of byId.get(id).polygon.aussen) for (const q of r) {
        x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); z0 = Math.min(z0, q[1]); z1 = Math.max(z1, q[1]);
      }
      c = [(x0 + x1) / 2, (z0 + z1) / 2];
    }
    if (!c && bp) c = bp.pos;
    if (!c) continue;
    out.push({ id: slug(p.name), name: p.name, x: Math.round(c[0] * 2) / 2, z: Math.round(c[1] * 2) / 2, gebaeude: ids });
  }
  return out;
}

// Wahrzeichen aus den Rohdaten (f�r webindex.js): [{ id, name, x, z, gebaeude }]
function loadLandmarks() {
  const gebSrc = readJson('data/stadt/gebaeude.json');
  const wz = readJson('data/stadt/wahrzeichen.json');
  const byId = new Map(gebSrc.gebaeude.map((b) => [b.id, b]));
  return { landmarks: buildLandmarks(wz, byId), byId, wz };
}

// --- Gesamt ---------------------------------------------------------------------
function build() {
  const t0 = Date.now();
  const gebSrc = readJson('data/stadt/gebaeude.json');
  const fl = readJson('data/stadt/flaechen.json');
  const wz = readJson('data/stadt/wahrzeichen.json');
  const gj = readJson('data/stadt/gelaende.json');
  const byId = new Map(gebSrc.gebaeude.map((b) => [b.id, b]));

  const rivers = (fl.wasserlinien || []).map((w) => {
    const s = simplifyLine(w.linie, DP_EPS_FLAECHE);
    return { l: encodeRing(s, false), n: w.name || undefined, t: w.typ };
  }).filter((r) => r.l);

  const basis = {
    meta: {
      erzeugt: 'tools/emit/stadtbasis.js',
      grenzen: gj.grenzen,
      ringFormat: '[x0,z0,dx,dz,...] in Halbbloecken, offen',
      attribution: {
        gebaeude: 'Gebäude und Straßen: © OpenStreetMap-Mitwirkende (ODbL)',
        gelaende: 'Gelände: Comune di Firenze, DTM LiDAR 2017, CC BY 4.0'
      }
    },
    terrain: buildTerrain(),
    buildings: buildBuildings(gebSrc),
    water: polyList(fl.wasser, DP_EPS_FLAECHE),
    rivers,
    squares: polyList(fl.plaetze, DP_EPS_FLAECHE),
    green: polyList(fl.gruen, DP_EPS_FLAECHE),
    streets: polyList(fl.strassen, DP_EPS_FLAECHE),
    bridges: polyList(fl.bruecken, DP_EPS_FLAECHE),
    landmarks: buildLandmarks(wz, byId)
  };
  return { basis, ms: Date.now() - t0 };
}

function main() {
  const { basis, ms } = build();
  const outDir = path.join(ROOT, 'webapp', 'data', 'stadt');
  fs.mkdirSync(outDir, { recursive: true });
  const text = '// GENERIERT von tools/emit/stadtbasis.js - nicht von Hand ändern.\n' +
    '// Quellen: OpenStreetMap-Mitwirkende (ODbL); Comune di Firenze, DTM LiDAR 2017 (CC BY 4.0).\n' +
    'window.STADT_BASIS = ' + JSON.stringify(basis) + ';\n';
  const file = path.join(outDir, 'basis.js');
  fs.writeFileSync(file, text, 'utf8');
  const sz = (o) => Buffer.byteLength(JSON.stringify(o), 'utf8');
  console.log(`webapp/data/stadt/basis.js: ${(Buffer.byteLength(text) / 1048576).toFixed(2)} MB in ${ms} ms`);
  for (const k of ['terrain', 'buildings', 'water', 'rivers', 'squares', 'green', 'streets', 'bridges', 'landmarks']) {
    console.log(`  ${k}: ${(sz(basis[k]) / 1024).toFixed(0)} KB (${Array.isArray(basis[k]) ? basis[k].length + ' Einträge' : ''})`);
  }
  return file;
}

if (require.main === module) main();
module.exports = { build, loadLandmarks, simplifyRing, simplifyLine, encodeRing, slug, main };
