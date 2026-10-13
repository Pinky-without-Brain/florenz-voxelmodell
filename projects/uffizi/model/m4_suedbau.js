'use strict';
// Uffizien Modul 4: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emitModul } = require('./_emit.js');

module.exports = {
  module: 4,
  build(ctx) {
    emitModul(ctx, 4);
  }
};
