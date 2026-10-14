'use strict';
// Gemeinsamer Kern von R13 (Begehbarkeit) und R14 (Dichtheit), BEGEHBARKEIT.md §3.
//
// Zellklassen im Raster (Uint8): 0 Luft, 1 fest (Vollblock, umgedrehte Treppe, Gelände), 2 Treppenblock (Bits 3-4 = Aufstiegsrichtung
// n,o,s,w = 0..3), 3 Flüssigkeit (Wasser: nicht begehbar, nicht fest). Index i = (xi * Zn + zi) * Yn + yi (y läuft am schnellsten).
//
// Stehbare Zelle: Luft an y, y+1, y+2 und fester Block (Klasse 1 oder 2) an y-1.
// Schritte (4er-Nachbarschaft): gleiche Höhe; +1 nur mit Sprung (Luft an y+3 der Startzelle) außer das Ziel steht auf einem
// Treppenblock, den man nicht von der hohen Seite her betritt (dann frei); -1 bis -3 (Fallen, Luft entlang der Fallspalte).
//
// Dichtheit: Luftflut von außen (Luft außerhalb der Maske oder unter freiem Himmel) in die Luft innerhalb der Maske, durch deklarierte
// Öffnungen gesperrt. Das Eindringen wird mit der 18er-Nachbarschaft geprüft (Flächen- und Kantennachbarn): Eine Wand, die nur
// über Kanten zusammenhängt (Diagonallücke), gilt als undicht.

const { packKey, xOfKey, yOfKey, zOfKey } = require('../geom/grid.js');
const palette = require('../spec/palette.js');

const DIR_IDX = { n: 0, o: 1, s: 2, w: 3 };
const DIR_VEC = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // n, o, s, w (dx, dz)
const MIN_KOMPONENTE = 20;
const MAX_ZELLEN_BOX = 120e6;

const klassenCache = new Map();
function klasseVon(typ) {
  let k = klassenCache.get(typ);
  if (k === undefined) {
    const t = palette.treppeInfo(typ);
    if (t) k = t.oben ? 1 : (2 | (DIR_IDX[t.dir] << 3));
    else if (typ === 'water') k = 3;
    else k = 1;
    klassenCache.set(typ, k);
  }
  return k;
}

/** Raster über [x0..x1] x [z0..z1] x [y0..y1] füllen: Gelände, dann Projektzellen. */
function bauRaster(o) {
  const { x0, x1, z0, z1, y0, y1 } = o;
  const Xn = x1 - x0 + 1, Zn = z1 - z0 + 1, Yn = y1 - y0 + 1;
  if (Xn * Zn * Yn > MAX_ZELLEN_BOX) throw new Error(`Begehbarkeit: Raster zu groß (${Xn}x${Zn}x${Yn})`);
  const occ = new Uint8Array(Xn * Zn * Yn);
  const top = new Int32Array(Xn * Zn);       // Geländehöhe je Säule
  for (let xi = 0; xi < Xn; xi++) {
    for (let zi = 0; zi < Zn; zi++) {
      const x = x0 + xi, z = z0 + zi;
      const t = o.gelaendeTop(x, z);
      top[xi * Zn + zi] = t;
      const base = (xi * Zn + zi) * Yn;
      const hi = Math.min(t, y1);
      for (let y = y0; y <= hi; y++) {
        if (o.gelaendeHohl && o.gelaendeHohl(x, y, z)) continue;
        occ[base + (y - y0)] = 1;
      }
    }
  }
  const setKey = (key, typ) => {
    const x = xOfKey(key), z = zOfKey(key), y = yOfKey(key);
    if (x < x0 || x > x1 || z < z0 || z > z1 || y < y0 || y > y1) return;
    occ[((x - x0) * Zn + (z - z0)) * Yn + (y - y0)] = klasseVon(typ);
  };
  if (o.iteriere) {
    o.iteriere((key) => setKey(key, o.grid.typeOfKey(key)));
  } else {
    for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) for (let y = y0; y <= y1; y++) {
      const key = packKey(x, y, z);
      if (o.grid.hasKey(key)) occ[((x - x0) * Zn + (z - z0)) * Yn + (y - y0)] = klasseVon(o.grid.typeOfKey(key));
    }
  }
  // Höchste feste/flüssige Zelle je Säule (y-Index), -1 = leer
  const colTop = new Int32Array(Xn * Zn).fill(-1);
  for (let c = 0; c < Xn * Zn; c++) {
    const base = c * Yn;
    for (let yi = Yn - 1; yi >= 0; yi--) if (occ[base + yi] !== 0) { colTop[c] = yi; break; }
  }
  return { occ, top, colTop, Xn, Zn, Yn, x0, y0, z0 };
}

function stehbar(R, i, yi) {
  const { occ, Yn } = R;
  if (yi + 2 >= Yn) return false;
  if (occ[i] !== 0 || occ[i + 1] !== 0 || occ[i + 2] !== 0) return false;
  if (yi === 0) return true; // unter dem Raster ist Fels
  const c = occ[i - 1] & 7;
  return c === 1 || c === 2;
}

/** Erreichbare stehbare Zellen: Uint8Array (1 = erreicht). seeds: Indizes. */
function erreichbar(R, seeds) {
  const { occ, Xn, Zn, Yn } = R;
  const vis = new Uint8Array(occ.length);
  let queue = new Int32Array(Math.min(occ.length, 1 << 22));
  let qh = 0, qt = 0;
  const push = (j) => {
    if (qt === queue.length) {
      if (qh > 0) { queue.copyWithin(0, qh, qt); qt -= qh; qh = 0; }
      else { const nq = new Int32Array(queue.length * 2); nq.set(queue); queue = nq; }
    }
    queue[qt++] = j; vis[j] = 1;
  };
  for (const s of seeds) if (!vis[s]) push(s);
  const sx = Zn * Yn, sz = Yn;
  const dirs = [[0, -1, 3], [1, 0, 1], [0, 1, 2], [-1, 0, 3]]; // (dx, dz, Richtungsindex wird unten über DIR_VEC geprüft)
  while (qh < qt) {
    const i = queue[qh++];
    const yi = i % Yn, r = (i - yi) / Yn, zi = r % Zn, xi = (r - zi) / Zn;
    for (let d = 0; d < 4; d++) {
      const dx = DIR_VEC[d][0], dz = DIR_VEC[d][1];
      const nx = xi + dx, nz = zi + dz;
      if (nx < 0 || nx >= Xn || nz < 0 || nz >= Zn) continue;
      const j0 = i + dx * sx + dz * sz;
      // gleiche Höhe
      if (!vis[j0] && stehbar(R, j0, yi)) { push(j0); }
      // +1
      if (yi + 1 < Yn && !vis[j0 + 1] && stehbar(R, j0 + 1, yi + 1)) {
        const sup = occ[j0];
        let frei = false;
        if ((sup & 7) === 2) {
          const st = sup >> 3; // Aufstiegsrichtung der Treppe
          frei = !(DIR_VEC[st][0] === -dx && DIR_VEC[st][1] === -dz); // nicht von der hohen Seite her
        }
        if (frei || (yi + 3 < Yn && occ[i + 3] === 0)) push(j0 + 1);
      }
      // Fallen um 1 bis 3
      for (let f = 1; f <= 3; f++) {
        if (yi - f < 0) break;
        const j = j0 - f;
        if (vis[j] || !stehbar(R, j, yi - f)) continue;
        let ok = true;
        for (let h = 3; h <= f + 2; h++) if (occ[j + h] !== 0) { ok = false; break; }
        if (ok) push(j);
      }
    }
  }
  void dirs;
  return vis;
}

/** Bauteil unter/neben einer Zelle für Berichte. */
function teilVon(grid, x, y, z) {
  const e = grid.get(x, y, z);
  return e ? `${e.module}/${e.part}` : null;
}

function haeufigste(map, n = 3) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, n).map(([part, zellen]) => ({ part, zellen }));
}

/**
 * Begehbarkeit einer Einheit (Wahrzeichen oder Haus).
 * opts: Raster-Optionen von bauRaster plus
 *   innen(x, z)   Säule gehört zum Gebäude (Maske, Grundriss oder Ersatz)
 *   unz           Set gepackter Schlüssel deklarierter unzugänglicher Zellen
 *   ring          Randbreite (Zellen) außerhalb der Projektbox, deren stehbare Zellen als Start gelten
 * -> { innenZellen, erreichbar, komponenten: [...], freiUnerreichbar, R }
 */
function pruefeBegehbarkeit(R, opts) {
  const { occ, top, colTop, Xn, Zn, Yn, x0, y0, z0 } = R;
  const { innen, grid } = opts;
  // Säulen-Flag: innerhalb des Gebäudes
  const inCol = new Uint8Array(Xn * Zn);
  for (let xi = 0; xi < Xn; xi++) for (let zi = 0; zi < Zn; zi++) inCol[xi * Zn + zi] = innen(x0 + xi, z0 + zi) ? 1 : 0;
  // Startzellen: außerhalb des Gebäudes auf Geländeniveau, sowie alle stehbaren Zellen im Außenring
  const seeds = [];
  const ring = opts.ring === undefined ? 1 : opts.ring;
  for (let xi = 0; xi < Xn; xi++) {
    for (let zi = 0; zi < Zn; zi++) {
      const c = xi * Zn + zi;
      if (inCol[c]) continue;
      const imRing = xi < ring || zi < ring || xi >= Xn - ring || zi >= Zn - ring;
      const base = c * Yn;
      if (imRing) {
        for (let yi = 0; yi + 2 < Yn; yi++) if (stehbar(R, base + yi, yi)) seeds.push(base + yi);
      } else {
        const yi = top[c] + 1 - y0;
        if (yi >= 0 && stehbar(R, base + yi, yi)) seeds.push(base + yi);
      }
    }
  }
  const vis = erreichbar(R, seeds);
  // Innenzellen: stehbar, im Gebäude, überdeckt (fester Block über dem Kopf) = Raum; unüberdeckt = Dach/Plattform
  let innenZellen = 0, erreicht = 0, freiGesamt = 0, freiUnerreicht = 0;
  const inU = new Uint8Array(occ.length); // 1 = Raumzelle nicht erreicht
  const list = [];
  for (let xi = 0; xi < Xn; xi++) {
    for (let zi = 0; zi < Zn; zi++) {
      const c = xi * Zn + zi;
      if (!inCol[c]) continue;
      const base = c * Yn, ct = colTop[c];
      for (let yi = 0; yi + 2 < Yn; yi++) {
        const i = base + yi;
        if (!stehbar(R, i, yi)) continue;
        if (ct > yi + 2) { // überdeckt
          innenZellen++;
          if (vis[i]) erreicht++; else { inU[i] = 1; list.push(i); }
        } else {
          freiGesamt++;
          if (!vis[i]) freiUnerreicht++;
        }
      }
    }
  }
  // Zusammenhangskomponenten der nicht erreichten Raumzellen (symmetrische Nachbarschaft, |dy| <= 3)
  const komponenten = [];
  const sx = Zn * Yn, sz = Yn;
  const stack = [];
  for (const s of list) {
    if (inU[s] !== 1) continue;
    const zellen = [];
    inU[s] = 2; stack.push(s);
    while (stack.length) {
      const i = stack.pop();
      zellen.push(i);
      const yi = i % Yn, r = (i - yi) / Yn, zi = r % Zn, xi = (r - zi) / Zn;
      for (let d = 0; d < 4; d++) {
        const nx = xi + DIR_VEC[d][0], nz = zi + DIR_VEC[d][1];
        if (nx < 0 || nx >= Xn || nz < 0 || nz >= Zn) continue;
        const j0 = i + DIR_VEC[d][0] * sx + DIR_VEC[d][1] * sz;
        for (let dy = -3; dy <= 3; dy++) {
          const ny = yi + dy;
          if (ny < 0 || ny >= Yn) continue;
          const j = j0 + dy;
          if (inU[j] === 1) { inU[j] = 2; stack.push(j); }
        }
      }
    }
    komponenten.push(zellen);
  }
  const out = [];
  const koord = (i) => {
    const yi = i % Yn, r = (i - yi) / Yn, zi = r % Zn, xi = (r - zi) / Zn;
    return { x: x0 + xi, y: y0 + yi, z: z0 + zi };
  };
  for (const zellen of komponenten) {
    if (zellen.length < MIN_KOMPONENTE) continue;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
    const teile = new Map();
    let unzN = 0;
    const schritt = Math.max(1, Math.floor(zellen.length / 300));
    for (let k = 0; k < zellen.length; k++) {
      const c = koord(zellen[k]);
      if (c.x < minX) minX = c.x; if (c.x > maxX) maxX = c.x;
      if (c.y < minY) minY = c.y; if (c.y > maxY) maxY = c.y;
      if (c.z < minZ) minZ = c.z; if (c.z > maxZ) maxZ = c.z;
      if (opts.unz && opts.unz.has(packKey(c.x, c.y, c.z))) unzN++;
      if (k % schritt === 0) {
        const t = teilVon(grid, c.x, c.y - 1, c.z) || 'Gelände';
        teile.set(t, (teile.get(t) || 0) + 1);
      }
    }
    const bsp = [koord(zellen[0]), koord(zellen[zellen.length >> 1])];
    out.push({ zellen: zellen.length, bbox: { x: [minX, maxX], y: [minY, maxY], z: [minZ, maxZ] },
      bauteile: haeufigste(teile), unzugaenglich: unzN * 2 >= zellen.length, beispiele: bsp.map((c) => `(${c.x},${c.y},${c.z})`) });
  }
  out.sort((a, b) => b.zellen - a.zellen);
  return { innenZellen, erreichbar: erreicht, komponenten: out, kleineKomponenten: komponenten.length - out.length,
    freiZellen: freiGesamt, freiUnerreichbar: freiUnerreicht, inCol };
}

// 18er-Nachbarschaft: 6 Flächen- und 12 Kantennachbarn als (dx, dy, dz)
const N6 = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const N18 = [...N6];
for (const a of [-1, 1]) for (const b of [-1, 1]) { N18.push([a, b, 0], [a, 0, b], [0, a, b]); }

/**
 * Dichtheit: -> { lecks: [{ x, y, z, diagonal, teil }], leckZellen, cluster: [...] }
 * opts: innen(x, z), oeffnungen (Set gepackter Schlüssel), grid
 */
function pruefeDichtheit(R, opts) {
  const { occ, colTop, Xn, Zn, Yn, x0, y0, z0 } = R;
  const { innen, grid } = opts;
  const N = occ.length;
  const sperre = new Uint8Array(N);
  if (opts.oeffnungen) {
    for (const key of opts.oeffnungen) {
      const x = xOfKey(key) - x0, z = zOfKey(key) - z0, y = yOfKey(key) - y0;
      if (x >= 0 && x < Xn && z >= 0 && z < Zn && y >= 0 && y < Yn) sperre[(x * Zn + z) * Yn + y] = 1;
    }
  }
  const inCol = new Uint8Array(Xn * Zn);
  for (let xi = 0; xi < Xn; xi++) for (let zi = 0; zi < Zn; zi++) inCol[xi * Zn + zi] = innen(x0 + xi, z0 + zi) ? 1 : 0;
  const off = (n) => (n[0] * Zn + n[2]) * Yn + n[1];
  const o18 = N18.map(off), o6 = N6.map(off);
  // Innenluft: Luft in Gebäudesäulen unterhalb der obersten festen Zelle der Säule, nicht gesperrt
  const istInnen = (i, c, yi) => occ[i] === 0 && sperre[i] === 0 && inCol[c] === 1 && yi <= colTop[c];
  const istAussenRoh = (i, c, yi) => occ[i] === 0 && sperre[i] === 0 && (inCol[c] === 0 || yi > colTop[c]);
  // Außenluft zählt nur, wenn sie über Außenluft (6er) mit dem Rand des Rasters verbunden ist: versiegelte
  // Hohlräume außerhalb der Maske (z. B. Hohlkerne im Mauerwerk) sind keine Außenluft
  const aussen = new Uint8Array(N);
  {
    let q = new Int32Array(1 << 16), qt = 0, qh = 0;
    const add = (j) => {
      if (aussen[j]) return;
      if (qt === q.length) { const nq = new Int32Array(q.length * 2); nq.set(q); q = nq; }
      aussen[j] = 1; q[qt++] = j;
    };
    for (let xi = 0; xi < Xn; xi++) for (let zi = 0; zi < Zn; zi++) {
      const c = xi * Zn + zi, base = c * Yn;
      const rand = xi === 0 || zi === 0 || xi === Xn - 1 || zi === Zn - 1;
      for (let yi = 0; yi < Yn; yi++) {
        if ((rand || yi === Yn - 1) && istAussenRoh(base + yi, c, yi)) add(base + yi);
      }
    }
    while (qh < qt) {
      const i = q[qh++];
      const yi = i % Yn, c = (i - yi) / Yn, zi = c % Zn, xi = (c - zi) / Zn;
      for (const n of N6) {
        const x2 = xi + n[0], y2 = yi + n[1], z2 = zi + n[2];
        if (x2 < 0 || x2 >= Xn || y2 < 0 || y2 >= Yn || z2 < 0 || z2 >= Zn) continue;
        const c2 = x2 * Zn + z2, j = c2 * Yn + y2;
        if (!aussen[j] && istAussenRoh(j, c2, y2)) add(j);
      }
    }
  }
  const istAussen = (i) => aussen[i] === 1;
  const aussenVon = new Map(); // Eintrittszelle -> eine benachbarte Außenluftzelle (für Berichte)
  const floods = [];
  for (const [offs, nbr] of [[o6, N6], [o18, N18]]) {
    const reached = new Uint8Array(N);
    const eintritt = [];
    let queue = new Int32Array(1 << 16), qt = 0, qh = 0;
    const push = (j) => {
      if (qt === queue.length) { const nq = new Int32Array(queue.length * 2); nq.set(queue); queue = nq; }
      queue[qt++] = j; reached[j] = 1;
    };
    // Eintrittszellen: Innenluft mit einem Außenluft-Nachbarn
    for (let xi = 1; xi < Xn - 1; xi++) {
      for (let zi = 1; zi < Zn - 1; zi++) {
        const c = xi * Zn + zi;
        if (!inCol[c]) continue;
        const base = c * Yn, ct = colTop[c];
        for (let yi = 1; yi < Yn - 1 && yi <= ct; yi++) {
          const i = base + yi;
          if (occ[i] !== 0 || sperre[i] === 1) continue;
          for (let k = 0; k < offs.length; k++) {
            const j = i + offs[k];
            const nj = nbr[k];
            const c2 = c + nj[0] * Zn + nj[2];
            const y2 = yi + nj[1];
            if (istAussen(j, c2, y2)) { push(i); eintritt.push(i); if (!aussenVon.has(i)) aussenVon.set(i, j); break; }
          }
        }
      }
    }
    while (qh < qt) {
      const i = queue[qh++];
      const yi = i % Yn, c = (i - yi) / Yn;
      for (let k = 0; k < offs.length; k++) {
        const nj = nbr[k];
        const xi = (c - (c % Zn)) / Zn + nj[0], zi = (c % Zn) + nj[2], y2 = yi + nj[1];
        if (xi < 1 || xi >= Xn - 1 || zi < 1 || zi >= Zn - 1 || y2 < 1 || y2 >= Yn - 1) continue;
        const j = i + offs[k];
        if (reached[j]) continue;
        const c2 = xi * Zn + zi;
        if (istInnen(j, c2, y2)) push(j);
      }
    }
    floods.push({ reached, eintritt, volumen: qt });
  }
  const [f6, f18] = floods;
  // Eintrittszellen (18er) zu Lücken bündeln (26er-Nachbarschaft) und dem Bauteil der festen Nachbarn zuordnen
  const koord = (i) => {
    const yi = i % Yn, r = (i - yi) / Yn, zi = r % Zn, xi = (r - zi) / Zn;
    return { x: x0 + xi, y: y0 + yi, z: z0 + zi };
  };
  const eintr = new Set(f18.eintritt);
  const seen = new Set();
  const cluster = [];
  const off26 = [];
  for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) if (a || b || c) off26.push((a * Zn + c) * Yn + b);
  for (const s of f18.eintritt) {
    if (seen.has(s)) continue;
    const comp = [];
    const st = [s];
    seen.add(s);
    while (st.length) {
      const i = st.pop();
      comp.push(i);
      for (const o of off26) { const j = i + o; if (eintr.has(j) && !seen.has(j)) { seen.add(j); st.push(j); } }
    }
    let diag = true;
    const teile = new Map();
    for (const i of comp) {
      if (f6.reached[i]) diag = false;
    }
    for (const i of comp.slice(0, 60)) {
      const c = koord(i);
      for (const n of N6) {
        const t = teilVon(grid, c.x + n[0], c.y + n[1], c.z + n[2]);
        if (t) teile.set(t, (teile.get(t) || 0) + 1);
      }
    }
    const e = koord(comp[0]);
    const aj = aussenVon.get(comp[0]);
    const a = aj === undefined ? null : koord(aj);
    let bx0 = Infinity, bx1 = -Infinity, by0 = Infinity, by1 = -Infinity, bz0 = Infinity, bz1 = -Infinity;
    for (const i of comp) {
      const c = koord(i);
      if (c.x < bx0) bx0 = c.x; if (c.x > bx1) bx1 = c.x;
      if (c.y < by0) by0 = c.y; if (c.y > by1) by1 = c.y;
      if (c.z < bz0) bz0 = c.z; if (c.z > bz1) bz1 = c.z;
    }
    cluster.push({ zellen: comp.length, diagonal: diag, beispiel: `(${e.x},${e.y},${e.z})`,
      aussen: a ? `(${a.x},${a.y},${a.z})` : null, bauteile: haeufigste(teile, 2),
      bbox: { x: [bx0, bx1], y: [by0, by1], z: [bz0, bz1] } });
  }
  cluster.sort((a, b) => b.zellen - a.zellen);
  return { cluster, eintrittsZellen: f18.eintritt.length, leckVolumen: f18.volumen, leckVolumenFlaeche: f6.volumen,
    lueckenDiagonal: cluster.filter((c) => c.diagonal).length, lueckenLoch: cluster.filter((c) => !c.diagonal).length };
}

module.exports = { bauRaster, pruefeBegehbarkeit, pruefeDichtheit, stehbar, erreichbar, klasseVon, MIN_KOMPONENTE, MAX_ZELLEN_BOX };
