'use strict';
// Gesamtablauf (ARCHITEKTUR §8): buildWorld -> planModule -> validate -> (optional) emit -> Bericht.
// Aufruf: node tools/build.js [--modules 0,1,3] [--no-emit] [--strict]

const fs = require('node:fs');
const path = require('node:path');
const { buildWorld, discoverModuleFiles, DEFAULT_MODEL_DIR, DEFAULT_CONTENT_DIR } = require('./model/world.js');
const { planModule } = require('./steps/planner.js');
const { validate } = require('./validate/index.js');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const o = { modules: null, emit: true, strict: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--no-emit') o.emit = false;
    else if (a === '--strict') o.strict = true;
    else if (a === '--modules') {
      o.modules = (argv[++i] || '').split(',').filter(Boolean).map(Number);
      if (!o.modules.length || o.modules.some((n) => !Number.isInteger(n) || n < 0 || n > 9)) {
        throw new Error('--modules erwartet eine Liste wie 0,1,3 (Ziffern 0..9)');
      }
    } else throw new Error(`Unbekanntes Argument: ${a}`);
  }
  return o;
}

const ms = (t0) => Number(process.hrtime.bigint() - t0) / 1e6;
const fmtMs = (v) => (v >= 1000 ? (v / 1000).toFixed(2) + ' s' : v.toFixed(0) + ' ms');

function main(argv) {
  const opts = parseArgs(argv);
  const modelDir = DEFAULT_MODEL_DIR;
  const available = [...discoverModuleFiles(modelDir).keys()].sort((a, b) => a - b);
  let toBuild = available;
  let toEmit = available;
  if (opts.modules) {
    const max = Math.max(...opts.modules);
    toBuild = available.filter((n) => n <= max);
    toEmit = opts.modules.filter((n) => available.includes(n));
    for (const n of opts.modules) if (!available.includes(n)) console.warn(`Warnung: Modul ${n} hat keine Datei m${n}_*.js`);
  }

  const errors = [], warnings = [];
  const timing = {};
  let t = process.hrtime.bigint();

  // 1) Welt
  const world = buildWorld({ modules: toBuild, modelDir, contentDir: DEFAULT_CONTENT_DIR });
  timing.world = ms(t);
  for (const e of world.errors) errors.push(e.message);
  warnings.push(...world.warnings);

  // 2) Planer
  t = process.hrtime.bigint();
  const stepsByModule = {};
  for (const m of world.modules) {
    const steps = planModule(m, m.content, world.grid);
    stepsByModule[m.module] = steps;
    warnings.push(...steps.warnings);
  }
  timing.plan = ms(t);

  // 3) Prüfung
  t = process.hrtime.bigint();
  const rules = validate({ grid: world.grid, world, stepsByModule, root: ROOT });
  timing.validate = ms(t);
  for (const r of rules) {
    errors.push(...r.errors);
    warnings.push(...r.warnings);
  }

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
      const outDir = path.join(ROOT, 'webapp', 'js', 'data', 'v2');
      for (const m of world.modules) {
        if (!toEmit.includes(m.module)) continue;
        const r = emitModuleData({ moduleMeta: { module: m.module, ...m.meta }, steps: stepsByModule[m.module],
          grid: world.grid, outDir });
        emitted.push({ module: m.module, ...r });
      }
      // Umgebungsdaten (immer, auch bei --modules)
      const { emitSite } = require('./emit/site.js');
      const site = emitSite({ outDir });
      console.log(`Site: ${site.kept} von ${site.total} Gebäude -> ${site.file} (${site.bytes} Bytes)`);
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
    total: r.total === undefined ? null : r.total, ms: Math.round(r.ms) }));

  console.log(`${world.modules.length} Module, ${world.grid.size} Blöcke`);
  for (const m of modReport) {
    console.log(`  Modul ${m.module} ${m.title}: ${m.steps} Schritte, ${m.blocks} Blöcke, Schrittgröße min/Ø/max ${m.min}/${m.avg}/${m.max}`);
  }
  console.log('Regeln:');
  console.log(`  R1: ${world.errors.filter((e) => e.rule === 'R1').length} Fehler, 0 Warnungen`);
  for (const r of rules) console.log(`  ${r.rule}: ${r.errors.length} Fehler, ${r.warnings.length} Warnungen`);
  console.log(`Zeiten: Welt ${fmtMs(timing.world)}, Planer ${fmtMs(timing.plan)}, Prüfung ${fmtMs(timing.validate)}, Emit ${fmtMs(timing.emit)}`);
  for (const e of emitted) console.log(`  emittiert: Modul ${e.module} -> ${e.file} (${e.bytes} Bytes)`);
  if (errors.length) { console.log('Fehler:'); for (const e of errors) console.log('  ' + e); }
  if (warnings.length) {
    console.log(`Warnungen (${warnings.length}):`);
    for (const w of warnings.slice(0, 30)) console.log('  ' + w);
    if (warnings.length > 30) console.log(`  … und ${warnings.length - 30} weitere (siehe build/report.json)`);
  }

  const failed = errors.length > 0 || (opts.strict && warnings.length > 0);
  const report = { generated: new Date().toISOString(), options: opts, moduleCount: world.modules.length,
    totalBlocks: world.grid.size, modules: modReport, rules: ruleReport, timingMs: timing, emitted,
    errors, warnings, status: failed ? 'FEHLER' : 'OK' };
  fs.mkdirSync(path.join(ROOT, 'build'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'build', 'report.json'), JSON.stringify(report, null, 2));
  console.log(failed ? 'Ergebnis: FEHLER' : 'Ergebnis: OK');
  return failed ? 1 : 0;
}

if (require.main === module) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    console.error('Build-Abbruch: ' + e.message);
    process.exitCode = 1;
  }
}

module.exports = { main, parseArgs };
