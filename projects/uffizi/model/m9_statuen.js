'use strict';
// Uffizien Modul 9: Bauteile aus dem Belegungsplan (_plan.js, Regeln in _p_*.js).
const { emit } = require('./_emit.js');

module.exports = {
  module: 9,
  build(ctx) {
    emit(ctx, ['statuen']);
  }
};
