'use strict';
// R7: Typen in palette.js und in webapp/js/data/block-types.js.
const fs = require('node:fs');
const vm = require('node:vm');
const { capped, result } = require('./util.js');

function loadBlockTypes(file) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file, timeout: 5000 });
  return sandbox.window.BLOCK_TYPES || {};
}

module.exports = function r7(ctx) {
  const errors = [], warnings = [];
  let bt;
  try {
    bt = loadBlockTypes(ctx.blockTypesFile);
  } catch (e) {
    return result('R7', [`R7 block-types.js nicht lesbar: ${e.message}`], [], { total: 1 });
  }
  const has = (t) => Object.prototype.hasOwnProperty.call(bt, t);
  const pal = new Set(ctx.palette.TYPES);
  for (const [type, n] of ctx.grid.countsBy('type')) {
    if (!pal.has(type)) errors.push(`R7 Typ ${type} (${n} Blöcke) fehlt in palette.js`);
    if (!has(type)) errors.push(`R7 Typ ${type} (${n} Blöcke) fehlt in block-types.js`);
  }
  for (const t of pal) {
    if (!has(t)) warnings.push(`R7 Palettentyp ${t} fehlt in block-types.js`);
  }
  return result('R7', capped(errors), capped(warnings), { total: errors.length, warningCount: warnings.length });
};
module.exports.loadBlockTypes = loadBlockTypes;
