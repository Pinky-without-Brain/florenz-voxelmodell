'use strict';
// R2: Schrittgröße. > 2500 Fehler, < 300 Warnung.
const { capped, result } = require('./util.js');
const { MAX_STEP, MIN_STEP } = require('../steps/planner.js');

module.exports = function r2(ctx) {
  const errors = [], warnings = [];
  for (const s of ctx.steps) {
    const id = `Modul ${s.module}, Schritt ${s.stepNumber}`;
    if (s.count > MAX_STEP) errors.push(`R2 ${id}: ${s.count} Blöcke (max ${MAX_STEP})`);
    else if (s.count < MIN_STEP) warnings.push(`R2 ${id}: nur ${s.count} Blöcke (empfohlen ≥ ${MIN_STEP})`);
  }
  const nErr = errors.length, nWarn = warnings.length;
  return result('R2', capped(errors), capped(warnings), { total: nErr + nWarn, errorCount: nErr, warningCount: nWarn });
};
