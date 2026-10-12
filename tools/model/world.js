'use strict';
// Weltaufbau: lädt Modul-Dateien, baut sie in ein VoxelGrid und sammelt die Bauteile.

const fs = require('node:fs');
const path = require('node:path');
const { VoxelGrid, VoxelConflictError } = require('../geom/grid.js');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_MODEL_DIR = __dirname;
const DEFAULT_CONTENT_DIR = path.join(ROOT, 'content', 'steps_de');
const OPTIONAL_LIBS = ['arches', 'vaults', 'patterns', 'dome', 'roofs'];
const ID_RE = /^[a-z][a-z0-9_]*$/;

function loadOptional(name, warnings) {
  const file = path.join(__dirname, '..', 'geom', name + '.js');
  if (!fs.existsSync(file)) {
    warnings.push(`Bibliothek tools/geom/${name}.js fehlt, ctx.${name} = null`);
    return null;
  }
  try {
    return require(file);
  } catch (e) {
    warnings.push(`Bibliothek tools/geom/${name}.js nicht ladbar (${e.message}), ctx.${name} = null`);
    return null;
  }
}

// Vorhandene Moduldateien: Map N -> Dateipfad
function discoverModuleFiles(modelDir) {
  const out = new Map();
  if (!fs.existsSync(modelDir)) return out;
  for (const f of fs.readdirSync(modelDir).sort()) {
    const m = /^m(\d)_.+\.js$/.exec(f);
    if (m && !out.has(Number(m[1]))) out.set(Number(m[1]), path.join(modelDir, f));
  }
  return out;
}

function loadContent(contentDir, n) {
  const file = path.join(contentDir, `modul_${n}.json`);
  if (!fs.existsSync(file)) return { content: null, file };
  try {
    return { content: JSON.parse(fs.readFileSync(file, 'utf8')), file };
  } catch (e) {
    return { content: null, file, error: e.message };
  }
}

// Anzeigepfad: relativ zum Repository, bei Projektordnern als projects/<id>/…
function rel(p, project) {
  const from = project && project.dir ? project.dir : ROOT;
  const r = path.relative(from, p).split(path.sep).join('/');
  return project && project.dir ? `projects/${project.id}/${r}` : r;
}

/**
 * buildWorld({ modules, modelDir, contentDir, project, interfaces })
 * project: aufgelöstes Projekt (tools/projects.js); liefert modelDir, contentDir, Schnittstellen und ctx.project.
 * Ohne project gilt der Dom (V2-Verhalten).
 * -> { grid, modules: [{ module, meta, content, parts: [{ id, opts, keys }] }], errors, warnings }
 * errors: [{ rule, module, part, message }]
 */
function buildWorld(opts = {}) {
  const { modules, project } = opts;
  const modelDir = opts.modelDir || (project ? project.modelDir : DEFAULT_MODEL_DIR);
  const contentDir = opts.contentDir || (project ? project.contentDir : DEFAULT_CONTENT_DIR);
  const interfaces = opts.interfaces || (project ? require('../projects.js').loadSpecs(project).interfaces
    : require('../spec/interfaces.js'));
  const projectMeta = project ? project.meta : Object.freeze({ id: 'duomo', title: 'Santa Maria del Fiore', type: 'wahrzeichen' });
  const warnings = [];
  const errors = [];
  const grid = new VoxelGrid();
  const files = discoverModuleFiles(modelDir);
  const wanted = (modules ? [...new Set(modules)] : [...files.keys()]).sort((a, b) => a - b);

  const libs = {};
  for (const n of OPTIONAL_LIBS) libs[n] = loadOptional(n, warnings);
  const base = {
    dims: require('../spec/dimensions.js'),
    palette: require('../spec/palette.js'),
    interfaces,
    project: projectMeta,
    frame: require('../spec/frame.js'),
    shapes: require('../geom/shapes.js'),
    ...libs,
    grid: { has: (x, y, z) => grid.has(x, y, z) }
  };

  const result = [];
  for (const n of wanted) {
    const file = files.get(n);
    if (!file) {
      warnings.push(`Keine Moduldatei m${n}_*.js in ${modelDir}`);
      continue;
    }
    let mod;
    try {
      mod = require(file);
    } catch (e) {
      errors.push({ rule: 'LOAD', module: n, part: null, message: `Modul ${n}: Datei nicht ladbar: ${e.message}` });
      continue;
    }
    if (!mod || mod.module !== n || typeof mod.build !== 'function') {
      errors.push({ rule: 'LOAD', module: n, part: null,
        message: `Modul ${n}: ${path.basename(file)} muss { module: ${n}, build(ctx) } exportieren` });
      continue;
    }

    const { content, error: cErr } = loadContent(contentDir, n);
    const cRel = rel(path.join(contentDir, `modul_${n}.json`), project);
    if (cErr) warnings.push(`Modul ${n}: ${cRel} nicht lesbar (${cErr})`);
    else if (!content) warnings.push(`Modul ${n}: kein Content (${cRel}), Platzhalter`);
    const meta = {
      title: (content && content.title) || `Modul ${n}`,
      subtitle: (content && content.subtitle) || '',
      icon: (content && content.icon) || '⛪'
    };

    const rec = { module: n, meta, content, parts: [] };
    result.push(rec);
    const ids = new Set();
    let current = null;
    const ctx = {
      ...base,
      part(id, opts) {
        if (typeof id !== 'string' || !ID_RE.test(id)) {
          throw new TypeError(`Bauteil-ID muss snake_case sein: ${id}`);
        }
        if (ids.has(id)) throw new Error(`Bauteil-ID doppelt registriert: ${id} (Modul ${n})`);
        ids.add(id);
        const w = grid.writer({ module: n, part: id }, { trackKeys: true });
        const part = { id, opts: opts || {}, keys: w.keys };
        rec.parts.push(part);
        current = id;
        return w;
      }
    };
    try {
      mod.build(ctx);
    } catch (e) {
      if (e instanceof VoxelConflictError) {
        errors.push({ rule: 'R1', module: n, part: current,
          message: `R1 Modul ${n}, Bauteil ${current}: Konflikt bei (${e.x},${e.y},${e.z}) zwischen Modul ${e.existing.module}/${e.existing.part} und Modul ${e.incoming.module}/${e.incoming.part}` });
      } else if (e instanceof RangeError) {
        errors.push({ rule: 'R6', module: n, part: current,
          message: `R6 Modul ${n}, Bauteil ${current}: ${e.message}` });
      } else {
        errors.push({ rule: 'BUILD', module: n, part: current,
          message: `Modul ${n}, Bauteil ${current}: ${e.message}` });
      }
    }
  }
  return { grid, modules: result, errors, warnings, modelDir, contentDir, project: projectMeta };
}

module.exports = { buildWorld, discoverModuleFiles, DEFAULT_MODEL_DIR, DEFAULT_CONTENT_DIR };
