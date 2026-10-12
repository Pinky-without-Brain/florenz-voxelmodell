'use strict';
// Umgebungs-Daten für die Webapp: OSM-Gebäude ohne Kollisionen mit dem Modell, Piazza-Fläche, Straßenschilder.
// Ausgabe: webapp/js/data/v2/site.js (window.SITE_V2).

const fs = require('node:fs');
const path = require('node:path');
const { footprint } = require('../model/m0_fundament.js');

const SITE_JSON = path.join(__dirname, '..', 'spec', 'site_osm.json');
const MIN_GAP = 3; // Mindestabstand Gebäude <-> Modell in Blöcken

// Piazza-Pflaster (Vorgabe Phase 5), Blockkoordinaten
const PIAZZA_BOUNDS = { minX: -460, maxX: 330, minZ: -280, maxZ: 280 };

// NÄHERUNG: Positionen der Straßeneinmündungen (nicht aus den Gebäudelücken exakt berechnet).
const LANDMARKS = [
  { name: "Via de' Calzaiuoli", label: "Via de' Calzaiuoli ➔ (Piazza Signoria)", x: -250, z: 200 },
  { name: "Via de' Martelli", label: "Via de' Martelli ➔ (Palazzo Medici)", x: -250, z: -200 },
  { name: 'Via dei Servi', label: 'Via dei Servi ➔ (SS. Annunziata)', x: 60, z: -200 },
  { name: 'Via del Proconsolo', label: 'Via del Proconsolo ➔ (Bargello)', x: 60, z: 210 },
  { name: "Via de' Cerretani", label: "Via de' Cerretani ➔ (SM Novella)", x: -420, z: -60 },
  { name: 'Borgo San Lorenzo', label: 'Borgo San Lorenzo ➔ (San Lorenzo)', x: -380, z: -200 }
];

function pointInPoly(px, pz, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > pz) !== (zj > pz) && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

function distToSegment(px, pz, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const l2 = dx * dx + dz * dz;
  let t = l2 ? ((px - a[0]) * dx + (pz - a[1]) * dz) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (a[0] + t * dx), pz - (a[1] + t * dz));
}

// Kleinster Abstand der Zellmitte (x+0.5, z+0.5) zum Polygon; 0 wenn innen.
function distCellToPoly(x, z, poly) {
  const px = x + 0.5, pz = z + 0.5;
  if (pointInPoly(px, pz, poly)) return 0;
  let d = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) d = Math.min(d, distToSegment(px, pz, poly[j], poly[i]));
  return d;
}

// Abstand Polygon <-> Modell-Footprint (Zellen als Quadrate, daher Mitte minus 0.5; konservativ).
function gapToModel(poly) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const [x, z] of poly) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); }
  let best = Infinity;
  const m = MIN_GAP + 2;
  for (let x = Math.floor(minX) - m; x <= Math.ceil(maxX) + m; x++) {
    for (let z = Math.floor(minZ) - m; z <= Math.ceil(maxZ) + m; z++) {
      if (!footprint(x, z)) continue;
      const d = distCellToPoly(x, z, poly);
      if (d === 0) return 0;
      if (d - 0.5 < best) best = d - 0.5;
    }
  }
  return Math.max(0, best);
}

function selectBuildings(osm) {
  const kept = [], dropped = [];
  osm.buildings.forEach((b, i) => {
    const gap = gapToModel(b.polygon);
    if (gap < MIN_GAP) dropped.push({ index: i, name: b.name, gap, heightBlocks: b.heightBlocks });
    else kept.push({ name: b.name, h: b.heightBlocks, poly: b.polygon.map(([x, z]) => [x, z]) });
  });
  return { kept, dropped };
}

function emitSite({ outDir } = {}) {
  const osm = JSON.parse(fs.readFileSync(SITE_JSON, 'utf8'));
  const { kept, dropped } = selectBuildings(osm);
  const data = { buildings: kept, piazza: { bounds: PIAZZA_BOUNDS }, landmarks: LANDMARKS };
  const text =
    `// GENERIERT von tools/emit/site.js - nicht von Hand ändern.\n` +
    `// Quelle: tools/spec/site_osm.json (OpenStreetMap-Mitwirkende, ODbL). ${kept.length} von ${osm.buildings.length} Gebäuden.\n` +
    `window.SITE_V2 = ${JSON.stringify(data)};\n`;
  const dir = outDir || path.join(__dirname, '..', '..', 'webapp', 'js', 'data', 'v2');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'site.js');
  fs.writeFileSync(file, text, 'utf8');
  return { file, bytes: Buffer.byteLength(text, 'utf8'), total: osm.buildings.length, kept: kept.length, dropped };
}

module.exports = { emitSite, selectBuildings, gapToModel, MIN_GAP, PIAZZA_BOUNDS, LANDMARKS };
