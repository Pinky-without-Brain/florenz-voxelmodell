'use strict';
// level.dat (Bedrock): 8-Byte-Kopf (Int32 Version, Int32 Länge) plus Little-Endian-NBT.
// Feldliste und Typen stammen aus level_vorlage.json (abgeleitet aus einer Kopie einer lokalen Welt, 1.26.21).

const fs = require('node:fs');
const path = require('node:path');
const nbt = require('./nbt_le.js');

const VORLAGE = JSON.parse(fs.readFileSync(path.join(__dirname, 'level_vorlage.json'), 'utf8'));
const TYPEN = { byte: nbt.T.BYTE, short: nbt.T.SHORT, int: nbt.T.INT, long: nbt.T.LONG, float: nbt.T.FLOAT, double: nbt.T.DOUBLE, string: nbt.T.STRING, list: nbt.T.LIST, compound: nbt.T.COMPOUND };

function raw(type, v) {
  if (type === 'compound') return new Map(v.map(([k, t, x]) => [k, { t: TYPEN[t], v: raw(t, x) }]));
  if (type === 'list') return { et: TYPEN[v.et], items: v.items.map((x) => raw(v.et, x)) };
  if (type === 'long') return BigInt(v);
  return v;
}

const VERSION_SPIEL = [1, 26, 45, 1, 0];     // lastOpenedWithVersion (installierte Version laut Spezifikation)
const VERSION_MIN_CLIENT = [1, 26, 20, 0, 0]; // MinimumCompatibleClientVersion wie die Kopie
const LEVEL_DAT_VERSION = 10;                 // Kopfversion wie die Kopie (StorageVersion 10)

function setVersion(map, key, parts) {
  map.set(key, { t: nbt.T.LIST, v: { et: nbt.T.INT, items: parts.slice() } });
}

function pack(map) {
  const body = nbt.write('', { t: nbt.T.COMPOUND, v: map });
  const head = Buffer.alloc(8);
  head.writeInt32LE(LEVEL_DAT_VERSION, 0); head.writeInt32LE(body.length, 4);
  return Buffer.concat([head, body]);
}

/** Neue level.dat: opts { name, spawn: {x,y,z}, now (Sekunden) } */
function buildLevelDat(opts) {
  const map = raw('compound', VORLAGE.fields);
  const S = (k, t, v) => map.set(k, { t, v });
  S('LevelName', nbt.T.STRING, opts.name);
  S('GameType', nbt.T.INT, 1);
  S('Difficulty', nbt.T.INT, 0);
  S('commandsEnabled', nbt.T.BYTE, 1);
  S('cheatsEnabled', nbt.T.BYTE, 1);
  S('hasBeenLoadedInCreative', nbt.T.BYTE, 1);
  S('keepinventory', nbt.T.BYTE, 1);
  S('showcoordinates', nbt.T.BYTE, 1);
  S('Generator', nbt.T.INT, 2); // 2 = flach
  // Flachwelt ohne Schichten: eine Luftschicht (leere Liste ist nicht belegt)
  S('FlatWorldLayers', nbt.T.STRING, JSON.stringify({ biome_id: 1, block_layers: [{ block_name: 'minecraft:air', count: 1 }], encoding_version: 6, preset_id: 'ClassicFlat', world_version: 'version.post_1_18' }) + '\n');
  S('dodaylightcycle', nbt.T.BYTE, 0);
  S('doweathercycle', nbt.T.BYTE, 0);
  S('domobspawning', nbt.T.BYTE, 0);
  S('spawnMobs', nbt.T.BYTE, 0);
  S('doinsomnia', nbt.T.BYTE, 0);
  S('mobgriefing', nbt.T.BYTE, 0);
  S('rainLevel', nbt.T.FLOAT, 0);
  S('lightningLevel', nbt.T.FLOAT, 0);
  S('Time', nbt.T.LONG, 6000n);
  S('currentTick', nbt.T.LONG, 0n);
  S('RandomSeed', nbt.T.LONG, 1348n);
  S('LastPlayed', nbt.T.LONG, BigInt(opts.now));
  S('SpawnX', nbt.T.INT, opts.spawn.x);
  S('SpawnY', nbt.T.INT, opts.spawn.y);
  S('SpawnZ', nbt.T.INT, opts.spawn.z);
  S('LimitedWorldOriginX', nbt.T.INT, opts.spawn.x);
  S('LimitedWorldOriginY', nbt.T.INT, opts.spawn.y);
  S('LimitedWorldOriginZ', nbt.T.INT, opts.spawn.z);
  setVersion(map, 'lastOpenedWithVersion', VERSION_SPIEL);
  setVersion(map, 'MinimumCompatibleClientVersion', VERSION_MIN_CLIENT);
  return pack(map);
}

/** Vorhandene level.dat behalten: nur LastPlayed und die Versionsfelder aktualisieren. */
function updateLevelDat(buf, now) {
  const r = nbt.read(buf, 8);
  const map = r.tag.v;
  map.set('LastPlayed', { t: nbt.T.LONG, v: BigInt(now) });
  setVersion(map, 'lastOpenedWithVersion', VERSION_SPIEL);
  return pack(map);
}

/** level.dat lesen -> einfaches Objekt (Long als BigInt). */
function readLevelDat(buf) {
  return nbt.toPlain(nbt.read(buf, 8).tag);
}

module.exports = { buildLevelDat, updateLevelDat, readLevelDat, VERSION_SPIEL, LEVEL_DAT_VERSION };
