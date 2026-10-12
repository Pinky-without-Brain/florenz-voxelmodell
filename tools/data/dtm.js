'use strict';
// Liest Kacheln des ESRI-ASCII-Grids (DTM LiDAR 2017, ETRS89 / UTM 32N, Zellgröße 1 m).
// Nur Lesen und Parsen; die Kacheln sind heruntergeladene, unvertrauenswürdige Daten.
const fs = require('fs');
const path = require('path');

/** Kopfzeilen (Dezimalkomma erlaubt). */
function parseHeader(buf) {
  const head = buf.subarray(0, 600).toString('latin1').split(/\r?\n/).slice(0, 6);
  const h = {};
  for (const line of head) {
    const m = /^\s*([A-Za-z_]+)\s+(\S+)/.exec(line);
    if (!m) throw new Error('Kopfzeile unlesbar: ' + line);
    h[m[1].toLowerCase()] = Number(m[2].replace(',', '.'));
  }
  for (const k of ['ncols', 'nrows', 'xllcorner', 'yllcorner', 'cellsize', 'nodata_value']) {
    if (!Number.isFinite(h[k])) throw new Error('Kopfwert fehlt: ' + k);
  }
  return h;
}

/** Liefert { h, data: Float32Array(nrows·ncols, Zeile 0 = Nord), offset }; NODATA → NaN. */
function readTile(file) {
  const buf = fs.readFileSync(file);
  const h = parseHeader(buf);
  // Datenbeginn: hinter der 6. Zeile
  let pos = 0;
  for (let l = 0; l < 6; l++) pos = buf.indexOf(10, pos) + 1;
  const n = h.ncols * h.nrows;
  const data = new Float32Array(n);
  let k = 0, i = pos;
  const len = buf.length;
  while (i < len && k < n) {
    let c = buf[i];
    if (c === 32 || c === 10 || c === 13 || c === 9) { i++; continue; }
    let neg = false;
    if (c === 45) { neg = true; i++; c = buf[i]; } else if (c === 43) { i++; c = buf[i]; }
    let v = 0;
    while (i < len && c >= 48 && c <= 57) { v = v * 10 + (c - 48); i++; c = buf[i]; }
    if (c === 46 || c === 44) {
      i++; c = buf[i];
      let f = 0.1;
      while (i < len && c >= 48 && c <= 57) { v += (c - 48) * f; f /= 10; i++; c = buf[i]; }
    }
    if (neg) v = -v;
    data[k++] = v === h.nodata_value ? NaN : v;
  }
  if (k !== n) throw new Error(`${file}: ${k} statt ${n} Werte`);
  return { h, data };
}

function listTiles(dir) {
  return fs.readdirSync(dir).filter((f) => /^MDT\d+\.asc$/i.test(f)).sort().map((f) => path.join(dir, f));
}

/** Lädt alle Kacheln, die das Fenster [e0,e1]×[n0,n1] berühren, in ein gemeinsames Raster. */
function loadWindow(dir, e0, e1, n0, n1) {
  const tiles = [];
  for (const f of listTiles(dir)) {
    const fd = fs.openSync(f, 'r');
    const b = Buffer.alloc(600);
    fs.readSync(fd, b, 0, 600, 0);
    fs.closeSync(fd);
    const h = parseHeader(b);
    if (h.xllcorner + h.ncols < e0 || h.xllcorner > e1 || h.yllcorner + h.nrows < n0 || h.yllcorner > n1) continue;
    tiles.push({ f, h });
  }
  if (!tiles.length) throw new Error('keine Kachel im Fenster');
  const gx0 = Math.min(...tiles.map((t) => t.h.xllcorner));
  const gy0 = Math.min(...tiles.map((t) => t.h.yllcorner));
  const W = Math.round(Math.max(...tiles.map((t) => t.h.xllcorner + t.h.ncols)) - gx0);
  const H = Math.round(Math.max(...tiles.map((t) => t.h.yllcorner + t.h.nrows)) - gy0);
  const g = new Float32Array(W * H).fill(NaN); // Zeile 0 = Süden
  for (const t of tiles) {
    const { h, data } = readTile(t.f);
    const c0 = Math.round(h.xllcorner - gx0), r0 = Math.round(h.yllcorner - gy0);
    for (let r = 0; r < h.nrows; r++) {
      const rb = r0 + (h.nrows - 1 - r);
      g.set(data.subarray(r * h.ncols, (r + 1) * h.ncols), rb * W + c0);
    }
  }
  return { g, W, H, gx0, gy0, tiles: tiles.length };
}

module.exports = { parseHeader, readTile, listTiles, loadWindow };
