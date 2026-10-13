'use strict';
// Uffizien Modul 1: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emitModul } = require('./_emit.js');

module.exports = {
  module: 1,
  build(ctx) {
    emitModul(ctx, 1);
  }
};
