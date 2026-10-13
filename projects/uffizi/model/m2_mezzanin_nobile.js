'use strict';
// Uffizien Modul 2: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emitModul } = require('./_emit.js');

module.exports = {
  module: 2,
  build(ctx) {
    emitModul(ctx, 2);
  }
};
