'use strict';
// Weltaufbau: lädt Modul-Dateien, baut sie in ein VoxelGrid und sammelt die Bauteile.

const fs = require('node:fs');
const path = require('node:path');
const { VoxelGrid, VoxelConflictError, packKey } = require('../geom/grid.js');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_MODEL_DIR = __dirname;
const DEFAULT_CONTENT_DIR = path.join(ROOT, 'content', 'steps_de');
const OPTIONAL_LIBS = ['arches', 'vaults', 'patterns', 'dome', 'roofs'];
const ID_RE = /^[a-z][a-z0-9_]*$/;
// Deklarierte Öffnungen (BEGEHBARKEIT.md §3): Luftzellen einer Tür, eines Tores usw.
const OEFFNUNG_ARTEN = ['tuer', 'tor', 'fenster_offen', 'arkade', 'loggia', 'scharte', 'relief'];

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
    const m = /^m(\d{1,3})_.+\.js$/.exec(f);
    if (m && !out.has(Number(m[1]))) out.set(Number(m[1]), path.join(modelDir, f));
  }
  return out;
}

// Generator-Projekte: Module entstehen aus Daten, nicht aus Dateien. "quartier": Isolati (tools/city/quartier.js),
// "stadtgrund": Kacheln (tools/city/stadtgrund.js). Ein Generator liefert { moduleNummern(), moduleBuild(n), contentFor(n) }.
const GENERATOREN = {
  quartier: () => require('../city/quartier.js').loadQuartier,
  stadtgrund: () => require('../city/stadtgrund.js').loadStadtgrund
};
const generatorVon = (project) => (project && project.meta && GENERATOREN[project.meta.generator]) || null;
const isQuartier = (project) => !!(project && project.meta && project.meta.generator === 'quartier');
const isGeneriert = (project) => !!generatorVon(project);
/** Unabhängige Module (Stadtgrund, ARCHITEKTUR §10 S0): jedes Modul wird für sich in einem eigenen Grid gebaut. */
const isUnabhaengig = (project) => !!(project && project.meta && project.meta.unabhaengig === true);
const ladeGenerator = (project) => generatorVon(project)()(project);

/** Modulnummern eines Projekts (Dateien mN_*.js bzw. Generator). Bei Generatorfehlern: { numbers: [], error }. */
function listModules(project, modelDir) {
  if (isGeneriert(project)) {
    try {
      return { numbers: ladeGenerator(project).moduleNummern(), error: null };
    } catch (e) {
      return { numbers: [], error: e };
    }
  }
  return { numbers: [...discoverModuleFiles(modelDir || project.modelDir).keys()].sort((a, b) => a - b), error: null };
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
  const generiert = isGeneriert(project);
  let q = null;
  const files = new Map();
  const result = [];
  const oeffnungen = [];     // [{ module, part, art, keys }] (keys: gepackte Zellschlüssel der Luftzellen)
  const grundrisse = new Map(); // "modul|bauteil" -> Set(x * 65536 + z): Grundrissspalten (R13 bei Häusern)
  const unzugaenglich = [];  // [{ module, part, begruendung, keys }]
  const zellKeys = (zellen) => {
    const keys = [];
    for (const c of zellen) {
      const x = Array.isArray(c) ? c[0] : c.x, y = Array.isArray(c) ? c[1] : c.y, z = Array.isArray(c) ? c[2] : c.z;
      keys.push(packKey(x, y, z));
    }
    return keys;
  };
  if (generiert) {
    try {
      q = ladeGenerator(project);
      for (const n of q.moduleNummern()) files.set(n, null);
    } catch (e) {
      errors.push({ rule: 'LOAD', module: null, part: null, message: `Projekt ${project.id}: ${e.message}` });
    }
  } else {
    for (const [n, f] of discoverModuleFiles(modelDir)) files.set(n, f);
  }
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

  for (const n of wanted) {
    const file = files.get(n);
    if (!generiert && !file) {
      warnings.push(`Keine Moduldatei m${n}_*.js in ${modelDir}`);
      continue;
    }
    let mod;
    try {
      mod = generiert ? q.moduleBuild(n) : require(file);
    } catch (e) {
      errors.push({ rule: 'LOAD', module: n, part: null, message: `Modul ${n}: Datei nicht ladbar: ${e.message}` });
      continue;
    }
    if (!mod || mod.module !== n || typeof mod.build !== 'function') {
      errors.push({ rule: 'LOAD', module: n, part: null,
        message: `Modul ${n}: ${path.basename(file)} muss { module: ${n}, build(ctx) } exportieren` });
      continue;
    }

    let content, cErr, cRel;
    if (generiert) {
      content = q.contentFor(n);
    } else {
      ({ content, error: cErr } = loadContent(contentDir, n));
      cRel = rel(path.join(contentDir, `modul_${n}.json`), project);
      if (cErr) warnings.push(`Modul ${n}: ${cRel} nicht lesbar (${cErr})`);
      else if (!content) warnings.push(`Modul ${n}: kein Content (${cRel}), Platzhalter`);
    }
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
      },
      // Öffnung deklarieren: zellen = Luftzellen [{x,y,z}] oder [[x,y,z]]; art in tuer|tor|fenster_offen|arkade|loggia|scharte|relief (Relieffuge)
      oeffnung(zellen, art) {
        if (!OEFFNUNG_ARTEN.includes(art)) throw new TypeError(`oeffnung: art muss ${OEFFNUNG_ARTEN.join('|')} sein: ${art}`);
        oeffnungen.push({ module: n, part: current, art, keys: zellKeys(zellen) });
      },
      // Grundriss des aktuellen Bauteils (Säulen [x, z]); R13 nutzt ihn als Innenbereich eines Hauses
      grundriss(spalten) {
        const s = new Set();
        for (const c of spalten) s.add((Array.isArray(c) ? c[0] : c.x) * 65536 + (Array.isArray(c) ? c[1] : c.z));
        grundrisse.set(n + "|" + current, s);
      },
      // Zellen, die bewusst nicht erreichbar sind (R13), mit Begründung
      unzugaenglich(zellen, begruendung) {
        if (typeof begruendung !== 'string' || !begruendung.trim()) throw new TypeError('unzugaenglich: Begründung ist Pflicht');
        unzugaenglich.push({ module: n, part: current, begruendung, keys: zellKeys(zellen) });
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
  return { grid, modules: result, errors, warnings, modelDir, contentDir, project: projectMeta, oeffnungen, unzugaenglich, grundrisse };
}

module.exports = { OEFFNUNG_ARTEN, buildWorld, discoverModuleFiles, listModules, isQuartier, isGeneriert, isUnabhaengig, ladeGenerator,
  DEFAULT_MODEL_DIR, DEFAULT_CONTENT_DIR };
