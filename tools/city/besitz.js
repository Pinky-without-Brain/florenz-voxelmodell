'use strict';
// Besitzraster des Stadtgrunds (Spezifikation stadtgrund §3): Für jede Spalte (x, z) die tiefste Zelle (minY) aller
// gebauten Projekte. Der Stadtgrund belegt in einer Spalte nur Zellen unter diesem minY.
// Die Werte stammen aus den Builds der Projekte und liegen in data/stadt/besitz_projekte.json (zlib + base64,
// je Projekt ein Rechteck x0/z0/nx/nz mit Uint16 = minY + 1, 0 = keine Zelle).
//   node tools/city/besitz.js            # alle Projekte außer dem Stadtgrund bauen und die Datei neu schreiben
//   node tools/city/besitz.js <id> …     # nur diese Projekte neu, die übrigen Einträge bleiben
// Nach jeder Änderung an einem Projekt, die seine Unterkante verschiebt, neu erzeugen (sonst Löcher oder --cross-Konflikte).

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const ROOT = path.resolve(__dirname, '..', '..');
const DATEI = path.join(ROOT, 'data', 'stadt', 'besitz_projekte.json');

/** Säulen-minY eines Grids -> { x0, z0, nx, nz, werte: Uint16Array } */
function rasterVonGrid(grid) {
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  grid.forEach((x, y, z) => {
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (z < z0) z0 = z; if (z > z1) z1 = z;
  });
  if (x0 === Infinity) return null;
  const nx = x1 - x0 + 1, nz = z1 - z0 + 1;
  const werte = new Uint16Array(nx * nz);
  grid.forEach((x, y, z) => {
    const i = (x - x0) * nz + (z - z0);
    if (werte[i] === 0 || y + 1 < werte[i]) werte[i] = y + 1;
  });
  return { x0, z0, nx, nz, werte };
}

const kodiere = (werte) => zlib.deflateSync(Buffer.from(werte.buffer, werte.byteOffset, werte.byteLength)).toString('base64');
function dekodiere(b64, n) {
  const buf = zlib.inflateSync(Buffer.from(b64, 'base64'));
  const out = new Uint16Array(n);
  out.set(new Uint16Array(buf.buffer, buf.byteOffset, n));
  return out;
}

/** Baut alle Projekte (außer type "stadtgrund") oder nur `nur` (IDs; die übrigen Einträge bleiben) und schreibt die
 *  Datei. Unabhängige Module (Quartiere) werden einzeln gebaut, Generator-Caches danach freigegeben (Speicher).
 *  -> { datei, projekte: { id: Spalten } } */
function erzeuge({ root = ROOT, datei = DATEI, log = () => {}, nur = null } = {}) {
  const { loadRegistry } = require('../projects.js');
  const { buildWorld, listModules, isUnabhaengig, vergissGenerator } = require('../model/world.js');
  const reg = loadRegistry({ root });
  const ids = new Set(reg.projects.map((p) => p.id));
  let alt = {};
  if (nur && fs.existsSync(datei)) alt = JSON.parse(fs.readFileSync(datei, 'utf8')).projekte || {};
  const projekte = {};
  const zusammenfassung = {};
  for (const p of reg.projects) {
    if (p.type === 'stadtgrund') continue;
    if (nur && !nur.includes(p.id)) { if (alt[p.id]) { projekte[p.id] = alt[p.id]; zusammenfassung[p.id] = alt[p.id].spalten; } continue; }
    const laeufe = isUnabhaengig(p) ? listModules(p).numbers.map((n) => [n]) : [undefined];
    const saeulen = new Map(); // x * 65536 + z (versetzt) -> minY + 1
    let bloecke = 0;
    for (const mods of laeufe) {
      const world = buildWorld({ project: p, modules: mods });
      if (world.errors.length) throw new Error(`besitz: Projekt ${p.id} baut nicht fehlerfrei (${world.errors[0].message})`);
      bloecke += world.grid.size;
      world.grid.forEach((x, y, z) => {
        const k = (x + 32768) * 65536 + (z + 32768);
        const v = saeulen.get(k);
        if (v === undefined || y + 1 < v) saeulen.set(k, y + 1);
      });
    }
    vergissGenerator(p);
    if (!saeulen.size) continue;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const k of saeulen.keys()) {
      const x = Math.floor(k / 65536) - 32768, z = (k % 65536) - 32768;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z;
    }
    const nx = x1 - x0 + 1, nz = z1 - z0 + 1;
    const werte = new Uint16Array(nx * nz);
    for (const [k, v] of saeulen) werte[(Math.floor(k / 65536) - 32768 - x0) * nz + (k % 65536) - 32768 - z0] = v;
    projekte[p.id] = { x0, z0, nx, nz, bloecke, spalten: saeulen.size, minY: kodiere(werte) };
    zusammenfassung[p.id] = saeulen.size;
    log(`  ${p.id}: ${bloecke} Blöcke, ${saeulen.size} Spalten`);
  }
  for (const id of nur || []) if (!ids.has(id)) throw new Error(`besitz: unbekanntes Projekt ${id}`);
  const json = { quelle: 'tools/city/besitz.js (Builds der Projekte)', format: 'je Projekt Rechteck x0/z0/nx/nz, minY = zlib(Uint16 minY+1, Index (x−x0)·nz + (z−z0)), base64',
    projekte };
  fs.writeFileSync(datei, JSON.stringify(json, null, 1) + '\n');
  return { datei, projekte: zusammenfassung };
}

let cache = null;
/**
 * ladeBesitz() -> { minY(x, z) -> kleinstes minY aller Projekte oder Infinity, projektVon(x, z) -> id|null, projekte: [ids] }
 */
function ladeBesitz(datei = DATEI) {
  if (cache && cache.datei === datei) return cache.b;
  const leer = { minY: () => Infinity, projektVon: () => null, projekte: [] };
  if (!fs.existsSync(datei)) { cache = { datei, b: leer }; return leer; }
  const j = JSON.parse(fs.readFileSync(datei, 'utf8'));
  const liste = Object.entries(j.projekte || {}).map(([id, e]) => ({ id, ...e, werte: dekodiere(e.minY, e.nx * e.nz) }));
  const wert = (e, x, z) => {
    const ix = x - e.x0, iz = z - e.z0;
    if (ix < 0 || iz < 0 || ix >= e.nx || iz >= e.nz) return 0;
    return e.werte[ix * e.nz + iz];
  };
  const b = {
    projekte: liste.map((e) => e.id),
    minY(x, z) {
      let m = Infinity;
      for (const e of liste) { const v = wert(e, x, z); if (v && v - 1 < m) m = v - 1; }
      return m;
    },
    projektVon(x, z) {
      let m = Infinity, id = null;
      for (const e of liste) { const v = wert(e, x, z); if (v && v - 1 < m) { m = v - 1; id = e.id; } }
      return id;
    }
  };
  cache = { datei, b };
  return b;
}

module.exports = { erzeuge, ladeBesitz, rasterVonGrid, DATEI };

if (require.main === module) {
  const t0 = Date.now();
  const nur = process.argv.slice(2);
  const r = erzeuge({ log: (l) => console.log(l), nur: nur.length ? nur : null });
  console.log(`${path.relative(ROOT, r.datei)}: ${Object.keys(r.projekte).length} Projekte (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}
