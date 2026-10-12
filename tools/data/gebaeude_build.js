'use strict';
// Gebäudeaufbereitung: OSM (Ways + Relationen) → Gebäudeliste im Modellsystem.
const g2 = require('./geom2d.js');
const gel = require('../geo/gelaende.js');

// --- Regeln für Höhen --------------------------------------------------------
// Herleitung: 1 Geschoss ≈ 3,4 m Rohbauhöhe; +1,5 m für Dachaufbau/Traufe. 1 Block = 0,5 m.
const M_PER_LEVEL = 3.4;
const ROOF_M = 1.5;
const DEFAULT_LEVELS = 4;          // Fallback ohne Nachbarn
const NEIGHBOR_R = 40;             // Blöcke, Schwerpunktabstand
const BLOCKS_PER_M = 2;
// Kleinbauten (Schuppen, Garagen, Kioske) bekommen 1 Geschoss statt der Nachbarschätzung.
const SMALL_TYPES = new Set(['shed', 'garage', 'garages', 'carport', 'roof', 'kiosk', 'hut', 'cabin', 'service', 'toilets', 'greenhouse', 'container', 'static_caravan']);

const KEEP = [
  'building', 'building:levels', 'building:min_level', 'height', 'min_height', 'heritage', 'historic', 'amenity', 'shop',
  'tourism', 'wikidata', 'wikipedia', 'religion', 'denomination', 'man_made', 'tower:type', 'alt_name', 'name:it', 'name:en'
];
function pickTags(tags) {
  const o = {};
  for (const k of Object.keys(tags).sort()) {
    if (KEEP.includes(k) || k.startsWith('roof:') || k.startsWith('addr:') || k.startsWith('heritage:')) o[k] = tags[k];
  }
  return o;
}

function parseHeightM(v) {
  if (v == null) return null;
  const m = /^\s*(\d+(?:[.,]\d+)?)\s*(m|meter)?\s*$/i.exec(String(v));
  if (!m) return null;
  const x = Number(m[1].replace(',', '.'));
  return x > 0 && x < 400 ? x : null;
}
function parseLevels(v) {
  if (v == null) return null;
  const nums = String(v).match(/\d+/g);
  if (!nums) return null;
  const x = Math.max(...nums.map(Number));
  return x > 0 && x < 80 ? x : null;
}
const levelsToBl = (l) => Math.round((l * M_PER_LEVEL + ROOF_M) * BLOCKS_PER_M);

function medianOf(a) {
  const s = a.slice().sort((p, q) => p - q);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

// Alle namensartigen Tags (für die Wahrzeichensuche; wird nicht gespeichert).
function nameTexts(t) {
  const o = [];
  for (const k of Object.keys(t).sort()) if (k === 'name' || k === 'alt_name' || k === 'old_name' || k === 'official_name' || k === 'short_name' || k.startsWith('name:') || k === 'wikipedia' || k === 'description') o.push(String(t[k]));
  return o;
}

function polyFromWay(el) {
  if (!el.geometry) return null;
  const r = g2.cleanRing(g2.toModel(el.geometry));
  return r ? { aussen: [g2.orient(r, true)], loecher: [] } : null;
}

/** Eingabe: gebaeude (Overpass-JSON), relationen (Overpass-JSON mit Mitgliedern). */
function buildBuildings(gebaeudeJson, relationenJson, korrekturen) {
  const stats = { wayGebaeude: 0, relGebaeude: 0, relOhneGeometrie: 0, relOffeneRinge: 0, doppelteWays: 0, entartet: 0, teile: 0, teileOhneGebaeude: 0 };
  const relById = new Map();
  for (const e of (relationenJson ? relationenJson.elements : [])) if (e.type === 'relation') relById.set(e.id, e);
  // Way-IDs, die Mitglied einer Gebäude-Relation sind
  const memberWays = new Set();
  for (const r of relById.values()) for (const m of r.members || []) if (m.type === 'way') memberWays.add(m.ref);

  const out = [];
  const parts = [];
  for (const el of gebaeudeJson.elements) {
    const t = el.tags || {};
    if (el.type === 'way') {
      if (t.building) {
        if (memberWays.has(el.id)) { stats.doppelteWays++; continue; }
        const poly = polyFromWay(el);
        if (!poly) { stats.entartet++; continue; }
        stats.wayGebaeude++;
        out.push({ osm: { typ: 'way', id: el.id }, tags: t, polys: [poly] });
      } else if (t['building:part']) {
        const poly = polyFromWay(el);
        if (!poly) { stats.entartet++; continue; }
        parts.push({ osm: { typ: 'way', id: el.id }, tags: t, poly });
      }
    }
  }
  // Relationen: aus der Nachladung (mit Geometrie); Tags aus der Nachladung
  for (const r of relById.values()) {
    if (!r.tags || !r.tags.building) continue;
    if (!r.members || !r.members.some((m) => m.geometry)) { stats.relOhneGeometrie++; continue; }
    const mp = g2.assembleMultipolygon(r.members);
    stats.relOffeneRinge += mp.offen;
    if (!mp.polys.length) { stats.entartet++; continue; }
    stats.relGebaeude++;
    out.push({ osm: { typ: 'relation', id: r.id }, tags: r.tags, polys: mp.polys });
  }

  const buildings = out.map((b) => {
    const aussen = [], loecher = [];
    for (const p of b.polys) { aussen.push(...p.aussen); loecher.push(...p.loecher); }
    const poly = { aussen, loecher };
    let area = 0;
    for (const p of b.polys) area += g2.polyArea(p);
    const bb = g2.bbox(aussen);
    const c = g2.centroidRing(aussen.slice().sort((p, q) => Math.abs(g2.signedArea(q)) - Math.abs(g2.signedArea(p)))[0]);
    return {
      id: (b.osm.typ === 'way' ? 'w' : 'r') + b.osm.id,
      osm: b.osm,
      name: b.tags.name || null,
      tags: pickTags(b.tags),
      polygon: { aussen, loecher },
      flaecheBl: Math.round(area * 4) / 4,
      _bb: bb, _c: c, _t: b.tags, _poly: poly
    };
  });
  buildings.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  // Höhen
  const known = []; // benannte Gebäude mit gemessener/Geschoss-Höhe
  for (const b of buildings) {
    const h = parseHeightM(b._t.height);
    const lv = parseLevels(b._t['building:levels']);
    if (h != null) { b.hoeheBl = Math.max(2, Math.round(h * BLOCKS_PER_M)); b.hoeheQuelle = 'height'; }
    else if (lv != null) { b.hoeheBl = levelsToBl(lv); b.hoeheQuelle = 'levels'; }
    if (b.hoeheQuelle && b.name) known.push(b);
  }
  const CELL = NEIGHBOR_R;
  const grid = new Map();
  const ck = (cx, cz) => cx * 100003 + cz;
  for (const k of known) {
    const key = ck(Math.floor(k._c[0] / CELL), Math.floor(k._c[1] / CELL));
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(k);
  }
  for (const b of buildings) {
    if (b.hoeheQuelle) continue;
    b.hoeheQuelle = 'schaetzung';
    if (SMALL_TYPES.has(b._t.building)) { b.hoeheBl = levelsToBl(1); continue; }
    const cx = Math.floor(b._c[0] / CELL), cz = Math.floor(b._c[1] / CELL);
    const hs = [];
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      for (const k of grid.get(ck(cx + dx, cz + dz)) || []) {
        if (Math.hypot(k._c[0] - b._c[0], k._c[1] - b._c[1]) <= NEIGHBOR_R) hs.push(k.hoeheBl);
      }
    }
    b.hoeheBl = hs.length ? Math.round(medianOf(hs)) : levelsToBl(DEFAULT_LEVELS);
    b.schaetzungAus = hs.length ? 'nachbarn' : 'standard';
  }

  // Höhenkorrekturen (data/stadt/korrekturen.json) nach der Schätzung: dokumentierte Höhe ersetzt Wert und Quelle.
  const kor = (korrekturen && korrekturen.hoehen) || {};
  const byId = new Map(buildings.map((b) => [b.id, b]));
  for (const id of Object.keys(kor).sort()) {
    const b = byId.get(id), k = kor[id];
    if (!b) throw new Error(`korrekturen.json: unbekanntes Gebäude ${id}`);
    if (!(k.hoeheBl >= 2 && k.hoeheBl < 800) || !k.quelle) throw new Error(`korrekturen.json: ungültiger Eintrag ${id}`);
    b.hoeheBl = k.hoeheBl; b.hoeheQuelle = 'korrektur'; b.korrekturQuelle = k.quelle;
    delete b.schaetzungAus;
    stats.korrekturen = (stats.korrekturen || 0) + 1;
  }

  // Teile zuordnen (Schwerpunkt im Gebäude, kleinstes Gebäude gewinnt)
  const gridB = new Map();
  const BC = 64;
  buildings.forEach((b, i) => {
    for (let cx = Math.floor(b._bb.x0 / BC); cx <= Math.floor(b._bb.x1 / BC); cx++) {
      for (let cz = Math.floor(b._bb.z0 / BC); cz <= Math.floor(b._bb.z1 / BC); cz++) {
        const key = ck(cx, cz);
        if (!gridB.has(key)) gridB.set(key, []);
        gridB.get(key).push(i);
      }
    }
  });
  const verwaist = [];
  for (const p of parts) {
    stats.teile++;
    const c = g2.centroidRing(p.poly.aussen[0]);
    let best = null;
    for (const i of gridB.get(ck(Math.floor(c[0] / BC), Math.floor(c[1] / BC))) || []) {
      const b = buildings[i];
      if (g2.pointInPoly(c[0], c[1], b._poly) || g2.pointInPoly(p.poly.aussen[0][0][0], p.poly.aussen[0][0][1], b._poly)) {
        if (!best || b.flaecheBl < best.flaecheBl) best = b;
      }
    }
    const h = parseHeightM(p.tags.height);
    const lv = parseLevels(p.tags['building:levels']);
    const teil = {
      osm: p.osm,
      tags: Object.fromEntries(Object.keys(p.tags).sort().filter((k) => k === 'building:part' || k === 'height' || k === 'min_height' ||
        k === 'building:levels' || k === 'building:min_level' || k.startsWith('roof:') || k === 'name' || k === 'building:colour' || k === 'building:material').map((k) => [k, p.tags[k]])),
      polygon: p.poly,
      flaecheBl: Math.round(g2.polyArea(p.poly) * 4) / 4,
      hoeheBl: h != null ? Math.round(h * BLOCKS_PER_M) : lv != null ? levelsToBl(lv) : null
    };
    if (best) (best.teile = best.teile || []).push(teil);
    else { stats.teileOhneGebaeude++; verwaist.push(teil); }
  }

  // Bodenhöhe
  for (const b of buildings) {
    const ys = [];
    for (const p of [b._poly]) g2.scanPoly(p, (z, xa, xb) => { for (let x = xa; x < xb; x++) ys.push(gel.groundTopY(x, z)); });
    if (!ys.length) ys.push(gel.groundTopY(b._c[0], b._c[1]));
    ys.sort((p, q) => p - q);
    b.bodenY = ys[ys.length >> 1];
  }

  // Ausgabeform, Schlüsselreihenfolge fest
  const result = buildings.map((b) => {
    const o = {
      id: b.id, osm: b.osm, name: b.name, tags: b.tags, polygon: b.polygon, flaecheBl: b.flaecheBl,
      hoeheBl: b.hoeheBl, hoeheQuelle: b.hoeheQuelle
    };
    if (b.korrekturQuelle) o.korrekturQuelle = b.korrekturQuelle;
    if (b.schaetzungAus) o.schaetzungAus = b.schaetzungAus;
    o.bodenY = b.bodenY;
    o.isolato = null;
    o.teile = b.teile || [];
    o._c = b._c; o._bb = b._bb;
    o._names = nameTexts(b._t).concat((b.teile || []).map((t) => t.tags.name || '').filter(Boolean));
    return o;
  });
  return { buildings: result, verwaisteTeile: verwaist, stats };
}

module.exports = { buildBuildings, parseHeightM, parseLevels, levelsToBl, M_PER_LEVEL, ROOF_M, DEFAULT_LEVELS, NEIGHBOR_R };
