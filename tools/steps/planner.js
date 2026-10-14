'use strict';
// Planer: Bauteile -> Bauschritte (ARCHITEKTUR §4).

const { xOfKey, yOfKey, zOfKey } = require('../geom/grid.js');

const MAX_STEP = 2500;   // hart
const TARGET_MAX = 2100; // Ziel-Obergrenze
const MIN_STEP = 300;    // weich
const TEXT_FIELDS = ['description', 'tip', 'caution', 'fact'];

// Sortierschlüssel (y, x, z) als Zahl: y·2^26 + (x+4096)·8192 + (z+4096) (< 2^35, exakt in Double)
const SORT_Y = 67108864; // 2^26 = 8192 · 8192
function sortKeyOf(key) {
  const y = yOfKey(key);
  const zr = zOfKey(key) + 4096;
  const xr = xOfKey(key) + 4096;
  return y * SORT_Y + xr * 8192 + zr;
}
function keyOfSort(sk) {
  const zr = sk % 8192;
  const xr = Math.floor(sk / 8192) % 8192;
  const y = Math.floor(sk / SORT_Y);
  return (xr * 8192 + zr) * 512 + y;
}

function sortedKeys(keys) {
  const a = new Float64Array(keys.length);
  for (let i = 0; i < keys.length; i++) a[i] = sortKeyOf(keys[i]);
  a.sort();
  const out = new Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = keyOfSort(a[i]);
  return out;
}

const yOf = yOfKey;
const xOf = xOfKey;

// Ausgewogenes Teilen: Einheiten (Lagen bzw. Spalten) mit Größen -> Schnittindizes.
// n = ceil(total / 2100), Ziel t = total / n; geschnitten wird dort, wo die kumulierte Summe dem
// nächsten k·t am nächsten liegt, ohne 2.100 je Stück zu überschreiten. Scheitert das, wird n erhöht.
function balanceCuts(sizes) {
  const len = sizes.length;
  const cum = new Array(len + 1);
  cum[0] = 0;
  for (let i = 0; i < len; i++) cum[i + 1] = cum[i] + sizes[i];
  const total = cum[len];
  for (let n = Math.max(2, Math.ceil(total / TARGET_MAX)); n <= len; n++) {
    const t = total / n;
    const cuts = [0];
    let ok = true;
    for (let k = 1; k < n && ok; k++) {
      const prev = cuts[cuts.length - 1];
      let best = -1, bestDiff = Infinity;
      for (let j = prev + 1; j < len && cum[j] - cum[prev] <= TARGET_MAX; j++) {
        const d = Math.abs(cum[j] - k * t);
        if (d < bestDiff) { bestDiff = d; best = j; }
      }
      if (best < 0) ok = false; else cuts.push(best);
    }
    if (ok && total - cum[cuts[cuts.length - 1]] <= TARGET_MAX) {
      cuts.push(len);
      return cuts;
    }
  }
  return null;
}

// Gleichmäßige Teilung eines Bereichs [a, b) nach Zellen in m Stücke: Grenzen
function evenBounds(a, b, m) {
  const out = [];
  for (let i = 0; i <= m; i++) out.push(a + Math.round(((b - a) * i) / m));
  return out;
}

// Einheiten (Spalten) einer Lage [a, b): je X-Spalte eine Einheit; Spalten > 2.100 werden nach Z geteilt
function splitLayer(keys, a, b) {
  const len = b - a;
  const minN = Math.ceil(len / TARGET_MAX);
  const cols = [];
  let i = a;
  while (i < b) {
    const x = xOf(keys[i]);
    let j = i;
    while (j < b && xOf(keys[j]) === x) j++;
    if (j - i > TARGET_MAX) {
      const bd = evenBounds(i, j, Math.ceil((j - i) / TARGET_MAX));
      for (let q = 0; q < bd.length - 1; q++) cols.push([bd[q], bd[q + 1]]);
    } else cols.push([i, j]);
    i = j;
  }
  const cuts = balanceCuts(cols.map((c) => c[1] - c[0]));
  if (cuts && cuts.length - 1 <= minN) {
    const out = [];
    for (let q = 0; q < cuts.length - 1; q++) out.push([cols[cuts[q]][0], cols[cuts[q + 1] - 1][1]]);
    return out;
  }
  // Mit ganzen Spalten nicht ohne Zusatzschritt möglich: Schnitt mitten durch eine Spalte (nach Z)
  const bd = evenBounds(a, b, minN);
  const out = [];
  for (let q = 0; q < minN; q++) out.push([bd[q], bd[q + 1]]);
  return out;
}

// Teilt ein Bauteil (sortierte Schlüssel) in Stücke: Array von Schlüssel-Arrays
function splitPart(keys) {
  const total = keys.length;
  if (total <= TARGET_MAX) return [keys];
  const units = []; // [a, b) in Sortierreihenfolge: ganze Lagen bzw. Teile einer zu großen Lage
  let i = 0;
  while (i < total) {
    const y = yOf(keys[i]);
    let j = i;
    while (j < total && yOf(keys[j]) === y) j++;
    if (j - i > TARGET_MAX) units.push(...splitLayer(keys, i, j)); else units.push([i, j]);
    i = j;
  }
  const cuts = balanceCuts(units.map((u) => u[1] - u[0]));
  if (!cuts) return units.map((u) => keys.slice(u[0], u[1]));
  const pieces = [];
  for (let q = 0; q < cuts.length - 1; q++) pieces.push(keys.slice(units[cuts[q]][0], units[cuts[q + 1] - 1][1]));
  return pieces;
}

function bboxOf(cells) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const k of cells) {
    const y = yOfKey(k), z = zOfKey(k), x = xOfKey(k);
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
// Halt wie R3 (Flächenkontakt zu früher Gesetztem oder Gelände, im Schritt zusammenhängend): Zellen eines Stücks ohne
// Halt rücken ins nächste Stück desselben Bauteils (z. B. ein Gesims, dessen Wand bei spaltenweise geteilten Lagen erst
// im folgenden Stück liegt). Nur mit Bodenprovider (opts.ground); gültige Bauteile bleiben unverändert.
const N6 = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
function stueckeMitHalt(pieces, frueher, ground) {
  for (let i = 0; i + 1 < pieces.length; i++) {
    const S = new Set(pieces[i]);
    const ok = new Set();
    const stack = [];
    for (const k of pieces[i]) {
      const x = xOf(k), y = yOf(k), z = zOfKey(k);
      let h = ground.hasGroundContact(x, y, z);
      if (!h) for (const [dx, dy, dz] of N6) { if (frueher(x + dx, y + dy, z + dz)) { h = true; break; } }
      if (h) { ok.add(k); stack.push(k); }
    }
    while (stack.length) {
      const k = stack.pop();
      const x = xOf(k), y = yOf(k), z = zOfKey(k);
      for (const [dx, dy, dz] of N6) {
        const nk = ((x + dx + 4096) * 8192 + (z + dz + 4096)) * 512 + (y + dy);
        if (S.has(nk) && !ok.has(nk)) { ok.add(nk); stack.push(nk); }
      }
    }
    if (ok.size === S.size) { for (const k of pieces[i]) frueher.add(k); continue; }
    const bleibt = pieces[i].filter((k) => ok.has(k));
    const weiter = pieces[i].filter((k) => !ok.has(k));
    pieces[i] = bleibt;
    pieces[i + 1] = sortedKeys([...weiter, ...pieces[i + 1]]);
    for (const k of bleibt) frueher.add(k);
  }
  for (const k of pieces[pieces.length - 1]) frueher.add(k);
  return pieces.filter((p) => p.length);
}

/**
 * Letzte Sicherung für R3 auf Schrittebene: Zellen, die in ihrem Schritt keinen Halt haben (weder Boden noch Nachbar
 * aus früheren Schritten/Modulen oder zusammenhängend im selben Schritt), rücken in den ersten späteren Schritt, in
 * dem sie Halt finden (z. B. ein Hausrest, der nur auf dem später gebauten Nachbarhaus aufliegt). Passt der Schritt
 * nicht mehr unter MAX_STEP, folgt ein eigener Nachtragsschritt. Ohne solche Zellen bleiben die Schritte unverändert.
 */
function schritteMitHalt(steps, frueherModul, ground, mkStep) {
  const key = (x, y, z) => ((x + 4096) * 8192 + (z + 4096)) * 512 + y;
  const gesetzt = new Set();
  const frueher = (x, y, z) => gesetzt.has(key(x, y, z)) || frueherModul(x, y, z);
  const halt = (cells) => {
    const S = new Set(cells);
    const ok = new Set();
    const stack = [];
    for (const k of cells) {
      const x = xOf(k), y = yOf(k), z = zOfKey(k);
      let h = ground.hasGroundContact(x, y, z);
      if (!h) for (const [dx, dy, dz] of N6) { if (frueher(x + dx, y + dy, z + dz)) { h = true; break; } }
      if (h) { ok.add(k); stack.push(k); }
    }
    while (stack.length) {
      const k = stack.pop();
      const x = xOf(k), y = yOf(k), z = zOfKey(k);
      for (const [dx, dy, dz] of N6) {
        const nk = key(x + dx, y + dy, z + dz);
        if (S.has(nk) && !ok.has(nk)) { ok.add(nk); stack.push(nk); }
      }
    }
    return ok;
  };
  // Prüfung ohne Änderung: alle Schritte haben Halt -> unverändert zurück
  let alleOk = true;
  for (const st of steps) {
    const ok = halt(st.cells);
    for (const k of st.cells) gesetzt.add(k);
    if (ok.size !== st.cells.length) { alleOk = false; break; }
  }
  if (alleOk) return steps;
  gesetzt.clear();
  const out = [];
  let offen = [];
  for (const st of steps) {
    const ok = halt(offen.length ? st.cells.concat(offen) : st.cells);
    const eigen = st.cells.filter((k) => ok.has(k));
    const nach = offen.filter((k) => ok.has(k));
    offen = offen.filter((k) => !ok.has(k)).concat(st.cells.filter((k) => !ok.has(k)));
    if (nach.length && eigen.length + nach.length > MAX_STEP) {
      if (eigen.length) out.push(mkStep(st, sortedKeys(eigen)));
      out.push(mkStep(st, sortedKeys(nach)));
    } else if (eigen.length || nach.length) out.push(mkStep(st, sortedKeys(eigen.concat(nach))));
    for (const k of eigen) gesetzt.add(k);
    for (const k of nach) gesetzt.add(k);
  }
  if (offen.length) { const last = out.pop(); out.push(mkStep(last, sortedKeys(last.cells.concat(offen)))); }
  out.forEach((st, i) => { st.stepNumber = i + 1; });
  return out;
}

function planModule(moduleBuild, content, grid, opts = {}) {
  const warnings = [];
  const n = moduleBuild.module;
  // früher Gesetztes: frühere Module (Grid) und frühere Bauteile/Stücke dieses Moduls
  const frueherSet = new Set();
  const frueherFn = Object.assign((x, y, z) => {
    if (frueherSet.has(((x + 4096) * 8192 + (z + 4096)) * 512 + y)) return true;
    const e = grid && grid.get ? grid.get(x, y, z) : null;
    return !!(e && e.module < n);
  }, { add: (k) => frueherSet.add(k) });
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
    let pieces = splitPart(sortedKeys(part.keys));
    if (opts.ground && pieces.length > 1) pieces = stueckeMitHalt(pieces, frueherFn, opts.ground);
    else if (opts.ground) for (const k of pieces[0]) frueherSet.add(k);
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
  const fertig = opts.ground ? schritteMitHalt(steps, (x, y, z) => {
    const e = grid && grid.get ? grid.get(x, y, z) : null;
    return !!(e && e.module < n);
  }, opts.ground, (st, cells) => {
    const b = bboxOf(cells);
    return { ...st, yRange: [b.y0, b.y1], count: cells.length, cameraHint: cameraFor(b), cells };
  }) : steps;
  Object.defineProperty(fertig, 'warnings', { value: warnings, enumerable: false });
  return fertig;
}

module.exports = { planModule, splitPart, sortedKeys, MAX_STEP, TARGET_MAX, MIN_STEP };
