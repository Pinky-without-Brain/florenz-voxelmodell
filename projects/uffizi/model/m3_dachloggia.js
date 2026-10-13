'use strict';
// Uffizien Modul 3: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emitModul } = require('./_emit.js');

module.exports = {
  module: 3,
  build(ctx) {
    emitModul(ctx, 3);
  }
};
