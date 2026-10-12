'use strict';
// Führt alle Prüfregeln aus. R1 (Konflikte) liegt im Weltaufbau, R9 (Docs) nur mit opts.docs.
const path = require('node:path');

const RULES = [
  ['R2', require('./r2_stepsize.js')],
  ['R3', require('./r3_buildable.js')],
  ['R4', require('./r4_connected.js')],
  ['R5', require('./r5_interfaces.js')],
  ['R6', require('./r6_bounds.js')],
  ['R7', require('./r7_palette.js')],
  ['R8', require('./r8_symmetry.js')],
  ['R9', require('./r9_docs.js')],
  ['R10', require('./r10_wordcheck.js')]
];

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * validate({ grid, world, stepsByModule, interfaces?, root?, blockTypesFile?, only? })
 * -> [{ rule, errors, warnings, ms, ... }]
 */
function validate(opts) {
  const { grid, world } = opts;
  const stepsByModule = opts.stepsByModule || {};
  const mods = Object.keys(stepsByModule).map(Number).sort((a, b) => a - b);
  const steps = [];
  for (const m of mods) for (const s of stepsByModule[m]) steps.push(s);
  const root = opts.root || ROOT;
  const keyCache = new Map();
  const ctx = {
    grid, world, steps, root, stepsByModule, docs: opts.docs || null,
    dims: require('../spec/dimensions.js'),
    palette: require('../spec/palette.js'),
    interfaces: opts.interfaces || require('../spec/interfaces.js'),
    blockTypesFile: opts.blockTypesFile || path.join(root, 'webapp', 'js', 'data', 'block-types.js'),
    includedModules: new Set(world.modules.map((m) => m.module)),
    keysByModule(m) {
      if (!keyCache.has(m)) keyCache.set(m, grid.keysOf((k, mod) => mod === m));
      return keyCache.get(m);
    }
  };
  const out = [];
  for (const [name, fn] of RULES) {
    if (opts.only && !opts.only.includes(name)) continue;
    const t0 = process.hrtime.bigint();
    const r = fn(ctx);
    r.ms = Number(process.hrtime.bigint() - t0) / 1e6;
    out.push(r);
  }
  return out;
}

module.exports = { validate, RULES };
