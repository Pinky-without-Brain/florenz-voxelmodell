'use strict';
const nbt = require('./nbt_le.js');
// Minecraft-Export (Bedrock): schreibt das Stadtmodell als Weltordner (db/, level.dat, levelname.txt).
// Aufruf: node tools/minecraft/export.js [--ziel <Weltordner>] [--ohne-platzhalter]
// Spezifikation: 20_Stadtmodell_Florenz/MINECRAFT_EXPORT.md

const fs = require('node:fs');
const path = require('node:path');
const { ROOT } = require('../projects.js');
const { DbWriter, readDb } = require('./leveldb.js');
const chunk = require('./bedrock_chunk.js');
const { paletteEntry } = require('./bedrock_bloecke.js');
const { buildLevelDat, updateLevelDat } = require('./leveldat.js');
const { WeltDaten, SUBS } = require('./welt.js');

const WELT_NAME = 'Florenz Voxelmodell';
const CHUNK_VERSION = 42;   // Wert des Version-Tags (44) in der Weltkopie (häufigster)
const FINALIZED = 2;        // Wert von FinalizedState (54) in der Weltkopie (häufigster)
const BIOM_EBENE = 1;       // plains
const PLAYER_KEY = /^(~local_player|player_)/;

class WeltOffenFehler extends Error {
  constructor() {
    super('Welt in Minecraft verlassen und Export erneut starten.');
    this.name = 'WeltOffenFehler';
    this.code = 'WELT_OFFEN';
  }
}

/** Zielordner: minecraft.local.json (Feld welt), sonst build/minecraft/florenz_voxelmodell. */
function zielAusKonfig(root = ROOT) {
  const f = path.join(root, 'minecraft.local.json');
  if (fs.existsSync(f)) {
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (j && typeof j.welt === 'string' && j.welt) return path.resolve(root, j.welt);
  }
  return null;
}
const standardZiel = (root = ROOT) => path.join(root, 'build', 'minecraft', 'florenz_voxelmodell');

/** Wirft WeltOffenFehler, wenn db/LOCK von Minecraft gehalten wird (Windows: Öffnen scheitert). */
function pruefeSperre(dbDir) {
  const lock = path.join(dbDir, 'LOCK');
  if (!fs.existsSync(lock)) return;
  let fd;
  try { fd = fs.openSync(lock, 'r+'); } catch (e) {
    if (e.code === 'EBUSY' || e.code === 'EPERM' || e.code === 'EACCES') throw new WeltOffenFehler();
    throw e;
  }
  fs.closeSync(fd);
}

function swap32(c) { return (((c & 255) << 24) | (((c >> 8) & 255) << 16) | (((c >> 16) & 255) << 8) | ((c >>> 24) & 255)) >>> 0; }

function lesePlayer(dbDir, log) {
  if (!fs.existsSync(path.join(dbDir, 'CURRENT'))) return [];
  try {
    const db = readDb(dbDir, { filter: (k) => PLAYER_KEY.test(k.toString('latin1')) });
    return [...db.map.values()].map((e) => [e.key, e.value]);
  } catch (e) {
    log(`Warnung: vorhandene db/ nicht lesbar (${e.message}); Spielerdaten werden nicht übernommen`);
    return [];
  }
}

// Block-Entity eines Wandschilds (Bedrock 1.20+: FrontText/BackText), Text schwarz, gewachst (nicht editierbar)
function schildEntity(s) {
  const seite = (text) => nbt.compound([['Text', nbt.string(text)], ['TextOwner', nbt.string('')], ['SignTextColor', nbt.int(-16777216)],
    ['IgnoreLighting', nbt.byte(0)], ['HideGlowOutline', nbt.byte(0)], ['PersistFormatting', nbt.byte(1)]]);
  return nbt.write('', nbt.compound([['id', nbt.string('Sign')], ['isMovable', nbt.byte(1)], ['x', nbt.int(s.x)], ['y', nbt.int(s.y)], ['z', nbt.int(s.z)],
    ['FrontText', seite(s.text)], ['BackText', seite('')], ['IsWaxed', nbt.byte(1)]]));
}

function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }

/**
 * exportWorld(opts) -> Kennzahlen.
 * opts: { ziel, root, platzhalter, registry: {root, projectsRoot, entries}, bereich, log, now }
 */
function exportWorld(opts = {}) {
  const t0 = Date.now();
  const log = opts.log || ((s) => console.log(s));
  const root = opts.root || ROOT;
  const ziel = path.resolve(opts.ziel || zielAusKonfig(root) || standardZiel(root));
  const dbDir = path.join(ziel, 'db');
  const neu = path.join(ziel, 'db.neu');
  const alt = path.join(ziel, 'db.alt');
  fs.mkdirSync(ziel, { recursive: true });
  pruefeSperre(dbDir);
  rmrf(neu); rmrf(alt);
  log(`Minecraft-Export nach ${ziel}`);

  const spieler = lesePlayer(dbDir, log);
  const welt = new WeltDaten({ registry: opts.registry, platzhalter: opts.platzhalter !== false, bereich: opts.bereich, log });
  welt.prepare();
  const tVorbereitet = Date.now();

  // Chunks in Schlüsselreihenfolge (Bytevergleich der little-endian-Koordinaten)
  const liste = welt.chunkListe().map(([cx, cz]) => ({ cx, cz, sx: swap32(cx), sz: swap32(cz) }));
  liste.sort((a, b) => (a.sx - b.sx) || (a.sz - b.sz));
  const sonstige = spieler.slice().sort((a, b) => Buffer.compare(a[0], b[0]));
  let si = 0;

  const w = new DbWriter(neu, { level: 3, blockSize: 16384, tableSize: 4 * 1024 * 1024 });
  const add = (key, value) => {
    while (si < sonstige.length && Buffer.compare(sonstige[si][0], key) < 0) { w.add(sonstige[si][0], sonstige[si][1]); si++; }
    w.add(key, value);
  };
  const uniformCache = new Map();
  const finalized = Buffer.alloc(4); finalized.writeInt32LE(FINALIZED);
  const versionBuf = Buffer.from([CHUNK_VERSION]);
  const st = { chunks: 0, subchunks: 0, bloecke: 0, uniform: 0 };
  let peakHeap = 0;
  const total = liste.length;
  for (let n = 0; n < total; n++) {
    const { cx, cz } = liste[n];
    const { blocks, heights } = welt.chunkBlocks(cx, cz);
    add(chunk.chunkKey(cx, cz, chunk.TAG.DATA3D), chunk.encodeData3D(heights, BIOM_EBENE, SUBS));
    add(chunk.chunkKey(cx, cz, chunk.TAG.VERSION), versionBuf);
    for (let k = 0; k < SUBS; k++) {
      const s = (k + 4) % SUBS; // y-Index 0..19 zuerst, dann -4..-1 (Bytereihenfolge der Schlüssel)
      const sub = blocks.subarray(s * 4096, s * 4096 + 4096);
      const first = sub[0];
      let uni = true;
      for (let i = 1; i < 4096; i++) if (sub[i] !== first) { uni = false; break; }
      const yi = s - 4;
      let val;
      if (uni) {
        if (first === 0) continue;
        const ck = first * 32 + s;
        val = uniformCache.get(ck);
        if (!val) uniformCache.set(ck, val = chunk.encodeSubChunk(yi, sub, (id) => paletteEntry(welt.typeNames[id])));
        st.bloecke += 4096; st.uniform++;
      } else {
        val = chunk.encodeSubChunk(yi, sub, (id) => paletteEntry(welt.typeNames[id]));
        for (let i = 0; i < 4096; i++) if (sub[i] !== 0) st.bloecke++;
      }
      add(chunk.chunkKey(cx, cz, chunk.TAG.SUBCHUNK, yi), val);
      st.subchunks++;
    }
    const be = welt.blockEntities(cx, cz);
    if (be.length) { add(chunk.chunkKey(cx, cz, chunk.TAG.BLOCKENTITY), Buffer.concat(be.map(schildEntity))); st.schilder = (st.schilder || 0) + be.length; }
    add(chunk.chunkKey(cx, cz, chunk.TAG.FINALIZED), finalized);
    st.chunks++;
    if (n % 5000 === 4999) {
      peakHeap = Math.max(peakHeap, process.memoryUsage().heapUsed);
      log(`  ${n + 1}/${total} Chunks (${Math.round((Date.now() - tVorbereitet) / 1000)} s)`);
    }
  }
  while (si < sonstige.length) { w.add(sonstige[si][0], sonstige[si][1]); si++; }
  const dbInfo = w.close();
  peakHeap = Math.max(peakHeap, process.memoryUsage().heapUsed);

  // level.dat und levelname.txt
  const now = opts.now || Math.floor(Date.now() / 1000);
  const spawn = welt.spawn();
  const lvlFile = path.join(ziel, 'level.dat');
  fs.writeFileSync(lvlFile, fs.existsSync(lvlFile) ? updateLevelDat(fs.readFileSync(lvlFile), now) : buildLevelDat({ name: WELT_NAME, spawn, now }));
  fs.writeFileSync(path.join(ziel, 'levelname.txt'), WELT_NAME);

  // db austauschen
  if (fs.existsSync(dbDir)) {
    try { fs.renameSync(dbDir, alt); } catch (e) {
      rmrf(neu);
      if (e.code === 'EBUSY' || e.code === 'EPERM' || e.code === 'EACCES') throw new WeltOffenFehler();
      throw e;
    }
  }
  fs.renameSync(neu, dbDir);
  rmrf(alt);

  const result = {
    ziel, ms: Date.now() - t0, msVorbereitung: tVorbereitet - t0, dbBytes: dbInfo.bytes, tabellen: dbInfo.tables, eintraege: dbInfo.entries,
    chunks: st.chunks, subchunks: st.subchunks, bloecke: st.bloecke, projektBloecke: welt.stats.projektBloecke,
    verworfen: welt.stats.verworfen, haeuser: welt.stats.haeuser, schilder: st.schilder || 0, spawn, heapMB: Math.round(peakHeap / 1048576),
    rssMB: Math.round(process.memoryUsage().rss / 1048576), spieler: spieler.length, projekte: welt.projects.map((p) => p.id)
  };
  log(`Fertig in ${(result.ms / 1000).toFixed(1)} s: db ${(result.dbBytes / 1048576).toFixed(1)} MB (${result.tabellen} Tabellen), ${result.chunks} Chunks, ` +
    `${result.subchunks} Subchunks, ${result.bloecke} Blöcke (davon Projekte ${result.projektBloecke}), Platzhalter-Häuser ${result.haeuser}, Straßenschilder ${result.schilder}, ` +
    `Spawn ${spawn.x} ${spawn.y} ${spawn.z}, Heap ${result.heapMB} MB`);
  try { // Messwerte für die Statistikseite (tools/emit/statistik.js)
    fs.mkdirSync(path.join(ROOT, 'build', 'minecraft'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'build', 'minecraft', 'export_ergebnis.json'), JSON.stringify({ ...result, stand: new Date(now * 1000).toISOString() }, null, 1));
  } catch (e) { /* Statistik ist optional */ }
  if (result.verworfen) log(`Warnung: ${result.verworfen} Projektblöcke außerhalb Y -64..319 verworfen`);
  return result;
}

function parseArgs(argv) {
  const o = { ziel: null, platzhalter: true };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--ziel') { o.ziel = argv[++i]; if (!o.ziel) throw new Error('--ziel erwartet einen Ordner'); }
    else if (argv[i] === '--ohne-platzhalter') o.platzhalter = false;
    else throw new Error('Unbekanntes Argument: ' + argv[i]);
  }
  return o;
}

if (require.main === module) {
  try {
    exportWorld(parseArgs(process.argv.slice(2)));
  } catch (e) {
    if (e instanceof WeltOffenFehler) console.error(e.message);
    else console.error('Export-Abbruch: ' + (e.stack || e.message));
    process.exitCode = 1;
  }
}

module.exports = { exportWorld, parseArgs, zielAusKonfig, standardZiel, pruefeSperre, WeltOffenFehler, WELT_NAME, CHUNK_VERSION, FINALIZED, schildEntity };
