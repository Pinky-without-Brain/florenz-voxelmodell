'use strict';
// Planer: Bauteile -> Bauschritte (ARCHITEKTUR §4).

const MAX_STEP = 2500;   // hart
const TARGET_MAX = 2100; // Ziel-Obergrenze
const MIN_STEP = 300;    // weich
const SLACK = 1.15;      // erlaubte Überschreitung des Zielwerts je Schnitt
const TEXT_FIELDS = ['description', 'tip', 'caution', 'fact'];

// Sortierschlüssel (y, x, z) als Zahl: y·2^20 + (x+512)·1024 + (z+512)
function sortKeyOf(key) {
  const y = key & 511;
  const z = (key >> 9) & 1023;
  const x = key >> 19;
  return y * 1048576 + x * 1024 + z;
}
function keyOfSort(sk) {
  const z = sk % 1024;
  const x = Math.floor(sk / 1024) % 1024;
  const y = Math.floor(sk / 1048576);
  return (x * 1024 + z) * 512 + y;
}

function sortedKeys(keys) {
  const a = new Float64Array(keys.length);
  for (let i = 0; i < keys.length; i++) a[i] = sortKeyOf(keys[i]);
  a.sort();
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = keyOfSort(a[i]);
  return out;
}

const yOf = (k) => k & 511;
const xOf = (k) => (k >> 19) - 512;

// Teilt ein Bauteil (sortierte Schlüssel) in Stücke: Array von Schlüssel-Arrays
function splitPart(keys) {
  const total = keys.length;
  if (total <= TARGET_MAX) return [keys];
  const n = Math.ceil(total / TARGET_MAX);
  const limit = Math.min(TARGET_MAX, SLACK * (total / n));
  const pieces = [];
  let cur = [];
  const flush = () => { if (cur.length) { pieces.push(cur); cur = []; } };

  let i = 0;
  while (i < total) {
    const y = yOf(keys[i]);
    let j = i;
    while (j < total && yOf(keys[j]) === y) j++;
    const len = j - i;
    if (len > TARGET_MAX) {
      // einzelne Lage zu groß: nach X-Bereichen teilen
      flush();
      const m = Math.ceil(len / TARGET_MAX);
      const lim = Math.min(TARGET_MAX, SLACK * (len / m));
      let k = i;
      while (k < j) {
        let e = k;
        let last = k;
        // ganze X-Spalten sammeln
        while (e < j) {
          const x = xOf(keys[e]);
          let f = e;
          while (f < j && xOf(keys[f]) === x) f++;
          if (e > k && f - k > lim) break;
          e = f;
          last = f;
        }
        pieces.push(keys.slice(k, last));
        k = last;
      }
    } else {
      if (cur.length && cur.length + len > limit) flush();
      for (let k = i; k < j; k++) cur.push(keys[k]);
    }
    i = j;
  }
  flush();
  return pieces;
}

function bboxOf(cells) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const k of cells) {
    const y = k & 511, z = ((k >> 9) & 1023) - 512, x = (k >> 19) - 512;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
    if (z < z0) z0 = z; if (z > z1) z1 = z;
  }
  return { x0, x1, y0, y1, z0, z1 };
}

function cameraFor(b) {
  const target = [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2, (b.z0 + b.z1) / 2];
  const ext = Math.max(b.x1 - b.x0 + 1, b.y1 - b.y0 + 1, b.z1 - b.z0 + 1);
  const d = ext * 1.2 + 30;
  const eye = [target[0] + 0.8 * d, target[1] + 0.6 * d, target[2] + 0.8 * d].map((v) => Math.round(v * 10) / 10);
  return { eye, target };
}

function partTitle(seg) {
  const t = seg.baseTitle;
  return seg.n > 1 ? `${t} – Teil ${seg.i}/${seg.n} (Y ${seg.y0}–${seg.y1})` : t;
}

// Titel eines (ggf. zusammengelegten) Schritts
function titleOf(segs) {
  const groups = [];
  for (const s of segs) {
    const g = groups[groups.length - 1];
    if (g && g.partId === s.partId) g.items.push(s); else groups.push({ partId: s.partId, items: [s] });
  }
  return groups.map((g) => {
    const f = g.items[0];
    if (g.items.length === 1) return partTitle(f);
    const l = g.items[g.items.length - 1];
    if (f.n === g.items.length) return f.baseTitle;
    const y0 = Math.min(...g.items.map((s) => s.y0)), y1 = Math.max(...g.items.map((s) => s.y1));
    return `${f.baseTitle} – Teil ${f.i}-${l.i}/${f.n} (Y ${y0}–${y1})`;
  }).join(' & ');
}

/**
 * planModule(moduleBuild, content, grid) -> Array von Schritten.
 * Am Array hängt die nicht aufzählbare Eigenschaft `warnings` (Array von Texten).
 */
function planModule(moduleBuild, content, grid) {
  const warnings = [];
  const n = moduleBuild.module;
  const cparts = (content && content.parts) || {};
  if (!content) warnings.push(`Modul ${n}: kein Content, Titel = Bauteil-ID, Texte leer`);

  // 1) Segmente je Bauteil
  let segs = [];
  for (const part of moduleBuild.parts) {
    if (!part.keys.length) {
      warnings.push(`Modul ${n}: Bauteil ${part.id} ist leer`);
      continue;
    }
    const c = cparts[part.id] || {};
    if (content) {
      const missing = [];
      if (!c.title) missing.push('title');
      for (const f of TEXT_FIELDS) if (!c[f]) missing.push(f);
      if (missing.length) warnings.push(`Modul ${n}, Bauteil ${part.id}: Content fehlt (${missing.join(', ')})`);
    }
    const pieces = splitPart(sortedKeys(part.keys));
    pieces.forEach((cells, idx) => {
      const b = bboxOf(cells);
      segs.push({ partId: part.id, baseTitle: c.title || part.id, i: idx + 1, n: pieces.length,
        y0: b.y0, y1: b.y1, cells, content: c });
    });
  }

  // 2) Zusammenlegen kleiner Schritte
  const groups = segs.map((s) => ({ segs: [s], count: s.cells.length }));
  const merged = [];
  const join = (a, b) => { a.segs.push(...b.segs); a.count += b.count; };
  for (let i = 0; i < groups.length; i++) {
    const cur = groups[i];
    while (cur.count < MIN_STEP && i + 1 < groups.length && cur.count + groups[i + 1].count <= TARGET_MAX) {
      join(cur, groups[i + 1]);
      i++;
    }
    const prev = merged[merged.length - 1];
    if (cur.count < MIN_STEP && prev && prev.count + cur.count <= TARGET_MAX) join(prev, cur);
    else merged.push(cur);
  }

  // 3) Schritt-Objekte
  const steps = merged.map((g, idx) => {
    const cells = g.segs.length === 1 ? g.segs[0].cells : [].concat(...g.segs.map((s) => s.cells));
    const b = bboxOf(cells);
    const parts = [...new Set(g.segs.map((s) => s.partId))];
    const texts = {};
    for (const f of TEXT_FIELDS) {
      const seen = [];
      for (const s of g.segs) {
        const t = s.content[f];
        if (t && !seen.includes(t)) seen.push(t);
      }
      texts[f] = seen.join(' ');
    }
    return {
      module: n, stepNumber: idx + 1, parts,
      partIndex: g.segs[0].i, partCount: g.segs[0].n,
      yRange: [b.y0, b.y1], count: cells.length,
      title: titleOf(g.segs), ...texts,
      cameraHint: cameraFor(b), cells
    };
  });
  Object.defineProperty(steps, 'warnings', { value: warnings, enumerable: false });
  return steps;
}

module.exports = { planModule, splitPart, sortedKeys, MAX_STEP, TARGET_MAX, MIN_STEP };
