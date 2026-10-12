'use strict';
// Projekt-Auflösung (ARCHITEKTUR §10): Registry (tools/spec/projects.js) plus Ordnerkonvention projects/<id>/.

const fs = require('node:fs');
const path = require('node:path');
const { makeProvider } = require('./validate/ground.js');

const ROOT = path.resolve(__dirname, '..');
const TYPES = ['wahrzeichen', 'quartier', 'stadtgrund'];
const ID_RE = /^[a-z][a-z0-9_-]*$/;
const EMPTY_INTERFACES = Object.freeze({ SUPPORTS: [], OWNERSHIP: [], RESERVED: [] });

const isFile = (p) => { try { return fs.statSync(p).isFile(); } catch (e) { return false; } };
const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch (e) { return false; } };

function meta(p) {
  const { id, title, type, ...rest } = p.json || {};
  return Object.freeze({ ...rest, id: p.id, title: p.title, type: p.type });
}

// Registrierter Eintrag -> aufgelöstes Projekt (absolute Pfade)
function fromEntry(e, root) {
  const abs = (rel) => (rel ? path.resolve(root, rel) : null);
  const p = {
    id: e.id, title: e.title, type: e.type, registered: true,
    modelDir: abs(e.modelDir), contentDir: abs(e.contentDir),
    interfacesFile: abs(e.interfaces), groundFile: abs(e.ground),
    webDataDir: abs(e.webDataDir), docs: e.docs || 'project',
    docsDir: e.docs && e.docs !== 'project' ? null : abs(e.docsDir || path.join('projects', e.id, 'docs')),
    dir: null, json: null
  };
  p.legacy = p.docs === 'legacy-duomo';
  p.meta = meta(p);
  return p;
}

// Ordner projects/<id>/ -> aufgelöstes Projekt oder Problemtext
function fromFolder(name, dir, root) {
  const jf = path.join(dir, 'project.json');
  if (!isFile(jf)) return { problem: `projects/${name}: project.json fehlt` };
  let json;
  try { json = JSON.parse(fs.readFileSync(jf, 'utf8')); } catch (e) {
    return { problem: `projects/${name}/project.json nicht lesbar (${e.message})` };
  }
  if (!json || typeof json !== 'object') return { problem: `projects/${name}/project.json: Objekt erwartet` };
  if (json.id !== name) return { problem: `projects/${name}/project.json: id "${json.id}" passt nicht zum Ordnernamen` };
  if (!ID_RE.test(json.id)) return { problem: `projects/${name}: ungültige id (erlaubt ${ID_RE})` };
  if (!TYPES.includes(json.type)) return { problem: `projects/${name}: type muss ${TYPES.join('|')} sein` };
  if (typeof json.title !== 'string' || !json.title) return { problem: `projects/${name}: title fehlt` };
  const sub = (...p) => path.join(dir, ...p);
  const iface = sub('spec', 'interfaces.js');
  const ground = sub('spec', 'ground.js');
  const p = {
    id: json.id, title: json.title, type: json.type, registered: false,
    modelDir: sub('model'), contentDir: sub('content'),
    interfacesFile: isFile(iface) ? iface : null, groundFile: isFile(ground) ? ground : null,
    webDataDir: path.join(root, 'webapp', 'data', json.id), docs: 'project', docsDir: sub('docs'),
    dir, json, legacy: false
  };
  p.meta = meta(p);
  return { project: p };
}

/**
 * loadRegistry({ root?, projectsRoot?, entries? }) -> { projects: [...], problems: [Text] }
 * entries ersetzt die Registry (tools/spec/projects.js), nur für Tests.
 * Reihenfolge: registrierte Projekte, dann entdeckte Ordner alphabetisch.
 */
function loadRegistry(opts = {}) {
  const root = opts.root || ROOT;
  const projectsRoot = opts.projectsRoot || path.join(root, 'projects');
  const PROJECTS = opts.entries || require('./spec/projects.js').PROJECTS;
  const projects = PROJECTS.map((e) => fromEntry(e, root));
  const problems = [];
  const ids = new Set(projects.map((p) => p.id));
  if (isDir(projectsRoot)) {
    for (const ent of fs.readdirSync(projectsRoot, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
      if (!ent.isDirectory()) continue;
      const r = fromFolder(ent.name, path.join(projectsRoot, ent.name), root);
      if (r.problem) { problems.push(r.problem); continue; }
      if (ids.has(r.project.id)) { problems.push(`projects/${ent.name}: id "${r.project.id}" ist schon registriert`); continue; }
      ids.add(r.project.id);
      projects.push(r.project);
    }
  }
  return { projects, problems, root, projectsRoot };
}

function getProject(id, opts) {
  const reg = loadRegistry(opts);
  const p = reg.projects.find((q) => q.id === id);
  if (!p) {
    const known = reg.projects.map((q) => q.id).join(', ');
    throw new Error(`Unbekanntes Projekt "${id}" (bekannt: ${known})`);
  }
  return p;
}

// Lädt Schnittstellen und Boden-Provider eines Projekts
function loadSpecs(project) {
  const interfaces = project.interfacesFile ? require(project.interfacesFile) : EMPTY_INTERFACES;
  const ground = makeProvider(project.groundFile ? require(project.groundFile) : null);
  return { interfaces, ground };
}

module.exports = { loadRegistry, getProject, loadSpecs, TYPES, EMPTY_INTERFACES, ROOT };
