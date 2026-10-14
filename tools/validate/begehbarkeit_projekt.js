'use strict';
// Projekt-Ebene von R13/R14 (BEGEHBARKEIT.md §3): Einheiten bilden (Wahrzeichen = ganzes Projekt, Quartier = je Haus),
// Gelände, Innenbereich und deklarierte Öffnungen bereitstellen, Kennzahlen sammeln. Ergebnisse werden je ctx gecacht.

const path = require('node:path');
const { xOfKey, yOfKey, zOfKey } = require('../geom/grid.js');
const B = require('./begehbarkeit.js');

const FALLBACK_TOP = 63;
const MARGIN = 3;
const PROXY_HOEHE = 4; // Säule zählt als "überbaut", wenn über Gelände + 4 noch ein fester Block liegt

function gelaendeVon(ctx) {
  const g = ctx.ground || {};
  const top = typeof g.groundTopY === 'function' ? g.groundTopY : () => FALLBACK_TOP;
  const reserved = (ctx.interfaces && ctx.interfaces.RESERVED) || [];
  const hohl = typeof g.groundTopY === 'function' || !reserved.length ? null : (x, y, z) => reserved.some((r) => r.test(x, y, z));
  const cache = new Map();
  const topC = (x, z) => {
    const k = x * 65536 + z;
    let t = cache.get(k);
    if (t === undefined) { t = top(x, z); cache.set(k, t); }
    return t;
  };
  return { top: topC, hohl };
}

function setVon(listen) {
  const s = new Set();
  for (const l of listen || []) for (const k of l.keys) s.add(k);
  return s;
}

// Einheiten: [{ id, label, keys, alle (Projekt-Grid vollständig), grundriss: Set(x*65536+z)|null }]
function einheiten(ctx) {
  const world = ctx.world;
  const typ = ctx.project && ctx.project.type;
  const out = [];
  if (typ === 'quartier') {
    // Je Haus eine Einheit; der Innenausbau "<id>_innen" gehört zum Haus <id>
    for (const m of world.modules) {
      const jeHaus = new Map();
      for (const p of m.parts) {
        if (!p.keys.length) continue;
        const basis = p.id.endsWith('_innen') ? p.id.slice(0, -6) : p.id;
        let u = jeHaus.get(basis);
        if (!u) {
          u = { id: basis, modul: m.module, label: `Modul ${m.module}, Haus ${basis}`, keys: [], alle: false,
            grundriss: (world.grundrisse && world.grundrisse.get(`${m.module}|${basis}`)) || null };
          jeHaus.set(basis, u);
          out.push(u);
        }
        for (const k of p.keys) u.keys.push(k);
      }
    }
  } else if (typ === 'wahrzeichen' || !typ) {
    const keys = [];
    for (const m of world.modules) for (const p of m.parts) for (const k of p.keys) keys.push(k);
    if (keys.length) out.push({ id: (ctx.project && ctx.project.id) || 'projekt', label: (ctx.project && ctx.project.title) || 'Projekt', keys, alle: true, grundriss: null });
  }
  return out;
}

function maskeVon(ctx) {
  const p = ctx.project;
  const json = p && p.json;
  if (!json || json.ohneMaske === true || !Array.isArray(json.gebaeude) || p.type !== 'wahrzeichen') return null;
  try {
    const { ladeMasken } = require('../wahrzeichen/projekt.js');
    return ladeMasken(json, { dir: p.dir, root: ctx.root, projectsRoot: path.join(ctx.root, 'projects') }).alle;
  } catch (e) {
    return null;
  }
}

/** Raster und Innenfunktion einer Einheit. */
function rasterFuer(ctx, u, gel, maske) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const k of u.keys) {
    const x = xOfKey(k), y = yOfKey(k), z = zOfKey(k);
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const x0 = minX - MARGIN, x1 = maxX + MARGIN, z0 = minZ - MARGIN, z1 = maxZ + MARGIN;
  let minTop = Infinity, maxTop = -Infinity;
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
    const t = gel.top(x, z);
    if (t < minTop) minTop = t; if (t > maxTop) maxTop = t;
  }
  const y0 = Math.max(0, Math.min(minY, minTop) - 1), y1 = Math.min(511, Math.max(maxY, maxTop) + 4);
  // Ersatz für die Maske: Säulen mit festen Zellen deutlich über dem Gelände
  let proxy = null;
  if (!maske && !u.grundriss) {
    proxy = new Set();
    for (const k of u.keys) {
      const x = xOfKey(k), z = zOfKey(k);
      if (yOfKey(k) >= gel.top(x, z) + PROXY_HOEHE) proxy.add(x * 65536 + z);
    }
  }
  const innen = maske ? (x, z) => maske.innen(x, z)
    : u.grundriss ? (x, z) => u.grundriss.has(x * 65536 + z)
      : (x, z) => proxy.has(x * 65536 + z);
  const R = B.bauRaster({ x0, x1, z0, z1, y0, y1, grid: ctx.grid, gelaendeTop: gel.top, gelaendeHohl: gel.hohl,
    iteriere: u.alle ? (cb) => { for (const k of u.keys) cb(k); } : null });
  return { R, innen };
}

const prozent = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 100);

function laufe(ctx, was) {
  const cache = ctx._begehCache || (ctx._begehCache = {});
  if (cache[was]) return cache[was];
  const gel = gelaendeVon(ctx);
  const maske = maskeVon(ctx);
  const unz = setVon(ctx.world.unzugaenglich);
  const oeff = setVon(ctx.world.oeffnungen);
  const units = einheiten(ctx);
  const res = { einheiten: [] };
  if (was === 'r14') {
    for (const u of units) {
      const { R, innen } = rasterFuer(ctx, u, gel, maske);
      const d = B.pruefeDichtheit(R, { innen, oeffnungen: oeff, grid: ctx.grid });
      res.einheiten.push({ id: u.id, label: u.label, ...d, maske: !!maske });
    }
    return (cache[was] = res);
  }
  for (const u of units) {
    const { R, innen } = rasterFuer(ctx, u, gel, maske);
    const b = B.pruefeBegehbarkeit(R, { innen, unz, grid: ctx.grid, ring: 1 });
    delete b.inCol;
    res.einheiten.push({ id: u.id, label: u.label, ...b, anteil: prozent(b.erreichbar, b.innenZellen), maske: !!maske || !!u.grundriss });
  }
  return (cache[was] = res);
}

module.exports = { laufe, einheiten, prozent };
