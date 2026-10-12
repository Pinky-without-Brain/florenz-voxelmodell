'use strict';
// Freiflächen: Straßen, Plätze, Wasser, Grün, Brücken, Mauern aus den OSM-Ebenen.
const g2 = require('./geom2d.js');

// Breiten in Metern, wenn kein width-Tag vorliegt (1 m = 2 Blöcke).
const WIDTH_M = {
  motorway: 14, trunk: 12, primary: 12, secondary: 10, tertiary: 9, unclassified: 7, residential: 7,
  living_street: 6, service: 4, pedestrian: 8, footway: 3, path: 2, steps: 2, cycleway: 3, track: 3,
  corridor: 2, bridleway: 2, platform: 2, road: 6, primary_link: 6, secondary_link: 5, tertiary_link: 5,
  trunk_link: 6, motorway_link: 6
};
const DEFAULT_WIDTH_M = 4;
const LANE_M = 3;
const SKIP_HIGHWAY = new Set(['proposed', 'construction', 'abandoned', 'razed', 'disused', 'elevator']);
const WALL_THICK_BL = { wall: 1, city_wall: 4 };   // 0,5 m bzw. 2 m
const BLOCKS_PER_M = 2;

function parseNum(v) {
  if (v == null) return null;
  const m = /^\s*(\d+(?:[.,]\d+)?)/.exec(String(v));
  return m ? Number(m[1].replace(',', '.')) : null;
}

function roadWidthM(tags) {
  const w = parseNum(tags.width);
  if (w && w >= 0.5 && w <= 60) return { m: w, quelle: 'width' };
  const l = parseNum(tags.lanes);
  if (l && l >= 1 && l <= 8 && tags.highway !== 'footway' && tags.highway !== 'path' && tags.highway !== 'steps') {
    return { m: l * LANE_M, quelle: 'lanes' };
  }
  return { m: WIDTH_M[tags.highway] || DEFAULT_WIDTH_M, quelle: 'typ' };
}

const idOf = (el) => (el.type === 'way' ? 'w' : 'r') + el.id;
const nameOf = (t) => t.name || null;

function cleanPoly(poly) {
  const aussen = poly.aussen.map((r) => g2.cleanRing(r)).filter(Boolean).map((r) => g2.orient(r, true));
  const loecher = poly.loecher.map((r) => g2.cleanRing(r)).filter(Boolean).map((r) => g2.orient(r, false));
  return aussen.length ? { aussen, loecher } : null;
}

/** Element → Liste von Polygonen (geschlossener Way oder Multipolygon-Relation). */
function polysOf(el, stats) {
  if (el.type === 'way') {
    if (!el.geometry || el.geometry.length < 4) return [];
    const a = el.geometry[0], b = el.geometry[el.geometry.length - 1];
    if (a.lat !== b.lat || a.lon !== b.lon) return [];
    const p = cleanPoly({ aussen: [g2.toModel(el.geometry)], loecher: [] });
    return p ? [p] : [];
  }
  if (!el.members || !el.tags || el.tags.type !== 'multipolygon') return [];
  const mp = g2.assembleMultipolygon(el.members);
  stats.offeneRinge += mp.offen;
  return mp.polys.map(cleanPoly).filter(Boolean);
}

function lineOf(el) {
  if (el.type !== 'way' || !el.geometry || el.geometry.length < 2) return null;
  return g2.toModel(el.geometry).map((p) => [g2.round05(p[0]), g2.round05(p[1])]);
}

function buffered(line, widthBl) {
  const p = g2.bufferLine(line, widthBl / 2);
  return p ? cleanPoly(p) : null;
}

function buildAreas(layers) {
  const stats = { offeneRinge: 0, strassenLinien: 0, strassenFlaechen: 0, uebersprungen: 0 };
  const out = { strassen: [], plaetze: [], wasser: [], wasserlinien: [], gruen: [], bruecken: [], mauern: [] };

  // Straßen
  for (const el of layers.strassen.elements) {
    const t = el.tags || {};
    if (t.highway && SKIP_HIGHWAY.has(t.highway)) { stats.uebersprungen++; continue; }
    const isArea = t['area:highway'] || (t.area === 'yes') || (el.type === 'relation');
    const typ = t.highway || t['area:highway'];
    if (!typ) { stats.uebersprungen++; continue; }
    const base = { id: idOf(el), typ, name: nameOf(t) };
    if (t.bridge && t.bridge !== 'no') base.bruecke = true;
    if (t.tunnel && t.tunnel !== 'no') base.tunnel = true;
    if (t.layer) base.layer = Number(t.layer) || 0;
    if (isArea) {
      const polys = polysOf(el, stats);
      if (!polys.length) { stats.uebersprungen++; continue; }
      polys.forEach((p) => { out.strassen.push({ ...base, form: 'flaeche', polygon: p }); stats.strassenFlaechen++; });
    } else {
      const line = lineOf(el);
      if (!line) { stats.uebersprungen++; continue; }
      const w = roadWidthM(t);
      const p = buffered(line, w.m * BLOCKS_PER_M);
      if (!p) { stats.uebersprungen++; continue; }
      out.strassen.push({ ...base, form: 'linie', breiteM: w.m, breiteQuelle: w.quelle, polygon: p });
      stats.strassenLinien++;
    }
  }
  // Plätze
  for (const el of layers.plaetze.elements) {
    const t = el.tags || {};
    const polys = polysOf(el, stats);
    if (!polys.length) { stats.uebersprungen++; continue; }
    polys.forEach((p) => out.plaetze.push({ id: idOf(el), typ: 'square', name: nameOf(t), polygon: p }));
  }
  // Wasser
  for (const el of layers.wasser.elements) {
    const t = el.tags || {};
    if (t.waterway === 'river' && el.type === 'way' && !t.natural) {
      const line = lineOf(el);
      if (line) out.wasserlinien.push({ id: idOf(el), typ: 'river', name: nameOf(t), linie: line });
      continue;
    }
    const polys = polysOf(el, stats);
    if (!polys.length) { stats.uebersprungen++; continue; }
    const typ = t.waterway === 'riverbank' ? 'riverbank' : (t.water || 'water');
    polys.forEach((p) => out.wasser.push({ id: idOf(el), typ, name: nameOf(t), polygon: p }));
  }
  // Grün
  for (const el of layers.gruen.elements) {
    const t = el.tags || {};
    const polys = polysOf(el, stats);
    if (!polys.length) { stats.uebersprungen++; continue; }
    const typ = t.leisure || t.landuse;
    polys.forEach((p) => out.gruen.push({ id: idOf(el), typ, name: nameOf(t), polygon: p }));
  }
  // Brücken
  for (const el of layers.bruecken.elements) {
    const t = el.tags || {};
    const base = { id: idOf(el), name: nameOf(t) };
    if (t.man_made === 'bridge') {
      const polys = polysOf(el, stats);
      polys.forEach((p) => out.bruecken.push({ ...base, typ: 'man_made_bridge', form: 'flaeche', polygon: p }));
      if (!polys.length) stats.uebersprungen++;
      continue;
    }
    const typ = t.highway || t.railway || 'bridge';
    if (t.highway && SKIP_HIGHWAY.has(t.highway)) { stats.uebersprungen++; continue; }
    const line = lineOf(el);
    if (!line) { stats.uebersprungen++; continue; }
    const w = t.highway ? roadWidthM(t) : { m: t.railway ? 5 : DEFAULT_WIDTH_M, quelle: 'typ' };
    const p = buffered(line, w.m * BLOCKS_PER_M);
    if (!p) { stats.uebersprungen++; continue; }
    const rec = { ...base, typ, form: 'linie', breiteM: w.m, polygon: p };
    if (t.layer) rec.layer = Number(t.layer) || 0;
    out.bruecken.push(rec);
  }
  // Mauern
  for (const el of layers.mauern.elements) {
    const t = el.tags || {};
    const line = lineOf(el);
    if (!line) { stats.uebersprungen++; continue; }
    const typ = t.barrier;
    const rec = { id: idOf(el), typ, name: nameOf(t), dickeBl: WALL_THICK_BL[typ] || 1, linie: line };
    const h = parseNum(t.height);
    if (h) rec.hoeheM = h;
    out.mauern.push(rec);
  }
  return { areas: out, stats };
}

module.exports = { buildAreas, roadWidthM, WIDTH_M };
