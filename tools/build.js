'use strict';
// Gesamtablauf (ARCHITEKTUR §8, §10): buildWorld -> planModule -> validate -> (optional) emit -> Bericht.
// Aufruf: node tools/build.js [--project <id> | --all] [--cross] [--modules 0,1,3] [--no-emit] [--strict] [--ohne-minecraft]
// Nach erfolgreichem Bau schreibt die Kommandozeile die Minecraft-Welt, wenn minecraft.local.json im Repo-Wurzelordner liegt.
// Ohne --project/--all/--cross wird nur der Dom (duomo) gebaut, wie in V2.

const fs = require('node:fs');
const path = require('node:path');
const { buildWorld, listModules, isQuartier, isUnabhaengig } = require('./model/world.js');
const { planModule } = require('./steps/planner.js');
const { validate, RULES } = require('./validate/index.js');
const { MAX_MODULE } = require('./geom/grid.js');
const { loadRegistry, loadSpecs, ROOT: REPO_ROOT } = require('./projects.js');

function parseArgs(argv) {
  const o = { modules: null, emit: true, strict: false, project: null, all: false, cross: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--no-emit') o.emit = false;
    else if (a === '--strict') o.strict = true;
    else if (a === '--all') o.all = true;
    else if (a === '--cross') o.cross = true;
    else if (a === '--ohne-minecraft') continue; // wirkt nur in der Kommandozeile (minecraftHook)
    else if (a === '--project') {
      o.project = argv[++i];
      if (!o.project || o.project.startsWith('--')) throw new Error('--project erwartet eine Projekt-ID');
    } else if (a === '--modules') {
      o.modules = (argv[++i] || '').split(',').filter(Boolean).map(Number);
      if (!o.modules.length || o.modules.some((n) => !Number.isInteger(n) || n < 0 || n > MAX_MODULE)) {
        throw new Error(`--modules erwartet eine Liste wie 0,1,3 (Zahlen 0..${MAX_MODULE})`);
      }
    } else throw new Error(`Unbekanntes Argument: ${a}`);
  }
  if (o.all && o.project && !o.cross) throw new Error('--all und --project schließen sich aus');
  return o;
}

const ms = (t0) => Number(process.hrtime.bigint() - t0) / 1e6;
const fmtMs = (v) => (v >= 1000 ? (v / 1000).toFixed(2) + ' s' : v.toFixed(0) + ' ms');
const mb = (bytes) => Math.round(bytes / 1048576);

/**
 * Baut ein Projekt. env: { root, projectsRoot }. Rückgabe: { code, report }.
 * Das Grid lebt nur innerhalb dieser Funktion.
 */
function buildProject(project, opts, env) {
  if (isUnabhaengig(project) && !opts._einzel) return buildUnabhaengig(project, opts, env);
  const root = env.root;
  const log = opts._leise ? () => {} : (...a) => console.log(...a);
  const tStart = process.hrtime.bigint();
  const specs = loadSpecs(project);
  const listing = opts._listing || listModules(project);
  const available = listing.numbers;
  let toBuild = available;
  let toEmit = available;
  if (opts._einzel) {
    // Einzelmodul eines Projekts mit unabhängigen Modulen: nur genau diese Module, eigenes Grid
    toBuild = opts.modules;
    toEmit = opts.modules;
  } else if (opts.modules) {
    const max = Math.max(...opts.modules);
    toBuild = available.filter((n) => n <= max);
    toEmit = opts.modules.filter((n) => available.includes(n));
    for (const n of opts.modules) if (!available.includes(n)) console.warn(`Warnung: Modul ${n} existiert nicht im Projekt`);
  }

  const errors = [], warnings = [];
  const timing = {};
  let t = process.hrtime.bigint();
  if (!available.length && !listing.error) {
    errors.push(isQuartier(project) ? `Projekt ${project.id}: keine Gebäude im Quartier` : `Projekt ${project.id}: keine Moduldateien mN_*.js in ${project.modelDir}`);
  }

  // 1) Welt
  const world = buildWorld({ modules: toBuild, project });
  timing.world = ms(t);
  for (const e of world.errors) errors.push(e.message);
  warnings.push(...world.warnings);

  // 2) Planer
  t = process.hrtime.bigint();
  const stepsByModule = {};
  for (const m of world.modules) {
    const steps = planModule(m, m.content, world.grid, { ground: specs.ground });
    stepsByModule[m.module] = steps;
    warnings.push(...steps.warnings);
  }
  timing.plan = ms(t);

  // 3) Prüfung
  t = process.hrtime.bigint();
  const common = { grid: world.grid, world, stepsByModule, root, ground: specs.ground,
    interfaces: specs.interfaces, project };
  const rules = validate({ ...common, only: RULES.map((r) => r[0]).filter((name) => name !== 'R9') });
  for (const r of rules) {
    errors.push(...r.errors);
    warnings.push(...r.warnings);
  }
  // Dokumentation: mit Emit zuerst schreiben, danach prüft R9 gegen die Platte (ohne Emit gegen den Bestand)
  const complete = !opts._einzel && toEmit.length === available.length;
  let docsEmitted = null;
  if (opts.emit && !errors.length) {
    const docModules = world.modules.filter((m) => toEmit.includes(m.module));
    docsEmitted = require('./emit/docs.js').emitDocs({ modules: docModules, stepsByModule, grid: world.grid, root,
      project, complete });
    log(`Doku: ${docsEmitted.files.length} Dateien, ${docsEmitted.changed.length} geändert`);
  }
  for (const r of validate({ ...common, only: ['R9'], docs: { modules: toEmit, complete } })) {
    errors.push(...r.errors);
    warnings.push(...r.warnings);
    rules.push(r);
  }
  rules.sort((a, b) => parseInt(a.rule.slice(1), 10) - parseInt(b.rule.slice(1), 10));
  timing.validate = ms(t);

  // 4) Emitter
  t = process.hrtime.bigint();
  const emitted = [];
  if (opts.emit) {
    const emitFile = path.join(__dirname, 'emit', 'data.js');
    if (!fs.existsSync(emitFile)) {
      warnings.push('Emitter fehlt (tools/emit/data.js)');
    } else if (errors.length) {
      warnings.push('Emit übersprungen wegen Fehlern');
    } else {
      const { emitModuleData } = require(emitFile);
      const outDir = project.webDataDir;
      for (const m of world.modules) {
        if (!toEmit.includes(m.module)) continue;
        const r = emitModuleData({ moduleMeta: { module: m.module, ...m.meta }, steps: stepsByModule[m.module],
          grid: world.grid, outDir, projectId: project.legacy ? undefined : project.id });
        emitted.push({ module: m.module, ...r });
      }
      if (!project.legacy && complete) {
        // Veraltete Moduldateien entfernen (Quartier hat jetzt weniger Module als beim letzten Bau)
        const keep = new Set(world.modules.map((m) => m.module));
        const docsDir = path.join(root, 'projects', project.id, 'docs');
        for (const [dir, re] of [[outDir, /^module_(\d+)\.js$/], [docsDir, /^BAUANLEITUNG_MODUL_(\d+)\.md$/]]) {
          if (!fs.existsSync(dir)) continue;
          for (const f of fs.readdirSync(dir)) {
            const mm = re.exec(f);
            if (mm && !keep.has(Number(mm[1]))) { fs.unlinkSync(path.join(dir, f)); log(`Veraltet entfernt: ${f}`); }
          }
        }
      }
      if (project.legacy) {
        // Umgebungsdaten des Doms (immer, auch bei --modules)
        const { emitSite } = require('./emit/site.js');
        const site = emitSite({ outDir });
        log(`Site: ${site.kept} von ${site.total} Gebäude -> ${site.file} (${site.bytes} Bytes)`);
      }
    }
  }
  timing.emit = ms(t);

  // Bericht
  const modReport = world.modules.map((m) => {
    const steps = stepsByModule[m.module];
    const sizes = steps.map((s) => s.count);
    const blocks = sizes.reduce((a, b) => a + b, 0);
    return { module: m.module, title: m.meta.title, steps: steps.length, blocks,
      min: sizes.length ? Math.min(...sizes) : 0, max: sizes.length ? Math.max(...sizes) : 0,
      avg: sizes.length ? Math.round(blocks / sizes.length) : 0 };
  });
  const ruleReport = rules.map((r) => ({ rule: r.rule, errors: r.errors.length, warnings: r.warnings.length,
    total: r.total === undefined ? null : r.total, ms: Math.round(r.ms),
    ...(r.info && r.info.length ? { info: r.info } : {}) }));

  // R13/R14: Kennzahlen, Komponenten und Lecks (BEGEHBARKEIT.md §3)
  const r13 = rules.find((r) => r.rule === 'R13'), r14 = rules.find((r) => r.rule === 'R14');
  const begehbarkeit = r13 && r13.bericht ? {
    modus: r13.bericht.modus, erreichbarProzent: r13.bericht.anteil, innenZellen: r13.bericht.innenZellen, erreichbar: r13.bericht.erreichbar,
    nichtErreichbareKomponenten: r13.bericht.nichtErreichbareKomponenten, offeneFlaechenUnerreichbar: r13.bericht.offeneFlaechenUnerreichbar,
    komponenten: r13.bericht.projekt ? r13.bericht.projekt.komponenten : undefined, haeuser: r13.bericht.haeuser,
    lecks: r14 && r14.bericht ? r14.bericht : null,
    deklariert: { oeffnungen: world.oeffnungen.length, unzugaenglich: world.unzugaenglich.length }
  } : null;

  log(`${world.modules.length} Module, ${world.grid.size} Blöcke`);
  for (const m of modReport) {
    log(`  Modul ${m.module} ${m.title}: ${m.steps} Schritte, ${m.blocks} Blöcke, Schrittgröße min/Ø/max ${m.min}/${m.avg}/${m.max}`);
  }
  log('Regeln:');
  log(`  R1: ${world.errors.filter((e) => e.rule === 'R1').length} Fehler, 0 Warnungen`);
  for (const r of rules) log(`  ${r.rule}: ${r.errors.length} Fehler, ${r.warnings.length} Warnungen`);
  for (const r of rules) if (r.info && r.info.length) { log(`Info ${r.rule} (${r.info.length}):`); for (const l of r.info.slice(0, 12)) log('  ' + l); if (r.info.length > 12) log(`  … und ${r.info.length - 12} weitere (siehe build/report_${project.id}.json)`); }
  log(`Zeiten: Welt ${fmtMs(timing.world)}, Planer ${fmtMs(timing.plan)}, Prüfung ${fmtMs(timing.validate)}, Emit ${fmtMs(timing.emit)}`);
  for (const e of emitted) log(`  emittiert: Modul ${e.module} -> ${e.file} (${e.bytes} Bytes)`);
  if (errors.length) { log('Fehler:'); for (const e of errors) log('  ' + e); }
  if (warnings.length) {
    log(`Warnungen (${warnings.length}):`);
    for (const w of warnings.slice(0, 30)) log('  ' + w);
    if (warnings.length > 30) log(`  … und ${warnings.length - 30} weitere (siehe build/report_${project.id}.json)`);
  }

  // Ressourcen: Spitzen-RSS des Prozesses, aktueller Heap, Dauer dieses Projekts
  const mem = process.memoryUsage();
  const peakRss = process.resourceUsage().maxRSS * 1024;
  const resources = { durationMs: Math.round(ms(tStart)), heapUsedMB: mb(mem.heapUsed), rssMB: mb(mem.rss), peakRssMB: mb(peakRss) };
  log(`Ressourcen: Dauer ${fmtMs(resources.durationMs)}, Heap ${resources.heapUsedMB} MB, RSS ${resources.rssMB} MB, Spitzen-RSS ${resources.peakRssMB} MB`);

  const failed = errors.length > 0 || (opts.strict && warnings.length > 0);
  const report = { generated: new Date().toISOString(), project: project.id, options: opts, moduleCount: world.modules.length,
    totalBlocks: world.grid.size, modules: modReport, rules: ruleReport, begehbarkeit, timingMs: timing, resources, emitted,
    errors, warnings, status: failed ? 'FEHLER' : 'OK' };
  if (opts._einzel) {
    // Statistik für das README des Gesamtprojekts (Grid wird danach verworfen)
    const { moduleStats } = require('./emit/docs.js');
    report.docStats = world.modules.map((m) => ({ module: m.module, meta: m.meta, stats: moduleStats(m, stepsByModule[m.module], world.grid) }));
    return { code: failed ? 1 : 0, report };
  }
  fs.mkdirSync(path.join(root, 'build'), { recursive: true });
  const json = JSON.stringify(report, null, 2);
  fs.writeFileSync(path.join(root, 'build', `report_${project.id}.json`), json);
  if (project.legacy) fs.writeFileSync(path.join(root, 'build', 'report.json'), json); // V2-Name bleibt erhalten
  log(failed ? 'Ergebnis: FEHLER' : 'Ergebnis: OK');
  return { code: failed ? 1 : 0, report };
}

/**
 * Projekt mit unabhängigen Modulen (Stadtgrund, S0): jedes Modul für sich (eigenes Grid, Prüfung, Emit), danach
 * Gesamtbericht, README aus den gesammelten Modulstatistiken, Aufräumen veralteter Dateien.
 * --modules n,m baut genau diese Module (nicht alle kleineren).
 */
function buildUnabhaengig(project, opts, env) {
  const root = env.root;
  const tStart = process.hrtime.bigint();
  const listing = listModules(project);
  const available = listing.numbers;
  const errors = [], warnings = [];
  if (listing.error) errors.push(`Projekt ${project.id}: ${listing.error.message}`);
  let toBuild = available;
  if (opts.modules) {
    for (const n of opts.modules) if (!available.includes(n)) console.warn(`Warnung: Modul ${n} existiert nicht im Projekt`);
    toBuild = opts.modules.filter((n) => available.includes(n));
  }
  const complete = toBuild.length === available.length;
  const modules = [], docStats = [], emitted = [];
  const ruleSum = new Map();
  let totalBlocks = 0;
  console.log(`${toBuild.length} von ${available.length} Modulen (unabhängig, je Modul ein Grid)`);
  for (const n of toBuild) {
    const t0 = process.hrtime.bigint();
    const r = buildProject(project, { ...opts, modules: [n], _einzel: true, _leise: true, _listing: listing }, env).report;
    const m = r.modules[0] || { module: n, title: `Modul ${n}`, steps: 0, blocks: 0 };
    modules.push(m);
    totalBlocks += r.totalBlocks;
    docStats.push(...r.docStats);
    emitted.push(...r.emitted);
    for (const e of r.errors) errors.push(`Modul ${n}: ${e}`);
    for (const w of r.warnings) warnings.push(`Modul ${n}: ${w}`);
    for (const rr of r.rules) {
      const a = ruleSum.get(rr.rule) || { rule: rr.rule, errors: 0, warnings: 0, ms: 0 };
      a.errors += rr.errors; a.warnings += rr.warnings; a.ms += rr.ms;
      ruleSum.set(rr.rule, a);
    }
    console.log(`  Modul ${n} ${m.title}: ${m.blocks} Blöcke, ${m.steps} Schritte, ${r.errors.length} Fehler, ${r.warnings.length} Warnungen (${fmtMs(ms(t0))})`);
  }
  // README (nur bei vollständigem Bau) und Aufräumen
  if (complete && available.length) {
    const { renderReadmeAusStats } = require('./emit/docs.js');
    const stats = new Map(docStats.map((d) => [d.module, d.stats]));
    const { rel, text } = renderReadmeAusStats({ project, mods: docStats, stats, root });
    const file = path.join(root, ...rel.split('/'));
    let have = null;
    try { have = fs.readFileSync(file, 'utf8'); } catch (e) { have = null; }
    if (opts.emit && !errors.length) {
      if (have !== text) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); }
    } else if (have !== text) {
      errors.push(`R9 ${rel}: ${have === null ? 'Datei fehlt' : 'weicht ab'}`);
    }
    if (opts.emit && !errors.length) {
      const keep = new Set(available);
      for (const [dir, re] of [[project.webDataDir, /^module_(\d+)\.js$/], [project.docsDir, /^BAUANLEITUNG_MODUL_(\d+)\.md$/]]) {
        if (!dir || !fs.existsSync(dir)) continue;
        for (const f of fs.readdirSync(dir)) {
          const mm = re.exec(f);
          if (mm && !keep.has(Number(mm[1]))) { fs.unlinkSync(path.join(dir, f)); console.log(`Veraltet entfernt: ${f}`); }
        }
      }
    }
  }
  const rules = [...ruleSum.values()].sort((a, b) => parseInt(a.rule.slice(1), 10) - parseInt(b.rule.slice(1), 10));
  console.log(`${modules.length} Module, ${totalBlocks} Blöcke`);
  console.log('Regeln:');
  for (const r of rules) console.log(`  ${r.rule}: ${r.errors} Fehler, ${r.warnings} Warnungen`);
  if (errors.length) { console.log('Fehler:'); for (const e of errors.slice(0, 40)) console.log('  ' + e); if (errors.length > 40) console.log(`  … und ${errors.length - 40} weitere`); }
  if (warnings.length) {
    console.log(`Warnungen (${warnings.length}):`);
    for (const w of warnings.slice(0, 30)) console.log('  ' + w);
    if (warnings.length > 30) console.log(`  … und ${warnings.length - 30} weitere (siehe build/report_${project.id}.json)`);
  }
  const mem = process.memoryUsage();
  const resources = { durationMs: Math.round(ms(tStart)), heapUsedMB: mb(mem.heapUsed), rssMB: mb(mem.rss),
    peakRssMB: mb(process.resourceUsage().maxRSS * 1024) };
  console.log(`Ressourcen: Dauer ${fmtMs(resources.durationMs)}, Heap ${resources.heapUsedMB} MB, RSS ${resources.rssMB} MB, Spitzen-RSS ${resources.peakRssMB} MB`);
  const failed = errors.length > 0 || (opts.strict && warnings.length > 0);
  const report = { generated: new Date().toISOString(), project: project.id, options: opts, unabhaengig: true,
    moduleCount: modules.length, totalBlocks, modules, rules, resources, emitted, errors, warnings, status: failed ? 'FEHLER' : 'OK' };
  // Teilbau (--modules) überschreibt den Gesamtbericht nicht
  if (complete) {
    fs.mkdirSync(path.join(root, 'build'), { recursive: true });
    fs.writeFileSync(path.join(root, 'build', `report_${project.id}.json`), JSON.stringify(report, null, 2));
  }
  console.log(failed ? 'Ergebnis: FEHLER' : 'Ergebnis: OK');
  return { code: failed ? 1 : 0, report };
}

function runCross(ids, env) {
  const { checkCrossProject } = require('./validate/x_projects.js');
  console.log(`Projektübergreifende Prüfung (${ids ? ids.join(', ') : 'alle Projekte'}):`);
  const r = checkCrossProject(ids, { root: env.root, projectsRoot: env.projectsRoot, entries: env.entries, log: (l) => console.log(l) });
  console.log(`  ${r.projects.length} Projekte, ${r.pairs.length} Paare, ${r.columnOverlaps} Säulen mit y-Überschneidung, ${r.conflicts} Konflikte`);
  for (const p of r.pairs) console.log(`  ${p.a} / ${p.b}: ${p.columns} Säulen, ${p.conflicts} Zellkonflikte`);
  for (const e of r.errors) console.log('  Fehler: ' + e);
  for (const w of r.warnings) console.log('  Warnung: ' + w);
  console.log(`Zeit: ${fmtMs(r.ms)}`);
  const failed = r.errors.length > 0;
  console.log(failed ? 'Ergebnis: FEHLER' : 'Ergebnis: OK');
  return failed ? 1 : 0;
}

/**
 * main(argv, env?) -> Exit-Code. env: { root, projectsRoot, entries } (Tests); Vorgabe ist das Repository.
 */
function main(argv, env = {}) {
  const opts = parseArgs(argv);
  const root = env.root || REPO_ROOT;
  const e = { root, projectsRoot: env.projectsRoot || path.join(root, 'projects'), entries: env.entries };
  const reg = loadRegistry(e);

  const runBuilds = opts.all || (!opts.cross && opts.project !== null) || (!opts.cross && !opts.all);
  let code = 0;
  if (runBuilds) {
    let targets;
    if (opts.all) targets = reg.projects;
    else {
      const id = opts.project || 'duomo';
      const p = reg.projects.find((q) => q.id === id);
      if (!p) throw new Error(`Unbekanntes Projekt "${id}" (bekannt: ${reg.projects.map((q) => q.id).join(', ')})`);
      targets = [p];
    }
    if (opts.all) for (const pr of reg.problems) { console.log(`Fehler: Projekt-Registry: ${pr}`); code = 1; }
    const explicit = opts.all || opts.project !== null;
    const results = [];
    for (const p of targets) {
      if (explicit) console.log(`=== Projekt ${p.id}: ${p.title} (${p.type}) ===`);
      const r = buildProject(p, opts, e);
      results.push([p.id, r.code]);
      if (r.code) code = 1;
    }
    if (opts.all) {
      console.log('Alle Projekte:');
      for (const [id, c] of results) console.log(`  ${id}: ${c ? 'FEHLER' : 'OK'}`);
      console.log(code ? 'Ergebnis (alle): FEHLER' : 'Ergebnis (alle): OK');
    }
  }
  if (opts.cross) {
    const ids = opts.project ? opts.project.split(',').filter(Boolean) : null;
    if (runCross(ids, e)) code = 1;
  }
  return code;
}

// Minecraft-Export nach erfolgreichem Bau (nur Kommandozeile, nur mit minecraft.local.json; Fehler lassen den Bau grün)
function minecraftHook(argv, code) {
  if (code !== 0 || argv.includes('--ohne-minecraft')) return;
  if (argv.includes('--cross') && !argv.includes('--all') && !argv.includes('--project')) return;
  if (!fs.existsSync(path.join(REPO_ROOT, 'minecraft.local.json'))) return;
  const ex = require('./minecraft/export.js');
  try {
    ex.exportWorld({ root: REPO_ROOT });
  } catch (e) {
    console.warn('Warnung (Minecraft-Export ' + (e instanceof ex.WeltOffenFehler ? 'übersprungen' : 'fehlgeschlagen') + '): ' + e.message);
  }
}

if (require.main === module) {
  try {
    const argv = process.argv.slice(2);
    process.exitCode = main(argv);
    minecraftHook(argv, process.exitCode);
  } catch (e) {
    console.error('Build-Abbruch: ' + e.message);
    process.exitCode = 1;
  }
}

module.exports = { main, parseArgs, buildProject };
