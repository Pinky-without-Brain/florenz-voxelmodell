'use strict';
// Projektindex für die Webapp (V3 B1): webapp/data/projekte.js  (window.PROJECT_INDEX = [...])
// Ein Eintrag je registriertem Projekt (tools/projects.js) plus alle Wahrzeichen ohne Projekt als 'geplant'.
// status: 'gebaut' (Moduldaten vorhanden), 'in_arbeit' (Projekt registriert, noch keine Webdaten), 'geplant' (nur Wahrzeichen).
// Ordner unter webapp/data/ mit führendem Unterstrich (z. B. _demo) werden nie aufgenommen.

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { loadRegistry, ROOT } = require('../projects.js');
const { loadLandmarks } = require('./stadtbasis.js');

const DOM_IDS = ['w43768260', 'w251650632', 'w166821303']; // Kathedrale, Campanile, Baptisterium

function readModuleFile(file, projectId, isV2) {
  const sb = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sb, { filename: file });
  const w = sb.window;
  const n = Number(path.basename(file).match(/module_(\d+)\.js$/)[1]);
  return isV2 ? w.MODULE_DATA_V2[n] : w.PROJECT_DATA_V3[projectId][n];
}

// Bounding Box und Blockzahl aus den Base64-Läufen
function scanModule(data, bb) {
  let blocks = 0;
  for (const s of data.steps) {
    const buf = Buffer.from(s.runs, 'base64');
    for (let o = 0; o + 10 <= buf.length; o += 10) {
      const x = buf.readInt16LE(o), y = buf.readInt16LE(o + 2), z0 = buf.readInt16LE(o + 4), len = buf.readInt16LE(o + 6);
      blocks += len;
      if (x < bb.x0) bb.x0 = x; if (x > bb.x1) bb.x1 = x;
      if (y < bb.y0) bb.y0 = y; if (y > bb.y1) bb.y1 = y;
      if (z0 < bb.z0) bb.z0 = z0; if (z0 + len - 1 > bb.z1) bb.z1 = z0 + len - 1;
    }
  }
  return blocks;
}

function buildIndex(opts = {}) {
  const root = opts.root || ROOT;
  const reg = loadRegistry({ root, projectsRoot: opts.projectsRoot, entries: opts.entries });
  const { landmarks, byId } = loadLandmarks();
  const index = [];
  const taken = new Set(); // Gebäude-IDs, die ein Projekt ersetzt

  for (const p of reg.projects) {
    const isV2 = p.id === 'duomo';
    const dir = isV2 ? path.join(root, 'webapp', 'js', 'data', 'v2') : (p.webDataDir || path.join(root, 'webapp', 'data', p.id));
    const bb = { x0: Infinity, y0: Infinity, z0: Infinity, x1: -Infinity, y1: -Infinity, z1: -Infinity };
    const modules = [];
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter((f) => /^module_\d+\.js$/.test(f))
        .sort((a, b) => parseInt(a.slice(7), 10) - parseInt(b.slice(7), 10));
      for (const f of files) {
        const data = readModuleFile(path.join(dir, f), p.id, isV2);
        if (!data) continue;
        const blocks = scanModule(data, bb);
        const rel = path.relative(path.join(root, 'webapp'), path.join(dir, f)).split(path.sep).join('/');
        modules.push({ n: data.module, title: data.title, blocks, steps: data.steps.length, file: rel });
      }
    }
    const json = p.json || {};
    let gebaeude = Array.isArray(json.gebaeude) ? json.gebaeude.slice() : [];
    // Wahrzeichen-Zusatzmasken (z. B. Korridor): ihre Gebäude gehören ebenfalls dem Projekt
    for (const m of Object.values(json.masken && typeof json.masken === 'object' ? json.masken : {})) {
      for (const g of (m && m.gebaeude) || []) if (!gebaeude.includes(g)) gebaeude.push(g);
    }
    if (isV2) gebaeude = DOM_IDS.filter((id) => byId.has(id));
    gebaeude.forEach((g) => taken.add(g));
    const built = modules.length > 0;
    const e = {
      id: p.id, title: p.title, type: p.type,
      status: json.status || (built ? 'gebaut' : 'in_arbeit'),
      bounds: built ? { x0: bb.x0, z0: bb.z0, x1: bb.x1, z1: bb.z1, y0: bb.y0, y1: bb.y1 } : (json.bounds || null),
      modules, gebaeude
    };
    if (isV2) e.landmark = 'duomo';
    index.push(e);
  }

  // Wahrzeichen ohne Projekt
  const haveId = new Set(index.map((e) => e.id));
  for (const lm of landmarks) {
    if (haveId.has(lm.id) || lm.gebaeude.some((g) => taken.has(g))) continue;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const id of lm.gebaeude) {
      const b = byId.get(id);
      for (const r of b.polygon.aussen) for (const q of r) {
        x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); z0 = Math.min(z0, q[1]); z1 = Math.max(z1, q[1]);
      }
      y0 = Math.min(y0, b.bodenY); y1 = Math.max(y1, b.bodenY + b.hoeheBl);
    }
    index.push({
      id: lm.id, title: lm.name, type: 'wahrzeichen', status: 'geplant',
      bounds: lm.gebaeude.length ? { x0: Math.floor(x0), z0: Math.floor(z0), x1: Math.ceil(x1), z1: Math.ceil(z1), y0, y1 } : null,
      x: lm.x, z: lm.z, modules: [], gebaeude: lm.gebaeude
    });
  }
  return index;
}

function main() {
  const index = buildIndex();
  const out = path.join(ROOT, 'webapp', 'data', 'projekte.js');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const text = '// GENERIERT von tools/emit/webindex.js - nicht von Hand ändern.\n' +
    'window.PROJECT_INDEX = ' + JSON.stringify(index) + ';\n';
  fs.writeFileSync(out, text, 'utf8');
  console.log(`webapp/data/projekte.js: ${index.length} Einträge (${index.filter((e) => e.status === 'gebaut').length} gebaut), ${Buffer.byteLength(text)} Bytes`);
  return index;
}

if (require.main === module) main();
module.exports = { buildIndex, main, DOM_IDS };
