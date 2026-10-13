'use strict';
// Uffizien Modul 5: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emitModul } = require('./_emit.js');

module.exports = {
  module: 5,
  build(ctx) {
    emitModul(ctx, 5);
  }
};
