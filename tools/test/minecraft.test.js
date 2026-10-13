'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');

const nbt = require('../minecraft/nbt_le.js');
const { crc32c, mask, unmask } = require('../minecraft/crc32c.js');
const ldb = require('../minecraft/leveldb.js');
const chunk = require('../minecraft/bedrock_chunk.js');
const bloecke = require('../minecraft/bedrock_bloecke.js');
const { exportWorld, WeltOffenFehler } = require('../minecraft/export.js');
const { openWorld } = require('../minecraft/lesen.js');
const { fillPolygon } = require('../minecraft/welt.js');
const GEL = require('../geo/gelaende.js');
const { TYPES } = require('../spec/palette.js');

const tmp = (n) => fs.mkdtempSync(path.join(os.tmpdir(), 'mc-' + n + '-'));
const KOPIE = process.env.BEDROCK_WELTKOPIE ||
  'C:/Users/tomkl/AppData/Local/Temp/claude/C--Users-tomkl-Desktop-Cathedral-of-Santa-Maria-del-Fiore/695cd823-6e59-43f6-b88b-1944f0f7a521/scratchpad/bedrock_kopie/auenland';

test('NBT: Rundlauf aller Tag-Typen, Reihenfolge und int64 als BigInt', () => {
  const root = nbt.compound([
    ['z_zuerst', nbt.byte(-5)], ['a_short', nbt.short(-1234)], ['int', nbt.int(-2000000000)],
    ['long', nbt.long(-9007199254740993n)], ['f', nbt.float(1.5)], ['d', nbt.double(Math.PI)],
    ['bytes', nbt.byteArray([1, 2, 255])], ['text', nbt.string('Grüße ü')],
    ['liste', nbt.list(nbt.T.INT, [1, 2, 3])],
    ['liste2', nbt.list(nbt.T.COMPOUND, [new Map([['x', nbt.int(1)]]), new Map()])],
    ['sub', nbt.compound({ y: nbt.string('k') })],
    ['ia', { t: nbt.T.INTARRAY, v: [1, -2] }], ['la', { t: nbt.T.LONGARRAY, v: [5n, -6n] }]
  ]);
  const buf = nbt.write('wurzel', root);
  const r = nbt.read(buf);
  assert.equal(r.name, 'wurzel');
  assert.equal(r.end, buf.length);
  assert.deepEqual([...r.tag.v.keys()], [...root.v.keys()]);
  assert.equal(r.tag.v.get('long').v, -9007199254740993n);
  assert.equal(typeof r.tag.v.get('long').v, 'bigint');
  assert.equal(r.tag.v.get('text').v, 'Grüße ü');
  assert.deepEqual([...r.tag.v.get('bytes').v], [1, 2, 255]);
  assert.deepEqual(nbt.toPlain(r.tag).liste, [1, 2, 3]);
  assert.deepEqual(nbt.toPlain(r.tag).ia, [1, -2]);
  assert.deepEqual(nbt.write('wurzel', r.tag), buf); // byteidentisch
  // Mehrere Tags hintereinander
  const two = Buffer.concat([nbt.write('', nbt.compound({ a: nbt.int(1) })), nbt.write('', nbt.compound({ b: nbt.int(2) }))]);
  assert.equal(nbt.readAll(two).length, 2);
});

test('crc32c: Testvektoren und LevelDB-Maskierung', () => {
  assert.equal(crc32c(Buffer.from('123456789')), 0xe3069283);
  assert.equal(crc32c(Buffer.alloc(32)), 0x8a9136aa);
  assert.equal(crc32c(Buffer.alloc(32, 0xff)), 0x62a8ab43);
  assert.equal(crc32c(Buffer.from('6789'), crc32c(Buffer.from('12345'))), 0xe3069283);
  for (const v of [0, 1, 0xe3069283, 0xffffffff, 0x12345678]) assert.equal(unmask(mask(v)), v);
  assert.equal(mask(0), 0xa282ead8);
});

function schluessel(i) { return Buffer.from('k' + String(i * 7919 % 100003).padStart(8, '0')); }

for (const compress of [0, 2, 4]) {
  test(`LevelDB: Writer -> Reader Rundlauf (Kompression ${compress}), viele Schlüssel über mehrere Blöcke und Tabellen`, () => {
    const dir = tmp('ldb');
    const w = new ldb.DbWriter(dir, { compress, blockSize: 4096, tableSize: 30 * 1024, level: 2 });
    const keys = [];
    for (let i = 0; i < 5000; i++) keys.push(schluessel(i));
    keys.sort(Buffer.compare);
    const want = new Map();
    keys.forEach((k, i) => {
      const v = i % 97 === 0 ? Buffer.alloc(30000, i & 255) : Buffer.from('wert-' + i + '-' + 'x'.repeat(i % 50));
      w.add(k, v); want.set(k.toString('latin1'), v);
    });
    assert.throws(() => w.add(keys[0], Buffer.alloc(1)), /aufsteigend/);
    const res = w.close();
    assert.ok(res.tables >= 3, 'mehrere Tabellen: ' + res.tables);
    const db = ldb.readDb(dir, { verify: true });
    assert.equal(db.map.size, 5000);
    assert.equal(db.info.tables, res.tables);
    assert.ok(db.info.levels.every((l) => l === 2));
    for (const [k, v] of want) assert.ok(db.map.get(k).value.equals(v), k);
    if (compress) assert.ok(db.info.blockTypes.has(compress));
    // Tabellen mit disjunkten Bereichen
    const man = ldb.readLogRecords(fs.readFileSync(path.join(dir, 'MANIFEST-000002')));
    assert.equal(man.length, 1);
    const e = ldb.parseVersionEdit(man[0]);
    assert.equal(e.comparator, 'leveldb.BytewiseComparator');
    const files = e.newFiles.sort((a, b) => Buffer.compare(a.smallest, b.smallest));
    for (let i = 1; i < files.length; i++) assert.ok(Buffer.compare(files[i - 1].largest.subarray(0, -8), files[i].smallest.subarray(0, -8)) < 0);
    assert.equal(fs.readFileSync(path.join(dir, 'CURRENT'), 'latin1'), 'MANIFEST-000002\n');
    fs.rmSync(dir, { recursive: true, force: true });
  });
}

test('LevelDB: Log-Records mit Fragmenten über 32-KB-Blöcke und WriteBatch (Überschreiben, Löschen)', () => {
  const recs = [Buffer.alloc(100, 1), Buffer.alloc(80000, 2), Buffer.alloc(32760, 3), Buffer.alloc(5, 4)];
  const buf = ldb.logRecords(recs);
  const back = ldb.readLogRecords(buf);
  assert.equal(back.length, 4);
  recs.forEach((r, i) => assert.ok(back[i].equals(r)));
  // WriteBatch: put a=1, put b=2 ; dann put a=3, delete b
  const batch = (seq, ops) => {
    const parts = [Buffer.alloc(12)];
    parts[0].writeBigUInt64LE(BigInt(seq)); parts[0].writeUInt32LE(ops.length, 8);
    for (const [t, k, v] of ops) {
      parts.push(Buffer.from([t, k.length]), Buffer.from(k));
      if (t === 1) parts.push(Buffer.from([v.length]), Buffer.from(v));
    }
    return Buffer.concat(parts);
  };
  const dir = tmp('log');
  fs.writeFileSync(path.join(dir, '000003.log'), ldb.logRecords([batch(1, [[1, 'a', '1'], [1, 'b', '2']]), batch(3, [[1, 'a', '3'], [0, 'b']])]));
  const db = ldb.readDb(dir);
  assert.equal(db.get(Buffer.from('a')).toString(), '3');
  assert.equal(db.get(Buffer.from('b')), undefined);
  assert.equal(db.info.logs, 1);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('Weltkopie lesen (echte Bedrock-Welt, übersprungen wenn nicht vorhanden)', { skip: !fs.existsSync(path.join(KOPIE, 'db')) && 'Weltkopie fehlt' }, () => {
  const db = ldb.readDb(path.join(KOPIE, 'db'), { verify: true });
  assert.ok(db.map.size > 1000);
  assert.ok(db.get(Buffer.from('~local_player')), '~local_player gefunden');
  const kinds = new Map();
  const names = new Set();
  let subs = 0;
  for (const { key, value } of db.map.values()) {
    if (key.length === 9 || key.length === 10) {
      kinds.set(key[8], (kinds.get(key[8]) || 0) + 1);
      if (key.length === 10 && key[8] === 47) {
        const sc = chunk.decodeSubChunk(value);
        assert.equal(sc.version, 9);
        assert.equal(sc.yIndex, key.readInt8(9));
        for (const L of sc.layers) for (const p of L.palette) names.add(p.name);
        subs++;
      }
    }
  }
  assert.ok(subs > 1000);
  for (const t of [43, 44, 47, 54]) assert.ok(kinds.get(t) > 100, 'Schlüsseltyp ' + t);
  for (const n of ['minecraft:stone', 'minecraft:air', 'minecraft:grass_block', 'minecraft:water']) assert.ok(names.has(n), n);
  // Data3D der Kopie lesbar
  const k43 = [...db.map.values()].find((e) => e.key.length === 9 && e.key[8] === 43);
  const d = chunk.decodeData3D(k43.value);
  assert.equal(d.sections.length, 24);
  // Bericht: welche Namen unserer Tabelle kommen in der Kopie vor
  const fehlen = bloecke.tabelle().filter((t) => !names.has(t.name)).map((t) => t.name);
  console.log(`# Weltkopie: ${db.map.size} Schlüssel, ${subs} Subchunks, ${names.size} Palettennamen; unsere Typen nicht in der Kopie (${fehlen.length}): ${fehlen.join(', ')}`);
  const vorhanden = bloecke.tabelle().filter((t) => names.has(t.name));
  assert.ok(vorhanden.length >= 25);
});

test('Subchunk-Bitpacking: Palettengrößen 1, 2, 16, 17, 300 im Rundlauf', () => {
  const entry = (id) => nbt.write('', nbt.compound([['name', nbt.string('minecraft:t' + id)], ['states', nbt.compound({})], ['version', nbt.int(bloecke.BLOCK_VERSION)]]));
  for (const n of [1, 2, 16, 17, 300]) {
    const blocks = new Uint16Array(4096);
    for (let i = 0; i < 4096; i++) blocks[i] = n === 1 ? 5 : 1 + ((i * 31 + (i >> 5)) % n);
    if (n > 1) for (let id = 1; id <= n; id++) blocks[(id * 13) % 4096] = id; // alle Ids kommen vor
    const buf = chunk.encodeSubChunk(-3, blocks, entry);
    const sc = chunk.decodeSubChunk(buf);
    assert.equal(sc.yIndex, -3);
    assert.equal(sc.end, buf.length);
    const L = sc.layers[0];
    // n Ids (ohne Luft) ergeben n Paletteneinträge; n=1 bekommt Luft als zweiten Eintrag
    const pal = n === 1 ? 2 : n;
    assert.equal(L.palette.length, pal);
    assert.equal(L.bits, { 1: 1, 2: 1, 16: 4, 17: 5, 300: 16 }[n]);
    for (let i = 0; i < 4096; i++) assert.equal(L.palette[L.idx[i]].name, 'minecraft:t' + blocks[i]);
  }
  assert.equal(chunk.encodeSubChunk(0, new Uint8Array(4096), entry), null); // reine Luft entfällt
  // Kein Wortüberlauf: bei 5 Bit passen 6 Indizes in ein Wort
  assert.equal(chunk.wordsFor(5), Math.ceil(4096 / 6));
  assert.equal(chunk.wordsFor(3), Math.ceil(4096 / 10));
  const idx = new Uint16Array(4096).map((_, i) => i % 32);
  const back = chunk.unpackIndices(chunk.packIndices(idx, 5), 0, 5).idx;
  assert.deepEqual([...back], [...idx]);
  // Einzelnes Wort: Index 0 in den niedrigen Bits
  idx.fill(0); idx[0] = 3; idx[1] = 1;
  assert.equal(chunk.packIndices(idx, 4).readUInt32LE(0), 0x13);
});

test('Data3D: Höhenkarte und Biome im Rundlauf', () => {
  const h = new Int16Array(256).map((_, i) => 100 + i);
  const d = chunk.decodeData3D(chunk.encodeData3D(h, 1));
  assert.deepEqual([...d.heights], [...h]);
  assert.equal(d.sections.length, 24);
  assert.deepEqual(d.sections[0].palette, [1]);
  assert.ok(d.sections[1].same);
});

test('Blocktabelle: alle Palettentypen gemappt, Bedrock-Namen und Zustände', () => {
  for (const t of TYPES) {
    const n = bloecke.bedrockName(t);
    assert.match(n, /^minecraft:[a-z_]+$/, t);
    const e = nbt.read(bloecke.paletteEntry(t));
    assert.equal(e.tag.v.get('name').v, n);
    assert.equal(e.tag.v.get('version').v, bloecke.BLOCK_VERSION);
  }
  assert.equal(bloecke.bedrockName('bricks'), 'minecraft:brick_block');
  assert.equal(bloecke.bedrockName('terracotta'), 'minecraft:hardened_clay');
  assert.equal(bloecke.bedrockName('end_stone_bricks'), 'minecraft:end_bricks');
  assert.equal(bloecke.bedrockName('chiseled_quartz'), 'minecraft:chiseled_quartz_block');
  assert.equal(bloecke.bedrockName('sea_lantern'), 'minecraft:sea_lantern');
  assert.deepEqual(bloecke.statesOf('quartz_pillar'), [['pillar_axis', 'string', 'y']]);
  assert.deepEqual(bloecke.statesOf('oak_leaves'), [['persistent_bit', 'byte', 1], ['update_bit', 'byte', 0]]);
  assert.deepEqual(bloecke.statesOf('water'), [['liquid_depth', 'int', 0]]);
  // Treppen: Aufstieg o/w/s/n -> weirdo_direction 0/1/2/3 (minecraft.wiki), Namen laut Weltkopie/Schema
  assert.equal(bloecke.bedrockName('stone_stairs@n'), 'minecraft:normal_stone_stairs');
  assert.equal(bloecke.bedrockName('cobblestone_stairs@n'), 'minecraft:stone_stairs');
  assert.equal(bloecke.bedrockName('end_stone_brick_stairs@o'), 'minecraft:end_brick_stairs');
  assert.equal(bloecke.bedrockName('smooth_quartz_stairs@s'), 'minecraft:smooth_quartz_stairs');
  assert.deepEqual(bloecke.statesOf('stone_brick_stairs@o'), [['upside_down_bit', 'byte', 0], ['weirdo_direction', 'int', 0]]);
  assert.deepEqual(bloecke.statesOf('stone_brick_stairs@w'), [['upside_down_bit', 'byte', 0], ['weirdo_direction', 'int', 1]]);
  assert.deepEqual(bloecke.statesOf('stone_brick_stairs@s'), [['upside_down_bit', 'byte', 0], ['weirdo_direction', 'int', 2]]);
  assert.deepEqual(bloecke.statesOf('dark_oak_stairs@n_oben'), [['upside_down_bit', 'byte', 1], ['weirdo_direction', 'int', 3]]);
  const te = nbt.read(bloecke.paletteEntry('brick_stairs@s_oben'));
  const st = te.tag.v.get('states').v;
  assert.equal(st.get('upside_down_bit').t, nbt.T.BYTE);
  assert.equal(st.get('weirdo_direction').t, nbt.T.INT);
  assert.equal(st.get('weirdo_direction').v, 2);
  assert.throws(() => bloecke.bedrockName('gibt_es_nicht'), /unbekannter Blocktyp/);
});

// ---- Export mit Fixture-Projekt ----
function fixtureProjekt(root, id, boxen) {
  const dir = path.join(root, id);
  fs.mkdirSync(path.join(dir, 'model'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'project.json'), JSON.stringify({ id, title: 'Testprojekt', type: 'wahrzeichen', ohneMaske: true }));
  const code = boxen.map((b, i) => `  ctx.part('p${i}').fill(box(${b.slice(0, 6).join(',')}), '${b[6]}');`).join('\n');
  fs.writeFileSync(path.join(dir, 'model', 'm1_t.js'), `'use strict';\nmodule.exports = { module: 1, build(ctx) {\n  const { box } = ctx.shapes;\n${code}\n} };\n`);
}

// Ein Platzhalter-Haus für die Tests: Gebäude ohne Projekt, eher quadratisch
function testHaus() {
  const geb = require('../../data/stadt/gebaeude.json').gebaeude;
  const vor = require('../../data/stadt/vorrang.json').ids;
  for (const b of geb) {
    if (vor[b.id] || b.hoeheBl < 10 || b.hoeheBl > 40 || b.polygon.loecher.length) continue;
    const cells = [];
    fillPolygon(b.polygon, (z, xa, xb) => { for (let x = xa; x <= xb; x++) cells.push([x, z]); });
    if (cells.length < 60 || cells.length > 400) continue;
    const set = new Set(cells.map((c) => c.join(',')));
    const innen = cells.filter(([x, z]) => [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dz]) => set.has((x + dx) + ',' + (z + dz))));
    const rand = cells.filter(([x, z]) => ![[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dz]) => set.has((x + dx) + ',' + (z + dz))));
    if (!innen.length || !rand.length) continue;
    return { b, innen: innen[0], rand: rand[0], cells, set };
  }
  throw new Error('kein Testhaus');
}

test('Kleinexport: Fixture-Projekt, Gelände, Säulenregel, Platzhalter, Spieler bleibt erhalten', () => {
  const haus = testHaus();
  const [hx, hz] = haus.innen;
  const gy = (x, z) => GEL.groundTopY(x, z);
  const projRoot = tmp('projekte');
  const ziel = tmp('welt');
  // Projekt: Fundamentsäule tief unter dem Boden (Säulenregel) und ein 1x1-Pfeiler mitten im Haus
  const fx = hx + 40, fz = hz;
  fixtureProjekt(projRoot, 'testturm', [
    [fx, 40, fz, fx, 41, fz, 'cobblestone'],
    [fx + 3, 90, fz, fx + 5, 95, fz + 2, 'stone_bricks'],
    [hx, gy(hx, hz) + 1, hz, hx, gy(hx, hz) + 2, hz, 'gold_block']
  ]);
  // vorhandene Welt mit Spielerdaten
  fs.mkdirSync(path.join(ziel, 'db'));
  const w0 = new ldb.DbWriter(path.join(ziel, 'db'), { level: 1 });
  const spieler = Buffer.from('SPIELERDATEN-' + 'x'.repeat(300));
  w0.add(Buffer.from('player_server_abc'), Buffer.from('zweiter'));
  w0.add(Buffer.from('~local_player'), spieler);
  w0.close();

  const bereich = { x0: hx - 20, x1: fx + 20, z0: hz - 20, z1: hz + 20 };
  const log = [];
  const opts = { ziel, bereich, registry: { projectsRoot: projRoot, entries: [] }, log: (s) => log.push(s) };
  const r = exportWorld(opts);
  assert.deepEqual(r.projekte, ['testturm']);
  assert.ok(r.chunks >= 6 && r.subchunks > 40 && r.bloecke > 100000);
  assert.ok(r.haeuser >= 1);
  assert.equal(r.spieler, 2);

  const punkte = [[fx, 41, fz], [hx, 70, hz], [haus.rand[0], 70, haus.rand[1]]];
  for (let dx = 0; dx <= 8; dx++) punkte.push([fx + dx, 60, fz + 2]);
  punkte.push([hx + 5, 64, hz + 5], [hx, 64, hz]);
  const w = openWorld(ziel, { punkte, verify: true });
  assert.equal(w.levelName(), 'Florenz Voxelmodell');
  const lvl = w.levelDat();
  assert.equal(lvl.GameType, 1); assert.equal(lvl.LevelName, 'Florenz Voxelmodell');
  assert.equal(lvl.dodaylightcycle, 0); assert.equal(lvl.cheatsEnabled, 1);
  assert.deepEqual(lvl.lastOpenedWithVersion, [1, 26, 45, 1, 0]);
  // Spieler bleibt
  assert.ok(w.player().equals(spieler));
  assert.equal(w.player('player_server_abc').toString(), 'zweiter');
  // Säulenregel: Gelände nur bis min(y)-1 = 39, Projektblöcke gewinnen
  assert.equal(w.blockAt(fx, 41, fz), 'minecraft:cobblestone');
  assert.equal(w.blockAt(fx, 40, fz), 'minecraft:cobblestone');
  assert.notEqual(w.blockAt(fx, 39, fz), 'minecraft:air');
  assert.equal(w.blockAt(fx, 42, fz), 'minecraft:air');
  assert.equal(w.blockAt(fx, gy(fx, fz), fz), 'minecraft:air');
  // Unter dem Turm: Gelände bis y 89 nicht, weil es nur bis min-1 reicht (min = 90): Gelände liegt tiefer, also unverändert
  assert.equal(w.blockAt(fx + 4, 90, fz + 1), 'minecraft:stone_bricks');
  assert.equal(w.blockAt(fx + 4, 96, fz + 1), 'minecraft:air');
  // Platzhalter: Dach auf bodenY + hoeheBl, Wand in Putzfarbe, innen hohl; nie auf Projektzellen
  const dach = Math.min(319, haus.b.bodenY + haus.b.hoeheBl);
  const [rx, rz] = haus.rand;
  assert.equal(w.blockAt(rx, dach, rz), 'minecraft:hardened_clay');
  assert.notEqual(w.blockAt(rx, gy(rx, rz) + 3, rz), 'minecraft:air', 'Wand');
  assert.equal(w.blockAt(hx, gy(hx, hz) + 1, hz), 'minecraft:gold_block');
  assert.equal(w.blockAt(hx, gy(hx, hz) + 3, hz), 'minecraft:air', 'Projektspalte ohne Haus');
  assert.equal(w.blockAt(hx, dach, hz), 'minecraft:air');

  // Zweiter Export über denselben Zielordner: Spieler bleibt, level.dat bleibt (nur LastPlayed neu)
  const lvlVorher = fs.readFileSync(path.join(ziel, 'level.dat'));
  const r2 = exportWorld({ ...opts, now: 2000000000 });
  assert.equal(r2.spieler, 2);
  const w2 = openWorld(ziel, { punkte: [[fx, 41, fz]] });
  assert.ok(w2.player().equals(spieler));
  assert.equal(w2.blockAt(fx, 41, fz), 'minecraft:cobblestone');
  assert.equal(w2.levelDat().LastPlayed, 2000000000n);
  assert.equal(w2.levelDat().SpawnX, lvl.SpawnX);
  assert.ok(lvlVorher.length > 1000);
  assert.ok(!fs.existsSync(path.join(ziel, 'db.neu')) && !fs.existsSync(path.join(ziel, 'db.alt')));

  // Ohne Platzhalter keine Häuser
  const ziel3 = tmp('welt3');
  const r3 = exportWorld({ ...opts, ziel: ziel3, platzhalter: false });
  assert.equal(r3.haeuser, 0);
  const ox = fx + 8, oz = fz + 2, top = gy(ox, oz);
  const w3 = openWorld(ziel3, { punkte: [[rx, dach, rz], [ox, 0, oz]] });
  assert.equal(w3.blockAt(rx, dach, rz), 'minecraft:air');
  // Gelände frei stehend (ohne Platzhalter): Oberfläche und Schichten
  assert.notEqual(w3.blockAt(ox, top, oz), 'minecraft:air');
  assert.equal(w3.blockAt(ox, top + 1, oz), 'minecraft:air');
  assert.equal(w3.blockAt(ox, -64, oz), 'minecraft:bedrock');
  assert.equal(w3.blockAt(ox, -30, oz), 'minecraft:stone');
  // Höhenkarte
  const d = w3.data3D(ox >> 4, oz >> 4);
  assert.equal(d.heights[(oz & 15) * 16 + (ox & 15)], top + 65);
  assert.equal(w3.versionTag(ox >> 4, oz >> 4), 42);
  assert.equal(w3.finalized(ox >> 4, oz >> 4), 2);

  for (const d of [projRoot, ziel, ziel3]) fs.rmSync(d, { recursive: true, force: true });
});

test('LOCK-Schutz: gesperrte db/LOCK bricht den Export ab und lässt die Welt unberührt', { skip: process.platform !== 'win32' && 'nur Windows' }, async () => {
  const ziel = tmp('lock');
  fs.mkdirSync(path.join(ziel, 'db'));
  const w0 = new ldb.DbWriter(path.join(ziel, 'db'), { level: 1 });
  w0.add(Buffer.from('~local_player'), Buffer.from('daten'));
  w0.close();
  const lock = path.join(ziel, 'db', 'LOCK').replace(/'/g, "''");
  const child = cp.spawn('powershell', ['-NoProfile', '-NonInteractive', '-Command',
    `$f=[IO.File]::Open('${lock}','Open','ReadWrite','None'); Write-Host READY; Start-Sleep 30`], { stdio: ['ignore', 'pipe', 'ignore'] });
  try {
    await new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('PowerShell startet nicht')), 20000);
      child.stdout.on('data', (d) => { if (String(d).includes('READY')) { clearTimeout(t); resolve(); } });
      child.on('error', reject);
    });
    assert.throws(() => exportWorld({ ziel, bereich: { x0: 0, x1: 15, z0: 0, z1: 15 }, registry: { entries: [], projectsRoot: tmp('leer') }, log: () => {} }),
      (e) => e instanceof WeltOffenFehler && /verlassen/.test(e.message));
  } finally {
    child.kill();
    await new Promise((r) => setTimeout(r, 500));
  }
  assert.equal(ldb.readDb(path.join(ziel, 'db')).get(Buffer.from('~local_player')).toString(), 'daten');
  fs.rmSync(ziel, { recursive: true, force: true });
});

test('Zielordner: minecraft.local.json (Feld welt) vor Standardordner', () => {
  const { zielAusKonfig, standardZiel } = require('../minecraft/export.js');
  const root = tmp('konfig');
  assert.equal(zielAusKonfig(root), null);
  fs.writeFileSync(path.join(root, 'minecraft.local.json'), JSON.stringify({ welt: 'irgendwo/florenz_voxelmodell' }));
  assert.equal(zielAusKonfig(root), path.resolve(root, 'irgendwo/florenz_voxelmodell'));
  assert.equal(standardZiel(root), path.join(root, 'build', 'minecraft', 'florenz_voxelmodell'));
  fs.rmSync(root, { recursive: true, force: true });
});
