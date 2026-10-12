'use strict';
// Projektübergreifende Prüfung (V3, ARCHITEKTUR §10): Zellen dürfen nur einem Projekt gehören.
// Speicherschonend: Von jedem Projekt bleibt nur ein 2D-Belegungsraster (Säule x,z -> min/max y).
// Nur dort, wo sich Säulen zweier Projekte im y-Bereich überschneiden, wird die Welt erneut gebaut
// und zellweise geprüft.

const { buildWorld } = require('../model/world.js');
const { loadRegistry } = require('../projects.js');
const { Z_MIN, X_MIN, unpackKey } = require('../geom/grid.js');

const Y_SPAN = 512;
const Z_SPAN = 8192;
const MAX_EXAMPLES = 10;

// Säulenschlüssel = Zellschlüssel ohne y: (x + 4096) * 8192 + (z + 4096)
const colOf = (key) => Math.floor(key / Y_SPAN);
const colX = (col) => Math.floor(col / Z_SPAN) + X_MIN;
const colZ = (col) => (col % Z_SPAN) + Z_MIN;

// Rasterkarte eines Projekts: Map Säule -> minY * 512 + maxY, dazu Umriss
function scanColumns(grid) {
  const cols = new Map();
  const box = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
  grid.forEachKey((key) => {
    const y = key % Y_SPAN;
    const col = (key - y) / Y_SPAN;
    const v = cols.get(col);
    if (v === undefined) {
      cols.set(col, y * Y_SPAN + y);
      const x = colX(col), z = colZ(col);
      if (x < box.minX) box.minX = x; if (x > box.maxX) box.maxX = x;
      if (z < box.minZ) box.minZ = z; if (z > box.maxZ) box.maxZ = z;
    } else {
      const lo = Math.floor(v / Y_SPAN), hi = v % Y_SPAN;
      if (y < lo) cols.set(col, y * Y_SPAN + hi);
      else if (y > hi) cols.set(col, lo * Y_SPAN + y);
    }
  });
  return { cols, box };
}

const boxesOverlap = (a, b) => a.minX <= b.maxX && b.minX <= a.maxX && a.minZ <= b.maxZ && b.minZ <= a.maxZ;

function yOverlap(va, vb) {
  const aLo = Math.floor(va / Y_SPAN), aHi = va % Y_SPAN, bLo = Math.floor(vb / Y_SPAN), bHi = vb % Y_SPAN;
  return Math.max(aLo, bLo) <= Math.min(aHi, bHi);
}

function buildGrid(project, errors) {
  const world = buildWorld({ project });
  for (const e of world.errors) errors.push(`Projekt ${project.id}: ${e.message}`);
  return world.grid;
}

const fmtCell = (key) => {
  const y = key % Y_SPAN, col = (key - y) / Y_SPAN;
  return `(${colX(col)},${y},${colZ(col)})`;
};

/**
 * checkCrossProject(projectIds, { root?, projectsRoot?, log? })
 * projectIds: Liste oder null (alle registrierten Projekte).
 * -> { projects, pairs: [{ a, b, columns, conflicts, examples }], columnOverlaps, conflicts, errors, warnings, ms }
 * Ein 3D-Konflikt (dieselbe Zelle in zwei Projekten) ist ein Fehler; eine Säule mit überlappendem y-Bereich
 * ohne Zellkonflikt (z. B. Brücke über Straße) ist eine Warnung.
 */
function checkCrossProject(projectIds, opts = {}) {
  const t0 = process.hrtime.bigint();
  const log = opts.log || (() => {});
  const reg = loadRegistry(opts);
  const errors = reg.problems.map((p) => `Projekt-Registry: ${p}`);
  const warnings = [];
  const ids = projectIds && projectIds.length ? projectIds : reg.projects.map((p) => p.id);
  const projects = ids.map((id) => {
    const p = reg.projects.find((q) => q.id === id);
    if (!p) throw new Error(`Unbekanntes Projekt "${id}" (bekannt: ${reg.projects.map((q) => q.id).join(', ')})`);
    return p;
  });

  // 1) Raster je Projekt, Grid wird sofort verworfen
  const maps = new Map();
  for (const p of projects) {
    const grid = buildGrid(p, errors);
    const sc = scanColumns(grid);
    maps.set(p.id, sc);
    log(`  ${p.id}: ${grid.size} Zellen, ${sc.cols.size} Säulen`);
  }

  // 2) Säulen mit überlappendem y-Bereich je Paar
  const pairs = [];
  const need = new Map(projects.map((p) => [p.id, new Set()])); // Säulen, die zellweise zu prüfen sind
  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const A = projects[i], B = projects[j];
      const ma = maps.get(A.id), mb = maps.get(B.id);
      const pair = { a: A.id, b: B.id, columns: 0, conflicts: 0, examples: [] };
      pairs.push(pair);
      if (!ma.cols.size || !mb.cols.size || !boxesOverlap(ma.box, mb.box)) continue;
      const [small, large] = ma.cols.size <= mb.cols.size ? [ma.cols, mb.cols] : [mb.cols, ma.cols];
      for (const [col, v] of small) {
        const w = large.get(col);
        if (w !== undefined && yOverlap(v, w)) {
          pair.columns++;
          need.get(A.id).add(col);
          need.get(B.id).add(col);
        }
      }
    }
  }

  // 3) Zellweise Prüfung nur auf den betroffenen Säulen
  const cells = new Map(); // Projekt -> Map Zellschlüssel -> "Modul/Bauteil"
  for (const p of projects) {
    const cols = need.get(p.id);
    if (!cols.size) continue;
    const grid = buildGrid(p, errors);
    const m = new Map();
    grid.forEachKey((key) => {
      if (cols.has(colOf(key))) {
        const c = unpackKey(key);
        const e = grid.get(c.x, c.y, c.z);
        m.set(key, `${e.module}/${e.part}`);
      }
    });
    cells.set(p.id, m);
  }
  let columnOverlaps = 0, conflicts = 0;
  for (const pair of pairs) {
    columnOverlaps += pair.columns;
    if (!pair.columns) continue;
    const ca = cells.get(pair.a), cb = cells.get(pair.b);
    const [small, large, swap] = ca.size <= cb.size ? [ca, cb, false] : [cb, ca, true];
    for (const [key, tag] of small) {
      const other = large.get(key);
      if (other === undefined) continue;
      pair.conflicts++;
      if (pair.examples.length < MAX_EXAMPLES) {
        pair.examples.push({ cell: fmtCell(key), [pair.a]: swap ? other : tag, [pair.b]: swap ? tag : other });
      }
    }
    conflicts += pair.conflicts;
    if (pair.conflicts) {
      const ex = pair.examples.map((e) => `${e.cell} ${pair.a}:${e[pair.a]} / ${pair.b}:${e[pair.b]}`).join('; ');
      errors.push(`X Projekte ${pair.a} und ${pair.b}: ${pair.conflicts} Zellen doppelt belegt, z. B. ${ex}`);
    } else {
      warnings.push(`X Projekte ${pair.a} und ${pair.b}: ${pair.columns} Säulen mit überlappendem y-Bereich, aber ohne Zellkonflikt`);
    }
  }
  return { projects: ids, pairs, columnOverlaps, conflicts, errors, warnings,
    ms: Number(process.hrtime.bigint() - t0) / 1e6 };
}

module.exports = { checkCrossProject, scanColumns };
