'use strict';
// Webapp-Daten V3 (B1): Stadtbasis, Projektindex, V3-Loader (im vm-Sandkasten, ohne Browser).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sb = require('../emit/stadtbasis.js');
const wi = require('../emit/webindex.js');

const ROOT = path.resolve(__dirname, '..', '..');
const WEB = path.join(ROOT, 'webapp');

function decodeRing(arr) {
  const pts = [];
  let x = 0, z = 0;
  for (let i = 0; i < arr.length; i += 2) {
    x = i === 0 ? arr[0] : x + arr[i]; z = i === 0 ? arr[1] : z + arr[i + 1];
    pts.push([x / 2, z / 2]);
  }
  return pts;
}

test('Ringkodierung: Rundlauf und Vereinfachung', () => {
  const ring = [[0, 0], [10, 0], [10, 0.2], [10, 10], [0, 10]];
  const s = sb.simplifyRing(ring, 0.9);
  assert.ok(s.length <= 4 && s.length >= 4, 'fast kollineare Punkte entfallen');
  const enc = sb.encodeRing(s, true);
  const back = decodeRing(enc);
  assert.equal(back.length, s.length);
  back.forEach((p, i) => { assert.ok(Math.abs(p[0] - s[i][0]) <= 0.25 && Math.abs(p[1] - s[i][1]) <= 0.25); });
  assert.equal(sb.encodeRing([[0, 0], [0, 0], [1, 1]], true), null, 'weniger als 3 Punkte');
});

test('Stadtbasis: Größe, Gelände, Gebäude, Wahrzeichen', () => {
  const { basis } = sb.build();
  const text = JSON.stringify(basis);
  assert.ok(text.length < 6 * 1048576, `Größe ${text.length}`);
  const t = basis.terrain;
  assert.equal(t.step, 4);
  assert.equal(Buffer.from(t.data, 'base64').length, t.width * t.height * 2);
  assert.ok(t.yMin >= 32 && t.yMax <= 203);
  assert.equal(basis.buildings.length, 7106);
  const b = basis.buildings[0];
  for (const k of ['i', 'h', 'b', 'r', 'w', 'o']) assert.ok(b[k] !== undefined, k);
  assert.ok(basis.buildings.every((x) => x.o.length > 0 && x.r >= 0 && x.r < 4));
  assert.ok(basis.water.length > 0 && basis.streets.length > 1000 && basis.squares.length > 10 && basis.green.length > 10);
  const pv = basis.landmarks.find((l) => l.id === 'palazzo_vecchio');
  assert.ok(pv && pv.gebaeude.length === 1 && Number.isFinite(pv.x));
  // Dom-Mitte liegt auf Domplatz-Höhe
  const c = Math.floor((0 - t.x0) / 4), r = Math.floor((0 - t.z0) / 4);
  const y = Buffer.from(t.data, 'base64').readInt16LE((r * t.width + c) * 2);
  assert.ok(y >= 63 && y <= 66, `Domplatz Y ${y}`);
});

test('Projektindex: Dom gebaut, Wahrzeichen geplant, Demo ausgeschlossen', () => {
  const idx = wi.buildIndex();
  const duomo = idx.find((e) => e.id === 'duomo');
  assert.equal(duomo.status, 'gebaut');
  assert.equal(duomo.modules.length, 10);
  assert.deepEqual(duomo.gebaeude.slice().sort(), wi.DOM_IDS.slice().sort());
  assert.ok(duomo.bounds.x0 < -300 && duomo.bounds.y1 === 293);
  assert.equal(duomo.modules.reduce((a, m) => a + m.blocks, 0), 908560); // B5: begehbar (Stand 14.10.2026)
  assert.ok(duomo.modules.every((m) => fs.existsSync(path.join(WEB, m.file))));
  assert.ok(!idx.some((e) => e.id.startsWith('_')), 'kein Demo im Index');
  const planned = idx.filter((e) => e.status === 'geplant');
  assert.ok(planned.length >= 20);
  // Brücken sind keine OSM-Gebäude: ohne Gebäude-IDs, aber mit Position
  assert.ok(planned.every((e) => e.modules.length === 0 && (e.bounds || (Number.isFinite(e.x) && Number.isFinite(e.z)))));
  // geplant oder schon gebaut: gebaute Wahrzeichen übernehmen die Gebäude-IDs ihrer Platzhalter
  assert.ok(idx.filter((e) => e.type === 'wahrzeichen' && e.gebaeude.length > 0).length >= 18);
  assert.ok(!planned.some((e) => e.gebaeude.some((g) => wi.DOM_IDS.includes(g))));
  assert.equal(new Set(idx.map((e) => e.id)).size, idx.length);
});

// Minimaler Browser-Sandkasten: <script>-Einfügen lädt Dateien aus webapp/
function makeBrowser(search) {
  const win = { location: { search: search || '' } };
  const ctx = vm.createContext(win);
  win.window = win;
  win.document = {
    head: {
      appendChild(el) {
        const file = path.join(WEB, el.src);
        setImmediate(() => {
          if (!fs.existsSync(file)) { el.onerror(); return; }
          vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
          el.onload();
        });
      }
    },
    createElement() { return {}; }
  };
  win.atob = (s) => Buffer.from(s, 'base64').toString('binary');
  win.URLSearchParams = URLSearchParams;
  const run = (rel) => vm.runInContext(fs.readFileSync(path.join(WEB, rel), 'utf8'), ctx, { filename: rel });
  return { win, run };
}

test('V3-Loader: Demo nur mit ?demo=1, Module laden, Welt füllen', async () => {
  const off = makeBrowser('');
  off.run('data/projekte.js'); off.run('js/data/v3-loader.js');
  await off.win.ProjectLoader.loadDemoIfRequested();
  assert.equal(off.win.ProjectLoader.entry('_demo'), null);

  const b = makeBrowser('?demo=1');
  b.run('data/projekte.js'); b.run('js/data/v3-loader.js'); b.run('js/engine/chunk-mesher.js');
  const L = b.win.ProjectLoader;
  await L.loadDemoIfRequested();
  const e = L.entry('_demo');
  assert.ok(e && e.demo === true);
  const proj = await L.loadProject('_demo');
  assert.equal(proj.modules.length, 1);
  assert.equal(proj.modules[0].steps.length, 3);
  const nBlocks = proj.modules[0].steps.reduce((a, s) => a + s.blocks.length, 0);
  assert.equal(nBlocks, e.modules[0].blocks);
  const world = L.worldFor('_demo');
  const n = await L.fillWorld(world, '_demo');
  assert.equal(n, nBlocks);
  assert.equal(world.blockCount(), nBlocks);
  let quads = 0;
  world.chunks.forEach((c) => { const m = b.win.ChunkMesher.meshChunk(world, c.cx, c.cz); if (m) quads += m.quads; });
  assert.ok(quads > 0 && quads < nBlocks * 6);
  await assert.rejects(() => L.loadProject('gibt_es_nicht'));
});
